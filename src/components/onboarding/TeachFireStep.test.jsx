// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import de from '../../i18n/de.json';

const voice = vi.hoisted(() => ({ playLocalized: null }));
vi.mock('../../utils/voiceAudio', () => {
  voice.playLocalized = vi.fn();
  return { default: { play: vi.fn(), playLocalized: voice.playLocalized, playNarrator: vi.fn(), stop: vi.fn(), isMuted: () => false } };
});

import TeachFireStep from './TeachFireStep';
import { lineText } from '../../data/ronkiLines';

const t = (k) => de[k] || k;
const NoBar = () => null;

describe('TeachFireStep: teach through success', () => {
  let clock = 0;
  beforeEach(() => {
    vi.useFakeTimers();
    voice.playLocalized.mockClear();
    clock = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => clock);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function hold(ms) {
    const btn = screen.getByLabelText(de['onboarding.teach.holdLabel']);
    fireEvent.pointerDown(btn);
    clock += ms;
    fireEvent.pointerUp(screen.getByLabelText(de['onboarding.teach.holdLabel']));
  }

  it('round 1 ends in a spark, round 2 makes the flame with a short hold, then the learned line and "Weiter"', () => {
    const onComplete = vi.fn();
    render(<TeachFireStep variant="teal" t={t} ProgressBar={NoBar} onComplete={onComplete} />);
    act(() => { vi.advanceTimersByTime(2300); }); // intro

    hold(900);
    expect(screen.getByText(lineText('teach_fire_spark_01'))).toBeTruthy();
    expect(screen.queryByText(de['onboarding.teach.smokeFail'])).toBeNull();
    expect(voice.playLocalized).toHaveBeenCalledWith('teach_fire_spark_01', 200);
    expect(voice.playLocalized.mock.calls.map(c => c[0])).not.toContain('teach_fire_smoke_01');

    act(() => { vi.advanceTimersByTime(2900); });
    // round 2: the spark line stays as the prompt; 0.25 s is enough
    expect(screen.getByText(lineText('teach_fire_spark_01'))).toBeTruthy();
    hold(250);
    expect(screen.getByText(de['onboarding.teach.celebrate'])).toBeTruthy();
    expect(voice.playLocalized).toHaveBeenCalledWith('teach_fire_celebrate_01', 100);

    act(() => { vi.advanceTimersByTime(1300); });
    expect(screen.getByText(lineText('teach_fire_learned_01'))).toBeTruthy();
    expect(voice.playLocalized).toHaveBeenCalledWith('teach_fire_learned_01', 900);
    act(() => { vi.advanceTimersByTime(1300); });
    const next = screen.getByText('Weiter').closest('button');
    expect(screen.queryByText('Weiter zum Lager')).toBeNull();
    fireEvent.click(next);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('a tap shorter than 0.22 s just waits for a real hold', () => {
    render(<TeachFireStep variant="teal" t={t} ProgressBar={NoBar} onComplete={vi.fn()} />);
    act(() => { vi.advanceTimersByTime(2300); });
    hold(100);
    expect(screen.queryByText(lineText('teach_fire_spark_01'))).toBeNull();
    hold(400);
    expect(screen.getByText(lineText('teach_fire_spark_01'))).toBeTruthy();
  });
});
