import { describe, it, expect } from 'vitest';
import { greetingFor, nestBeat, afternoonTasks, orderWithLater, moodSlot, byeLine } from './returnBeat';
import { dayKey } from '../../loop/clock';

// 2026-09-28 is a Monday, 2026-09-26 a Saturday.
const at = (iso) => new Date(iso);

const q = (id, anchor, order, done = false, extra = {}) => ({ id, name: id, anchor, order, done, ...extra });
const MORNING = ['s_wake', 's_breakfast', 's_teeth_am', 's_dress', 's_packcheck'].map((id, i) => q(id, 'morning', i + 1));

describe('greetingFor', () => {
  const now = at('2026-09-28T07:10:00');
  it('is null once today is greeted', () => {
    expect(greetingFor({ greetedDate: dayKey(now), lastGapDays: 9 }, now)).toBeNull();
  });
  it('picks the line from the gap and the block', () => {
    expect(greetingFor({ lastGapDays: 0 }, now)).toBe('greet_day_01');
    expect(greetingFor({ lastGapDays: 1 }, at('2026-09-28T13:00:00'))).toBe('greet_day_02');
    expect(greetingFor({ lastGapDays: 1 }, at('2026-09-28T18:00:00'))).toBe('greet_eve_01');
    expect(greetingFor({ lastGapDays: 3 }, now)).toBe('return_short_01');
    expect(greetingFor({ lastGapDays: 5 }, now)).toBe('return_long_01');
    expect(greetingFor({ lastGapDays: 30 }, now)).toBe('return_long_01');
  });
  it('treats a missing gap as a normal day', () => {
    expect(greetingFor({}, now)).toBe('greet_day_01');
  });
});

describe('nestBeat', () => {
  const base = { onboardingDate: '2026-09-01', adventureCount: 2, expedition: { state: 'home' } };

  it('waiting wins over every block', () => {
    const s = { ...base, quests: MORNING, expedition: { state: 'waiting', kind: 'night' } };
    const b = nestBeat(s, at('2026-09-28T07:00:00'));
    expect(b.mode).toBe('waiting');
    expect(b.tripKind).toBe('night');
  });

  it('a legacy leaving save is simply home', () => {
    expect(nestBeat({ ...base, quests: MORNING, expedition: { state: 'leaving' } }, at('2026-09-28T07:00:00')).mode).toBe('fire');
  });

  it('morning: fire while building, departure when full, stay after a trip today', () => {
    const now = at('2026-09-28T07:30:00');
    expect(nestBeat({ ...base, quests: MORNING }, now).mode).toBe('fire');
    const full = MORNING.map(x => ({ ...x, done: true }));
    expect(nestBeat({ ...base, quests: full }, now).mode).toBe('departure');
    expect(nestBeat({ ...base, quests: full, lastTripDate: dayKey(now) }, now).mode).toBe('stay');
  });

  it('side quests never count toward the fire', () => {
    const full = [...MORNING.map(x => ({ ...x, done: true })), q('side', 'morning', 9, false, { sideQuest: true })];
    expect(nestBeat({ ...base, quests: full }, at('2026-09-28T07:30:00')).mode).toBe('departure');
  });

  it('day block: an unfinished morning stays home (R2), day 1 never departs (R4)', () => {
    const now = at('2026-09-28T13:00:00');
    expect(nestBeat({ ...base, quests: MORNING }, now).mode).toBe('stay');
    const full = MORNING.map(x => ({ ...x, done: true }));
    expect(nestBeat({ ...base, quests: full }, now).mode).toBe('departure');
    const day1 = { ...base, quests: full, onboardingDate: dayKey(now), adventureCount: 0 };
    const b = nestBeat(day1, now);
    expect(b.mode).toBe('stay');
    expect(b.firstDay).toBe(true);
  });

  it('day 1 in the morning block leaves when the half-warm fire fills', () => {
    const now = at('2026-09-28T07:30:00');
    const s = { ...base, onboardingDate: dayKey(now), adventureCount: 0, quests: MORNING.map((x, i) => ({ ...x, done: i < 3 })) };
    expect(nestBeat(s, now).mode).toBe('departure');
  });

  it('away on a day trip; a dream trip sleeps in the nest', () => {
    const now = at('2026-09-28T13:00:00');
    expect(nestBeat({ ...base, expedition: { state: 'away', kind: 'day' } }, now).mode).toBe('away');
    expect(nestBeat({ ...base, expedition: { state: 'away' } }, now).mode).toBe('away');
    expect(nestBeat({ ...base, expedition: { state: 'away', kind: 'night' } }, at('2026-09-28T21:00:00')).mode).toBe('night');
  });

  it('evening: fire, then the moon card; night after TonightRitual', () => {
    const eve = ['s_teeth_pm', 's_wash_pm', 's_pyjama', 's_cuddle'].map((id, i) => q(id, 'bedtime', i + 1));
    const now = at('2026-09-28T18:30:00');
    expect(nestBeat({ ...base, quests: eve }, now).mode).toBe('fire');
    expect(nestBeat({ ...base, quests: eve.map(x => ({ ...x, done: true })) }, now).mode).toBe('evening');
    expect(nestBeat({ ...base, quests: [] }, now).mode).toBe('evening');
    const done = at('2026-09-28T19:40:00').toISOString();
    expect(nestBeat({ ...base, quests: eve, eveningRitualCompletedAt: done }, at('2026-09-28T19:50:00')).mode).toBe('night');
  });
});

describe('helpers', () => {
  it('afternoon tasks are main quests with anchor evening or hobby, undone', () => {
    const list = [q('s_move', 'evening', 1), q('ft', 'hobby', 1), q('x', 'evening', 2, true), q('side', 'evening', 3, false, { sideQuest: true }), q('s_wake', 'morning', 1)];
    expect(afternoonTasks(list).map(x => x.id)).toEqual(['s_move', 'ft']);
  });
  it('Später moves a task to the back, done ones drop out', () => {
    const list = [q('a', 'morning', 1), q('b', 'morning', 2), q('c', 'morning', 3, true)];
    expect(orderWithLater(list, ['a']).map(x => x.id)).toEqual(['b', 'a']);
    expect(orderWithLater(list, []).map(x => x.id)).toEqual(['a', 'b']);
  });
  it('the mood slot changes at noon', () => {
    expect(moodSlot(at('2026-09-28T11:59:00'))).toBe('moodAM');
    expect(moodSlot(at('2026-09-28T12:00:00'))).toBe('moodPM');
  });
  it('the goodbye is the school one on weekdays, the free one on weekends and holidays', () => {
    expect(byeLine(at('2026-09-28T07:30:00'), false)).toBe('trip_bye_school_01');
    expect(byeLine(at('2026-09-26T08:30:00'), false)).toBe('trip_bye_free_01');
    expect(byeLine(at('2026-09-28T07:30:00'), true)).toBe('trip_bye_free_01');
  });
});
