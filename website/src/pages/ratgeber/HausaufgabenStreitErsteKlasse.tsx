import { Link } from 'react-router-dom';
import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';

/*
 * Claims check (27 Sep 2026): every statement about children, health or
 * school rules carries an opened source (BVKJ, BZgA, listed under
 * "Quellen"); parent quotes are verbatim from the checked forum threads.
 * Everything else is marked as our suggestion. No homework time norms:
 * they differ by school and Bundesland, so the article sends parents to the
 * teacher instead.
 */
export default function RatgeberHausaufgabenStreitErsteKlasse() {
  return (
    <RatgeberArticle
      slug="hausaufgaben-streit-erste-klasse"
      title="Hausaufgaben-Streit in der 1. Klasse: erst ankommen, dann ein fester Rahmen"
      description="Wut nach der Schule, Streit um die Hausaufgaben? Erst ankommen, dann eine feste Zeit. Mit kostenlosem Nachmittagsplan für zu Hause, OGS und Oma."
      category="Einschulung"
      readMinutes={7}
      publishedAt="2026-09-27"
      ogImage="/og-tool-nachmittagsplan.jpg"
      heroImage="/art/bioms/Sonnenglast_sun-highlands.webp"
      heroAlt="Sonnige Hügellandschaft am Nachmittag, weites Licht."
      related={[
        {
          slug: 'einschulung-selbststaendigkeit',
          title: 'Vor der Einschulung: Selbstständigkeit ohne Druck',
        },
        {
          slug: 'ranzen-packen-erste-klasse',
          title: 'Ranzen packen in der 1. Klasse: eine Karte statt täglicher Suche',
        },
        {
          slug: 'abendroutine-grundschulkind',
          title: 'Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt',
        },
      ]}
    >
      <p className="lead">
        Die Tür geht auf, der Ranzen landet in der Ecke. Du fragst nach den
        Hausaufgaben, und die Antwort ist ein Schrei. Am nächsten Tag das
        Gleiche, nur lauter. Hier ist ein Weg, den Nachmittag so zu bauen, dass
        die Hausaufgaben einen festen Platz haben.
      </p>

      <h2>So klingt das in Elternforen</h2>
      <p>
        Wer nach dem Thema sucht, findet Sätze wie diese, von Eltern von
        Erstklässlern:
      </p>
      <PullQuote>
        „Wenn ich ihm sage, Hausaufgaben, dann fängt er schon an zu schreien.“
      </PullQuote>
      <PullQuote>
        „Im Moment ist mein Sohn wie Mentos mit Cola, explodiert wegen
        Kleinigkeiten.“
      </PullQuote>
      <p>
        Die Kinder- und Jugendärzte schreiben dazu: Damit Kinder konzentriert
        arbeiten können, brauchen sie nach einem anstrengenden Schultag erst
        einmal eine Pause.
      </p>

      <h2>Erst ankommen: essen, trinken, bewegen</h2>
      <p>
        Ankommen heißt: erst mal nichts müssen. Etwas essen, etwas trinken,
        sich bewegen oder ausruhen. Die Bundeszentrale für gesundheitliche
        Aufklärung empfiehlt Bewegung nach ruhigen, sitzenden Tätigkeiten, zum
        Beispiel nach der Schule, und Ruhe nach der Schule. Wie lange sich ein
        Kind ausruhen muss, ist verschieden: Die BZgA nennt fünf Minuten bis zu
        einer halben Stunde.
      </p>
      <p>
        Unser Vorschlag: In dieser Zeit fragst du nicht nach den Hausaufgaben.
        Die Frage kommt später, und zwar nicht von dir, sondern vom Plan.
      </p>

      <h2>Eine feste Hausaufgabenzeit statt täglicher Verhandlung</h2>
      <Steps>
        <StepCard n={1} title="Die Zeit steht auf dem Plan">
          <p>
            Such für jeden Schultag eine feste Uhrzeit für die Hausaufgaben
            aus, nach dem Ankommen und nicht mitten in einem Termin. Die Zeit
            steht auf dem Blatt, nicht in deinem Kopf.
          </p>
        </StepCard>
        <StepCard n={2} title="Du zeigst, statt zu erinnern">
          <p>
            Wenn es so weit ist, sagst du nicht „Mach jetzt endlich
            Hausaufgaben“. Du zeigst auf den Plan: Jetzt ist Hausaufgabenzeit.
          </p>
        </StepCard>
        <StepCard n={3} title="Die Dauer kommt von der Schule">
          <p>
            Wie viel Zeit für die Hausaufgaben gedacht ist, sagt dir die
            Lehrkraft. Trag die Minuten nur ein, wenn du sie kennst. Sonst
            bleibt es bei der Uhrzeit.
          </p>
        </StepCard>
      </Steps>

      <h2>Hort, OGS, Oma: den Plan weitergeben</h2>
      <p>
        An manchen Tagen passieren die Hausaufgaben gar nicht zu Hause, sondern
        in der OGS, im Hort oder bei Oma und Opa. Dann gehört genau das auf den
        Plan: „in der OGS“ oder „bei Oma, Opa“. So weiß jeder, was an
        welchem Tag dran ist, und der Nachmittag zu Hause holt nicht nach, was
        schon erledigt ist. Den Wochenplan kannst du auch allein ausdrucken und
        weitergeben, ohne die Karten für dein Kind.
      </p>

      <h2>Wenn der Plan nicht aufgeht</h2>
      <p>
        Schwimmen um halb vier, Hausaufgaben um vier, Abendessen um sechs: Auf
        dem Papier sieht vieles gut aus, bis zwei Dinge zur gleichen Zeit
        stattfinden sollen. Die BZgA rät, Termine für ein Kind nicht direkt
        hintereinander zu legen.
      </p>
      <p>
        Der kostenlose{' '}
        <Link to="/tools/nachmittagsplan">Nachmittagsplan</Link> zeigt dir, wenn
        sich eingetragene Zeiten an einem Tag überschneiden oder die
        Hausaufgaben ins Ankommen rutschen. Gedruckt wird erst, wenn die
        eingetragenen Zeiten zusammenpassen. Was du verschiebst, entscheidest
        du.
      </p>

      <h2>Wenn es knallt: ein Satz statt einer Diskussion</h2>
      <p>
        Wenn dein Kind schon beim Wort „Hausaufgaben“ laut wird, unser
        Vorschlag: Halte die Erklärung kurz und biete eine Pause an. Such dir
        einen Satz, den du jeden Tag gleich sagst, zum Beispiel „Jetzt ist
        Hausaufgabenzeit.“ Der Satz steht auch auf der Karte „Bei den
        Hausaufgaben“ im Nachmittagsplan, zusammen mit Ronki.
      </p>

      <h2>Fehler, Lesen üben, Dauer: was du nicht jeden Tag lösen musst</h2>
      <p>
        Die Kinder- und Jugendärzte raten Eltern, ihrem Kind keine Lösungen
        vorzugeben, sondern mögliche Wege aufzuzeigen. Ob du Fehler korrigieren
        sollst, fragst du am besten die Lehrkraft. Beim Lesen üben kannst du
        sagen: „Du liest, ich höre zu.“
      </p>

      <Callout type="ausprobieren" label="Für dich">
        <p>
          Du musst im Wutmoment nichts erklären. Du musst das nicht gewinnen.
          Ein Nachmittag, der schiefgeht, ist ein Nachmittag, nicht der ganze
          Plan.
        </p>
      </Callout>

      <h2>Was du heute tun kannst</h2>
      <Callout type="ausprobieren">
        <p>
          <strong>Erstens:</strong> Stell im{' '}
          <Link to="/tools/nachmittagsplan">Nachmittagsplan</Link> eure Woche
          zusammen: wann die Schule aus ist, wie lange ihr ankommt, wann und wo
          die Hausaufgaben passieren.
        </p>
        <p>
          <strong>Zweitens:</strong> Häng die Ankommen-Karte dahin, wo dein
          Kind nach Hause kommt, zum Beispiel an die Garderobe.
        </p>
        <p>
          <strong>Drittens:</strong> Gib den Wochenplan an Oma, Opa oder den
          Hort weiter. Wenn der Abend danach eng wird, hilft die{' '}
          <Link to="/vorlagen/abendroutine">Abendroutine zum Ausdrucken</Link>.
        </p>
      </Callout>

      <h2>Quellen</h2>
      <ul>
        <li>
          Kinder- und Jugendärzte im Netz, Berufsverband der Kinder- und
          Jugendärzte (BVKJ):{' '}
          <a
            href="https://www.kinderaerzte-im-netz.de/news-archiv/meldung/hausaufgaben-nicht-gleich-nach-der-schule-beginnen/"
            target="_blank"
            rel="noopener"
          >
            Hausaufgaben: Nicht gleich nach der Schule beginnen
          </a>
          , Meldung vom 6.10.2006. Nach einem anstrengenden Schultag erst eine
          Pause; Eltern zeigen Wege auf, statt Lösungen vorzugeben.
        </li>
        <li>
          Bundeszentrale für gesundheitliche Aufklärung (BZgA):{' '}
          <a
            href="https://www.kinderaerzte-im-netz.de/media/53ec944633af614b730089b1/source/20110904164847_tut-kindern-gut-bzga.pdf"
            target="_blank"
            rel="noopener"
          >
            Tut Kindern gut! Ernährung, Bewegung und Entspannung
          </a>
          , Stand Mai 2010. Bewegung nach ruhigen, sitzenden Tätigkeiten, zum
          Beispiel nach der Schule; Ruhe nach der Schule, fünf Minuten bis eine
          halbe Stunde, je nach Kind; Termine nicht direkt hintereinander.
        </li>
        <li>
          Elternzitate aus dem Forum rund-ums-baby.de:{' '}
          <a
            href="https://www.rund-ums-baby.de/eltern-forum/1-schuljahr/sohn-1-klasse-mega-aggressiv-vorallem-wenn-es-um-hausaufgaben-oder-ler__2827791"
            target="_blank"
            rel="noopener"
          >
            Sohn 1. Klasse, vor allem bei Hausaufgaben
          </a>{' '}
          (Herbst 2024) und{' '}
          <a
            href="https://www.rund-ums-baby.de/eltern-forum/grundschule/mehrmals-taeglich-an-hausaufgaben-erinnern__2831532"
            target="_blank"
            rel="noopener"
          >
            Mehrmals täglich an Hausaufgaben erinnern
          </a>{' '}
          (13.01.2025).
        </li>
      </ul>

      <p className="source">
        Die Tipps ohne Quellenangabe sind unsere Vorschläge aus dem
        Familienalltag, keine Studienergebnisse. Wenn die Wut nach der Schule
        über Wochen sehr stark ist, ist die kinderärztliche Praxis eine gute
        Adresse.
      </p>
    </RatgeberArticle>
  );
}
