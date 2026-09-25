# Astra code review, round 2: the Finch pass fixes (26 Sep 2026, night)

Read-only, do not edit any file. Round 2 covers only the changes since your round 1 and the points we answered PARTLY or DISAGREE. Reply in the PROTOCOL findings format, at most 900 words, then HAPPY or NOT YET with the single biggest reason.

## Read

- Your round 1: `docs/reviews/2026-09-26-finch-pass/astra-code-r1.txt`.
- Our answers and the fix plan: `docs/reviews/2026-09-26-finch-pass/fix-round-1.md` (the "Answers to Astra" section). A parallel Claude review found more (`review-r1-claude-verified.json`), including a second BLOCKER you did not flag: a stale second device (a parent phone in a background tab) ran the day transition on wake and overwrote newer cloud progress.
- The diff: `git diff 57bca8c..HEAD -- src` on branch `finch/loop-and-onboarding` (57bca8c is the state you reviewed).

## The questions

1. **FC-01 and SAVES-1.** Is any path left where this device writes a stale or foreign state to the card: failed first read (`cloudReadOk` gate plus one probe, `src/utils/storage.ts`, the save effect in `src/context/TaskContext.tsx`), the `?p=` link after a local hatch (`stashLocalHatchForShareLink`, `src/App.jsx` AuthGate), a stale tab on wake or after a sleep without a visibility event (`src/hooks/useTripClock.ts`, `storage.freezeWrites`), the pagehide flush?
2. **FC-08 PARTLY.** We kept the app-wide UTC day key and added: a dream trip stamps the day of its evening and counts its 8 hour gap from the evening start; `tripAllowed` (`src/loop/tripRules.ts`) is the one rule for the engine, the Nest and the ritual. Is this safe enough to ship, and what is the worst case a Berlin family can still hit?
3. **FC-05 PARTLY, FC-06, FC-07, FC-11 PARTLY.** Check the fixes: stage and egg art on the return and at night, the spoken hold instruction and its replay on a short tap, the tap guard across the task change, the dashes in shipped strings.
4. **New behaviour to challenge.** German by default until a parent picks English (Ronki's new lines exist only in German); the Nest speaks automatic lines only when a child is present (LOOP-3); the ritual commits the dream trip when the hook is shown and closes itself after about 20 s.
