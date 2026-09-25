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
import { DrawnLink, IndexCard, PillButton } from './bausteine';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';

const FEATURED_SLUGS = [
  'morgen-troedeln',
  'sticker-chart-alternative',
  'abendroutine-grundschulkind',
] as const;

/** Each card lies a little differently in the drawer. */
const TILTS = [-1.4, 0.9, -0.6];

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
          {/* Cards out of the index box: the tab names the drawer, the
           *  picture is a small framed thumbnail and "Weiterlesen" is a
           *  drawn line, so the teaser never wears a pill. */}
          <ul className="mt-12 grid gap-9 sm:gap-7 md:grid-cols-3">
            {picks.map((article, i) => (
              <motion.li
                key={article.slug}
                initial={{ opacity: 1, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
              >
                <IndexCard
                  tab={article.category}
                  title={
                    <Link
                      to={`/ratgeber/${article.slug}`}
                      className="text-ink transition-colors hover:text-cobalt"
                    >
                      {article.title}
                    </Link>
                  }
                  meta={`${article.readMinutes} Minuten`}
                  image={article.image}
                  imageAlt=""
                  rotate={TILTS[i % TILTS.length]}
                >
                  <p>{article.description}</p>
                  <DrawnLink href={`/ratgeber/${article.slug}`} className="mt-3">
                    Weiterlesen
                  </DrawnLink>
                </IndexCard>
              </motion.li>
            ))}
          </ul>

          {/* ── All articles CTA ────────────────────── */}
          <div className="mt-12 flex justify-center">
            <PillButton href="/ratgeber">Alle Artikel ansehen</PillButton>
          </div>
        </div>
      </section>
    </div>
  );
}
