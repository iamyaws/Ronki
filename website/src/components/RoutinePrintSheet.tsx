import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from './PageMeta';
import { RoutineSheet, SheetPageStyle, type SheetHost, type SheetStep } from './sheet';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** One step: drawn picture (`img` in /art/bilderbuch/tasks/), emoji fallback, label, hint. */
export type PrintStep = SheetStep;

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
  /** Steps (4 to 6, fit one portrait A4). */
  steps: PrintStep[];
  /** Optional steps that a switch above the preview puts in front of
   *  `steps`. The print button prints what the preview shows.
   *  `description` replaces the sheet line while the switch is on, for a
   *  line that counts the steps. */
  extraSteps?: { switchLabel: string; steps: PrintStep[]; description?: string };
  /** Ronki at the top right of the sheet, with an optional bubble. */
  ronki?: SheetHost;
  /** "Geschafft!" band under the list. */
  done?: boolean;
  /** Strip on the left of every row for a clothespin (ADHS sheet). */
  clipLane?: boolean;
  /** True for the toddler variant, larger pictures, no labels, bigger circles. */
  bigIcons?: boolean;
  /** Right-hand text in the sheet footer. */
  footerLine?: string;
  /** Screen-only block above the preview, used for the PDF download form.
   *  Never printed. */
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

/**
 * Template page: toolbar, headline, download form, the sheet preview and
 * the guide. The sheet is rendered once and printed as it is shown: in
 * print everything else is hidden and the sheet becomes one A4 page, the
 * same layout as the PDF (both use components/sheet).
 */
export function RoutinePrintSheet({
  slug,
  title,
  eyebrow,
  description,
  steps,
  extraSteps,
  ronki,
  done = false,
  clipLane = false,
  bigIcons = false,
  footerLine = 'ronki.de/vorlagen',
  downloadSlot,
  pageTitle,
  pageIntro,
  metaTitle,
  metaDescription,
  children,
}: Props) {
  const [withExtras, setWithExtras] = useState(false);
  const handlePrint = () => window.print();
  const extrasOn = Boolean(extraSteps && withExtras);
  const shownSteps = extraSteps && extrasOn ? [...extraSteps.steps, ...steps] : steps;
  const shownDescription = (extrasOn && extraSteps?.description) || description;

  return (
    <>
      <PageMeta
        title={metaTitle ?? `${title} · Vorlage zum Ausdrucken`}
        description={metaDescription ?? description}
        canonicalPath={`/vorlagen/${slug}`}
        ogImage={`/og-vorlage-${slug}.jpg`}
      />
      <SheetPageStyle />

      <div className="bg-white min-h-dvh print:min-h-0">
        {/* Screen-only toolbar */}
        <div className="print:hidden max-w-3xl mx-auto px-6 py-6 flex items-center gap-4 flex-wrap">
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
          <header className="print:hidden max-w-3xl mx-auto px-6 pt-2 pb-8">
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
          <div className="print:hidden max-w-3xl mx-auto px-6 pb-10">{downloadSlot}</div>
        )}

        <div className="max-w-3xl mx-auto px-6 pb-16 print:max-w-none print:m-0 print:p-0">
          <div className="print:hidden mb-6">
            <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-2">
              Vorschau
            </p>
            <p className="text-sm text-ink/70 leading-relaxed">
              So wird deine Vorlage aussehen. Tipp auf „Drucken" oben rechts. Dein Browser zeigt dir dann die Druckvorschau, wo du auch auf „Als PDF speichern" umschalten kannst.
            </p>
            {extraSteps && (
              <label className="mt-5 inline-flex cursor-pointer items-center gap-3 font-display font-semibold text-base text-ink">
                <input
                  type="checkbox"
                  role="switch"
                  className="peer sr-only"
                  checked={withExtras}
                  onChange={(event) => setWithExtras(event.target.checked)}
                />
                <span
                  aria-hidden
                  className="relative h-7 w-12 shrink-0 rounded-full border-[2.5px] border-ink bg-white transition-colors peer-checked:bg-cobalt peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt after:absolute after:left-0.5 after:top-1/2 after:h-4.5 after:w-4.5 after:-translate-y-1/2 after:rounded-full after:bg-ink after:transition-transform after:content-[''] peer-checked:after:translate-x-5 peer-checked:after:bg-white"
                />
                {extraSteps.switchLabel}
              </label>
            )}
          </div>
          <div className="bg-white rounded-[28px] overflow-hidden border-[3px] border-ink print:rounded-none print:border-0 print:overflow-visible">
            <RoutineSheet
              eyebrow={eyebrow}
              title={title}
              description={shownDescription}
              heading={pageTitle ? 'h2' : 'h1'}
              steps={shownSteps}
              host={ronki}
              done={done}
              big={bigIcons}
              clipLane={clipLane}
              footerUrl={footerLine}
            />
          </div>
        </div>

        <div className="print:hidden">{children}</div>
      </div>
    </>
  );
}
