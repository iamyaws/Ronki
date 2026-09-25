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
  /** Tighter rows so five or six steps still fit one A4 page. */
  compact?: boolean;
  /** Strip on the left of every row where a clothespin or paper clip sits. */
  clipLane?: boolean;
  /** One line above the list explaining how the clip is used. */
  nowMarker?: string;
  /** Duration shown as a bar instead of clock times, so nothing runs against a clock. */
  timeBar?: { start: string; end: string; note?: string };
  metaTitle: string;
  metaDescription: string;
}

export const VORLAGE_PRINT_MORGEN: VorlagePrintTemplate = {
  eyebrow: 'Morgen',
  title: 'Die Morgenroutine',
  description:
    'Vier Schritte bis zur Tasche. Trag eure Zeiten ein und hak ab, was geschafft ist.',
  accent: '#0544B0',
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
  accent: '#0544B0',
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
  accent: '#0544B0',
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

/**
 * Sheet for kids with ADHS or weak executive functions.
 *
 * Deliberately different from the other three: six steps instead of four,
 * one picture and one word per row, no clock line, no streak count. The
 * clip lane on the left is where a clothespin marks the step that is
 * running right now, so the sheet shows one step at a time instead of six.
 */
export const VORLAGE_PRINT_ADHS: VorlagePrintTemplate = {
  eyebrow: 'Ein Schritt',
  title: 'Mein Morgen',
  description:
    'Sechs Schritte, jeden Tag in derselben Reihenfolge. Ein Bild, ein Wort, keine Uhrzeit.',
  accent: '#0544B0',
  compact: true,
  clipLane: true,
  nowMarker:
    'Klemm eine Wäscheklammer an den linken Rand. Sie zeigt, was jetzt dran ist, und wandert nach unten.',
  timeBar: {
    start: 'Aufstehen',
    end: 'Tür',
    note: 'So lang ist euer Morgen ungefähr. Ohne Uhrzeit, damit nichts gegen die Zeit läuft.',
  },
  steps: [
    { icon: '💡', label: 'Licht' },
    { icon: '🚽', label: 'Klo' },
    { icon: '👕', label: 'Anziehen' },
    { icon: '🥣', label: 'Frühstück' },
    { icon: '🪥', label: 'Zähne' },
    { icon: '🎒', label: 'Ranzen' },
  ],
  metaTitle: 'Morgenroutine bei ADHS: Vorlage zum Ausdrucken (A4)',
  metaDescription:
    'Druckfertige A4-Vorlage für Kinder mit ADHS oder schwachen Exekutivfunktionen: sechs Schritte, ein Bild pro Schritt, Klammer statt Uhr.',
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function VorlagePrint({ template }: { template: VorlagePrintTemplate }) {
  useEffect(() => {
    document.body.style.background = '#FFFFFF';
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
    compact,
    clipLane,
    nowMarker,
    timeBar,
    metaTitle,
    metaDescription,
  } = template;

  const sheetClass = [
    'vp-sheet',
    bigIcons ? 'vp-sheet-big' : '',
    compact ? 'vp-sheet-compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

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

      <section className={sheetClass}>
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

        {nowMarker && <p className="vp-now">{nowMarker}</p>}

        <ol className="vp-steps">
          {steps.map((step, i) => (
            <li className="vp-step" key={i}>
              {clipLane && <span className="vp-clip" aria-hidden />}
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

        {timeBar && (
          <div className="vp-timebar">
            <div className="vp-timebar-row">
              <span className="vp-timebar-label">{timeBar.start}</span>
              <span className="vp-timebar-track" aria-hidden />
              <span className="vp-timebar-label">{timeBar.end}</span>
            </div>
            {timeBar.note && <p className="vp-timebar-note">{timeBar.note}</p>}
          </div>
        )}

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
    background: #0544B0;
    color: #FFFFFF;
    padding: 10px 18px;
    border-radius: 999px;
    font-family: 'Fredoka', system-ui, sans-serif;
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
    background: #FFFFFF;
    color: #040812;
    border: 0;
    padding: 6px 14px;
    border-radius: 999px;
    font-family: 'Fredoka', system-ui, sans-serif;
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
    color: #040812;
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
    background: #FDD134;
    color: #040812;
    font-family: 'Gochi Hand', 'Comic Sans MS', cursive;
    font-size: 13pt;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    padding: 2.2mm 4mm 1.4mm;
    border-radius: 2.5mm;
    transform: rotate(-3deg);
  }
  .vp-rule {
    flex: 1;
    height: 0.6mm;
    background: var(--vp-accent);
    opacity: 0.28;
    border-radius: 999px;
  }
  .vp-title {
    font-family: 'Fredoka', system-ui, sans-serif;
    font-weight: 700;
    font-size: 30pt;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 3mm;
    color: #040812;
  }
  .vp-desc {
    font-size: 11pt;
    line-height: 1.45;
    color: rgba(4,8,18,0.7);
    margin: 0;
    max-width: 150mm;
  }

  /* Name line ------------------------------------------------------- */
  .vp-name {
    display: flex;
    align-items: baseline;
    gap: 4mm;
    font-family: 'Fredoka', system-ui, sans-serif;
    font-weight: 600;
    font-size: 12pt;
    color: rgba(4,8,18,0.8);
    margin: 9mm 0 7mm;
  }
  .vp-name-line {
    flex: 1;
    border-bottom: 0.5mm dotted rgba(4,8,18,0.4);
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
    border: 0.7mm solid rgba(4,8,18,0.85);
    border-radius: 6mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .vp-num {
    font-family: 'Fredoka', system-ui, sans-serif;
    font-weight: 700;
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
    font-family: 'Fredoka', system-ui, sans-serif;
    font-weight: 700;
    font-size: 18pt;
    line-height: 1.15;
    color: #040812;
  }
  .vp-hint {
    font-size: 10pt;
    line-height: 1.35;
    color: rgba(4,8,18,0.6);
  }
  .vp-time {
    display: flex;
    align-items: baseline;
    gap: 2mm;
    font-family: 'Fredoka', system-ui, sans-serif;
    font-size: 9pt;
    font-weight: 600;
    color: rgba(4,8,18,0.45);
    margin-top: 1mm;
  }
  .vp-time-line {
    display: inline-block;
    width: 22mm;
    border-bottom: 0.4mm dotted rgba(4,8,18,0.4);
    height: 4mm;
  }
  .vp-check {
    width: 20mm;
    height: 20mm;
    flex-shrink: 0;
    border: 1mm solid var(--vp-accent);
    border-radius: 50%;
    background: #ffffff;
  }

  /* Now-marker line -------------------------------------------------- */
  .vp-now {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin: 0 0 5mm;
    padding: 3mm 4mm;
    border: 0.5mm dashed var(--vp-accent);
    border-radius: 3mm;
    font-size: 9.5pt;
    line-height: 1.35;
    color: rgba(4,8,18,0.75);
  }

  /* Clip lane --------------------------------------------------------- */
  .vp-clip {
    width: 5mm;
    align-self: stretch;
    flex-shrink: 0;
    margin: -3mm 0 -3mm -3mm;
    border-right: 0.4mm dashed rgba(4,8,18,0.28);
    border-radius: 3mm 0 0 3mm;
    background: var(--vp-accent);
    opacity: 0.12;
  }

  /* Compact variant: five or six steps on one page -------------------- */
  .vp-sheet-compact .vp-title { font-size: 25pt; }
  .vp-sheet-compact .vp-desc { font-size: 10.5pt; }
  .vp-sheet-compact .vp-name { margin: 6mm 0 4mm; font-size: 11pt; }
  .vp-sheet-compact .vp-name-line { height: 5mm; }
  .vp-sheet-compact .vp-steps { gap: 3.5mm; }
  .vp-sheet-compact .vp-step {
    min-height: 27mm;
    padding: 3mm 5mm;
    gap: 4mm;
  }
  .vp-sheet-compact .vp-icon { font-size: 15mm; width: 20mm; }
  .vp-sheet-compact .vp-label { font-size: 17pt; }
  .vp-sheet-compact .vp-check { width: 16mm; height: 16mm; border-width: 0.8mm; }

  /* Time bar ---------------------------------------------------------- */
  .vp-timebar { margin-top: 7mm; }
  .vp-timebar-row {
    display: flex;
    align-items: center;
    gap: 4mm;
  }
  .vp-timebar-label {
    font-family: 'Fredoka', system-ui, sans-serif;
    font-weight: 700;
    font-size: 9pt;
    color: var(--vp-accent);
    white-space: nowrap;
  }
  .vp-timebar-track {
    flex: 1;
    height: 4mm;
    border-radius: 999px;
    background: var(--vp-accent);
    opacity: 0.22;
  }
  .vp-timebar-note {
    margin: 2.5mm 0 0;
    font-size: 8.5pt;
    line-height: 1.35;
    color: rgba(4,8,18,0.5);
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
    border-top: 0.4mm solid rgba(4,8,18,0.15);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6mm;
    font-family: 'Fredoka', system-ui, sans-serif;
    font-size: 8.5pt;
    font-weight: 600;
    color: rgba(4,8,18,0.45);
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
