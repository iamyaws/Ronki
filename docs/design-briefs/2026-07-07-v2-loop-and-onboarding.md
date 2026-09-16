# Claude Design brief: v2 loop + onboarding

_Written 7 July 2026. Third brief in the series (after Meet + Tonight and Ronkis Tag + Buch). Source of truth for the product thinking: `docs/prd/RONKI-V2-PRD.md`. Read that first; this brief only carries what you need to sketch._

---

okay, we just wrote the v2 PRD and it changes the frame: Ronki is now routine-first. The headline is "stress-free mornings and evenings for school starters," and the emotional companion is how we deliver it, not what we lead with. The core idea you're designing around is one sentence:

**The kid's day and the dragon's day are the same day.** The kid's real morning fills Ronki's fire. A full Ronki flies off on an adventure while the kid is at school. He's home at evening-routine time with a story and a treasure. Then both go to sleep.

We borrowed the loop shape from Finch (energy → timed adventure → story payoff → count-up growth) and rejected everything loss-framed (no calendar streaks, no broken anything, no guilt). Your job: make this loop *visible and felt* on the surfaces below, and fix the onboarding so a kid meets the dragon before any wall.

I want 3 wireframe directions for items 1 and 2, and 2 directions for items 3 and 4. Explore, don't converge early.

## The voice + quality bar

Unchanged. Read `src/components/drachennest/BeiRonkiSein.jsx` lines 31–42 and `docs/strategy/NORTHSTAR.md`. Soft, hedge-y, slightly stumbly, no em-dashes, no exclamation-point praise, no "you did it!". German respects morpheme boundaries. Default toward less.

One addition from the PRD guardrails: nothing on any surface may ever display a broken, lost, or reset state. Counters only count up. If a design idea needs a "you missed X," it's dead on arrival.

## The visual world we already have

Painterly cave (`RoomHub.jsx`), chibi system (`MoodChibi` with variant + stage + mood), time-of-day tint, cave personalisation, expedition trail, QuestEater eat animation, Ronkis Tag comic strip (your direction A shipped), TonightRitual star curtain. Voice infrastructure is live: Ronki speaks on task completes, taps, and rituals. Build in this language; these are chapters of the same book.

## References to study

- **Finch**: the mechanical benchmark. Study how the bird's energy fills, how the adventure "In Progress → Completed" state reads on the home widget, how the return moment pays off. Then translate to painterly-warm; Finch's flat pastel is not our look.
- **Animal Crossing: Pocket Camp**: daily check-in as warmth; how returning feels like being expected.
- **Tonies**: the evening ritual anchor.
- **Sago Mini World**: kid-centred hub without a chore tracker in sight.
- **Wimmelbuch spreads (Rotraut Susanne Berner's Jahreszeiten books)**: for the away-state cave and the homecoming scene density.

---

## Item 1: Onboarding v2: egg first, wall later

**Purpose.** Today the first thing a new kid sees is a landing screen asking about profile cards and QR codes. The dragon is behind the wall. The PRD flips it: cold start → egg shelf within 10 seconds → hatch → name → *then* "lass uns Ronki mit Mama oder Papa verbinden" (QR scan or parent link) → first spark → into the cave.

**The current gap.** `NoProfileLanding.jsx` (auth wall first), `MeetRonki.jsx` (the hatch beat, which is good, but it demands free-text typing for the name), camera-permission denial dead-ends with browser-settings copy, and the final "Bis morgen. Versprochen." screen is an invisible full-screen button.

**Constraints.**

- Sequence: egg shelf → wobble → hatch → meet → name → connect-to-parents → first spark (TeachFireStep, keep as-is) → cave.
- Name entry becomes **six voiced name chips** (tap a chip, Ronki says the name out loud, pre-reader picks by ear) plus a small "selbst schreiben" affordance for kids who want the keyboard. Typing is never the gate.
- The connect step is kid-framed: the dragon already exists and is theirs; scanning just "tells Mama and Papa where Ronki lives." If camera permission is denied: kid-readable copy ("Die Kamera schläft noch. Hol mal Mama oder Papa.") plus a visible parent fallback (code entry / share link) on the same screen. No dead ends.
- The just-hatched dragon buffers locally until the scan succeeds. Design the edge: what does the kid see if the family profile already has a hatched dragon on it (second device)? The cloud dragon wins; make that moment feel like recognition, not replacement.
- Under 60 seconds cold-start to first win. Show where seconds are spent.

**Must-have beats.**

- The egg shelf is the first screen. No logo splash longer than a beat, no text wall, no buttons about profiles.
- The hatch stays ceremonial (it's the best moment we have) but every phase gets a visible affordance; nothing relies on invisible tap-anywhere with delayed hints.
- The "Bis morgen. Versprochen." close now has a clear weiter and plants the promise the morning return beat (item 2) will keep.

**Three wireframe directions to explore.** Own framings welcome; candidates: (A) single unbroken cinematic where the connect step is diegetic (Ronki carries the QR moment inside the world), (B) the connect step as a distinct calm "parents' minute" with an explicit hand-the-device-over visual, (C) hatch-light: shelf and hatch compressed to 20 seconds, everything else deferred to first-cave moments.

For each: 5 to 7 frames covering egg shelf, hatch, name chips, connect (including the denied-camera state), and close. Notes on timing per frame and one sample voiced line per beat.

---

## Item 2: The Feuer loop on the daily surfaces

**Purpose.** The care inversion made visible. Each completed task feeds Ronki's Feuer-Energie. The kid fills the dragon up, not their own score bar. When morning is full, Ronki lifts off for his adventure.

**The current gap.** Tasks complete with the QuestEater eat animation (keep it), but the energy goes nowhere visible. There is no meter, no destination, no build-up to the departure. And the app never notices the kid came back: the PRD's sharpest finding is that "Bis morgen. Versprochen." is a promise v1 never keeps.

**Constraints.**

- The **morning return beat** opens the day: Ronki greets the kid by name, warm, expecting them ("Du bist wieder da! Ich hab von dir geträumt."). After a few days away the line stays warm and never mentions the gap ("Da bist du ja wieder. Ich hab dir was aufgehoben."). Design where this lives: cave entry, or a beat before the cave.
- The **Feuer meter lives on Ronki**, not in a corner HUD. It's the dragon warming up, glowing, stretching his wings, whatever form you find. Explicitly not a progress bar next to a percentage. The kid should read it the way they read a friend's mood.
- Filling is per-task and immediate: task lands → QuestEater eats → the fire visibly grows. The existing eat animation becomes the delivery mechanism into the meter.
- **Departure is narrative**: morning block complete → Ronki is fully lit → he takes off. This moment already exists in spirit (RonkisTag's expedition unlock); give it the visual weight of the loop's midpoint.
- No numbers on the meter. No "3/5 Aufgaben." The fire is full or filling; the kid feels it.

**Must-have beats.**

- Return beat, per-task fire growth, full-fire state, departure. Four moments, one continuous feeling.
- The surface knows the time of day (existing tint system).
- A kid who does only half the morning still gets warmth; Ronki stays, cozy but not lit for adventure. No sad dragon, no disappointment. Show that state.

**Three wireframe directions to explore.** Candidates: (A) fire-as-body (the glow lives in Ronki's chest/belly and spreads to wingtips), (B) fire-as-hearth (the cave's campfire is the meter; Ronki and the fire wake together), (C) fire-as-sky (the cave's light itself warms from grey dawn to gold as tasks land; full gold = departure weather).

For each: 5 to 6 frames covering return beat, first task landing, mid-fill, full + departure, and the half-morning state. Notes on motion and one voiced line per beat.

---

## Item 3: Die Heimkehr: the return with story and treasure

**Purpose.** The evening payoff and the reason to come back after school. Ronki returns from his adventure with a memento *and a voiced story of what he saw* (2 to 3 sentences). The story is the new content unit of the product. The PRD grows the memento pool from 8 to 30 with seasonal, weather, and time-of-day variants.

**The current gap.** `Expedition.jsx` has the away/return states and mementos auto-place into the cave, but the return is a transaction (memento appears) rather than a moment (Ronki tells you about his day). The away-state cave is just Ronki-less.

**Constraints.**

- The **away state** should make the cave feel like someone lives there and is out: a note, his things gone, light through the window. The kid checking at 14:00 should see "he's still out" as story, not a timer bar. (A soft time hint for parents is fine; no countdown clock as the hero element.)
- The **return moment**: Ronki is back, excited in his understated way, tells the story in voice (kid taps to hear it again), and hands over the memento. The memento then settles into the cave as it does today.
- Stories are the collectible feeling without being framed as a collection to complete. No "12 von 30 Geschichten." The Buch (already designed) is where they land as a record.
- The return coincides with evening-routine time by design. Sketch how the homecoming hands off into the evening block naturally.
- Closing beat: TonightRitual now ends with **tomorrow's hook** ("Morgen zeig ich dir, was ich am Fluss gesehen hab."). One frame is enough; it's the last line of the day and the setup for item 2's return beat.

**Two wireframe directions to explore.** Candidates: (A) threshold scene (the kid finds Ronki at the cave entrance mid-arrival, story told there, then both walk in), (B) hearth scene (Ronki is already by the fire with the memento wrapped/held; the unveiling is the moment).

For each: 4 to 5 frames covering away-state, arrival/return, story beat, memento settling, hand-off into evening. Notes on voice pacing (when does the story auto-play vs. wait for a tap) and one sample story at BeiRonkiSein quality.

---

## Item 4: Abenteuertage: growth without streaks

**Purpose.** The count-up counter that never breaks. One Abenteuertag per day the kid did their routine and Ronki adventured. It feeds the existing 6-stage evolution and unlocks cave customization, never power. This replaces every calendar-streak instinct with accumulation.

**The current gap.** Evolution (`catEvo`) exists with 6 chibi stages but has almost no live feeder and no surface where the kid feels the growth arc. There is no place where "we've had 23 adventure days together" lives.

**Constraints.**

- Count-up only. The counter can never display a gap, a break, or a reset. Days the kid skips simply don't exist on this surface.
- Growth reads as *shared history*, not achievement: "unsere Abenteuertage," not "dein Streak."
- Evolution moments stay ceremonial (CelebrationQueue handles the beat); this surface is the quiet in-between where the kid sees how far the two of them have come and senses the next stage without a demanding progress bar. A hint of what's growing is fine; a checklist toward it is not.
- Think about where it lives: inside RonkiProfile, a cave object (a growth wall? tally marks Ronki scratches by the fire?), or inside the Buch. Placement is part of the exploration.

**Two wireframe directions to explore.** Candidates: (A) physical-object-in-cave (tally wall, growing plant, stone pile that Ronki adds to each adventure day), (B) shared-album page (a spread in or near the Buch where days accumulate as small illustrated stamps).

For each: 3 to 4 frames covering early (day 3), established (day 23), and the approach to an evolution threshold. Notes on how the kid discovers it (never a tutorial) and one voiced line where Ronki refers to it.

---

## Deliverable expectations

Same pipeline as the previous briefs: wireframes land in `docs/design-incoming/` (own subfolder, e.g. `v2-loop/`), HTML mockups preferred so we can preview locally, then green light before any build. 3 directions for items 1 and 2, 2 directions for items 3 and 4 (10 explorations total). Sequence frames with real states, kid-facing copy at BeiRonkiSein quality, notes on motion, time-of-day, and voice. Reuse the chibi system as placeholder; design the world around it.

## What NOT to do

Everything from the previous briefs still holds: no badges, no streaks, no praise toasts, no progress-percent circles, no completion framing, no productivity language, no reading-required gates. New for v2, straight from the PRD guardrails: no broken/reset states anywhere, no countdown-timer-as-hero for the expedition, no numbers on the Feuer meter, no "X von Y" framing on stories or mementos, and nothing that lengthens a session. Sessions should end warm and short; every surface has a natural exit beat.

## The bar

Same sentence as always: *would a kid who used these surfaces at 6 still talk about them at 26?* Per item: (1) does the kid meet the dragon before any wall and love him in under a minute? (2) does filling Ronki's fire feel like feeding a friend, not clearing a list? (3) is the homecoming the moment a kid runs to the tablet after school for? (4) does day 23 feel like a friendship, not a score?
