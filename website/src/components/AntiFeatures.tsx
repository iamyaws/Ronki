import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';
import { WashiTape } from './primitives/WashiTape';

const ITEMS = [
  { label: 'Keine Streaks, die reißen können.', detail: 'Kontinuität wächst als Ort in Ronkis Welt. Nicht als Zähler, der heute noch heil ist und morgen zerbricht.' },
  { label: 'Keine Werbung. Nie.', detail: 'Ronki verdient kein Geld mit der Aufmerksamkeit von Kindern.' },
  { label: 'Keine Loot-Boxen, keine Glücksspiel-Mechaniken.', detail: 'Belohnungen sind vorhersehbar und an reale Aktionen gebunden.' },
  { label: 'Keine Push-Benachrichtigungen.', detail: 'Ronki wartet geduldig bei sich. Er ruft dir nicht durchs Haus hinterher.' },
  { label: 'Keine Daten-Weitergabe an Dritte.', detail: 'Keine Cookies, kein personenbezogenes Tracking. Supabase und Plausible, beide in der EU.' },
];

/** The other half of honesty: what Ronki cannot do for you. */
const LIMITS = [
  { label: 'Kein Ersatz für dich.', detail: 'Ronki erinnert, du begleitest.' },
  { label: 'Nicht jedes Kind springt drauf an.', detail: 'Manche brauchen das Blatt Papier, nicht die App.' },
  { label: 'Die ersten zwei Wochen dauern länger.', detail: 'Nicht kürzer.' },
  { label: 'Frühe Version.', detail: 'Es gibt Ecken, die noch haken.' },
];

function Mark({ kind }: { kind: 'check' | 'cross' }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 64 64"
      className={`mt-1 h-5 w-5 shrink-0 ${kind === 'check' ? 'text-cobalt' : 'text-ink/75'}`}
    >
      <use href={kind === 'check' ? '#bb-check' : '#bb-cross'} />
    </svg>
  );
}

/**
 * The honest list, on the paper spread.
 *
 * The left column used to strike its own lines through as you scrolled.
 * It looked clever and made five sentences hard to read, so the mark is
 * a drawn tick beside the line now and the line itself stays intact.
 */
export function AntiFeatures() {
  return (
    <div className="relative">
      <PaperEdge tone="paper" variant={2} />
      <section
        className="relative bg-paper px-5 sm:px-6 py-12 sm:py-14"
        aria-labelledby="anti-features-heading"
      >
        <div className="relative max-w-5xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14 lg:items-start">
            <motion.div
              initial={{ opacity: 1, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.7 }}
            >
              <StickerLabel tone="sun" rotate={-3}>
                Unser Versprechen
              </StickerLabel>

              <h2
                id="anti-features-heading"
                className="bb-display mt-4 text-4xl sm:text-5xl text-ink"
              >
                Die{' '}
                <span className="bb-swipe">
                  ehrliche
                  <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                    <use href="#bb-underline" />
                  </svg>
                </span>{' '}
                Liste.
              </h2>

              <p className="mt-4 text-[1.05rem] sm:text-lg text-ink/85 leading-relaxed max-w-xl">
                Das sind keine fehlenden Funktionen. Es sind bewusste Entscheidungen, festgeschrieben, bevor die erste Zeile Code stand.
              </p>

              <HandNote rotate={-4} className="mt-7">
                Steht so im Code.
              </HandNote>
            </motion.div>

            {/* Dark patterns, on a sun sticky note. */}
            <div className="relative rounded-[22px] bg-sun px-6 py-7 sm:px-7 rotate-[0.8deg] sm:rotate-[1.5deg]">
              <WashiTape className="-top-3 left-8 w-24 h-9" rotate={-7} tone="paper" />
              <p className="bb-hand text-xl uppercase leading-none text-ink/80">
                Kurz erklärt
              </p>
              <p className="bb-display mt-3 text-2xl sm:text-3xl text-ink">Dark Patterns</p>
              <p className="mt-3 text-base sm:text-[1.05rem] text-ink/90 leading-relaxed">
                So nennt man Tricks in Apps und Spielen, die Kinder länger binden, zum Kaufen bewegen oder zurücklocken. Lootboxen mit Glücksspiel-Logik. Streaks, die ein schlechtes Gewissen machen. Push-Nachrichten am Abend. „Nur noch zwei Minuten"-Schleifen. Wir haben sie uns angesehen und weggelassen.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8 md:items-start">
            {/* Left: the things we left out on purpose. */}
            <div className="rounded-[26px] border-[3px] border-ink bg-white p-6 sm:p-7 -rotate-[0.6deg]">
              <p className="bb-display text-xl sm:text-2xl text-ink">
                Was wir weggelassen haben
              </p>
              <ul className="mt-5 flex flex-col gap-5">
                {ITEMS.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 1, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
                    className="flex items-start gap-3.5"
                  >
                    <Mark kind="check" />
                    <div>
                      <p className="font-display font-bold text-lg leading-snug text-ink">
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-[0.95rem] text-ink/85 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right: what Ronki cannot do. It is the shorter card, so
             *  the link to the research sits under it and fills the gap
             *  instead of floating in the middle of a white band. */}
            <div className="flex flex-col gap-8">
            <div className="rounded-[26px] border-[3px] border-ink bg-white p-6 sm:p-7 rotate-[0.6deg]">
              <p className="bb-display text-xl sm:text-2xl text-ink">
                Was Ronki nicht kann
              </p>
              <ul className="mt-5 flex flex-col gap-5">
                {LIMITS.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 1, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
                    className="flex items-start gap-3.5"
                  >
                    <Mark kind="cross" />
                    <div>
                      <p className="font-display font-bold text-lg leading-snug text-ink">
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-[0.95rem] text-ink/85 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center md:justify-start">
              <Link
                to="/wissenschaft"
                className="group inline-flex items-center gap-3 rounded-full border-[2.5px] border-ink bg-white px-7 py-3.5 font-display font-bold text-base text-ink transition-transform hover:-translate-y-0.5"
              >
                Wissenschaftlicher Hintergrund
                <svg
                  aria-hidden
                  viewBox="0 0 64 64"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                >
                  <use href="#bb-arrow" />
                </svg>
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
