import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';

/* Beispielplan für Weg 1: vier Abende mit 15-Minuten-Schritten vor der
 * Umstellung am Sonntag, 25. Oktober 2026. Ausgangspunkt: Abendessen
 * 18:00 Uhr, Licht aus 19:30 Uhr. */
const STEP_PLAN = [
  { day: 'Mittwoch, 21. Oktober', dinner: '18:15', lightsOut: '19:45' },
  { day: 'Donnerstag, 22. Oktober', dinner: '18:30', lightsOut: '20:00' },
  { day: 'Freitag, 23. Oktober', dinner: '18:45', lightsOut: '20:15' },
  { day: 'Samstag, 24. Oktober', dinner: '19:00', lightsOut: '20:30' },
  { day: 'Sonntag, 25. Oktober (neue Zeit)', dinner: '18:00', lightsOut: '19:30' },
];

export default function RatgeberZeitumstellungKinder() {
  return (
    <RatgeberArticle
      slug="zeitumstellung-kinder"
      title="Zeitumstellung im Herbst: So kommt dein Kind gut durch die Umstellung"
      description="Zeitumstellung mit Kindern im Herbst: zwei Wege durch den 25. Oktober, ein Plan in kleinen Schritten und was hilft, wenn dein Kind um 5 Uhr wach ist."
      category="Abendroutine"
      readMinutes={7}
      publishedAt="2026-09-26"
      ogImage="/og-ratgeber-abendroutine.jpg"
      heroImage="/art/bioms/Morgenwald_dawn-forest.webp"
      heroAlt="Malerischer Morgenwald im ersten Licht, ruhiger Tagesbeginn."
      related={[
        {
          slug: 'abendroutine-grundschulkind',
          title: 'Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt',
        },
        {
          slug: 'morgenroutine-grundschulkind',
          title: 'Die Morgenroutine, die wirklich klappt: was für 6- bis 8-Jährige funktioniert',
        },
        {
          slug: 'morgen-troedeln',
          title: 'Kind trödelt morgens? Warum das normal ist und was wirklich hilft',
        },
      ]}
    >
      <p className="lead">
        Sonntagmorgen, 5:04 Uhr. Im Flur tapst jemand, dann steht dein Kind
        an deinem Bett und will frühstücken. Nach seiner inneren Uhr ist es
        kurz nach sechs, also ganz normal. Nach der Uhr an der Wand ist es
        mitten in der Nacht. Willkommen im Herbst mit Zeitumstellung.
      </p>

      <p>
        Die gute Nachricht zuerst: eine Stunde ist kein großer Sprung, und
        viele Kinder stecken ihn gut weg. Trotzdem lohnt sich ein Plan. Was
        hier kommt: was sich für die innere Uhr deines Kindes ändert, zwei
        Wege durch die Umstellung, was am Sonntag und Montag hilft, was du
        tust, wenn dein Kind um 5 Uhr wach ist, und wann sich alles
        einpendelt.
      </p>

      <h2>Was sich im Herbst für die innere Uhr ändert</h2>

      <Callout type="forschung" label="Das Wichtigste in Kürze">
        <p>
          In der Nacht auf Sonntag, den 25. Oktober 2026, endet die
          Sommerzeit. Um 3 Uhr springt die Uhr zurück auf 2 Uhr. Ab dann gilt
          wieder die Normalzeit, die viele Winterzeit nennen.
        </p>
        <p>
          Die Uhr springt, der Körper nicht. Ein Kind, das bisher um 19 Uhr
          müde war, ist es jetzt schon um 18 Uhr. Ein Kind, das um 6 Uhr wach
          wurde, wird jetzt um 5 Uhr wach. So beschreibt es die ärztliche
          Leiterin des Schlaflabors der Grazer Universitäts-Kinderklinik.
        </p>
        <p>
          Nachstellen kann sich die innere Uhr vor allem über Tageslicht. Es
          ist ihr wichtigster Taktgeber.
        </p>
      </Callout>

      <p>
        Für den Schlaf ist der Herbst meist die sanftere Umstellung. Eine
        Übersichtsarbeit über 27 Studien mit Menschen von 6 bis 85 Jahren fand
        die deutlicheren Schlafprobleme nach der Umstellung im Frühjahr. Die
        Rückkehr zur Normalzeit gab eher etwas Schlaf zurück.
      </p>

      <p>
        Bei jüngeren Kindern ist es oft andersrum. Viele sind von Natur aus
        Frühaufsteher, und für sie ist der Herbst die schwierigere Umstellung.
        Sie waren schon früh wach, jetzt sind sie es nach der Uhr noch eine
        Stunde früher.
      </p>

      <h2>Zwei Wege durch die Umstellung</h2>

      <p>
        Du hast die Wahl, und beide Wege sind in Ordnung. Der erste braucht
        ein paar Abende Vorlauf. Der zweite braucht nur einen festen Ablauf
        und etwas Geduld.
      </p>

      <h3>Weg 1: Vorher in kleinen Schritten verschieben</h3>

      <p>
        Die Idee: du schiebst Essen und Schlafenszeit schon vor dem Sonntag
        ein Stück nach hinten. Dann ist der Sprung erledigt, bevor die Uhr
        springt. Die Grazer Kinderschlafmedizinerin rät zu Schritten von 10
        bis 15 Minuten und lässt sich dafür gerne mehrere Tage pro Schritt
        Zeit. Die Kinder- und Jugendärzte im Netz nennen für das Frühjahr, dort
        in die andere Richtung, etwa 15 Minuten pro Tag. Schon zwei, drei Tage
        Vorlauf können helfen.
      </p>

      <p>
        So kann das aussehen, wenn es bei euch bisher um 18 Uhr Abendessen
        gibt und um 19:30 Uhr Licht aus ist:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <caption className="text-left text-sm pb-2">
            Ein Beispiel mit vier 15-Minuten-Schritten. Die Zeiten sind
            Platzhalter, schieb sie auf euren Abend.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-4">
                Tag
              </th>
              <th scope="col" className="py-2 pr-4">
                Abendessen
              </th>
              <th scope="col" className="py-2">
                Licht aus
              </th>
            </tr>
          </thead>
          <tbody>
            {STEP_PLAN.map((row) => (
              <tr key={row.day}>
                <th scope="row" className="py-2 pr-4 align-top font-normal">
                  {row.day}
                </th>
                <td className="py-2 pr-4 align-top">{row.dinner} Uhr</td>
                <td className="py-2 align-top">{row.lightsOut} Uhr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        Am Sonntag steht wieder 19:30 Uhr auf der Uhr. Für den Körper deines
        Kindes ist das dieselbe Zeit wie 20:30 Uhr am Samstag. Es gibt also
        keinen Sprung mehr, nur die gewohnten Zahlen. Das Frühstück ziehst du
        mit, soweit es geht.
      </p>

      <p>
        Der Haken: an Schultagen bleibt der Wecker gleich. Jeder spätere
        Abend kostet dann ein Stück Schlaf. Wenn dein Kind davon müde wird,
        nimm kleinere Schritte, leg sie auf Freitag und Samstag oder nimm Weg
        2. Wenn bei euch gerade Herbstferien sind, ist das der leichteste
        Zeitpunkt. Das rät auch die Grazer Expertin: Wochenende oder Ferien
        nutzen.
      </p>

      <h3>Weg 2: Am Sonntag umstellen und den Ablauf festhalten</h3>

      <p>
        Stell am Samstagabend alle Uhren um, bevor ihr ins Bett geht. Ab
        Sonntag läuft alles nach der neuen Uhr: Frühstück, Mittagessen,
        Abendessen, Abendroutine, Licht aus. Die Mahlzeiten werden nicht
        vorgezogen, nur weil die innere Uhr drängelt.
      </p>

      <p>
        Die ersten Abende ist dein Kind früher müde. Du darfst es dann auch
        eine Viertelstunde früher hinlegen und die Zeit in den Tagen danach in
        kleinen Schritten zurückschieben. Das geht laut der Grazer Expertin
        auch nach der Umstellung noch gut, etwa 10 bis 15 Minuten alle zwei
        bis drei Tage.
      </p>

      <PullQuote>
        Wer ohnehin eine frühere Schlafenszeit wollte, bekommt sie im Herbst
        fast geschenkt.
      </PullQuote>

      <p>
        Das ist eine Variante von Weg 2, und sie steht auch im Grazer
        Interview: die frühere Müdigkeit einfach behalten. Wenn dein Kind bisher um 19
        Uhr ins Bett ging und jetzt um 18 Uhr müde ist, kann 18:30 Uhr die
        neue Zeit werden. Viele Kinder sind dann morgens ausgeruhter.
      </p>

      <h2>Was am Sonntag und Montag hilft</h2>

      <Steps>
        <StepCard n={1} title="Raus ins Tageslicht">
          <p>
            Licht ist der wichtigste Taktgeber der inneren Uhr. Also raus, am
            Sonntag und am Montag, auch wenn es grau ist. Abends ist es
            andersrum: vor dem Schlafen meidet ihr grelles Licht.
          </p>
        </StepCard>
        <StepCard n={2} title="Essen nach der neuen Uhr">
          <p>
            Frühstück, Mittag und Abendessen zur gewohnten Uhrzeit, gerechnet
            nach der neuen Uhr. Feste Essens- und Schlafzeiten helfen Kindern,
            sich an den neuen Rhythmus zu gewöhnen. Wenn um 5:30 Uhr der Magen
            knurrt, gibt es eine Kleinigkeit. Das Frühstück bleibt, wo es war.
          </p>
        </StepCard>
        <StepCard n={3} title="Derselbe Abendablauf, in derselben Reihenfolge">
          <p>
            Rituale geben Kindern Orientierung im Tag, gerade wenn die Uhr
            plötzlich anders tickt. Die Schritte bleiben also gleich, zum
            Beispiel Zähne, Pyjama, Vorlesen, Licht aus. Wenn ihr den Ablauf noch nicht
            aufgeschrieben habt, ist jetzt ein guter Moment. Unsere{' '}
            <a href="/vorlagen/abendroutine">
              Abendroutine Vorlage zum Ausdrucken
            </a>{' '}
            zeigt vier Schritte zum Abhaken. Wie ein ganzer Abend dazu aussehen
            kann, steht im Artikel{' '}
            <a href="/ratgeber/abendroutine-grundschulkind">
              Abendroutine für Kinder von 5 bis 8
            </a>
            .
          </p>
        </StepCard>
        <StepCard n={4} title="Bildschirme früher aus">
          <p>
            Die Kinder- und Jugendärzte im Netz raten, Handy, Tablet und
            Fernseher mindestens 30 Minuten vor der Abendroutine auszuschalten.
            Das blaue Licht kann das Schlafhormon Melatonin bremsen und das
            Einschlafen verzögern.
          </p>
        </StepCard>
      </Steps>

      <h2>Wenn dein Kind um 5 Uhr wach ist</h2>

      <p>
        Für den Körper deines Kindes ist 5 Uhr jetzt das, was vorher 6 Uhr
        war. Es ist also nicht zu früh ausgeschlafen, es ist pünktlich nach
        alter Zeit. Das hilft dir vielleicht nicht beim Aufstehen, aber es
        hilft beim Gelassenbleiben. Was du tun kannst:
      </p>

      <ul>
        <li>
          <strong>Dunkel und ruhig lassen.</strong> Licht aus oder ganz
          schwach. Die Kinder- und Jugendärzte raten zu einem dunklen, ruhigen
          und eher kühlen Schlafzimmer. Verdunkelungsvorhänge können helfen.
        </li>
        <li>
          <strong>Kein Bildschirm zum Überbrücken.</strong> Das Bett ist zum
          Schlafen da, nicht für Bildschirmzeit.
        </li>
        <li>
          <strong>Eine Ruhezeit ausmachen.</strong> Bis zu einer festen
          Uhrzeit bleibt dein Kind im Bett oder im Zimmer, mit Buch oder
          Kuscheltier. Sag das am Abend vorher, nicht um 5 Uhr.
        </li>
        <li>
          <strong>Den Tag nicht vorziehen.</strong> Frühstück zur gewohnten
          Zeit nach der neuen Uhr. Wer um 5:30 Uhr frühstückt, will um 11 Uhr
          Mittagessen, und der ganze Tag rutscht nach vorne.
        </li>
        <li>
          <strong>Abends Schritt für Schritt später werden.</strong> 10 bis 15
          Minuten, alle zwei bis drei Tage, bis ihr wieder bei eurer Zeit seid.
        </li>
      </ul>

      <h2>Wann es sich einpendelt</h2>

      <p>
        Kinder gewöhnen sich meist recht schnell an die neue Zeit, sagt die
        Grazer Kinderschlafmedizinerin. In der Regel dauert es ein bis zwei
        Wochen, je nach innerer Uhr auch mal länger. Bei vielen Kindern läuft
        die Umstellung fast unbemerkt. Die Kinder- und Jugendärzte im Netz
        nennen dieselbe Spanne, wenn der Ablauf konsequent bleibt.
      </p>

      <p>
        Heißt für dich: die ersten Tage nicht bewerten. Ein wackliger Montag
        sagt nichts über den Rest des Herbstes.
      </p>

      <Callout type="achtung" label="Wann ein zweiter Blick sich lohnt">
        <p>
          Wenn die Schlafprobleme nach zwei Wochen nicht besser werden, sprich
          mit deiner Kinderarztpraxis. Und gib Melatonin oder Schlafmittel
          nicht ohne ärztlichen Rat. Das betonen die Kinder- und Jugendärzte
          ausdrücklich.
        </p>
      </Callout>

      <h2>Was du diese Woche tun kannst</h2>

      <Callout type="ausprobieren">
        <p>
          <strong>Erstens:</strong> Entscheide dich für einen Weg. Für Weg 1
          startest du am Mittwoch, 21. Oktober. Für Weg 2 musst du nur am
          Samstagabend die Uhren umstellen.
        </p>
        <p>
          <strong>Zweitens:</strong> Häng den Abendablauf auf Kinderhöhe auf.
          Wenn die Schritte sichtbar sind, muss niemand raten, was als Nächstes
          kommt, auch nicht nach einer verschobenen Stunde. Ronki zeigt
          dieselben Schritte als Bilder, ein Zettel an der Tür tut es genauso.
        </p>
        <p>
          <strong>Drittens:</strong> Plan für Sonntag Zeit draußen ein. Ein
          Spaziergang am Tag der Umstellung ist der einfachste Schritt von
          allen.
        </p>
      </Callout>

      <h2>Quellen</h2>

      <ul>
        <li>
          Physikalisch-Technische Bundesanstalt (PTB):{' '}
          <a
            href="https://www.ptb.de/cms/ptb/fachabteilungen/abt4/fb-44/fragenzurzeit/fragenzurzeit03.html"
            target="_blank"
            rel="noopener"
          >
            Wann beginnt und endet die Sommerzeit in Deutschland?
          </a>
          , ptb.de. Die Sommerzeit endet am letzten Sonntag im Oktober, die
          Uhren werden um 3 Uhr auf 2 Uhr zurückgestellt.
        </li>
        <li>
          Medizinische Universität Graz:{' '}
          <a
            href="https://insights.medunigraz.at/news/detail/so-gelingt-die-zeitumstellung-kinderleicht"
            target="_blank"
            rel="noopener"
          >
            So gelingt die Zeitumstellung kinderleicht
          </a>
          , Interview mit Astrid Sonnleitner, ärztliche Leiterin des
          Interdisziplinären Schlaflabors der Universitätsklinik für Kinder-
          und Jugendheilkunde Graz, 28.10.2022. Eine Stunde früher müde und
          wach, Schritte von 10 bis 15 Minuten vor oder nach der Umstellung,
          Mahlzeiten mitziehen, Rituale als Anker, frühere Schlafenszeit
          behalten, meist ein bis zwei Wochen Anpassung.
        </li>
        <li>
          Berufsverband der Kinder- und Jugendärzte, Kinder- und Jugendärzte im
          Netz:{' '}
          <a
            href="https://www.kinderaerzte-im-netz.de/news-archiv/meldung/vorbereitung-auf-die-zeitumstellung/"
            target="_blank"
            rel="noopener"
          >
            Vorbereitung auf die Zeitumstellung
          </a>
          , 23.03.2026. Tageslicht als wichtigster Taktgeber, etwa 15 Minuten
          pro Tag, Bildschirme 30 Minuten vor der Abendroutine aus, dunkle und
          ruhige Schlafumgebung, ein bis zwei Wochen Anpassung, Melatonin nur
          nach ärztlicher Beratung.
        </li>
        <li>
          Bundesinstitut für Öffentliche Gesundheit (BIÖG, früher BZgA):{' '}
          <a
            href="https://www.kindergesundheit-info.de/infomaterial-service/nachrichten/artikel/artikel/umstellung-auf-sommerzeit-kinder-darauf-vorbereiten/"
            target="_blank"
            rel="noopener"
          >
            Umstellung auf Sommerzeit: Kinder darauf vorbereiten
          </a>
          , kindergesundheit-info.de, 20.03.2023. Jüngere Kinder sind oft
          Frühaufsteher und tun sich mit dem Herbst schwerer, Essens- und
          Schlafzeiten anpassen, tagsüber Licht, vor dem Schlafen kein grelles
          Licht, Verdunkelungsvorhänge.
        </li>
        <li>
          Romigi A. et al.:{' '}
          <a
            href="https://doi.org/10.1016/j.smrv.2025.102161"
            target="_blank"
            rel="noopener"
          >
            The effects of daylight saving time and clock time transitions on
            sleep and sleepiness: a systematic review
          </a>
          , Sleep Medicine Reviews 84, 2025. 27 Studien, Menschen von 6 bis 85
          Jahren. Deutlichere Schlafprobleme nach der Umstellung im Frühjahr,
          die Rückkehr zur Normalzeit gibt teilweise Schlaf zurück.
        </li>
      </ul>

      <p className="source">
        Die Beispielzeiten und Alltagstipps in diesem Artikel sind unsere
        Vorschläge, keine Studienergebnisse. Bei anhaltenden Schlafproblemen
        ist die kinderärztliche Praxis die richtige Adresse.
      </p>
    </RatgeberArticle>
  );
}
