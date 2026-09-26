import { describe, it, expect } from 'vitest';
import {
  activeFriend, answerAlone, answerReview, applyMoveOutAtDayStart, askAloneDue, emptyWesen,
  lookOf, markSeen, mergeWesen, newFriendId, noteRoutineEdit, pendingMoment, pickCreature,
  pickTask, reconcileAfterMerge, restoreTask, reviewDue, setEnabled, stageOf, stepOnComplete,
  stepsOf, wouldStep, isRestored,
} from './wesen';
import type { WesenState } from './wesen';
import type { RoutineConfig } from '../data/taskKinds';

const ROUTINE: RoutineConfig = {
  morning: ['wake', 'breakfast', 'teeth_am', 'dress', 'packcheck'],
  evening: ['teeth_pm', 'wash_pm', 'pyjama', 'cuddle'],
};
const T0 = '2026-09-27T06:00:00.000Z';
const d = (iso: string) => new Date(iso);

function started(): WesenState {
  let w = setEnabled(emptyWesen(), true);
  w = pickTask(w, 'teeth_pm');
  return pickCreature(w, 'moosmops', 'w1', T0);
}

function withDays(w: WesenState, days: string[]): WesenState {
  for (const day of days) w = stepOnComplete(w, 's_teeth_pm', day, `${day}T18:00:00.000Z`);
  return w;
}

const FIVE = ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01'];

describe('wesen: switch and pick', () => {
  it('shows nothing and counts nothing while off', () => {
    let w = pickTask(emptyWesen(), 'teeth_pm');
    expect(pendingMoment(w, ROUTINE)).toBeNull();
    w = pickCreature(w, 'tropfi', 'x', T0);
    expect(activeFriend(w)).toBeNull();
  });

  it('only offers daily self-care tasks', () => {
    const w = setEnabled(emptyWesen(), true);
    expect(pickTask(w, 'cuddle').pendingTask).toBeUndefined();
    expect(pickTask(w, 'packcheck').pendingTask).toBeUndefined();
    expect(pickTask(w, 'teeth_am').pendingTask).toBe('teeth_am');
  });

  it('asks the child to pick only when the task is in the routine', () => {
    const w = pickTask(setEnabled(emptyWesen(), true), 'wash');
    expect(pendingMoment(w, ROUTINE)).toBeNull();
    expect(pendingMoment(w, { ...ROUTINE, morning: [...ROUTINE.morning, 'wash'] })).toBe('pick');
  });

  it('creates one friend, visible from day one, and clears the pending task', () => {
    const w = started();
    const f = activeFriend(w)!;
    expect(f.creatureId).toBe('moosmops');
    expect(stageOf(f)).toBe('visitor');
    expect(lookOf(f)).toBe('small');
    expect(w.pendingTask).toBeNull();
    expect(pendingMoment(w, ROUTINE)).toBeNull();
    // A second pick does nothing while a friend lives in the Nest.
    expect(pickCreature(pickTask(w, 'teeth_am'), 'tropfi', 'w2', T0).friends).toHaveLength(1);
  });

  it('makes distinct ids', () => {
    expect(newFriendId(1, 0.1)).not.toBe(newFriendId(1, 0.2));
  });
});

describe('wesen: steps', () => {
  it('counts the linked task once per day, never another task', () => {
    let w = started();
    w = stepOnComplete(w, 's_teeth_pm', '2026-09-27', T0);
    w = stepOnComplete(w, 's_teeth_pm', '2026-09-27', T0);
    w = stepOnComplete(w, 's_teeth_am', '2026-09-27', T0);
    w = stepOnComplete(w, 'v_teeth_pm', '2026-09-28', T0);
    expect(stepsOf(activeFriend(w)!)).toBe(2);
  });

  it('wouldStep matches stepOnComplete', () => {
    const w = started();
    expect(wouldStep(w, 's_teeth_pm', '2026-09-27')).toBe(true);
    expect(wouldStep(w, 's_dress', '2026-09-27')).toBe(false);
    expect(wouldStep(withDays(w, ['2026-09-27']), 's_teeth_pm', '2026-09-27')).toBe(false);
    expect(wouldStep(setEnabled(w, false), 's_teeth_pm', '2026-09-27')).toBe(false);
  });

  it('sits beside Ronki on the fifth day, then the beside moment is due once', () => {
    const w = withDays(started(), FIVE);
    const f = activeFriend(w)!;
    expect(stageOf(f)).toBe('beside');
    expect(lookOf(f)).toBe('small');
    expect(pendingMoment(w, ROUTINE)).toBe('beside');
    const seen = markSeen(w, f.id, 'besideSeen');
    expect(pendingMoment(seen, ROUTINE)).toBeNull();
    expect(lookOf(activeFriend(seen)!)).toBe('friend');
  });

  it('does not step while the switch is off, and keeps what it had', () => {
    const w = setEnabled(withDays(started(), FIVE.slice(0, 3)), false);
    const after = stepOnComplete(w, 's_teeth_pm', '2026-09-30', T0);
    expect(stepsOf(activeFriend(after)!)).toBe(3);
  });

  it('a gap of days changes nothing', () => {
    const w = withDays(started(), ['2026-09-27', '2026-10-20']);
    expect(stepsOf(activeFriend(w)!)).toBe(2);
    expect(stageOf(activeFriend(w)!)).toBe('visitor');
  });
});

describe('wesen: alone and review', () => {
  const beside = () => markSeen(withDays(started(), FIVE), 'w1', 'besideSeen');

  it('asks about "allein" only 7 days after beside, and "Noch nicht" waits 7 more', () => {
    const w = beside();
    expect(askAloneDue(w, d('2026-10-05T18:00:00Z'))).toBe(false);
    expect(askAloneDue(w, d('2026-10-08T18:01:00Z'))).toBe(true);
    const later = answerAlone(w, false, d('2026-10-08T18:01:00Z'));
    expect(askAloneDue(later, d('2026-10-10T18:00:00Z'))).toBe(false);
    expect(askAloneDue(later, d('2026-10-15T18:02:00Z'))).toBe(true);
  });

  it('"Ja, allein" grows the friend; the grow moment is due once', () => {
    const w = answerAlone(beside(), true, d('2026-10-09T08:00:00Z'));
    const f = activeFriend(w)!;
    expect(stageOf(f)).toBe('grown');
    expect(lookOf(f)).toBe('friend');
    expect(pendingMoment(w, ROUTINE)).toBe('grow');
    const seen = markSeen(w, f.id, 'grownSeen');
    expect(lookOf(activeFriend(seen)!)).toBe('grown');
    expect(pendingMoment(seen, ROUTINE)).toBeNull();
  });

  it('the review comes after the chosen weeks and never removes anything by itself', () => {
    const w = markSeen(answerAlone(beside(), true, d('2026-10-09T08:00:00Z')), 'w1', 'grownSeen');
    expect(reviewDue(w, d('2026-11-30T08:00:00Z'))).toBe(false);
    expect(reviewDue(w, d('2026-12-04T08:01:00Z'))).toBe(true);
    const r = applyMoveOutAtDayStart(w, ROUTINE, '2027-01-10');
    expect(r.changed).toBe(false);
  });
});

describe('wesen: move out and restore', () => {
  const confirmed = () => {
    let w = markSeen(withDays(started(), FIVE), 'w1', 'besideSeen');
    w = markSeen(answerAlone(w, true, d('2026-10-09T08:00:00Z')), 'w1', 'grownSeen');
    return answerReview(w, true, d('2026-12-04T19:00:00Z'));
  };

  it('waits for the next day start, then takes the task out and keeps its place', () => {
    const w = confirmed();
    expect(applyMoveOutAtDayStart(w, ROUTINE, '2026-12-04').changed).toBe(false);
    const r = applyMoveOutAtDayStart(w, ROUTINE, '2026-12-05');
    expect(r.changed).toBe(true);
    expect(r.routine!.evening).toEqual(['wash_pm', 'pyjama', 'cuddle']);
    const f = r.wesen.friends[0];
    expect(f.movedOutAt).toBe('2026-12-05');
    expect(f.movedFrom).toEqual({ block: 'evening', index: 0 });
    expect(activeFriend(r.wesen)).toBeNull();
    expect(pendingMoment(r.wesen, r.routine)).toBe('goodbye');
  });

  it('does not move out while the switch is off', () => {
    const w = setEnabled(confirmed(), false);
    expect(applyMoveOutAtDayStart(w, ROUTINE, '2026-12-06').changed).toBe(false);
  });

  it('restores the task where it was, without shrinking the creature', () => {
    const r = applyMoveOutAtDayStart(confirmed(), ROUTINE, '2026-12-05');
    const back = restoreTask(r.wesen, r.routine, 'w1', '2026-12-06T07:00:00.000Z');
    expect(back.routine.evening).toEqual(ROUTINE.evening);
    const f = back.wesen.friends[0];
    expect(isRestored(f)).toBe(true);
    expect(lookOf(f)).toBe('grown');
    expect(pendingMoment(back.wesen, back.routine)).toBeNull();
  });

  it('a routine edit that adds the task back counts as a restore', () => {
    const r = applyMoveOutAtDayStart(confirmed(), ROUTINE, '2026-12-05');
    const w = noteRoutineEdit(r.wesen, ROUTINE, '2026-12-07T07:00:00.000Z');
    expect(isRestored(w.friends[0])).toBe(true);
  });
});

describe('wesen: merge', () => {
  it('unions days per instance; two devices below five reach beside together', () => {
    const base = started();
    const l = withDays(base, ['2026-09-27', '2026-09-28', '2026-09-29']);
    const r = withDays(base, ['2026-09-30', '2026-10-01']);
    const m = mergeWesen(base, l, r)!;
    expect(stepsOf(activeFriend(m)!)).toBe(5);
    const state = reconcileAfterMerge({ wesen: m, familyConfig: { routine: ROUTINE }, quests: [] });
    expect(activeFriend(state.wesen as WesenState)!.besideAt).toBe('2026-10-01T12:00:00.000Z');
  });

  it('two picks at once: the earlier pick stays, the other is dropped', () => {
    const base = pickTask(setEnabled(emptyWesen(), true), 'teeth_pm');
    const l = pickCreature(base, 'tropfi', 'wa', '2026-09-27T06:00:01.000Z');
    const r = pickCreature(base, 'glutfunke', 'wb', '2026-09-27T06:00:00.000Z');
    const m = mergeWesen(base, l, r)!;
    expect(activeFriend(m)!.creatureId).toBe('glutfunke');
    expect(m.friends.find(f => f.id === 'wa')!.dropped).toBe(true);
    expect(m.pendingTask).toBeNull();
  });

  it('seen flags only turn on; the switch follows the side that changed it', () => {
    const base = withDays(started(), FIVE);
    const l = setEnabled(base, false);
    const r = markSeen(base, 'w1', 'besideSeen');
    const m = mergeWesen(base, l, r)!;
    expect(m.enabled).toBe(false);
    expect(m.friends[0].besideSeen).toBe(true);
  });

  it('a moved-out task stays out even when the other device re-added it by routine merge', () => {
    let w = markSeen(withDays(started(), FIVE), 'w1', 'besideSeen');
    w = markSeen(answerAlone(w, true, d('2026-10-09T08:00:00Z')), 'w1', 'grownSeen');
    w = answerReview(w, true, d('2026-12-04T19:00:00Z'));
    const moved = applyMoveOutAtDayStart(w, ROUTINE, '2026-12-05');
    const state = reconcileAfterMerge({
      wesen: moved.wesen,
      familyConfig: { routine: ROUTINE },
      quests: [
        { id: 's_teeth_pm', done: false },
        { id: 's_pyjama', done: false },
        { id: 'side1', sideQuest: true },
      ],
    });
    expect((state.familyConfig as { routine: RoutineConfig }).routine.evening).not.toContain('teeth_pm');
    expect((state.quests as { id: string }[]).map(q => q.id)).toEqual(['s_pyjama', 'side1']);
  });

  it('a later restore wins over the move-out in the reconcile', () => {
    let w = markSeen(withDays(started(), FIVE), 'w1', 'besideSeen');
    w = markSeen(answerAlone(w, true, d('2026-10-09T08:00:00Z')), 'w1', 'grownSeen');
    w = answerReview(w, true, d('2026-12-04T19:00:00Z'));
    const moved = applyMoveOutAtDayStart(w, ROUTINE, '2026-12-05');
    const back = restoreTask(moved.wesen, moved.routine, 'w1', '2026-12-06T07:00:00.000Z');
    const state = reconcileAfterMerge({ wesen: back.wesen, familyConfig: { routine: back.routine }, quests: [{ id: 's_teeth_pm' }] });
    expect((state.familyConfig as { routine: RoutineConfig }).routine.evening).toContain('teeth_pm');
    expect((state.quests as unknown[]).length).toBe(1);
  });

  it('leaves states without wesen untouched', () => {
    const s = { familyConfig: { routine: ROUTINE }, quests: [] };
    expect(reconcileAfterMerge(s)).toBe(s);
  });
});
