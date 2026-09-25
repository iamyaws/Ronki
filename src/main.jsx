// DEV-only ?clock= shift for loop tests; must run before anything reads Date.
import './devClock';
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';
import './index.css';

// Legal pages are accessible pre-auth (important for parents to read
// Datenschutz/Nutzungsbedingungen BEFORE creating an account). They're
// therefore routed OUTSIDE the AuthProvider that App wraps.
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const Nutzungsbedingungen = lazy(() => import('./pages/Nutzungsbedingungen'));

function LegalFallback() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-surface">
      <p className="font-label text-sm text-on-surface-variant">Laden…</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route
          path="/impressum"
          element={
            <Suspense fallback={<LegalFallback />}>
              <Impressum />
            </Suspense>
          }
        />
        <Route
          path="/datenschutz"
          element={
            <Suspense fallback={<LegalFallback />}>
              <Datenschutz />
            </Suspense>
          }
        />
        <Route
          path="/nutzungsbedingungen"
          element={
            <Suspense fallback={<LegalFallback />}>
              <Nutzungsbedingungen />
            </Suspense>
          }
        />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);

// SW — disabled for now (Marc 24 Apr 2026: SW cache was serving stale
// bundles all day during fast iteration; the offline-PWA benefit isn't
// worth the update-lag pain pre-v1).
//
// We actively UNREGISTER any already-installed SW and clear its caches
// so returning users get unstuck without needing DevTools. Stops
// registering new SWs until we re-enable this in v1.
//
// To re-enable: restore the registration flow from git history (see
// commits before 24 Apr 2026 ~midnight).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      // eslint-disable-next-line no-console
      if (regs.length) console.info('[sw] unregistered + caches cleared');
    } catch {
      // best-effort cleanup; silent on failure
    }
  });
}
