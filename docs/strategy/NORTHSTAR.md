# Ronki — Strategic Northstar

_Written 25 April 2026 by Marc + Claude after the three-agent audit (game loop / audience fit / UX). Living document. Edit when something fundamental changes._

---

## The product, in one sentence

**Ronki is the German-language emotional companion app for 5–8-year-olds — a quiet pocket dragon that helps a kid name what they feel, breathe through it, and end the day knowing someone listened.**

That's the only sentence the rest of this document has to serve.

---

## What we are

- A **companion** app, not a productivity tracker.
- A **presence** layer, not a metric layer.
- **Voice-first**, art-second, mechanic-third.
- A product the parent installs because it feels different from the apps the Ratgeber attacks — and stays different.

## What we are not

- Not a chore tracker. (We are not Habitica for kids.)
- Not a screen-time bargaining tool. (We are not Funkelzeit.)
- Not a skill-tree game. (We are not Khan Academy Kids.)
- Not an engagement maximiser. (We are not the apps the Ratgeber attacks.)

If a feature pulls us toward any of those four, it goes.

---

## The closest live analogue

**Finch** (mood-companion Tamagotchi for adults, ~5M downloads, paid). The shape — small creature you care for whose wellbeing maps onto self-care moments — is the right shape. There is no DACH equivalent for kids. That's the whitespace we're building into.

Lumi-Stories sets the bar for kid-facing emotional/values writing in DACH. We borrow the principle (one warm beat per day, voice-led) but we ship a *creature relationship* rather than story-of-the-day. We are the relationship layer Lumi doesn't have.

---

## The core daily promise

A kid opens Ronki, meets a small warm creature who has something to say, and leaves the app a few minutes later more themselves.

**The promise is not "tasks completed."** It is *"someone heard me and the day made sense."*

---

## Two pillars

### Pillar 1 — Companion presence
Ronki as a *character*: voice, mood, idle quirks, stumbly story moments. The standard is `BeiRonkiSein.jsx` voice quality everywhere — soft, hedge-y, kid-readable, conversational, occasionally forgetful. The 10 stories at `BeiRonkiSein.jsx:31-42` are the strongest writing in the codebase. That's the bar.

This is our differentiated asset. No competitor in DACH has it.

### Pillar 2 — Emotional tool library
Tactile, brief, no metric, no streak. Each tool is a moment, not a workout.
- ✅ Box-Atmung (shipped)
- ✅ Drei-Danke (shipped)
- 🔁 Kraftwort — replace with a BeiRonkiSein-tier tool
- 📋 Gedanken-Wolken — specced, not shipped
- 📋 Stein-und-Gummi — specced, not shipped
- 📋 Ronki-Yoga (Löwen-Pose first, then 12-pose Reise) — specced
- 📋 +1 sensory/grounding tool TBD

## Light secondary loop

The expedition is the **"today is different from yesterday"** mechanic and the only one we keep. Ronki goes on a trip, returns with a memento, the trail map shows where. The cave fills with traces of his journeys.

Daily routines exist as **Ronki's morning rhythm** — the kid does them with Ronki, the morning anchor triggers the expedition narratively. The HEUTE card already reads in companionship voice (`bf21c18`).

That's the entire mechanical system. Care for the creature, share the morning, see what he brought back.

---

## Principles (verifiable, not aspirational)

| Rule | Verification |
|---|---|
| No achievement-pattern slot-machine praise | Zero rotating "Wow du rockst das!" strings in i18n |
| No streaks visible to the kid | Search `streak` in components/ → 0 kid-facing matches |
| No screen-time-as-currency | Funkelzeit code deleted (Cut 1) |
| No content cliffs | Forscher-Ecke "graduates and disappears" replaced with rotating shelf |
| One verb per surface | No decorative buttons that don't do what they imply (care verbs cleanup) |
| German voice respects German linguistics | Soft-hyphens at compound boundaries, no auto-hyphenate (`bf21c18`) |
| Voice rules apply to ALL strings | No em-dashes, no AI-formal tone, no high-fantasy bombast in copy |

---

## Cuts (in priority order)

These are the structural cuts. All shipped on `experiment/drachennest`.

| # | Cut | Why | Status |
|---|---|---|---|
| 1 | **Funkelzeit + screen-time currency, entirely** | Contradicts marketing, zero usage. ~8 components, ~3 reducer paths, 1 state field. | ✅ `5478394` |
| 2 | **Hub.jsx legacy chore-tracker route** | Two primary surfaces. RoomHub wins. Hard-route `view==='hub'` to RoomHub. | ✅ `f39d774` |
| 3 | **Mission / boss / gear surfaces** | Game-mechanics layer in the legacy Hub. None serve the companion thesis. | ✅ `d6858a6` |
| 4 | **Forscher-Ecke linear chain** | "Graduates and disappears" = content cliff. Replace with stable rotating shelf. | ✅ `3d36b61` |
| 5 | **Care verbs (Streicheln/Füttern/Spielen)** | Cosmetic dissonance — vitals weren't verb-driven. Demoted to presence beat. | ✅ `e496c0b` |
| 6 | **8 rotating praise strings** (`task.status.complete.0–7`) | Slot-machine pattern our own marketing condemns. Replaced with quiet acknowledgement. | ✅ `f7c80f2` |
| 7 | **KraftwortTool** | "Sticker-of-the-day" with heavy state plumbing. Deleted; replacement deferred. | ✅ `e578470` |
| 8 | **Voice-rule violations** (`journal.affirmation.*`, `mission.em*.story`, `ronki.stubNote`) | Internal contradiction with stated principles. | ✅ `f7c80f2` |
| 9 | **Vitals ring + dead vitals system** | Three-agent audit found the ring was a metric on a relationship surface AND the underlying system was inert (anchor-routed top-up commented out, careForRonki dead, expedition CTA unreachable). Replaced expedition gate with morning-routine-complete. | ✅ `bde6a4e` |

## What gets doubled down on

| What | Why |
|---|---|
| **BeiRonkiSein voice quality everywhere** | The differentiated asset. Voice is the moat. |
| **Expedition trail + memento** | The only "today is different" mechanic. Pool 8 → 30. Telemetry wired. |
| **Meet-Ronki onboarding (60s)** | A parent installs from the Wissenschaft article and meets a dragon, not a chore list. Spec exists at `docs/superpowers/specs/2026-04-23-onboarding-refresh-and-teach-beat-design.md`. |
| **Voice re-record** | Re-record full catalogue with the right voice before unmuting default (`backlog_ronki_voice_rerecord.md`). |
| **Cave personalisation** | Already shipped. Add: kitchen/garden as future rooms, expedition finds slot into rooms. |
| **Ronki mood animations** | Per-mood idle loops, scene reactions for all 6 emotions (`backlog_ronki_mood_animations.md`). |
| **Emotional tool library** | Ship 3 more tools (Gedanken-Wolken, Stein-und-Gummi, Löwen-Pose) to round out the second pillar. |

---

## 90-day path

**Weeks 1–2: cuts + telemetry.** Cuts 1, 2, 5, 6 land. `expedition.start/return/memento.received` events wired (right now the most expensive shipped feature is invisible).

**Weeks 3–6: meet-Ronki onboarding + emotional tool replacement.** Phase 1 of the onboarding-refresh spec ships (eggs first, no lore preamble). KraftwortTool replaced with a tactile companion beat. Cuts 4 and 7 land.

**Weeks 7–10: content depth.** Memento pool 8 → 30 with seasonal/weather/time-of-day variation. Voice re-record. One more emotional tool ships. Mood-animation library expanded.

**Weeks 11–12: closed beta with 30 DACH families.** Recruited through the Wissenschaft/Ratgeber audience. Measure: D7, D30, time-on-emotional-surfaces vs. routine-surfaces. Decide pricing.

---

## What we are deferring (consciously)

- Marketing site repositioning. Comes after the app is sharp. Wave 1 is internal alignment + a sharper product; Wave 2 is the site rewrite.
- Multi-room (kitchen / garden as Ronki's rooms). Worth shipping after we see how Louis interacts with the cave wallpaper picker.
- Friend-character expansion beyond Pilzhüter. The chibi system can render them; only one is wired into the Forscher-Ecke. Ship more after the Forscher-Ecke shape decision (Cut 4) is settled.
- Active memento placement (drag-and-drop in the cave). Passive auto-fill is doing the personalisation work for free; don't add agency until we see Louis ask for it.

---

## The hard call

We have been building two products. The audit consensus is unanimous: shed the productivity-app skin, and the companion product underneath is genuinely defensible against Lumi, Pok Pok, and Finch-for-kids in DACH. Try to keep both, and we compete with Pocket Camp's production budget on one axis and Lumi's clarity on the other, and lose both.

This document is the call. Everything that follows refers back to it.

---

_Last revised: 26 April 2026 (Cut #9 — vitals system removal)._
