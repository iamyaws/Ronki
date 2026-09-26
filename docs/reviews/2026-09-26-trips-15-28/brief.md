# Astra review: Ronki's trips 15 to 28 (26 Sep 2026)

Read-only, do not edit any file. Reply in the PROTOCOL findings format (ID, severity, where, claim, why it matters, fix), at most 700 words, then HAPPY or NOT YET with the single biggest reason. Write any suggested replacement line in German, ready to paste, no em-dashes or en-dashes.

## Goal and reader

Ronki is a German routine app for children around six (first grade). A little dragon goes on one adventure a day when the child's morning routine warms his fire, and comes back with a treasure and a short spoken story (voice: an adult male voice, "Harry"). The first 14 trips are live; a daily child runs out of new ones after about two and a half weeks. These 14 new trips (t15 to t28) are the second wave. The listener is the child; the parent hears it too. Nothing here is shipped yet; Marc sees the texts after your pass and before any voice is recorded.

## Read first

- House rules and active lessons: `C:/Users/öööö/.basic-memory/docs/two-model-review/HOUSE-RULES.md`, the "Active" section of `C:/Users/öööö/.basic-memory/docs/two-model-review/LESSONS.md`.
- The guardrails: `docs/prd/RONKI-V2-PRD.md` section 6, and the "Finch pass" section of `HANDOFF.md` (what was removed and why: no streaks, no guilt, no loss framing, Ronki's warmth never depends on tasks).
- The trips: `src/data/finchLines.de.json`, key `trips`, t01 to t14 (live, the tone to match) and t15 to t28 (new). A story is told at the family's evening start after a day trip, or at breakfast after a dream trip, so it must work for both. The hook is said the evening before.
- Fable's own read: `docs/reviews/2026-09-26-trips-15-28/own-read.md`. Challenge it as hard as the texts.

## The questions

1. **A six-year-old listening.** Does every story make sense spoken once, with no picture? Anything that could frighten, confuse, or invite copying something unsafe?
2. **Ronki's essence and the guardrails.** Anything that reads as guilt, loss, pressure, rarity or reward-chasing, or that makes Ronki less gentle than the first 14?
3. **Spoken German.** Natural for a German parent? Any word or contraction a German TTS voice is likely to stumble on?
4. **The set.** Variety and order across t15 to t28, and the fit with t01 to t14 (repeated patterns, places or treasures too close to the first wave).
