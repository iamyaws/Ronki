import { useEffect } from 'react';
import { PageMeta } from '../../components/PageMeta';

/**
 * Clean A4 print sheets for the three Vorlagen.
 *
 * These are the source pages for the PDFs in website/public/vorlagen/.
 * scripts/print-vorlagen.mjs loads each route in headless Edge and prints
 * it to PDF, so everything here has to survive without JavaScript state,
 * without images and without a network call.
 *
 * Kept separate from /vorlagen/* on purpose: that page carries the email
 * form and a preview frame, this one carries nothing but the sheet.
 *
 * Not in the sitemap, disallowed in robots.txt, plus a noindex meta.
 */

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export interface VorlagePrintStep {
  icon: string;
  label: string;
  hint?: string;
}

export interface VorlagePrintTemplate {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  steps: VorlagePrintStep[];
  /** Toddler variant: picture only, no words, bigger everything. */
  bigIcons?: boolean;
  /** Toddler sheets get no clock line. */
  showTimes?: boolean;
  metaTitle: string;
  metaDescription: string;
}

export const VORLAGE_PRINT_MORGEN: VorlagePrintTemplate = {
  eyebrow: 'Morgen',
  title: 'Die Morgenroutine',
  description:
    'Vier Schritte bis zur Tasche. Trag eure Zeiten ein und hak ab, was geschafft ist.',
  accent: '#d97706',
  showTimes: true,
  steps: [
    { icon: '🪥', label: 'Zähne putzen', hint: 'Oben, unten, außen, innen.' },
    { icon: '👕', label: 'Anziehen', hint: 'Wetter angucken, dann Sachen raussuchen.' },
    { icon: '🥣', label: 'Frühstücken', hint: 'Am Tisch, in Ruhe.' },
    { icon: '🎒', label: 'Tasche packen', hint: 'Brotdose, Trinken, Hausaufgaben.' },
  ],
  metaTitle: 'Morgenroutine Vorlage zum Ausdrucken (A4)',
  metaDescription:
    'Druckfertige A4-Vorlage für die Morgenroutine: vier Schritte, große Kästchen zum Abhaken.',
};

export const VORLAGE_PRINT_ABEND: VorlagePrintTemplate = {
  eyebrow: 'Abend',
  title: 'Die Abendroutine',
  description:
    'Vier Schritte bis ins Bett. Trag eure Zeiten ein und hak ab, was geschafft ist.',
  accent: '#4338ca',
  showTimes: true,
  steps: [
    { icon: '🪥', label: 'Zähne putzen', hint: 'Auch die hinten im Mund.' },
    { icon: '🧼', label: 'Gesicht waschen', hint: 'Mit Wasser, ganz sanft.' },
    { icon: '🌙', label: 'Pyjama an', hint: 'Die Sachen von heute in den Korb.' },
    { icon: '📖', label: 'Licht aus', hint: 'Eine Geschichte, dann schlafen.' },
  ],
  metaTitle: 'Abendroutine Vorlage zum Ausdrucken (A4)',
  metaDescription:
    'Druckfertige A4-Vorlage für die Abendroutine: vier Schritte, große Kästchen zum Abhaken.',
};

export const VORLAGE_PRINT_KLEINE_GESCHWISTER: VorlagePrintTemplate = {
  eyebrow: 'Für die Kleinen',
  title: 'Mein Tag',
  description: 'Ganz einfach, nur mit Bildern. Ein Bild geschafft, ein Haken gesetzt.',
  accent: '#50a082',
  bigIcons: true,
  steps: [
    { icon: '🪥', label: '' },
    { icon: '👕', label: '' },
    { icon: '🥣', label: '' },
    { icon: '🧸', label: '' },
  ],
  metaTitle: 'Tagesplan für kleine Kinder zum Ausdrucken (A4)',
  metaDescription:
    'Druckfertige A4-Vorlage nur mit Bildern, für 2- bis 4-jährige Geschwisterkinder.',
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function VorlagePrint({ template }: { template: VorlagePrintTemplate }) {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const {
    eyebrow,
    title,
    description,
    accent,
    steps,
    bigIcons,
    showTimes,
    metaTitle,
    metaDescription,
  } = template;

  return (
    <div className="vp-root" style={{ '--vp-accent': accent } as React.CSSProperties}>
      <PageMeta title={metaTitle} description={metaDescription} noindex />

      <div className="vp-bar no-print">
        <strong>{title}</strong>
        <span className="vp-bar-hint">A4, eine Seite, zum Aufhängen</span>
        <button type="button" className="vp-bar-btn" onClick={() => window.print()}>
          Drucken / Als PDF
        </button>
      </div>

      <section className={`vp-sheet${bigIcons ? ' vp-sheet-big' : ''}`}>
        <header className="vp-head">
          <div className="vp-eyebrow-row">
            <span className="vp-eyebrow">{eyebrow}</span>
            <span className="vp-rule" aria-hidden />
          </div>
          <h1 className="vp-title">{title}</h1>
          <p className="vp-desc">{description}</p>
        </header>

        <p className="vp-name">
          Das ist der Plan von <span className="vp-name-line" aria-hidden />
        </p>

        <ol className="vp-steps">
          {steps.map((step, i) => (
            <li className="vp-step" key={i}>
              <span className="vp-num" aria-hidden>
                {i + 1}
              </span>
              <span className="vp-icon" aria-hidden>
                {step.icon}
              </span>
              <span className="vp-body">
                {step.label && <span className="vp-label">{step.label}</span>}
                {step.hint && <span className="vp-hint">{step.hint}</span>}
                {showTimes && (
                  <span className="vp-time">
                    <span className="vp-time-line" aria-hidden /> Uhr
                  </span>
                )}
              </span>
              <span className="vp-check" aria-hidden />
            </li>
          ))}
        </ol>

        <footer className="vp-foot">
          <span>Ronki hilft beim Dranbleiben. Streaks gibt es hier nicht.</span>
          <span className="vp-foot-url">ronki.de/vorlagen</span>
        </footer>
      </section>

      <style>{sheetCss}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet CSS                                                           */
/* ------------------------------------------------------------------ */

const sheetCss = `
  .vp-root {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    min-height: 100vh;
    padding: 24px 16px 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .vp-bar {
    position: sticky;
    top: 16px;
    z-index: 30;
    background: #1A3C3F;
    color: #FDF8F0;
    padding: 10px 18px;
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    max-width: 760px;
    width: 100%;
  }
  .vp-bar-hint { opacity: 0.75; font-size: 11.5px; }
  .vp-bar-btn {
    margin-left: auto;
    background: #FCD34D;
    color: #1A3C3F;
    border: 0;
    padding: 6px 14px;
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .vp-sheet {
    width: 186mm;
    min-height: 268mm;
    box-sizing: border-box;
    background: #ffffff;
    color: #1A3C3F;
    display: flex;
    flex-direction: column;
    padding: 0;
    box-shadow: 0 18px 44px rgba(0,0,0,0.18);
  }

  /* Header ---------------------------------------------------------- */
  .vp-eyebrow-row {
    display: flex;
    align-items: center;
    gap: 4mm;
    margin-bottom: 4mm;
  }
  .vp-eyebrow {
    display: inline-block;
    background: var(--vp-accent);
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 8pt;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 1.6mm 4mm;
    border-radius: 999px;
  }
  .vp-rule {
    flex: 1;
    height: 0.6mm;
    background: var(--vp-accent);
    opacity: 0.28;
    border-radius: 999px;
  }
  .vp-title {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 30pt;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 3mm;
    color: #1A3C3F;
  }
  .vp-desc {
    font-size: 11pt;
    line-height: 1.45;
    color: rgba(26,60,63,0.7);
    margin: 0;
    max-width: 150mm;
  }

  /* Name line ------------------------------------------------------- */
  .vp-name {
    display: flex;
    align-items: baseline;
    gap: 4mm;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 600;
    font-size: 12pt;
    color: rgba(26,60,63,0.8);
    margin: 9mm 0 7mm;
  }
  .vp-name-line {
    flex: 1;
    border-bottom: 0.5mm dotted rgba(26,60,63,0.4);
    height: 6mm;
  }

  /* Steps ----------------------------------------------------------- */
  .vp-steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6mm;
  }
  .vp-step {
    display: flex;
    align-items: center;
    gap: 5mm;
    min-height: 45mm;
    padding: 5mm 6mm;
    box-sizing: border-box;
    border: 0.5mm solid rgba(26,60,63,0.18);
    border-radius: 4mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .vp-num {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 13pt;
    color: var(--vp-accent);
    width: 7mm;
    flex-shrink: 0;
    text-align: center;
  }
  .vp-icon {
    font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui, sans-serif;
    font-size: 19mm;
    line-height: 1;
    width: 25mm;
    flex-shrink: 0;
    text-align: center;
  }
  .vp-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5mm;
  }
  .vp-label {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 18pt;
    line-height: 1.15;
    color: #1A3C3F;
  }
  .vp-hint {
    font-size: 10pt;
    line-height: 1.35;
    color: rgba(26,60,63,0.6);
  }
  .vp-time {
    display: flex;
    align-items: baseline;
    gap: 2mm;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 9pt;
    font-weight: 600;
    color: rgba(26,60,63,0.45);
    margin-top: 1mm;
  }
  .vp-time-line {
    display: inline-block;
    width: 22mm;
    border-bottom: 0.4mm dotted rgba(26,60,63,0.4);
    height: 4mm;
  }
  .vp-check {
    width: 20mm;
    height: 20mm;
    flex-shrink: 0;
    border: 1mm solid var(--vp-accent);
    border-radius: 3mm;
    background: #ffffff;
  }

  /* Toddler variant -------------------------------------------------- */
  .vp-sheet-big .vp-step { min-height: 46mm; }
  /* No words on this sheet, so the picture takes the whole middle. */
  .vp-sheet-big .vp-icon { font-size: 30mm; width: auto; flex: 1; }
  .vp-sheet-big .vp-body { display: none; }
  .vp-sheet-big .vp-check { width: 26mm; height: 26mm; }

  /* Footer ----------------------------------------------------------- */
  .vp-foot {
    margin-top: auto;
    padding-top: 4mm;
    border-top: 0.4mm solid rgba(26,60,63,0.15);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6mm;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 8.5pt;
    font-weight: 600;
    color: rgba(26,60,63,0.45);
  }
  .vp-foot-url {
    color: var(--vp-accent);
    white-space: nowrap;
  }

  /* Screen only: pad the sheet so it looks like paper ----------------- */
  .vp-sheet { padding: 12mm; }

  @media print {
    @page {
      size: A4;
      margin: 12mm;
    }
    html, body {
      background: #ffffff !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .no-print { display: none !important; }
    .vp-root {
      display: block;
      min-height: 0;
      padding: 0;
    }
    .vp-sheet {
      width: 100%;
      min-height: 264mm;
      padding: 0;
      box-shadow: none;
      border: 0;
    }
    .vp-step { break-inside: avoid; }
  }
`;
