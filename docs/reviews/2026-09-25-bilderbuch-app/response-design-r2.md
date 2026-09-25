# Round 2 close (25 Sep 2026)

Astra's verbatim output: `astra-design-r2.txt` (NOT YET, biggest reason R8). No round 3; what is still open goes to Marc below.

## Applied after round 2 (Astra's evidence checked, both correct)

- **R5, cheer bob.** My round 1 claim of a bounded cheer was wrong: `bb-idle-bob` runs 2.6 s, infinite. New `.bb-hop-once` in `src/index.css` (one 1.2 s bob, then still) on the routine-complete card.
- **R8, room video.** `SceneLoop` now rests (pauses on its last frame) when the scene is off screen (IntersectionObserver), after 60 s without a tap anywhere, while the tab is hidden, and while `paused` is set. Checked in the browser pane: with the pane hidden the room video stays paused and a manual `play()` works.

Conceded by Astra: **R6** (voice stays on by default, Marc's April decision). Confirmed as built: R1, R2, R4, R7.

## For Marc (escalation format)

**1. Home order (R3).**
The point: the room with Ronki fills the first screen, so the six feeling tiles start below the fold on a phone.
- Option A (as built): room first, feelings below, the day one tap away in the tab bar. Good: Ronki is the first thing a kid sees, the room reads alive. Bad: the feelings question needs a scroll on phones.
- Option B (Astra's middle): keep the room, add one small visible entry ("Wie geht's dir?") at the room's bottom edge that opens the full feelings picker. Good: discoverable without shrinking the room. Bad: one more tap to answer.
- Recommendation: B, about an hour of work. Fairly sure; a Loom of Louis using it would settle it.

**2. Celebration countdown (R5).**
The point: celebration screens hold the continue button for 4 to 5 s with a visible number, to stop accidental taps.
- Option A (as built): keep the numbered delay. Good: no accidental skips. Bad: a visible countdown can read as waiting or pressure.
- Option B (Astra's middle): keep a short guard (about 1 s) without numbers. Good: no pressure cue, still guards against mis-taps. Bad: a kid who taps fast may skip the moment.
- Recommendation: B. Sure it is better for the no-pressure rule; unsure 1 s is long enough for Louis, so test it.
