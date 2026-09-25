# Orchestrator's own read before Astra's design review, round 1 (25 Sep 2026)

Written from the renders in `renders/`, my own browser pass at 390 x 844 (onboarding with the blue egg, home, day strip) and the four lane reports, before opening Astra's reply.

## What works

- One dragon everywhere the core loop goes: hatch, name, first breath, home, day, evening, profile, diary, book. The character sheet held; no drift between 40 images.
- The hatch is the moment the video promised: pick an egg, it trembles, the clip cracks it, Ronki peeks out of that same egg and wears its shell afterwards.
- Home reads alive: the room loop (plants, boat, sun) with Ronki breathing on his cushion and one speech bubble.
- The night is calm: the sleeping loop, one line of story, two quiet links.

## Weak spots I expect a reviewer to find

1. **Egg tiles are small** (render 04): the eggs fill about a third of each tile. A six-year-old picks by picture, the eggs should be twice the size. SHOULD.
2. **Free-text naming** (render 07) still stalls pre-readers, as the July PRD audit said. Name chips were out of scope for a visual pass; the gap stays. SHOULD, follow-up.
3. **Fire puff in the first breath** (render 09 era) is still the old gradient blob, the only gradient left in the kid flow. COULD.
4. **Parent setup** (render 02): the small egg is cut off under the alpha banner at the top. COULD.
5. **Home density** (render 30): below the room there are the mood tiles, one pill, the night card, the asks, tiles and mementos. That is more than one idea for a first grader; the one primary action rule holds, but the page is long. CHALLENGE for Marc, not a fix tonight.
6. **Weight**: the home screen loads the room MP4 (0.26 MB) plus the idle WebP (1.4 MB); the pinned Ronki elsewhere uses stills. Acceptable on Wi-Fi, untested on a Fire HD.
7. **Behaviour drift risks**: the lanes report no logic changes, and Astra's round 1 confirmed navigation and celebration gating. Remaining risk sits in the three big rewrites (RoomHub 1390 to 678 lines, RonkisTag 1123 to 684, RonkiProfile): a lost handler or event there would not show in a render.

## Assumptions, my rating

A1 animated WebP on an old iPad and a Fire HD: medium risk, untested; fallback is the still (reduced motion path). A2 room reads alive with Ronki as a layer: low risk, confirmed in the browser. A3 variant collapse safe: low risk, the old ids are still written. A4 parent screens readable: medium risk, the dashboard and legal pages were not looked at. A5 Fredoka readable: low risk.
