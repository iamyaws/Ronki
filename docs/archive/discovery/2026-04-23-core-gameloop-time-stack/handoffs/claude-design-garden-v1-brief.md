# Brief for Claude Design — Ronki Garden v1 Mockup

**Audience:** a fresh Claude Design session with no context from the parent discovery conversation.
**Deliverable:** one HTML file, same style as Marc's existing `Ronki Laden Polish v1.html` (scene-as-place framing, side-notes column, painterly warmth), at the path
`docs/discovery/2026-04-23-core-gameloop-time-stack/screens/06-garden-hub-backdrop.html`.

---

## Context in one paragraph

Ronki is a German companion app for first-graders (primary tester: Louis, age 6). The kid has a small chibi dragon companion named Ronki. The existing Hub tab is the daily routine spine — it shows today's HEUTE card, a quest list, and a painted campfire backdrop. Today that backdrop is static decoration. We're replacing it with a **living garden that visibly accumulates the kid's weeks and months in the app** — a time-axis artefact that grows with them. Companion that fades by design, not retention-optimized. The success metric is parental relief, not engagement.

---

## The design problem in one sentence

Sketch a painted outdoor scene the kid makes their own — plants seeds, watches them grow slowly, places a few decor items freely — that lives *behind the existing Hub UI* without any rating, meter, or completion score.

---

## The mechanic in four ingredients (each independent, each matters)

| Ingredient | What | Driver |
|---|---|---|
| **Growth** | Saplings mature into trees on horizon boundaries (month / season / journey). Time does this automatically. | System |
| **Gardening** | Once a week, Ronki *offers* ("Was pflanzt du diese Woche?"). Kid picks species + spot + places the seed themselves. Ronki narrates, does not plant. | **Kid** |
| **Patience / delayed gratification** | Plants don't grow fast. Kid checks back over days/weeks. Growth is visible on check-in, not in-the-moment. | Time |
| **Make it yours** | Small decor palette (stones, fences, lanterns, paths, a bench). Kid places + rearranges freely. | **Kid** |

**Hard rule — read this twice:** no cozy meter. No completion score. No "5 von 7 Plätzen." No fill percentage. No badge-on-full. **The kid decides what's awesome.** The UI must never imply "your garden isn't done yet." The rest of this brief depends on this constraint holding.

---

## The scene

One painted outdoor place. From back to front:

- **Sky:** warm dawn / golden-hour light (existing brand aesthetic — the Lagerfeuer already lives in this palette)
- **Middle ground:** rolling painterly hills / tree line (distant, soft)
- **Foreground:** grass + soft earth ground around a small Lagerfeuer (the fire already exists in the current Hub art — keep it)
- **Planted trees:** 4–6 at various stages — a fresh sapling, a leafy young tree, a couple mid-sized. No uniformity.
- **Decor (kid-placed):** a short path of stones, one lantern on a wooden post, a tiny bench — modest, personal, *not* a finished landscape
- **Ronki chibi:** small (~60–80 px on mobile), sitting naturally somewhere — leaning on a fence, perched on a stone, looking at one of the plants. He's *in* the scene, not posed for a camera.

**Aesthetic: painterly / watercolor. NOT isometric.** Warm, kid-friendly, slightly hand-made feel. The Lagerfeuer / Morgenwald art already in the app is the register.

Imagine the time-period of this sketch is **~6 weeks in** — so the garden has some content, but is visibly early. It should read as *"a kid just started shaping this."*

---

## Four frames to sketch

### Frame 1 — Default Hub state (garden as backdrop)

- Full-screen phone mockup
- Garden fills the backdrop (all elements above)
- Existing Hub UI overlays on top: wireframe shapes for the TopBar (Sterne pill, settings icon), HEUTE card (rectangle with placeholder icon + text), quest list (3–4 rows of pill-shaped items), NavBar at bottom (5 tabs worth of icons — Hub / Aufgaben / Buch / Ronki / Laden)
- The kid's eye should still find Ronki + at least one planted tree + the fire even with the Hub UI on top
- Garden visibility ~= 40–50% of the visible pixels (enough to matter, not so much that the UI competes)

### Frame 2 — Garden mode (UI dismissed)

- Kid has tapped empty ground → Hub UI dismisses → garden full-screen
- All plants visible with their growth stages readable
- Ronki still visible in the scene
- Small discreet "×" or "zurück" control in a corner (don't over-design this — a single pill in the top corner)
- Optional overlay: faint tap-hint dots on a couple of interactive spots (empty ground patches, Ronki, an about-to-grow plant)
- The point of this frame is to show the *reveal* — when the kid taps into garden mode, the world opens up

### Frame 3 — Plant-a-seed flow

- Either: kid tapped an empty ground patch, OR it's Sunday and Ronki offered this week's planting
- A small modal or bottom sheet appears with a **seed palette**: 4–6 species as painted species cards (not stock emoji) — oak, birch, apple, pine, linden, fir (propose your own 4–6 if these feel wrong)
- Ronki has a small speech bubble somewhere: *"Was pflanzt du diese Woche?"*
- Confirm CTA: *"Hier pflanzen"*
- (If space): a second mini-panel showing the aftermath — seed-shaped dot in the ground where the kid placed it, small sparkle, Ronki's next line: *"Schöner Platz. Schauen wir in ein paar Tagen."*

### Frame 4 — Decor placement

- Kid is in decor-editing mode
- A drawer from the bottom shows a **small decor palette** — maybe 6–8 items: a round stone, a fence segment, a paper lantern, a small bench, a pebble path piece, a string of fairy lights, a wooden sign, a mushroom cluster
- Each item shows a **Sterne price** (small number, existing currency — Sterne are a core brand element, not a new mechanic)
- On tap: item follows cursor/finger, kid drops it in the scene, free placement; already-placed items can be picked up and moved
- **Do not** show a "you've placed N/M items" counter. Do not show a "cozy meter." Do not rate the arrangement. The palette is just a palette.

---

## Brand guardrails (do NOT add — these are not suggestions)

- ❌ Cozy meter / completion percentage
- ❌ "N items placed" progress counter
- ❌ Streak badges, FOMO states, urgency cues
- ❌ Red dots, unread counts, notification pips
- ❌ Community sharing, "rate your garden," social comparison
- ❌ Any mechanic that reads as "your garden is less than it could be"
- ❌ Paid / premium items (V1 has no upsell)
- ❌ Plant decay or death (plants never die if the kid skips a week — Tamagotchi mechanics are explicitly vetoed)
- ❌ Pulsing glow on every interactive element — the scene should feel calm, not attention-theatre

---

## Brand register (voice)

Gentle, patient, curious. Ronki is a companion who noticed something, not a drill sergeant. Copy reads like a friend: *"Schauen wir mal in ein paar Tagen."* Not: *"Return in 3 days to unlock your reward!"*

---

## Visual anchors

- **Reference mockup:** `Ronki Laden Polish v1.html` — same scene-as-place framing, warm palette, painted ground + interior, a small character living in the space, empty-slot-with-"+" invitation pattern
- **Ronki chibi:** already exists in the app — small dragon, golden-cream body, two tiny horns, painterly
- **Colors:** warm amber (#f59e0b / #fcd34d) + deep teal (#124346) + cream (#fff8f2) + forest green (#059669) + soft sage + warm earth. Existing Ronki design system tokens.
- **Typography:** Fredoka (headlines), Nunito (body), Plus Jakarta Sans (labels). Matches existing app.

---

## Things the sketch is welcome to propose answers to

- How the seed palette is presented visually — a basket Ronki holds? Painted species cards? Inline in the scene?
- What the "tap to plant here" affordance looks like when no modal is open — dashed outline? Soft earth patch? Nothing until the kid enters decor mode?
- How Ronki's position shifts based on what the kid is doing (idle / during planting / during decor)
- How decor feels when being dragged (does it float with a soft shadow? Show a drop-target hint?)
- Subtle time-of-day treatment — this sketch is dawn; later frames might explore noon / dusk / night
- Any micro-detail that supports "make it yours" — e.g., the kid could tilt a stone slightly after placing it?

---

## Deliverable format

One HTML file at:
`docs/discovery/2026-04-23-core-gameloop-time-stack/screens/06-garden-hub-backdrop.html`

Structure: same as the Laden v1 — a stage background on the left with a side-notes column ("Die Idee hinter v1" / "Die Elemente" change-list), and a phone-frame mockup on the right with the four frames stacked or arranged so they can be seen together.

Side-notes should explain:
- The idea behind the v1 (one sentence + one short paragraph)
- The elements (3–6 bullet points, same format as Laden v1's "Die Elemente")

Keep it readable, not overdesigned. This is a sketch to discuss from, not a final spec.

---

## One last thing

The whole garden is built on the premise that **the kid's presence is the fertilizer, not a metric**. If a frame you're sketching implies otherwise — if a glance at the UI makes you wonder how "far along" the garden is, or whether the kid is doing well — the mockup has drifted. The garden should feel like a patient place that's happy to have the kid whenever they come by.
