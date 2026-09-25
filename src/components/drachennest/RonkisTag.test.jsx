// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

// The strip reads quests from TaskContext and talks to the voice bank;
// both are stubbed so the test only looks at what is painted.
const complete = vi.fn();
let mockState;
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions: { complete } }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playNarrator: vi.fn(), playLocalized: vi.fn() },
}));

import RonkisTag from './RonkisTag';

function quest(id, name, anchor, done = false) {
  return { id, name, anchor, done, xp: 5, icon: '⭐', order: 1 };
}

describe('RonkisTag (Bilderbuch)', () => {
  beforeEach(() => {
    // Pin the clock to a school morning so the morning block is the
    // open one (in the evening it collapses into small tiles).
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 25, 8, 0, 0));
    complete.mockClear();
    mockState = {
      catEvo: 12,
      expedition: { state: 'home' },
      quests: [
        quest('m1', 'Aus dem Bett kommen', 'morning'),
        quest('m2', 'Frühstücken', 'morning'),
        quest('a1', '10 Min bewegen', 'evening'),
        quest('b1', 'Pyjama anziehen', 'bedtime'),
      ],
    };
  });

  it('paints the day on white with the shared top bar, block headers and paper cards', () => {
    const { getByText, getByLabelText, queryByLabelText, container, queryByText } = render(
      <RonkisTag onClose={() => {}} onOpenExpedition={() => {}} onOpenTonight={() => {}} />,
    );
    expect(getByText('Ronkis Tag')).toBeTruthy();
    expect(getByLabelText('Zurück zur Höhle')).toBeTruthy();
    // no dead read-aloud button while the narrator is muted (Astra design review R2)
    expect(queryByLabelText('Vorlesen')).toBeNull();
    expect(getByText('Morgen')).toBeTruthy();
    expect(getByText('Abend')).toBeTruthy();
    // The morning scene sits at the top, the old CSS props are gone.
    expect(container.querySelector('img[src*="scenes/morgen.webp"]')).toBeTruthy();
    expect(container.querySelector('.material-symbols-outlined')).toBeNull();
    // Every task is a button with a doodle in it.
    const card = getByLabelText(/Frühstücken/);
    expect(card.tagName).toBe('BUTTON');
    // the task shows its own picture: a plate for breakfast (Astra design review R2)
    expect(card.querySelector('img[src*="tasks/plate"]')).toBeTruthy();
    expect(queryByText('Ein guter Tag.')).toBeNull();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('completes a task on tap and lets Ronki cheer under 1.5 s', () => {
    const { getByLabelText, container } = render(
      <RonkisTag onClose={() => {}} onOpenExpedition={() => {}} onOpenTonight={() => {}} />,
    );
    fireEvent.click(getByLabelText(/Aus dem Bett kommen/));
    expect(complete).toHaveBeenCalledWith('m1');
    expect(container.querySelector('img[src*="ronki/cheer.webp"]')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(container.querySelector('img[src*="ronki/cheer.webp"]')).toBeNull();
  });

  it('shows the sun check on done tasks and the night loop once the day is over', () => {
    mockState.quests = mockState.quests.map(q => ({ ...q, done: true }));
    const { getByText, getByLabelText, container } = render(
      <RonkisTag onClose={() => {}} onOpenExpedition={() => {}} onOpenTonight={() => {}} />,
    );
    expect(getByText('Ein guter Tag.')).toBeTruthy();
    expect(getByLabelText('Ins Lager, Tonight-Ritual öffnen')).toBeTruthy();
    expect(container.querySelector('img[src*="loops/nacht-poster.webp"]')).toBeTruthy();
  });

  it('marks a done task with the sun check and keeps its name readable', () => {
    mockState.quests[0].done = true;
    const { getByLabelText } = render(
      <RonkisTag onClose={() => {}} onOpenExpedition={() => {}} onOpenTonight={() => {}} />,
    );
    const done = getByLabelText('Aus dem Bett kommen, fertig');
    expect(done.disabled).toBe(true);
    expect(done.textContent).toContain('Aus dem Bett kommen');
  });
});
