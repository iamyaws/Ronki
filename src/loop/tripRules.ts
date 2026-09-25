/**
 * The one-trip rules of the Finch pass (26 Sep 2026), pure so every
 * surface can ask them without the TaskContext module (and so tests that
 * mock TaskContext still get the real rule). TaskContext's departTrip
 * uses exactly this and re-exports it.
 */
import type { TripKind } from './types';
import { dayKey } from './clock';
import { eveningStartFor } from './dayPhase';

/** Never two departures within this gap, measured between the actual
 *  departures (Astra FC-08, round 2): 6 hours lets a dream trip at 23:30
 *  and the next morning's trip at 07:10 both happen, and stops a trip at
 *  04:00 from being followed by another an hour later. */
export const TRIP_MIN_GAP_MS = 6 * 3600 * 1000;

/** True when a trip of this kind may leave at `t` by the one-trip rules
 *  (Astra FC-08): Ronki is home, the day key the trip would be stamped
 *  with (a dream trip: the day of its evening) is not used yet, and the
 *  last departure is at least 6 hours away. departTrip uses exactly this;
 *  surfaces can ask it before they show a send-off. */
export function tripAllowed(
  s: { expedition?: { state?: string } | null; lastTripDate?: string | null; lastTripAt?: string | null; familyConfig?: { eveningStart?: string } | null } | null | undefined,
  kind: TripKind,
  t: Date,
): boolean {
  if (!s || (kind !== 'day' && kind !== 'night')) return false;
  if ((s.expedition?.state || 'home') !== 'home') return false;
  const key = kind === 'night' ? dayKey(eveningStartFor(t, s.familyConfig?.eveningStart)) : dayKey(t);
  if (s.lastTripDate === key) return false;
  const lastAt = s.lastTripAt ? Date.parse(s.lastTripAt) : NaN;
  return !(Number.isFinite(lastAt) && Math.abs(t.getTime() - lastAt) < TRIP_MIN_GAP_MS);
}
