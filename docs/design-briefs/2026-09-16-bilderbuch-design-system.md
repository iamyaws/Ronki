# Ronki "Bilderbuch" design system (extracted 16 Sep 2026)

_Source: three boards Marc generated with ChatGPT image generation on 16 Sep 2026 ("RONKI / 02, Das lebendige Bilderbuch" and "RONKI / FEELINGS PLAYBOOK", screens 01 to 08). Status: proposal. Nothing on ronki.de or app.ronki.de uses it yet._

Working name: **Bilderbuch**, after Marc's own line on the board, "Das lebendige Bilderbuch".

## 1. What the style is

A living picture book. Flat, confident colour on warm paper, drawn with marker outlines and crayon grain. One big hand-lettered question per screen, one character, one clear action. The dragon does the talking in short speech bubbles; the UI stays almost silent.

It is not the current system. The current website and app follow "Mystic Meadow" (`DESIGN.md`) and the parent-site direction in `.impeccable.md`: teal, mustard and sage, painterly watercolour, calm editorial. Bilderbuch keeps the warmth and the anti-pressure voice but trades teal and watercolour for cobalt, red-orange, sun yellow and crayon.

## 2. Colour tokens

Measured on 16 Sep 2026 from the original board files in `C:\Users\öööö\.codex\generated_images\01a09c1d-a841-7512-b7b9-4b8bf0645b4e` (dominant colour per sampled region).

| Token | Hex | Role on the boards |
|---|---|---|
| `paper` | `#FDFBF3` | Page and screen background, speech bubbles |
| `paper-warm` | `#FDF6E1` | Cards on paper, secondary buttons, sheet ground |
| `paper-deep` | `#E8DBBF` | Book pages, aged edges |
| `ink` | `#040812` | Headlines, outlines, icons |
| `cobalt` | `#0544B0` | Primary buttons, selected rings, blobs, active tab, labels |
| `sky` | `#41A2FB` | Full-bleed calm screens ("Alles ganz verknotet?", "Ein Atemzug zusammen") |
| `sky-wash` | `#B9E3FC` | Soft background panels, clouds, category chips |
| `ember` | `#EE4F35` | Ronki's body, the "wild" scribble, home icon, active book icon |
| `sun` | `#FDD134` | Sun, stars, sticker badges |
| `night` | `#04225E` | Evening and sleep screens ("Schlaf gut.") |
| `leaf` | `#4E9A4A` | Forest scenes only (estimated, not sampled) |
| `worry` | `#6B4BB0` | Only the "Unruhig" feeling (estimated, not sampled) |

Rules the boards follow:
- Paper is the default ground. Cobalt, sky and night are grounds only for whole moments (calming down, sleeping), never for dense content.
- One accent per screen does the work. Ember is Ronki; yellow is light and praise; cobalt is "you can press this".
- No gradients in UI. Colour washes and grain live inside illustrations only.
- No drop shadows. Depth comes from overlap, outlines and paper texture.

Contrast with the measured values:
- White on cobalt, ink on paper and cobalt-deep on paper are all comfortably readable.
- Sun on paper is decoration only, never text.
- Ember is fine for large shapes and icons, not for small text on paper.

## 3. Type

The lettering on the boards is generated, not a real font. Three voices appear:

| Voice | Where | Candidates to test (open licence, self-hosted) |
|---|---|---|
| Hand-lettered display: heavy, rounded, slightly wobbly, lowercase and title case | Screen questions ("Was ist heute los?"), website hero | Bagel Fat One, Lilita One, Baloo 2 ExtraBold |
| Friendly hand print for UI | Buttons, tabs, feeling labels ("Leicht", "Zuhause") | Andika, Nunito Bold, Baloo 2 SemiBold |
| All-caps handwriting for notes | Side notes and stickers ("Du bist genau richtig") | Gochi Hand, Caveat Brush |

Rules:
- Display lettering only for one headline per screen, never for running text.
- Parent-facing long text (Ratgeber, Datenschutz, template how-to) keeps a highly readable text face. Be Vietnam Pro can stay.
- All fonts self-hosted. The app still loads Plus Jakarta Sans, Be Vietnam Pro, Fredoka and Material Symbols from fonts.googleapis.com today; that should move to self-hosting regardless of this proposal.

## 4. Shapes and components

- **Primary button:** full pill, cobalt fill, white hand-print label, optional arrow ">" at the end. Height about 56 px on mobile. Examples: "Hallo, Ronki", "So fühlt es sich an", "Ins Buch legen".
- **Secondary button:** full pill, paper fill, thin cobalt or ink outline. Examples: "Weiß ich noch nicht", "Erst mal anschauen", "Das reicht für jetzt".
- **Quiet exit:** underlined text link, never a button. Example: "Für heute fertig".
- **Sound button:** round, paper fill on dark grounds or cobalt fill on paper, speaker icon, always next to the action it reads out.
- **Choice tiles:** a doodle symbol plus one word (sun "Leicht", scribble "Wild", drop "Schwer"). The selected tile gets a hand-drawn cobalt ring, not a fill or a checkmark.
- **Speech bubble:** paper fill, ink outline, short tail toward Ronki, two lines at most.
- **Tab bar:** three doodle icons with labels (Zuhause, Entdecken, Unser Buch); active tab gets the colour and a short hand-drawn dash below.
- **Top bar:** back chevron left, sound or parent lock right, nothing in between but the headline.
- **Frame:** rounded corners around 28 px on cards and device frames, ink outline about 3 px.
- **Blobs and stickers:** organic cobalt blobs with crayon grain and yellow star stickers as page decoration on the website only.

## 5. Illustration rules

- **Ronki:** red-orange body with darker freckles, cream horns, cobalt spiky crest along head and tail, big dark eyes with two white highlights, small dark claws, soft belly. Chibi proportions: head about half the body.
- **Line and texture:** dark marker outline with slight wobble, flat fills, crayon or risograph grain on large colour areas, paper grain everywhere.
- **Feelings as doodles:** sun for light, scribble ball for wild, rain cloud or drop for heavy, flame for angry, moon for tired, purple tangle for restless. The same symbol means the same feeling everywhere.
- **Scenes:** one situation, few props, the colour world limited to the tokens above.
- **Consistency needs a character sheet first:** front, side, back, six expressions and three poses, generated once and then referenced in every prompt. Without it, a set of 40 to 60 images will drift.

## 6. Voice on screen

The boards already speak Ronki's language and fit the anti-pressure positioning: "Wir machen langsam.", "Das reicht für jetzt", "Für heute ist es genug.", "Weiß ich noch nicht". Keep it: one question, one line from Ronki, one action, one quiet way out. No counters, no streaks, no rewards on these screens.

## 7. Compatibility with what exists

| Area | Today | Effect of switching |
|---|---|---|
| Brand direction | `.impeccable.md` names "bright primary-colour kid app" as an anti-reference and asks for calm, painterly, editorial | Direct conflict. Adopting Bilderbuch is a conscious change of direction and that file needs rewriting. |
| Mascot art | About 144 image files in the app plus website art, OG images and trading cards show the current painterly dragon | Mixing old and new dragon looks broken. The art has to be replaced as a set, which is the biggest cost, and it comes from image generation, not from code. |
| Website colours | Tailwind tokens in `website/src/styles/globals.css`, used about 1,450 times across 54 files, plus about 580 hard-coded hex values | Remapping the tokens is quick; the hard-coded values and the teal-named utilities need a sweep. |
| App colours | Material-style tokens in `src/index.css`, about 2,500 hard-coded hex values across 91 files | A real refactor. Do it screen by screen. |
| Fonts | Website self-hosts two fonts; the app loads four font families from Google | New display and hand fonts need self-hosting either way. |
| Print templates and PDFs | Built from the website print routes | Re-render after the website switch; the pipeline stays. |
| Functionality | Funnel, cards, storage, consent, analytics | Not affected. This is a visual layer. |

## 8. What can be built in code and what cannot

- **In code, faithfully:** colour tokens, pill buttons, choice tiles with the drawn ring, speech bubbles, tab bar, blobs, sticker shapes, paper grain as a light overlay texture, doodle icons as SVG, the screen layouts.
- **Not in code:** the dragon, the scenes and the crayon texture inside illustrations. These must come from the image model, with a character sheet and reviewed prompts, and then be exported as optimised WebP.

## 8b. Side-by-side specimen (16 Sep 2026)

Built and published: `docs/design-incoming/bilderbuch/2026-09-16-website-vergleich.html` (home, template page and article head, live screenshot next to the Bilderbuch draft, desktop and phone, three display font candidates switchable, colour and component sheet). Illustrations in it are crops from the boards with baked-in text; real pages need their own motifs from a character sheet.

## 8c. Decisions so far (Marc, 16 Sep 2026)

- **Ground: white**, not paper. The boards' paper is near white (#FDFBF3); the warmer cream of the current site and any beige wash compete with the sun yellow. Paper grain lives only inside illustrations, blobs and stickers.
- **Hero: full cobalt block** on the start page (white pill button with ink text, yellow for the eyebrow, underline and hand notes, sky-blue blob behind the art). Marc: "fühlt sich gut an". Rule: at most one cobalt block per screen.
- **Display face: Fredoka Bold** with slightly tight tracking. Bagel Fat One was rejected as hard to read. Fredoka is already loaded by the app. Runners-up if needed: Baloo 2 ExtraBold, Nunito Black.
- **Open:** whether the one action card on a page (template signup) goes inverted cobalt or stays white with an ink outline; audience split between app and website; sticker lettering as image or SVG rather than live text.

## 9. Recommended path

1. **Decide the register split.** Kid-facing app: full Bilderbuch. Parent-facing website: "Bilderbuch light", meaning paper ground, cobalt, ember and sun, hand-lettered hero headline and doodles, but calm density and a readable text face, so the Ratgeber and the ADHS content keep their credibility.
2. **Character sheet first.** One reviewed prompt set, one sheet, then six test illustrations that must match it (hero, egg, feelings choice, breathing, book page, sleep).
3. **HTML specimen before any rollout.** Website hero, one template page and the app home screen side by side, old versus new, on the confirmed tokens. Green light from Marc before touching production.
4. **Website rollout on a branch.** Token remap, display font, buttons, hero art; re-render the template PDFs.
5. **App rollout screen by screen,** starting with onboarding and home, replacing art as each screen switches.
6. **Timing:** nothing here blocks the funnel or the gates. The real constraint is art: switch the website live only once the new character art exists, and the app after that, so no page ever shows two different dragons.
