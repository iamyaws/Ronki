import { useEffect, useMemo, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { featureOn } from '../config/features';

// ──────────────────────────────────────────────────────────────────────
// usePWAPromptGate
//
// Decides when to surface the post-engagement PWA install prompt at the
// app-shell level. Previously the prompt fired at step 7 of the kid's
// Onboarding.jsx, a bad moment, because the kid had zero relationship
// with the app yet. Parents felt ambushed.
//
// New timing: after the kid has completed onboarding AND the first
// habit (totalTasksDone >= 1). That's the earliest point where the
// parent has actual engagement to reference, the prompt now reads
// "Toll gemacht! Ronki ist jetzt dein Begleiter" instead of asking
// for commitment on blind trust.
//
// Returns { shouldPrompt, markShown }:
//   · shouldPrompt, true when every condition below holds:
//       - state.onboardingDone === true (kid Track B done)
//       - state.totalTasksDone >= 1 (first habit done)
//       - state.pwaPromptShown === false
//       - display-mode is NOT standalone (not already installed)
//   · markShown(), call on install/skip. Flips pwaPromptShown to true.
//
// Day-2 retry: if the parent dismissed the prompt on day 1, we give them
// one more chance on day 2 (recognized by lastLoginDate !== today when
// pwaPromptShown is true). The hook resets pwaPromptShown to false once,
// so the sheet re-opens next time the gate evaluates. Only one retry:
// after that, the shown flag sticks.
// ──────────────────────────────────────────────────────────────────────

const DAY2_RETRY_STORAGE_KEY = 'ronki-pwa-day2-retry-used';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator?.standalone === true
    );
  } catch {
    return false;
  }
}

export function usePWAPromptGate() {
  const { state, actions } = useTask() || {};
  const [standalone, setStandalone] = useState(() => isStandalone());

  // Re-check standalone on mount, matchMedia queries run once but the
  // cheap double-read catches iOS Safari where navigator.standalone
  // lands slightly after first paint.
  useEffect(() => {
    setStandalone(isStandalone());
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setStandalone(isStandalone());
    // Modern + legacy listener wiring, Safari <14 only exposes
    // addListener, modern browsers expose addEventListener.
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    if (mq.addListener) {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
    return undefined;
  }, []);

  // Day-2 retry logic, runs once per state transition. If the prompt
  // was already shown AND it's a different day than lastLoginDate AND
  // we haven't used the retry yet, flip pwaPromptShown back to false so
  // the gate re-opens. Keyed off localStorage so a reset on state reload
  // doesn't grant infinite retries.
  useEffect(() => {
    if (!featureOn('kidInstallSheet')) return;
    if (!state || !actions?.patchState) return;
    if (!state.pwaPromptShown) return;
    if (standalone) return;
    let retryUsed = false;
    try {
      retryUsed = localStorage.getItem(DAY2_RETRY_STORAGE_KEY) === '1';
    } catch {}
    if (retryUsed) return;
    const today = todayIso();
    const last = state.lastLoginDate;
    if (last && last !== today) {
      try { localStorage.setItem(DAY2_RETRY_STORAGE_KEY, '1'); } catch {}
      actions.patchState({ pwaPromptShown: false });
    }
    // We do NOT auto-update lastLoginDate here, that lives in a
    // session-init layer (planned). For now, the day-2 retry fires the
    // first time the user opens the app on a new date as long as
    // lastLoginDate is stamped elsewhere. If it's not stamped, the
    // retry simply never fires (safe fallback, the original prompt
    // still ran once on day 1).
  }, [state, actions, standalone]);

  // Settle window after a task completion. Marc 25 Apr 2026 flagged
  // that on first-task completion three things fired at once: the
  // PWA prompt, the first-task achievement, and the QuestEater
  // ronki-burp+bubble. Now we hold the PWA prompt back until at
  // least 8 seconds have passed since the most recent quest tick,
  // letting the inline QuestEater beat finish + any toast clear
  // before the bottom sheet pops.
  const SETTLE_AFTER_TASK_MS = 8_000;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    // Re-evaluate on a 1s tick while we're inside the settle window.
    // Stops once we're past it so we're not holding a permanent timer.
    if (!state?.lastTaskCompletionAt) return;
    const ts = new Date(state.lastTaskCompletionAt).getTime();
    if (Date.now() - ts >= SETTLE_AFTER_TASK_MS) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state?.lastTaskCompletionAt]);

  const shouldPrompt = useMemo(() => {
    // Finch pass (26 Sep 2026): the kid never sees the install sheet.
    // Install is a tip line in the parent step (base design section 7).
    if (!featureOn('kidInstallSheet')) return false;
    if (!state) return false;
    if (standalone) return false;
    if (!state.onboardingDone) return false;
    if (state.pwaPromptShown) return false;
    // Bumped from 1 → 2 (Marc 25 Apr 2026). The first quest is the
    // moment the kid is most likely to bounce, better to fire the
    // install ask after a second tick of engagement when the
    // experience has actually shown a couple of beats. Keeps the
    // first-quest screen un-stacked.
    if ((state.totalTasksDone || 0) < 2) return false;
    // Settle window guard, no firing while a quest just closed.
    if (state.lastTaskCompletionAt) {
      const since = now - new Date(state.lastTaskCompletionAt).getTime();
      if (since < SETTLE_AFTER_TASK_MS) return false;
    }
    return true;
  }, [state, standalone, now]);

  const markShown = () => {
    if (!actions?.patchState) return;
    actions.patchState({ pwaPromptShown: true });
  };

  return { shouldPrompt, markShown };
}

export default usePWAPromptGate;
