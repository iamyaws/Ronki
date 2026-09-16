import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';
import { Timeline } from '../../components/RatgeberFigures';

export default function RatgeberMorgenroutineAdhs() {
  return (
    <RatgeberArticle
      slug="morgenroutine-adhs"
      title="Morgenroutine bei ADHS: was Kindern mit schwachen Exekutivfunktionen wirklich hilft"
      description="Morgenroutine ADHS: warum das Anfangen die eigentliche Arbeit ist, was bei schwachen Exekutivfunktionen hilft und wie ein Plan aus Bildern aussieht."
      category="Morgenroutine"
      readMinutes={9}
      publishedAt="2026-09-15"
      heroImage="/art/bioms/Sonnenglast_sun-highlands.webp"
      heroAlt="Malerische Sonnenhöhen im weiten Morgenlicht, ein Tag, der langsam anläuft."
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
          slug: 'abendroutine-grundschulkind',
          title: 'Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt',
        },
      ]}
    >
      <p className="lead">
        6:58 Uhr. Der Plan hängt an der Tür, vier Schritte, große Bilder, du
        hast ihn selbst gemalt. Dein Kind sitzt auf der Bettkante, eine Socke
        in der Hand, und schaut aus dem Fenster. Du sagst den ersten Schritt
        an. Zwei Minuten später: dieselbe Socke, derselbe Blick. Und du wirst
        lauter, obwohl du dir gestern Abend vorgenommen hattest, heute nicht
        laut zu werden.
      </p>

      <p>
        Was unter dem Stichwort Morgenroutine ADHS meistens fehlt, ist der
        eigentliche Grund. Es bricht nicht der Wille ein. Es bricht der Start
        ein. Ein ADHS Kind morgens in Gang zu bringen ist deshalb so zäh, weil
        das Anfangen selbst die Arbeit ist. Das Anziehen ist der leichte Teil.
      </p>

      <p>
        Dieser Artikel ist für Familien, bei denen das jeden Tag passiert. Für
        Kinder mit einer ADHS-Diagnose und für Kinder ohne Diagnose, deren
        Exekutivfunktionen einfach noch schwach sind. Er ersetzt weder die
        kinderärztliche Praxis noch eine Therapie. Er beschreibt nur, wie ein
        Morgen aussieht, der weniger von deiner Stimme abhängt.
      </p>

      <h2>Warum ein ADHS Kind morgens nicht einfach anfangen kann</h2>

      <p>
        Ein Morgen besteht nicht aus Anziehen und Frühstücken. Er besteht aus
        einer Kette von Startsignalen, die niemand ausspricht. Aufhören mit
        dem, was gerade im Kopf läuft. Sich erinnern, was als nächstes dran
        ist. Anfangen, obwohl es gerade nichts bringt. Dranbleiben, bis der
        Schritt fertig ist. Und das Ganze dann noch fünfmal.
      </p>

      <p>
        Bei vielen Kindern läuft diese Kette irgendwann von allein. Bei
        Kindern mit ADHS oder schwachen Exekutivfunktionen reißt sie. Nicht an
        einer Stelle, sondern an jeder. Von außen sieht das aus wie
        Verweigerung. Von innen ist es Stillstand.
      </p>

      <p>
        Deshalb hilft lauter werden nicht. Lauter werden liefert ein
        Startsignal von außen, und es wirkt genau den einen Schritt lang, den
        du gerade angesagt hast. Danach steht dein Kind wieder. Du bist dann
        nicht mehr der Rahmen, du bist der Motor. Und ein Motor muss jeden
        Morgen aufs Neue anspringen.
      </p>

      <PullQuote>
        Von außen sieht es aus wie Verweigerung. Von innen ist es Stillstand.
      </PullQuote>

      <h2>Exekutivfunktionen: Kinder leisten morgens mehr, als der Plan zeigt</h2>

      <p>
        Exekutivfunktionen sind die Steuerung im Kopf. Vier Teile davon
        entscheiden über euren Morgen. Alle vier lassen sich in einem Satz
        erklären.
      </p>

      <p>
        <strong>Anfangen.</strong> Der Wechsel von nichts zu etwas. Das ist der
        teuerste Schritt am ganzen Tag, und er kommt an einem Morgen sechsmal
        vor.
      </p>

      <p>
        <strong>Reihenfolge halten.</strong> Was kommt nach dem Klo? Wer diese
        Antwort jeden Morgen neu aus dem Kopf holen muss, verbraucht Kraft für
        etwas, das eigentlich gratis sein sollte.
      </p>

      <p>
        <strong>Arbeitsgedächtnis.</strong> Der Auftrag muss so lange im Kopf
        bleiben, bis er erledigt ist. Auf dem Weg ins Bad liegt ein Lego-Stein.
        Der Auftrag ist weg. Nicht ignoriert, weg.
      </p>

      <p>
        <strong>Zeitgefühl.</strong> Zehn Minuten fühlen sich an wie zwei. Ein
        Kind, das keine Zeit spürt, wird auch nicht schneller, wenn du ihm
        sagst, dass ihr in zehn Minuten los müsst.
      </p>

      <Callout type="forschung">
        <p>
          Eine Meta-Analyse aus 83 Studien verglich 3.734 Kinder und
          Jugendliche mit ADHS mit 2.969 ohne. In allen untersuchten Bereichen
          der Exekutivfunktionen gab es messbare Unterschiede. Die
          Effektstärken lagen im mittleren Bereich, zwischen 0,46 und 0,69, am
          deutlichsten bei Impulskontrolle und Daueraufmerksamkeit.
        </p>
        <p>
          Mittlere Effektstärken heißen: im Schnitt deutlich, aber nicht bei
          jedem Kind gleich. Dein Kind ist kein Mittelwert. Was bei euch
          morgens hakt, siehst du genauer als jede Studie.
        </p>
      </Callout>

      <h2>Was nicht hilft</h2>

      <p>
        Drei Reflexe probiert fast jede Familie zuerst, und alle drei machen
        den Morgen zuverlässig schwerer.
      </p>

      <p>
        <strong>Mehr ansagen.</strong> Jede Ansage ist ein Startsignal von
        außen. Je mehr davon kommen, desto weniger übt dein Kind das Anfangen
        selbst. Nach ein paar Wochen sagst du acht Sätze pro Schritt, und dein
        Kind wartet darauf, weil es gelernt hat, dass die Sätze kommen.
      </p>

      <p>
        <strong>Mehr belohnen.</strong> Ein Sticker für einen guten Morgen
        wirkt ein paar Tage. Dann braucht es zwei. Belohnungen zielen auf
        Motivation, aber hier klemmt nicht die Motivation, hier klemmt der
        Start. Dazu kommt: eine Belohnung liegt in der Zukunft, und Zukunft ist
        genau die Währung, die bei schwachem Zeitgefühl wenig wert ist.
      </p>

      <p>
        <strong>Mehr Schritte.</strong> Der gut gemeinte Plan mit zwölf
        Kästchen ist eine Überforderung im Posterformat. Zwölf Kästchen heißen
        zwölfmal anfangen.
      </p>

      <h2>Was hilft: die Reihenfolge aus dem Kopf holen</h2>

      <p>
        Ein Satz fasst den Rest zusammen. Was an der Wand hängt, muss im Kopf
        nicht gehalten werden. Alles Weitere sind Varianten davon.
      </p>

      <Steps>
        <StepCard n={1} title="Sechs Schritte, nicht mehr">
          <p>
            Fünf sind besser. Alles, was sich zusammenfassen lässt, wird
            zusammengefasst. Zähne putzen und Gesicht waschen sind ein Schritt,
            nicht zwei.
          </p>
        </StepCard>
        <StepCard n={2} title="Immer dieselbe Reihenfolge">
          <p>
            Jeden Tag gleich, auch am Wochenende, auch wenn ihr mehr Zeit habt.
            Eine feste Reihenfolge ist die einzige Form von Routine, die ohne
            Erinnern auskommt.
          </p>
        </StepCard>
        <StepCard n={3} title="Ein Schritt sichtbar, nicht sechs">
          <p>
            Eine Wäscheklammer oder Büroklammer am Rand des Blattes zeigt, was
            jetzt dran ist. Dein Kind schiebt sie selbst nach unten. Der Plan
            zeigt dann nicht mehr alles auf einmal, sondern eine Sache.
          </p>
        </StepCard>
        <StepCard n={4} title="Bilder vor Wörtern">
          <p>
            Ein großes Bild pro Schritt, dazu ein einziges Wort. Ein Bild wird
            erkannt, ein Satz muss gelesen werden. Lesen kostet Aufmerksamkeit,
            die gerade woanders gebraucht wird.
          </p>
        </StepCard>
        <StepCard n={5} title="Entscheidungen am Abend fällen">
          <p>
            Klamotten raus, Ranzen gepackt, Frühstück grob geklärt. Jede
            Entscheidung, die abends fällt, fällt morgens nicht mehr an. Und
            jede Entscheidung, die morgens anfällt, ist wieder ein Start.
          </p>
        </StepCard>
        <StepCard n={6} title="Zeit sichtbar machen, ohne Uhr">
          <p>
            Eine Sanduhr oder ein Timer mit farbiger Scheibe zeigt Zeit als
            Fläche, die kleiner wird. Das kann ein Kind sehen. Eine Ziffer auf
            dem Wecker kann es nur lesen.
          </p>
        </StepCard>
        <StepCard n={7} title="Ruhiger Start, wenig Input">
          <p>
            Kein Bildschirm vor der Schule, Radio aus, ein Licht statt fünf.
            Ein Kopf, der ohnehin Mühe mit dem Filtern hat, braucht morgens
            nicht noch mehr zum Filtern.
          </p>
        </StepCard>
      </Steps>

      <Callout type="forschung">
        <p>
          Sichtbare Ablaufpläne sind kein Bastel-Tipp. Eine systematische
          Übersichtsarbeit hat vier Studien zu visuellen Ablaufplänen bei
          Kindern mit ADHS zwischen 5 und 12 Jahren zusammengefasst. In allen
          vier gingen problematische Verhaltensweisen zurück, und Eltern wie
          Kinder waren zufriedener.
        </p>
        <p>
          Die Autorinnen schreiben selbst dazu, dass vier Studien wenig sind
          und die Designs zu unterschiedlich für harte Aussagen. Nimm es also
          als gut begründeten Hinweis, nicht als Beweis.
        </p>
      </Callout>

      <h2>So sieht der Plan aus</h2>

      <p>
        Das hier ist die Reihenfolge, die bei vielen Familien trägt. Sie hat
        bewusst keine Uhrzeiten. Uhrzeiten auf einem Plan erzeugen Druck, und
        Druck ist morgens schon genug im Raum.
      </p>

      <Timeline
        ariaLabel="Morgenplan mit sechs Schritten ohne Uhrzeiten, von Licht an bis Ranzen und Schuhe."
        caption="Sechs Schritte, feste Reihenfolge, keine Uhrzeiten. Die Klammer wandert mit."
        stops={[
          { time: '1', label: 'Licht', body: 'Rollo hoch, Wasser' },
          { time: '2', label: 'Klo', body: 'und Hände' },
          { time: '3', label: 'Anziehen', body: 'liegt von gestern bereit' },
          { time: '4', label: 'Frühstück', body: 'am Tisch, ohne Ansage' },
          { time: '5', label: 'Zähne', body: 'immer nach dem Essen' },
          { time: '6', label: 'Ranzen', body: 'steht an der Tür', highlight: true },
        ]}
      />

      <Callout type="ausprobieren" label="Zum Ausdrucken">
        <p>
          Genau diesen Plan gibt es bei uns als{' '}
          <a href="/vorlagen/adhs">
            Vorlage „Mein Morgen, ein Schritt nach dem anderen“ zum Ausdrucken,
            auch als PDF
          </a>
          . Ein großes Bild und ein Wort pro Schritt, ein Rand für die
          Wäscheklammer, keine Uhr, kein Punktestand.
        </p>
      </Callout>

      <h2>Der Abend davor gehört zum Morgen</h2>

      <p>
        Der größte Hebel für einen ruhigen Morgen liegt zwölf Stunden früher.
        Zwei Sachen reichen.
      </p>

      <p>
        <strong>Schlaf.</strong> Ein übermüdetes Kind hat weniger von genau der
        Steuerung, die morgens gebraucht wird. Wenn ihr an einer einzigen
        Stellschraube drehen wollt, dreht an der Uhrzeit, zu der das Licht
        ausgeht.
      </p>

      <p>
        <strong>Die Kiste an der Tür.</strong> Klamotten, Ranzen, Schuhe, alles
        an einem Ort, gepackt vom Kind, abends, mit dir daneben. Das spart
        morgens nicht nur Minuten, es spart Entscheidungen.
      </p>

      <h2>Lob den Schritt, nicht das Kind</h2>

      <p>
        Kinder mit ADHS hören am Tag sehr viel Korrektur und sehr wenig
        Bestätigung. Das Gesundheitsportal des IQWiG formuliert das für Eltern
        deutlich: Kinder mit ADHS bekommen oft zu wenig positive Reaktionen und
        brauchen echte Anerkennung, wenn ihnen etwas gelingt.
      </p>

      <p>
        Praktisch heißt das zwei Dinge. Erstens: sag genau, was zu tun ist.
        Nicht „mach dich fertig“, sondern „Schuhe an“. Zweitens: lobe den
        Schritt, nicht die Person. „Du hast dich allein angezogen“ ist
        brauchbar. „Du warst heute ein braves Kind“ ist es nicht, weil dein
        Kind daraus nicht ableiten kann, was es morgen wieder tun soll.
      </p>

      <p>
        Und an schlechten Tagen: ein Morgen, an dem drei von sechs Schritten
        allein liefen, ist kein gescheiterter Morgen. Er ist ein Morgen mit
        drei geschafften Schritten.
      </p>

      <h2>Wenn der Plan nach zwei Wochen aufhört zu wirken</h2>

      <p>
        Das kennt fast jede Familie. Die erste Woche mit dem neuen Plan läuft
        überraschend gut, in der dritten schaut das Kind gar nicht mehr hin.
        Das ist kein Rückfall und kein Beweis, dass es nicht funktioniert. Ein
        Plan, der zur Tapete geworden ist, wird schlicht nicht mehr gesehen.
      </p>

      <p>
        <strong>Ort wechseln.</strong> Häng ihn dorthin, wo der Morgen gerade
        wirklich hakt. Wenn das Anziehen die Bremse ist, gehört der Plan nicht
        in die Küche.
      </p>

      <p>
        <strong>Neu malen lassen.</strong> Dein Kind malt die Bilder selbst
        oder ihr macht Fotos von ihm bei jedem Schritt und klebt die auf. Ein
        Plan mit eigenen Fotos ist ein anderer Plan, auch wenn dieselben sechs
        Schritte drauf stehen.
      </p>

      <p>
        <strong>Die Klammer auffälliger machen.</strong> Eine bunte
        Wäscheklammer statt einer Büroklammer. Ein Magnet statt einem
        Klebepunkt. Was sich anfassen lässt, wird eher benutzt.
      </p>

      <p>
        Was du nicht tun musst: alles wegwerfen und ein neues System bauen. Die
        Reihenfolge bleibt, die habt ihr euch hart erarbeitet. Sichtbar wird
        nur die Verpackung wieder.
      </p>

      <h2>Wann ihr mit der kinderärztlichen Praxis sprecht</h2>

      <Callout type="achtung" label="Das gehört in fachliche Hände">
        <p>
          ADHS ist eine Diagnose, und sie wird von Fachleuten gestellt, nicht
          von einem Ratgeber und nicht von einem Online-Test. Wenn dein Kind
          über Monate in mehreren Lebensbereichen hängt, also zu Hause und in
          der Schule und mit Freunden, dann ist der Termin in der
          kinderärztlichen Praxis der nächste Schritt. Das ist kein Urteil über
          dich. Familiäre Umstände sind nach heutigem Stand nicht die Ursache
          einer ADHS.
        </p>
        <p>
          Die deutsche S3-Leitlinie sieht als Grundlage jeder Behandlung
          zunächst eine ausführliche Aufklärung von Kind und Bezugspersonen vor,
          die sogenannte Psychoedukation. Bei jüngeren Kindern sollen
          nichtmedikamentöse Wege wie ein Elterntraining ausgeschöpft sein,
          bevor über Medikamente gesprochen wird. Alles, was in diesem Artikel
          steht, ist Alltagshilfe daneben, kein Ersatz dafür.
        </p>
      </Callout>

      <h2>Wo Ronki passt</h2>

      <p>
        Ronki ist unser Drachen-Begleiter, noch in einer frühen Version. Er
        zeigt die Schritte als Bilder und immer nur den einen, der gerade dran
        ist. Das Kind hakt selbst ab, in seinem Tempo. Keine Push-Nachrichten,
        kein Punktestand, keine Serie, die reißt.
      </p>

      <p>
        Genau das ist der Teil, der uns für diese Kinder wichtig war: ein
        schlechter Tag kostet nichts. Am nächsten Morgen fängt der Plan wieder
        bei Schritt eins an, ohne Kommentar. Ronki ist keine Therapie und
        ersetzt keine. Ein laminiertes Blatt mit einer Wäscheklammer tut
        übrigens dasselbe.
      </p>

      <h2>Was du heute tun kannst</h2>

      <Callout type="ausprobieren">
        <p>
          <strong>Erstens:</strong> Streich Schritte. Schreib eure
          Morgenreihenfolge auf und kürz sie auf sechs. Was sich
          zusammenfassen lässt, wird zusammengefasst.
        </p>
        <p>
          <strong>Zweitens:</strong> Häng sie als Bilder auf Kinderhöhe auf,
          dort wo der Morgen anfängt. Klemm eine Wäscheklammer an den Rand und
          zeig deinem Kind einmal, wie sie wandert.
        </p>
        <p>
          <strong>Drittens:</strong> Sag morgen früh nur einen Satz, und zwar
          immer denselben: „Wo ist deine Klammer?“ Sonst nichts. Halt das eine
          Woche durch, auch wenn es langsamer wird. Langsamer und selbst ist
          der Weg. Schneller und angesagt ist eine Sackgasse, die du jeden
          Morgen neu gehen musst.
        </p>
      </Callout>

      <h2>Quellen</h2>

      <ul>
        <li>
          Willcutt E. G., Doyle A. E., Nigg J. T., Faraone S. V., Pennington B.
          F.:{' '}
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/15950006/"
            target="_blank"
            rel="noopener"
          >
            Validity of the executive function theory of attention-deficit/
            hyperactivity disorder: a meta-analytic review
          </a>
          , Biological Psychiatry 57(11), 2005, S. 1336 bis 1346. 83 Studien,
          3.734 Personen mit ADHS gegen 2.969 ohne, Effektstärken von 0,46 bis
          0,69.
        </li>
        <li>
          Thomas N., Karuppali S.:{' '}
          <a
            href="https://www.jkacap.org/journal/view.html?doi=10.5765%2Fjkacap.210021"
            target="_blank"
            rel="noopener"
          >
            The Efficacy of Visual Activity Schedule Intervention in Reducing
            Problem Behaviors in Children With ADHD Between the Age of 5 and 12
            Years: A Systematic Review
          </a>
          , Journal of the Korean Academy of Child and Adolescent Psychiatry
          33(1), 2022, S. 2 bis 15. Vier eingeschlossene Studien, Rückgang von
          Problemverhalten, von den Autorinnen selbst als begrenzt
          verallgemeinerbar eingeordnet.
        </li>
        <li>
          Institut für Qualität und Wirtschaftlichkeit im Gesundheitswesen
          (IQWiG):{' '}
          <a
            href="https://www.gesundheitsinformation.de/den-alltag-mit-adhs-bewaeltigen-infos-fuer-eltern.html"
            target="_blank"
            rel="noopener"
          >
            Den Alltag mit ADHS bewältigen: Infos für Eltern
          </a>
          , gesundheitsinformation.de, Stand 4. Mai 2022. Tag planen und
          strukturieren, konkrete statt vager Aufträge, zu wenig positive
          Rückmeldungen im Alltag, Elterntraining.
        </li>
        <li>
          Grosse K.-P., Skrodzki K.:{' '}
          <a
            href="https://www.ag-adhs.de/assets/infos/patientenleitlinie.pdf"
            target="_blank"
            rel="noopener"
          >
            Patientenleitlinie „Aufmerksamkeitsdefizit-/Hyperaktivitätsstörung
            (ADHS) im Kindes-, Jugend- und Erwachsenenalter“
          </a>
          , ADHS Deutschland e. V., neue AKZENTE Nr. 117, 3/2020. Laienfassung
          der S3-Leitlinie AWMF 028-045. Psychoedukation als Grundlage jeder
          Behandlung, bei jüngeren Kindern zuerst nichtmedikamentöse Wege wie
          Elterntraining.
        </li>
        <li>
          Zentrales adhs-netz, Universitätsklinikum Köln:{' '}
          <a
            href="https://www.adhs.info/fuer-eltern-und-angehoerige/adhs-was-ist-das/"
            target="_blank"
            rel="noopener"
          >
            ADHS: Was ist das?
          </a>
          , adhs.info. Kernsymptome, Feststellung durch Fachleute, familiäre
          Bedingungen sind nicht die ausschließliche Ursache der Störung.
        </li>
      </ul>

      <p className="source">
        Die Reihenfolgen, Formulierungen und Alltagsbeispiele in diesem Artikel
        sind Erfahrung, keine Studienergebnisse. ADHS ist eine Diagnose, die in
        die kinderärztliche oder kinder- und jugendpsychiatrische Praxis
        gehört. Dieser Artikel ersetzt weder eine Untersuchung noch eine
        Behandlung.
      </p>
    </RatgeberArticle>
  );
}
