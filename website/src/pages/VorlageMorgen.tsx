import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';
import { GuideFaq, GuideLink, VorlageGuide } from '../components/VorlageGuide';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Morgenroutine Vorlage für Kinder zum Ausdrucken · Ronki';
const META_DESCRIPTION =
  'Kostenlose Morgenroutine Vorlage für Kinder zum Ausdrucken. Vier Schritte mit Bildern zum Abhaken, dazu Tipps zum Aufhängen und für Morgen, die schiefgehen.';

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
      'Ohne. Der Haken, den dein Kind selbst setzt, ist Rückmeldung genug. Wer für jeden Schritt einen Sticker verspricht, muss die Belohnung meistens bald größer machen, damit sie noch wirkt.',
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
      accent="#d97706"
      pageTitle="Morgenroutine Vorlage für Kinder zum Ausdrucken"
      pageIntro="Vier Schritte vom Zähneputzen bis zur fertigen Tasche, mit Bildern, die dein Kind auch ohne Lesen versteht. Druck diese Seite direkt aus, ohne Anmeldung, oder hol dir das fertige PDF."
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
      steps={[
        { icon: '🪥', label: 'Zähne putzen', hint: 'Oben, unten, außen, innen.' },
        { icon: '👕', label: 'Anziehen', hint: 'Wetter angucken, dann Sachen raussuchen.' },
        { icon: '🥣', label: 'Frühstücken', hint: 'Am Tisch, in Ruhe.' },
        { icon: '🎒', label: 'Tasche packen', hint: 'Brotdose, Trinken, Hausaufgaben.' },
      ]}
    >
      <VorlageGuide
        previewSrc="/vorlagen/previews/morgenroutine.png"
        previewAlt="Das PDF der Morgenroutine-Vorlage: vier Schritte mit Bildern (Zähne putzen, Anziehen, Frühstücken, Tasche packen), daneben je ein Feld für die Uhrzeit und ein Kästchen zum Abhaken."
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
                  Den Haken setzt dein Kind selbst, nicht du. Hier in der Vorschau sind es
                  Kreise zum Ausmalen, im PDF Kästchen zum Abhaken. Beides funktioniert. Wer
                  selbst abhakt, sieht am Ende, was er geschafft hat.
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
                  Die vier Schritte sind ein Vorschlag. Kommt bei euch das Frühstück vor dem
                  Anziehen, dreh die Reihenfolge um. Wichtig ist nur, dass sie jeden Tag gleich
                  bleibt. Was jeden Tag anders ist, wird jeden Tag neu verhandelt.
                </p>
                <p>
                  Nimm für den Anfang nicht mehr als vier oder fünf Schritte. Klo, Hände
                  waschen oder Schuhe passen meistens in einen Schritt, den es schon gibt. Wenn
                  dein Kind schon beim Anfangen hängen bleibt, probier die{' '}
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
                  Kästchen leer geblieben sind. Am nächsten Morgen fängt das Blatt wieder oben
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
