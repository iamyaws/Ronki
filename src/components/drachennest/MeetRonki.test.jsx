// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';

vi.mock('../../context/TaskContext', () => ({ useTask: () => ({ state: {}, actions: {} }) }));
const analytics = vi.hoisted(() => ({ track: null }));
vi.mock('../../lib/analytics', () => {
  analytics.track = vi.fn();
  return { track: analytics.track };
});
const voice = vi.hoisted(() => ({ play: null, playLocalized: null }));
vi.mock('../../utils/voiceAudio', () => {
  voice.play = vi.fn();
  voice.playLocalized = vi.fn();
  return { default: { play: voice.play, playLocalized: voice.playLocalized, playNarrator: vi.fn(), stop: vi.fn() } };
});

import MeetRonki, { EGGS, NAME_CHIPS } from './MeetRonki';
import { lineText } from '../../data/ronkiLines';

const OLD_IDS = ['amber', 'teal', 'rose', 'violet', 'forest', 'sunset'];

function mockReducedMotion(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

describe('MeetRonki eggs', () => {
  it('offers four eggs that each write one of the existing companionVariant ids', () => {
    expect(EGGS.map(e => e.id)).toEqual(['cream', 'ember', 'sun', 'cobalt']);
    for (const egg of EGGS) expect(OLD_IDS).toContain(egg.variant);
    expect(new Set(EGGS.map(e => e.variant)).size).toBe(4);
  });
});

describe('MeetRonki hatch beat (reduced motion, no clip)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReducedMotion(true);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs approach, shelf, wobble, the still hatch, meet, name and close, then reports the pick', () => {
    const onComplete = vi.fn();
    const { container } = render(<MeetRonki onComplete={onComplete} needsParent />);

    // approach: caption, no eggs yet
    expect(screen.getByText('Da hinten leuchtet etwas.')).toBeTruthy();
    expect(screen.queryByLabelText('Ei wählen: Rot')).toBeNull();

    // shelf after 3.6 s: four eggs
    act(() => { vi.advanceTimersByTime(3600); });
    for (const label of ['Weiß', 'Rot', 'Gelb', 'Blau']) {
      expect(screen.getByLabelText(`Ei wählen: ${label}`)).toBeTruthy();
    }

    // pick the ember egg: wobble caption, no clip mounted under reduced motion
    fireEvent.click(screen.getByLabelText('Ei wählen: Rot'));
    expect(screen.getByText('Eines zittert leicht.')).toBeTruthy();
    expect(container.querySelector('video')).toBeNull();

    // wobble 1.4 s, then the still hatch 1.4 s, then Ronki's first line
    act(() => { vi.advanceTimersByTime(1400); });
    expect(screen.queryByText('Hallo. Ich hab auf dich gewartet. Glaub ich.')).toBeNull();
    act(() => { vi.advanceTimersByTime(1400); });
    expect(screen.getByText('Hallo. Ich hab auf dich gewartet. Glaub ich.')).toBeTruthy();
    expect(container.querySelector('video')).toBeNull();

    // meet 4.5 s, then the name page: six chips, no keyboard until asked
    act(() => { vi.advanceTimersByTime(4500); });
    expect(container.querySelector('#mr-name')).toBeNull();
    const confirm = screen.getByText('so soll er heißen').closest('button');
    expect(confirm.disabled).toBe(true);

    // a pre-reader taps a chip: Ronki says the name, the chip is ringed
    const funki = screen.getByLabelText('Funki: anhören und wählen');
    fireEvent.click(funki);
    expect(voice.play).toHaveBeenCalledWith('de_name_chip_funki');
    expect(funki.getAttribute('aria-pressed')).toBe('true');
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);

    // close: Ronki says the nickname back and asks for a parent; the pill
    // reports the nickname as companionName, never as the child's name
    expect(screen.getByText('Ich bin Funki! Und wie heißt du?')).toBeTruthy();
    fireEvent.click(screen.getByText('Mama oder Papa ist da').closest('button'));
    expect(onComplete).toHaveBeenCalledWith({ companionVariant: 'sunset', companionName: 'Funki' });
    expect(onComplete.mock.calls[0][0]).not.toHaveProperty('heroName');
  });
});

describe('MeetRonki name chips', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReducedMotion(true);
    voice.play.mockClear();
  });
  afterEach(() => { vi.useRealTimers(); });

  function toNamePage() {
    const onComplete = vi.fn();
    const utils = render(<MeetRonki onComplete={onComplete} needsParent />);
    act(() => { vi.advanceTimersByTime(3600); });
    fireEvent.click(screen.getByLabelText('Ei wählen: Blau'));
    // each phase sets its timer after it renders, so advance step by step
    act(() => { vi.advanceTimersByTime(1400); });
    act(() => { vi.advanceTimersByTime(1400); });
    act(() => { vi.advanceTimersByTime(4500); });
    return { ...utils, onComplete };
  }

  it('offers six voiced names with Ronki first, each with its own recording', () => {
    expect(NAME_CHIPS.map(c => c.name)).toEqual(['Ronki', 'Funki', 'Flämmchen', 'Glut', 'Pieks', 'Knisti']);
    toNamePage();
    for (const chip of NAME_CHIPS) {
      fireEvent.click(screen.getByLabelText(`${chip.name}: anhören und wählen`));
      expect(voice.play).toHaveBeenLastCalledWith(`de_name_chip_${chip.id}`);
    }
    // only the last tapped chip is selected
    const pressed = NAME_CHIPS.filter(c => screen.getByLabelText(`${c.name}: anhören und wählen`).getAttribute('aria-pressed') === 'true');
    expect(pressed.map(c => c.id)).toEqual(['knisti']);
  });

  it('keeps typing behind "selbst schreiben" and uses the typed name', () => {
    const { container, onComplete } = toNamePage();
    fireEvent.click(screen.getByLabelText('Glut: anhören und wählen'));
    fireEvent.click(screen.getByText('selbst schreiben'));
    const input = container.querySelector('#mr-name');
    expect(input).toBeTruthy();
    // a stray tap on "selbst schreiben" keeps the chip the kid picked
    const confirm = screen.getByText('so soll er heißen').closest('button');
    expect(confirm.disabled).toBe(false);
    expect(screen.getByLabelText('Glut: anhören und wählen').getAttribute('aria-pressed')).toBe('true');
    // typing replaces the chip
    fireEvent.change(input, { target: { value: '  Drachi  ' } });
    expect(screen.getByLabelText('Glut: anhören und wählen').getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(confirm);
    expect(screen.getByText('Ich bin Drachi! Und wie heißt du?')).toBeTruthy();
    fireEvent.click(screen.getByText('Mama oder Papa ist da').closest('button'));
    expect(onComplete).toHaveBeenCalledWith({ companionVariant: 'teal', companionName: 'Drachi' });
  });

  it('a chip tapped after typing wins and hides the keyboard again', () => {
    const { container } = toNamePage();
    fireEvent.click(screen.getByText('selbst schreiben'));
    fireEvent.change(container.querySelector('#mr-name'), { target: { value: 'Xy' } });
    fireEvent.click(screen.getByLabelText('Pieks: anhören und wählen'));
    expect(container.querySelector('#mr-name')).toBeNull();
    fireEvent.click(screen.getByText('so soll er heißen').closest('button'));
    expect(screen.getByText('Ich bin Pieks! Und wie heißt du?')).toBeTruthy();
  });

  it('caps a typed name at 18 characters without cutting an emoji in half', () => {
    const { container } = toNamePage();
    fireEvent.click(screen.getByText('selbst schreiben'));
    const input = container.querySelector('#mr-name');
    fireEvent.change(input, { target: { value: 'Abcdefghijklmnopq🐉🐉' } });
    expect(Array.from(input.value)).toHaveLength(18);
    expect(input.value.endsWith('🐉')).toBe(true);
  });

  it('keeps the way on in a sticky bar below the chips', () => {
    toNamePage();
    const confirm = screen.getByText('so soll er heißen').closest('button');
    expect(confirm.closest('.sticky')).not.toBeNull();
  });
});

/** Walk to the close phase with a given set of props. */
function toClose(props) {
  const onComplete = vi.fn();
  const utils = render(<MeetRonki onComplete={onComplete} {...props} />);
  act(() => { vi.advanceTimersByTime(3600); });
  fireEvent.click(screen.getByLabelText('Ei wählen: Gelb'));
  act(() => { vi.advanceTimersByTime(1400); });
  act(() => { vi.advanceTimersByTime(1400); });
  act(() => { vi.advanceTimersByTime(4500); });
  fireEvent.click(screen.getByLabelText('Knisti: anhören und wählen'));
  fireEvent.click(screen.getByText('so soll er heißen').closest('button'));
  return { ...utils, onComplete };
}

describe('MeetRonki card link (egg first for everyone)', () => {
  beforeEach(() => { vi.useFakeTimers(); mockReducedMotion(true); });
  afterEach(() => { vi.useRealTimers(); });

  it('shows "Ich habe schon eine Karte" on the approach and the shelf and calls onWantsCard', () => {
    const onWantsCard = vi.fn();
    render(<MeetRonki onComplete={vi.fn()} onWantsCard={onWantsCard} />);
    fireEvent.click(screen.getByText('Ich habe schon eine Karte').closest('button'));
    expect(onWantsCard).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(3600); });
    expect(screen.getByLabelText('Ei wählen: Rot')).toBeTruthy();
    fireEvent.click(screen.getByText('Ich habe schon eine Karte').closest('button'));
    expect(onWantsCard).toHaveBeenCalledTimes(2);
    // gone once an egg is picked
    fireEvent.click(screen.getByLabelText('Ei wählen: Rot'));
    expect(screen.queryByText('Ich habe schon eine Karte')).toBeNull();
  });

  it('hides the card link when no onWantsCard is given', () => {
    render(<MeetRonki onComplete={vi.fn()} />);
    expect(screen.queryByText('Ich habe schon eine Karte')).toBeNull();
    act(() => { vi.advanceTimersByTime(3600); });
    expect(screen.queryByText('Ich habe schon eine Karte')).toBeNull();
  });
});

describe('MeetRonki close', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReducedMotion(true);
    voice.playLocalized.mockClear();
    analytics.track.mockClear();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('no card: asks the name, then for a parent; the pill is there at once', () => {
    const { onComplete } = toClose({ needsParent: true });
    expect(screen.getByText(lineText('meet_askname_01', { nick: 'Knisti' }))).toBeTruthy();
    expect(screen.getByText(lineText('meet_getparent_01'))).toBeTruthy();
    const pill = screen.getByText('Mama oder Papa ist da').closest('button');
    expect(pill.disabled).toBe(false);
    // voiced without the name: askname first, getparent after
    act(() => { vi.advanceTimersByTime(3000); });
    const ids = voice.playLocalized.mock.calls.map(c => c[0]);
    expect(ids.indexOf('meet_askname_01')).toBeGreaterThan(-1);
    expect(ids.indexOf('meet_getparent_01')).toBeGreaterThan(ids.indexOf('meet_askname_01'));
    expect(ids).not.toContain('meet_close_01');
    expect(screen.queryByText(/Bis morgen/)).toBeNull();
    fireEvent.click(pill);
    fireEvent.click(pill);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ companionVariant: 'amber', companionName: 'Knisti' });
  });

  it('without needsParent and without a child name it still asks for a parent', () => {
    toClose({});
    expect(screen.getByText('Mama oder Papa ist da')).toBeTruthy();
  });

  it('card family: knows the child, "Ja, das bin ich" plays meet_yes_01 and then completes', () => {
    const { onComplete } = toClose({ needsParent: false, childName: 'Mia' });
    expect(screen.getByText('Mia')).toBeTruthy();
    expect(screen.getByText(lineText('meet_knowname_01', { kind: 'Mia' }))).toBeTruthy();
    expect(screen.queryByText('Mama oder Papa ist da')).toBeNull();
    expect(voice.playLocalized.mock.calls.map(c => c[0])).toContain('meet_knowname_01');
    const pill = screen.getByText('Ja, das bin ich').closest('button');
    expect(pill.disabled).toBe(false);
    fireEvent.click(pill);
    fireEvent.click(pill);
    expect(voice.playLocalized.mock.calls.filter(c => c[0] === 'meet_yes_01')).toHaveLength(1);
    expect(screen.getByText(lineText('meet_yes_01'))).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ companionVariant: 'amber', companionName: 'Knisti' });
  });

  it('fires the funnel events for the egg pick and the name', () => {
    toClose({ needsParent: true });
    const names = analytics.track.mock.calls.map(c => c[0]);
    expect(names).toContain('onboarding.egg.pick');
    expect(names).toContain('onboarding.name.confirm');
    fireEvent.click(screen.getByText('Mama oder Papa ist da').closest('button'));
    expect(analytics.track.mock.calls.map(c => c[0])).toContain('ronki.hatch');
  });
});
