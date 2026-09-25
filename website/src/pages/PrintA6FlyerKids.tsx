/**
 * Print-ready A6 Flyer for KIDS (Louis-to-friend handout).
 *
 * This is NOT the parent flyer. Tone, voice and visual language all
 * differ: first-person from Ronki, short German a 7-year-old can read,
 * "dein Freund Louis hat dich gemeint" as the warm peer anchor.
 * Compliance copy (DSGVO/JMStV) lives on the parent flyer, not here.
 *
 * Print spec: A6 (105×148 mm), 2 pages (front + back), bleed included
 * at the stripe/background edges. Colors set up for 250g matt print.
 */

import { useEffect } from 'react';

const QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de%2Finstallieren' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

export default function PrintA6FlyerKids() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>A6-Flyer „Louis" Druckvorschau</strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Cmd/Ctrl + P &middot; A6 &middot; Ränder: Keine &middot; Hintergrundgrafiken: Ein
        </span>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Front: the invitation ──────────────────────────────── */}
      <section className="flyer-page flyer-front-kid">
        <div className="sparkles" aria-hidden>
          <span style={{ top: '12%', left: '18%', ['--d' as any]: '0s' }} />
          <span style={{ top: '22%', right: '14%', ['--d' as any]: '0.8s' }} />
          <span style={{ top: '58%', left: '10%', ['--d' as any]: '1.6s' }} />
          <span style={{ top: '72%', right: '20%', ['--d' as any]: '0.4s' }} />
        </div>

        <div className="front-inner">
          <p className="eyebrow-kid">Für dich</p>

          <img
            src="/art/branding/ronki-icon-heroic-256.webp"
            alt="Ronki der Drache"
            className="dragon-hero"
            width={256}
            height={256}
          />

          <h1 className="headline-kid">
            Ich warte noch
            <br />
            auf einen Freund.
          </h1>

          <p className="sub-kid">
            Bist du es?
          </p>

          <p className="hint-kid">
            Dein Freund <strong>Louis</strong> hat dir diesen Zettel gegeben.
            <br />
            Dreh um, da steht wie du mich findest.
          </p>

          <p className="sig-kid">Dein Ronki 🐉</p>
        </div>
      </section>

      {/* ── Back: how to find Ronki ────────────────────────────── */}
      <section className="flyer-page flyer-back-kid">
        <div className="back-inner">
          <p className="eyebrow-back-kid">So findest du mich</p>

          <ol className="steps-kid">
            <li>
              <span className="step-num">1</span>
              <div className="step-body">
                <p className="step-title">Hol jemand Großes.</p>
                <p className="step-sub">Mama, Papa, Oma. Sie müssen tippen.</p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div className="step-body">
                <p className="step-title">Scannt den Code da unten.</p>
                <p className="step-sub">Oder: <strong>ronki.de</strong> eingeben.</p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div className="step-body">
                <p className="step-title">Dann bin ich da. 🔥</p>
                <p className="step-sub">Zuhause auf eurem Handy.</p>
              </div>
            </li>
          </ol>

          <div className="qr-wrap-kid">
            <img src={QR_URL} alt="QR-Code zu ronki.de/installieren" className="qr-kid" />
            <p className="qr-label-kid">Scan mich</p>
          </div>

          <p className="signoff-kid">
            Bis gleich.
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

        /* ── Flyer page base ──────────────────────────────────── */
        .flyer-page {
          width: 105mm;
          height: 148mm;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(0,0,0,0.12);
          position: relative;
        }

        /* ── Front ─────────────────────────────────────────────── */
        .flyer-front-kid {
          background: #FFFFFF;
          background-image:
            radial-gradient(ellipse 120% 80% at 50% 0%, #FFE68A 0%, transparent 55%),
            radial-gradient(ellipse 100% 60% at 50% 100%, rgba(5,68,176,0.18) 0%, transparent 65%);
        }
        .flyer-front-kid::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4mm;
          background: linear-gradient(90deg, #FDD134, #0544B0);
        }
        .front-inner {
          height: 100%;
          padding: 10mm 9mm 8mm;
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

        .eyebrow-kid {
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

        .dragon-hero {
          width: 45mm;
          height: 45mm;
          display: block;
          margin: 1mm 0 3mm;
          filter: drop-shadow(0 3mm 6mm rgba(181,83,9,0.25));
          animation: rp-float 3.2s ease-in-out infinite;
        }
        @keyframes rp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5mm); }
        }
        @media print {
          .dragon-hero { animation: none; }
        }

        .headline-kid {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 19pt;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #040812;
          margin: 0 0 2mm;
          text-align: center;
        }

        .sub-kid {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 13pt;
          font-style: italic;
          color: #0544B0;
          margin: 0 0 5mm;
        }

        .hint-kid {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9pt;
          line-height: 1.45;
          color: rgba(4,8,18,0.78);
          margin: 0 0 auto;
        }
        .hint-kid strong {
          color: #040812;
          font-weight: 700;
        }

        .sig-kid {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          font-weight: 800;
          color: #A83E2C;
          margin: 4mm 0 0;
          letter-spacing: -0.01em;
        }

        /* ── Back ──────────────────────────────────────────────── */
        .flyer-back-kid {
          background: #FFFFFF;
          background-image:
            radial-gradient(ellipse 80% 60% at 100% 0%, rgba(5,68,176,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 90% 50% at 0% 100%, rgba(253,209,52,0.2) 0%, transparent 55%);
        }
        .flyer-back-kid::before {
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

        .eyebrow-back-kid {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10pt;
          font-weight: 800;
          color: #040812;
          letter-spacing: -0.01em;
          text-transform: none;
          margin: 0 0 5mm;
          text-align: center;
        }

        .steps-kid {
          list-style: none;
          padding: 0;
          margin: 0 0 4mm;
          display: flex;
          flex-direction: column;
          gap: 3mm;
        }
        .steps-kid > li {
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
        .step-body {
          padding-top: 0.5mm;
        }
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
        .step-sub strong {
          color: #040812;
          font-weight: 700;
        }

        .qr-wrap-kid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1mm;
          margin: 0 auto;
        }
        .qr-kid {
          width: 22mm;
          height: 22mm;
          border-radius: 2mm;
        }
        .qr-label-kid {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 7.5pt;
          color: #0544B0;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }

        .signoff-kid {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          line-height: 1.35;
          color: rgba(4,8,18,0.6);
          margin: auto 0 0;
          text-align: center;
        }
        .signoff-kid strong {
          color: #A83E2C;
          font-weight: 800;
          font-size: 10pt;
        }

        /* ── Print ────────────────────────────────────────────── */
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
          .flyer-page:last-of-type {
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
