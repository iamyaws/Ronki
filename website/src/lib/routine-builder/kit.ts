/**
 * Routine builder core, shared by the morning and the evening page.
 *
 * A kit is one template: its catalogue of steps (one letter each), the
 * default steps the page always showed, the clock time the times count back
 * from (leaving in the morning, lights out in the evening) and the steps the
 * Ronki app knows for that part of the day. Everything else is the same
 * plan logic: one to six steps in the family's order, at most one own step
 * in their words, optional clock times, and the plan only in the link.
 *
 * `plan.ts` binds these functions to the morning kit under the names the
 * morning page has always used; the evening page passes EVENING.
 */

import { cleanFreeText, pictureForFree } from '../ranzen-packplan';
import type { SheetStep } from '../../components/sheet/types';
import type { ClockStyle } from './clock';

export interface RoutineStep {
  /** One letter in the share link, unique within the kit. */
  code: string;
  label: string;
  /** One short line under the label on the sheet. */
  hint: string;
  /** Drawn picture, a file in /art/bilderbuch/tasks/. */
  img: string;
  /** Minutes the step takes when clock times are on. */
  minutes: number;
  /** The same step in the app, when the app has it. */
  app?: string;
  /** Another hint while a given step is on the sheet too (no story twice). */
  altHint?: { when: string; hint: string };
}

export interface RoutineKit {
  /** Page and analytics name: 'morgen' or 'abend'. */
  id: 'morgen' | 'abend';
  /** Catalogue in the order of a usual day part; new steps are placed by it. */
  steps: ReadonlyArray<RoutineStep>;
  /** The steps the page always showed, in that order. */
  defaultSteps: readonly string[];
  /** The own step goes in before this step (the school bag, lights out), or last. */
  ownBefore: string;
  /** Last step and the words that follow the count on the sheet ("bis zur Tasche"). */
  lastWords: { code: string; words: string };
  /** Query key of the clock time ("los", "aus"). */
  timeKey: string;
  defaultTime: string;
  /** Clock times a parent can pick, as "HH:MM". */
  times: readonly string[];
  /**
   * A step that is the moment itself rather than something that takes time
   * ("Licht aus"): when it is the last step it gets the clock time exactly
   * and the steps before it count back from there.
   */
  endStep?: string;
  /** Done band line when times are on, e.g. "Für heute fertig. Los um 7:40 Uhr." */
  timeNote: (clock: string) => string;
  /** App task kinds for this block; must match ROUTINE_CHOICES in the app (drift test). */
  appKinds: readonly string[];
  /** German labels the app shows (TASK_LABEL in the app). */
  appLabels: Readonly<Record<string, string>>;
  /** Query key on the card page and the routine block it seeds. */
  cardParam: 'morgen' | 'abend';
  /** A card is only offered when the app keeps a task on every day; these alone are not enough. */
  notAloneInApp: readonly string[];
  shareTitle: string;
  shareText: string;
  /**
   * The page offers clock faces beside the times ("Als Uhr", "Beides").
   * Morning only; the style lives next to the plan, see `clock.ts`.
   */
  clockFaces?: true;
}

export const OWN_STEP_CODE = 'x';
/** Name of the own step where it has no text yet. */
export const OWN_STEP_LABEL = 'Eigener Schritt';
export const OWN_STEP_MAX = 24;
export const OWN_STEP_MINUTES = 5;

export const MIN_STEPS = 1;
export const MAX_STEPS = 6;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 30;

export interface RoutinePlan {
  /** Step codes in sheet order, 1 to 6, no doubles. */
  steps: string[];
  /** The own step, cleaned. Empty unless the own step is in `steps`. */
  own: string;
  /** Clock times on the sheet. */
  times: boolean;
  /** The clock time the steps count back from, one of the kit's times. */
  leave: string;
  /** Minutes per step, in step order, 1 to 30 each. */
  minutes: number[];
}

/* ------------------------------------------------------------------ */
/* Clock                                                               */
/* ------------------------------------------------------------------ */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const day = 24 * 60;
  const t = ((total % day) + day) % day;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** Clock times from `from` to `to` in 5-minute steps, as "HH:MM". */
export function clockRange(from: string, to: string): string[] {
  const times: string[] = [];
  for (let t = toMinutes(from); t <= toMinutes(to); t += 5) times.push(fromMinutes(t));
  return times;
}

/**
 * Start time of every step, counted back from the clock time: the last step
 * ends then. 07:40 and minutes 3, 10, 15, 5 give 07:07, 07:10, 07:20, 07:35.
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
/* Plan helpers (pure)                                                 */
/* ------------------------------------------------------------------ */

const byCode = new WeakMap<RoutineKit, Map<string, RoutineStep>>();

function table(kit: RoutineKit): Map<string, RoutineStep> {
  let map = byCode.get(kit);
  if (!map) {
    map = new Map(kit.steps.map((step) => [step.code, step]));
    byCode.set(kit, map);
  }
  return map;
}

export function isStepCode(kit: RoutineKit, code: string): boolean {
  return code === OWN_STEP_CODE || table(kit).has(code);
}

export function stepOf(kit: RoutineKit, code: string): RoutineStep | undefined {
  return table(kit).get(code);
}

export function minutesOf(kit: RoutineKit, code: string): number {
  return table(kit).get(code)?.minutes ?? OWN_STEP_MINUTES;
}

export function kitDefaultPlan(kit: RoutineKit): RoutinePlan {
  return {
    steps: [...kit.defaultSteps],
    own: '',
    times: false,
    leave: kit.defaultTime,
    minutes: kit.defaultSteps.map((code) => minutesOf(kit, code)),
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
export function kitStepLabel(kit: RoutineKit, plan: RoutinePlan, code: string): string {
  if (code === OWN_STEP_CODE) return plan.own || OWN_STEP_LABEL;
  return stepOf(kit, code)?.label ?? '';
}

/** Picture of a step in the plan, or null when the sheet shows a box to draw in. */
export function kitStepPicture(kit: RoutineKit, plan: RoutinePlan, code: string): string | null {
  if (code === OWN_STEP_CODE) return plan.own ? pictureForFree(plan.own) : null;
  return stepOf(kit, code)?.img ?? null;
}

export function canAdd(plan: RoutinePlan): boolean {
  return plan.steps.length < MAX_STEPS;
}

/**
 * Where a new step goes: before the first chosen step that comes later in a
 * usual day part (catalogue order), so "Aufstehen" lands on top and not
 * after "Tasche packen". The own step goes in before the kit's anchor step
 * (school bag, lights out), or at the end when there is none. Parents move
 * it with the arrows from there.
 */
function insertAt(kit: RoutineKit, plan: RoutinePlan, code: string): number {
  if (code === OWN_STEP_CODE) {
    const anchor = plan.steps.indexOf(kit.ownBefore);
    return anchor >= 0 ? anchor : plan.steps.length;
  }
  const rank = (c: string) => kit.steps.findIndex((step) => step.code === c);
  const mine = rank(code);
  const later = plan.steps.findIndex((c) => c !== OWN_STEP_CODE && rank(c) > mine);
  return later >= 0 ? later : plan.steps.length;
}

function insert<T>(list: readonly T[], at: number, item: T): T[] {
  return [...list.slice(0, at), item, ...list.slice(at)];
}

export function kitAddStep(kit: RoutineKit, plan: RoutinePlan, code: string): RoutinePlan {
  if (!table(kit).has(code) || plan.steps.includes(code) || !canAdd(plan)) return plan;
  const at = insertAt(kit, plan, code);
  return { ...plan, steps: insert(plan.steps, at, code), minutes: insert(plan.minutes, at, minutesOf(kit, code)) };
}

/** Adds the own step before the anchor step. Nothing happens without text, at six steps or when it is there already. */
export function kitAddOwnStep(kit: RoutineKit, plan: RoutinePlan, text: string): RoutinePlan {
  const own = cleanOwnText(text);
  if (!own || plan.steps.includes(OWN_STEP_CODE) || !canAdd(plan)) return plan;
  const at = insertAt(kit, plan, OWN_STEP_CODE);
  return {
    ...plan,
    steps: insert(plan.steps, at, OWN_STEP_CODE),
    own,
    minutes: insert(plan.minutes, at, OWN_STEP_MINUTES),
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

export function kitSetLeave(kit: RoutineKit, plan: RoutinePlan, leave: string): RoutinePlan {
  return kit.times.includes(leave) ? { ...plan, leave } : plan;
}

export function setMinutes(plan: RoutinePlan, index: number, minutes: number): RoutinePlan {
  if (index < 0 || index >= plan.steps.length || !Number.isFinite(minutes)) return plan;
  const clamped = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(minutes)));
  return { ...plan, minutes: plan.minutes.map((m, i) => (i === index ? clamped : m)) };
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

const COUNT_WORDS = ['Ein', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs'];

/** Plan positions that go on the sheet: an own step without text stays off, it would print an empty row. */
function sheetIndices(plan: RoutinePlan): number[] {
  return plan.steps.flatMap((code, i) => (code === OWN_STEP_CODE && !plan.own ? [] : [i]));
}

/**
 * Clock times as the sheet prints them, one per plan position (undefined
 * where no time is printed). Each start is rounded down to five minutes,
 * which a child finds on a kitchen clock, and printed only where it changes
 * from the row above, so the sheet never reads like a stopwatch. The time in
 * the done band stays exact.
 */
export function printedTimes(plan: RoutinePlan, endStep?: string): (string | undefined)[] {
  const out: (string | undefined)[] = plan.steps.map(() => undefined);
  if (!plan.times) return out;
  const keep = sheetIndices(plan);
  const lastIndex = keep[keep.length - 1];
  // "Licht aus" as the last step is the clock time itself (Astra AB-02).
  const ends = endStep !== undefined && lastIndex !== undefined && plan.steps[lastIndex] === endStep;
  const counted = ends ? keep.slice(0, -1) : keep;
  const starts = startTimes(plan.leave, counted.map((i) => plan.minutes[i]));
  let last = '';
  counted.forEach((i, n) => {
    const rounded = fromMinutes(Math.floor(toMinutes(starts[n]) / 5) * 5);
    if (rounded !== last) out[i] = clockLabel(rounded);
    last = rounded;
  });
  if (ends) out[lastIndex] = clockLabel(plan.leave);
  return out;
}

/** True when the step at `index` is the kit's end step and last on the sheet, so it has no length of its own. */
export function isEndStep(kit: RoutineKit, plan: RoutinePlan, index: number): boolean {
  const keep = sheetIndices(plan);
  return kit.endStep !== undefined && plan.steps[index] === kit.endStep && keep[keep.length - 1] === index;
}

/**
 * Steps as the sheet draws them, with the clock time when times are on.
 *
 * `style` only counts on a kit with clock faces while times are on: rows
 * that print a time get a clock face with that same time, "uhr" without
 * the time in words, "beides" with it. "zahl" is the sheet as it always was.
 */
export function kitSheetSteps(kit: RoutineKit, plan: RoutinePlan, style: ClockStyle = 'zahl'): SheetStep[] {
  const steps = sheetStepsAsWritten(kit, plan);
  if (style === 'zahl' || !kit.clockFaces || !plan.times) return steps;
  return steps.map(({ time, ...step }) => {
    if (!time) return { ...step, time };
    return style === 'uhr' ? { ...step, clock: time } : { ...step, time, clock: time };
  });
}

function sheetStepsAsWritten(kit: RoutineKit, plan: RoutinePlan): SheetStep[] {
  const times = printedTimes(plan, kit.endStep);
  return sheetIndices(plan).map((i) => {
    const code = plan.steps[i];
    const time = times[i];
    if (code === OWN_STEP_CODE) {
      const img = kitStepPicture(kit, plan, code);
      return img ? { img, label: plan.own, time } : { draw: true, label: plan.own, time };
    }
    const step = stepOf(kit, code)!;
    const hint = step.altHint && plan.steps.includes(step.altHint.when) ? step.altHint.hint : step.hint;
    return { img: step.img, label: step.label, hint, time };
  });
}

/** Sheet position of the first step and the time printed beside it, or null when times are off. */
export function kitFirstPrintedTime(kit: RoutineKit, plan: RoutinePlan): { code: string; time: string } | null {
  if (!plan.times) return null;
  const times = printedTimes(plan, kit.endStep);
  const first = sheetIndices(plan)[0];
  if (first === undefined || !times[first]) return null;
  return { code: plan.steps[first], time: times[first]! };
}

/** The line under the sheet title. For the default steps it is the line the page always had. */
export function kitSheetDescription(kit: RoutineKit, plan: RoutinePlan): string {
  const shown = sheetIndices(plan).map((i) => plan.steps[i]);
  const n = shown.length;
  const count = `${COUNT_WORDS[n - 1] ?? String(n)} ${n === 1 ? 'Schritt' : 'Schritte'}`;
  const tail = shown[n - 1] === kit.lastWords.code ? ` ${kit.lastWords.words}` : '';
  return `${count}${tail}. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist.`;
}

/** Note in the done band when times are on, otherwise undefined (the band keeps its own line). */
export function kitLeaveNote(kit: RoutineKit, plan: RoutinePlan): string | undefined {
  return plan.times ? kit.timeNote(clockLabel(plan.leave)) : undefined;
}

/* ------------------------------------------------------------------ */
/* Ronki app                                                           */
/* ------------------------------------------------------------------ */

/** App kinds of the chosen steps, in sheet order. */
export function kitAppKindsFor(kit: RoutineKit, plan: RoutinePlan): string[] {
  const kinds: string[] = [];
  for (const code of plan.steps) {
    const kind = stepOf(kit, code)?.app;
    if (kind && !kinds.includes(kind)) kinds.push(kind);
  }
  return kinds;
}

/** Keeps only kinds the app knows for this block, once each, in the order given. */
export function kitCleanAppKinds(kit: RoutineKit, input: unknown): string[] {
  const list = typeof input === 'string' ? input.split(',') : Array.isArray(input) ? input : [];
  const kinds: string[] = [];
  for (const raw of list) {
    if (typeof raw !== 'string') continue;
    const kind = raw.trim();
    if (kit.appKinds.includes(kind) && !kinds.includes(kind)) kinds.push(kind);
  }
  return kinds;
}

/** Picture of an app kind, the same drawing the sheet uses. */
export function kitAppKindPicture(kit: RoutineKit, kind: string): string {
  return kit.steps.find((step) => step.app === kind)!.img;
}

/**
 * The query part for the card page ("morgen=teeth_am,dress"), or null when no
 * chosen step is in the app, or only steps the app drops on some days (the
 * school bag on weekends and in the holidays). Never the own step.
 */
export function kitCardQuery(kit: RoutineKit, plan: RoutinePlan): string | null {
  const kinds = kitAppKindsFor(kit, plan);
  if (!kinds.some((kind) => !kit.notAloneInApp.includes(kind))) return null;
  return `${kit.cardParam}=${kinds.join(',')}`;
}

/** Link to the card page carrying the app kinds, or null (see kitCardQuery). */
export function kitCardLink(kit: RoutineKit, plan: RoutinePlan): string | null {
  const query = kitCardQuery(kit, plan);
  return query ? `/profil-erstellen?${query}` : null;
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

function sameList<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** The plan as a query string without the leading "?". Empty for the default plan. */
export function kitEncodePlan(kit: RoutineKit, plan: RoutinePlan): string {
  const params = new URLSearchParams();
  if (!sameList(plan.steps, kit.defaultSteps)) params.set('s', plan.steps.join(''));
  const own = cleanOwnText(plan.own);
  if (own && plan.steps.includes(OWN_STEP_CODE)) params.set('e', own);
  if (plan.times) {
    params.set(kit.timeKey, plan.leave.replace(':', ''));
    if (!sameList(plan.minutes, plan.steps.map((code) => minutesOf(kit, code)))) {
      params.set('m', plan.minutes.join('.'));
    }
  }
  return params.toString();
}

function decodeSteps(kit: RoutineKit, value: string | null): string[] {
  if (value === null) return [...kit.defaultSteps];
  const steps: string[] = [];
  for (const ch of Array.from(value)) {
    if (isStepCode(kit, ch) && !steps.includes(ch)) steps.push(ch);
  }
  return steps.length ? steps.slice(0, MAX_STEPS) : [...kit.defaultSteps];
}

function decodeTime(kit: RoutineKit, value: string | null): string | null {
  if (value === null || !/^\d{4}$/.test(value)) return null;
  const hhmm = `${value.slice(0, 2)}:${value.slice(2)}`;
  return kit.times.includes(hhmm) ? hhmm : null;
}

function decodeMinutes(value: string | null, count: number): number[] | null {
  if (value === null) return null;
  const parts = value.split('.');
  if (parts.length !== count) return null;
  const minutes = parts.map((part) => (/^\d{1,2}$/.test(part) ? Number(part) : NaN));
  return minutes.every((m) => m >= MIN_MINUTES && m <= MAX_MINUTES) ? minutes : null;
}

/** Reads a plan back from a query string (with or without "?"). Unknown or bad values are ignored. */
export function kitDecodePlan(kit: RoutineKit, search: string): RoutinePlan {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const steps = decodeSteps(kit, params.get('s'));
  const own = steps.includes(OWN_STEP_CODE) ? cleanOwnText(params.get('e') ?? '') : '';
  const leave = decodeTime(kit, params.get(kit.timeKey));
  const times = leave !== null;
  const minutes =
    (times && decodeMinutes(params.get('m'), steps.length)) || steps.map((code) => minutesOf(kit, code));
  return { steps, own, times, leave: leave ?? kit.defaultTime, minutes };
}
