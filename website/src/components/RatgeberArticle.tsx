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
  /** Set only after a substantive rewrite. Shown next to the date and sent as dateModified. */
  updatedAt?: string;
  heroImage?: string;
  heroAlt?: string;
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
  updatedAt,
  heroImage,
  heroAlt,
  ogImage,
  related,
  children,
}: Props) {
  const formattedDate = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(publishedAt));
  const formattedUpdate = updatedAt
    ? new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(updatedAt))
    : null;

  const fullUrl = `https://www.ronki.de/ratgeber/${slug}`;
  // Prefer the explicit ogImage, fall back to heroImage, then to the
  // site default. ArticleSchema needs an absolute URL, so prepend the
  // domain when a relative path is passed.
  const schemaImagePath = ogImage || heroImage || '/og-ronki.jpg';
  const schemaImage = schemaImagePath.startsWith('http')
    ? schemaImagePath
    : `https://www.ronki.de${schemaImagePath}`;

  return (
    <PainterlyShell>
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
        dateModified={updatedAt}
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
              className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark transition-colors mb-8"
            >
              <span aria-hidden>←</span> Ratgeber
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-[0.7rem] font-display font-bold uppercase tracking-[0.15em] text-teal">
                {category}
              </span>
              <span className="text-xs text-ink/50">
                {formattedDate}
                {formattedUpdate && <>, aktualisiert am {formattedUpdate}</>} · {readMinutes} Min. Lesezeit
              </span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-teal-dark">
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
            <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden rounded-[1.5rem] ring-1 ring-inset ring-teal/10 shadow-sm">
              <img
                src={heroImage}
                alt={heroAlt || ''}
                className="w-full h-full object-cover"
                width={1200}
                height={600}
              />
            </div>
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
      <section className="px-6 py-20 sm:py-24 bg-teal-dark text-cream">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-mustard/80 font-semibold mb-4">
                Ritual statt Routine
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-4">
                Ronki macht aus der Routine ein tägliches Ritual.
              </h2>
              <p className="text-cream/70 leading-relaxed">
                {getLaunchCopy(LAUNCH_STATE).ctaAction === 'install'
                  ? 'Eine Routine führst du aus. Ein Ritual lebt ihr gemeinsam. Ronki läuft direkt im Browser, ohne Store, ohne Download, ohne Werbung. Probier es aus und schreib uns an hallo@ronki.de, wenn was klemmt.'
                  : 'Eine Routine führst du aus. Ein Ritual lebt ihr gemeinsam. Wir öffnen Ronki in kleinen Gruppen. Kein Store, kein Download, keine Werbung. Trag dich ein und sag uns, wo\u2019s bei euch gerade klemmt.'}
              </p>
            </div>
            <div className="text-cream">
              <WaitlistCTA launchState={LAUNCH_STATE} onDarkBackground />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Related articles ─────────── */}
      {related && related.length > 0 && (
        <section className="px-6 py-20 sm:py-24 border-t border-teal/10">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Weiterlesen
            </p>
            <ul className="divide-y divide-teal/10">
              {related.map((link) => (
                <li key={link.slug}>
                  <Link
                    to={`/ratgeber/${link.slug}`}
                    className="group flex items-start gap-4 py-5 hover:text-teal transition-colors"
                  >
                    <span className="flex-1 font-display font-semibold text-base sm:text-lg text-teal-dark group-hover:text-teal transition-colors leading-snug">
                      {link.title}
                    </span>
                    <span
                      className="text-teal/60 group-hover:text-teal group-hover:translate-x-1 transition-all"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─────────── Feedback / content-planning ─────────── */}
      <section className="px-6 py-20 sm:py-24 border-t border-teal/10 bg-cream/30">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
            Was fehlt dir zu diesem Thema?
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight tracking-tight text-teal-dark mb-4">
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

      <Footer />

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
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          line-height: 1.2;
          color: #1A3C3F;
          margin-top: 2.5em;
          margin-bottom: 0.6em;
          letter-spacing: -0.01em;
          text-wrap: balance;
        }
        @media (min-width: 640px) {
          .ratgeber-body h2 { font-size: 2rem; }
        }
        .ratgeber-body h3 {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1.3rem;
          line-height: 1.25;
          color: #1A3C3F;
          margin-top: 2em;
          margin-bottom: 0.4em;
          letter-spacing: -0.005em;
        }
        .ratgeber-body p {
          text-wrap: pretty;
        }
        .ratgeber-body strong {
          color: #1A3C3F;
          font-weight: 600;
        }
        .ratgeber-body em {
          color: #1A3C3F;
        }
        .ratgeber-body a {
          color: #2D5A5E;
          text-decoration: underline;
          text-decoration-color: rgba(80, 160, 130, 0.5);
          text-underline-offset: 3px;
          transition: text-decoration-color 0.2s;
        }
        .ratgeber-body a:hover {
          text-decoration-color: #2D5A5E;
        }
        .ratgeber-body blockquote {
          border-left: 3px solid #FCD34D;
          padding-left: 1.5rem;
          margin: 2em 0;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 1.25rem;
          line-height: 1.5;
          font-style: italic;
          color: #1A3C3F;
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
          background-color: #FCD34D;
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
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 0.85em;
          color: #50A082;
          letter-spacing: 0.05em;
        }
        .ratgeber-body hr {
          border: none;
          height: 1px;
          background: rgba(45, 90, 94, 0.15);
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
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 4.25rem;
          line-height: 0.88;
          float: left;
          margin: 0.25rem 0.6rem -0.1rem 0;
          color: #50A082;
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
          padding: 0.5rem 0 0.5rem 2.5rem;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 500;
          font-size: 1.5rem;
          line-height: 1.3;
          color: #1A3C3F;
          font-style: italic;
          letter-spacing: -0.015em;
          text-wrap: balance;
        }
        @media (min-width: 640px) {
          .ratgeber-pullquote {
            font-size: 1.85rem;
            padding-left: 3rem;
            margin: 3.5em -1.5rem;
          }
        }
        .ratgeber-pullquote::before {
          content: "\\201C";
          position: absolute;
          left: -0.15rem;
          top: -1.5rem;
          font-size: 5rem;
          line-height: 1;
          color: #FCD34D;
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 700;
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .ratgeber-pullquote::before {
            font-size: 6rem;
            top: -2rem;
            left: -0.4rem;
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
          color: #2D5A5E;
          margin-top: 1.2rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── Callout ────────────────────────────────────────────────── */
        .ratgeber-callout {
          margin: 2em 0;
          padding: 1.5rem 1.75rem;
          border-radius: 1rem;
          position: relative;
        }
        .ratgeber-callout__label {
          display: inline-block;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
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
          background: #1A3C3F;
          color: rgb(253 248 240 / 0.92);
        }
        .ratgeber-callout--wichtig .ratgeber-callout__label {
          color: #FCD34D;
        }
        .ratgeber-callout--wichtig strong { color: #FCD34D; font-weight: 700; }
        .ratgeber-callout--wichtig em { color: rgb(253 248 240 / 0.92); }
        .ratgeber-callout--wichtig a {
          color: #FCD34D;
          text-decoration-color: rgba(252, 211, 77, 0.5);
        }
        .ratgeber-callout--forschung {
          background: rgba(80, 160, 130, 0.1);
          color: #1A3C3F;
          border-left: 3px solid #50A082;
        }
        .ratgeber-callout--forschung .ratgeber-callout__label {
          color: #2D5A5E;
        }
        .ratgeber-callout--ausprobieren {
          background: rgba(252, 211, 77, 0.15);
          color: #1A3C3F;
          border-left: 3px solid #FCD34D;
        }
        .ratgeber-callout--ausprobieren .ratgeber-callout__label {
          color: #A83E2C;
        }
        .ratgeber-callout--achtung {
          background: rgba(217, 119, 6, 0.08);
          color: #1A3C3F;
          border-left: 3px solid #D97706;
        }
        .ratgeber-callout--achtung .ratgeber-callout__label {
          color: #A83E2C;
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
          background: rgb(253 248 240 / 0.7);
          backdrop-filter: blur(2px);
          border-radius: 1rem;
          border-left: 3px solid rgba(252, 211, 77, 0.6);
        }
        .ratgeber-step__n {
          position: absolute;
          left: 1.25rem;
          top: 1.3rem;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 1.75rem;
          line-height: 1;
          color: #50A082;
          letter-spacing: -0.02em;
        }
        .ratgeber-step__title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          color: #1A3C3F;
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
          border-radius: 1.25rem;
          display: block;
          box-shadow: 0 8px 24px -12px rgba(26, 60, 63, 0.15);
        }
        .ratgeber-figure figcaption {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 0.85rem;
          color: rgb(45 90 94 / 0.75);
          font-style: italic;
          margin-top: 0.85rem;
          text-align: center;
        }
      `}</style>
    </PainterlyShell>
  );
}
