// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';

// The Nest reads TaskContext and talks to the voice bank and analytics;
// all three are stubbed. The clock is the faked system time.
let mockState;
const actions = {};
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playNarrator: vi.fn(), playLocalized: vi.fn(), play: vi.fn(), stop: vi.fn(), isMuted: () => true },
}));
vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));

import VoiceAudio from '../../utils/voiceAudio';
import RoomHub from './RoomHub';
import { dayKey } from '../../loop/clock';
import { lineText } from '../../data/ronkiLines';

// 2026-09-28 is a Monday.
const MON = (hhmm) => new Date(`2026-09-28T${hhmm}:00`);

const MORNING = ['s_wake', 's_breakfast', 's_teeth_am', 's_dress', 's_packcheck'];
const EVENING = ['s_teeth_pm', 's_wash_pm', 's_pyjama', 's_cuddle'];

function quests({ morningDone = 0, eveningDone = 0, moveDone = false } = {}) {
  const q = [];
  MORNING.forEach((id, i) => q.push({ id, name: id, anchor: 'morning', order: i + 1, done: i < morningDone }));
  q.push({ id: 's_move', name: '10 Min bewegen', anchor: 'evening', order: 1, done: moveDone });
  EVENING.forEach((id, i) => q.push({ id, name: id, anchor: 'bedtime', order: i + 1, done: i < eveningDone }));
  // A side quest with a morning anchor never counts toward the fire.
  q.push({ id: 'side_1', name: 'Side', anchor: 'morning', order: 9, done: false, sideQuest: true });
  return q;
}

function baseState(when, extra = {}) {
  return {
    catEvo: 5,
    stageSeen: 1,
    adventureCount: 2,
    tripCursor: 2,
    ronkiMood: 'normal',
    companionName: 'Funki',
    companionVariant: 'forest',
    familyConfig: { childName: 'Mia' },
    onboardingDate: '2026-09-01',
    greetedDate: dayKey(when),
    lastGapDays: 1,
    lastTripDate: null,
    moodAM: null,
    moodPM: null,
    quests: quests(),
    expedition: { state: 'home' },
    expeditionLog: [],
    ...extra,
  };
}

function setup(when, extra = {}, props = {}) {
  vi.setSystemTime(when);
  mockState = baseState(when, extra);
  const onOpenParental = vi.fn();
  const onOpenTonight = vi.fn();
  const onNavigate = vi.fn();
  const utils = render(
    <RoomHub onNavigate={onNavigate} onOpenParental={onOpenParental} onOpenTonight={onOpenTonight} {...props} />,
  );
  return { ...utils, onOpenParental, onOpenTonight, onNavigate };
}

const loud = (c) => c.querySelectorAll('[data-loud="true"]');
const mode = (c) => c.querySelector('[data-mode]').getAttribute('data-mode');
const bubble = () => screen.queryByTestId('ronki-bubble');

beforeEach(() => {
  vi.useFakeTimers();
  for (const k of Object.keys(actions)) delete actions[k];
  Object.assign(actions, {
    complete: vi.fn(),
    setMood: vi.fn(),
    departTrip: vi.fn(),
    receiveTreasure: vi.fn(),
    markStageSeen: vi.fn(),
    markGreeted: vi.fn(),
  });
  VoiceAudio.playLocalized.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('RoomHub: one loud item per state', () => {
  it('morning: the Jetzt card for the next task, the fire and the row', () => {
    const { container } = setup(MON('07:10'));
    expect(mode(container)).toBe('fire');
    expect(loud(container)).toHaveLength(1);
    const card = screen.getByTestId('now-card');
    expect(card.getAttribute('data-loud')).toBe('true');
    expect(card.getAttribute('data-quest')).toBe('s_wake');
    const bowl = screen.getByTestId('fire-bowl');
    expect(bowl.getAttribute('data-lit')).toBe('0');
    expect(bowl.getAttribute('data-total')).toBe('5');
    expect(screen.getByTestId('task-row').querySelectorAll('button')).toHaveLength(5);
    // Ronki asks for the task in his bubble and says it once.
    expect(bubble().textContent).toBe(lineText('task_ask_wake'));
    act(() => { vi.advanceTimersByTime(500); });
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('task_ask_wake', 400);
  });

  it('morning: Geschafft completes the card task, lights a flame line, Später only reorders', () => {
    const { container } = setup(MON('07:10'));
    fireEvent.click(screen.getByText('Später'));
    expect(actions.complete).not.toHaveBeenCalled();
    expect(screen.getByTestId('now-card').getAttribute('data-quest')).toBe('s_breakfast');
    expect(bubble().textContent).toBe(lineText('task_later_01'));
    fireEvent.click(screen.getByText('Geschafft'));
    expect(actions.complete).toHaveBeenCalledTimes(1);
    expect(actions.complete).toHaveBeenCalledWith('s_breakfast');
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('fire_lit_01', 0);
    expect(loud(container)).toHaveLength(1);
  });

  it('a tap in the task row picks the card task and never completes it', () => {
    setup(MON('07:10'));
    fireEvent.click(screen.getByLabelText('Anziehen'));
    expect(actions.complete).not.toHaveBeenCalled();
    expect(screen.getByTestId('now-card').getAttribute('data-quest')).toBe('s_dress');
  });

  it('full morning fire: Ronki cheers, then the send-off sheet, and Tschüss departs once', () => {
    const { container } = setup(MON('07:40'), { quests: quests({ morningDone: 5 }) });
    expect(mode(container)).toBe('departure');
    expect(loud(container)).toHaveLength(1);
    expect(screen.getByTestId('departure-card')).toBeTruthy();
    expect(bubble().textContent).toBe(lineText('fire_full_morning_01'));
    expect(screen.queryByTestId('departure-sheet')).toBeNull();
    act(() => { vi.advanceTimersByTime(3900); });
    const sheet = screen.getByTestId('departure-sheet');
    const pill = Array.from(sheet.querySelectorAll('button')).find(b => b.textContent.includes('Tschüss, Funki!'));
    fireEvent.click(pill);
    fireEvent.click(screen.getByText('Tschüss, Funki!'));
    expect(actions.departTrip).toHaveBeenCalledTimes(1);
    expect(actions.departTrip).toHaveBeenCalledWith('day');
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('trip_bye_school_01', 0);
    expect(screen.queryByTestId('departure-sheet')).toBeNull();
  });

  it('a full morning with a trip already today does not send him again', () => {
    const when = MON('07:40');
    const { container } = setup(when, { quests: quests({ morningDone: 5 }), lastTripDate: dayKey(when) });
    expect(mode(container)).toBe('stay');
    expect(screen.queryByTestId('departure-card')).toBeNull();
  });

  it('day block, morning not full: Ronki stays home with the afternoon task', () => {
    const { container } = setup(MON('13:00'), { quests: quests({ morningDone: 2 }) });
    expect(mode(container)).toBe('stay');
    expect(loud(container)).toHaveLength(1);
    expect(screen.getByTestId('now-card').getAttribute('data-quest')).toBe('s_move');
    expect(bubble().textContent).toBe(lineText('home_stay_01'));
    expect(screen.queryByTestId('fire-bowl')).toBeNull();
    expect(screen.getByTestId('ronki-cutout')).toBeTruthy();
  });

  it('day block with nothing left: sitting with Ronki is the loud item', () => {
    const { container } = setup(MON('13:00'), { quests: quests({ moveDone: true }) });
    expect(loud(container)).toHaveLength(1);
    expect(loud(container)[0].textContent).toContain('Bei Ronki sitzen');
  });

  it('day 1 in the day block: no departure, even with the morning fire full (spec R4)', () => {
    const when = MON('13:00');
    const { container } = setup(when, {
      onboardingDate: dayKey(when),
      adventureCount: 0,
      quests: quests({ morningDone: 5 }),
    });
    expect(mode(container)).toBe('stay');
    expect(screen.queryByTestId('departure-card')).toBeNull();
    expect(bubble().textContent).toBe(lineText('fd_start_day_01'));
  });

  it('after a full morning the send-off still waits in the day block (not day 1)', () => {
    const { container } = setup(MON('12:30'), { quests: quests({ morningDone: 5 }) });
    expect(mode(container)).toBe('departure');
  });

  it('away: the room without Ronki, no bubble, the postcard is loud', () => {
    const { container } = setup(MON('13:00'), { expedition: { state: 'away', kind: 'day', tripId: 't03' } });
    expect(mode(container)).toBe('away');
    expect(loud(container)).toHaveLength(1);
    expect(screen.getByTestId('away-card').getAttribute('data-loud')).toBe('true');
    expect(screen.queryByTestId('ronki-cutout')).toBeNull();
    expect(bubble()).toBeNull();
    // The afternoon task is still there, quietly.
    expect(screen.getByTestId('now-card').getAttribute('data-loud')).toBeNull();
    fireEvent.click(screen.getByTestId('away-card'));
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('away_day_01', 0);
    expect(screen.getByTestId('away-peek')).toBeTruthy();
  });

  it('waiting: the wrapped treasure, the reveal, and receiveTreasure exactly once', () => {
    const exp = {
      state: 'waiting',
      kind: 'day',
      tripId: 't03',
      pendingMemento: { id: 'm1', ts: 'x', emoji: '🪨', name: 'Bachstein', tripId: 't03' },
    };
    const { container } = setup(MON('17:10'), { expedition: exp });
    expect(mode(container)).toBe('waiting');
    expect(loud(container)).toHaveLength(1);
    expect(bubble().textContent).toBe(lineText('trip_back_01'));
    fireEvent.click(screen.getByText('Aufmachen'));
    const reveal = screen.getByTestId('treasure-reveal');
    expect(reveal.textContent).toContain('Bachstein');
    expect(reveal.textContent).toContain('Am Bach hab ich die Füße ins Wasser gehalten.');
    const shelve = screen.getByText('Ins Regal stellen');
    fireEvent.click(shelve);
    fireEvent.click(shelve);
    expect(actions.receiveTreasure).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('treasure-reveal')).toBeNull();
  });

  it('evening: the evening fire with the moon card always there, quiet', () => {
    const { container, onOpenTonight } = setup(MON('18:00'), { quests: quests({ morningDone: 5 }), lastTripDate: '2026-09-28' });
    expect(mode(container)).toBe('fire');
    expect(loud(container)).toHaveLength(1);
    expect(screen.getByTestId('now-card').getAttribute('data-quest')).toBe('s_teeth_pm');
    const moon = screen.getByTestId('moon-card');
    expect(moon.getAttribute('data-loud')).toBeNull();
    expect(moon.textContent).toContain(lineText('eve_moon_01'));
    fireEvent.click(moon);
    expect(onOpenTonight).toHaveBeenCalledTimes(1);
  });

  it('evening fire full: the moon card becomes the loud card', () => {
    const { container } = setup(MON('19:00'), { quests: quests({ morningDone: 5, eveningDone: 4 }) });
    expect(mode(container)).toBe('evening');
    expect(loud(container)).toHaveLength(1);
    expect(screen.getByTestId('moon-card').getAttribute('data-loud')).toBe('true');
    expect(bubble().textContent).toBe(lineText('fire_full_evening_01'));
    expect(screen.queryByTestId('now-card')).toBeNull();
  });

  it('night: Ronki asleep, no card, a tap says he is dreaming', () => {
    const { container } = setup(MON('20:00'), { eveningRitualCompletedAt: MON('19:40').toISOString() });
    expect(mode(container)).toBe('night');
    expect(loud(container)).toHaveLength(0);
    expect(screen.queryByTestId('now-card')).toBeNull();
    expect(screen.queryByTestId('moon-card')).toBeNull();
    fireEvent.click(screen.getByTestId('nest-asleep'));
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('away_sleep_01', 0);
    expect(bubble().textContent).toBe(lineText('away_sleep_01'));
  });

  it('a dream trip shows him asleep too', () => {
    const { container } = setup(MON('21:00'), { expedition: { state: 'away', kind: 'night', tripId: 't03' } });
    expect(mode(container)).toBe('night');
  });
});

describe('RoomHub: header, cuts and extras', () => {
  it('the lock opens the parent area', () => {
    const { onOpenParental } = setup(MON('07:10'));
    fireEvent.click(screen.getByLabelText('Eltern-Bereich'));
    expect(onOpenParental).toHaveBeenCalledTimes(1);
  });

  it('greets the child by name, with a fallback', () => {
    setup(MON('07:10'));
    expect(screen.getByText('Hallo Mia!')).toBeTruthy();
  });

  it('has no Karte, no Schriftrolle, no anchor tiles, and no Spielzeug without Extras', () => {
    const { container } = setup(MON('07:10'));
    const text = container.textContent;
    for (const gone of ['Karte', 'Schriftrolle', 'Morgens', 'Nachmittag', 'Abends', 'Ronki ist bereit', 'Spielzeug', 'Fundstücke']) {
      expect(text).not.toContain(gone);
    }
  });

  it('shows Spielzeug only with the Extras switch', () => {
    const { onNavigate } = setup(MON('07:10'), { extrasEnabled: true });
    fireEvent.click(screen.getByText('Spielzeug'));
    expect(onNavigate).toHaveBeenCalledWith('spiele');
  });

  it('the face button opens the feelings any time; a pick before noon writes moodAM', () => {
    setup(MON('09:00'), { moodAM: 2 });
    fireEvent.click(screen.getByTestId('face-button'));
    expect(screen.getByTestId('feelings-sheet')).toBeTruthy();
    fireEvent.click(screen.getByText('Gut'));
    expect(actions.setMood).toHaveBeenCalledWith('moodAM', 3);
  });

  it('after Traurig, sitting with Ronki becomes the loud card for this open', () => {
    const { container } = setup(MON('07:10'));
    fireEvent.click(screen.getByTestId('face-button'));
    fireEvent.click(screen.getByText('Traurig'));
    fireEvent.click(screen.getByLabelText('Schließen'));
    expect(loud(container)).toHaveLength(1);
    expect(loud(container)[0].textContent).toContain('Bei Ronki sitzen');
    expect(screen.getByTestId('now-card').getAttribute('data-loud')).toBeNull();
  });

  it('shows the last treasures, found only', () => {
    setup(MON('07:10'), { expeditionLog: [{ id: 'a', emoji: '🍁', name: 'Ahornblatt' }] });
    expect(screen.getByTestId('treasure-shelf').textContent).toBe('🍁');
  });

  it('no kid-facing text of any state speaks of streaks, missing or waiting', () => {
    const bad = /streak|verpasst|vermisst|Serie|in Folge|wartet auf dich/i;
    const cases = [
      [MON('07:10'), {}],
      [MON('07:40'), { quests: quests({ morningDone: 5 }) }],
      [MON('13:00'), {}],
      [MON('13:00'), { expedition: { state: 'away', kind: 'day' } }],
      [MON('17:10'), { expedition: { state: 'waiting', kind: 'day', tripId: 't01', pendingMemento: { id: 'm', ts: 'x', emoji: '🍁', name: 'Ahornblatt' } } }],
      [MON('19:00'), { quests: quests({ eveningDone: 4 }) }],
      [MON('20:00'), { eveningRitualCompletedAt: MON('19:40').toISOString() }],
      [MON('07:10'), { greetedDate: '2026-09-20', lastGapDays: 8 }],
    ];
    for (const [when, extra] of cases) {
      const { container, unmount } = setup(when, extra);
      act(() => { vi.advanceTimersByTime(4000); });
      expect(container.textContent).not.toMatch(bad);
      expect(document.body.textContent).not.toMatch(bad);
      unmount();
    }
  });
});

describe('RoomHub: the return beat and growth', () => {
  it('plays the return line on the first open of the day and marks it once', () => {
    const { rerender } = setup(MON('07:10'), { greetedDate: '2026-09-22', lastGapDays: 6 });
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('return_long_01', 0);
    expect(bubble().textContent).toBe(lineText('return_long_01'));
    expect(actions.markGreeted).toHaveBeenCalledTimes(1);
    rerender(<RoomHub onNavigate={() => {}} onOpenParental={() => {}} onOpenTonight={() => {}} />);
    expect(actions.markGreeted).toHaveBeenCalledTimes(1);
    // The greeting passes, the task ask comes back.
    act(() => { vi.advanceTimersByTime(3700); });
    expect(bubble().textContent).toBe(lineText('task_ask_wake'));
  });

  it('does not greet again once today is greeted', () => {
    setup(MON('07:10'));
    expect(actions.markGreeted).not.toHaveBeenCalled();
  });

  it('never shows Ronki sad on a return day', () => {
    setup(MON('07:10'), { ronkiMood: 'sad', greetedDate: '2026-09-20', lastGapDays: 8 });
    const imgs = Array.from(screen.getByTestId('ronki-cutout').querySelectorAll('img'));
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img.getAttribute('src') || '').not.toMatch(/heavy|worried|sleepy/);
  });

  it('shows the growth beat for an unseen stage and marks it seen on Weiter', () => {
    setup(MON('07:10'), { catEvo: 9, stageSeen: 1, adventureCount: 6 });
    expect(screen.getByTestId('growth-beat')).toBeTruthy();
    fireEvent.click(screen.getByText('Weiter'));
    expect(actions.markStageSeen).toHaveBeenCalledWith(2);
    expect(screen.queryByTestId('growth-beat')).toBeNull();
  });

  it('after the treasure in the evening, asks once how the day was (moodPM)', () => {
    const exp = { state: 'waiting', kind: 'day', tripId: 't02', pendingMemento: { id: 'm', ts: 'x', emoji: '🪶', name: 'Feder' } };
    setup(MON('17:30'), { expedition: exp });
    fireEvent.click(screen.getByText('Aufmachen'));
    fireEvent.click(screen.getByText('Ins Regal stellen'));
    const sheet = screen.getByTestId('feelings-sheet');
    expect(sheet.textContent).toContain(lineText('eve_mood_ask_01'));
    fireEvent.click(screen.getByText('Okay'));
    expect(actions.setMood).toHaveBeenCalledWith('moodPM', 2);
  });
});
