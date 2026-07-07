# Strategy — Drachennest reframe

**Branch**: `experiment/drachennest`
**Started**: 24 Apr 2026
**Status**: experimental, isolated from `dev` and `main`

## North star (one line)

**Ronki is the loop. Routines are the medium. Care for him → care for yourself.**

The original framing was that routines were the point and Ronki was a delivery vehicle. After watching Louis with the app for a few weeks, the order needs to flip: Ronki IS the loop, routines happen through caring for him. Marc's pivotal observation (24 Apr 2026): saying "didn't you want to take care of Ronki" lands with Louis where "do your routine in Ronki" doesn't.

This branch tries that reframe end-to-end without disturbing what's shipped.

## Design sources

Three Claude Design files inform this work, in priority order:

1. **Drachennest direction** (`ronki-alt/project/directions/d1-drachennest.jsx`). The Hub becomes Ronki's room. No bottom-nav tabs — objects in the room are the navigation. Scroll on the wall = Quests. Treasure chest = Belohnungen. Book on bed = Buch. Toybox = Spiele. Ronki sits in the center with a speech bubble. Window shows time-of-day.

2. **Begleiter Polish** (`Ronki Begleiter Polish.html`). The vital meter design: a 3-arc radial ring around Ronki — Hunger (amber `#f59e0b`), Liebe (pink `#ec4899`), Energie (emerald `#10b981`). Each arc has a Material Symbol icon badge at its midpoint. Ring replaces the dashboard-style horizontal bars. Care verbs (Füttern / Streicheln / Spielen) sit below as standing actions. Mood-line rotation, tap-Ronki heart, breathing animation, bond streak, care log. All for that "Ronki is alive, not a widget" feel.

3. **Reise direction** (`ronki-alt/project/directions/d2-reise.jsx`). The expedition map. After the kid completes morning + evening routines, Ronki leaves through the door for an adventure. Map shows villages along a winding path; Ronki walks; returns at the next routine window with loot (Kartenstücke / Zutaten). Loot feeds back into Garden / Belohnungen.

## Architecture decisions

- **Hub = Ronki's room.** Single primary surface. Bottom NavBar collapses or disappears. Karte button (lower right) is the persistent escape to the Reise expedition map.
- **Vitals system** = 3 arcs (Hunger / Liebe / Energie) around Ronki, ported from Begleiter Polish. Top up via routine quests + standing care verbs. Kid-positive only — never decay-to-death; lowest a vital can fall to is some baseline like 30% so the kid doesn't see a "starving" Ronki.
- **Quest-as-Ronki-ask.** Each task gets a Ronki voice line ("Magst du mir die Zähne putzen?"). Completion uses the existing QuestEater fly-into-Ronki + flame puff (the pattern that's already shipped and works for Louis), NOT a new drag gesture. Stars stay kid-only as their personal score; vitals are Ronki's parallel signal.
- **Vitals → quest binding**:
  - Morning routine quests → top up Hunger ("you helped me wake up / eat / drink")
  - Friend / emotional / care quests → top up Liebe ("we connected today")
  - Evening / focus / play quests → top up Energie ("we played / rested")
- **Standing care verbs** (Füttern +20 Hunger / Streicheln +15 Liebe / Spielen +25 Energie) below the vitals. Kid agency to top up Ronki between routines.
- **Aliveness signals** from Begleiter Polish — rotating mood lines (4.2s), tap-Ronki heart at click position, breathing animation, micro-reactions to care.
- **Bond streak** ("12 Tage am Stück bei Ronki") — relationship-streak, not daily-login streak. Family-aware care log ("Papa hat Ronki gestreichelt") extends loop to household.
- **Expedition loop** unlocked when morning + evening routines complete. Reise map. Ronki leaves; returns next window with loot. Kid sees "what Ronki did while you were at school."
- **Evolution** via X-of-same-task → kid badge + Ronki badge → 2-3 Ronki badges = stage advance. State.catEvo + chibi stage system (0-5) already in code; rewire triggers, don't rebuild.

## What gets retired in this branch

- Bottom NavBar tabs (Aufgaben / Ronki / Buch / Spiele) — become room objects.
- Pflege segment in Ronki profile — folds into the Hub itself.
- Mood chip on current Hub — folds into the vitals ring + speech bubble.
- Hub mosaic layout — replaced by single-surface room.

What stays:
- Garden (becomes "outside the door" or visible through the window).
- Belohnungen (becomes the chest).
- Buch / journal (becomes book on bed).
- Spiele (becomes toybox).
- Parental Dashboard (long-press TopBar → unchanged).
- Onboarding flow (unchanged for now; the reframe applies post-onboarding).
- Fire-breath progression system (unchanged; sits inside the Ronki-care loop naturally).

## Isolation

This branch is fully isolated from main / dev:

- **Storage namespace**: `herodex_drachennest` (IndexedDB) + `hdx2_drachennest` (localStorage fallback) — see `src/utils/storage.ts`. Does not collide with `hdx2` from main / dev when sharing the gh-pages.io origin.
- **Deploy**: `.github/workflows/deploy-experiment.yml` builds + serves at `https://iamyaws.github.io/Ronki/experiment/`. Independent of `/Ronki/dev/` (dev) and `app.ronki.de` (main / Vercel).
- **Worktree**: developed in a sibling folder (`../ronki/`). Both worktrees share the same `.git` so commits move cleanly between branches when needed.

## What's intentionally NOT in this branch yet

- Friend system (4-emoji code + visit other rooms + smoke-sign messages) — its own track. Backend work; not blocking the reframe validation.
- Real chibi-art swap — still uses the existing CSS chibi from MoodChibi.jsx for now.
- Reise map full implementation — first commit just stubs the Karte button to GardenMode. Map proper comes after the room itself proves out with Louis.
- Voice generation for new quest-as-Ronki-ask copy — all the same German strings get a Ronki voice line eventually, but rendering them in ElevenLabs is a separate batch (~50 lines × DE+EN).

## Build sequence (suggested)

1. **Vitals state + reducer wiring** — add `state.ronkiVitals = { hunger, liebe, energie }` to TaskContext. Each starts at 70. `careForRonki(kind)` action. Quest completion routes to the matching vital based on quest kind.
2. **VitalsRing component** — port from Begleiter Polish (`src/components/RonkiVitalsRing.jsx`). 3 arcs as SVG, icon badges at midpoints.
3. **Hub becomes the room** — repaint Hub.jsx as the Drachennest room. Ronki center, vitals ring around him, object placeholders along the walls. Object taps still link to existing pages (no tab removal yet).
4. **Care verbs below Ronki** (Füttern / Streicheln / Spielen) — three big buttons calling `careForRonki(kind)`. Reuse Begleiter Polish styling.
5. **Mood lines + tap-Ronki heart** — port directly. Speech bubble cycles; clicking Ronki spawns floating heart at click position.
6. **Hide / collapse the NavBar** — first pass: keep visible but de-emphasized so we can compare with/without. Second pass: remove entirely if validation goes well.
7. **Karte button** — bottom-right of the room. Initially routes to existing GardenMode. Reise map proper arrives later.
8. **Voice + copy pass** — quests get a Ronki voice line each. ~50 strings/lang. SCHOOL_QUESTS / VACATION_QUESTS / WEEKEND_QUESTS in `src/constants/`.

Each step ships behind the experiment URL. Louis tests progressively as Marc develops.

## Decision log

This file is the canonical record of design decisions for the experiment. When something gets locked in, add it here with a date. When something gets reversed, mark it superseded but keep the original entry — the path matters.

| Date | Decision | Notes |
|---|---|---|
| 24 Apr 2026 | Hub becomes Ronki's room (Drachennest direction) | Marc decision after reading the design files + reframing the loop |
| 24 Apr 2026 | Vitals binding: morning=Hunger / friend-care=Liebe / evening-play=Energie | Marc accepted Claude's recommendation |
| 24 Apr 2026 | Quest completion = QuestEater fly-into-Ronki + flame (existing pattern) | Marc preferred over a new drag-onto-Ronki gesture |
| 24 Apr 2026 | Vitals shape: 3-arc radial ring around Ronki, not horizontal bars | Direct port from Begleiter Polish |
| 24 Apr 2026 | Branch isolated via storage namespace + parallel deploy + worktree | Don't disturb dev / main during validation |

## Pull request criteria when this merges to main

Before this branch graduates back to main, these have to be true:

- [ ] Louis used it for at least 2 weeks and his engagement is at-or-above the current dev branch's
- [ ] Marc has reviewed the in-Hub vitals system on his own kid's phone and it didn't trigger any "this feels manipulative" instinct
- [ ] At least one parent who isn't Marc has tried it cold and the metaphor (Ronki's room) was self-explanatory
- [ ] The voice rewrite (Ronki-asks-for-help) is in for the main routine quests and reads naturally
- [ ] Storage migration plan is written: existing dev / main users moving to the new architecture get their state mapped (or fresh-start prompted) — no silent data loss

If those don't hold after the test window, the branch stays alive as a learning artifact and we iterate rather than ship.
