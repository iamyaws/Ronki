import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';
import { DarkPatternMockup } from '../../components/RatgeberFigures';

export default function RatgeberDarkPatternsKinderApps() {
  return (
    <RatgeberArticle
      slug="dark-patterns-kinder-apps"
      title="Dark Patterns in Kinder-Apps: Was Eltern 2026 wissen sollten"
      description="Push-Benachrichtigungen, Streaks, Loot-Boxes, Endless-Scroll: wie Kinder-Apps designed sind, dich und dein Kind zurückzuholen. Und woran du eine gute App erkennst."
      category="Digitale Mündigkeit"
      readMinutes={12}
      publishedAt="2026-04-19"
      ogImage="/og-ratgeber-dark-patterns.jpg"
      heroImage="/art/bioms/Wolkengrat_mountain-ridge.webp"
      heroAlt="Malerischer Bergkamm zwischen Wolken, schwieriges Terrain, das Orientierung braucht."
      related={[
        {
          slug: 'sticker-chart-alternative',
          title: 'Warum Sticker-Charts oft nicht halten (und was stattdessen funktioniert)',
        },
        {
          slug: 'morgen-troedeln',
          title: 'Kind trödelt morgens? Warum das normal ist und was wirklich hilft',
        },
        {
          slug: 'einschulung-selbststaendigkeit',
          title: 'Vor der Einschulung: Selbstständigkeit ohne Druck',
        },
      ]}
    >
      <p className="lead">
        Ich habe über ein Jahrzehnt in der Tech-Branche gearbeitet. Ich weiß,
        wie die Würste gemacht werden. Und die Würste für Kinder sind nicht
        besser als die für Erwachsene. Sie sind schlimmer.
      </p>

      <p>
        Das ist kein Marketing-Pitch für Ronki. Das ist der Grund, warum ich
        Ronki überhaupt baue. Dieser Artikel ist die lange Erklärung, warum
        bestimmte App-Mechaniken bei Grundschulkindern besonders hart
        einschlagen, und woran du eine Kinder-App erkennst, der du vertrauen
        kannst.
      </p>

      <PullQuote>
        Die Würste für Kinder sind nicht besser als die für Erwachsene. Sie
        sind schlimmer.
      </PullQuote>

      <p>
        Ich werde ein paar Apps beim Namen nennen, wenn es sich nicht
        vermeiden lässt. Das ist keine Klage, ich habe selbst Duolingo auf dem
        Handy, und Louis spielt Roblox auf dem Tablet seiner Cousine.
        Vollständige Reinheit gibt's nicht. Aber Aufmerksamkeit hilft.
      </p>

      <h2>Was Dark Patterns eigentlich sind</h2>

      <p>
        Der Begriff kommt vom britischen UX-Designer Harry Brignull, der ihn
        2010 geprägt hat. Dark Pattern heißt: ein Interface, das so gebaut ist,
        dass es dich zu etwas bringt, was du eigentlich nicht wolltest. Nicht
        weil du dumm bist. Sondern weil ausgenutzt wird, wie Aufmerksamkeit,
        Gewohnheit und Emotion im Menschen funktionieren.
      </p>

      <p>
        Die EU hat das inzwischen im Digital Services Act festgehalten, die
        US-Behörde FTC ebenfalls in einem großen Report 2022. Dort gibt es eine
        Liste mit Mustern, die als manipulativ gelten. Versteckter Opt-out,
        Schein-Dringlichkeit, Schuld-Framing, Sunk-Cost-Fallen. Das ist
        inzwischen dokumentiert, und zwar reichlich.
      </p>

      <p>
        Für Kinder gibt es dabei einen wichtigen Zusatzpunkt. Das
        entwicklungspsychologische Profil von fünf- bis achtjährigen Kindern
        macht sie für genau diese Muster besonders empfänglich. Der
        präfrontale Kortex, also die Gehirnregion, die Impulse abwägt und
        Selbstregulation ermöglicht, ist bei Grundschulkindern noch weit vom
        Endzustand entfernt. Das bedeutet: Reize wirken stärker, die
        Abgrenzung fällt schwerer. Das ist nicht Schwäche. Das ist Hardware.
      </p>

      <p>
        Und die Leute, die Kinder-Apps designen, wissen das. Ich weiß es, weil
        ich mit vielen dieser Leute gearbeitet habe. Das macht sie nicht zu
        Monstern. Es macht ihre Produkte trotzdem zu Produkten, die auf der
        Hardware deines Kindes sehr effektiv operieren.
      </p>

      <h2>Die acht Muster, die du kennen solltest</h2>

      <p>
        Nicht vollständig. Aber das sind die, die ich am häufigsten in
        Kinder-Apps sehe, und die am meisten Wirkung haben.
      </p>

      <DarkPatternMockup />

      <Steps>
        <StepCard n={1} title="Streaks und Verlust-Angst">
          <p>
            Duolingo ist das offensichtliche Beispiel, aber das Muster ist überall.
            Die App zählt mit, wie viele Tage in Folge dein Kind benutzt hat. Nach
            sieben Tagen kommt eine kleine Feier, nach dreißig eine größere, und
            vor allem: nach einem verpassten Tag wird der Zähler auf null gesetzt.
          </p>
          <p>
            Das ist kein Motivationsmechanismus, sondern ein Verlust-Aversions-
            Mechanismus. Forschung aus der Verhaltensökonomie (Kahneman und
            Tversky) zeigt seit Jahrzehnten: Menschen fühlen Verluste ungefähr
            doppelt so stark wie Gewinne. Bei Kindern ist das noch stärker, weil
            die Fähigkeit, einen Verlust zu relativieren (<em>ist halt nur ein
            Zähler</em>), noch nicht ausgebildet ist. Ein gerissener Streak fühlt
            sich für ein Siebenjähriges an wie echtes Versagen.
          </p>
          <p>
            Was das erzeugt, ist nicht Lernen. Es ist tägliche Pflicht mit
            Angst-Komponente. Ich habe Eltern erlebt, die im Urlaub den Zugang
            zur Duolingo-App für ihr Kind organisiert haben, damit der Streak
            nicht reißt. An dem Punkt ist nicht mehr klar, wer hier wen benutzt.
          </p>
        </StepCard>

        <StepCard n={2} title="Push-Benachrichtigungen mit FOMO-Framing">
          <p>
            <em>Dein Drache wartet auf dich!</em> <em>Deine Freunde haben heute
            schon geübt!</em> <em>Du verpasst noch 3 Aufgaben!</em> Push-
            Benachrichtigungen sind an sich nicht böse. Eine Terminerinnerung ist
            sinnvoll. Eine Benachrichtigung, die einen künstlichen Mangel oder
            eine künstliche Dringlichkeit erzeugt, ist es nicht.
          </p>
          <p>
            Kinder können den Unterschied zwischen einer echten Information und
            einem rhetorisch aufgeladenen Aufmerksamkeits-Trigger kaum ziehen.
            Wenn ihr Handy vibriert und da steht <em>dein Drache ist traurig</em>,
            dann ist das für sie nicht PR-Sprech. Das ist ein trauriger Drache.
            Und sie tun, was man bei traurigen Wesen eben tut: sie kümmern sich.
          </p>
          <p>
            Die Frage, die du dir bei jeder Kinder-App stellen kannst: <em>Warum
            schickt diese App überhaupt Benachrichtigungen? Wer profitiert von der
            Rückkehr meines Kindes?</em> Wenn die Antwort ein Retention-Dashboard
            in einem Büro in San Francisco ist, dann hast du deine Antwort.
          </p>
        </StepCard>

        <StepCard n={3} title="Variable Belohnungen (Loot-Box-Logik)">
          <p>
            Dein Kind öffnet eine Kiste. Manchmal ist ein kleines Ding drin,
            manchmal ein großes, manchmal ein sehr großes. Du weißt nie genau, was
            kommt. Das ist eine variable Belohnung. Skinners Forschung in den
            1950ern hat gezeigt, wie stark Variabilität im Belohnungs-Schema
            Verhalten verstärkt. Heutige Neurowissenschaft beschreibt, dass
            das Dopamin-System auf unvorhersehbare Belohnungen besonders
            reagiert, bei Kindern wie bei Erwachsenen, oft sogar stärker.
          </p>
          <p>
            Bei Erwachsenen funktioniert das auch, aber Erwachsene haben eine
            Chance, die Mechanik zu durchschauen und ihr zu widerstehen. Bei einem
            Sechsjährigen ist die Chance deutlich kleiner. Die Dopamin-Antwort auf
            eine zufällige Belohnung ist stärker als auf eine vorhersehbare, und
            das System lernt sehr schnell: wieder öffnen, wieder öffnen, wieder.
          </p>
          <p>
            Die norwegische Verbraucherschutzbehörde hat 2022 einen Report
            veröffentlicht (<em>Insert Coin</em>), der das für Spiele ausbreitet,
            die auch Kinder erreichen. Er ist online und auf Englisch. Wenn du 30
            Minuten hast, lies ihn. Er verändert, wie du auf Kinder-Spiele
            schaust.
          </p>
        </StepCard>

        <StepCard n={4} title="Soziale Vergleichs-Anzeigen">
          <p>
            <em>Dein Freund hat heute schon 5 Aufgaben erledigt.</em> Bestenlisten,
            Klassenrankings, Freundschafts-Anzeigen. Klingt harmlos, ist aber
            gezielt. Sozialer Vergleich ist für Kinder in der Grundschulphase
            extrem wirksam, weil sie gerade die Fähigkeit entwickeln, sich in der
            Gruppe zu verorten. Jeder Wettkampf-Impuls wird verstärkt.
          </p>
          <p>
            Das Problem ist nicht, dass Kinder nicht mit Wettkampf umgehen können.
            Das Problem ist, dass eine App das künstlich verstärkt und dabei den
            Zweck der App verdrängt. Wenn dein Kind Mathe übt, soll es
            idealerweise um Mathe gehen. Wenn es um <em>Felix hat schon drei mehr
            als ich</em> geht, hast du eine Plattform, keine Lern-App.
          </p>
        </StepCard>

        <StepCard n={5} title="Asymmetrische Opt-outs">
          <p>
            Das hier ist Standard in der ganzen Branche, nicht nur bei Kinder-
            Apps. Werbung und Datensammlung sind bei der Installation angeschaltet,
            das Abschalten liegt drei Menü-Ebenen tief, die Formulierung ist so
            ausgelegt, dass Ablehnung nach einem ethischen Versagen klingt
            (<em>nein, ich möchte keine personalisierte Werbung, dafür aber
            Tracking akzeptieren</em>).
          </p>
          <p>
            Für eine App, die sich an Kinder wendet, ist das besonders absurd.
            Kinder können Datenschutz-Einstellungen nicht bewerten. Also tun es
            die Eltern. Und weil die Eltern müde sind und drei Kinder und einen
            Job haben, klicken sie bei Standard durch. Das System ist darauf
            gebaut.
          </p>
        </StepCard>

        <StepCard n={6} title="Fortschrittsbalken, die fast-aber-nie-ganz voll sind">
          <p>
            Du bist bei 87% Fortschritt, mach noch eine Einheit! Du bist jetzt
            bei 93%! Noch zwei! Der Fortschrittsbalken kommt nie ganz ans Ende,
            weil das Ende den Benutzer entlassen würde. Das Muster heißt Zeigarnik-
            Effekt: offene Aufgaben sind in unserem Kopf präsenter als
            abgeschlossene. Eine App, die nie wirklich abschließt, bleibt immer
            ein bisschen offen.
          </p>
          <p>
            Für Kinder ist das besonders ziehend, weil die Selbstregulation
            (<em>ich hör jetzt auf, obwohl der Balken fast voll ist</em>) noch nicht
            stabil ist.
          </p>
        </StepCard>

        <StepCard n={7} title="Free-Apps mit aggressiven In-App-Käufen">
          <p>
            Die App ist kostenlos. Beim Spielen stolpert das Kind auf Premium-
            Features, auf exklusive Skins, auf <em>nur 2,99 EUR</em>-Pop-ups. Das
            Geld wird entweder vom verknüpften Eltern-Konto abgebucht oder der
            Impuls wird zur Gelegenheit, die Eltern zu fragen. In beiden Fällen
            lernt das Kind: <em>wenn ich etwas will, kaufe ich es.</em>
          </p>
          <p>
            Das ist keine pädagogische Aussage. Das ist ein Geschäftsmodell, das
            darauf angewiesen ist, dass jüngere Nutzer den Unterschied zwischen
            Spielinhalt und Kaufangebot nicht sauber trennen können. Die FTC hat
            dazu explizit Richtlinien, weil es in den letzten Jahren genug Fälle
            gab, in denen Kinder dreistellige Beträge in einem Nachmittag ausgegeben
            haben.
          </p>
        </StepCard>

        <StepCard n={8} title="Endless Scroll und Autoplay">
          <p>
            TikTok ist das Beispiel, das die meisten Eltern sofort kennen, aber
            Endless-Scroll-Mechaniken sind inzwischen überall, auch in Apps
            für Vorschul- und Grundschulkinder.
            Das Muster: kein Ende, kein Abschluss, immer rutscht ein nächstes
            Video, eine nächste Geschichte, eine nächste Minispielzeug rein.
            Autoplay-Startbildschirme, die direkt das nächste Element laden, ohne
            dass das Kind entscheiden muss, weiterzumachen.
          </p>
          <p>
            Warum das bei Kindern besonders wirkt: der Moment, in dem man bewusst
            aufhört, ist eine exekutive Entscheidung. Die fällt bei jedem Menschen
            schwerer als die Entscheidung, einfach weiterzumachen. Und bei
            Grundschulkindern, deren Exekutivfunktion noch im Aufbau ist, fällt sie
            deutlich schwerer. Wenn das aktive Aufhören-Müssen aus dem Interface
            verschwindet, verlängern sich Sessions. Das ist nicht App-spezifisch,
            das ist beobachtbar wo immer Endless-Scroll-Mechaniken eingebaut sind.
          </p>
          <p>
            Als Faustregel: Apps mit Autoplay-on-default für Kinder unter zehn
            sind ein Warnzeichen. Apps, die Episoden klar abschließen und ein
            <em> fertig für heute</em>-Signal geben, sind ein gutes Zeichen.
          </p>
        </StepCard>
      </Steps>

      <h2>Warum das bei 5- bis 8-Jährigen besonders hart einschlägt</h2>

      <p>
        Drei Gründe, die sich in der Entwicklungsliteratur immer wiederfinden.
      </p>

      <p>
        <strong>Erstens:</strong> die Selbstregulation ist entwicklungsbedingt
        begrenzt. Das heißt nicht, Kinder können nicht Nein sagen. Es heißt,
        die Kapazität, gegen einen starken Reiz konsequent Nein zu sagen,
        wächst erst langsam mit der Reifung des präfrontalen Kortex. Das geht
        bis ungefähr ins junge Erwachsenenalter.
      </p>

      <p>
        <strong>Zweitens:</strong> variable Belohnungen und dopaminerge
        Systeme. Das Dopamin-System ist bei Kindern und Jugendlichen
        empfindlicher. Ein zufälliger kleiner Gewinn in einer App löst bei
        einem Siebenjährigen stärkere Aktivität aus als bei einem
        Vierzigjährigen. Die Forschung zur Reifung des Belohnungssystems im
        Kindes- und Jugendalter beschreibt das breit, etwa in Übersichten
        wie Steinberg (2008) zur adoleszenten Risikoaffinität.
      </p>

      <p>
        <strong>Drittens:</strong> kein entwickeltes Verständnis von Werbung
        vs. Content. Kinder unter ungefähr acht können die Unterscheidung
        zwischen Programminhalt und Werbebotschaft nicht zuverlässig ziehen.
        Das ist auch der Grund, warum es in Deutschland strenge Regeln für
        Werbung in Kinderfernsehen gibt. In Apps sind diese Regeln noch nicht
        so scharf durchgesetzt, und in internationalen Apps sowieso nicht.
      </p>

      <h2>Was in Deutschland und der EU gilt</h2>

      <p>
        Kurz, ohne tief einzusteigen, weil ich kein Jurist bin. Aber ein paar
        Bezugspunkte, die dir zeigen, dass es hier was gibt.
      </p>

      <Callout type="forschung" label="Rechtlicher Kontext">
        <p>
          Die DSGVO schützt Minderjährige besonders, die Einwilligung zur
          Verarbeitung personenbezogener Daten muss bei Kindern unter 16 (in
          Deutschland unter 16) von den Erziehungsberechtigten erteilt werden.
          Der Digital Services Act der EU hat 2023 zusätzliche Pflichten für
          Plattformen eingeführt, die von Kindern benutzt werden, inklusive
          Verbot personalisierter Werbung für Minderjährige. Die Kommission für
          Jugendmedienschutz (KJM) in Deutschland hat Leitlinien zu Alterskenn-
          zeichnung und Risiken. Die Bundeszentrale für Kinder- und
          Jugendmedienschutz (BzKJ) veröffentlicht regelmäßig Hintergründe zu
          manipulativen Designmustern, und die Verbraucherzentralen haben die
          Lootbox-Thematik in den letzten Jahren deutlich stärker auf den Tisch
          gebracht.
        </p>
      </Callout>

      <p>
        In der Praxis heißt das: viele dieser Regeln sind da, aber die
        Durchsetzung hinkt der Realität deutlich hinterher. Verlass dich
        nicht darauf, dass eine App, die in Deutschland verfügbar ist, auch
        den Schutzanforderungen entspricht. Das Ranking im App Store ist
        keine Qualitätsgarantie. Die Altersfreigabe auch nicht. Prüf selber.
      </p>

      <h2>Wie eine gute Kinder-App aussieht</h2>

      <p>
        Negativ abgrenzen ist einfacher als positiv beschreiben. Ich versuche
        trotzdem eine kurze Skizze, weil ich das Signal oft vermisse in
        Artikeln, die nur Warnungen aufzählen.
      </p>

      <p>
        Eine gute Kinder-App hat einen klar formulierten Zweck. Sie sagt dir,
        was das Kind dort tun soll, und wann es damit fertig ist. Sie hat ein
        Ende pro Sitzung. Sie stellt dir das Geschäftsmodell offen dar,
        idealerweise als bezahlte App oder klares Abo. Sie vermeidet jede
        Form von künstlicher Dringlichkeit. Sie trennt Spielinhalt sauber von
        etwaigen Angeboten.
      </p>

      <p>
        Sie gibt dem Kind Ownership. Sie respektiert, dass das Kind aufhören
        darf. Sie erfindet keine emotionale Bindung an virtuelle Wesen, die
        traurig werden, wenn das Kind einen Tag aussetzt. Sie hat einen
        Datenschutz, den du als Erwachsener mit mittlerer Konzentration lesen
        kannst. Sie hält sich an die Leitlinien von WHO, UNICEF RITEC-8 und
        der D4CR-Initiative (Designing for Children's Rights).
      </p>

      <p>
        Und sie hat einen Hersteller, der mit Namen und Gesicht dahinter
        steht, nicht eine anonyme LLC in einer Briefkastenadresse. Das ist
        banal, aber ein sehr guter erster Filter. Eine App, deren Hersteller
        du nicht googeln kannst, lädst du nicht.
      </p>

      <h2>Die Checkliste, bevor du eine Kids-App installierst</h2>

      <p>
        Wenn du vor der Installation einer App zehn Minuten investieren willst,
        sind hier die sieben Fragen, die am meisten Aussage bringen. Geh sie
        durch. Wenn eine Antwort unklar bleibt, ist das selbst schon eine
        Antwort.
      </p>

      <Callout type="ausprobieren" label="Checkliste vor dem Installieren">
        <ol>
          <li>
            <strong>Schickt die App Push-Benachrichtigungen?</strong> Wer
            profitiert davon, dass mein Kind zurückkommt? Wenn die App mit
            Retention wirbt, nicht installieren.
          </li>
          <li>
            <strong>Gibt es Streaks oder ähnliche Loss-Aversion-
            Mechanismen?</strong> Setzt die App das Kind unter Druck verpasste
            Tage „wieder gutzumachen"? Wenn ja, schau ob die App eher daran
            interessiert ist, dein Kind täglich wieder zu sehen, oder daran,
            dass es etwas lernt. Aus meiner Sicht sind das oft zwei
            verschiedene Dinge.
          </li>
          <li>
            <strong>Wie ist die In-App-Käufe-Struktur?</strong> Kann mein Kind
            auf Kaufangebote stoßen? Gibt es Premium-Versionen? Wenn ja, wie gut
            abgegrenzt sind die Kaufflächen vom normalen Spielinhalt?
          </li>
          <li>
            <strong>Was passiert mit den Daten?</strong> Server-Standort. Liste
            der Auftragsverarbeiter. Analytics-Dienste. Werbe-SDKs. Eine
            ordentliche App nennt das in der Datenschutzerklärung knapp und
            verständlich. Wenn das unklar ist, ist das ein schlechtes Zeichen.
          </li>
          <li>
            <strong>Kann das Kind die App ohne Reibung verlassen?</strong> Gibt
            es Popups, die das Zumachen erschweren? Erscheinen Guilt-Trip-
            Dialoge (<em>bist du sicher, dass du gehen willst?</em>)?
          </li>
          <li>
            <strong>Gibt es ein klares Ende?</strong> Oder ist das Design
            endlos, mit immer neuem Content, der nachgeschoben wird? Kinder-
            Apps mit klar abschließbaren Einheiten sind fast immer besser als
            solche mit unendlichem Feed.
          </li>
          <li>
            <strong>Was ist das Geschäftsmodell?</strong> Werbefinanziert,
            freemium, bezahlt? Alle drei können funktionieren, aber
            werbefinanzierte und freemium-Modelle haben strukturell einen
            Konflikt mit dem Wohl deines Kindes, weil ihr Umsatz von
            Aufmerksamkeit und Impulskäufen abhängt.
          </li>
        </ol>
      </Callout>

      <h2>Ronki macht diese Entscheidungen so</h2>

      <p>
        Ich finde, ich sollte das offen machen. Nicht nur weil es
        transparent ist, sondern weil du so siehst, was unsere Position in
        der Praxis bedeutet, nicht nur was wir auf der Website behaupten.
      </p>

      <Steps>
        <StepCard n="KEIN" title="Streak">
          <p>
            Bewusst. Ein verpasster Tag setzt nichts zurück. Wir haben lange
            überlegt, ob wir wenigstens einen milden Zähler einbauen. Haben wir
            nicht. Der Effekt wäre der gleiche, nur schwächer.
          </p>
        </StepCard>

        <StepCard n="KEINE" title="Push-Benachrichtigungen zu Routine-Uhrzeiten">
          <p>
            Die Idee, dass unsere App dein Kind morgens aus dem Schlaf piept,
            widerspricht dem gesamten Ansatz. Das Kind macht die Routine. Die App
            begleitet, wenn das Kind ankommt. Nicht umgekehrt.
          </p>
        </StepCard>

        <StepCard n="KEINE" title="In-App-Käufe, keine Werbung">
          <p>
            Ronki ist aktuell kostenlos (Alpha-Phase). Wenn später Geld fließt,
            dann als transparentes Familien-Abo. Kein Freemium. Keine Premium-
            Drachen. Keine Werbung, nie.
          </p>
        </StepCard>

        <StepCard n="EU" title="Daten auf EU-Servern, kein Tracking">
          <p>
            Supabase in der EU-Region, Vercel Edge in Frankfurt. Keine Google
            Analytics, keine Meta-Pixel, auf der Website nur eine anonyme
            Besuchszählung ohne Cookies. Minimum an Daten, die
            wir für den Betrieb brauchen, nicht mehr.
          </p>
        </StepCard>

        <StepCard n="FADE" title="Fade-by-design">
          <p>
            Das ist die Entscheidung, die uns am meisten von der Industrie
            trennt. Je besser ein Kind weiß, was es gerade fühlt, je
            leichter ihm das Atmen fällt, desto leiser wird der Drache.
            Wenn dein Kind irgendwann nicht mehr nach Ronki greift, weil
            es selbst weiß, was los ist, haben wir unseren Job gemacht.
          </p>
        </StepCard>
      </Steps>

      <PullQuote attribution="Als Gamer-Vater">
        Wir bauen Ronki gegen den Algorithmus, der entscheidet welche App
        vorne im App-Store steht. Eine App, die ihre Kinder nicht braucht,
        gewinnt nicht im Ranking. Aber sie macht ihren Job.
      </PullQuote>

      <p>
        Nicht jede App muss so gebaut sein. Ich wäre der Erste, der sagt:
        Spiele, bei denen Kinder Spaß haben sollen, dürfen natürlich
        Engagement haben. Engagement ist nicht per se böse. Es wird böse,
        wenn es gegen das Interesse der Nutzerin gebaut ist. Bei Routinen,
        die der Selbstständigkeit dienen sollen, ist Engagement-Maximierung
        ein Widerspruch in sich.
      </p>

      <h2>Was du heute tun kannst</h2>

      <Callout type="ausprobieren">
        <p>
          Eine Sache. Nimm eine Kinder-App, die dein Kind regelmäßig benutzt.
          Eine. Nicht alle. Öffne die Einstellungen. Schau dir drei Dinge an:
          die Push-Benachrichtigungs-Einstellungen, die In-App-Käufe-Liste (meist
          unter <em>Angebote</em> oder <em>Shop</em>), und die Datenschutz-
          Einstellungen.
        </p>
        <p>
          Push aus, wenn nicht echt notwendig. In-App-Käufe auf iOS und Android
          auf Geräteebene blockieren (Familienfreigabe bzw. Google Family
          Link). Datenschutz-Einstellungen kurz durchlesen und die aggressivsten
          Tracking-Optionen ausschalten.
        </p>
        <p>
          Das kostet dich zehn Minuten. Es verändert, wie die App im Leben
          deines Kindes wirkt. Und es gibt dir zum ersten Mal das Gefühl, dass
          du an einem Hebel sitzt, der tatsächlich was bewegt.
        </p>
      </Callout>

      <p>
        Du bist hier nicht paranoid. Du bist aufmerksam. Das System ist
        darauf gebaut, dass du die Voreinstellungen übernimmst. Eine halbe
        Stunde Aufmerksamkeit pro App über ihre gesamte Laufzeit ist ein
        fairer Preis für ein Kind, das mit klareren Mustern aufwächst.
      </p>
    </RatgeberArticle>
  );
}
