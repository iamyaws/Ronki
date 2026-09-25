import { describe, it, expect } from 'vitest';
import { pickPhase } from './onboardingPhase';

const fresh = { onboardingDone: false, kidIntroSeen: false, parentOnboardingDone: false, parentHandoffBackSeen: false };
// A card made on ronki.de: the parent's answers arrive with the seed.
const seed = { ...fresh, parentOnboardingDone: true, parentHandoffBackSeen: true };

describe('pickPhase', () => {
  it('fresh device, no token, no card: meet, parent, handback, teach, firstday, done', () => {
    let s = { ...fresh };
    const ctx = { hasToken: false };
    expect(pickPhase(s, ctx)).toBe('meet');
    s = { ...s, kidIntroSeen: true };
    expect(pickPhase(s, ctx)).toBe('parent');
    s = { ...s, parentOnboardingDone: true };
    // the parent step creates the token
    expect(pickPhase(s, { hasToken: true })).toBe('handback');
    s = { ...s, parentHandoffBackSeen: true };
    expect(pickPhase(s, { hasToken: true })).toBe('teach');
    expect(pickPhase(s, { hasToken: true, teachDone: true })).toBe('firstday');
    expect(pickPhase({ ...s, onboardingDone: true }, { hasToken: true })).toBe('done');
  });

  it('website card seed goes from the egg straight to the fire lesson', () => {
    expect(pickPhase(seed, { hasToken: true })).toBe('meet');
    expect(pickPhase({ ...seed, kidIntroSeen: true }, { hasToken: true })).toBe('teach');
  });

  it('orphan token (token set, empty cloud row) runs the same order as a fresh device', () => {
    expect(pickPhase(fresh, { hasToken: true })).toBe('meet');
    expect(pickPhase({ ...fresh, kidIntroSeen: true }, { hasToken: true })).toBe('parent');
    expect(pickPhase({ ...fresh, kidIntroSeen: true, parentOnboardingDone: true }, { hasToken: true })).toBe('handback');
  });

  it('wantsCard opens the scan sheet only while there is no token', () => {
    expect(pickPhase(fresh, { wantsCard: true, hasToken: false })).toBe('scan');
    // from the parent screen, after the hatch
    expect(pickPhase({ ...fresh, kidIntroSeen: true }, { wantsCard: true, hasToken: false })).toBe('scan');
    // a token already exists: the sheet has nothing to add
    expect(pickPhase(fresh, { wantsCard: true, hasToken: true })).toBe('meet');
    // done always wins
    expect(pickPhase({ ...fresh, onboardingDone: true }, { wantsCard: true })).toBe('done');
  });

  it('resumes after a reload at every phase (the flags alone decide)', () => {
    // local UI state (wantsCard, teachDone) is gone after a reload
    const cases: Array<[Record<string, boolean>, string]> = [
      [fresh, 'meet'],
      [{ ...fresh, kidIntroSeen: true }, 'parent'],
      [{ ...fresh, kidIntroSeen: true, parentOnboardingDone: true }, 'handback'],
      [{ ...fresh, kidIntroSeen: true, parentOnboardingDone: true, parentHandoffBackSeen: true }, 'teach'],
      [{ ...seed, kidIntroSeen: true }, 'teach'],
      [{ ...seed, kidIntroSeen: true, onboardingDone: true }, 'done'],
    ];
    for (const [s, want] of cases) expect(pickPhase(s, {})).toBe(want);
  });

  it('a null state starts at the egg', () => {
    expect(pickPhase(null)).toBe('meet');
    expect(pickPhase(undefined, { wantsCard: true })).toBe('scan');
  });
});
