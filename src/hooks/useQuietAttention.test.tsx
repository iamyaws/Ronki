// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Fix round 1 (GUARDRAILS-6): de_slowdown_01.mp3 is not recorded. The call
// stays, and a player that throws must never break the view change.
const playLocalized = vi.fn();
vi.mock('../utils/voiceAudio', () => ({ default: { playLocalized: (...a: unknown[]) => playLocalized(...a) } }));

import { useQuietAttention } from './useQuietAttention';

describe('useQuietAttention', () => {
  beforeEach(() => {
    playLocalized.mockReset();
  });

  const threeFastAdvances = () => {
    const { rerender } = renderHook(({ view }) => useQuietAttention(view), {
      initialProps: { view: 'hub' },
    });
    rerender({ view: 'ronki' });
    rerender({ view: 'hub' });
  };

  it('still asks for the slowdown line after three fast view changes', () => {
    threeFastAdvances();
    expect(playLocalized).toHaveBeenCalledTimes(1);
    expect(playLocalized).toHaveBeenCalledWith('slowdown_01', 400);
  });

  it('stays silent and does not throw when the player throws', () => {
    playLocalized.mockImplementation(() => { throw new Error('no audio'); });
    expect(threeFastAdvances).not.toThrow();
    expect(playLocalized).toHaveBeenCalledTimes(1);
  });
});
