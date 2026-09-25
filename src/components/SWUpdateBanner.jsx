import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * SWUpdateBanner — shown at the top of the app when a new service-worker
 * version is installed and waiting to take over. Non-blocking: the user can
 * keep playing on the current version, or tap "Neu laden" to activate the new
 * one (which triggers a single page reload).
 *
 * Wiring (done in src/main.jsx):
 *   - `window.__swWaiting` holds the waiting ServiceWorker registration
 *     reference once an update is ready.
 *   - A `sw:update-ready` CustomEvent fires on `window` at the same moment.
 *   - When the user clicks "Neu laden", we postMessage({ type: 'SKIP_WAITING' })
 *     to the waiting worker. Its `skipWaiting()` fires, it becomes the active
 *     SW, a `controllerchange` fires in main.jsx, and the page reloads once.
 *
 * Styling mirrors AlphaBanner so it sits visually in the same top-of-app
 * strip but with a brighter accent (amber) so parents/kids notice it.
 *
 * Mount point: App.jsx app-shell, stacked directly under AlphaBanner so
 * both sticky strips stack cleanly.
 */
export default function SWUpdateBanner() {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If an update was already detected before this component mounted
    // (e.g. detection happened while AuthGate was still loading), pick it
    // up from the window handle main.jsx sets.
    if (typeof window !== 'undefined' && window.__swWaiting) {
      setReady(true);
    }
    const onReady = () => setReady(true);
    window.addEventListener('sw:update-ready', onReady);
    return () => window.removeEventListener('sw:update-ready', onReady);
  }, []);

  if (!ready) return null;

  const handleReload = () => {
    const waiting = typeof window !== 'undefined' ? window.__swWaiting : null;
    if (waiting && typeof waiting.postMessage === 'function') {
      // Tell the waiting SW to activate now. main.jsx's controllerchange
      // listener will reload the page once the new SW takes over.
      waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: plain reload. Users stuck in a weird state still recover.
      window.location.reload();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 inset-x-0 z-[61] bg-night text-white font-headline border-b-[2px] border-sun"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-2 text-[13px] leading-tight">
        <span aria-hidden className="inline-block w-2 h-2 rounded-full bg-sun shrink-0 animate-pulse" />
        <span className="font-semibold">{t('sw.update.title')}</span>
        <button
          type="button"
          onClick={handleReload}
          className="ml-auto shrink-0 rounded-full bg-sun text-ink font-bold px-4 py-1.5 text-[12px] border-[2px] border-ink active:scale-95 transition-transform"
        >
          {t('sw.update.button')}
        </button>
      </div>
    </div>
  );
}
