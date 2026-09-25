// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';

const voice = vi.hoisted(() => ({ playLocalized: null }));
vi.mock('../../utils/voiceAudio', () => {
  voice.playLocalized = vi.fn();
  return { default: { play: vi.fn(), playLocalized: voice.playLocalized, stop: vi.fn(), isMuted: () => false } };
});

import FirstDayIntro, { startLineFor } from './FirstDayIntro';
import { lineText } from '../../data/ronkiLines';

// Monday 28 Sep 2026, local time.
const at = (h, m = 0) => new Date(2026, 8, 28, h, m);

function tapThrough(onDone) {
  // beat 1: half fire
  expect(screen.getByText(lineText('fd_fire_half_01'))).toBeTruthy();
  const flames = document.querySelectorAll('[data-flame]');
  expect(flames).toHaveLength(4);
  expect(document.querySelectorAll('[data-flame="lit"]')).toHaveLength(2);
  act(() => { vi.advanceTimersByTime(500); });
  fireEvent.click(screen.getByText('Weiter').closest('button'));
  // beat 2: the trip picture row
  expect(screen.getByText(lineText('fd_fire_trip_01'))).toBeTruthy();
  act(() => { vi.advanceTimersByTime(500); });
  // tap anywhere works too
  fireEvent.click(screen.getByRole('dialog'));
  // beat 3: the day-1 card
  expect(screen.getByText(lineText('fd_day1_01'))).toBeTruthy();
  expect(onDone).not.toHaveBeenCalled();
}

describe('FirstDayIntro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    voice.playLocalized.mockClear();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('morning install: "Machen wir zusammen den Morgen?"', () => {
    const onDone = vi.fn();
    render(<FirstDayIntro eveningStart="17:00" onDone={onDone} now={at(7, 10)} />);
    expect(voice.playLocalized).toHaveBeenCalledWith('fd_fire_half_01', 300);
    tapThrough(onDone);
    expect(screen.getByText(lineText('fd_start_morning_01'))).toBeTruthy();
    act(() => { vi.advanceTimersByTime(2300); });
    expect(voice.playLocalized).toHaveBeenCalledWith('fd_day1_01', 300);
    expect(voice.playLocalized).toHaveBeenCalledWith('fd_start_morning_01');
    fireEvent.click(screen.getByText("Los geht's").closest('button'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('afternoon install: Ronki stays in the nest, no send-off (R4)', () => {
    const onDone = vi.fn();
    render(<FirstDayIntro eveningStart="17:00" onDone={onDone} now={at(13, 0)} />);
    tapThrough(onDone);
    expect(screen.getByText(lineText('fd_start_day_01'))).toBeTruthy();
    expect(screen.queryByText(lineText('fd_start_morning_01'))).toBeNull();
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(screen.getByText("Los geht's").closest('button'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('evening install: "Machen wir zusammen den Abend?", honouring the family evening start', () => {
    const onDone = vi.fn();
    render(<FirstDayIntro eveningStart="18:30" onDone={onDone} now={at(19, 30)} />);
    tapThrough(onDone);
    expect(screen.getByText(lineText('fd_start_evening_01'))).toBeTruthy();
    // 17:45 is still the day block when the evening starts at 18:30
    expect(startLineFor('day')).toBe('fd_start_day_01');
  });

  it('a double tap does not skip a beat, and finishing twice calls onDone once', () => {
    const onDone = vi.fn();
    render(<FirstDayIntro eveningStart="17:00" onDone={onDone} now={at(7, 10)} />);
    act(() => { vi.advanceTimersByTime(500); });
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    fireEvent.click(dialog); // inside the guard: ignored
    expect(screen.getByText(lineText('fd_fire_trip_01'))).toBeTruthy();
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(dialog);
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(dialog);
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(dialog);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('startLineFor maps every block', () => {
    expect(startLineFor('morning')).toBe('fd_start_morning_01');
    expect(startLineFor('day')).toBe('fd_start_day_01');
    expect(startLineFor('evening')).toBe('fd_start_evening_01');
    expect(startLineFor('night')).toBe('fd_start_evening_01');
  });
});
