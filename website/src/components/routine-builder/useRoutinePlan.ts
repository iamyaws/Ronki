import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../lib/analytics';
import {
  MORNING,
  OWN_STEP_CODE,
  kitAddOwnStep,
  kitDecodePlan,
  kitEncodePlan,
  setOwnText,
  type RoutineKit,
  type RoutinePlan,
} from '../../lib/routine-builder';

export interface RoutinePlanState {
  /** Morning or evening: catalogue, times and app steps of the page. */
  kit: RoutineKit;
  plan: RoutinePlan;
  /** The own step as the parent types it, spaces and all. The plan keeps the cleaned text. */
  ownDraft: string;
  /** Applies a change from the parent. The first one in a page view is counted, without step data. */
  update: (change: (prev: RoutinePlan) => RoutinePlan) => void;
  changeOwn: (text: string) => void;
  addOwn: () => void;
  /** Full link to this page with the plan. */
  shareUrl: string;
}

/**
 * The morning plan of the builder, kept in the address bar like the
 * Ranzen-Packplan: opening a link restores the plan, and back and forward
 * restore it too. Nothing is stored anywhere else.
 *
 * One difference: the address bar is only rewritten once the plan differs
 * from the one it already holds. A campaign link (utm tags from the
 * /morgen short link) keeps its tags until the parent changes something,
 * so the page view is still counted with them.
 */
export function useRoutinePlan(pagePath: string, kit: RoutineKit = MORNING): RoutinePlanState {
  const decodePlan = (search: string) => kitDecodePlan(kit, search);
  const encodePlan = (plan: RoutinePlan) => kitEncodePlan(kit, plan);
  const [plan, setPlan] = useState<RoutinePlan>(() =>
    decodePlan(typeof window === 'undefined' ? '' : window.location.search),
  );
  const [ownDraft, setOwnDraft] = useState(() => plan.own);
  const counted = useRef(false);
  const current = useRef(plan);

  useEffect(() => {
    current.current = plan;
  }, [plan]);

  const query = encodePlan(plan);
  const origin = typeof window === 'undefined' ? 'https://www.ronki.de' : window.location.origin;
  const shareUrl = `${origin}${pagePath}${query ? `?${query}` : ''}`;

  useEffect(() => {
    if (encodePlan(decodePlan(window.location.search)) === query) return;
    const next = `${pagePath}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pagePath]);

  // Back and forward change the address bar without remounting the page.
  // Only a different plan is taken over, so a jump to an anchor on the page
  // leaves the builder alone.
  useEffect(() => {
    function restore() {
      const next = decodePlan(window.location.search);
      if (encodePlan(next) === encodePlan(current.current)) return;
      setPlan(next);
      setOwnDraft(next.own);
    }
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit]);

  const update = useCallback((change: (prev: RoutinePlan) => RoutinePlan) => {
    setPlan(change);
    if (!counted.current) {
      counted.current = true;
      trackEvent('Vorlage angepasst', { vorlage: kit.id });
    }
  }, [kit]);

  const changeOwn = useCallback(
    (text: string) => {
      setOwnDraft(text);
      if (current.current.steps.includes(OWN_STEP_CODE)) update((prev) => setOwnText(prev, text));
    },
    [update],
  );

  const addOwn = useCallback(() => {
    update((prev) => kitAddOwnStep(kit, prev, ownDraft));
  }, [update, ownDraft, kit]);

  return { kit, plan, ownDraft, update, changeOwn, addOwn, shareUrl };
}
