/**
 * Blocks of the day and trip times (Finch pass, 26 Sep 2026).
 * Base design section 4.1, spec rulings R2 and R4.
 *
 * | Block   | From              | To                                           |
 * | morning | 04:00             | 11:00 weekdays, 12:00 Sat/Sun and holidays   |
 * | day     | end of morning    | the family's evening start (default 17:00)   |
 * | evening | evening start     | 04:00, unless TonightRitual is done          |
 * | night   | TonightRitual done this evening | 04:00                          |
 */
import type { Block, EveningStart } from './types';
import { DEFAULT_EVENING_START } from './types';
import { atLocal, localMinutes, minutesOfHHMM } from './clock';

const DAY_START = 4 * 60;

export interface PhaseOptions {
  eveningStart?: EveningStart | string | null;
  /** Holiday list in use: the morning runs to 12:00. */
  vacation?: boolean;
  /** ISO time TonightRitual last finished (state.eveningRitualCompletedAt). */
  tonightDoneAt?: string | null;
}

/** Minutes after local midnight when the morning ends on this date. */
export function morningEndMinutes(d: Date, vacation = false): number {
  const dow = d.getDay();
  const weekend = dow === 0 || dow === 6;
  return (weekend || vacation) ? 12 * 60 : 11 * 60;
}

/** The start of the evening that `d` belongs to (today's, or yesterday's after midnight). */
export function eveningStartFor(d: Date, eveningStart?: string | null): Date {
  const start = minutesOfHHMM(eveningStart || DEFAULT_EVENING_START);
  const m = localMinutes(d);
  if (m < DAY_START) {
    const y = new Date(d);
    y.setDate(y.getDate() - 1);
    return atLocal(y, start);
  }
  return atLocal(d, start);
}

/** Which block `now` is in. */
export function blockAt(now: Date, opts: PhaseOptions = {}): Block {
  const m = localMinutes(now);
  const evening = minutesOfHHMM(opts.eveningStart || DEFAULT_EVENING_START);
  const inEvening = m < DAY_START || m >= evening;
  if (inEvening) {
    const doneAt = opts.tonightDoneAt ? Date.parse(opts.tonightDoneAt) : NaN;
    if (!Number.isNaN(doneAt) && doneAt >= eveningStartFor(now, opts.eveningStart).getTime() && doneAt <= now.getTime()) {
      return 'night';
    }
    return 'evening';
  }
  if (m < morningEndMinutes(now, !!opts.vacation)) return 'morning';
  return 'day';
}

/** When a day trip that leaves at `now` comes home: today at the evening start (at least 30 minutes away). */
export function dayTripReturnAt(now: Date, eveningStart?: string | null): Date {
  const home = atLocal(now, minutesOfHHMM(eveningStart || DEFAULT_EVENING_START));
  const earliest = new Date(now.getTime() + 30 * 60 * 1000);
  return home.getTime() > earliest.getTime() ? home : earliest;
}

/** When a dream trip that leaves at `now` comes home: the next 05:00 at least an hour away. */
export function nightTripReturnAt(now: Date): Date {
  const five = atLocal(now, 5 * 60);
  if (five.getTime() - now.getTime() >= 60 * 60 * 1000) return five;
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  return atLocal(next, 5 * 60);
}

/** True on Saturday and Sunday (local). */
export function isWeekend(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}
