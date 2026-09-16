import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';

export default function VorlageMorgen() {
  return (
    <RoutinePrintSheet
      slug="morgenroutine"
      eyebrow="Morgen"
      title="Die Morgenroutine"
      description="Vier Schritte bis zur Tasche. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist."
      accent="#d97706"
      downloadSlot={
        <VorlageDownload
          source="vorlage-morgen"
          title="Die Morgenroutine"
          pdfHref="/vorlagen/morgenroutine.pdf"
          printHref="/print/vorlage-morgen"
        />
      }
      steps={[
        { icon: '🪥', label: 'Zähne putzen', hint: 'Oben, unten, außen, innen.' },
        { icon: '👕', label: 'Anziehen', hint: 'Wetter angucken, dann Sachen raussuchen.' },
        { icon: '🥣', label: 'Frühstücken', hint: 'Am Tisch, in Ruhe.' },
        { icon: '🎒', label: 'Tasche packen', hint: 'Brotdose, Trinken, Hausaufgaben.' },
      ]}
    />
  );
}
