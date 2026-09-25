/**
 * Thin hook that exposes a `track(name, props)` fn gated on the
 * `state.analyticsEnabled` flag. Components should prefer this over
 * importing track() directly so the opt-out is honoured consistently.
 *
 * No-ops on first render before TaskContext has loaded (state === null).
 * Returns a stable `track` reference tied to the enabled flag, so
 * components can safely pass it into useEffect deps.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import {
  track as rawTrack,
  setAnalyticsEnabled,
  type EventName,
  type EventProps,
} from '../lib/analytics';

export function useAnalytics() {
  const { state } = useTask();
  // Default OFF: analytics is opt-in under Art. 8 DSGVO (child consent).
  // The parent opts IN via ParentOnboarding disclosure; this reflects
  // state.analyticsEnabled (default false in TaskContext initial state).
  const enabled = state?.analyticsEnabled ?? false;

  // Keep the module-level enabled flag in sync with TaskContext. A parent
  // toggle in the Dashboard (separate pass) persists via patchState;
  // this effect reflects that into the analytics module's in-memory flag
  // + localStorage mirror so later page loads honour it even before
  // TaskContext hydrates.
  useEffect(() => {
    setAnalyticsEnabled(!!enabled);
  }, [enabled]);

  const track = useCallback((name: EventName, props?: EventProps) => {
    // Finch pass: raw track gates itself (sends when on, holds events
    // before a consent choice, drops after a no), so the hook no longer
    // drops funnel events sent before the parent step.
    rawTrack(name, props);
  }, [enabled]);

  return useMemo(() => ({ track, enabled }), [track, enabled]);
}

export type { EventName, EventProps };
