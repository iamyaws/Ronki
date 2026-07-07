# Discovery — onboarding sequence, parent-first

**Date:** 2026-04-23
**Trigger:** Marc — *"first the parent needs to start the process … 'hey give it to your parent to set this up right' in a kids way … then now let your kid take charge and discover the world and his new friend ronki → kid sequence starts from here and lands at the Lagerfeuer"*
**Tool:** superpowers:brainstorming (text-only — the flow converged fast enough that visual mockups weren't needed)
**Sibling to:** `docs/discovery/2026-04-23-core-gameloop-time-stack/` (time-stack) and the deferred household discovery (QR-sticker / lockout / multi-kid / multi-identity sync bug)

Marc flagged two problems at once: (a) the "Dashboard-Preview" schematic in `ParentOnboarding.jsx` lies about the actual UI (lock icons drawn in the wrong place, viewports structured differently), and (b) the whole sequence has the wrong *order* — today the parent gets dropped into an explainer flow without the kid ever being addressed, so the kid never feels the app is *theirs to receive from the parent*.

This discovery restructures the whole first-launch arc around a parent-first-then-kid choreography.

## Brand guardrails carried through every decision

- Ronki is the spine (`project_ronki_positioning.md` + time-stack discovery Q3 pick)
- "Companion that fades by design — not retention-optimized"
- Time-to-independence > time-on-device → don't front-load parent config
- Kid-mediated agency — kid hatches Ronki, kid names Ronki, parent stays blind to Ronki magic
- No friction theater — the app doesn't moderate handoffs, the humans do

---

## Q1 — What does the kid see on the very first launch, before any parent has touched the app?

**Frame:** Three shapes —
- **A** "Sticker-style" — a single utilitarian card *"Gib mich kurz an Mama oder Papa."* No Ronki yet.
- **B** "Ronki greets, then hands off" — a 10s warm intro, egg in moss, Ronki peeks, *"Hallo! Bevor wir uns kennenlernen, hol bitte Mama oder Papa."*
- **C** "Two doors" — Antolin-style *"Ich bin ein Kind"* / *"Ich richte ein"* tiles, no gate.

**Pick: B.** Ronki greets first — the kid feels the relationship begin — but the gate is firm. A is too cold for a companion app. C risks kids skipping into a parent-uninitialized state and silently breaking the dashboard handshake.

**Implication:** the kid's first experience is a real Ronki beat (not a loading screen), and parents inherit a context where the kid is *already emotionally invested* in meeting Ronki — which makes the handoff back ("now your turn") feel earned.

---

## Q2 — What's IN the parent flow, between the handoff-from-kid and the handoff-to-kid?

**Frame:** Three flow shapes —
- **Lean (5 screens)** — Welcome → PIN → Child name + siblings → Analytics → Handoff
- **Standard (7 screens)** — + "Was ist Ronki" explainer + Dashboard tour
- **Comprehensive (10+ screens)** — + Ronki variant pick + bedtime/wake defaults + school/vacation toggle + screen-time presets

**Pick: Lean.** The only shape genuinely in the brand spine. The Standard's "what is Ronki" screen is a thing parents learn by *watching their kid use the app*, not by reading an explainer. Every Comprehensive setting a parent decides upfront is a moment of magic stolen from the kid.

**Sub-decision:** parent stays **blind to Ronki** during their setup. No Ronki in the chrome, no egg, no forest — neutral app-chrome only. First Ronki reveal belongs to the kid.

**Implication:** the Dashboard-Preview schematic and the "Was ist Ronki" screen are both killed. Parent finds the lock organically after handover (they'll hit it in their first use, same as kids find their way through the Hub). This is the direct fix for Marc's "preview is wrong" complaint — the preview doesn't just get redrawn, it gets removed.

---

## Q3 — What's the kid sequence between parent-handover and arrival at Lagerfeuer?

**Frame:** Three arc shapes —
- **A** Single sitting — hatch → name → Lagerfeuer, ~2 min
- **B** Hatch as reward — egg waits → first quest done → hatch (spread over 2 sessions)
- **C** Hatch + guided tour — hatch → name → narrated Hub tutorial → Lagerfeuer

**Pick: A.** Fastest reveal, no "come back tomorrow" dependency, no tutorial. B was brand-clever (kid earns hatch) but introduces a confusing day-0 where the kid taps in and nothing happens. C contradicts the time-stack discovery's "Ronki teaches by living, not narrating" pick.

**Implication:** full kid sequence stays ~2 minutes. Re-uses existing `Onboarding.jsx` + `EggHatchModal` + `EggProfile` name input. No new tutorial scaffolding.

---

## Q4 — How do the two handoff moments work? (kid→parent, then parent→kid)

**Frame:** Three mechanics —
- **A Trust** — single tap, no ceremony. Frictionless.
- **B Soft confirm** — held-button or "ich bin's" tap on the receiving side. Light ceremony.
- **C Passive breath** — 3-5s pause between flows, cinematic fade, no prompt.

**Pick: A.** B's held-button doesn't prevent any real failure mode (a kid skipping ahead will hold the button anyway). C's 4s delay is *actual* friction — "fades by design" applies to Ronki, not to the app making you wait. A is closest to Antolin/Anton: kid hands phone, parent does their thing, kid gets it back. The app doesn't moderate, the humans do.

**Copy settled:**
- Kid → Parent card: **"Mama oder Papa?"** / *"Sie richten kurz was ein, dann sind wir dran."* / [ Okay, ich hol sie ]
- Parent → Kid card: **"Fertig!"** / *"Jetzt bist du dran."* / tap-anywhere-to-continue

---

## Q5 — What does the kid see/hear/do in the first 30 seconds at the Lagerfeuer?

**Frame:** Three shapes —
- **A Silent arrival** — progressive-disclosure Hub (day-0 = only routine card), Ronki at fire, no speech
- **B Gentle pull** — same Hub, Ronki speech bubble *"Magst du mir zeigen, was du morgens machst?"* + visual thread to routine card
- **C Guided first quest** — Ronki walks the kid through one real quest

**Pick: B.** A freezes 6yos on an unfamiliar screen (Marc's own "dense Hub" feedback applies — silence+empty is the same failure shape in a different coat). C is a back-door tutorial, exactly what Q3 and the time-stack discovery rejected. B is the minimum Ronki-warmth needed to pull a cold-start kid into action — one line, one visual thread, kid agency preserved.

**Hard dependency:** Progressive Hub disclosure (`backlog_progressive_hub_disclosure.md`) must ship alongside this, not after. Without it, Phase 6 arrives on the dense Hub and the gentle-pull design collapses. Promoted from backlog to hard dependency of this spec.

---

## Settled-by-default (no separate question)

- **Naming mechanic** — text input, existing `EggProfile` / hatch flow kept.
- **Ronki variant** — random at hatch (existing behavior). Kid doesn't pick, parent doesn't pick.
- **Auth** — existing Supabase email magic-link, parent enters email during PIN step. Household QR-sticker account is **household-discovery scope**, out of here.
- **Edge case: no parent available** — kid hits handoff card, can't go further. This *is* the intended gate. An escape hatch defeats the brand intent. Parent comes home → app is waiting.

---

## The new flow, end to end

| Phase | Who | What | State flag |
|---|---|---|---|
| 1 — Kid intro | Kid | Forest scene, egg, Ronki peek, single line, one button | `kidIntroSeen` |
| 2 — Handoff (kid→parent) | Kid | *"Mama oder Papa?"* card, single tap | — transient — |
| 3 — Parent setup (Lean) | Parent | Welcome → PIN → Family → Analytics → Done | `parentOnboardingDone` (existing) |
| 4 — Handoff (parent→kid) | Parent | *"Fertig!"* card, single tap | — transient — |
| 5 — Kid hatch + name | Kid | Existing `Onboarding.jsx` (trimmed) + `EggHatchModal` | `onboardingDone` (existing) |
| 6 — Lagerfeuer arrival | Kid | Progressive Hub (routine card only) + Ronki speech bubble + visual thread | `lagerfeuerGreeted` |

## What's new vs. reused vs. killed

**New (needs building):**
- `KidIntro` component (Phase 1) — forest scene + egg + Ronki peek + single button
- `HandoffCard` component (Phases 2, 4) — reusable interstitial
- "Child name + siblings" step in `ParentOnboarding` (Phase 3, was deferred item C1)
- Phase 6 Ronki speech bubble at Lagerfeuer + visual thread to routine card
- Orchestrator: `state.kidIntroSeen` + `state.lagerfeuerGreeted` flags, wired into `App.jsx` gates

**Reused:**
- Existing `ParentOnboarding.jsx` shell (steps 1, 2, 5 largely intact)
- Existing `Onboarding.jsx` (kid flow, Phase 5)
- Existing `EggHatchModal` + `EggProfile` (Phase 5 hatch + name)
- Existing Hub + Routine card + MoodChibi + Campfire scene (Phase 6)

**Killed:**
- Dashboard-Preview schematic in `ParentOnboarding.jsx` (the wrong-viewports one)
- "Was ist Ronki" explainer step in `ParentOnboarding.jsx`

## Hard dependencies / out of scope

**Hard deps (ship with this, not after):**
1. Progressive Hub disclosure (day-0 = only routine card visible)

**Out of scope (other discoveries):**
- Household QR-sticker account — household discovery
- Multi-kid profile switching on one device — household discovery
- Multi-identity sync bug (the incognito-googlemail-resets-onboarding thing) — household discovery
- Oma/Opa access — household discovery
- Time-stack week/month/season/journey — time-stack discovery

## Subsumed backlog / deferred items

- **Item 22** (parent-area icon intro copy + spotlight) — killed; parent finds the lock organically
- **Item C1** (family setup step) — folded in as Phase 3 step 3

---

(Document closed — execution starts here. Transcript preserved for lineage.)
