/**
 * Anti-Engagement Poster — CUSTOM LAYOUT (not PosterShell).
 *
 * The other 4 posters use PosterShell's standard painterly-hero + small
 * phone inset. Anti-Engagement swaps that: the phone mockup (clean
 * completion state) IS the proof, so it becomes the mid-hero. A small
 * floating Heroic dragon carries brand recall without dominating.
 *
 * Bold theme (dark teal background, mustard accents) stays per
 * DESIGN.md: Mustard as "Quest Gold" on a dark surface hits max
 * visibility (9:1 contrast) where Sage would fall apart.
 */

import { useEffect } from 'react';
import { PhoneMockup } from '../components/PhoneMockup';

const QR_BASE =
  'https://api.qrserver.com/v1/create-qr-code/?size=800x800&format=png&margin=8';

export default function PrintA4PosterAntiEngagement() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const qrTarget = encodeURIComponent('https://www.ronki.de/installieren');
  const qrUrl = `${QR_BASE}&data=${qrTarget}&color=fdf8f0&bgcolor=1a3c3f`;

  return (
    <div className="print-root">
      <div className="no-print">
        <strong style={{ fontWeight: 700 }}>A4-Poster Druckvorschau</strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Cmd/Ctrl + P &middot; Papierformat: A4 &middot; Ränder: Keine &middot;
          Hintergrundgrafiken: Ein
        </span>
        <button onClick={() => window.print()} className="print-btn">
          Drucken / Als PDF
        </button>
      </div>

      <section className="poster-page poster-ae">
        <div className="poster-inner">
          <div className="wordmark" aria-label="Ronki">
            <img
              src="/art/branding/ronki-icon-heroic-128.webp"
              alt=""
              className="wordmark-icon"
              aria-hidden
            />
            <span className="wordmark-text">ronki</span>
          </div>

          <p className="eyebrow">Für Eltern, die Roblox satt haben</p>

          <h1 className="headline">
            Andere Apps wollen <em>wiederkommen</em>.
            <br />
            Ronki will <em>überflüssig werden</em>.
          </h1>

          <p className="subline">Ein Drache, ohne Fangmechanik.</p>

          {/* Mid-hero: phone mockup is the proof. Heroic dragon hovers as
              brand recall, not as an equal visual element. */}
          <div className="mid-hero">
            <img
              src="/art/branding/ronki-icon-heroic-256.webp"
              alt=""
              className="floating-dragon"
              aria-hidden
            />
            <div className="phone-frame-big">
              <div className="phone-notch" aria-hidden />
              <div className="phone-screen">
                <PhoneMockup variant="clean-aufgaben" scale={2} />
              </div>
            </div>
            <p className="phone-caption">Kein Streak, kein Loot. Nur was dran ist.</p>
          </div>

          <div className="proof-beats">
            <p>Keine Streaks, die reißen. Keine Loot-Boxes.</p>
            <p>Keine Push-Benachrichtigungen. Keine „Dein Freund ist online"-Karten.</p>
            <p>
              Wenn dein Kind nach zwei Monaten den Drachen fast nicht mehr braucht,{' '}
              <em>haben wir unseren Job gemacht.</em>
            </p>
          </div>

          <div className="bottom-row">
            <div className="cta-text">
              <p className="cta-heading">So probiert ihr Ronki heute aus:</p>
              <ol className="cta-steps">
                <li>
                  <strong>app.ronki.de</strong> im Browser öffnen
                </li>
                <li>Auf Startbildschirm legen, Elternprofil anlegen</li>
                <li>Eine Routine wählen, mit deinem Kind einrichten</li>
              </ol>
              <p className="cta-footer">
                Gebaut in Unterföhring · Marc Förster mit seinem Sohn Louis, 7 · hallo@ronki.de
              </p>
            </div>
            <div className="qr-wrap">
              <img src={qrUrl} alt="QR-Code zu ronki.de/installieren" className="qr" />
              <p className="qr-label">Scannen &amp; starten</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .print-root {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          min-height: 100vh;
          padding: 32px 16px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .print-root * { box-sizing: border-box; }

        .no-print {
          position: sticky;
          top: 16px;
          z-index: 20;
          background: #040812;
          color: #FFFFFF;
          padding: 10px 18px;
          border-radius: 999px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          max-width: 720px;
          width: 100%;
        }
        .print-btn {
          margin-left: auto;
          background: #FDD134;
          color: #040812;
          border: 0;
          padding: 6px 14px;
          border-radius: 999px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── Poster surface ─────────────────────────────────────── */
        .poster-page {
          width: 210mm;
          height: 297mm;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          position: relative;
          background: #040812;
          background-image:
            radial-gradient(ellipse 70% 45% at 75% 18%, rgba(253,209,52,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 15% 82%, rgba(5,68,176,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 55% 35% at 85% 95%, rgba(253,209,52,0.22) 0%, transparent 65%);
          color: #FFFFFF;
        }
        .poster-page::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4mm;
          background: #FDD134;
        }
        .poster-inner {
          height: 100%;
          padding: 20mm 18mm 16mm;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* ── Wordmark ───────────────────────────────────────────── */
        .wordmark {
          position: absolute;
          top: 10mm;
          right: 14mm;
          display: inline-flex;
          align-items: center;
          gap: 2mm;
          z-index: 2;
        }
        .wordmark-icon {
          width: 6mm;
          height: 6mm;
          display: block;
          flex-shrink: 0;
        }
        .wordmark-text {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 13pt;
          letter-spacing: -0.04em;
          color: #FFFFFF;
          line-height: 1;
        }

        /* ── Header block ───────────────────────────────────────── */
        .eyebrow {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          font-weight: 700;
          color: #FDD134;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin: 0 0 6mm;
          text-align: center;
        }
        .headline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 38pt;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 0;
          text-align: center;
          max-width: 174mm;
          margin-left: auto;
          margin-right: auto;
        }
        .headline em {
          font-style: italic;
          color: #FDD134;
          font-weight: 800;
        }
        .subline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 600;
          font-size: 14pt;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: rgba(255,255,255,0.72);
          margin: 6mm 0 0;
          text-align: center;
        }

        /* ── Mid-hero: phone as the proof ─────────────────────── */
        .mid-hero {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 8mm 0;
          min-height: 100mm;
        }
        .floating-dragon {
          position: absolute;
          top: 2mm;
          right: 18mm;
          width: 28mm;
          height: 28mm;
          filter: drop-shadow(0 4mm 8mm rgba(0,0,0,0.25));
          z-index: 1;
        }
        .phone-frame-big {
          width: 60mm;
          height: 110mm;
          background: #0F2A2C;
          border-radius: 7mm;
          padding: 2mm;
          box-shadow: 0 10mm 20mm -4mm rgba(0,0,0,0.5);
          position: relative;
          z-index: 2;
        }
        .phone-notch {
          position: absolute;
          top: 3mm;
          left: 50%;
          transform: translateX(-50%);
          width: 16mm;
          height: 3mm;
          background: #0F2A2C;
          border-radius: 1.5mm;
          z-index: 3;
        }
        .phone-screen {
          width: 100%;
          height: 100%;
          border-radius: 5mm;
          overflow: hidden;
        }
        .phone-caption {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8pt;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          margin: 3mm 0 0;
          text-align: center;
          letter-spacing: 0.02em;
        }

        /* ── Proof beats (body) ──────────────────────────────── */
        .proof-beats {
          display: flex;
          flex-direction: column;
          gap: 3mm;
          margin: 0 auto 6mm;
          max-width: 150mm;
          padding: 0 4mm;
        }
        .proof-beats p {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: rgba(255,255,255,0.88);
          margin: 0;
          text-align: center;
        }
        .proof-beats p:last-child {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 12.5pt;
          font-weight: 600;
          line-height: 1.35;
          color: #FFFFFF;
        }
        .proof-beats em {
          font-style: italic;
          color: #FDD134;
          font-weight: 700;
        }

        /* ── Bottom row ─────────────────────────────────────────── */
        .bottom-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10mm;
          align-items: center;
          padding-top: 6mm;
          border-top: 0.5mm solid rgba(255,255,255,0.15);
        }
        .cta-heading {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 12pt;
          color: #FFFFFF;
          margin: 0 0 2mm;
          letter-spacing: -0.01em;
        }
        .cta-steps {
          counter-reset: step;
          list-style: none;
          padding: 0;
          margin: 0 0 4mm;
          display: flex;
          flex-direction: column;
          gap: 1.8mm;
        }
        .cta-steps > li {
          counter-increment: step;
          position: relative;
          padding-left: 6.5mm;
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9.5pt;
          line-height: 1.35;
          color: rgba(255,255,255,0.88);
        }
        .cta-steps > li::before {
          content: counter(step, decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 8pt;
          color: #FDD134;
          letter-spacing: 0.03em;
        }
        .cta-steps strong {
          color: #FFFFFF;
          font-weight: 700;
        }
        .cta-footer {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7pt;
          color: rgba(255,255,255,0.55);
          margin: 0;
          letter-spacing: 0.02em;
          line-height: 1.4;
        }
        .qr-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2mm;
        }
        .qr {
          width: 42mm;
          height: 42mm;
          border-radius: 3mm;
          background: #040812;
        }
        .qr-label {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 8pt;
          color: #FDD134;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Print ─────────────────────────────────────────────── */
        @media print {
          @page { size: A4; margin: 0; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .print-root { padding: 0 !important; gap: 0 !important; align-items: stretch !important; min-height: 0 !important; }
          .poster-page { box-shadow: none !important; margin: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
