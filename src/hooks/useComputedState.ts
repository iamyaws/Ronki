import { useMemo } from 'react';
import { getLevel, getLvlProg, getMood, getDayName } from '../utils/helpers';
import type { GameState, ComputedState, Quest } from '../types';

/**
 * Derives computed values from game state.
 * Memoized to avoid recalculation on unrelated renders.
 */
export default function useComputedState(state: GameState | null): ComputedState | null {
  return useMemo(() => {
    if (!state) return null;

    const level = getLevel(state.xp);
    const xpP = getLvlProg(state.xp);
    const mainQuests = state.quests.filter(q => !q.sideQuest);
    const done = mainQuests.filter(q => q.done).length;
    const total = mainQuests.length;
    const allDone = mainQuests.every(q => q.done) && total > 0;
    const pct = total > 0 ? done / total : 0;
    const mood = getMood(allDone, pct);
    const dayN = getDayName();

    // For repeatable quests, count as done when completions >= target
    const done2 = state.quests.filter(q => {
      if (q.target && q.target > 1) return (q.completions || 0) >= q.target;
      return q.done;
    }).length;

    const byA: Record<string, Quest[]> = {};
    const byGroup: Record<string, Quest[]> = {};
    state.quests.forEach(q => {
      const anchor = (q.anchor === 'afternoon' as string) ? 'morning' : q.anchor;
      if (!byA[anchor]) byA[anchor] = [];
      byA[anchor].push(q);
      // Group by quest group (for epic quest sections)
      const group = q.group || anchor;
      if (!byGroup[group]) byGroup[group] = [];
      byGroup[group].push(q);
    });
    // Sort each group by order
    Object.values(byA).forEach(arr => arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    Object.values(byGroup).forEach(arr => arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

    return { level, xpP, done, total, allDone, pct, mood, dayN, byA, byGroup };
  }, [state]);
}
