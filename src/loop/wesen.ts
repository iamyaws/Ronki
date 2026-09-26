/**
 * Wesen rules (26 Sep 2026). Pure functions, no React, no clock of their own.
 * Plan: docs/plans/2026-09-26-wesen-louis-test.md, Astra round 1 applied
 * (docs/reviews/2026-09-26-wesen-plan/fable-response-round1.md).
 *
 * Life of one friend (one instance, stable id, Astra W-05):
 *   visitor  : picked by the child, friendly from day one, at the edge of the Nest
 *   beside   : 5 different days with the task done; sits beside Ronki
 *   grown    : a parent saw the child do the task alone
 *   movedOut : a parent agreed Ronki no longer has to remind; applied at the
 *              next day start, the task leaves the routine, restorable
 *
 * Nothing here ever goes back, and nothing depends on a gap in days.
 */
import type { RoutineBlock, RoutineConfig, TaskKind } from '../data/taskKinds';
import { normalizeRoutine, taskKind } from '../data/taskKinds';
import {
  ASK_ALONE_AFTER_DAYS, ALONE_SNOOZE_DAYS, BESIDE_AFTER_DAYS, CREATURE_IDS,
  DEFAULT_REVIEW_WEEKS, REVIEW_SNOOZE_DAYS, REVIEW_WEEK_CHOICES, isWesenTask,
} from '../data/wesen';
import type { CreatureId, CreatureLook, ReviewWeeks } from '../data/wesen';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface WesenFriend {
  id: string;
  creatureId: CreatureId;
  taskKind: TaskKind;
  /** Day keys (YYYY-MM-DD, the app's day) on which the task was done. */
  stepDays: string[];
  pickedAt: string;
  besideAt?: string;
  besideSeen?: boolean;
  /** Parent: "Ja, allein". */
  aloneAt?: string;
  /** Parent "Noch nicht": ask again from here. */
  aloneAskAfter?: string;
  grownSeen?: boolean;
  reviewWeeks?: ReviewWeeks;
  /** Parent "Noch nicht" on the review: ask again from here. */
  reviewAfter?: string;
  /** Parent: the reminder may go. Applied at the next day start. */
  moveOutConfirmedAt?: string;
  /** Day key the task left the routine. */
  movedOutAt?: string;
  /** Where the task sat, so a restore puts it back there. */
  movedFrom?: { block: RoutineBlock; index: number };
  goodbyeSeen?: boolean;
  /** Parent brought the task back (never shrinks the creature). */
  restoredAt?: string;
  /** Lost a race: two devices picked at the same time; the earlier pick stays. */
  dropped?: boolean;
}

export interface WesenState {
  /** The parent area was opened with ?wesen=1 on this card (test gate, Astra W-08). */
  offered?: boolean;
  /** Parent switch. Off: nothing shows, nothing steps, nothing moves out. */
  enabled?: boolean;
  /** Parent picked the task; the child has not picked a creature yet. */
  pendingTask?: TaskKind | null;
  friends: WesenFriend[];
}

export type WesenStage = 'visitor' | 'beside' | 'grown' | 'movedOut';
export type WesenMoment = 'pick' | 'beside' | 'grow' | 'goodbye';

// ── Reading ──────────────────────────────────────────────────────────

export function emptyWesen(): WesenState {
  return { friends: [] };
}

export function wesenOf(state: { wesen?: WesenState | null } | null | undefined): WesenState {
  const w = state?.wesen;
  if (!w || typeof w !== 'object') return emptyWesen();
  return { ...w, friends: Array.isArray(w.friends) ? w.friends : [] };
}

export function isOn(w: WesenState): boolean {
  return w.enabled === true;
}

/** The friend still living in the Nest (at most one). */
export function activeFriend(w: WesenState): WesenFriend | null {
  return w.friends.find(f => !f.movedOutAt && !f.dropped) || null;
}

export function movedOutFriends(w: WesenState): WesenFriend[] {
  return w.friends.filter(f => !!f.movedOutAt && !f.dropped);
}

export function stageOf(f: WesenFriend): WesenStage {
  if (f.movedOutAt) return 'movedOut';
  if (f.aloneAt) return 'grown';
  if (f.besideAt) return 'beside';
  return 'visitor';
}

/** The picture a friend shows now. A beside moment not yet played still shows the small look. */
export function lookOf(f: WesenFriend): CreatureLook {
  if (f.movedOutAt) return 'grown';
  if (f.aloneAt) return f.grownSeen ? 'grown' : 'friend';
  if (f.besideAt) return f.besideSeen ? 'friend' : 'small';
  return 'small';
}

/** Days counted so far, 0 to BESIDE_AFTER_DAYS (the visitor's path). */
export function stepsOf(f: WesenFriend): number {
  return Math.min(BESIDE_AFTER_DAYS, uniqueSorted(f.stepDays).length);
}

// ── Child and task ───────────────────────────────────────────────────

/**
 * True when completing this quest on this day would bring the active friend
 * a step closer (used by the Nest to say the line after the tick).
 */
export function wouldStep(w: WesenState, questId: string, day: string): boolean {
  if (!isOn(w)) return false;
  const f = activeFriend(w);
  if (!f || f.besideAt) return false;
  return taskKind(questId) === f.taskKind && !f.stepDays.includes(day);
}

/**
 * A quest just became done (called from complete() only on the not-done to
 * done transition). Counts the day once; the 5th day sets besideAt.
 */
export function stepOnComplete(w: WesenState, questId: string, day: string, nowIso: string): WesenState {
  if (!isOn(w)) return w;
  const f = activeFriend(w);
  if (!f || taskKind(questId) !== f.taskKind || f.stepDays.includes(day)) return w;
  const stepDays = uniqueSorted([...f.stepDays, day]);
  const next: WesenFriend = { ...f, stepDays };
  if (!f.besideAt && stepDays.length >= BESIDE_AFTER_DAYS) next.besideAt = nowIso;
  return replaceFriend(w, next);
}

/** The child picked one of the three. The other two go back into the forest. */
export function pickCreature(w: WesenState, creatureId: CreatureId, id: string, nowIso: string): WesenState {
  if (!isOn(w) || activeFriend(w) || !w.pendingTask || !CREATURE_IDS.includes(creatureId)) return w;
  const friend: WesenFriend = {
    id, creatureId, taskKind: w.pendingTask, stepDays: [], pickedAt: nowIso,
    reviewWeeks: DEFAULT_REVIEW_WEEKS,
  };
  return { ...w, pendingTask: null, friends: [...w.friends, friend] };
}

/** The one kid moment due now, if any (one at a time; the Nest shows it when nothing else is open). */
export function pendingMoment(w: WesenState, routine: RoutineConfig | null | undefined): WesenMoment | null {
  if (!isOn(w)) return null;
  const gone = w.friends.find(f => f.movedOutAt && !f.goodbyeSeen && !f.dropped && !isRestored(f));
  if (gone) return 'goodbye';
  const f = activeFriend(w);
  if (f) {
    if (f.besideAt && !f.besideSeen) return 'beside';
    if (f.aloneAt && !f.grownSeen) return 'grow';
    return null;
  }
  if (w.pendingTask && isWesenTask(w.pendingTask) && routineHas(normalizeRoutine(routine), w.pendingTask)) return 'pick';
  return null;
}

export function markSeen(w: WesenState, friendId: string, which: 'besideSeen' | 'grownSeen' | 'goodbyeSeen'): WesenState {
  const f = w.friends.find(x => x.id === friendId);
  if (!f || f[which]) return w;
  return replaceFriend(w, { ...f, [which]: true });
}

// ── Parent ───────────────────────────────────────────────────────────

export function setEnabled(w: WesenState, on: boolean): WesenState {
  return { ...w, enabled: on };
}

export function pickTask(w: WesenState, kind: TaskKind): WesenState {
  if (!isWesenTask(kind) || activeFriend(w)) return w;
  return { ...w, pendingTask: kind };
}

/** "Macht er das inzwischen allein?" is due (no date shown to anyone, Astra W-03). */
export function askAloneDue(w: WesenState, now: Date): boolean {
  const f = activeFriend(w);
  if (!isOn(w) || !f || !f.besideAt || f.aloneAt) return false;
  const from = Date.parse(f.besideAt) + ASK_ALONE_AFTER_DAYS * DAY_MS;
  const after = f.aloneAskAfter ? Date.parse(f.aloneAskAfter) : 0;
  return now.getTime() >= Math.max(from, after);
}

export function answerAlone(w: WesenState, yes: boolean, now: Date): WesenState {
  const f = activeFriend(w);
  if (!f || !f.besideAt || f.aloneAt) return w;
  if (yes) return replaceFriend(w, { ...f, aloneAt: now.toISOString() });
  return replaceFriend(w, { ...f, aloneAskAfter: new Date(now.getTime() + ALONE_SNOOZE_DAYS * DAY_MS).toISOString() });
}

export function setReviewWeeks(w: WesenState, weeks: number): WesenState {
  const f = activeFriend(w);
  if (!f || !(REVIEW_WEEK_CHOICES as readonly number[]).includes(weeks)) return w;
  return replaceFriend(w, { ...f, reviewWeeks: weeks as ReviewWeeks });
}

/** The review point: "Darf Ronki aufhören zu erinnern?" (Astra W-04). */
export function reviewDue(w: WesenState, now: Date): boolean {
  const f = activeFriend(w);
  if (!isOn(w) || !f || !f.aloneAt || f.moveOutConfirmedAt) return false;
  const weeks = f.reviewWeeks || DEFAULT_REVIEW_WEEKS;
  const from = Date.parse(f.aloneAt) + weeks * 7 * DAY_MS;
  const after = f.reviewAfter ? Date.parse(f.reviewAfter) : 0;
  return now.getTime() >= Math.max(from, after);
}

/** The date of the review point, for the parent line (null before "allein"). */
export function reviewDate(f: WesenFriend): Date | null {
  if (!f.aloneAt) return null;
  return new Date(Date.parse(f.aloneAt) + (f.reviewWeeks || DEFAULT_REVIEW_WEEKS) * 7 * DAY_MS);
}

export function answerReview(w: WesenState, yes: boolean, now: Date): WesenState {
  const f = activeFriend(w);
  if (!f || !f.aloneAt || f.moveOutConfirmedAt) return w;
  if (yes) return replaceFriend(w, { ...f, moveOutConfirmedAt: now.toISOString() });
  return replaceFriend(w, { ...f, reviewAfter: new Date(now.getTime() + REVIEW_SNOOZE_DAYS * DAY_MS).toISOString() });
}

/**
 * Day start (before the day's quests are built): a confirmed move-out from
 * an earlier day takes effect. The task leaves the routine, its place is kept
 * for a restore. Never mid-day (Astra Q3), never while the switch is off.
 */
export function applyMoveOutAtDayStart(
  w: WesenState, routine: RoutineConfig | null | undefined, today: string,
): { wesen: WesenState; routine: RoutineConfig | null | undefined; changed: boolean } {
  const f = activeFriend(w);
  if (!isOn(w) || !f || !f.moveOutConfirmedAt) return { wesen: w, routine, changed: false };
  if (f.moveOutConfirmedAt.slice(0, 10) >= today) return { wesen: w, routine, changed: false };
  const r = normalizeRoutine(routine);
  const movedFrom = positionOf(r, f.taskKind) || undefined;
  const next: WesenFriend = { ...f, movedOutAt: today, movedFrom };
  return { wesen: replaceFriend(w, next), routine: withoutKind(r, f.taskKind), changed: true };
}

/** Parent "Wieder zurückholen": the task comes back where it was; the creature keeps its look. */
export function restoreTask(
  w: WesenState, routine: RoutineConfig | null | undefined, friendId: string, nowIso: string,
): { wesen: WesenState; routine: RoutineConfig } {
  const r = normalizeRoutine(routine);
  const f = w.friends.find(x => x.id === friendId);
  if (!f || !f.movedOutAt) return { wesen: w, routine: r };
  return {
    wesen: replaceFriend(w, { ...f, restoredAt: nowIso }),
    routine: withKind(r, f.taskKind, f.movedFrom),
  };
}

/** A parent routine edit that adds back a moved-out task counts as a restore (Astra W-06). */
export function noteRoutineEdit(w: WesenState, next: RoutineConfig, nowIso: string): WesenState {
  let out = w;
  for (const f of w.friends) {
    if (f.movedOutAt && !isRestored(f) && routineHas(next, f.taskKind)) {
      out = replaceFriend(out, { ...f, restoredAt: nowIso });
    }
  }
  return out;
}

export function isRestored(f: WesenFriend): boolean {
  return !!f.restoredAt && !!f.movedOutAt && f.restoredAt.slice(0, 10) >= f.movedOutAt;
}

// ── Sync merge (compare-and-swap, src/utils/mergeState.ts) ───────────

/**
 * Three-way merge of state.wesen. Friends merge by instance id: days union,
 * first set date wins, seen flags only turn on, snoozes take the later date,
 * a restore takes the later date. Two active friends after a race: the
 * earlier pick stays, the other is dropped.
 */
export function mergeWesen(b: unknown, l: unknown, r: unknown): WesenState | undefined {
  if (!l && !r) return (l ?? r) as undefined;
  const bw = (b && typeof b === 'object') ? b as WesenState : null;
  const lw = wesenOf({ wesen: l as WesenState });
  const rw = wesenOf({ wesen: r as WesenState });
  const byId = new Map<string, WesenFriend>();
  for (const f of rw.friends) byId.set(f.id, f);
  for (const f of lw.friends) {
    const other = byId.get(f.id);
    byId.set(f.id, other ? mergeFriend(other, f) : f);
  }
  let friends = [...byId.values()].sort((a, c) => a.pickedAt.localeCompare(c.pickedAt) || a.id.localeCompare(c.id));
  const live = friends.filter(f => !f.movedOutAt && !f.dropped);
  if (live.length > 1) {
    const keep = live[0].id;
    friends = friends.map(f => (!f.movedOutAt && !f.dropped && f.id !== keep ? { ...f, dropped: true } : f));
  }
  const scalar = <K extends 'enabled' | 'pendingTask'>(k: K): WesenState[K] => {
    if (bw) {
      const lc = lw[k] !== bw[k];
      const rc = rw[k] !== bw[k];
      if (lc && !rc) return lw[k];
      if (rc && !lc) return rw[k];
    }
    return lw[k] !== undefined ? lw[k] : rw[k];
  };
  const out: WesenState = { friends };
  if (lw.offered || rw.offered) out.offered = true;
  const enabled = scalar('enabled');
  if (enabled !== undefined) out.enabled = enabled;
  const hasLive = friends.some(f => !f.movedOutAt && !f.dropped);
  const pending = hasLive ? null : scalar('pendingTask');
  if (pending !== undefined) out.pendingTask = pending;
  return out;
}

function mergeFriend(a: WesenFriend, c: WesenFriend): WesenFriend {
  const out: WesenFriend = { ...a, ...c, stepDays: uniqueSorted([...(a.stepDays || []), ...(c.stepDays || [])]) };
  for (const k of ['pickedAt', 'besideAt', 'aloneAt', 'moveOutConfirmedAt', 'movedOutAt'] as const) {
    out[k] = earliest(a[k], c[k]) as never;
  }
  for (const k of ['aloneAskAfter', 'reviewAfter', 'restoredAt'] as const) {
    out[k] = latest(a[k], c[k]) as never;
  }
  for (const k of ['besideSeen', 'grownSeen', 'goodbyeSeen', 'dropped'] as const) {
    if (a[k] || c[k]) out[k] = true;
  }
  out.movedFrom = c.movedFrom || a.movedFrom;
  for (const k of Object.keys(out) as (keyof WesenFriend)[]) if (out[k] === undefined) delete out[k];
  return out;
}

/**
 * After a merge: readiness from the merged days (two devices below 5 can
 * reach 5 together), and a moved-out task stays out of the routine and out
 * of today's open quests unless a later restore says otherwise (Astra W-06).
 */
export function reconcileAfterMerge<T extends Record<string, unknown>>(state: T): T {
  if (!state || !state.wesen) return state;
  let w = wesenOf(state as { wesen?: WesenState });
  const f = activeFriend(w);
  if (f && !f.besideAt && uniqueSorted(f.stepDays).length >= BESIDE_AFTER_DAYS) {
    const fifth = uniqueSorted(f.stepDays)[BESIDE_AFTER_DAYS - 1];
    w = replaceFriend(w, { ...f, besideAt: `${fifth}T12:00:00.000Z` });
  }
  const fc = (state.familyConfig || {}) as { routine?: RoutineConfig };
  let routine = fc.routine ? normalizeRoutine(fc.routine) : null;
  const gone = new Set<string>();
  for (const x of movedOutFriends(w)) {
    if (isRestored(x)) continue;
    gone.add(x.taskKind);
    if (routine && routineHas(routine, x.taskKind)) routine = withoutKind(routine, x.taskKind);
  }
  let out: Record<string, unknown> = { ...state, wesen: w };
  if (routine && fc.routine && !sameRoutine(routine, normalizeRoutine(fc.routine))) {
    out = { ...out, familyConfig: { ...(state.familyConfig as object), routine } };
  }
  if (gone.size && Array.isArray(state.quests)) {
    const quests = (state.quests as { id: string; done?: boolean; sideQuest?: boolean }[])
      .filter(q => q.sideQuest || q.done || !gone.has(taskKind(q.id) || ''));
    if (quests.length !== (state.quests as unknown[]).length) out = { ...out, quests };
  }
  return out as T;
}

// ── Helpers ──────────────────────────────────────────────────────────

export function newFriendId(nowMs: number, rand: number = Math.random()): string {
  return `w${nowMs.toString(36)}${Math.floor(rand * 1e8).toString(36)}`;
}

function replaceFriend(w: WesenState, f: WesenFriend): WesenState {
  return { ...w, friends: w.friends.map(x => (x.id === f.id ? f : x)) };
}

function uniqueSorted(days: string[] | undefined): string[] {
  return [...new Set((days || []).filter(d => typeof d === 'string'))].sort();
}

function earliest(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a <= b ? a : b;
}

function latest(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

export function routineHas(r: RoutineConfig, kind: TaskKind): boolean {
  return r.morning.includes(kind) || r.evening.includes(kind);
}

function positionOf(r: RoutineConfig, kind: TaskKind): { block: RoutineBlock; index: number } | null {
  for (const block of ['morning', 'evening'] as const) {
    const index = r[block].indexOf(kind);
    if (index >= 0) return { block, index };
  }
  return null;
}

function withoutKind(r: RoutineConfig, kind: TaskKind): RoutineConfig {
  return { morning: r.morning.filter(k => k !== kind), evening: r.evening.filter(k => k !== kind) };
}

function withKind(r: RoutineConfig, kind: TaskKind, at?: { block: RoutineBlock; index: number }): RoutineConfig {
  if (routineHas(r, kind)) return r;
  const block: RoutineBlock = at?.block || (kind.endsWith('_pm') || kind === 'pyjama' ? 'evening' : 'morning');
  const list = [...r[block]];
  const index = Math.max(0, Math.min(list.length, at?.index ?? list.length));
  list.splice(index, 0, kind);
  return { ...r, [block]: list };
}

function sameRoutine(a: RoutineConfig, b: RoutineConfig): boolean {
  return a.morning.join() === b.morning.join() && a.evening.join() === b.evening.join();
}
