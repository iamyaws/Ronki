import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';
import { GuideFaq, GuideLink, VorlageGuide } from '../components/VorlageGuide';
import { VORLAGE_PRINT_ABEND } from './print/VorlagePrint';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Abendroutine Vorlage für Kinder zum Ausdrucken · Ronki';
const META_DESCRIPTION =
  'Kostenlose Abendroutine Vorlage für Kinder zum Ausdrucken. Vier Schritte bis ins Bett, zum Abhaken. Dazu: wann ihr anfangt und was hilft, wenn es hakt.';

const FAQ: GuideFaq[] = [
  {
    question: 'Ab welchem Alter passt die Vorlage?',
    answer:
      'Gedacht ist sie für Kinder von 5 bis 8 Jahren. Für Zwei- bis Vierjährige gibt es eine einfachere Vorlage nur mit Bildern.',
  },
  {
    question: 'Was, wenn mein Kind noch nicht lesen kann?',
    answer:
      'Das macht nichts. Jeder Schritt hat ein großes Bild. Lies die Wörter an den ersten Abenden vor und zeig dabei auf das Bild. Nach ein paar Tagen kennt dein Kind die Reihenfolge.',
  },
  {
    question: 'Mit oder ohne Belohnung?',
    answer:
      'Ohne. Der Haken, den dein Kind selbst setzt, ist Rückmeldung genug. Und Vorlesen sollte keine Belohnung sein, die nach einem schwierigen Abend wegfällt. Es ist der ruhige Schluss jedes Tages.',
  },
  {
    question: 'Bekommen Geschwister dasselbe Blatt?',
    answer:
      'Besser nicht. Jedes Kind hakt auf seinem eigenen Blatt ab, mit seinem Namen oben drauf. Für jüngere Geschwister passt die Vorlage für Kleinkinder mit weniger Text und größeren Bildern.',
  },
];

export default function VorlageAbend() {
  return (
    <RoutinePrintSheet
      slug="abendroutine"
      eyebrow="Abend"
      title="Die Abendroutine"
      description="Vier Schritte bis ins Bett. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist."
      accent="#0544B0"
      pageTitle="Abendroutine Vorlage für Kinder zum Ausdrucken"
      pageIntro="Vier Schritte vom Zähneputzen bis zur Schlafenszeit, mit Bildern, die dein Kind auch ohne Lesen versteht. Druck diese Seite direkt aus, ohne Anmeldung, oder hol dir das fertige PDF."
      metaTitle={META_TITLE}
      metaDescription={META_DESCRIPTION}
      downloadSlot={
        <VorlageDownload
          source="vorlage-abend"
          title="Die Abendroutine"
          pdfHref="/vorlagen/abendroutine.pdf"
          printHref="/print/vorlage-abend"
        />
      }
      ronki={VORLAGE_PRINT_ABEND.ronki}
      done
      steps={[
        { img: 'toothbrush.webp', icon: '🪥', label: 'Zähne putzen', hint: 'Auch die hinten im Mund.' },
        { img: 'wash.webp', icon: '🧼', label: 'Gesicht waschen', hint: 'Mit Wasser, ganz sanft.' },
        { img: 'pajama.webp', icon: '🌙', label: 'Pyjama an', hint: 'Die Sachen von heute in den Korb.' },
        { img: 'nightlight.webp', icon: '📖', label: 'Schlafenszeit', hint: 'Eine Geschichte, dann schlafen.' },
      ]}
    >
      <VorlageGuide
        previewSrc="/vorlagen/previews/abendroutine.png"
        previewAlt="Das PDF der Abendroutine-Vorlage: vier Schritte mit Bildern (Zähne putzen, Gesicht waschen, Pyjama an, Schlafenszeit), daneben je ein Feld für die Uhrzeit und ein Kreis zum Ausmalen, oben Ronki mit einer Sprechblase."
        previewCaption="So sieht das PDF aus. Eine Seite A4."
        faq={FAQ}
        sections={[
          {
            heading: 'So benutzt ihr die Vorlage',
            body: (
              <>
                <p>
                  Häng das Blatt dort auf, wo der Abend passiert: an die Badezimmertür oder
                  neben das Bett, auf Augenhöhe deines Kindes. Dann muss niemand mehr fragen,
                  was noch dran ist. Dein Kind sieht es selbst.
                </p>
                <p>
                  Jeden Schritt hakt dein Kind selbst ab und malt den Kreis daneben aus. Steckst
                  du das Blatt in eine Klarsichthülle oder
                  laminierst es, reicht ein abwischbarer Stift, und am nächsten Abend ist es
                  wieder leer.
                </p>
                <p>
                  Die Felder für die Uhrzeit im PDF sind freiwillig. Abends helfen sie eher dir
                  als deinem Kind. Wenn du von Licht aus rückwärts rechnest, siehst du, wann ihr
                  mit Zähneputzen anfangen müsst.
                </p>
              </>
            ),
          },
          {
            heading: 'Früh genug anfangen',
            body: (
              <>
                <p>
                  Die meisten Abende kippen, weil sie zu spät anfangen. Vier Schritte klingen
                  nach zehn Minuten. Mit einem müden Kind, einem Geschwisterkind und einer
                  Diskussion über den Pyjama wird schnell eine halbe Stunde daraus. Plan mehr
                  Zeit ein, als du glaubst zu brauchen.
                </p>
                <p>
                  In den ersten zwei Wochen gehst du noch mit und zeigst aufs Blatt, statt zu
                  erklären. Danach wird es meistens ruhiger, weil die Reihenfolge nicht mehr
                  jeden Abend neu verhandelt wird.
                </p>
              </>
            ),
          },
          {
            heading: 'Die Schritte an euren Abend anpassen',
            body: (
              <>
                <p>
                  Badet ihr abends, gehört das Bad vor den Pyjama. Lest ihr vor, bleibt die
                  Geschichte der letzte Schritt. Stell die Reihenfolge so um, wie euer Abend
                  wirklich läuft, und halt sie dann jeden Tag gleich.
                </p>
                <p>
                  Vorlesen muss sich dein Kind nicht verdienen. Es kommt jeden Abend, auch nach
                  einem schwierigen Tag. Sonst wird der ruhigste Moment des Abends zum
                  Druckmittel.
                </p>
              </>
            ),
          },
          {
            heading: 'Wenn ein Abend schiefgeht',
            body: (
              <>
                <p>
                  Manche Abende laufen einfach nicht. Dein Kind ist aufgedreht, der Tag war zu
                  voll. Dann wird es eben später. Ein einzelner schlechter Abend richtet wenig
                  an. Schwierig wird es erst, wenn fast jeder Abend so läuft.
                </p>
                <p>
                  Mach aus leeren Kreisen kein Thema, am nächsten Abend fängt das Blatt wieder
                  oben an. Hakt es länger, schau auf die Uhrzeit, das Licht im Zimmer und den
                  Bildschirm vor dem Schlafen. Das alles steht ausführlicher in unserem Ratgeber
                  zur{' '}
                  <GuideLink to="/ratgeber/abendroutine-grundschulkind">
                    Abendroutine für Kinder
                  </GuideLink>
                  . Ronki, unser Drachen-Begleiter, zeigt dieselben Schritte in einer frühen
                  App-Version, aber das Blatt an der Tür tut es auch.
                </p>
              </>
            ),
          },
        ]}
      />
    </RoutinePrintSheet>
  );
}
