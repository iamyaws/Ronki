import { motion } from 'motion/react';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';
import { WashiTape } from './primitives/WashiTape';

/**
 * Über die beiden Macher. Marc and Louis, on the paper spread.
 *
 * The photo sits in the same tilted ink frame the article heads use, the
 * quote sits on a sky-wash card with a drawn quote mark. No glow, no
 * grain overlay, no vignette: depth here comes from the outline and the
 * tilt, the way it does on the template pages.
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
              <div className="bb-frame aspect-[9/10] rotate-[1deg] md:rotate-[2deg]">
                <img
                  src="/art/founders/marc-louis-backtoback-centered.webp"
                  alt="Marc und sein Sohn Louis, 7, sitzen Rücken an Rücken auf einem Hocker, ruhige Studio-Aufnahme."
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>

              <p className="bb-hand mt-4 text-2xl leading-none text-cobalt -rotate-1">
                Marc und Louis
              </p>
              <p className="mt-2 text-sm text-ink/80 leading-relaxed">
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
                className="flex flex-col gap-4 text-[1.05rem] sm:text-lg text-ink/85 leading-relaxed"
              >
                <p>
                  Ich arbeite seit Jahren als Consultant für Gaming und Esports. Ich weiß, wie Spiele heute gemacht sind. Wo die Casino-Mechaniken versteckt sind, warum manche Apps Kinder minutenlang festhalten, wie Dopamin-Loops funktionieren. Ein Teil von mir hat beruflich daran mitgebaut. Ein anderer Teil wollte das nie in der Hand seines Sohnes sehen.
                </p>
                <p>
                  Dann kam Louis in die erste Klasse. Plötzlich reden alle Kinder über Roblox und Fortnite, während wir morgens noch mit Zähneputzen, Anziehen und Tasche packen kämpfen. Irgendwann dachte ich: Wenn andere Apps so gut darin sind, Aufmerksamkeit zu fangen, warum nicht eine bauen, die das Gegenteil macht? Eine, die leise erinnert, begleitet, und sich irgendwann selbst überflüssig macht.
                </p>
              </motion.div>

              {/* Quote on a sky-wash card, ink outline, drawn quote mark. */}
              <motion.blockquote
                initial={{ opacity: 1, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative rounded-[26px] border-[3px] border-ink bg-sky-wash pt-9 pb-7 px-6 sm:px-8 -rotate-[0.6deg]"
              >
                <WashiTape className="-top-3 right-8 sm:right-12 w-20 h-8" rotate={8} />
                <WashiTape className="-bottom-3 left-8 sm:left-12 w-20 h-8" rotate={-8} />
                <span
                  aria-hidden
                  className="absolute left-5 top-1 select-none font-display font-bold text-6xl leading-none text-cobalt"
                >
                  &ldquo;
                </span>
                <p
                  lang="de"
                  className="relative font-display text-lg sm:text-xl text-ink leading-relaxed"
                  style={{
                    hyphens: 'manual',
                    WebkitHyphens: 'manual',
                    MozHyphens: 'manual',
                    wordBreak: 'normal',
                    overflowWrap: 'normal',
                  }}
                >
                  Das Ringen um Bildschirmzeit kennt jede Familie, uns inklusive. Serien, Games, Filme sind super, aber in Maßen. Mit Ronki machen wir das für Louis planbar und fair: erst die Arbeit, dann das Vergnügen, in Form von einem Hörspiel, einer Folge seiner Lieblingsserie oder auch mal Switch. Sätze, die ich von meinen Eltern kenne. Und so sehr man manchmal anders sein will als sie, so sehr kommen sie dann doch automatisch raus.
                </p>
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 1, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="flex flex-col gap-4 text-[1.05rem] sm:text-lg text-ink/85 leading-relaxed"
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
