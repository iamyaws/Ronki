# Astra sparring brief: the Finch pass on the Ronki app (25 Sep 2026, night)

You are the outside sparring partner (read-only, do not edit any file). This is a sparring round BEFORE the build, not a findings review of finished work. Reply in at most 1,500 words.

## Read first

1. `C:\Users\öööö\.basic-memory\docs\two-model-review\HOUSE-RULES.md` (writing rules apply to all kid copy; deck rules do not apply, this is an app).
2. The active list in `C:\Users\öööö\.basic-memory\docs\two-model-review\LESSONS.md`, especially the three Ronki lessons of 25 Sep.
3. `HANDOFF.md` in this repo (top sections: the Bilderbuch go-live of 25 Sep, the decisions Marc already made).
4. `docs/prd/RONKI-V2-PRD.md` (sections 1 to 7: the July loop, onboarding v2, ethical guardrails, build/keep/cut) and `docs/strategy/NORTHSTAR.md` (what Ronki is and is not).
5. `docs/research/2026-09-25-finch-teardown.md` (Marc's Finch recording and the App Breakdown video, screen by screen, and the ten mechanics).
6. `docs/research/2026-09-26-ronki-feature-census.md` (what the app does today on main: onboarding chain, daily loop, every surface and how a kid reaches it).
7. `docs/reviews/2026-09-26-finch-pass/own-read-spar.md` (the orchestrator's direction and hypotheses, written before this brief).

## Who uses this, in one line

A German first grader (6 to 7, cannot read fluently) opens Ronki on a family tablet or phone in the morning before school and in the evening before bed, to do routine tasks with a dragon; a parent sets it up once. Nobody pays; no store, no ads.

## Marc's ask, verbatim in substance

Reduce the features on the app. Learn from Finch's onboarding and from what makes Finch work, and build what is missing for Ronki. Keep Ronki's essence, make it sticky, on par with Finch; "let's make Ronki even better" than Finch. Ship to main once tested (tonight).

## The questions

1. **Direction.** Is the orchestrator's read right? Where is it wrong, timid or over-built? Challenge it as hard as you would challenge Marc. Name what you would do differently.
2. **Beat Finch for a six-year-old.** Finch is built for adults who read. What would make Ronki clearly better than Finch *for a pre-reader and their parent*, not a copy with a dragon? Name at most five concrete moves, each one a thing the kid sees or does.
3. **The cut list.** From the census, which surfaces go (hidden behind a switch, code kept) and which stay? Be specific by surface name. What is the smallest set that still carries the essence (companion presence, feelings, the morning and evening)?
4. **The first session.** Write the ideal first 3 minutes for a family with no card, as a numbered screen list (kid sees, kid does, what Ronki says in first-grader German). Where does the parent come in, and how little can they be asked?
5. **The appointment.** Is "two trips a day, each tied to a routine" right, or is one trip (school day only) cleaner? What happens on weekends, holidays and evenings when the kid installs at 19:30?
6. **Sticky without dark patterns.** For each return trigger you propose, say why it is not a streak, a variable reward, a guilt device or session lengthening under PRD section 6.
7. **Build risk tonight.** What is most likely to break existing saves (Louis's save, the few live families), the QR card path, or the cloud sync? What must have a test?

## Assumptions to pressure-test

For each: how likely wrong, what happens on Louis's tablet, the cheapest test, the fallback. Add your own.

- A1. A kid who has no card can hatch Ronki first and a parent can finish setup on the same tablet in under a minute, without breaking the QR card path for families who made a card on ronki.de.
- A2. Pre-readers can follow a fire meter and "dots until Ronki grows" without numbers.
- A3. A return beat with a story at the next routine time brings the kid back more reliably than any mechanic Ronki has today.
- A4. Hiding mini-games, the extra tool list and the collections pages loses nothing Louis relies on daily.
- A5. The existing expedition code can carry the timed trip and the return without a rewrite.

## Reviewer habits to avoid (from LESSONS.md)

- Do not fix a risk by adding a hedge or a disclaimer to kid copy; change the design instead.
- Do not shrink every idea into "test it later". Marc wants a strong, tangible first version tonight; keep the idea tangible and make it safe.
- Challenge the orchestrator's pushback as hard as Marc's choices.

Close with one line: the single most important thing to get right tonight.
