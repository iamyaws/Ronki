/**
 * Print-ready A4 Sheet for KIDS Sammelkarten.
 *
 * Produces a 3-page A4 PDF when Marc hits print:
 *   Page 1 (Bogen 1): Cover A — 4 different dragons tiled 2×2
 *   Page 2 (Bogen 2): Cover B — 4 different dragons tiled 2×2
 *   Page 3 (Rückseiten): same back design × 4, tiled 2×2
 *
 * With 8 dragons in the pool, every card across the 2 front sheets
 * is unique. The back is the same design on every cell, so orientation
 * doesn't matter when the paper is flipped for manual duplex printing.
 *
 * Workflow:
 *   1. Print page 1 onto blank A4.
 *   2. Flip that paper along the long edge, feed back in, print page 3.
 *   3. Print page 2 onto a second blank A4.
 *   4. Flip, feed back in, print page 3 again.
 *   5. Cut each sheet along the center cross → 4 cards per sheet.
 *
 * Result: 2 sheets, 8 unique double-sided Sammelkarten.
 */

import { useEffect, useState } from 'react';
import {
  CardFront,
  CardBack,
  DRAGONS,
  cardCss,
  type Dragon,
} from './PrintA6FlyerKidsCard';

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function CutMarks() {
  // Tick marks at the paper edges, aligned to the cut cross, plus a
  // faint center crosshair so scissors have a visible guide. SVG
  // viewBox maps 1 user unit = 1mm on A4 (210×297mm). Upgraded from
  // 4mm × 0.35mm to 5mm × 0.7mm because Marc nearly missed them when
  // cutting the first physical print.
  return (
    <svg
      className="cut-marks"
      viewBox="0 0 210 297"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* Vertical cut (x=105): ticks at top + bottom edges */}
      <line x1="105" y1="0" x2="105" y2="5" />
      <line x1="105" y1="292" x2="105" y2="297" />
      {/* Horizontal cut (y=148.5): ticks at left + right edges */}
      <line x1="0" y1="148.5" x2="5" y2="148.5" />
      <line x1="205" y1="148.5" x2="210" y2="148.5" />
      {/* Center crosshair — marked .ch for lighter stroke via CSS */}
      <line x1="102" y1="148.5" x2="108" y2="148.5" className="ch" />
      <line x1="105" y1="145.5" x2="105" y2="151.5" className="ch" />
    </svg>
  );
}

export default function PrintSheetA4KidsCard() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const [shuffled, setShuffled] = useState<Dragon[]>(() => shuffle(DRAGONS));
  const coverA = shuffled.slice(0, 4);
  const coverB = shuffled.slice(4, 8);

  const reshuffle = () => setShuffled(shuffle(DRAGONS));

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>
          A4-Bogen Sammelkarten · 2 × 4 Karten + Rückseiten
        </strong>
        <span style={{ opacity: 0.75, marginLeft: 10, fontSize: 11.5 }}>
          Seite 1 + 2 = Vorderseiten &middot; Seite 3 = Rückseite (zweimal auf die
          geflippten Papiere drucken)
        </span>
        <button onClick={reshuffle} style={rollBtnStyle}>
          Neu mischen 🎲
        </button>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Bogen 1: Cover A ─────────────────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 1 · Cover A</div>
        <CutMarks />
        {coverA.map((d, i) => (
          <div className="sheet-cell" key={`a-${d.slug}-${i}`}>
            <CardFront dragon={d} />
          </div>
        ))}
      </section>

      {/* ── Bogen 2: Cover B ─────────────────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 2 · Cover B</div>
        <CutMarks />
        {coverB.map((d, i) => (
          <div className="sheet-cell" key={`b-${d.slug}-${i}`}>
            <CardFront dragon={d} />
          </div>
        ))}
      </section>

      {/* ── Rückseiten: 4× dasselbe Design ──────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">
          Rückseiten · 4× dasselbe Design (für beide Bögen)
        </div>
        <CutMarks />
        {[0, 1, 2, 3].map((i) => (
          <div className="sheet-cell" key={`back-${i}`}>
            <CardBack />
          </div>
        ))}
      </section>

      <style>{a4SheetCss + cardCss}</style>
    </div>
  );
}

/* ── A4 sheet layout + print CSS ─────────────────────────── */

const a4SheetCss = `
  .print-root {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    min-height: 100vh;
    padding: 32px 16px 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
  }
  .print-root * { box-sizing: border-box; }

  .a4-sheet {
    width: 210mm;
    height: 297mm;
    background: white;
    display: grid;
    grid-template-columns: repeat(2, 105mm);
    grid-template-rows: repeat(2, 148mm);
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(0,0,0,0.15);
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .sheet-cell {
    position: relative;
    width: 105mm;
    height: 148mm;
    overflow: hidden;
  }
  .sheet-cell .flyer-page {
    /* Remove the individual box-shadow when tiled inside a sheet so
       we don't get ghost shadows between cells. */
    box-shadow: none !important;
    margin: 0 !important;
  }

  /* Cut marks overlay — sits above the cells so the tick marks are
     visible at the paper edges even if a card background extends
     that far. */
  .cut-marks {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 20;
  }
  .cut-marks line {
    stroke: #040812;
    stroke-width: 0.7;
    vector-effect: non-scaling-stroke;
    stroke-linecap: round;
  }
  .cut-marks line.ch {
    stroke-width: 0.5;
    opacity: 0.45;
  }

  /* Floating label — only visible in web preview, hidden in print */
  .sheet-label {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: #040812;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 5px 12px;
    border-radius: 999px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  @media print {
    @page { size: A4; margin: 0; }
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
    .a4-sheet {
      box-shadow: none !important;
      margin: 0 !important;
      page-break-after: always;
      break-after: page;
    }
    .a4-sheet:last-of-type {
      page-break-after: auto;
      break-after: auto;
    }
    .no-print { display: none !important; }

    /* Belt-and-suspenders color fidelity on print — the cardCss
       already sets this on .flyer-page and its descendants, but
       we repeat it here at the universal level to cover cut marks,
       sheet backgrounds, etc. */
    * {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }
  }
`;

const instructionBarStyle: React.CSSProperties = {
  position: 'sticky',
  top: 16,
  zIndex: 30,
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
  maxWidth: 920,
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

const rollBtnStyle: React.CSSProperties = {
  ...printBtnStyle,
  marginLeft: 'auto',
  background: '#0544B0',
  color: '#FFFFFF',
};
