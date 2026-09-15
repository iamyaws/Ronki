# Ronki HANDOFF

_Single source of truth: done, in flight, backlog. Update before any /compact and at session end. Created 7 July 2026._

---

## Where things stand (14 September 2026)

Revival check done, nothing built. Full write-up (German): [docs/strategy/2026-09-14-wiederbelebungs-check.md](docs/strategy/2026-09-14-wiederbelebungs-check.md). Raw Search Console export: `docs/analytics/gsc-2026-09-14/`.

- **Traffic:** Search Console, 13 Jun to 12 Sep 2026: 15 clicks, 1,403 impressions. /ratgeber/morgenroutine-grundschulkind ranks position 6.5 and takes 5 of the clicks. Impressions doubled after 8 Sep (Schulstart). More than half of all impressions are foreign typo searches landing on /en.
- **Backend was gone, now back:** Supabase project `jdpxfvqaoxmnyvlxikce` was paused around 25 May (inactivity) and got the "permanently frozen in 5 days" mail on 18 Aug. On the evening of 14 Sep the host did not resolve; Marc restored the project the same night and it answers again on 15 Sep (waitlist_count returns 4, profiles has 3 rows, all tables except `leads` and the never-created `game_state` exist). Between late May and 14 Sep, profile cards, QR login, cloud sync, waitlist and feedback forms were dead on the live site.

## Decision gates (set 15 September 2026)

Full text with the queries: PRD section 12 ([docs/prd/RONKI-V2-PRD.md](docs/prd/RONKI-V2-PRD.md)). Short form:

- **Gate 1, pull, check on 14 Nov 2026:** at least one family we do not know created a card since go-live and used it on three or more distinct days (`profiles` joined with `profile_activity`, subtract our own cards). Plausible cross-check: "Karte erstellt", "CTA Klick" by `cta`.
- **Gate 2, reach, check on 15 Mar 2027:** at least 500 organic visitors per month on ronki.de (Plausible, Google, average Jan and Feb 2027) and at least 100 distinct addresses across leads and waitlist (`select public.leads_count();`).
- Outcomes: both pass, start v2 Phase 1. Pull only, keep the app alive and work on reach. Reach only, keep the site as content asset, freeze the app, no v2. Neither, Ronki stays a family project. Ticklers for both dates sit in the HQ Fristen register.
- **Deploys:** website and app production both sit on commit `2fa8ab5` (3 May). The July docs commits live only on `experiment/drachennest`. v2 execution never started.
- **Proposal (awaiting Marc):** 1) rebuild backend and redeploy (one evening), 2) instrument the funnel and add a home CTA to /profil-erstellen (one evening), 3) optional SEO push on the clusters Google already ranks, 4) decide after 30 days against a preset threshold (suggested: 10 outside families with a created card).

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

0. **Backend restore (blocks everything below, see the 14 Sep check).** Download data from the frozen Supabase project, create a new project, rebuild the schema (waitlist + both RPCs, site_feedback, profiles with token RLS, game_state, telemetry_events, feedback, app_evals + app_eval_counts view), set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel `ronki` and `ronki-app`, redeploy main, create one card end to end. Then funnel instrumentation: Plausible goals, profiles counter, home CTA to /profil-erstellen, sitemap entry.
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
- Supabase project: `jdpxfvqaoxmnyvlxikce` (FROZEN since about 23 Aug 2026, host no longer resolves, see the 14 Sep check; profiles table, token-keyed RLS); local env in `.env.local` (gitignored), website reads it via `envDir: '..'`
- Dev servers: app `npx vite --port 5173`, website `npm run dev:web -- --port 5174` (both currently stopped after the folder rename)
