# Finch pass: the orchestrator's own read before the panel (25 Sep 2026, 22:00)

Written before any designer or Astra sees the problem, so independent agreement can be spotted later.

## Marc's ask, restated in one line

Cut Ronki's features down, learn from Finch's onboarding and loop, and ship to main tonight whatever makes Ronki sticky and on par with (better than) Finch, without losing what Ronki is.

## What Ronki is (the essence that must survive)

- A small red-orange dragon who is the kid's friend through the school morning and the evening. Voice-first, warm, a little forgetful, never pushy.
- Routine-first for the parent ("my kid does the morning without a fight"), companion inside for the kid ("my dragon needs me").
- Fades by design: time-to-independence, not time-on-device. Short sessions, natural end beats.
- Hard guardrails: no calendar streaks or loss framing, no variable rewards, no guilt, no screen-time bargaining, no engagement notifications, kid copy a first grader can follow, and voice as the reading aid.

## What "sticky" means for Ronki

Not session length. **Return at the right moments**: the kid opens Ronki every morning and every evening because something is waiting (Ronki is back, he has a story, the fire wants warming), and closes it after 3 to 8 minutes because the moment is over. Finch's retention engine is the appointment plus the relationship; both fit Ronki. Streaks, shops with rerolls, and quests do not.

## My hypotheses (to be challenged)

1. **Egg first, card later.** The biggest gap: a family without a printed card cannot start (`App.jsx:839` NoProfileLanding wall). New default: first screen is "Du hast ein Drachen-Ei gefunden!" with the four eggs; "Ich habe schon eine Karte" is a quiet link. The parent step comes after the hatch ("Hol mal Mama oder Papa"), short, on the tablet, reusing CombinedParentSetup; the QR card stays for families who made one on the website and for the second device.
2. **Two appointments a day, both tied to a routine.** Morning tasks warm the fire; a warm fire sends Ronki out on a day trip while the kid is at school; he is home at evening routine time with a treasure and a short story. Evening tasks warm the fire again; Ronki goes on a dream trip overnight and tells it at breakfast. Every open has a payoff, every payoff sits at a routine time. This closes "Bis morgen. Versprochen." for real.
3. **Day 1 is special and never ends empty.** Onboarding ends with the fire half warm and one tiny first task done together, so Ronki leaves on his first trip on the first day, whatever time it is (evening install means a dream trip, back at breakfast).
4. **Growth counts adventures, never days.** "Noch 3 Abenteuer, dann wird Ronki größer." Dots, not numbers, for pre-readers. Absence never subtracts.
5. **One home screen.** Ronki in his nest, the fire, the next thing to do, one pill. Nothing else loud. The day strip stays reachable from home, not a separate world.
6. **Ronki's passport replaces the heavy profile page.** Name, how many days old, "Freund von {Kind}", adventures, places, treasures, what the kid taught him. Pride of ownership (Finch's best screen).
7. **Cut the navigation hard.** Target three tabs at most (Nest, Ronki, Buch or similar). Mini-games, extra tools, collections that lengthen sessions go behind a single feature switch, off by default (code stays, reversible). Feelings stay reachable from the "Wie geht's dir?" entry because they are pillar 1 of NORTHSTAR.
8. **Ronki asks, the kid teaches.** Keep the fire-breath teach beat (Ronki's version of Finch's "what is a name?"), and let the passport remember it ("Hat von Louis gelernt: Feuer pusten").
9. **Voice every new kid-facing line** with the existing Harry pipeline, checked with Whisper as the name chips were.
10. **Measure the funnel** with the eight PRD events so gate 1 (15 Dec) reads something real.

## What I am least sure about

- Whether the kid should pick the first routine tasks (Finch lets the user pick goals) or the parent. Autonomy says kid; reliability says parent. A middle: the parent's routine is the default, the kid picks which one Ronki and they do first.
- Whether a twice-daily trip is too much content to write tonight (each trip needs a story and a treasure; the pool is small).
- How much of the existing expedition code already does this; the census will tell.
- Whether cutting the games and tools tab hurts Louis, the only real tester. Reversible switch, so low risk.
