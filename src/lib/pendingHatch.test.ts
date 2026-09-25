import { describe, it, expect, beforeEach } from 'vitest';
import { PENDING_HATCH_KEY, savePendingHatch, takePendingHatch, clearPendingHatch } from './pendingHatch';

const NOW = Date.parse('2026-09-26T08:00:00Z');
const unhatched = { kidIntroSeen: false, onboardingDone: false };

describe('pendingHatch', () => {
  beforeEach(() => { localStorage.clear(); });

  it('writes the picks under ronki_pending_hatch', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset' }, NOW);
    const raw = JSON.parse(localStorage.getItem(PENDING_HATCH_KEY) as string);
    expect(raw).toMatchObject({ companionName: 'Funki', companionVariant: 'sunset', savedAt: NOW });
  });

  it('ignores an empty name', () => {
    savePendingHatch({ companionName: '', companionVariant: 'sunset' }, NOW);
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('applies only to a state that has not met Ronki yet', () => {
    savePendingHatch({ companionName: 'Glut', companionVariant: 'teal' }, NOW);
    expect(takePendingHatch(unhatched, NOW + 5000)).toEqual({
      kidIntroSeen: true, companionName: 'Glut', companionVariant: 'teal',
    });
    // still there until the patched state is seen (a reload before the save lands)
    expect(localStorage.getItem(PENDING_HATCH_KEY)).not.toBeNull();
    // once the state has kidIntroSeen, the next call drops it
    expect(takePendingHatch({ kidIntroSeen: true, onboardingDone: false }, NOW + 6000)).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('drops the stash for a cloud row whose Ronki already hatched', () => {
    savePendingHatch({ companionName: 'Pieks', companionVariant: 'amber' }, NOW);
    expect(takePendingHatch({ kidIntroSeen: true, onboardingDone: true }, NOW + 1000)).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('drops a stash for an onboarded state even when kidIntroSeen is missing', () => {
    savePendingHatch({ companionName: 'Pieks', companionVariant: 'amber' }, NOW);
    expect(takePendingHatch({ onboardingDone: true }, NOW + 1000)).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('drops a stash older than a day', () => {
    savePendingHatch({ companionName: 'Knisti', companionVariant: 'forest' }, NOW);
    expect(takePendingHatch(unhatched, NOW + 25 * 3600 * 1000)).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('returns null with nothing stashed, a null state or broken JSON', () => {
    expect(takePendingHatch(unhatched, NOW)).toBeNull();
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset' }, NOW);
    expect(takePendingHatch(null, NOW)).toBeNull();
    localStorage.setItem(PENDING_HATCH_KEY, '{nope');
    expect(takePendingHatch(unhatched, NOW)).toBeNull();
  });

  it('clearPendingHatch removes it', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset' }, NOW);
    clearPendingHatch();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
    expect(takePendingHatch(unhatched, NOW)).toBeNull();
  });
});
