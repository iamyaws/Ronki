// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

// NavBar reads TaskContext and plays SFX, haptics and Ronki's nav voice;
// all are stubbed so the test only looks at which tabs show and what a
// tap does (Finch pass, 26 Sep 2026).
let mockState;
vi.mock('../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions: {} }),
}));
vi.mock('../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), playNarrator: vi.fn(), isMuted: () => true },
}));
vi.mock('../utils/sfx', () => ({ default: { play: vi.fn() } }));
vi.mock('../lib/haptics', () => ({ triggerHaptic: vi.fn() }));

import NavBar, { visibleTabs } from './NavBar';

const tabIds = (container) =>
  Array.from(container.querySelectorAll('[data-tab-id]')).map((b) => b.getAttribute('data-tab-id'));

describe('NavBar (Finch pass)', () => {
  beforeEach(() => {
    mockState = {
      totalTasksDone: 0,
      hp: 0,
      moodAM: null,
      moodPM: null,
      tabCoachmarksSeen: {},
    };
  });

  it('shows two tabs by default: Nest and Ronki', () => {
    const { container } = render(<NavBar active="hub" onNavigate={() => {}} />);
    expect(tabIds(container)).toEqual(['hub', 'ronki']);
  });

  it('keeps the Ronki tab open on a brand new save (no task done yet)', () => {
    const onNavigate = vi.fn();
    const { container } = render(<NavBar active="hub" onNavigate={onNavigate} />);
    const ronki = container.querySelector('[data-tab-id="ronki"]');
    expect(ronki.getAttribute('aria-disabled')).toBe('false');
    fireEvent.click(ronki);
    expect(onNavigate).toHaveBeenCalledWith('ronki');
  });

  it('shows four tabs with Extras on', () => {
    mockState = { ...mockState, extrasEnabled: true, hp: 80, totalTasksDone: 5, moodAM: 'gut' };
    const { container } = render(<NavBar active="hub" onNavigate={() => {}} />);
    expect(tabIds(container)).toEqual(['hub', 'ronki', 'journal', 'shop']);
  });

  it('keeps the old unlock rules for the Extras tabs, and never shows a lock hint', () => {
    mockState = { ...mockState, extrasEnabled: true, hp: 10 };
    const onNavigate = vi.fn();
    const { container } = render(<NavBar active="hub" onNavigate={onNavigate} />);
    const shop = container.querySelector('[data-tab-id="shop"]');
    expect(shop.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(shop);
    expect(onNavigate).not.toHaveBeenCalled();
    expect(document.getElementById('nav-lock-hint-sheet')).toBeNull();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  describe('?reveal=all (fix round 1, Astra FC-10)', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      window.history.replaceState(null, '', '/');
    });

    const shopDisabled = () => {
      mockState = { ...mockState, extrasEnabled: true, hp: 10 };
      window.history.replaceState(null, '', '/?reveal=all');
      const { container, unmount } = render(<NavBar active="hub" onNavigate={() => {}} />);
      const value = container.querySelector('[data-tab-id="shop"]').getAttribute('aria-disabled');
      unmount();
      return value;
    };

    it('is ignored in a production build: locked tabs stay locked', () => {
      vi.stubEnv('DEV', false);
      expect(shopDisabled()).toBe('true');
    });

    it('still unlocks every tab in a DEV build', () => {
      vi.stubEnv('DEV', true);
      expect(shopDisabled()).toBe('false');
    });
  });

  it('never shows the day strip tab while FEATURES.dayStrip is off', () => {
    expect(visibleTabs({ extrasEnabled: true }).map((t) => t.id)).not.toContain('quests');
    expect(visibleTabs(null).map((t) => t.id)).toEqual(['hub', 'ronki']);
  });
});
