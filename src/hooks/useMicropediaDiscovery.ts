import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { featureOn } from '../config/features';

/**
 * useMicropediaDiscovery — unlocks creatures when conditions match.
 * Runs on every render, idempotent. Once unlocked, stays unlocked.
 *
 * Each trigger:
 *   - id: matches the creature ID in Micropedia SEED_CREATURES
 *   - chapter: which Micropedia chapter the creature belongs to
 *   - condition: pure function of state, true = unlock
 */

export interface DiscoveryTrigger {
  id: string;
  condition: (state: any) => boolean;
  chapter: 'forest' | 'sky' | 'water' | 'dream' | 'hearth';
}

export const CREATURE_TRIGGERS: DiscoveryTrigger[] = [
  // Forest — earned by doing daily tasks
  { id: 'forest_0', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 1 },
  { id: 'forest_1', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 3 },
  { id: 'forest_2', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 10 },
  { id: 'forest_3', chapter: 'forest', condition: s => (s.arcEngine?.completedArcIds || []).includes('first-adventure') },
  // Baumbart — rewards consistent habit formation (15+ tasks done).
  // Lowered from 30 so Muster-Memory (hosted by Baumbart) isn't dormant for weeks.
  { id: 'forest_4', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 15 },
  // Mr. Shroom — unlocks after completing the Pilzhüter reunion arc (Freund-arc engagement)
  { id: 'forest_5', chapter: 'forest', condition: s => (s.freundArcsCompleted || []).includes('freund-pilzhueter') },
  // Pilz-Jeti — rewards closing the day well (3+ evening ritual completions, tracked via journalGratitude)
  { id: 'forest_6', chapter: 'forest', condition: s => (s.journalGratitude || []).length >= 3 },
  // Sky — game exploration
  { id: 'sky_0', chapter: 'sky', condition: s => (s.viewsVisited || []).includes('games') },
  // Larson — rewards minigame exploration (any mini-game played ever)
  { id: 'sky_1', chapter: 'sky', condition: s => (s.gamesPlayedEver || []).length >= 1 },
  // Water — care + journal
  { id: 'water_0', chapter: 'water', condition: s => (s.dailyWaterCount || 0) >= 6 },
  { id: 'water_1', chapter: 'water', condition: s => (s.journalHistory || []).length >= 1 },
  { id: 'water_2', chapter: 'water', condition: s => (s.catFed && s.catPetted && s.catPlayed) },
  { id: 'water_3', chapter: 'water', condition: s => (s.bossTrophies || []).length >= 1 },
  // Dream — reflection
  { id: 'dream_0', chapter: 'dream', condition: s => s.moodAM !== null && s.moodAM !== undefined },
  { id: 'dream_1', chapter: 'dream', condition: s => (s.journalHistory || []).length >= 3 },
  { id: 'dream_2', chapter: 'dream', condition: s => (s.arcEngine?.completedArcIds || []).length >= 2 },
  // Brie — rewards deep journaling (5+ entries, the "you dream often" signal)
  { id: 'dream_3', chapter: 'dream', condition: s => (s.journalHistory || []).length >= 5 },
  // Hearth — relationship-driven
  { id: 'hearth_0', chapter: 'hearth', condition: s => (s.catEvo || 0) >= 2 },
  // Firecracker — rewards 5+ evening rituals (deep bedtime habit, the "you end days well" signal)
  { id: 'hearth_1', chapter: 'hearth', condition: s => (s.journalGratitude || []).length >= 5 },
  // Doktor Funkel — special: unlocks when all 5 MINT badges earned (Forscher-Funkel achievement)
  { id: 'hearth_2', chapter: 'hearth', condition: s => !!s.forscherFunkelUnlocked },
];

type DiscoveredEntry = { id: string; chapter: string; discoveredAt: string };

export function useMicropediaDiscovery(onDiscover?: (id: string) => void) {
  const { state, actions } = useTask();

  useEffect(() => {
    // Finch pass (26 Sep 2026): friends are behind their switch. With it
    // off there are no discoveries and no FriendIntroCeremony takeovers.
    if (!featureOn('friends')) return;
    if (!state) return;
    const discovered: DiscoveredEntry[] = state.micropediaDiscovered || [];
    const discoveredIds = new Set(discovered.map(d => d.id));
    const newOnes = CREATURE_TRIGGERS.filter(t => !discoveredIds.has(t.id) && t.condition(state));

    if (newOnes.length === 0) return;

    const now = new Date().toISOString();
    const next = [
      ...discovered,
      ...newOnes.map(t => ({ id: t.id, chapter: t.chapter, discoveredAt: now })),
    ];
    actions.patchState({ micropediaDiscovered: next });

    // Notify UI of the first new discovery (toast one at a time)
    if (onDiscover && newOnes.length > 0) {
      onDiscover(newOnes[0].id);
    }
  }, [state, actions, onDiscover]);
}
