import { Link } from 'react-router-dom';
import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';

export default function RatgeberRanzenPackenErsteKlasse() {
  return (
    <RatgeberArticle
      slug="ranzen-packen-erste-klasse"
      title="Ranzen packen in der 1. Klasse: eine Karte statt täglicher Suche"
      description="Turnbeutel vergessen, Schwimmsachen zu Hause? Eine Bildkarte pro Schultag zeigt, was in den Ranzen muss. Mit kostenlosem Packplan zum Ausdrucken."
      category="Einschulung"
      readMinutes={5}
      publishedAt="2026-09-26"
      ogImage="/og-tool-ranzen-packplan.jpg"
      heroImage="/art/routines/getting-ready.webp"
      heroAlt="Ein Kind macht sich morgens für die Schule fertig."
      related={[
        {
          slug: 'morgenroutine-grundschulkind',
          title: 'Die Morgenroutine, die wirklich klappt: was für 6- bis 8-Jährige funktioniert',
        },
        {
          slug: 'einschulung-selbststaendigkeit',
          title: 'Vor der Einschulung: Selbstständigkeit ohne Druck',
        },
        {
          slug: 'morgen-troedeln',
          title: 'Kind trödelt morgens? Warum das normal ist und was wirklich hilft',
        },
      ]}
    >
      <p className="lead">
        7:42 Uhr, die Schuhe sind an, die Tür ist offen. „Ist heute Sport?“
        Keiner weiß es genau. Der Turnbeutel hängt noch am Haken, die
        Wechselsachen liegen im Wäschekorb, und die Brotdose steht auf der
        Spüle. Der Ranzen ist gepackt, aber nicht mit dem, was heute gebraucht
        wird.
      </p>

      <p>
        In vielen Familien wohnt der Wochenplan der Schule im Kopf eines
        Elternteils. Dienstag Sport, Donnerstag Schwimmen, freitags das Buch
        für die Bücherei. Solange das so bleibt, packst du, erinnerst du und
        suchst du. Hier ist ein Weg, den Plan aus deinem Kopf auf ein Blatt zu
        holen, das dein Kind lesen kann, auch wenn es noch nicht liest.
      </p>

      <h2>Warum der Ranzen in deinem Kopf wohnt</h2>

      <p>
        Dein Kind sieht jeden Morgen denselben Ranzen. Was an welchem Tag
        dazukommt, steht auf dem Stundenplan, im Elternbrief oder in der
        Klassen-WhatsApp. Also bei dir. Wenn du dann fragst „Hast du alles?“,
        fragst du nach etwas, das dein Kind gar nicht wissen kann.
      </p>

      <p>
        Oft liegt es also nicht an Faulheit oder Vergesslichkeit. Dein Kind
        kann nirgends nachsehen, was heute dazugehört, außer bei dir.
      </p>

      <PullQuote>
        „Hast du alles?“ ist eine schwere Frage, wenn man nicht weiß, was
        alles ist.
      </PullQuote>

      <h2>So kommt der Plan aufs Papier</h2>

      <Steps>
        <StepCard n={1} title="Ein fester Startplatz">
          <p>
            Der Ranzen steht jeden Abend am selben Ort, zum Beispiel im Flur
            neben der Tür. Turnbeutel und Schwimmtasche hängen gleich daneben.
            Dann wird morgens weniger gesucht und mehr eingepackt.
          </p>
        </StepCard>
        <StepCard n={2} title="Eine Karte pro Schultag">
          <p>
            Für jeden Tag von Montag bis Freitag eine Karte mit Bildern:
            Brotdose, Trinkflasche und Mäppchen jeden Tag, dazu die Extras
            des Tages, also Turnbeutel, Schwimmsachen oder das Bücherei-Buch.
            Bilder funktionieren auch, wenn dein Kind noch nicht sicher liest.
          </p>
        </StepCard>
        <StepCard n={3} title="Die richtige Karte liegt bereit">
          <p>
            Welche Karte dran ist, entscheidest du. Leg abends die Karte für
            morgen an den Startplatz. Packt ihr erst morgens, nimm die Karte
            für heute. Dann schaut dein Kind auf die Bilder statt zu dir.
          </p>
        </StepCard>
        <StepCard n={4} title="Ein fester Nachfüll-Tag">
          <p>
            Wechselsachen und Turnbeutel kommen oft schmutzig oder gar nicht
            zurück. Leg einen Tag fest, an dem ihr beides kontrolliert und
            auffüllt, zum Beispiel sonntags.
          </p>
        </StepCard>
      </Steps>

      <p>
        Unser kostenloser{' '}
        <Link to="/tools/ranzen-packplan">Ranzen-Packplan</Link> macht genau
        diese Karten: Du tippst an, was jeden Tag mit muss und was nur an
        bestimmten Tagen, und bekommst fünf Tageskarten zum Ausdrucken. Steck
        sie in eine Klarsichthülle, dann sind sie wieder und wieder zu
        benutzen.
      </p>

      <h2>Wer packt? Drei Wege, ohne Frist</h2>

      <p>
        Wie viel dein Kind schon selbst macht, entscheidet ihr. Es gibt dafür
        keinen Stichtag und keinen Zeitplan, und ihr dürft jederzeit wieder
        einen Schritt zurückgehen.
      </p>

      <ul>
        <li>
          <strong>Zusammen packen.</strong> Ihr steht gemeinsam vor der Karte,
          dein Kind zeigt auf das Bild, du reichst an.
        </li>
        <li>
          <strong>Selbst packen, gemeinsam prüfen.</strong> Dein Kind packt
          nach der Karte, danach schaut ihr zusammen drauf.
        </li>
        <li>
          <strong>Selbst prüfen.</strong> Dein Kind packt und vergleicht selbst
          mit der Karte. Statt „Hast du alles?“ zu fragen, kannst du auf die
          Karte zeigen.
        </li>
      </ul>

      <Callout type="ausprobieren" label="Ein Satz statt einer Liste">
        <p>
          Statt alles aufzuzählen, probier morgens einen Satz: „Schau mal auf
          deine Karte.“ Das klingt klein, aber so geht die Frage von dir an
          das Blatt.
        </p>
      </Callout>

      <h2>Ein Link für die ganze Klasse</h2>

      <p>
        Die Sporttage und der Schwimmtag gelten meistens für die ganze Klasse.
        Wenn eine Mutter oder ein Vater den Packplan einmal ausfüllt, kann der
        Link in die Klassen-WhatsApp. Jede Familie öffnet ihn, passt ihn an
        und druckt ihre eigenen Karten. Im Link stehen die Tage, die Sachen
        und was ihr bei „Noch etwas?“ eintragt. Alle mit dem Link können das
        lesen, also schreib dort keine Namen hinein.
      </p>

      <h2>Wenn doch mal etwas fehlt</h2>

      <p>
        Es wird vorkommen, dass der Turnbeutel trotzdem zu Hause bleibt. Ob du
        ihn hinterherbringst oder nicht, ist eure Entscheidung, darauf gibt es
        keine richtige Antwort. Hilfreicher als die Frage „Wer ist schuld?“
        ist am Abend die Frage „Was ergänzen wir auf der Karte?“. Vielleicht
        fehlt dort einfach ein Bild. Was nicht in der Auswahl steht, trägst du
        bei „Noch etwas?“ ein. Dafür bekommt die Karte ein leeres Feld, in das
        dein Kind selbst malt, was mit muss.
      </p>

      <h2>Was du heute tun kannst</h2>

      <Callout type="ausprobieren">
        <p>
          <strong>Erstens:</strong> Such euch einen Startplatz für Ranzen und
          Turnbeutel.
        </p>
        <p>
          <strong>Zweitens:</strong> Mach im{' '}
          <Link to="/tools/ranzen-packplan">Ranzen-Packplan</Link> eure fünf
          Tageskarten und häng die Karte für morgen dazu.
        </p>
        <p>
          <strong>Drittens:</strong> Wenn der Morgen insgesamt eng ist, hilft
          ein fester Ablauf von Aufstehen bis Tür. Dafür gibt es die{' '}
          <Link to="/vorlagen/morgenroutine">Morgenroutine zum Ausdrucken</Link>.
        </p>
      </Callout>

      <p className="source">
        Die Tipps in diesem Artikel sind unsere Vorschläge aus dem
        Familienalltag, keine Studienergebnisse.
      </p>
    </RatgeberArticle>
  );
}
