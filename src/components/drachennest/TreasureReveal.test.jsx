// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

let mockState;
const receiveTreasure = vi.fn();
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions: { receiveTreasure } }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), isMuted: () => true },
}));

import VoiceAudio from '../../utils/voiceAudio';
import TreasureReveal, { treasureOf } from './TreasureReveal';
import { lineText } from '../../data/ronkiLines';

const exp = (tripId) => ({ state: 'waiting', kind: 'day', tripId, pendingMemento: { id: 'm', ts: 'x', emoji: '?', name: '?', tripId } });

beforeEach(() => {
  vi.useFakeTimers();
  receiveTreasure.mockClear();
  VoiceAudio.playLocalized.mockClear();
});
afterEach(() => vi.useRealTimers());

describe('TreasureReveal', () => {
  it('shows the trip treasure and story and speaks the story', () => {
    mockState = { catEvo: 5, adventureCount: 2, tripCursor: 2, expedition: exp('t03') };
    const { getByTestId } = render(<TreasureReveal />);
    const t = getByTestId('treasure-reveal').textContent;
    expect(t).toContain('Bachstein');
    expect(t).toContain('ganz glatt vom Wasser');
    expect(t).not.toContain(lineText('trip_again_01'));
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('trip_story_03', 400);
  });

  it('sits on the sky ground, not on the Morgenwald painting with its own Ronki (own read O2)', () => {
    mockState = { catEvo: 5, adventureCount: 2, tripCursor: 2, expedition: exp('t03') };
    const { getByTestId } = render(<TreasureReveal />);
    const reveal = getByTestId('treasure-reveal');
    expect(reveal.className).toContain('bg-sky');
    for (const img of reveal.querySelectorAll('img')) expect(img.getAttribute('src')).not.toContain('morgenwald');
  });

  it('a repeat trip first says so honestly, then the story', () => {
    // t03 on the second pass through all 28 trips (cursor 30, 30 % 28 = 2).
    mockState = { catEvo: 20, adventureCount: 28, tripCursor: 30, expedition: exp('t03') };
    const { getByTestId } = render(<TreasureReveal />);
    expect(getByTestId('treasure-reveal').textContent).toContain(lineText('trip_again_01'));
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('trip_again_01', 300);
    expect(VoiceAudio.playLocalized).not.toHaveBeenCalledWith('trip_story_03', expect.anything());
    act(() => { vi.advanceTimersByTime(3500); });
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('trip_story_03', 0);
  });

  it('Ins Regal stellen receives the treasure exactly once', () => {
    mockState = { catEvo: 5, adventureCount: 2, tripCursor: 2, expedition: exp('t01') };
    const onDone = vi.fn();
    const { getByText } = render(<TreasureReveal onDone={onDone} />);
    fireEvent.click(getByText('Ins Regal stellen'));
    fireEvent.click(getByText('Ins Regal stellen'));
    expect(receiveTreasure).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('treasure_shelf_01', 0);
  });

  it('an old save without a trip shows its memento quote', () => {
    const e = { state: 'waiting', pendingMemento: { id: 'm', ts: 'x', emoji: '🍂', name: 'Blatt', location: 'Morgenwald', quote: 'Ein altes Blatt.' } };
    expect(treasureOf(e)).toMatchObject({ emoji: '🍂', name: 'Blatt', story: 'Ein altes Blatt.', storyVoice: null });
    mockState = { catEvo: 3, adventureCount: 0, tripCursor: 0, expedition: e };
    const { getByTestId } = render(<TreasureReveal />);
    expect(getByTestId('treasure-reveal').textContent).toContain('Ein altes Blatt.');
  });
  it('with a favourite on the shelf, Ronki says the new treasure goes next to it', () => {
    mockState = { catEvo: 5, adventureCount: 2, tripCursor: 2, favoriteTreasure: 'trip-t01', expedition: exp('t03') };
    const { getByText } = render(<TreasureReveal onDone={() => {}} />);
    VoiceAudio.playLocalized.mockClear();
    fireEvent.click(getByText('Ins Regal stellen'));
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('fav_next_01', 0);
    expect(VoiceAudio.playLocalized).not.toHaveBeenCalledWith('treasure_shelf_01', 0);
  });

  it('without a favourite, the plain shelf line', () => {
    mockState = { catEvo: 5, adventureCount: 2, tripCursor: 2, expedition: exp('t03') };
    const { getByText } = render(<TreasureReveal onDone={() => {}} />);
    VoiceAudio.playLocalized.mockClear();
    fireEvent.click(getByText('Ins Regal stellen'));
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('treasure_shelf_01', 0);
  });
});
