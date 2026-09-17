import { motion } from 'motion/react';
import { Doodle, TornNote } from './bausteine';
import { HandNote } from './primitives/HandNote';
import { Sparkles } from './primitives/Sparkles';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';

const BEFORE = [
  'Zehnmal „Zähne putzen!" rufen. Eltern-Müdigkeit schon um sieben.',
  'Die Socken-Suche, die Schuh-Schlacht, die Tränen.',
  'Bildschirmzeit als Druckmittel und Belohnung.',
];

const AFTER = [
  'Der Drache erinnert. Du trinkst Kaffee.',
  'Routinen laufen leise, ohne Streit, ohne Druck.',
  'Die App macht sich überflüssig. So soll es sein.',
];

/**
 * Two cards, tilted against each other: the old morning in ink on white,
 * the Ronki morning in cobalt with the one hard paper shadow on the page.
 *
 * No progress bars. A "Stresslevel" meter is a dashboard device, and it
 * told the reader nothing the three lines above it did not already say.
 */
export function BeforeAfter() {
  return (
    <div className="relative">
      <PaperEdge tone="white" variant={0} />
      <section
        className="relative bg-white px-5 sm:px-6 py-12 sm:py-14"
        aria-labelledby="before-after-heading"
      >
        <div className="relative max-w-5xl mx-auto">
          <Sparkles className="right-0 -top-4 opacity-90" />

          <motion.div
            initial={{ opacity: 1, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <StickerLabel tone="sun" rotate={-3}>
              Was sich ändert
            </StickerLabel>
            <h2
              id="before-after-heading"
              className="bb-display mt-4 text-4xl sm:text-5xl lg:text-6xl text-ink"
            >
              Vorher.{' '}
              <span className="bb-swipe">
                Nachher.
                <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                  <use href="#bb-underline" />
                </svg>
              </span>
            </h2>
          </motion.div>

          <div className="mt-10 grid md:grid-cols-2 gap-6 md:gap-8 md:items-start">
            {/* The old way. A scrap torn off a bigger sheet, pinned to the
             *  page: the thing you throw away. The Ronki side beside it is
             *  a card you keep, so the two never read as a matched pair. */}
            <motion.div
              initial={{ opacity: 1, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7 }}
              className="relative md:pt-2"
            >
              <TornNote rotate={-1.8}>
                <Doodle
                  name="tangle"
                  size={78}
                  rotate={-8}
                  className="pointer-events-none absolute -right-1 -top-6 text-ember/85"
                />
                <h3 className="bb-display text-2xl sm:text-3xl text-ink">
                  Zufällige Erinnerungen
                </h3>
                <ul className="mt-5 flex flex-col gap-4 pb-2">
                  {BEFORE.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <svg
                        aria-hidden
                        viewBox="0 0 64 64"
                        className="mt-0.5 h-5 w-5 shrink-0 text-ink/70"
                      >
                        <use href="#bb-cross" />
                      </svg>
                      <p className="text-[1.05rem] sm:text-lg text-ink/85 leading-relaxed">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </TornNote>
            </motion.div>

            {/* The Ronki way. Cobalt, sun stars, the one lifted card. */}
            <motion.div
              initial={{ opacity: 1, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bb-lift relative rounded-[26px] border-[3px] border-ink bg-cobalt p-6 sm:p-8 text-white rotate-[1deg] md:rotate-[1.5deg]"
            >
              <StickerLabel tone="sun" rotate={4} className="mb-4">
                Der Ronki-Weg
              </StickerLabel>
              <h3 className="bb-display text-2xl sm:text-3xl text-white">
                Struktur statt Stress
              </h3>
              <ul className="mt-5 flex flex-col gap-4">
                {AFTER.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="mt-1 h-4 w-4 shrink-0 text-sun"
                    >
                      <use href="#bb-star" />
                    </svg>
                    <p className="text-[1.05rem] sm:text-lg text-white/[0.92] leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* The note sits below both cards and points back up at the
           *  cobalt one, so it never crowds the headline. */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <HandNote rotate={-3} className="text-center">
              Weniger Ansagen. Mehr Morgen.
            </HandNote>
            <svg
              aria-hidden
              viewBox="0 0 64 64"
              className="h-7 w-7 shrink-0 text-cobalt"
              style={{ transform: 'rotate(-55deg)' }}
            >
              <use href="#bb-arrow" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
