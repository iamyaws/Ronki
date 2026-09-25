import React, { useState, useRef, useEffect } from 'react';
import { setActiveToken } from '../lib/profileToken';
import { track } from '../lib/analytics';
import VoiceAudio from '../utils/voiceAudio';
import { lineText } from '../data/ronkiLines';
import { RonkiArt } from './MoodChibi';
import { DoodleIcon, MotionTicks, PaperCard, PillButton } from './bilderbuch';

const TOKEN_REGEX = /^[a-f0-9]{32}$/;

/**
 * Extract a profile token from QR data. Two encodings supported:
 *   1. Raw 32-hex string  ('a3f7c2e1b9d5408f2761c8e4ab90f3d6')
 *   2. Share URL with ?p=<32hex>  ('https://app.ronki.de/?p=a3f7c2e1...')
 *
 * The dashboard QR canvas encodes the URL form (so a phone's default
 * camera can auto-launch the link). The in-app scanner accepts either.
 */
export function tokenFromQRData(data) {
  if (!data || typeof data !== 'string') return null;
  const trimmed = data.trim();
  const lower = trimmed.toLowerCase();
  if (TOKEN_REGEX.test(lower)) return lower;
  try {
    const url = new URL(trimmed);
    const p = url.searchParams.get('p');
    if (p && TOKEN_REGEX.test(p.toLowerCase())) return p.toLowerCase();
  } catch { /* not a URL, fall through */ }
  return null;
}

/**
 * A token from what a parent pastes: the full share link, a link without
 * https://, or the bare 32-character code (spaces and dashes ignored).
 */
export function tokenFromPasted(text) {
  if (!text || typeof text !== 'string') return null;
  const direct = tokenFromQRData(text);
  if (direct) return direct;
  const m = /[?&]p=([a-f0-9]{32})(?![a-f0-9])/i.exec(text.trim());
  if (m) return m[1].toLowerCase();
  const bare = text.replace(/[\s-]/g, '').toLowerCase();
  return TOKEN_REGEX.test(bare) ? bare : null;
}

/** Hard reload so AuthGate re-resolves with the new token (a prop so tests can watch it). */
function defaultReload() {
  window.location.reload();
}

/** Camera errors that a parent fixes (permission, no camera): the kid line. */
const SLEEPY_CAMERA = new Set(['NotAllowedError', 'PermissionDeniedError', 'NotFoundError', 'OverconstrainedError', 'NotSupportedError']);

/**
 * NoProfileLanding: first screen for visitors with no profile token.
 *
 * BeyArena pattern (Marc 3 May 2026): the app stays a kid-only space.
 * Setup happens on the website at ronki.de/profil-erstellen. The parent
 * fills a one-screen form on their laptop or phone, the site generates a
 * token, seeds the cloud row and renders a printable QR card. The kid
 * scans that card on their tablet here.
 *
 * One primary CTA ("QR-Code scannen") plus a smaller Eltern callout
 * pointing to the website for new cards. No in-app form, no manual
 * code entry, no email, no password.
 *
 * Scan flow: opens the device back camera (facingMode environment), runs
 * jsQR per frame on a hidden canvas, validates the decoded URL or token,
 * persists via setActiveToken, hard-reloads so AuthGate picks up the
 * token via getActiveToken() and routes to the cloud-load flow.
 *
 * Fallback for "no camera on this device": the share URL the website
 * also produces encodes ?p=<token>; opening that URL bypasses this
 * screen entirely (AuthGate consumes the URL param on first mount).
 *
 * Bilderbuch cut (25 Sep 2026): white ground, the sun egg as the hero,
 * one cobalt pill, the parent hint on a paper card. Scan logic unchanged.
 *
 * Finch pass (26 Sep 2026, base 2.3, PRD 5.3): no longer a wall. Egg
 * first for everyone; this is the scan sheet the quiet "Ich habe schon
 * eine Karte" opens. A picture back control at the top goes back (prop
 * onBack): a drawn arrow plus a small egg when it leads to the egg
 * (prop backToEgg, default true), so a child who cannot read finds the
 * way back by picture; the label reads "Zurück zum Ei" or "Zurück". A camera
 * that is denied or missing shows Ronki's kid line "Die Kamera schläft
 * noch. Hol mal Mama oder Papa." (scan_camera_sleep_01, voiced), and a
 * parent field takes the share link or the bare code, so a denied camera
 * no longer ends the flow. onBeforeOpen(token) runs right before the
 * token is stored (the chain stashes a local hatch there, bound to that
 * token, spec R7).
 */
export default function NoProfileLanding({ onBack, backToEgg = true, onBeforeOpen, reload = defaultReload } = {}) {
  const [mode, setMode] = useState('choice'); // 'choice' | 'scan'
  const [scanError, setScanError] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [cameraAsleep, setCameraAsleep] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => { track('onboarding.landing.view'); }, []);

  /** Store the token and reload, the same way a successful scan does. */
  const openToken = (token) => {
    try { onBeforeOpen?.(token); } catch { /* the stash is best effort */ }
    setActiveToken(token);
    stopScan();
    reload();
  };

  const submitCode = () => {
    const token = tokenFromPasted(code);
    if (!token) {
      setCodeError('Das passt noch nicht. Fügt den ganzen Link oder den Code von der Karte ein.');
      return;
    }
    setCodeError('');
    try {
      openToken(token);
    } catch {
      setCodeError('Konnte den Code nicht speichern. Versucht es noch einmal.');
    }
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const detectedRef = useRef(false); // prevent double-trigger after success

  const stopScan = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch { /* track already stopped */ }
      });
      streamRef.current = null;
    }
  };

  // Cleanup on unmount: releases the camera if the user navigates
  // away mid-scan (e.g. back button to OS).
  useEffect(() => stopScan, []);

  useEffect(() => {
    if (mode !== 'scan') return undefined;
    let cancelled = false;

    (async () => {
      setScanError('');
      setCameraAsleep(false);
      setScanStatus('Kamera wird gestartet…');
      detectedRef.current = false;
      track('onboarding.scan.start');

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw Object.assign(new Error('NoMediaDevices'), { name: 'NotSupportedError' });
        }
        // Prefer the back camera (environment) so the kid can hold the
        // tablet flat and point it at the parent's QR card without
        // seeing themselves in the way.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // iOS Safari needs both attributes plus a play() call before
          // the stream renders. playsInline keeps it from going
          // fullscreen on tap.
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          try { await videoRef.current.play(); } catch { /* autoplay blocked, surfaces below */ }
          setScanStatus('Halte den QR-Code in den Rahmen.');
        }

        // Lazy-import jsQR (~30KB): only loads when the user actually
        // taps "QR scannen", keeping the initial bundle slim.
        const jsQRMod = await import('jsqr');
        if (cancelled) return;
        const jsQR = jsQRMod.default;

        const tick = () => {
          if (cancelled || detectedRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (video.readyState < 2) {
            // HAVE_CURRENT_DATA: wait for the first frame
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (!w || !h) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, w, h);
          let imageData;
          try {
            imageData = ctx.getImageData(0, 0, w, h);
          } catch {
            // Cross-origin canvas tainting should not happen for camera
            // streams, but guard anyway: fall through to the next frame.
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            const token = tokenFromQRData(code.data);
            if (token) {
              detectedRef.current = true;
              setScanStatus('Code erkannt. Du wirst weitergeleitet…');
              try {
                track('onboarding.scan.result', { result: 'success' });
                // Hard reload so AuthGate re-resolves with the new
                // token and syncLoadByToken pulls cloud state.
                openToken(token);
                return;
              } catch {
                setScanError('Konnte den Code nicht speichern. Versuch noch einmal.');
                detectedRef.current = false;
              }
            }
            // Found a QR but it was not a Ronki token: keep scanning
            // silently rather than spamming an error.
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (cancelled) return;
        const name = err?.name || '';
        const denied = name === 'NotAllowedError' || name === 'PermissionDeniedError';
        track('onboarding.scan.result', { result: denied ? 'denied' : 'failed' });
        if (SLEEPY_CAMERA.has(name)) {
          // Ronki's line for the child; the parent field below is the way on.
          setCameraAsleep(true);
          setScanError(lineText('scan_camera_sleep_01'));
          VoiceAudio.playLocalized('scan_camera_sleep_01', 200);
        } else {
          setScanError('Kamera konnte nicht gestartet werden.');
        }
        setScanStatus('');
      }
    })();

    return () => {
      cancelled = true;
      stopScan();
    };
  }, [mode]);

  const parentField = (
    <PaperCard tone="paper" className="mt-8">
      <p className="bb-hand text-xl text-cobalt mb-1 text-center">Für Eltern</p>
      <label htmlFor="npl-code" className="block font-headline font-semibold text-lg mb-2">
        Profil-Code oder Link einfügen
      </label>
      <input
        id="npl-code"
        type="text"
        inputMode="url"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        value={code}
        onChange={(e) => { setCode(e.target.value); setCodeError(''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') submitCode(); }}
        placeholder="https://app.ronki.de/?p=..."
        className="w-full min-w-0 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-3 font-body text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-cobalt"
      />
      {codeError && (
        <p className="text-base text-error font-headline font-semibold mt-2 mb-0" role="alert">{codeError}</p>
      )}
      <p className="text-base text-ink-soft leading-relaxed mt-2 mb-3">
        Den Link findet ihr im Eltern-Bereich unter Profil und Geräte, den Code auf der Karte.
      </p>
      <PillButton tone="secondary" full onClick={submitCode} disabled={!code.trim()}>
        Öffnen
      </PillButton>
    </PaperCard>
  );

  return (
    <div role="main" className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-white text-ink font-body">
      <main
        className="relative z-10 min-h-full flex flex-col px-5 max-w-md mx-auto"
        style={{
          paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {onBack && (
          <div className="flex justify-start -mt-3 mb-2">
            {/* The way back, by picture: a drawn arrow and (to the egg) the egg. */}
            <button
              type="button"
              data-testid="scan-back"
              aria-label={backToEgg ? 'Zurück zum Ei' : 'Zurück'}
              onClick={() => { stopScan(); onBack(); }}
              className="inline-flex items-center gap-2 min-h-[64px] min-w-[64px] -ml-2 pl-2 pr-4 rounded-full bg-transparent text-ink font-headline font-semibold text-lg focus:outline-none focus-visible:ring-[3px] focus-visible:ring-cobalt"
            >
              <DoodleIcon name="back" size={30} />
              {backToEgg && <RonkiArt pose="egg-sun" size={48} />}
              <span>{backToEgg ? 'Zurück zum Ei' : 'Zurück'}</span>
            </button>
          </div>
        )}

        {/* Hero: the sun egg. Ronki himself stays in the egg until the hatch. */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <RonkiArt pose="egg-sun" size={mode === 'choice' ? 150 : 96} idle="bb-egg-wobble" label="Ein Ei" />
            <MotionTicks tone="sun" size={30} rotate={-40} className="absolute" style={{ top: 6, right: -22 }} />
            <MotionTicks tone="sun" size={30} rotate={220} className="absolute" style={{ top: 6, left: -22 }} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="bb-display text-4xl">
            {mode === 'choice' ? 'Hast du eine Karte?' : 'QR-Code scannen'}
          </h1>
          {mode === 'choice' && (
            <p className="text-lg text-ink-soft mt-3 leading-relaxed">
              Mama oder Papa haben dir eine Karte gezeigt oder gegeben? Halte sie gleich vor die Kamera.
            </p>
          )}
          {mode === 'scan' && !cameraAsleep && (
            <p className="text-lg text-ink-soft mt-3 leading-relaxed">
              Halte die Kamera auf den ausgedruckten oder gezeigten QR-Code.
            </p>
          )}
        </div>

        {mode === 'choice' && (
          <>
            {/* QR scan: the one primary action */}
            <PillButton full size="lg" arrow onClick={() => setMode('scan')}>
              <QrDoodle />
              QR-Code scannen
            </PillButton>
            <p className="text-center text-base text-ink-soft mt-3">
              Halte die Kamera auf die Karte. Dann geht es los.
            </p>

            {parentField}
          </>
        )}

        {mode === 'scan' && (
          <div className="flex flex-col">
            {cameraAsleep ? (
              // Ronki's line, big, for the child; voiced once.
              <div className="flex flex-col items-center text-center gap-3" aria-live="polite">
                <RonkiArt pose="sleepy" size={140} label="Ronki" />
                <p className="bb-display text-3xl m-0" data-line="scan_camera_sleep_01">{scanError}</p>
              </div>
            ) : (
              <>
                {/* Camera preview frame: drawn outline, sun corner brackets */}
                <div
                  className="relative w-full mx-auto overflow-hidden rounded-[28px] border-[3px] border-ink bg-night"
                  style={{ aspectRatio: '1 / 1', maxWidth: 340 }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-label="Kamera-Vorschau"
                  />
                  {/* Hidden canvas for jsQR sampling, not visible. */}
                  <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                  {/* Scan-zone overlay: corner brackets so the kid knows
                      where to point. jsQR scans the full frame. */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative" style={{ width: '70%', height: '70%' }}>
                      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
                        const map = {
                          'top-left': { top: 0, left: 0, borderTop: '5px solid var(--color-sun)', borderLeft: '5px solid var(--color-sun)', borderTopLeftRadius: 16 },
                          'top-right': { top: 0, right: 0, borderTop: '5px solid var(--color-sun)', borderRight: '5px solid var(--color-sun)', borderTopRightRadius: 16 },
                          'bottom-left': { bottom: 0, left: 0, borderBottom: '5px solid var(--color-sun)', borderLeft: '5px solid var(--color-sun)', borderBottomLeftRadius: 16 },
                          'bottom-right': { bottom: 0, right: 0, borderBottom: '5px solid var(--color-sun)', borderRight: '5px solid var(--color-sun)', borderBottomRightRadius: 16 },
                        };
                        return <div key={pos} className="absolute" style={{ width: 36, height: 36, ...map[pos] }} />;
                      })}
                    </div>
                  </div>
                </div>

                {/* Status / error */}
                <div className="mt-5 min-h-[52px] text-center" aria-live="polite">
                  {scanError ? (
                    <p className="text-lg leading-relaxed text-error font-headline font-semibold">{scanError}</p>
                  ) : (
                    <p className="text-lg leading-relaxed text-ink-soft">{scanStatus || 'Halte den QR-Code in den Rahmen.'}</p>
                  )}
                </div>
              </>
            )}

            {/* Back to the choice */}
            <PillButton tone="secondary" full className="mt-4" onClick={() => setMode('choice')}>
              Abbrechen
            </PillButton>

            {(cameraAsleep || scanError) && parentField}
          </div>
        )}
      </main>
    </div>
  );
}

/* A drawn QR mark in the pill's ink (DoodleIcon has no QR shape). */
function QrDoodle() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 64 64"
      width="24"
      height="24"
      className="inline-block shrink-0 mr-1 align-[-4px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 9 C 17 8 22 8 27 9 C 28 15 28 21 27 27 C 21 28 15 28 9 27 C 8 21 8 15 9 9 Z" />
      <path d="M37 9 C 44 8 50 8 55 9 C 56 15 56 21 55 27 C 49 28 43 28 37 27 C 36 21 36 15 37 9 Z" />
      <path d="M9 37 C 17 36 22 36 27 37 C 28 43 28 49 27 55 C 21 56 15 56 9 55 C 8 49 8 43 9 37 Z" />
      <path d="M16 16 L20 20" />
      <path d="M44 16 L48 20" />
      <path d="M16 44 L20 48" />
      <path d="M38 38 L44 38" />
      <path d="M52 38 L55 38" />
      <path d="M38 46 L38 55" />
      <path d="M46 46 L55 46" />
      <path d="M46 55 L55 55" />
    </svg>
  );
}
