import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';

const PHASES = [
  {
    num: '01',
    label: 'Woche 1–2',
    title: 'Ankommen',
    body: 'Ronki lernt dein Kind kennen. Gemeinsam legen sie fest, welche Routinen zählen: Zähne putzen, Schuhe anziehen, Tasche packen. Der Drache erinnert, lobt, erzählt kleine Geschichten. Er ist da, weil dein Kind ihn noch braucht.',
  },
  {
    num: '02',
    label: 'Woche 3–6',
    title: 'Wachsen',
    body: 'Die Routinen werden vertrauter. Ronki erinnert seltener, kommentiert leiser. Dein Kind übernimmt mehr. Und merkt es selbst. Der Drache wächst mit: neue Orte, neue Geschichten, neue Fähigkeiten.',
  },
  {
    num: '03',
    label: 'Woche 7+',
    title: 'Loslassen',
    body: 'Ronki wird still. Er wartet im Nest, bis dein Kind vorbeikommt. Nicht andersherum. Keine Push-Nachrichten, kein Druck. Irgendwann schläft der Drache ein. Und dein Kind macht weiter. Allein.',
  },
];

const PARENT_POINTS = [
  'Du richtest Ronki einmal ein: Routinen, Zeiten, Grenzen.',
  'Du siehst, was dein Kind geschafft hat. Ohne Überwachung, ohne Mikromanagement.',
  'Du trinkst deinen Kaffee. Ronki kümmert sich um den Rest.',
];

const NOT_LIST = [
  'Kein Timer.',
  'Kein Punktesystem.',
  'Kein Wettbewerb zwischen Kindern.',
  'Kein Social-Media-Feed.',
  'Keine In-App-Käufe.',
];

export default function HowItWorks() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Wie Ronki funktioniert: Routinen mit einem Drachen-Gefährten"
        description="So begleitet Ronki dein Kind durch den Tag: vom Morgen bis zum Abend, mit sanfter Begleitung statt Druck. Ein Drache, der sich überflüssig macht."
        canonicalPath="/wie-es-funktioniert"
        ogImage="https://www.ronki.de/og-wie-es-funktioniert.jpg"
      />

      {/* ── Hero ── */}
      <section className="px-6 pt-32 pb-24 sm:pt-40 sm:pb-28">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors mb-8"
            >
              <span aria-hidden>&larr;</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              So funktioniert Ronki
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
              Ein Begleiter, der sich{' '}
              <em className="italic text-sage">überflüssig</em> macht.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Ronki ist kein Belohnungssystem und kein Bildschirm-Babysitter,
              sondern ein kleiner Drache, der dein Kind durch den Alltag
              begleitet. Aus einer Routine, die dein Kind abarbeiten muss, wird
              ein tägliches Ritual, das ihr gemeinsam lebt. Routinen optimiert
              man. Rituale lebt man. Ronki ist für den Unterschied gebaut, und
              zieht sich Schritt für Schritt zurück, sobald das Ritual sitzt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Drei Phasen ── */}
      <section
        className="px-6 py-24 sm:py-28 border-t border-teal/10"
        aria-labelledby="phases-heading"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-ink/85 mb-6 font-semibold">
              Drei Phasen
            </p>
            <h2
              id="phases-heading"
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-ink"
            >
              Vom ersten Tag bis zur Selbstständigkeit.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-10">
            {PHASES.map((phase, i) => (
              <motion.article
                key={phase.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="rounded-2xl border border-teal/10 bg-cream/50 backdrop-blur-sm p-6 sm:p-8"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-xs font-display font-semibold text-teal/70 tracking-[0.2em]">
                    {phase.num}
                  </span>
                  <span className="text-xs text-sage font-display font-semibold uppercase tracking-wider">
                    {phase.label}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink leading-tight mb-3">
                  {phase.title}
                </h3>
                <p className="text-sm sm:text-base text-ink/70 leading-relaxed max-w-2xl">
                  {phase.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Was Eltern tun ── */}
      <section
        className="px-6 py-24 sm:py-28 border-t border-teal/10"
        aria-labelledby="parents-heading"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <h2
              id="parents-heading"
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-ink"
            >
              Deine Rolle: Vertrauen statt Kontrolle.
            </h2>
          </motion.div>

          <ul className="flex flex-col gap-5">
            {PARENT_POINTS.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 rounded-xl border border-teal/10 bg-cream/50 backdrop-blur-sm p-5 sm:p-6"
              >
                <span
                  className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-sage"
                  aria-hidden
                />
                <p className="text-sm sm:text-base text-ink/75 leading-relaxed">
                  {point}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Was Ronki NICHT ist ── */}
      <section
        className="px-6 py-24 sm:py-28 border-t border-teal/10"
        aria-labelledby="not-heading"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <h2
              id="not-heading"
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-ink"
            >
              Was Ronki bewusst nicht ist.
            </h2>
          </motion.div>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            {NOT_LIST.map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="inline-block rounded-xl border border-teal/15 bg-cream/60 backdrop-blur-sm px-5 py-3 text-sm sm:text-base font-display font-semibold text-ink/80"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
