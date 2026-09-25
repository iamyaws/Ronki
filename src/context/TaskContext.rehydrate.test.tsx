// @vitest-environment jsdom
/**
 * Finch pass (26 Sep 2026): old saves load with nothing lost, every new
 * loop field gets its default, catEvo never moves at load (spec R6), and
 * a save -> reload round trip keeps every new field.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import louisSave from '../test/fixtures/save-louis-like.json';
import cardSeed from '../test/fixtures/save-card-seed.json';
import midTripSave from '../test/fixtures/save-mid-trip.json';
import leavingSave from '../test/fixtures/save-leaving.json';
import type { LoopStateFields } from '../loop/types';

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

import { TaskProvider, useTask } from './TaskContext';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Every field of LoopStateFields (src/loop/types.ts). */
const LOOP_FIELDS: ReadonlyArray<keyof LoopStateFields> = [
  'adventureCount', 'lastTripDate', 'tripCursor', 'treasuresFound', 'stageSeen',
  'lastGapDays', 'greetedDate', 'extrasEnabled', 'eveningRitualCompletedAt', 'expedition',
];

async function settle() {
  for (let i = 0; i < 6; i++) {
    await act(async () => { await Promise.resolve(); });
  }
}

async function mount(save: unknown) {
  saved = save === undefined ? undefined : clone(save);
  const ref: { api: any } = { api: null };
  function Grab() { ref.api = useTask(); return null; }
  const utils = render(<TaskProvider><Grab /></TaskProvider>);
  await settle();
  return { ref, ...utils };
}

const mainIds = (quests: any[], anchor: string) =>
  quests.filter(q => !q.sideQuest && q.anchor === anchor).map(q => q.id);

describe('TaskContext rehydration of old saves (Finch pass)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    lastSaved = undefined;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a Louis-like save loads the same day with nothing lost and every new field defaulted', async () => {
    vi.setSystemTime(new Date('2026-09-25T15:00:00'));
    const { ref } = await mount(louisSave);
    const s = ref.api.state;
    // Nothing lost: every field of the save is there with its value. The two
    // one-time migration markers are read, not carried in live state (the
    // save merge keeps them in storage), as before the Finch pass.
    const { _v2_economy_reset, _v_companion_name_split, ...rest } = louisSave as any;
    expect(s).toMatchObject(rest);
    expect(s.catEvo).toBe(3);
    expect(s.companionName).toBe('Funki');
    expect(s.parentPin).toBe('4711');
    expect(s.journalHistory).toHaveLength(2);
    expect(s.onboardingDone).toBe(true);
    expect(s.expeditionLog).toHaveLength(5);
    // New fields.
    expect(s.adventureCount).toBe(5);
    expect(s.tripCursor).toBe(0);
    expect(s.treasuresFound).toEqual([]);
    expect(s.stageSeen).toBe(1); // stage of catEvo 3 (Baby)
    expect(s.lastTripDate).toBeNull();
    expect(s.lastGapDays).toBe(0);
    expect(s.greetedDate).toBeNull();
    expect(s.extrasEnabled).toBe(false);
    expect(s.eveningRitualCompletedAt).toBeUndefined();
    expect(s.expedition).toEqual({ state: 'home', biome: 'morgenwald' });
    // Today's quests are left as they were (the routine applies from the next day, R15).
    expect(mainIds(s.quests, 'morning')).toHaveLength(7);
  });

  it('after a 5-day gap: the day turns over, lastGapDays is 5, durable fields stay, catEvo does not move', async () => {
    vi.setSystemTime(new Date('2026-09-30T08:00:00')); // Wednesday
    const { ref } = await mount(louisSave);
    const s = ref.api.state;
    expect(s.lastDate).toBe('2026-09-30');
    expect(s.lastGapDays).toBe(5);
    expect(s.catEvo).toBe(3);
    expect(s.adventureCount).toBe(5);
    expect(s.expeditionLog).toHaveLength(5);
    expect(s.companionName).toBe('Funki');
    expect(s.parentPin).toBe('4711');
    expect(s.journalHistory).toHaveLength(2);
    expect(s.totalTasksDone).toBe(61);
    expect(s.taughtBreaths).toEqual({ flame: '2026-09-16', sparkle: '2026-09-22' });
    expect(s.familyConfig.childName).toBe('Louis');
    // No routine in the save: DEFAULT_ROUTINE from today on (R15).
    expect(mainIds(s.quests, 'morning')).toEqual(['s_wake', 's_breakfast', 's_teeth_am', 's_dress', 's_packcheck']);
    expect(mainIds(s.quests, 'bedtime')).toEqual(['s_teeth_pm', 's_wash_pm', 's_pyjama', 's_cuddle']);
    expect(s.quests.every((q: any) => !q.done)).toBe(true);
  });

  it('keeps a saved routine and evening start and builds the next day from them', async () => {
    vi.setSystemTime(new Date('2026-09-28T07:00:00')); // Monday
    const save = clone(louisSave) as any;
    save.familyConfig.routine = { morning: ['wake', 'teeth_am'], evening: ['pyjama'] };
    save.familyConfig.eveningStart = '18:00';
    const { ref } = await mount(save);
    const s = ref.api.state;
    expect(s.familyConfig.routine).toEqual({ morning: ['wake', 'teeth_am'], evening: ['pyjama'] });
    expect(s.familyConfig.eveningStart).toBe('18:00');
    expect(mainIds(s.quests, 'morning')).toEqual(['s_wake', 's_teeth_am']);
    expect(mainIds(s.quests, 'bedtime')).toEqual(['s_pyjama']);
  });

  it('a website card seed gets today\'s quests from the default routine and all new defaults', async () => {
    vi.setSystemTime(new Date('2026-09-28T07:00:00'));
    const { ref } = await mount(cardSeed);
    const s = ref.api.state;
    expect(s.parentOnboardingDone).toBe(true);
    expect(s.parentPin).toBe('2580');
    expect(s.familyConfig.childName).toBe('Mia');
    expect(s.onboardingDone).toBe(false);
    expect(mainIds(s.quests, 'morning')).toEqual(['s_wake', 's_breakfast', 's_teeth_am', 's_dress', 's_packcheck']);
    expect(s.adventureCount).toBe(0);
    expect(s.stageSeen).toBe(0);
    expect(s.tripCursor).toBe(0);
    expect(s.treasuresFound).toEqual([]);
    expect(s.extrasEnabled).toBe(false);
    expect(s.expedition).toEqual({ state: 'home', biome: 'morgenwald' });
  });

  it('a mid-trip away save keeps its trip exactly, including the old returnAt and memento', async () => {
    vi.setSystemTime(new Date('2026-09-25T09:00:00'));
    const { ref } = await mount(midTripSave);
    expect(ref.api.state.expedition).toEqual((midTripSave as any).expedition);
    expect(ref.api.state.adventureCount).toBe(5);
  });

  it('a legacy leaving save loads at home, and besorgt loads as normal', async () => {
    vi.setSystemTime(new Date('2026-09-25T09:00:00'));
    const { ref } = await mount(leavingSave);
    expect(ref.api.state.expedition).toEqual({ state: 'home', biome: 'morgenwald' });
    expect(ref.api.state.ronkiMood).toBe('normal');
    expect(ref.api.state.ronkiMoodSetDate).toBeUndefined();
  });

  it('keeps saved loop fields as they are and cleans odd values', async () => {
    vi.setSystemTime(new Date('2026-09-25T09:00:00'));
    const save = {
      ...clone(louisSave),
      adventureCount: 9, tripCursor: 9, treasuresFound: ['t01', 42, 't02'], stageSeen: 2,
      lastTripDate: '2026-09-24', greetedDate: '2026-09-24', extrasEnabled: true, lastGapDays: 1,
    };
    const { ref } = await mount(save);
    const s = ref.api.state;
    expect(s.adventureCount).toBe(9);
    expect(s.tripCursor).toBe(9);
    expect(s.treasuresFound).toEqual(['t01', 't02']);
    expect(s.stageSeen).toBe(2);
    expect(s.lastTripDate).toBe('2026-09-24');
    expect(s.greetedDate).toBe('2026-09-24');
    expect(s.extrasEnabled).toBe(true);
    expect(s.lastGapDays).toBe(1);

    const odd = { ...clone(louisSave), adventureCount: -3, tripCursor: 'x', stageSeen: NaN, extrasEnabled: 'yes' };
    const second = await mount(odd);
    expect(second.ref.api.state.adventureCount).toBe(5);
    expect(second.ref.api.state.tripCursor).toBe(0);
    expect(second.ref.api.state.stageSeen).toBe(1);
    expect(second.ref.api.state.extrasEnabled).toBe(false);
  });

  it('a save -> reload round trip keeps every LoopStateFields field', async () => {
    vi.setSystemTime(new Date('2026-09-28T07:10:00')); // Monday morning
    const first = await mount(louisSave);
    const a = () => first.ref.api.actions;
    await act(async () => { a().departTrip('day'); });
    vi.setSystemTime(new Date('2026-09-28T17:05:00'));
    await act(async () => { a().arriveTrip(); });
    await act(async () => { a().receiveTreasure(); });
    await act(async () => {
      a().markStageSeen(2);
      a().markGreeted();
      a().completeTonight();
      a().setExtras(true);
      a().setRoutine({ morning: ['wake', 'dress'], evening: ['pyjama', 'cuddle'] });
      a().setEveningStart('17:30');
    });
    // A second trip that is still out, so the expedition fields are non-trivial.
    vi.setSystemTime(new Date('2026-09-29T07:10:00'));
    await act(async () => { a().checkNewDay(); });
    await act(async () => { a().departTrip('day'); });
    const before = clone(first.ref.api.state);
    expect(before.expedition.state).toBe('away');
    expect(before.expedition.kind).toBe('day');
    expect(before.expedition.tripId).toBe('t02');
    expect(before.lastGapDays).toBe(1);

    // Let the debounced local save run.
    await act(async () => { vi.advanceTimersByTime(500); });
    await settle();
    expect(lastSaved).toBeTruthy();
    first.unmount();

    const second = await mount(clone(lastSaved));
    const after = second.ref.api.state;
    for (const key of LOOP_FIELDS) {
      expect({ key, value: after[key] }).toEqual({ key, value: before[key] });
    }
    expect(after.familyConfig.routine).toEqual({ morning: ['wake', 'dress'], evening: ['pyjama', 'cuddle'] });
    expect(after.familyConfig.eveningStart).toBe('17:30');
    expect(after.adventureCount).toBe(6);
    expect(after.treasuresFound).toEqual(['t01']);
    expect(after.extrasEnabled).toBe(true);
    expect(after.catEvo).toBe(before.catEvo);
    expect(after.companionName).toBe('Funki');
  });
});
