import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';
import { GuideFaq, GuideLink, VorlageGuide } from '../components/VorlageGuide';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Routine-Vorlage für Kleinkinder zum Ausdrucken · Ronki';
const META_DESCRIPTION =
  'Kostenlose Routine-Vorlage für Kleinkinder von 2 bis 4 Jahren zum Ausdrucken. Vier große Bilder, kein Text, zum Abhaken. Mit Tipps, damit es ohne Druck klappt.';

const FAQ: GuideFaq[] = [
  {
    question: 'Ab welchem Alter passt die Vorlage?',
    answer:
      'Ab etwa zwei Jahren, sobald dein Kind Bilder erkennt und darauf zeigt. Ab dem Vorschulalter passt meistens die Morgenroutine oder die Abendroutine mit Wörtern besser.',
  },
  {
    question: 'Mein Kind kann noch keinen Haken malen. Was jetzt?',
    answer:
      'Dann reicht ein Strich oder ein Kringel. Es geht nicht um einen schönen Haken. Es geht darum, dass dein Kind selbst zeigt: geschafft.',
  },
  {
    question: 'Mit oder ohne Belohnung?',
    answer:
      'Ohne. Kleinkinder freuen sich über das Abhaken selbst und darüber, dass du es siehst. Eine Belohnung für jeden Schritt macht aus dem Mitmachen schnell ein Tauschgeschäft.',
  },
  {
    question: 'Braucht jedes Kind ein eigenes Blatt?',
    answer:
      'Ja, wenn es geht. Ein Blatt mit dem eigenen Namen ist für kleine Kinder etwas Besonderes. Ein gemeinsames Blatt endet schnell im Streit darüber, wer den Haken setzen darf.',
  },
];

export default function VorlageKleineGeschwister() {
  return (
    <RoutinePrintSheet
      slug="kleine-geschwister"
      eyebrow="Für die Kleinen"
      title="Mein Tag"
      description="Ganz einfach, nur mit Bildern. Dein kleines Kind malt den großen Kreis aus, wenn es fertig ist."
      accent="#50a082"
      bigIcons
      pageTitle="Routine-Vorlage für Kleinkinder (2 bis 4 Jahre) zum Ausdrucken"
      pageIntro="Vier große Bilder, kein Text. Für die Kleinen, die sehen, wie das große Geschwisterkind abhakt, und mitmachen wollen. Druck diese Seite direkt aus, ohne Anmeldung, oder hol dir das fertige PDF."
      metaTitle={META_TITLE}
      metaDescription={META_DESCRIPTION}
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
    >
      <VorlageGuide
        previewSrc="/vorlagen/previews/kleine-geschwister.png"
        previewAlt="Das PDF der Kleinkind-Vorlage Mein Tag: vier große Bilder ohne Text (Zahnbürste, T-Shirt, Müslischale, Teddy), daneben je ein großes Kästchen zum Abhaken."
        previewCaption="So sieht das PDF aus. Eine Seite A4."
        faq={FAQ}
        sections={[
          {
            heading: 'Für wen das Blatt gedacht ist',
            body: (
              <>
                <p>
                  Kleine Kinder schauen sich viel bei den Großen ab. Wenn das Schulkind morgens
                  seine Kästchen abhakt, will das kleine Geschwisterkind oft auch ein Blatt.
                  Genau dafür ist diese Vorlage da. Sie hat vier Bilder: Zahnbürste, T-Shirt,
                  Frühstücksschale und einen Teddy, der bei euch fürs Spielen oder fürs Bett
                  stehen kann.
                </p>
                <p>
                  Erwarte nicht, dass ein Zweijähriger die Reihenfolge allein durchzieht. In
                  dem Alter geht es ums Mitmachen. Das Blatt ist ein Spiel mit Bildern, kein
                  Plan, der erfüllt werden muss.
                </p>
              </>
            ),
          },
          {
            heading: 'So benutzt ihr die Vorlage',
            body: (
              <>
                <p>
                  Häng das Blatt tief, auf Augenhöhe deines Kindes, gern direkt neben das Blatt
                  vom großen Geschwisterkind. Zeig bei jedem Schritt auf das Bild und sag immer
                  denselben kurzen Satz dazu, zum Beispiel: Erst Zähne, dann anziehen.
                  Kleinkinder brauchen Wiederholung, keine Abwechslung.
                </p>
                <p>
                  Den Haken setzt dein Kind selbst, auch wenn er krumm wird. Ein dicker
                  Wachsmalstift liegt gut in kleinen Händen. Für ein laminiertes Blatt nimmst du
                  einen abwischbaren Stift. Ohne Laminieren druckst du einfach ein neues aus.
                </p>
                <p>
                  Rechne eher in Wochen als in Tagen. Manche Kleinkinder zeigen nach kurzer Zeit
                  von selbst auf das nächste Bild. Andere verlieren das Interesse und finden das
                  Blatt ein paar Wochen später wieder spannend. Beides ist in Ordnung.
                </p>
              </>
            ),
          },
          {
            heading: 'Die Bilder anpassen',
            body: (
              <p>
                Die vier Bilder passen zu einem Morgen. Für den Abend malst du eigene Bilder
                dazu: Zähne, waschen, Pyjama, Licht aus. Mehr als vier Schritte sind in dem Alter
                meistens zu viel. Lieber vier, die jeden Tag gleich bleiben.
              </p>
            ),
          },
          {
            heading: 'Wenn es nicht klappt',
            body: (
              <>
                <p>
                  Ein Kleinkind, das heute nicht will, will heute nicht. Lass das Blatt hängen
                  und macht ohne weiter. Kein Schimpfen über leere Kästchen und kein Vergleich
                  mit dem großen Geschwisterkind. Das Blatt soll Lust aufs Mitmachen machen,
                  sonst wird es zum nächsten Streitpunkt.
                </p>
                <p>
                  Was bei Drei- bis Fünfjährigen abends anders läuft, steht im Abschnitt zum
                  Kleinkind in unserem Ratgeber zur{' '}
                  <GuideLink to="/ratgeber/abendroutine-grundschulkind">
                    Abendroutine für Kinder
                  </GuideLink>
                  . Und warum Kinder morgens trödeln, obwohl sie es eigentlich können, erklärt
                  der Artikel{' '}
                  <GuideLink to="/ratgeber/morgen-troedeln">Kind trödelt morgens</GuideLink>.
                </p>
              </>
            ),
          },
        ]}
      />
    </RoutinePrintSheet>
  );
}
