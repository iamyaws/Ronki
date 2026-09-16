import { motion } from 'motion/react';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface Freund {
  name: string;
  subtitle: string;
  blurb: string;
  image: string;
  accent: string;
}

const FREUNDE: Freund[] = [
  {
    name: 'Lichtbringerin',
    subtitle: 'Wenn es dunkel wird',
    blurb: 'Sie zündet Laternen an, wenn dein Kind Mut braucht.',
    image: '/art/freunde/lichtbringerin.webp',
    accent: '#0544B0',
  },
  {
    name: 'Sternenweberin',
    subtitle: 'Vor dem Einschlafen',
    blurb: 'Sie webt die Gedanken des Tages zu ruhigen Träumen.',
    image: '/art/freunde/sternenweberin.webp',
    accent: '#0544B0',
  },
  {
    name: 'Windreiterin',
    subtitle: 'Beim Neues wagen',
    blurb: 'Sie springt voraus, wenn etwas schwer aussieht.',
    image: '/art/freunde/windreiterin.webp',
    accent: '#0544B0',
  },
  {
    name: 'Tiefentaucherin',
    subtitle: 'Wenn Gefühle groß sind',
    blurb: 'Sie hört zu, auch wenn die Worte noch fehlen.',
    image: '/art/freunde/tiefentaucherin.webp',
    accent: '#0544B0',
  },
  {
    name: 'Brückenbauer',
    subtitle: 'Wenn Freunde sich streiten',
    blurb: 'Er baut kleine Brücken, wo Worte fehlen.',
    image: '/art/freunde/brueckenbauer.webp',
    accent: '#0544B0',
  },
  {
    name: 'Flackerfuchs',
    subtitle: 'Wenn etwas Freude macht',
    blurb: 'Er tanzt mit, wenn dein Kind lacht.',
    image: '/art/freunde/flackerfuchs.webp',
    accent: '#0544B0',
  },
  {
    name: 'Pilzhüter',
    subtitle: 'Wenn alles wuselt',
    blurb: 'Er atmet langsam, und dein Kind darf mitatmen.',
    image: '/art/freunde/pilzhueter.webp',
    accent: '#0544B0',
  },
];

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function RonkisWelt() {
  return (
    <section
      className="relative px-6 py-24 sm:py-32 border-t border-teal/10"
      aria-labelledby="welt-heading"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-teal mb-6 font-medium">
            Ronkis Welt
          </p>
          <h2
            id="welt-heading"
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-ink"
          >
            Dein Kind ist nicht allein.{' '}
            <em className="italic text-sage">Ronki hat Freunde.</em>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-ink/70 max-w-2xl leading-relaxed">
            Sieben Begleiter, die an den richtigen Momenten des Tages auftauchen. Nicht als Feature-Liste. Als Figuren, die ein Kind gern wiedertrifft.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 sm:gap-6">
          {FREUNDE.map((f, i) => (
            <motion.figure
              key={f.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col cursor-default"
            >
              {/* Painted portrait */}
              <div
                className="relative aspect-square overflow-hidden rounded-[1.25rem] ring-1 ring-inset ring-teal/10"
                style={{
                  boxShadow: '0 12px 30px -12px rgba(4,8,18,0.25)',
                }}
              >
                <div
                  aria-hidden
                  className="absolute -inset-3 rounded-[1.5rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${f.accent} 0%, transparent 65%)` }}
                />
                <img
                  src={f.image}
                  alt={`${f.name}, eine der fünf Freunde in Ronkis Welt.`}
                  loading="lazy"
                  width={400}
                  height={400}
                  className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>

              {/* Caption */}
              <figcaption className="mt-4 [hyphens:none]">
                <p
                  className="text-[0.7rem] uppercase tracking-[0.15em] font-display font-bold mb-1"
                  style={{ color: f.accent }}
                >
                  {f.subtitle}
                </p>
                <p className="font-display font-bold text-base sm:text-lg text-ink leading-tight mb-2">
                  {f.name}
                </p>
                <p className="text-xs sm:text-sm text-ink/65 leading-relaxed">
                  {f.blurb}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
