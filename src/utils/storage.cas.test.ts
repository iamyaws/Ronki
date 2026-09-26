// Compare-and-swap sync, two devices against one fake card server (review
// round 1, 26 Sep 2026). The fake follows the same contract as the SQL in
// supabase/migrations/20260926000100_profiles_cas.sql and the mock server
// (checked identical against real Postgres). Harness adapted from the
// adversarial verifier's experiments. Each device is a fresh copy of the
// storage module; they share the browser's localStorage, so every test
// loads its devices first and only then plays.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type Row = { state: any; rev: number };
const server = { rows: new Map<string, Row>() };
const clone = (x: any) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
function handle(fn: string, a: any) {
  const row = server.rows.get(a.p_token) || null;
  if (fn === 'profile_get') return { data: row ? { state: clone(row.state), rev: row.rev, updated_at: 'x' } : null, error: null };
  if (fn === 'profile_upsert') {
    const rev = row ? row.rev + 1 : 1;
    server.rows.set(a.p_token, { state: clone(a.p_state), rev });
    return { data: { rev, updated_at: 'x' }, error: null };
  }
  if (fn === 'profile_upsert_if') {
    const expected = a.p_expected_rev ?? null;
    const ok = expected === null ? row === null : row !== null && row.rev === Number(expected);
    if (ok) {
      const rev = row ? row.rev + 1 : 1;
      server.rows.set(a.p_token, { state: clone(a.p_state), rev });
      return { data: { ok: true, rev, updated_at: 'x' }, error: null };
    }
    if (!row) return { data: { ok: false, rev: null, state: null }, error: null };
    return { data: { ok: false, rev: row.rev, state: clone(row.state) }, error: null };
  }
  return { data: null, error: { message: 'unknown ' + fn } };
}
let hook: null | ((fn: string, a: any, run: () => any) => Promise<any>) = null;
const calls: string[] = [];
(globalThis as any).__casRpc = async (fn: string, a: any) => {
  calls.push(fn);
  const run = () => handle(fn, clone(a));
  return hook ? hook(fn, a, run) : run();
};
vi.mock('../lib/supabase', () => ({ supabase: { rpc: (fn: string, a: any) => (globalThis as any).__casRpc(fn, a) } }));

/** A fresh copy of the storage module = one device. */
async function device() {
  vi.resetModules();
  return (await import('./storage')).default as any;
}
/** Load the card on a device as the app does (a fresh device: no local copy). */
async function load(dev: any, token: string) {
  localStorage.removeItem('hdx2_drachennest');
  localStorage.removeItem(`ronki_sync_${token}`);
  return dev.syncLoadByToken(token);
}

const D = '2026-09-28';
const q = (id: string, done = false, xp = 10, extra: object = {}) => ({ id, anchor: 'morning', xp, done, completions: done ? 1 : 0, ...extra });
const S0 = (): any => ({
  lastDate: D, onboardingDone: true, parentOnboardingDone: true, companionName: 'Knisti',
  hp: 10, xp: 10, totalTasksDone: 5,
  totalQuestCompletions: { s_wake: 3, s_breakfast: 2 },
  quests: [q('s_wake'), q('s_breakfast', false, 5), q('sq_geschirr', false, 10, { target: 2, sideQuest: true })],
  treasuresFound: ['t01'], adventureCount: 1, tripCursor: 1, catEvo: 2,
  expedition: { state: 'home', biome: 'morgenwald' },
  expeditionLog: [{ id: 'm1', ts: '2026-09-26T07:00:00.000Z' }],
});
/** What complete(id) does to the fields the merge cares about. */
function tick(s: any, id: string) {
  const quest = s.quests.find((x: any) => x.id === id);
  const completions = (quest.completions || 0) + 1;
  const done = completions >= (quest.target || 1);
  return {
    ...s,
    quests: s.quests.map((x: any) => (x.id === id ? { ...x, completions, done } : x)),
    hp: s.hp + quest.xp, xp: s.xp + quest.xp, totalTasksDone: s.totalTasksDone + 1,
    totalQuestCompletions: { ...s.totalQuestCompletions, [id]: (s.totalQuestCompletions[id] || 0) + 1 },
  };
}
const pet = (s: any) => ({ ...s, catPetted: true, hp: s.hp + 1 });
const feed = (s: any) => ({ ...s, catFed: true, hp: s.hp + 1 });
const reward = (s: any, n: number) => ({ ...s, hp: s.hp + n });
const card = (t: string) => server.rows.get(t)!.state;
const done = (s: any) => s.quests.filter((x: any) => x.done).map((x: any) => x.id).sort();

beforeEach(() => {
  server.rows.clear();
  hook = null;
  calls.length = 0;
  localStorage.clear();
  // No IndexedDB in jsdom: storage falls back to its localStorage mirror.
  vi.stubGlobal('indexedDB', { open: () => { throw new Error('no indexedDB in tests'); } });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('compare-and-swap: a page never has to take on a merge to stay safe', () => {
  it('a merged write the page ignores (the hide flush) is not overwritten by its next write (verifier F2, Astra CAS-01)', async () => {
    const T = 'a'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    const B = await device();
    await load(B, T);
    const SB1 = { ...tick(S0(), 's_breakfast'), treasuresFound: ['t01', 't02'], adventureCount: 2, tripCursor: 2 };
    expect((await B.cloudSaveByToken(T, SB1)).status).toBe('saved');
    const SA1 = tick(S0(), 's_wake');
    const flush = await A.cloudSaveByToken(T, SA1); // result ignored, as the hide flush does
    expect(flush.status).toBe('merged');
    await A.cloudSaveByToken(T, pet(SA1)); // the page still holds SA1 and goes on
    expect(card(T).treasuresFound).toEqual(['t01', 't02']);
    expect(done(card(T))).toEqual(['s_breakfast', 's_wake']);
    expect(card(T).hp).toBe(26);
    await B.cloudSaveByToken(T, feed(SB1));
    const fin = card(T);
    expect(fin.hp).toBe(10 + 5 + 10 + 1 + 1);
    expect(fin.xp).toBe(25);
    expect(fin.totalTasksDone).toBe(7);
    expect(fin.totalQuestCompletions).toEqual({ s_wake: 4, s_breakfast: 3 });
    expect(fin.adventureCount).toBe(2);
  });

  it('two writes from one page in flight at once go one after the other and count once (verifier F3)', async () => {
    const T = 'b'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    let release!: () => void;
    const gate = new Promise<void>(r => { release = r; });
    let first = true;
    hook = async (fn, _a, run) => {
      if (fn === 'profile_upsert_if' && first) { first = false; await gate; }
      return run();
    };
    const W1 = reward(S0(), 10);
    const W2 = tick(pet(W1), 'sq_geschirr');
    const p1 = A.cloudSaveByToken(T, W1);
    const p2 = A.cloudSaveByToken(T, W2);
    release();
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.status).toBe('saved');
    expect(r2.status).toBe('saved');
    expect(card(T).hp).toBe(31);
    expect(card(T).totalTasksDone).toBe(6);
  });

  it('a write that landed without its answer is not counted twice (verifier F4)', async () => {
    const T = 'c'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    hook = async (fn, _a, run) => {
      if (fn === 'profile_upsert_if') { hook = null; run(); throw new Error('network gone after the write'); }
      return run();
    };
    const W1 = reward(S0(), 10);
    expect((await A.cloudSaveByToken(T, W1)).status).toBe('offline');
    expect(card(T).hp).toBe(20); // it landed
    await A.cloudSaveByToken(T, pet(W1));
    expect(card(T).hp).toBe(21);
  });

  it('a lost answer is still recognised after another device wrote on top of it', async () => {
    const T = 'd'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    const B = await device();
    await load(B, T);
    hook = async (fn, _a, run) => {
      if (fn === 'profile_upsert_if') { hook = null; run(); throw new Error('network gone after the write'); }
      return run();
    };
    const W1 = reward(S0(), 10);
    await A.cloudSaveByToken(T, W1);
    await B.cloudSaveByToken(T, tick(S0(), 's_breakfast'));
    await A.cloudSaveByToken(T, pet(W1));
    expect(card(T).hp).toBe(10 + 10 + 5 + 1);
    expect(done(card(T))).toEqual(['s_breakfast']);
  });
});

describe('compare-and-swap: cold start (Astra CAS-05)', () => {
  it("applies this device's unsent changes onto a card another device changed meanwhile", async () => {
    const T = 'e'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    hook = async fn => { if (fn === 'profile_upsert_if') throw new Error('offline'); return { data: null, error: null }; };
    const SA1 = tick(S0(), 's_wake');
    await A.save(SA1);
    expect((await A.cloudSaveByToken(T, SA1)).status).toBe('offline');
    hook = null;
    // Meanwhile the parent phone ticks breakfast and opens a treasure.
    server.rows.set(T, { state: { ...tick(S0(), 's_breakfast'), treasuresFound: ['t01', 't02'], adventureCount: 2 }, rev: 2 });
    const A2 = await device(); // the tablet starts again
    const got = await A2.syncLoadByToken(T);
    for (const s of [got, card(T)]) {
      expect(done(s)).toEqual(['s_breakfast', 's_wake']);
      expect(s.treasuresFound).toEqual(['t01', 't02']);
      expect(s.hp).toBe(25);
      expect(s.totalTasksDone).toBe(7);
    }
  });

  it('a local copy that is behind what this device last synced does not undo progress', async () => {
    const T = 'f'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T); // local copy = S0
    await A.cloudSaveByToken(T, tick(S0(), 's_wake')); // landed; the local save of it never finished
    const A2 = await device();
    const got = await A2.syncLoadByToken(T);
    expect(done(got)).toEqual(['s_wake']);
    expect(got.hp).toBe(20);
    expect(card(T).hp).toBe(20);
  });
});

describe('compare-and-swap: the old write only when the function is really missing (Astra CAS-06)', () => {
  it('a permission error never turns into an unconditional write', async () => {
    const T = '1'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    hook = async (fn, _a, run) => (fn === 'profile_upsert_if'
      ? { data: null, error: { code: '42501', message: 'permission denied for function profile_upsert_if' } }
      : run());
    expect((await A.cloudSaveByToken(T, tick(S0(), 's_wake'))).status).toBe('offline');
    expect(calls).not.toContain('profile_upsert');
  });

  it('a missing function uses the old write, and compare-and-swap is tried again after ten minutes', async () => {
    const T = '2'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    let now = Date.parse('2026-09-28T07:00:00Z');
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    let missing = true;
    hook = async (fn, _a, run) => (fn === 'profile_upsert_if' && missing
      ? { data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }
      : run());
    const s1 = tick(S0(), 's_wake');
    expect((await A.cloudSaveByToken(T, s1)).status).toBe('saved');
    calls.length = 0;
    await A.cloudSaveByToken(T, pet(s1));
    expect(calls).toEqual(['profile_upsert']);
    missing = false; // the migration lands
    now += 11 * 60 * 1000;
    calls.length = 0;
    await A.cloudSaveByToken(T, feed(pet(s1)));
    expect(calls).toEqual(['profile_upsert_if']);
    expect(card(T).hp).toBe(22);
  });
});
