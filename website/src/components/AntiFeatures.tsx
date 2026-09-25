import { motion } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import {
  ChecklistItem,
  DrawnLink,
  NotebookPage,
  Ribbon,
  StickyNote,
  TornNote,
} from './bausteine';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';

const ITEMS = [
  { label: 'Keine Streaks, die reißen können.', detail: 'Kontinuität wächst als Ort in Ronkis Welt. Nicht als Zähler, der heute noch heil ist und morgen zerbricht.' },
  { label: 'Keine Werbung. Nie.', detail: 'Ronki verdient kein Geld mit der Aufmerksamkeit von Kindern.' },
  { label: 'Keine Loot-Boxen, keine Glücksspiel-Mechaniken.', detail: 'Belohnungen sind vorhersehbar und an reale Aktionen gebunden.' },
  { label: 'Keine Push-Benachrichtigungen.', detail: 'Ronki wartet geduldig bei sich. Er ruft dir nicht durchs Haus hinterher.' },
  { label: 'Keine Daten-Weitergabe an Dritte.', detail: 'Keine Cookies, kein personenbezogenes Tracking. Supabase und Umami, beide mit Datenverarbeitung in der EU.' },
];

/** The other half of honesty: what Ronki cannot do for you. */
const LIMITS = [
  { label: 'Kein Ersatz für dich.', detail: 'Ronki erinnert, du begleitest.' },
  { label: 'Nicht jedes Kind springt drauf an.', detail: 'Manche brauchen das Blatt Papier, nicht die App.' },
  { label: 'Die ersten zwei Wochen dauern länger.', detail: 'Nicht kürzer.' },
  { label: 'Frühe Version.', detail: 'Es gibt Ecken, die noch haken.' },
];

/** The ruled line spacing the notebook page and its text share. Every
 *  line of type sets to exactly this, so nothing floats between rules. */
const RULE = 34;

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
              <Ribbon tone="sun" rotate={-1.4}>
                Unser Versprechen
              </Ribbon>

              <h2
                id="anti-features-heading"
                className="bb-display mt-6 text-4xl sm:text-5xl text-ink"
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

            {/* Dark patterns, on a sun sticky note. The one per page. */}
            <StickyNote eyebrow="Kurz erklärt" title="Dark Patterns" curl={false}>
              So nennt man Tricks in Apps und Spielen, die Kinder länger binden, zum Kaufen bewegen oder zurücklocken. Lootboxen mit Glücksspiel-Logik. Streaks, die ein schlechtes Gewissen machen. Push-Nachrichten am Abend. „Nur noch zwei Minuten"-Schleifen. Wir haben sie uns angesehen und weggelassen.
            </StickyNote>
          </div>

          {/* Two different objects, not two matching cards: the sheet out
           *  of the exercise book with the decisions on it, and the strip
           *  torn off a bigger page with the limits. The torn strip in
           *  "Vorher / Nachher" is pinned, this one is taped, and the two
           *  are never on screen together. */}
          <div className="mt-10 grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-9 md:items-start">
            {/* Left: the things we left out on purpose. */}
            <NotebookPage ruleHeight={RULE} rotate={-0.9}>
              <p
                className="bb-display text-[1.35rem] sm:text-[1.5rem] text-ink"
                style={{ lineHeight: `${RULE}px` }}
              >
                Was wir weggelassen haben
              </p>
              <ul>
                {ITEMS.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 1, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
                    /* One empty ruled line after the title, then the items
                     *  run line after line like a handwritten list. */
                    style={i === 0 ? { marginTop: `${RULE}px` } : undefined}
                  >
                    <ChecklistItem mark="check" as="div">
                      <span className="block">{item.label}</span>
                      <span
                        className="block font-body text-[0.92rem] font-normal text-ink/80"
                        style={{ lineHeight: `${RULE}px` }}
                      >
                        {item.detail}
                      </span>
                    </ChecklistItem>
                  </motion.li>
                ))}
              </ul>
            </NotebookPage>

            {/* Right: what Ronki cannot do, on a strip torn off the page,
             *  with the research link under it as a drawn line, never a
             *  pill: a link is not an action. */}
            <div className="flex flex-col gap-9 md:pt-6">
              <TornNote pin="tape" rotate={1.4}>
                <p className="bb-display text-[1.3rem] sm:text-[1.45rem] text-ink">
                  Was Ronki nicht kann
                </p>
                <ul className="mt-4 flex flex-col gap-4 pb-2">
                  {LIMITS.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 1, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-5%' }}
                      transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
                      className="flex items-start gap-3.5"
                    >
                      <svg
                        aria-hidden
                        focusable="false"
                        viewBox="0 0 64 64"
                        className="mt-1 h-5 w-5 shrink-0 text-ink/75"
                      >
                        <use href="#bb-cross" />
                      </svg>
                      <div>
                        <p className="font-display font-bold text-[1.05rem] leading-snug text-ink">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[0.93rem] text-ink/85 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </TornNote>

              <DrawnLink href="/wissenschaft" className="self-center md:self-start">
                Wissenschaftlicher Hintergrund
              </DrawnLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
