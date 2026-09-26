# Astra brief: Wesen, the Louis test (plan review, rep 1)

**Who buys what, in one line:** nobody buys; Marc is the parent and product owner, Louis (6, first grade, German) is the only tester, for two weeks, on the live PWA at app.ronki.de behind a parent switch.

## Goal

Review the plan for a one-creature MVP that mixes Pokémon-style befriending and evolution into Ronki: one habit = one creature; it comes closer with each real completion, joins at 5, grows when a parent says "allein", moves out about 8 weeks later and the task leaves the routine. Marc decided: "befriend" (never "fangen"), the task really leaves the Nest, no 12+ band. He wants a test Louis can play, better art than the old painterly creatures, and your review of the plan before the build.

## Read (paths from the repo root `C:\Users\öööö\ronki-wesen`)

1. `docs/plans/2026-09-26-wesen-louis-test.md` (the plan under review)
2. `docs/concepts/2026-09-26-ronki-sammler/index.html` (the concept page Marc reacted to)
3. `HANDOFF.md`, sections "Finch pass" and "Compare-and-swap sync" (what the app is right now, why features were cut, how sync merges)
4. `src/components/drachennest/RoomHub.jsx`, `src/context/TaskContext.tsx` (the `complete` action near line 1873, `setRoutine` near line 2565), `src/utils/mergeState.ts`, `src/loop/growth.ts`, `src/data/taskKinds.ts`, `src/config/features.ts`
5. `C:\Users\öööö\.basic-memory\docs\two-model-review\HOUSE-RULES.md` and the Active list in `LESSONS.md`
6. Positioning: Ronki is a companion that fades by design; it optimizes for time-to-independence, not time-on-device. No streaks, no loss framing, no need-framing ("Ronki is sad if you don't").

## Questions

1. **Does the loop pass the positioning test?** Where could this turn into a reward the child works for instead of a mirror of what the child did (overjustification)? Name the exact mechanic and the smallest change that fixes it. Do not fix it with a disclaimer or a parent warning; change the mechanic.
2. **Does the test answer Marc's question in two weeks?** With 5 steps to befriend and the grow step 7 days after that, Louis sees the befriend moment around day 5 and maybe the growth in week 2. Move-out cannot happen in the test. Is that the right shape, or should the test compress anything (without faking the habit)?
3. **The task leaving the routine.** Marc's call stands; challenge only how it is done (timing, parent notice, undo, what the child sees), not whether.
4. **Child pick of three shadows vs. a fixed creature.** Is choice worth an extra sheet for a 6-year-old on day 1?
5. **Engineering risks** in the plan: the step hook inside `complete()`, the merge rule for `wesen` under the compare-and-swap sync, the overlay chain in RoomHub, the move-out rewriting `familyConfig.routine` and today's quests, UTC day keys (known limit: the day rolls over at 01:00 or 02:00 local).
6. **Art cast.** Glutfunke, Moosmops, Tropfi, three looks each, Bilderbuch style next to Ronki. Would a first grader want each one? Anything that reads as a Pokémon look-alike or too close to an existing IP?
7. What did we miss that would make Louis lean in? Spar, don't only review: one or two ideas that make the befriend moment land harder without adding a system.

## Assumptions to pressure-test

For each: how likely wrong, what happens at home if wrong, cheapest test, fallback.

- A1. Paw marks without numbers are enough for a 6-year-old to feel progress over 5 days.
- A2. A parent will answer "Macht er das allein?" honestly and on time (not to please the child).
- A3. The hold-still moment reads as special, not as another tap.
- A4. One creature is enough to see bargaining if it's going to happen.
- A5. Removing the task after move-out will not confuse Louis ("where did Zähne putzen go?").
- A6. A creature beside Ronki does not pull attention away from Ronki himself (Ronki is the bond).

## Format

Round 1 findings as a table: ID, severity (high, medium, low), where, claim, why it matters, fix. Then answers to questions 1 to 7, the assumption table, and a verdict: HAPPY or NOT YET. Challenge Fable's plan as hard as Marc's calls on how they're executed. You are read-only; do not edit files. Write plain German-free English, no em-dashes.
