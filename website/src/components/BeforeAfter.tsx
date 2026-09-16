import { motion } from 'motion/react';

const BEFORE = [
  'Zehnmal „Zähne putzen!" rufen. Eltern-Müdigkeit schon um sieben.',
  'Die Socken-Suche, die Schuh-Schlacht, die Tränen.',
  'Bildschirmzeit als Druckmittel und Belohnung.',
];

const AFTER = [
  'Der Drache erinnert. Du trinkst Kaffee.',
  'Routinen laufen leise, ohne Streit, ohne Druck.',
  'Die App macht sich überflüssig. So soll es sein.',
];

export function BeforeAfter() {
  return (
    <section className="px-6 py-24 sm:py-28 border-t border-teal/10" aria-labelledby="before-after-heading">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-ink/85 mb-6 font-semibold">
            Was sich ändert
          </p>
          <h2
            id="before-after-heading"
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-ink"
          >
            Vorher. <em className="italic text-sage">Nachher.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-teal/15 bg-cream p-7 sm:p-8 flex flex-col"
          >
            <span className="inline-flex self-end items-center px-3 py-1 rounded-full bg-sage/20 text-sage text-xs font-bold uppercase tracking-wider mb-6">
              Der alte Weg
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-6">
              Zufällige Erinnerungen
            </h3>
            <ul className="space-y-4 flex-1">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-sage/60 shrink-0" />
                  <p className="text-sm sm:text-base text-ink/70 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-teal/10">
              <div className="h-2.5 w-full bg-teal/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-mustard rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: '92%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/60 font-semibold mt-2">
                Stresslevel: Chaotisch
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="rounded-2xl border border-teal/30 bg-teal-dark p-7 sm:p-8 text-cream shadow-xl flex flex-col"
            style={{ boxShadow: '0 25px 50px -20px rgba(4,8,18,0.4)' }}
          >
            <span className="inline-flex self-end items-center px-3 py-1 rounded-full bg-mustard/90 text-ink text-xs font-bold uppercase tracking-wider mb-6">
              Der Ronki-Weg
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-cream mb-6">
              Struktur statt Stress
            </h3>
            <ul className="space-y-4 flex-1">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-mustard/80 shrink-0" />
                  <p className="text-sm sm:text-base text-cream/80 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-cream/10">
              <div className="h-2.5 w-full bg-cream/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sage rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: '22%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-cream/70 font-semibold mt-2">
                Stresslevel: Harmonisch
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
