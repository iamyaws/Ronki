/**
 * Print-ready A4 Poster for Ronki (private utility page).
 *
 * Usage:
 *   1. Open https://www.ronki.de/print/a4-poster in Chrome
 *   2. Cmd/Ctrl + P → "Als PDF speichern"
 *   3. IMPORTANT print dialog settings:
 *        - Paper size: A4
 *        - Margins: Keine / None
 *        - Background graphics: ON
 *   4. Result: single-page PDF at exactly A4 (210 × 297 mm)
 *
 * Designed to read from ~2 m distance — use on Hort-Pinnwand, Kita-Aushang,
 * Kinderarzt-Wartezimmer, Schul-Bulletin-Board. QR prominent bottom-right.
 */

import { useEffect } from 'react';

const QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de%2Finstallieren' +
  '&size=800x800&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

export default function PrintA4Poster() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="print-root">
      {/* ── Instruction bar (hidden in print) ─────────────────────── */}
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

      {/* ── A4 Poster Page ───────────────────────────────────────── */}
      <section className="poster-page">
        <div className="poster-inner">
          {/* Top strip with eyebrow */}
          <p className="eyebrow">Für Eltern von Grundschulkindern</p>

          {/* Massive word mark */}
          <h1 className="wordmark">Ronki.</h1>

          {/* Subhead */}
          <p className="subhead">
            Der Drachen-Gefährte für die tägliche Routine.
          </p>

          {/* Dragon image centered */}
          <div className="dragon-wrap">
            <img
              src="/art/companion/dragon-baby.webp"
              alt=""
              className="dragon"
              width={600}
              height={600}
            />
          </div>

          {/* Mid body */}
          <p className="body-text">
            Wenn morgens noch{' '}
            <span style={{ fontStyle: 'italic', color: '#0544B0' }}>
              „Zähne putzen!"
            </span>{' '}
            durchs Haus schallt, legt Ronki die Reihenfolge für dein Kind
            sichtbar auf den Startbildschirm. Kein App-Store, keine Werbung,
            keine Streaks, keine In-App-Käufe. Ronki läuft direkt im Browser.
          </p>

          {/* QR + CTA + Footer row */}
          <div className="bottom-row">
            <div className="cta-text">
              <p className="cta-heading">Einfach ausprobieren:</p>
              <ol className="cta-steps">
                <li>QR-Code scannen oder <strong>ronki.de</strong> besuchen</li>
                <li>
                  <strong>app.ronki.de</strong> auf den Startbildschirm legen
                </li>
                <li>Mit deinem Kind eine Routine einrichten</li>
              </ol>
              <p className="cta-footer">
                Gebaut in Unterföhring &middot; Marc Förster mit seinem Sohn
                Louis, 7 &middot; hallo@ronki.de
              </p>
            </div>
            <div className="qr-wrap">
              <img src={QR_URL} alt="QR-Code zu ronki.de/installieren" className="qr" />
              <p className="qr-label">Scannen &amp; starten</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .print-root {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          color: #040812;
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

        /* ───── Poster Page ───── */
        .poster-page {
          width: 210mm;
          height: 297mm;
          background: #FFFFFF;
          background-image:
            radial-gradient(ellipse 70% 45% at 75% 18%, rgba(253,209,52,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 15% 82%, rgba(5,68,176,0.14) 0%, transparent 60%);
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          position: relative;
        }
        .poster-page::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4mm;
          background: #FDD134;
        }
        .poster-inner {
          height: 100%;
          padding: 20mm 18mm 16mm;
          display: flex;
          flex-direction: column;
        }

        .eyebrow {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          font-weight: 700;
          color: #0544B0;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin: 0 0 6mm;
          text-align: center;
        }

        .wordmark {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 90pt;
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: #040812;
          margin: 0;
          text-align: center;
        }

        .subhead {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 600;
          font-size: 17pt;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #0544B0;
          margin: 4mm 0 0;
          text-align: center;
          text-wrap: balance;
        }

        .dragon-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
          margin: 4mm 0 4mm;
        }
        .dragon {
          width: 90mm;
          height: 90mm;
          object-fit: cover;
          border-radius: 10mm;
          box-shadow: 0 10mm 20mm -5mm rgba(4,8,18,0.25);
        }

        .body-text {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: rgba(4,8,18,0.8);
          margin: 0 0 6mm;
          text-align: center;
          text-wrap: pretty;
          max-width: 155mm;
          margin-left: auto;
          margin-right: auto;
        }

        .bottom-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10mm;
          align-items: center;
          padding-top: 6mm;
          border-top: 0.5mm solid rgba(4,8,18,0.15);
        }
        .cta-text {
          min-width: 0;
        }
        .cta-heading {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 11pt;
          color: #040812;
          margin: 0 0 2mm;
          letter-spacing: -0.005em;
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
          color: #040812;
        }
        .cta-steps > li::before {
          content: counter(step, decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 8pt;
          color: #0544B0;
          letter-spacing: 0.03em;
        }
        .cta-steps strong {
          color: #040812;
          font-weight: 700;
        }
        .cta-footer {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7pt;
          color: rgba(4,8,18,0.55);
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
          background: #FFFFFF;
        }
        .qr-label {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 8pt;
          color: #0544B0;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
        }

        /* ───── Print overrides ───── */
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .print-root {
            padding: 0 !important;
            gap: 0 !important;
            align-items: stretch !important;
            min-height: 0 !important;
          }
          .poster-page {
            box-shadow: none !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
