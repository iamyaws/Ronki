# Astra code review brief: the Finch pass (26 Sep 2026, night)

You are the outside reviewer (read-only, do not edit any file). This is a findings review of finished code before it merges to `main` and goes live on app.ronki.de for a handful of real families (one is Marc's son Louis, 6). Reply in the findings format of `C:\Users\öööö\.basic-memory\docs\two-model-review\PROTOCOL.md`, at most 1,500 words, then one verdict: HAPPY or NOT YET with the single biggest reason.

## Read first

1. `C:\Users\öööö\.basic-memory\docs\two-model-review\HOUSE-RULES.md` and the active list in `LESSONS.md` (especially the Ronki lessons: follow every state that changes Ronki's face or copy).
2. `docs/specs/2026-09-26-finch-pass-spec.md` (the rulings R1 to R15 are the decisions; challenge one only as CHALLENGE with a reason), the base design `docs/reviews/2026-09-26-finch-pass/design-finch-faithful.md`, your own sparring reply `astra-spar.txt` and the response `response-spar.md`.
3. `docs/research/2026-09-26-ronki-feature-census.md` (what the code did before this pass).

## What to review

The diff `git diff 13f14e6..HEAD -- src public/audio scripts` on branch `finch/loop-and-onboarding` (13f14e6 is `main`). Content lives in `src/data/finchLines.de.json`; the loop in `src/loop/`; state in `src/context/TaskContext.tsx`; onboarding in `src/components/onboarding/` and `MeetRonki.jsx`; the Nest in `src/components/drachennest/`; passport, nav and parent area in `RonkiPassport.jsx`, `NavBar.jsx`, `ParentalDashboard.jsx`; wiring in `src/App.jsx`.

## The questions

1. **Old saves and the card path.** Can any existing save (catEvo 3, mementos, a trip in `leaving`, `away` or `waiting`, a PIN, a nickname) lose data, crash, or show a wrong Ronki after this loads? Can the website card path (`?p=` link or scan) break, or can a local hatch overwrite a cloud dragon? `storage.ts` was deliberately not touched; check the pending-hatch stash.
2. **The loop.** Trace a school day, a weekend, an evening-only child, an afternoon install, an evening install, a tablet left open past midnight, five days away. Does Ronki leave at most once a day, always come back without the map screen, never lose a treasure, grow at most one stage per treasure and never shrink?
3. **Guardrails.** Any streak, broken state, loss framing, guilt, random reward, countdown number for the child, praise slot machine, session lengthener, or a Ronki whose mood depends on tasks. Any em-dash or en-dash in shipped strings.
4. **Kid fit.** Can a six-year-old who cannot read do the first session and a morning alone, by ear and picture? One loud action per screen? Anything that stalls (invisible buttons, no exit, unskippable waits)?
5. **Parents.** Can a parent always reach the dashboard (lock on the Nest), does the PIN from the setup or the website work there, do the routine and evening time really change the child's screen?
6. **Regressions.** Anything outside the spec that changed behaviour, any test weakened, any DEV-only override reachable in a production build.

Challenge the orchestrator's choices as hard as Marc's. Do not fix risks with hedges or disclaimers in kid copy; change the design.
