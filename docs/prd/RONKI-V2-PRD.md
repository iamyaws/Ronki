# Ronki v2: Product Requirements Document

_Written 7 July 2026 by Marc + Claude after a two-track research pass: a full codebase and product audit, and a competitive study of Finch, Joon, Brili, Timo, and Pok Pok. This document is self-contained. Any executor (human or AI) should be able to build from it without prior session context._

_Platform decision: v2 evolves the existing React PWA at this repo. An iOS-native rebuild stays a separate, later decision._

---

## 1. What Ronki v2 is

**Ronki ist der Drache, der Schulanfängern durch den Morgen und den Abend hilft. Ohne Stress, ohne Druck, mit einem Freund, der auf sie wartet.**

- **Primary user:** 5 to 8 year olds in DACH, entering or in their first school years. They can't read fluently. Their day just got structure they're responsible for, and mornings are where families break.
- **Secondary user:** the screen-cautious parent. They install Ronki because it feels different from the engagement-maximizing apps our own Ratgeber attacks, and it has to stay different.

**The positioning shift from v1:** v1 led with "emotional companion" (name what you feel, breathe through it). v2 leads with the concrete problem parents search for: **stress-free mornings and evenings for school starters**. The emotional warmth doesn't go away. It becomes how the product delivers, not what the headline says. A parent buys "my kid does the morning without a fight." The kid gets "my dragon needs me."

**The one-sentence loop:** the kid's real morning fills Ronki's fire, a full Ronki flies out on an adventure during school, and he's back at evening routine time with a story and a treasure. The kid's day and the dragon's day are the same day.

---

## 2. What v1 taught us

v1 proved the companion shape works: the hatch ceremony, the voiced character, the painterly cave, the bedtime ritual. Louis (n=1) responds to all of it. What v1 never built is the return engine and the measurement. The audit found five structural gaps.

### 2.1 The onboarding funnel is blind
There are zero analytics events before `ronki.hatch`. `app.open` only fires after onboarding completes, so the funnel has no top. We literally cannot see where people drop. Worse: on the QR path (the canonical path since May), parents never see the analytics opt-in at all, because it lives in the in-app parent setup they skip. Most devices send nothing.

### 2.2 Onboarding has four concrete friction points
The QR path takes roughly 7 to 8 interactions plus 15 to 20 seconds of unskippable cinematics. Within it:
1. **Camera-permission denial is a near-dead-end.** The error says "Bitte in den Browser-Einstellungen erlauben" on a kid-facing screen. The share-URL fallback exists only in code comments.
2. **Hard website dependency.** A parent who installs the PWA first has no in-app way to create a profile. If they don't find ronki.de/profil-erstellen, the landing screen is a wall.
3. **Free-text dragon naming.** The name phase in MeetRonki demands keyboard typing from a 5 to 8 year old. It's the only free-text field in the entire kid flow and the most likely mid-cinematic stall.
4. **The close phase is an invisible button.** Full-screen tap target, hint text fades in after 3 seconds. A plausible "is it frozen?" moment.

### 2.3 The return promise is never paid off
Ronki's last onboarding line is "Bis morgen. Versprochen." The app never keeps that promise. There is no morning return beat, no "you came back" moment, no re-entry ritual, nothing that notices absence or marks return. A kid who skips three days sees an identical cave. The expedition memento is the only "today is different from yesterday" mechanic, and its pool is 8 items in 1 biome (the north-star doc specs 30).

### 2.4 Daily-loop telemetry silently died
`quest.complete` only fires in the legacy TaskList component, which is no longer reachable. RonkisTag (the live daily surface) completes quests with no tracking call. `mood.pick` doesn't fire from the RoomHub check. `ronki.evolve` and `game.end` are defined but never fired. The north star's own success metric (time on routine surfaces vs. emotional surfaces, D7/D30) is currently unmeasurable.

### 2.5 The reward economy is half-demolished
`TaskContext.complete()` still accrues hp, xp, orbs, heroStats, badges, boss and gear state, but most surfaces reading them were cut in April. Evolution (`catEvo`) has almost no live feeder, so the 6-stage chibi growth barely moves. And the router still ships surfaces the PATH.md kill list says are dead: Journal, Compendium in nav, Starfighter, CloudJump, the legacy TaskList.

---

## 3. Competitive frame

### 3.1 Finch is the benchmark
Finch (adult self-care pet, ~5M downloads) reports 54% D1 and 37% D7 retention, better than top mobile games. Its loop:

| Finch mechanic | How it works | What retains |
|---|---|---|
| Egg before signup | Pick an egg, hatch, name the bird, all before any account wall | Emotional investment before any friction |
| Energy → Adventure | Tasks earn energy; full energy sends the bird on a ~6-8h timed trip | The appointment: check back when it returns |
| Adventure returns | Stones + discoveries + the bird tells you what it saw | Story payoff, not just currency |
| Growth stages | Egg → baby → toddler → child → teen → adult, measured in **adventure days** (days you engaged), never calendar time | Progress that absence can't destroy |
| Care inversion | "I feel responsible for this dang bird" is the most-quoted review line | Self-discipline reframed as caring for someone else |
| Micropets | Attach one specific goal to its own hatchable mini-creature | One stubborn habit gets its own arc |
| Forgiving absence | The bird never dies, never gets angry, "never even knows you were gone" | Users return after breaks without guilt |

Monetization: the free tier is complete. Finch Plus ($69.99/yr) sells abundance and acceleration, never access. Nothing behind the paywall is required for the care loop.

### 3.2 What the kids-app category adds
- **Joon** ($89.99/yr, chore RPG for ADHD kids): parent assigns quests, kid feeds a pet. Its warning for us: parents report novelty decay ("worked for a day and a half") when the fantasy layer is thin relative to the chore layer. **The dragon's world must stay generative or the loop collapses into a chore list.**
- **Brili** (routine timer): proves the one-task-at-a-time sequenced timer UX for exactly our use case, and proves that without a character it stays a utility parents pay for reluctantly.
- **Timo** ($14.99 lifetime): picture-reveal timers make progress visible without reading. Lifetime pricing exists in this category.
- **Pok Pok** (Apple Design Award, ~$500K/mo): the parent-trust benchmark. No rewards, no levels, no time pressure, and it still wins commercially. Our positioning sits between Finch and Pok Pok.

### 3.3 What must NOT translate
Child-design research (D4CR, 5Rights, ACM work on gamified kids apps) flags **calendar streaks as the highest-risk mechanic for this age**: loss-framed, and kids feel the loss harder than adults. Variable rewards and loot-box mechanics compare to gambling for children. Both stay out of Ronki, permanently. Section 6 turns this into testable rules.

---

## 4. The v2 gameloop

The kid's day and Ronki's day are the same day. Everything below hangs on that.

### 4.1 Morning
1. Kid opens the app. **Ronki greets them by name with a return beat**: "Du bist wieder da! Ich hab von dir geträumt." If the kid was away a few days, the line acknowledges warmly, never guilt-trips: "Da bist du ja wieder. Ich hab dir was aufgehoben."
2. Mood check (existing Stimmungs-Check, one tap, once a day).
3. RonkisTag morning block: each completed task **feeds Ronki's Feuer-Energie**, a visible flame meter on the dragon. This is the care inversion made visible: the kid fills Ronki up, not their own score bar. The QuestEater eat animation already does the per-task beat; the meter gives it a destination.

### 4.2 Midday (kid is at school)
Full morning Feuer → **Ronki flies out on his Expedition**. The trip is timed to return around evening-routine time (6 to 8 hours, tunable). This maps Finch's appointment loop 1:1 onto a school day: the kid leaves for school, the dragon leaves for his adventure, both come home in the late afternoon.

### 4.3 Evening
1. Ronki is back **with a memento and a voiced adventure story**: 2 to 3 sentences about what he saw. The story is the new content unit of the product. Not the currency, the story.
2. Evening block on RonkisTag (existing).
3. TonightRitual (existing), now ending with **tomorrow's hook**: "Morgen zeig ich dir, was ich am Fluss gesehen hab." The promise the app makes at night is the promise the morning return beat keeps. That closes the loop v1 left open.

### 4.4 Growth
An **Abenteuertage counter** counts up, one per day the kid did their routine and Ronki adventured. It never resets, never breaks, and absence never subtracts. This counter becomes the live feeder for the existing 6-stage evolution (`catEvo`), finally re-anchoring evolution to the daily loop. Each stage unlocks **cave customization, never power**: new wallpapers, new shelf items, new expedition destinations.

### 4.5 Mechanics summary

**Adopted (all ethics-checked in section 6):**
| Mechanic | Source | Ronki shape |
|---|---|---|
| Return beat | Finch's forgiving absence | Morning greeting that notices return, never absence |
| Feuer-Energie meter | Finch's energy | Tasks visibly fill the dragon |
| Timed expedition appointment | Finch's adventures | Dragon's school-day trip, home at evening routine |
| Adventure-day growth | Finch's stages | Count-up counter drives evolution + customization |
| Memento collection | Finch discoveries + Khan Kids | Finite, free, nothing decays, pool grows 8 → 30 |
| Story episodes | Finch's evening chat | Voiced 2-3 sentence adventure stories, seasonal/weather variants |

**Rejected, permanently:**
- Calendar streaks and any loss framing
- Variable or randomized rewards
- Daily login bonuses
- Push-notification guilt ("Ronki vermisst dich!")
- Session-lengthening mechanics of any kind

---

## 5. Onboarding v2

**Target: under 60 seconds from cold start to first win, and measured at every step.**

### 5.1 Egg-first reorder
Cold start → the egg shelf renders within 10 seconds, before any auth, landing screen, or profile logic. The kid picks an egg, it hatches, Ronki says hello. Only after the emotional hook does profile resolution happen, framed for the kid: "Lass uns Ronki mit Mama oder Papa verbinden." The QR scan (or the parent link) attaches the just-hatched dragon to the family profile.

This is Finch's proven trick (invest before friction) and Budge Studios' rule (play before setup). Today Ronki does it backwards: wall first, dragon second.

Implementation note: the just-hatched state (variant + name) buffers locally; on successful scan it merges into the cloud row. If the cloud row already has a hatched dragon (second device), the cloud dragon wins and the local buffer discards silently.

### 5.2 Name entry fix
Replace mandatory free-text with **six name chips** (voiced when tapped, so a pre-reader can pick by ear) plus an optional keyboard behind a small "selbst schreiben" affordance. Typing stops being the gate.

### 5.3 Camera dead-end fix
- Kid-readable error copy: "Die Kamera schläft noch. Hol mal Mama oder Papa."
- On-screen fallback: an "Eltern-Link" button that shows the code-entry field and the share-URL instruction, so a denied camera permission no longer terminates the flow.

### 5.4 Close-phase fix
The "Bis morgen. Versprochen." screen gets a visible weiter affordance immediately, not after 3 seconds.

### 5.5 Funnel instrumentation
Eight events wire the funnel top to bottom:
`onboarding.landing.view` · `onboarding.egg.pick` · `onboarding.hatch` · `onboarding.name.confirm` · `onboarding.scan.start` · `onboarding.scan.result` (success/denied/failed) · `onboarding.teachfire.complete` · `first.task.complete`

**The opt-in timing problem must be resolved in the same stroke:** either the website's profil-erstellen form carries the analytics opt-in and seeds `analyticsEnabled` into the cloud row, or onboarding events buffer locally and flush only after consent. Without one of these, the QR path stays dark and the instrumentation is theater.

### 5.6 Telemetry repairs (same workstream)
- `quest.complete` fires from RonkisTag's `handleTap` (the live surface), not the dead TaskList
- `mood.pick` fires from the RoomHub Stimmungs-Check
- `ronki.evolve` fires when a stage threshold crosses
- Legacy TaskList deletes (see section 7)

---

## 6. Ethical guardrails (north-star revision)

The v1 north star banned all visible progression ("no streaks visible to the kid"). v2 revises that: the research distinguishes loss-framed mechanics (harmful for this age) from accumulate-only mechanics (safe and effective). The marketing site's anti-dark-pattern stance stays credible because the rules stay testable.

| Rule | Verification |
|---|---|
| Count-up counters allowed; calendar streaks banned | No UI element can display a "broken" or reset state. Search for streak-reset copy returns zero kid-facing matches. |
| Growth accumulates only | No mechanic subtracts progress. `catEvo`, Abenteuertage, mementos only ever grow. |
| Collections finite and free-completable | Every collection set has a defined end and no paid or randomized gate. |
| Surprise only when unconditional | Random delights (a friend visits the cave) never depend on kid behavior and never gate rewards. |
| The app supports stopping as well as starting | Every session has a natural end beat (TonightRitual, expedition send-off). No infinite scroll, no "one more thing" prompts. This is D4CR principle 6 and our "fades by design" stance. |
| No engagement-driven notifications | Max one notification per day, parent-controlled, content-forward ("Ronki ist zurück") and never guilt-framed. Off by default. |
| No slot-machine praise | Unchanged from v1. Quiet acknowledgment, no rotating hype strings. |
| Voice rules apply to all strings | Unchanged from v1. Kid-readable German, no AI-formal tone. |

Reference frameworks: Designing for Children's Rights (D4CR) 10 principles, 5Rights Foundation "Disrupted Childhood." Both cited on the website's Wissenschaft page when v2 ships, so the product and the marketing make the same claim.

---

## 7. Feature ruling: build / keep / cut

### Build (new in v2)
| What | Section |
|---|---|
| Morning return beat (greeting + absence-warm lines) | 4.1 |
| Feuer-Energie meter on the dragon | 4.1 |
| Expedition appointment timing (school-day trip, evening return) | 4.2 |
| Voiced adventure stories, pool 8 → 30 mementos with seasonal/weather/time variants | 4.3 |
| Tomorrow's hook in TonightRitual | 4.3 |
| Abenteuertage counter feeding evolution | 4.4 |
| Onboarding egg-first reorder + name chips + camera fallback | 5 |
| Funnel events + telemetry repairs + opt-in timing fix | 5.5, 5.6 |

### Keep (v1 surfaces that serve the loop)
RoomHub (the cave), RonkisTag (the daily strip), TonightRitual, BeiRonkiSein, Expedition, the emotional tool library (Box-Atmung, Drei-Danke, Löwen-Pose, Stein-und-Gummi, Gedanken-Wolken, Hörmoment), Belohnungsbank + Ausmalbild, parental dashboard, QR profile auth + website profil-erstellen, MINT games on the games tab.

### Cut (resolving the doc-vs-router drift)
| What | Ruling |
|---|---|
| Journal | Fold into Buch, remove from nav |
| Compendium | Public `?compendium=1` route stays (website links it), off the nav |
| Starfighter, CloudJump | Delete, per the existing kill list (wrong genre) |
| Legacy TaskList | Delete (unreachable, and its analytics moved to RonkisTag) |
| Dormant economy fields | Remove orbs, badges, boss, gear, heroStats from state and `complete()`. Keep hp (Sterne) and xp only. One migration on load drops the dead keys. |

---

## 8. Metrics

**North star: D7 return rate of beta families.**

| Layer | Metric | Instrument |
|---|---|---|
| Funnel | Onboarding completion %, time-to-first-win | The 8 events in 5.5 |
| Loop health | Morning-block completion rate | `quest.complete` with block tag |
| Loop health | Expedition launch rate (mornings that fill the Feuer) | `expedition.start` (exists) |
| Loop health | **Evening return rate: did the kid come back for the story?** | `expedition.return` viewed vs. fired |
| Loop health | TonightRitual completion | `tonight.complete` (exists) |
| Guardrail | Session length stays short: 5 to 10 minutes target | Session duration distribution |

The guardrail metric matters as much as the growth metrics. We win on return frequency, not session duration. If sessions lengthen past ~12 minutes we investigate what's holding kids in the app and cut it.

---

## 9. Rollout

**Phase 1: fix the funnel (measurement before mechanics).**
Onboarding reorder (5.1 to 5.4), the 8 funnel events, opt-in timing fix, telemetry repairs, and the cuts from section 7. Nothing new for the kid yet beyond a smoother start. Exit: a complete funnel dashboard for a single test family.

**Phase 2: build the return engine.**
Return beat, Feuer meter, expedition appointment timing, story pool 8 → 30 with voiced episodes, tomorrow's hook, Abenteuertage counter feeding evolution. Voice recording for the new lines rides in this phase. Exit: the loop in section 4 is playable end to end.

**Phase 3: validate.**
30-family DACH closed beta (recruited via the Wissenschaft/Ratgeber audience, per the existing north-star path). Measure D7, D30, the loop-health metrics, and the guardrail. Pricing decision comes after beta data, not before. Anchors: Finch $69.99/yr, Joon $89.99/yr, Timo $14.99 lifetime. Template: free tier complete, paid tier sells abundance (more cave items, more story variety), never access.

---

## 10. Open questions

1. **Voice re-record scope:** the existing catalogue is inconsistent (flagged "single biggest gap" in PATH.md). Does the full re-record happen inside Phase 2 (it blocks the 30 new stories anyway) or as its own workstream before it?
2. **Website opt-in:** does profil-erstellen carry the analytics checkbox and seed `analyticsEnabled` into the cloud row? (Decides which fix in 5.5 to build.)
3. **Push notifications:** one parent-controlled daily notification ("Ronki ist zurück") is allowed under the guardrails and off by default. Ship in Phase 2 or defer past beta?
4. **Sibling profiles:** one QR card per kid works today, but the parent dashboard manages only one. Multi-kid support before or after beta?
5. **iOS rebuild:** unchanged decision, separate track. The LCS v1 brief from July 2026 exists for it; nothing in this PRD blocks it, and the loop spec in section 4 carries over 1:1 if it happens.

---

## 11. Addendum: Ferienmodus (added 7 July 2026)

School breaks remove the day structure the whole v2 loop assumes. No school means no expedition window, no fixed morning shape, and six weeks of summer would stall the Abenteuertage momentum the school year builds. At the same time the parent pain shifts: the vacation problem is not "get through the morning," it's the daily "mir ist langweilig" followed by requests for screens. Ferienmodus answers both with one reframe.

### 11.1 The guardrail comes first

Ferienmodus is **not screen-time bargaining**. "Do your tasks, then you may ask for free time" is the Funkelzeit mechanic this product already cut, and it stays dead. Ronki never gates, meters, or unlocks screen time. The contract about screens stays between parent and kid, outside the app. Ronki's job is to make the alternative attractive enough that the asking starts later.

### 11.2 The reframe

Boredom is Ronki's problem too. In the v2 frame the kid's day and the dragon's day are the same day, so when school stops, Ronki loses his structure with the kid. The Ferien morning beat is Ronki asking: **"Keine Schule heute. Was machen wir zwei?"** The kid picks the day's adventures from an idea board. The app's answer to boredom is a dragon with ideas, not a chore list and not a screen unlock.

### 11.3 Mechanics (all existing systems bend, none break)

| v2 school loop | Ferien variant |
|---|---|
| Fixed morning routine fills the Feuer | Light morning anchor stays (anziehen, Zähne), then the kid picks 2 to 3 activities from an idea board; picks and completions fill the Feuer |
| Ronki adventures alone during school | Ronki and the kid adventure together: the chosen activities are the shared expedition of the day |
| Return with story at evening-routine time | The evening beat retells the day the kid actually had, in Ronki's voice; the memento matches the activity type |
| TonightRitual with tomorrow's hook | Unchanged; the hook references tomorrow's fresh card hand ("Morgen ziehen wir neue Karten") |
| Abenteuertage count school days | Ferien days count identically; the growth arc never pauses over summer |

**The idea board** is the one new piece. A hand of 5 to 6 illustrated activity cards each morning, drawn from a pool: sensible defaults (draußen spielen, etwas bauen, malen, ein Buch anschauen, jemandem helfen) plus parent-added household cards in the dashboard (Trampolin, Fahrrad, LEGO, backen). Each card is a scene illustration, no reading required. Ronki presents them as things he wants to do. The hand rotates daily so the board stays generative (the Joon lesson: a thin fantasy layer collapses back into a list).

### 11.4 UI: a mode, not a new app

- Parent toggles Ferienmodus in the dashboard, or sets a date range (German school holidays vary by Bundesland).
- RonkisTag keeps its comic-strip shape: Morgen and Abend panels stay, the school-time middle block swaps to the card board and the shared-adventure scene.
- Cave, Feuer meter, TonightRitual, evolution, and the Abenteuertage counter carry over untouched.
- Dashboard shows the parent "heute gewählt: bauen + draußen," so enforcement of family agreements happens with the parent, not in the kid's UI.

### 11.5 Sequencing

Ferienmodus is a candidate to ship **before** v2 Phase 2: it reuses every existing surface, the only new component is the card board, and summer break starts within weeks of this addendum. Shipping it makes Louis the live tester for the picker mechanic before it informs the school-year loop. If it ships first, its funnel events ride on the Phase 1 instrumentation work.

---

_Sources: codebase audit 7 Jul 2026 (this repo, branch experiment/drachennest); competitor research 7 Jul 2026 (Deconstructor of Fun on Finch, Finch wiki, Finch help center, joonapp.io, brili.com, gotimo.com, playpokpok.com, D4CR guide via Joan Ganz Cooney Center, 5Rights "Disrupted Childhood", The Conversation on kids' hook mechanics, Sesame Workshop preschool tablet best practices, Budge Studios onboarding on Android Developers blog). Prior art: docs/strategy/NORTHSTAR.md (25 Apr 2026), docs/strategy/PATH.md, docs/strategy/strategic-synthesis-2026-04-27.md._
