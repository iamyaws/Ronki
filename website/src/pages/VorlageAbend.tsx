import { RoutinePrintSheet } from '../components/RoutinePrintSheet';
import { VorlageDownload } from '../components/VorlageDownload';
import { GuideFaq, GuideLink, VorlageGuide } from '../components/VorlageGuide';
import { VORLAGE_PRINT_ABEND } from './print/VorlagePrint';
import { JumpToBuilder } from '../components/routine-builder';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Abendroutine Vorlage für Kinder zum Ausdrucken · Ronki';
const META_DESCRIPTION =
  'Kostenlose Abendroutine Vorlage für Kinder zum Ausdrucken. Wähl eure Schritte mit Bildern, dein Kind malt die Kreise aus. Dazu: wann ihr anfangt, was hilft.';

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
      'Ohne. Der Kreis, den dein Kind selbst ausmalt, ist Rückmeldung genug. Und Vorlesen sollte keine Belohnung sein, die nach einem schwierigen Abend wegfällt. Es ist der ruhige Schluss jedes Tages.',
  },
  {
    question: 'Bekommen Geschwister dasselbe Blatt?',
    answer:
      'Besser nicht. Jedes Kind malt auf seinem eigenen Blatt aus, mit seinem Namen oben drauf. Für jüngere Geschwister passt die Vorlage für Kleinkinder mit weniger Text und größeren Bildern.',
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
      pageIntro="Stell eure eigenen Schritte aus Bildern zusammen oder nimm unsere vier, vom Zähneputzen bis Licht aus. Die Bilder versteht dein Kind auch ohne Lesen. Druck das Blatt direkt aus, ohne Anmeldung, oder hol dir unsere vier Schritte als fertiges PDF."
      metaTitle={META_TITLE}
      metaDescription={META_DESCRIPTION}
      downloadSlot={
        <VorlageDownload
          source="vorlage-abend"
          title="Die Abendroutine"
          pdfHref="/vorlagen/abendroutine.pdf"
          printHref="/print/vorlage-abend"
          sheetOnPage
        />
      }
      ronki={VORLAGE_PRINT_ABEND.ronki}
      done
      // Parents build their own evening; the untouched plan is the four steps above the fold as before.
      builder="evening"
    >
      <VorlageGuide
        previewSrc="/vorlagen/previews/abendroutine.png"
        previewAlt="Das PDF der Abendroutine-Vorlage: vier Schritte mit Bildern (Zähne putzen, Gesicht waschen, Pyjama an, Licht aus), daneben je ein Feld für die Uhrzeit und ein Kreis zum Ausmalen, oben Ronki mit einer Sprechblase."
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
                  Nach jedem Schritt malt dein Kind selbst den Kreis daneben aus. Steckst
                  du das Blatt in eine Klarsichthülle oder
                  laminierst es, reicht ein abwischbarer Stift, und am nächsten Abend ist es
                  wieder leer.
                </p>
                <p>
                  Uhrzeiten sind freiwillig. Abends helfen sie eher dir als deinem Kind. Oben
                  unter <JumpToBuilder className="text-cobalt underline decoration-2 underline-offset-4">Eure Schritte</JumpToBuilder>{' '}
                  rechnet die Seite von Licht aus rückwärts: Dann steht bei jedem Schritt, wann
                  er dran ist, und du siehst, wann ihr anfangen müsst.
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
                  Die vier Schritte sind ein Vorschlag. Oben stellst du euren Abend selbst
                  zusammen: Schritte dazunehmen, rausnehmen oder verschieben. Badet ihr abends,
                  gehört das Bad vor den Pyjama. Lest ihr vor, bleibt die
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
