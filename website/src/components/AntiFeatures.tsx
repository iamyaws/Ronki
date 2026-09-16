import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { EASE_OUT } from '../lib/motion';

const ITEMS = [
  { label: 'Keine Streaks, die reißen können.', detail: 'Kontinuität wächst als Ort in Ronkis Welt. Nicht als Zähler, der heute noch heil ist und morgen zerbricht.' },
  { label: 'Keine Werbung. Nie.', detail: 'Ronki verdient kein Geld mit der Aufmerksamkeit von Kindern.' },
  { label: 'Keine Loot-Boxen, keine Glücksspiel-Mechaniken.', detail: 'Belohnungen sind vorhersehbar und an reale Aktionen gebunden.' },
  { label: 'Keine Push-Benachrichtigungen.', detail: 'Ronki wartet geduldig bei sich. Er ruft dir nicht durchs Haus hinterher.' },
  { label: 'Keine Daten-Weitergabe an Dritte.', detail: 'Keine Cookies, kein personenbezogenes Tracking. Supabase und Plausible, beide in der EU.' },
];

export function AntiFeatures() {
  return (
    <section
      className="relative px-6 py-28 sm:py-32 border-t border-teal/10"
      aria-labelledby="anti-features-heading"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.7 }}
          className="mb-14 max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-ink/85 mb-6 font-semibold">
            Unser Versprechen
          </p>
          <h2
            id="anti-features-heading"
            className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-ink"
          >
            Die <em className="italic text-sage">ehrliche</em> Liste.
          </h2>
          <p className="mt-6 text-base opacity-75 max-w-2xl leading-relaxed">
            Das sind keine fehlenden Funktionen. Es sind bewusste Entscheidungen, festgeschrieben, bevor die erste Zeile Code stand.
          </p>
          <div className="mt-8 max-w-2xl rounded-2xl bg-white border-2 border-ink/80 p-5 sm:p-6 shadow-sm">
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
        </motion.div>

        <ul className="flex flex-col">
          {ITEMS.map((item, i) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
              className="group border-t border-teal/15 last:border-b py-7 sm:py-9"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-8">
                <span className="text-xs font-display font-semibold text-teal/70 tracking-[0.2em] sm:min-w-[3ch]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <p className="relative font-display font-bold text-2xl sm:text-3xl leading-tight inline-block text-ink">
                    {item.label}
                    <motion.span
                      aria-hidden
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: '-10%' }}
                      transition={{ duration: 0.7, delay: i * 0.08 + 0.4, ease: EASE_OUT }}
                      className="absolute left-0 top-1/2 h-[3px] w-full origin-left bg-teal-dark/75 rounded-full"
                    />
                  </p>
                  <p className="mt-3 text-sm sm:text-base opacity-75 leading-relaxed max-w-xl text-ink">
                    {item.detail}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 text-center"
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

