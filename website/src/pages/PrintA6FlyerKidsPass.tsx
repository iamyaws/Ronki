/**
 * Print-ready A6 Flyer for KIDS — Variant "Drachen-Pass".
 *
 * Voice direction: the flyer IS a pass / official-looking ID card.
 * Front = cover (dark teal, emblem, pass number line Louis fills in
 * before handing it over). Back = inside of the pass, with form
 * fields the recipient fills in themselves, rules-in-fine-print, a
 * QR "stamp" area, and an official-looking seal.
 *
 * Kid reasoning (Agent 3 recommendation): format-as-artefact. A
 * "Pass" is the single strongest peer-status object in 1st–2nd grade
 * — it looks rule-bound, official, nameable, collectable. The form
 * fields turn the recipient into an active participant instead of
 * a passive "Zettel-Empfänger". Fill-in your name, your dragon's
 * name, find the grown-up who can scan. The act of filling it in
 * plants ownership before the app is even installed.
 *
 * Print spec: A6 (105×148 mm), 2 pages. Matt or satin stock, 250-
 * 300g. Dark teal cover prints well on coated paper. Consider
 * gold foil for DRACHEN-PASS title if going fancy.
 */

import { useEffect } from 'react';

const QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de%2Finstallieren' +
  '&size=500x500&format=png&margin=6&color=1a3c3f&bgcolor=fdf8f0';

export default function PrintA6FlyerKidsPass() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>A6-Flyer „Drachen-Pass" Druckvorschau</strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Cmd/Ctrl + P &middot; A6 &middot; Ränder: Keine &middot; Hintergrundgrafiken: Ein
        </span>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Front: pass cover ─────────────────────────────── */}
      <section className="flyer-page pass-front">
        {/* Corner ornaments */}
        <div className="corner-orn tl" />
        <div className="corner-orn tr" />
        <div className="corner-orn bl" />
        <div className="corner-orn br" />

        <div className="pass-front-inner">
          <p className="issuer">
            AUSGESTELLT VOM<br />
            KÖNIGREICH DER DRACHEN
          </p>

          <div className="emblem">
            <svg className="emblem-ring" viewBox="0 0 180 180" aria-hidden>
              <defs>
                <radialGradient id="emblemBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFE68A" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#FFE68A" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#FFE68A" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="90" cy="90" r="88" fill="url(#emblemBg)" />
              <circle
                cx="90"
                cy="90"
                r="78"
                fill="none"
                stroke="#FDD134"
                strokeWidth="1.2"
                strokeDasharray="2 3"
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#FDD134"
                strokeWidth="0.6"
                opacity="0.6"
              />
              {/* 8-point star flourish behind dragon */}
              <g fill="#FDD134" opacity="0.35">
                <polygon points="90,10 93,60 90,75 87,60" />
                <polygon points="90,170 93,120 90,105 87,120" />
                <polygon points="10,90 60,93 75,90 60,87" />
                <polygon points="170,90 120,93 105,90 120,87" />
              </g>
            </svg>
            <img
              src="/art/branding/ronki-icon-heroic-256.webp"
              alt="Drachen-Pass Emblem"
              className="emblem-dragon"
              width={256}
              height={256}
            />
          </div>

          <h1 className="pass-title">DRACHEN-PASS</h1>
          <p className="pass-tagline">
            <span className="star">✦</span>
            Nur für Freunde von Ronki
            <span className="star">✦</span>
          </p>

          <div className="pass-number">
            <span className="pn-label">Nr.</span>
            <span className="pn-line" />
            <span className="pn-total">/ 30</span>
          </div>

          <p className="issued-by">
            Übergeben von <strong>Louis</strong>
          </p>
        </div>
      </section>

      {/* ── Back: inside of the pass ──────────────────────── */}
      <section className="flyer-page pass-back">
        <div className="pass-back-inner">
          <p className="inside-header">
            · INNENSEITE · DRACHEN-PASS ·
          </p>

          <h2 className="inside-title">
            Du bist jetzt offiziell
            <br />
            Drachen-Freund.
          </h2>

          <div className="form-block">
            <div className="form-row">
              <label>Dein Name</label>
              <span className="field-line" />
            </div>
            <div className="form-row">
              <label>Dein Drache heißt</label>
              <span className="field-line" />
            </div>
            <div className="form-row tight">
              <label>Gefunden am</label>
              <span className="field-line short" />
            </div>
          </div>

          <div className="rules-block">
            <p className="rules-title">§ Drachen-Regeln</p>
            <ol className="rules">
              <li>
                <strong>§1</strong> Erwachsene scannen den Code unten.
              </li>
              <li>
                <strong>§2</strong> Der Drache wohnt dann im Handy.
              </li>
              <li>
                <strong>§3</strong> Du darfst den Pass behalten. Immer.
              </li>
            </ol>
          </div>

          <div className="stamp-row">
            <div className="qr-stamp">
              <img src={QR_URL} alt="QR-Code zu ronki.de" className="qr-img" />
              <p className="qr-lbl">SCAN-STEMPEL</p>
            </div>
            <div className="seal" aria-hidden>
              <svg viewBox="0 0 80 80" width="100%" height="100%">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#A83E2C"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="28"
                  fill="none"
                  stroke="#A83E2C"
                  strokeWidth="0.8"
                />
                <text
                  x="40"
                  y="32"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="800"
                  fill="#A83E2C"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  ECHT ✦
                </text>
                <text
                  x="40"
                  y="44"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="900"
                  fill="#A83E2C"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  RONKI
                </text>
                <text
                  x="40"
                  y="56"
                  textAnchor="middle"
                  fontSize="6"
                  fontWeight="700"
                  fill="#A83E2C"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  letterSpacing="1"
                >
                  DRACHEN-SIEGEL
                </text>
              </svg>
            </div>
          </div>

          <p className="back-foot">
            <strong>ronki.de</strong> &nbsp;·&nbsp; Geprüft. Werbefrei. Kein Streak.
          </p>
        </div>
      </section>

      <style>{`
        .print-root {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          min-height: 100vh;
          padding: 32px 16px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .print-root * { box-sizing: border-box; }

        .flyer-page {
          width: 105mm;
          height: 148mm;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(0,0,0,0.12);
          position: relative;
        }

        /* ── FRONT (COVER) ─────────────────────────────── */
        .pass-front {
          background:
            radial-gradient(ellipse 140% 90% at 50% 10%, #0544B0 0%, transparent 70%),
            radial-gradient(ellipse 100% 70% at 50% 100%, rgba(4,8,18,1) 0%, transparent 60%),
            #040812;
          color: #FFFFFF;
        }
        .pass-front::before {
          content: "";
          position: absolute;
          inset: 4mm;
          border: 0.4mm solid rgba(253,209,52,0.55);
          border-radius: 1.5mm;
          pointer-events: none;
        }
        .pass-front::after {
          content: "";
          position: absolute;
          inset: 5mm;
          border: 0.2mm solid rgba(253,209,52,0.22);
          border-radius: 1mm;
          pointer-events: none;
        }

        .corner-orn {
          position: absolute;
          width: 10mm;
          height: 10mm;
          pointer-events: none;
        }
        .corner-orn.tl {
          top: 4mm; left: 4mm;
          background:
            linear-gradient(#FDD134, #FDD134) top left / 100% 0.4mm no-repeat,
            linear-gradient(#FDD134, #FDD134) top left / 0.4mm 100% no-repeat;
        }
        .corner-orn.tr {
          top: 4mm; right: 4mm;
          background:
            linear-gradient(#FDD134, #FDD134) top right / 100% 0.4mm no-repeat,
            linear-gradient(#FDD134, #FDD134) top right / 0.4mm 100% no-repeat;
        }
        .corner-orn.bl {
          bottom: 4mm; left: 4mm;
          background:
            linear-gradient(#FDD134, #FDD134) bottom left / 100% 0.4mm no-repeat,
            linear-gradient(#FDD134, #FDD134) bottom left / 0.4mm 100% no-repeat;
        }
        .corner-orn.br {
          bottom: 4mm; right: 4mm;
          background:
            linear-gradient(#FDD134, #FDD134) bottom right / 100% 0.4mm no-repeat,
            linear-gradient(#FDD134, #FDD134) bottom right / 0.4mm 100% no-repeat;
        }

        .pass-front-inner {
          position: relative;
          z-index: 2;
          height: 100%;
          padding: 13mm 10mm 11mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .issuer {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 6.5pt;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: rgba(253,209,52,0.85);
          margin: 0 0 5mm;
          line-height: 1.4;
        }

        .emblem {
          position: relative;
          width: 45mm;
          height: 45mm;
          margin: 0 0 4mm;
        }
        .emblem-ring {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .emblem-dragon {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 62%;
          height: auto;
          filter: drop-shadow(0 2mm 3mm rgba(0,0,0,0.45));
        }

        .pass-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 22pt;
          font-weight: 900;
          letter-spacing: 0.18em;
          color: #FDD134;
          margin: 0 0 1mm;
          line-height: 1;
          text-shadow: 0 0.5mm 1mm rgba(0,0,0,0.4);
        }
        .pass-tagline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8.5pt;
          font-weight: 600;
          font-style: italic;
          color: rgba(255,255,255,0.78);
          margin: 0 0 6mm;
          display: flex;
          align-items: center;
          gap: 2mm;
        }
        .pass-tagline .star {
          color: #FDD134;
          font-style: normal;
          font-size: 7pt;
        }

        .pass-number {
          display: flex;
          align-items: center;
          gap: 2mm;
          margin: auto 0 4mm;
          padding: 2mm 4mm;
          background: rgba(253,209,52,0.08);
          border: 0.3mm solid rgba(253,209,52,0.4);
          border-radius: 1.5mm;
        }
        .pn-label {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          font-weight: 800;
          color: #FDD134;
          letter-spacing: 0.08em;
        }
        .pn-line {
          display: inline-block;
          width: 16mm;
          border-bottom: 0.4mm solid rgba(253,209,52,0.7);
          height: 5mm;
        }
        .pn-total {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8pt;
          font-weight: 600;
          color: rgba(253,209,52,0.65);
          letter-spacing: 0.04em;
        }

        .issued-by {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8.5pt;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          margin: 0;
          letter-spacing: 0.04em;
        }
        .issued-by strong {
          color: #FDD134;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        /* ── BACK (INSIDE) ─────────────────────────────── */
        .pass-back {
          background: #FFFFFF;
          background-image:
            radial-gradient(ellipse 100% 60% at 0% 0%, rgba(253,209,52,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 90% 50% at 100% 100%, rgba(5,68,176,0.18) 0%, transparent 55%);
        }
        .pass-back::before {
          content: "";
          position: absolute;
          inset: 4mm;
          border: 0.3mm dashed rgba(181,83,9,0.35);
          border-radius: 1.2mm;
          pointer-events: none;
        }
        .pass-back-inner {
          position: relative;
          z-index: 2;
          height: 100%;
          padding: 8mm 9mm 7mm;
          display: flex;
          flex-direction: column;
        }

        .inside-header {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 6.5pt;
          font-weight: 700;
          color: rgba(181,83,9,0.65);
          letter-spacing: 0.22em;
          text-align: center;
          margin: 0 0 3mm;
        }

        .inside-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 14pt;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: #040812;
          margin: 0 0 4mm;
          text-align: center;
        }

        .form-block {
          display: flex;
          flex-direction: column;
          gap: 2.5mm;
          padding: 3mm 3mm;
          background: rgba(255,255,255,0.6);
          border-radius: 2mm;
          border: 0.3mm solid rgba(181,83,9,0.2);
          margin: 0 0 4mm;
        }
        .form-row {
          display: flex;
          align-items: baseline;
          gap: 2mm;
        }
        .form-row label {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8pt;
          font-weight: 700;
          color: #040812;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .field-line {
          flex: 1;
          height: 4mm;
          border-bottom: 0.4mm solid rgba(4,8,18,0.4);
        }
        .field-line.short { flex: 0 0 22mm; }

        .rules-block {
          margin: 0 0 auto;
        }
        .rules-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8.5pt;
          font-weight: 800;
          color: #A83E2C;
          margin: 0 0 2mm;
          letter-spacing: 0.04em;
        }
        .rules {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.2mm;
        }
        .rules li {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 8.5pt;
          line-height: 1.35;
          color: #040812;
        }
        .rules strong {
          color: #A83E2C;
          font-weight: 800;
          margin-right: 1.5mm;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .stamp-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3mm;
          margin: 4mm 0 2mm;
          padding: 2mm 0;
          border-top: 0.3mm dashed rgba(181,83,9,0.35);
        }
        .qr-stamp {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1mm;
        }
        .qr-img {
          width: 20mm;
          height: 20mm;
          border-radius: 1mm;
          border: 0.4mm solid rgba(181,83,9,0.3);
        }
        .qr-lbl {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 6.5pt;
          color: #A83E2C;
          margin: 0;
          letter-spacing: 0.12em;
        }
        .seal {
          width: 20mm;
          height: 20mm;
          transform: rotate(-12deg);
          opacity: 0.85;
        }

        .back-foot {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7pt;
          color: rgba(4,8,18,0.55);
          margin: 0;
          text-align: center;
          letter-spacing: 0.04em;
        }
        .back-foot strong {
          color: #040812;
          font-weight: 800;
        }

        @media print {
          @page { size: A6; margin: 0; }
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
          .flyer-page:last-of-type {
            page-break-after: auto;
            break-after: auto;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const instructionBarStyle: React.CSSProperties = {
  position: 'sticky',
  top: 16,
  zIndex: 20,
  background: '#040812',
  color: '#FFFFFF',
  padding: '10px 18px',
  borderRadius: 999,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  maxWidth: 720,
  width: '100%',
};

const printBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: '#FDD134',
  color: '#040812',
  border: 0,
  padding: '6px 14px',
  borderRadius: 999,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  flexShrink: 0,
};
