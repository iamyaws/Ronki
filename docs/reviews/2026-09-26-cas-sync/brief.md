# Astra code review: compare-and-swap sync for Ronki cards (26 Sep 2026)

Read-only, do not edit any file. Reply in the PROTOCOL findings format (ID, severity, where, claim, why it matters, fix), at most 900 words, then HAPPY or NOT YET with the single biggest reason.

## Goal and reader

Ronki is a German kids' routine app (PWA). A family's progress is one jsonb row per 32-hex card token in Supabase, written only through security-definer RPCs. Until now every write replaced the whole row, so a parent phone and the child's tablet writing the same card within seconds were last-writer-wins. Marc asked to build a compare-and-swap RPC. The reader of this review is Marc (product owner, not a Postgres expert) and Fable (who built it). Nothing is on production yet: the migration is waiting for Marc's go, the client is on branch `finch/cas-sync`.

## Read first

- House rules: `C:/Users/öööö/.basic-memory/docs/two-model-review/HOUSE-RULES.md`; active lessons: the "Active" section of `C:/Users/öööö/.basic-memory/docs/two-model-review/LESSONS.md`.
- Project state: `HANDOFF.md`, the section "Compare-and-swap sync" at the top and the "Finch pass" section below it (sync safety paragraph).
- The diff: `git diff 3b11966..HEAD` on branch `finch/cas-sync` (commits 9d04a2e, d48ef54). Key files: `supabase/migrations/20260926000100_profiles_cas.sql`, `src/utils/mergeState.ts` (+ `.test.ts`), `src/utils/storage.ts` (`cloudSaveByToken`, `cloudLoadByToken`, `syncLoadByToken`), the cloud-save effect in `src/context/TaskContext.tsx` (around line 1600), `scripts/mock-supabase.mjs`.
- Evidence: `supabase/tests/profiles_cas.pglite.mjs` (35 checks on real Postgres via PGlite, all pass), and Fable's own read `docs/reviews/2026-09-26-cas-sync/own-read.md`. Challenge the own read as hard as the code.

## The questions

1. **SQL.** Is `profile_upsert_if` correct and safe under concurrent callers (READ COMMITTED, two writers with the same expected rev)? Any way to forge or skip rev, leak another card's state, or break the website card form and older app bundles that still call `profile_upsert` and `profile_get`? Anything the Supabase security advisors would flag?
2. **Merge.** Can `mergeStates` lose or double-count a child's progress (tasks done, Sterne `hp`, `totalTasksDone`, treasures, adventures, the trip state `expedition`, growth `catEvo`)? Is the base always what this session really last saw on the server? Is "remote wins" the right default for keys without a rule?
3. **Client flow.** Is any path left where a device overwrites newer cloud progress: the retry loop, the legacy fallback, the merged adoption (save locally, freeze writes, reload), the pagehide flush, the load path in `syncLoadByToken`? Rate the two known limits in the own read (tap during a race retry; cold start still picks one side): ship with them written down, or fix first?
4. **Order of rollout.** Migration first or client first, and is there any window where old bundles plus the new SQL, or the new client plus the old SQL, do harm?
