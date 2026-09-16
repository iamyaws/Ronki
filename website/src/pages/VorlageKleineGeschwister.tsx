import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';

export default function VorlageKleineGeschwister() {
  return (
    <RoutinePrintSheet
      slug="kleine-geschwister"
      eyebrow="Für die Kleinen"
      title="Mein Tag"
      description="Ganz einfach, nur mit Bildern. Dein kleines Kind malt den großen Kreis aus, wenn es fertig ist."
      accent="#50a082"
      bigIcons
      downloadSlot={
        <VorlageDownload
          source="vorlage-kleine-geschwister"
          title="Mein Tag"
          pdfHref="/vorlagen/kleine-geschwister.pdf"
          printHref="/print/vorlage-kleine-geschwister"
        />
      }
      steps={[
        { icon: '🪥', label: '' },
        { icon: '👕', label: '' },
        { icon: '🥣', label: '' },
        { icon: '🧸', label: '' },
      ]}
      footerLine="ronki.de · für kleine Geschwister"
    />
  );
}
