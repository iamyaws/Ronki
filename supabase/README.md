# Supabase for Ronki

Project `jdpxfvqaoxmnyvlxikce` (eu-central-1). Marc restored it on 14 September 2026
after it sat paused since late May and frozen since late August.

Everything the app and the website need should be reproducible from the files in
this folder. Where that was not true before, this README says so.

## What is live today (15 September 2026)

Probed with the public anon key, so this is what the shipped bundles can reach.

| Object | Kind | In the repo |
|---|---|---|
| `waitlist` | table | yes, `migrations/20260415170000_waitlist_table.sql` (applied live) |
| `waitlist_count()` | RPC | yes, `migrations/20260915000050_baseline_live_objects.sql` (captured from the live schema on 15 Sep 2026) |
| `update_waitlist_screener()` | RPC | yes, `migrations/20260915000050_baseline_live_objects.sql` (captured from the live schema on 15 Sep 2026) |
| `site_feedback` | table | yes, `migrations/20260915000050_baseline_live_objects.sql` (captured from the live schema on 15 Sep 2026) |
| `profiles` | table | no, spec in `docs/specs/qr-profile-auth.md` |
| `telemetry_events` | table | yes, `migrations/20260422000000_telemetry_events.sql` (applied live) |
| `feedback` | table | yes, `migrations/20260915000050_baseline_live_objects.sql` (captured from the live schema on 15 Sep 2026) |
| `app_evals` | table | yes, `migrations/20260915000050_baseline_live_objects.sql` (captured from the live schema on 15 Sep 2026) |
| `app_eval_counts` | view | yes, `migrations/20260915000050_baseline_live_objects.sql` (captured from the live schema on 15 Sep 2026) |

Both files under `migrations/` were applied to the live project by hand, long
before `scripts/supabase-apply.mjs` existed. The apply script knows that and
marks them as applied instead of replaying them.

Live `profiles` columns: `token`, `state`, `created_at`, `updated_at`,
`last_active_at`. The code only ever used `token`, `state`, `updated_at` and
`last_active_at`.

`game_state` is referenced by `src/utils/storage.ts` (`cloudLoad`, `cloudSave`,
`syncLoad`) and has SQL in `migration.sql`, but the table was never created on
this project. Those calls have always failed silently. Nothing in the current
app flow calls them; the token path is what persists. Left alone on purpose.

## What `apply-2026-09-15.sql` adds and changes

Paste it into the Supabase SQL editor. It is safe to run twice: every statement
is guarded (`create table if not exists`, `create or replace function`,
`drop policy if exists`, `add column if not exists`, constraint lookups in
`pg_constraint`).

It is generated from the two migrations by `scripts/supabase-build-apply.mjs`,
so the pasted SQL and the repo cannot drift.

**Adds**

- `public.leads`: parent email capture behind the Vorlagen downloads. Columns
  `id`, `created_at`, `email`, `source`, `consent`, `consent_text`, `locale`.
  CHECK constraints on email shape, email length (254), an allowlist of four
  sources, and consent being true. Unique on `(email, source)`. RLS on, anon may
  insert and nothing else.
- `public.leads_count()`: unique parent emails across `leads` and `waitlist`,
  counted once per lowercased address. Anon may execute.
- `public.profile_activity`: one row per token per day it was written. RLS on,
  no anon policies at all.
- `public.profiles_count()` and `public.profiles_active_count(p_min_days, p_since)`:
  cards created, and cards that came back on at least `p_min_days` separate days
  since `p_since` (defaults: 3 days, last 60 days). These are the two numbers the
  30 day decision in `docs/strategy/2026-09-14-wiederbelebungs-check.md` needs.
- `public.profile_get(p_token)`, `public.profile_upsert(p_token, p_state)`,
  `public.profile_delete(p_token)`: the only way into `profiles` from now on.

**Changes**

- `public.profiles` gets `created_at` and `updated_at` guaranteed (both
  `timestamptz not null default now()`).
- Every policy on `public.profiles` is dropped and `anon` loses all table level
  grants. Today anon can list the table, which means the public key hands out
  every family's token, and the token is the login. After this, anon can only
  call the three functions above, each of which needs the token as an argument.

## Rollback

There is no undo for the profiles lockdown (see the warning below). Everything
this file adds can be removed:

```sql
-- functions first, they depend on the tables
drop function if exists public.profile_get(text);
drop function if exists public.profile_upsert(text, jsonb);
drop function if exists public.profile_delete(text);
drop function if exists public.profiles_count();
drop function if exists public.profiles_active_count(integer, timestamptz);
drop function if exists public.leads_count();

-- then the new tables
drop table if exists public.profile_activity;
drop table if exists public.leads;

-- optional: the ledger scripts/supabase-apply.mjs writes
-- drop table if exists public.schema_migrations_repo;
```

`public.profiles` itself is never dropped by any of this. Its rows are untouched.

**What rollback cannot restore.** The permissive policies that currently let
anon select from `public.profiles` were never written down in this repo. They
were created by hand in the dashboard in May 2026 and their definitions are not
recoverable from anything we have. Dropping them is a one way door. That is the
right call (they are the privacy gap) but it is worth saying plainly: if the
lockdown turns out to break something, the fix is to write a new policy on
purpose, not to restore the old one.

## Scripts

All three are plain Node, no dependencies except where noted. Credentials are
read from the environment first, then from `.env.local` at the repo root. Keys
are never printed.

### `node scripts/supabase-smoke.mjs`

Read only. Probes every table, view and RPC the code touches and prints a table
of object, status and note. Exits 1 if anything is missing. Run it after
applying SQL and after any deploy.

`--write` additionally round trips one throwaway profile:
`profile_upsert` with a random 32 hex token, then `profile_get` (the state must
come back unchanged), then `profile_delete` (must return true). It cleans up
after itself.

### `node scripts/supabase-apply.mjs`

Applies `migrations/*.sql` in name order over a direct Postgres connection and
records what it ran in `public.schema_migrations_repo`. Already recorded files
are skipped, so it is safe to re-run.

- `--dry-run` prints the plan and connects to nothing. Works without `pg`.
- default (`--only-new`) marks the two pre 2026-09-15 files as applied instead
  of replaying them.
- `--all` runs them too, for a fresh project.

Needs `SUPABASE_DB_URL` (Dashboard, Project Settings, Database, Connection
string, URI) and the `pg` package as a devDependency (`npm install --save-dev pg`).
Without `pg` it exits with that message rather than half doing the job.

### `node scripts/supabase-build-apply.mjs`

Regenerates `apply-2026-09-15.sql` from the three 2026-09-15 migrations (baseline, leads, profiles RPCs). Run it after
editing either one. `--check` fails if the apply file is stale, which makes it
usable as a CI step.

## Keep-alive

`.github/workflows/supabase-keepalive.yml` runs every Monday at 06:17 UTC and on
manual dispatch. It POSTs to `/rest/v1/rpc/leads_count` (defined in `migrations/20260915000100_leads.sql`) with the anon key and
fails the job unless the answer is HTTP 200.

A free Supabase project pauses after seven days without activity, then gets
permanently frozen a few months later. That is exactly how Ronki's backend died:
paused around 25 May 2026, frozen around 23 August, and both live bundles kept
talking to a host that no longer resolved. One weekly call resets that clock,
and a red job is the early warning that was missing.

It needs two repository secrets: `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`. The same two the deploy workflows already use.

## Order of work on a fresh project

1. `node scripts/supabase-apply.mjs --all`, or paste `migration.sql`,
   both files in `migrations/`, and the SQL from `CLAUDE.md` and the specs.
2. The 2026-09-15 migrations cover everything the code calls except `game_state`
   (dead code) and the anon telemetry grant (see HANDOFF follow-ups).
3. `node scripts/supabase-smoke.mjs` until it says PASS.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in both Vercel projects
   and in the GitHub repository secrets, then redeploy.
