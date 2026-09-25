/* ------------------------------------------------------------------ */
/* 14. CrayonBarChart                                                  */
/* ------------------------------------------------------------------ */

export type BarTone = 'sun' | 'cobalt' | 'sky' | 'sky-wash' | 'ember' | 'ink';

const BAR_CLASS: Record<BarTone, string> = {
  sun: 'bg-sun',
  cobalt: 'bg-cobalt',
  sky: 'bg-sky',
  'sky-wash': 'bg-sky-wash',
  ember: 'bg-ember',
  ink: 'bg-ink',
};

const DOT_CLASS: Record<BarTone, string> = {
  sun: 'text-sun',
  cobalt: 'text-cobalt',
  sky: 'text-sky',
  'sky-wash': 'text-sky-wash',
  ember: 'text-ember',
  ink: 'text-ink',
};

export interface BarRow {
  label: string;
  /** The hand line under the bar. Optional. */
  caption?: string;
  /** Parts of one bar, in percent of the full width. */
  parts: { value: number; tone: BarTone }[];
}

/**
 * The drawn bar chart.
 *
 * Bars are one outlined pill split into coloured parts, warped by the
 * soft crayon filter so the outline wobbles. It is the only chart in the
 * kit, and it only ever shows shares of one whole. No axes, no grid, no
 * second chart type sneaking in beside it.
 */
export function CrayonBarChart({
  rows,
  legend,
  className = '',
}: {
  rows: BarRow[];
  legend?: { tone: BarTone; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="font-display font-bold text-base text-ink">{row.label}</p>
            <div
              className="mt-2 flex h-[22px] w-full overflow-hidden rounded-full border-[2.5px] border-ink"
              style={{ filter: 'url(#bb-crayon-soft)' }}
            >
              {row.parts.map((part, i) => (
                <div
                  key={`${row.label}-${i}`}
                  className={`h-full ${BAR_CLASS[part.tone]}`}
                  style={{ width: `${part.value}%` }}
                />
              ))}
            </div>
            {row.caption && (
              <p className="bb-hand mt-1 text-[1.05rem] leading-none text-cobalt">
                {row.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {legend && legend.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className={`h-3.5 w-3.5 ${DOT_CLASS[item.tone]}`}
                style={{ filter: 'url(#bb-crayon-soft)' }}
              >
                <circle cx="12" cy="12" r="10" fill="currentColor" />
              </svg>
              <span className="font-display font-semibold text-sm text-ink">{item.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
