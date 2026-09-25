/**
 * The Finch-pass loop contract (26 Sep 2026).
 *
 * Every build lane codes against these shapes; only Lane B implements
 * them (src/loop/*.ts, src/context/TaskContext.tsx, src/hooks/useTripClock.ts).
 * Spec: docs/specs/2026-09-26-finch-pass-spec.md, base design section 4.
 */
import type { Quest } from '../types';
import type { RoutineConfig } from '../data/taskKinds';

/** Part of the day. See blockAt() in src/loop/dayPhase.ts. */
export type Block = 'morning' | 'day' | 'evening' | 'night';

/** A day trip leaves after a full morning fire; a night (dream) trip after a full evening fire. */
export type TripKind = 'day' | 'night';

/** Evening start the parent picks. Ronki's day trip returns at this time. */
export type EveningStart = '17:00' | '17:30' | '18:00' | '18:30';

export const EVENING_STARTS: EveningStart[] = ['17:00', '17:30', '18:00', '18:30'];
export const DEFAULT_EVENING_START: EveningStart = '17:00';

/** What the fire looks like right now. Derived, never stored. */
export interface FireState {
  /** The block this fire belongs to; null in the day and night blocks (no fire). */
  block: 'morning' | 'evening' | null;
  /** The quests that light a flame, in order (main quests only, filtered by the routine). */
  slots: Quest[];
  /** Flames lit (done tasks plus the day-1 bonus). */
  lit: number;
  /** Total flames (slots.length). */
  total: number;
  /** Flames lit by the day-1 bonus ("Vom Pusten ist es schon halb warm"). */
  bonus: number;
  /** lit >= total and total > 0. */
  full: boolean;
  /** The next undone slot, or null. */
  next: Quest | null;
}

/** Inputs of the pure loop helpers. */
export interface LoopConfig {
  eveningStart: EveningStart;
  routine: RoutineConfig;
  /** Holiday list in use (state.vacMode). Morning runs to 12:00. */
  vacation: boolean;
}

/**
 * New TaskContext actions (Lane B implements, Lanes A, C, D call).
 * All are idempotent guards: calling one in the wrong state is a no-op.
 */
export interface LoopActions {
  /** home -> away. Needs lastTripDate !== today. Picks the trip at tripCursor. */
  departTrip: (kind: TripKind) => void;
  /** away -> waiting when now >= returnAt (called by useTripClock). */
  arriveTrip: () => void;
  /** waiting -> home. Adds the treasure, adventureCount + 1, tripCursor + 1, grows catEvo by at most one stage. */
  receiveTreasure: () => void;
  /** Parent routine (setup and dashboard). Writes familyConfig.routine and rebuilds today's quests. */
  setRoutine: (routine: RoutineConfig) => void;
  /** Parent evening start. Writes familyConfig.eveningStart. */
  setEveningStart: (value: EveningStart) => void;
  /** The GrowthBeat for this stage was shown. */
  markStageSeen: (stage: number) => void;
  /** The return line was played today. */
  markGreeted: () => void;
  /** TonightRitual finished (writes eveningRitualCompletedAt = now). */
  completeTonight: () => void;
  /** Parent "Extras zeigen" toggle. */
  setExtras: (on: boolean) => void;
}

/** What useTripClock() returns (mounted once in AppContent). */
export interface TripClock {
  /** Current time (in DEV, ?clock=YYYY-MM-DDTHH:MM overrides it). */
  now: Date;
  /** Local date YYYY-MM-DD of now. */
  today: string;
  block: Block;
}
