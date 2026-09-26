/**
 * Morgenroutine builder: the data behind the builder on /vorlagen/morgenroutine.
 *
 * A plan is the steps of a morning in their order (one to six, one letter
 * each), at most one own step in the family's words, and optional clock
 * times counted back from the time the family leaves. There is no field for
 * a name, a class or a school, so the share link can never carry one.
 *
 * The whole plan lives in the link, the same way as the Ranzen-Packplan:
 * `encodePlan` writes a short query string, `decodePlan` reads it back and
 * quietly drops anything it does not know. The untouched plan encodes to an
 * empty string.
 *
 * Link format (keys only when they differ from the default):
 *   s=akzdfp          step codes in order; the default is zdfp
 *   e=Medizin nehmen  the own step, only when x is in s
 *   los=0740          leave time as HHMM; being there means times are on
 *   m=5.3.3.10.15.5   minutes per step in step order, only when times are on
 *                     and they differ from the defaults
 */

import { cleanFreeText, pictureForFree } from '../ranzen-packplan';
import type { SheetStep } from '../../components/sheet/types';

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

export interface MorningStep {
  /** One letter in the share link. Unique. */
  code: StepCode;
  label: string;
  /** One short line under the label on the sheet. */
  hint: string;
  /** Drawn picture, a file in /art/bilderbuch/tasks/. */
  img: string;
  /** Minutes the step takes when clock times are on. */
  minutes: number;
  /** The same step in the app, when the app has it. */
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
  { code: 'j', label: 'Jacke und Mütze', hint: 'Was sagt das Wetter heute?', img: 'hat-gloves.webp', minutes: 2 },
  { code: 'p', label: 'Tasche packen', hint: 'Brotdose, Trinken, Hausaufgaben.', img: 'bag.webp', minutes: 5, app: 'packcheck' },
];

export const OWN_STEP_CODE = 'x';
/** Name of the own step where it has no text yet. */
export const OWN_STEP_LABEL = 'Eigener Schritt';
export const OWN_STEP_MAX = 20;
export const OWN_STEP_MINUTES = 5;

export const MIN_STEPS = 1;
export const MAX_STEPS = 6;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 30;

/** The four steps the page has always shown, in that order. */
export const DEFAULT_STEPS: readonly PlanStepCode[] = ['z', 'd', 'f', 'p'];
export const DEFAULT_LEAVE = '07:30';

/** Leave times a parent can pick: 6:30 to 8:30 in 5-minute steps, as "HH:MM". */
export const LEAVE_TIMES: readonly string[] = (() => {
  const times: string[] = [];
  for (let t = 6 * 60 + 30; t <= 8 * 60 + 30; t += 5) times.push(fromMinutes(t));
  return times;
})();

/** The line that goes with a shared link. */
export const SHARE_TEXT =
  'Unsere Morgenroutine mit Bildern zum Ausdrucken. Du kannst die Schritte für euren Morgen ändern.';

export interface RoutinePlan {
  /** Step codes in sheet order, 1 to 6, no doubles. */
  steps: PlanStepCode[];
  /** The own step, cleaned. Empty unless the own step is in `steps`. */
  own: string;
  /** Clock times on the sheet. */
  times: boolean;
  /** Leave time, one of LEAVE_TIMES. */
  leave: string;
  /** Minutes per step, in step order, 1 to 30 each. */
  minutes: number[];
}

/* ------------------------------------------------------------------ */
/* Plan helpers (pure)                                                 */
/* ------------------------------------------------------------------ */

const BY_CODE = new Map<string, MorningStep>(MORNING_STEPS.map((step) => [step.code, step]));

export function isPlanStepCode(code: string): code is PlanStepCode {
  return code === OWN_STEP_CODE || BY_CODE.has(code);
}

export function catalogueStep(code: PlanStepCode): MorningStep | undefined {
  return BY_CODE.get(code);
}

export function defaultMinutes(code: PlanStepCode): number {
  return BY_CODE.get(code)?.minutes ?? OWN_STEP_MINUTES;
}

export function defaultPlan(): RoutinePlan {
  return {
    steps: [...DEFAULT_STEPS],
    own: '',
    times: false,
    leave: DEFAULT_LEAVE,
    minutes: DEFAULT_STEPS.map(defaultMinutes),
  };
}

/**
 * Own step as it goes on the sheet and into the link: cleaned the same way
 * as a free item on the Ranzen-Packplan, at most OWN_STEP_MAX characters.
 */
export function cleanOwnText(raw: string): string {
  return Array.from(cleanFreeText(raw)).slice(0, OWN_STEP_MAX).join('').trim();
}

/** Label of a step in the plan. The own step shows its text. */
export function stepLabel(plan: RoutinePlan, code: PlanStepCode): string {
  if (code === OWN_STEP_CODE) return plan.own || OWN_STEP_LABEL;
  return BY_CODE.get(code)?.label ?? '';
}

/** Picture of a step in the plan, or null when the sheet shows a box to draw in. */
export function stepPicture(plan: RoutinePlan, code: PlanStepCode): string | null {
  if (code === OWN_STEP_CODE) return plan.own ? pictureForFree(plan.own) : null;
  return BY_CODE.get(code)?.img ?? null;
}

export function canAdd(plan: RoutinePlan): boolean {
  return plan.steps.length < MAX_STEPS;
}

export function addStep(plan: RoutinePlan, code: StepCode): RoutinePlan {
  if (!BY_CODE.has(code) || plan.steps.includes(code) || !canAdd(plan)) return plan;
  return { ...plan, steps: [...plan.steps, code], minutes: [...plan.minutes, defaultMinutes(code)] };
}

/** Adds the own step at the end. Nothing happens without text, at six steps or when it is there already. */
export function addOwnStep(plan: RoutinePlan, text: string): RoutinePlan {
  const own = cleanOwnText(text);
  if (!own || plan.steps.includes(OWN_STEP_CODE) || !canAdd(plan)) return plan;
  return {
    ...plan,
    steps: [...plan.steps, OWN_STEP_CODE],
    own,
    minutes: [...plan.minutes, OWN_STEP_MINUTES],
  };
}

/** New text for the own step. Only kept while the own step is in the plan. */
export function setOwnText(plan: RoutinePlan, text: string): RoutinePlan {
  if (!plan.steps.includes(OWN_STEP_CODE)) return plan;
  return { ...plan, own: cleanOwnText(text) };
}

/** Removes a step. The last one stays: a sheet always has a step. */
export function removeStep(plan: RoutinePlan, index: number): RoutinePlan {
  if (plan.steps.length <= MIN_STEPS || index < 0 || index >= plan.steps.length) return plan;
  const code = plan.steps[index];
  return {
    ...plan,
    steps: plan.steps.filter((_, i) => i !== index),
    minutes: plan.minutes.filter((_, i) => i !== index),
    own: code === OWN_STEP_CODE ? '' : plan.own,
  };
}

/** Moves a step one place up (-1) or down (+1). Its minutes move with it. */
export function moveStep(plan: RoutinePlan, index: number, by: -1 | 1): RoutinePlan {
  const to = index + by;
  if (index < 0 || index >= plan.steps.length || to < 0 || to >= plan.steps.length) return plan;
  const steps = [...plan.steps];
  const minutes = [...plan.minutes];
  [steps[index], steps[to]] = [steps[to], steps[index]];
  [minutes[index], minutes[to]] = [minutes[to], minutes[index]];
  return { ...plan, steps, minutes };
}

export function setTimes(plan: RoutinePlan, on: boolean): RoutinePlan {
  return { ...plan, times: on };
}

export function setLeave(plan: RoutinePlan, leave: string): RoutinePlan {
  return LEAVE_TIMES.includes(leave) ? { ...plan, leave } : plan;
}

export function setMinutes(plan: RoutinePlan, index: number, minutes: number): RoutinePlan {
  if (index < 0 || index >= plan.steps.length || !Number.isFinite(minutes)) return plan;
  const clamped = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(minutes)));
  return { ...plan, minutes: plan.minutes.map((m, i) => (i === index ? clamped : m)) };
}

/* ------------------------------------------------------------------ */
/* Times                                                               */
/* ------------------------------------------------------------------ */

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number): string {
  const day = 24 * 60;
  const t = ((total % day) + day) % day;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/**
 * Start time of every step, counted back from the leave time: the last step
 * ends when the family leaves. Leave 07:40 and minutes 3, 10, 15, 5 give
 * 07:07, 07:10, 07:20, 07:35.
 */
export function startTimes(leave: string, minutes: readonly number[]): string[] {
  let t = toMinutes(leave) - minutes.reduce((sum, m) => sum + m, 0);
  return minutes.map((m) => {
    const start = fromMinutes(t);
    t += m;
    return start;
  });
}

/** "07:05" as it is written on the sheet: "7:05". */
export function clockLabel(hhmm: string): string {
  return hhmm.replace(/^0(\d)/, '$1');
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

const COUNT_WORDS = ['Ein', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs'];

/** Steps as the sheet draws them, with the clock time when times are on. */
export function sheetSteps(plan: RoutinePlan): SheetStep[] {
  const starts = plan.times ? startTimes(plan.leave, plan.minutes) : [];
  return plan.steps.map((code, i) => {
    const time = plan.times ? clockLabel(starts[i]) : undefined;
    if (code === OWN_STEP_CODE) {
      const img = stepPicture(plan, code);
      return img ? { img, label: plan.own, time } : { draw: true, label: plan.own, time };
    }
    const step = BY_CODE.get(code)!;
    return { img: step.img, label: step.label, hint: step.hint, time };
  });
}

/** The line under the sheet title. For the four default steps it is the line the page always had. */
export function sheetDescription(plan: RoutinePlan): string {
  const n = plan.steps.length;
  const count = `${COUNT_WORDS[n - 1] ?? String(n)} ${n === 1 ? 'Schritt' : 'Schritte'}`;
  const toBag = plan.steps[n - 1] === 'p' ? ' bis zur Tasche' : '';
  return `${count}${toBag}. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist.`;
}

/** Note in the done band when times are on, otherwise undefined (the band keeps its own line). */
export function leaveNote(plan: RoutinePlan): string | undefined {
  return plan.times ? `Für heute fertig. Los um ${clockLabel(plan.leave)} Uhr.` : undefined;
}

/* ------------------------------------------------------------------ */
/* Ronki app                                                           */
/* ------------------------------------------------------------------ */

const APP_KINDS = new Set<string>(APP_MORNING_KINDS);

/** App kinds of the chosen steps, in sheet order. */
export function appKindsFor(plan: RoutinePlan): AppMorningKind[] {
  const kinds: AppMorningKind[] = [];
  for (const code of plan.steps) {
    const kind = BY_CODE.get(code)?.app;
    if (kind && !kinds.includes(kind)) kinds.push(kind);
  }
  return kinds;
}

/** Keeps only kinds the app knows, once each, in the order given. */
export function cleanAppKinds(input: unknown): AppMorningKind[] {
  const list = typeof input === 'string' ? input.split(',') : Array.isArray(input) ? input : [];
  const kinds: AppMorningKind[] = [];
  for (const raw of list) {
    if (typeof raw !== 'string') continue;
    const kind = raw.trim();
    if (APP_KINDS.has(kind) && !kinds.includes(kind as AppMorningKind)) kinds.push(kind as AppMorningKind);
  }
  return kinds;
}

/** Picture of an app kind, the same drawing the sheet uses. */
export function appKindPicture(kind: AppMorningKind): string {
  return MORNING_STEPS.find((step) => step.app === kind)!.img;
}

/** Link to the card page carrying the app kinds, or null when no chosen step is in the app. Never the own step. */
export function cardLink(plan: RoutinePlan): string | null {
  const kinds = appKindsFor(plan);
  return kinds.length ? `/profil-erstellen?morgen=${kinds.join(',')}` : null;
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

function sameList<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** The plan as a query string without the leading "?". Empty for the default plan. */
export function encodePlan(plan: RoutinePlan): string {
  const params = new URLSearchParams();
  if (!sameList(plan.steps, DEFAULT_STEPS)) params.set('s', plan.steps.join(''));
  const own = cleanOwnText(plan.own);
  if (own && plan.steps.includes(OWN_STEP_CODE)) params.set('e', own);
  if (plan.times) {
    params.set('los', plan.leave.replace(':', ''));
    if (!sameList(plan.minutes, plan.steps.map(defaultMinutes))) params.set('m', plan.minutes.join('.'));
  }
  return params.toString();
}

function decodeSteps(value: string | null): PlanStepCode[] {
  if (value === null) return [...DEFAULT_STEPS];
  const steps: PlanStepCode[] = [];
  for (const ch of Array.from(value)) {
    if (isPlanStepCode(ch) && !steps.includes(ch)) steps.push(ch);
  }
  return steps.length ? steps.slice(0, MAX_STEPS) : [...DEFAULT_STEPS];
}

function decodeLeave(value: string | null): string | null {
  if (value === null || !/^\d{4}$/.test(value)) return null;
  const hhmm = `${value.slice(0, 2)}:${value.slice(2)}`;
  return LEAVE_TIMES.includes(hhmm) ? hhmm : null;
}

function decodeMinutes(value: string | null, count: number): number[] | null {
  if (value === null) return null;
  const parts = value.split('.');
  if (parts.length !== count) return null;
  const minutes = parts.map((part) => (/^\d{1,2}$/.test(part) ? Number(part) : NaN));
  return minutes.every((m) => m >= MIN_MINUTES && m <= MAX_MINUTES) ? minutes : null;
}

/** Reads a plan back from a query string (with or without "?"). Unknown or bad values are ignored. */
export function decodePlan(search: string): RoutinePlan {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const steps = decodeSteps(params.get('s'));
  const own = steps.includes(OWN_STEP_CODE) ? cleanOwnText(params.get('e') ?? '') : '';
  const leave = decodeLeave(params.get('los'));
  const times = leave !== null;
  const minutes = (times && decodeMinutes(params.get('m'), steps.length)) || steps.map(defaultMinutes);
  return { steps, own, times, leave: leave ?? DEFAULT_LEAVE, minutes };
}
