# Astra code review, round 2: compare-and-swap sync fixes (26 Sep 2026)

Read-only, do not edit any file. Round 2 covers only the changes since your round 1 and whether they close your findings. Reply in the PROTOCOL findings format, at most 900 words, then HAPPY or NOT YET with the single biggest reason.

## Read

- Your round 1: `docs/reviews/2026-09-26-cas-sync/astra-r1.txt`.
- Our answers: `docs/reviews/2026-09-26-cas-sync/response-r1.md`. A parallel Claude verifier found the same flush loss (its F2) plus two more: two writes from one page in flight at once merged against each other (F3), and a write that landed without its answer was merged against itself (F4).
- The diff: `git diff 8ed5524..HEAD -- src` on branch `finch/cas-sync`. Key places: `src/utils/storage.ts` (the `SyncInfo` block, `compose`, `descendsFrom`, `serialize`, `writeCard`, `syncLoadByToken`), `src/utils/mergeState.ts`, the cloud-save timer in `src/context/TaskContext.tsx`, and the tests in `src/utils/storage.cas.test.ts` (two devices against a fake card server with the SQL contract).
- The house rules and active lessons as in round 1.

## The design change to challenge

We did not take merges into React state. Instead storage keeps, per card, `base`: the last state it handed to its caller or wrote for it. Every write sends `mergeStates(base, state, card)` and on success sets `base = state`. The claim: as long as every state the caller writes grew from base, no write can overwrite another device's progress, whether or not the caller ever takes on a merge. After a merge the page saves its own newest state locally and reloads; the stored base lets the next load apply that local copy onto the card.

## The questions

1. Does the base invariant really hold on every path: a load (`handOut`), a plain write, a raced write, three races in a row, a lost answer (the `syncWrites` id list and `inflight`), the old-write fallback, the TaskContext probe read (which deliberately does not touch base), two tabs on one device?
2. Cold start: is `descendsFrom` a safe gate, and is anything reverted or counted twice when the stored base, the local copy and the card disagree?
3. Anything in your CAS-01 to CAS-07 still open? Rate the known limits in the last paragraph of the response (rewards from the same event on both devices outside task ticks; two tabs on one device).
