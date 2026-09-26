# Astra brief: Wesen, code review (rep 2, before merge)

**Who buys what, in one line:** nobody buys; Marc (parent, owner) will turn this on for Louis (6) on the live PWA app.ronki.de; every other family must see and feel nothing.

## What to review

The diff `git diff origin/main..feat/wesen-louis-test` in `C:\Users\öööö\ronki-wesen` (commit 8e3b2db). It implements `docs/plans/2026-09-26-wesen-louis-test.md` as revised by your round 1 (`docs/reviews/2026-09-26-wesen-plan/fable-response-round1.md`). Main files: `src/loop/wesen.ts` (+ test), `src/data/wesen.ts`, `src/context/TaskContext.tsx` (complete, applyDayTransition, setRoutine, the wesen actions, the load path), `src/utils/mergeState.ts`, `src/components/drachennest/RoomHub.jsx`, `src/components/wesen/*`, `src/components/ParentalDashboard.jsx`, `src/components/RonkiPassport.jsx`, `src/main.jsx`.

Already checked by Fable: 680 tests green, tsc unchanged at 23 old errors, check:names clean, app and website builds green; a browser walk with the DEV clock on a seeded test save through pick, day 1 and 2 steps with the line, days 3 to 4 seeded, day 5 meeting (finger hold walks, release pauses), parent "Ja, allein", growth moment, review after 8 weeks, move-out at next day start (routine and today's quests without the task, position kept), goodbye, passport row, restore to the old position. No console errors.

## Questions (correctness first)

1. **Zero effect on other families.** Any path where a card without `wesen` (or with `offered` but switch off) changes behaviour, state shape, sync writes or rendering? Note `reconcileAfterMerge` now runs after every merge.
2. **complete() hook.** Is the step counted exactly once per day, only on the not-done to done transition, and never when the switch is off? Anything in the partial-completion (`target > 1`) path?
3. **Day transition.** `applyMoveOutAtDayStart` runs at the top of `applyDayTransition` using `today()`. Races with a tab open over midnight (`checkNewDay`), a clock set back, two devices?
4. **Merge and reconcile.** `mergeWesen` and `reconcileAfterMerge` under the compare-and-swap sync: lost answers, a restore on one device vs. a stale save on the other, a routine edit on one device while the other applies the move-out, two picks at once. Anything that can resurrect a moved-out task forever or remove a restored one?
5. **Overlay chain in RoomHub.** Can a Wesen moment open over the treasure reveal, growth beat, departure sheet, feelings or sit? Can a moment get stuck (held in `wesenShow` with nothing rendered)? Is the step line safe with `sayPassing`?
6. **The meeting.** The finger hold uses a 40 ms timer with elapsed-time steps (rAF stalled in a throttled view). Any way to get stuck, double-fire `markSeen`, or leak the interval? Keyboard path (Enter/Space arrives at once)?
7. **Guardrails** from the plan: no numbers for the child, nothing tied to gaps, no fail state, parent answers private, move-out never automatic. Any line or UI that breaks one?
8. Anything else that would bite Louis on a real tablet (UTC day keys: the day rolls over at 01:00 or 02:00 local, known limit).

## Format

Findings table: ID, severity (high, medium, low), file:line, claim, failure scenario, fix. Verify each claim against the code before listing it. Then a verdict: HAPPY or NOT YET. Read-only; do not edit files. Plain English, no em-dashes. Read `C:\Users\öööö\.basic-memory\docs\two-model-review\HOUSE-RULES.md` first.
