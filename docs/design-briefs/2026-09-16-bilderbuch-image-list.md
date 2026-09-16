# Bilderbuch image list (16 Sep 2026)

_What to generate once image tokens are back. Ordered so the first batch unlocks the website switch, the second the app switch. Decisions behind it: white ground, cobalt hero and inverted cobalt action card, Fredoka headlines, same look in app and website (Marc, 16 Sep 2026)._

## Base prompt (prefix for every image)

> Children's picture-book illustration of Ronki, a small chubby dragon: red-orange body (#EE4F35) with darker freckles, cream horns, cobalt-blue spiky crest along head and tail (#0544B0), big dark eyes with two white highlights, small dark claws, soft belly, head about half the body. Flat confident colours, dark marker outline with slight wobble, crayon and risograph grain on large colour areas, warm near-white paper (#FDFBF3). Palette limited to cobalt #0544B0, sky blue #41A2FB, pale sky #B9E3FC, red-orange #EE4F35, sun yellow #FDD134, night blue #04225E, ink #040812. No text, no letters, no speech bubbles, no UI. Square composition unless stated.

Every prompt below appends to this prefix. "No text" matters: text gets set in code so it stays sharp, translatable and readable by screen readers.

## 0. Character sheet, before anything else

| # | Image | Prompt addition | Format |
|---|---|---|---|
| 0.1 | Turnaround | Front, three-quarter, side and back view of Ronki standing, neutral pose, evenly spaced on one sheet | 2048 x 1024 |
| 0.2 | Expressions | Six heads in a grid: happy, curious, sleepy, wild (scribble mood), heavy (sad), calm | 2048 x 1024 |
| 0.3 | Poses | Sitting, sleeping curled up, holding something up in one claw, hugging a cloud, waving, walking | 2048 x 1024 |
| 0.4 | Egg and hatch | The spotted egg (cream with cobalt spots) closed, cracking, and Ronki peeking out | 2048 x 1024 |

Reference 0.1 to 0.3 in every later prompt ("same character as the attached sheet"). If the model drifts, regenerate the sheet, not the scene.

## 1. Website, first batch (unlocks the website switch)

| # | Image | Where it is used today | Prompt addition | Format |
|---|---|---|---|---|
| 1.1 | Hero: Ronki on the cushion | `/` hero (replaces `art/routines/brushing-teeth.webp`) | Ronki lying on a cobalt cushion in a cosy kid's room, shelf with plant, toy boat and star, morning light, looking at the viewer | 1024 x 1280 portrait |
| 1.2 | Morning routine | `/vorlagen/morgenroutine`, `/ratgeber/morgenroutine-grundschulkind`, article OG | Ronki brushing teeth at a small sink, foam on the snout, blue tiles, towel on a hook | 1280 x 1024 |
| 1.3 | Evening routine | `/vorlagen/abendroutine`, `/ratgeber/abendroutine-grundschulkind`, article OG | Ronki asleep in a starry cobalt blanket, lamp glowing, moon in the window, blue bunny plush | 1280 x 1024 |
| 1.4 | Little siblings | `/vorlagen/kleine-geschwister` | Ronki sitting next to a much smaller hatchling, both holding one picture card, paper ground | 1280 x 1024 |
| 1.5 | ADHS morning plan | `/vorlagen/adhs`, `/ratgeber/morgenroutine-adhs`, article OG | Ronki pointing at one big picture card on a wall, the others faded behind, a wooden clothes peg on the card, calm | 1280 x 1024 |
| 1.6 | Trödeln | `/ratgeber/morgen-troedeln` | Ronki sitting on the bed edge with one sock in his claw, looking out of the window, sunrise | 1280 x 1024 |
| 1.7 | Zähneputzen | `/ratgeber/zaehneputzen-ohne-streit` | Close view of Ronki and a toothbrush, foam, water splashes, grinning | 1280 x 1024 |
| 1.8 | Einschulung | `/ratgeber/einschulung-selbststaendigkeit` | Ronki with a small red school bag on his back, standing at a door, ready | 1280 x 1024 |
| 1.9 | Sticker-Charts | `/ratgeber/sticker-chart-alternative` | Ronki looking at a wall chart full of stickers, unimpressed, one crayon in claw | 1280 x 1024 |
| 1.10 | Kinder-Apps | `/ratgeber/was-kinder-apps-machen`, `/ratgeber/dark-patterns-kinder-apps` | Ronki sitting on top of a tablet that shows only a night sky, closing it with his tail, calm | 1280 x 1024 |
| 1.11 | Eltern-Bereich | `/ratgeber/eltern-bereich`, `/fuer-eltern` | Ronki peeking over a small wooden gate with a heart lock, playful | 1280 x 1024 |
| 1.12 | Wie es funktioniert | `/wie-es-funktioniert` | Three small scenes in one frame: Ronki waking, Ronki with the morning card, Ronki telling a story at night | 1600 x 900 |
| 1.13 | Wissenschaft | `/wissenschaft` | Ronki reading a big open book on the floor, glasses slid down the snout | 1280 x 1024 |
| 1.14 | FAQ | `/faq` | Ronki tilting his head, one claw raised, big question-mark-shaped cloud drawn in crayon behind him | 1280 x 1024 |
| 1.15 | Karte / QR | `/profil-erstellen`, card front | Ronki holding up a blank trading card proudly, sunburst behind, heroic | 1024 x 1280 portrait |
| 1.16 | 404 | `/404` | Ronki in the dark with a flashlight, looking around, lost but cheerful | 1280 x 1024 |
| 1.17 | Default share image | `og-ronki.jpg` and every page without its own | Ronki waving, big and centered, plain paper ground, lots of empty space right for a title | 1600 x 840 |
| 1.18 | Print posters | Hort, Kinderarzt, Bäckerei, Zähne posters | Ronki at a fridge with a routine sheet, one clean scene with empty top third for the headline | 1280 x 1600 portrait |

Website count: 18 motifs. Share images (OG) are cut from 1.2 to 1.14 in code, no extra generation.

## 2. App, second batch (unlocks the app switch)

| # | Image | Where it is used today | Prompt addition | Format |
|---|---|---|---|---|
| 2.1 | Egg shelf | Onboarding `egg-fire`, `egg-golden`, `egg-spirit`, `dragon egg` | Three eggs on a mossy shelf: one warm red-orange spotted, one sun yellow, one cobalt; each also as a single cut-out | 1024 x 1024 plus 3 cut-outs |
| 2.2 | Hatching | `companion/dragon-hatching.webp` and the mp4 | Cracked egg, Ronki peeking out with "Oh. Hallo." feeling (no text), sparks | 1024 x 1024 |
| 2.3 | Ronki stages | `dragon-baby`, `dragon-young`, `dragon-majestic`, `dragon-legendary`, `ronki-stage-1` | Five growth stages side by side on one sheet: hatchling, baby, young, grown, legendary with small wings; then each as a cut-out on transparent ground | sheet 2048 x 1024, cut-outs 1024 x 1024 |
| 2.4 | Mood set | `MoodChibi` (drawn in code today) | Six full-body poses matching the expression sheet: happy, curious, sleepy, wild, heavy, calm, transparent ground | 6 x 1024 x 1024 |
| 2.5 | Feeling doodles | Feelings screen ("Leicht", "Wild", "Schwer" and the five in 04) | Crayon icons on paper: sun, orange scribble ball, blue drop, rain cloud, flame, moon, purple tangle | 7 x 512 x 512 |
| 2.6 | Cave / Zuhause | Home screen ground, `bg-warm-cream`, `bg-parchment`, `hero-shop`, `hero-journal` | Ronki's room: cobalt cushion, shelf, window, book with heart, empty middle for UI | 1024 x 1536 portrait |
| 2.7 | Morning scene | `routines/morning-prep.webp`, RonkisTag morning panel | Ronki stretching in bed at sunrise, window with sun | 1280 x 1024 |
| 2.8 | Teeth scene | `routines/brushing-teeth.webp` | Same as 1.2, app crop | 1280 x 1024 |
| 2.9 | Clothes scene | RonkisTag "Was ziehst du heute an?" | Striped shirt and a water bottle laid out on a bed, small Ronki peeking from the side | 1280 x 1024 |
| 2.10 | Breathing | TeachBreathBeat, "Ein Atemzug zusammen" | Ronki hugging a soft cloud, eyes closed, sky-blue ground | 1024 x 1280 portrait |
| 2.11 | Tangle | "Alles ganz verknotet" calm screen | Ronki looking at a big orange scribble ball, gentle, sky-blue ground | 1024 x 1280 portrait |
| 2.12 | Morgenwald | `bioms/Morgenwald`, expedition, `micropedia/chapter-forest` | Forest edge at morning, path, one bird, Ronki holding up a red leaf | 1280 x 1024 |
| 2.13 | Expedition biomes | `bioms/Sonnenglast`, `Sternenmeer`, `Wolkengrat`, `Naschgarten`, `Crystalpalast`, micropedia chapters | Five landscapes in the same crayon style, no Ronki: sunny highlands, sea of stars, cloud ridge, sweet garden, crystal palace | 5 x 1280 x 1024 |
| 2.14 | Mementos | Expedition returns (8 today, PRD wants 30) | Small single objects on paper: red leaf, blue feather, smooth stone, shell, pine cone, star fragment, crystal shard, acorn, snail shell, ribbon | 10 x 512 x 512 to start |
| 2.15 | Book page | "Unser Buch", `journal.webp`, `hero-journal` | Open scrapbook page with taped leaf and a crayon drawing of Ronki, warm page ground | 1024 x 1280 portrait |
| 2.16 | Good night | TonightRitual, `background/deep night sky` | Same as 1.3, app crop, more empty space at the top for the headline | 1024 x 1536 portrait |
| 2.17 | Sky backgrounds | `background/` four panoramas | Four tall soft skies in crayon: early morning, midday, golden hour, deep night, no characters | 4 x 1024 x 2048 |
| 2.18 | Freunde | `freunde/` seven friends (Brückenbauer, Flackerfuchs, Lichtbringerin, Pilzhüter, Sternenweberin, Tiefentaucherin, Windreiterin) | Each friend redrawn in the same crayon style, one per image, transparent ground | 7 x 1024 x 1024 |
| 2.19 | Drachenmutter | `companion/drachenmutter.webp` | Large gentle dragon in night blue with a cream belly, curled around, calm | 1024 x 1280 portrait |
| 2.20 | App icon | `icon-192`, `icon-512`, `ronki-egg-logo` | Ronki's head only, front, on cobalt circle, bold and simple | 1024 x 1024 |

App count: 20 motifs, about 45 files. The mini-game art (Starfighter, ColorMix), bosses, micropedia creatures, birthday scenes and the poem days are not in this list: the PRD cuts Starfighter and CloudJump, and the rest waits until the core loop is on the new look.

## 3. Rules for the batch

- Generate 0.1 to 0.4 first, check them against the boards, then reference them in every scene.
- One motif per image, no text, no UI, no speech bubbles. Text and bubbles are built in code.
- Keep 20 percent empty space where the headline goes (top for portrait screens, right for the share image).
- Export at the listed size, then the repo script converts to WebP (`cwebp -q 82`), and the website prerender picks OG crops from the article images.
- Name files by the table number and slug (`1-02-morgenroutine.png`) so the swap into `website/public/art/` and `public/art/` is a mapping, not a hunt.
- Budget check: batch 1 is 18 generations plus 4 sheets; batch 2 about 45. At a few retries each, plan for roughly 100 generations in total.
