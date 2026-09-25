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
  /** Accent color (hex). */
  accent: string;
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
  accent,
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
      <div className="print:hidden bg-cream min-h-dvh">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4 flex-wrap">
          <Link
            to="/vorlagen"
            className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark transition-colors"
          >
            <span aria-hidden>←</span> Alle Vorlagen
          </Link>
          <div className="flex-1" />
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-teal-dark px-5 py-2.5 text-cream font-display font-bold text-sm shadow-sm hover:shadow-md hover:bg-teal transition-all"
          >
            <span aria-hidden>🖨️</span>
            Drucken
          </button>
        </div>

        {pageTitle && (
          <header className="max-w-3xl mx-auto px-6 pt-2 pb-8">
            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-teal-dark">
              {pageTitle}
            </h1>
            {pageIntro && (
              <p className="mt-4 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
                {pageIntro}
              </p>
            )}
          </header>
        )}

        {downloadSlot && (
          <div className="max-w-3xl mx-auto px-6 pb-10">{downloadSlot}</div>
        )}

        <div className="max-w-3xl mx-auto px-6 pb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
            Vorschau
          </p>
          <p className="text-sm text-ink/70 mb-6 leading-relaxed">
            So wird deine Vorlage aussehen. Tipp auf „Drucken" oben rechts. Dein Browser zeigt dir dann die Druckvorschau, wo du auch auf „Als PDF speichern" umschalten kannst.
          </p>
          <div
            className="bg-white rounded-2xl overflow-hidden border border-teal/10"
            style={{
              boxShadow: '0 20px 50px -20px rgba(45,90,94,0.25)',
            }}
          >
            <Sheet
              title={title}
              eyebrow={eyebrow}
              description={description}
              accent={accent}
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
          accent={accent}
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
  accent,
  steps,
  bigIcons,
  footerLine,
  heading: Heading,
}: Pick<
  Props,
  'title' | 'eyebrow' | 'description' | 'accent' | 'steps' | 'bigIcons' | 'footerLine'
> & { heading: 'h1' | 'h2' }) {
  const iconSize = bigIcons ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl';
  const circleSize = bigIcons
    ? 'w-20 h-20 sm:w-24 sm:h-24'
    : 'w-14 h-14 sm:w-16 sm:h-16';

  return (
    <div
      className="bg-white text-teal-dark p-8 sm:p-12"
      style={{
        fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-baseline gap-3 mb-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white"
            style={{ backgroundColor: accent }}
          >
            {eyebrow}
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{ backgroundColor: accent, opacity: 0.3 }}
          />
        </div>
        <Heading
          className="font-bold text-3xl sm:text-4xl leading-tight tracking-tight mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {title}
        </Heading>
        <p className="text-base text-teal-dark/65 leading-relaxed max-w-xl">
          {description}
        </p>
      </header>

      {/* Name field */}
      <div className="flex items-baseline gap-4 mb-8 border-b border-teal-dark/20 pb-2">
        <span className="text-xs uppercase tracking-[0.15em] text-teal-dark/50 font-semibold">
          Name
        </span>
        <span className="flex-1" />
        <span className="text-xs uppercase tracking-[0.15em] text-teal-dark/50 font-semibold">
          Datum
        </span>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-4 sm:gap-5">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex items-center gap-5 sm:gap-6 rounded-xl border border-teal-dark/15 p-4 sm:p-5"
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
                <p
                  className="font-bold text-lg sm:text-xl text-teal-dark leading-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  {step.label}
                </p>
              )}
              {step.hint && (
                <p className="text-sm text-teal-dark/55 mt-1 leading-snug">
                  {step.hint}
                </p>
              )}
            </div>
            <span
              aria-hidden
              className={`shrink-0 rounded-full ${circleSize}`}
              style={{
                border: `3px solid ${accent}`,
              }}
            />
          </li>
        ))}
      </ol>

      {/* Footer */}
      <footer className="mt-12 pt-4 border-t border-teal-dark/10 flex items-baseline justify-between">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-teal-dark/40 font-semibold">
          Ausmalen, was geschafft ist
        </p>
        <p className="text-[0.7rem] text-teal-dark/40 font-semibold">
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
