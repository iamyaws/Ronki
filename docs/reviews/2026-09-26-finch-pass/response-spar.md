# Response to Astra's sparring reply (26 Sep 2026, night)

Own read written first (`own-read-spar.md`); Astra's reply in `astra-spar.txt`; the synthesis is `docs/specs/2026-09-26-finch-pass-spec.md`. Where Astra and my own read agreed independently: egg first, fewer destinations, voiced return story, the parent lock outside the Laden. Where Astra moved me: one adventure a day instead of two, the teach beat, the care-inversion wording, the parent routine that must actually drive the child's screen.

| # | Astra point | Answer | What changed |
|---|---|---|---|
| 1 | Two meeting times, one adventure a day, no overnight system | **PARTLY** | One adventure per day is the rule (lastTripDate guard). The dream trip stays, but only as the evening route to that same one adventure when the morning fire did not fill (spec R2). So there is never a second trip, and a child who only makes the evening still gets a story at breakfast. |
| 2 | The teach beat forces failure | **AGREE** | Round 1 always ends in a spark ("Oh, ein Funke!"), round 2 always succeeds (spec 2.1). |
| 3 | Parent routines must drive the child's screen | **AGREE** | `familyConfig.routine` is read by `buildDay` and the fire; the parent picks it in the setup and the dashboard (R15 default 5 plus 4). |
| 4 | Passport: name, look, one remembered thing | **PARTLY** | No age sticker, no totals of what is missing. Kept: the adventures sticker (count-up only, shown from 1), the stepping stones and the found-only shelf, because the judges and Finch's own best screen say the shelf is the pride moment (R8). |
| 5 | "Reversible switch, so low risk" is too casual for Louis | **AGREE on the risk, DISAGREE on the default** | Extras stay off for every save (Marc asked to reduce); the morning note tells Marc it is one toggle for Louis and names what Louis will miss (games, Tagebuch, Laden). |
| 6 | Gate 1 is 14 November | **DISAGREE** | Marc moved gate 1 to 15 Dec 2026 on 25 Sep (recorded in HANDOFF, PR 15 merged). Astra read the older PRD section 12. |
| 7 | Eight event names do not fix consent or transport | **AGREE** | Consent: events before a consent choice are buffered and flushed or dropped. Transport (`TO authenticated` insert policy) is a backend decision and goes to Marc (R13). |
| 8 | CHALLENGE: "my dragon needs me" turns companionship into responsibility | **AGREE** | Ronki's mood no longer follows task completion (R10): the hidden streak `magisch`, the `besorgt` step, "gut only when all done" and the random sad days are gone. Tasks warm the fire for the trip; they never decide whether Ronki is happy. |
| 9 | Move five: Ronki helps put the device down | **AGREE** | The send-off ("Jetzt geht dein Tag los") and the night scene end the session; the kid install sheet, unlock toasts and the victory screen are off. |
| 10 | Feelings reachable all day, change the answer | **AGREE** | Header face button any time; the automatic ask moves to the evening after the story (R5), with a sit-with-Ronki offer after Traurig or Besorgt. |
| 11 | Day 1 at 19:30: meet, welcome story, sleep; first outing next morning | **PARTLY** | At 19:30 the evening fire is half warm, a few bedtime tasks fill it, TonightRitual, and the dream trip brings a treasure at breakfast. That is the next-meeting promise, kept at the first breakfast. No departure right after meeting in the afternoon (R4). |
| 12 | Skipping must let the routine conclude | **PARTLY** | No kid-facing skip that lights a flame (the kid judge showed a six-year-old games it). The routine size is the parent's; "Später" reorders; TonightRitual is never gated; the evening route keeps the day's adventure reachable. |
| 13 | Highest risk: a local hatch attached to the wrong cloud identity | **AGREE** | `storage.ts` is not touched; the card-after-hatch case uses a localStorage stash applied only to an unhatched state (R7), with tests. |
| 14 | Required tests | **AGREE** | Adopted in the lane briefs (fixtures, trip clock without the map screen, idempotent receive, consent) and in the browser checks. |
| 15 | Fire as preparation, not hunger | **AGREE** | The copy never says Ronki is hungry or cold; "Oh, das wärmt!" and "Jetzt kann ich losfliegen." |
