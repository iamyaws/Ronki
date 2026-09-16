# Claude Design brief — Ronkis Tag + Ronkis Buch

_Written 26 April 2026. Companion to the earlier Meet + Tonight brief._

---

okay we are building an iteration of the old ronki PWA game and therefore we are shifting our direction a little (read-up on `docs/strategy/NORTHSTAR.md` and `docs/strategy/PATH.md`).

i want you specifically to redesign two existing items for me with 3 wireframes each for exploration on the direction. these are surfaces that already exist and are getting in the way — the productivity-app skin is mostly off elsewhere, but these two screens haven't caught up. we are aiming for a finch-style game for 6-8 y.os within the ronki design space (happy to explore above and beyond)

here are the items with a little more details

## The voice + quality bar

Read `src/components/drachennest/BeiRonkiSein.jsx` lines 31–42 (the 10 stories) and `docs/strategy/NORTHSTAR.md`. Same bar as before — soft, hedge-y, slightly stumbly, no em-dashes, no exclamation points, no "you did it!" praise. No emojis in copy unless it's *the* visual element.

The German respects German linguistics — compound words break only at morpheme boundaries. The whole product is a quiet anti-app; default toward less, not more.

## The visual world we already have

Same as the Meet + Tonight brief. Painterly cave (`RoomHub.jsx`), chibi system (`MoodChibi`, `ChibiFriend`), cave personalisation (kid-pickable wallpaper + floor), expedition trail map, voice infrastructure. The two wireframes you delivered for Meet + Tonight establish the visual language we're building on — please pull from those (the cave-shifts-to-night moment from Tonight, the tactile peel reveals from Meet's sticker-book direction). These aren't separate products; they're chapters in the same book.

## References to study

- **Lumi-Stories** — for the daily companion-voice-led page
- **Tonies** — audio + ritual; the daily rhythm a kid ties to a physical/visual cue
- **Sago Mini World** — what a kid-centred hub looks like when it isn't a chore tracker
- **Animal Crossing: Pocket Camp** — daily check-in as warmth, not productivity
- **Moleskine / Le Petit Prince family albums** — the keepsake reference for item 2
- **Tagebuch der Anne Frank illustrated edition / Pippi Langstrumpf hardback** — the German-book aesthetic reference

---

## Item 1 — Ronkis Tag (replaces TaskList / "Schriftrolle")

**Purpose.** The daily surface. The screen the kid lands on after the cave when they tap "Heute" / "Aufgaben." This is where the kid spends the *most* time, every day. If only one surface in the app feels like a checklist, it's this one — and that's the one that still does.

**The current gap.** `src/components/TaskList.jsx` is a chore-tracker checklist. Tasks are emoji + label + checkbox grouped by anchor (Morgens / Nachmittag / Abends). We've recoded the eyebrow ("Ronkis Tag") and softened the praise toasts to companion observations ("Ronki schaut zu dir."), but the *visual* still says productivity-app. The kid sees a to-do list with a dragon mascot. We need the visual to say what the copy is now saying: *you and Ronki are sharing the day.*

**Constraints.**

- The kid does ~5–10 tasks across the day (morning / evening / bedtime anchors).
- Each task currently has: label, anchor, an icon, completion state, a flavor type.
- Kid taps to mark done. That tap stays. We're not redesigning the action; we're redesigning what it *feels like* to do it.
- The surface has to scale gracefully from "1 task done, 9 to go" to "all done, Ronki has left for the expedition."
- No streak indicators, no "+1 stars" toasts, no progress percentage circles. Companionship language only.
- The morning anchor is special — when it hits 100%, Ronki leaves for the Morgenwald expedition. That moment should feel *narrative*, not metric.

**Must-have beats.**

- Each task reads as a *moment Ronki shares with the kid*, not a chore the kid completes.
- The surface knows what time of day it is (the cave already tints by hour — pull that through here).
- All-done state has a clear "Ronki has gone on his Reise" narrative beat (links to the Expedition surface).
- The kid can see what's left of today *and* what they've already shared — no "checked off" graveyards, but a sense of the day's shape.

**Three wireframe directions to explore.**

**A — Story-of-the-day strip.** Vertical scroll through Ronki's morning → afternoon → evening as illustrated scenes. Each scene is a small painterly moment ("Ronki schaut zu, während du Zähne putzt"). The task is *embedded in the scene* — tapping the scene = doing it together. Done scenes stay illustrated but slightly muted; future scenes are softer / hinted. The kid is reading a comic of their day with Ronki.

**B — Cave-as-clock.** The cave (which the kid already knows) becomes the surface. Ronki sits at center; around him, the cave shows little objects/positions for each task — toothbrush by the back wall, a glass of water on the shelf, a book by the cushion. Kid taps the object → does the task with Ronki right there. Time-of-day shifts (already specced) make morning items glow gold, evening items dimmer. Same cave we have — extended into a daily-rhythm surface.

**C — Morgen-Mittag-Abend triptych.** Three horizontal panels (or three pages with swipe), each is a single illustrated scene of Ronki at that part of the day: morning at the campfire, afternoon by the window watching weather, evening curled by the lantern. The kid swipes through the day. Tasks for that anchor live inside that anchor's panel. The all-anchors-done state has Ronki taking off into the Morgenwald — which the kid can follow into the existing Expedition surface.

For each direction, please show: 4–6 frames covering empty/start state, mid-day "some done, some to go", anchor-complete (morning all done → expedition departs), and full-day complete. Notes on motion (does the scene wake up when the kid lands? does Ronki react to a tap?), how the time-of-day tint plays in, and a sample voiced line from Ronki when a task lands.

---

## Item 2 — Ronkis Buch (replaces Buch + Journal + Naturtagebuch)

**Purpose.** The keepsake. The persistent surface that holds *what Ronki and the kid have shared.* Today this is fragmented across three components; we want one. The bar is *a kid keeps this when she's grown up* — print-quality enough that a parent could one day press a button and have it bound as a real book.

**The current gap.** Three overlapping surfaces:

- `Buch.jsx` — a storybook-style chapter view, partially built
- `Journal.jsx` — the kid's reflections (mood, gratitude, achievements). Voice on these strings is corporate-AI-tone (we've started fixing this).
- `Naturtagebuch` (inside `Expedition.jsx`) — the mementos shelf with the recent pages list

None of these feel like *Ronki and Louis's shared book*. The Journal especially feels like a productivity worksheet. The Naturtagebuch is the closest to right but lives buried inside a different surface.

**Constraints.**

- Single surface. One nav target. "Buch" or "Ronkis Buch."
- Holds at minimum: expedition mementos (already a real data source), kid's mood log entries (already real data), creatures discovered (already real), photos/drawings the kid colors (RonkiAusmalbild output, already real), milestones (egg hatched, evolved, met first friend).
- Reads chronologically — the kid can scroll back through their year with Ronki.
- No completion gates, no Pokédex framing, no progress percentage. The kid never sees "23 of 60 friends" or "22% Buch complete." It's a *record*, not a quest.
- No streaks. No achievement badges in the Buch. The Buch shows what *happened*, not what was *won*.
- Kid-readable but parent-loved. The bar is "a parent picks up the phone, opens the Buch, and is moved." That's the keepsake test.
- Print-shaped: spreads / pages / chapters that make sense as printed form, even if we're not building the print pipeline yet.

**Must-have beats.**

- A clear visual unit (chapter, spread, or page) that organizes time.
- Mementos visible as *objects* — not as inventory tiles, but as things found and kept.
- Mood log entries integrated into the chronological flow without feeling like form-fields.
- Discovered friends shown as portraits with the day they were met.
- Voice — Ronki narrates moments, not the kid.
- One discoverable secret: a flip-page that reveals "what Ronki remembers about this week" in his voice. Soft, optional, not gated.

**Three wireframe directions to explore.**

**A — Seasonal chapters.** Four chapters: Frühling / Sommer / Herbst / Winter. The kid arrives in the chapter that matches today's season. Each chapter is a multi-page spread holding everything from those months: mementos as illustrated objects, friends met as portrait cards, a few mood entries pulled out as Ronki's quote-of-the-week, drawings as polaroid-style inserts. Earlier seasons stay accessible but visually quieter. The book physically *thickens* as the kid uses Ronki across a year.

**B — Spread-per-month.** Twelve double-page spreads, one per month. Each spread is hand-bound-album coded — corner mounts, faint paper texture, a header date in painterly script. Mementos are mounted on the page like tickets / pressed flowers. The mood log shows up as a small graph that Ronki narrates ("Diese Woche warst du oft müde. Ich war auch ein bisschen müde."). Friends met that month appear as portrait stickers along the side. Print-this-as-one-page-each is the scaffold.

**C — Continuous scroll-of-days.** A single very long vertical scroll. Each "kept day" is one cell. Empty days have soft blank space (the kid is allowed to skip days). Mementos, moods, friends met cluster around their date. The kid can pinch to zoom out and see the whole year as a tapestry. Closer to a personal map than a book — feels less like reading, more like *visiting*. The single most powerful interaction: pinch out → see your year with Ronki at a glance.

For each direction, please show: 4–6 frames covering empty/early state (week 1 with Ronki), filling state (a few weeks in), full state (months later, real density), and the "a parent opens this" view (what makes the parent want to print it). Notes on the secret-page mechanic, voice integration, and how mood-log entries feel different from achievement-badges (the line we're holding).

---

## Deliverable expectations

Same as the Meet + Tonight brief. 3 wireframes per item (6 total). Each direction is its own visual exploration, not variants of the same idea. Sequence frames showing real states (empty / mid / full / edge cases). Kid-facing copy at BeiRonkiSein quality. Notes on motion, time-of-day, and voice integration. Reuse the chibi system as a placeholder; design the *world around it.*

## What NOT to do

Same as the Meet + Tonight brief. No badges, no streaks, no praise toasts, no progress-percent circles, no Pokédex completion framing, no productivity language, no reading-required gates, no clever announce-themselves micro-interactions. Everything should feel inevitable, not engineered.

## The bar

The single sentence to hold yourself to: *would a kid who used these surfaces at 6 still talk about them at 26?* For Item 1 (Ronkis Tag), the test is: does the kid *want* to come back tomorrow morning to see what Ronki is up to? For Item 2 (Ronkis Buch), the test is: would a parent at the kid's 18th birthday open this and cry?
