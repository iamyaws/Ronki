import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';
import { Timeline } from '../../components/RatgeberFigures';

export default function RatgeberAbendroutineGrundschulkind() {
  return (
    <RatgeberArticle
      slug="abendroutine-grundschulkind"
      title="Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt"
      description="Abendroutine für Kinder von 5 bis 8: warum 45 Minuten reichen, welche Reihenfolge trägt und was bei einer Abendroutine fürs Kleinkind anders läuft."
      category="Abendroutine"
      readMinutes={10}
      publishedAt="2026-04-19"
      ogImage="/og-ratgeber-abendroutine.jpg"
      heroImage="/art/bioms/Sternenmeer_sea-of-stars.webp"
      heroAlt="Malerischer Sternenhimmel über einer Abendlandschaft, ruhiger Übergang in die Nacht."
      related={[
        {
          slug: 'morgenroutine-grundschulkind',
          title: 'Die Morgenroutine, die wirklich klappt: was für 6- bis 8-Jährige funktioniert',
        },
        {
          slug: 'morgen-troedeln',
          title: 'Kind trödelt morgens? Warum das normal ist und was wirklich hilft',
        },
        {
          slug: 'zaehneputzen-ohne-streit',
          title: 'Zähneputzen ohne Streit: was bei 5- bis 8-Jährigen wirklich hilft',
        },
      ]}
    >
      <p className="lead">
        Es ist 19:52 Uhr. Du wolltest um 20 Uhr Licht aus. Dein Kind steht im
        Wohnzimmer, hat noch den Pulli an, den es um 15 Uhr aus der Schule
        mitgebracht hat, und hält dem Plüschdrachen einen Monolog. Von
        Zähneputzen ist keine Rede. Wenn du diesen Abend kennst, bist du hier
        richtig. Es geht um eine Abendroutine für Kinder, die auch dann noch
        trägt, wenn alle müde sind.
      </p>

      <p>
        Der Morgen ist fast immer die Folge des Abends, nicht andersrum. Wenn
        die Abende ruhiger werden, fallen dir die Morgen oft halb von selbst in
        den Schoß. Nur muss eine Abendroutine Kinder genau dann durch vier bis
        sechs Schritte bringen, wenn im ganzen Haus niemand mehr Kraft hat. Sie
        ist deshalb kurz, sie ist jeden Tag gleich, und sie sieht bei einem
        Kleinkind ein bisschen anders aus als beim Schulkind.
        Beides steht weiter unten.
      </p>

      <p>
        Was hier kommt: warum der Abend mehr entscheidet als der Morgen, die
        fünf Fallen, die den Abend am zuverlässigsten ruinieren, unser Ablauf
        von 18 Uhr bis Licht aus, die Variante für Drei- bis Fünfjährige und
        das, was hilft, wenn dein Kind einfach nicht einschlafen kann.
      </p>

      <h2>Warum der Abend mehr entscheidet als der Morgen</h2>

      <Callout type="forschung">
        <p>
          Die amerikanische Schlafmedizin-Fachgesellschaft AASM empfiehlt für
          Kinder von 6 bis 12 Jahren 9 bis 12 Stunden Schlaf pro Nacht. Die
          deutsche Elterninformation kindergesundheit-info nennt für Schulkinder
          etwa elf Stunden und hält Abweichungen von bis zu zwei Stunden für
          normal.
        </p>
        <p>
          Rechne das einmal rückwärts. Wenn dein Kind um 6:30 Uhr raus muss und
          zehn Stunden schlafen soll, muss es gegen 20:30 Uhr schlafen. Nicht im
          Bett liegen. Schlafen. Zwischen Hinlegen und Einschlafen liegen bei
          vielen Kindern noch 15 bis 30 Minuten. Also Licht aus um 20 Uhr, und
          damit fängt der ganze Abend deutlich früher an, als die meisten
          denken.
        </p>
      </Callout>

      <p>
        Dahinter steckt simple Biologie. Melatonin, das Hormon, das müde macht,
        wird ab dem späten Nachmittag ausgeschüttet. Helles Licht bremst das.
        Und Kinderaugen sind dafür empfindlicher, als man denkt: in einer
        kleinen Studie aus Colorado senkte eine Stunde helles Licht vor dem
        Zubettgehen den Melatoninspiegel von Drei- bis Fünfjährigen um rund 88
        Prozent, und er blieb nach dem Ausschalten noch bis zu 50 Minuten
        unten.
      </p>

      <p>
        Gleichzeitig muss die Körpertemperatur leicht sinken, damit Einschlafen
        überhaupt geht. Ein aufgedrehtes, heißgelaufenes Kind schläft nicht ein,
        nur weil du das Licht ausmachst. Sein Körper ist noch nicht so weit.
        Genau daran scheitern die meisten Abendroutinen: sie ignorieren den
        Körper und hoffen, dass Willenskraft den Rest regelt. Tut sie nicht.
      </p>

      <h2>Die fünf Fallen, die jede Abendroutine für Kinder kippen</h2>

      <p>
        Bevor es zum Ablauf geht, die Sachen, die den Abend am sichersten
        ruinieren. Du erkennst wahrscheinlich mindestens drei wieder.
      </p>

      <Callout type="achtung" label="Abend-Killer">
        <ul>
          <li>
            <strong>Zu spät anfangen.</strong> Der häufigste Fehler. Um 19:30
            Uhr denkt man <em>ach, wir haben noch Zeit</em>, zwanzig Minuten
            später fängt die Hetzerei an. Der Puffer, den du früher am Abend
            einplanst, ist der einzige, den du am Ende wirklich hast.
          </li>
          <li>
            <strong>Bildschirm bis kurz vor dem Schlafen.</strong> Eine Folge
            der Lieblingsserie um 19:40 Uhr, und das Kind ist danach wacher als
            davor. Das ist der Inhalt und das Licht zusammen. Faustregel: eine
            Stunde vorher Schluss. Wenn das nicht geht, wenigstens nichts
            Lautes und nichts Grelles.
          </li>
          <li>
            <strong>Deckenlampen bis zum Schluss.</strong> Die meisten
            Wohnungen sind abends beleuchtet wie ein OP. Eine kleine warme
            Lampe im Kinderzimmer, Deckenlicht aus, und die biologische
            Rechnung stimmt schon besser. Das ist die billigste Stellschraube
            im ganzen Artikel.
          </li>
          <li>
            <strong>Zu viele Reize gleichzeitig.</strong> Geschwister, die noch
            toben. Das Lego-Chaos im Zimmer. Musik aus dem Nebenraum. Für ein
            Kind, das runterfahren soll, ist das zu viel Input auf einmal.
          </li>
          <li>
            <strong>Unklare Reihenfolge.</strong>{' '}
            <em>Erst Zähne oder erst Pyjama? Baden wir heute? Liest Papa vor
            oder Mama?</em> Jede dieser Fragen ist eine Entscheidung, und abends
            hat niemand mehr Geld auf dem Entscheidungskonto. Was jeden Tag
            anders ist, wird jeden Tag verhandelt.
          </li>
        </ul>
      </Callout>

      <h2>Der Ablauf, der bei uns trägt</h2>

      <p>
        45 Minuten reichen, wenn die Reihenfolge stimmt. Das ist die vielleicht
        wichtigste Zahl hier. Du brauchst keine Stunde. Du brauchst 45 Minuten
        in einer vernünftigen Abfolge, und davor einen Abend, der nicht schon
        gegen dich arbeitet. Deshalb fängt die Zeitleiste beim Abendessen an
        und nicht im Bad.
      </p>

      <Timeline
        direction="evening"
        ariaLabel="Abendroutine von 18:00 Uhr bis Licht aus um 19:50 Uhr mit sieben Stationen."
        caption="Die Zeiten sind Platzhalter. Schieb sie auf euren Abend, die Reihenfolge bleibt."
        stops={[
          { time: '18:00', label: 'Abendessen', body: 'mind. 1,5 h vor Licht aus' },
          { time: '18:45', label: 'Licht runter', body: 'Deckenlampe aus' },
          { time: '19:05', label: 'Toben, dann leiser', body: 'kurz entladen' },
          { time: '19:15', label: 'Bad', body: 'Zähne, waschen' },
          { time: '19:30', label: 'Pyjama', body: 'direkt ins Bett' },
          { time: '19:35', label: 'Vorlesen', body: 'der Anker' },
          { time: '19:50', label: 'Licht aus', body: 'gute Nacht', highlight: true },
        ]}
      />

      <Steps>
        <StepCard n={1} title="18:00 Uhr: Abendessen">
          <p>
            Volle Mägen schlafen schlecht, zuckerreiche noch schlechter. Wenn
            das Essen anderthalb Stunden vor dem Licht-aus durch ist, hat der
            Körper Zeit.
          </p>
        </StepCard>
        <StepCard n={2} title="18:45 Uhr: Licht runter">
          <p>
            Deckenlampen aus, kleine warme Lampen an. Kein Ansagen, kein
            Kommentar. Die Wohnung wird einfach leiser und dunkler, und das
            Kind merkt den Wechsel, ohne dass ihr darüber reden müsst.
          </p>
        </StepCard>
        <StepCard n={3} title="19:05 Uhr: kurz toben, dann leiser werden">
          <p>
            Fünf Minuten Kissenschlacht oder einmal durch den Flur, dann
            bewusst ausklingen. Klingt widersinnig, ist aber der Schritt, den
            ich am wenigsten missen möchte.
          </p>
        </StepCard>
        <StepCard n={4} title="19:15 Uhr: Bad">
          <p>
            Zähne putzen, Gesicht waschen, fertig. Kurz und in fester
            Reihenfolge. Wenn das Zähneputzen bei euch der eigentliche Kampf
            ist, steht dazu unten ein eigener Artikel.
          </p>
        </StepCard>
        <StepCard n={5} title="19:30 Uhr: Pyjama an, ins Bett">
          <p>
            Kein Zwischenstopp am Spielzeugregal, kein kurzer Abstecher ins
            Wohnzimmer. Direkt vom Bad ins Bett.
          </p>
        </StepCard>
        <StepCard n={6} title="19:35 Uhr: Vorlesen">
          <p>Gedämpftes Licht, leise Stimme, feste Länge.</p>
        </StepCard>
        <StepCard n={7} title="19:50 Uhr: Licht aus">
          <p>
            Keine Verhandlung über noch eine Seite, kein schnelles Nochmal-nach-unten.
            Der Tag ist vorbei.
          </p>
        </StepCard>
      </Steps>

      <Callout type="ausprobieren" label="Zum Ausdrucken">
        <p>
          Diese Reihenfolge gibt es bei uns als{' '}
          <a href="/vorlagen/abendroutine">
            Abendroutine als Vorlage zum Ausdrucken, auch als PDF
          </a>
          . Vier Bilder, dein Kind malt den Kreis aus, wenn ein Schritt
          geschafft ist. Badezimmertür oder Kinderzimmerwand, fertig.
        </p>
      </Callout>

      <h2>Warum körperlich runterkommen vor das Bad gehört</h2>

      <p>
        Das klingt nach einem Detail, ist für mich aber die wichtigste
        Einsicht der letzten zwei Jahre. Kinder, die aufgedreht ins Bad gehen,
        kommen wach raus. Das Wasser, das helle Licht, die elektrische
        Zahnbürste: das ist alles aktivierend, nicht beruhigend. Wenn dein Kind
        kurz vorher noch durch die Wohnung rennt, verschiebt die
        Bad-Viertelstunde die Aufgedrehtheit nur nach hinten.
      </p>

      <PullQuote>
        Kinder, die aufgedreht ins Bad gehen, kommen wach raus.
      </PullQuote>

      <p>
        Die Lösung ist, die körperliche Entladung bewusst vorzuziehen. Fünf
        Minuten toben, langsam ausklingen lassen, dann Bad. Das Kind kommt
        ruhiger rein und verlässt es auch so. Der Effekt ist größer, als es
        sich anhört.
      </p>

      <h2>Vorlesen ist der Anker, nicht die Belohnung</h2>

      <p>
        Vorlesen steht nicht zur Debatte, auch wenn dein Kind längst selbst
        liest. Es geht nicht in erster Linie um die Geschichte. Es geht darum,
        dass eine vertraute Stimme im gedämpften Licht ruhig und gleichmäßig
        wird. Das ist der Teil, den das Gehirn mit Schlaf verknüpft.
      </p>

      <p>
        Bei Louis lesen wir 10 bis 15 Minuten. Manchmal ist er nach fünf
        Minuten raus, manchmal fragt er nach mehr. Der Rahmen bleibt fest. Und
        wenn du Vorlesen als Belohnung einsetzt, die es bei schlechtem Benehmen
        nicht gibt, nimmst du dem Abend genau den Teil, der ihn zusammenhält.
        Streich lieber etwas anderes.
      </p>

      <h2>Abendroutine Kleinkind: was bei 3- bis 5-Jährigen anders läuft</h2>

      <p>
        Der Ablauf oben ist für Schulkinder gebaut. Bei einem Kleinkind
        stimmen die Zutaten, aber nicht die Maße. Drei Unterschiede zählen.
      </p>

      <p>
        <strong>Mehr Schlaf, also früher anfangen.</strong> Drei- bis
        Vierjährige brauchen laut kindergesundheit-info oft noch elf bis zwölf
        Stunden. Wenn ein Kleinkind um 7 Uhr wach wird, heißt das Licht aus
        gegen 19 Uhr, nicht gegen 20 Uhr. Die ganze Leiste rutscht eine Stunde
        nach vorne.
      </p>

      <p>
        <strong>Weniger Schritte, mehr Bild.</strong> Vier Schritte sind bei
        einem Kleinkind das Maximum: Zähne, waschen, Pyjama, Licht aus. Und sie
        brauchen ein Bild, keinen Text. Ein Dreijähriger liest keine Liste, er
        erkennt einen Zahnbürsten-Kringel.
      </p>

      <p>
        <strong>Gleiche Worte statt neuer Sätze.</strong> Schulkinder
        vertragen Variation, Kleinkinder brauchen Wiederholung. Derselbe Satz
        zum Übergang, jeden Abend. <em>Die Lampe geht aus, dann kommt das
        Buch.</em> Das ist kein Mangel an Fantasie, das ist der Anker.
      </p>

      <Callout type="wichtig">
        <p>
          Wenn Kleinkind und Schulkind im selben Zimmer schlafen, sortiere nach
          Schlafbedarf, nicht nach Bequemlichkeit. Das Kleine startet früher,
          das Große darf danach noch 20 Minuten leise im Wohnzimmer lesen. Ein
          gemeinsamer Zeitpunkt für beide Alter macht immer eins von beiden
          kaputt: das Kleine ist übermüdet, oder das Große liegt wach und
          langweilt sich.
        </p>
      </Callout>

      <h2>Wenn dein Kind nicht einschlafen kann</h2>

      <p>
        Manchmal stimmt alles, und das Kind liegt trotzdem wach. Die üblichen
        Verdächtigen, in der Reihenfolge, in der ich sie prüfen würde:
      </p>

      <ul>
        <li>
          <strong>Übermüdung.</strong> Klingt widersinnig, ist aber der
          häufigste Grund. Ein Kind, das längst hätte schlafen sollen, wirkt
          aufgedreht statt müde. Abhilfe: früher anfangen, nicht später.
        </li>
        <li>
          <strong>Stress und Sorgen.</strong> Schule, Streit mit Freunden, ein
          Film, der nachhallt. Wenn dein Kind reden will, gib fünf Minuten.
          Nicht 45. Fünf Minuten, ehrlich zugehört, wirken mehr als eine Stunde
          Diskussion.
        </li>
        <li>
          <strong>Licht.</strong> Straßenlaterne, Bildschirm im Nebenraum,
          Nachttischlampe. Manche Kinder sind erstaunlich lichtempfindlich.
          Verdunkelungsrollo probieren.
        </li>
        <li>
          <strong>Essen zu spät.</strong> Der Snack um 19:30 Uhr kann den
          ganzen Plan kippen.
        </li>
        <li>
          <strong>Zu wenig Bewegung tagsüber.</strong> Wenn das Kind
          hauptsächlich gesessen hat, fehlt dem Körper die physische Müdigkeit.
        </li>
      </ul>

      <p>
        Wenn dein Kind morgens außerdem kaum aus dem Bett kommt, lohnt sich der
        Blick auf die andere Tageshälfte. Dazu haben wir zwei Artikel: die{' '}
        <a href="/ratgeber/morgenroutine-grundschulkind">
          Morgenroutine für Grundschulkinder
        </a>{' '}
        und einen dazu, warum{' '}
        <a href="/ratgeber/morgen-troedeln">
          dein Kind morgens trödelt und was dagegen hilft
        </a>
        .
      </p>

      <Callout type="achtung" label="Wann ein zweiter Blick sich lohnt">
        <p>
          Wenn dein Kind über Wochen hinweg massive Einschlafprobleme hat,
          nicht nur hier und da, gehört das in die kinderärztliche Praxis. Es
          gibt echte Schlafstörungen auch in diesem Alter, und sie lassen sich
          gut einordnen. Das ist kein Elternversagen, das ist eine andere Liga.
        </p>
      </Callout>

      <h2>Wenn es mal nicht klappt</h2>

      <p>
        Die Abendroutine wird nicht jeden Tag klappen. Louis hat Abende, an
        denen er um 19:30 Uhr noch komplett aufgedreht ist, weil der Tag ihn
        überrollt hat. An solchen Abenden ist 20:30 Uhr in Ordnung. Der Schaden
        kommt nicht vom einzelnen schlechten Abend, er kommt vom chronisch
        schlechten Abend.
      </p>

      <p>
        Perfektionismus hilft hier nicht, er ist Teil des Problems. Die Eltern,
        die abends am meisten kämpfen, sind oft die, die sich selbst daran
        messen, ob das Kind um Punkt 20 Uhr die Augen zumacht. Dieser Druck
        überträgt sich und macht den Abend schwerer, nicht leichter.
      </p>

      <h2>Wo Ronki abends passt</h2>

      <p>
        Ronki ist unser Drachen-Begleiter, noch in einer frühen Version. Er
        zeigt die Schritte als Bilder, das Kind hakt selbst ab. Keine Push, kein
        Punktestand, kein Vergleich mit gestern.
      </p>

      <p>
        Was er abends dazu tut, ist ein einziger ruhiger Beat zwischen Zähnen
        und Licht-aus: einmal nachfragen, wie der Tag war. Drei Worte reichen,
        manchmal nur ein Gesicht. Wenn das bei euch irgendwann ohne Drachen
        läuft, war er gut. Ein laminierter Zettel an der Badezimmertür tut es
        übrigens auch.
      </p>

      <h2>Was du heute tun kannst</h2>

      <Callout type="ausprobieren">
        <p>
          <strong>Erstens:</strong> Rechne rückwärts. Aufstehzeit minus zehn
          Stunden Schlaf minus 20 Minuten Einschlafen. Das ist eure Licht-aus-Zeit.
          Wahrscheinlich früher, als du gedacht hast.
        </p>
        <p>
          <strong>Zweitens:</strong> Schreib die Reihenfolge auf einen Zettel
          und häng sie auf Kinderhöhe auf. Die meisten Abendroutinen existieren
          nur in einem einzigen Kopf, nämlich deinem. Sobald die Sequenz
          sichtbar ist, muss dein Kind nicht mehr raten, und du musst nicht mehr
          ansagen.
        </p>
        <p>
          <strong>Drittens:</strong> Mach heute um 18:45 Uhr die Deckenlampe
          aus. Nur das. Eine Abendroutine für Kinder beginnt beim Licht, nicht
          beim Zähneputzen, und das ist der Schritt, der dich null Minuten
          kostet.
        </p>
      </Callout>

      <p>
        Wenn es nach einer Woche nicht klappt, probier noch eine. Eine
        Abendroutine ist ein Muskel, kein Schalter. Das gilt für ein
        Kleinkind genauso wie für ein Schulkind. Und irgendwann guckst du um 19:48
        Uhr auf die Uhr, und dein Kind liegt schon im Bett und wartet aufs
        Vorlesen.
      </p>

      <h2>Quellen</h2>

      <ul>
        <li>
          Paruthi S. et al., American Academy of Sleep Medicine:{' '}
          <a
            href="https://aasm.org/recharge-with-sleep-pediatric-sleep-recommendations-promoting-optimal-health/"
            target="_blank"
            rel="noopener"
          >
            Recommended Amount of Sleep for Pediatric Populations
          </a>
          , Journal of Clinical Sleep Medicine, 2016. 9 bis 12 Stunden für 6-
          bis 12-Jährige.
        </li>
        <li>
          Bundesinstitut für Öffentliche Gesundheit (BIÖG, früher BZgA):{' '}
          <a
            href="https://www.kindergesundheit-info.de/themen/schlafen/1-6-jahre/schlafbedarf/"
            target="_blank"
            rel="noopener"
          >
            Von Schlafbedarf und Schlafdauer
          </a>
          , kindergesundheit-info.de, Stand 2025. Elf bis zwölf Stunden mit
          drei, vier Jahren, etwa elf Stunden bei Schulkindern, Abweichungen von
          bis zu zwei Stunden normal.
        </li>
        <li>
          Akacem L. D., Wright K. P., LeBourgeois M. K.:{' '}
          <a
            href="https://physoc.onlinelibrary.wiley.com/doi/10.14814/phy2.13617"
            target="_blank"
            rel="noopener"
          >
            Sensitivity of the circadian system to evening bright light in
            preschool-age children
          </a>
          , Physiological Reports 6(5), 2018. Melatonin-Unterdrückung von rund
          88 Prozent nach einer Stunde hellem Licht vor dem Zubettgehen.
        </li>
        <li>
          Hale L., Guan S.: Screen time and sleep among school-aged children and
          adolescents: a systematic literature review, Sleep Medicine Reviews
          21, 2015, S. 50 bis 58. Übersicht über 67 Studien, Bildschirmnutzung
          hängt mit kürzerem und schlechterem Schlaf zusammen.
        </li>
      </ul>

      <p className="source">
        Die Zeiten, Reihenfolgen und Beispiele in diesem Artikel sind unsere
        Erfahrung aus dem eigenen Alltag, keine Studienergebnisse. Bei
        anhaltenden Schlafproblemen ist die kinderärztliche Praxis die richtige
        Adresse.
      </p>
    </RatgeberArticle>
  );
}
