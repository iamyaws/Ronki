/**
 * useTripClock (Finch pass, 26 Sep 2026). Mounted once in AppContent.
 *
 * The one clock of the loop. On mount and every 30 seconds while the tab
 * is visible it:
 *   1. runs the day transition when the day changed while the app stayed
 *      open (actions.checkNewDay), before any fire or departure check;
 *   2. brings Ronki home (actions.arriveTrip) once his trip is due, on any
 *      screen, so the return no longer needs the Expedition screen.
 *
 * A tab that comes back after a while never ticks on its old state
 * (SAVES-1). When it was hidden for more than 5 minutes, or the day key
 * moved past state.lastDate, the page reloads instead, so the load path
 * merges the cloud row (another device may have played meanwhile) before
 * any day transition or arrival runs and gets saved over it.
 *
 * Returns the current time, its day key and the block of the day, and
 * re-renders at least every 30 seconds so surfaces follow the clock.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { now as clockNow, dayKey } from '../loop/clock';
import { blockAt } from '../loop/dayPhase';
import type { TripClock } from '../loop/types';
import storage from '../utils/storage';

export const TRIP_CLOCK_TICK_MS = 30_000;

/** Hidden longer than this, the tab reloads when it comes back (SAVES-1). */
export const STALE_HIDDEN_MS = 5 * 60 * 1000;

/** The page reload, swappable in tests. Freezes every write first, so
 *  nothing this stale page still renders (a greeting, a timer, the
 *  pagehide flush) can save its old state over newer cloud data. */
export const tripClockPage = {
  reload: (): void => { window.location.reload(); },
};

function reloadStale(): void {
  // Optional call: storage is mocked in some tests without it.
  (storage as { freezeWrites?: () => void }).freezeWrites?.();
  tripClockPage.reload();
}

/** A returnAt further ahead than this is a wrong clock (LOOP-5). */
const MAX_AHEAD_MS = 24 * 3600 * 1000;

/** True when an away trip is due home at `t`: returnAt passed, unreadable, or more than a day ahead. */
function tripDue(expedition: { state?: string; returnAt?: string } | null | undefined, t: Date): boolean {
  if (!expedition || expedition.state !== 'away') return false;
  const r = expedition.returnAt ? Date.parse(expedition.returnAt) : NaN;
  return !Number.isFinite(r) || t.getTime() >= r || r - t.getTime() > MAX_AHEAD_MS;
}

function tabHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}

export default function useTripClock(): TripClock {
  const { state, actions } = useTask();
  const [nowT, setNowT] = useState<Date>(() => clockNow());

  // Latest values for the timer callbacks, without re-arming the timer.
  const stateRef = useRef(state);
  const actionsRef = useRef(actions);
  stateRef.current = state;
  actionsRef.current = actions;
  // When the tab went hidden (ms), and whether a reload is on its way.
  const hiddenAtRef = useRef<number | null>(null);
  const reloadingRef = useRef(false);

  const tick = useCallback(() => {
    if (reloadingRef.current) return;
    const t = clockNow();
    setNowT(t);
    const a = actionsRef.current as Partial<typeof actions> | undefined;
    if (!stateRef.current) return;
    a?.checkNewDay?.();
    if (tripDue(stateRef.current.expedition, t)) a?.arriveTrip?.();
  }, []);

  useEffect(() => {
    // The first check runs in the effect below, as soon as state is loaded.
    // The interval ticks only while the tab is visible (SAVES-1).
    // A visible tab can still have slept (a closed laptop lid, some Android
    // screens turn off without a visibility event): a long gap between
    // ticks, or a day that moved on, reloads instead of ticking.
    let lastTickAt = clockNow().getTime();
    const id = setInterval(() => {
      if (tabHidden() || reloadingRef.current) return;
      const t = clockNow();
      const gap = t.getTime() - lastTickAt;
      lastTickAt = t.getTime();
      const lastDate = stateRef.current?.lastDate;
      const dayMoved = typeof lastDate === 'string' && lastDate !== '' && dayKey(t) > lastDate;
      if (stateRef.current && (gap > STALE_HIDDEN_MS || dayMoved)) {
        reloadingRef.current = true;
        reloadStale();
        return;
      }
      tick();
    }, TRIP_CLOCK_TICK_MS);
    const onVisibility = () => {
      if (tabHidden()) {
        if (hiddenAtRef.current === null) hiddenAtRef.current = clockNow().getTime();
        return;
      }
      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (reloadingRef.current) return;
      const t = clockNow();
      const lastDate = stateRef.current?.lastDate;
      const dayMoved = typeof lastDate === 'string' && lastDate !== '' && dayKey(t) > lastDate;
      const longAway = hiddenAt !== null && t.getTime() - hiddenAt > STALE_HIDDEN_MS;
      if (stateRef.current && (dayMoved || longAway)) {
        // Stale state: reload so the load path merges the cloud first.
        // Nothing ticks (and so nothing is saved) until the page is new.
        reloadingRef.current = true;
        reloadStale();
        return;
      }
      tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
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
