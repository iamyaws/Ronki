// Run: npm i --no-save @electric-sql/pglite && node supabase/tests/profiles_cas.pglite.mjs
// Runs the real repo migrations in an in-process Postgres (PGlite) and checks
// the compare-and-swap contract end to end. Nothing here touches production.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const repo = new URL('../migrations/', import.meta.url);
const before = readFileSync(new URL('20260915000200_profiles_rpc.sql', repo), 'utf8');
const cas = readFileSync(new URL('20260926000100_profiles_cas.sql', repo), 'utf8');

const db = new PGlite();
let fails = 0;
const ok = (cond, label, extra) => {
  if (cond) console.log('PASS', label);
  else { fails++; console.log('FAIL', label, extra !== undefined ? JSON.stringify(extra) : ''); }
};
const one = async (sql, params = []) => (await db.query(sql, params)).rows[0];
const rpc = async (fn, args) => {
  const names = Object.keys(args);
  const sql = `select public.${fn}(${names.map((n, i) => `${n} => $${i + 1}`).join(', ')}) as r`;
  return (await one(sql, names.map(n => args[n]))).r;
};

await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin;`);
await db.exec(before);

// Existing rows written by the old function, before the migration.
const OLD = 'a'.repeat(32);
await rpc('profile_upsert', { p_token: OLD, p_state: JSON.stringify({ companionName: 'Knisti', totalTasksDone: 5 }) });
ok((await one(`select count(*)::int as n from public.profiles`)).n === 1, 'seed row exists before migration');

await db.exec(cas);
await db.exec(cas); // idempotent
ok(true, 'migration runs twice without error');

const col = await one(`select data_type, is_nullable, column_default from information_schema.columns where table_name='profiles' and column_name='rev'`);
ok(col && col.data_type === 'bigint' && col.is_nullable === 'NO' && col.column_default === '0', 'rev bigint not null default 0', col);
ok((await one(`select rev from public.profiles where token=$1`, [OLD])).rev == 0, 'existing row gets rev 0');

// profile_get on the old row
let g = await rpc('profile_get', { p_token: OLD });
ok(g.rev === 0 && g.state.companionName === 'Knisti' && g.updated_at, 'profile_get returns state, updated_at, rev 0', g);
ok((await rpc('profile_get', { p_token: 'b'.repeat(32) })) === null, 'profile_get on a missing token returns null');

// CAS on the old row with rev 0
let w = await rpc('profile_upsert_if', { p_token: OLD, p_state: JSON.stringify({ companionName: 'Knisti', totalTasksDone: 6 }), p_expected_rev: 0 });
ok(w.ok === true && w.rev === 1, 'CAS with rev 0 on an old row succeeds, rev 1', w);

// Fresh card
const T = 'c'.repeat(32);
w = await rpc('profile_upsert_if', { p_token: T, p_state: JSON.stringify({ a: 1 }), p_expected_rev: null });
ok(w.ok === true && w.rev === 1 && w.updated_at, 'null expected on a new token inserts rev 1', w);
w = await rpc('profile_upsert_if', { p_token: T, p_state: JSON.stringify({ a: 'SHOULD NOT LAND' }), p_expected_rev: null });
ok(w.ok === false && w.rev === 1 && w.state.a === 1, 'null expected on an existing row writes nothing, returns the row', w);
w = await rpc('profile_upsert_if', { p_token: T, p_state: JSON.stringify({ a: 2 }), p_expected_rev: 1 });
ok(w.ok === true && w.rev === 2, 'expected 1 writes, rev 2', w);
w = await rpc('profile_upsert_if', { p_token: T, p_state: JSON.stringify({ a: 'STALE' }), p_expected_rev: 1 });
ok(w.ok === false && w.rev === 2 && w.state.a === 2, 'stale expected 1 refused, current row returned', w);
g = await rpc('profile_get', { p_token: T });
ok(g.rev === 2 && g.state.a === 2, 'profile_get after CAS shows rev 2 and the right state', g);

// Legacy writer (website, older bundles) bumps rev, so a CAS writer notices
w = await rpc('profile_upsert', { p_token: T, p_state: JSON.stringify({ a: 3 }) });
ok(w.rev === 3 && w.updated_at, 'profile_upsert bumps rev and returns it', w);
w = await rpc('profile_upsert_if', { p_token: T, p_state: JSON.stringify({ a: 'STALE2' }), p_expected_rev: 2 });
ok(w.ok === false && w.rev === 3 && w.state.a === 3, 'CAS after a legacy write is refused', w);
w = await rpc('profile_upsert', { p_token: 'd'.repeat(32), p_state: JSON.stringify({ x: 1 }) });
ok(w.rev === 1, 'profile_upsert insert gives rev 1', w);

// Row gone (deleted by the parent's reset) while a device still holds rev 3
await rpc('profile_delete', { p_token: T }).catch(e => console.log('note: profile_delete', e.message));
w = await rpc('profile_upsert_if', { p_token: T, p_state: JSON.stringify({ a: 9 }), p_expected_rev: 3 });
ok(w.ok === false && w.rev === null && w.state === null, 'expected rev on a deleted row: refused with nulls', w);

// Null state is stored as {}
const N = 'e'.repeat(32);
w = await rpc('profile_upsert_if', { p_token: N, p_state: null, p_expected_rev: null });
ok(w.ok === true && JSON.stringify((await rpc('profile_get', { p_token: N })).state) === '{}', 'null state stored as {}');

// Token validation
for (const bad of ['short', 'A'.repeat(32), 'g'.repeat(32), null]) {
  let threw = false;
  try { await rpc('profile_upsert_if', { p_token: bad, p_state: '{}', p_expected_rev: null }); } catch { threw = true; }
  ok(threw, `invalid token rejected: ${String(bad).slice(0, 8)}`);
}

// Activity stamped on success, not on refusal
const A = 'f'.repeat(32);
await rpc('profile_upsert_if', { p_token: A, p_state: '{}', p_expected_rev: 5 });
ok((await one(`select count(*)::int as n from public.profile_activity where token=$1`, [A])).n === 0, 'refused write (no row) stamps no activity');
ok((await one(`select count(*)::int as n from public.profiles where token=$1`, [A])).n === 0, 'refused write (no row) creates no row');
await rpc('profile_upsert_if', { p_token: A, p_state: '{}', p_expected_rev: null });
ok((await one(`select count(*)::int as n from public.profile_activity where token=$1`, [A])).n === 1, 'successful write stamps activity');

// Privileges: anon can execute all three; public cannot
const priv = async (fn, role) => (await one(`select has_function_privilege($1, $2, 'execute') as p`, [role, fn])).p;
for (const fn of ['public.profile_get(text)', 'public.profile_upsert(text, jsonb)', 'public.profile_upsert_if(text, jsonb, bigint)']) {
  ok(await priv(fn, 'anon'), `anon may execute ${fn}`);
  ok(await priv(fn, 'authenticated'), `authenticated may execute ${fn}`);
}
const pub = await one(`select count(*)::int as n from information_schema.routine_privileges where routine_name='profile_upsert_if' and grantee='PUBLIC'`);
ok(pub.n === 0, 'PUBLIC has no execute on profile_upsert_if', pub);
const secdef = await one(`select prosecdef, proconfig from pg_proc where proname='profile_upsert_if'`);
ok(secdef.prosecdef === true && String(secdef.proconfig).includes('search_path=public'), 'profile_upsert_if is security definer with a fixed search_path', secdef);

// anon still has no direct table access
const tbl = await one(`select has_table_privilege('anon', 'public.profiles', 'select') as s, has_table_privilege('anon', 'public.profiles', 'update') as u`);
ok(!tbl.s && !tbl.u, 'anon has no direct select/update on profiles', tbl);

// Run as anon through the function (security definer does the write)
await db.exec(`set role anon`);
w = await rpc('profile_upsert_if', { p_token: '1'.repeat(32), p_state: '{"k":1}', p_expected_rev: null });
ok(w.ok === true, 'anon can write through profile_upsert_if', w);
let direct = 'allowed';
try { await db.query(`update public.profiles set rev = 99`); } catch { direct = 'denied'; }
ok(direct === 'denied', 'anon cannot update profiles directly (so rev cannot be forged)');
await db.exec(`reset role`);

console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
