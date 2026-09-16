# Ronki — Path to Northstar

_Companion to `NORTHSTAR.md`. Written 25 April 2026 after Marc's commit to "Finch for 5–8-year-olds in DACH" + the audit consensus. Brutal by design. Aim: a product the kid will remember in adulthood._

---

## The bar

Two ambitions stacked:

**Bar 1: Finch-quality emotional companion.** A creature that feels alive, daily emotional check-in, self-care framed as creature-needs, no social/comparison/pressure. Finch hit 5M downloads in adult self-care with this shape; nobody's done it for kids in DACH.

**Bar 2: Childhood-memory cut.** The standard isn't "useful app" or "good MVP." The standard is *Pippi Langstrumpf, Animal Crossing, Tonies* — products kids who used them in 2026 still talk warmly about in 2046. Specific named places. Recurring melodies. Rituals that become "ours." Permission to be weird. Bittersweet moments. Real cultural rooting.

Bar 2 is where most kid-app product plans collapse. We're going to refuse to.

---

## What we have (vs. the bar)

### Strong, on-bar
- `BeiRonkiSein.jsx` — voice quality, idle warmth, "Ich hab vergessen was ich erzählen wollte" — *this is the bar*
- Chibi system (`MoodChibi`, `ChibiFriend`) — coherent visual language
- Painterly cave (`RoomHub.jsx`) — kid-loved, now personalisable (`64a7b4a`)
- Expedition trail map (`1c33e9e`) — the only "today is different" mechanic
- HEUTE companionship copy (`8fff01c`) — Ronki's day, not productivity
- Voice infrastructure (ElevenLabs pipeline, Harry voice for Ronki)
- Hub-as-Campfire reframe — companionship-first surface

### Weak vs. the bar
- **Voice catalogue**: voice files exist but quality is inconsistent. Marc's `backlog_ronki_voice_rerecord.md` is open. **This is the single biggest gap.**
- **Audio identity**: zero music, no recurring melodic motif, SFX is functional not signature
- **Personality depth**: 4-5 mood states, no idle quirks, no per-friend personality animations beyond signature moves
- **Story arc**: each day is a daily loop. No through-line. No "remember when Ronki…"
- **World thinness**: 1 biome (Morgenwald), 8 mementos, 1 of 5 Freunde implemented, ~22 creatures stubbed
- **Time/season variation**: cave looks the same every day. Spring/summer/autumn/winter doesn't exist.
- **Reading-required content**: most i18n strings are functional German, only `BeiRonkiSein` stories hit the literary bar
- **Onboarding**: 8 screens of lore + abstraction before agency (UX agent flagged)
- **Sonic events**: Ronki has no signature sound. No "this is Ronki" 4-bar theme that plays on app open.

### Bloat that drags the bar down
- Funkelzeit + screen-time
- Hub.jsx (1477 LOC of legacy chore-tracker)
- Mission / boss / gear surfaces (~7 files)
- Forscher-Ecke MINT linear chain (5 standalone games + gating)
- Care verbs that don't drive vitals
- 8 rotating slot-machine praise strings
- KraftwortTool (sticker-of-the-day with heavy plumbing)
- `Sanctuary.jsx`, `RonkiCompendium.jsx`, `PoemQuest.jsx`, `Journal.jsx` — survivors of earlier directions, none on the companion thesis
- `StarfighterGame`, `KristallSortiererGame` (already flagged "boring" in backlog) — wrong genre entirely

---

## Brutal cuts (deeper than the audit)

The audit said 8 cuts. After landing them, a follow-on three-agent
audit on 26 April found the vitals system was already broken under the
hood — ring rendering metrics that didn't move, expedition CTA gated
on numbers that couldn't reach 100. That became Cut #9. Both NORTHSTAR
+ PATH show the consolidated 9-cut sequence; everything below is the
extended list (#10+) the bar still demands beyond the audit.

| # | Cut | Reason |
|---|---|---|
| 9 | **`Sanctuary.jsx`** | Old direction, not on companion thesis. Delete. |
| 10 | **`PoemQuest.jsx`** | Fixed-content quest line, achievement-coded, not voice-led. Delete. |
| 11 | **`Journal.jsx` (current form)** | "Journal voller Erinnerungen" copy is corporate-AI; achievements field; emoji selection. Strip to a single voice-led "tell me about today" beat OR delete. Default: delete. Replace with bedtime ritual surface (see Adds). |
| 12 | **`Achievements.jsx` + `HeldenKodex.jsx`** | Achievement framing is the productivity-app pattern we're shedding. Delete. |
| 13 | **`StarfighterGame.jsx`, `CloudJumpGame.jsx`, `KristallSortiererGame.jsx`** | Wrong genre (action/arcade/sorting). Delete entirely, not "rotate." |
| 14 | **`RonkiCompendium.jsx` (current public-facing form)** | Pokédex-style completion. Replace with a personal "Ronkis Freunde" cave-shelf inside the kid's profile — same data, no completion gates, no public showcase URL. |
| 15 | **Weather widget + clothing recs in Hub** | Nice-to-have that doesn't serve companion bond. Defer or delete. |
| 16 | **`familyConfig` Geschwister/sibling support** (untouched in current code if any) | Out of scope for Bar 1. Single-kid first. |

This takes the cuts from 8 → 16. The codebase shrinks ~30-40%.

---

## Brutal adds (the audit didn't go far enough on what's needed)

The audit said "ship more BeiRonkiSein-quality writing." That's true but vague. Here's what's actually missing for the childhood-memory bar:

### A1 — Music + sonic identity
- **A 4-bar Ronki theme** played on app-open. Composed once, used everywhere. Hummable.
- **A single Lagerfeuer ambient loop** (crackling fire + soft wind + occasional bird) that plays under the cave.
- **Per-emotion soundscapes** for the tools (Box-Atmung gets a slow-breath drone; Drei-Danke gets a gentle chime).
- **Bedtime jingle** — 4-bar lullaby. Same notes every night. The thing the kid hums to themselves.
- *Resource gap: this needs a composer or a careful library curation. ~1-2k euro budget if commissioned.*

### A2 — Voice cast (not just Ronki)
- Ronki: re-record full catalogue with a younger / softer voice than current Harry (Marc's backlog notes Harry might be too adult)
- Drachenmutter: dedicated mature feminine voice (Bella placeholder → real cast)
- Each Freund: distinct voice (7 freunde × 50-100 lines each = ~700 voice lines)
- Narrator (for stories, expedition descriptions): warm, slow, kid-pacing
- *Already specced in `docs/voice/voice-lines-audit-2026-04-19.md`. ~1 week of cast + record + edit if Marc directs the session.*

### A3 — Time-of-day shifts
The cave at 8am, noon, sunset, and night should look meaningfully different. Just lighting and mood. Cheap to implement (CSS gradient swaps based on `new Date().getHours()`), huge for "world feels alive."
- Morning: warm gold, low-angle window light
- Day: bright, neutral
- Sunset: amber+purple, long shadow
- Night: deep blue, strong lantern glow, stars in window

### A4 — Seasonal variation
The cave reflects the real-world season:
- Frühling: blossom branches in window, fresh moss patches
- Sommer: bright sun, dragonflies
- Herbst: orange leaves piling on the floor mat (already there!), rain on window
- Winter: snow at window, breath visible in cold cave, longer fire glow

Auto-detected by `Date()`. No user control. Just feels right.

### A5 — A "tonight" ritual
Bedtime check-in is missing. The morning rhythm exists; the evening doesn't. Add: a single nightly beat where Ronki "settles in," a 30-60s voiced story (rotated from BeiRonkiSein-tier writing), kid taps to dim and sleep. The lullaby plays once. The kid sleeps with Ronki's voice in their head.

This is *the* childhood-memory beat. Don't compromise on it.

### A6 — Name-binding
Ronki saying the kid's name in voice clips (or rendering it in stories). High emotional impact. Implementation: pre-record stems with name-shaped pauses, splice via Web Audio. OR ElevenLabs voice synthesis on-demand for the kid-name token.

### A7 — Specific named places + characters
- Morgenwald has 5+ named locations the kid recognises (Birken-Pfad, Pilz-Lichtung, Flussbiegung, Eulen-Eiche, Moorbach). Each shows up in expedition memento "Ein kleiner Pfad hinter den Birken" — already started.
- Each Freund has a named home, a quirk, a thing they love, a thing they fear. **Pilzhüter loves Bachsteine, fears rain on his cap.** Specificity = memorability.
- Drachenmutter has a name. (Currently just "Drachenmutter." Give her a name. "Tante Mira"? "Großmutter Fern"? Marc decides.)

### A8 — Bittersweet moments
Currently Ronki is unconditionally happy/cuddly. Add:
- A day when Ronki is melancholy because "der Sommer geht zu Ende"
- An expedition where Ronki returns with empty hands and a quiet line
- A moment when Ronki misses the kid (after multi-day absence)
This is what makes attachment form.

### A9 — Year-wraparound moment
Marc's `backlog_waves_notion_import.md` has "Jahresalbum-Fortschritt." Ship it. After 365 days of Ronki, the app produces a printable year-album with the mementos, the moods, the photos of Ronki across the seasons. Parent prints it. Kid keeps it. This is where the memory crystallises.

---

## Deeper cuts to the surface graph

After the cuts, the kid-facing app should have **exactly this navigation:**

```
Cave (RoomHub)             ← daily home
├── Care moment (sit)      ← the "ein Moment mit Ronki" presence beat
├── Mood log
├── Emotional tools
│   ├── Box-Atmung
│   ├── Drei-Danke
│   ├── (replacement for Kraftwort)
│   ├── Gedanken-Wolken (new)
│   └── Stein-und-Gummi (new)
├── Ronki's Freunde (passive collection, no completion)
├── Cave personalisation (already shipped)
└── Expedition / Naturtagebuch
    ├── Trail map
    └── Mementos shelf

Tonight (NEW — bedtime surface)
├── Lullaby
├── Settle-in story
└── Light-out tap

Routine list (TaskList)    ← unchanged but reframed as Ronki's day
└── (no rewards screen; HP buys real-life Belohnungen via parent dashboard)

Parental Dashboard
├── PIN gate
├── Routine setup
├── Pre-load family rewards (single currency: Sterne/HP)
├── See what Louis logged this week (mood patterns, quiet)
└── Voice / language / mode settings
```

That's it. Five surfaces total: Cave, Tonight, Routine, Parent. (Compared to current ~20 surfaces.)

---

## 12-week sequence

### Weeks 1–2: Cuts + Telemetry (the no-brainers)
- Praise strings cleanup + voice violations (`task.status.complete.0-7`, `journal.affirmation.*`, `mission.em*.story`, `ronki.stubNote` em-dash)
- Telemetry: `expedition.start/return/memento.received`, `tool.open/complete`, `companion.sit`, `companion.tap`
- Care verbs → presence beats (Marc chose option C)
- Hub.jsx → RoomHub hard-route (`view==='hub'` always renders RoomHub)
- Delete legacy Hub.jsx + mission/boss/gear surfaces (cuts 1, 2, 3, 9, 10, 11, 12, 13, 14, 15)
- Funkelzeit deletion (Cut 1 — biggest single commit)
- Forscher-Ecke → if any minigames survive, fold under "Spielzeug bei Ronki" no-gating (Cut 4)

**End-of-phase state:** codebase ~30% smaller, only the companion-pillar surfaces remain, telemetry visible.

### Weeks 3–4: Voice quality bar
- Audition voices (Ronki re-cast, Drachenmutter, Narrator) — Marc directs
- Re-record full Ronki catalogue with new voice
- Record narrator stems for expedition descriptions
- Test with Louis: does Ronki's voice make him lean in?

**End-of-phase state:** voice no longer placeholder, kid-tested.

### Weeks 5–6: Onboarding + emotional tool replacement
- Ship Phase 1 of `docs/superpowers/specs/2026-04-23-onboarding-refresh-and-teach-beat-design.md` (60s meet-Ronki, eggs first, no lore preamble)
- Replace KraftwortTool with a tactile companion beat (spec session needed)
- Ship Gedanken-Wolken or Stein-und-Gummi (whichever is design-readier)

**End-of-phase state:** new kid arrives → 60s warmth → next day routine offer.

### Weeks 7–8: Audio identity + companion depth
- Compose / curate the 4-bar Ronki theme + bedtime lullaby + Lagerfeuer ambient
- Wire app-open theme + bedtime lullaby
- Ship Tonight surface (bedtime ritual, A5)
- Idle quirks: Ronki sneezes, scratches an ear, looks at the window — every 30-60s when kid isn't interacting

**End-of-phase state:** the app sounds like Ronki, has its own evening ritual.

### Weeks 9–10: Time/season + content depth
- Time-of-day cave shifts (A3) — 4 lighting variants
- Seasonal cave variation (A4) — 4 seasons via Date()
- Memento pool 8 → 30 with seasonal/weather variation
- Name-binding: Ronki uses the kid's name in 5-10 key moments (A6)
- Specific named locations in Morgenwald (A7) — 5 places, each with distinct memento set

**End-of-phase state:** the world feels alive. Kid notices something different week-over-week.

### Weeks 11–12: Closed beta + polish
- Recruit 30 DACH families through the Wissenschaft/Ratgeber audience
- Ship a 60-day soft beta build
- Measure: D7 retention, time-on-emotional-surfaces vs. routine-surfaces, voice-on rate, parent NPS at week 4
- Decide pricing and Wave 2 (site rewrite)

**End-of-phase state:** validated companion product with real DACH families. Year-album feature (A9) specced for v1.5.

---

## Non-engineering gaps

These cost money and outside expertise. Plan budget + sourcing now.

| Gap | Estimate | Owner |
|---|---|---|
| **Music composition** (theme + lullaby + Lagerfeuer ambient + tool soundscapes) | 1.5–2.5k EUR for original work, or carefully sourced from royalty-free with custom theme on top | Marc — sourcing |
| **Voice cast** (Ronki re-cast, Drachenmutter, Narrator, 7 Freunde) | ~600-1200 EUR if ElevenLabs Studio mode + Marc directs; meaningfully more for human VAs | Marc — voice direction |
| **Beta recruitment** (30 DACH families) | Time, not money. Wissenschaft article CTA + Ratgeber list | Marc |
| **Composer or music director** | TBD | Marc |
| **One-pager illustrator** for the Jahresalbum print template | ~500 EUR or use existing chibi system | TBD |
| **DACH parent panel for usability research** | ~500 EUR if compensated | Optional, after beta |

---

## What we are NOT doing

To stay sharp:
- Not building multi-room (kitchen + garden) — defer until cave-personalisation telemetry says kids ask for it
- Not redesigning the marketing site — Wave 2, after the app is sharp
- Not adding Geschwister/sibling support — single-kid first
- Not implementing Friend Visit beyond demo seeds — the social is a v1.5 wave
- Not adding new biomes beyond Morgenwald — depth in one biome before breadth
- Not shipping the public Compendium — fold into private "Ronkis Freunde"
- Not adding new MINT games or arcade-style games — wrong genre
- Not chasing Pocket Camp's craft loops — different game
- Not making Ronki adopt-a-pet — single Ronki, kid keeps it forever (the relationship arc)

---

## The hard call (restated)

The audit found three reviewers converged on cutting the productivity-app skin. The northstar locked the direction. This path doc says: even after all the cuts, **the work that gets us to the childhood-memory bar is content + voice + audio depth, not more mechanics.**

The temptation will be to keep adding gameplay because gameplay is what engineers can ship. The discipline is to recognise that what makes a kid remember Ronki at 26 is the moment Ronki's lullaby played the night before their tonsil surgery, not a clever mechanic.

Ship less. Make what ships precious.

---

_Last revised: 26 April 2026 (Cut #9 — vitals system removal)._
