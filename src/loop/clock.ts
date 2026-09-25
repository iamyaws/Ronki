/**
 * Time for the Finch-pass loop (26 Sep 2026).
 *
 * Two conventions, on purpose:
 * - Day keys ("which day is it") use the same key as TaskContext's
 *   `today()`: `toISOString().slice(0, 10)`. lastDate, onboardingDate,
 *   lastTripDate and greetedDate all compare on this key, so the loop
 *   and the day transition always agree about "today".
 * - Blocks of the day ("is it morning") use the device's local clock
 *   (getHours), because a child's morning is local.
 *
 * In DEV only, `?clock=2026-09-28T07:10` shifts the global Date for the
 * whole app (src/main.jsx), so TaskContext and the loop share one clock.
 * Never in a production build.
 */

/** The loop's "now". In DEV, main.jsx can shift the global Date with ?clock= (one clock for the whole app). */
export function now(): Date {
  return new Date();
}

/** Day key used across the app (same as TaskContext today()). */
export function dayKey(d: Date = now()): string {
  return d.toISOString().slice(0, 10);
}

/** Whole days between two day keys (b minus a). DST-safe: parses as UTC dates. */
export function daysBetween(a: string | null | undefined, b: string | null | undefined): number {
  if (!a || !b) return 0;
  const pa = Date.parse(`${a}T00:00:00Z`);
  const pb = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(pa) || Number.isNaN(pb)) return 0;
  return Math.round((pb - pa) / 86400000);
}

/** Minutes since local midnight. */
export function localMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** "17:30" -> 1050. Falls back to 17:00 on anything odd. */
export function minutesOfHHMM(hhmm: string | null | undefined): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
  if (!m) return 17 * 60;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return 17 * 60;
  return h * 60 + min;
}

/** A Date on the same local day as `d` at hh:mm. */
export function atLocal(d: Date, minutes: number): Date {
  const out = new Date(d);
  out.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return out;
}
