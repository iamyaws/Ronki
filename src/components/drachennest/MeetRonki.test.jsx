// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';

vi.mock('../../context/TaskContext', () => ({ useTask: () => ({ state: {}, actions: {} }) }));
vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));
const voice = vi.hoisted(() => ({ play: null }));
vi.mock('../../utils/voiceAudio', () => {
  voice.play = vi.fn();
  return { default: { play: voice.play, playLocalized: vi.fn(), playNarrator: vi.fn(), stop: vi.fn() } };
});

import MeetRonki, { EGGS, NAME_CHIPS } from './MeetRonki';

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
    const { container } = render(<MeetRonki onComplete={onComplete} />);

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

    // close: Ronki says the nickname back; tap anywhere reports the
    // nickname as companionName, never as the child's name
    expect(screen.getByText('Ich bin Funki! Bis morgen. Versprochen.')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('tippen zum schließen'));
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
    const utils = render(<MeetRonki onComplete={onComplete} />);
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
    // switching to typing drops the chip, so nothing is picked by accident
    const confirm = screen.getByText('so soll er heißen').closest('button');
    expect(confirm.disabled).toBe(true);
    expect(screen.getByLabelText('Glut: anhören und wählen').getAttribute('aria-pressed')).toBe('false');
    fireEvent.change(input, { target: { value: '  Drachi  ' } });
    fireEvent.click(confirm);
    expect(screen.getByText('Ich bin Drachi! Bis morgen. Versprochen.')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('tippen zum schließen'));
    expect(onComplete).toHaveBeenCalledWith({ companionVariant: 'teal', companionName: 'Drachi' });
  });

  it('a chip tapped after typing wins and hides the keyboard again', () => {
    const { container } = toNamePage();
    fireEvent.click(screen.getByText('selbst schreiben'));
    fireEvent.change(container.querySelector('#mr-name'), { target: { value: 'Xy' } });
    fireEvent.click(screen.getByLabelText('Pieks: anhören und wählen'));
    expect(container.querySelector('#mr-name')).toBeNull();
    fireEvent.click(screen.getByText('so soll er heißen').closest('button'));
    expect(screen.getByText('Ich bin Pieks! Bis morgen. Versprochen.')).toBeTruthy();
  });
});
