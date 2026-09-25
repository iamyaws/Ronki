// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

const markStageSeen = vi.fn();
vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: { companionVariant: 'forest' }, actions: { markStageSeen } }),
}));
vi.mock('../../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), isMuted: () => true },
}));

import VoiceAudio from '../../utils/voiceAudio';
import GrowthBeat from './GrowthBeat';
import { lineText } from '../../data/ronkiLines';

describe('GrowthBeat', () => {
  it('says the stage line and marks the stage seen once on Weiter', () => {
    const onDone = vi.fn();
    const { getByText, getByTestId } = render(<GrowthBeat stage={2} onDone={onDone} />);
    expect(getByTestId('growth-beat').textContent).toContain(lineText('grow_stage_2'));
    expect(VoiceAudio.playLocalized).toHaveBeenCalledWith('grow_stage_2', 900);
    fireEvent.click(getByText('Weiter'));
    fireEvent.click(getByText('Weiter'));
    expect(markStageSeen).toHaveBeenCalledTimes(1);
    expect(markStageSeen).toHaveBeenCalledWith(2);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
