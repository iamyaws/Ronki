/**
 * useTripClock (Finch pass, 26 Sep 2026). Mounted once in AppContent.
 *
 * The one clock of the loop. On mount, whenever the tab becomes visible
 * again, and every 30 seconds it:
 *   1. runs the day transition when the day changed while the app stayed
 *      open (actions.checkNewDay), before any fire or departure check;
 *   2. brings Ronki home (actions.arriveTrip) once his trip is due, on any
 *      screen, so the return no longer needs the Expedition screen.
 *
 * Returns the current time, its day key and the block of the day, and
 * re-renders at least every 30 seconds so surfaces follow the clock.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { now as clockNow, dayKey } from '../loop/clock';
import { blockAt } from '../loop/dayPhase';
import type { TripClock } from '../loop/types';

export const TRIP_CLOCK_TICK_MS = 30_000;

/** True when an away trip is due home at `t` (a trip without a readable return time is due). */
function tripDue(expedition: { state?: string; returnAt?: string } | null | undefined, t: Date): boolean {
  if (!expedition || expedition.state !== 'away') return false;
  const r = expedition.returnAt ? Date.parse(expedition.returnAt) : NaN;
  return !Number.isFinite(r) || t.getTime() >= r;
}

export default function useTripClock(): TripClock {
  const { state, actions } = useTask();
  const [nowT, setNowT] = useState<Date>(() => clockNow());

  // Latest values for the timer callbacks, without re-arming the timer.
  const stateRef = useRef(state);
  const actionsRef = useRef(actions);
  stateRef.current = state;
  actionsRef.current = actions;

  const tick = useCallback(() => {
    const t = clockNow();
    setNowT(t);
    const a = actionsRef.current as Partial<typeof actions> | undefined;
    if (!stateRef.current) return;
    a?.checkNewDay?.();
    if (tripDue(stateRef.current.expedition, t)) a?.arriveTrip?.();
  }, []);

  useEffect(() => {
    // The first check runs in the effect below, as soon as state is loaded.
    const id = setInterval(tick, TRIP_CLOCK_TICK_MS);
    const onVisible = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [tick]);

  // On mount, and since the saved state arrives after mount (async load),
  // once it is there; again whenever the trip changes.
  const loaded = !!state;
  const tripState = state?.expedition?.state;
  const tripReturnAt = state?.expedition?.returnAt;
  useEffect(() => {
    if (loaded) tick();
  }, [loaded, tripState, tripReturnAt, tick]);

  return {
    now: nowT,
    today: dayKey(nowT),
    block: blockAt(nowT, {
      eveningStart: state?.familyConfig?.eveningStart,
      vacation: !!state?.vacMode,
      tonightDoneAt: state?.eveningRitualCompletedAt,
    }),
  };
}
