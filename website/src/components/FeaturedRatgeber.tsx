/**
 * FeaturedRatgeber — homepage block linking to 3 Ratgeber articles.
 *
 * Why this exists (24 Apr 2026):
 *   Google Search Console flagged 12 article URLs as "Gefunden – zurzeit
 *   nicht indexiert" and 2 legacy URLs as soft redirects. Part of the
 *   root cause: the homepage had ZERO direct links into Ratgeber
 *   articles, so Google had no priority signal for them. The hub
 *   page (/ratgeber) was the only on-site crawl path, and the footer
 *   only links to the hub — not individual articles.
 *
 *   This block surfaces three editor-picked articles on the homepage,
 *   giving Google a strong crawl signal (homepage link weight → article)
 *   AND a real content hook for visitors who scroll past the hero.
 *
 * Editor picks:
 *   1. morgen-troedeln — emotional hook, highest-resonance article
 *   2. sticker-chart-alternative — differentiator, establishes Ronki's
 *      non-extrinsic-motivation position
 *   3. abendroutine-grundschulkind — practical, high search intent
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ARTICLES } from '../data/ratgeber-articles';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';

const FEATURED_SLUGS = [
  'morgen-troedeln',
  'sticker-chart-alternative',
  'abendroutine-grundschulkind',
] as const;

export function FeaturedRatgeber() {
  const picks = FEATURED_SLUGS
    .map((slug) => ARTICLES.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  if (picks.length === 0) return null;

  return (
    <section
      className="relative px-6 py-16 sm:py-24 border-t border-teal/10"
      aria-labelledby="featured-ratgeber-heading"
    >
      <div className="relative max-w-6xl mx-auto">
        {/* ── Header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 1, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-ink/85 mb-4 font-semibold">
            Aus dem Ratgeber
          </p>
          <h2
            id="featured-ratgeber-heading"
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-ink"
          >
            Was wir <em className="italic text-sage">rausgefunden</em> haben.
          </h2>
          <p className="mt-5 text-base opacity-75 max-w-2xl leading-relaxed">
            Ehrliche Artikel für Eltern von 5- bis 8-Jährigen. Keine Ratgeber-Klischees,
            keine Versprechen in drei Schritten. Nur das, was die Forschung sagt und was
            bei uns zuhause wirklich was verändert hat.
          </p>
        </motion.div>

        {/* ── 3 article cards ─────────────────────── */}
        <HandNote
          rotate={4}
          className="mt-6 lg:mt-0 lg:absolute lg:right-0 lg:top-2 lg:w-[180px] lg:text-right"
        >
          Alles selbst ausprobiert.
        </HandNote>

        <ul className="mt-10 grid gap-6 sm:gap-7 md:grid-cols-3">
          {picks.map((article, i) => (
            <motion.li
              key={article.slug}
              initial={{ opacity: 1, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
            >
              <Link
                to={`/ratgeber/${article.slug}`}
                className="group flex flex-col h-full rounded-2xl bg-cream/70 backdrop-blur-sm border border-teal/10 overflow-hidden hover:shadow-lg hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={article.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-teal-dark/25 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-col flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-[0.65rem] font-display font-bold uppercase tracking-[0.15em] text-teal">
                      {article.category}
                    </span>
                    <span className="text-xs text-ink/50">
                      {article.readMinutes} Min.
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-[1.35rem] text-ink leading-snug mb-2 group-hover:text-teal transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-ink/70 leading-relaxed mb-4 flex-1">
                    {article.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-teal font-semibold group-hover:gap-2 transition-all">
                    Weiterlesen <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* ── All articles CTA ────────────────────── */}
        <motion.div
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <Link
            to="/ratgeber"
            className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-6 py-3 text-sm text-ink font-display font-semibold hover:bg-teal-dark hover:text-cream hover:border-teal-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
          >
            Alle Artikel ansehen
            <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
