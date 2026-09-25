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

  it('hides the entry once a feeling is picked for today', () => {
    mockState = { ...mockState, moodAM: 2 };
    const { queryByLabelText } = render(<RoomHub onNavigate={() => {}} />);
    expect(queryByLabelText("Wie geht's dir? Gefühl aussuchen")).toBeNull();
    expect(queryByLabelText('Ronkis Frage beantworten')).toBeNull();
  });
});
