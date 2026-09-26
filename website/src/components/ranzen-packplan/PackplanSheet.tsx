import type { CSSProperties } from 'react';
import { RonkiHost, SheetFooter, SheetHead, TaskPicture } from '../sheet';
import {
  DAILY_ITEMS,
  EXTRA_ITEMS,
  SUPPORT_MODES,
  WEEKDAYS,
  cleanFreeText,
  type PackPlan,
  type WeekdayId,
} from '../../lib/ranzen-packplan';
import '../sheet/sheet.css';
import './packplan-sheet.css';

export const PACKPLAN_TITLE = 'Was kommt heute in den Ranzen?';
export const PACKPLAN_BUBBLE = 'Schau auf deine Karte!';
export const PACKPLAN_HINT = 'In eine Klarsichthülle stecken, dann ist die Karte abwischbar.';
/** Only when a day carries nothing at all, not even the daily items. */
export const PACKPLAN_EMPTY_DAY = 'Heute nichts dazu';
const FOOTER_URL = 'ronki.de/tools/ranzen-packplan';

type Size = 'big' | 'mid' | 'small';

/**
 * Picture size for a day by how many things come on top. Sized so the
 * heaviest day (all nine extras plus a free item) still fits its card on
 * one A4 page; a normal day with one or two extras gets big pictures.
 */
function layoutFor(count: number): { size: Size; cols: number } {
  if (count <= 3) return { size: 'big', cols: Math.max(count, 1) };
  if (count === 4) return { size: 'mid', cols: 4 };
  if (count <= 6) return { size: 'mid', cols: 3 };
  return { size: 'small', cols: 5 };
}

/**
 * The printable Ranzen-Packplan: one A4 page in the Bilderbuch look with a
 * card per school day to cut out along the dashed lines.
 *
 * Built from the routine-sheet parts (components/sheet), so it shares the
 * head, Ronki, the footer and the fixed A4 page with the Vorlagen. What it
 * leaves out on purpose: the name line, circles to fill and any week grid,
 * so a forgotten Turnbeutel never shows up as an empty box.
 */
export function PackplanSheet({
  plan,
  heading = 'h2',
}: {
  plan: PackPlan;
  heading?: 'h1' | 'h2';
}) {
  const mode = SUPPORT_MODES.find((m) => m.id === plan.mode) ?? SUPPORT_MODES[0];

  return (
    <section className="rs-sheet rs-sheet--a4 pp-sheet">
      <div className="rs-page pp-page">
        <SheetHead
          eyebrow="Packplan"
          title={PACKPLAN_TITLE}
          heading={heading}
          nameLine={false}
          host={<RonkiHost pose="wave" bubble={PACKPLAN_BUBBLE} />}
        />

        <div className="pp-grid">
          <Scissors />
          <ul className="pp-cards" aria-label="Die Tageskarten">
            {WEEKDAYS.map((day) => (
              <DayCard key={day.id} plan={plan} day={day.id} label={day.label} />
            ))}
          </ul>
          <div className="pp-howto">
            <p className="pp-note">{mode.note}</p>
            <p className="pp-hint">{PACKPLAN_HINT}</p>
          </div>
        </div>

        <SheetFooter url={FOOTER_URL} />
      </div>
    </section>
  );
}

function DayCard({ plan, day, label }: { plan: PackPlan; day: WeekdayId; label: string }) {
  const daily = DAILY_ITEMS.filter((item) => plan.daily.includes(item.id));
  const extras = EXTRA_ITEMS.filter((item) => plan.days[day].extras.includes(item.id));
  const free = cleanFreeText(plan.days[day].free);
  const count = extras.length + (free ? 1 : 0);
  // A day with nothing on top shows the daily items as its main pictures, so
  // the card never shows an empty middle or a thing that is not packed
  // (Astra PP-02, 26 Sep 2026).
  const onlyDaily = count === 0 && daily.length > 0;
  const main = onlyDaily ? daily : extras;
  const { size, cols } = layoutFor(onlyDaily ? daily.length : count);

  return (
    <li className="pp-card" data-day={day}>
      <div className="pp-card-in">
        <div className="pp-card-top">
          <h3 className="pp-day">{label}</h3>
          {daily.length > 0 && !onlyDaily && (
            <ul className="pp-daily" data-daily aria-label="Jeden Tag dabei">
              {daily.map((item) => (
                <li key={item.id}>
                  <TaskPicture img={item.img} />
                  <span className="pp-sr">{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {count === 0 && daily.length === 0 ? (
          <div className="pp-extras pp-extras--none" data-extras data-size="none">
            <p className="pp-empty">{PACKPLAN_EMPTY_DAY}</p>
          </div>
        ) : (
          <ul
            className="pp-extras"
            data-extras
            data-size={size}
            data-count={onlyDaily ? daily.length : count}
            {...(onlyDaily ? { 'data-only-daily': '' } : {})}
            aria-label={onlyDaily ? 'Jeden Tag dabei' : 'Heute dazu'}
            style={{ '--pp-cols': cols } as CSSProperties}
          >
            {main.map((item) => (
              <li key={item.id} className="pp-extra">
                <TaskPicture img={item.img} />
                <span className="pp-extra-label">{item.printLabel ?? item.label}</span>
              </li>
            ))}
            {free && (
              <li className="pp-extra pp-extra--free">
                {/* An empty box instead of a stand-in picture: the child draws
                    the thing in, so the card never shows the wrong object. */}
                <span className="pp-draw" data-draw aria-hidden />
                <span className="pp-extra-label">{free}</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </li>
  );
}

/** Small scissors where the cut lines start. Decoration only. */
function Scissors() {
  return (
    <svg className="pp-scissors" viewBox="0 0 24 24" aria-hidden focusable="false">
      <g fill="none" stroke="#040812" strokeWidth="2" strokeLinecap="round">
        <circle cx="6" cy="7" r="3" />
        <circle cx="6" cy="17" r="3" />
        <path d="M8.6 8.6 20 18" />
        <path d="M8.6 15.4 20 6" />
      </g>
    </svg>
  );
}
