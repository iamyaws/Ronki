/**
 * Thin wrapper around the Umami Analytics global.
 *
 * Umami replaced Plausible on 25 Sep 2026 (the Plausible trial had ended and
 * no longer stored data). The script loads with `defer` from index.html, so
 * `window.umami` may not exist yet on very early calls, and blockers can
 * remove it entirely. This helper guards the call and silently no-ops;
 * analytics is non-critical and must never crash the app.
 *
 * Usage:
 *   import { trackEvent } from '../lib/analytics';
 *   trackEvent('CTA Klick', { cta: 'header' });
 *   trackEvent('Karte erstellt');
 *
 * Conventions:
 * - Event names are Title Case and stay stable ("CTA Klick", "Karte erstellt",
 *   "Vorlage Download"); the decision gates read them by name.
 * - Data values are lowercase snake_case strings, numbers or booleans.
 */

type EventData = Record<string, string | number | boolean>;

type UmamiGlobal = {
  track: (eventName: string, eventData?: EventData) => void;
};

declare global {
  interface Window {
    umami?: UmamiGlobal;
  }
}

export function trackEvent(name: string, props?: EventData): void {
  if (typeof window === 'undefined') return;
  const umami = window.umami;
  if (!umami || typeof umami.track !== 'function') return;
  try {
    if (props) {
      umami.track(name, props);
    } else {
      umami.track(name);
    }
  } catch {
    // Silently ignore, analytics must never crash the app.
  }
}
