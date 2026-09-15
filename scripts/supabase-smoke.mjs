#!/usr/bin/env node
// Ronki Supabase smoke test.
//
// Answers one question in a few seconds: is the backend the code expects
// actually there? It probes every table, view and RPC the app and the
// website call, using the public anon key, and exits non zero if anything
// is missing. Run it after applying SQL and after any redeploy.
//
// Usage:
//   node scripts/supabase-smoke.mjs            read only, touches no data
//   node scripts/supabase-smoke.mjs --write    also round trips one throwaway profile
//
// Credentials come from the environment (VITE_SUPABASE_URL,
// VITE_SUPABASE_ANON_KEY) and fall back to .env.local at the repo root.
// The key is never printed.
//
// No dependencies. Node 18 or newer (global fetch).

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function readEnvFile(path) {
  const out = {};
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return out;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = readEnvFile(join(repoRoot, '.env.local'));
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  console.error('Set them in the environment or in .env.local at the repo root.');
  process.exit(1);
}

const WRITE = process.argv.includes('--write');

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

// Everything the app or the website reads or writes.
const RELATIONS = [
  ['waitlist', 'website signups'],
  ['site_feedback', 'website feedback form'],
  ['profiles', 'kid profiles, token keyed'],
  ['telemetry_events', 'app telemetry'],
  ['feedback', 'in app feedback'],
  ['app_evals', 'app check tool'],
  ['app_eval_counts', 'app check view'],
  ['leads', 'template downloads'],
  ['profile_activity', 'per token activity days'],
];

const FAKE_TOKEN = '0'.repeat(32);

// Every RPC the code calls, plus the counters the funnel gates need.
const RPCS = [
  ['waitlist_count', {}, 'total waitlist signups'],
  ['update_waitlist_screener', { email: 'smoke-probe@example.invalid', child_age: '', challenge: '', willing_to_test: 'später' }, 'waitlist screener (no-op for unknown email)'],
  ['leads_count', {}, 'unique parent emails, leads plus waitlist'],
  ['profiles_count', {}, 'cards created'],
  ['profiles_active_count', {}, 'cards used on 3+ days in 60 days'],
  ['profile_get', { p_token: FAKE_TOKEN }, 'expects null for an unknown token'],
];

const rows = [];
let missing = 0;

function record(object, status, note) {
  rows.push({ object, status, note });
  if (status === 'MISSING') missing += 1;
}

async function probeRelation(name, note) {
  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?select=*&limit=0`, { headers: HEADERS });
  } catch (err) {
    record(name, 'ERROR', `request failed: ${err.message}`);
    return;
  }
  if (res.status === 404) {
    record(name, 'MISSING', note);
    return;
  }
  // Anything that is not a 404 means PostgREST knows the relation.
  // 401 or 403 is a healthy answer here: the object exists and is locked down.
  const locked = res.status === 401 || res.status === 403;
  record(name, 'OK', locked ? `${note} (exists, anon read denied)` : note);
}

async function probeRpc(name, body, note) {
  let res;
  let text;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    text = await res.text();
  } catch (err) {
    record(`${name}()`, 'ERROR', `request failed: ${err.message}`);
    return;
  }
  if (res.status === 404) {
    record(`${name}()`, 'MISSING', note);
    return;
  }
  if (res.status >= 400) {
    record(`${name}()`, 'ERROR', `http ${res.status}: ${shorten(text)}`);
    return;
  }
  const value = text.trim();
  if (name === 'profile_get') {
    const ok = value === 'null' || value === '';
    record(`${name}()`, ok ? 'OK' : 'ERROR', ok ? note : `expected null, got ${shorten(value)}`);
    return;
  }
  record(`${name}()`, 'OK', `${note}: ${shorten(value)}`);
}

function shorten(text) {
  const one = String(text).replace(/\s+/g, ' ').trim();
  return one.length > 60 ? `${one.slice(0, 57)}...` : one;
}

async function writeRoundTrip() {
  const token = randomBytes(16).toString('hex');
  const state = { smoke: true, stamp: new Date().toISOString() };

  const call = async (fn, body) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, text };
  };

  const up = await call('profile_upsert', { p_token: token, p_state: state });
  if (up.status >= 400) {
    record('profile_upsert (write)', 'ERROR', `http ${up.status}: ${shorten(up.text)}`);
    return;
  }
  record('profile_upsert (write)', 'OK', shorten(up.text));

  const got = await call('profile_get', { p_token: token });
  if (got.status >= 400) {
    record('profile_get (write)', 'ERROR', `http ${got.status}: ${shorten(got.text)}`);
  } else {
    let same = false;
    try {
      const parsed = JSON.parse(got.text);
      same = parsed && JSON.stringify(parsed.state) === JSON.stringify(state);
    } catch {
      same = false;
    }
    record('profile_get (write)', same ? 'OK' : 'ERROR', same ? 'state came back unchanged' : `state mismatch: ${shorten(got.text)}`);
  }

  const del = await call('profile_delete', { p_token: token });
  if (del.status >= 400) {
    record('profile_delete (write)', 'ERROR', `http ${del.status}: ${shorten(del.text)}`);
    return;
  }
  const deleted = del.text.trim() === 'true';
  record('profile_delete (write)', deleted ? 'OK' : 'ERROR', deleted ? 'throwaway profile removed' : `expected true, got ${shorten(del.text)}`);
}

function printTable() {
  const head = { object: 'OBJECT', status: 'STATUS', note: 'NOTE' };
  const all = [head, ...rows];
  const w = (key) => Math.max(...all.map((r) => String(r[key]).length));
  const wo = w('object');
  const ws = w('status');
  const pad = (s, n) => String(s).padEnd(n, ' ');
  console.log('');
  for (const r of all) {
    console.log(`${pad(r.object, wo)}  ${pad(r.status, ws)}  ${r.note}`);
    if (r === head) console.log(`${'-'.repeat(wo)}  ${'-'.repeat(ws)}  ${'-'.repeat(4)}`);
  }
  console.log('');
}

async function main() {
  const host = SUPABASE_URL.replace(/^https?:\/\//, '');
  console.log(`Ronki Supabase smoke test against ${host}`);
  console.log(WRITE ? 'Mode: read plus write round trip' : 'Mode: read only');

  for (const [name, note] of RELATIONS) {
    await probeRelation(name, note);
  }
  for (const [name, body, note] of RPCS) {
    await probeRpc(name, body, note);
  }
  if (WRITE) {
    await writeRoundTrip();
  }

  printTable();

  const errors = rows.filter((r) => r.status === 'ERROR').length;
  if (missing || errors) {
    console.error(`FAIL: ${missing} missing, ${errors} error(s).`);
    if (missing) {
      console.error('Apply supabase/apply-2026-09-15.sql in the Supabase SQL editor, then run this again.');
    }
    process.exit(1);
  }
  console.log('PASS: every object the code needs is there.');
}

main().catch((err) => {
  console.error(`Smoke test crashed: ${err.message}`);
  process.exit(1);
});
