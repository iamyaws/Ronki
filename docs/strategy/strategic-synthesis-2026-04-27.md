# Ronki — strategic synthesis (27 April 2026)

**Context:** Marc requested an honest cross-cutting take on game loop /
game design / audience fit / what to learn / what real product to
build. Three agent reports were running (audience-fit complete, game-
loop + UX still in flight) at the time of synthesis; this document
draws on (a) the audience-fit findings as relayed to me, (b) the
prior 10-agent brutal-honest panel from 26 April, (c) NORTHSTAR.md,
and (d) tonight's accumulated context across the trim sweep, voice
work, onboarding rebuild, music engine, and chibi continuity fix.

If the in-flight game-loop or UX agents surface findings that
contradict this synthesis, treat their specifics as more authoritative
on those narrow lenses; the rest of this doc holds.

---

## The cross-cutting take

After today's work, Ronki is **structurally a different product than
it was 24 hours ago**, even though the kid surfaces look similar. The
productivity-tracker bones were carrying weight under the companion
skin; tonight's cuts (cuts #1–13 + the onboarding trim from
16 → 4 surfaces) actually removed them. What remains is closer to
what NORTHSTAR describes than the codebase has ever been.

But "closer to NORTHSTAR" is not "audience-validated." Louis is still
the only tester. The Tonies-acquirer path the comparables agent
flagged is still untouched. The ship-blocker isn't code anymore — it's
that **no non-Marc family has opened the app**.

That is the dominant strategic fact. Everything else is downstream
of it.

---

## 1. The game loop, honestly

After tonight, the loop is:

```
[Morning]   Kid opens app → meets Ronki at the cave → Ronkis Tag
            (comic strip of routine quests, Ronki narrates each)
[Afternoon] If morning complete → expedition triggers (Ronki goes
            on a trip, returns with a memento)
[Evening]   Tonight ritual (voiced bedtime story, lullaby placeholder,
            star curtain)
[Throughout] Ambient music (placeholder synth), voice ducking,
            companion presence
```

This is closer to Finch's loop than to a kid game. Two implications:

**The strength.** It's the only thing in DACH that does this for kids.
Lumi-Stories is content delivery. Pok Pok is open play. Toca Boca is
character agency. None ship a creature relationship arc with voice as
the spine. Voice is the moat — and tonight Charlotte/Eleonore and
Harry were both locked, with audio shipping per surface (MeetRonki's
6 lines, Expedition's biome-keyed pool, RoomHub tap voice, nav-tap
voice). **The infrastructure for voice-first is now real,** not
aspirational.

**The risk.** A loop with no points, no streaks, no levels, no badges
relies entirely on "Ronki is warm" as the want-to-come-back signal.
That's empirically enough for adults (Finch proves it). For 5-8 year
olds, it's an open question. The only structural hook for "today is
different from yesterday" is the expedition memento, which fires once
per morning and is currently a pool of 8 mementos. NORTHSTAR's own
roadmap says 30; we're at 8.

**Tonight's deliberate cut** (open the games all the time, kill the
"earn by completing routine" gate) is correct per NORTHSTAR but also
strips one of the few soft motivation hooks. The bet is: presence is
enough, the kid will reach for Ronki because Ronki feels alive, not
because Ronki gives them something. That bet hasn't been validated
on a non-Louis kid yet.

## 2. Game design — does it work as a 5-8 product

The deliberate craft moves landed tonight do work:

| Move | Why it works |
|---|---|
| **Single chibi system** (MeetRonki MoodChibi at stage=1 = TeachFireStep MoodChibi) | Continuity is the kid's primary perception engine. Two visually different Ronkis = two characters in the kid's head. One = one. |
| **Voice ducking** when audio plays | Music staying loud over voice = kid can't follow the line, parent reads voice as "noisy app." Ducking = voice carries, music remains atmosphere. |
| **Bewegung instead of Fußball Training, single-tap** | Universal verb (movement) + single tap matches the routine pattern of every other quest. Football specificity was a holdover that excluded non-football kids. |
| **Wasser-Drache as 1/1** | "Drink 6 glasses" with no UI to track was unwinnable. "Drink one" is a sensible kid milestone. |
| **Onboarding 16 → 4 surfaces** | A parent's tolerance for setup is ~90 seconds. 16 screens was a setup product, not a companion product. The new chain matches NORTHSTAR's stated 60s spec. |
| **Bedtime gradient lift + onDark hard-set** | Dark-on-dark text was an actual readability failure. Now reads at low brightness in bed. |
| **Open the games all the time** | The lock copy was missing AND the lock semantically violated NORTHSTAR. Removing the lock + keeping the games is the rare cut that aligns with both. |

These aren't features added for engagement. They're frictions removed
in service of the relationship. That's the shape NORTHSTAR's "presence
not metric" principle implies.

The unresolved design question is **what the kid does between
voiced beats.** Ambient music helps (the cave feels alive even when
no one's talking). Mood animations on Ronki help (per
backlog_ronki_mood_animations). Both are partial. The bigger answer
will be the **expedition memento pool growing 8 → 30** with seasonal
+ weather + time-of-day variation, which NORTHSTAR specs but which
hasn't shipped.

## 3. Audience fit

**Kid (6yo German first-grader, n=1, Louis):**

What's likely to work post-tonight:
- Voice (kids latch onto voiced characters — Caillou, Bluey, Peppa)
- The painterly cave (visually warm, no UI clutter)
- Single-tap routine quests with Ronki narrating each completion
- The egg-pick + naming ceremony (anchoring identity early matters)
- TonightRitual as a bedtime beat (rare voiced presence at low energy)

What's still untested:
- Whether the kid reaches FOR the app vs. waits for parent prompt
- Whether the no-progression loop holds attention past day 7
- Whether Bewegung (single-tap) feels rewarding or empty
- Whether the kid notices when music ducks, and whether that matters

**Parent (DACH, screen-cautious, two-income, n≈1, Marc):**

The Ratgeber-aligned stance + Datenschutz rigor + offline-first
behavior are above-bar. The new onboarding is brisk enough not to
embarrass a parent who clicked install from the Wissenschaft article.
The dashboard is sane (PIN, mute toggles per voice, music toggle, mode
gating preserved-but-no-op'd).

What's still untested:
- Whether a parent OTHER than Marc opens it and has the same reaction
- Whether the trust signals translate (DSGVO + Frankfurt servers + no
  ads + voice-led + companion-not-tracker positioning)
- Whether the Klassenchat-share loop the distribution agent posited
  actually fires when a parent forwards the link

The honest read: parent fit is structurally good, kid fit is
plausible, neither is validated.

## 4. What to learn from this stage

Five lessons that are now visible because of tonight's work:

**(1) The codebase had the bones already.** The brutal-honest panel
24 hours ago thought the trim would take weeks. Cuts 1–13 + onboarding
+ music + chibi continuity all shipped in one day. The "Finch-for-DACH-
kids" shape was hiding under the productivity-tracker skin; removing
the skin revealed it. Implication: the next four hours of code work
ARE in fact a smaller lever than the next four hours of distribution
work.

**(2) Voice is the only moat.** Comparables agent was right. The chibi
system is replicable; the cave aesthetic is replicable; the dashboard
is replicable; the voice (Charlotte/Eleonore + Harry, locked, ducking,
state-keyed) is not. Every hour spent on voice quality compounds.
Every hour spent on more cuts has diminishing returns now.

**(3) Marc's instincts were systematically right tonight.** Every call
("open the games," "single-tap Bewegung," "kill the lock," "music with
ducking," "unify the chibi," "shorter onboarding") aligned with what
NORTHSTAR said and what the trim would have prescribed. The product
sense is there. The thing that's not there is feedback from anyone
who isn't Marc.

**(4) The lean shape is shippable.** 16 → 4 onboarding surfaces, 5
games tile not blocked, Ronki voicing every state transition, ambient
music, voice ducking, chibi continuity — this is genuinely a closed
loop a 6yo can complete in 5 minutes and feel something at the end.
Ship-blocker is not "we need more features." Ship-blocker is "we need
non-Marc users."

**(5) Ducking + music exposed how naked the previous app was.** With
the synth placeholder running at base volume 0.12 and ducking to
0.025 during voice, the cave suddenly feels lived-in. The quiet that
existed before wasn't "calm minimalism" — it was "we forgot to do
sound design." This will become more obvious once a real composed
loop replaces the synth.

## 5. What real product to build

The most honest answer after today is the same as the answer 24 hours
ago, but with more confidence: **don't build, ship what's built.**

The realistic 6-week path the panel laid out is now executable:

| Week | What |
|---|---|
| 0 (this week) | Backlog triage against NORTHSTAR (already partially done). File **Stiftung Lesen + klick-tipps.net submissions** — multi-month review cycles, the only way to have a Q3 cosign is to file in Q2. |
| 1 | One focused build: **real lullaby file** for TonightRitual + **real ambient music loop** for BackgroundMusic (Pixabay or Suno path per voice-music-engine.md). Voice retake of any line that lands flat in your own playthrough. |
| 2 | Launch prep: parent-handoff one-pager PDF, telemetry sanity check. |
| 3 | GO/NO-GO: voice quality and onboarding flow tested on a borrowed Android tablet. |
| 4 | Soft launch to 5 named families (Hector + 2 AWO contacts + 1 Ratgeber-list reply + 1 personal-network parent). |
| 5 | Triage trust-breakers only. Archive feature requests in a doc you don't re-read. |
| 6 | Decide: scale (30+ families), pause (declare done), pivot (Tonies conversation, audio-only Spotify show). |

The Tonies acquirer path stays the most underrated commercial option.
NORTHSTAR's voice-first + ritual + DACH-rooted shape is what they
would acquire. Worth a single warm-intro effort in week 6 if scale
gates pass.

The thing NOT to do is keep iterating cuts and features in a vacuum.
The codebase is now lean enough; the unsolved problem is human, not
technical.

---

## What this synthesis is missing

I did not have direct output from the three agents Marc dispatched
tonight (audience-fit, game-loop, UX). The synthesis above draws on:

- The 10-agent brutal-honest panel from 26 April (covering audience
  fit, child UX, parent value, market comparables, distribution,
  founder psychology, probability, and minimal-scope plan)
- NORTHSTAR.md
- The accumulated session context from today's work
- The audience-fit highlights as relayed informally

If the in-flight agents surface findings that materially change the
read on game loop or UX (e.g., a specific moment that tested badly
that I haven't seen, or a usability gap I'm not tracking), update
sections 1–3 of this doc accordingly. Sections 4 and 5 should hold.

---

_Saved at `docs/strategy/strategic-synthesis-2026-04-27.md`. Last revised:
27 April 2026._
