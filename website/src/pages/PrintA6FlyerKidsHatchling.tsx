/**
 * Print-ready A6 Flyer for KIDS — Variant "Frisch geschlüpft".
 *
 * Voice direction: Ronki is a just-hatched baby dragon. Vulnerable,
 * small, new to the world, knows only Louis so far. This version
 * plays against the heroic pose of the default — we keep the same
 * Heroic icon but frame it inside an egg-shell SVG so the viewer
 * reads "he just came out of there".
 *
 * Kid reasoning: 1st-graders respond to "helfen / kümmern" anchors
 * even more than "spielen / spannend". Ronki being small and new
 * gives the reader a role — they're not being sold to, they're
 * being asked to be careful with something small.
 *
 * Print spec: A6 (105×148 mm), 2 pages, bleed on stripe/background.
 */

import { useEffect } from 'react';

const QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de%2Finstallieren' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

export default function PrintA6FlyerKidsHatchling() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>A6-Flyer „Frisch geschlüpft" Druckvorschau</strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Cmd/Ctrl + P &middot; A6 &middot; Ränder: Keine &middot; Hintergrundgrafiken: Ein
        </span>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Front: the vulnerable hello ───────────────────────── */}
      <section className="flyer-page flyer-front-hatch">
        <div className="sparkles" aria-hidden>
          <span style={{ top: '18%', left: '14%', ['--d' as any]: '0s' }} />
          <span style={{ top: '26%', right: '18%', ['--d' as any]: '0.7s' }} />
          <span style={{ top: '62%', left: '12%', ['--d' as any]: '1.3s' }} />
        </div>

        <div className="front-inner">
          <p className="eyebrow-hatch">Ganz neu hier</p>

          {/* Egg + Ronki composition */}
          <div className="egg-wrap" aria-hidden={false}>
            <svg
              className="egg-shell"
              viewBox="0 0 200 200"
              width="200"
              height="200"
              role="img"
              aria-label="Ronki der Drache, frisch aus dem Ei"
            >
              {/* Bottom half of cracked egg */}
              <defs>
                <radialGradient id="eggFill" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFF8E3" />
                  <stop offset="60%" stopColor="#FFE68A" />
                  <stop offset="100%" stopColor="#F2BC5B" />
                </radialGradient>
                <linearGradient id="eggShade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(4,8,18,0)" />
                  <stop offset="100%" stopColor="rgba(4,8,18,0.15)" />
                </linearGradient>
              </defs>
              <path
                d="M40 130 C 40 160, 70 190, 100 190 C 130 190, 160 160, 160 130
                   L 152 118 L 143 128 L 133 116 L 122 126 L 112 114
                   L 100 124 L 90 112 L 80 122 L 70 110 L 60 120 L 50 108 L 40 130 Z"
                fill="url(#eggFill)"
                stroke="#A83E2C"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M40 130 C 40 160, 70 190, 100 190 C 130 190, 160 160, 160 130"
                fill="url(#eggShade)"
              />
              {/* Speckles */}
              <circle cx="66" cy="150" r="2.5" fill="#A83E2C" opacity="0.6" />
              <circle cx="90" cy="165" r="1.8" fill="#A83E2C" opacity="0.5" />
              <circle cx="118" cy="150" r="2.2" fill="#A83E2C" opacity="0.55" />
              <circle cx="140" cy="170" r="1.6" fill="#A83E2C" opacity="0.5" />
              <circle cx="76" cy="175" r="1.4" fill="#A83E2C" opacity="0.4" />
            </svg>

            <img
              src="/art/branding/ronki-icon-heroic-256.webp"
              alt=""
              className="dragon-hatch"
              width={256}
              height={256}
            />

            {/* Two floating shell pieces */}
            <svg className="shell-a" viewBox="0 0 60 40" width="60" height="40" aria-hidden>
              <path
                d="M4 32 L 14 14 L 22 26 L 32 10 L 42 24 L 54 8"
                fill="none"
                stroke="#A83E2C"
                strokeWidth="1.2"
              />
              <path
                d="M4 32 C 12 36, 46 36, 54 32 Q 54 30, 52 28 L 4 32"
                fill="#FFE68A"
                stroke="#A83E2C"
                strokeWidth="1.2"
              />
            </svg>
            <svg className="shell-b" viewBox="0 0 40 30" width="40" height="30" aria-hidden>
              <path
                d="M4 22 L 12 8 L 20 18 L 30 6 L 36 16"
                fill="none"
                stroke="#A83E2C"
                strokeWidth="1.2"
              />
              <path
                d="M4 22 C 10 26, 30 26, 36 22 Q 36 20, 34 18 L 4 22"
                fill="#FFE68A"
                stroke="#A83E2C"
                strokeWidth="1.2"
              />
            </svg>
          </div>

          <h1 className="headline-hatch">
            Heute Morgen
            <br />
            bin ich geschlüpft.
          </h1>

          <p className="sub-hatch">Ich kenn nur Louis.</p>

          <p className="hint-hatch">
            Louis hat gesagt, <strong>du bist nett</strong>.
            <br />
            Stimmt das? Dreh um.
          </p>

          <p className="sig-hatch">Dein Ronki (ganz klein noch)</p>
        </div>
      </section>

      {/* ── Back: gentle 3 steps + QR ─────────────────────────── */}
      <section className="flyer-page flyer-back-hatch">
        <div className="back-inner">
          <p className="eyebrow-back-hatch">Sei vorsichtig mit mir</p>

          <ol className="steps-hatch">
            <li>
              <span className="step-num">1</span>
              <div className="step-body">
                <p className="step-title">Frag Mama oder Papa.</p>
                <p className="step-sub">Ich bin noch zu klein für allein.</p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div className="step-body">
                <p className="step-title">Scannt den Code, ganz sanft.</p>
                <p className="step-sub">
                  Oder <strong>ronki.de</strong> eingeben.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div className="step-body">
                <p className="step-title">Dann wohn ich bei euch.</p>
                <p className="step-sub">Im Handy. Bei den Zähnen.</p>
              </div>
            </li>
          </ol>

          <div className="qr-wrap-hatch">
            <img src={QR_URL} alt="QR-Code zu ronki.de/installieren" className="qr-hatch" />
            <p className="qr-label-hatch">Scan mich sanft</p>
          </div>

          <p className="signoff-hatch">
            Bis später.
            <br />
            <strong>Dein Ronki</strong>
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

        /* ── Front ─────────────────────────────────────────── */
        .flyer-front-hatch {
          background: #FFFFFF;
          background-image:
            radial-gradient(ellipse 140% 70% at 50% 0%, #FFE68A 0%, transparent 55%),
            radial-gradient(ellipse 100% 60% at 50% 100%, rgba(5,68,176,0.20) 0%, transparent 60%);
        }
        .flyer-front-hatch::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4mm;
          background: linear-gradient(90deg, #FDD134, #0544B0);
        }
        .front-inner {
          height: 100%;
          padding: 9mm 9mm 8mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .sparkles > span {
          position: absolute;
          width: 2.5mm;
          height: 2.5mm;
          border-radius: 50%;
          background: radial-gradient(circle, #FFE88A 0%, #FDD134 60%, transparent 70%);
          opacity: 0.75;
          box-shadow: 0 0 1.5mm rgba(253,209,52,0.6);
        }

        .eyebrow-hatch {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8pt;
          font-weight: 800;
          color: #A83E2C;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin: 0 0 3mm;
          padding: 0.8mm 2mm;
          background: rgba(253,209,52,0.45);
          border-radius: 999px;
        }

        /* Egg composition */
        .egg-wrap {
          position: relative;
          width: 50mm;
          height: 50mm;
          margin: 0 0 2mm;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .egg-shell {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2mm 3mm rgba(181,83,9,0.18));
        }
        .dragon-hatch {
          position: relative;
          z-index: 2;
          width: 34mm;
          height: 34mm;
          transform: translateY(-4mm);
          filter: drop-shadow(0 2mm 4mm rgba(181,83,9,0.25));
          animation: hatch-wobble 2.6s ease-in-out infinite;
        }
        @keyframes hatch-wobble {
          0%, 100% { transform: translateY(-4mm) rotate(-3deg); }
          50%      { transform: translateY(-5mm) rotate(3deg); }
        }
        @media print {
          .dragon-hatch { animation: none; transform: translateY(-4mm); }
        }

        .shell-a {
          position: absolute;
          top: 10mm;
          right: 2mm;
          transform: rotate(18deg);
          width: 14mm;
          height: auto;
          opacity: 0.95;
          z-index: 3;
        }
        .shell-b {
          position: absolute;
          top: 18mm;
          left: 2mm;
          transform: rotate(-22deg);
          width: 10mm;
          height: auto;
          opacity: 0.9;
          z-index: 3;
        }

        .headline-hatch {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 19pt;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #040812;
          margin: 2mm 0 2mm;
          text-align: center;
        }

        .sub-hatch {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 13pt;
          font-style: italic;
          color: #0544B0;
          margin: 0 0 5mm;
        }

        .hint-hatch {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9pt;
          line-height: 1.45;
          color: rgba(4,8,18,0.78);
          margin: 0 0 auto;
        }
        .hint-hatch strong {
          color: #040812;
          font-weight: 700;
        }

        .sig-hatch {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 8.5pt;
          font-weight: 700;
          font-style: italic;
          color: #A83E2C;
          margin: 4mm 0 0;
        }

        /* ── Back ──────────────────────────────────────────── */
        .flyer-back-hatch {
          background: #FFFFFF;
          background-image:
            radial-gradient(ellipse 80% 60% at 100% 0%, rgba(5,68,176,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 90% 50% at 0% 100%, rgba(253,209,52,0.2) 0%, transparent 55%);
        }
        .flyer-back-hatch::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4mm;
          background: linear-gradient(90deg, #0544B0, #FDD134);
        }
        .back-inner {
          height: 100%;
          padding: 10mm 9mm 8mm;
          display: flex;
          flex-direction: column;
        }

        .eyebrow-back-hatch {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10pt;
          font-weight: 800;
          color: #040812;
          margin: 0 0 5mm;
          text-align: center;
          letter-spacing: -0.01em;
        }

        .steps-hatch {
          list-style: none;
          padding: 0;
          margin: 0 0 4mm;
          display: flex;
          flex-direction: column;
          gap: 3mm;
        }
        .steps-hatch > li {
          display: grid;
          grid-template-columns: 9mm 1fr;
          gap: 3mm;
          align-items: start;
          padding: 2.5mm 3mm;
          background: rgba(255,255,255,0.7);
          border-radius: 3mm;
        }
        .step-num {
          width: 9mm;
          height: 9mm;
          border-radius: 50%;
          background: #0544B0;
          color: #FFFFFF;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 12pt;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .step-body { padding-top: 0.5mm; }
        .step-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 10pt;
          color: #040812;
          margin: 0 0 0.8mm;
          line-height: 1.2;
        }
        .step-sub {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 8pt;
          color: rgba(4,8,18,0.7);
          margin: 0;
          line-height: 1.35;
        }
        .step-sub strong { color: #040812; font-weight: 700; }

        .qr-wrap-hatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1mm;
          margin: 0 auto;
        }
        .qr-hatch {
          width: 22mm;
          height: 22mm;
          border-radius: 2mm;
        }
        .qr-label-hatch {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 7.5pt;
          color: #0544B0;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }

        .signoff-hatch {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          line-height: 1.35;
          color: rgba(4,8,18,0.6);
          margin: auto 0 0;
          text-align: center;
        }
        .signoff-hatch strong {
          color: #A83E2C;
          font-weight: 800;
          font-size: 10pt;
        }

        /* ── Print ──────────────────────────────────────────── */
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
