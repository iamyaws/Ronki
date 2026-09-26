/**
 * Wesen (26 Sep 2026): the one-creature test for Louis.
 *
 * One habit = one creature. The creature is a friendly visitor from the
 * first day, comes closer on each day the child does the real task, sits
 * beside Ronki after 5 such days, grows when a parent sees the child do
 * the task alone, and moves out once a parent agrees Ronki no longer has
 * to remind. Plan: docs/plans/2026-09-26-wesen-louis-test.md (Astra round 1
 * in docs/reviews/2026-09-26-wesen-plan/).
 */
import type { TaskKind } from './taskKinds';

export type CreatureId = 'glutfunke' | 'moosmops' | 'tropfi';
export type CreatureLook = 'small' | 'friend' | 'grown';

export interface CreatureMeta {
  id: CreatureId;
  name: string;
  /** Short line under the choice picture ("Ein kleiner Glutfunke vom Kamin"). */
  hint: string;
}

export const CREATURES: readonly CreatureMeta[] = [
  { id: 'glutfunke', name: 'Glutfunke', hint: 'wohnt am warmen Ofen' },
  { id: 'moosmops', name: 'Moosmops', hint: 'wohnt im Moos im Wald' },
  { id: 'tropfi', name: 'Tropfi', hint: 'wohnt am Teich im Regen' },
];

export const CREATURE_IDS: readonly CreatureId[] = CREATURES.map(c => c.id);

export function creatureMeta(id: string | null | undefined): CreatureMeta | null {
  return CREATURES.find(c => c.id === id) || null;
}

const BASE_URL: string = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) || '/';

/** Picture of a creature in one of its three looks. */
export function creatureArt(id: CreatureId, look: CreatureLook, base: string = BASE_URL): string {
  return `${base}art/bilderbuch/wesen/${id}-${look}.webp`;
}

/**
 * The tasks a parent can link to a creature: daily self-care the child can
 * learn to do alone, each with the observable step that "allein" means
 * (Astra W-03). Vorlesen, Aufstehen, Abendbrot and Schultasche are left out
 * on purpose (shared, not a skill, or not daily).
 */
export const WESEN_TASKS: Partial<Record<TaskKind, string>> = {
  teeth_am: 'putzt morgens ohne Erinnerung und ohne Hilfe, zwei Minuten lang',
  teeth_pm: 'putzt abends ohne Erinnerung und ohne Hilfe, zwei Minuten lang',
  dress: 'zieht sich ohne Hilfe an, wenn die Sachen bereitliegen',
  wash: 'wäscht morgens Gesicht und Hände allein',
  wash_pm: 'wäscht abends Gesicht und Hände allein',
  pyjama: 'zieht den Schlafanzug allein an',
  water: 'trinkt morgens ein Glas Wasser, ohne dass jemand daran erinnert',
};

export function isWesenTask(kind: string | null | undefined): kind is TaskKind {
  return !!kind && Object.prototype.hasOwnProperty.call(WESEN_TASKS, kind);
}

/** Days with the task until the creature sits beside Ronki. */
export const BESIDE_AFTER_DAYS = 5;
/** Days beside Ronki before the parent area asks about "allein". */
export const ASK_ALONE_AFTER_DAYS = 7;
/** "Noch nicht" on the alone question: ask again after this many days. */
export const ALONE_SNOOZE_DAYS = 7;
/** "Noch nicht" on the move-out review: ask again after this many days. */
export const REVIEW_SNOOZE_DAYS = 14;
export const REVIEW_WEEK_CHOICES = [4, 8, 12] as const;
export type ReviewWeeks = typeof REVIEW_WEEK_CHOICES[number];
export const DEFAULT_REVIEW_WEEKS: ReviewWeeks = 8;
