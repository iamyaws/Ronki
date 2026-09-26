import { useEffect } from 'react';
import { PageMeta } from '../../components/PageMeta';
import {
  RoutineSheet,
  SheetPageStyle,
  type SheetHost,
  type SheetStep,
  type SheetTimeBar,
} from '../../components/sheet';

/**
 * Clean A4 print sheets for the four Vorlagen.
 *
 * These are the source pages for the PDFs in website/public/vorlagen/.
 * scripts/print-vorlagen.mjs loads each route in headless Edge, waits until
 * the fonts and every picture (task pictures, Ronki) have loaded, and then
 * prints it to PDF. No JavaScript state and no network call beyond the page
 * and its own assets.
 *
 * The sheet itself is RoutineSheet (components/sheet), the same one the
 * template pages show, so the PDF and the paper from their print button
 * look the same.
 *
 * Kept separate from /vorlagen/* on purpose: that page carries the email
 * form and a preview frame, this one carries nothing but the sheet.
 *
 * Not in the sitemap, disallowed in robots.txt, plus a noindex meta.
 */

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

/** One step. `img` is a file in /art/bilderbuch/tasks/; `icon` is the emoji fallback. */
export type VorlagePrintStep = SheetStep & { icon: string };

export interface VorlagePrintTemplate {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  steps: VorlagePrintStep[];
  /** Ronki at the top right, with an optional speech bubble. */
  ronki?: SheetHost;
  /** "Geschafft!" band under the list. */
  done?: boolean;
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
  timeBar?: SheetTimeBar;
  metaTitle: string;
  metaDescription: string;
}

export const VORLAGE_PRINT_MORGEN: VorlagePrintTemplate = {
  eyebrow: 'Morgen',
  title: 'Die Morgenroutine',
  description:
    'Vier Schritte bis zur Tasche. Trag eure Zeiten ein und mal den Kreis aus, wenn ein Schritt geschafft ist.',
  accent: '#0544B0',
  showTimes: true,
  ronki: { pose: 'wave', bubble: 'Was ist als Nächstes dran?' },
  done: true,
  steps: [
    { img: 'toothbrush.webp', icon: '🪥', label: 'Zähne putzen', hint: 'Oben, unten, außen, innen.' },
    { img: 'shirt.webp', icon: '👕', label: 'Anziehen', hint: 'Wetter angucken, dann Sachen raussuchen.' },
    { img: 'plate.webp', icon: '🥣', label: 'Frühstücken', hint: 'Am Tisch, in Ruhe.' },
    { img: 'bag.webp', icon: '🎒', label: 'Tasche packen', hint: 'Brotdose, Trinken, Hausaufgaben.' },
  ],
  metaTitle: 'Morgenroutine Vorlage zum Ausdrucken (A4)',
  metaDescription:
    'Druckfertige A4-Vorlage für die Morgenroutine: vier Schritte mit Bildern, große Kreise zum Ausmalen.',
};

export const VORLAGE_PRINT_ABEND: VorlagePrintTemplate = {
  eyebrow: 'Abend',
  title: 'Die Abendroutine',
  description:
    'Vier Schritte bis ins Bett. Trag eure Zeiten ein und mal den Kreis aus, wenn ein Schritt geschafft ist.',
  accent: '#0544B0',
  showTimes: true,
  ronki: { pose: 'calm', bubble: 'Gleich wird es gemütlich.' },
  done: true,
  steps: [
    { img: 'toothbrush.webp', icon: '🪥', label: 'Zähne putzen', hint: 'Auch die hinten im Mund.' },
    { img: 'wash.webp', icon: '🧼', label: 'Gesicht waschen', hint: 'Mit Wasser, ganz sanft.' },
    { img: 'pajama.webp', icon: '🌙', label: 'Pyjama an', hint: 'Die Sachen von heute in den Korb.' },
    { img: 'nightlight.webp', icon: '📖', label: 'Licht aus', hint: 'Eine Geschichte, dann schlafen.' },
  ],
  metaTitle: 'Abendroutine Vorlage zum Ausdrucken (A4)',
  metaDescription:
    'Druckfertige A4-Vorlage für die Abendroutine: vier Schritte mit Bildern, große Kreise zum Ausmalen.',
};

export const VORLAGE_PRINT_KLEINE_GESCHWISTER: VorlagePrintTemplate = {
  eyebrow: 'Für die Kleinen',
  title: 'Mein Tag',
  description: 'Ganz einfach, nur mit Bildern. Ein Bild geschafft, ein Kreis ausgemalt.',
  accent: '#0544B0',
  bigIcons: true,
  done: true,
  // No bubble: this sheet has no words for the child.
  ronki: { pose: 'happy' },
  steps: [
    { img: 'toothbrush.webp', icon: '🪥', label: '' },
    { img: 'shirt.webp', icon: '👕', label: '' },
    { img: 'plate.webp', icon: '🥣', label: '' },
    { img: 'teddy.webp', icon: '🧸', label: '' },
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
  ronki: { pose: 'calm', bubble: 'Ein Schritt nach dem anderen.' },
  nowMarker:
    'Klemm eine Wäscheklammer an den linken Rand. Sie zeigt, was jetzt dran ist, und wandert nach unten.',
  timeBar: {
    start: 'Aufstehen',
    end: 'Tür',
    note: 'So lang ist euer Morgen ungefähr. Ohne Uhrzeit, damit nichts gegen die Zeit läuft.',
  },
  steps: [
    { img: 'wake.webp', icon: '💡', label: 'Licht' },
    { img: 'toilet.webp', icon: '🚽', label: 'Klo' },
    { img: 'shirt.webp', icon: '👕', label: 'Anziehen' },
    { img: 'plate.webp', icon: '🥣', label: 'Frühstück' },
    { img: 'toothbrush.webp', icon: '🪥', label: 'Zähne' },
    { img: 'bag.webp', icon: '🎒', label: 'Ranzen' },
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
    steps,
    ronki,
    done,
    bigIcons,
    showTimes,
    compact,
    clipLane,
    nowMarker,
    timeBar,
    metaTitle,
    metaDescription,
  } = template;

  return (
    <div className="vp-root">
      <PageMeta title={metaTitle} description={metaDescription} noindex />
      <SheetPageStyle />

      <div className="vp-bar no-print">
        <strong>{title}</strong>
        <span className="vp-bar-hint">A4, eine Seite, zum Aufhängen</span>
        <button type="button" className="vp-bar-btn" onClick={() => window.print()}>
          Drucken / Als PDF
        </button>
      </div>

      <div className="vp-paper">
        <RoutineSheet
          page
          eyebrow={eyebrow}
          title={title}
          description={description}
          steps={steps}
          host={ronki}
          done={done}
          big={bigIcons}
          compact={compact}
          showTimes={showTimes}
          clipLane={clipLane}
          nowMarker={nowMarker}
          timeBar={timeBar}
        />
      </div>

      <style>{pageCss}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page CSS (the sheet brings its own, see components/sheet/sheet.css) */
/* ------------------------------------------------------------------ */

const pageCss = `
  .vp-root {
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
    border: 2.5px solid #040812;
    border-radius: 999px;
    font-family: 'Fredoka', system-ui, sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
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
  .vp-paper {
    border: 2.5px solid #040812;
    border-radius: 6px;
    overflow: hidden;
    background: #FFFFFF;
  }

  @media print {
    .no-print { display: none !important; }
    .vp-root {
      display: block;
      min-height: 0;
      padding: 0;
    }
    .vp-paper {
      border: 0;
      border-radius: 0;
      overflow: visible;
    }
  }
`;
