# Higgsfield log: Wesen creatures (26 Sep 2026)

Marc's go: "improve the artwork, happy to generate new" (26 Sep 2026). Balance before: 239 credits.

## References uploaded

| Media id | File |
|---|---|
| fbda41c2-b726-4181-b308-36cfcfdce56e | `public/art/bilderbuch/ronki/calm.webp` on white (master cut-out) |
| 7b9318b2-c0e0-42cb-b285-5c4911d615ff | `public/art/bilderbuch/ronki/happy.webp` on white |

## Shared prompt prefix

> Children's picture-book illustration in exactly the same drawing style as the reference images of Ronki the baby dragon: flat confident colours, dark marker outline with a slight wobble, crayon and risograph grain on large colour areas, big dark glossy eyes with two white highlights, soft rounded shapes, gentle and friendly. The new creature is NOT a dragon and must not look like Ronki, and must not resemble any existing franchise creature (no Pokemon, no Digimon, no Ghibli characters). Character growth sheet on a plain warm cream background: the same creature shown three times side by side on one baseline, left to right growing up, same colours, same eyes, same markings, each clearly bigger and more capable, generous space between them. [...] No text, no letters, no labels, no UI.

## Generations

All `gpt_image_2_5`, quality high, 2k, 16:9, references both uploads. 2.75 credits each (per the 25 Sep log).

| # | Job | Creature, prompt core | File |
|---|---|---|---|
| 1 | 0264f8f0-b373-4d2c-a553-428d28bd7ad1 | Glutfunke: coal-pebble ember sprite, charcoal body with glowing orange and yellow cracks, flame curl, stubby feet, rosy cheeks; friend holds a twig torch; grown: chubby hearth keeper, knitted cobalt scarf, lantern glow in the belly, candle-crown flame | `docs/design-incoming/wesen/sheet-glutfunke.webp` |
| 2 | 094b21e0-22ce-4b38-bbb1-a6d2e2fdb067 | Moosmops: round moss puff, snub nose, leaf-tip ears, clover tuft; friend with white flowers and a red mushroom cap; grown: cuddly moss hill with a flower and mushroom crown and a blue-yellow bird on its head, nothing growing out of its back | `docs/design-incoming/wesen/sheet-moosmops.webp` |
| 3 | 05515958-f262-48c4-b88c-1b4fbe507e00 | Tropfi: snail with a water-drop shell and a white swirl, cream-yellow body; friend with a water lily inside the shell; grown: shell like a small pond, a small smiling rain cloud above | `docs/design-incoming/wesen/sheet-tropfi.webp` |

All three on model at the first try. Design choices made before Astra's round 1 and confirmed by it: no fire fox (too close to an existing fire-type fox), no tree on the back.

## Cut-outs

No separate cut-out generations: the nine looks were cut from the three sheets locally (background flood-filled from the border, scipy, 1.2 px feathered alpha; the intermediate PNG cut-outs were not kept, the originals are the sheets as WebP q90), squared on a shared baseline, exported to `public/art/bilderbuch/wesen/{creature}-{small|friend|grown}.webp` (512 px, about 55 to 75 KB each). Relative size between looks is set in code, not in the files. Checks: `docs/design-incoming/wesen/edge-check.png` (dark and cream ground), `nest-size.jpg` (beside Ronki in the Zuhause scene at phone size).

Total: 3 generations, about 8.25 credits.
