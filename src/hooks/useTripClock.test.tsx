// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

const mockTask: { state: any; actions: any } = { state: null, actions: {} };
vi.mock('../context/TaskContext', () => ({ useTask: () => mockTask }));

import useTripClock, { TRIP_CLOCK_TICK_MS } from './useTripClock';

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
    vi.setSystemTime(new Date('2026-09-28T17:15:00'));
    let clock: any;
    const { rerender } = render(<Probe onClock={(c) => { clock = c; }} />);
    expect(clock.block).toBe('day');
    vi.setSystemTime(new Date('2026-09-28T19:45:00'));
    mockTask.state = { ...mockTask.state, eveningRitualCompletedAt: new Date('2026-09-28T19:40:00').toISOString() };
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
    vi.setSystemTime(new Date('2026-09-28T16:00:00'));
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
    vi.setSystemTime(new Date('2026-09-28T17:30:05'));
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

  it('survives mocked actions that lack the loop functions', () => {
    mockTask.actions = {};
    expect(() => render(<Probe onClock={() => {}} />)).not.toThrow();
    act(() => { vi.advanceTimersByTime(TRIP_CLOCK_TICK_MS); });
  });
});
