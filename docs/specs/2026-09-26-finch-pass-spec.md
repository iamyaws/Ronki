# Finch pass: the build spec (26 Sep 2026, night)

_Orchestrator's synthesis. **Base: `docs/reviews/2026-09-26-finch-pass/design-finch-faithful.md`.** Everything in the base holds unless this file changes it. Where the two disagree, this file wins. Inputs: the three panel designs, the three judges (kid and parent, essence and guardrails, engineering), Astra's sparring reply (`astra-spar.txt`), the feature census, the Finch teardown. Marc's go (25 Sep, late): "fully authorized to make changes to the app", "ship it to main when it's tested"._

## 0. What we are building, in five lines

1. **Egg first for everyone.** No card wall. The parent comes in after the hatch, on the same tablet, for about 45 seconds.
2. **One Nest screen.** Ronki, his fire, one big spoken task picture, a small row, his treasures. Two tabs: Nest and Ronki.
3. **One adventure a day, anchored to a routine.** A full morning fire sends Ronki out while the kid is at school; he is back at the family's evening start with a treasure and a spoken story. If the morning fire did not fill, a full evening fire sends him on a dream trip that is back at breakfast. Never two trips in one day.
4. **Growth counts adventures.** Stepping stones and a spoken count show the next look. Nothing ever shrinks.
5. **Less.** Games, Tagebuch and Laden go behind one parent "Extras" switch; the day strip, the old profile, the map screen, friend takeovers, praise toasts, tab unlocks and the victory screen go behind code switches. Nothing deleted except provably dead files.

## 1. Rulings on the disputed points

| # | Point | Ruling | Why |
|---|---|---|---|
| R1 | Kid-facing "Heute nicht" (base: lit = done + skipped) | **No kid-facing skip.** The Jetzt card has a quiet "Später" that moves the task to the end of the row; it lights nothing. Flames come only from done tasks. The parent sets the routine size (defaults 5 morning, 4 evening). | Kid judge: a six-year-old finds the skip and Ronki flies after one task, the fire stops meaning the routine. Astra's concern (the day must be able to conclude) is met by R2 and by TonightRitual never being gated. |
| R2 | Morning not finished | Ronki stays in the nest in the day block with a warm line, and the **evening fire** can still send him on a dream trip. No lazy or backdated departure, no auto-ticked task. | Kid and engineering judges: lazy departure and the auto-tick are login bonuses in disguise. The evening path keeps "one adventure a day" reachable without pressure. |
| R3 | Tomorrow's hook | Hooks never use a time word: "Als Nächstes flieg ich zum Bach." (not "Morgen"). | Essence judge: a promise about tomorrow that the kid can "break" is loss framing. |
| R4 | Day 1 | The current block's fire starts **half lit** ("Vom Pusten ist es schon halb warm"). Morning install: a normal morning, Ronki leaves when full. **Afternoon install (day block): no immediate send-off**; Ronki stays and says the evening will warm his fire. Evening install: evening fire, Gute Nacht, dream trip, treasure at breakfast. | Astra: do not send a newly met dragon away before the kid has enjoyed his company. Keeps Finch's day-1 generosity for morning and evening installs. |
| R5 | Mood check | Not in front of the first morning task. The once-a-day ask sits in the evening, right after the treasure story ("Und du? Wie war dein Tag?", writes `moodPM`). A header face button opens the six tiles any time (writes `moodAM` before 12:00, `moodPM` after). After Traurig or Besorgt Ronki offers "Magst du kurz bei mir sitzen?" and the loud card becomes Bei Ronki sitzen for that open. | Kid judge (07:05 is rushed), essence judge (pillar 1 at the calm moment), less-is-more graft. |
| R6 | Growth | `adventureCount` counts opened treasures. `catEvo` moves **only at a treasure receive**, at most one stage per receive: `catEvo = max(catEvo, min(3 + adventureCount, nextThreshold(catEvo)))`. Backfill `adventureCount = expeditionLog.length` on load, but never move `catEvo` at load. | Essence judge: Louis gets a growth beat he caused, not a jump while the app loads. |
| R7 | Storage | **`src/utils/storage.ts` is not touched.** The card-after-hatch case uses a localStorage stash `ronki_pending_hatch` (less-is-more): written before `setActiveToken` when the kid already hatched, applied after the reload only when the loaded state has `kidIntroSeen` false and no `onboardingDone`, dropped otherwise and once `onboardingDone`. | Engineering judge: the base's merge branch fails with `ensureTokenForExistingProfile` plus the sibling guard. |
| R8 | Passport | Small: Ronki big, name, "Der Freund von {Kind}", "Kann Feuer pusten. {Kind} hat es ihm gezeigt.", "{a} Abenteuer", the stepping stones, the treasure shelf (found only, no empty slots, no "x von 14"). No age sticker. | Astra: keep it to name, look and remembered things; judges: found-only shelf. |
| R9 | Extras default | Off for every save, Louis included. One dashboard toggle "Extras zeigen" brings back Tagebuch, Laden and Spielzeug with their old rules. | Marc asked to reduce; reversible in seconds. Told to Marc in the morning note. |
| R10 | Ronki's face and tasks | Ronki's warmth never depends on tasks. Remove: the hidden streak `magisch` (TaskContext ~2447-2466), the `besorgt` absence step, the "gut only when all main quests are done" rule. The scheduled bad day (random sad or tired) is **disabled** (its comfort UI is unreachable, so it is a sad dragon for no reason). | Astra CHALLENGE (companionship must not become responsibility for his wellbeing), essence judge. |
| R11 | Voice | Missing mp3s stay silent with the text on screen. The voice-file test is a warning list, not a build gate. No voiced line contains a name (`{Nick}` and `{Kind}` appear only in the bubble text; the spoken version leaves the name out or uses "du"). | Kid and engineering judges, less-is-more. |
| R12 | Games | Stay intact behind Extras (Marc's 26 Apr "add back all mini games"). Starfighter and CloudJump are not removed. | Engineering judge. |
| R13 | Telemetry transport | Client events are fixed (funnel, `quest.complete`, `mood.pick`, `ronki.evolve`, consent timing). The `TO authenticated` insert policy is a backend decision and goes to Marc. | No schema changes tonight. |
| R14 | Gate 1 date | 15 Dec 2026 (Marc, 25 Sep; PR 15 merged). Astra read the stale PRD section 12. | DISAGREE with Astra on the fact. |

## 2. Changes to the base design, section by section

### Base 2.1 (first session, no card)
- Screen 6 lines: "Ich bin {Nick}! Und wie heißt du?" (spoken: "Und wie heißt du?"), then "Jetzt brauch ich kurz Mama oder Papa. Holst du sie?" (`meet_getparent_01`). The line "Das kann ich noch nicht lesen" is cut.
- Screen 10: round 1 of the breath always ends in a spark, "Oh, ein Funke! Nochmal. Ganz lange Luft holen." Round 2 succeeds. Round 2 cannot fail either: any hold of 0.22 s or more in round 2 makes the flame (Astra: teach through success).
- Screen 12 to 14 (FirstDayIntro): keep. The start line for the day block becomes "Heute Abend machen wir zusammen mein Feuer warm. Bis dahin bin ich hier im Nest." (`fd_start_day_01`), no send-off.
- Screen 15: no mood tiles. The Nest opens on the Jetzt card.

### Base 2.2 (parent step)
- Top lines (less-is-more graft): headline "Ronki ist geschlüpft." and "Morgens und abends macht euer Kind seine Sachen mit Ronki. Dann fliegt Ronki los und kommt mit einer kleinen Geschichte zurück."
- Fields as in the base (name, routine tiles collapsed under "Ronkis Morgen und Abend anpassen" with the defaults pre-ticked, evening start chips, PIN behind "PIN festlegen", consent). The tip line stays. The quiet card link stays.
- "Später": no. The parent step is required once; it is short.

### Base 3 (Nest)
- 3.1: no mood tiles in the Jetzt slot; "Später" instead of "Heute nicht"; the Jetzt card uses the task pictures in `public/art/bilderbuch/tasks/` (wake, water, wash, plate, toothbrush, shirt, bag, move, book, pajama, nightlight, homework) with the doodle as fallback.
- 3.2 (away): the afternoon tasks show without fire, as in the base.
- 3.3 (return): after TreasureReveal, the once-a-day feelings ask (R5) if `moodPM` is null.
- 3.4 (evening): the moon pill into TonightRitual is present from the evening start at any fire level ("Schlafen gehen? Ich komm mit.", `eve_moon_01`), never earned. When the evening fire fills: "Mein Feuer ist warm. Jetzt werd ich müde." and the pill becomes the loud card.
- 3.5: return lines notice the return, never the absence (no "Ich hab auf dich gewartet" after a gap).
- The date-change reload (less-is-more graft): when the local date changes while the app is visible, rerun the day transition (or reload) before any fire or departure check.

### Base 4 (loop engine)
- 4.1 fire: `slots` = main quests of the block (never side quests), filtered by `familyConfig.routine` when present; `lit = done` (no skip); `full = lit === slots.length && slots.length > 0`; day-1 half bonus: `floor(n / 2)` flames start lit when `onboardingDate === today && adventureCount === 0`.
- 4.2: day 1 in the day block does not depart (R4). Night trip only when `lastTripDate !== today`.
- 4.3 "never finishes the morning": line `home_stay_01` becomes "Heute Abend machen wir mein Feuer zusammen warm." (no "Heute bleib ich im Nest").
- 4.3 "all tasks set aside": gone (no skip).

### Base 5 (growth)
- R6 applies. `grow_left_*` lines stay as in the base (they count adventures, which is the unit).
- Legendary stage: instead of stones, "Größer geht's nicht. Aber ich wachse trotzdem weiter. Innen drin." (`grow_top_01`).

### Base 6 (passport)
- R8 applies.

### Base 7 (cuts)
- As in the base, plus: CompanionToast, TabUnlockCelebration, the victory takeover and FriendIntroCeremony all behind switches (base already); PWAInstallSheet off for the kid; AlphaBanner without "DE ▸ EN" and "Rückmeldung"; TonightRitual gets a close doodle from mount and loses "Nochmal".
- Deletes: only `BaumPoseBeat.jsx` and `CreatureDiscoveryToast.jsx` (with its App import in the same commit). `MiniRonki.jsx` does not exist.

### Base 8 (bugs)
- As in the base, plus R10 (streak `magisch`, `besorgt`, bad day, "gut only when all done").
- No DEV-only override may ship ungated: any `?clock=` or `?stage=` handling is behind `import.meta.env.DEV`.

### Base 9 (state)
- New fields as in the base, minus `quests[].skipped`, plus nothing else. `familyConfig.routine` holds quest kinds; `familyConfig.eveningStart` a string.
- Migration: base 9.3, minus the storage branch (R7), minus moving `catEvo` at load (R6).

### Base 10 (lanes)
- Lane A adds `src/lib/pendingHatch.ts` + test (R7) and does not touch `storage.ts`.
- Lane B does not touch `storage.ts` or `storage.test.js`.
- Step 0 is done by the orchestrator (contract files listed in section 3 below).

### Base 11 (content)
- Every line is in `src/data/ronkiLines.ts` and `src/data/trips.ts` (Step 0). Lanes use ids from there and never write new kid copy inline; a lane that needs a line asks for it in its hand-back.

## 3. Step 0 contract (written by the orchestrator before the lanes)

- `src/config/features.ts`: code flags and `extrasOn(state)`.
- `src/data/ronkiLines.ts`: every kid line `{ id, text, spoken? }` plus helpers (`line(id, vars)`, `returnLineFor`, `growLeftLine`).
- `src/data/trips.ts`: the 14 trips `{ id, place, emoji, treasure, story, hook }` with voice ids.
- `src/loop/types.ts`: Block, FireState, TripKind, the new TaskContext action signatures, the `useTripClock` return shape.
- `scripts/gen-finch-voice.py`: generates every line into this repo's `public/audio/ronki/`, skips existing files.

## 4. Acceptance (what "tested" means before the merge)

- `npm test` green (existing plus new), `npm run check:names` clean, `npm run build` and `npm run build:web` green, no em-dash or en-dash in any new string.
- Browser checks at 390 x 844 on the production build against the Supabase mock: base 12.2 items 1 to 9, with R4 for the 13:00 case.
- Review: a Claude review workflow (state and migrations, guardrails and copy, regressions and the QR path, kid UX) with adversarial verification, and the Astra code review. BLOCKER and SHOULD findings fixed or answered before the merge.
- After the merge: the live app bundle hash changes and contains the new trip data.
