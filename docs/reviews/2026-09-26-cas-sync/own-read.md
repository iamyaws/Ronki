# Own read before Astra: compare-and-swap sync (26 Sep 2026)

Written by Fable before opening any reviewer output.

## What was built

- `supabase/migrations/20260926000100_profiles_cas.sql`: `profiles.rev`, `profile_upsert_if(p_token, p_state, p_expected_rev)`, `profile_get` returns rev, `profile_upsert` bumps rev.
- `src/utils/mergeState.ts`: three-way merge (base = the card as this session last read or wrote it, local = what this device wants to write, remote = the card now).
- `src/utils/storage.ts` `cloudSaveByToken`: CAS with the last known rev, merge and retry up to 3 times, legacy fallback on PGRST202 or 42883.
- `src/context/TaskContext.tsx`: a merged result that differs from what this device wrote is saved locally, cloud writes freeze, the page reloads onto the card.

## Evidence so far

- 619 app tests green (15 merge tests, 4 CAS storage tests, the merged-adoption test in `TaskContext.sync.test.tsx`), tsc at the 23-error baseline, check:names clean.
- `supabase/tests/profiles_cas.pglite.mjs`: the real repo migrations in an in-process Postgres (PGlite), 35 checks, all pass: idempotent migration, old rows get rev 0, insert-only on null, stale rev refused with the current row, legacy write bumps rev and a CAS writer notices, deleted row returns nulls, no activity stamp on refusal, privileges (anon executes, PUBLIC does not, anon cannot update the table so rev cannot be forged).
- The mock server returns the same values as Postgres for the same 13-call sequence (key order aside).
- The live server today answers `profile_upsert_if` with 404 PGRST202, which is exactly what the client falls back on: the client can ship before the migration.
- Two real browser tabs against the mock: A ticks Aufstehen, B ticks Frühstück, the card ends with both, totalTasksDone 2, hp 20.

## Where I think it is weakest (my rating)

1. **Tap during a race retry (low, likely rare).** A tap made while a raced write is in flight (a few hundred ms) is in React state but not in the merged card; the page reloads onto the card and the tap is gone. The pagehide flush writes local only (cloud is frozen), and on reload the same-day tie goes to the cloud. Needs a race and a tap inside the round trip.
2. **Cold start still picks one side (medium, pre-existing).** `syncLoadByToken` compares `lastDate`: same day, the cloud wins whole; local newer, local is pushed whole (CAS succeeds because it just read the rev). The base is memory-only, so after a reload there is no three-way merge. A tick saved locally whose cloud write died with the tab is lost on a same-day tie; the SAVES-3 pagehide flush narrows this. CAS fixes live races, not these. Persisting `{rev, state}` per token next to the local save would let cold start merge too; not built.
3. **Merge rules are a whitelist (medium).** Keys without a rule fall to "remote wins" when both sides changed. A new counter added later without a rule silently becomes last-writer-wins for races. The test "no-op when nothing differs" guards identity but not coverage.
4. **Delta counters with a stale base (low).** hp and the task counters add `local - base` plus `remote - base`. Correct as long as base is what this session really last saw on the server. Base is set only from a read or a successful write, so I believe it holds; worth a second pair of eyes.
5. **Three races in a row return "offline" (low).** The next save starts again from the old rev and merges again; the deltas are not double counted because nothing of ours landed.
6. **Concurrency proof is by Postgres semantics, not a test.** PGlite is single-connection. `UPDATE ... WHERE token = $1 AND rev = $2` under READ COMMITTED: the second writer waits for the row lock, re-checks the WHERE on the new version, updates 0 rows, gets the current row. I am confident, but it is not demonstrated here.

## Ship read

Ship: the SQL is small, backward compatible both ways, and tested on real Postgres. The client is safe before and after the migration. Points 1 and 2 are known limits to write into HANDOFF, not blockers.
