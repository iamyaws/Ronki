import { motion } from 'motion/react';

const BARS = [
  { week: 'Woche 1', external: 85, internal: 15, label: 'Ronki erinnert, lobt, begleitet' },
  { week: 'Woche 3', external: 50, internal: 50, label: 'Routine wird vertrauter' },
  { week: 'Woche 6', external: 20, internal: 80, label: 'Dein Kind macht es selbst' },
  { week: 'Woche 10+', external: 5, internal: 95, label: 'Ronki wird nicht mehr gebraucht' },
];

export function IntrinsicMotivation() {
  return (
    <section className="px-6 py-24 sm:py-28 border-t border-teal/10" aria-labelledby="intrinsic-heading">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-ink/85 mb-6 font-semibold">
              Der Ansatz dahinter
            </p>
            <h2
              id="intrinsic-heading"
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-ink mb-6"
            >
              Intrinsisch statt{' '}
              <em className="italic text-sage">extrinsisch.</em>
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-ink/70 leading-relaxed">
              <p>
                Kinder-Apps arbeiten oft mit externen Belohnungen: Punkte, Abzeichen, Lootboxen. Das funktioniert kurzfristig, tötet aber die natürliche Motivation.
              </p>
              <p>
                Ronki dreht das um: Am Anfang begleitet der Drache intensiv. Dann zieht er sich Schritt für Schritt zurück, bis dein Kind seine Routinen <strong className="text-ink">aus eigenem Antrieb</strong> macht.
              </p>
              <p className="text-sm text-ink/60">
                Inspiriert von der Selbstbestimmungstheorie (Deci & Ryan) und dem Montessori-Prinzip der vorbereiteten Umgebung. Autonomie, Kompetenz und Verbundenheit statt Abhängigkeit.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="rounded-2xl bg-cream/90 border border-teal/15 p-7 sm:p-8 shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-ink/70 font-semibold mb-8">
              Fading Rewards: So löst sich Ronki auf
            </p>
            <div className="space-y-6">
              {BARS.map((bar, i) => (
                <motion.div
                  key={bar.week}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-display font-bold text-ink">{bar.week}</span>
                    <span className="text-xs text-ink/45">{bar.label}</span>
                  </div>
                  <div className="flex h-3.5 rounded-full overflow-hidden bg-teal-dark/8">
                    <motion.div
                      className="bg-mustard rounded-l-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.external}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.12 }}
                    />
                    <motion.div
                      className="bg-sage/70"
                      style={{ borderRadius: bar.external <= 5 ? '9999px' : '0 9999px 9999px 0' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.internal}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.12 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-teal/10">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-mustard" />
                <span className="text-xs text-ink/60 font-semibold">Externe Begleitung</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sage/70" />
                <span className="text-xs text-ink/60 font-semibold">Eigener Antrieb</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-sm text-ink/50 text-center"
        >
          Basierend auf Selbstbestimmungstheorie (Deci & Ryan), Fading Scaffolding (Vygotsky) und Montessori-Prinzipien.{' '}
          <a href="/wissenschaft" className="underline decoration-teal/30 hover:text-ink transition-colors">
            Mehr erfahren →
          </a>
        </motion.p>
      </div>
    </section>
  );
}
