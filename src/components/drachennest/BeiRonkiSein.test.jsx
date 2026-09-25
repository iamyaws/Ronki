// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';

vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: { catEvo: 5, companionVariant: 'forest' }, actions: {} }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), isMuted: () => true },
}));
vi.mock('../../lib/analytics', () => ({ track: vi.fn() }));

import VoiceAudio from '../../utils/voiceAudio';
import BeiRonkiSein from './BeiRonkiSein';
import { TONIGHT_STORIES } from './TonightRitual';

describe('BeiRonkiSein', () => {
  it('shows the story text that the voice file it plays says (census 2.5)', () => {
    vi.useFakeTimers();
    const { getByRole } = render(<BeiRonkiSein onClose={() => {}} />);
    act(() => { vi.advanceTimersByTime(800); });
    const call = VoiceAudio.playLocalized.mock.calls.find(c => String(c[0]).startsWith('tonight_story_'));
    const idx = Number(String(call[0]).replace('tonight_story_', ''));
    expect(getByRole('dialog').textContent).toContain(TONIGHT_STORIES[idx]);
    vi.useRealTimers();
  });
});
