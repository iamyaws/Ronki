# Lane brief: screen agents B, C, D (25 Sep 2026)

Shared rules for the three screen lanes of the Bilderbuch app rollout. Plan: `docs/plans/2026-09-25-bilderbuch-app-rollout.md`. Screen-by-screen treatment: `docs/specs/2026-09-25-bilderbuch-app-surface-map.md` (written by agent A, who built the foundation). Design system: `docs/design-briefs/2026-09-16-bilderbuch-design-system.md`. Animation research and guardrails: `docs/research/2026-09-25-animated-companion-benchmark.md`.

## Ownership

| Lane | Files you own (edit only these) |
|---|---|
| B: onboarding, hatch, expedition return | `src/components/NoProfileLanding.jsx`, `CombinedParentSetup.jsx`, `HandoffBackCard.jsx`, `drachennest/MeetRonki.jsx`, `onboarding/TeachFireStep.jsx`, `onboarding/TeachBreathBeat.jsx`, `drachennest/Expedition.jsx`, `drachennest/RonkiAwayLoop.jsx`, `CampfireScene.jsx` (only the `SideRonki` swap), delete `MiniRonki.jsx`, plus the tests next to these files |
| C: home, the day, rewards | `src/components/drachennest/RoomHub.jsx`, `drachennest/RonkiSpeechBubble.jsx`, `drachennest/BeiRonkiSein.jsx`, `drachennest/RonkisTag.jsx`, `PinnedRonki.jsx`, `TopBar.jsx` (the old one), `Belohnungsbank.jsx`, plus the tests next to these files |
| D: evening, book, profile, diary | `src/components/drachennest/TonightRitual.jsx`, `Buch.jsx`, `RonkiProfile.jsx`, `Journal.jsx`, plus the tests next to these files |

Everything else is read-only for you, in particular `src/components/bilderbuch/*`, `src/index.css`, `src/App.jsx`, `src/components/MoodChibi.jsx`, `NavBar.jsx`, `Celebration.jsx`, `public/`, `website/`, `supabase/`. If you need a primitive to do something it cannot, build a small local helper inside one of your own files and say so in your report. Small private sub-components you create for your screens go in the same file or in a new file next to it named after your screen.

## Art you can use (all in `public/art/bilderbuch/`, reference as `/art/bilderbuch/...`)

- `ronki/`: calm, happy, sleepy, heavy, worried, proud, baby, grown, legendary, wave, cheer, cloud, leaf, sleep (`.webp`, transparent). Prefer `MoodChibi`, `RonkiPortrait` or `RonkiArt` over raw paths.
- `eggs/`: egg-cream, egg-ember, egg-sun, egg-cobalt, egg-cracked, egg-peek (transparent).
- `scenes/` (portrait 9:16, 1080 x 1910): zuhause (empty room), zuhause-ronki, nacht, morgen, morgenwald, hatch, hatch-end.
- `loops/`: `zuhause.mp4` + `zuhause-poster.webp` (empty room, plants and sun move; put Ronki on top as a cut-out on the cushion), `nacht.mp4` + `nacht-poster.webp` (Ronki asleep, blanket breathing), `hatch.mp4` + `hatch-poster.webp` + `hatch-end.webp` (5 s one-shot: egg wobbles, cracks, Ronki peeks out; not a loop), `ronki-idle.webp` (animated, transparent, breathing and blinking, loops), `ronki-cheer.webp` (animated, transparent, one happy jump, plays once), `ronki-cloud.webp` (animated, transparent, breathing with a cloud, loops).
- All videos through `SceneLoop` (poster first, video only when it plays, never under reduced motion). A one-shot like the hatch needs `loop` off and an `onEnded` path; if `SceneLoop` cannot do that, build a tiny local one-shot player in your file with the same rules (muted, playsInline, poster, reduced motion shows the end frame, a play() rejection shows the end frame after a short CSS crack animation on the egg stills).

## Rules

1. One primary action per view, the loudest thing on its ground: cobalt pill on white or paper, sun pill on cobalt, sky or night. Never a cobalt or outlined pill on a blue ground.
2. No gradients in UI, no drop shadows, no blur. Depth is the ink outline, overlap, and at most the `.bb-lift` hard offset. Colour washes and grain live only inside the art.
3. Sun and ember are never small text on white (`text-sun-deep` is the readable sun).
4. Grounds: white by default; sky, cobalt and night only for whole moments (breathing, calming, sleeping); paper for book pages and cards.
5. Every Ronki comes from `MoodChibi`, `RonkiPortrait` or `RonkiArt`; no CSS dragons, no `art/companion/*`, `art/dragon*` or other old painterly Ronki files. Other creatures (Freunde, micropedia) may keep their old art for now.
6. Icons: `DoodleIcon`, not Material Symbols, on every screen you touch.
7. Kid copy stays as it is unless it is broken; any copy you add is first-grader German (short, concrete, imperative). No em-dashes anywhere, in copy, comments or code.
8. Motion guardrails for ages 5 to 8 (from the research memo): celebrations under 1.5 s, nothing flashes more than three times a second, everything honours `prefers-reduced-motion` (use `useReducedMotion` from the bilderbuch folder), Ronki is never sad or disappointed because a task was skipped. (Correction after Astra's design review: the app's voice is on by default by Marc's April 2026 decision, because the voice lines are the reading aid; do not change the default.)
9. Behaviour stays: state, storage, analytics events, routing, timers, voice lines, unlock rules. This is a visual layer. If a visual change needs a behaviour change, stop and report it instead.
10. Readability: body text at least the existing kid scale (16 px floor for labels), transient text visible at least 3 s.

## Checks before you report

- `npx vitest run` green (update a test only when it asserts old styling or old art paths, never behaviour).
- `npx tsc --noEmit -p tsconfig.json`: no new errors against the 23 pre-existing ones.
- Build into your own folder so the three lanes never clash: `npx vite build --outDir "<your scratch>/dist"`.
- Visual check at 390 x 844 with headless Edge through a 390 px iframe wrapper (headless Edge on this machine cannot go below 496 px wide). Agent A's rig is in `C:\Users\AF08~1\AppData\Local\Temp\claude\C--Users-------basic-memory\712503a9-6439-48f3-b0a1-b951833de1f4\scratchpad\agentA\` (`frame.html`, `shot.sh`, `slow.py`); copy it into your own scratch folder and use your own ports: lane B 5191 (helper 5194), lane C 5192 (helper 5195), lane D 5193 (helper 5196). Dev-only URL params in `App.jsx`: `reveal=all`, `devHub=1`, `meet=1`, `tonight=1`, `ronkiMood=...`, `stage=0..5`. Look at every screen you changed and fix what looks wrong. Stop your servers when done.
- Do NOT run any git command that changes the index or history (no add, commit, stash, checkout, reset). The orchestrator commits each lane.

## Report

Files changed (one line each), what you verified and how (with screenshot paths), what you could not finish, decisions the orchestrator should know, and anything a reviewer should look at first.
