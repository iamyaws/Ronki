// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

const complete = vi.fn();
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: {}, actions: { complete } }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), isMuted: () => true },
}));

import NowCard, { TAP_GUARD_MS } from './NowCard';
import TaskRow from './TaskRow';

const quest = { id: 's_teeth_am', name: 'Zähne putzen', anchor: 'morning', order: 5, done: false };

beforeEach(() => {
  complete.mockClear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('NowCard', () => {
  it('shows the task picture and its label', () => {
    const { container, getByText } = render(<NowCard quest={quest} />);
    expect(container.querySelector('img').getAttribute('src')).toContain('art/bilderbuch/tasks/toothbrush.webp');
    expect(getByText('Zähne putzen')).toBeTruthy();
  });

  it('Geschafft calls complete once, even on a double tap', () => {
    const onDone = vi.fn();
    const { getByText } = render(<NowCard quest={quest} onDone={onDone} />);
    fireEvent.click(getByText('Geschafft'));
    fireEvent.click(getByText('Geschafft'));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledWith('s_teeth_am');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('a double tap across the switch to the next task completes only the first (KIDUX-1)', () => {
    const { getByText, rerender } = render(<NowCard quest={quest} />);
    fireEvent.click(getByText('Geschafft'));
    // The Nest puts the next task on the same card instance.
    rerender(<NowCard quest={{ ...quest, id: 's_dress' }} />);
    act(() => { vi.advanceTimersByTime(150); });
    fireEvent.click(getByText('Geschafft'));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledWith('s_teeth_am');
  });

  it('the next task on the card can be completed once the tap guard has passed', () => {
    const { getByText, rerender } = render(<NowCard quest={quest} />);
    fireEvent.click(getByText('Geschafft'));
    rerender(<NowCard quest={{ ...quest, id: 's_dress' }} />);
    act(() => { vi.advanceTimersByTime(TAP_GUARD_MS + 10); });
    fireEvent.click(getByText('Geschafft'));
    expect(complete).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenLastCalledWith('s_dress');
  });

  it('Später calls nothing on the context, it only hands the task back', () => {
    const onLater = vi.fn();
    const { getByText } = render(<NowCard quest={quest} onLater={onLater} />);
    fireEvent.click(getByText('Später'));
    expect(complete).not.toHaveBeenCalled();
    expect(onLater).toHaveBeenCalledWith(quest);
  });

  it('is quiet (secondary pill, not loud) when asked', () => {
    const { getByTestId } = render(<NowCard quest={quest} loud={false} />);
    expect(getByTestId('now-card').getAttribute('data-loud')).toBeNull();
  });
});

describe('TaskRow', () => {
  const slots = [
    { id: 's_wake', anchor: 'morning', order: 1, done: true },
    { id: 's_breakfast', anchor: 'morning', order: 2, done: false },
  ];
  it('picks a task and never completes one', () => {
    const onPick = vi.fn();
    const { getByLabelText } = render(<TaskRow slots={slots} currentId="s_breakfast" onPick={onPick} />);
    fireEvent.click(getByLabelText('Frühstück'));
    fireEvent.click(getByLabelText('Aufstehen'));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith('s_breakfast');
    expect(complete).not.toHaveBeenCalled();
    expect(getByLabelText('Aufstehen').getAttribute('data-done')).toBe('true');
  });
});
