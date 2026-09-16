import { describe, it, expect } from 'vitest';
import {
  getLaunchCopy,
  LAUNCH_STATE,
  type LaunchState,
} from '../src/config/launch-state';

const ALL_STATES: LaunchState[] = ['waitlist', 'beta', 'public-alpha', 'live'];

describe('launch state', () => {
  it('exports a valid LAUNCH_STATE value', () => {
    expect(ALL_STATES).toContain(LAUNCH_STATE);
  });

  it('returns copy for every declared state', () => {
    for (const state of ALL_STATES) {
      const copy = getLaunchCopy(state);
      expect(copy.ctaLabel.length).toBeGreaterThan(0);
      expect(['waitlist', 'install']).toContain(copy.ctaAction);
      expect(copy.ctaHelper.length).toBeGreaterThan(0);
      expect(copy.footerMicro.length).toBeGreaterThan(0);
      expect(copy.heroEyebrow.length).toBeGreaterThan(0);
    }
  });

  it('returns waitlist copy when state is waitlist', () => {
    const copy = getLaunchCopy('waitlist');
    expect(copy.ctaLabel).toBe('Bin dabei');
    expect(copy.ctaAction).toBe('waitlist');
    expect(copy.footerMicro).toMatch(/kleinen gruppen/i);
  });

  it('returns beta copy when state is beta', () => {
    const copy = getLaunchCopy('beta');
    expect(copy.ctaLabel).toBe('Frühzugang anfordern');
    expect(copy.ctaAction).toBe('waitlist');
    expect(copy.footerMicro).toMatch(/frühzugang/i);
  });

  it('returns public-alpha copy when state is public-alpha', () => {
    const copy = getLaunchCopy('public-alpha');
    expect(copy.ctaLabel).toBe('Ronki ausprobieren');
    expect(copy.ctaAction).toBe('install');
    expect(copy.heroEyebrow).toBe('Public Alpha · jetzt spielbar');
    expect(copy.appUrl).toBe('https://app.ronki.de/');
  });

  it('returns live copy when state is live', () => {
    const copy = getLaunchCopy('live');
    expect(copy.ctaLabel).toBe('Kostenlos testen');
    expect(copy.ctaAction).toBe('install');
    expect(copy.footerMicro).toMatch(/browser/i);
  });

  it('defaults to the current LAUNCH_STATE when called without an argument', () => {
    expect(getLaunchCopy()).toEqual(getLaunchCopy(LAUNCH_STATE));
  });

  it('gives every install-action state an app url', () => {
    for (const state of ALL_STATES) {
      const copy = getLaunchCopy(state);
      if (copy.ctaAction === 'install') {
        expect(copy.appUrl).toBeTruthy();
      }
    }
  });
});
