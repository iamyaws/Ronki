# Astra code review: tomorrow as a picture, shelf favourite (26 Sep 2026)

Read-only, do not edit any file. PROTOCOL findings format (ID, severity, where, claim, why it matters, fix), at most 600 words, then HAPPY or NOT YET with the single biggest reason.

Read: `C:/Users/öööö/.basic-memory/docs/two-model-review/HOUSE-RULES.md`, the Active section of `LESSONS.md` next to it, the "Finch pass" section of `HANDOFF.md` (guardrails), Fable's own read `docs/reviews/2026-09-26-tomorrow-favourite/own-read.md` (challenge it as hard as the code), and the diff `git diff origin/main..HEAD -- src` on branch `feat/tomorrow-and-favourite`.

Questions:
1. Does the hook picture always show the place Ronki really flies to next, for a day trip and for a dream trip (compare with `departTrip` in `src/context/TaskContext.tsx`)? Any state where it shows the wrong place or a broken frame?
2. The favourite: can it be lost, point at the wrong treasure, or behave badly with two devices (the compare-and-swap merge in `src/utils/mergeState.ts`) or with old saves?
3. Guardrails for a six-year-old (PRD section 6): anything in the new copy or the heart that reads as pressure, scarcity or a score?
