#!/usr/bin/env node
/**
 * mock-supabase.mjs
 *
 * A dependency-free stand-in for the slice of the Supabase PostgREST API
 * that ronki.de and app.ronki.de actually call. It exists so the whole
 * funnel (create a card on the website, scan it in the app, waitlist,
 * feedback, app-check, telemetry) can be walked end to end on a laptop
 * without a live Supabase project.
 *
 * It is a mock, not a database. No auth, no RLS, no SQL. Every row lives
 * in memory unless you pass --state, in which case the whole store is
 * written to a JSON file after each write and read back on start.
 *
 * Run it:
 *
 *   node scripts/mock-supabase.mjs
 *   node scripts/mock-supabase.mjs --port 54321 --state .mock-supabase.json
 *
 * Point the website at it, in a second shell:
 *
 *   VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=mock npm run dev:web -- --port 5174
 *
 * Point the app at it, in a third shell:
 *
 *   VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=mock npx vite --port 5173
 *
 * Supported surface (everything the codebase calls today):
 *
 *   tables   waitlist, site_feedback, leads, telemetry_events, feedback,
 *            app_evals, profiles, game_state
 *   views    app_eval_counts (app_name, n), computed on read
 *   rpc      waitlist_count, update_waitlist_screener, leads_count,
 *            profiles_count, profiles_active_count, profile_get,
 *            profile_upsert, profile_upsert_if, profile_delete
 */

import http from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const out = { port: 54321, state: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port') out.port = Number(argv[++i]);
    else if (arg.startsWith('--port=')) out.port = Number(arg.slice(7));
    else if (arg === '--state') out.state = argv[++i];
    else if (arg.startsWith('--state=')) out.state = arg.slice(8);
    else if (arg === '--help' || arg === '-h') {
      console.log('usage: node scripts/mock-supabase.mjs [--port 54321] [--state file.json]');
      process.exit(0);
    }
  }
  if (!Number.isInteger(out.port) || out.port < 1 || out.port > 65535) {
    console.error('mock-supabase: --port must be a valid port number');
    process.exit(1);
  }
  return out;
}

const OPTIONS = parseArgs(process.argv.slice(2));

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

/**
 * Every table is a plain array of row objects. `activity` is not a table
 * the client can see; it backs profiles_active_count and maps a profile
 * token to the set of YYYY-MM-DD days that token was written on.
 */
function emptyStore() {
  return {
    waitlist: [],
    site_feedback: [],
    leads: [],
    telemetry_events: [],
    feedback: [],
    app_evals: [],
    profiles: [],
    game_state: [],
    activity: {},
  };
}

const TABLES = [
  'waitlist',
  'site_feedback',
  'leads',
  'telemetry_events',
  'feedback',
  'app_evals',
  'profiles',
  'game_state',
];

/** Views are read-only and recomputed from the tables on every read. */
const VIEWS = {
  app_eval_counts(store) {
    const counts = new Map();
    for (const row of store.app_evals) {
      const key = row.app_name;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].map(([app_name, n]) => ({ app_name, n }));
  },
};

/** Unique constraints, mirroring the real schema. */
const UNIQUE = {
  waitlist: [['email']],
  leads: [['email', 'source']],
  app_evals: [['id']],
  profiles: [['token']],
  game_state: [['user_id']],
};

/**
 * CHECK constraints worth mirroring, so a funnel walked against the mock
 * fails the same way it would against the real project instead of passing
 * locally and breaking live. Names match the SQL in supabase/migrations.
 */
const CHECKS = {
  leads: [
    {
      name: 'leads_email_format',
      test: (r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(r.email ?? '')),
    },
    {
      name: 'leads_email_length',
      test: (r) => String(r.email ?? '').length <= 254,
    },
    {
      name: 'leads_source_allowed',
      test: (r) =>
        [
          'vorlage-morgen',
          'vorlage-abend',
          'vorlage-kleine-geschwister',
          'vorlage-adhs',
        ].includes(r.source),
    },
    {
      name: 'leads_consent_required',
      test: (r) => r.consent === true,
    },
  ],
};

/** Primary keys used to resolve an upsert conflict. */
const PRIMARY_KEY = {
  profiles: 'token',
  game_state: 'user_id',
  app_evals: 'id',
  waitlist: 'email',
};

let store = emptyStore();

function loadState() {
  if (!OPTIONS.state) return;
  try {
    const parsed = JSON.parse(readFileSync(OPTIONS.state, 'utf8'));
    store = { ...emptyStore(), ...parsed };
    for (const t of TABLES) if (!Array.isArray(store[t])) store[t] = [];
    if (!store.activity || typeof store.activity !== 'object') store.activity = {};
    const rows = TABLES.reduce((n, t) => n + store[t].length, 0);
    console.log(`mock-supabase: loaded ${rows} rows from ${OPTIONS.state}`);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      console.log(`mock-supabase: ${OPTIONS.state} does not exist yet, starting empty`);
    } else {
      console.error(`mock-supabase: could not read ${OPTIONS.state}:`, err.message);
    }
  }
}

function saveState() {
  if (!OPTIONS.state) return;
  try {
    writeFileSync(OPTIONS.state, JSON.stringify(store, null, 2) + '\n', 'utf8');
  } catch (err) {
    console.error(`mock-supabase: could not write ${OPTIONS.state}:`, err.message);
  }
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                        */
/* ------------------------------------------------------------------ */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'apikey, authorization, content-type, prefer, x-client-info, x-supabase-api-version, accept, accept-profile, content-profile, range',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Expose-Headers': 'content-range, content-length',
  'Access-Control-Max-Age': '86400',
};

function send(res, status, body, extraHeaders = {}) {
  const headers = { ...CORS_HEADERS, ...extraHeaders };
  if (body === undefined || body === null || body === '') {
    res.writeHead(status, headers);
    res.end();
    return status;
  }
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    ...headers,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
  return status;
}

function pgError(res, status, code, message, details = null, hint = null) {
  return send(res, status, { code, message, details, hint });
}

const DUPLICATE = {
  code: '23505',
  message: 'duplicate key value violates unique constraint',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      // 8 MB is far beyond anything this codebase posts. Refuse the rest.
      if (size > 8 * 1024 * 1024) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/* ------------------------------------------------------------------ */
/* PostgREST query parsing                                             */
/* ------------------------------------------------------------------ */

/**
 * Turns `?email=eq.marc@example.com&limit=1&order=created_at.desc` into
 * something we can apply to an array. Only the operators this codebase
 * uses are implemented. Anything else is ignored rather than rejected,
 * because a mock that crashes is worse than a mock that over-returns.
 */
function parseQuery(searchParams) {
  const filters = [];
  let select = null;
  let limit = null;
  let order = null;
  let onConflict = null;

  for (const [key, value] of searchParams.entries()) {
    if (key === 'select') {
      select = value === '*' ? null : value.split(',').map((s) => s.trim()).filter(Boolean);
      continue;
    }
    if (key === 'limit') {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) limit = n;
      continue;
    }
    if (key === 'offset') continue;
    if (key === 'order') {
      const [column, ...rest] = value.split('.');
      order = { column, desc: rest.includes('desc') };
      continue;
    }
    if (key === 'on_conflict') {
      onConflict = value.split(',').map((s) => s.trim()).filter(Boolean);
      continue;
    }
    if (key === 'columns' || key === 'apikey') continue;

    // Everything left is a column filter of the form <op>.<value>.
    const dot = value.indexOf('.');
    if (dot === -1) continue;
    const op = value.slice(0, dot);
    const raw = value.slice(dot + 1);
    filters.push({ column: key, op, value: raw });
  }

  return { filters, select, limit, order, onConflict };
}

function coerce(raw) {
  if (raw === 'null') return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return raw;
}

function looseEquals(cell, raw) {
  const wanted = coerce(raw);
  if (cell === wanted) return true;
  if (cell === null || cell === undefined) return wanted === null;
  // PostgREST compares by text, so 7 and "7" are the same filter value.
  return String(cell) === String(wanted);
}

function matches(row, filters) {
  return filters.every(({ column, op, value }) => {
    const cell = row[column];
    switch (op) {
      case 'eq':
        return looseEquals(cell, value);
      case 'neq':
        return !looseEquals(cell, value);
      case 'is':
        return value === 'null' ? cell === null || cell === undefined : looseEquals(cell, value);
      case 'in': {
        const list = value.replace(/^\(|\)$/g, '').split(',').map((s) => s.replace(/^"|"$/g, ''));
        return list.some((v) => looseEquals(cell, v));
      }
      case 'gt':
        return cell > coerce(value);
      case 'gte':
        return cell >= coerce(value);
      case 'lt':
        return cell < coerce(value);
      case 'lte':
        return cell <= coerce(value);
      case 'like':
      case 'ilike': {
        const re = new RegExp(
          '^' + value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$',
          op === 'ilike' ? 'i' : '',
        );
        return re.test(String(cell ?? ''));
      }
      default:
        // Unknown operator: do not filter it out, just let the row pass.
        return true;
    }
  });
}

function project(rows, select) {
  if (!select) return rows;
  return rows.map((row) => {
    const out = {};
    for (const col of select) if (col in row) out[col] = row[col];
    return out;
  });
}

function applyQuery(rows, q) {
  let out = rows.filter((r) => matches(r, q.filters));
  if (q.order) {
    const { column, desc } = q.order;
    out = [...out].sort((a, b) => {
      const av = a[column];
      const bv = b[column];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      return (av < bv ? -1 : 1) * (desc ? -1 : 1);
    });
  }
  if (q.limit !== null) out = out.slice(0, q.limit);
  return project(out, q.select);
}

/** Reads the Prefer header into the two flags PostgREST callers rely on. */
function parsePrefer(header) {
  const raw = (header || '').toLowerCase();
  return {
    representation: raw.includes('return=representation'),
    minimal: raw.includes('return=minimal'),
    merge: raw.includes('resolution=merge-duplicates'),
    ignore: raw.includes('resolution=ignore-duplicates'),
  };
}

/** `single()` asks for one object. `maybeSingle()` does not, it slices client-side. */
function wantsSingleObject(acceptHeader) {
  return (acceptHeader || '').includes('application/vnd.pgrst.object+json');
}

/* ------------------------------------------------------------------ */
/* Row helpers                                                         */
/* ------------------------------------------------------------------ */

function nowIso() {
  return new Date().toISOString();
}

function today() {
  return nowIso().slice(0, 10);
}

function uniqueConflict(table, row) {
  const constraints = UNIQUE[table];
  if (!constraints) return null;
  for (const cols of constraints) {
    if (cols.some((c) => row[c] === undefined || row[c] === null)) continue;
    const existing = store[table].find((r) => cols.every((c) => looseEquals(r[c], row[c])));
    if (existing) return { cols, existing };
  }
  return null;
}

/** Fills in the server-side defaults the real tables carry. */
function withDefaults(table, row) {
  const out = { ...row };
  if (out.id === undefined && table !== 'app_evals' && table !== 'profiles' && table !== 'game_state') {
    out.id = randomUUID();
  }
  if (out.created_at === undefined) out.created_at = nowIso();
  if (table === 'profiles' || table === 'game_state') {
    out.updated_at = nowIso();
  }
  if (table === 'waitlist') {
    if (out.locale === undefined) out.locale = 'de';
    if (out.child_age === undefined) out.child_age = null;
    if (out.challenge === undefined) out.challenge = null;
    if (out.willing_to_test === undefined) out.willing_to_test = null;
  }
  if (table === 'app_evals' && out.client_locale === undefined) out.client_locale = 'de';
  if (table === 'leads') {
    if (out.consent === undefined) out.consent = false;
    if (out.consent_text === undefined) out.consent_text = null;
    if (out.locale === undefined) out.locale = 'de';
  }
  return out;
}

/** Returns the name of the first failing CHECK constraint, or null. */
function checkViolation(table, row) {
  const checks = CHECKS[table];
  if (!checks) return null;
  const failed = checks.find((c) => !c.test(row));
  return failed ? failed.name : null;
}

function recordActivity(token) {
  const day = today();
  const days = store.activity[token] ?? [];
  if (!days.includes(day)) days.push(day);
  store.activity[token] = days;
}

/* ------------------------------------------------------------------ */
/* Table handlers                                                      */
/* ------------------------------------------------------------------ */

function handleGet(res, table, q, accept) {
  const source = VIEWS[table] ? VIEWS[table](store) : store[table];
  const rows = applyQuery(source, q);

  if (wantsSingleObject(accept)) {
    if (rows.length === 1) return send(res, 200, rows[0]);
    return pgError(
      res,
      406,
      'PGRST116',
      'JSON object requested, multiple (or no) rows returned',
      `Results contain ${rows.length} rows, application/vnd.pgrst.object+json requires 1 row`,
    );
  }

  const total = VIEWS[table] ? VIEWS[table](store).length : store[table].length;
  return send(res, 200, rows, {
    'Content-Range': rows.length ? `0-${rows.length - 1}/${total}` : `*/${total}`,
  });
}

function handlePost(res, table, q, body, prefer, accept) {
  if (VIEWS[table]) {
    return pgError(res, 405, '42809', 'cannot insert into a view');
  }

  const incoming = Array.isArray(body) ? body : [body];
  const written = [];
  const upsert = prefer.merge || prefer.ignore || Boolean(q.onConflict);
  const conflictCols = q.onConflict ?? (PRIMARY_KEY[table] ? [PRIMARY_KEY[table]] : null);

  for (const raw of incoming) {
    if (!raw || typeof raw !== 'object') {
      return pgError(res, 400, 'PGRST102', 'expected an object or an array of objects');
    }

    const violated = checkViolation(table, withDefaults(table, raw));
    if (violated) {
      return pgError(
        res,
        400,
        '23514',
        `new row for relation "${table}" violates check constraint "${violated}"`,
      );
    }

    if (upsert && conflictCols) {
      const index = store[table].findIndex((r) =>
        conflictCols.every((c) => looseEquals(r[c], raw[c])),
      );
      if (index !== -1) {
        if (prefer.ignore) {
          written.push(store[table][index]);
          continue;
        }
        const merged = withDefaults(table, { ...store[table][index], ...raw });
        merged.created_at = store[table][index].created_at;
        store[table][index] = merged;
        if (table === 'profiles') recordActivity(merged.token);
        written.push(merged);
        continue;
      }
    }

    const conflict = uniqueConflict(table, raw);
    if (conflict && !upsert) {
      return pgError(
        res,
        409,
        DUPLICATE.code,
        DUPLICATE.message,
        `Key (${conflict.cols.join(', ')}) already exists in table "${table}"`,
      );
    }

    const row = withDefaults(table, raw);
    store[table].push(row);
    if (table === 'profiles') recordActivity(row.token);
    written.push(row);
  }

  saveState();

  if (prefer.representation) {
    const rows = project(written, q.select);
    if (wantsSingleObject(accept) && rows.length === 1) return send(res, 201, rows[0]);
    return send(res, 201, rows);
  }
  return send(res, 201, '');
}

function handlePatch(res, table, q, body, prefer, accept) {
  if (VIEWS[table]) {
    return pgError(res, 405, '42809', 'cannot update a view');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return pgError(res, 400, 'PGRST102', 'expected an object');
  }

  const updated = [];
  store[table] = store[table].map((row) => {
    if (!matches(row, q.filters)) return row;
    const merged = { ...row, ...body };
    if (table === 'profiles' || table === 'game_state') merged.updated_at = nowIso();
    updated.push(merged);
    return merged;
  });

  saveState();

  if (prefer.representation) {
    const rows = project(updated, q.select);
    if (wantsSingleObject(accept) && rows.length === 1) return send(res, 200, rows[0]);
    return send(res, 200, rows);
  }
  return send(res, 204, '');
}

function handleDelete(res, table, q, prefer) {
  if (VIEWS[table]) {
    return pgError(res, 405, '42809', 'cannot delete from a view');
  }
  const removed = [];
  store[table] = store[table].filter((row) => {
    if (!matches(row, q.filters)) return true;
    removed.push(row);
    return false;
  });
  saveState();
  if (prefer.representation) return send(res, 200, project(removed, q.select));
  return send(res, 204, '');
}

/* ------------------------------------------------------------------ */
/* RPC                                                                 */
/* ------------------------------------------------------------------ */

const TOKEN_RE = /^[a-f0-9]{32}$/;

const RPC = {
  waitlist_count() {
    return { status: 200, body: store.waitlist.length };
  },

  update_waitlist_screener(args) {
    const email = String(args.p_email ?? args.email ?? '').trim().toLowerCase();
    const row = store.waitlist.find((r) => String(r.email).toLowerCase() === email);
    if (!row) return { status: 200, body: null };
    row.child_age = args.p_child_age ?? args.child_age ?? null;
    row.challenge = args.p_challenge ?? args.challenge ?? null;
    row.willing_to_test = args.p_willing_to_test ?? args.willing_to_test ?? null;
    row.screened_at = nowIso();
    saveState();
    // The real function returns void. supabase-js reads that back as null.
    return { status: 200, body: null };
  },

  leads_count() {
    const emails = new Set();
    for (const r of store.leads) {
      if (r.email) emails.add(String(r.email).trim().toLowerCase());
    }
    for (const r of store.waitlist) {
      if (r.email) emails.add(String(r.email).trim().toLowerCase());
    }
    return { status: 200, body: emails.size };
  },

  profiles_count() {
    return { status: 200, body: store.profiles.length };
  },

  // Defaults mirror supabase/migrations/20260915000200_profiles_rpc.sql:
  // three distinct active days inside the last sixty.
  profiles_active_count(args) {
    const minDays = Number(args.p_min_days ?? args.min_days ?? 3) || 3;
    const since = args.p_since ?? args.since ?? null;
    const sinceDay = since
      ? String(since).slice(0, 10)
      : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    let n = 0;
    for (const days of Object.values(store.activity)) {
      const relevant = days.filter((d) => d >= sinceDay);
      if (new Set(relevant).size >= minDays) n++;
    }
    return { status: 200, body: n };
  },

  profile_get(args) {
    const token = String(args.p_token ?? args.token ?? '');
    const row = store.profiles.find((r) => r.token === token);
    if (!row) return { status: 200, body: null };
    return {
      status: 200,
      body: { state: row.state ?? null, updated_at: row.updated_at ?? row.created_at ?? nowIso(), rev: row.rev ?? 0 },
    };
  },

  profile_upsert(args) {
    const token = String(args.p_token ?? args.token ?? '');
    if (!TOKEN_RE.test(token)) {
      return { status: 400, error: { code: 'P0001', message: 'invalid token' } };
    }
    const state = args.p_state ?? args.state ?? {};
    const updatedAt = nowIso();
    const index = store.profiles.findIndex((r) => r.token === token);
    let rev = 1;
    if (index === -1) {
      store.profiles.push({
        token,
        state,
        created_at: updatedAt,
        updated_at: updatedAt,
        last_active_at: updatedAt,
        rev,
      });
    } else {
      rev = (store.profiles[index].rev ?? 0) + 1;
      store.profiles[index] = {
        ...store.profiles[index],
        state,
        updated_at: updatedAt,
        last_active_at: updatedAt,
        rev,
      };
    }
    recordActivity(token);
    saveState();
    return { status: 200, body: { updated_at: updatedAt, rev } };
  },

  // Compare-and-swap write, same contract as the SQL function in
  // supabase/migrations/20260926000100_profiles_cas.sql.
  profile_upsert_if(args) {
    const token = String(args.p_token ?? args.token ?? '');
    if (!TOKEN_RE.test(token)) {
      return { status: 400, error: { code: 'P0001', message: 'invalid token' } };
    }
    const state = args.p_state ?? {};
    const expected = args.p_expected_rev === undefined ? null : args.p_expected_rev;
    const updatedAt = nowIso();
    const index = store.profiles.findIndex((r) => r.token === token);
    const row = index === -1 ? null : store.profiles[index];
    const current = row ? (row.rev ?? 0) : null;
    const ok = expected === null ? row === null : (row !== null && current === Number(expected));
    if (ok) {
      const rev = row ? current + 1 : 1;
      const next = { ...(row || { token, created_at: updatedAt }), state, updated_at: updatedAt, last_active_at: updatedAt, rev };
      if (index === -1) store.profiles.push(next); else store.profiles[index] = next;
      recordActivity(token);
      saveState();
      return { status: 200, body: { ok: true, rev, updated_at: updatedAt } };
    }
    if (!row) return { status: 200, body: { ok: false, rev: null, updated_at: null, state: null } };
    return { status: 200, body: { ok: false, rev: current, updated_at: row.updated_at ?? null, state: row.state ?? null } };
  },

  profile_delete(args) {
    const token = String(args.p_token ?? args.token ?? '');
    const before = store.profiles.length;
    store.profiles = store.profiles.filter((r) => r.token !== token);
    const removed = store.profiles.length < before;
    if (removed) delete store.activity[token];
    saveState();
    return { status: 200, body: removed };
  },
};

function handleRpc(res, name, args, accept) {
  const fn = RPC[name];
  if (!fn) {
    return pgError(
      res,
      404,
      'PGRST202',
      `Could not find the function public.${name} in the schema cache`,
    );
  }
  const result = fn(args ?? {});
  if (result.error) {
    return pgError(res, result.status, result.error.code, result.error.message);
  }
  // A scalar-returning function comes back as a bare JSON value.
  if (wantsSingleObject(accept) && result.body === null) {
    return pgError(res, 406, 'PGRST116', 'JSON object requested, multiple (or no) rows returned');
  }
  return send(res, result.status, JSON.stringify(result.body ?? null));
}

/* ------------------------------------------------------------------ */
/* Server                                                              */
/* ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? '127.0.0.1'}`);
  const path = url.pathname;
  let status = 500;

  try {
    if (req.method === 'OPTIONS') {
      status = send(res, 204, '');
      return;
    }

    if (path === '/' || path === '/health') {
      status = send(res, 200, {
        service: 'mock-supabase',
        tables: Object.fromEntries(TABLES.map((t) => [t, store[t].length])),
        rpc: Object.keys(RPC),
      });
      return;
    }

    if (!path.startsWith('/rest/v1/')) {
      status = pgError(res, 404, 'PGRST000', `no route for ${path}`);
      return;
    }

    const rest = path.slice('/rest/v1/'.length);
    const prefer = parsePrefer(req.headers.prefer);
    const accept = req.headers.accept ?? '';

    if (rest.startsWith('rpc/')) {
      if (req.method !== 'POST') {
        status = pgError(res, 405, 'PGRST101', 'rpc requires POST');
        return;
      }
      const raw = await readBody(req);
      let args = {};
      if (raw) {
        try {
          args = JSON.parse(raw);
        } catch {
          status = pgError(res, 400, 'PGRST102', 'invalid JSON body');
          return;
        }
      }
      status = handleRpc(res, rest.slice(4), args, accept);
      return;
    }

    const table = rest.split('?')[0];
    if (!TABLES.includes(table) && !VIEWS[table]) {
      status = pgError(
        res,
        404,
        'PGRST205',
        `Could not find the table 'public.${table}' in the schema cache`,
      );
      return;
    }

    const q = parseQuery(url.searchParams);

    if (req.method === 'GET' || req.method === 'HEAD') {
      status = handleGet(res, table, q, accept);
      return;
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      const raw = await readBody(req);
      let body = null;
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          status = pgError(res, 400, 'PGRST102', 'invalid JSON body');
          return;
        }
      }
      status =
        req.method === 'POST'
          ? handlePost(res, table, q, body, prefer, accept)
          : handlePatch(res, table, q, body, prefer, accept);
      return;
    }

    if (req.method === 'DELETE') {
      status = handleDelete(res, table, q, prefer);
      return;
    }

    status = pgError(res, 405, 'PGRST101', `method ${req.method} not supported`);
  } catch (err) {
    console.error('mock-supabase: unhandled error', err);
    if (!res.headersSent) {
      status = pgError(res, 500, 'PGRST500', err?.message ?? 'internal error');
    } else {
      res.end();
    }
  } finally {
    console.log(`${req.method} ${req.url} ${status}`);
  }
});

loadState();

server.listen(OPTIONS.port, '127.0.0.1', () => {
  console.log(`mock-supabase listening on http://127.0.0.1:${OPTIONS.port}`);
  console.log(`  tables: ${TABLES.join(', ')}`);
  console.log(`  views:  ${Object.keys(VIEWS).join(', ')}`);
  console.log(`  rpc:    ${Object.keys(RPC).join(', ')}`);
  if (OPTIONS.state) console.log(`  state:  ${OPTIONS.state}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    saveState();
    server.close(() => process.exit(0));
  });
}
