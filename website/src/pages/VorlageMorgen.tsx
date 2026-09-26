import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { BUILDER_ANCHOR } from '../components/routine-builder';
import { VorlageDownload } from '../components/VorlageDownload';
import { GuideFaq, GuideLink, VorlageGuide } from '../components/VorlageGuide';
import { VORLAGE_PRINT_MORGEN } from './print/VorlagePrint';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Morgenroutine Vorlage für Kinder zum Ausdrucken · Ronki';
const META_DESCRIPTION =
  'Kostenlose Morgenroutine Vorlage für Kinder zum Ausdrucken. Wähl eure Schritte mit Bildern, dein Kind malt die Kreise aus. Dazu Tipps für schwere Morgen.';

const FAQ: GuideFaq[] = [
  {
    question: 'Ab welchem Alter passt die Vorlage?',
    answer:
      'Gedacht ist sie für Kinder von 5 bis 8 Jahren. Für Zwei- bis Vierjährige gibt es eine eigene Vorlage mit großen Bildern und ganz ohne Text.',
  },
  {
    question: 'Was, wenn mein Kind noch nicht lesen kann?',
    answer:
      'Das macht nichts. Jeder Schritt hat ein großes Bild. Lies die Wörter in den ersten Tagen vor und zeig dabei auf das Bild. Nach ein paar Morgen erkennt dein Kind die Schritte allein.',
  },
  {
    question: 'Mit oder ohne Belohnung?',
    answer:
      'Ohne. Der Kreis, den dein Kind selbst ausmalt, ist Rückmeldung genug. Wer für jeden Schritt einen Sticker verspricht, muss die Belohnung meistens bald größer machen, damit sie noch wirkt.',
  },
  {
    question: 'Reicht die Seite oder brauche ich das PDF?',
    answer:
      'Die Seite reicht. Tipp oben auf Drucken, dann druckt dein Browser nur das Blatt. Das PDF ist die fertige Datei mit Feldern für eure Uhrzeiten, die du speichern und immer wieder drucken kannst.',
  },
];

export default function VorlageMorgen() {
  return (
    <RoutinePrintSheet
      slug="morgenroutine"
      eyebrow="Morgen"
      title="Die Morgenroutine"
      description="Vier Schritte bis zur Tasche. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist."
      accent="#0544B0"
      pageTitle="Morgenroutine Vorlage für Kinder zum Ausdrucken"
      pageIntro="Stell eure eigenen Schritte aus Bildern zusammen oder nimm unsere vier, vom Zähneputzen bis zur fertigen Tasche. Die Bilder versteht dein Kind auch ohne Lesen. Druck das Blatt direkt aus, ohne Anmeldung, oder hol dir unsere vier Schritte als fertiges PDF."
      metaTitle={META_TITLE}
      metaDescription={META_DESCRIPTION}
      downloadSlot={
        <VorlageDownload
          source="vorlage-morgen"
          title="Die Morgenroutine"
          pdfHref="/vorlagen/morgenroutine.pdf"
          printHref="/print/vorlage-morgen"
        />
      }
      ronki={VORLAGE_PRINT_MORGEN.ronki}
      done
      // Parents pick their own steps above the preview. Untouched, the sheet
      // shows the four steps the page always had: Zähne putzen, Anziehen,
      // Frühstücken, Tasche packen.
      builder="morning"
    >
      <VorlageGuide
        previewSrc="/vorlagen/previews/morgenroutine.png"
        previewAlt="Das PDF der Morgenroutine-Vorlage: vier Schritte mit Bildern (Zähne putzen, Anziehen, Frühstücken, Tasche packen), daneben je ein Feld für die Uhrzeit und ein Kreis zum Ausmalen, oben Ronki mit einer Sprechblase."
        previewCaption="So sieht das PDF aus. Eine Seite A4."
        faq={FAQ}
        sections={[
          {
            heading: 'So benutzt ihr die Vorlage',
            body: (
              <>
                <p>
                  Häng das Blatt auf Augenhöhe deines Kindes auf, an eine Stelle, an der es
                  morgens sowieso vorbeikommt. Bei vielen Familien ist das die Badezimmertür
                  oder der Kühlschrank. Wichtig ist nur: Dein Kind sieht es, ohne zu suchen.
                </p>
                <p>
                  Den Kreis malt dein Kind selbst aus, nicht du. Wer selbst ausmalt, sieht am
                  Ende, was er geschafft hat.
                </p>
                <p>
                  Du willst nicht jeden Tag neu drucken? Steck das Blatt in eine Klarsichthülle
                  oder laminier es. Mit einem abwischbaren Stift ist es am nächsten Morgen
                  wieder leer. Die Felder für die Uhrzeit im PDF sind freiwillig. Wenn dein Kind
                  von Uhrzeiten eher nervös wird, lass sie leer.
                </p>
              </>
            ),
          },
          {
            heading: 'Wie lange, bis es von allein läuft',
            body: (
              <>
                <p>
                  Rechne mit etwa zwei Wochen, in denen du noch mitgehst. Statt zu erklären,
                  zeigst du aufs Blatt: Was ist als Nächstes dran? In dieser Zeit dauert der
                  Morgen oft länger als vorher. Das ist normal. Nach ein paar Wochen macht dein
                  Kind die Schritte, weil sie dran sind, und nicht mehr, weil du sie ansagst.
                </p>
              </>
            ),
          },
          {
            heading: 'Die Schritte an euren Morgen anpassen',
            body: (
              <>
                <p>
                  Die vier Schritte sind ein Vorschlag. Oben unter{' '}
                  <a href={`#${BUILDER_ANCHOR}`} className="text-cobalt underline decoration-2 underline-offset-4">
                    Eure Schritte
                  </a>{' '}
                  stellst du euren Morgen selbst zusammen: Schritte dazunehmen, rausnehmen oder
                  verschieben. Kommt bei euch das Frühstück vor dem Anziehen, schieb es nach oben.
                  Wichtig ist nur, dass die Reihenfolge jeden Tag gleich bleibt. Was jeden Tag
                  anders ist, wird jeden Tag neu verhandelt.
                </p>
                <p>
                  Nimm für den Anfang lieber wenige Schritte. Wenn die sitzen, nimm oben einen
                  dazu, etwa Aufstehen oder Waschen. Mehr als sechs passen nicht auf das Blatt.
                  Wenn dein Kind schon beim Anfangen hängen bleibt, probier die{' '}
                  <GuideLink to="/vorlagen/adhs">Vorlage bei ADHS</GuideLink>. Sie hat sechs
                  kleine Schritte und eine Wäscheklammer, die zeigt, was gerade dran ist.
                </p>
              </>
            ),
          },
          {
            heading: 'Wenn ein Morgen schiefgeht',
            body: (
              <>
                <p>
                  Es wird Morgen geben, an denen gar nichts geht. Dein Kind hat schlecht
                  geschlafen, die Hose kratzt, alle sind spät dran. Dann hilfst du eben mit und
                  bringst alle aus dem Haus. Mach am Nachmittag kein Thema daraus, welche
                  Kreise leer geblieben sind. Am nächsten Morgen fängt das Blatt wieder oben
                  an.
                </p>
                <p>
                  Hakt es über Wochen jeden Morgen, liegt es selten am Kind. Oft ist der Ablauf
                  noch nicht sichtbar genug, oder der Abend davor war zu lang. Mehr dazu steht
                  in unserem Ratgeber zur{' '}
                  <GuideLink to="/ratgeber/morgenroutine-grundschulkind">
                    Morgenroutine für Grundschulkinder
                  </GuideLink>
                  . Ronki, unser Drachen-Begleiter, zeigt dieselben Schritte in einer frühen
                  App-Version, aber das Blatt funktioniert auch ohne ihn.
                </p>
              </>
            ),
          },
        ]}
      />
    </RoutinePrintSheet>
  );
}
