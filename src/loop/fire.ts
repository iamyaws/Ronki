/**
 * Ronki's fire (Finch pass, 26 Sep 2026). Spec rulings R1 and R4.
 *
 * - One fire per routine block: the morning fire (quests with anchor
 *   'morning') and the evening fire (anchor 'bedtime'). The day and night
 *   blocks have no fire.
 * - Flames come only from tasks the child really did. No skip lights a
 *   flame; nothing lights itself (no login bonus).
 * - Side quests never count (census bug: they kept the morning from ever
 *   being "done" on about 71 % of days).
 * - The family routine (familyConfig.routine, default in taskKinds.ts)
 *   decides which tasks belong to the fire.
 * - Day 1 (onboardingDate is today and no adventure yet): half the flames
 *   start lit, "Vom Pusten ist es schon halb warm".
 */
import type { Quest } from '../types';
import type { FireState } from './types';
import { normalizeRoutine, taskKind } from '../data/taskKinds';
import { blockAt } from './dayPhase';
import { dayKey } from './clock';

export interface FireInput {
  quests?: Quest[] | null;
  familyConfig?: { routine?: unknown; eveningStart?: string } | null;
  onboardingDate?: string | null;
  adventureCount?: number | null;
  vacMode?: boolean | null;
  eveningRitualCompletedAt?: string | null;
}

const EMPTY: FireState = { block: null, slots: [], lit: 0, total: 0, bonus: 0, full: false, next: null };

/** The fire slots of one block: main quests of that anchor that are in the routine, in order. */
export function fireSlots(input: FireInput, block: 'morning' | 'evening'): Quest[] {
  const anchor = block === 'morning' ? 'morning' : 'bedtime';
  const routine = normalizeRoutine(input.familyConfig?.routine);
  const kinds = new Set<string>(routine[block]);
  return (input.quests || [])
    .filter(q => !q.sideQuest && q.anchor === anchor)
    .filter(q => {
      const k = taskKind(q.id);
      return k !== null && kinds.has(k);
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/** True on the child's first day, before the first adventure. */
export function isFirstDay(input: FireInput, now: Date): boolean {
  return !!input.onboardingDate && input.onboardingDate === dayKey(now) && !(input.adventureCount && input.adventureCount > 0);
}

/** The fire of one block, whatever the clock says (for tests and previews). */
export function fireOfBlock(input: FireInput, block: 'morning' | 'evening', now: Date): FireState {
  const slots = fireSlots(input, block);
  const total = slots.length;
  if (total === 0) return { ...EMPTY, block };
  const done = slots.filter(q => q.done).length;
  const bonus = isFirstDay(input, now) ? Math.floor(total / 2) : 0;
  const lit = Math.min(total, done + bonus);
  const next = slots.find(q => !q.done) || null;
  return { block, slots, lit, total, bonus, full: lit >= total, next };
}

/** The fire right now. Empty (block null) in the day and night blocks. */
export function fireFor(input: FireInput, now: Date): FireState {
  const block = blockAt(now, {
    eveningStart: input.familyConfig?.eveningStart,
    vacation: !!input.vacMode,
    tonightDoneAt: input.eveningRitualCompletedAt,
  });
  if (block === 'morning') return fireOfBlock(input, 'morning', now);
  if (block === 'evening') return fireOfBlock(input, 'evening', now);
  return EMPTY;
}
