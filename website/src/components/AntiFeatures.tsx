import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';
import { Sparkles } from './primitives/Sparkles';

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

function CheckIcon() {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 64 64" className="h-5 w-5 shrink-0 text-cobalt">
      <use href="#bb-check" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 64 64"
      className="h-5 w-5 shrink-0 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
    >
      <path d="M16 16 L48 48" />
      <path d="M48 16 L16 48" />
    </svg>
  );
}

export function AntiFeatures() {
  return (
    <section
      className="relative px-6 py-16 sm:py-24 border-t border-teal/10"
      aria-labelledby="anti-features-heading"
    >
      <div className="relative max-w-5xl mx-auto">
        <Sparkles className="right-0 bottom-0 opacity-90" />

        {/* Head on the left, the Dark-Patterns explainer beside it from
         *  lg. The note sits above the explainer, in the right margin
         *  next to the headline, and falls under the head on phones. */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:gap-12 lg:items-start">
          <motion.div
            initial={{ opacity: 1, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-ink/85 mb-4 font-semibold">
              Unser Versprechen
            </p>
            <h2
              id="anti-features-heading"
              className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-ink"
            >
              Die <em className="italic text-sage">ehrliche</em> Liste.
            </h2>
            <p className="mt-5 text-base opacity-75 leading-relaxed">
              Das sind keine fehlenden Funktionen. Es sind bewusste Entscheidungen, festgeschrieben, bevor die erste Zeile Code stand.
            </p>
          </motion.div>

          <div>
            <HandNote rotate={5} className="mb-5 lg:text-right">
              Steht so im Code.
            </HandNote>
            <div className="rounded-2xl bg-white border-2 border-ink/80 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sun text-ink font-display font-bold text-xs">i</span>
                <p className="text-xs uppercase tracking-[0.15em] text-ink font-bold">
                  Kurz erklärt
                </p>
              </div>
              <p className="font-display font-bold text-xl sm:text-2xl text-ink leading-tight mb-3">
                Dark Patterns
              </p>
              <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
                So nennt man Tricks in Apps und Spielen, die Kinder länger binden, zum Kaufen bewegen oder zurücklocken. Lootboxen mit Glücksspiel-Logik. Streaks, die ein schlechtes Gewissen machen. Push-Nachrichten am Abend. „Nur noch zwei Minuten"-Schleifen. Wir haben sie uns angesehen und weggelassen.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
          {/* Left: the things we left out on purpose. */}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cobalt font-bold mb-5">
              Was wir weggelassen haben
            </p>
            <ul className="flex flex-col">
              {ITEMS.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 1, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: EASE_OUT }}
                  className="border-t border-teal/15 last:border-b py-4 sm:py-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1"><CheckIcon /></span>
                    <div className="flex-1">
                      <p className="relative font-display font-bold text-lg sm:text-xl leading-snug inline-block text-ink">
                        {item.label}
                        <motion.span
                          aria-hidden
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true, margin: '-10%' }}
                          transition={{ duration: 0.7, delay: i * 0.06 + 0.35, ease: EASE_OUT }}
                          className="absolute left-0 top-1/2 h-[3px] w-full origin-left bg-teal-dark/75 rounded-full"
                        />
                      </p>
                      <p className="mt-2 text-sm opacity-75 leading-relaxed text-ink">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right: what Ronki cannot do. Same type scale, ink crosses. */}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink font-bold mb-5">
              Was Ronki nicht kann
            </p>
            <ul className="flex flex-col">
              {LIMITS.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 1, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: EASE_OUT }}
                  className="border-t border-teal/15 last:border-b py-4 sm:py-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1"><CrossIcon /></span>
                    <div className="flex-1">
                      <p className="font-display font-bold text-lg sm:text-xl leading-snug text-ink">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm opacity-75 leading-relaxed text-ink">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 1, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <Link
            to="/wissenschaft"
            className="group inline-flex items-center gap-3 rounded-full border border-teal/20 bg-cream/60 backdrop-blur-sm px-8 py-4 hover:border-teal/40 hover:bg-cream transition-all shadow-sm"
          >
            <span className="font-display font-semibold text-sm sm:text-base text-ink">
              Wissenschaftlicher Hintergrund
            </span>
            <span className="text-teal/70 group-hover:text-teal group-hover:translate-x-1 transition-all" aria-hidden>
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
