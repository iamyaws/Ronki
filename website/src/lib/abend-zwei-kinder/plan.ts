/**
 * Abend mit zwei Kindern: the data behind /tools/abend-mit-zwei-kindern.
 *
 * One adult, two children, two bedtimes. The tool shows when both children
 * need the adult at the same moment. It never predicts sleep: there is no
 * falling-asleep time and no end time for the parent's evening, and nothing
 * compares the two children.
 *
 * The children have no names here. They are the Stern-Kind and the
 * Mond-Kind; the family decides who is who. Each child has an evening from
 * the evening kit (routine-builder/evening.ts) plus a Hörspiel step: one to
 * six steps in the family's order, at most one own step, minutes per step
 * and a lights-out time the steps count back from, exactly like the evening
 * builder with times on. On top, per child, the steps where the child needs
 * the adult ("braucht dich"), and for both children the steps the adult
 * does with both at once ("zusammen").
 *
 * `checkClash` only reports what does not work for one adult; it never
 * moves anything. The whole plan lives in the link. The default plan
 * encodes to an empty string.
 *
 * Link format (keys only where they differ from the default):
 *   a=2           two adults (one is the default)
 *   s=zwlo        Stern-Kind: step codes in order (default zwyo)
 *   se=Medizin    Stern-Kind: the own step, only when x is in its steps
 *   sa=2000       Stern-Kind: lights out as HHMM (default 1930)
 *   sm=3.3.10.1   Stern-Kind: minutes per step, when they differ from the catalogue
 *   sb=zl         Stern-Kind: steps that need the adult, in catalogue order
 *   m, me, ma, mm, mb   the same for the Mond-Kind
 *   z=l           steps done together, in catalogue order
 */

import {
  EVENING,
  EVENING_DEFAULT_STEPS,
  EVENING_DEFAULT_TIME,
  EVENING_STEPS,
  LIGHTS_OUT_TIMES,
} from '../routine-builder/evening';
import {
  MAX_MINUTES,
  MAX_STEPS,
  MIN_MINUTES,
  OWN_STEP_CODE,
  clockLabel,
  cleanOwnText,
  fromMinutes,
  isEndStep,
  kitAddOwnStep,
  kitAddStep,
  kitSetLeave,
  kitStepLabel,
  kitStepPicture,
  minutesOf,
  moveStep as kitMoveStep,
  printedTimes,
  removeStep as kitRemoveStep,
  setMinutes as kitSetMinutes,
  setOwnText,
  stepOf,
  toMinutes,
  type RoutineKit,
  type RoutinePlan,
  type RoutineStep,
} from '../routine-builder/kit';

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

/** The end step: lights out, the moment itself when it is last. */
export const END_STEP = 'o';

/**
 * Only in this tool: one child listens alone in bed while the adult is with
 * the other, sure the adult comes back for "Licht aus".
 */
export const LISTEN_STEP: RoutineStep = {
  code: 'h',
  label: 'Hörspiel',
  hint: 'Zuhören im Bett, bis Licht aus.',
  img: 'headphones.webp',
  minutes: 15,
};

/**
 * "Licht aus" always says good night here (Astra AZ-02): it is a one-minute
 * moment, so a story is its own step with its own minutes.
 */
export const LIGHTS_OUT_HINT = 'Augen zu, gute Nacht.';

/** The evening catalogue with the Hörspiel just before "Licht aus". */
export const STEPS: ReadonlyArray<RoutineStep> = (() => {
  const at = EVENING_STEPS.findIndex((step) => step.code === END_STEP);
  return [...EVENING_STEPS.slice(0, at), LISTEN_STEP, ...EVENING_STEPS.slice(at)];
})();

/** The evening kit with this catalogue: same own-step anchor, end step and lights-out times. */
export const KIT: RoutineKit = { ...EVENING, steps: STEPS };

export const DEFAULT_STEPS: readonly string[] = EVENING_DEFAULT_STEPS;
export const DEFAULT_LIGHTS_OUT = EVENING_DEFAULT_TIME;
export { LIGHTS_OUT_TIMES, MAX_STEPS, MIN_MINUTES, MAX_MINUTES, OWN_STEP_CODE };

/** Catalogue order of every code, the own step last. Sets in the plan are kept in this order. */
const ORDER: readonly string[] = [...STEPS.map((step) => step.code), OWN_STEP_CODE];

export type ChildId = 's' | 'm';

export const CHILDREN: ReadonlyArray<{ id: ChildId; name: string; img: string }> = [
  { id: 's', name: 'Stern-Kind', img: 'star.webp' },
  { id: 'm', name: 'Mond-Kind', img: 'moon.webp' },
];

export function childName(id: ChildId): string {
  return id === 's' ? 'Stern-Kind' : 'Mond-Kind';
}

export function childPicture(id: ChildId): string {
  return id === 's' ? 'star.webp' : 'moon.webp';
}

/** The "braucht dich" mark: an adult hand holding a child's hand. */
export const NEEDS_PICTURE = 'hands.webp';

export type Adults = 1 | 2;

export interface ChildEvening {
  /** Step codes in sheet order, 1 to 6, no doubles. */
  steps: string[];
  /** The own step, cleaned. Empty unless the own step is in `steps`. */
  own: string;
  /** Lights out "HH:MM", one of LIGHTS_OUT_TIMES. The steps count back from it. */
  lightsOut: string;
  /** Minutes per step, in step order, 1 to 30 each. */
  minutes: number[];
  /** Steps where the child needs the adult ("braucht dich"), by code, in catalogue order. */
  needs: string[];
}

export interface TwoChildPlan {
  adults: Adults;
  children: Record<ChildId, ChildEvening>;
  /**
   * Steps the adult does with both children at once ("zusammen"), by code,
   * in catalogue order. Only steps both children have, never the own step,
   * and always in both children's `needs`.
   */
  together: string[];
}

/**
 * The line sent with the link. The link carries this family's evening, so
 * it is written for the person who puts the children to bed too.
 */
export const SHARE_TEXT = 'Unser Abend mit zwei Kindern: wer wann was braucht.';

/* ------------------------------------------------------------------ */
/* Plan helpers (pure)                                                 */
/* ------------------------------------------------------------------ */

function defaultChild(): ChildEvening {
  return {
    steps: [...DEFAULT_STEPS],
    own: '',
    lightsOut: DEFAULT_LIGHTS_OUT,
    minutes: DEFAULT_STEPS.map((code) => minutesOf(KIT, code)),
    needs: [],
  };
}

export function defaultPlan(): TwoChildPlan {
  return { adults: 1, children: { s: defaultChild(), m: defaultChild() }, together: [] };
}

/** Known codes from `codes`, once each, in catalogue order. */
function inOrder(codes: Iterable<string>): string[] {
  const wanted = new Set(codes);
  return ORDER.filter((code) => wanted.has(code));
}

/** The child's evening as the kit's plan, times always on. */
export function toRoutine(child: ChildEvening): RoutinePlan {
  return { steps: child.steps, own: child.own, times: true, leave: child.lightsOut, minutes: child.minutes };
}

function fromRoutine(routine: RoutinePlan, needs: readonly string[]): ChildEvening {
  return {
    steps: routine.steps,
    own: routine.own,
    lightsOut: routine.leave,
    minutes: routine.minutes,
    needs: [...needs],
  };
}

/**
 * "Licht aus" is always the last step (Astra AZ-03): the lights-out time on
 * the card and in the overview is then the moment "Licht aus" happens. When
 * it is somewhere else (a moved step, an old link) it goes to the end with
 * its minutes.
 */
function pinEnd(child: ChildEvening): ChildEvening {
  const at = child.steps.indexOf(END_STEP);
  if (at === -1 || at === child.steps.length - 1) return child;
  const steps = [...child.steps.slice(0, at), ...child.steps.slice(at + 1), END_STEP];
  const minutes = [...child.minutes.slice(0, at), ...child.minutes.slice(at + 1), child.minutes[at]];
  return { ...child, steps, minutes };
}

/** False where a move would push a step past "Licht aus", or "Licht aus" itself away from the end. */
export function canMoveStep(plan: TwoChildPlan, id: ChildId, index: number, by: -1 | 1): boolean {
  const { steps } = plan.children[id];
  const to = index + by;
  if (to < 0 || to >= steps.length) return false;
  return steps[index] !== END_STEP && steps[to] !== END_STEP;
}

/**
 * Keeps the rules of the plan: "braucht dich" only for steps the child
 * has; "zusammen" only for steps both have (never the own step), and a
 * "zusammen" step needs the adult with both children.
 */
function normalize(input: TwoChildPlan): TwoChildPlan {
  const plan = { ...input, children: { s: pinEnd(input.children.s), m: pinEnd(input.children.m) } };
  const { s, m } = plan.children;
  const together = inOrder(
    plan.together.filter((code) => code !== OWN_STEP_CODE && s.steps.includes(code) && m.steps.includes(code)),
  );
  const fix = (child: ChildEvening): ChildEvening => ({
    ...child,
    needs: inOrder([...child.needs.filter((code) => child.steps.includes(code)), ...together]),
  });
  return { ...plan, children: { s: fix(s), m: fix(m) }, together };
}

function withChild(plan: TwoChildPlan, id: ChildId, change: (child: ChildEvening) => ChildEvening): TwoChildPlan {
  return normalize({ ...plan, children: { ...plan.children, [id]: change(plan.children[id]) } });
}

function withRoutine(plan: TwoChildPlan, id: ChildId, change: (routine: RoutinePlan) => RoutinePlan): TwoChildPlan {
  return withChild(plan, id, (child) => fromRoutine(change(toRoutine(child)), child.needs));
}

export function setAdults(plan: TwoChildPlan, adults: Adults): TwoChildPlan {
  return { ...plan, adults: adults === 2 ? 2 : 1 };
}

export function canAddStep(plan: TwoChildPlan, id: ChildId): boolean {
  return plan.children[id].steps.length < MAX_STEPS;
}

/** Adds a catalogue step where it belongs in a usual evening, like the evening builder. */
export function addStep(plan: TwoChildPlan, id: ChildId, code: string): TwoChildPlan {
  return withRoutine(plan, id, (routine) => kitAddStep(KIT, routine, code));
}

/** Adds the own step before "Licht aus". Nothing happens without text, at six steps or when it is there. */
export function addOwnStep(plan: TwoChildPlan, id: ChildId, text: string): TwoChildPlan {
  return withRoutine(plan, id, (routine) => kitAddOwnStep(KIT, routine, text));
}

/** New text for the own step. An empty own step stays in the list but off the sheet and out of the timing. */
export function setOwn(plan: TwoChildPlan, id: ChildId, text: string): TwoChildPlan {
  return withRoutine(plan, id, (routine) => setOwnText(routine, text));
}

/** Removes a step; its "braucht dich" and "zusammen" go with it. The last step stays. */
export function removeStep(plan: TwoChildPlan, id: ChildId, index: number): TwoChildPlan {
  return withRoutine(plan, id, (routine) => kitRemoveStep(routine, index));
}

/** Moves a step one place up (-1) or down (+1). Minutes and "braucht dich" move with it. */
export function moveStep(plan: TwoChildPlan, id: ChildId, index: number, by: -1 | 1): TwoChildPlan {
  return withRoutine(plan, id, (routine) => kitMoveStep(routine, index, by));
}

export function setStepMinutes(plan: TwoChildPlan, id: ChildId, index: number, minutes: number): TwoChildPlan {
  return withRoutine(plan, id, (routine) => kitSetMinutes(routine, index, minutes));
}

export function setLightsOut(plan: TwoChildPlan, id: ChildId, time: string): TwoChildPlan {
  return withRoutine(plan, id, (routine) => kitSetLeave(KIT, routine, time));
}

export function needsAdult(plan: TwoChildPlan, id: ChildId, code: string): boolean {
  return plan.children[id].needs.includes(code);
}

/** Switches "braucht dich" for one step. Switching it off also ends "zusammen" for that step. */
export function toggleNeeds(plan: TwoChildPlan, id: ChildId, code: string): TwoChildPlan {
  const child = plan.children[id];
  if (!child.steps.includes(code)) return plan;
  if (child.needs.includes(code)) {
    const next = { ...plan, together: plan.together.filter((c) => c !== code) };
    return withChild(next, id, (c) => ({ ...c, needs: c.needs.filter((n) => n !== code) }));
  }
  return withChild(plan, id, (c) => ({ ...c, needs: [...c.needs, code] }));
}

/** Steps "zusammen" can be switched on for: both children have them, and it is not an own step. */
export function sharedSteps(plan: TwoChildPlan): string[] {
  const { s, m } = plan.children;
  return inOrder(s.steps.filter((code) => code !== OWN_STEP_CODE && m.steps.includes(code)));
}

/**
 * Switches "zusammen" for a step both children have. On, it marks the step
 * "braucht dich" for both: the adult does it with both at once. Off, the
 * "braucht dich" marks stay.
 */
export function toggleTogether(plan: TwoChildPlan, code: string): TwoChildPlan {
  if (plan.together.includes(code)) return normalize({ ...plan, together: plan.together.filter((c) => c !== code) });
  if (!sharedSteps(plan).includes(code)) return plan;
  return normalize({ ...plan, together: [...plan.together, code] });
}

/* ------------------------------------------------------------------ */
/* Names, pictures, hints                                              */
/* ------------------------------------------------------------------ */

export function stepLabel(child: ChildEvening, code: string): string {
  return kitStepLabel(KIT, toRoutine(child), code);
}

/** Picture of a step, or null when the sheet shows a box to draw in. */
export function stepPicture(child: ChildEvening, code: string): string | null {
  return kitStepPicture(KIT, toRoutine(child), code);
}

/** The hint under a step on the child's card. "Licht aus" always says good night. */
export function stepHint(_child: ChildEvening, code: string): string | undefined {
  const step = stepOf(KIT, code);
  if (!step) return undefined;
  return code === END_STEP ? LIGHTS_OUT_HINT : step.hint;
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export interface TimedStep {
  /** Position in the child's step list. */
  index: number;
  code: string;
  label: string;
  /** Picture, or null for an own step without one (a box to draw in). */
  img: string | null;
  /** Minutes since midnight. The step runs [start, end). */
  start: number;
  end: number;
  needs: boolean;
  /** "Licht aus" as the last step: the moment itself, one minute long for the check. */
  isEnd: boolean;
}

/** Plan positions on the sheet: an own step without text stays off, like on the evening sheet. */
function sheetIndices(child: ChildEvening): number[] {
  return child.steps.flatMap((code, i) => (code === OWN_STEP_CODE && !child.own ? [] : [i]));
}

/**
 * The child's steps on the clock, counted back from lights out exactly like
 * the evening builder: the last step ends at lights out, or is lights out.
 */
export function timeline(plan: TwoChildPlan, id: ChildId): TimedStep[] {
  const child = plan.children[id];
  const routine = toRoutine(child);
  const keep = sheetIndices(child);
  const aus = toMinutes(child.lightsOut);
  const ends = keep.length > 0 && isEndStep(KIT, routine, keep[keep.length - 1]);
  const counted = ends ? keep.slice(0, -1) : keep;
  let t = aus - counted.reduce((sum, i) => sum + child.minutes[i], 0);
  const steps: TimedStep[] = counted.map((i) => {
    const start = t;
    t += child.minutes[i];
    return make(i, start, t, false);
  });
  if (ends) steps.push(make(keep[keep.length - 1], aus, aus + 1, true));
  return steps;

  function make(index: number, start: number, end: number, isEnd: boolean): TimedStep {
    const code = child.steps[index];
    return {
      index,
      code,
      label: stepLabel(child, code),
      img: stepPicture(child, code),
      start,
      end,
      needs: child.needs.includes(code),
      isEnd,
    };
  }
}

/** A time as the child's card prints it: rounded down to five minutes, "07:05" as "7:05". */
export function sheetClock(minutes: number): string {
  return clockLabel(fromMinutes(Math.floor(minutes / 5) * 5));
}

/**
 * A time for the adult, to the minute: the page, the messages and the
 * overview on the sheet (Astra AZ-01, Claude F1). The check works in exact
 * minutes, so what the adult reads must too; only the children's cards round.
 */
export function adultClock(minutes: number): string {
  return clockLabel(fromMinutes(minutes));
}

/** Exact start of every step in the child's list, for the page ("ab 19:21"). Undefined for an empty own step. */
export function stepStarts(plan: TwoChildPlan, id: ChildId): (string | undefined)[] {
  const out: (string | undefined)[] = plan.children[id].steps.map(() => undefined);
  for (const step of timeline(plan, id)) out[step.index] = adultClock(step.start);
  return out;
}

/* ------------------------------------------------------------------ */
/* Check                                                               */
/* ------------------------------------------------------------------ */

export type ClashRule = 'beide' | 'zusammen';

export interface Clash {
  /** "beide": one adult is needed by both children at once. "zusammen": a together step at two times. */
  rule: ClashRule;
  star: TimedStep;
  moon: TimedStep;
  /** Start of the overlap (for "zusammen" the earlier start), minutes since midnight. */
  at: number;
  /** Plain German, du-form: the moment and one way to fix it. */
  message: string;
}

const quote = (text: string) => `„${text}“`;

function overlaps(a: TimedStep, b: TimedStep): boolean {
  return a.start < b.end && b.start < a.end;
}

function sameTime(a: TimedStep, b: TimedStep): boolean {
  return a.start === b.start && a.end === b.end;
}

function bothMessage(a: TimedStep, b: TimedStep, at: number): string {
  const when = `Um ${adultClock(at)}`;
  const together = quote('Was macht ihr zusammen?');
  if (a.code === b.code && a.code !== OWN_STEP_CODE) {
    return sameTime(a, b)
      ? `${when} brauchen dich beide bei ${quote(a.label)}. Mach es mit beiden zusammen: Tipp es unter ${together} an. Oder verschieb eine Licht-aus-Zeit.`
      : `${when} brauchen dich beide bei ${quote(a.label)}. Leg es bei beiden auf dieselbe Zeit und mach es zusammen. Oder verschieb eine Licht-aus-Zeit, damit eins nach dem anderen kommt.`;
  }
  return `${when} brauchen dich beide: das Stern-Kind bei ${quote(a.label)}, das Mond-Kind bei ${quote(b.label)}. Verschieb eine Licht-aus-Zeit oder ändere die Minuten. Oder ein Kind macht in der Zeit etwas ohne dich, etwa ein Hörspiel.`;
}

function togetherMessage(a: TimedStep, b: TimedStep): string {
  const name = quote(a.label);
  const undo = `nimm ${quote('zusammen')} wieder weg`;
  if (a.start !== b.start) {
    const verb = a.isEnd && b.isEnd ? 'ist es' : 'beginnt es';
    return `${name} macht ihr zusammen, aber beim Stern-Kind ${verb} um ${adultClock(a.start)} und beim Mond-Kind um ${adultClock(b.start)}. Leg es bei beiden auf dieselbe Zeit oder ${undo}.`;
  }
  return `${name} macht ihr zusammen, aber es dauert beim Stern-Kind ${a.end - a.start} und beim Mond-Kind ${b.end - b.start} Minuten. Stell bei beiden dieselben Minuten ein oder ${undo}.`;
}

/** The short line next to a child's steps; the full message stands above the print button (Astra AZ-07). */
export function shortClash(clash: Clash): string {
  return clash.rule === 'beide'
    ? `${adultClock(clash.at)}: Beide brauchen dich.`
    : `${adultClock(clash.at)}: ${quote(clash.star.label)} zusammen, aber nicht gleichzeitig.`;
}

/**
 * Everything on the plan that does not work, sorted by time. Pure: it
 * never changes the plan. An empty list means one adult (or two) can do
 * this evening as planned.
 *
 * 1. One adult: a "braucht dich" step of the Stern-Kind overlaps a
 *    "braucht dich" step of the Mond-Kind. Not a clash when it is the same
 *    step, done together, at the very same time.
 * 2. Always: a "zusammen" step that does not run at the same time for both
 *    children. "Zusammen" is about the children, not about the adults.
 * With two adults rule 1 does not apply. Steps run [start, end), so one
 * step right after another is never a clash; "Licht aus" as the last step
 * takes one minute.
 */
export function checkClash(plan: TwoChildPlan): Clash[] {
  const stars = timeline(plan, 's');
  const moons = timeline(plan, 'm');
  const clashes: Clash[] = [];

  for (const code of plan.together) {
    const a = stars.find((step) => step.code === code);
    const b = moons.find((step) => step.code === code);
    if (a && b && !sameTime(a, b)) {
      clashes.push({ rule: 'zusammen', star: a, moon: b, at: Math.min(a.start, b.start), message: togetherMessage(a, b) });
    }
  }

  if (plan.adults === 1) {
    for (const a of stars) {
      if (!a.needs) continue;
      for (const b of moons) {
        if (!b.needs || !overlaps(a, b)) continue;
        // The same step done together: fine at the same time, rule 2 otherwise.
        if (a.code === b.code && plan.together.includes(a.code)) continue;
        const at = Math.max(a.start, b.start);
        clashes.push({ rule: 'beide', star: a, moon: b, at, message: bothMessage(a, b, at) });
      }
    }
  }

  return clashes.sort(
    (x, y) =>
      x.at - y.at ||
      (x.rule === y.rule ? 0 : x.rule === 'beide' ? -1 : 1) ||
      x.star.index - y.star.index ||
      x.moon.index - y.moon.index,
  );
}

export function fits(plan: TwoChildPlan): boolean {
  return checkClash(plan).length === 0;
}

/* ------------------------------------------------------------------ */
/* What the sheet draws                                                */
/* ------------------------------------------------------------------ */

export interface CardStep {
  code: string;
  label: string;
  /** Picture, or null for a box to draw in. */
  img: string | null;
  hint?: string;
  /** "19:05" where the sheet prints a time (rounded, only where it changes). */
  time?: string;
}

/** The child's own card: the steps as the evening sheet prints them. */
export function cardSteps(plan: TwoChildPlan, id: ChildId): CardStep[] {
  const child = plan.children[id];
  const times = printedTimes(toRoutine(child), END_STEP);
  return sheetIndices(child).map((i) => {
    const code = child.steps[i];
    return {
      code,
      label: stepLabel(child, code),
      img: stepPicture(child, code),
      hint: stepHint(child, code),
      time: times[i],
    };
  });
}

/** "Licht aus um 19:30 Uhr." for the band on the child's card. */
export function lightsOutLine(plan: TwoChildPlan, id: ChildId): string {
  return `Licht aus um ${clockLabel(plan.children[id].lightsOut)} Uhr.`;
}

export interface OverviewItem {
  code: string;
  label: string;
  img: string | null;
  needs: boolean;
  isEnd: boolean;
}

export type OverviewRow =
  | {
      kind: 'zusammen';
      /** Printed only where it changes from the row above. */
      time?: string;
      item: OverviewItem;
    }
  | { kind: 'paar'; time?: string; star: OverviewItem[]; moon: OverviewItem[] };

function overviewItem(step: TimedStep): OverviewItem {
  return { code: step.code, label: step.label, img: step.img, needs: step.needs, isEnd: step.isEnd };
}

/**
 * The adult's overview, "Unser Abend": both children's steps in the order
 * of the evening, one row per start minute, to the minute (Astra AZ-01,
 * Claude F1): a handover at 19:24 must not hide in a 19:20 row. Steps of
 * both children that start in the same minute share a row. A "zusammen"
 * step at the same time for both is one row across both columns.
 */
export function overviewRows(plan: TwoChildPlan): OverviewRow[] {
  const stars = timeline(plan, 's');
  const moons = timeline(plan, 'm');
  const joint = new Set(
    plan.together.filter((code) => {
      const a = stars.find((step) => step.code === code);
      const b = moons.find((step) => step.code === code);
      return a && b && sameTime(a, b);
    }),
  );
  type Entry = { child: ChildId | 'both'; step: TimedStep; order: number };
  const entries: Entry[] = [
    ...stars.map((step) => ({ child: (joint.has(step.code) ? 'both' : 's') as Entry['child'], step, order: 0 })),
    ...moons.filter((step) => !joint.has(step.code)).map((step) => ({ child: 'm' as const, step, order: 1 })),
  ].sort((x, y) => x.step.start - y.step.start || x.order - y.order || x.step.index - y.step.index);

  const rows: OverviewRow[] = [];
  let slot = -1;
  let open: Extract<OverviewRow, { kind: 'paar' }> | null = null;
  for (const { child, step } of entries) {
    const mySlot = step.start;
    const time = mySlot !== slot ? adultClock(step.start) : undefined;
    if (mySlot !== slot) open = null;
    slot = mySlot;
    if (child === 'both') {
      rows.push({ kind: 'zusammen', time, item: overviewItem(step) });
      open = null;
      continue;
    }
    if (!open) {
      open = { kind: 'paar', time, star: [], moon: [] };
      rows.push(open);
    }
    (child === 's' ? open.star : open.moon).push(overviewItem(step));
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

/** Longest raw value the decoder looks at: a real link is far shorter. */
const RAW_MAX = 64;
const TEXT_RAW_MAX = 512;

function sameList<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** The plan as a query string without the leading "?". Empty for the default plan. */
export function encodePlan(input: TwoChildPlan): string {
  const plan = normalize(input);
  const params = new URLSearchParams();
  if (plan.adults === 2) params.set('a', '2');
  for (const { id } of CHILDREN) {
    const child = plan.children[id];
    if (!sameList(child.steps, DEFAULT_STEPS)) params.set(id, child.steps.join(''));
    const own = cleanOwnText(child.own);
    if (own && child.steps.includes(OWN_STEP_CODE)) params.set(`${id}e`, own);
    if (child.lightsOut !== DEFAULT_LIGHTS_OUT) params.set(`${id}a`, child.lightsOut.replace(':', ''));
    if (!sameList(child.minutes, child.steps.map((code) => minutesOf(KIT, code)))) {
      params.set(`${id}m`, child.minutes.join('.'));
    }
    if (child.needs.length) params.set(`${id}b`, child.needs.join(''));
  }
  if (plan.together.length) params.set('z', plan.together.join(''));
  return params.toString();
}

function isCode(code: string): boolean {
  return code === OWN_STEP_CODE || stepOf(KIT, code) !== undefined;
}

function decodeSteps(value: string | null): string[] {
  if (value === null) return [...DEFAULT_STEPS];
  const steps: string[] = [];
  for (const ch of Array.from(value.slice(0, RAW_MAX))) {
    if (isCode(ch) && !steps.includes(ch)) steps.push(ch);
    if (steps.length === MAX_STEPS) break;
  }
  return steps.length ? steps : [...DEFAULT_STEPS];
}

function decodeTime(value: string | null): string {
  if (value === null || !/^\d{4}$/.test(value)) return DEFAULT_LIGHTS_OUT;
  const hhmm = `${value.slice(0, 2)}:${value.slice(2)}`;
  return LIGHTS_OUT_TIMES.includes(hhmm) ? hhmm : DEFAULT_LIGHTS_OUT;
}

/** Minutes per step. A value that cannot be read gets the catalogue minutes of its step. */
function decodeMinutes(value: string | null, steps: readonly string[]): number[] {
  const defaults = steps.map((code) => minutesOf(KIT, code));
  if (value === null) return defaults;
  const parts = value.slice(0, RAW_MAX).split('.');
  if (parts.length !== steps.length) return defaults;
  return parts.map((part, i) => {
    const n = /^\d{1,2}$/.test(part) ? Number(part) : NaN;
    return n >= MIN_MINUTES && n <= MAX_MINUTES ? n : defaults[i];
  });
}

function decodeCodes(value: string | null): string[] {
  return value === null ? [] : Array.from(value.slice(0, RAW_MAX)).filter(isCode);
}

function decodeChild(params: URLSearchParams, id: ChildId): ChildEvening {
  const steps = decodeSteps(params.get(id));
  const own = steps.includes(OWN_STEP_CODE) ? cleanOwnText((params.get(`${id}e`) ?? '').slice(0, TEXT_RAW_MAX)) : '';
  return {
    steps,
    own,
    lightsOut: decodeTime(params.get(`${id}a`)),
    minutes: decodeMinutes(params.get(`${id}m`), steps),
    needs: decodeCodes(params.get(`${id}b`)),
  };
}

/**
 * Reads a plan back from a query string (with or without "?"). Anything it
 * does not know or that is out of range falls back to the default for that
 * field; it never throws.
 */
export function decodePlan(search: string): TwoChildPlan {
  try {
    const raw = typeof search === 'string' ? search : '';
    const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
    return normalize({
      adults: params.get('a') === '2' ? 2 : 1,
      children: { s: decodeChild(params, 's'), m: decodeChild(params, 'm') },
      together: decodeCodes(params.get('z')),
    });
  } catch {
    return defaultPlan();
  }
}
