import type { TaskState } from '../types';

/**
 * Tab unlock criteria: drives the grey-locked NavBar pattern.
 *
 * Design (Apr 2026, Hector + Louis feedback):
 *   - Hub + Quests are always unlocked (the core loop: home + tasks).
 *   - Finch pass (26 Sep 2026): Ronki is always unlocked too. Tagebuch
 *     and Laden only show with the parent Extras toggle, and without
 *     FEATURES.tabUnlocks no lock hint is ever shown.
 *   - Other tabs start locked and unlock on MEANINGFUL criteria so each
 *     unlock feels earned, not like an arbitrary task counter.
 *   - Locked tabs render dimmed with a padlock; tapping shows a hint
 *     sheet with the exact unlock requirement and current progress.
 *   - When a tab transitions locked to unlocked, a toast + (optional)
 *     voiceline fires once (tracked via `tabUnlocksSeen` on state).
 *   - First tap on a newly-unlocked tab shows a one-sentence coachmark
 *     so kids understand what the tab is FOR (tracked via
 *     `tabCoachmarksSeen`).
 *
 * See backlog_progressive_hub_disclosure.md for the broader reveal story.
 */
export interface TabUnlock {
  tabId: string;
  /** True when the tab should be fully tappable. */
  isUnlocked: (state: TaskState) => boolean;
  /** i18n key for the locked-state hint sheet. */
  hintKey: string;
  /** Optional vars passed to t() for the hint; lets us show progress
   *  like "You have 28 of 50 stars." */
  hintVars?: (state: TaskState) => Record<string, string | number>;
  /** i18n key for the unlock toast ("Tagebuch freigeschaltet"). */
  toastKey: string;
  /** i18n key for the first-tap coachmark overlay. */
  coachmarkKey: string;
}

export const TAB_UNLOCKS: TabUnlock[] = [
  {
    tabId: 'ronki',
    // Finch pass (26 Sep 2026): Ronki's page (the passport) is open from
    // day 1. Nothing to earn; the entry stays so the hint and toast keys
    // resolve if FEATURES.tabUnlocks is ever switched back on.
    isUnlocked: () => true,
    hintKey: 'nav.lock.ronki',
    toastKey: 'nav.unlock.ronki',
    coachmarkKey: 'nav.coach.ronki',
  },
  {
    tabId: 'journal',
    // Sticky: once the combined threshold has been met, the Tagebuch stays
    // open (journalEverUnlocked). Otherwise require today's mood + 3 tasks.
    // Without stickiness the day-rollover reset of moodAM/PM re-locks the
    // tab mid-session (tester 25 Apr 2026).
    isUnlocked: (s) =>
      s.journalEverUnlocked === true ||
      ((s.totalTasksDone || 0) >= 3 &&
        (s.moodAM != null || s.moodPM != null)),
    hintKey: 'nav.lock.journal',
    toastKey: 'nav.unlock.journal',
    coachmarkKey: 'nav.coach.journal',
  },
  {
    tabId: 'shop',
    isUnlocked: (s) => (s.hp || 0) >= 50,
    hintKey: 'nav.lock.shop',
    hintVars: (s) => ({ current: s.hp || 0 }),
    toastKey: 'nav.unlock.shop',
    coachmarkKey: 'nav.coach.shop',
  },
];

export function getTabUnlock(tabId: string): TabUnlock | undefined {
  return TAB_UNLOCKS.find((u) => u.tabId === tabId);
}

/** Returns true when a tab is unlocked for the given state (or has no
 *  unlock criteria at all; Hub + Quests fall through here as unlocked). */
export function isTabUnlocked(tabId: string, state: TaskState | null): boolean {
  if (!state) return true; // defensive: never hide nav during boot
  const u = getTabUnlock(tabId);
  if (!u) return true;
  return u.isUnlocked(state);
}
