# Ronki — HANDOFF

_Single source of truth: done, in flight, backlog. Update before any /compact and at session end. Created 7 July 2026._

---

## Where things stand (7 July 2026)

The repo folder is `C:\Users\öööö\ronki` (renamed from `louis-quest-drachennest` today; git history intact, all path references in code/scripts/docs updated). Working branch `experiment/drachennest`; it has been fast-forward-pushed to `main` several times. Docs are sorted, index at [docs/README.md](docs/README.md).

**Product state:** v1 PWA is live (app.ronki.de via GH Pages, marketing site separate). QR-card auth shipped in May (website creates the profile card at ronki.de/profil-erstellen, kid scans it in the app). Louis is still the only tester; the strategic ship-blocker is non-Marc families.

**Product direction:** the v2 PRD (today) repositions Ronki routine-first: "stress-free mornings and evenings for school starters," emotional companion inside. Core loop: the kid's day and the dragon's day are the same day. Morning tasks fill Ronki's Feuer, full Feuer sends him on a timed expedition during school, he returns at evening-routine time with a memento and a voiced story, TonightRitual ends with tomorrow's hook. Soft Finch-style mechanics, hard anti-dark-pattern guardrails (count-up counters yes, calendar streaks never).

## Done (this session, 7 Jul 2026)

- **v2 PRD** written and committed: [docs/prd/RONKI-V2-PRD.md](docs/prd/RONKI-V2-PRD.md). Built from a two-track research pass (full codebase/product audit + Finch/Joon/Brili/Timo/Pok-Pok competitor research). 10 sections + Ferienmodus addendum (section 11). Key decisions locked by Marc: evolve the PWA (iOS rebuild separate), balanced soft gamification without dark patterns, routine-first positioning.
- **Claude Design handover brief**: [docs/design-briefs/2026-07-07-v2-loop-and-onboarding.md](docs/design-briefs/2026-07-07-v2-loop-and-onboarding.md). 10 wireframe explorations across 4 items (onboarding egg-first, Feuer loop, Heimkehr, Abenteuertage). Deliverables expected back in `docs/design-incoming/v2-loop/` as HTML mockups; green light before build.
- **Ferienmodus addendum** (PRD section 11): school-break mode. Idea board of 5-6 illustrated activity cards each morning (parent-configured pool), picks fill the Feuer, kid and dragon adventure together, Abenteuertage never pause. Hard rule: NOT screen-time bargaining (Funkelzeit stays dead). Candidate to ship before v2 Phase 2 since summer break starts within weeks.
- **Repo rename + docs reorg**: folder renamed, docs sorted into prd/strategy/specs/voice/design-briefs/design-incoming/archive, docs/README.md index added, all references fixed, build verified. Commit `f4e53f6` pushed to `experiment/drachennest`.

## Done (earlier sessions, still relevant)

- QR profile auth phases 1+2+2.5 + website-driven setup + trading-card design (May 2026). Spec: [docs/specs/qr-profile-auth.md](docs/specs/qr-profile-auth.md). Production blockers tracked in the second brain (website deploy, env vars, home CTA).
- Onboarding trim 16 → 4 surfaces, narrator removed (Ronki-only voice), music engine with ducking, chibi continuity, ~13 NORTHSTAR cuts (April 2026).

## In flight

- **Claude Design wireframes** for the v2 loop + onboarding (brief handed over 7 Jul). Ferienmodus addendum passed alongside for a possible 5th item.
- Nothing else is mid-build; v2 execution has not started.

## Backlog (ordered)

1. **Ferienmodus build** (PRD 11.5 says candidate to ship first; summer break is the forcing function). Needs: card board component, dashboard toggle + activity-pool editor, RonkisTag middle-block swap, Feuer wiring.
2. **v2 Phase 1: fix the funnel.** Onboarding reorder (egg-first, name chips, camera fallback, close fix), 8 funnel events, opt-in timing fix, telemetry repairs (quest.complete on RonkisTag), section-7 cuts (Journal into Buch, Starfighter/CloudJump/TaskList deleted, dead economy fields dropped).
3. **v2 Phase 2: the return engine.** Return beat, Feuer meter, expedition appointment timing, story pool 8 → 30 voiced, tomorrow's hook, Abenteuertage feeding evolution. Voice re-record rides here (open question 1).
4. **v2 Phase 3: 30-family DACH beta.** Measure D7/D30 + loop health + short-session guardrail. Pricing after data.
5. **NORTHSTAR revision**: [docs/strategy/NORTHSTAR.md](docs/strategy/NORTHSTAR.md) still says "no streaks visible to the kid" as a blanket ban; the PRD's section 6 guardrails supersede it (count-up allowed). Edit NORTHSTAR when v2 execution starts so the docs don't contradict.
6. QR-card production blockers (website deploy, Vercel/GH-Pages env vars, home CTA to /profil-erstellen).
7. iOS-native rebuild: separate track, LCS v1 brief exists (in session history, July 2026), untouched by v2.

## Open questions (PRD section 10)

Voice re-record scope, website analytics opt-in seeding, push notifications timing, sibling profiles, iOS track.

## Key paths

- PRD: `docs/prd/RONKI-V2-PRD.md`
- Design brief: `docs/design-briefs/2026-07-07-v2-loop-and-onboarding.md`
- Strategy: `docs/strategy/` (NORTHSTAR, PATH, synthesis)
- Supabase project: `jdpxfvqaoxmnyvlxikce` (profiles table, token-keyed RLS); local env in `.env.local` (gitignored), website reads it via `envDir: '..'`
- Dev servers: app `npx vite --port 5173`, website `npm run dev:web -- --port 5174` (both currently stopped after the folder rename)
