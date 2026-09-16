import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  // iPadOS 13+ reports as Mac — check touch + userAgent
  if (/macintosh/.test(ua) && 'ontouchend' in document) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

interface Step {
  step: string;
  title: string;
  body: string;
}

const STEPS_IOS: Step[] = [
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

const STEPS_ANDROID: Step[] = [
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

const STEPS_DESKTOP: Step[] = [
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

function getSteps(platform: Platform): Step[] {
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

function getPlatformLabel(platform: Platform): string {
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

export function PWAInstall() {
  const [platform, setPlatform] = useState<Platform>('unknown');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // During SSR / initial render, show iOS steps as default (most common mobile).
  // Platform-specific steps swap in after hydration.
  const steps = getSteps(platform === 'unknown' ? 'ios' : platform);

  return (
    <section className="px-6 py-24 sm:py-28 border-t border-teal/10" aria-labelledby="pwa-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto rounded-3xl bg-teal-dark p-8 sm:p-12 lg:p-16 relative overflow-hidden"
        style={{ boxShadow: '0 30px 60px -20px rgba(4,8,18,0.5)' }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-96 h-96 -mr-32 -mt-32 rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'rgba(5,68,176,0.35)' }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-80 h-80 -ml-24 -mb-24 rounded-full blur-[90px] pointer-events-none"
          style={{ background: 'rgba(253,209,52,0.18)' }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] text-cream/70 font-semibold mb-4">
            So wird die Installation aussehen
          </p>
          <h2
            id="pwa-heading"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight mb-5"
          >
            Kein App Store.{' '}
            <em className="italic text-mustard inline-block">Einmal antippen, fertig.</em>
          </h2>
          <p className="text-base sm:text-lg text-cream/70 leading-relaxed mb-10 max-w-xl mx-auto">
            Ronki öffnest du im Browser und legst es einmal auf den Startbildschirm. Danach ist es wie jede andere App: ein Symbol, das dein Kind antippt. Keine Werbung, keine Tracker, kein Download.
          </p>

          {/* Platform badge */}
          {platform !== 'unknown' && (
            <div className="inline-flex items-center gap-2 bg-cream/10 border border-cream/15 rounded-full px-4 py-1.5 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-mustard animate-pulse" aria-hidden />
              <span className="text-xs font-display font-bold text-cream/80">
                Anleitung für {getPlatformLabel(platform)}
              </span>
            </div>
          )}

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="relative bg-cream/[0.06] backdrop-blur-sm rounded-2xl p-6 border border-cream/10 text-left [hyphens:none]"
              >
                <div
                  className="w-9 h-9 rounded-full bg-mustard text-ink font-display font-bold text-sm flex items-center justify-center mb-4"
                >
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-cream text-base mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-cream/65 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center mt-10 pt-8 border-t border-cream/10">
            <TrustDot label="Keine Drittanbieter-Tracker" />
            <TrustDot label="Keine Werbung" />
            <TrustDot label="Funktioniert offline" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TrustDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-cream/55 font-medium">
      <span aria-hidden className="h-1 w-1 rounded-full bg-mustard/60" />
      {label}
    </span>
  );
}
