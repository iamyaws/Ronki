# Discovery — sharpening the core gameloop without diluting brand

**Date:** 2026-04-23
**Trigger:** Marc — *"start discovery on how we can sharpen and enrich our core-gameloop without diluting our core and brand position"*
**Tool:** superpowers:brainstorming + visual companion (port 58681 this session; mockups mirrored under `screens/`)

This document captures the live discovery flow — every visual screen pushed, every pick made, every running decision. Source-of-truth log so the eventual spec under `docs/superpowers/specs/` has clear lineage.

## Brand guardrails carried through every decision

- "Companion that fades by design — not retention-optimized" (`project_ronki_positioning.md`)
- No FOMO, no decay, no push notifications
- Time-to-independence > time-on-device
- Painterly / watercolor over isometric
- Parental relief is the success metric, not engagement

---

## Q1 — Where in the loop is the strain?

**Screen:** `screens/01-loop-today.html`
**Frame:** Diagram of today's loop (open → mood → routine → "gut" → Belohnung) plus six checkbox zones for soft spots: spine, Ronki's presence, reward end, enrichment sprawl, evening, week-over-week meaning, "your picture is wrong."

**Pick: F — Meaning over weeks.** Day-to-day fine, week-over-week and month-over-month feel undercooked, the kid's "story" doesn't visibly accumulate.

**Implication:** the time-axis above "day" is empty. The day-spine is intact. We're not redesigning the spine, we're building the layer above it.

---

## Q2 — At what horizon should meaning live?

**Screen:** `screens/02-horizon.html`
**Frame:** Five horizons — Week (Sunday recap) / Month (chapter close) / Season (quarterly arc) / Journey (Wave 3 fade-out) / ∞ (build the whole stack as one system).

**Pick: ∞ — the missing time-stack.** Today there's "now" and there's "ever," nothing between. Build all four horizons as a coherent system, not four parallel features.

**Implication (scope flag):** This isn't a single buildable spec. The discovery output is a **structural / architecture spec** for the time-stack, with each horizon (week / month / season / journey) becoming a child sub-spec under it. Discovery → architecture spec → first child spec (probably Week) → plan → ship → repeat.

---

## Q3 — What carries meaning across the time-stack?

**Screen:** `screens/03-primitive.html`
**Frame:** Three architectural primitives — **Buch** (the journal IS the time-stack — keepsake form) / **Ronki** (the companion IS the time-stack — relational form) / **Lagerfeuer** (the scene IS the time-stack — ambient form).

**Pick: Ronki — the companion IS the time-stack.**

**Implication:** Ronki is the spine. Buch + Lagerfeuer + voice become Ronki's channels. The fade-out arc gets a natural shape (Ronki authors the farewell). The keepsake gets a natural narrator. The ambient world becomes "where Ronki is sitting when he tells you." Coherent universe, not parallel features.

---

## Q4 — How does Ronki carry time?

**Screen:** `screens/04-vignettes.html`
**Frame:** Four shapes for the WEEKLY tier (the cheapest/closest one, sets the pattern that month/season/journey will inherit):

| Choice | Cadence | Initiation | Surface | Shape |
|---|---|---|---|---|
| A — "Sonntag bei Ronki" | fixed (Sunday) | Ronki invites | opens Buch | most ritual |
| B — "Die Woche brennt im Feuer" | continuous | kid discovers | Lagerfeuer | most world |
| C — "Ronki-Erinnerung" | floating (1-2× / week) | Ronki + on-demand pull | Lagerfeuer quip → mini reflection | most relational |
| D — "Stille Buchseite" | fixed (Sunday night) | none — purely discovered | Buch (silent) | most quiet |

**Pick: B + C fusion.** The Lagerfeuer scene accumulates a persistent artefact (B's "world remembers"); Ronki narrates each addition (C's "relational voice"). One mechanic, two halves — the place holds the memory, the companion tells the story.

**Implication:** the artefact must scale gracefully across week → month → season → journey, AND Ronki needs voice lines that point at it without breaking the no-FOMO rule. Discrete "this stone is for Tuesday" suits kid-direct storytelling; cumulative "the forest grew" suits the fades-by-design arc. Q5 picks the artefact form, which decides which axis we inherit.

---

## Q5 — What's the persistent artefact at the Lagerfeuer?

**Screen:** `screens/05-artefact.html`
**Frame:** Four forms for the thing that visibly accumulates around the fire:

| Choice | Form | Vibe | Scaling axis |
|---|---|---|---|
| Steine | Cairn around the fire, +1 stone per week | Ancient / grounded / kid-direct | Countable |
| Pflanzen | Sapling → tree → small forest | Alive / season-aware / strongest "growing up" metaphor | Cumulative |
| Laternen | String of paper lanterns over camp | Warm / ceremonial / parental | Countable |
| Mix | Stones for week, sapling for month, scenery for season | Each horizon visually distinct | Both |

**The axis underneath:** countable artefacts let the kid point to "this stone is for Tuesday" — strong for storytelling. Cumulative artefacts (the forest grew) suit "fades by design" — you can't isolate one week, the whole thing just got richer. Picking decides which inheritance the time-stack runs on.

**Pick: Pflanzen — the garden that grows with you.**

**Implications:**

1. **Season-awareness is free.** Plants have real-world seasonal behavior built in — spring saplings, summer growth, autumn leaves, winter bareness. The *Season* horizon of the time-stack now has natural scaffolding; we don't have to invent a visual for "it's autumn now," the world just shifts.
2. **Cumulative over countable.** The kid can't point at "this plant is for Tuesday" — the whole garden just got richer. This is exactly the "fades by design" brand position: the significance is in the *place* you grew, not any single mark. Ronki's narration shifts from "dieser Stein ist für Dienstag" → "sieh wie deine Birke gewachsen ist seit Ostern."
3. **The Journey (Wave-3 farewell) writes itself.** "Ronki zieht weiter. Der Wald, den du gepflanzt hast, bleibt." The ending isn't dramatic — it's the kid standing in the forest they grew, without needing Ronki anymore. Maximum brand alignment with time-to-independence.
4. **Art production is the real cost.** ~5-6 base plant species × 4-5 growth stages × seasonal variants = ~100-150 assets over the full stack. Tractable with Midjourney + light hand-polish, but it's the main schedule risk for any build plan that comes out of this discovery.
5. **Rules out: "tap this stone to hear the story."** With plants, the tap-target is implicit (a plant) but the story is the *growth*, not a discrete fact. Ronki-narration needs to land on growth moments, not plant-taps. That's the next structural question.

---

## Q6 — When does a new plant appear? (the seed event)

**Frame:** Four cadence shapes for when growth enters the garden:

| Choice | Seed event | Frequency | Kid experience |
|---|---|---|---|
| A | Weekly ritual — every Sunday, Ronki plants the week's sapling. Guaranteed. | ~1/week | Predictable rhythm, parent-readable, never punishing |
| B | Milestone beat — named arcs, first fire-breath, birthdays, tool mastery. | ~1-3/month | Sparse, each plant = a story you can name |
| C | Kid chooses — Ronki offers "Willst du etwas pflanzen?", kid accepts/declines | variable | Max agency, risks under-use |
| D | Hybrid — weekly guaranteed baseline + bonus flower when kid/parent flags "das war ein besonderer Tag" | ~1/week + occasional | Rhythm + punctuation |

**Pick: A + D fusion — weekly-ritual baseline (Bäume) plus bonus-flowers (Blumen) from kid/parent-flagged special moments.**

**Implications:**

1. **Two object classes in the garden.** *Bäume* are the weekly guaranteed artefact (structural, carries the time-stack). *Blumen* are optional punctuation (relational, captures specific moments). Different visual weight so they don't compete — trees are the landscape, flowers are the highlights within it.
2. **No FOMO on either side.** Weekly tree is guaranteed regardless of routine completion; miss a quiet week → the sapling still appears Sunday, Ronki's narration softens ("Diese Woche war leise — aber das Bäumchen wächst trotzdem."). Bonus flower is optional; ignore the flag → no consequence, no missed collectible.
3. **Parent can plant too.** The "das war ein besonderer Tag" flag isn't kid-only. Opens natural space for "Oma hat heute eine Blume gesetzt für eure Geburtstagskarte" later — aligns with the (separate) household / QR-sticker discovery.
4. **Trigger for Blumen is an open sub-question.** Most likely a tap somewhere (Buch page? Lagerfeuer beat? Profile button?). Deferred to an implementation sub-spec — doesn't block structure.
5. **Density math.** 52 trees + ~12-24 flowers per year = ~65-75 objects. At mid-year, the garden has a small grove with occasional blooms — readable, not crowded. Forest-journey (24+ months) gets dense but at that scale it's supposed to feel like a *walked-into place*, not a legible inventory.

---

## Q7 — Do existing plants age, or stay at their planted stage?

**Frame:** Four growth rules:

| Choice | Rule | Art cost | Feel |
|---|---|---|---|
| A | Frozen snapshots — each plant stays at "sapling" forever | Low (1 stage) | Static, collection-feel |
| B | Continuous aging — every Sunday, every plant advances micro-stage | High (~10-12 sub-stages) | Alive but identities blur |
| C | Milestone-aged — plants jump stages at horizon boundaries (month / season / journey) | Medium (~4 stages) | Structural; every milestone = visible world-shift |
| D | Kid-paced — tending minigame advances plants | Medium + care state | Tamagotchi territory — brand-veto |

**Pick: C+ — milestone-aged, amplified with witness beats.**

Marc's tightening on plain C: each milestone crossing should be a *moment the kid experiences*, not a silent overnight swap. Growth is witness-able and rewarding "stronger" — i.e., the horizon-crossing is a signature scene with Ronki narration, not a background update. Cadence stays as plain C (no speed-up, no kid-triggered acceleration that would create FOMO); the *amplification* is on the moments themselves.

**Brand guardrail locked in:** "reward" here = narrative + relational (Ronki runs to the plant, tells the story, maybe spawns a Buch page) — **NOT numerical** (no +50 Sterne, no monthly milestone badge, no streak counter). Engagement-theater would violate the no-gamification rule.

**Implications:**

1. **Horizon crossings are now choreographed beats.** Month 1, season transitions, mid-journey — each one is a scripted micro-scene where the world visibly shifts. These become Ronki's biggest voice moments across the time-stack.
2. **The time-stack structure becomes visible.** Week = new sapling (A+D event). Month = first-of-month saplings become young trees (C+ event). Season = young trees gain seasonal foliage (C+ event). Journey = scenery matures into a settled place (C+ event). Each horizon has its own visual grammar AND its own witnessed moment.
3. **Art is tractable.** ~4 discrete stages per plant × 5-6 species + seasonal variants ≈ 60-80 assets. Manageable with Midjourney + light hand-polish. Witness-beat choreography is code-driven, not asset-driven.
4. **No FOMO inheritance.** Horizon crossings fire on calendar, not routine. Miss a week → the monthly crossing still happens. The witness beat may soften narratively ("Diese Monate waren leise, aber dein Birke ist trotzdem gewachsen") but it still lands.
5. **Opens Q8:** what does a witness beat actually look like? The choreography of the signature moment is next.

---

## Q8 — What does a witness beat look like?

**Frame:** Four choreographies for a horizon-crossing moment:

| Choice | Shape | Duration | Feel |
|---|---|---|---|
| A | Silent overnight + morning reveal — plant is already grown when kid opens app, Ronki beside it with one line | 5-8s | Quietest, most "fades by design" |
| B | Live growth cutscene — 15-20s scripted beat with camera pan, wind, sparkles, 2-3 Ronki lines | 15-20s | Most cinematic; risks "app performing at me" |
| C | Kid-triggered reveal — glow on a plant, kid taps, growth animation + narration fire | 8-12s on tap | Max agency but lacks invitation layer |
| D | Ronki invites, kid walks over — Ronki has "come here" pose + voice line, kid taps Ronki, camera moves to plant, reveal plays | 10-15s kid-paced | Relational framing; two-step preserves anticipation without FOMO |

**Pick: D — Ronki invites, kid walks over.**

**Implications:**

1. **Invitation ≠ notification.** The yellow marker on Ronki isn't "you have 1 unread" — it's "Ronki has something to share." The framing is relational, not attention-economic. No badge count, no red dot, no "3 days streak" in the invite.
2. **Kid paces the beat.** Invite can sit unanswered for hours or days. No timer, no FOMO, no "hurry before it expires." The world waits. This is the single biggest brand-alignment choice in the whole time-stack — Ronki's patience is the mechanic.
3. **Two-step structure scales across horizons.** Week crossings don't get an invite (too frequent — becomes noise). Monthly / seasonal / journey crossings each use the same invite + reveal shape, with increasing scale of what Ronki shows (monthly = one plant, seasonal = whole-garden shift, journey = camp itself transforms).
4. **Ronki's voice architecture firms up.** Four voice-line tiers emerge: daily quips (ambient, ~1-2/week) / weekly planting (on Sunday, ~1/week) / monthly witness (~1/month, bigger deal) / seasonal + journey witness (rare, biggest deal). Each tier has its own register — quipper → gardener → storyteller → elder.
5. **Buch integration hook.** The witness beat is the natural spawn event for a Buch page ("Am 12. Mai ist dein Birke zum Bäumchen geworden. Ronki hat den ganzen Morgen daneben gesessen."). Buch becomes the archive of witnessed beats — the kid can re-read them later without triggering Ronki again. The invite happens once; the page persists.
6. **Opens Q9:** where does the garden live visually? The choreography assumes Ronki + garden share a scene — but which surface?

---

## Pivot — the multi-room Zuhause is over-architected (2026-04-23, late)

Marc's `Ronki Laden Polish v1.html` (the "Zuhause-Konzept") surfaces a scene-as-place pattern we can re-use for the garden. My first read was to extend it into a full multi-room Zuhause (Höhle + Küche + Garten + Dach) with the garden as one room. Marc pushed back: *"do we really need a multi-room system or is that just adding complexity for no reason?"*

**Decision: collapse back to ONE new place — the garden. No Zuhause-Räume system.**

The garden absorbs four ingredients, each driven by different forces:

| Ingredient | Driver | Pattern |
|---|---|---|
| **Growth** | time + system | Q7 C+ still holds — plants mature at horizon boundaries |
| **Gardening** | **kid** | Kid picks species + spot + places seed. Ronki *offers* ("Was pflanzt du diese Woche?") but does NOT plant *for* the kid. Revises Q6: actor = kid, not Ronki. |
| **Patience** | time | Plant doesn't grow fast. Check-ins over days/weeks. Ronki occasionally narrates. |
| **Make it yours** | **kid** | Small decor palette (stones, fences, lanterns, paths, bench) placed + rearranged freely. |

**Hard rule: no cozy meter, no completion score, no fill %, no "X/Y placed." The kid decides what's awesome.** Nothing in the UI ever implies "your garden isn't done yet."

**Ripple into prior picks:**
- Q6 lock updated implicitly — kid is the planter (was ambiguous; is now explicit)
- Q7 unchanged — milestone-aged growth is still the rule
- Q8 unchanged — Ronki-invited witness beats still the choreography

---

## Q9/Q10 collapsed — where does the single garden live?

**Frame:** With only one new place (not a system of rooms), three surface options:

| Choice | Where | Cost | Trade-off |
|---|---|---|---|
| A | Hub backdrop — garden IS the Hub's painted scene; Hub UI overlays on top | Zero nav | Max ambient presence; shares real estate with daily cards |
| B | Garten button on Hub, enters a dedicated garden surface | Zero nav | Less ambient; have to navigate in |
| C | Replace Laden tab — Laden becomes Garten, shop moves to drawer | Zero nav (re-purposed) | Laden economy migration work |

**Pick: A — Hub backdrop.** Garden replaces the campfire-only scene. Fire stays, it's now a fire *in the garden*. Kid taps empty ground → Hub UI dismisses → garden full-screen mode → tap to return.

**Why A:**
1. Zero new nav slot; Hub density concern addressed by *enriching the backdrop* instead of *adding cards*
2. Maximum ambient visibility — seen every app open
3. Ronki + fire + garden + daily routine all share one scene — coherence beats nav gymnastics
4. Q8 witness beats have a natural stage — Ronki invites from within the same scene, camera moves to a plant in the same scene, no screen swap

**Next step: handoff to Claude Design.** Brief written at `handoffs/claude-design-garden-v1-brief.md` — four frames (default Hub / garden-mode / plant-a-seed / decor placement) plus brand guardrails so the mockup doesn't drift into cozy-meter or Tamagotchi territory.

---

## Adjacent observations (captured during discovery)

- **Onboarding art mismatch + "kid teaches Ronki" beat** (spawned 23 Apr) — onboarding currently uses old painted-style Ronki art instead of the new chibi system used post-hatch. Worth refreshing, AND adding a "Ronki just hatched, he doesn't know anything — show him what you can do" beat that establishes kid-as-expert / Ronki-as-learner from minute one. **Dovetails with the time-stack:** "Ronki remembers what you taught him at hatch" is a natural Wave-3 farewell callback — months later, Ronki references the very first skill the kid showed him. Worth keeping in mind for the journey-tier sub-spec.
- **State-sync reliability — multi-identity diagnosis** (open) — Marc reports missing progress between PC and phone (Gmail). Cloud sync DOES exist via Supabase + `storage.syncLoad` (lastDate-newer-wins). Real cause is now visible in the Supabase users table: Marc has FOUR Marc-adjacent identities (`marc.foerste@googlemail.com` / `marc.ronki@gmail.com` / `admin@ronki.de` / `ronki.admin@gmail.com`), each a separate `user_id`. Devices logged in as different identities will never see each other's progress. Fixable today by consolidating accounts. **Flagged as a precondition for the time-stack feature:** if Louis goes school-iPad → home-PC and "Ronki forgot," the whole layer reads as broken.
- **Household / family model — multi-kid on one device** (open, spec-sized) — App assumes "one user per browser install." Breaks for: two kids sharing a parent's phone (Marc's flag, 23 Apr), Oma/Opa wanting to see grandkid progress (`backlog_waves_notion_import.md` — Weekly Digest), families with N kids (`backlog_fire_tablet_support.md` + Louis Apr 2026 feedback). The right shape is a Netflix-style household: parent signs in once, app holds N child profiles, PIN-gated switching, each profile has its own Ronki + state + journey. **This is its own discovery, sibling to the time-stack** — not nested inside it. The time-stack assumes "Ronki belongs to a kid"; the household spec defines who "the kid" is and how the parent maps N kids onto one device. Recommended: defer to next discovery after time-stack ships; the two don't block each other.
  - **Reference: Antolin / Anton QR-sticker pattern** (Marc, 23 Apr) — Both school reading apps Louis uses give him a printed sticker with login credentials + QR code. Anyone (parent, co-parent, grandparent) scans, lands in the same account. **Solves three Ronki problems in one move:** (1) the multi-identity sync mess — one sticker per household means you literally can't end up with 4 accounts; (2) Oma/Opa Weekly Digest distribution — give Oma the sticker, not a link; (3) onboarding friction — no email-typing, no password-reset spiral. **Falls out as a two-tier identity model:** Household account (the sticker, where caregivers land) + Kid profile (the inside, where the lockout switching lives). **Brand fit:** physical-over-device, sticker-as-keepsake, kid-mediated agency. Implementation lean — Supabase already does magic-link tokens; QR is just a printed redeem URL. Worth treating as the canonical entry pattern when the household discovery happens.

---

(Document updated as we go.)
