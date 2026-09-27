import { Link } from 'react-router-dom';
import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';

/*
 * Claims check (27 Sep 2026): every statement about sleep or screens carries
 * an opened source (kindergesundheit-info.de of the BIÖG, DGKJ, listed under
 * "Quellen"); parent quotes are verbatim from the checked forum threads.
 * Everything else is marked as our suggestion. No sleep durations, no
 * falling-asleep times and no bedtime norms per age: the article sends
 * parents to the Schlafens-Rechner and the Abendroutine article for those.
 */
export default function RatgeberAbendroutineZweiKinder() {
  return (
    <RatgeberArticle
      slug="abendroutine-zwei-kinder"
      title="Abendroutine mit zwei Kindern: wer braucht wann deine Hilfe?"
      description="Zwei Kinder, zwei Schlafenszeiten, ein Erwachsener? So legst du den Abend so, dass dich nicht beide gleichzeitig brauchen. Mit kostenlosem Abendplan."
      category="Abendroutine"
      readMinutes={6}
      publishedAt="2026-09-27"
      ogImage="/og-tool-abend-zwei-kinder.jpg"
      heroImage="/art/bioms/Sternenmeer_sea-of-stars.webp"
      heroAlt="Malerischer Sternenhimmel über einer Abendlandschaft, ruhiger Übergang in die Nacht."
      related={[
        {
          slug: 'abendroutine-grundschulkind',
          title: 'Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt',
        },
        {
          slug: 'zaehneputzen-ohne-streit',
          title: 'Zähneputzen ohne Streit: was bei 5- bis 8-Jährigen wirklich hilft',
        },
        {
          slug: 'sticker-chart-alternative',
          title: 'Warum Sticker-Charts oft nicht halten (und was stattdessen funktioniert)',
        },
      ]}
    >
      <p className="lead">
        Das Große will noch vorgelesen bekommen, das Kleine muss in die Wanne,
        und beide rufen gleichzeitig nach dir. Mit zwei Kindern ist der Abend
        oft kein Ablauf, sondern ein Hin und Her. Hier ist ein Weg, ihn so zu
        legen, dass dich nicht beide im selben Moment brauchen.
      </p>

      <h2>So klingt das in Elternforen</h2>
      <p>
        Wer nach dem Thema sucht, findet Sätze wie diese, von Eltern mit zwei
        Kindern:
      </p>
      <PullQuote>„Keine 5 Minuten am Tag gehören mal nur mir.“</PullQuote>
      <PullQuote>
        „Lege ich mich aber so mit ihm hin, braucht er teils 1,5 Stunden“
      </PullQuote>
      <p>
        Der zweite Satz kommt von Eltern eines Siebenjährigen. Seine kleine
        Schwester war da gerade sieben Wochen alt.
      </p>

      <h2>Nicht jeder Schritt braucht dich</h2>
      <p>
        Unser Vorschlag: Schau dir den Abend jedes Kindes Schritt für Schritt
        an und frag bei jedem Schritt nur eins: Braucht mein Kind mich dabei?
        Vorlesen braucht dich. Das Kleine in die Wanne heben auch. Den Pyjama
        anziehen oder das Kuscheltier aussuchen schafft ein Schulkind oft
        allein. Eng wird es nur dort, wo beide Kinder dich zur selben Zeit
        brauchen. Und genau diese Stellen kannst du vorher finden.
      </p>

      <h2>Drei Wege, wenn dich beide gleichzeitig brauchen</h2>
      <Steps>
        <StepCard n={1} title="Versetzt ins Bett">
          <p>
            Wenn die Kinder zu verschiedenen Zeiten ins Bett gehen, rutschen
            auch ihre Schritte auseinander. Welche Zeit zu welchem Kind passt,
            findest du mit dem{' '}
            <Link to="/tools/schlafens-rechner">Schlafens-Rechner</Link>.
          </p>
        </StepCard>
        <StepCard n={2} title="Zusammen statt nacheinander">
          <p>
            Manche Schritte gehen mit beiden auf einmal: zusammen{' '}
            <Link to="/ratgeber/zaehneputzen-ohne-streit">Zähne putzen</Link>,
            eine Geschichte für beide. Dann brauchst du für diesen Schritt nur
            einmal Zeit.
          </p>
        </StepCard>
        <StepCard n={3} title="Ein Schritt ohne dich">
          <p>
            Ein Kind hört im Bett ein Hörspiel, während du beim anderen bist.
            Das klappt am besten, wenn es sicher weiß, dass du zum Gute-Nacht-Sagen
            wiederkommst. So beschreibt es auch ein Elternteil im
            urbia-Forum.
          </p>
        </StepCard>
      </Steps>
      <p>
        Ruhige Rituale helfen beim Schlafen: Die Deutsche Gesellschaft für
        Kinder- und Jugendmedizin nennt als Beispiele ein Lied singen,
        beruhigende Musik hören oder eine Geschichte erzählen. Solche Rituale
        fördern regelmäßige Schlafenszeiten.
      </p>

      <h2>Warten ohne Bildschirm</h2>
      <p>
        Mit zwei Kindern liegt es nahe, dem wartenden Kind schnell ein Tablet
        zu geben. Das Elternportal des Bundesinstituts für Öffentliche
        Gesundheit schreibt: Bildschirme vor dem Schlafengehen scheinen sich
        ungünstig auf Schlafdauer und Schlafqualität von Kindern auszuwirken.
        In der letzten Stunde vor dem Schlafengehen sollten Fernsehen und
        Videospiele tabu sein. Unser Vorschlag: Das Warten bekommt einen
        eigenen Schritt, zum Beispiel ein Hörspiel oder ein Buch zum Anschauen.
      </p>

      <h2>Der Plan für euren Abend</h2>
      <p>
        Im kostenlosen Plan{' '}
        <Link to="/tools/abend-mit-zwei-kindern">Abend mit zwei Kindern</Link>{' '}
        legst du für jedes Kind die Schritte fest, wie lange sie dauern, wann
        das Licht ausgeht und welche Schritte dich brauchen. Die Kinder heißen
        im Plan Stern und Mond, Namen braucht es nicht. Wenn du abends allein
        bist, zeigt dir der Plan jeden Moment, in dem dich beide gleichzeitig
        brauchen. Gedruckt wird erst, wenn es zusammenpasst. Was du
        verschiebst, entscheidest du.
      </p>
      <p>
        Auf dem Blatt stehen oben der Abend für dich, beide Kinder
        nebeneinander, und unten zwei Karten zum Abschneiden, eine für jedes
        Kind, mit Bildern statt Text. Eine Einschlafzeit steht nirgends: Wann
        ein Kind einschläft, weiß kein Plan.
      </p>

      <h2>Was du nicht tun musst</h2>
      <p>
        Du musst die Kinder nicht gegeneinander antreten lassen. „Wer ist
        zuerst im Pyjama?“ klingt harmlos, macht aber aus dem Abend einen
        Wettlauf, bei dem einer verliert. Du brauchst auch keine Sticker und
        keine Punkte. Und du musst nicht jeden Schritt mit beiden machen. Jedes
        Kind hat seine eigene Karte und seinen eigenen Abend.
      </p>

      <Callout type="ausprobieren" label="Für dich">
        <p>
          Ein Abend, der schiefgeht, ist ein Abend, nicht der ganze Plan. Es
          reicht, wenn jedes Kind weiß, wann du zu ihm kommst.
        </p>
      </Callout>

      <h2>Was du heute tun kannst</h2>
      <Callout type="ausprobieren">
        <p>
          <strong>Erstens:</strong> Stell im Plan{' '}
          <Link to="/tools/abend-mit-zwei-kindern">Abend mit zwei Kindern</Link>{' '}
          beide Abende zusammen und markiere, welche Schritte dich brauchen.
        </p>
        <p>
          <strong>Zweitens:</strong> Häng jede Kinderkarte dahin, wo der Abend
          des Kindes spielt, zum Beispiel ans Waschbecken oder ans Bett.
        </p>
        <p>
          <strong>Drittens:</strong> Schick den Link an die Person, die mit dir
          die Kinder ins Bett bringt. Für ein einzelnes Kind reicht die{' '}
          <Link to="/vorlagen/abendroutine">Abendroutine zum Ausdrucken</Link>
          , mehr zum Ablauf steht im Artikel{' '}
          <Link to="/ratgeber/abendroutine-grundschulkind">
            Abendroutine für Kinder
          </Link>
          .
        </p>
      </Callout>

      <h2>Quellen</h2>
      <ul>
        <li>
          kindergesundheit-info.de, Elternportal des Bundesinstituts für
          Öffentliche Gesundheit (BIÖG):{' '}
          <a
            href="https://www.kindergesundheit-info.de/themen/schlafen/alltagstipps/schlafprobleme/schlafstoerer-vermeiden/"
            target="_blank"
            rel="noopener"
          >
            Wie Sie äußere „Schlafstörer“ vermeiden können
          </a>
          , Stand 18.11.2025. Bildschirme vor dem Schlafengehen und Schlaf;
          keine Bildschirmmedien in der letzten Stunde vor dem Schlafengehen;
          den Tag ruhig ausklingen lassen.
        </li>
        <li>
          Deutsche Gesellschaft für Kinder- und Jugendmedizin (DGKJ):{' '}
          <a
            href="https://www.dgkj.de/eltern/dgkj-elterninformationen/elterninfo-kind-schlaeft-nicht/"
            target="_blank"
            rel="noopener"
          >
            Elterninformation „Mein Kind schläft nicht“
          </a>{' '}
          (2019). Regelmäßige Schlafenszeiten; Rituale wie Lied singen,
          beruhigende Musik hören, Geschichte erzählen.
        </li>
        <li>
          Elternzitate aus den Foren urbia.de,{' '}
          <a
            href="https://www.urbia.de/forum/6-kids-schule/6069940-einschlafbegleitung-ohne-ende"
            target="_blank"
            rel="noopener"
          >
            Einschlafbegleitung, ohne Ende?
          </a>{' '}
          (2026), und rund-ums-baby.de,{' '}
          <a
            href="https://www.rund-ums-baby.de/eltern-forum/grundschule/selbststaendiges-einschlafen__2818527"
            target="_blank"
            rel="noopener"
          >
            Selbstständiges Einschlafen
          </a>{' '}
          (Juli 2024).
        </li>
      </ul>

      <p className="source">
        Die Tipps ohne Quellenangabe sind unsere Vorschläge aus dem
        Familienalltag, keine Studienergebnisse. Wenn das Einschlafen über
        Wochen sehr schwer ist, ist die kinderärztliche Praxis eine gute
        Adresse.
      </p>
    </RatgeberArticle>
  );
}
