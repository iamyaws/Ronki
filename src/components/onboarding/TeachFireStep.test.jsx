// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import de from '../../i18n/de.json';

const voice = vi.hoisted(() => ({ playLocalized: null, playNarrator: null }));
vi.mock('../../utils/voiceAudio', () => {
  voice.playLocalized = vi.fn();
  voice.playNarrator = vi.fn();
  return { default: { play: vi.fn(), playLocalized: voice.playLocalized, playNarrator: voice.playNarrator, stop: vi.fn(), isMuted: () => false } };
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
    voice.playNarrator.mockClear();
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

  const holdCalls = () => voice.playLocalized.mock.calls.filter(c => c[0] === 'teach_fire_hold_01');
  const holdButton = () => screen.getByLabelText(de['onboarding.teach.holdLabel']);

  it('the first prompt shows and speaks the hold line, and the button shows the move', () => {
    render(<TeachFireStep variant="teal" t={t} ProgressBar={NoBar} onComplete={vi.fn()} />);
    // no muted narrator call stands in for the instruction any more
    expect(voice.playNarrator).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2300); });
    expect(screen.getByText(lineText('teach_fire_hold_01'))).toBeTruthy();
    expect(screen.queryByText(de['onboarding.teach.tryFail'])).toBeNull();
    expect(holdCalls()).toEqual([['teach_fire_hold_01', 300]]);
    expect(voice.playNarrator).not.toHaveBeenCalled();
    expect(holdButton().getAttribute('data-demo')).toBe('hold');
    expect(holdButton().className).toContain('tbb-demo');
    // while pressed the demonstration stops; a real hold ends it
    fireEvent.pointerDown(holdButton());
    expect(holdButton().getAttribute('data-demo')).toBeNull();
    clock += 900;
    fireEvent.pointerUp(holdButton());
    act(() => { vi.advanceTimersByTime(2900); });
    expect(screen.getByText(lineText('teach_fire_spark_01'))).toBeTruthy();
    expect(holdButton().getAttribute('data-demo')).toBeNull();
    // the hold line was spoken once, on the first prompt only
    expect(holdCalls()).toHaveLength(1);
  });

  it('a press shorter than 0.22 s speaks the hold line again, with a cooldown', () => {
    render(<TeachFireStep variant="teal" t={t} ProgressBar={NoBar} onComplete={vi.fn()} />);
    act(() => { vi.advanceTimersByTime(2300); });
    expect(holdCalls()).toHaveLength(1);
    // straight after the first line: no restart mid-sentence
    hold(100);
    expect(holdCalls()).toHaveLength(1);
    expect(screen.getByText(lineText('teach_fire_hold_01'))).toBeTruthy();
    // once the line had time to finish, a quick tap brings it back
    clock += 3000;
    hold(100);
    expect(holdCalls()).toHaveLength(2);
    expect(holdCalls()[1]).toEqual(['teach_fire_hold_01', 0]);
    expect(holdButton().getAttribute('data-demo')).toBe('hold');
  });

  it('round 2: a quick tap after the spark shows and speaks the hold line too', () => {
    render(<TeachFireStep variant="teal" t={t} ProgressBar={NoBar} onComplete={vi.fn()} />);
    act(() => { vi.advanceTimersByTime(2300); });
    hold(900);
    act(() => { vi.advanceTimersByTime(2900); });
    expect(screen.getByText(lineText('teach_fire_spark_01'))).toBeTruthy();
    clock += 3000;
    hold(100);
    expect(holdCalls()).toHaveLength(2);
    expect(screen.getByText(lineText('teach_fire_hold_01'))).toBeTruthy();
    // a real hold still makes the flame
    hold(300);
    expect(screen.getByText(de['onboarding.teach.celebrate'])).toBeTruthy();
  });

  it('the hold line exists in finchLines and as a German recording', async () => {
    expect(lineText('teach_fire_hold_01')).toBe('Drück ganz lange auf den Knopf. Und dann lass los!');
    const fs = await import('node:fs');
    const path = await import('node:path');
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/audio/ronki/de_teach_fire_hold_01.mp3'))).toBe(true);
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
