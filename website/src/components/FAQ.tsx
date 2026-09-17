import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';

const ITEMS = [
  {
    q: 'Ist Ronki eine App?',
    a: 'Ronki ist eine Web-App, die du direkt über den Browser auf deinem Startbildschirm installierst. Kein App Store, kein Download, keine Cookies.',
  },
  {
    q: 'Ab welchem Alter ist Ronki geeignet?',
    a: 'Ronki ist für Kinder zwischen 5 und 9 Jahren gedacht. In dieser Phase lernen Kinder, eigene Routinen aufzubauen. Ronki begleitet genau diesen Schritt.',
  },
  {
    q: 'Was kostet Ronki?',
    a: 'Ronki ist kostenlos. Die Public\u2011Alpha läuft direkt im Browser, ohne Anmeldung, App Store oder Download. Probiert es aus und schreibt uns an hallo@ronki.de, wenn etwas klemmt.',
  },
  {
    q: 'Wie schützt ihr die Daten meines Kindes?',
    a: 'Datenschutz ist kein Feature, sondern Grundlage. Ronki speichert keine persönlichen Daten auf externen Servern, nutzt keine Tracking-Pixel und zeigt keine Werbung. Alles bleibt auf eurem Gerät.',
  },
  {
    q: 'Braucht mein Kind ein eigenes Gerät?',
    a: 'Nein. Ronki funktioniert auf dem Familien-Tablet oder einem geteilten Gerät. Jedes Kind hat ein eigenes Profil, geschützt und getrennt.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 py-16 sm:py-24 border-t border-teal/10" aria-labelledby="faq-heading">
      <div className="relative max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 1, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-ink/85 mb-4 font-semibold">
            Häufige Fragen
          </p>
          <h2
            id="faq-heading"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-ink"
          >
            Noch Fragen?
          </h2>
        </motion.div>

        <HandNote
          rotate={-5}
          icon="arrow"
          className="mt-5 text-center lg:mt-0 lg:text-right lg:absolute lg:right-0 lg:top-6 lg:w-[150px]"
        >
          Frag ruhig.
        </HandNote>

        <div className="mt-10 space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 1, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-teal/10 bg-cream/40 backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-ink text-base sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    className="text-ink/40 text-xl shrink-0 transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      <p className="px-6 pb-5 text-sm sm:text-base text-ink/65 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
