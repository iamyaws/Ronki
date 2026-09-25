import {
  RatgeberArticle,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';

export default function RatgeberWasKinderAppsMachen() {
  return (
    <RatgeberArticle
      slug="was-kinder-apps-machen"
      title="Was Kinder-Apps mit deinem Kind machen"
      description="Pokémon Go, Streaks, Paywalls, Werbung die selbst ein Spiel ist: was ich nach anderthalb Jahren Kinder-Apps mit meinem Sohn gelernt habe und was bei uns funktioniert."
      category="Digitale Mündigkeit"
      readMinutes={12}
      publishedAt="2026-04-24"
      ogImage="/art/marketing/was-kinder-apps-machen.png"
      heroImage="/art/marketing/was-kinder-apps-machen.png"
      heroAlt="Painterly watercolor editorial illustration in deep teal, mit Ronki-Drachen und warmem Mustard-Glow."
      related={[
        {
          slug: 'dark-patterns-kinder-apps',
          title: 'Dark Patterns in Kinder-Apps: Was Eltern 2026 wissen sollten',
        },
        {
          slug: 'sticker-chart-alternative',
          title:
            'Warum Sticker-Charts oft nicht halten (und was stattdessen funktioniert)',
        },
        {
          slug: 'morgen-troedeln',
          title:
            'Kind trödelt morgens? Warum das normal ist und was wirklich hilft',
        },
      ]}
    >
      <p className="lead">
        Mein Sohn war sechs, als wir angefangen haben Pokémon Go zu spielen. Ich
        hatte eigene Kindheitserinnerungen daran und dachte: wir gehen raus,
        wir sammeln, das ist gut. Zwei Wochen später stand mein Kind im Wald
        und starrte aufs Handy. Er war draußen, aber nicht draußen.
      </p>

      <p>
        Jede Woche gab es ein neues Event. Eine Tagesphase, in der ein
        bestimmtes Pokémon nur nachts erschien. Eine Saison, in der ein
        besonderes Pokémon nur einmal im Jahr zu fangen war. Ich merkte
        irgendwann, dass er nicht mehr losziehen wollte ohne zu fragen "was
        gibt's heute?". Er hatte FOMO. Sechs Jahre alt, und der Algorithmus
        hatte es ihm beigebracht.
      </p>

      <p>
        Er ist jetzt sieben, in der ersten Klasse, und seit anderthalb Jahren
        begleite ich ihn durch die App-Landschaft für Kinder. Wir haben eine
        Menge Lehrgeld bezahlt, auf seiner und auf meiner Seite. Wir haben
        Apps gelöscht, Spiele rotiert, zusammen Tränen ausgehalten, als wir
        Pokémon Go irgendwann begraben haben. "Das Spiel wird gespeichert",
        habe ich ihm gesagt. "Später, wenn du ein eigenes Handy hast, können
        wir es wieder holen." Ich wollte kein kaltes Ende. Kein cold turkey
        mit einem Siebenjährigen.
      </p>

      <p>
        Ich schreibe das hier als Vater, nicht als Kritiker. Ich will sichtbar
        machen, was wir beobachtet haben. Welche Mechaniken konstruiert sind,
        welche zufällig aussehen aber keine sind, und was uns geholfen hat
        damit umzugehen. Ich nenne auch die Beispiele die gut funktionieren,
        denn nicht jede Kinder-App ist ein Dark-Pattern-Container. Aber die
        meisten haben Muster eingebaut, die eine Sechs- oder Siebenjährige
        nicht verarbeiten kann.
      </p>

      <h2>Wie sich FOMO bei uns angefühlt hat</h2>

      <p>
        Pokémon Go war unser deutlichstes Beispiel. Events, saisonale Pokémon,
        Tag-Nacht-Zyklen. Die Mechanik ist erwachsenen Sammlerinnen und
        Sammlern gegenüber transparent und für sie vielleicht reizvoll. Bei
        einem Sechsjährigen ist es keine Strategie, sondern Druck. "Wir müssen
        gleich raus, sonst verpasse ich das Event." Sätze die ein Kind sagt,
        die aus einer App kommen, nicht aus ihm selbst.
      </p>

      <p>
        Wir haben stufenweise reduziert. Erst Frequenz, dann Intensität, dann
        pausiert, dann gelöscht. Ich habe versprochen dass die Sammlung
        erhalten bleibt, und sie ist es. Das hat ihm geholfen loszulassen.
        Ohne diese Brücke hätten wir wochenlange Konflikte gehabt.
      </p>

      <PullQuote>
        Sechs Jahre alt, und der App-Rhythmus hatte ihn fest im Griff.
      </PullQuote>

      <h2>Streaks, am klarsten bei Duolingo</h2>

      <p>
        Das deutlichste Beispiel für eine Streak-Mechanik ist Duolingo und
        seine Schwesterprodukte. Eine Zahl, die steigt wenn du täglich übst,
        und zurückfällt wenn du einen Tag aussetzt. Streak Freezes als
        Belohnung oder Kauf. Popups, Erinnerungen, "Dein Streak ist in
        Gefahr".
      </p>

      <p>
        Bei Erwachsenen ist das eine Motivationshilfe. Aus meiner Beobachtung
        mit Louis und im Austausch mit anderen Eltern erleben Kinder unter
        neun den drohenden Streak-Verlust öfter als Druck als als Anreiz.
        Verlustaversion ist seit Kahneman und Tversky breit beschrieben; bei
        Grundschulkindern bildet sich die kognitive Distanz dazu erst aus.
        Das ist nicht der Designfehler von einem einzelnen Anbieter, das ist
        der Stand der Mechanik wie sie heute in vielen Produkten steckt.
      </p>

      <p>
        Mein Sohn nutzt Duolingo nicht selbst. Aber ich kenne das Muster von
        anderen Eltern und aus eigenem Test. Bei Kindern mit geringerer
        Frust-Toleranz fühlt sich ein gerissener Streak in meiner Beobachtung
        oft an wie echtes Versagen.
      </p>

      <h2>Spiele ohne Ende</h2>

      <p>
        Hill Climb Racing 2 ist ein kleines Auto-Bergauf-Spiel, das mein Sohn
        eine Weile gespielt hat. Es hat keine Endbedingung. Du schaltest immer
        neue Fahrzeuge frei, neue Strecken, neue Tunings. Das Spiel ist nicht
        zum Durchspielen gedacht. Das ist eine Designentscheidung, die für
        erwachsene Spieler manchmal Reiz ist und bei Louis eine andere Wirkung
        entfaltet hat. Ich beschreibe das nicht als Vorwurf an den Hersteller,
        sondern als das was wir bei uns beobachtet haben.
      </p>

      <p>
        Mario Kart und Mario Run haben ähnliche Schleifen. Mein Sohn hat
        relativ hohe Frust-Toleranz, und die Nintendo-Spiele sind visuell und
        mechanisch sehr viel besser gemacht. Aber auch dort: Sterne sammeln,
        Charaktere freischalten, wieder und wieder, ohne natürlichen
        Abschluss.
      </p>

      <p>
        Irgendwann hat er mich gefragt: "Wann ist das eigentlich fertig?". Er
        wusste nicht mehr wann er aufhören soll, weil die App das nicht mehr
        signalisiert. Dieses Signal hätte er selbst setzen müssen. Aber die
        Apps haben es ihm aktiv abtrainiert.
      </p>

      <PullQuote>
        Eine App die dir sagt "du bist fertig für heute" verdient kein
        Dauer-Engagement. Also sagen sie es nicht.
      </PullQuote>

      <h2>Die Werbe-Ökosystem-Falle</h2>

      <p>
        Das ist die Mechanik die mich am meisten überrascht hat. In den
        meisten kostenlosen Kinder-Spielen gibt es eingebaute Werbeanzeigen.
        Soweit so bekannt. Was ich nicht erwartet hatte: die Werbung IST ein
        Spiel. Du siehst nicht einen 15-Sekunden-Clip, du spielst einen
        Prototyp eines anderen Spiels. Eine bis zwei Minuten. Am Ende kommst
        du auf einen Download-Prompt mit Timer. Die Close-Pfeile sind so
        transparent, dass du sie kaum siehst. Klickst du versehentlich auf den
        falschen Bereich, landest du direkt im App Store.
      </p>

      <p>
        Aus meiner Sicht ist das kein Bug, sondern Funnel-Logik. Wer ein
        wirtschaftliches Interesse daran hat, Aufmerksamkeit weiterzureichen,
        baut Interfaces so, dass Aufmerksamkeit weiterläuft. Bei welcher
        konkreten App das mit welcher Absicht passiert, kann ich von außen
        nicht beweisen, deshalb beschreibe ich nur was ich gesehen habe.
      </p>

      <p>
        Mein Sohn ist klug genug, dass er die Muster inzwischen kennt und
        meistens rauskommt. Aber das ist eine Fertigkeit die er ausbilden
        musste, nicht etwas das ihm erspart blieb. Wenn er in einem Spiel war,
        war er oft fünf Minuten später in einem anderen, ohne das erste aktiv
        verlassen zu haben. In meiner Beobachtung ist das nicht
        Aufmerksamkeitsspanne, das ist die Wirkung der eingebauten Funnels.
      </p>

      <h2>Paywalls, die Pay-to-Win verkaufen</h2>

      <p>
        In den Spielen mit Skins, Charakteren oder Cosmetics ist
        Paywall-Design fast immer da. Die coolsten Skins sind kostenpflichtig,
        auch für Kinder sichtbar, oft mit witzigen Preisen die Eltern ködern
        ("nur 2,99"). Mein Sohn hatte eine Phase in der das Wöchentliche-Thema
        war.
      </p>

      <p>
        Wir haben als Familie entschieden: kein Echtgeld für Cosmetics. Kein
        pay-to-win. Alles Coole holen wir durch Progression oder gar nicht.
        Diese Entscheidung war nicht konfliktfrei. Es gab Frust, Tränen,
        mehrere Gespräche. Aber der Weg durch den Frust war Teil des Lernens.
        Und der Frust war genau das was das Design erzeugen wollte, um unsere
        Taschen zu öffnen. Ich will nicht dass mein Sohn lernt, dass Geld
        Probleme löst, die eine App ihm absichtlich gebaut hat.
      </p>

      <h2>Push-Benachrichtigungen landen auf Eltern-Geräten</h2>

      <p>
        Die meisten Grundschulkinder haben kein eigenes Gerät. Sie nutzen das
        Familien-Tablet, das Elternhandy, oder etwas das sie ihr eigenes
        nennen aber das nicht technisch ist. Das heißt: wenn eine App
        Push-Benachrichtigungen an "dein" Gerät schickt, schickt sie sie an
        mein Handy.
      </p>

      <p>
        Und das merkt sie. Die Algorithmen wissen, wann du zurückkommst und ob
        du dann weiterspielst. Eine App die erfolgreich mein Kind an mein
        Handy zieht, optimiert damit doppelt: sie nutzt die kindliche
        Schuldgefühl-Reaktion auf "[Figur] vermisst dich" und meine elterliche
        Aufmerksamkeit, weil mein Handy den Push anzeigt während ich arbeite.
      </p>

      <p>
        Ich habe bei uns inzwischen für jede Kinder-App Notifications
        systemweit ausgeschaltet. Das sollten App-Hersteller als Default
        einstellen, aber es ist Opt-out, nicht Opt-in.
      </p>

      <h2>Was auch gut geht</h2>

      <p>
        Nicht jede App ist ein Dark-Pattern-Container. Ein paar Beispiele aus
        unserem Leben:
      </p>

      <ul>
        <li>
          <strong>Anton-App</strong> (Lernapp, oft in Grundschulen
          eingesetzt): klarer Bildungsauftrag, in vielen Schulen als
          Hausaufgabenplattform integriert. Gamification ja, aber aus unserer
          Beobachtung funktional eingebunden, nicht losgelöst.
        </li>
        <li>
          <strong>Antolin</strong> (Leseverständnis, schulnah): fokussiert auf
          Fragen zu gelesenen Büchern, kein Abo-Modell, kein sichtbarer Druck.
          Funktioniert bei uns als Ergänzung zum realen Buch, nicht als
          Ersatz.
        </li>
        <li>
          <strong>Paper.io 2</strong> und ähnliche einfache Arcade-Spiele:
          mit Werbung, aber der Kernloop ist kurz und hat ein Ende. Zeitlich
          begrenzt spielen funktioniert bei uns hier.
        </li>
        <li>
          <strong>Beyblade-App</strong> (Spielzeug-Begleit-App): aus unserer
          Beobachtung weniger fordernd als andere Free-Apps. Progression ist
          möglich ohne Zahlung.
        </li>
        <li>
          <strong>Mario Kart / Mario Run</strong>: die Design-Qualität ist so
          hoch, dass die gespielte Zeit sich bei uns meistens wie Spielen
          anfühlt und nicht wie Schleife. Zeitlich limitiert und unter
          elterlicher Beobachtung funktioniert das in unserem Alltag.
        </li>
      </ul>

      <p>
        Der Punkt: es gibt Abstufungen. Nicht alles ist gleich auf Retention
        optimiert. Und es gibt Apps, bei denen die Entwicklerinnen und
        Entwickler aus unserer Sicht überlegt haben was Kindern tatsächlich
        gut tut.
      </p>

      <h2>Was wir praktisch machen</h2>

      <p>
        Über die Zeit haben sich bei uns ein paar Routinen etabliert die
        funktionieren.
      </p>

      <ul>
        <li>
          <strong>Ich teste Spiele selbst zuerst.</strong> Zwanzig Minuten.
          Ich schaue: wie oft unterbricht Werbung, welche
          Monetarisierungs-Prompts gibt's, gibt es FOMO-Events, hat das Spiel
          ein Ende-Signal.
        </li>
        <li>
          <strong>Ich spiele die ersten paar Male mit ihm zusammen.</strong>{' '}
          Ich sehe direkt wo sein Frust hochgeht, wo er ohne Anleitung Dinge
          macht die er eigentlich nicht will.
        </li>
        <li>
          <strong>Wir rotieren Spiele.</strong> Nicht alles bleibt auf dem
          Tablet. Wenn eine Mechanik toxisch wird, kommt das Spiel runter.
          Wenn er ein Spiel länger nicht anrührt, auch. Der Bestand bleibt
          klein.
        </li>
        <li>
          <strong>Wir vermeiden Shiny-New-Object-Chasing.</strong> Nicht jede
          neue App die auf dem Schulhof kursiert, landet bei uns. Das schafft
          manchmal Frust in der Klasse, aber weniger zuhause.
        </li>
        <li>
          <strong>Haushalts-Vereinbarung: kein Echtgeld für Cosmetics.</strong>{' '}
          Einmal, gemeinsam, erklärt. Seitdem Diskussion geschlossen.
        </li>
        <li>
          <strong>Zeitlimits als Rahmen, nicht als Strafe.</strong> Eine
          Stunde Mario Kart ist in Ordnung. Zwei Stunden nicht. Und Handy für
          Pokémon Go gar nicht mehr. Klar kommuniziert. Verlässlich
          durchgesetzt.
        </li>
      </ul>

      <h2>Wie ich das zusammenfasse</h2>

      <p>
        Die App-Landschaft für Kinder ist kein Dschungel, aber sie ist auch
        kein Spielplatz. Sie ist ein sorgfältig designtes Ökosystem, das auf
        Retention optimiert ist, nicht auf Entwicklung. Die Apps die ich hier
        erwähnt habe sind nicht die Ausreißer. Sie sind Standard. Und viele
        Menschen die daran arbeiten sind selber Eltern, wollen Gutes, aber
        sitzen in Geschäftsmodellen die sie nicht gesetzt haben. Die Struktur
        ist das Problem: VC-finanzierte Kinder-Apps müssen wachsen, Wachstum
        heißt Retention, Retention bei Kindern heißt Verhaltensmanipulation.
      </p>

      <p>
        Wir haben als Familie einen Weg gefunden der für uns funktioniert. Es
        war kein leichter Weg. Es gab Tränen, Streit, Grenzdiskussionen, und
        auch Momente wo ich selbst unsicher war. Aber im Rückblick würde ich
        es wieder so machen.
      </p>

      <p>
        Wenn du Kinder in ähnlichem Alter hast und dir manches bekannt
        vorkommt: du bist nicht allein, und es gibt Wege raus.
      </p>

      <h2>Checkliste für die nächste App die dein Kind will</h2>

      <p>Frag dich:</p>

      <ol>
        <li>
          Hat sie Streaks oder vergleichbare "verliere nichts"-Mechaniken?
        </li>
        <li>
          Schickt sie Push-Benachrichtigungen an irgendein Gerät deiner
          Familie?
        </li>
        <li>
          Gibt es eine Belohnungsökonomie (Punkte, Coins, Avatare,
          Sammelstücke)?
        </li>
        <li>Gibt es Paywalls mit sichtbaren Preisen die dein Kind sieht?</li>
        <li>Gibt es eingebettete Werbung die selbst spielbar ist?</li>
        <li>Sagt sie deinem Kind irgendwann "du bist fertig für heute"?</li>
        <li>
          Kannst du sie entfernen und dein Kind vermisst nicht die App,
          sondern den Inhalt?
        </li>
      </ol>

      <Callout type="wichtig" label="Wie die Checkliste zu lesen ist">
        Wenn drei oder mehr dieser Fragen mit Ja beantwortet werden, ist die
        App nicht für dein Kind designt. Sie ist für einen Retention-KPI
        designt. Das bedeutet nicht automatisch "nicht nutzen". Es bedeutet:
        bewusst nutzen, mit Zeitrahmen, mit elterlicher Begleitung, und mit
        einer Exit-Strategie wenn sie kippt.
      </Callout>

      <p>
        Wenn du die Fragen lieber durch ein Werkzeug gehst statt sie auf
        Papier abzuarbeiten: ich habe die Checkliste in eine kleine Web-App
        gepackt. Du beantwortest die zehn Fragen aus deiner Beobachtung, das
        Ding rechnet einen Score und gibt dir konkrete Vorschläge was du
        tun kannst, je nach Punktzahl. Kein Account, kein Tracking, du
        kannst die Bewertung speichern und teilen wenn du willst.{' '}
        <a
          href="/tools/app-check"
          className="font-semibold text-ink underline decoration-mustard underline-offset-4 hover:decoration-teal"
        >
          Hier zum App-Check
        </a>
        .
      </p>

      <h2>Was ich selbst gebaut habe</h2>

      <p>
        Ich arbeite seit einigen Wochen an einer kleinen Web-App für Kinder
        zwischen fünf und acht, bei der wir diese Patterns explizit nicht
        eingebaut haben. Keine Streaks, keine Push, keine Werbung, keine
        Cosmetics, kein App-Store, kein Konto, kein Tracking. Sie heißt Ronki
        und läuft direkt im Browser unter ronki.de. Sie ist ausdrücklich
        darauf designt, dass sie überflüssig wird sobald dein Kind die
        Morgenroutine selbst kann.
      </p>

      <p>
        Das ist nicht der Kern dieses Textes. Der Kern ist: ihr müsst nicht
        kapitulieren, und ihr müsst nicht alles verbieten. Dazwischen gibt es
        einen Weg, und den findet ihr.
      </p>

      <p>
        Wenn ihr den Text nützlich findet, teilt ihn gerne. Wenn ihr Firmen
        dabei seht die ich unfair dargestellt habe, schreibt mir, ich
        publiziere eure Stellungnahme unverändert.
      </p>
    </RatgeberArticle>
  );
}
