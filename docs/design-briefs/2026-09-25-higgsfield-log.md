# Higgsfield log: Bilderbuch app art (25 Sep 2026)

_Every generation for the app rollout, with prompt, model, cost and where the file went. Marc's go: "use mcp like higgsfield as in the video" (25 Sep 2026). Budget cap for this run: 450 of 675 credits. One variant per loop._

## Shared prompt prefix (character)

> Children's picture-book illustration of Ronki, a small chubby baby dragon: red-orange body (#EE4F35) with darker orange freckles, red fin-shaped ears with a lighter inner edge, cream horns with a dark outline, a cobalt-blue spiky crest (#0544B0) running from the head down the spine to the tail tip, big dark glossy eyes with two white highlights, thin dark eyebrows, lighter tan belly, small black claws, curled tail, head about half the body. Flat confident colours, dark marker outline with a slight wobble, crayon and risograph grain on large colour areas. Exactly the same character as in the reference images. [...] No text, no letters, no UI.

## Reference uploads

Crops from Marc's 16 Sep boards (`~/.codex/generated_images/01a09c1d...`), uploaded as media:

| Media id | Crop |
|---|---|
| 25ebc504 | board 05, Ronki breathing with the cloud, full body |
| a981dbd3 | board 01 (Feelings Playbook), hatching from the cream egg with cobalt spots |
| df53bc79 | board 02 (Feelings Playbook), Zuhause room with the cobalt cushion |
| d5042405 | board 06, Morgenwald with the red leaf |

## Generations

| # | Job | Model, settings | What | Credits | Used as |
|---|---|---|---|---|---|
| 1 | b1fcca92 | gpt_image_2_5 high 2k 16:9 | Turnaround sheet (front, three-quarter, side, back) | 2.75 | Reference for every later prompt |
| 2 | 65c5be99 | gpt_image_2_5 high 2k 16:9 | Expression sheet (happy, curious, sleepy, wild, heavy, calm) | 2.75 | Reference for the mood set |
| 3 | 58eaac7e | gpt_image_2_5 high 2k 1:1 transparent | Master cut-out, sitting, calm | 2.75 | `ronki/calm` and master reference |

Batch A (refs: turnaround b1fcca92, master 58eaac7e, expression sheet 65c5be99, room df53bc79, leaf d5042405). All gpt_image_2_5, quality high, 2k, 2.75 credits each.

| # | Job | Format | Prompt core (after the prefix) | File |
|---|---|---|---|---|
| 10 | 08f2d836 | 9:16 | Ronki relaxed on a round cobalt cushion bed on a red-orange and cream rug; shelf with plant, toy boat, pebble friends, star plush; window with morning sun; blue book with a heart; top quarter plain wall, bottom fifth plain floor | `scenes/zuhause-ronki` |
| 11 | 1fad0eb5 | 9:16 | Asleep in a small bed under a cobalt blanket with sun-yellow stars, blue bunny plush, star lamp, crescent moon window, night-blue room; top third calm sky | `scenes/nacht` (and start and end frame of the night loop) |
| 12 | 66f96ac4 | 9:16 | The cream egg with cobalt spots in a cobalt blanket nest on the cushion, warm morning light, a few sparkle marks, egg closed | `scenes/hatch` (start frame of the hatch clip) |
| 13 | d5685b24 | 9:16 | Sits up in bed and stretches with a big yawn, sun rising over hills in the window | `scenes/morgen` |
| 14 | 4ca0f15d | 9:16 | Morgenwald: forest edge, sandy path, sun, small blue and yellow bird; Ronki holds up a red maple leaf | `scenes/morgenwald` |
| 15 | c04e7a32 | 1:1 | App icon: Ronki's head, front, on flat cobalt filling the canvas | `icon/icon-master`, then `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (padded to 80 percent for the maskable safe zone) |
| 20 to 24 | 54a093f1, 20bc55bb, 630b15e0, da1c7c7e, 73f76cf0 | 1:1 transparent | Mood set: happy (open smile, one tooth), sleepy (rubbing an eye, small yawn), heavy (hunched, one small tear, holding his tail), worried (claws pressed together, glancing aside), proud (fists on hips) | `ronki/happy`, `sleepy`, `heavy`, `worried`, `proud` |
| 25 | 0ec70927 | 1:1 transparent | Jumping for joy, both arms up, eyes squeezed shut | `ronki/cheer` |

Batch B (same settings, 2.75 credits each).

| # | Job | Prompt core | File |
|---|---|---|---|
| 30 | 78dd58af | Newborn hatchling, rounder, horn nubs, eggshell piece on his head | `ronki/baby` |
| 31 | ea30155e | Older, taller school-child dragon with two small wings | `ronki/grown` |
| 32 | 703f29d8 | Grown and legendary, big wings spread, a few sun-yellow sparkles | `ronki/legendary` |
| 33 to 36 | ca06d662, a0d4abff, dd8c022b, 1a3313e9 | Waving; hugging a cloud (eyes closed); holding up a red leaf; curled up asleep | `ronki/wave`, `cloud`, `leaf`, `sleep` |
| 40 to 44 | 9e938849, 592ef9f5, 803d77e8, ae427ccb, d5600935 | Eggs: cream with cobalt spots; red-orange freckled; sun yellow with cream stars; cobalt with sky spots; cream egg with a zigzag crack and sparks | `eggs/egg-cream`, `egg-ember`, `egg-sun`, `egg-cobalt`, `egg-cracked` |

Batch C (same settings, 2.75 credits each).

| # | Job | Prompt core | File |
|---|---|---|---|
| 50 | c1ab78c6 | Exactly the room of #10, cushion empty (reference: #10) | `scenes/zuhause` (start and end frame of the room loop) |
| 51 | 6adea046 | Exactly the scene of #12, the egg hatched, tiny Ronki peeking out with the shell top on his head (refs: #12, master, board crop) | `scenes/hatch-end` (end frame of the hatch clip) |
| 45 | 920e6de8 | Tiny Ronki peeking out of the broken cream egg, cut-out | `eggs/egg-peek` |

Images total: 31 generations, 85.25 credits. Every image came out on model at the first try; no retries.

## Loops (Seedance 2.5, omni_reference, 720p, no audio)

Start frames for the transparent character loops are the cut-outs composited locally on flat green (#00B140), uploaded as media: idle 88cad6e5, cheer c723dc45, cloud 216a53dc. The research memo (`docs/research/2026-09-25-animated-companion-benchmark.md`) recommended keeping Ronki out of the room video so he can react to moods; the room loops empty and Ronki sits on top.

| # | Job | Length, ratio | Start, end | Prompt core | Credits |
|---|---|---|---|---|---|
| 60 | 8e50c753 | 5 s, 9:16 | empty room #50, same | Locked camera; plant leaves sway, toy boat rocks, sun rays twinkle, trees outside move; everything else still; no characters | 35 |
| 61 | 7d87d166 | 5 s, 1:1 | idle green, same | Breathes slowly, blinks twice, tilts head and back, tail tip flicks, ears twitch; same spot and size; flat green stays flat | 35 |
| 62 | 4fa83c5c | 4 s, 1:1 | cheer green, same | One jump for joy, arms high, laughing, lands in the same pose | 28 |
| 63 | f8428d0e | 6 s, 1:1 | cloud green, same | Three seconds in (chest, belly and cloud swell), three seconds out | 42 |
| 64 | b8d9cb6a | 5 s, 9:16 | hatch #12, hatch-end #51 | Egg wobbles twice, zigzag crack, chips pop, top lifts, tiny Ronki peeks out; sparks | 35 |
| 65 | 879dd4c9 | 5 s, 9:16 | night #11, same | Blanket rises and falls with his breath, star lamp glow pulses, window stars twinkle | 35 |

Note: the first submission of 60 and 62 to 65 was answered with preset suggestions ("IN THE DARK", "DROWN IN MUSIC") instead of jobs; resubmitted with the presets declined. No credits were spent on the suggestions.
