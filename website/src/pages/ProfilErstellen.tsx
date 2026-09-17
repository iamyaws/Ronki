/**
 * Profil-Karte erstellen — website-side parent setup for a kid profile.
 *
 * Marc 3 May 2026: "the one-time setup could be handled via the
 * website for parents to generate a code for their kids and print it
 * out." This page replaces the in-app CombinedParentSetup for new
 * profiles. Parents land here from the home/installieren page,
 * fill a one-screen form, and get a printable A6 QR card. The card
 * lives on the fridge or the kid's room; the kid scans it on their
 * tablet and lands straight in MeetRonki.
 *
 * Why website not app:
 *   - parents prefer typing on a laptop, not the kid's tablet
 *   - QR card is a physical artifact — generating it on a device
 *     with a real printer attached is the natural workflow
 *   - the app stays a kid-only space (no parent forms), which the
 *     5-8yo audience deserves
 *
 * The seeded state (parentOnboardingDone, parentHandoffBackSeen,
 * familyConfig) lives in Supabase profiles keyed by the new token.
 * The kid's first scan pulls it via syncLoadByToken in TaskContext.
 *
 * Print: A6 portrait, dedicated stylesheet hides everything except
 * #ronki-card-print — same pattern as the in-app dashboard QR card.
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import {
  ProfileCardFront,
  ProfileCardBack,
  profileCardCss,
  profileCardPreviewCss,
  profileCardPrintCss,
} from '../components/ProfileCard';
import { trackEvent } from '../lib/analytics';
import {
  createProfileOnSite,
  buildShareUrl,
  tokenDisplayFragment,
} from '../lib/profileSetup';

type Phase =
  | { kind: 'form' }
  | { kind: 'submitting' }
  | { kind: 'success'; token: string }
  | { kind: 'error'; message: string };

export default function ProfilErstellen() {
  const [phase, setPhase] = useState<Phase>({ kind: 'form' });
  const [childName, setChildName] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrPrintRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (phase.kind !== 'success') return;
    const url = buildShareUrl(phase.token);
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 240,
        color: { dark: '#040812', light: '#ffffff' },
      }).catch(() => { /* canvas not ready — next render */ });
    }
    if (qrPrintRef.current) {
      QRCode.toCanvas(qrPrintRef.current, url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 480,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch(() => { /* same */ });
    }
  }, [phase]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPinError('');
    const trimmedName = childName.trim();
    if (!trimmedName) return;
    if (pin && !/^\d{4}$/.test(pin)) {
      setPinError('Vier Ziffern, oder leer lassen.');
      return;
    }
    setPhase({ kind: 'submitting' });
    trackEvent('ProfilErstellen Submit');
    const res = await createProfileOnSite({
      childName: trimmedName,
      pin: pin || null,
    });
    if (res.ok) {
      trackEvent('ProfilErstellen Success');
      setPhase({ kind: 'success', token: res.token });
    } else {
      setPhase({
        kind: 'error',
        message:
          res.reason === 'config'
            ? 'Verbindung zum Server fehlt. Bitte später nochmal probieren.'
            : res.reason === 'invalid'
              ? 'Bitte Name eingeben (PIN optional, vier Ziffern).'
              : 'Karte konnte nicht angelegt werden. Bitte später nochmal.',
      });
    }
  }

  async function handleShare() {
    if (phase.kind !== 'success') return;
    const url = buildShareUrl(phase.token);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Ronki — Profil-Karte', url });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2400);
      }
    } catch { /* user cancelled / clipboard blocked */ }
  }

  function handlePrint() {
    try { window.print(); } catch { /* unsupported */ }
  }

  function handleCreateAnother() {
    setPhase({ kind: 'form' });
    setChildName('');
    setPin('');
    setPinError('');
  }

  return (
    <PainterlyShell>
      <PageMeta
        title="Profil-Karte erstellen — Ronki"
        description="Erstellt eine QR-Karte für euer Kind. Druckt sie aus, klebt sie an den Kühlschrank oder ins Kinderzimmer — ein Scan und Ronki ist da."
        canonicalPath="/profil-erstellen"
        noindex
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors mb-8"
            >
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
              Einrichtung &middot; einmalig
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.06] tracking-tight text-ink mb-6">
              {phase.kind === 'success' ? (
                <>Eure <em className="italic text-sage">Profil-Karte</em> ist bereit</>
              ) : (
                <>Eine <em className="italic text-sage">QR-Karte</em> für euer Kind</>
              )}
            </h1>
            {phase.kind !== 'success' && (
              <p className="text-lg text-ink/70 leading-relaxed mb-10 max-w-prose">
                Ein kurzes Formular, dann generieren wir eine Karte mit
                QR-Code. Druckt sie aus, klebt sie an den Kühlschrank
                oder ins Kinderzimmer. Euer Kind scannt sie auf dem
                Tablet — und Ronki ist da.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {(phase.kind === 'form' || phase.kind === 'submitting' || phase.kind === 'error') && (
        <section className="px-6 pb-16">
          <div className="max-w-md mx-auto">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-cream/60 border border-teal-dark/10 p-6 sm:p-8 shadow-sm"
            >
              <label className="block mb-5">
                <span className="block text-sm font-display font-semibold text-ink mb-2">
                  Name eures Kindes
                </span>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white border border-teal-dark/15 text-base text-ink focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                  placeholder="z. B. Louis"
                  maxLength={40}
                />
              </label>

              <label className="block mb-2">
                <span className="block text-sm font-display font-semibold text-ink mb-2">
                  Eltern-PIN <span className="font-normal text-ink/50">(optional)</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(digits);
                    setPinError('');
                  }}
                  className="w-full rounded-xl px-4 py-3 bg-white border border-teal-dark/15 text-base text-ink focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 font-mono tracking-[0.4em]"
                  placeholder="1234"
                />
              </label>
              <p className="text-xs text-ink/60 mb-6 leading-relaxed">
                {pinError ? (
                  <span className="text-rose-700">{pinError}</span>
                ) : (
                  <>Schützt den Eltern-Bereich in der App. Lasst es leer und ihr könnt es später setzen.</>
                )}
              </p>

              {phase.kind === 'error' && (
                <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  {phase.message}
                </p>
              )}

              <button
                type="submit"
                disabled={phase.kind === 'submitting' || !childName.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-display font-semibold text-lg bg-teal text-cream shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
              >
                {phase.kind === 'submitting' ? 'Karte wird angelegt…' : 'Karte erstellen'}
                {phase.kind !== 'submitting' && <span aria-hidden>→</span>}
              </button>

              <p className="text-xs text-ink/55 mt-5 leading-relaxed">
                Keine E-Mail nötig. Keine Werbung. Der QR-Code ist
                der einzige Weg in das Profil — bewahrt die Karte gut
                auf. Verloren? Auf dieser Seite eine neue erstellen.
              </p>
            </form>
          </div>
        </section>
      )}

      {phase.kind === 'success' && (
        <section className="px-6 pb-16">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl bg-cream/60 border border-teal-dark/10 p-6 sm:p-8 shadow-sm"
            >
              {/* Card preview — front face scaled down via .profile-
                  preview-shell so the parent sees the actual artifact
                  rather than a stripped-down "code box". The back face
                  with the QR is print-only. */}
              <div className="profile-preview-shell mb-6">
                <ProfileCardFront
                  childName={childName.trim()}
                  tokenFragment={tokenDisplayFragment(phase.token)}
                />
              </div>

              {/* Small inline QR — for the on-screen "scan from this
                  laptop" workflow (kid points tablet at the parent's
                  screen instead of waiting for print). */}
              <div className="flex items-center gap-4 mb-6 px-2">
                <canvas
                  ref={qrCanvasRef}
                  className="rounded-xl border border-teal-dark/10 bg-white p-2 flex-shrink-0"
                  style={{ width: 88, height: 88 }}
                  aria-label="QR-Code zum direkten Scannen"
                />
                <div className="text-left text-sm text-ink/75 leading-snug">
                  Direkt scannbar — euer Kind kann die Kamera auch jetzt schon hierauf richten.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-display font-semibold text-sm bg-teal text-cream shadow-md hover:shadow-lg transition-shadow"
                >
                  <span aria-hidden>🖨</span> Karte drucken
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-display font-semibold text-sm bg-cream text-ink border border-teal-dark/20 hover:bg-cream/80 transition-colors"
                >
                  {shareCopied ? '✓ Kopiert' : 'Link teilen'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCreateAnother}
                className="w-full text-sm text-ink/60 hover:text-ink py-3 transition-colors"
              >
                Weitere Karte für ein anderes Kind erstellen
              </button>
            </motion.div>

            <div className="mt-8 text-center">
              <h2 className="font-display font-semibold text-xl text-ink mb-3">
                So geht's weiter
              </h2>
              <ol className="text-left text-base text-ink/75 leading-relaxed space-y-2 max-w-sm mx-auto">
                <li><strong>1.</strong> Druckt die Karte aus (zwei Seiten — Vorder &amp; Rückseite) oder lasst sie auf dem Bildschirm.</li>
                <li><strong>2.</strong> Öffnet <a href="https://app.ronki.de" className="text-teal hover:underline">app.ronki.de</a> auf dem Tablet eures Kindes.</li>
                <li><strong>3.</strong> Tippt auf „QR-Code scannen" und haltet die Kamera auf die Rückseite der Karte.</li>
                <li><strong>4.</strong> Ronki begrüßt euer Kind beim Namen — fertig.</li>
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* This page is the card builder, so a closing band that invites
       *  you to build a card would point at itself. */}
      <Footer closing={false} />

      {/* ── Print-only frame. Portaled to <body> so the print
            stylesheet's `body > *:not(.profile-print-frame)` selector
            isolates it on the printed page. Two A6 pages (front +
            back) split via page-break-after. ── */}
      {phase.kind === 'success' && typeof document !== 'undefined' && createPortal(
        <div className="profile-print-frame" aria-hidden="true">
          <ProfileCardFront
            childName={childName.trim()}
            tokenFragment={tokenDisplayFragment(phase.token)}
          />
          <ProfileCardBack
            childName={childName.trim()}
            tokenFragment={tokenDisplayFragment(phase.token)}
            qrCanvasRef={qrPrintRef}
          />
        </div>,
        document.body,
      )}

      <style>{profileCardCss + profileCardPreviewCss + profileCardPrintCss}</style>
    </PainterlyShell>
  );
}
