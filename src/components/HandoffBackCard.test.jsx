// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';

const voice = vi.hoisted(() => ({ playLocalized: null }));
vi.mock('../utils/voiceAudio', () => {
  voice.playLocalized = vi.fn();
  return { default: { play: vi.fn(), playLocalized: voice.playLocalized, stop: vi.fn(), isMuted: () => false } };
});
vi.mock('../i18n/LanguageContext', () => ({
  useTranslation: () => ({ t: (k) => ({ 'handoff.parentToKid.title': 'Fertig!' }[k] || k) }),
}));

import HandoffBackCard from './HandoffBackCard';
import { lineText } from '../data/ronkiLines';

describe('HandoffBackCard', () => {
  beforeEach(() => { vi.useFakeTimers(); voice.playLocalized.mockClear(); });
  afterEach(() => { vi.useRealTimers(); });

  it('plays handoff_back_01, then "Jetzt kenn ich dich" with the name big, then continues', () => {
    const onContinue = vi.fn();
    render(<HandoffBackCard childName="Mia" variant="teal" onContinue={onContinue} />);
    expect(screen.getByText('Fertig!')).toBeTruthy();
    expect(screen.getByText(lineText('handoff_back_01'))).toBeTruthy();
    expect(voice.playLocalized).toHaveBeenCalledWith('handoff_back_01', 300);

    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(screen.getByText("Los geht's").closest('button'));
    expect(onContinue).not.toHaveBeenCalled();
    expect(screen.getByText('Mia')).toBeTruthy();
    expect(screen.getByText(lineText('meet_nowiknow_01', { kind: 'Mia' }))).toBeTruthy();
    expect(voice.playLocalized).toHaveBeenCalledWith('meet_nowiknow_01', 300);
    // the pill is there at once
    const pill = screen.getByText('Weiter').closest('button');
    expect(pill.disabled).toBe(false);

    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(pill);
    fireEvent.click(pill);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('a quick double tap does not skip the "knows you" beat', () => {
    const onContinue = vi.fn();
    render(<HandoffBackCard childName="Mia" onContinue={onContinue} />);
    act(() => { vi.advanceTimersByTime(500); });
    const root = screen.getByRole('button', { name: 'Fertig!' });
    fireEvent.click(root);
    fireEvent.click(screen.getByText('Weiter').closest('button'));
    expect(onContinue).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.click(screen.getByText('Weiter').closest('button'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
