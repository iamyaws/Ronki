# Bilderbuch in the app: rollout plan (25 Sep 2026)

_Marc's ask, 25 Sep 2026: reassess Ronki, benchmark it against Jason Lee's process in "Watch Me Vibe Code an Animated App with Claude Fable 5.1 + Seedance 2.5" (YouTube, 18 Sep 2026), make the new Bilderbuch design live in the actual PWA, plan it fully and get it done while he is away. Later the same hour: spawn subagents where useful, use the Higgsfield MCP as in the video, Fable or Opus at high effort for subagents, do fresh research._

Working copy: `C:\Users\öööö\ronki-bilderbuch-app` (standalone clone of the main repo), branch `design/bilderbuch-app`, based on `design/bilderbuch` (the website redesign, 21 commits, not merged). One Bilderbuch release: website and app together, so no page ever shows two different dragons.

## 1. Reassessment in one screen

- **Product:** v1 PWA is live on app.ronki.de since the 16 Sep revival (backend back, day-transition bug fixed). Louis is still the only daily user. Gate 1 (pull) is checked on 14 Nov 2026, Gate 2 (reach) on 15 Mar 2027. Nothing in this plan touches the funnel, storage or the gates.
- **Design:** Bilderbuch is decided (white ground, cobalt, ember Ronki, sun, Fredoka, same look in app and website). The website is rebuilt on a branch. The app still runs "Mystic Meadow" (teal, mustard, cream, painterly) and draws Ronki in CSS (`MoodChibi`, 24 components use it).
- **The one blocker the brief named:** art. "Switch the website live only once the new character art exists, and the app after that." The character sheets Marc made in ChatGPT on 16 Sep were shared in chat and never saved to disk; only boards 01 to 08 exist (`~/.codex/generated_images/01a09c1d...`). This run generates the art set with Higgsfield, the way the video does.

## 2. Benchmark: the video's process against ours

| Step | Video (Chewy, a Finch clone) | Ronki before today | Ronki in this run |
|---|---|---|---|
| Character reference | One Pinterest image | Boards 01 to 08, no saved character sheet | Crop Ronki from the boards, generate a clean character sheet first, reference it in every prompt |
| Benchmark context | Screen recording of Finch plus App Store link and reviews | Finch studied in July for the v2 PRD | Fresh research agent: Finch 2026, animation tech for PWAs, Seedance loops, kids' apps |
| Plan before build | "Break down features and screens, plan before building" | PRD, image list | This file |
| Assets | Higgsfield MCP: isolated character, matching backdrop, palette from the character | None generated yet | Higgsfield GPT Image 2.5: mood set, stages, poses, eggs, four scenes, app icon; transparent cut-outs |
| Mockup | Claude Design phone frame on localhost | Website specimen HTML | The real app at 390 px in the browser pane, not a mockup |
| Onboarding | Finch flow: hatch or log in, pick egg colour, tap to crack, name, questions, paywall | Parent setup, MeetRonki with CSS egg, TeachFireStep | Same hatch beat with new eggs, tap to crack, hatch clip; no paywall, no streak commitment (anti-dark-pattern rules stay) |
| Animation | Seedance 2.5: idle wiggle and blink, walking script, water and plants moving, clouds kept still | CSS keyframes on the CSS chibi | Seedance 2.5: home idle loop in his room, hatch clip, sleeping loop at night, transparent idle and cheer loops for the character; start frame equals end frame so loops do not jump |
| Micro-animations | LottieFiles confetti, recoloured | `Celebration.jsx` confetti | Code-drawn sticker burst (sun stars, cobalt ticks) in the Bilderbuch style; no download, no new dependency |
| Real device | React Native + Expo EAS on an iPhone | PWA installed from app.ronki.de | Stays a PWA (PRD decision). Vercel preview on Marc's phone before any merge |
| Feedback loop | Loom recordings with voice | Screenshots in chat | Marc records a walk-through on the preview; fixes go in as one pass |

Where we deliberately differ: no paywall, no streak page, no gender question, first-grader copy, reduced-motion and Low Power Mode fallbacks (a still poster whenever a video cannot autoplay), and art without baked-in text.

## 3. Scope

In: tokens, fonts, buttons, speech bubbles, tab bar and top bars for the whole app; new Ronki everywhere through `MoodChibi`; onboarding and hatch; home (RoomHub); the day (RonkisTag); evening (TonightRitual); Unser Buch; profile; celebration; app icon, manifest and theme colour.

Out (follow-ups): mini-game art, Micropedia creatures, the seven Freunde, bosses, birthday scenes, parent dashboard beyond token colours, voice lines.

## 4. Steps, agents and models

| # | Step | Who | Model | Runs |
|---|---|---|---|---|
| 1 | Research: Finch 2026, PWA animation tech, Seedance loops, kids' apps | Research agent | Opus 5.5 | Background, now |
| 2 | Art: character sheet, cut-outs, scenes, icon (GPT Image 2.5); loops (Seedance 2.5); cut-out loops as animated WebP | Orchestrator with the Higgsfield MCP | Opus 5.5 main session | Parallel with 3 |
| 3 | Foundation: tokens, fonts, primitives, tab bar, `MoodChibi` on new art, `SceneLoop`, sticker burst, surface map | Build agent A | Fable 5.1 | Now, in the clone |
| 4 | Onboarding and hatch | Build agent B | Fable 5.1 | After 2 and 3 |
| 5 | Home, the day, celebration | Build agent C | Fable 5.1 | After 2 and 3, parallel with 4 |
| 6 | Evening, Unser Buch, profile, return beat | Build agent D | Opus 5.5 | After 2 and 3, parallel with 4 and 5 |
| 7 | Independent review of the diff (bugs, reduced motion, perf, copy) | Review agent | Opus 5.5 | After 4 to 6 |
| 8 | Browser pass at 390 px, fixes, tests, build, push, PR, Vercel preview check | Orchestrator | | Last |

Agents: 6 subagents. Estimate about 1.5M subagent tokens, above the 800k default cap, on Marc's go of 25 Sep ("spawn subagents where you see fit"). Hard stop at 10 agents and 1.8M.

Higgsfield budget: 675 credits available. GPT Image 2.5 high 2k costs 2.75 credits, a 5 s Seedance 2.5 clip at 720p costs 35. Plan: about 30 images (about 110 credits with retries) and six clips (about 210). Hard cap 450 credits. Every prompt and cost goes into `docs/design-briefs/2026-09-25-higgsfield-log.md`. One variant per loop (Marc's rule from 12 Jul).

## 5. Art contract (file names the code relies on)

All under `public/art/bilderbuch/`. WebP, transparent where noted.

- `ronki/`: `calm`, `happy`, `sleepy`, `heavy`, `worried`, `proud` (mood set, transparent, square); `baby`, `grown`, `legendary` (stages); `wave`, `cheer`, `cloud`, `leaf`, `sleep` (poses).
- `eggs/`: `egg-cream`, `egg-ember`, `egg-sun`, `egg-cobalt` (transparent), `egg-cracked`, `egg-peek`.
- `scenes/`: `zuhause` (his room, empty middle), `zuhause-ronki` (poster of the loop), `nacht` (poster of the sleep loop), `morgen`, `morgenwald`, `hatch` (poster of the hatch clip). Portrait 9:16.
- `loops/`: `zuhause.mp4`, `nacht.mp4`, `hatch.mp4` (H.264, muted, no audio track), `ronki-idle.webp` and `ronki-cheer.webp` (animated WebP with alpha).
- App icons: `public/icon-192.png`, `public/icon-512.png`.

Mood mapping for `MoodChibi`: normal to calm, gut to happy, tired to sleepy, sad to heavy, besorgt to worried, magisch to proud. Stage 0 is the egg, 1 baby, 2 and 3 the mood set, 4 and 5 grown or legendary on calm days.

## 6. Ship rule

The brief says "green light from Marc before touching production", and merging to `main` deploys both the website and the app to Louis's daily tablet. So this run ends at a pushed branch, an open PR and a verified Vercel preview. Merging is one click for Marc after he has walked through the preview on his phone.

## 7. Risks

- Character drift across images. Mitigation: one character sheet, referenced in every prompt; regenerate the sheet, not the scene.
- Video autoplay blocked (iOS Low Power Mode) or reduced motion. Mitigation: poster image is always the base layer; the video only fades in once it plays.
- Weight on Fire tablets. Mitigation: 720p loops under about 1.5 MB each, lazy-loaded per screen; animated WebP cut-outs capped at 512 px.
- Old art on surfaces out of scope (Freunde, mini-games). Accepted for this release; listed as follow-ups.
