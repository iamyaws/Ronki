/**
 * Print-ready A4 sheet of 4 distinct A6 parent flyers, each a different
 * thematic entry-point to the Ronki pitch. For Elternabend handouts,
 * Grundschul-Eltern-Cafe tables, Kinderarzt-Wartezimmer, anywhere
 * parents might pick a flyer off a stack and read it in 20 seconds.
 *
 * Composition (bold-redesign pass, synthesis of 4 expert critiques —
 * advertising copywriter / brand strategist / OOH designer / editorial
 * art director — who all agreed the earlier "phone-mockup peek" was
 * fighting a brand about LESS screen):
 *
 *   Shared scaffolding, variant-specific register:
 *   · NO top-bar gradient (it was a brand-flag bolt-on)
 *   · NO phone mockup (it was a placeholder at A6 scale)
 *   · Full-bleed color field, variant-specific mood
 *   · Each variant composed in its own editorial register:
 *     1. Nur einmal  — POSTER: 2-zone cream/mustard, headline straddles
 *        the seam with "nur einmal" sitting IN the mustard (the underline
 *        finally earns its space)
 *     2. Pullover    — REPORTAGE: dateline run-in ("VIERTEL NACH SIEBEN,
 *        UNTERFÖHRING —"), vignette flows as prose, sage bottom zone
 *        with a pencil-filter zahnpasta-splotch — the card IS the pullover
 *     3. Blöder Ronki — PULL-QUOTE: full-bleed dark teal, oversized opening
 *        curly-quote „ at ~72pt mustard bleeding into the margin, quote
 *        set with a hanging indent, small-caps attribution
 *     4. Experiment  — SIGNED LETTER: cream top, dark-teal bottom, hairline
 *        rule above eyebrow, narrower measure, small-caps signature block
 *        "MARC FÖRSTER · UNTERFÖHRING · APRIL 2026" reversed out on teal
 *
 *   Family binding: the 2 light covers (promise, vignette) pair against
 *   the 2 dark covers (quote, manifesto). At 3m a parent reads 4 distinct
 *   things; at arm's length they read as a matched family.
 *
 * Shared ParentBack on the reverse carries the QR + 3 differentiators.
 *
 * Print output: 2-page A4 PDF
 *   Page 1: 4 distinct fronts tiled 2×2
 *   Page 2: 4× ParentBack tiled 2×2
 *
 * Workflow:
 *   1. Print page 1 → 4 different fronts on one A4
 *   2. Flip paper, print page 2 → shared back on the other side
 *   3. Cut along center cross → 4 double-sided flyers
 *   Marc prints ~10 A4s, gets 40 flyers for Elternabend.
 */

import { useEffect } from 'react';

const APP_QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

function CutMarks() {
  // Tick marks were 4mm × 0.35mm — too faint. Now 5mm × 0.7mm with a
  // subtle center crosshair (0.5mm, 45% opacity) so scissors have a
  // visible guide without dominating the design.
  return (
    <svg
      className="cut-marks"
      viewBox="0 0 210 297"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="105" y1="0" x2="105" y2="5" />
      <line x1="105" y1="292" x2="105" y2="297" />
      <line x1="0" y1="148.5" x2="5" y2="148.5" />
      <line x1="205" y1="148.5" x2="210" y2="148.5" />
      <line x1="102" y1="148.5" x2="108" y2="148.5" className="ch" />
      <line x1="105" y1="145.5" x2="105" y2="151.5" className="ch" />
    </svg>
  );
}

/* ── Zahnpasta-Fleck splotch ───────────────────────────────── *
 * First pass used a mustard ellipse and Marc flagged it — toothpaste
 * is white, not yellow, so the metaphor was broken. This version is
 * a warm off-white splat with a drip trail and a falling droplet,
 * pencil-filtered so the edges feel hand-drawn. Reads as "the stain
 * from the story" without crossing into illustration (no t-shirt,
 * no mascot — we keep the editorial reportage register).
 * ─────────────────────────────────────────────────────────── */
function ZahnpastaSplotch() {
  return (
    <svg
      className="ef-splotch"
      viewBox="0 0 60 60"
      aria-hidden
    >
      <defs>
        <filter id="pencil-splotch">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" />
        </filter>
      </defs>
      {/* Main splat — asymmetric blob where zahnpasta hit the pullover */}
      <path
        d="M 10,22 C 7,14 13,8 22,7 C 32,6 42,9 45,16 C 48,22 44,28 36,30 C 27,32 17,31 12,28 C 9,26 10,24 10,22 Z"
        fill="#FAF5E8"
        opacity="0.96"
        filter="url(#pencil-splotch)"
      />
      {/* Drip trail — tapered teardrop running down the chest */}
      <path
        d="M 23,28 C 22,34 21,42 23,48 C 24.2,51 26.8,51 28,48 C 30,42 30,34 28,28 Z"
        fill="#FAF5E8"
        opacity="0.92"
        filter="url(#pencil-splotch)"
      />
      {/* Falling droplet — implied gravity */}
      <circle
        cx="30"
        cy="54"
        r="2"
        fill="#FAF5E8"
        opacity="0.85"
        filter="url(#pencil-splotch)"
      />
      {/* Side splatter dot, tiny — for authenticity */}
      <circle
        cx="47"
        cy="18"
        r="1.4"
        fill="#FAF5E8"
        opacity="0.75"
        filter="url(#pencil-splotch)"
      />
    </svg>
  );
}

/* ── Front 1: „Stell dir vor, du sagst es nur einmal" ──── *
 * Poster register. 2-zone cream/mustard. Headline splits
 * across the seam so "nur einmal" lands inside the mustard
 * block — the underline-highlight concept made structural.
 * ─────────────────────────────────────────────────────────── */

function FrontNurEinmal() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--nur-einmal">
      <div className="ef-zone ef-zone--top">
        <p className="ef-eyebrow">Für Eltern</p>
        <h2 className="ef-poster-top">
          Stell dir vor,
          <br />
          du sagst es
        </h2>
      </div>
      <div className="ef-zone ef-zone--bottom ef-zone--mustard">
        <h2 className="ef-poster-bottom">nur einmal.</h2>
        <p className="ef-body-on-mustard">
          Zähne putzen, Tasche packen, Schuhe an. Ronki erinnert —
          nicht du, nicht zum zehnten Mal.
        </p>
        <p className="ef-url-on-mustard">ronki.de</p>
      </div>
    </section>
  );
}

/* ── Front 2: Pullover-Zahnpasta-Vignette ─────────────── *
 * Reportage register. Dateline run-in to the first sentence,
 * vignette flows as prose. Sage bottom zone carries the
 * reveal + promise, plus a pencil-filter toothpaste splotch
 * so the card literally IS the pullover-with-the-stain.
 * ─────────────────────────────────────────────────────────── */

function FrontPullover() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--pullover">
      <div className="ef-zone ef-zone--top ef-zone--pullover-top">
        <p className="ef-vignette">
          <span className="ef-dateline">Viertel nach sieben, Unterföhring —</span>
          {' '}der Pulli ist an, die Zähne noch nicht geputzt. Dann der
          Zahnpasta-Fleck auf dem Lieblingspulli. Umziehen. Ersatz-Pulli
          gefällt nicht. Seufzer und Frust, auf beiden Seiten.
        </p>
      </div>
      <div className="ef-zone ef-zone--bottom ef-zone--sage">
        <ZahnpastaSplotch />
        <p className="ef-reveal-on-sage">
          So sieht ein Morgen aus, den jedes Elternteil kennt.
        </p>
        <p className="ef-promise-on-sage">
          Ronki macht ihn nicht perfekt.
          <br />
          Nur ein bisschen <em>ruhiger</em>.
        </p>
        <p className="ef-url-on-sage">ronki.de</p>
      </div>
    </section>
  );
}

/* ── Front 3: „Blöder Ronki" (Louis-Zitat) ───────────── *
 * Pull-quote register, NYT-Mag style. Full-bleed dark teal,
 * oversized opening curly-quote „ bleeds into top-left
 * margin at ~72pt mustard, quote set with a hanging indent
 * so left edges align past the punctuation. Small-caps
 * attribution. The quote IS the composition — no block,
 * no mockup, no decoration.
 * ─────────────────────────────────────────────────────────── */

function FrontBloederRonki() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--bloeder">
      <div className="ef-bleed">
        <p className="ef-eyebrow ef-eyebrow--on-dark">Vater-Sohn-Projekt</p>

        <div className="ef-quote-stack">
          <span className="ef-giant-quote" aria-hidden>
            „
          </span>
          <blockquote className="ef-pull-quote">
            Blöder Ronki, jetzt muss ich schon wieder meine Sachen machen,
            nur weil wir uns das ausgedacht haben.
          </blockquote>
        </div>

        <p className="ef-attribution-caps">— Louis, 7, Co-Designer</p>

        <p className="ef-body-on-dark">
          Das sagt mein Sohn manchmal über die App, die wir gemeinsam
          gebaut haben. Sie nervt ihn. Sie hilft ihm trotzdem.
        </p>

        <p className="ef-url-on-dark">ronki.de</p>
      </div>
    </section>
  );
}

/* ── Front 4: „Ronki ist ein Experiment" ─────────────── *
 * Signed-letter register, Monocle-essay feel. Cream top
 * with a hairline rule above the eyebrow, ragged-right
 * headline, narrower body measure. Dark-teal bottom zone
 * carries the signature as small-caps set with middle-dot
 * separators — reads as Marc's byline, not a marketing CTA.
 * ─────────────────────────────────────────────────────────── */

function FrontExperiment() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--experiment">
      <div className="ef-zone ef-zone--top">
        <hr className="ef-hairline" />
        <p className="ef-eyebrow">Warum wir das machen</p>
        <h2 className="ef-essay-headline">
          Ronki ist kein Produkt.
          <br />
          <em>Es ist ein Experiment.</em>
        </h2>
        <p className="ef-essay-body">
          Ich arbeite seit Jahren als Consultant für Gaming. Ich weiß,
          wie Apps Kinder festhalten. Ein Teil von mir hat daran
          mitgebaut. Ein anderer Teil wollte das nie in der Hand
          seines eigenen Kindes sehen.
        </p>
      </div>
      <div className="ef-zone ef-zone--bottom ef-zone--ink">
        <p className="ef-signature-caps">
          Marc Förster &middot; Unterföhring &middot; April 2026
        </p>
        <p className="ef-url-on-dark">ronki.de</p>
      </div>
    </section>
  );
}

/* ── ParentBack: shared on all 4 cells, reverse side ──── *
 * Consistent pitch: 3 differentiators + QR + signoff.
 * Unchanged from previous pass — Marc's happy with it.
 * ─────────────────────────────────────────────────────────── */

function ParentBack() {
  return (
    <section className="flyer-page parent-back">
      <div className="parent-back-inner">
        <p className="pb-eyebrow">Für Eltern</p>

        <h2 className="pb-headline">
          Ronki ist <em>anders gebaut</em>.
        </h2>

        <p className="pb-sub">
          Ein Drachen-Gefährte für Morgen- und Abendroutine. Ohne Streaks,
          ohne Werbung, ohne Dark Patterns.
        </p>

        <ul className="pb-points">
          <li>
            <span className="pb-check" aria-hidden>✓</span>
            <span>
              <strong>Keine App-Tricks.</strong> Keine Streaks, keine Push, keine In-App-Käufe.
            </span>
          </li>
          <li>
            <span className="pb-check" aria-hidden>✓</span>
            <span>
              <strong>Begleitet, kontrolliert nicht.</strong> Dein Kind entscheidet Tempo. Du siehst die Woche, ohne zu steuern.
            </span>
          </li>
          <li>
            <span className="pb-check" aria-hidden>✓</span>
            <span>
              <strong>Privacy-first.</strong> EU-Hosting, keine Cookies, keine personenbezogenen Profile.
            </span>
          </li>
        </ul>

        <div className="pb-qr-row">
          <img src={APP_QR_URL} alt="QR-Code zu ronki.de" className="pb-qr" />
          <div className="pb-qr-text">
            <p className="pb-qr-main">
              <strong>ronki.de</strong>
            </p>
            <p className="pb-qr-sub">Kostenlos, ohne Anmeldung.</p>
          </div>
        </div>

        <p className="pb-signoff">
          Marc &amp; Louis &middot; Unterföhring
          <br />
          <span className="pb-signoff-mail">hallo@ronki.de</span>
        </p>
      </div>
    </section>
  );
}

/* ── Sheet page ─────────────────────────────────────────── */

export default function PrintSheetA4ElternFlyer() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>
          A4-Bogen Eltern-Flyer &middot; 4 Themen + gemeinsame Rückseite
        </strong>
        <span style={{ opacity: 0.75, marginLeft: 10, fontSize: 11.5 }}>
          Seite 1 = 4 Front-Varianten (Nur einmal &middot; Pullover &middot;
          Blöder Ronki &middot; Experiment) &middot; Seite 2 = Rückseite 4&times;
        </span>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Bogen 1: 4 Front-Varianten ───────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 1 · Vorderseiten (4 Themen)</div>
        <CutMarks />
        <div className="sheet-cell">
          <FrontNurEinmal />
        </div>
        <div className="sheet-cell">
          <FrontPullover />
        </div>
        <div className="sheet-cell">
          <FrontBloederRonki />
        </div>
        <div className="sheet-cell">
          <FrontExperiment />
        </div>
      </section>

      {/* ── Bogen 2: Rückseiten ──────────────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 2 · Rückseiten (4× gleich)</div>
        <CutMarks />
        {[0, 1, 2, 3].map((i) => (
          <div className="sheet-cell" key={`back-${i}`}>
            <ParentBack />
          </div>
        ))}
      </section>

      <style>{sheetCss + flyerFrontsCss + parentBackCss}</style>
    </div>
  );
}

/* ── Sheet + print-page CSS ──────────────────────────────── */

const sheetCss = `
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
    * {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }
  }
`;

/* ── Front-variants CSS — bold-redesign pass ─────────────── */

const flyerFrontsCss = `
  /* Base flyer container. Each variant adds its own bg + accent.
     No top-bar gradient anymore — the 4mm mustard→sage ribbon was
     an app-landing-page flag on a brand that wants to whisper. */
  .ef-flyer {
    width: 105mm;
    height: 148mm;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  /* ── Zones ─────────────────────────────────────────────── *
   * Two-zone layout. Top zone flexes to fit the text body;
   * bottom zone has a fixed proportional height per variant.
   * Each zone has its own padding + color; no overlap.      */
  .ef-zone {
    position: relative;
    padding: 9mm 8mm;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .ef-zone--top {
    flex: 1 1 auto;
    padding-top: 11mm;
  }
  .ef-zone--bottom {
    flex: 0 0 auto;
    padding-top: 8mm;
    padding-bottom: 8mm;
  }

  /* Full-bleed variant (Blöder Ronki) — single zone, no split */
  .ef-bleed {
    flex: 1 1 auto;
    padding: 11mm 8mm 8mm;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* ── Shared eyebrow ─────────────────────────────────── */
  .ef-eyebrow {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #0544B0;
    margin: 0 0 5mm;
  }
  .ef-eyebrow--on-dark { color: #FDD134; }

  /* ── Shared URL foot (small text, bottom of bottom zone) ─ */
  .ef-url-on-mustard,
  .ef-url-on-sage,
  .ef-url-on-dark {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin: auto 0 0;
  }
  .ef-url-on-mustard { color: rgba(4,8,18,0.7); }
  .ef-url-on-sage    { color: rgba(255,255,255,0.85); }
  .ef-url-on-dark    { color: rgba(255,255,255,0.7); }

  /* ────────────────────────────────────────────────────── *
   * Variant 1: NUR EINMAL — poster register              *
   * Cream top, mustard bottom. Headline splits across    *
   * the seam; "nur einmal" lives inside the mustard.     *
   * ────────────────────────────────────────────────────── */

  .ef-flyer--nur-einmal {
    background: #FFFFFF;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 0%, rgba(5,68,176,0.15) 0%, transparent 60%);
  }
  .ef-flyer--nur-einmal .ef-zone--top { flex: 1 1 56%; }
  .ef-flyer--nur-einmal .ef-zone--bottom { flex: 0 0 44%; }

  .ef-zone--mustard {
    background: #FDD134;
    background-image:
      radial-gradient(ellipse 80% 60% at 100% 100%, rgba(180,83,9,0.1) 0%, transparent 55%);
  }

  .ef-poster-top {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 26pt;
    line-height: 1.02;
    letter-spacing: -0.025em;
    color: #040812;
    margin: 0;
  }
  .ef-poster-bottom {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 32pt;
    line-height: 1.0;
    letter-spacing: -0.03em;
    color: #040812;
    font-style: italic;
    margin: 0 0 5mm;
  }
  .ef-body-on-mustard {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8.5pt;
    line-height: 1.45;
    color: rgba(4,8,18,0.88);
    margin: 0;
    max-width: 80mm;
  }

  /* ────────────────────────────────────────────────────── *
   * Variant 2: PULLOVER — reportage register             *
   * Cream top with a dateline-run-in vignette. Sage      *
   * bottom zone carries the reveal + promise + a         *
   * pencil-filter zahnpasta splotch, off-center.          *
   * ────────────────────────────────────────────────────── */

  .ef-flyer--pullover {
    background: #FFFFFF;
    background-image:
      radial-gradient(ellipse 120% 70% at 50% 0%, rgba(253,209,52,0.14) 0%, transparent 60%);
  }
  .ef-flyer--pullover .ef-zone--top { flex: 1 1 54%; }
  .ef-flyer--pullover .ef-zone--bottom { flex: 0 0 46%; }
  .ef-zone--pullover-top { padding-top: 13mm; }

  .ef-zone--sage {
    background: #0544B0;
    background-image:
      radial-gradient(ellipse 90% 60% at 0% 100%, rgba(4,8,18,0.2) 0%, transparent 55%);
    overflow: hidden;
  }

  .ef-dateline {
    /* Clay #A83E2C replaces Burnt #B45309 (Apr 2026). Redder hue (9°
       vs 24°), less saturated, reads as "brick/pigment" instead of
       "muddy dated orange". Used only on editorial accents like this
       dateline — the Ronki wordmark itself stays in brand teal. */
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #A83E2C;
  }
  .ef-vignette {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 10pt;
    line-height: 1.55;
    color: rgba(4,8,18,0.88);
    margin: 0;
    max-width: 85mm;
  }

  .ef-splotch {
    position: absolute;
    width: 32mm;
    height: 32mm;
    top: 4mm;
    right: -6mm;
    z-index: 1;
    pointer-events: none;
    transform: rotate(-14deg);
  }

  .ef-reveal-on-sage {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 600;
    font-size: 8.5pt;
    font-style: italic;
    color: rgba(255,255,255,0.85);
    line-height: 1.3;
    margin: 0 0 3mm;
    max-width: 68mm;
    position: relative;
    z-index: 2;
  }
  .ef-promise-on-sage {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 14pt;
    color: #FFFFFF;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin: 0 0 3mm;
    max-width: 75mm;
    position: relative;
    z-index: 2;
  }
  .ef-promise-on-sage em {
    font-style: italic;
    color: #FDD134;
    font-weight: 800;
  }

  /* ────────────────────────────────────────────────────── *
   * Variant 3: BLÖDER RONKI — pull-quote register        *
   * Full-bleed dark teal. Oversized opening curly-quote  *
   * bleeds into top-left margin. Quote set with a hang-  *
   * ing indent so left edges align past the punctuation. *
   * ────────────────────────────────────────────────────── */

  .ef-flyer--bloeder {
    background: #040812;
    background-image:
      radial-gradient(ellipse 100% 70% at 0% 0%, rgba(4,8,18,0.55) 0%, transparent 60%),
      radial-gradient(ellipse 90% 60% at 100% 100%, rgba(5,68,176,0.22) 0%, transparent 55%);
  }

  .ef-quote-stack {
    position: relative;
    margin: 2mm 0 6mm;
    padding-left: 14mm;
  }
  .ef-giant-quote {
    position: absolute;
    top: -11mm;
    left: -2mm;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 900;
    font-size: 72pt;
    line-height: 0.85;
    color: #FDD134;
    opacity: 0.9;
  }
  .ef-pull-quote {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 15pt;
    font-style: italic;
    line-height: 1.25;
    color: #FFFFFF;
    margin: 0;
    letter-spacing: -0.015em;
  }

  .ef-attribution-caps {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 800;
    color: #FDD134;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin: 0 0 5mm;
  }
  .ef-body-on-dark {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8.5pt;
    line-height: 1.5;
    color: rgba(255,255,255,0.82);
    margin: 0;
    max-width: 80mm;
  }
  .ef-bleed .ef-url-on-dark {
    margin-top: auto;
    padding-top: 6mm;
  }

  /* ────────────────────────────────────────────────────── *
   * Variant 4: EXPERIMENT — signed-letter register       *
   * Cream top with a hairline rule above the eyebrow.    *
   * Narrower measure. Dark-teal bottom zone carries the  *
   * signature as small-caps with middle-dot separators.  *
   * ────────────────────────────────────────────────────── */

  .ef-flyer--experiment {
    background: #FFFFFF;
    background-image:
      radial-gradient(ellipse 100% 60% at 100% 0%, rgba(5,68,176,0.12) 0%, transparent 60%);
  }
  .ef-flyer--experiment .ef-zone--top { flex: 1 1 68%; }
  .ef-flyer--experiment .ef-zone--bottom { flex: 0 0 32%; }

  .ef-zone--ink {
    background: #040812;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 100%, rgba(5,68,176,0.18) 0%, transparent 55%);
    justify-content: center;
  }

  .ef-hairline {
    border: 0;
    border-top: 0.3mm solid #0544B0;
    margin: 0 0 5mm;
    width: 14mm;
  }
  .ef-essay-headline {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 16pt;
    line-height: 1.12;
    letter-spacing: -0.015em;
    color: #040812;
    margin: 0 0 5mm;
    max-width: 70mm;
  }
  .ef-essay-headline em {
    font-style: italic;
    color: #0544B0;
    font-weight: 700;
  }
  .ef-essay-body {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8.5pt;
    line-height: 1.55;
    color: rgba(4,8,18,0.82);
    margin: 0;
    max-width: 72mm;
  }

  .ef-signature-caps {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #FFFFFF;
    margin: 0 0 3mm;
    text-align: center;
  }
  .ef-zone--ink .ef-url-on-dark {
    text-align: center;
    color: rgba(255,255,255,0.55);
  }
`;

/* ── Parent-back CSS ─────────────────────────────────────── */

const parentBackCss = `
  .parent-back {
    background: #FFFFFF;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 0%, rgba(5,68,176,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 90% 50% at 0% 100%, rgba(253,209,52,0.22) 0%, transparent 55%);
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    width: 105mm;
    height: 148mm;
    position: relative;
    overflow: hidden;
  }
  .parent-back::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4mm;
    background: linear-gradient(90deg, #0544B0, #FDD134);
  }
  .parent-back-inner {
    height: 100%;
    padding: 9mm 8mm 7mm;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  .pb-eyebrow {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 800;
    color: #0544B0;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0 0 2.5mm;
  }

  .pb-headline {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 17pt;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #040812;
    margin: 0 0 2mm;
  }
  .pb-headline em {
    font-style: italic;
    color: #0544B0;
  }

  .pb-sub {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 9pt;
    line-height: 1.4;
    color: rgba(4,8,18,0.78);
    margin: 0 0 5mm;
  }

  .pb-points {
    list-style: none;
    padding: 0;
    margin: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2.5mm;
  }
  .pb-points > li {
    display: grid;
    grid-template-columns: 5mm 1fr;
    gap: 2.5mm;
    align-items: start;
    padding: 2.5mm 3mm;
    background: rgba(255,255,255,0.7);
    border-radius: 2mm;
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8.5pt;
    line-height: 1.4;
    color: rgba(4,8,18,0.85);
  }
  .pb-points strong {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    color: #040812;
  }
  .pb-check {
    color: #0544B0;
    font-weight: 800;
    font-size: 11pt;
    line-height: 1;
    padding-top: 0.2mm;
  }

  .pb-qr-row {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin: 4mm 0 3mm;
    padding: 3mm 0;
    border-top: 0.3mm dashed rgba(4,8,18,0.2);
  }
  .pb-qr {
    width: 20mm;
    height: 20mm;
    border-radius: 1.5mm;
    border: 0.3mm solid rgba(4,8,18,0.15);
    flex-shrink: 0;
  }
  .pb-qr-text { flex: 1; }
  .pb-qr-main {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 11pt;
    color: #040812;
    margin: 0 0 1mm;
    letter-spacing: -0.01em;
  }
  .pb-qr-main strong {
    /* ronki.de wordmark stays in brand teal — Marc: "I wouldn't use
       the clay color for the Ronki font." The visual pop comes from
       weight (800) + size inheritance, not hue. */
    color: #040812;
    font-weight: 800;
  }
  .pb-qr-sub {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 7.5pt;
    color: rgba(4,8,18,0.65);
    margin: 0;
    line-height: 1.3;
  }

  .pb-signoff {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 700;
    color: rgba(4,8,18,0.65);
    margin: 0;
    text-align: center;
    letter-spacing: 0.04em;
    line-height: 1.4;
  }
  .pb-signoff-mail {
    font-weight: 500;
    color: rgba(4,8,18,0.5);
    letter-spacing: 0.02em;
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
  maxWidth: 960,
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
