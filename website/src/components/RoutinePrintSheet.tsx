import { Link } from 'react-router-dom';
import { PageMeta } from './PageMeta';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PrintStep {
  /** Emoji shown large on the left of the row. */
  icon: string;
  /** Short label (kept empty for the toddler variant). */
  label: string;
  /** Optional hint shown below the label in small text. */
  hint?: string;
}

interface Props {
  /** Route slug, used for canonical path (e.g. "morgenroutine"). */
  slug: string;
  /** SEO title + on-sheet heading. */
  title: string;
  /** Eyebrow tag above the title. */
  eyebrow: string;
  /** One-line description for SEO + on-sheet subtitle. */
  description: string;
  /** Legacy per-sheet accent hex. Bilderbuch draws every sheet in ink and
   *  cobalt, so this is kept for the page props but no longer painted. */
  accent?: string;
  /** Steps (3-5 ideal, fit one portrait A4). */
  steps: PrintStep[];
  /** True for the toddler variant, larger icons, no labels, bigger circles. */
  bigIcons?: boolean;
  /** Optional extra tagline shown at the bottom of the sheet. */
  footerLine?: string;
  /** Screen-only block above the preview, used for the PDF download form.
   *  Never printed, so the paper sheet stays exactly as it was. */
  downloadSlot?: React.ReactNode;
  /** Page headline for search. When set, it becomes the only H1 on the page
   *  and the sheet title drops to H2. The printed paper stays the same. */
  pageTitle?: string;
  /** Short screen-only paragraph under the page headline. */
  pageIntro?: string;
  /** Overrides the default meta title and description. */
  metaTitle?: string;
  metaDescription?: string;
  /** Screen-only content below the preview, e.g. usage guide and FAQ. */
  children?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function RoutinePrintSheet({
  slug,
  title,
  eyebrow,
  description,
  steps,
  bigIcons = false,
  footerLine = 'ronki.de',
  downloadSlot,
  pageTitle,
  pageIntro,
  metaTitle,
  metaDescription,
  children,
}: Props) {
  const handlePrint = () => window.print();
  const sheetHeading = pageTitle ? 'h2' : 'h1';

  return (
    <>
      <PageMeta
        title={metaTitle ?? `${title} · Vorlage zum Ausdrucken`}
        description={metaDescription ?? description}
        canonicalPath={`/vorlagen/${slug}`}
        ogImage={`/og-vorlage-${slug}.jpg`}
      />

      {/* Screen-only toolbar, hidden when printing */}
      <div className="print:hidden bg-white min-h-dvh">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4 flex-wrap">
          <Link
            to="/vorlagen"
            className="inline-flex items-center gap-2 font-display font-semibold text-sm text-ink/70 hover:text-ink transition-colors"
          >
            <svg aria-hidden viewBox="0 0 64 64" className="h-3.5 w-3.5">
              <use href="#bb-back" />
            </svg>
            Alle Vorlagen
          </Link>
          <div className="flex-1" />
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-5 py-2.5 text-ink font-display font-bold text-sm transition-transform hover:-translate-y-0.5"
          >
            <svg aria-hidden viewBox="0 0 64 64" className="h-5 w-5 text-ink">
              <use href="#bb-printer" />
            </svg>
            Drucken
          </button>
        </div>

        {pageTitle && (
          <header className="max-w-3xl mx-auto px-6 pt-2 pb-8">
            <h1 className="bb-display text-3xl sm:text-4xl lg:text-5xl text-ink">
              {pageTitle}
            </h1>
            {pageIntro && (
              <p className="mt-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
                {pageIntro}
              </p>
            )}
          </header>
        )}

        {downloadSlot && (
          <div className="max-w-3xl mx-auto px-6 pb-10">{downloadSlot}</div>
        )}

        <div className="max-w-3xl mx-auto px-6 pb-16">
          <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-2">
            Vorschau
          </p>
          <p className="text-sm text-ink/70 mb-6 leading-relaxed">
            So wird deine Vorlage aussehen. Tipp auf „Drucken" oben rechts. Dein Browser zeigt dir dann die Druckvorschau, wo du auch auf „Als PDF speichern" umschalten kannst.
          </p>
          <div className="bg-white rounded-[28px] overflow-hidden border-[3px] border-ink">
            <Sheet
              title={title}
              eyebrow={eyebrow}
              description={description}
              steps={steps}
              bigIcons={bigIcons}
              footerLine={footerLine}
              heading={sheetHeading}
            />
          </div>
        </div>

        {children}
      </div>

      {/* Print-only version, clean, no toolbar */}
      <div className="hidden print:block">
        <Sheet
          title={title}
          eyebrow={eyebrow}
          description={description}
          steps={steps}
          bigIcons={bigIcons}
          footerLine={footerLine}
          heading={sheetHeading}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet body, shared between preview and print                        */
/* ------------------------------------------------------------------ */

function Sheet({
  title,
  eyebrow,
  description,
  steps,
  bigIcons,
  footerLine,
  heading: Heading,
}: Pick<
  Props,
  'title' | 'eyebrow' | 'description' | 'steps' | 'bigIcons' | 'footerLine'
> & { heading: 'h1' | 'h2' }) {
  const iconSize = bigIcons ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl';
  const ringSize = bigIcons
    ? 'w-20 h-20 sm:w-24 sm:h-24'
    : 'w-14 h-14 sm:w-16 sm:h-16';

  return (
    <div
      className="bg-white text-ink p-8 sm:p-12"
      style={{
        fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <header className="mb-10">
        <span className="bb-hand inline-block rounded-[10px] bg-sun px-4 py-1.5 text-xl uppercase leading-none text-ink -rotate-3">
          {eyebrow}
        </span>
        <Heading className="bb-display mt-5 mb-3 text-3xl sm:text-4xl text-ink">
          {title}
        </Heading>
        <p className="text-base text-ink/70 leading-relaxed max-w-xl">
          {description}
        </p>
      </header>

      {/* Name field */}
      <div className="flex items-end gap-4 mb-8 font-display font-semibold text-base text-ink">
        Das ist der Plan von
        <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className="h-3 flex-1 text-ink">
          <use href="#bb-line" />
        </svg>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-4 sm:gap-5">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex items-center gap-5 sm:gap-6 rounded-[22px] border-[2.5px] border-ink p-4 sm:p-5"
            style={{ pageBreakInside: 'avoid' }}
          >
            <span
              aria-hidden
              className={`shrink-0 ${iconSize} leading-none`}
              style={{ fontFamily: 'system-ui' }}
            >
              {step.icon}
            </span>
            <div className="flex-1 min-w-0">
              {step.label && (
                <p className="bb-display text-lg sm:text-xl text-ink">
                  {step.label}
                </p>
              )}
              {step.hint && (
                <p className="text-sm text-ink/65 mt-1 leading-snug">
                  {step.hint}
                </p>
              )}
            </div>
            <svg
              aria-hidden
              viewBox="0 0 64 64"
              className={`shrink-0 text-cobalt ${ringSize}`}
            >
              <use href="#bb-ring" />
            </svg>
          </li>
        ))}
      </ol>

      {/* Footer */}
      <footer className="mt-12 pt-4 border-t-2 border-ink/15 flex items-baseline justify-between gap-4">
        <p className="bb-hand text-lg uppercase text-cobalt leading-none">
          Ausmalen, was geschafft ist
        </p>
        <p className="font-display font-semibold text-xs text-ink/60">
          {footerLine}
        </p>
      </footer>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
