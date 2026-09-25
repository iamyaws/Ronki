// @vitest-environment jsdom
/**
 * Fix round 1 (Group S, 26 Sep 2026): when TaskProvider may write to the
 * family's card. A mocked storage layer with a controllable cloud read,
 * an active profile token, the real useTripClock and a fake clock.
 *
 * - FC-01 gate: no profile_upsert before a cloud read reached the server;
 *   one probe per save; a row found by the probe reloads once.
 * - SAVES-1: a tab that comes back stale reloads instead of ticking, so no
 *   day transition or arrival is saved over a newer cloud row.
 * - SAVES-3: leaving the page writes a waiting save at once.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import louisSave from '../test/fixtures/save-louis-like.json';

const TOKEN = 'c'.repeat(32);
let saved: any;
const cloud = {
  readOk: true, loadReadOk: true, probeOk: true, probeRow: null as any,
  // Astra round 2: the result the checked save reports, whether this
  // device was verified current lately, and whether writes froze.
  checkResult: 'saved' as 'saved' | 'conflict' | 'offline', verified: true, frozen: false,
};

vi.mock('../utils/storage', () => {
  const api: any = {
    load: vi.fn(async () => saved),
    save: vi.fn(async () => {}),
    syncLoad: vi.fn(async () => saved),
    syncLoadByToken: vi.fn(async () => { cloud.readOk = cloud.loadReadOk; return saved; }),
    cloudLoadByToken: vi.fn(async () => { cloud.readOk = cloud.probeOk; return cloud.probeOk ? cloud.probeRow : null; }),
    cloudReadOk: vi.fn(() => cloud.readOk),
    cloudSave: vi.fn(async () => {}),
    // A real write (upsert) happens only through this spy.
    cloudSaveByToken: vi.fn(async () => {}),
    cloudSaveChecked: vi.fn(async (token: string, state: any) => {
      if (cloud.frozen) return 'frozen';
      if (cloud.checkResult === 'saved') await api.cloudSaveByToken(token, state);
      return cloud.checkResult;
    }),
    recentlyVerified: vi.fn(() => cloud.verified),
    freezeWrites: vi.fn(() => { cloud.frozen = true; }),
    writesFrozen: vi.fn(() => cloud.frozen),
  };
  return { default: api };
});
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../lib/profileToken', () => ({
  getActiveToken: () => TOKEN,
  ensureTokenForExistingProfile: vi.fn(),
}));
vi.mock('../lib/analytics', () => ({ track: vi.fn(), setAnalyticsConsent: vi.fn() }));

import storage from '../utils/storage';
import { TaskProvider, useTask } from './TaskContext';
import useTripClock from '../hooks/useTripClock';

const upsert = storage.cloudSaveByToken as unknown as ReturnType<typeof vi.fn>;
const probe = storage.cloudLoadByToken as unknown as ReturnType<typeof vi.fn>;
const localSave = storage.save as unknown as ReturnType<typeof vi.fn>;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const dayOf = (d: Date) => d.toISOString().slice(0, 10);
const at = (iso: string) => vi.setSystemTime(new Date(iso));

let reload: ReturnType<typeof vi.fn>;
const realLocation = window.location;

function setVisibility(v: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
  document.dispatchEvent(new Event('visibilitychange'));
}

async function settle() {
  for (let i = 0; i < 6; i++) {
    await act(async () => { await Promise.resolve(); });
  }
}

/** Let every debounced save of the load run, then forget the calls. */
async function drainSaves() {
  await act(async () => { vi.advanceTimersByTime(2000); });
  await settle();
  upsert.mockClear();
  probe.mockClear();
  localSave.mockClear();
}

async function mount(save: unknown) {
  saved = clone(save);
  const ref: { api: any } = { api: null };
  function Grab() { ref.api = useTask(); return null; }
  function Clock() { useTripClock(); return null; }
  const utils = render(<TaskProvider><Grab /><Clock /></TaskProvider>);
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
  Object.assign(cloud, { readOk: true, loadReadOk: true, probeOk: true, probeRow: null, checkResult: 'saved', verified: true, frozen: false });
  upsert.mockClear();
  probe.mockClear();
  localSave.mockClear();
  try { sessionStorage.clear(); } catch { /* none */ }
  reload = vi.fn();
  Object.defineProperty(window, 'location', { configurable: true, value: { ...realLocation, href: realLocation.href, search: realLocation.search, reload } });
  setVisibility('visible');
});
afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
  setVisibility('visible');
  vi.useRealTimers();
});

describe('FC-01 and round 2: the card is written only while this device is current', () => {
  const checked = () => storage.cloudSaveChecked as unknown as ReturnType<typeof vi.fn>;
  const freeze = () => storage.freezeWrites as unknown as ReturnType<typeof vi.fn>;

  it('offline (the read failed): nothing written, nothing frozen, no reload', async () => {
    at('2026-09-28T07:10:00');
    cloud.checkResult = 'offline';
    const h = await mount(louisToday());
    await act(async () => { h.actions.complete('s_wash'); });
    await act(async () => { vi.advanceTimersByTime(2000); });
    await settle();
    expect(checked()).toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
    expect(freeze()).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('current: the checked save writes to the card', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await drainSaves();
    await act(async () => { h.actions.complete('s_wash'); });
    await act(async () => { vi.advanceTimersByTime(2000); });
    await settle();
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert.mock.calls[0][0]).toBe(TOKEN);
  });

  it('conflict (another device wrote, or a row was never reconciled): writes freeze, one reload, no overwrite', async () => {
    at('2026-09-28T07:10:00');
    cloud.checkResult = 'conflict';
    const h = await mount(louisToday());
    await act(async () => { vi.advanceTimersByTime(2000); });
    await settle();
    expect(freeze()).toHaveBeenCalled();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(upsert).not.toHaveBeenCalled();
    // The reload did not happen (test): later saves stay frozen, no second reload within a minute.
    await act(async () => { h.actions.complete('s_wash'); });
    await act(async () => { vi.advanceTimersByTime(2000); });
    await settle();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(upsert).not.toHaveBeenCalled();
  });
});

describe('SAVES-1: a stale tab never writes', () => {
  it('coming back on the next day reloads, and no upsert happens before the reload', async () => {
    at('2026-09-28T12:00:00');
    const h = await mount(louisToday());
    await drainSaves();
    act(() => { setVisibility('hidden'); });
    at('2026-09-29T07:00:00');
    act(() => { setVisibility('visible'); });
    expect(reload).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(90_000); });
    await settle();
    expect(upsert).not.toHaveBeenCalled();
    expect(h.state.lastDate).toBe('2026-09-28');
  });

  it('coming back the same day after more than 5 minutes reloads before a due trip is saved', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('day'); });
    await drainSaves();
    act(() => { setVisibility('hidden'); });
    at('2026-09-28T17:05:00');
    act(() => { setVisibility('visible'); });
    expect(reload).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(90_000); });
    await settle();
    expect(upsert).not.toHaveBeenCalled();
    expect(h.state.expedition.state).toBe('away');
  });

  it('a short glance away does not reload, and the clock goes on ticking', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await act(async () => { h.actions.departTrip('day'); });
    await drainSaves();
    at('2026-09-28T16:58:00');
    act(() => { setVisibility('hidden'); });
    at('2026-09-28T17:01:00');
    act(() => { setVisibility('visible'); });
    await settle();
    expect(reload).not.toHaveBeenCalled();
    expect(h.state.expedition.state).toBe('waiting');
  });

  it('the 30 s tick does not run while the tab is hidden', async () => {
    at('2026-09-28T23:59:00');
    const h = await mount(louisToday());
    await drainSaves();
    act(() => { setVisibility('hidden'); });
    at('2026-09-29T08:00:00');
    await act(async () => { vi.advanceTimersByTime(120_000); });
    await settle();
    expect(h.state.lastDate).toBe(dayOf(new Date('2026-09-28T23:59:00')));
    expect(upsert).not.toHaveBeenCalled();
  });
});

describe('SAVES-3: leaving the page writes a waiting save at once', () => {
  it('the tab going hidden flushes the departure to local and cloud', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await drainSaves();
    await act(async () => { h.actions.departTrip('day'); });
    expect(upsert).not.toHaveBeenCalled();
    act(() => { setVisibility('hidden'); });
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert.mock.calls[0][1].expedition.state).toBe('away');
    expect(localSave).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(2000); });
    await settle();
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it('pagehide flushes too; nothing is written when no save waits', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await drainSaves();
    act(() => { window.dispatchEvent(new Event('pagehide')); });
    expect(upsert).not.toHaveBeenCalled();
    await act(async () => { h.actions.complete('s_wash'); });
    act(() => { window.dispatchEvent(new Event('pagehide')); });
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it('no cloud flush when this device was not verified current in the last 20 s (round 2)', async () => {
    at('2026-09-28T07:10:00');
    const h = await mount(louisToday());
    await drainSaves();
    cloud.verified = false;
    await act(async () => { h.actions.departTrip('day'); });
    act(() => { setVisibility('hidden'); });
    expect(upsert).not.toHaveBeenCalled();
    expect(localSave).toHaveBeenCalledTimes(1);
  });

  it('keeps the FC-01 guard: no cloud flush before a read reached the card', async () => {
    at('2026-09-28T07:10:00');
    cloud.loadReadOk = false;
    cloud.probeOk = false;
    const h = await mount(louisToday());
    await drainSaves();
    cloud.readOk = false;
    await act(async () => { h.actions.complete('s_wash'); });
    act(() => { setVisibility('hidden'); });
    expect(upsert).not.toHaveBeenCalled();
    expect(localSave).toHaveBeenCalledTimes(1);
  });
});
