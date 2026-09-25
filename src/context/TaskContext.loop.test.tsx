// @vitest-environment jsdom
/**
 * Finch pass loop engine (26 Sep 2026): trips, treasures, growth, routine,
 * day transition, mood guardrails and telemetry, against the real
 * TaskProvider with a mocked storage layer and a fake clock.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import louisSave from '../test/fixtures/save-louis-like.json';
import { stageOf } from '../loop/growth';
import { TRIPS } from '../data/trips';

let saved: any;
let lastSaved: any;
vi.mock('../utils/storage', () => ({
  default: {
    load: vi.fn(async () => saved),
    save: vi.fn(async (v: any) => { lastSaved = v; }),
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

import { TaskProvider, useTask, EXPEDITION_LOG_CAP } from './TaskContext';
import useTripClock from '../hooks/useTripClock';
import { track, setAnalyticsConsent } from '../lib/analytics';

const trackMock = track as unknown as ReturnType<typeof vi.fn>;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const dayOf = (d: Date) => d.toISOString().slice(0, 10);

async function settle() {
  for (let i = 0; i < 6; i++) {
    await act(async () => { await Promise.resolve(); });
  }
}

/** Mounts a TaskProvider on a save; `withClock` also mounts useTripClock (as AppContent will). */
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

/** Louis's save, dated to the day of the fake clock (no day transition at load). */
function louisToday(extra: Record<string, unknown> = {}): any {
  return { ...clone(louisSave), lastDate: dayOf(new Date()), ...extra };
}

function eventsNamed(name: string) {
  return trackMock.mock.calls.filter(c => c[0] === name);
}

const at = (iso: string) => vi.setSystemTime(new Date(iso));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
  trackMock.mockClear();
  (setAnalyticsConsent as any).mockClear();
  lastSaved = undefined;
});
afterEach(() => {
  vi.useRealTimers();
});

describe('departTrip', () => {
  it('a day trip leaves from home with trip 1 and comes back at the family evening start', async () => {
    at('2026-09-28T07:10:00'); // Monday
    const save = louisToday();
    save.familyConfig.eveningStart = '17:30';
    const h = await mount(save);
    await act(async () => { h.actions.departTrip('day'); });
    const e = h.state.expedition;
    expect(e.state).toBe('away');
    expect(e.kind).toBe('day');
    expect(e.tripId).toBe('t01');
    const back = new Date(e.returnAt);
    expect([back.getDate(), back.getHours(), back.getMinutes()]).toEqual([28, 17, 30]);
    expect(e.pendingMemento).toMatchObject({
      emoji: TRIPS[0].emoji, name: TRIPS[0].treasure, location: TRIPS[0].place,
      quote: TRIPS[0].story, tripId: 't01', biome: 'morgenwald',
    });
    expect(h.state.lastTripDate).toBe(dayOf(new Date()));
    expect(eventsNamed('expedition.start')).toEqual([['expedition.start', { biome: 'morgenwald', kind: 'day' }]]);
  });

  it('a dream trip after the evening fire is home at 05:00 the next morning', async () => {
    at('2026-09-28T19:45:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('night'); });
    const back = new Date(h.state.expedition.returnAt);
    expect([back.getDate(), back.getHours(), back.getMinutes()]).toEqual([29, 5, 0]);
    expect(h.state.expedition.kind).toBe('night');
    expect(eventsNamed('expedition.start')[0][1]).toEqual({ biome: 'morgenwald', kind: 'night' });
  });

  it('only leaves from home, and only once a day', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('day'); });
    const first = h.state.expedition;
    await act(async () => { h.actions.departTrip('day'); h.actions.departTrip('night'); });
    expect(h.state.expedition).toBe(first); // away: no-op
    at('2026-09-28T17:01:00');
    await act(async () => { h.actions.arriveTrip(); });
    await act(async () => { h.actions.departTrip('night'); });
    expect(h.state.expedition.state).toBe('waiting'); // waiting: no-op
    await act(async () => { h.actions.receiveTreasure(); });
    at('2026-09-28T19:30:00');
    await act(async () => { h.actions.departTrip('night'); });
    expect(h.state.expedition.state).toBe('home'); // one trip per day
    expect(eventsNamed('expedition.start')).toHaveLength(1);
    // Next day it works again.
    at('2026-09-29T07:10:00');
    await act(async () => { h.actions.checkNewDay(); });
    await act(async () => { h.actions.departTrip('day'); });
    expect(h.state.expedition.state).toBe('away');
    expect(h.state.expedition.tripId).toBe('t02');
  });

  it('ignores an unknown kind', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('weekend' as any); });
    expect(h.state.expedition.state).toBe('home');
    expect(h.state.lastTripDate).toBeNull();
  });
});

describe('arriveTrip', () => {
  it('does nothing before returnAt', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('day'); });
    at('2026-09-28T16:59:00');
    await act(async () => { h.actions.arriveTrip(); });
    expect(h.state.expedition.state).toBe('away');
    expect(eventsNamed('expedition.return')).toHaveLength(0);
  });

  it('brings Ronki home with no Expedition screen mounted, from the trip clock alone', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday(), { withClock: true });
    await act(async () => { h.actions.departTrip('day'); });
    expect(h.state.expedition.state).toBe('away');
    at('2026-09-28T17:00:10');
    await act(async () => { vi.advanceTimersByTime(30_000); });
    await settle();
    expect(h.state.expedition.state).toBe('waiting');
    expect(h.state.expedition.pendingMemento.tripId).toBe('t01');
    expect(eventsNamed('expedition.return')).toEqual([['expedition.return', { biome: 'morgenwald' }]]);
  });

  it('an old mid-trip save comes home on load once its old returnAt passed', async () => {
    at('2026-09-25T15:00:00');
    const mid = clone(louisSave) as any;
    mid.expedition = {
      state: 'away', biome: 'morgenwald', departedAt: '2026-09-25T06:30:00.000Z', returnAt: '2026-09-25T10:30:00.000Z',
      pendingMemento: { id: 'old', emoji: '🍄', name: 'Roter Pilz', biome: 'morgenwald', location: 'Im Tannenkreis', quote: 'Hübsch.', ts: '2026-09-25T06:30:00.000Z' },
    };
    const h = await mount(mid, { withClock: true });
    expect(h.state.expedition.state).toBe('waiting');
    await act(async () => { h.actions.receiveTreasure(); });
    // An old random memento counts as an adventure but uses up no story.
    expect(h.state.adventureCount).toBe(6);
    expect(h.state.tripCursor).toBe(0);
    expect(h.state.treasuresFound).toEqual([]);
    expect(h.state.expeditionLog).toHaveLength(6);
  });
});

describe('receiveTreasure', () => {
  it('twice counts once', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('day'); });
    at('2026-09-28T17:05:00');
    await act(async () => { h.actions.arriveTrip(); });
    await act(async () => { h.actions.receiveTreasure(); h.actions.receiveTreasure(); });
    await act(async () => { h.actions.receiveTreasure(); });
    expect(h.state.expedition).toEqual({ state: 'home', biome: 'morgenwald' });
    expect(h.state.adventureCount).toBe(6);
    expect(h.state.tripCursor).toBe(1);
    expect(h.state.treasuresFound).toEqual(['t01']);
    expect(h.state.expeditionLog).toHaveLength(6);
    expect(h.state.expeditionLog[5].tripId).toBe('t01');
    expect(eventsNamed('memento.received')).toHaveLength(1);
  });

  it('does nothing while Ronki is home or away', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.receiveTreasure(); });
    expect(h.state.adventureCount).toBe(5);
    await act(async () => { h.actions.departTrip('day'); });
    await act(async () => { h.actions.receiveTreasure(); });
    expect(h.state.expedition.state).toBe('away');
    expect(h.state.adventureCount).toBe(5);
  });

  it('walks all 14 trips, wraps to trip 1, and a repeat adds no new treasure; growth is one stage at most per treasure', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    let day = new Date('2026-09-28T07:10:00');
    const stages: number[] = [stageOf(h.state.catEvo)];
    const evos: number[] = [h.state.catEvo];
    for (let i = 0; i < 16; i++) {
      vi.setSystemTime(day);
      await act(async () => { h.actions.checkNewDay(); });
      await act(async () => { h.actions.departTrip('day'); });
      expect(h.state.expedition.tripId).toBe(TRIPS[i % 14].id);
      vi.setSystemTime(new Date(day.getTime() + 11 * 3600 * 1000)); // 18:10
      await act(async () => { h.actions.arriveTrip(); });
      await act(async () => { h.actions.receiveTreasure(); });
      stages.push(stageOf(h.state.catEvo));
      evos.push(h.state.catEvo);
      day = new Date(day.getTime() + 24 * 3600 * 1000);
    }
    expect(h.state.tripCursor).toBe(16);
    expect(h.state.treasuresFound).toEqual(TRIPS.map(t => t.id));
    expect(h.state.adventureCount).toBe(5 + 16);
    expect(h.state.expeditionLog).toHaveLength(5 + 16);
    for (let i = 1; i < evos.length; i++) {
      expect(evos[i]).toBeGreaterThanOrEqual(evos[i - 1]);
      expect(stages[i] - stages[i - 1]).toBeLessThanOrEqual(1);
    }
    // Louis (catEvo 3, 5 old treasures) reaches Jungtier on his first new treasure.
    expect(stages[1]).toBe(2);
    const evolves = eventsNamed('ronki.evolve');
    expect(evolves.length).toBe(new Set(stages).size - 1);
    expect(evolves[0][1]).toMatchObject({ stage: 2 });
  });

  it('caps the shelf at 60', async () => {
    at('2026-09-28T07:10:00');
    const many = Array.from({ length: 60 }, (_, i) => ({ id: `m${i}`, emoji: '🍁', name: 'Blatt', biome: 'morgenwald', location: 'Weg', quote: 'Schön.', ts: '2026-01-01T00:00:00.000Z' }));
    const h = await mount(louisToday({ expeditionLog: many, adventureCount: 60 }));
    await act(async () => { h.actions.departTrip('day'); });
    at('2026-09-28T17:10:00');
    await act(async () => { h.actions.arriveTrip(); });
    await act(async () => { h.actions.receiveTreasure(); });
    expect(EXPEDITION_LOG_CAP).toBe(60);
    expect(h.state.expeditionLog).toHaveLength(60);
    expect(h.state.expeditionLog[59].tripId).toBe('t01');
    expect(h.state.adventureCount).toBe(61);
  });

  it('the old receiveMemento path counts the adventure the same way', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('day'); });
    at('2026-09-28T17:10:00');
    await act(async () => { h.actions.arriveTrip(); });
    await act(async () => { h.actions.receiveMemento(); });
    expect(h.state.adventureCount).toBe(6);
    expect(h.state.treasuresFound).toEqual(['t01']);
    expect(eventsNamed('memento.received')).toHaveLength(1);
  });
});

describe('a seeded random day sequence never takes anything away', () => {
  it('keeps adventureCount, catEvo, expeditionLog and treasuresFound non-decreasing', async () => {
    // mulberry32, fixed seed: the same sequence on every run.
    let seed = 20260926;
    const rand = () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let clock = new Date('2026-09-28T07:10:00').getTime();
    vi.setSystemTime(clock);
    let h = await mount(louisToday());
    const snap = () => ({
      adv: h.state.adventureCount,
      evo: h.state.catEvo,
      log: h.state.expeditionLog.length,
      found: h.state.treasuresFound.length,
    });
    let prev = snap();
    for (let step = 0; step < 120; step++) {
      const r = rand();
      if (r < 0.3) {
        const open = h.state.quests.filter((q: any) => !q.done);
        if (open.length) {
          const q = open[Math.floor(rand() * open.length)];
          await act(async () => { h.actions.complete(q.id); });
        }
      } else if (r < 0.45) {
        await act(async () => { h.actions.departTrip(rand() < 0.5 ? 'day' : 'night'); });
      } else if (r < 0.6) {
        clock += Math.floor(rand() * 12) * 3600 * 1000;
        vi.setSystemTime(clock);
        await act(async () => { h.actions.arriveTrip(); });
      } else if (r < 0.75) {
        await act(async () => { h.actions.receiveTreasure(); });
      } else if (r < 0.9) {
        clock += 24 * 3600 * 1000;
        vi.setSystemTime(clock);
        await act(async () => { h.actions.checkNewDay(); });
      } else {
        await act(async () => { vi.advanceTimersByTime(500); });
        await settle();
        const snapshot = clone(lastSaved);
        h.unmount();
        h = await mount(snapshot);
      }
      const now = snap();
      expect(now.adv).toBeGreaterThanOrEqual(prev.adv);
      expect(now.evo).toBeGreaterThanOrEqual(prev.evo);
      expect(now.log).toBeGreaterThanOrEqual(prev.log);
      expect(now.found).toBeGreaterThanOrEqual(prev.found);
      expect(now.adv).toBe(now.log); // every opened treasure is on the shelf
      prev = now;
    }
    expect(prev.adv).toBeGreaterThan(5); // the sequence really played trips
  });
});

describe('setRoutine and setEveningStart', () => {
  it('rebuilds today\'s quests for the new routine and keeps the done flags', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.complete('s_wash'); });
    const sidesBefore = h.state.quests.filter((q: any) => q.sideQuest).map((q: any) => q.id);
    await act(async () => { h.actions.setRoutine({ morning: ['wake', 'wash', 'teeth_am'], evening: ['pyjama'] }); });
    const s = h.state;
    expect(s.familyConfig.routine).toEqual({ morning: ['wake', 'wash', 'teeth_am'], evening: ['pyjama'] });
    const morning = s.quests.filter((q: any) => !q.sideQuest && q.anchor === 'morning');
    expect(morning.map((q: any) => q.id)).toEqual(['s_wake', 's_wash', 's_teeth_am']);
    // Louis's save had s_wake done; s_wash was just done.
    expect(morning.map((q: any) => q.done)).toEqual([true, true, false]);
    expect(s.quests.filter((q: any) => !q.sideQuest && q.anchor === 'bedtime').map((q: any) => q.id)).toEqual(['s_pyjama']);
    expect(s.quests.find((q: any) => q.id === 's_move')).toBeDefined();
    expect(s.quests.filter((q: any) => q.sideQuest).map((q: any) => q.id)).toEqual(sidesBefore);
    // Unknown kinds are dropped.
    await act(async () => { h.actions.setRoutine({ morning: ['wake', 'fly'], evening: [] } as any); });
    expect(h.state.familyConfig.routine).toEqual({ morning: ['wake'], evening: [] });
  });

  it('writes only a known evening start', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.setEveningStart('18:30'); });
    expect(h.state.familyConfig.eveningStart).toBe('18:30');
    await act(async () => { h.actions.setEveningStart('23:00' as any); });
    expect(h.state.familyConfig.eveningStart).toBe('18:30');
    expect(h.state.familyConfig.childName).toBe('Louis');
  });
});

describe('small loop actions', () => {
  it('markStageSeen never goes down, markGreeted stamps today, completeTonight the time, setExtras the toggle', async () => {
    at('2026-09-28T19:40:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.markStageSeen(3); });
    await act(async () => { h.actions.markStageSeen(2); h.actions.markStageSeen(NaN); });
    expect(h.state.stageSeen).toBe(3);
    await act(async () => { h.actions.markGreeted(); });
    expect(h.state.greetedDate).toBe(dayOf(new Date()));
    await act(async () => { h.actions.completeTonight(); });
    expect(h.state.eveningRitualCompletedAt).toBe(new Date('2026-09-28T19:40:00').toISOString());
    await act(async () => { h.actions.setExtras(true); });
    expect(h.state.extrasEnabled).toBe(true);
    await act(async () => { h.actions.setExtras(false); });
    expect(h.state.extrasEnabled).toBe(false);
  });

  it('the hatch look counts as seen, so no GrowthBeat for the baby stage', async () => {
    at('2026-09-28T07:10:00');
    const fresh = { ...clone(louisSave), onboardingDone: false, catEvo: 0, expeditionLog: [], lastDate: dayOf(new Date()) };
    const h = await mount(fresh);
    expect(h.state.stageSeen).toBe(0);
    await act(async () => { h.actions.completeOnboarding({ companionVariant: 'sunset' }); });
    expect(h.state.catEvo).toBe(3);
    expect(h.state.stageSeen).toBe(1);
  });
});

describe('day transition', () => {
  it('checkNewDay sets lastGapDays after a 5-day gap and rebuilds the day', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.checkNewDay(); });
    expect(h.state.lastGapDays).toBe(0); // same day: no-op
    at('2026-10-03T08:00:00'); // Saturday, 5 days later
    await act(async () => { h.actions.checkNewDay(); });
    expect(h.state.lastDate).toBe(dayOf(new Date()));
    expect(h.state.lastGapDays).toBe(5);
    // Weekend default routine: no school bag.
    expect(h.state.quests.filter((q: any) => !q.sideQuest && q.anchor === 'morning').map((q: any) => q.id))
      .toEqual(['s_wake', 's_breakfast', 's_teeth_am', 's_dress']);
    expect(h.state.catEvo).toBe(3);
  });

  it('a waiting treasure never expires across days', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('day'); });
    for (let d = 1; d <= 5; d++) {
      at(`2026-10-0${d}T09:00:00`);
      await act(async () => { h.actions.checkNewDay(); h.actions.arriveTrip(); });
    }
    expect(h.state.expedition.state).toBe('waiting');
    expect(h.state.expedition.pendingMemento.tripId).toBe('t01');
  });
});

describe('Ronki\'s mood no longer follows tasks (spec R10)', () => {
  it('no magisch from a streak, no gut when all main quests are done', async () => {
    at('2026-09-28T07:10:00');
    const save = louisToday({ sm: { s_wake: 7, s_teeth_pm: 14 } });
    const h = await mount(save);
    const main = h.state.quests.filter((q: any) => !q.sideQuest && !q.done);
    for (const q of main) {
      await act(async () => { h.actions.complete(q.id); });
    }
    await act(async () => { h.actions.syncRonkiMood(); });
    expect(h.state.ronkiMood).toBe('normal');
  });

  it('no besorgt after days away, and a stored besorgt goes back to normal', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount({ ...clone(louisSave), lastDate: '2026-09-20' });
    await act(async () => { h.actions.syncRonkiMood(); });
    expect(h.state.ronkiMood).toBe('normal');
    await act(async () => { h.actions.patchState({ ronkiMood: 'besorgt', ronkiMoodSetDate: dayOf(new Date()) }); });
    await act(async () => { h.actions.syncRonkiMood(); });
    expect(h.state.ronkiMood).toBe('normal');
  });

  it('the scheduled bad day stays off behind its switch', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday({ ronkiNextBadDayDate: '2026-09-01' }));
    await act(async () => { h.actions.syncRonkiMood(); });
    expect(h.state.ronkiMood).toBe('normal');
  });

  it('the victory takeover is not queued when every main quest is done', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    for (const q of h.state.quests.filter((q: any) => !q.sideQuest && !q.done)) {
      await act(async () => { h.actions.complete(q.id); });
    }
    expect(h.ref.api.celebration?.type).not.toBe('victory');
  });
});

describe('telemetry from complete()', () => {
  it('fires quest.complete with block and kind, and first.task.complete once', async () => {
    at('2026-09-28T07:10:00');
    const fresh = louisToday({ totalTasksDone: 0 });
    fresh.quests = fresh.quests.map((q: any) => ({ ...q, done: false, completions: 0 }));
    const h = await mount(fresh);
    await act(async () => { h.actions.complete('s_teeth_am'); });
    expect(eventsNamed('quest.complete')).toEqual([
      ['quest.complete', { questId: 's_teeth_am', anchor: 'morning', block: 'morning', kind: 'teeth_am' }],
    ]);
    expect(eventsNamed('first.task.complete')).toEqual([
      ['first.task.complete', { block: 'morning', kind: 'teeth_am' }],
    ]);
    await act(async () => { h.actions.complete('sq3'); });
    expect(eventsNamed('quest.complete')[1][1]).toMatchObject({ questId: 'sq3', kind: 'side' });
    expect(eventsNamed('first.task.complete')).toHaveLength(1);
    // A done quest counts nothing a second time.
    const total = h.state.totalTasksDone;
    await act(async () => { h.actions.complete('s_teeth_am'); });
    expect(h.state.totalTasksDone).toBe(total);
    expect(eventsNamed('quest.complete')).toHaveLength(2);
  });

  it('settles analytics consent from the parent step', async () => {
    at('2026-09-28T07:10:00');
    await mount(louisToday({ analyticsEnabled: true }));
    expect(setAnalyticsConsent).toHaveBeenLastCalledWith(true);
    (setAnalyticsConsent as any).mockClear();
    await mount({ ...louisToday(), parentOnboardingDone: false, onboardingDone: false, analyticsEnabled: false });
    expect(setAnalyticsConsent).not.toHaveBeenCalled();
  });
});
