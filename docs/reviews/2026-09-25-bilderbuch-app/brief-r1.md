# Astra brief, round 1: Bilderbuch in the Ronki app (25 Sep 2026)

You are the outside reviewer (read-only, do not edit any file). Reply in the findings format of `C:\Users\öööö\.basic-memory\docs\two-model-review\PROTOCOL.md`, at most 1,200 words, then one verdict: HAPPY or NOT YET with the single biggest reason.

## Read first

1. `C:\Users\öööö\.basic-memory\docs\two-model-review\HOUSE-RULES.md` (writing rules apply to all copy; deck rules do not apply, this is an app).
2. The active list in `C:\Users\öööö\.basic-memory\docs\two-model-review\LESSONS.md`.
3. `HANDOFF.md` in this repo (project state, gates, decisions already made by Marc; the Bilderbuch sections record the design decisions).
4. `docs/plans/2026-09-25-bilderbuch-app-rollout.md` (the plan and the benchmark table), `docs/plans/2026-09-25-lane-brief.md` (the rules the builders worked to), `docs/design-briefs/2026-09-16-bilderbuch-design-system.md`, `docs/research/2026-09-25-animated-companion-benchmark.md`.

## Who uses this, in one line

A German first grader (age 6 to 7) opens the app on a family tablet every morning and evening to do routine tasks with a dragon; a parent sets it up once. Nobody pays; there is no store, no paywall, no ads.

## Goal of the work

Marc asked to make the new "Bilderbuch" design live in the real PWA, benchmarked against Jason Lee's process in "Watch Me Vibe Code an Animated App with Claude Fable 5.1 + Seedance 2.5" (YouTube, 18 Sep 2026): a character sheet first, generated art in one style, a Finch-style hatch onboarding, an animated character and backdrop via Seedance, a micro-animation on task completion, a real-device preview. Marc is away; he will judge the result on his phone.

## What to review

- The app diff only: `git diff design/bilderbuch...design/bilderbuch-app -- src public index.html` (the website commits underneath are already reviewed).
- The renders at 390 x 844 in `docs/reviews/2026-09-25-bilderbuch-app/renders/` (one PNG per screen, named by screen). Judge the design from the renders, the code from the diff.

## The questions

1. **Kid fit.** Would a six-year-old understand every screen without reading help? Is anything too small, too fast, too busy, or missing the one clear action per screen?
2. **Honesty and pressure.** Does anything add pressure the project bans (streaks, loss framing, a sad Ronki because a task was skipped, countdowns, anything that behaves like a paywall)?
3. **Motion safety.** Reduced motion, iOS Low Power Mode (autoplay blocked), celebrations under 1.5 s, nothing flashing more than three times a second, sound off by default.
4. **Behaviour regressions.** The lanes were told to change only the visual layer. Find any place where state, storage, analytics events, routing, timers or voice lines changed. Look hardest at `MoodChibi.jsx` (24 callers), `MeetRonki.jsx` (egg choice and hatch), `RonkisTag.jsx` (task completion), `RoomHub.jsx`, `TonightRitual.jsx`.
5. **Performance on a cheap tablet.** Animated WebP and MP4 weight per screen, how many decode at once, lazy loading.
6. **Consistency.** Any screen still showing the old dragon, old teal or cream look, Material icons on kid screens, gradients or drop shadows in UI.
7. **Benchmark.** Where does our result fall short of what the video achieved (the living character, the hatch moment), and what is the cheapest fix?

Challenge the orchestrator's choices as hard as Marc's. Known decisions you may challenge once, marked CHALLENGE: Ronki is always red-orange (the egg choice no longer changes his colour); Ronki sits on the room video as a transparent cut-out instead of being baked into it; code-drawn sticker burst instead of a LottieFiles download; the release ends at a preview, not a merge.

## Assumptions to pressure-test

For each: how likely wrong, what happens on Marc's phone or Louis's tablet, the cheapest test, the fallback.

- A1. Animated WebP with alpha plays smoothly on an older iPad and on a Fire HD tablet.
- A2. The room loop reads as alive even though Ronki himself is a separate layer.
- A3. Collapsing six colour variants to four eggs breaks nothing for existing saves (Louis's save has a variant set).
- A4. The new tokens keep every parent-facing screen (dashboard, legal pages) readable without per-screen work.
- A5. Fredoka as the UI face is readable for first graders at the kid type scale.
