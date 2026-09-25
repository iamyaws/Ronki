/**
 * Print-ready A6 Flyer for Ronki (private utility page).
 *
 * Usage:
 *   1. Open https://www.ronki.de/print/a6-flyer in Chrome
 *   2. Cmd/Ctrl + P → "Als PDF speichern"
 *   3. IMPORTANT print dialog settings:
 *        - Paper size: A6
 *        - Margins: Keine / None
 *        - Background graphics: ON (checkbox im Chrome-Print-Dialog)
 *   4. Result: 2-page PDF (front + back), each exactly A6 (105 × 148 mm)
 *   5. For multiple copies: tell copy shop "A6, doppelseitig Matte 250 g"
 *
 * Design uses exact Ronki brand palette + self-hosted fonts (already loaded
 * globally via index.css). QR code is fetched at render time from
 * api.qrserver.com and points at /installieren for device-specific steps.
 */

import { useEffect } from 'react';

const QR_URL_FRONT =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de%2Finstallieren' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

export default function PrintA6Flyer() {
  // Give the page a distinct background in screen preview so the flyer
  // pages pop visually; in print, we override to white via @media print.
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="print-root">
      {/* ── Instruction bar (hidden in print) ─────────────────────── */}
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>A6-Flyer Druckvorschau</strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Cmd/Ctrl + P &middot; Papierformat: A6 &middot; Ränder: Keine &middot;
          Hintergrundgrafiken: Ein
        </span>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Page 1: Front ─────────────────────────────────────────── */}
      <section className="flyer-page flyer-front">
        <div className="front-inner">
          <p className="eyebrow">Für Grundschulkinder ab 5</p>

          <h1 className="headline">
            Wenn morgens noch
            <br />
            <span style={{ fontStyle: 'italic', color: '#0544B0' }}>
              „Zähne putzen!"
            </span>
            <br />
            durchs Haus schallt.
          </h1>

          <p className="subline">
            Ronki ist ein Drachen-Gefährte, der dein Kind durch die tägliche
            Routine begleitet. Keine Werbung, keine Streaks, kein App-Store.
          </p>

          <img
            src="/art/companion/dragon-baby.webp"
            alt=""
            className="dragon"
            width={280}
            height={280}
          />

          <p className="origin">
            Gebaut in Unterföhring von einem Vater und seinem siebenjährigen
            Sohn.
          </p>

          <p className="domain">ronki.de</p>
        </div>
      </section>

      {/* ── Page 2: Back ─────────────────────────────────────────── */}
      <section className="flyer-page flyer-back">
        <div className="back-inner">
          <p className="eyebrow-back">So geht's in 30 Sekunden</p>

          <p className="intro-back">
            Ronki läuft direkt im Browser. Kein Store, kein Download. Einmal
            auf den Startbildschirm legen, fertig.
          </p>

          <ol className="steps">
            <li>
              <strong>app.ronki.de</strong> öffnen
              <span className="step-hint">
                iPhone: Safari &middot; Android: Chrome &middot; Fire Tablet:
                Silk oder Chrome
              </span>
            </li>
            <li>
              Einmal auf den <strong>Startbildschirm</strong> legen
              <span className="step-hint">
                iPhone: Teilen-Symbol &rarr; „Zum Home-Bildschirm"
                <br />
                Android: unten erscheint „Installieren"
              </span>
            </li>
            <li>
              Mit deinem Kind eine <strong>Routine</strong> einrichten
              <span className="step-hint">Morgen oder Abend genügt zum Start</span>
            </li>
          </ol>

          <div className="no-list">
            <p className="no-title">Was wir bewusst weglassen:</p>
            <ul>
              <li>Keine Werbung, nie.</li>
              <li>Keine Streaks, die reißen.</li>
              <li>Keine In-App-Käufe.</li>
              <li>Keine Push-Benachrichtigungen.</li>
            </ul>
          </div>

          <div className="qr-block">
            <img src={QR_URL_FRONT} alt="QR-Code zu ronki.de/installieren" className="qr" />
            <p className="qr-caption">
              Scannen für Schritt-für-Schritt-Anleitung pro Gerät:
              <br />
              <strong>ronki.de/installieren</strong>
            </p>
          </div>

          <p className="footer-line">
            Marc Förster &middot; Louis, 7 &middot; Unterföhring &middot;{' '}
            hallo@ronki.de
          </p>
        </div>
      </section>

      <style>{`
        /* ───── Global reset for the print root ───── */
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

        /* ───── Instruction bar ───── */
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
        }

        /* ───── Page base (both front + back) ───── */
        .flyer-page {
          width: 105mm;
          height: 148mm;
          overflow: hidden;
          background: #FFFFFF;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          break-inside: avoid;
        }
        .flyer-page + .flyer-page {
          margin-top: 24px;
        }

        /* ───── Front ───── */
        .flyer-front {
          background: #FFFFFF;
          background-image:
            radial-gradient(circle at 85% 15%, rgba(253,209,52,0.18) 0%, transparent 55%),
            radial-gradient(circle at 10% 95%, rgba(5,68,176,0.12) 0%, transparent 60%);
        }
        .front-inner {
          padding: 10mm 8mm;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .eyebrow {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7.5pt;
          font-weight: 700;
          color: #0544B0;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin: 0 0 5mm;
        }
        .headline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 18pt;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: #040812;
          margin: 0 0 4mm;
          text-wrap: balance;
        }
        .subline {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9pt;
          line-height: 1.45;
          color: rgba(4,8,18,0.78);
          margin: 0 0 3mm;
        }
        .dragon {
          width: 52mm;
          height: auto;
          margin: 2mm auto 3mm;
          display: block;
          border-radius: 10mm;
          box-shadow: 0 6px 16px rgba(4,8,18,0.18);
        }
        .origin {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 7.5pt;
          line-height: 1.4;
          color: rgba(4,8,18,0.62);
          font-style: italic;
          text-align: center;
          margin: auto 0 2mm;
        }
        .domain {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 10pt;
          color: #040812;
          text-align: center;
          letter-spacing: 0.04em;
          margin: 0;
        }

        /* ───── Back ───── */
        .flyer-back {
          background: #FFFFFF;
          border-top: 2mm solid #FDD134;
        }
        .back-inner {
          padding: 8mm 8mm;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .eyebrow-back {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 14pt;
          color: #040812;
          letter-spacing: -0.005em;
          margin: 0 0 3mm;
        }
        .intro-back {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 8.5pt;
          line-height: 1.45;
          color: rgba(4,8,18,0.78);
          margin: 0 0 4mm;
        }
        .steps {
          counter-reset: step;
          list-style: none;
          padding: 0;
          margin: 0 0 4mm;
          display: flex;
          flex-direction: column;
          gap: 2.5mm;
        }
        .steps > li {
          counter-increment: step;
          position: relative;
          padding-left: 7.5mm;
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9pt;
          line-height: 1.35;
          color: #040812;
        }
        .steps > li::before {
          content: counter(step, decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0.3mm;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 8pt;
          color: #0544B0;
          letter-spacing: 0.03em;
        }
        .step-hint {
          display: block;
          margin-top: 0.8mm;
          font-size: 7.5pt;
          color: rgba(4,8,18,0.55);
          line-height: 1.35;
        }
        .no-list {
          background: rgba(5,68,176,0.08);
          border-left: 0.8mm solid #0544B0;
          padding: 3mm 3.5mm;
          border-radius: 0 3mm 3mm 0;
          margin: 0 0 4mm;
        }
        .no-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 7.5pt;
          color: #0544B0;
          letter-spacing: 0.05em;
          margin: 0 0 2mm;
        }
        .no-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 8pt;
          line-height: 1.5;
          color: #040812;
        }
        .no-list ul li {
          padding-left: 4mm;
          position: relative;
        }
        .no-list ul li::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          color: #0544B0;
          font-weight: 700;
        }
        .qr-block {
          display: flex;
          align-items: center;
          gap: 3mm;
          margin: auto 0 3mm;
        }
        .qr {
          width: 22mm;
          height: 22mm;
          border-radius: 2mm;
          background: #FFFFFF;
          flex-shrink: 0;
        }
        .qr-caption {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 7.5pt;
          line-height: 1.35;
          color: rgba(4,8,18,0.72);
          margin: 0;
        }
        .qr-caption strong {
          color: #040812;
          font-weight: 700;
        }
        .footer-line {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 6.5pt;
          color: rgba(4,8,18,0.55);
          letter-spacing: 0.03em;
          margin: 0;
          text-align: center;
          padding-top: 2mm;
          border-top: 0.3mm solid rgba(4,8,18,0.12);
        }

        /* ───── Print overrides ───── */
        @media print {
          @page {
            size: A6;
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
          .flyer-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
          }
          .flyer-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const instructionBarStyle: React.CSSProperties = {
  maxWidth: 600,
  width: '100%',
};

const printBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: '#FDD134',
  color: '#040812',
  border: 0,
  padding: '6px 14px',
  borderRadius: 999,
  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  flexShrink: 0,
};
