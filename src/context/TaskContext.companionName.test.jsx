// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';

// Reopening the app must keep the nickname the kid gave Ronki at the
// hatch and must not touch the child's own name (Astra review, 25 Sep
// 2026: companionName was saved but missing from the rehydration list).
let saved;
vi.mock('../utils/storage', () => ({
  default: {
    load: vi.fn(async () => saved),
    save: vi.fn(async () => {}),
    syncLoad: vi.fn(async () => saved),
    syncLoadByToken: vi.fn(async () => saved),
    syncSave: vi.fn(async () => {}),
    syncSaveByToken: vi.fn(async () => {}),
  },
}));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../lib/profileToken', () => ({
  getActiveToken: () => null,
  ensureTokenForExistingProfile: vi.fn(),
}));
vi.mock('../lib/analytics', () => ({ track: vi.fn() }));

import { TaskProvider, useTask, createInitialState, cleanNickname } from './TaskContext';

function Probe({ onState }) {
  const { state } = useTask();
  onState(state);
  return null;
}

describe('TaskContext rehydration keeps the nickname', () => {
  beforeEach(() => {
    const base = createInitialState();
    saved = {
      ...base,
      onboardingDone: true,
      companionVariant: 'sunset',
      companionName: 'Funki',
      familyConfig: { ...(base.familyConfig || {}), childName: 'Mia' },
    };
  });

  it('restores companionName and leaves the child name alone', async () => {
    let latest;
    render(<TaskProvider><Probe onState={(s) => { latest = s; }} /></TaskProvider>);
    await waitFor(() => expect(latest?.companionVariant).toBe('sunset'));
    expect(latest.companionName).toBe('Funki');
    expect(latest.familyConfig?.childName).toBe('Mia');
  });

  it('ignores a nickname that is not a string', async () => {
    saved = { ...saved, companionName: { evil: true } };
    let latest;
    render(<TaskProvider><Probe onState={(s) => { latest = s; }} /></TaskProvider>);
    await waitFor(() => expect(latest?.companionVariant).toBe('sunset'));
    expect(latest.companionName).toBeUndefined();
  });

  it('splits an old save where the dragon name had replaced the child name', async () => {
    const { companionName, ...rest } = saved;
    saved = { ...rest, heroName: 'Funki', familyConfig: { ...saved.familyConfig, childName: 'Funki' } };
    let latest;
    render(<TaskProvider><Probe onState={(s) => { latest = s; }} /></TaskProvider>);
    await waitFor(() => expect(latest?.companionVariant).toBe('sunset'));
    expect(latest.companionName).toBe('Funki');
    expect(latest.childNameNeedsCheck).toBe(true);
    // the child's name is left for a parent to check, never guessed away
    expect(latest.familyConfig.childName).toBe('Funki');
    expect(latest._v_companion_name_split).toBe(true);
  });

  it('runs that split only once and never on a save with a different child name', async () => {
    const { companionName, ...rest } = saved;
    saved = { ...rest, heroName: 'Funki', _v_companion_name_split: true, familyConfig: { ...saved.familyConfig, childName: 'Funki' } };
    let latest;
    const first = render(<TaskProvider><Probe onState={(s) => { latest = s; }} /></TaskProvider>);
    await waitFor(() => expect(latest?.companionVariant).toBe('sunset'));
    expect(latest.childNameNeedsCheck).toBeUndefined();
    first.unmount();

    saved = { ...rest, heroName: 'Funki', familyConfig: { ...saved.familyConfig, childName: 'Mia' } };
    latest = undefined;
    render(<TaskProvider><Probe onState={(s) => { latest = s; }} /></TaskProvider>);
    await waitFor(() => expect(latest?.companionVariant).toBe('sunset'));
    expect(latest.childNameNeedsCheck).toBeUndefined();
    expect(latest.companionName).toBeUndefined();
    expect(latest.familyConfig.childName).toBe('Mia');
  });
});

describe('completeOnboarding never names the child', () => {
  it('leaves familyConfig.childName as the parent set it', async () => {
    const base = createInitialState();
    saved = { ...base, onboardingDone: false, companionVariant: 'amber', companionName: 'Knisti', familyConfig: { ...(base.familyConfig || {}), childName: 'Louis' } };
    let api;
    function Grab() { api = useTask(); return null; }
    render(<TaskProvider><Grab /></TaskProvider>);
    await waitFor(() => expect(api?.state?.companionVariant).toBe('amber'));
    await act(async () => { api.actions.completeOnboarding({ companionVariant: 'amber', heroName: 'Knisti' }); });
    expect(api.state.familyConfig.childName).toBe('Louis');
    expect(api.state.companionName).toBe('Knisti');
  });
});

describe('cleanNickname', () => {
  it('trims, caps at 18 characters without splitting emoji, and rejects non-strings', () => {
    expect(cleanNickname('  Funki  ')).toBe('Funki');
    expect(cleanNickname('   ')).toBeUndefined();
    expect(cleanNickname(42)).toBeUndefined();
    expect(Array.from(cleanNickname('Abcdefghijklmnopq🐉🐉'))).toHaveLength(18);
  });
});
