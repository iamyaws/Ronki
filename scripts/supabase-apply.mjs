#!/usr/bin/env node
// Apply supabase/migrations/*.sql over a direct Postgres connection.
//
// The alternative is pasting SQL into the Supabase editor by hand, which is
// how the repo and the live database drifted apart in the first place. This
// script runs the files in name order, records what it ran in
// public.schema_migrations_repo, and skips anything already recorded.
//
// Usage:
//   node scripts/supabase-apply.mjs --dry-run    print the plan, connect to nothing
//   node scripts/supabase-apply.mjs              apply the new files
//   node scripts/supabase-apply.mjs --all        also run the two pre 2026-09-15 files
//
// --only-new is the default: the two migrations that were already applied
// live (waitlist, telemetry_events) get marked as applied on the first run
// instead of being executed again.
//
// Connection string: SUPABASE_DB_URL from the environment or from .env.local.
// Supabase Dashboard, Project Settings, Database, Connection string, URI.
// It contains the database password, so keep it out of the repo.
//
// Requires the `pg` package as a devDependency: npm install --save-dev pg
// The dry run works without it.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const migrationsDir = join(repoRoot, 'supabase', 'migrations');

// Files that were applied to the live project by hand before this script
// existed. With --only-new they are recorded, not replayed.
const ALREADY_APPLIED_LIVE = [
  '20260415170000_waitlist_table.sql',
  '20260422000000_telemetry_events.sql',
];

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const RUN_ALL = args.includes('--all');
const ONLY_NEW = !RUN_ALL;

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

function listMigrations() {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

const files = listMigrations();

if (DRY_RUN) {
  console.log('Dry run. Nothing is connected to and nothing is changed.');
  console.log(`Migrations directory: supabase/migrations (${files.length} files)`);
  console.log(`Mode: ${ONLY_NEW ? '--only-new (default)' : '--all'}`);
  console.log('');
  console.log('Plan, in order:');
  for (const name of files) {
    const marked = ONLY_NEW && ALREADY_APPLIED_LIVE.includes(name);
    const verb = marked ? 'mark as applied, do not run' : 'run';
    console.log(`  ${name.padEnd(40, ' ')}  ${verb}`);
  }
  console.log('');
  console.log('Already recorded files are skipped at run time, so this plan is the upper bound.');
  console.log('Ledger table: public.schema_migrations_repo (name, applied_at)');
  process.exit(0);
}

const fileEnv = readEnvFile(join(repoRoot, '.env.local'));
const DB_URL = process.env.SUPABASE_DB_URL || fileEnv.SUPABASE_DB_URL || '';

if (!DB_URL) {
  console.error('Missing SUPABASE_DB_URL.');
  console.error('Set it in the environment or in .env.local at the repo root.');
  console.error('Supabase Dashboard, Project Settings, Database, Connection string, URI.');
  process.exit(1);
}

let pg;
try {
  pg = await import('pg');
} catch {
  console.error('The `pg` package is not installed, so this script cannot connect.');
  console.error('Install it as a devDependency:  npm install --save-dev pg');
  console.error('Or paste supabase/apply-2026-09-15.sql into the Supabase SQL editor instead.');
  console.error('`node scripts/supabase-apply.mjs --dry-run` works without pg.');
  process.exit(1);
}

const { Client } = pg.default ?? pg;

// Supabase terminates TLS with a publicly trusted certificate, so full
// certificate verification stays on. If the connection string already
// carries an sslmode, that setting wins.
const hasSslMode = /[?&]sslmode=/.test(DB_URL);

const client = new Client({
  connectionString: DB_URL,
  ...(hasSslMode ? {} : { ssl: { rejectUnauthorized: true } }),
});

let exitCode = 0;

try {
  await client.connect();

  await client.query(`
    create table if not exists public.schema_migrations_repo (
      name text primary key,
      applied_at timestamptz default now()
    );
  `);

  const { rows: appliedRows } = await client.query(
    'select name from public.schema_migrations_repo',
  );
  const applied = new Set(appliedRows.map((r) => r.name));

  let ran = 0;
  let marked = 0;
  let skipped = 0;

  for (const name of files) {
    if (applied.has(name)) {
      console.log(`skip    ${name} (already recorded)`);
      skipped += 1;
      continue;
    }

    if (ONLY_NEW && ALREADY_APPLIED_LIVE.includes(name)) {
      await client.query(
        'insert into public.schema_migrations_repo (name) values ($1) on conflict do nothing',
        [name],
      );
      console.log(`mark    ${name} (applied live before this script existed)`);
      marked += 1;
      continue;
    }

    const sql = readFileSync(join(migrationsDir, name), 'utf8');
    console.log(`apply   ${name}`);
    await client.query('begin');
    try {
      await client.query(sql);
      await client.query(
        'insert into public.schema_migrations_repo (name) values ($1) on conflict do nothing',
        [name],
      );
      await client.query('commit');
      ran += 1;
    } catch (err) {
      await client.query('rollback');
      throw new Error(`${name} failed and was rolled back: ${err.message}`);
    }
  }

  console.log('');
  console.log(`Done. ${ran} applied, ${marked} marked, ${skipped} skipped.`);
  console.log('Verify with: node scripts/supabase-smoke.mjs');
} catch (err) {
  console.error(`Failed: ${err.message}`);
  exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

process.exit(exitCode);
