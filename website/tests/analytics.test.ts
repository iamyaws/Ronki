import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackEvent } from '../src/lib/analytics';

type UmamiStub = { track: ReturnType<typeof vi.fn> };

afterEach(() => {
  delete (window as unknown as { umami?: UmamiStub }).umami;
});

describe('trackEvent (Umami)', () => {
  it('sends the event name and its data to Umami', () => {
    const track = vi.fn();
    (window as unknown as { umami: UmamiStub }).umami = { track };
    trackEvent('Vorlage Download', { vorlage: 'vorlage-morgen', weg: 'pdf' });
    expect(track).toHaveBeenCalledWith('Vorlage Download', { vorlage: 'vorlage-morgen', weg: 'pdf' });
  });

  it('sends the name alone when there is no data', () => {
    const track = vi.fn();
    (window as unknown as { umami: UmamiStub }).umami = { track };
    trackEvent('CTA Klick');
    expect(track).toHaveBeenCalledWith('CTA Klick');
  });

  it('does nothing when the Umami script is missing or blocked', () => {
    expect(() => trackEvent('Karte erstellt')).not.toThrow();
  });

  it('never throws when Umami itself throws', () => {
    const track = vi.fn(() => {
      throw new Error('blocked');
    });
    (window as unknown as { umami: UmamiStub }).umami = { track };
    expect(() => trackEvent('Karte erstellt')).not.toThrow();
  });
});
