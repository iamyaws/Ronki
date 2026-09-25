// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';

// The chain is wiring: the screens are stubbed so each test only looks
// at which screen shows for which state and what the chain calls.
const h = vi.hoisted(() => ({
  state: null,
  actions: null,
  token: null,
  track: null,
  useAnalytics: null,
  lastProps: {},
}));

vi.mock('../../context/TaskContext', () => ({
  useTask: () => ({ state: h.state, actions: h.actions }),
}));
vi.mock('../../i18n/LanguageContext', () => ({ useTranslation: () => ({ t: (k) => k }) }));
vi.mock('../../hooks/useAnalytics', () => {
  h.useAnalytics = vi.fn(() => ({ track: vi.fn(), enabled: false }));
  return { useAnalytics: h.useAnalytics };
});
vi.mock('../../lib/analytics', () => {
  h.track = vi.fn();
  return { track: h.track };
});
vi.mock('../../lib/profileToken', () => ({
  getActiveToken: () => h.token,
  generateToken: () => 'f'.repeat(32),
  setActiveToken: vi.fn((t) => { h.token = t; }),
  claimLocalProfile: vi.fn(),
}));

function stub(name, render) {
  return {
    default: (props) => {
      h.lastProps[name] = props;
      return <div data-screen={name}>{render ? render(props) : null}</div>;
    },
  };
}
vi.mock('../drachennest/MeetRonki', () => stub('meet', (p) => (
  <>
    {p.onWantsCard && <button onClick={p.onWantsCard}>card</button>}
    <button onClick={() => p.onComplete({ companionName: 'Funki', companionVariant: 'sunset' })}>hatched</button>
  </>
)));
vi.mock('../NoProfileLanding', () => stub('scan', (p) => (
  <>
    <button onClick={p.onBack}>back</button>
    <button onClick={p.onBeforeOpen}>before</button>
  </>
)));
vi.mock('../CombinedParentSetup', () => stub('parent', (p) => (
  <>
    {p.onScanCard && <button onClick={p.onScanCard}>scan</button>}
    <button onClick={() => p.onComplete({
      parentOnboardingDone: true,
      parentPin: null,
      parentPinIsDefault: true,
      analyticsEnabled: false,
      familyConfig: { childName: 'Mia', siblings: [], routine: { morning: ['wake'], evening: ['pyjama'] }, eveningStart: '18:00' },
    })}>parent-done</button>
  </>
)));
vi.mock('../HandoffBackCard', () => stub('handback', (p) => <button onClick={p.onContinue}>continue</button>));
vi.mock('./TeachFireStep', () => stub('teach', (p) => <button onClick={p.onComplete}>taught</button>));
vi.mock('./FirstDayIntro', () => stub('firstday', (p) => <button onClick={p.onDone}>go</button>));

import OnboardingChain from './OnboardingChain';
import { PENDING_HATCH_KEY, savePendingHatch } from '../../lib/pendingHatch';

const fresh = () => ({
  onboardingDone: false,
  kidIntroSeen: false,
  parentOnboardingDone: false,
  parentHandoffBackSeen: false,
  familyConfig: { childName: '', siblings: [] },
  companionVariant: undefined,
  companionName: undefined,
});
const seed = () => ({ ...fresh(), parentOnboardingDone: true, parentHandoffBackSeen: true, familyConfig: { childName: 'Mia', siblings: [] } });

function screenName() {
  return document.querySelector('[data-screen]')?.getAttribute('data-screen') || null;
}

/** Re-render with the state the stubbed TaskContext now holds. */
function mount(props = {}) {
  const utils = render(<OnboardingChain {...props} />);
  const sync = () => utils.rerender(<OnboardingChain {...props} />);
  h.actions.patchState.mockImplementation((p) => { h.state = { ...h.state, ...p }; });
  return { ...utils, sync };
}

describe('OnboardingChain', () => {
  beforeEach(() => {
    localStorage.clear();
    h.token = null;
    h.lastProps = {};
    h.track.mockClear();
    h.actions = {
      patchState: vi.fn(),
      updateFamilyConfig: vi.fn(),
      setRoutine: vi.fn(),
      setEveningStart: vi.fn(),
      completeOnboarding: vi.fn(),
    };
  });

  it('fresh device: egg, parent, handback, teach, first day, complete', () => {
    h.state = fresh();
    const onComplete = vi.fn();
    const { sync } = mount({ onComplete });
    expect(h.useAnalytics).toHaveBeenCalled();
    expect(screenName()).toBe('meet');
    expect(h.lastProps.meet.needsParent).toBe(true);

    fireEvent.click(screen.getByText('hatched'));
    expect(h.actions.patchState).toHaveBeenCalledWith({ kidIntroSeen: true, companionName: 'Funki', companionVariant: 'sunset' });
    sync();
    expect(screenName()).toBe('parent');

    fireEvent.click(screen.getByText('parent-done'));
    // patchState, updateFamilyConfig, then the loop actions (Lane B)
    const fc = { childName: 'Mia', siblings: [], routine: { morning: ['wake'], evening: ['pyjama'] }, eveningStart: '18:00' };
    expect(h.actions.patchState).toHaveBeenCalledWith(expect.objectContaining({ parentOnboardingDone: true, familyConfig: fc }));
    expect(h.actions.updateFamilyConfig).toHaveBeenCalledWith(fc);
    expect(h.actions.setRoutine).toHaveBeenCalledWith({ morning: ['wake'], evening: ['pyjama'] });
    expect(h.actions.setEveningStart).toHaveBeenCalledWith('18:00');
    const order = [
      h.actions.updateFamilyConfig.mock.invocationCallOrder[0],
      h.actions.setRoutine.mock.invocationCallOrder[0],
      h.actions.setEveningStart.mock.invocationCallOrder[0],
    ];
    expect(order).toEqual([...order].sort((a, b) => a - b));
    // a fresh token for the new profile
    expect(h.token).toBe('f'.repeat(32));
    expect(h.track).toHaveBeenCalledWith('onboarding.parent.done');
    sync();
    expect(screenName()).toBe('handback');
    expect(h.lastProps.handback.childName).toBe('Mia');

    fireEvent.click(screen.getByText('continue'));
    expect(h.actions.patchState).toHaveBeenLastCalledWith({ parentHandoffBackSeen: true });
    sync();
    expect(screenName()).toBe('teach');
    expect(h.lastProps.teach.variant).toBe('sunset');

    fireEvent.click(screen.getByText('taught'));
    expect(h.track).toHaveBeenCalledWith('onboarding.teachfire.complete');
    expect(screenName()).toBe('firstday');
    expect(h.lastProps.firstday.eveningStart).toBe('18:00');
    expect(h.actions.completeOnboarding).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('go'));
    expect(h.track).toHaveBeenCalledWith('onboarding.firstday.done');
    expect(h.actions.completeOnboarding).toHaveBeenCalledWith({ companionVariant: 'sunset', heroGender: null, taughtSignature: 'fire' });
    expect(onComplete).toHaveBeenCalledTimes(1);
    h.state = { ...h.state, onboardingDone: true };
    sync();
    expect(screenName()).toBeNull();
  });

  it('website card seed: egg with the known name, then straight to the fire lesson', () => {
    h.token = 'a'.repeat(32);
    h.state = seed();
    const { sync } = mount();
    expect(screenName()).toBe('meet');
    expect(h.lastProps.meet.needsParent).toBe(false);
    expect(h.lastProps.meet.childName).toBe('Mia');
    // a card is already here: no card link
    expect(h.lastProps.meet.onWantsCard).toBeUndefined();
    fireEvent.click(screen.getByText('hatched'));
    sync();
    expect(screenName()).toBe('teach');
  });

  it('orphan token: parent step keeps the token it has', () => {
    h.token = 'b'.repeat(32);
    h.state = { ...fresh(), kidIntroSeen: true, companionName: 'Glut' };
    mount();
    expect(screenName()).toBe('parent');
    expect(h.lastProps.parent.onScanCard).toBeUndefined();
    fireEvent.click(screen.getByText('parent-done'));
    expect(h.token).toBe('b'.repeat(32));
  });

  it('card link on the egg opens the scan sheet, and back returns to the egg', () => {
    h.state = fresh();
    mount();
    fireEvent.click(screen.getByText('card'));
    expect(screenName()).toBe('scan');
    // the child has not hatched: nothing to stash
    fireEvent.click(screen.getByText('before'));
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
    fireEvent.click(screen.getByText('back'));
    expect(screenName()).toBe('meet');
  });

  it('card scan from the parent step stashes the hatch before the token is stored', () => {
    h.state = { ...fresh(), kidIntroSeen: true, companionName: 'Knisti', companionVariant: 'teal' };
    mount();
    expect(screenName()).toBe('parent');
    fireEvent.click(screen.getByText('scan'));
    expect(screenName()).toBe('scan');
    fireEvent.click(screen.getByText('before'));
    const stash = JSON.parse(localStorage.getItem(PENDING_HATCH_KEY));
    expect(stash).toMatchObject({ companionName: 'Knisti', companionVariant: 'teal' });
  });

  it('after the reload the stash applies to an unhatched card and the chain goes on', () => {
    savePendingHatch({ companionName: 'Knisti', companionVariant: 'teal' });
    h.token = 'c'.repeat(32);
    h.state = seed();
    mount();
    expect(h.actions.patchState).toHaveBeenCalledWith({ kidIntroSeen: true, companionName: 'Knisti', companionVariant: 'teal' });
  });

  it('a stash is dropped for a card whose Ronki already hatched', () => {
    savePendingHatch({ companionName: 'Knisti', companionVariant: 'teal' });
    h.token = 'c'.repeat(32);
    h.state = { ...seed(), kidIntroSeen: true, companionName: 'Flämmchen' };
    mount();
    expect(h.actions.patchState).not.toHaveBeenCalled();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
    expect(screenName()).toBe('teach');
  });

  it('resumes at every phase from the saved flags', () => {
    const cases = [
      [fresh(), 'meet'],
      [{ ...fresh(), kidIntroSeen: true }, 'parent'],
      [{ ...fresh(), kidIntroSeen: true, parentOnboardingDone: true }, 'handback'],
      [{ ...fresh(), kidIntroSeen: true, parentOnboardingDone: true, parentHandoffBackSeen: true }, 'teach'],
    ];
    for (const [s, want] of cases) {
      h.state = s;
      const { unmount } = mount();
      expect(screenName()).toBe(want);
      unmount();
    }
  });

  it('previewLoop resets the gates after onboardingDone', () => {
    vi.useFakeTimers();
    try {
      h.state = { ...seed(), kidIntroSeen: true, onboardingDone: true };
      mount({ previewLoop: true });
      expect(screenName()).toBeNull();
      act(() => { vi.advanceTimersByTime(2300); });
      expect(h.actions.patchState).toHaveBeenCalledWith({
        onboardingDone: false, kidIntroSeen: false, parentOnboardingDone: false, parentHandoffBackSeen: false,
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
