import { motion } from 'motion/react';

/* Washi-tape sticker SVGs — same visual language as Footer.tsx so the
 * quote card reads as part of the "grounded / handmade" visual family.
 * Tapes positioned top-right + bottom-left to avoid overlapping the
 * quote mark that sits at top-left. */
function QuoteTapeTopRight() {
  return (
    <svg
      className="absolute -top-3 right-6 sm:right-10 w-20 h-8 rotate-[8deg]"
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden
    >
      <rect x="0" y="4" width="120" height="32" rx="2" fill="#FDD134" fillOpacity="0.9" />
      <line x1="8" y1="14" x2="112" y2="14" stroke="#040812" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="8" y1="26" x2="112" y2="26" stroke="#040812" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
    </svg>
  );
}

function QuoteTapeBottomLeft() {
  return (
    <svg
      className="absolute -bottom-3 left-6 sm:left-10 w-20 h-8 -rotate-[8deg]"
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden
    >
      <rect x="0" y="4" width="120" height="32" rx="2" fill="#FDD134" fillOpacity="0.9" />
      <line x1="8" y1="14" x2="112" y2="14" stroke="#040812" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="8" y1="26" x2="112" y2="26" stroke="#040812" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 4" />
    </svg>
  );
}

/**
 * Über die beiden Macher section. Marc + Louis as co-creator.
 *
 * Photos: transparent-bg studio shots (rembg-processed) layered over a sage
 * accent background so the subjects float against the brand color rather
 * than sitting in a white studio box.
 *
 * Tone: describes Marc's choice for his family without judging other
 * families' choices. Different standard, not THE standard.
 */
export function UeberMich() {
  return (
    <section
      className="relative px-6 py-24 sm:py-32 border-t border-teal/10"
      aria-labelledby="ueber-mich-heading"
    >
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-6 font-medium"
        >
          Über die beiden Macher
        </motion.p>

        <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-start">
          {/* Photo column — back-to-back stool pose (Marc + Louis), centered
           * crop. Warm teal+mustard shadow + subtle paper-grain overlay to
           * fit the painterly website style. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative shrink-0 md:w-[340px]"
          >
            <div className="relative">
              {/* Soft mustard glow behind the card */}
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2rem] blur-3xl opacity-55 -z-10"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(253,209,52,0.35) 0%, transparent 70%)',
                }}
              />
              <div
                className="relative overflow-hidden rounded-[1.5rem] aspect-[9/10] border border-teal/15"
                style={{
                  boxShadow:
                    '0 30px 70px -20px rgba(4,8,18,0.38), 0 12px 24px -10px rgba(253,209,52,0.18), 0 0 0 1px rgba(4,8,18,0.04)',
                }}
              >
                <img
                  src="/art/founders/marc-louis-backtoback-centered.webp"
                  alt="Marc und sein Sohn Louis, 7, sitzen Rücken an Rücken auf einem Hocker, ruhige Studio-Aufnahme."
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                {/* Subtle paper-grain overlay — barely there, lifts digital flatness */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-40"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.24  0 0 0 0 0.25  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
                    backgroundSize: '180px 180px',
                  }}
                />
                {/* Gentle teal vignette */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    boxShadow:
                      'inset 0 -30px 60px -20px rgba(4,8,18,0.18), inset 0 0 80px 10px rgba(4,8,18,0.08)',
                  }}
                />
              </div>
            </div>

            {/* Name block — order matches seating in the photo (Marc left,
             * Louis right). */}
            <div className="mt-5 text-center md:text-left">
              <p className="font-display font-bold text-ink text-base leading-tight">
                Marc &amp; Louis
              </p>
              <p className="text-sm text-ink/60 mt-1 leading-relaxed">
                Marc setzt um &middot; Louis (7) gibt den Takt an
              </p>
            </div>
          </motion.div>

          {/* Text column */}
          <div className="flex flex-col gap-6">
            <motion.h2
              id="ueber-mich-heading"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-ink"
            >
              Ronki ist kein Produkt. Es ist ein{' '}
              <em className="italic text-sage whitespace-nowrap">Experiment</em>{' '}
              mit meinem Sohn.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-col gap-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl"
            >
              <p>
                Ich arbeite seit Jahren als Consultant für Gaming und Esports. Ich weiß, wie Spiele heute gemacht sind. Wo die Casino-Mechaniken versteckt sind, warum manche Apps Kinder minutenlang festhalten, wie Dopamin-Loops funktionieren. Ein Teil von mir hat beruflich daran mitgebaut. Ein anderer Teil wollte das nie in der Hand seines Sohnes sehen.
              </p>
              <p>
                Dann kam Louis in die erste Klasse. Plötzlich reden alle Kinder über Roblox und Fortnite, während wir morgens noch mit Zähneputzen, Anziehen und Tasche packen kämpfen. Irgendwann dachte ich: Wenn andere Apps so gut darin sind, Aufmerksamkeit zu fangen, warum nicht eine bauen, die das Gegenteil macht? Eine, die leise erinnert, begleitet, und sich irgendwann selbst überflüssig macht.
              </p>
            </motion.div>

            {/* Quote callout — styled to match the Footer card (cream/blur/
             * teal-border + washi-tape stickers top-left and bottom-right)
             * so the section visually rhymes with other "grounded" moments
             * on the page. Hyphens disabled to prevent ugly German splits. */}
            <motion.blockquote
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative my-2 md:my-3 max-w-2xl rounded-3xl bg-cream/80 backdrop-blur-sm border border-teal/10 py-10 px-8 sm:py-12 sm:px-12 shadow-sm"
            >
              <QuoteTapeTopRight />
              <QuoteTapeBottomLeft />
              <span
                aria-hidden
                className="absolute -top-2 left-6 font-display font-extrabold text-7xl leading-none text-ink/15 select-none"
              >
                &ldquo;
              </span>
              <p
                lang="de"
                className="relative font-display italic text-xl sm:text-2xl text-ink leading-relaxed pt-2"
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
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col gap-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl"
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
  );
}
