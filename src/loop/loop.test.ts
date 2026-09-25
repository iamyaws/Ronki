import { describe, it, expect } from 'vitest';
import { blockAt, dayTripReturnAt, nightTripReturnAt, morningEndMinutes } from './dayPhase';
import { fireFor, fireOfBlock, fireSlots, isFirstDay } from './fire';
import { stageOf, evoAfterTreasure, stonesToNext, evoFromAdventures } from './growth';
import { daysBetween, dayKey, minutesOfHHMM } from './clock';
import { taskKind, normalizeRoutine, DEFAULT_ROUTINE } from '../data/taskKinds';
import { TRIPS, tripAt, isRepeat } from '../data/trips';
import { LINES, lineText, returnLineFor, growLeftLine } from '../data/ronkiLines';
import data from '../data/finchLines.de.json';

// Local-time helper: 2026-09-28 is a Monday, 2026-09-26 a Saturday.
const at = (iso: string) => new Date(iso);

describe('blockAt', () => {
  it('splits a school day into morning, day, evening', () => {
    expect(blockAt(at('2026-09-28T03:59:00'))).toBe('evening');
    expect(blockAt(at('2026-09-28T04:00:00'))).toBe('morning');
    expect(blockAt(at('2026-09-28T10:59:00'))).toBe('morning');
    expect(blockAt(at('2026-09-28T11:00:00'))).toBe('day');
    expect(blockAt(at('2026-09-28T16:59:00'))).toBe('day');
    expect(blockAt(at('2026-09-28T17:00:00'))).toBe('evening');
  });
  it('runs the weekend and holiday morning to 12:00', () => {
    expect(blockAt(at('2026-09-26T11:30:00'))).toBe('morning');
    expect(blockAt(at('2026-09-28T11:30:00'), { vacation: true })).toBe('morning');
    expect(morningEndMinutes(at('2026-09-27T08:00:00'))).toBe(12 * 60);
  });
  it('honours the family evening start', () => {
    expect(blockAt(at('2026-09-28T17:15:00'), { eveningStart: '17:30' })).toBe('day');
    expect(blockAt(at('2026-09-28T17:30:00'), { eveningStart: '17:30' })).toBe('evening');
  });
  it('is night after TonightRitual this evening, also past midnight', () => {
    const done = at('2026-09-28T19:40:00').toISOString();
    expect(blockAt(at('2026-09-28T19:50:00'), { tonightDoneAt: done })).toBe('night');
    expect(blockAt(at('2026-09-29T00:30:00'), { tonightDoneAt: done })).toBe('night');
    // Yesterday's ritual does not make tonight a night.
    expect(blockAt(at('2026-09-29T18:00:00'), { tonightDoneAt: done })).toBe('evening');
  });
});

describe('trip times', () => {
  it('a day trip is home at the evening start', () => {
    const r = dayTripReturnAt(at('2026-09-28T07:40:00'), '17:30');
    expect(r.getHours()).toBe(17);
    expect(r.getMinutes()).toBe(30);
  });
  it('a day trip is never shorter than 30 minutes', () => {
    const now = at('2026-09-28T16:50:00');
    expect(dayTripReturnAt(now, '17:00').getTime() - now.getTime()).toBe(30 * 60 * 1000);
  });
  it('a dream trip is home by 05:00 the next morning', () => {
    const r = nightTripReturnAt(at('2026-09-28T19:45:00'));
    expect(r.getDate()).toBe(29);
    expect(r.getHours()).toBe(5);
    const late = nightTripReturnAt(at('2026-09-29T00:30:00'));
    expect(late.getDate()).toBe(29);
    expect(late.getHours()).toBe(5);
  });
});

const q = (id: string, anchor: string, done = false, extra: object = {}) =>
  ({ id, name: id, icon: '', anchor, xp: 10, minutes: 1, done, streak: 0, order: 1, ...extra }) as any;

const DAY = [
  q('s_wake', 'morning', true, { order: 1 }),
  q('s_water', 'morning', false, { order: 2 }),
  q('s_breakfast', 'morning', false, { order: 4 }),
  q('s_teeth_am', 'morning', false, { order: 5 }),
  q('s_dress', 'morning', false, { order: 6 }),
  q('s_packcheck', 'morning', false, { order: 7 }),
  q('side_1', 'morning', false, { sideQuest: true }),
  q('s_move', 'evening', false),
  q('s_dinner', 'bedtime', false, { order: 1 }),
  q('s_teeth_pm', 'bedtime', false, { order: 2 }),
  q('s_wash_pm', 'bedtime', false, { order: 3 }),
  q('s_pyjama', 'bedtime', false, { order: 4 }),
  q('s_cuddle', 'bedtime', false, { order: 5 }),
];

describe('fire', () => {
  it('uses the default routine and never counts side quests', () => {
    const slots = fireSlots({ quests: DAY }, 'morning');
    expect(slots.map(s => s.id)).toEqual(['s_wake', 's_breakfast', 's_teeth_am', 's_dress', 's_packcheck']);
    const evening = fireSlots({ quests: DAY }, 'evening');
    expect(evening.map(s => s.id)).toEqual(['s_teeth_pm', 's_wash_pm', 's_pyjama', 's_cuddle']);
  });
  it('lights one flame per done task and is full only when all are done', () => {
    const now = at('2026-09-28T07:10:00');
    const f = fireFor({ quests: DAY, onboardingDate: '2026-09-01' }, now);
    expect(f.block).toBe('morning');
    expect(f.total).toBe(5);
    expect(f.lit).toBe(1);
    expect(f.full).toBe(false);
    expect(f.next?.id).toBe('s_breakfast');
    const all = DAY.map(x => ({ ...x, done: x.anchor === 'morning' && !x.sideQuest }));
    expect(fireFor({ quests: all, onboardingDate: '2026-09-01' }, now).full).toBe(true);
  });
  it('starts half lit on the first day before any adventure', () => {
    const now = at('2026-09-28T07:10:00');
    const first = { quests: DAY.map(x => ({ ...x, done: false })), onboardingDate: dayKey(now), adventureCount: 0 };
    expect(isFirstDay(first, now)).toBe(true);
    const f = fireOfBlock(first, 'morning', now);
    expect(f.bonus).toBe(2);
    expect(f.lit).toBe(2);
    expect(fireOfBlock({ ...first, adventureCount: 1 }, 'morning', now).bonus).toBe(0);
  });
  it('follows a parent routine by kind', () => {
    const f = fireSlots({ quests: DAY, familyConfig: { routine: { morning: ['wake', 'teeth_am'], evening: ['pyjama'] } } }, 'morning');
    expect(f.map(s => s.id)).toEqual(['s_wake', 's_teeth_am']);
  });
  it('has no fire in the day block', () => {
    expect(fireFor({ quests: DAY }, at('2026-09-28T13:00:00')).block).toBeNull();
  });
});

describe('growth', () => {
  it('maps catEvo to the six stages', () => {
    expect([0, 3, 9, 18, 30, 45].map(stageOf)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(evoFromAdventures(6)).toBe(9);
  });
  it('grows at most one stage per treasure and never shrinks', () => {
    expect(evoAfterTreasure(3, 1)).toBe(4);
    expect(evoAfterTreasure(3, 6)).toBe(9);
    // A backfilled save with 20 adventures moves one stage at a time.
    const first = evoAfterTreasure(3, 21);
    expect(stageOf(first)).toBe(2);
    expect(stageOf(evoAfterTreasure(first, 22))).toBe(3);
    expect(evoAfterTreasure(20, 1)).toBe(20);
  });
  it('counts the stones to the next look', () => {
    expect(stonesToNext(3, 0)).toMatchObject({ stage: 1, total: 6, filled: 0, left: 6, top: false });
    expect(stonesToNext(3, 5)).toMatchObject({ filled: 5, left: 1 });
    expect(stonesToNext(45, 42).top).toBe(true);
  });
});

describe('clock', () => {
  it('counts days between keys', () => {
    expect(daysBetween('2026-09-25', '2026-09-30')).toBe(5);
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2); // across the clock change
    expect(daysBetween(null, '2026-09-30')).toBe(0);
  });
  it('reads HH:MM', () => {
    expect(minutesOfHHMM('18:30')).toBe(1110);
    expect(minutesOfHHMM('nope')).toBe(1020);
  });
});

describe('content', () => {
  it('maps quest ids to kinds', () => {
    expect(taskKind('s_teeth_am')).toBe('teeth_am');
    expect(taskKind('v_teeth_am')).toBe('teeth_am');
    expect(taskKind('ft')).toBe('move');
    expect(taskKind('side_1')).toBeNull();
    expect(normalizeRoutine(undefined)).toEqual(DEFAULT_ROUTINE);
    expect(normalizeRoutine({ morning: ['wake', 'bogus'], evening: [] })).toEqual({ morning: ['wake'], evening: [] });
  });
  it('has 14 trips in a fixed order that wraps honestly', () => {
    expect(TRIPS).toHaveLength(14);
    expect(tripAt(0).id).toBe('t01');
    expect(tripAt(14).id).toBe('t01');
    expect(isRepeat(14)).toBe(true);
    expect(isRepeat(13)).toBe(false);
  });
  it('fills names only in the bubble text', () => {
    expect(lineText('meet_askname_01', { nick: 'Funki' })).toBe('Ich bin Funki! Und wie heißt du?');
    expect(LINES.meet_askname_01.spoken).toBe('Und wie heißt du?');
    expect(lineText('meet_nowiknow_01', { kind: '$1 Mia' })).toContain('$1 Mia');
  });
  it('greets the return, never the absence', () => {
    expect(returnLineFor(0, 'morning')).toBe('greet_day_01');
    expect(returnLineFor(3, 'morning')).toBe('return_short_01');
    expect(returnLineFor(9, 'evening')).toBe('return_long_01');
    expect(growLeftLine(1)).toBe('grow_left_1');
    expect(growLeftLine(7)).toBe('grow_left_more');
  });
  it('has no dashes, no streak words and no spoken names', () => {
    const texts: string[] = [];
    for (const l of Object.values((data as any).lines) as any[]) texts.push(l.text, l.spoken || '');
    for (const t of (data as any).trips) texts.push(t.story, t.hook, t.place, t.treasure);
    for (const t of texts) {
      expect(t).not.toMatch(/[–—]/);
      expect(t).not.toMatch(/streak|verpasst|vermisst|Serie|in Folge|wartet auf dich/i);
    }
    for (const l of Object.values((data as any).lines) as any[]) {
      expect(l.spoken || l.text).not.toMatch(/\{/);
    }
    // Hooks never promise a day (spec R3).
    for (const t of (data as any).trips) expect(t.hook).not.toMatch(/\bMorgen\b/);
  });
});
