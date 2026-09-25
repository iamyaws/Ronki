import { useEffect, useState } from 'react';

/**
 * Which three taps put Ronki on the home screen, by device.
 *
 * Lived inside the old PWAInstall section on the start page. The section
 * is gone; the three steps now ride along in the night closing band, so
 * the data moved here and the wording stayed exactly as it was.
 * The full, long-form guide is /installieren and is untouched by this.
 */

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

export interface InstallStep {
  step: string;
  title: string;
  body: string;
}

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  // iPadOS 13+ reports as Mac — check touch + userAgent
  if (/macintosh/.test(ua) && 'ontouchend' in document) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

const STEPS_IOS: InstallStep[] = [
  {
    step: '1',
    title: 'Seite öffnen',
    body: 'Öffne Ronki in Safari auf deinem iPhone oder iPad.',
  },
  {
    step: '2',
    title: 'Teilen antippen',
    body: 'Tippe auf das Teilen-Symbol unten in der Leiste.',
  },
  {
    step: '3',
    title: 'Zum Home-Bildschirm',
    body: 'Wähle „Zum Home-Bildschirm" und tippe auf „Hinzufügen".',
  },
];

const STEPS_ANDROID: InstallStep[] = [
  {
    step: '1',
    title: 'Seite öffnen',
    body: 'Öffne Ronki in Chrome auf deinem Android-Gerät.',
  },
  {
    step: '2',
    title: 'Menü öffnen',
    body: 'Tippe auf die drei Punkte oben rechts.',
  },
  {
    step: '3',
    title: 'App installieren',
    body: 'Wähle „Zum Startbildschirm hinzufügen" oder „App installieren".',
  },
];

const STEPS_DESKTOP: InstallStep[] = [
  {
    step: '1',
    title: 'Seite öffnen',
    body: 'Öffne Ronki in Chrome, Edge oder einem anderen modernen Browser.',
  },
  {
    step: '2',
    title: 'Installieren',
    body: 'Klicke auf das kleine Symbol rechts in der Adresszeile.',
  },
  {
    step: '3',
    title: 'Fertig',
    body: 'Bestätige, und Ronki läuft wie eine ganz normale App.',
  },
];

export function getSteps(platform: Platform): InstallStep[] {
  switch (platform) {
    case 'ios':
      return STEPS_IOS;
    case 'android':
      return STEPS_ANDROID;
    case 'desktop':
      return STEPS_DESKTOP;
    default:
      return STEPS_IOS;
  }
}

export function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'ios':
      return 'iPhone / iPad';
    case 'android':
      return 'Android';
    case 'desktop':
      return 'Computer';
    default:
      return 'iPhone / iPad';
  }
}

/**
 * Platform after hydration, 'unknown' during the first render so the
 * server-rendered markup and the client agree.
 */
export function useInstallPlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('unknown');
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);
  return platform;
}
