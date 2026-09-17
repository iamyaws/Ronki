import { motion } from 'motion/react';
import { Polaroid, SpeechBubble } from './bausteine';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';

/**
 * Über die beiden Macher. Marc and Louis, on the paper spread.
 *
 * The photo is a polaroid somebody taped down, the quote is Marc talking
 * in a speech bubble, and the prose runs at a readable measure beside
 * both. Three different objects, so nothing on this spread reads as one
 * more white card. No glow, no grain overlay, no vignette: depth comes
 * from the outline and the tilt, the way it does on the template pages.
 */
export function UeberMich() {
  return (
    <div className="relative">
      <PaperEdge tone="paper" variant={1} />
      <section
        className="relative bg-paper px-5 sm:px-6 py-12 sm:py-14"
        aria-labelledby="ueber-mich-heading"
      >
        <div className="relative max-w-5xl mx-auto">
          <StickerLabel tone="sun" rotate={-3}>
            Über die beiden Macher
          </StickerLabel>

          <div className="mt-7 grid md:grid-cols-[260px_1fr] gap-9 md:gap-10 items-start">
            {/* Photo column */}
            <motion.div
              initial={{ opacity: 1, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative shrink-0"
            >
              {/* A photo somebody put on the table, taped down. The tape
               *  used to sit on the quote card; the quote speaks now, and
               *  a speech bubble carries no tape. */}
              <Polaroid
                caption="Marc und Louis"
                rotate={1.6}
                tape
                className="w-full max-w-[260px]"
              >
                <img
                  src="/art/founders/marc-louis-backtoback-centered.webp"
                  alt="Marc und sein Sohn Louis, 7, sitzen Rücken an Rücken auf einem Hocker, ruhige Studio-Aufnahme."
                  className="block aspect-[9/10] w-full object-cover object-center"
                  loading="lazy"
                  width={720}
                  height={800}
                />
              </Polaroid>

              <p className="mt-4 text-sm text-ink/80 leading-relaxed">
                Marc setzt um &middot; Louis (7) gibt den Takt an
              </p>

              {/* The note points back up at Louis, who sits on the right
               *  in the photo. */}
              <div className="mt-5 flex items-start justify-end gap-2">
                <HandNote rotate={-3} className="text-right">
                  Louis ist der Chef hier.
                </HandNote>
                <svg
                  aria-hidden
                  viewBox="0 0 64 64"
                  className="mt-1 h-7 w-7 shrink-0 text-cobalt"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <use href="#bb-arrow" />
                </svg>
              </div>
            </motion.div>

            {/* Text column */}
            <div className="flex flex-col gap-6">
              <motion.h2
                id="ueber-mich-heading"
                initial={{ opacity: 1, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bb-display text-3xl sm:text-4xl lg:text-[2.7rem] text-ink"
              >
                Ronki ist kein Produkt. Es ist ein{' '}
                <span className="bb-swipe">
                  Experiment
                  <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                    <use href="#bb-underline" />
                  </svg>
                </span>{' '}
                mit meinem Sohn.
              </motion.h2>

              <motion.div
                initial={{ opacity: 1, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                /* Roughly 62 characters a line. Longer measures make a
                 *  personal text read like a terms page. */
                className="flex max-w-[31em] flex-col gap-4 text-[1.05rem] sm:text-lg text-ink/85 leading-relaxed"
              >
                <p>
                  Ich arbeite seit Jahren als Consultant für Gaming und Esports. Ich weiß, wie Spiele heute gemacht sind. Wo die Casino-Mechaniken versteckt sind, warum manche Apps Kinder minutenlang festhalten, wie Dopamin-Loops funktionieren. Ein Teil von mir hat beruflich daran mitgebaut. Ein anderer Teil wollte das nie in der Hand seines Sohnes sehen.
                </p>
                <p>
                  Dann kam Louis in die erste Klasse. Plötzlich reden alle Kinder über Roblox und Fortnite, während wir morgens noch mit Zähneputzen, Anziehen und Tasche packen kämpfen. Irgendwann dachte ich: Wenn andere Apps so gut darin sind, Aufmerksamkeit zu fangen, warum nicht eine bauen, die das Gegenteil macht? Eine, die leise erinnert, begleitet, und sich irgendwann selbst überflüssig macht.
                </p>
              </motion.div>

              {/* Marc talking, not a card with a quote mark on it. The tail
               *  points left at the photo on wide screens; on a phone the
               *  photo sits above, so the bubble drops the tail. */}
              <motion.blockquote
                initial={{ opacity: 1, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="md:mt-3 max-w-[36em]"
              >
                <SpeechBubble
                  tone="sky-wash"
                  tail="none"
                  tailAtMd="left"
                  tailEdge="top"
                  rotate={-0.6}
                  className="w-full"
                >
                  <span
                    lang="de"
                    className="block font-display text-lg sm:text-xl text-ink leading-relaxed"
                    style={{
                      hyphens: 'manual',
                      WebkitHyphens: 'manual',
                      MozHyphens: 'manual',
                      wordBreak: 'normal',
                      overflowWrap: 'normal',
                    }}
                  >
                    Das Ringen um Bildschirmzeit kennt jede Familie, uns inklusive. Serien, Games, Filme sind super, aber in Maßen. Mit Ronki machen wir das für Louis planbar und fair: erst die Arbeit, dann das Vergnügen, in Form von einem Hörspiel, einer Folge seiner Lieblingsserie oder auch mal Switch. Sätze, die ich von meinen Eltern kenne. Und so sehr man manchmal anders sein will als sie, so sehr kommen sie dann doch automatisch raus.
                  </span>
                </SpeechBubble>
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 1, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="flex max-w-[31em] flex-col gap-4 text-[1.05rem] sm:text-lg text-ink/85 leading-relaxed"
              >
                <p>
                  Ronki ist nicht die Wunderlösung, und auch kein Urteil über andere Wege. Jede Familie findet ihren. Ich baue diesen hier mit Louis zusammen. Er ist mein erster Nutzer, mein härtester Kritiker und manchmal auch mein Co-Designer. Wenn es bei euch einen Unterschied macht, freut mich das. Wenn nicht, ist das genauso ok.
                </p>
                <p className="font-display font-semibold text-ink">
                  Wenn in einem Jahr jemand sagt: „Der Marc hatte recht. Es kann funktionieren. Und wir hatten eine schöne gemeinsame Zeit mit Ronki." Dann hat sich alles gelohnt.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
