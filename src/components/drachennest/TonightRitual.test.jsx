// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';

let mockState;
const actions = { completeTonight: vi.fn(), departTrip: vi.fn() };
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playNarrator: vi.fn(), playLocalized: vi.fn(), isMuted: () => true },
}));
vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));

import VoiceAudio from '../../utils/voiceAudio';
import TonightRitual, { tonightHook, todaysTrip, TONIGHT_STORIES, STORY_MS, BLACK_MS } from './TonightRitual';
import { dayKey } from '../../loop/clock';
import { tripAt, tripById } from '../../data/trips';
import { lineText } from '../../data/ronkiLines';

const EVE = new Date('2026-09-28T19:30:00');
const bedtime = (done) => ['s_teeth_pm', 's_wash_pm', 's_pyjama', 's_cuddle']
  .map((id, i) => ({ id, name: id, anchor: 'bedtime', order: i + 1, done }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(EVE);
  actions.completeTonight.mockClear();
  actions.departTrip.mockClear();
  VoiceAudio.playLocalized.mockClear();
  mockState = { onboardingDate: '2026-09-01', adventureCount: 3, tripCursor: 3, quests: bedtime(false), expedition: { state: 'home' } };
});
afterEach(() => vi.useRealTimers());

function runToStory() {
  act(() => { vi.advanceTimersByTime(2400); });
  act(() => { vi.advanceTimersByTime(4400); });
}

describe('tonightHook', () => {
  it('after a trip today: the next trip, never with a time word', () => {
    const today = dayKey(EVE);
    const waiting = { lastTripDate: today, tripCursor: 3, expedition: { state: 'away', pendingMemento: { id: 'm' } } };
    const h = tonightHook(waiting, EVE);
    expect(h).toMatchObject({ id: tripAt(4).hookVoice, text: tripAt(4).hook, dream: false });
    expect(h.text).not.toMatch(/Morgen/);
    const received = { lastTripDate: today, tripCursor: 4, expedition: { state: 'home' } };
    expect(tonightHook(received, EVE).id).toBe(tripAt(4).hookVoice);
  });

  it('no trip today and the evening fire full: the dream trip', () => {
    expect(tonightHook({ quests: bedtime(true) }, EVE)).toMatchObject({ id: 'night_trip_01', dream: true });
  });

  it('otherwise Ronki sleeps in the nest', () => {
    expect(tonightHook({ quests: bedtime(false) }, EVE)).toMatchObject({ id: 'sleep_nest_01', dream: false, text: lineText('sleep_nest_01') });
  });
});

describe('TonightRitual', () => {
  it('can be closed from the first frame, and closing early completes nothing', () => {
    const onClose = vi.fn();
    render(<TonightRitual onClose={onClose} />);
    fireEvent.click(screen.getByTestId('tonight-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(actions.completeTonight).not.toHaveBeenCalled();
    expect(actions.departTrip).not.toHaveBeenCalled();
  });

  it('shows the hook before the curtain and completes the evening at the end', () => {
    render(<TonightRitual onClose={() => {}} />);
    runToStory();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(dialog.textContent).toContain(lineText('sleep_nest_01'));
    act(() => { vi.advanceTimersByTime(300); });
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('sleep_nest_01', 200);
    act(() => { vi.advanceTimersByTime(6500); });
    act(() => { vi.advanceTimersByTime(12000); });
    expect(actions.completeTonight).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).not.toHaveBeenCalled();
    expect(dialog.textContent).toContain('Schlaf gut.');
    expect(dialog.textContent).not.toContain('Nochmal');
  });

  it('a full evening fire with no trip today sends Ronki on his dream trip at the end', () => {
    mockState = { ...mockState, quests: bedtime(true) };
    render(<TonightRitual onClose={() => {}} />);
    runToStory();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog); // story -> hook
    expect(dialog.textContent).toContain(lineText('night_trip_01'));
    fireEvent.click(dialog); // hook -> curtain
    fireEvent.click(dialog); // curtain -> black
    expect(actions.completeTonight).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).toHaveBeenCalledWith('night');
  });

  it('after a day trip tells the next trip hook', () => {
    mockState = { ...mockState, lastTripDate: dayKey(EVE), tripCursor: 3, expedition: { state: 'waiting', pendingMemento: { id: 'm' } } };
    render(<TonightRitual onClose={() => {}} />);
    runToStory();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(dialog.textContent).toContain(tripAt(4).hook);
  });

  it('closing during the hook keeps the dream trip that was just promised (LOOP-2, KIDUX-2)', () => {
    mockState = { ...mockState, quests: bedtime(true) };
    const onClose = vi.fn();
    render(<TonightRitual onClose={onClose} />);
    runToStory();
    fireEvent.click(screen.getByRole('dialog')); // story -> hook
    expect(actions.completeTonight).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).toHaveBeenCalledWith('night');
    fireEvent.click(screen.getByTestId('tonight-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(actions.completeTonight).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).toHaveBeenCalledTimes(1);
  });

  it('closing during the story, before the hook, still changes nothing', () => {
    mockState = { ...mockState, quests: bedtime(true) };
    const onClose = vi.fn();
    render(<TonightRitual onClose={onClose} />);
    runToStory();
    fireEvent.click(screen.getByTestId('tonight-close'));
    expect(actions.completeTonight).not.toHaveBeenCalled();
    expect(actions.departTrip).not.toHaveBeenCalled();
  });

  it('the story moves to the hook by itself, for a child who does not tap (KIDUX-2)', () => {
    mockState = { ...mockState, quests: bedtime(true) };
    render(<TonightRitual onClose={() => {}} />);
    runToStory();
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).not.toContain(lineText('night_trip_01'));
    act(() => { vi.advanceTimersByTime(STORY_MS); });
    expect(dialog.textContent).toContain(lineText('night_trip_01'));
    expect(actions.completeTonight).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).toHaveBeenCalledWith('night');
    // Hook, curtain, black: all by themselves, and nothing twice.
    act(() => { vi.advanceTimersByTime(6500); });
    act(() => { vi.advanceTimersByTime(12000); });
    expect(dialog.textContent).toContain('Schlaf gut.');
    expect(actions.completeTonight).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).toHaveBeenCalledTimes(1);
  });

  it('the black end closes itself after about 20 seconds (KIDUX-10)', () => {
    const onClose = vi.fn();
    render(<TonightRitual onClose={onClose} />);
    runToStory();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog); // hook
    fireEvent.click(dialog); // curtain
    fireEvent.click(dialog); // black
    expect(dialog.textContent).toContain('Schlaf gut.');
    act(() => { vi.advanceTimersByTime(BLACK_MS - 100); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(200); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('after a trip came back today, tells that trip story, voiced (own read O4)', () => {
    const t = tripById('t03');
    const ts = new Date('2026-09-28T07:45:00').toISOString();
    mockState = {
      ...mockState,
      lastTripDate: dayKey(EVE),
      tripCursor: 3,
      expedition: { state: 'home' },
      expeditionLog: [{ id: 'm', ts, emoji: t.emoji, name: t.treasure, tripId: 't03' }],
    };
    render(<TonightRitual onClose={() => {}} />);
    runToStory();
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain(t.story);
    for (const old of TONIGHT_STORIES) expect(dialog.textContent).not.toContain(old);
    act(() => { vi.advanceTimersByTime(700); });
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith(t.storyVoice, 600);
    expect(VoiceAudio.playLocalized.mock.calls.some(([id]) => String(id).startsWith('tonight_story_'))).toBe(false);
  });

  it('todaysTrip: a waiting day trip counts, a dream trip or yesterday does not', () => {
    const today = dayKey(EVE);
    expect(todaysTrip({ lastTripDate: today, expedition: { state: 'waiting', kind: 'day', tripId: 't05' } }, EVE).id).toBe('t05');
    expect(todaysTrip({ lastTripDate: today, expedition: { state: 'waiting', kind: 'night', tripId: 't05' } }, EVE)).toBeNull();
    expect(todaysTrip({ lastTripDate: today, expedition: { state: 'away', kind: 'day', tripId: 't05' } }, EVE)).toBeNull();
    expect(todaysTrip({ lastTripDate: '2026-09-27', expedition: { state: 'home' } }, EVE)).toBeNull();
    const oldTs = new Date('2026-09-27T07:45:00').toISOString();
    expect(todaysTrip({ lastTripDate: today, expedition: { state: 'home' }, expeditionLog: [{ ts: oldTs, tripId: 't02' }] }, EVE)).toBeNull();
  });

  it('without a trip today, one of the ten old stories', () => {
    render(<TonightRitual onClose={() => {}} />);
    runToStory();
    const text = screen.getByRole('dialog').textContent;
    expect(TONIGHT_STORIES.some(line => text.includes(line))).toBe(true);
  });

  it('at the end Ronki sleeps in his own look, not the generic pose art (FC-05)', () => {
    mockState = { ...mockState, catEvo: 0, companionVariant: 'sunset' };
    render(<TonightRitual onClose={() => {}} />);
    runToStory();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    fireEvent.click(dialog);
    fireEvent.click(dialog);
    const img = screen.getByTestId('tonight-sleep').querySelector('img');
    expect(img.getAttribute('src')).toContain('eggs/egg-ember.webp');
    expect(img.getAttribute('src')).not.toContain('ronki/sleep.webp');
  });

  it('keeps its ten bedtime stories for the voice bank', () => {
    expect(TONIGHT_STORIES).toHaveLength(10);
  });
});
