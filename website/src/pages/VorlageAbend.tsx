import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';

export default function VorlageAbend() {
  return (
    <RoutinePrintSheet
      slug="abendroutine"
      eyebrow="Abend"
      title="Die Abendroutine"
      description="Vier Schritte bis ins Bett. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist."
      accent="#4338ca"
      downloadSlot={
        <VorlageDownload
          source="vorlage-abend"
          title="Die Abendroutine"
          pdfHref="/vorlagen/abendroutine.pdf"
          printHref="/print/vorlage-abend"
        />
      }
      steps={[
        { icon: '🪥', label: 'Zähne putzen', hint: 'Auch die hinten im Mund.' },
        { icon: '🧼', label: 'Gesicht waschen', hint: 'Mit Wasser, ganz sanft.' },
        { icon: '🌙', label: 'Pyjama an', hint: 'Die Sachen von heute in den Korb.' },
        { icon: '📖', label: 'Licht aus', hint: 'Eine Geschichte, dann schlafen.' },
      ]}
    />
  );
}
