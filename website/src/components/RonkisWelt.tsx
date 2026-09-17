import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface Freund {
  name: string;
  subtitle: string;
  blurb: string;
  image: string;
}

const FREUNDE: Freund[] = [
  {
    name: 'Lichtbringerin',
    subtitle: 'Wenn es dunkel wird',
    blurb: 'Sie zündet Laternen an, wenn dein Kind Mut braucht.',
    image: '/art/freunde/lichtbringerin.webp',
  },
  {
    name: 'Sternenweberin',
    subtitle: 'Vor dem Einschlafen',
    blurb: 'Sie webt die Gedanken des Tages zu ruhigen Träumen.',
    image: '/art/freunde/sternenweberin.webp',
  },
  {
    name: 'Windreiterin',
    subtitle: 'Beim Neues wagen',
    blurb: 'Sie springt voraus, wenn etwas schwer aussieht.',
    image: '/art/freunde/windreiterin.webp',
  },
  {
    name: 'Tiefentaucherin',
    subtitle: 'Wenn Gefühle groß sind',
    blurb: 'Sie hört zu, auch wenn die Worte noch fehlen.',
    image: '/art/freunde/tiefentaucherin.webp',
  },
  {
    name: 'Brückenbauer',
    subtitle: 'Wenn Freunde sich streiten',
    blurb: 'Er baut kleine Brücken, wo Worte fehlen.',
    image: '/art/freunde/brueckenbauer.webp',
  },
  {
    name: 'Flackerfuchs',
    subtitle: 'Wenn etwas Freude macht',
    blurb: 'Er tanzt mit, wenn dein Kind lacht.',
    image: '/art/freunde/flackerfuchs.webp',
  },
  {
    name: 'Pilzhüter',
    subtitle: 'Wenn alles wuselt',
    blurb: 'Er atmet langsam, und dein Kind darf mitatmen.',
    image: '/art/freunde/pilzhueter.webp',
  },
];

const BARS = [
  { week: 'Woche 1', external: 85, internal: 15, label: 'Ronki erinnert, lobt, begleitet' },
  { week: 'Woche 3', external: 50, internal: 50, label: 'Routine wird vertrauter' },
  { week: 'Woche 6', external: 20, internal: 80, label: 'Dein Kind macht es selbst' },
  { week: 'Woche 10+', external: 5, internal: 95, label: 'Ronki wird nicht mehr gebraucht' },
];

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

/**
 * One white spread with two parts: the seven friends as round stickers,
 * and the idea behind them.
 *
 * They used to be two sections with a hairline between them, which read
 * as two half-empty pages. Merged, the friends are the picture and the
 * fading chart is the caption.
 */
export function RonkisWelt() {
  return (
    <div className="relative">
      <PaperEdge tone="white" variant={1} />
      <section
        className="relative bg-white px-5 sm:px-6 py-12 sm:py-14"
        aria-labelledby="welt-heading"
      >
        <div className="relative max-w-6xl mx-auto">
          {/* ── Part 1: the friends ─────────────────────── */}
          <StickerLabel tone="sky-wash" rotate={-3}>
            Ronkis Welt
          </StickerLabel>

          <h2
            id="welt-heading"
            className="bb-display mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] text-ink max-w-3xl"
          >
            Dein Kind ist nicht allein.{' '}
            <span className="bb-swipe">
              Ronki hat Freunde.
              <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                <use href="#bb-underline" />
              </svg>
            </span>
          </h2>

          <p className="mt-4 text-[1.05rem] sm:text-lg text-ink/85 max-w-2xl leading-relaxed">
            Sieben Begleiter, die an den richtigen Momenten des Tages auftauchen. Nicht als Feature-Liste. Als Figuren, die ein Kind gern wiedertrifft.
          </p>

          <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-5 gap-y-9 sm:gap-x-6">
            {FREUNDE.map((f, i) => (
              <motion.li
                key={f.name}
                initial={{ opacity: 1, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06, ease: EASE_OUT }}
                className="flex flex-col items-center text-center [hyphens:none] last:col-span-2 sm:last:col-span-1"
              >
                <div
                  className="w-full max-w-[128px] aspect-square overflow-hidden rounded-full border-[3px] border-ink bg-sky-wash [transform:rotate(calc(var(--tilt)*0.5))] sm:[transform:rotate(var(--tilt))]"
                  style={{
                    boxShadow: '0 0 0 5px #fff, 0 0 0 8px var(--color-ink)',
                    '--tilt': `${i % 2 === 0 ? -2 : 2}deg`,
                  } as CSSProperties}
                >
                  <img
                    src={f.image}
                    alt={`${f.name}: ${f.blurb}`}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="bb-display mt-5 text-[1.05rem] sm:text-lg text-ink leading-tight">
                  {f.name}
                </p>
                <p className="mt-1.5 text-sm text-ink/85 leading-snug">{f.subtitle}</p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 flex justify-center lg:justify-end">
            <HandNote rotate={3} icon="heart" className="text-center lg:text-right">
              Alle sieben kommen wieder.
            </HandNote>
          </div>

          {/* ── Part 2: the idea behind them ────────────── */}
          <div className="mt-14 grid lg:grid-cols-[1fr_0.95fr] gap-10 lg:gap-14 lg:items-center">
            <div>
              <StickerLabel tone="sun" rotate={-3}>
                Der Ansatz dahinter
              </StickerLabel>

              <h2 className="bb-display mt-4 text-3xl sm:text-4xl lg:text-5xl text-ink">
                Intrinsisch statt{' '}
                <span className="bb-swipe">
                  extrinsisch.
                  <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                    <use href="#bb-underline" />
                  </svg>
                </span>
              </h2>

              <div className="mt-6 flex flex-col gap-4 text-[1.05rem] sm:text-lg text-ink/85 leading-relaxed">
                <p>
                  Kinder-Apps arbeiten oft mit externen Belohnungen: Punkte, Abzeichen, Lootboxen. Das funktioniert kurzfristig, tötet aber die natürliche Motivation.
                </p>
                <p>
                  Ronki dreht das um: Am Anfang begleitet der Drache intensiv. Dann zieht er sich Schritt für Schritt zurück, bis dein Kind seine Routinen{' '}
                  <strong className="font-semibold text-ink">aus eigenem Antrieb</strong> macht.
                </p>
                <p className="text-base text-ink/70">
                  Basierend auf der Selbstbestimmungstheorie (Deci &amp; Ryan), Fading Scaffolding (Vygotsky) und Montessori-Prinzipien.{' '}
                  <a
                    href="/wissenschaft"
                    className="text-cobalt underline decoration-2 underline-offset-4"
                  >
                    Mehr erfahren
                  </a>
                </p>
              </div>
            </div>

            <FadingChart />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The drawn chart                                                     */
/* ------------------------------------------------------------------ */

function FadingChart() {
  return (
    <motion.div
      initial={{ opacity: 1, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="rounded-[26px] border-[3px] border-ink bg-paper p-6 sm:p-7 rotate-[0.8deg]"
    >
      <StickerLabel tone="sun" rotate={-3}>
        So wird Ronki leiser
      </StickerLabel>

      <div className="mt-6 flex flex-col gap-3.5">
        {BARS.map((bar) => (
          <div key={bar.week}>
            <p className="font-display font-bold text-base text-ink">{bar.week}</p>
            <div
              className="mt-2 flex h-[22px] w-full overflow-hidden rounded-full border-[2.5px] border-ink"
              style={{ filter: 'url(#bb-crayon-soft)' }}
            >
              <div className="h-full bg-sun" style={{ width: `${bar.external}%` }} />
              <div className="h-full bg-cobalt" style={{ width: `${bar.internal}%` }} />
            </div>
            <p className="bb-hand mt-1 text-[1.05rem] leading-none text-cobalt">{bar.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <LegendDot color="text-sun" label="Externe Begleitung" />
        <LegendDot color="text-cobalt" label="Eigener Antrieb" />
      </div>
    </motion.div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`h-3.5 w-3.5 ${color}`}
        style={{ filter: 'url(#bb-crayon-soft)' }}
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" />
      </svg>
      <span className="font-display font-semibold text-sm text-ink">{label}</span>
    </span>
  );
}
