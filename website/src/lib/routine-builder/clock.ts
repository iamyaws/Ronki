/**
 * How the clock times appear on the sheet, and the small lines around
 * them on the morning page.
 *
 * Many first graders cannot read the clock yet. A clock face beside a step
 * lets the child compare it with the kitchen clock: when both look the
 * same, this step is next. Parents choose:
 *   zahl    the time in words, as the sheet always had it (default)
 *   uhr     a clock face instead of the time in words
 *   beides  both
 *
 * The style is kept next to the plan, not in it, so the plan object and
 * its link stay exactly as they were. In the link it is one extra key,
 * written only while times are on and the style is not "zahl":
 *   u=uhr / u=beides
 * Old links have no key and read as "zahl". Plausible never sees the key
 * (index.html keeps only utm_, ref and source in the page address).
 */

import {
  clockLabel,
  kitDecodePlan,
  kitEncodePlan,
  kitFirstPrintedTime,
  kitLeaveNote,
  stepOf,
  type RoutineKit,
  type RoutinePlan,
} from './kit';

export type ClockStyle = 'zahl' | 'uhr' | 'beides';

export const CLOCK_STYLES: readonly ClockStyle[] = ['zahl', 'uhr', 'beides'];

/** Query key of the style. */
export const CLOCK_STYLE_KEY = 'u';

function isClockStyle(value: unknown): value is ClockStyle {
  return typeof value === 'string' && (CLOCK_STYLES as readonly string[]).includes(value);
}

/** The style the sheet shows: the chosen one on a kit with clock faces while times are on, else "zahl". */
export function kitEffectiveClockStyle(kit: RoutineKit, plan: RoutinePlan, style: ClockStyle): ClockStyle {
  return kit.clockFaces && plan.times && isClockStyle(style) ? style : 'zahl';
}

/** Reads the style from a query string (with or without "?"). Anything unknown means "zahl". */
export function kitDecodeClockStyle(kit: RoutineKit, search: string): ClockStyle {
  if (!kit.clockFaces) return 'zahl';
  const query = search.startsWith('?') ? search.slice(1) : search;
  const value = new URLSearchParams(query).get(CLOCK_STYLE_KEY);
  if (!isClockStyle(value)) return 'zahl';
  return kitEffectiveClockStyle(kit, kitDecodePlan(kit, query), value);
}

/**
 * The plan and the style as a query string without the leading "?". The
 * plan part is exactly `kitEncodePlan`; the style key follows it only when
 * it changes the sheet.
 */
export function kitEncodeQuery(kit: RoutineKit, plan: RoutinePlan, style: ClockStyle): string {
  const base = kitEncodePlan(kit, plan);
  const shown = kitEffectiveClockStyle(kit, plan, style);
  if (shown === 'zahl') return base;
  const key = `${CLOCK_STYLE_KEY}=${shown}`;
  return base ? `${base}&${key}` : key;
}

/** Done band text with "Als Uhr": the child finds the time to leave on the face beside it. */
export const LEAVE_FACE_NOTE = 'Für heute fertig. Los geht es, wenn die Uhr so aussieht.';

/**
 * The done band at the end of the sheet (Astra UHR-01, Claude F2): with
 * "Als Uhr" and "Beides" the time to leave gets a face too, the one time a
 * child who cannot read the clock needs most. "Als Uhr" says it in words
 * without the number; "Als Zahl" is the band as it always was.
 */
export function kitDoneLine(kit: RoutineKit, plan: RoutinePlan, style: ClockStyle): { note?: string; clock?: string } {
  const note = kitLeaveNote(kit, plan);
  const shown = kitEffectiveClockStyle(kit, plan, style);
  if (shown === 'zahl') return { note };
  const clock = clockLabel(plan.leave);
  return shown === 'uhr' ? { note: LEAVE_FACE_NOTE, clock } : { note, clock };
}

/** The "uhr" value in the print event: "aus" without times, else the style the sheet shows. */
export function kitPrintClockProp(kit: RoutineKit, plan: RoutinePlan, style: ClockStyle): 'aus' | ClockStyle {
  return plan.times ? kitEffectiveClockStyle(kit, plan, style) : 'aus';
}

/* ------------------------------------------------------------------ */
/* Morning page lines                                                  */
/* ------------------------------------------------------------------ */

/** Code of "Aufstehen" in the morning catalogue. */
const WAKE_CODE = 'a';

export interface WakeLine {
  /** "Auf dem Blatt: Aufstehen um 6:50 Uhr." or "Der erste Schritt beginnt um 6:50 Uhr." */
  text: string;
  /**
   * The same time as HHMM for the Schlafens-Rechner link, e.g. "0650", only
   * when the first step is Aufstehen. Any other first step starts after the
   * child is up, so its time is no wake-up time (Astra UHR-03, Claude F3).
   */
  auf: string | null;
}

/**
 * The first time the sheet prints, for the line under the time controls on
 * the morning page. Null on other kits and while times are off.
 */
export function kitWakeLine(kit: RoutineKit, plan: RoutinePlan): WakeLine | null {
  if (kit.id !== 'morgen') return null;
  const first = kitFirstPrintedTime(kit, plan);
  if (!first) return null;
  const wake = stepOf(kit, WAKE_CODE);
  const text =
    first.code === WAKE_CODE && wake
      ? `Auf dem Blatt: ${wake.label} um ${first.time} Uhr.`
      : `Der erste Schritt beginnt um ${first.time} Uhr.`;
  if (first.code !== WAKE_CODE) return { text, auf: null };
  const [h, m] = first.time.split(':');
  return { text, auf: `${h.padStart(2, '0')}${m}` };
}

/** Link to the Schlafens-Rechner, with the wake-up time filled in when there is one. */
export function sleepCalculatorLink(auf: string | null): string {
  return auf ? `/tools/schlafens-rechner?auf=${auf}` : '/tools/schlafens-rechner';
}

/**
 * The clocks go back one hour in the night to Sunday, 25 October 2026
 * (from 3 to 2 Uhr; see /ratgeber/zeitumstellung-kinder). The morning page
 * mentions it up to and including that day, in the visitor's local date.
 */
export const CLOCK_CHANGE_DAY = { year: 2026, month: 10, day: 25 } as const;

export function showClockChangeNote(today: Date): boolean {
  const key = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const last = CLOCK_CHANGE_DAY.year * 10000 + CLOCK_CHANGE_DAY.month * 100 + CLOCK_CHANGE_DAY.day;
  return Number.isFinite(key) && key <= last;
}
