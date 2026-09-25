/**
 * Task kinds (Finch pass, 26 Sep 2026).
 *
 * A kind is a quest id without its school or holiday prefix, so one
 * routine choice works for both lists: `s_teeth_am` and `v_teeth_am`
 * are both `teeth_am`. The Football / Bewegung quest `ft` maps to `move`.
 *
 * Used by: the parent RoutinePicker (onboarding and dashboard), buildDay
 * (filters the day's quests by the family routine), the Nest (picture and
 * Ronki's spoken ask per task).
 */

export type TaskKind =
  | 'wake' | 'water' | 'wash' | 'breakfast' | 'teeth_am' | 'dress' | 'packcheck'
  | 'move' | 'outside'
  | 'dinner' | 'teeth_pm' | 'wash_pm' | 'pyjama' | 'cuddle';

export type RoutineBlock = 'morning' | 'evening';

/** The family's routine: which kinds the child does with Ronki in each block. */
export interface RoutineConfig {
  morning: TaskKind[];
  evening: TaskKind[];
}

/** The kinds a parent can choose from, in display order, per block. */
export const ROUTINE_CHOICES: Record<RoutineBlock, TaskKind[]> = {
  morning: ['wake', 'water', 'wash', 'breakfast', 'teeth_am', 'dress', 'packcheck'],
  evening: ['dinner', 'teeth_pm', 'wash_pm', 'pyjama', 'cuddle'],
};

/**
 * Default routine for every family that has not chosen one (new families,
 * website cards, and existing saves alike). Five in the morning, four in
 * the evening: "Weniger ist am Anfang mehr." On weekends buildDay already
 * drops the school bag, so the weekend morning has four.
 */
export const DEFAULT_ROUTINE: RoutineConfig = {
  morning: ['wake', 'breakfast', 'teeth_am', 'dress', 'packcheck'],
  evening: ['teeth_pm', 'wash_pm', 'pyjama', 'cuddle'],
};

/** Short German label under each picture (parent picker and task row). */
export const TASK_LABEL: Record<TaskKind, string> = {
  wake: 'Aufstehen',
  water: 'Wasser trinken',
  wash: 'Waschen',
  breakfast: 'Frühstück',
  teeth_am: 'Zähne putzen',
  dress: 'Anziehen',
  packcheck: 'Schultasche',
  move: 'Bewegen',
  outside: 'Draußen spielen',
  dinner: 'Abendbrot',
  teeth_pm: 'Zähne putzen',
  wash_pm: 'Waschen',
  pyjama: 'Pyjama',
  cuddle: 'Vorlesen',
};

/** Picture file stem in public/art/bilderbuch/tasks/ (all 12 files exist). */
export const TASK_PICTURE: Record<TaskKind, string> = {
  wake: 'wake',
  water: 'water',
  wash: 'wash',
  breakfast: 'plate',
  teeth_am: 'toothbrush',
  dress: 'shirt',
  packcheck: 'bag',
  move: 'move',
  outside: 'move',
  dinner: 'plate',
  teeth_pm: 'toothbrush',
  wash_pm: 'wash',
  pyjama: 'pajama',
  cuddle: 'book',
};

const KNOWN = new Set<string>(Object.keys(TASK_LABEL));

const BASE_URL: string = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) || '/';

/** Kind of a quest id: `s_teeth_am` -> `teeth_am`, `ft` -> `move`. Null for side quests and unknown ids. */
export function taskKind(questId: string | null | undefined): TaskKind | null {
  if (!questId) return null;
  if (questId === 'ft') return 'move';
  const kind = questId.replace(/^(s|v)_/, '');
  return KNOWN.has(kind) ? (kind as TaskKind) : null;
}

/** Voice and bubble line id for Ronki's ask on a task (see src/data/finchLines.de.json). */
export function taskAskLineId(questId: string | null | undefined): string | null {
  const kind = taskKind(questId);
  return kind ? `task_ask_${kind}` : null;
}

/** URL of the task picture, or null when the quest has no kind. */
export function taskPictureUrl(questId: string | null | undefined, base: string = BASE_URL): string | null {
  const kind = taskKind(questId);
  return kind ? `${base}art/bilderbuch/tasks/${TASK_PICTURE[kind]}.webp` : null;
}

/** A routine value from a save: keeps only known kinds; falls back to the default per block. */
export function normalizeRoutine(raw: unknown): RoutineConfig {
  const r = (raw && typeof raw === 'object') ? raw as Partial<Record<RoutineBlock, unknown>> : {};
  const pick = (block: RoutineBlock): TaskKind[] => {
    const list = Array.isArray(r[block]) ? (r[block] as unknown[]) : null;
    if (!list) return [...DEFAULT_ROUTINE[block]];
    const allowed = new Set<string>(ROUTINE_CHOICES[block]);
    return list.filter((k): k is TaskKind => typeof k === 'string' && allowed.has(k));
  };
  return { morning: pick('morning'), evening: pick('evening') };
}
