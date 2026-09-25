// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';

vi.mock('../../context/TaskContext', () => ({ useTask: () => ({ state: {}, actions: {} }) }));
vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), playNarrator: vi.fn(), stop: vi.fn() },
}));

import MeetRonki, { EGGS } from './MeetRonki';

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

    // meet 4.5 s, then the name page
    act(() => { vi.advanceTimersByTime(4500); });
    const input = container.querySelector('#mr-name');
    expect(input).toBeTruthy();
    const confirm = screen.getByText('so soll er heißen').closest('button');
    expect(confirm.disabled).toBe(true);
    fireEvent.change(input, { target: { value: 'Funki' } });
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);

    // close: tap anywhere finishes with the mapped variant
    expect(screen.getByText('Bis morgen. Versprochen.')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('tippen zum schließen'));
    expect(onComplete).toHaveBeenCalledWith({ companionVariant: 'sunset', heroName: 'Funki' });
  });
});
