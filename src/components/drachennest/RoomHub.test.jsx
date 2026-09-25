// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

// Home reads TaskContext and talks to the voice bank and analytics; all
// three are stubbed so the test only looks at the new "Wie geht's dir?"
// entry (Marc, 25 Sep 2026, on Astra's design review R3).
const setMood = vi.fn();
let mockState;
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions: { setMood } }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playNarrator: vi.fn(), playLocalized: vi.fn(), isMuted: () => true },
}));
vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));

import RoomHub from './RoomHub';

describe('RoomHub: the feelings entry on the room', () => {
  let scrollSpy;
  beforeEach(() => {
    vi.useFakeTimers();
    setMood.mockClear();
    scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    mockState = {
      catEvo: 12,
      moodAM: null,
      ronkiMood: 'normal',
      companionVariant: 'forest',
      familyConfig: { childName: 'Mia' },
      quests: [],
      expedition: { state: 'home' },
      expeditionLog: [],
    };
  });
  afterEach(() => {
    vi.useRealTimers();
    delete Element.prototype.scrollIntoView;
  });

  it('shows the entry while today\'s feeling is open and leads to the picker', () => {
    const { getByLabelText } = render(<RoomHub onNavigate={() => {}} />);
    const entry = getByLabelText("Wie geht's dir? Gefühl aussuchen");
    const group = getByLabelText('Ronkis Frage beantworten');
    expect(group.style.outline).toContain('transparent');

    fireEvent.click(entry);
    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(group.style.outline).toContain('var(--color-cobalt)');
    // Tapping the entry never picks a feeling by itself.
    expect(setMood).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1700); });
    expect(group.style.outline).toContain('transparent');
  });

  it('puts the entry beside the greeting, outside the picture, so it can never cover Ronki', () => {
    const { getByLabelText, container } = render(<RoomHub onNavigate={() => {}} />);
    const entry = getByLabelText("Wie geht's dir? Gefühl aussuchen");
    expect(container.querySelector('.bb-frame')).not.toBeNull();
    expect(entry.closest('.bb-frame')).toBeNull();
    expect(entry.closest('header')).not.toBeNull();
    expect(entry.querySelector('svg')).not.toBeNull(); // the heart, not an answer's picture
  });

  it('scrolls the picker itself into view and focuses the first tile at once', () => {
    const { getByLabelText } = render(<RoomHub onNavigate={() => {}} />);
    const group = getByLabelText('Ronkis Frage beantworten');
    fireEvent.click(getByLabelText("Wie geht's dir? Gefühl aussuchen"));
    expect(scrollSpy.mock.contexts[0].contains(group)).toBe(true);
    expect(document.activeElement.textContent).toContain('Gut');
  });

  it('never pulls focus back after the child moved on (Astra delta review R1)', () => {
    const { getByLabelText } = render(<RoomHub onNavigate={() => {}} />);
    fireEvent.click(getByLabelText("Wie geht's dir? Gefühl aussuchen"));
    const tiles = getByLabelText('Ronkis Frage beantworten').querySelectorAll('button');
    tiles[1].focus();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(document.activeElement).toBe(tiles[1]);
  });

  it('a second tap restarts the ring, and unmounting during it is safe', () => {
    const { getByLabelText, unmount } = render(<RoomHub onNavigate={() => {}} />);
    const entry = getByLabelText("Wie geht's dir? Gefühl aussuchen");
    const group = getByLabelText('Ronkis Frage beantworten');
    fireEvent.click(entry);
    act(() => { vi.advanceTimersByTime(1000); });
    fireEvent.click(entry);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(group.style.outline).toContain('var(--color-cobalt)');
    act(() => { vi.advanceTimersByTime(700); });
    expect(group.style.outline).toContain('transparent');
    fireEvent.click(entry);
    unmount();
    expect(() => act(() => { vi.advanceTimersByTime(2000); })).not.toThrow();
  });

  it('hides the entry once a feeling is picked for today', () => {
    mockState = { ...mockState, moodAM: 2 };
    const { queryByLabelText } = render(<RoomHub onNavigate={() => {}} />);
    expect(queryByLabelText("Wie geht's dir? Gefühl aussuchen")).toBeNull();
    expect(queryByLabelText('Ronkis Frage beantworten')).toBeNull();
  });
});
