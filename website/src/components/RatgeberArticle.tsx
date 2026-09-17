import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from './PageMeta';
import { PainterlyShell } from './PainterlyShell';
import { Footer } from './Footer';
import { WaitlistCTA } from './WaitlistCTA';
import { RatgeberFiguresStyles } from './RatgeberFigures';
import { FeedbackForm } from './FeedbackForm';
import { ArticleSchema, BreadcrumbListSchema } from './JsonLd';
import { LAUNCH_STATE, getLaunchCopy } from '../config/launch-state';
import { EASE_OUT } from '../lib/motion';

export interface RelatedLink {
  slug: string;
  title: string;
}

interface Props {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  publishedAt: string;
  heroImage?: string;
  heroAlt?: string;
  /** Short hand-written line under the hero picture. The alt text is a
   *  description for screen readers and reads far too long as a caption,
   *  so pages pass their own line or take the default. */
  heroCaption?: string;
  /** Path to a 1200x630 OG image for social previews. Falls back to /og-ronki.jpg. */
  ogImage?: string;
  related?: RelatedLink[];
  children: ReactNode;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Article design-system primitives
 * Import alongside <RatgeberArticle> for in-body visual rhythm.
 * ──────────────────────────────────────────────────────────────────────────── */

export function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <div className="ratgeber-pullquote">
      <div className="ratgeber-pullquote__body">{children}</div>
      {attribution && <cite>{attribution}</cite>}
    </div>
  );
}

type CalloutType = 'wichtig' | 'forschung' | 'ausprobieren' | 'achtung';

export function Callout({
  type = 'forschung',
  label,
  children,
}: {
  type?: CalloutType;
  label?: string;
  children: ReactNode;
}) {
  const defaultLabels: Record<CalloutType, string> = {
    wichtig: 'Wichtig',
    forschung: 'Was die Forschung sagt',
    ausprobieren: 'Ausprobieren',
    achtung: 'Achtung',
  };
  return (
    <aside className={`ratgeber-callout ratgeber-callout--${type}`}>
      <span className="ratgeber-callout__label">{label || defaultLabels[type]}</span>
      <div className="ratgeber-callout__body">{children}</div>
    </aside>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <div className="ratgeber-steps">{children}</div>;
}

export function StepCard({
  n,
  title,
  children,
}: {
  n: number | string;
  title: string;
  children: ReactNode;
}) {
  const nStr = typeof n === 'number' ? String(n).padStart(2, '0') : n;
  return (
    <div className="ratgeber-step">
      <span className="ratgeber-step__n" aria-hidden>
        {nStr}
      </span>
      <h3 className="ratgeber-step__title">{title}</h3>
      <div className="ratgeber-step__body">{children}</div>
    </div>
  );
}

export function Figure({
  src,
  alt,
  caption,
  wide = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  wide?: boolean;
}) {
  return (
    <figure className={`ratgeber-figure ${wide ? 'ratgeber-figure--wide' : ''}`}>
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Main article shell
 * ──────────────────────────────────────────────────────────────────────────── */

export function RatgeberArticle({
  slug,
  title,
  description,
  category,
  readMinutes,
  publishedAt,
  heroImage,
  heroAlt,
  heroCaption = 'Aus Ronkis Welt',
  ogImage,
  related,
  children,
}: Props) {
  const formattedDate = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(publishedAt));

  const fullUrl = `https://www.ronki.de/ratgeber/${slug}`;
  // Prefer the explicit ogImage, fall back to heroImage, then to the
  // site default. ArticleSchema needs an absolute URL, so prepend the
  // domain when a relative path is passed.
  const schemaImagePath = ogImage || heroImage || '/og-ronki.jpg';
  const schemaImage = schemaImagePath.startsWith('http')
    ? schemaImagePath
    : `https://www.ronki.de${schemaImagePath}`;

  return (
    <PainterlyShell readingProgress>
      <PageMeta
        title={`${title} · Ratgeber`}
        description={description}
        canonicalPath={`/ratgeber/${slug}`}
        ogImage={ogImage}
      />
      <ArticleSchema
        url={fullUrl}
        headline={title}
        description={description}
        image={schemaImage}
        datePublished={publishedAt}
      />
      <BreadcrumbListSchema
        items={[
          { name: 'Start', url: 'https://www.ronki.de/' },
          { name: 'Ratgeber', url: 'https://www.ronki.de/ratgeber' },
          { name: title, url: fullUrl },
        ]}
      />

      {/* ─────────── Hero ─────────── */}
      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/ratgeber"
              className="inline-flex items-center gap-2 font-display font-semibold text-sm text-ink/70 hover:text-ink transition-colors mb-8"
            >
              <svg aria-hidden viewBox="0 0 64 64" className="h-3.5 w-3.5">
                <use href="#bb-back" />
              </svg>
              Ratgeber
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center rounded-full bg-sky-wash px-3.5 py-1.5 text-[0.7rem] font-display font-bold uppercase tracking-[0.1em] text-cobalt">
                {category}
              </span>
              <span className="text-xs text-ink/50">
                {formattedDate} · {readMinutes} Min. Lesezeit
              </span>
            </div>

            <h1 className="bb-display text-3xl sm:text-4xl lg:text-5xl text-ink">
              {title}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-ink/70 leading-relaxed">
              {description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Hero image (optional) ─────────── */}
      {heroImage && (
        <section className="px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
            className="max-w-4xl mx-auto"
          >
            <div className="bb-frame relative aspect-[16/9] sm:aspect-[2/1] rotate-[1.5deg]">
              <img
                src={heroImage}
                alt={heroAlt || ''}
                className="w-full h-full object-cover"
                width={1200}
                height={600}
              />
            </div>
            {heroCaption && (
              <p className="bb-hand mt-4 ml-4 text-xl sm:text-2xl leading-tight text-cobalt -rotate-1">
                {heroCaption}
              </p>
            )}
          </motion.div>
        </section>
      )}

      {/* ─────────── Body ─────────── */}
      <article className="px-6 pb-24">
        <div className="max-w-[680px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="ratgeber-body"
          >
            {children}
          </motion.div>
        </div>
      </article>

      {/* ─────────── CTA ─────────── */}
      <section className="px-6 py-20 sm:py-24 bg-cobalt text-white">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <p className="bb-hand text-2xl uppercase text-sun leading-none mb-3">
                Ritual statt Routine
              </p>
              <h2 className="bb-display text-2xl sm:text-3xl mb-4">
                Ronki macht aus der Routine ein tägliches Ritual.
              </h2>
              <p className="text-white/[0.88] leading-relaxed">
                {getLaunchCopy(LAUNCH_STATE).ctaAction === 'install'
                  ? 'Eine Routine führst du aus. Ein Ritual lebt ihr gemeinsam. Ronki läuft direkt im Browser, ohne Store, ohne Download, ohne Werbung. Probier es aus und schreib uns an hallo@ronki.de, wenn was klemmt.'
                  : 'Eine Routine führst du aus. Ein Ritual lebt ihr gemeinsam. Wir öffnen Ronki in kleinen Gruppen. Kein Store, kein Download, keine Werbung. Trag dich ein und sag uns, wo\u2019s bei euch gerade klemmt.'}
              </p>
            </div>
            <div className="text-white">
              <WaitlistCTA launchState={LAUNCH_STATE} onDarkBackground />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Related articles ─────────── */}
      {related && related.length > 0 && (
        <section className="px-6 py-20 sm:py-24 border-t-2 border-ink/10">
          <div className="max-w-3xl mx-auto">
            <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-5">
              Weiterlesen
            </p>
            <ul className="divide-y-2 divide-ink/10">
              {related.map((link) => (
                <li key={link.slug}>
                  <Link
                    to={`/ratgeber/${link.slug}`}
                    className="group flex items-start gap-4 py-5 hover:text-cobalt transition-colors"
                  >
                    <span className="flex-1 font-display font-bold text-base sm:text-lg text-ink group-hover:text-cobalt transition-colors leading-snug">
                      {link.title}
                    </span>
                    <svg
                      aria-hidden
                      viewBox="0 0 64 64"
                      className="mt-1.5 h-4 w-4 shrink-0 text-cobalt transition-transform group-hover:translate-x-1"
                    >
                      <use href="#bb-arrow" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─────────── Feedback / content-planning ─────────── */}
      <section className="px-6 py-20 sm:py-24 border-t-2 border-ink/10 bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-3">
            Was fehlt dir zu diesem Thema?
          </p>
          <h2 className="bb-display text-2xl sm:text-3xl text-ink mb-4">
            Sag uns, was wir noch schreiben sollen.
          </h2>
          <p className="text-base text-ink/70 leading-relaxed mb-8">
            Wir planen die nächsten Artikel anhand der Fragen, die Eltern uns
            schicken. Welche Seite des Themas haben wir hier nicht abgedeckt?
            Welcher Fall trifft auf euch nicht zu?
          </p>
          <FeedbackForm
            source={`ratgeber/${slug}`}
            label="Was fehlt dir an diesem Artikel?"
            placeholder={'Zum Beispiel: \u201EIhr schreibt \u00fcber Grundschulkinder, aber unser J\u00fcngster ist vier und bekommt alles mit.\u201C'}
          />
        </div>
      </section>

      {/* The article already closes on its own cobalt CTA block, so the
       *  night band stays off here. One dark closing moment per page. */}
      <Footer closing={false} />

      <RatgeberFiguresStyles />

      {/* Article body styling — shared across all Ratgeber articles */}
      <style>{`
        .ratgeber-body {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 1.1rem;
          hyphens: manual;
          -webkit-hyphens: manual;
          line-height: 1.75;
          color: rgb(26 32 34 / 0.82);
        }
        .ratgeber-body > * + * {
          margin-top: 1.2em;
        }
        .ratgeber-body h2 {
          font-family: 'Fredoka', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          line-height: 1.2;
          color: #040812;
          margin-top: 2.5em;
          margin-bottom: 0.6em;
          letter-spacing: -0.01em;
          text-wrap: balance;
        }
        @media (min-width: 640px) {
          .ratgeber-body h2 { font-size: 2rem; }
        }
        .ratgeber-body h3 {
          font-family: 'Fredoka', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1.3rem;
          line-height: 1.25;
          color: #040812;
          margin-top: 2em;
          margin-bottom: 0.4em;
          letter-spacing: -0.005em;
        }
        .ratgeber-body p {
          text-wrap: pretty;
        }
        .ratgeber-body strong {
          color: #040812;
          font-weight: 600;
        }
        .ratgeber-body em {
          color: #040812;
        }
        .ratgeber-body a {
          color: #0544B0;
          text-decoration: underline;
          text-decoration-color: rgba(5, 68, 176, 0.5);
          text-underline-offset: 3px;
          transition: text-decoration-color 0.2s;
        }
        .ratgeber-body a:hover {
          text-decoration-color: #0544B0;
        }
        .ratgeber-body blockquote {
          border-left: 6px solid #FDD134;
          padding-left: 1.5rem;
          margin: 2em 0;
          font-family: 'Fredoka', system-ui, sans-serif;
          font-size: 1.25rem;
          line-height: 1.5;
          font-style: italic;
          color: #040812;
          font-weight: 500;
        }
        .ratgeber-body ul, .ratgeber-body ol {
          padding-left: 1.5rem;
        }
        .ratgeber-body ul { list-style: none; padding-left: 0; }
        .ratgeber-body ul li {
          padding-left: 1.75rem;
          position: relative;
          margin-top: 0.5em;
        }
        .ratgeber-body ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.75em;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background-color: #FDD134;
        }
        .ratgeber-body ol {
          counter-reset: item;
          list-style: none;
          padding-left: 0;
        }
        .ratgeber-body ol li {
          counter-increment: item;
          padding-left: 2.5rem;
          position: relative;
          margin-top: 0.9em;
        }
        .ratgeber-body ol li::before {
          content: counter(item, decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0.1em;
          font-family: 'Fredoka', system-ui, sans-serif;
          font-weight: 700;
          font-size: 0.85em;
          color: #0544B0;
          letter-spacing: 0.05em;
        }
        .ratgeber-body hr {
          border: none;
          height: 1px;
          background: rgba(4, 8, 18, 0.15);
          margin: 3em 0;
        }
        .ratgeber-body .lead {
          font-size: 1.25rem;
          line-height: 1.6;
          color: rgb(26 32 34 / 0.9);
          font-weight: 500;
        }
        /* Drop cap on the lead paragraph — first letter only */
        .ratgeber-body .lead::first-letter {
          font-family: 'Fredoka', system-ui, sans-serif;
          font-weight: 800;
          font-size: 4.25rem;
          line-height: 0.88;
          float: left;
          margin: 0.25rem 0.6rem -0.1rem 0;
          color: #0544B0;
          letter-spacing: -0.04em;
        }
        .ratgeber-body .source {
          font-size: 0.85rem;
          color: rgb(26 32 34 / 0.55);
          font-style: italic;
        }

        /* ── PullQuote ──────────────────────────────────────────────── */
        .ratgeber-pullquote {
          position: relative;
          margin: 3em 0;
          background: #B9E3FC;
          border-radius: 1.5rem;
          padding: 1.75rem 1.75rem 1.5rem 2.75rem;
          font-family: 'Fredoka', system-ui, sans-serif;
          font-weight: 500;
          font-size: 1.5rem;
          line-height: 1.3;
          color: #040812;
          font-style: italic;
          letter-spacing: -0.015em;
          text-wrap: balance;
        }
        @media (min-width: 640px) {
          .ratgeber-pullquote {
            font-size: 1.85rem;
            padding-left: 3.25rem;
            margin: 3.5em -1.5rem;
          }
        }
        .ratgeber-pullquote::before {
          content: "\\201C";
          position: absolute;
          left: 0.6rem;
          top: 0.1rem;
          font-size: 5rem;
          line-height: 1;
          color: #FDD134;
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 700;
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .ratgeber-pullquote::before {
            font-size: 6rem;
            top: -0.3rem;
            left: 0.6rem;
          }
        }
        .ratgeber-pullquote__body > p {
          margin: 0;
        }
        .ratgeber-pullquote__body > p + p {
          margin-top: 0.5em;
        }
        .ratgeber-pullquote cite {
          display: block;
          font-style: normal;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0544B0;
          margin-top: 1.2rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── Callout ────────────────────────────────────────────────── */
        .ratgeber-callout {
          margin: 2em 0;
          padding: 1.5rem 1.75rem;
          border-radius: 1.375rem;
          position: relative;
        }
        .ratgeber-callout__label {
          display: inline-block;
          font-family: 'Fredoka', system-ui, sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-bottom: 0.75rem;
        }
        .ratgeber-callout__body > * { margin: 0; }
        .ratgeber-callout__body > * + * { margin-top: 0.75em; }
        .ratgeber-callout__body p { text-wrap: pretty; }
        .ratgeber-callout ul { padding-left: 0; }
        .ratgeber-callout ul li::before {
          top: 0.65em;
          width: 0.35rem;
          height: 0.35rem;
        }
        .ratgeber-callout--wichtig {
          background: #FFFFFF;
          color: #040812;
          border: 3px solid #040812;
        }
        .ratgeber-callout--wichtig .ratgeber-callout__label {
          color: #040812;
        }
        .ratgeber-callout--wichtig strong { color: #040812; font-weight: 700; }
        .ratgeber-callout--wichtig a {
          color: #0544B0;
          text-decoration-color: rgba(5, 68, 176, 0.5);
        }
        .ratgeber-callout--forschung {
          background: #B9E3FC;
          color: #040812;
        }
        .ratgeber-callout--forschung .ratgeber-callout__label {
          color: #0544B0;
        }
        .ratgeber-callout--ausprobieren {
          background: #FFFFFF;
          color: #040812;
          border: 2.5px solid #0544B0;
        }
        .ratgeber-callout--ausprobieren .ratgeber-callout__label {
          color: #0544B0;
        }
        .ratgeber-callout--achtung {
          background: #FFFFFF;
          color: #040812;
          border: 3px solid #EE4F35;
        }
        .ratgeber-callout--achtung .ratgeber-callout__label {
          color: #040812;
        }

        /* ── StepCard ───────────────────────────────────────────────── */
        .ratgeber-steps {
          margin: 2.5em 0;
          display: grid;
          gap: 1rem;
        }
        .ratgeber-step {
          position: relative;
          padding: 1.5rem 1.5rem 1.25rem 4.5rem;
          background: #FFFFFF;
          border-radius: 1.375rem;
          border: 2.5px solid #040812;
        }
        .ratgeber-step__n {
          position: absolute;
          left: 1.25rem;
          top: 1.3rem;
          font-family: 'Fredoka', system-ui, sans-serif;
          font-weight: 800;
          font-size: 1.75rem;
          line-height: 1;
          color: #0544B0;
          letter-spacing: -0.02em;
        }
        .ratgeber-step__title {
          font-family: 'Fredoka', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          color: #040812;
          margin: 0 0 0.5rem;
          line-height: 1.3;
          letter-spacing: -0.005em;
        }
        .ratgeber-step__body > * { margin: 0; }
        .ratgeber-step__body > * + * { margin-top: 0.6em; }
        .ratgeber-step__body p {
          font-size: 1rem;
          line-height: 1.65;
        }

        /* ── Figure ─────────────────────────────────────────────────── */
        .ratgeber-figure {
          margin: 2.5em 0;
        }
        @media (min-width: 640px) {
          .ratgeber-figure--wide { margin: 2.5em -1.5rem; }
        }
        .ratgeber-figure img {
          width: 100%;
          height: auto;
          border: 3px solid #040812;
          border-radius: 1.75rem;
          display: block;
        }
        .ratgeber-figure figcaption {
          font-family: 'Gochi Hand', 'Comic Sans MS', cursive;
          font-size: 1.25rem;
          line-height: 1.15;
          color: #0544B0;
          margin-top: 0.85rem;
          text-align: center;
        }
      `}</style>
    </PainterlyShell>
  );
}
