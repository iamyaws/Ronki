// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

const setMood = vi.fn();
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: { companionName: 'Funki', familyConfig: { childName: 'Mia' } }, actions: { setMood } }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), isMuted: () => true },
}));
vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));

import VoiceAudio from '../../utils/voiceAudio';
import { track } from '../../lib/analytics';
import FeelingsSheet, { replyText } from './FeelingsSheet';
import { lineText } from '../../data/ronkiLines';

beforeEach(() => {
  vi.useFakeTimers();
  setMood.mockClear();
  track.mockClear();
  VoiceAudio.playLocalized.mockClear();
});
afterEach(() => vi.useRealTimers());

describe('FeelingsSheet', () => {
  it('asks, and a pick before noon writes moodAM with the reply voice', () => {
    const onClose = vi.fn();
    const { getByText, getByTestId } = render(<FeelingsSheet now={new Date('2026-09-28T09:00:00')} onClose={onClose} />);
    expect(getByTestId('feelings-sheet').textContent).toContain(lineText('mood_ask_01'));
    fireEvent.click(getByText('Magisch'));
    expect(setMood).toHaveBeenCalledWith('moodAM', 4);
    expect(track).toHaveBeenCalledWith('mood.pick', { mood: 'magical', slot: 'AM' });
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('mood_happy_01', 0);
    act(() => { vi.advanceTimersByTime(4300); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('writes moodPM after noon, and the forced slot wins', () => {
    const { getByText, unmount } = render(<FeelingsSheet now={new Date('2026-09-28T15:00:00')} />);
    fireEvent.click(getByText('Müde'));
    expect(setMood).toHaveBeenCalledWith('moodPM', 5);
    unmount();
    const r = render(<FeelingsSheet askId="eve_mood_ask_01" slot="moodPM" now={new Date('2026-09-28T09:00:00')} />);
    expect(r.getByTestId('feelings-sheet').textContent).toContain(lineText('eve_mood_ask_01'));
    fireEvent.click(r.getByText('Okay'));
    expect(setMood).toHaveBeenLastCalledWith('moodPM', 2);
  });

  it('after Traurig offers to sit with Ronki, with a quiet Später', () => {
    const onSit = vi.fn();
    const onClose = vi.fn();
    const onPick = vi.fn();
    const { getByText, getByTestId } = render(
      <FeelingsSheet now={new Date('2026-09-28T18:00:00')} onSit={onSit} onClose={onClose} onPick={onPick} />,
    );
    fireEvent.click(getByText('Traurig'));
    expect(onPick).toHaveBeenCalledWith(0);
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('mood_sad_01', 0);
    expect(getByTestId('feelings-sheet').textContent).toContain(lineText('mood_sit_offer_01'));
    act(() => { vi.advanceTimersByTime(3700); });
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('mood_sit_offer_01', 0);
    // The sheet stays open for the offer.
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(getByText('Bei Ronki sitzen'));
    expect(onSit).toHaveBeenCalledTimes(1);
    fireEvent.click(getByText('Später'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('offers sitting after Besorgt too, and shows its reply without a long dash', () => {
    const { getByText, getByTestId } = render(<FeelingsSheet now={new Date('2026-09-28T18:00:00')} />);
    fireEvent.click(getByText('Besorgt'));
    const text = getByTestId('feelings-sheet').textContent;
    expect(text).toContain(lineText('mood_sit_offer_01'));
    expect(text).not.toMatch(/[\u2013\u2014]/);
    expect(replyText('mood_worried_01')).toBe("Ist was passiert? Du kannst's mir erzählen. Oder einfach da sein.");
  });

  it('can be closed from the first frame', () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(<FeelingsSheet onClose={onClose} />);
    fireEvent.click(getByLabelText('Schließen'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(setMood).not.toHaveBeenCalled();
  });
});
