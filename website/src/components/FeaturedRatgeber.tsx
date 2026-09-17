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

import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ARTICLES } from '../data/ratgeber-articles';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';

const FEATURED_SLUGS = [
  'morgen-troedeln',
  'sticker-chart-alternative',
  'abendroutine-grundschulkind',
] as const;

/** Each picture lies a little differently in its card. */
const TILTS = [-1.5, 1.2, -0.8];

export function FeaturedRatgeber() {
  const picks = FEATURED_SLUGS
    .map((slug) => ARTICLES.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  if (picks.length === 0) return null;

  return (
    <div className="relative">
      <PaperEdge tone="white" variant={0} />
      <section
        className="relative bg-white px-5 sm:px-6 py-12 sm:py-14"
        aria-labelledby="featured-ratgeber-heading"
      >
        <div className="relative max-w-6xl mx-auto">
          {/* ── Header ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 1, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <StickerLabel tone="sky-wash" rotate={-3}>
              Aus dem Ratgeber
            </StickerLabel>

            <h2
              id="featured-ratgeber-heading"
              className="bb-display mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] text-ink"
            >
              Was wir{' '}
              <span className="bb-swipe">
                rausgefunden
                <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                  <use href="#bb-underline" />
                </svg>
              </span>{' '}
              haben.
            </h2>

            <p className="mt-4 text-[1.05rem] sm:text-lg text-ink/85 max-w-2xl leading-relaxed">
              Ehrliche Artikel für Eltern von 5- bis 8-Jährigen. Keine Ratgeber-Klischees,
              keine Versprechen in drei Schritten. Nur das, was die Forschung sagt und was
              bei uns zuhause wirklich was verändert hat.
            </p>
          </motion.div>

          <HandNote
            rotate={4}
            className="mt-6 lg:mt-0 lg:absolute lg:right-2 lg:top-14 lg:w-[190px] lg:text-right"
          >
            Alles selbst ausprobiert.
          </HandNote>

          {/* ── 3 article cards ─────────────────────── */}
          <ul className="mt-12 grid gap-10 sm:gap-8 md:grid-cols-3">
            {picks.map((article, i) => (
              <motion.li
                key={article.slug}
                initial={{ opacity: 1, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
              >
                <Link
                  to={`/ratgeber/${article.slug}`}
                  className="group flex h-full flex-col rounded-[26px] border-[3px] border-ink bg-white px-5 pb-6 pt-0 transition-transform hover:-translate-y-1 focus-visible:-translate-y-1"
                >
                  {/* The picture pokes a little above the card edge, the
                   *  way a photo taped into a book does. */}
                  <div
                    className="-mt-7 overflow-hidden rounded-[18px] border-[3px] border-ink bg-sky-wash [transform:rotate(calc(var(--tilt)*0.5))] sm:[transform:rotate(var(--tilt))]"
                    style={{ '--tilt': `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
                  >
                    <img
                      src={article.image}
                      alt=""
                      className="block aspect-[16/9] w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-6 flex flex-1 flex-col">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-sky-wash px-3.5 py-1.5 text-[0.7rem] font-display font-bold uppercase tracking-[0.1em] text-cobalt">
                        {article.category}
                      </span>
                      <span className="text-sm text-ink/70">
                        {article.readMinutes} Min.
                      </span>
                    </div>

                    <h3 className="bb-display mt-4 text-[1.4rem] sm:text-2xl text-ink">
                      {article.title}
                    </h3>
                    <p className="mt-3 flex-1 text-base text-ink/85 leading-relaxed">
                      {article.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 font-display font-bold text-base text-cobalt">
                      Weiterlesen
                      <svg
                        aria-hidden
                        viewBox="0 0 64 64"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      >
                        <use href="#bb-arrow" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* ── All articles CTA ────────────────────── */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/ratgeber"
              className="group inline-flex items-center gap-3 rounded-full bg-cobalt px-7 py-3.5 font-display font-bold text-base text-white transition-transform hover:-translate-y-0.5"
            >
              Alle Artikel ansehen
              <svg
                aria-hidden
                viewBox="0 0 64 64"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              >
                <use href="#bb-arrow" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
