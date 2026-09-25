// @vitest-environment jsdom
/**
 * Fix round 1 (Group S, 26 Sep 2026): state and time fixes in TaskContext,
 * against the real TaskProvider with a mocked storage layer and a fake
 * clock. Each block names the finding it pins.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import louisSave from '../test/fixtures/save-louis-like.json';

let saved: any;
vi.mock('../utils/storage', () => ({
  default: {
    load: vi.fn(async () => saved),
    save: vi.fn(async () => {}),
    syncLoad: vi.fn(async () => saved),
    syncLoadByToken: vi.fn(async () => saved),
    cloudSave: vi.fn(async () => {}),
    cloudSaveByToken: vi.fn(async () => {}),
  },
}));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../lib/profileToken', () => ({
  getActiveToken: () => null,
  ensureTokenForExistingProfile: vi.fn(),
}));
vi.mock('../lib/analytics', () => ({ track: vi.fn(), setAnalyticsConsent: vi.fn() }));

import { TaskProvider, useTask, tripAllowed } from './TaskContext';
import useTripClock from '../hooks/useTripClock';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const dayOf = (d: Date) => d.toISOString().slice(0, 10);
const at = (iso: string) => vi.setSystemTime(new Date(iso));

async function settle() {
  for (let i = 0; i < 6; i++) {
    await act(async () => { await Promise.resolve(); });
  }
}

async function mount(save: unknown, opts: { withClock?: boolean } = {}) {
  saved = save === undefined ? undefined : clone(save);
  const ref: { api: any } = { api: null };
  function Grab() { ref.api = useTask(); return null; }
  function Clock() { useTripClock(); return null; }
  const utils = render(<TaskProvider><Grab />{opts.withClock ? <Clock /> : null}</TaskProvider>);
  await settle();
  return {
    ref,
    get state() { return ref.api.state; },
    get actions() { return ref.api.actions; },
    ...utils,
  };
}

function louisToday(extra: Record<string, unknown> = {}): any {
  return { ...clone(louisSave), lastDate: dayOf(new Date()), ...extra };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('FC-02: the shelf keeps old keepsakes', () => {
  it('a legacy memento survives past 60 treasures', async () => {
    at('2026-09-28T07:10:00');
    const many = Array.from({ length: 80 }, (_, i) => ({ id: `m${i}`, emoji: '🍁', name: 'Blatt', biome: 'morgenwald', location: 'Weg', quote: 'Schön.', ts: '2026-01-01T00:00:00.000Z' }));
    const h = await mount(louisToday({ expeditionLog: many, adventureCount: 80 }));
    await act(async () => { h.actions.departTrip('day'); });
    at('2026-09-28T17:10:00');
    await act(async () => { h.actions.arriveTrip(); });
    await act(async () => { h.actions.receiveTreasure(); });
    expect(h.state.expeditionLog).toHaveLength(81);
    expect(h.state.expeditionLog[0].id).toBe('m0');
  });
});

describe('FC-03: legacy missions no longer grow Ronki', () => {
  it('a mission finished at the day transition keeps its record but moves no catEvo', async () => {
    at('2026-09-28T07:10:00');
    const save = louisToday({
      catEvo: 8,
      activeMissions: [{ id: 'em1', progress: 13 }],
      completedMissions: [],
    });
    // Yesterday's morning was complete.
    save.quests = save.quests.map((q: any) => (q.anchor === 'morning' ? { ...q, done: true } : q));
    const h = await mount(save);
    const hpBefore = h.state.hp;
    at('2026-09-29T07:10:00');
    await act(async () => { h.actions.checkNewDay(); });
    expect(h.state.completedMissions).toContain('em1');
    expect(h.state.hp).toBeGreaterThan(hpBefore);
    expect(h.state.catEvo).toBe(8);
  });

  it('an old save rolled over at load moves no catEvo either', async () => {
    at('2026-09-29T07:10:00');
    const save = { ...clone(louisSave), lastDate: '2026-09-28', catEvo: 8, activeMissions: [{ id: 'em1', progress: 13 }], completedMissions: [] } as any;
    save.quests = save.quests.map((q: any) => (q.anchor === 'morning' ? { ...q, done: true } : q));
    const h = await mount(save);
    expect(h.state.completedMissions).toContain('em1');
    expect(h.state.catEvo).toBe(8);
  });
});

describe('FC-04 / GUARDRAILS-1: retired moods expire on load and on a new day', () => {
  it('yesterday\'s tired Ronki loads as normal without any syncRonkiMood call', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday({ ronkiMood: 'tired', ronkiMoodSetDate: '2026-09-27' }));
    expect(h.state.ronkiMood).toBe('normal');
    expect(h.state.ronkiMoodSetDate).toBeUndefined();
  });

  it('a sad Ronki from five days ago, loaded with a day transition, is normal', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount({ ...clone(louisSave), lastDate: '2026-09-23', ronkiMood: 'sad', ronkiMoodSetDate: '2026-09-23' });
    expect(h.state.ronkiMood).toBe('normal');
  });

  it('a mood set today stays, and a tab left open over midnight clears it', async () => {
    at('2026-09-28T19:10:00');
    const h = await mount(louisToday({ ronkiMood: 'magisch', ronkiMoodSetDate: dayOf(new Date()) }));
    expect(h.state.ronkiMood).toBe('magisch');
    at('2026-09-29T07:10:00');
    await act(async () => { h.actions.checkNewDay(); });
    expect(h.state.ronkiMood).toBe('normal');
  });
});

describe('FC-08 / LOOP-4: a dream trip belongs to its evening; never two trips within 8 hours', () => {
  it('a dream trip after midnight is stamped with the evening it started in', async () => {
    at('2026-09-29T02:30:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('night'); });
    expect(h.state.expedition.state).toBe('away');
    expect(h.state.lastTripDate).toBe(dayOf(new Date('2026-09-28T17:00:00')));
    // It counts from the start of its evening, so the next morning's trip is not blocked.
    expect(h.state.lastTripAt).toBe(new Date('2026-09-28T17:00:00').toISOString());
  });

  it('a late dream trip (23:30) does not block the next morning trip', async () => {
    at('2026-09-29T07:10:00');
    const h = await mount(louisToday({
      // What departTrip('night') at 23:30 on the 28th writes.
      lastTripDate: dayOf(new Date('2026-09-28T17:00:00')),
      lastTripAt: new Date('2026-09-28T17:00:00').toISOString(),
    }));
    await act(async () => { h.actions.departTrip('day'); });
    expect(h.state.expedition.state).toBe('away');
    expect(h.state.expedition.kind).toBe('day');
  });

  it('a new day key alone does not allow a second trip within 8 hours', async () => {
    at('2026-09-28T19:30:00');
    const h = await mount(louisToday({
      lastTripDate: '2026-09-27',
      lastTripAt: new Date('2026-09-28T16:30:00').toISOString(),
    }));
    await act(async () => { h.actions.departTrip('night'); });
    expect(h.state.expedition.state).toBe('home');
    at('2026-09-29T00:31:00');
    await act(async () => { h.actions.departTrip('night'); });
    expect(h.state.expedition.state).toBe('away');
  });

  it('a normal day after a dream trip still sends Ronki out in the morning', async () => {
    at('2026-09-28T19:30:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('night'); });
    at('2026-09-29T05:01:00');
    await act(async () => { h.actions.arriveTrip(); });
    await act(async () => { h.actions.receiveTreasure(); });
    at('2026-09-29T07:40:00');
    await act(async () => { h.actions.checkNewDay(); });
    await act(async () => { h.actions.departTrip('day'); });
    expect(h.state.expedition.state).toBe('away');
    expect(h.state.expedition.kind).toBe('day');
  });
});

describe('tripAllowed: the one-trip rules for surfaces', () => {
  it('matches departTrip: home only, one key per day, 8 hours apart', () => {
    const t = new Date('2026-09-29T07:10:00');
    const home = { expedition: { state: 'home' }, lastTripDate: null, lastTripAt: null };
    expect(tripAllowed(home, 'day', t)).toBe(true);
    expect(tripAllowed({ ...home, expedition: { state: 'away' } }, 'day', t)).toBe(false);
    expect(tripAllowed({ ...home, lastTripDate: dayOf(t) }, 'day', t)).toBe(false);
    expect(tripAllowed({ ...home, lastTripDate: '2026-09-28', lastTripAt: new Date('2026-09-29T02:30:00').toISOString() }, 'day', t)).toBe(false);
    expect(tripAllowed({ ...home, lastTripDate: '2026-09-28', lastTripAt: new Date('2026-09-28T19:30:00').toISOString() }, 'day', t)).toBe(true);
    expect(tripAllowed(home, 'weekend' as any, t)).toBe(false);
    expect(tripAllowed(null, 'day', t)).toBe(false);
  });
});

describe('LOOP-5: the day only moves forward', () => {
  it('a clock set back never rebuilds the day', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.complete('s_wash'); });
    at('2026-09-27T07:10:00');
    await act(async () => { h.actions.checkNewDay(); });
    expect(h.state.lastDate).toBe(dayOf(new Date('2026-09-28T07:10:00')));
    expect(h.state.quests.find((q: any) => q.id === 's_wash').done).toBe(true);
  });

  it('a save from a clock that ran ahead loads without a transition', async () => {
    at('2026-09-28T07:10:00');
    const save = louisToday({ lastDate: '2026-10-05' });
    save.quests = save.quests.map((q: any) => (q.id === 's_wash' ? { ...q, done: true } : q));
    const h = await mount(save);
    expect(h.state.lastDate).toBe('2026-10-05');
    expect(h.state.quests.find((q: any) => q.id === 's_wash').done).toBe(true);
  });

  it('a trip whose returnAt is more than a day ahead comes home', async () => {
    at('2026-09-28T09:00:00');
    const h = await mount(louisToday({
      lastTripDate: '2026-09-28',
      expedition: {
        state: 'away', biome: 'morgenwald', kind: 'day', tripId: 't01',
        departedAt: new Date('2026-09-28T08:00:00').toISOString(),
        returnAt: new Date('2026-10-02T17:00:00').toISOString(),
        pendingMemento: { id: 'x', ts: '2026-09-28T06:00:00.000Z', emoji: '🍁', name: 'Blatt', biome: 'morgenwald', location: 'Weg', quote: 'Schön.', tripId: 't01' },
      },
    }));
    await act(async () => { h.actions.arriveTrip(); });
    expect(h.state.expedition.state).toBe('waiting');
  });
});

describe('FC-09: a new evening start moves an active day trip', () => {
  it('the day trip comes home at the new time, at once when it already passed', async () => {
    at('2026-09-28T07:10:00');
    const save = louisToday();
    save.familyConfig.eveningStart = '18:30';
    const h = await mount(save, { withClock: true });
    await act(async () => { h.actions.departTrip('day'); });
    expect(new Date(h.state.expedition.returnAt).getHours()).toBe(18);
    at('2026-09-28T17:10:00');
    await act(async () => { h.actions.setEveningStart('17:00'); });
    await settle();
    expect(h.state.expedition.state).toBe('waiting');
    expect(new Date(h.state.expedition.returnAt).getHours()).toBe(17);
    expect(new Date(h.state.expedition.returnAt).getMinutes()).toBe(0);
  });

  it('an earlier start that has not passed yet moves the return time only', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.setEveningStart('18:30'); });
    await act(async () => { h.actions.departTrip('day'); });
    await act(async () => { h.actions.setEveningStart('17:30'); });
    const back = new Date(h.state.expedition.returnAt);
    expect(h.state.expedition.state).toBe('away');
    expect([back.getHours(), back.getMinutes()]).toEqual([17, 30]);
  });

  it('a dream trip and a waiting treasure keep their times', async () => {
    at('2026-09-28T19:30:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('night'); });
    const back = h.state.expedition.returnAt;
    await act(async () => { h.actions.setEveningStart('18:00'); });
    expect(h.state.expedition.returnAt).toBe(back);
  });
});

describe('LOOP-6 / KIDUX-6: the Ferien switch waits for the next day', () => {
  it('turning Ferien on and then changing the routine keeps today\'s done tasks', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.complete('s_wash'); });
    await act(async () => { h.actions.patchState({ vacMode: true }); });
    await act(async () => { h.actions.setRoutine({ morning: ['wake', 'wash', 'teeth_am'], evening: ['pyjama'] }); });
    const morning = h.state.quests.filter((q: any) => !q.sideQuest && q.anchor === 'morning');
    expect(morning.map((q: any) => q.id)).toEqual(['s_wake', 's_wash', 's_teeth_am']);
    expect(morning.map((q: any) => q.done)).toEqual([true, true, false]);
    // The next day builds the holiday list.
    at('2026-09-29T07:10:00');
    await act(async () => { h.actions.checkNewDay(); });
    expect(h.state.quests.filter((q: any) => !q.sideQuest)[0].id.startsWith('v_')).toBe(true);
  });

  it('turning Ferien off during the holidays keeps today\'s holiday list and its flames', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday({ vacMode: true }));
    at('2026-09-29T07:10:00');
    await act(async () => { h.actions.checkNewDay(); });
    await act(async () => { h.actions.complete('v_wake'); });
    await act(async () => { h.actions.patchState({ vacMode: false }); });
    await act(async () => { h.actions.setRoutine({ morning: ['wake', 'teeth_am'], evening: ['pyjama'] }); });
    const morning = h.state.quests.filter((q: any) => !q.sideQuest && q.anchor === 'morning');
    expect(morning.map((q: any) => q.id)).toEqual(['v_wake', 'v_teeth_am']);
    expect(morning[0].done).toBe(true);
  });
});

describe('LOOP-7: an old save with a trip today uses up today\'s trip', () => {
  it('backfills lastTripDate from an away trip that left today', async () => {
    at('2026-09-28T15:00:00');
    const departed = new Date('2026-09-28T07:30:00').toISOString();
    const save = louisToday({
      expedition: {
        state: 'away', biome: 'morgenwald', departedAt: departed,
        returnAt: new Date('2026-09-28T11:30:00').toISOString(),
        pendingMemento: { id: 'old', emoji: '🍄', name: 'Roter Pilz', biome: 'morgenwald', location: 'Im Tannenkreis', quote: 'Hübsch.', ts: departed },
      },
    });
    delete save.lastTripDate;
    const h = await mount(save);
    expect(h.state.lastTripDate).toBe(dayOf(new Date()));
    await act(async () => { h.actions.arriveTrip(); });
    await act(async () => { h.actions.receiveTreasure(); });
    at('2026-09-28T19:30:00');
    await act(async () => { h.actions.departTrip('night'); });
    expect(h.state.expedition.state).toBe('home');
  });

  it('backfills from a treasure opened today, and leaves older saves at null', async () => {
    at('2026-09-28T19:30:00');
    const save = louisToday();
    save.expeditionLog = [...save.expeditionLog, { id: 'today', emoji: '🍁', name: 'Blatt', biome: 'morgenwald', location: 'Weg', quote: 'Schön.', ts: new Date('2026-09-28T07:30:00').toISOString() }];
    const h = await mount(save);
    expect(h.state.lastTripDate).toBe(dayOf(new Date()));
    await act(async () => { h.actions.departTrip('night'); });
    expect(h.state.expedition.state).toBe('home');
    const older = await mount(louisToday());
    expect(older.state.lastTripDate).toBeNull();
  });
});

describe('KIDUX-11 / O1: no dream greeting right after meeting Ronki', () => {
  it('completeOnboarding marks today as greeted', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount({ ...louisToday(), onboardingDone: false, greetedDate: null });
    await act(async () => { h.actions.completeOnboarding({ companionVariant: 'forest' }); });
    expect(h.state.greetedDate).toBe(dayOf(new Date()));
  });
});
