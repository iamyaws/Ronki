# Fix round 1 (26 Sep 2026, night)

Inputs: Astra's code review `astra-code-r1.txt` (FC-01 to FC-11), the Claude review workflow `review-r1-claude-verified.json` (31 findings that survived an adversarial verifier), the orchestrator's own browser read `own-read-code.md` (O1 to O4). FC-01 (BLOCKER) is already fixed in commit 9c53ffd (cloud writes wait for a successful read). Every other item is assigned to exactly one group below; a group edits only its files.

## Answers to Astra (AGREE / PARTLY / DISAGREE)

- FC-01 AGREE, fixed (9c53ffd).
- FC-02 AGREE: raise the expeditionLog cap to 500 (a few hundred bytes each; no keepsake is ever dropped in practice).
- FC-03 AGREE: legacy mission catEvo awards stop (records stay).
- FC-04 AGREE, same as GUARDRAILS-1: expire retired ambient moods on load and on a new day.
- FC-05 AGREE, PARTLY on the departure: the return beat and the night use MoodChibi with the child's stage and egg (happy, müde); the DepartureSheet keeps the cloud picture because flying is the story, but the Nest scene never shows the generic pose art.
- FC-06 AGREE, same as KIDUX-3: new voiced line `teach_fire_hold_01` (recorded, Whisper-checked).
- FC-07 AGREE, same as KIDUX-1.
- FC-08 PARTLY: the whole app keys days by the same UTC day key as `lastDate`; switching every key to local time tonight is riskier than the bug. Instead: a night trip stamps `lastTripDate` with the day of the evening it belongs to (`eveningStartFor(now)`), a new `lastTripAt` requires 8 hours between departures, and `checkNewDay` only moves forward (LOOP-4, LOOP-5).
- FC-09 AGREE.
- FC-10 AGREE.
- FC-11 PARTLY: remove em and en dashes from shipped string values in de.json and en.json (not comments, not keys).

## Group S: state, sync, time (worktree ronki-finch-b, branch finch/lane-b)

Owns: `src/context/TaskContext.tsx`, `src/hooks/useTripClock.ts`, `src/App.jsx` (AuthGate block only), `src/lib/pendingHatch.ts`, their tests, fixtures.

- SAVES-1 (BLOCKER): a stale second device must never write. useTripClock: record when the tab was hidden; on becoming visible after more than 5 minutes hidden, or when the day key moved past `state.lastDate`, `window.location.reload()` instead of ticking; the 30 s interval ticks only while visible. Test: a stale provider resuming from hidden triggers no `profile_upsert` before the reload.
- SAVES-2: in AuthGate, before `getActiveToken()` consumes `?p=`, stash a local hatch (kidIntroSeen, companionName, no onboardingDone, owner null or equal) with `savePendingHatch({ companionName, companionVariant, token })`. Test.
- SAVES-3: on `pagehide` and `visibilitychange` to hidden, flush the cloud save at once (keep the FC-01 guard, use a state ref).
- FC-02, FC-03, FC-04 / GUARDRAILS-1, FC-08 / LOOP-4 / LOOP-5, FC-09 as answered above.
- LOOP-6 / KIDUX-6: `questsForRoutine` carries done, completions and streak across the s_/v_ prefix by task kind, and today's list keeps the vacMode that built it until the next day transition.
- LOOP-7: backfill `lastTripDate` from `expedition.departedAt` for an away or waiting trip.
- KIDUX-11 (state half) and own O1: `completeOnboarding` sets `greetedDate` to today, so the first Nest open never greets with "Ich hab von dir geträumt".
- INTEGRATION-1: the public `?onboardingPreview=1` route runs only in DEV builds (it reset real saves).
- Add a TaskContext test for the FC-01 save gate (no upsert while `cloudReadOk` is false; one probe; a found row causes one reload).

## Group N: the Nest and the ritual (worktree ronki-finch-c, branch finch/lane-c)

Owns: everything in `src/components/drachennest/` (RoomHub, RoomHubBits, NowCard, TaskRow, FireBowl, DepartureSheet, AwayCard, TreasureReveal, GrowthBeat, FeelingsSheet, TreasureShelf, returnBeat.js, RonkiSpeechBubble, TonightRitual, BeiRonkiSein, RonkiAwayLoop, StepStones) and their tests.

- FC-05 as answered. FC-07 / KIDUX-1: a 700 ms tap guard on "Geschafft" that survives the switch to the next task. Test with a real rerender.
- Own O2: DepartureSheet and TreasureReveal on a sky ground, not on `scenes/morgenwald.webp` (that painting has its own Ronki holding the maple leaf); the Morgenwald painting becomes the AwayCard postcard picture.
- Own O3: while Ronki is away in the morning block, the only card is the postcard (no task card before school). Afternoon tasks from the day block on.
- Own O4: TonightRitual retells today's trip story (text and `trip_story_NN` voice) when a trip came back today; the ten old lines only on days without one.
- LOOP-1 / KIDUX-7: on day 1 the day-block no-send-off applies only when the child did no real morning task (`morning.lit - morning.bonus === 0`); a morning fire filled with real tasks still sends Ronki off after 11:00.
- LOOP-2 / KIDUX-2: TonightRitual commits `completeTonight()` (and `departTrip('night')` for a dream) when the hook is shown, not only at the end; the story moves to the hook by itself after about 15 s; KIDUX-10: the black end closes itself after about 20 s.
- LOOP-3: automatic speech and `markGreeted` only when the tab is visible and a child is present (a visible mount or a pointerdown), never for a clock-only mode change at night.
- KIDUX-5: the DepartureSheet opens after the context line has finished (about 6.7 s), so StepStones' count does not talk over it.
- KIDUX-11 (UI half): no greeting when the mode is `waiting` (the return line greets).
- KIDUX-12: in `stay` mode with a task card, the bubble says the task ask.
- KIDUX-9, KIDUX-13 (44 to 48 px hit areas for the header face and lock), GUARDRAILS-3 (TaskRow shows the day-1 bonus flames like the FireBowl, or TaskRow only in fire mode), GUARDRAILS-5 (after Traurig no second spoken question on top of the reply).

## Group O: onboarding (worktree ronki-finch-a, branch finch/lane-a)

Owns: `src/components/onboarding/*`, `src/components/drachennest/MeetRonki.jsx`, `src/components/NoProfileLanding.jsx`, `src/components/CombinedParentSetup.jsx`, `src/components/HandoffBackCard.jsx`, their tests.

- FC-06 / KIDUX-3: on the first prompt of the onboarding flame, show and speak `teach_fire_hold_01` ("Drück ganz lange auf den Knopf. Und dann lass los!") in place of the muted narrator intro; after a hold shorter than the minimum, speak it again (short cooldown). A visible demonstration (the button pulses in and out) is welcome.
- Lane A leftover: when the scan sheet opens from the egg, speak `scan_open_01`.
- KIDUX-4: the 450 ms tap guard on MeetRonki's close pills.

## Group M: navigation, language, strings (worktree ronki-finch-d, branch finch/lane-d)

Owns: `src/components/NavBar.jsx`, `src/i18n/de.json`, `src/i18n/en.json`, `src/i18n/LanguageContext.*`, `src/utils/voiceAudio.ts`, `src/hooks/useQuietAttention.ts`, their tests.

- FC-10: `?reveal=all` only in DEV builds.
- FC-11: no em or en dash in any shipped string value of de.json and en.json (rephrase with a comma, colon or full stop; keys and comments untouched).
- GUARDRAILS-4 / INTEGRATION-3: `playLocalized` falls back to the `de_` file when an `en_` file is missing, so an English device never goes silent.
- GUARDRAILS-6: the call to the missing `slowdown_01` voice in useQuietAttention stays silent safely (keep the call, the player already falls back silently; if it throws, guard it).

Not taken tonight: GUARDRAILS-2 (rewrite the wake and move asks): these are Marc's own "Ronki asks for help" lines from 24 Apr; they go to him as a question. INTEGRATION-2 (expeditionMap flag wording): fixed by the orchestrator in the flag comment.
