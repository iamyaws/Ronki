// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook } from '@testing-library/react';

// Finch pass cuts (26 Sep 2026, base design section 7): the praise toast,
// the tab unlock toasts and the kid install sheet are switched off by
// their code flags. Each test mounts the surface with a state that would
// have fired it before the pass.
let mockState;
const patchState = vi.fn();
vi.mock('../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions: { patchState, markTabUnlockSeen: vi.fn(), markTabCoachmarkSeen: vi.fn() } }),
}));
vi.mock('../context/CelebrationQueue', () => ({
  useCelebrationQueue: () => ({ enqueue: vi.fn(), current: null, dismiss: vi.fn() }),
}));
vi.mock('../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), playNarrator: vi.fn(), isMuted: () => true },
}));

import CompanionToast from './CompanionToast';
import TabUnlockCelebration from './TabUnlockCelebration';
import { usePWAPromptGate } from '../hooks/usePWAPromptGate';
import { FEATURES } from '../config/features';

describe('Finch cuts are off by default', () => {
  beforeEach(() => {
    patchState.mockClear();
    mockState = {
      onboardingDone: true,
      totalTasksDone: 12,
      hp: 120,
      pwaPromptShown: false,
      lastTaskCompletionAt: new Date(Date.now() - 60_000).toISOString(),
      tabUnlocksSeen: {},
      tabCoachmarksSeen: {},
    };
  });

  it('the flags ship off', () => {
    expect(FEATURES.praiseToast).toBe(false);
    expect(FEATURES.tabUnlocks).toBe(false);
    expect(FEATURES.kidInstallSheet).toBe(false);
  });

  it('CompanionToast renders nothing, even after a task tick', () => {
    const { container, rerender } = render(<CompanionToast trigger={0} />);
    rerender(<CompanionToast trigger={3} />);
    expect(container.innerHTML).toBe('');
  });

  it('TabUnlockCelebration renders nothing and marks nothing', () => {
    const { container } = render(<TabUnlockCelebration view="ronki" />);
    expect(container.innerHTML).toBe('');
    expect(document.body.textContent).toBe('');
  });

  it('the PWA install gate stays closed and never re-opens itself', () => {
    const { result } = renderHook(() => usePWAPromptGate());
    expect(result.current.shouldPrompt).toBe(false);
    mockState = { ...mockState, pwaPromptShown: true, lastLoginDate: '2020-01-01' };
    renderHook(() => usePWAPromptGate());
    expect(patchState).not.toHaveBeenCalled();
  });
});
