/**
 * Morgenroutine builder: the morning kit and the names the morning page uses.
 *
 * The plan logic lives in `kit.ts` and is shared with the evening page
 * (`evening.ts`). This file holds the morning catalogue and binds the kit
 * functions to it, so the morning page and its tests keep their names.
 *
 * Link format (keys only when they differ from the default):
 *   s=akzdfp          step codes in order; the default is zdfp
 *   e=Medizin nehmen  the own step, only when x is in s
 *   los=0740          leave time as HHMM; being there means times are on
 *   m=5.3.3.10.15.5   minutes per step in step order, only when times are on
 *                     and they differ from the defaults
 */

import {
  clockRange,
  kitAddOwnStep,
  kitAddStep,
  kitAppKindPicture,
  kitAppKindsFor,
  kitCardLink,
  kitCleanAppKinds,
  kitDecodePlan,
  kitDefaultPlan,
  kitEncodePlan,
  kitLeaveNote,
  kitSetLeave,
  kitSheetDescription,
  kitSheetSteps,
  kitStepLabel,
  kitStepPicture,
  isStepCode,
  minutesOf,
  stepOf,
  type RoutineKit,
  type RoutinePlan,
  type RoutineStep,
} from './kit';

export {
  MAX_MINUTES,
  MAX_STEPS,
  MIN_MINUTES,
  MIN_STEPS,
  OWN_STEP_CODE,
  OWN_STEP_LABEL,
  OWN_STEP_MAX,
  OWN_STEP_MINUTES,
  canAdd,
  cleanOwnText,
  clockLabel,
  moveStep,
  printedTimes,
  removeStep,
  setMinutes,
  setOwnText,
  setTimes,
  startTimes,
} from './kit';
export type { RoutinePlan } from './kit';

/** Steps the app knows. Must match ROUTINE_CHOICES.morning in src/data/taskKinds.ts (drift test). */
export const APP_MORNING_KINDS = [
  'wake',
  'water',
  'wash',
  'breakfast',
  'teeth_am',
  'dress',
  'packcheck',
] as const;

export type AppMorningKind = (typeof APP_MORNING_KINDS)[number];

/** German labels the app shows under each picture (TASK_LABEL in the app). */
export const APP_KIND_LABELS: Record<AppMorningKind, string> = {
  wake: 'Aufstehen',
  water: 'Wasser trinken',
  wash: 'Waschen',
  breakfast: 'Frühstück',
  teeth_am: 'Zähne putzen',
  dress: 'Anziehen',
  packcheck: 'Schultasche',
};

export type StepCode =
  | 'a' | 'k' | 'w' | 'z' | 'd' | 'h' | 'b' | 'e' | 'f' | 't' | 'n' | 's' | 'j' | 'p';

/** A catalogue step or the own step. */
export type PlanStepCode = StepCode | 'x';

export interface MorningStep extends RoutineStep {
  code: StepCode;
  app?: AppMorningKind;
}

export const MORNING_STEPS: ReadonlyArray<MorningStep> = [
  { code: 'a', label: 'Aufstehen', hint: 'Licht an, Vorhang auf.', img: 'wake.webp', minutes: 5, app: 'wake' },
  { code: 'k', label: 'Klo', hint: 'Danach Hände waschen.', img: 'toilet.webp', minutes: 3 },
  { code: 'w', label: 'Waschen', hint: 'Gesicht und Hände.', img: 'wash.webp', minutes: 3, app: 'wash' },
  { code: 'z', label: 'Zähne putzen', hint: 'Oben, unten, außen, innen.', img: 'toothbrush.webp', minutes: 3, app: 'teeth_am' },
  { code: 'd', label: 'Anziehen', hint: 'Wetter angucken, dann Sachen raussuchen.', img: 'shirt.webp', minutes: 10, app: 'dress' },
  { code: 'h', label: 'Haare kämmen', hint: 'Bürste oder Kamm, dann in den Spiegel.', img: 'hairbrush.webp', minutes: 2 },
  { code: 'b', label: 'Brille aufsetzen', hint: 'Gläser sauber? Dann auf die Nase.', img: 'glasses.webp', minutes: 1 },
  { code: 'e', label: 'Bett machen', hint: 'Decke glatt, Kissen hin.', img: 'bed.webp', minutes: 2 },
  { code: 'f', label: 'Frühstücken', hint: 'Am Tisch, in Ruhe.', img: 'plate.webp', minutes: 15, app: 'breakfast' },
  { code: 't', label: 'Wasser trinken', hint: 'Ein Glas Wasser.', img: 'water.webp', minutes: 1, app: 'water' },
  { code: 'n', label: 'Tier füttern', hint: 'Futter in den Napf, frisches Wasser.', img: 'pet-bowl.webp', minutes: 3 },
  { code: 's', label: 'Schuhe anziehen', hint: 'Klett zu, fertig.', img: 'sneakers.webp', minutes: 3 },
  { code: 'j', label: 'Jacke anziehen', hint: 'Was sagt das Wetter heute? Mütze dazu?', img: 'rain-jacket.webp', minutes: 2 },
  { code: 'p', label: 'Tasche packen', hint: 'Brotdose, Trinken, Hausaufgaben.', img: 'bag.webp', minutes: 5, app: 'packcheck' },
];

/** The four steps the page has always shown, in that order. */
export const DEFAULT_STEPS: readonly PlanStepCode[] = ['z', 'd', 'f', 'p'];
export const DEFAULT_LEAVE = '07:30';

/** Leave times a parent can pick: 6:30 to 8:30 in 5-minute steps, as "HH:MM". */
export const LEAVE_TIMES: readonly string[] = clockRange('06:30', '08:30');

/** The line that goes with a shared link. */
export const SHARE_TEXT =
  'Unsere Morgenroutine mit Bildern zum Ausdrucken. Du kannst die Schritte für euren Morgen ändern.';

export const MORNING: RoutineKit = {
  id: 'morgen',
  steps: MORNING_STEPS,
  defaultSteps: DEFAULT_STEPS,
  ownBefore: 'p',
  lastWords: { code: 'p', words: 'bis zur Tasche' },
  timeKey: 'los',
  defaultTime: DEFAULT_LEAVE,
  times: LEAVE_TIMES,
  timeNote: (clock) => `Für heute fertig. Los um ${clock} Uhr.`,
  appKinds: APP_MORNING_KINDS,
  appLabels: APP_KIND_LABELS,
  cardParam: 'morgen',
  // The app drops the school bag on weekends and in the holidays.
  notAloneInApp: ['packcheck'],
  shareTitle: 'Morgenroutine',
  shareText: SHARE_TEXT,
};

/* ------------------------------------------------------------------ */
/* The kit functions, bound to the morning                             */
/* ------------------------------------------------------------------ */

export function isPlanStepCode(code: string): code is PlanStepCode {
  return isStepCode(MORNING, code);
}

export function catalogueStep(code: string): MorningStep | undefined {
  return stepOf(MORNING, code) as MorningStep | undefined;
}

export function defaultMinutes(code: string): number {
  return minutesOf(MORNING, code);
}

export const defaultPlan = (): RoutinePlan => kitDefaultPlan(MORNING);
export const stepLabel = (plan: RoutinePlan, code: string) => kitStepLabel(MORNING, plan, code);
export const stepPicture = (plan: RoutinePlan, code: string) => kitStepPicture(MORNING, plan, code);
export const addStep = (plan: RoutinePlan, code: string) => kitAddStep(MORNING, plan, code);
export const addOwnStep = (plan: RoutinePlan, text: string) => kitAddOwnStep(MORNING, plan, text);
export const setLeave = (plan: RoutinePlan, leave: string) => kitSetLeave(MORNING, plan, leave);
export const sheetSteps = (plan: RoutinePlan) => kitSheetSteps(MORNING, plan);
export const sheetDescription = (plan: RoutinePlan) => kitSheetDescription(MORNING, plan);
export const leaveNote = (plan: RoutinePlan) => kitLeaveNote(MORNING, plan);
export const appKindsFor = (plan: RoutinePlan) => kitAppKindsFor(MORNING, plan) as AppMorningKind[];
export const cleanAppKinds = (input: unknown) => kitCleanAppKinds(MORNING, input) as AppMorningKind[];
export const appKindPicture = (kind: AppMorningKind) => kitAppKindPicture(MORNING, kind);
export const cardLink = (plan: RoutinePlan) => kitCardLink(MORNING, plan);
export const encodePlan = (plan: RoutinePlan) => kitEncodePlan(MORNING, plan);
export const decodePlan = (search: string) => kitDecodePlan(MORNING, search);
