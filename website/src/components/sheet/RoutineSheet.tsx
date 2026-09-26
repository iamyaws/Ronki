import { DoneBand } from './DoneBand';
import { RonkiHost } from './RonkiHost';
import { SheetFooter } from './SheetFooter';
import { SheetHead } from './SheetHead';
import { SheetRow } from './SheetRow';
import type { SheetHost, SheetStep, SheetTimeBar } from './types';
import './sheet.css';

export interface RoutineSheetProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** h1 on the bare print route, h2 on a page that has its own H1. */
  heading?: 'h1' | 'h2';
  steps: SheetStep[];
  host?: SheetHost;
  /** "Geschafft!" band under the list. */
  done?: boolean;
  /** Toddler sheet: pictures only, bigger rows and rings. */
  big?: boolean;
  /** Tighter rows. Also switched on by itself for five or more steps. */
  compact?: boolean;
  /** "___ Uhr" line in every row. */
  showTimes?: boolean;
  clipLane?: boolean;
  /** One line above the list explaining the clip. */
  nowMarker?: string;
  timeBar?: SheetTimeBar;
  footerUrl?: string;
  /** Fixed A4 page on screen as well, not only in print. */
  page?: boolean;
}

/**
 * The routine sheet in the Bilderbuch look (option A, 26 Sep 2026).
 *
 * One component for the PDF source (/print/vorlage-*) and the preview on
 * the template pages, so the paper from the PDF and the paper from the
 * "Drucken" button look the same. Designed at A4 (794 x 1123 px); on
 * narrow screens sheet.css scales the parts down with container queries.
 */
export function RoutineSheet({
  eyebrow,
  title,
  description,
  heading = 'h1',
  steps,
  host,
  done = false,
  big = false,
  compact = false,
  showTimes = false,
  clipLane = false,
  nowMarker,
  timeBar,
  footerUrl,
  page = false,
}: RoutineSheetProps) {
  const density = big ? 'big' : compact || steps.length > 4 ? 'compact' : 'roomy';

  return (
    <section className={`rs-sheet${page ? ' rs-sheet--a4' : ''}`}>
      <div className={`rs-page rs-page--${density}`}>
        <SheetHead
          eyebrow={eyebrow}
          title={title}
          description={description}
          heading={heading}
          host={host && <RonkiHost pose={host.pose} bubble={host.bubble} />}
        />

        {nowMarker && <p className="rs-now">{nowMarker}</p>}

        <ol className="rs-steps" aria-label="Die Schritte">
          {steps.map((step, i) => (
            <SheetRow
              key={`${step.img ?? step.icon ?? ''}-${step.label}-${i}`}
              index={i}
              step={step}
              showTime={showTimes}
              clipLane={clipLane}
            />
          ))}
        </ol>

        {timeBar && (
          <div className="rs-timebar">
            <div className="rs-timebar-row">
              <span className="rs-timebar-label">{timeBar.start}</span>
              <span className="rs-timebar-track" aria-hidden />
              <span className="rs-timebar-label">{timeBar.end}</span>
            </div>
            {timeBar.note && <p className="rs-timebar-note">{timeBar.note}</p>}
          </div>
        )}

        {done && <DoneBand />}

        <SheetFooter url={footerUrl} />
      </div>
    </section>
  );
}

/**
 * Print setup for a page that prints one sheet: A4, no margin (the sheet
 * carries its own), white ground. Rendered as a style tag so it only
 * applies while a sheet page is mounted, not to every page of the site.
 */
export function SheetPageStyle() {
  return (
    <style>{`
      @media print {
        @page { size: A4 portrait; margin: 0; }
        html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
      }
    `}</style>
  );
}
