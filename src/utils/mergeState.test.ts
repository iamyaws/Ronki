import { describe, it, expect } from 'vitest';
import { mergeStates, jsonEqual } from './mergeState';

const q = (id: string, done = false, extra: object = {}) => ({ id, anchor: 'morning', done, completions: done ? 1 : 0, ...extra });

const base = () => ({
  lastDate: '2026-09-28',
  onboardingDone: true,
  companionName: 'Knisti',
  catEvo: 3,
  adventureCount: 2,
  tripCursor: 2,
  hp: 40,
  totalTasksDone: 10,
  expedition: { state: 'home', biome: 'morgenwald' },
  expeditionLog: [{ id: 'm1', ts: '2026-09-26T07:00:00.000Z' }, { id: 'm2', ts: '2026-09-27T07:00:00.000Z' }],
  treasuresFound: ['t01', 't02'],
  quests: [q('s_wake'), q('s_breakfast'), q('s_teeth_am')],
  familyConfig: { childName: 'Louisa', eveningStart: '17:00', routine: { morning: ['wake', 'breakfast', 'teeth_am'], evening: [] } },
  parentPin: '4711',
});

describe('jsonEqual', () => {
  it('ignores key order and treats undefined like null', () => {
    expect(jsonEqual({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true);
    expect(jsonEqual({ a: null }, {})).toBe(true);
    expect(jsonEqual([1, 2], [2, 1])).toBe(false);
  });
});

describe('mergeStates', () => {
  it('a phone that only opened the app changes nothing: the tablet\'s progress stays', () => {
    const b = base();
    const phone = { ...b, lastLoginDate: '2026-09-28' }; // remote: only a login stamp
    const tablet = { ...b, quests: [q('s_wake', true), q('s_breakfast'), q('s_teeth_am')], totalTasksDone: 11, hp: 50 };
    const m = mergeStates(b, tablet, phone);
    expect(m.quests[0].done).toBe(true);
    expect(m.totalTasksDone).toBe(11);
    expect(m.hp).toBe(50);
    expect((m as any).lastLoginDate).toBe('2026-09-28');
  });

  it('tasks ticked on two devices on the same day are all done', () => {
    const b = base();
    const phone = { ...b, quests: [q('s_wake', true), q('s_breakfast'), q('s_teeth_am')], totalTasksDone: 11 };
    const tablet = { ...b, quests: [q('s_wake'), q('s_breakfast', true), q('s_teeth_am')], totalTasksDone: 11 };
    const m = mergeStates(b, tablet, phone);
    expect(m.quests.map((x: any) => x.done)).toEqual([true, true, false]);
    expect(m.totalTasksDone).toBe(12); // two different tasks: both count
  });

  it('two devices earning at once: Sterne and counters add up, even when they land on the same number', () => {
    const b = { ...base(), hp: 0, totalTasksDone: 0, quests: [q('s_wake', false, { xp: 10 }), q('s_breakfast', false, { xp: 10 })] };
    const a = { ...b, hp: 10, totalTasksDone: 1, quests: [q('s_wake', true, { xp: 10 }), q('s_breakfast', false, { xp: 10 })] };
    const c = { ...b, hp: 10, totalTasksDone: 1, quests: [q('s_wake', false, { xp: 10 }), q('s_breakfast', true, { xp: 10 })] };
    const m = mergeStates(b, a, c);
    expect(m.hp).toBe(20);
    expect(m.totalTasksDone).toBe(2);
  });

  it('the same task ticked on both devices counts once', () => {
    const b = { ...base(), hp: 0, totalTasksDone: 0, quests: [q('s_wake', false, { xp: 10 }), q('s_breakfast', false, { xp: 10 })] };
    const a = { ...b, hp: 10, totalTasksDone: 1, quests: [q('s_wake', true, { xp: 10 }), q('s_breakfast', false, { xp: 10 })] };
    const m = mergeStates(b, a, { ...a });
    expect(m.quests.map((x: any) => x.done)).toEqual([true, false]);
    expect(m.hp).toBe(10);
    expect(m.totalTasksDone).toBe(1);
  });

  it('side quests: the card keeps its own; one only this device picked survives only if done', () => {
    // A card seed without quests: both devices built today's list at load.
    const b = { ...base(), quests: undefined as any };
    const local = { ...b, quests: [q('s_wake', true), q('side_x', false, { sideQuest: true }), q('side_y', true, { sideQuest: true })] };
    const remote = { ...b, quests: [q('s_wake'), q('side_a', false, { sideQuest: true })] };
    const m = mergeStates(b, local, remote);
    expect(m.quests.map((x: any) => x.id)).toEqual(['s_wake', 'side_a', 'side_y']);
  });

  it('a new day on one device wins the task list over yesterday\'s on the other', () => {
    const b = base();
    const tablet = { ...b, lastDate: '2026-09-29', quests: [q('s_wake', true)] };
    const phone = { ...b, quests: [q('s_wake'), q('s_breakfast', true), q('s_teeth_am')] };
    const m = mergeStates(b, tablet, phone);
    expect(m.lastDate).toBe('2026-09-29');
    expect(m.quests).toEqual([q('s_wake', true)]);
  });

  it('a treasure opened on one device and a departure on the other keep the treasure and the count', () => {
    const b = base();
    const tablet = {
      ...b,
      adventureCount: 3, tripCursor: 3, catEvo: 4,
      expeditionLog: [...b.expeditionLog, { id: 'm3', ts: '2026-09-28T07:00:00.000Z' }],
      treasuresFound: ['t01', 't02', 't03'],
    };
    const phone = { ...b, expedition: { state: 'away', biome: 'morgenwald', tripId: 't03' } };
    const m = mergeStates(b, tablet, phone);
    expect(m.adventureCount).toBe(3);
    expect(m.treasuresFound).toEqual(['t01', 't02', 't03']);
    expect(m.expeditionLog.map((x: any) => x.id)).toEqual(['m1', 'm2', 'm3']);
    expect(m.catEvo).toBe(4);
  });

  it('when both change the trip, the side further along wins', () => {
    const b = { ...base(), expedition: { state: 'away', biome: 'morgenwald', tripId: 't03' } };
    const waiting = { ...b, expedition: { state: 'waiting', biome: 'morgenwald', tripId: 't03' } };
    const received = { ...b, adventureCount: 3, expedition: { state: 'home', biome: 'morgenwald' } };
    expect(mergeStates(b, waiting, received).expedition.state).toBe('home');
    expect(mergeStates(b, received, waiting).expedition.state).toBe('home');
  });

  it('Sterne earned on one device and spent on the other both count', () => {
    const b = base();
    const earned = { ...b, hp: 60 }; // +20
    const spent = { ...b, hp: 10 }; // -30
    expect(mergeStates(b, earned, spent).hp).toBe(30);
    expect(mergeStates(b, spent, earned).hp).toBe(30);
  });

  it('a parent setting changed on one device and a task on the other both survive', () => {
    const b = base();
    const phone = { ...b, parentPin: '9999', familyConfig: { ...b.familyConfig, eveningStart: '18:00' } };
    const tablet = { ...b, familyConfig: { ...b.familyConfig, routine: { morning: ['wake'], evening: [] } }, totalTasksDone: 11 };
    const m = mergeStates(b, tablet, phone);
    expect(m.parentPin).toBe('9999');
    expect(m.familyConfig.eveningStart).toBe('18:00');
    expect(m.familyConfig.routine).toEqual({ morning: ['wake'], evening: [] });
    expect(m.totalTasksDone).toBe(11);
  });

  it('without a base (never read the card) the card\'s own dragon stays', () => {
    const card = base();
    const localHatch = { kidIntroSeen: true, onboardingDone: false, companionName: 'Funki', catEvo: 3, lastDate: '2026-09-28', newField: 1 };
    const m = mergeStates(null, localHatch as any, card as any) as any;
    expect(m.companionName).toBe('Knisti');
    expect(m.onboardingDone).toBe(true);
    expect(m.catEvo).toBe(3);
    expect(m.adventureCount).toBe(2);
    expect(m.parentPin).toBe('4711');
    expect(m.newField).toBe(1);
  });

  it('without a base, Sterne are never added twice: the side that played the later day stands, else the card', () => {
    const card = { ...base(), hp: 40 };
    expect(mergeStates(null, { ...base(), hp: 45 }, card).hp).toBe(40); // same day: the card (a stale copy never refunds)
    expect(mergeStates(null, { ...base(), hp: 45, lastDate: '2026-09-29' }, card).hp).toBe(45); // local played later
  });

  it('flags that only turn on stay on; the first day stays first', () => {
    const b = { ...base(), onboardingDone: false, onboardingDate: undefined as any };
    const a = { ...b, onboardingDone: true, onboardingDate: '2026-09-27' };
    const c = { ...b, kidIntroSeen: true, onboardingDate: '2026-09-28' };
    const m = mergeStates(b, a, c) as any;
    expect(m.onboardingDone).toBe(true);
    expect(m.kidIntroSeen).toBe(true);
    expect(m.onboardingDate).toBe('2026-09-27');
  });

  it('a trip done and back while offline beats the card that still has Ronki away on it (Astra CAS-03)', () => {
    const b = { ...base(), adventureCount: 2, expedition: { state: 'home', biome: 'morgenwald' } };
    const local = { ...b, adventureCount: 3, tripCursor: 3, treasuresFound: ['t01', 't02', 't03'], expedition: { state: 'home', biome: 'morgenwald' } };
    const remote = { ...b, expedition: { state: 'away', biome: 'morgenwald', tripId: 't03' } };
    const m = mergeStates(b, local, remote) as any;
    expect(m.adventureCount).toBe(3);
    expect(m.expedition.state).toBe('home');
  });

  it('a task ticked on both devices on a new day counts once, even when the base is from yesterday (Astra CAS-04)', () => {
    const b = { ...base(), lastDate: '2026-09-27', hp: 0, totalTasksDone: 0, totalQuestCompletions: { s_wake: 4 }, quests: [q('s_wake', true, { xp: 10 })] };
    const today = [q('s_wake', true, { xp: 10 }), q('s_breakfast', false, { xp: 10 })];
    const a = { ...b, lastDate: '2026-09-28', hp: 10, totalTasksDone: 1, totalQuestCompletions: { s_wake: 5 }, quests: today };
    const m = mergeStates(b, a, { ...a }) as any;
    expect(m.hp).toBe(10);
    expect(m.totalTasksDone).toBe(1);
    expect(m.totalQuestCompletions).toEqual({ s_wake: 5 });
  });

  it('the per-task count map stays a map and adds up both devices (verifier F1)', () => {
    const b = { ...base(), hp: 0, totalTasksDone: 0, totalQuestCompletions: { s_wake: 3, s_breakfast: 2, s_teeth_am: 29 }, quests: [q('s_wake', false, { xp: 10 }), q('s_breakfast', false, { xp: 10 })] };
    const a = { ...b, hp: 10, totalTasksDone: 1, totalQuestCompletions: { ...b.totalQuestCompletions, s_wake: 4 }, quests: [q('s_wake', true, { xp: 10 }), q('s_breakfast', false, { xp: 10 })] };
    const c = { ...b, hp: 10, totalTasksDone: 1, totalQuestCompletions: { ...b.totalQuestCompletions, s_breakfast: 3 }, quests: [q('s_wake', false, { xp: 10 }), q('s_breakfast', true, { xp: 10 })] };
    const m = mergeStates(b, a, c) as any;
    expect(m.totalQuestCompletions).toEqual({ s_wake: 4, s_breakfast: 3, s_teeth_am: 29 });
    expect(m.totalTasksDone).toBe(2);
  });

  it('two devices that both ran the same trip on the same day keep one keepsake', () => {
    const b = base();
    const a = { ...b, adventureCount: 3, expeditionLog: [...b.expeditionLog, { id: 'mA', tripId: 't03', ts: '2026-09-28T16:00:00.000Z' }] };
    const c = { ...b, adventureCount: 3, expeditionLog: [...b.expeditionLog, { id: 'mB', tripId: 't03', ts: '2026-09-28T16:02:00.000Z' }] };
    const m = mergeStates(b, a, c) as any;
    expect(m.expeditionLog.filter((e: any) => e.tripId === 't03')).toHaveLength(1);
    expect(m.adventureCount).toBe(3);
  });

  it('habits ticked and games played on either device all stay', () => {
    const b = { ...base(), dailyHabits: {}, gamesPlayedEver: ['memory'] };
    const a = { ...b, dailyHabits: { vitamin: true }, gamesPlayedEver: ['memory', 'puzzle'] };
    const c = { ...b, dailyHabits: { liam: true }, gamesPlayedEver: ['memory', 'sort'] };
    const m = mergeStates(b, a, c) as any;
    expect(m.dailyHabits).toEqual({ vitamin: true, liam: true });
    expect([...m.gamesPlayedEver].sort()).toEqual(['memory', 'puzzle', 'sort']);
  });

  it('a task ticked on both counts once even when one side also spent the reward (Astra CAS-04-R2)', () => {
    const b = { ...base(), hp: 100, totalTasksDone: 0, quests: [q('s_wake', false, { xp: 10 })] };
    const local = { ...b, hp: 110, totalTasksDone: 1, quests: [q('s_wake', true, { xp: 10 })] };
    const remote = { ...b, hp: 100, totalTasksDone: 1, quests: [q('s_wake', true, { xp: 10 })] }; // +10 task, -10 spent
    const m = mergeStates(b, local, remote) as any;
    expect(m.hp).toBe(100);
    expect(m.totalTasksDone).toBe(1);
  });

  it('a trip moved on one device (new evening start) is not undone by the other device (verifier R2-6)', () => {
    const away = (returnAt: string) => ({ state: 'away', biome: 'morgenwald', tripId: 't03', returnAt });
    const b = { ...base(), expedition: away('2026-09-28T16:30:00.000Z') };
    const phone = { ...b, expedition: away('2026-09-28T15:00:00.000Z') };
    const tablet = { ...b, totalTasksDone: 11 };
    expect((mergeStates(b, tablet, phone) as any).expedition.returnAt).toBe('2026-09-28T15:00:00.000Z');
    expect((mergeStates(b, phone, tablet) as any).expedition.returnAt).toBe('2026-09-28T15:00:00.000Z');
  });

  it('garden purchases on both devices all stay, with both costs paid (Astra CAS-07-R2)', () => {
    const g = (plants: string[]) => ({ plants: plants.map(id => ({ id, species: 'oak', plantedAt: '2026-09-28', position: { x: 1, y: 1 } })), decor: [], ownedDecor: ['stone'], lastWeeklyPlanting: null });
    const b = { ...base(), hp: 100, garden: g([]) };
    const a = { ...b, hp: 90, garden: g(['p1']) };
    const c = { ...b, hp: 80, garden: g(['p2']) };
    const m = mergeStates(b, a, c) as any;
    expect(m.garden.plants.map((p: any) => p.id).sort()).toEqual(['p1', 'p2']);
    expect(m.hp).toBe(70);
  });

  it('is a no-op when nothing differs', () => {
    const b = base();
    expect(jsonEqual(mergeStates(b, b, b), b)).toBe(true);
  });
});
