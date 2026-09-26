import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';
import { GuideFaq, VorlageGuide } from '../components/VorlageGuide';
import { VORLAGE_PRINT_ADHS } from './print/VorlagePrint';

const FAQ: GuideFaq[] = [
  {
    question: 'Braucht mein Kind eine ADHS-Diagnose für diese Vorlage?',
    answer:
      'Nein. Der Plan hilft auch Kindern ohne Diagnose, die morgens schwer ins Anfangen kommen. Eine Diagnose stellen Fachleute, kein Blatt Papier.',
  },
  {
    question: 'Warum stehen keine Uhrzeiten auf dem Plan?',
    answer:
      'Uhrzeiten auf dem Plan machen Druck, und Druck macht das Anfangen schwerer. Der Balken unten im PDF zeigt nur ungefähr, wie lang euer Morgen ist.',
  },
  {
    question: 'Was, wenn der Plan nach zwei Wochen nicht mehr wirkt?',
    answer:
      'Dann ist er meistens zur Tapete geworden. Häng ihn dorthin, wo der Morgen gerade hakt, lass dein Kind die Bilder neu malen oder nimm eine buntere Klammer. Die Reihenfolge bleibt gleich.',
  },
  {
    question: 'Mit oder ohne Belohnung?',
    answer:
      'Ohne. Hier klemmt meistens nicht die Motivation, sondern der Start. Ein Sticker wirkt ein paar Tage, die Klammer zeigt jeden Morgen den nächsten Schritt.',
  },
];

/**
 * Sheet for kids with ADHS or weak executive functions.
 *
 * Six steps, one picture and one word each. No clock, no streak count.
 * A clothespin or paper clip on the edge of the sheet marks the step that
 * is running right now, and the child moves it down itself.
 *
 * The downloadable PDF (/print/vorlage-adhs) carries the same six steps
 * and clip lane plus the clip note and the time bar, which this screen
 * preview leaves out.
 */
export default function VorlageAdhs() {
  return (
    <RoutinePrintSheet
      slug="adhs"
      eyebrow="Ein Schritt"
      title="Mein Morgen, ein Schritt nach dem anderen"
      description="Sechs Schritte, immer in derselben Reihenfolge. Eine Wäscheklammer wandert am Rand nach unten und zeigt, was jetzt dran ist. Keine Uhr, kein Punktestand."
      accent="#0544B0"
      footerLine="ronki.de/vorlagen"
      pageTitle="Morgenroutine bei ADHS: Vorlage zum Ausdrucken"
      pageIntro="Ein Plan aus Bildern für Kinder mit ADHS oder schwachen Exekutivfunktionen. Druck diese Seite direkt aus, ohne Anmeldung, oder hol dir das fertige PDF."
      // Same title and description as the prerendered entry in vite-plugin-prerender-meta.ts.
      metaTitle="Mein Morgen, ein Schritt nach dem anderen: Vorlage bei ADHS · Ronki"
      metaDescription="Druckbarer Morgenplan für Kinder mit ADHS oder schwachen Exekutivfunktionen. Sechs Schritte, ein Bild pro Schritt, eine Klammer zeigt, was jetzt dran ist. Kostenlos, ohne Anmeldung."
      downloadSlot={
        <VorlageDownload
          source="vorlage-adhs"
          title="Mein Morgen, ein Schritt nach dem anderen"
          pdfHref="/vorlagen/adhs.pdf"
          printHref="/print/vorlage-adhs"
        />
      }
      ronki={VORLAGE_PRINT_ADHS.ronki}
      clipLane
      steps={[
        { img: 'wake.webp', icon: '💡', label: 'Licht', hint: 'Rollo hoch, ein Schluck Wasser.' },
        { img: 'toilet.webp', icon: '🚽', label: 'Klo', hint: 'Und Hände waschen.' },
        { img: 'shirt.webp', icon: '👕', label: 'Anziehen', hint: 'Liegt schon von gestern bereit.' },
        { img: 'plate.webp', icon: '🥣', label: 'Frühstück', hint: 'Am Tisch, in Ruhe.' },
        { img: 'toothbrush.webp', icon: '🪥', label: 'Zähne', hint: 'Immer nach dem Essen.' },
        { img: 'bag.webp', icon: '🎒', label: 'Ranzen', hint: 'Steht an der Tür, Schuhe an.' },
      ]}
    >
      <VorlageGuide
        previewSrc="/vorlagen/previews/adhs.png"
        previewAlt="Das PDF der ADHS-Vorlage Mein Morgen: sechs Schritte mit je einem Bild und einem Wort (Licht, Klo, Anziehen, Frühstück, Zähne, Ranzen), ein Rand für die Wäscheklammer, Kästchen zum Abhaken und ein Zeitbalken ohne Uhrzeit."
        previewCaption="So sieht das PDF aus. Eine Seite A4, mit Rand für die Klammer."
        faq={FAQ}
      />
    </RoutinePrintSheet>
  );
}
