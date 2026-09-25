// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

const mockTask: { state: any; actions: any } = { state: null, actions: {} };
vi.mock('../context/TaskContext', () => ({ useTask: () => mockTask }));

import useTripClock, { TRIP_CLOCK_TICK_MS, STALE_HIDDEN_MS, tripClockPage } from './useTripClock';

function Probe({ onClock }: { onClock: (c: any) => void }) {
  onClock(useTripClock());
  return null;
}

function setVisibility(v: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useTripClock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
    mockTask.actions = { checkNewDay: vi.fn(), arriveTrip: vi.fn() };
    mockTask.state = {
      familyConfig: { eveningStart: '17:30' },
      vacMode: false,
      eveningRitualCompletedAt: null,
      expedition: { state: 'home', biome: 'morgenwald' },
    };
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns now, the day key and the block, and follows the clock every 30 s', () => {
    vi.setSystemTime(new Date('2026-09-28T10:59:40'));
    let clock: any;
    render(<Probe onClock={(c) => { clock = c; }} />);
    expect(clock.block).toBe('morning');
    expect(clock.today).toBe(new Date('2026-09-28T10:59:40').toISOString().slice(0, 10));
    vi.setSystemTime(new Date('2026-09-28T11:00:10'));
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
    expect(clock.block).toBe('day');
    expect(clock.now.getTime()).toBeGreaterThanOrEqual(new Date('2026-09-28T11:00:10').getTime());
  });

  it('honours the family evening start and the night after TonightRitual', () => {
    // Small steps: a jump of hours between two ticks reads as a device
    // that slept and reloads instead (see the last test in this file).
    vi.setSystemTime(new Date('2026-09-28T17:29:40'));
    let clock: any;
    const { rerender } = render(<Probe onClock={(c) => { clock = c; }} />);
    expect(clock.block).toBe('day');
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
    expect(clock.block).toBe('evening');
    mockTask.state = { ...mockTask.state, eveningRitualCompletedAt: new Date().toISOString() };
    rerender(<Probe onClock={(c) => { clock = c; }} />);
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
    expect(clock.block).toBe('night');
  });

  it('checks the day on mount, every 30 s and when the tab becomes visible', () => {
    vi.setSystemTime(new Date('2026-09-28T08:00:00'));
    render(<Probe onClock={() => {}} />);
    const check = mockTask.actions.checkNewDay;
    expect(check).toHaveBeenCalled();
    const afterMount = check.mock.calls.length;
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
    expect(check.mock.calls.length).toBe(afterMount + 1);
    act(() => { setVisibility('hidden'); });
    expect(check.mock.calls.length).toBe(afterMount + 1);
    act(() => { setVisibility('visible'); });
    expect(check.mock.calls.length).toBe(afterMount + 2);
  });

  it('brings Ronki home once the trip is due, not before, and checks the day first', () => {
    vi.setSystemTime(new Date('2026-09-28T17:29:50'));
    const order: string[] = [];
    mockTask.actions = {
      checkNewDay: vi.fn(() => order.push('day')),
      arriveTrip: vi.fn(() => order.push('arrive')),
    };
    mockTask.state = {
      ...mockTask.state,
      expedition: { state: 'away', biome: 'morgenwald', returnAt: new Date('2026-09-28T17:30:00').toISOString() },
    };
    render(<Probe onClock={() => {}} />);
    expect(mockTask.actions.arriveTrip).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
    expect(mockTask.actions.arriveTrip).toHaveBeenCalledTimes(1);
    expect(order.slice(-2)).toEqual(['day', 'arrive']);
  });

  it('does nothing before the state has loaded and stops on unmount', () => {
    mockTask.state = null;
    const { unmount } = render(<Probe onClock={() => {}} />);
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
    expect(mockTask.actions.checkNewDay).not.toHaveBeenCalled();
    unmount();
    mockTask.state = { expedition: { state: 'home' } };
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS * 3); });
    expect(mockTask.actions.checkNewDay).not.toHaveBeenCalled();
  });

  describe('a tab that comes back stale reloads instead of ticking (SAVES-1)', () => {
    let realReload: () => void;
    beforeEach(() => {
      realReload = tripClockPage.reload;
      tripClockPage.reload = vi.fn();
    });
    afterEach(() => {
      tripClockPage.reload = realReload;
      setVisibility('visible');
    });

    it('after more than 5 minutes hidden', () => {
      vi.setSystemTime(new Date('2026-09-28T08:00:00'));
      mockTask.state = { ...mockTask.state, lastDate: new Date('2026-09-28T08:00:00').toISOString().slice(0, 10) };
      render(<Probe onClock={() => {}} />);
      const check = mockTask.actions.checkNewDay;
      const before = check.mock.calls.length;
      act(() => { setVisibility('hidden'); });
      vi.setSystemTime(new Date(new Date('2026-09-28T08:00:00').getTime() + STALE_HIDDEN_MS + 1000));
      act(() => { setVisibility('visible'); });
      expect(tripClockPage.reload).toHaveBeenCalledTimes(1);
      expect(check.mock.calls.length).toBe(before);
      // Nothing ticks after the reload was asked for.
      act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS * 3); });
      expect(check.mock.calls.length).toBe(before);
      expect(mockTask.actions.arriveTrip).not.toHaveBeenCalled();
    });

    it('when the day key moved past lastDate, even after a short hide', () => {
      vi.setSystemTime(new Date('2026-09-28T08:00:00'));
      mockTask.state = { ...mockTask.state, lastDate: '2026-09-27' };
      render(<Probe onClock={() => {}} />);
      act(() => { setVisibility('hidden'); });
      act(() => { setVisibility('visible'); });
      expect(tripClockPage.reload).toHaveBeenCalledTimes(1);
    });

    it('not after a short hide on the same day', () => {
      vi.setSystemTime(new Date('2026-09-28T08:00:00'));
      mockTask.state = { ...mockTask.state, lastDate: new Date('2026-09-28T08:00:00').toISOString().slice(0, 10) };
      render(<Probe onClock={() => {}} />);
      act(() => { setVisibility('hidden'); });
      vi.setSystemTime(new Date('2026-09-28T08:02:00'));
      act(() => { setVisibility('visible'); });
      expect(tripClockPage.reload).not.toHaveBeenCalled();
    });

    it('the 30 s interval does not tick while hidden', () => {
      vi.setSystemTime(new Date('2026-09-28T08:00:00'));
      render(<Probe onClock={() => {}} />);
      const check = mockTask.actions.checkNewDay;
      const before = check.mock.calls.length;
      act(() => { setVisibility('hidden'); });
      act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS * 4); });
      expect(check.mock.calls.length).toBe(before);
    });
  });

  it('a trip whose returnAt is more than a day ahead is due (LOOP-5)', () => {
    vi.setSystemTime(new Date('2026-09-28T09:00:00'));
    mockTask.state = {
      ...mockTask.state,
      expedition: { state: 'away', biome: 'morgenwald', returnAt: new Date('2026-10-03T17:00:00').toISOString() },
    };
    render(<Probe onClock={() => {}} />);
    expect(mockTask.actions.arriveTrip).toHaveBeenCalled();
  });

  it('survives mocked actions that lack the loop functions', () => {
    mockTask.actions = {};
    expect(() => render(<Probe onClock={() => {}} />)).not.toThrow();
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
  });

  // Review fix round 1 (verifier S): a visible tab can sleep without a
  // visibility event. The next tick sees the gap and reloads, with every
  // write frozen first. Last in this file: the freeze is one way.
  it('a visible tab whose timers slept reloads with writes frozen', async () => {
    const storage = (await import('../utils/storage')).default;
    const realReload = tripClockPage.reload;
    tripClockPage.reload = vi.fn();
    try {
      mockTask.state = { ...mockTask.state, lastDate: '2026-09-28' };
      vi.setSystemTime(new Date('2026-09-28T09:00:00'));
      render(<Probe onClock={() => {}} />);
      mockTask.actions.checkNewDay.mockClear();
      // The device slept 20 minutes, then the interval fires once.
      vi.setSystemTime(new Date('2026-09-28T09:20:00'));
      act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
      expect(tripClockPage.reload).toHaveBeenCalledTimes(1);
      expect(storage.writesFrozen()).toBe(true);
      expect(mockTask.actions.checkNewDay).not.toHaveBeenCalled();
    } finally {
      tripClockPage.reload = realReload;
    }
  });
});
