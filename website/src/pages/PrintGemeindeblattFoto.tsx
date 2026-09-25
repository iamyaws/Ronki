/**
 * Print-ready photo composition for the Gemeindeblatt article attachment.
 *
 * Level: "Medium flatlay" per the chat agreement — PhoneMockup showing the
 * morning-routine screen (matches article theme), floating Heroic-Ronki
 * companion icon, scattered hand-drawn routine-circle sketches, and ambient
 * mustard + sage glows. Cream paper background with subtle fractal-noise
 * grain, matching the website's UeberMich aesthetic so the photo reads as
 * part of the same world Marc is building, not stock art.
 *
 * Canvas target: 1440×1018 (≈1.414:1, A4-landscape aspect). Crucial:
 * this matches A4 landscape (297:210 mm) exactly so when Marc prints
 * to PDF, the canvas fills the page without a white margin stripe at
 * the bottom — which it does if the aspect mismatches. At 1440 wide,
 * the height works out to 1440 × (210/297) ≈ 1018.
 */

import { useEffect, useState } from 'react';
import { PhoneMockup } from '../components/PhoneMockup';

export default function PrintGemeindeblattFoto() {
  const [exportMode, setExportMode] = useState(false);
  const [showExitHint, setShowExitHint] = useState(false);

  useEffect(() => {
    // In export mode, body goes plain white so page screenshots don't
    // pick up the warm cream background surrounding the canvas.
    document.body.style.background = exportMode ? '#ffffff' : '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, [exportMode]);

  useEffect(() => {
    if (!exportMode) return;

    // Show the "ESC to exit" hint briefly when entering export mode,
    // then auto-hide so it doesn't appear in screenshots.
    setShowExitHint(true);
    const hideTimer = setTimeout(() => setShowExitHint(false), 2500);

    // Keyboard shortcut: ESC to exit export mode. No visible button
    // at all, so full-page screenshots stay clean.
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExportMode(false);
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [exportMode]);

  return (
    <div className={`print-root ${exportMode ? 'export-mode' : ''}`}>
      {!exportMode && (
        <div className="no-print" style={instructionBarStyle}>
          <strong style={{ fontWeight: 700 }}>
            Gemeindeblatt-Foto &middot; 4320×3054 (A4 landscape @ 3×)
          </strong>
          <span style={{ opacity: 0.7, marginLeft: 10, fontSize: 11.5 }}>
            Export-Modus versteckt diese Bar &middot; Screenshot via DevTools
          </span>
          <button onClick={() => setExportMode(true)} style={exportBtnStyle}>
            Export-Modus
          </button>
          <button onClick={() => window.print()} style={printBtnStyle}>
            Drucken / Als PDF
          </button>
        </div>
      )}

      {exportMode && showExitHint && (
        <div style={exitHintStyle} aria-live="polite">
          ESC zum Verlassen
        </div>
      )}

      <div className="photo-canvas">
        {/* Ambient glows — cream base reads warmer and more hand-made */}
        <div className="glow glow-tl" aria-hidden />
        <div className="glow glow-br" aria-hidden />

        {/* Paper-grain overlay — barely there, just lifts the digital flatness */}
        <div className="grain" aria-hidden />

        {/* Phone + floating Ronki companion, composed together so the
            companion reads as "sitting next to the phone like a sticker". */}
        <div className="stage">
          <div className="phone-wrapper">
            <PhoneMockup variant="morgen-anchor" scale={3} />
          </div>
          <img
            src="/art/branding/ronki-icon-heroic-256.webp"
            alt=""
            className="ronki-float"
            aria-hidden
            width={256}
            height={256}
          />
        </div>

        {/* Hand-drawn routine-circle sketch — implies the morning rhythm
            without needing a literal schedule. Check-marks on the first
            three, dashed on the fourth = "still open". */}
        <svg
          className="sketch"
          viewBox="0 0 800 140"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <filter id="pencil">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
            </filter>
          </defs>
          <g
            fill="none"
            stroke="#040812"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pencil)"
          >
            {/* Done: Zähne */}
            <circle cx="80" cy="70" r="42" />
            <path d="M 60 70 L 74 86 L 104 54" strokeWidth="4" />
            {/* Done: Anziehen */}
            <circle cx="260" cy="70" r="42" />
            <path d="M 240 70 L 254 86 L 284 54" strokeWidth="4" />
            {/* Done: Frühstück */}
            <circle cx="440" cy="70" r="42" />
            <path d="M 420 70 L 434 86 L 464 54" strokeWidth="4" />
            {/* Open: Tasche */}
            <circle
              cx="620"
              cy="70"
              r="42"
              strokeDasharray="4 6"
              opacity="0.55"
            />
            {/* Subtle thread connecting the circles, like a timeline */}
            <path
              d="M 122 70 L 218 70 M 302 70 L 398 70 M 482 70 L 578 70"
              strokeWidth="1.6"
              opacity="0.3"
              strokeDasharray="2 4"
            />
          </g>
        </svg>

        {/* Tiny attribution */}
        <p className="watermark">ronki.de</p>
      </div>

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

        .photo-canvas {
          position: relative;
          /* Layout dimensions are 1440×1018, design is authored at this
             size. But we render at 3× via CSS zoom so screenshots are
             4320×3054. Cream + gradient-heavy compositions compress very
             aggressively as JPEG (flat areas + smooth gradients = low
             entropy), so we need extra pixel headroom to still land above
             the Gemeindeblatt 1 MB minimum after Q85-Q90 compression. */
          width: 1440px;
          /* 1440 × (210/297) ≈ 1018 — matches A4 landscape ratio so
             printing to A4 doesn't leave a white stripe at the bottom. */
          height: 1018px;
          zoom: 3;
          background: #FFFFFF;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.18);
          border-radius: 4px;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        /* Print-mode: zoom would compound with the browser's page-fit
           scaling and bloat the output. Reset to 1× in print so the
           canvas scales naturally to A4 landscape. */
        @media print {
          .photo-canvas { zoom: 1; }
        }
        /* Export-mode: canvas is the only thing on the page, centered
           in the white void. No cream body bg, no sticky bar — so
           DevTools full-page screenshot or regular screenshot captures
           just the canvas cleanly. */
        .export-mode {
          padding: 0 !important;
          gap: 0 !important;
          min-height: 0 !important;
          align-items: flex-start !important;
        }

        /* Exit hint fade-out — invisible after 2.5s so full-page
           screenshots taken later don't capture it. */
        @keyframes gb-fade-out {
          0%   { opacity: 0.92; }
          70%  { opacity: 0.92; }
          100% { opacity: 0; visibility: hidden; }
        }

        /* Ambient radial glows — warm TL (mustard), cool BR (sage) */
        .glow {
          position: absolute;
          width: 900px;
          height: 900px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }
        .glow-tl {
          top: -280px;
          left: -240px;
          background: radial-gradient(circle, rgba(253,209,52,0.42) 0%, transparent 60%);
          filter: blur(10px);
        }
        .glow-br {
          bottom: -320px;
          right: -260px;
          background: radial-gradient(circle, rgba(5,68,176,0.38) 0%, transparent 60%);
          filter: blur(10px);
        }

        /* Paper-grain — SVG fractal noise. Opacity bumped + higher alpha
           in the noise filter so the JPEG encoder has more entropy to
           chew on and can't compress the flatlay down to 120 KB.
           Visually still reads as "paper texture". */
        .grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          mix-blend-mode: soft-light;
          opacity: 0.85;
          z-index: 2;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.24  0 0 0 0 0.25  0 0 0 0.8 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          background-size: 220px 220px;
        }

        /* Phone + Ronki stage */
        .stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }
        .phone-wrapper {
          position: relative;
          transform: rotate(-4deg);
          filter:
            drop-shadow(0 40px 60px rgba(4,8,18,0.35))
            drop-shadow(0 12px 24px rgba(4,8,18,0.18));
        }
        .ronki-float {
          position: absolute;
          width: 240px;
          height: 240px;
          top: 6%;
          right: 18%;
          transform: rotate(8deg);
          filter:
            drop-shadow(0 20px 30px rgba(181,83,9,0.25))
            drop-shadow(0 8px 16px rgba(4,8,18,0.18));
          z-index: 2;
        }

        /* Hand-drawn routine-circles sketch, bottom-centered */
        .sketch {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%) rotate(-1.5deg);
          width: 700px;
          height: auto;
          z-index: 4;
          opacity: 0.85;
        }

        .watermark {
          position: absolute;
          bottom: 28px;
          right: 36px;
          margin: 0;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.18em;
          color: rgba(4,8,18,0.45);
          z-index: 5;
          text-transform: lowercase;
        }

        @media print {
          /* A4 landscape (297×210 mm ≈ 1.414:1) + canvas aspect of
             1440×1018 (also ≈ 1.414:1) means the browser's default
             "fit to page" print behavior scales the canvas uniformly
             to fill the page. No letterbox, no white strip. */
          @page { size: A4 landscape; margin: 0; }
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
          .photo-canvas {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
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
  maxWidth: 760,
  width: '100%',
};

const printBtnStyle: React.CSSProperties = {
  marginLeft: 8,
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

const exportBtnStyle: React.CSSProperties = {
  ...printBtnStyle,
  marginLeft: 'auto',
  background: '#0544B0',
  color: '#FFFFFF',
};

const exitHintStyle: React.CSSProperties = {
  position: 'fixed',
  top: 12,
  right: 12,
  zIndex: 100,
  background: 'rgba(4,8,18,0.9)',
  color: '#FFFFFF',
  padding: '6px 14px',
  borderRadius: 999,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 11,
  pointerEvents: 'none',
  letterSpacing: '0.05em',
  animation: 'gb-fade-out 2.5s forwards',
};

/* Inline keyframe for the exit hint — fades from fully visible to
   invisible over 2.5s so it never sticks into screenshots taken
   after that window. Animation is defined in the page's <style>
   block below (can't attach keyframes to a React.CSSProperties). */
