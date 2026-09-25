import { describe, it, expect, beforeEach } from 'vitest';
import { PENDING_HATCH_KEY, savePendingHatch, takePendingHatch, clearPendingHatch } from './pendingHatch';

const NOW = Date.parse('2026-09-26T08:00:00Z');
const unhatched = { kidIntroSeen: false, onboardingDone: false };
const A = 'a'.repeat(32);
const B = 'b'.repeat(32);
const at = (nowMs: number, token: string | null = A) => ({ token, nowMs });

describe('pendingHatch', () => {
  beforeEach(() => { localStorage.clear(); });

  it('writes the picks under ronki_pending_hatch', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset', token: A }, NOW);
    const raw = JSON.parse(localStorage.getItem(PENDING_HATCH_KEY) as string);
    expect(raw).toMatchObject({ companionName: 'Funki', companionVariant: 'sunset', token: A, savedAt: NOW });
  });

  it('ignores an empty name', () => {
    savePendingHatch({ companionName: '', companionVariant: 'sunset', token: A }, NOW);
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('applies only to a state that has not met Ronki yet', () => {
    savePendingHatch({ companionName: 'Glut', companionVariant: 'teal', token: A }, NOW);
    expect(takePendingHatch(unhatched, at(NOW + 5000))).toEqual({
      kidIntroSeen: true, companionName: 'Glut', companionVariant: 'teal',
    });
    // still there until the patched state is seen (a reload before the save lands)
    expect(localStorage.getItem(PENDING_HATCH_KEY)).not.toBeNull();
    // once the state has kidIntroSeen, the next call drops it
    expect(takePendingHatch({ kidIntroSeen: true, onboardingDone: false }, at(NOW + 6000))).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('drops the stash for a cloud row whose Ronki already hatched', () => {
    savePendingHatch({ companionName: 'Pieks', companionVariant: 'amber', token: A }, NOW);
    expect(takePendingHatch({ kidIntroSeen: true, onboardingDone: true }, at(NOW + 1000))).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('drops a stash for an onboarded state even when kidIntroSeen is missing', () => {
    savePendingHatch({ companionName: 'Pieks', companionVariant: 'amber', token: A }, NOW);
    expect(takePendingHatch({ onboardingDone: true }, at(NOW + 1000))).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('drops a stash older than a day', () => {
    savePendingHatch({ companionName: 'Knisti', companionVariant: 'forest', token: A }, NOW);
    expect(takePendingHatch(unhatched, at(NOW + 25 * 3600 * 1000))).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('returns null with nothing stashed, a null state or broken JSON', () => {
    expect(takePendingHatch(unhatched, at(NOW))).toBeNull();
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset', token: A }, NOW);
    expect(takePendingHatch(null, at(NOW))).toBeNull();
    localStorage.setItem(PENDING_HATCH_KEY, '{nope');
    expect(takePendingHatch(unhatched, at(NOW))).toBeNull();
  });

  it('clearPendingHatch removes it', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset', token: A }, NOW);
    clearPendingHatch();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
    expect(takePendingHatch(unhatched, at(NOW))).toBeNull();
  });

  it('writes nothing without the card token', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset', token: '' }, NOW);
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('a stash for card A loaded under card B is dropped (sibling card on the same device)', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset', token: A }, NOW);
    expect(takePendingHatch(unhatched, at(NOW + 1000, B))).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('a stash is dropped when no token is active, and when it carries no token', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset', token: A }, NOW);
    expect(takePendingHatch(unhatched, at(NOW + 1000, null))).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
    localStorage.setItem(PENDING_HATCH_KEY, JSON.stringify({ companionName: 'Alt', companionVariant: 'teal', savedAt: NOW }));
    expect(takePendingHatch(unhatched, at(NOW + 1000, A))).toBeNull();
    expect(localStorage.getItem(PENDING_HATCH_KEY)).toBeNull();
  });

  it('token match ignores case', () => {
    savePendingHatch({ companionName: 'Funki', companionVariant: 'sunset', token: A.toUpperCase() }, NOW);
    expect(takePendingHatch(unhatched, at(NOW + 1000, A))).toEqual({
      kidIntroSeen: true, companionName: 'Funki', companionVariant: 'sunset',
    });
  });
});
