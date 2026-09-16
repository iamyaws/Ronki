import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';

/**
 * Sheet for kids with ADHS or weak executive functions.
 *
 * Six steps, one picture and one word each. No clock, no streak count.
 * A clothespin or paper clip on the edge of the sheet marks the step that
 * is running right now, and the child moves it down itself.
 *
 * The downloadable PDF (/print/vorlage-adhs) carries the same six steps
 * plus the clip lane and the time bar, which this screen preview leaves out.
 */
export default function VorlageAdhs() {
  return (
    <RoutinePrintSheet
      slug="adhs"
      eyebrow="Ein Schritt"
      title="Mein Morgen, ein Schritt nach dem anderen"
      description="Sechs Schritte, immer in derselben Reihenfolge. Eine Wäscheklammer wandert am Rand nach unten und zeigt, was jetzt dran ist. Keine Uhr, kein Punktestand."
      accent="#0369a1"
      footerLine="ronki.de/vorlagen"
      downloadSlot={
        <VorlageDownload
          source="vorlage-adhs"
          title="Mein Morgen, ein Schritt nach dem anderen"
          pdfHref="/vorlagen/adhs.pdf"
          printHref="/print/vorlage-adhs"
        />
      }
      steps={[
        { icon: '💡', label: 'Licht', hint: 'Rollo hoch, ein Schluck Wasser.' },
        { icon: '🚽', label: 'Klo', hint: 'Und Hände waschen.' },
        { icon: '👕', label: 'Anziehen', hint: 'Liegt schon von gestern bereit.' },
        { icon: '🥣', label: 'Frühstück', hint: 'Am Tisch, in Ruhe.' },
        { icon: '🪥', label: 'Zähne', hint: 'Immer nach dem Essen.' },
        { icon: '🎒', label: 'Ranzen', hint: 'Steht an der Tür, Schuhe an.' },
      ]}
    />
  );
}
