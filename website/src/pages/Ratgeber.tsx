import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { EASE_OUT } from '../lib/motion';
import { ARTICLES } from '../data/ratgeber-articles';

export default function Ratgeber() {
  const featured = ARTICLES.find((a) => a.featured);
  const rest = ARTICLES.filter((a) => !a.featured);

  return (
    <PainterlyShell>
      <PageMeta
        title="Ratgeber: Ronki"
        description="Ehrliche Artikel für Eltern von 5- bis 8-Jährigen. Über Morgenroutinen, Abendroutinen, Motivation und was in Kinder-Apps wirklich passiert. Kein Ratgeber-Kitsch, keine Versprechen, nur das, was wir selbst rausgefunden haben."
        canonicalPath="/ratgeber"
        ogImage="/og-ratgeber.jpg"
      />

      {/* ─────────── Hero ─────────── */}
      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
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
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Ratgeber
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
              Was wir <em className="italic text-sage">rausgefunden</em> haben.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Ich schreibe hier über die Themen, die uns als Eltern von 5- bis 8-Jährigen wirklich
              beschäftigen. Keine Ratgeber-Klischees, keine Versprechen in drei Schritten. Nur das,
              was die Forschung sagt, was bei uns zuhause wirklich was verändert hat und wo ich als
              Gamer-Vater mit Tech-Background nicht hinter dem Berg halte.
            </p>
            <p className="mt-4 text-sm text-ink/60 max-w-2xl leading-relaxed">
              Sieben Artikel, direkt aus dem, was Eltern uns in den letzten Monaten gefragt haben.
              Nichts davon ist gesponsert. Nichts davon hat ein Partnerprogramm im Hintergrund.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Featured article ─────────── */}
      {featured && (
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="group relative overflow-hidden rounded-[1.5rem] bg-teal-dark text-cream grid md:grid-cols-[1.1fr_1fr]"
              style={{ boxShadow: '0 24px 48px -24px rgba(4,8,18,0.35)' }}
            >
              <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center rounded-full bg-mustard/90 px-3 py-1 text-[0.7rem] font-display font-bold uppercase tracking-[0.15em] text-ink">
                    Unser Einstieg
                  </span>
                  <span className="text-xs text-cream/60">
                    {featured.category} · {featured.readMinutes} Min.
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2.3rem] leading-[1.1] text-cream mb-4">
                  {featured.title}
                </h2>
                <p className="text-cream/80 text-base leading-relaxed mb-8">
                  {featured.description}
                </p>
                <Link
                  to={`/ratgeber/${featured.slug}`}
                  className="self-start inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-ink font-display font-bold text-sm transition-all group-hover:gap-3"
                >
                  Artikel lesen
                  <span aria-hidden>→</span>
                </Link>
              </div>
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] order-first md:order-last">
                <img
                  src={featured.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
                <div
                  className="absolute inset-0 md:bg-gradient-to-l md:from-transparent md:via-teal-dark/10 md:to-teal-dark/40 bg-gradient-to-t from-teal-dark/60 via-teal-dark/10 to-transparent"
                  aria-hidden
                />
              </div>
            </motion.article>
          </div>
        </section>
      )}

      {/* ─────────── Article list ─────────── */}
      <section className="px-6 pb-24 sm:pb-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
            Alle Artikel
          </p>
          <ul className="divide-y divide-teal/10">
            {rest.map((article, i) => (
              <motion.li
                key={article.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
              >
                <Link
                  to={`/ratgeber/${article.slug}`}
                  className="group grid sm:grid-cols-[160px_1fr] gap-5 sm:gap-7 py-8 hover:bg-cream/40 -mx-4 px-4 rounded-xl transition-colors"
                >
                  <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-xl ring-1 ring-inset ring-teal/10">
                    <img
                      src={article.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-[0.65rem] font-display font-bold uppercase tracking-[0.15em] text-teal">
                        {article.category}
                      </span>
                      <span className="text-xs text-ink/50">
                        {article.readMinutes} Min. Lesezeit
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-ink leading-snug mb-3 group-hover:text-teal transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-base text-ink/70 leading-relaxed mb-3">
                      {article.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-teal font-medium group-hover:gap-2 transition-all">
                      Weiterlesen <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────── Bottom note ─────────── */}
      <section className="px-6 py-16 sm:py-20 bg-cream/40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-4"
          >
            Du willst einen bestimmten Artikel?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl sm:text-3xl text-ink mb-4"
          >
            Sag uns, was bei euch hängt.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base text-ink/70 leading-relaxed max-w-xl mx-auto mb-6"
          >
            Der Ratgeber wächst mit den Fragen, die wir von Eltern hören. Schreib uns eine
            Mail, wenn ein Thema fehlt.
          </motion.p>
          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            href="mailto:hallo@ronki.de"
            className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-5 py-2.5 text-sm text-ink hover:bg-teal-dark hover:text-cream transition-colors"
          >
            hallo@ronki.de
          </motion.a>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
