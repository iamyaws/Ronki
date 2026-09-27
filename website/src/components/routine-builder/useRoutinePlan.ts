import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../../lib/analytics';
import {
  MORNING,
  OWN_STEP_CODE,
  kitAddOwnStep,
  kitDecodeClockStyle,
  kitDecodePlan,
  kitEffectiveClockStyle,
  kitEncodeQuery,
  setOwnText,
  type ClockStyle,
  type RoutineKit,
  type RoutinePlan,
} from '../../lib/routine-builder';

export interface RoutinePlanState {
  /** Morning or evening: catalogue, times and app steps of the page. */
  kit: RoutineKit;
  plan: RoutinePlan;
  /**
   * How the times appear on the sheet: "zahl" unless the kit has clock
   * faces and times are on. The parent's choice is kept while times are
   * off, so switching them on again brings it back.
   */
  clockStyle: ClockStyle;
  /** The own step as the parent types it, spaces and all. The plan keeps the cleaned text. */
  ownDraft: string;
  /** Applies a change from the parent. The first one in a page view is counted, without step data. */
  update: (change: (prev: RoutinePlan) => RoutinePlan) => void;
  /** A change of the clock style, counted like any other change. */
  changeClockStyle: (style: ClockStyle) => void;
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
 *
 * The clock style sits next to the plan with its own key in the same query
 * string (see lib/routine-builder/clock.ts).
 */
export function useRoutinePlan(pagePath: string, kit: RoutineKit = MORNING): RoutinePlanState {
  const decodePlan = (search: string) => kitDecodePlan(kit, search);
  const decodeStyle = (search: string) => kitDecodeClockStyle(kit, search);
  const encode = (plan: RoutinePlan, style: ClockStyle) => kitEncodeQuery(kit, plan, style);
  const [plan, setPlan] = useState<RoutinePlan>(() =>
    decodePlan(typeof window === 'undefined' ? '' : window.location.search),
  );
  const [chosenStyle, setChosenStyle] = useState<ClockStyle>(() =>
    decodeStyle(typeof window === 'undefined' ? '' : window.location.search),
  );
  const [ownDraft, setOwnDraft] = useState(() => plan.own);
  const counted = useRef(false);
  const current = useRef(plan);
  const currentStyle = useRef(chosenStyle);

  useEffect(() => {
    current.current = plan;
    currentStyle.current = chosenStyle;
  }, [plan, chosenStyle]);

  const clockStyle = kitEffectiveClockStyle(kit, plan, chosenStyle);
  const query = encode(plan, chosenStyle);
  const origin = typeof window === 'undefined' ? 'https://www.ronki.de' : window.location.origin;
  const shareUrl = `${origin}${pagePath}${query ? `?${query}` : ''}`;

  useEffect(() => {
    const search = window.location.search;
    if (encode(decodePlan(search), decodeStyle(search)) === query) return;
    const next = `${pagePath}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pagePath]);

  // Back and forward change the address bar without remounting the page.
  // Only a different plan is taken over, so a jump to an anchor on the page
  // leaves the builder alone.
  useEffect(() => {
    function restore() {
      const search = window.location.search;
      const next = decodePlan(search);
      const nextStyle = decodeStyle(search);
      if (encode(next, nextStyle) === encode(current.current, currentStyle.current)) return;
      setPlan(next);
      setOwnDraft(next.own);
      setChosenStyle(nextStyle);
    }
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit]);

  const countOnce = useCallback(() => {
    if (counted.current) return;
    counted.current = true;
    trackEvent('Vorlage angepasst', { vorlage: kit.id });
  }, [kit]);

  const update = useCallback(
    (change: (prev: RoutinePlan) => RoutinePlan) => {
      setPlan(change);
      countOnce();
    },
    [countOnce],
  );

  const changeClockStyle = useCallback(
    (style: ClockStyle) => {
      setChosenStyle(style);
      countOnce();
    },
    [countOnce],
  );

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

  return { kit, plan, clockStyle, ownDraft, update, changeClockStyle, changeOwn, addOwn, shareUrl };
}
