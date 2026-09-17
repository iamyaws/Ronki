import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { SpeechBubble } from './bausteine';
import { HandNote } from './primitives/HandNote';
import { StickerLabel } from './primitives/StickerLabel';

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
    a: 'Ronki ist kostenlos. Die Public‑Alpha läuft direkt im Browser, ohne Anmeldung, App Store oder Download. Probiert es aus und schreibt uns an hallo@ronki.de, wenn etwas klemmt.',
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

/**
 * The questions stay clean ink-outlined rows, because a row you press is
 * a control. The answer is Ronki talking back: a bubble under the
 * question with its tail pointing up at it. The plus turns into a cross
 * when the row opens.
 */
export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      className="relative bg-white px-5 sm:px-6 pt-6 pb-14 sm:pt-8 sm:pb-16"
      aria-labelledby="faq-heading"
    >
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center">
          <StickerLabel tone="sun" rotate={-3}>
            Häufige Fragen
          </StickerLabel>
          <h2
            id="faq-heading"
            className="bb-display mt-5 text-3xl sm:text-4xl lg:text-5xl text-ink"
          >
            Noch Fragen?
          </h2>
        </div>

        <HandNote
          rotate={-4}
          icon="arrow"
          className="mt-5 text-center lg:mt-0 lg:text-left lg:absolute lg:-left-6 lg:top-8 lg:w-[150px]"
        >
          Frag ruhig.
        </HandNote>

        <div className="mt-9 flex flex-col gap-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 1, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`flex w-full items-center justify-between gap-4 rounded-[22px] border-[2.5px] border-ink px-5 py-5 text-left sm:px-6 ${
                    isOpen ? 'bg-sky-wash' : 'bg-white'
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-ink text-base sm:text-lg">
                    {item.q}
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 64 64"
                    className="h-5 w-5 shrink-0 text-cobalt transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    <use href="#bb-plus" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      {/* The tail hangs off the top edge and points back at
                       *  the question, so the answer belongs to it. */}
                      <SpeechBubble
                        tone="white"
                        tail="left"
                        tailEdge="top"
                        rotate={-0.5}
                        className="mt-[38px] mb-1 w-full"
                      >
                        {item.a}
                      </SpeechBubble>
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
