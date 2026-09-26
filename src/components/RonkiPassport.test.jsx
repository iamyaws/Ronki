// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

// Ronki's passport (Finch pass, 26 Sep 2026; spec R8). TaskContext and
// the voice bank are stubbed so the test only looks at what the page
// shows and says.
let mockState;
let mockActions = {};
vi.mock('../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions: mockActions }),
}));
const playLocalized = vi.fn();
vi.mock('../utils/voiceAudio', () => ({
  default: { playLocalized: (...a) => playLocalized(...a), playNarrator: vi.fn(), isMuted: () => true },
}));

import RonkiPassport, { shelfItems } from './RonkiPassport';

const base = () => ({
  companionName: 'Funki',
  companionVariant: 'forest',
  catEvo: 3,
  ronkiMood: 'normal',
  taughtSignature: 'fire',
  adventureCount: 0,
  expeditionLog: [],
  familyConfig: { childName: 'Louis' },
});

const memento = (tripId, extra = {}) => ({
  id: `m-${tripId}-${Math.random()}`,
  ts: '2026-09-26T17:00:00.000Z',
  emoji: '?',
  name: 'x',
  biome: 'morgenwald',
  location: '',
  quote: '',
  tripId,
  ...extra,
});

describe('RonkiPassport', () => {
  beforeEach(() => {
    mockActions = {};
    playLocalized.mockClear();
    mockState = base();
  });

  it('shows his name and whose friend he is', () => {
    const { getByText } = render(<RonkiPassport onOpenParental={() => {}} />);
    expect(getByText('Funki')).toBeTruthy();
    expect(getByText('Der Freund von Louis')).toBeTruthy();
  });

  it('falls back to Ronki when he has no name yet', () => {
    mockState = { ...base(), companionName: '' };
    const { getByRole } = render(<RonkiPassport />);
    expect(getByRole('heading', { level: 1 }).textContent).toBe('Ronki');
  });

  it('plays passport_hello_01 and shows the line when Ronki is tapped', () => {
    const { getByTestId, getByText } = render(<RonkiPassport />);
    fireEvent.click(getByTestId('passport-ronki'));
    expect(playLocalized).toHaveBeenCalledWith('passport_hello_01', 0);
    expect(getByText('Das bin ich! Und das alles haben wir zusammen gemacht.')).toBeTruthy();
  });

  it('shows the fire sticker when the child taught him fire', () => {
    const { getByTestId } = render(<RonkiPassport />);
    expect(getByTestId('sticker-fire').textContent).toContain('Kann Feuer pusten. Louis hat es ihm gezeigt.');
  });

  it('has no fire sticker without taughtSignature', () => {
    mockState = { ...base(), taughtSignature: undefined };
    const { queryByTestId } = render(<RonkiPassport />);
    expect(queryByTestId('sticker-fire')).toBeNull();
  });

  it('shows the adventures sticker only when there is at least one', () => {
    const { queryByTestId, rerender } = render(<RonkiPassport />);
    expect(queryByTestId('sticker-adventures')).toBeNull();
    mockState = { ...base(), adventureCount: 4, expeditionLog: [memento('t01'), memento('t02'), memento('t03'), memento('t04')] };
    rerender(<RonkiPassport />);
    expect(queryByTestId('sticker-adventures').textContent).toContain('4 Abenteuer');
  });

  it('the child picks a favourite treasure from its story card, and Ronki says so', () => {
    mockActions = { setFavoriteTreasure: vi.fn() };
    mockState = { ...base(), adventureCount: 2, expeditionLog: [memento('t01'), memento('t02')] };
    const { getAllByTestId, getByTestId } = render(<RonkiPassport />);
    fireEvent.click(getAllByTestId('treasure-tile')[1]);
    fireEvent.click(getByTestId('treasure-favourite'));
    expect(mockActions.setFavoriteTreasure).toHaveBeenCalledWith('trip-t02');
    expect(playLocalized).toHaveBeenCalledWith('fav_set_01', 0);
  });

  it('the favourite stands first on the shelf with a heart, and its heart button is pressed', () => {
    mockActions = { setFavoriteTreasure: vi.fn() };
    mockState = { ...base(), adventureCount: 3, favoriteTreasure: 'trip-t02', expeditionLog: [memento('t01'), memento('t02'), memento('t03')] };
    const { getAllByTestId, getByTestId } = render(<RonkiPassport />);
    const tiles = getAllByTestId('treasure-tile');
    expect(tiles[0].textContent).toContain('Lichtung');
    expect(tiles[0].querySelector('[data-testid="treasure-heart"]')).toBeTruthy();
    expect(tiles[1].querySelector('[data-testid="treasure-heart"]')).toBeNull();
    fireEvent.click(tiles[0]);
    expect(getByTestId('treasure-favourite').getAttribute('aria-pressed')).toBe('true');
    playLocalized.mockClear();
    fireEvent.click(getByTestId('treasure-favourite')); // the same one again takes the heart away
    expect(mockActions.setFavoriteTreasure).toHaveBeenCalledWith('trip-t02');
    expect(playLocalized).not.toHaveBeenCalledWith('fav_set_01', 0);
  });

  it('an old keepsake without an id or a time can be looked at but not be the favourite (Astra TF-01)', () => {
    mockActions = { setFavoriteTreasure: vi.fn() };
    mockState = { ...base(), adventureCount: 1, expeditionLog: [{ emoji: '🐚', name: 'Muschel', quote: 'Vom Meer.' }] };
    const { getAllByTestId, queryByTestId, getByTestId } = render(<RonkiPassport />);
    fireEvent.click(getAllByTestId('treasure-tile')[0]);
    expect(getByTestId('treasure-story')).toBeTruthy();
    expect(queryByTestId('treasure-favourite')).toBeNull();
  });

  it('shows the stepping stones', () => {
    const { getByTestId } = render(<RonkiPassport />);
    expect(getByTestId('step-stones')).toBeTruthy();
  });

  it('shelf shows found treasures only: no empty slots, no "von 14"', () => {
    mockState = { ...base(), adventureCount: 2, expeditionLog: [memento('t01'), memento('t02')] };
    const { getAllByTestId, getByText, container } = render(<RonkiPassport />);
    expect(getAllByTestId('treasure-tile')).toHaveLength(2);
    expect(getByText('Birkenpfad')).toBeTruthy();
    expect(getByText('Lichtung')).toBeTruthy();
    expect(getByText('Funkis Schatzregal')).toBeTruthy();
    expect(container.textContent).not.toMatch(/von 14/);
    expect(container.textContent).not.toMatch(/\d+\s*\/\s*14/);
  });

  it('has no shelf at all before the first treasure', () => {
    const { queryByTestId } = render(<RonkiPassport />);
    expect(queryByTestId('treasure-shelf')).toBeNull();
  });

  it('tapping a treasure shows its story and Ronki tells it', () => {
    mockState = { ...base(), adventureCount: 1, expeditionLog: [memento('t01')] };
    const { getByTestId } = render(<RonkiPassport />);
    fireEvent.click(getByTestId('treasure-tile'));
    expect(getByTestId('treasure-story').textContent).toContain('Hinter den Birken ist ein kleiner Pfad.');
    expect(playLocalized).toHaveBeenCalledWith('trip_story_01', 0);
  });

  it('an old memento without tripId shows its quote and stays silent', () => {
    mockState = {
      ...base(),
      adventureCount: 1,
      expeditionLog: [{ id: 'old1', ts: '2026-05-01T10:00:00Z', emoji: '🌰', name: 'Eichel', biome: 'morgenwald', location: 'Unter der Eiche', quote: 'Die hatte noch ihr Hütchen auf.' }],
    };
    const { getByTestId } = render(<RonkiPassport />);
    fireEvent.click(getByTestId('treasure-tile'));
    expect(getByTestId('treasure-story').textContent).toContain('Die hatte noch ihr Hütchen auf.');
    expect(playLocalized).not.toHaveBeenCalled();
  });

  it('a repeated trip id shows once', () => {
    expect(shelfItems([memento('t01'), memento('t02'), memento('t01')])).toHaveLength(2);
  });

  it('the "Für Eltern" link opens the parent gate', () => {
    const onOpenParental = vi.fn();
    const { getByText } = render(<RonkiPassport onOpenParental={onOpenParental} />);
    fireEvent.click(getByText('Für Eltern'));
    expect(onOpenParental).toHaveBeenCalledTimes(1);
  });

  it('never says streak words or counts days in a row', () => {
    mockState = { ...base(), adventureCount: 3, expeditionLog: [memento('t01'), memento('t02'), memento('t03')] };
    const { container } = render(<RonkiPassport />);
    const text = container.textContent;
    expect(text).not.toMatch(/streak|in Folge|in einer Reihe|Serie|verpasst|verloren/i);
    expect(text).not.toMatch(/Tage alt/);
  });
});
