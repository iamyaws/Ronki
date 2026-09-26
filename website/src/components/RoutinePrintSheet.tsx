import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from './PageMeta';
import { RoutineSheet, SheetPageStyle, type SheetHost, type SheetStep } from './sheet';
import {
  RoutineBuilderControls,
  RoutineBuilderShare,
  useRoutinePlan,
} from './routine-builder';
import { leaveNote, sheetDescription, sheetSteps } from '../lib/routine-builder';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** One step: drawn picture (`img` in /art/bilderbuch/tasks/), emoji fallback, label, hint. */
export type PrintStep = SheetStep;

interface BaseProps {
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

type Props = BaseProps &
  (
    | {
        /** Fixed steps (4 to 6, fit one portrait A4). */
        steps: PrintStep[];
        builder?: undefined;
      }
    | {
        /** Parents put the steps together themselves: the builder sits
         *  above the preview, the link and the Ronki card under it. The
         *  plan lives in the address bar. Morning only for now. */
        builder: 'morning';
        steps?: undefined;
      }
  );

/** What the page layout needs besides the page props. */
interface LayoutProps extends BaseProps {
  steps: PrintStep[];
  /** Line under the sheet title; `description` stays the meta fallback. */
  sheetDescription?: string;
  doneNote?: string;
  /** Screen-only blocks above and below the preview. */
  controls?: ReactNode;
  afterSheet?: ReactNode;
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
export function RoutinePrintSheet(props: Props) {
  if (props.builder) return <BuilderPage {...props} />;
  return <TemplateLayout {...props} steps={props.steps} />;
}

/** The morning page with the builder: the sheet follows the plan in the address bar. */
function BuilderPage(props: BaseProps) {
  const builder = useRoutinePlan(`/vorlagen/${props.slug}`);
  return (
    <TemplateLayout
      {...props}
      steps={sheetSteps(builder.plan)}
      sheetDescription={sheetDescription(builder.plan)}
      doneNote={leaveNote(builder.plan)}
      controls={<RoutineBuilderControls builder={builder} />}
      afterSheet={<RoutineBuilderShare builder={builder} />}
    />
  );
}

function TemplateLayout({
  slug,
  title,
  eyebrow,
  description,
  steps,
  sheetDescription: shownDescription = description,
  doneNote,
  controls,
  afterSheet,
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
}: LayoutProps) {
  const handlePrint = () => window.print();

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

        {controls && <div className="print:hidden max-w-3xl mx-auto px-6 pb-10">{controls}</div>}

        <div className="max-w-3xl mx-auto px-6 pb-16 print:max-w-none print:m-0 print:p-0">
          <div className="print:hidden mb-6">
            <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-2">
              Vorschau
            </p>
            <p className="text-sm text-ink/70 leading-relaxed">
              So wird deine Vorlage aussehen. Tipp auf „Drucken" oben rechts. Dein Browser zeigt dir dann die Druckvorschau, wo du auch auf „Als PDF speichern" umschalten kannst.
            </p>
          </div>
          <div className="bg-white rounded-[28px] overflow-hidden border-[3px] border-ink print:rounded-none print:border-0 print:overflow-visible">
            <RoutineSheet
              eyebrow={eyebrow}
              title={title}
              description={shownDescription}
              heading={pageTitle ? 'h2' : 'h1'}
              steps={steps}
              host={ronki}
              done={done}
              doneNote={doneNote}
              big={bigIcons}
              clipLane={clipLane}
              footerUrl={footerLine}
            />
          </div>
          {afterSheet}
        </div>

        <div className="print:hidden">{children}</div>
      </div>
    </>
  );
}
