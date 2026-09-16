import {
  RatgeberArticle,
  StepCard,
  Steps,
  Callout,
} from '../../components/RatgeberArticle';

/**
 * Ratgeber: Der Eltern-Bereich in Ronki
 *
 * How-To explaining the PIN-gated parent dashboard: what the 4 tabs do,
 * how to access it, how to change the PIN, what NOT to obsess over. Kept
 * practical and Marc-voice (no em-dashes, no preaching).
 */
export default function RatgeberElternBereich() {
  return (
    <RatgeberArticle
      slug="eltern-bereich"
      title="Der Eltern-Bereich in Ronki: was drin ist und wie du hinkommst"
      description="Ronki ist für dein Kind gebaut, nicht für dich. Der Eltern-Bereich ist die eine Ausnahme: ein PIN-geschützter Ort für Einstellungen, eigene Vorhaben für dein Kind und einen ruhigen Blick auf die Woche. Hier ist, was drin ist und wie oft du reinschauen solltest."
      category="Ronki nutzen"
      readMinutes={5}
      publishedAt="2026-04-21"
      heroImage="/art/bioms/Sonnenglast_sun-highlands.webp"
      heroAlt="Ruhige, warme Landschaft: hügelig, golden, ein Ort zum Durchatmen."
      related={[
        {
          slug: 'dark-patterns-kinder-apps',
          title: 'Dark Patterns in Kinder-Apps: Was Eltern 2026 wissen sollten',
        },
        {
          slug: 'morgenroutine-grundschulkind',
          title: 'Die Morgenroutine, die wirklich klappt: was für 6- bis 8-Jährige funktioniert',
        },
        {
          slug: 'abendroutine-grundschulkind',
          title: 'Abendroutine für Kinder: der Ablauf, der bei 5- bis 8-Jährigen wirklich trägt',
        },
      ]}
    >
      <p className="lead">
        Ronki ist für dein Kind gebaut. Die App soll sich für euer Kind wie
        ein ruhiger Begleiter anfühlen, nicht wie eine Elternkontrolle. Der
        Eltern-Bereich ist die eine Ausnahme. Er liegt hinter einem PIN,
        damit dein Kind nicht versehentlich an Einstellungen drehst, und er
        enthält genau die Dinge, bei denen du als Elternteil das Sagen haben
        sollst.
      </p>

      <p>
        Die kurze Antwort auf „brauche ich den häufig?" ist: nein. Einmal zum
        Einrichten, dann ab und zu mal reinschauen, wenn ihr etwas ändern
        oder ergänzen wollt. Das Dashboard soll dich nicht an die App binden.
        Es ist bewusst kein Dopamin-Loop für Eltern.
      </p>

      <h2>So kommst du hinein</h2>

      <p>
        In Ronki findest du oben rechts ein kleines Schloss-Symbol. Ein Tippen
        darauf öffnet den PIN-Eingabe-Screen. Nach vier Ziffern bist du drin.
      </p>

      <Callout type="wichtig" label="Der Standard-PIN ist 1234">
        <p>
          Nach dem ersten Start ist der PIN auf <strong>1234</strong>
          {' '}gesetzt, damit du überhaupt reinkommst. Wechsel ihn bitte bei
          der ersten Gelegenheit, sonst kennt ihn dein Kind auch ziemlich
          schnell. Wo du ihn änderst, steht weiter unten.
        </p>
      </Callout>

      <h2>Was drin ist</h2>

      <p>
        Der Eltern-Bereich hat vier Bereiche, die du über eine Leiste am
        oberen Rand wechselst. Hier ist, was jeder davon leistet.
      </p>

      <Steps>
        <StepCard n={1} title="Übersicht">
          Eine ruhige Rückschau auf die letzten Tage: wie die Stimmung von
          Ronki war (die dein Kind im Tagebuch setzt), wie viele Routinen
          durchgezogen wurden, welche Momente auffällig waren. Bewusst keine
          großen Zahlen, keine Streaks, keine Prozente. Der Sinn ist: einmal
          pro Woche darüber schauen und merken, wie es eurem Kind geht.
          Nicht: täglich checken.
        </StepCard>
        <StepCard n={2} title="Familie">
          Hier konfigurierst du, welche täglichen Gewohnheiten für dein Kind
          aktiv sind: Zähneputzen morgens und abends, Hausaufgaben, Zimmer
          aufräumen, was bei euch halt anfällt. Auch die Familien-Struktur
          (mehrere Kinder, Elternteile) landet hier.
        </StepCard>
        <StepCard n={3} title="Eigene Vorhaben">
          Das Stück, das Ronki am meisten von normalen Checklisten-Apps
          unterscheidet. Hier könnt ihr eigene, mehrstufige Vorhaben für
          euer Kind bauen. Beispiel: ein „Frühlings-Gedicht", das über
          zwei Wochen in sieben Schritten aufgebaut wird. Oder
          „Schwimmabzeichen Bronze-Vorbereitung" mit allen Lern-Einheiten.
          Dein Kind sieht das Vorhaben wie ein kleines eigenes Kapitel
          auftauchen, nicht wie eine Aufgabe von Mama oder Papa. Hier
          entfaltet sich die Magie von Ronki: jede Familie schreibt ihre
          eigenen kleinen Geschichten dazu.
        </StepCard>
        <StepCard n={4} title="Einstellungen">
          Sprache (deutsch oder englisch), PIN ändern, App zurücksetzen, und
          ein direkter Feedback-Knopf an uns. Wenn etwas nicht klappt,
          drückst du den, schreibst kurz was passiert ist, und wir kriegen
          das als Mail rein.
        </StepCard>
      </Steps>

      <h2>PIN ändern</h2>

      <p>
        Eltern-Bereich öffnen (Schloss-Symbol, PIN eingeben), auf{' '}
        <strong>Einstellungen</strong> wechseln, dort{' '}
        <strong>PIN ändern</strong>. Du wirst einmal nach dem alten und zweimal
        nach dem neuen gefragt. Der PIN wird lokal gespeichert, keine
        Cloud-Synchronisation, kein Reset via E-Mail. Wenn du ihn vergisst,
        musst du die App einmal zurücksetzen und die Routinen neu einrichten.
        Deshalb: notier ihn dir irgendwo sicher.
      </p>

      <Callout type="ausprobieren" label="Sicherer PIN-Tipp">
        <p>
          Nimm keinen Geburtstag deines Kindes. Das ist die erste Vermutung,
          wenn neugierige Finger an der App sind. Auch keine vier gleichen
          Ziffern. Alles andere, was du dir merkst, ist ok.
        </p>
      </Callout>

      <h2>Was mit euren Daten passiert</h2>

      <p>
        Alles, was du im Eltern-Bereich einstellst, bleibt auf eurem Gerät.
        Routinen, eigene Vorhaben, Stimmungs-Historie, Familien-Setup. Wir
        speichern nichts davon bei uns, es gibt keine Analyse auf Server-Seite
        und keine Weitergabe an Dritte. Wenn du mehr Details willst, steht
        das alles in der <a href="/datenschutz">Datenschutzerklärung</a>.
      </p>

      <h2>Wie oft du reinschauen solltest</h2>

      <p>
        Ehrlich: eher selten. Ronki ist so gebaut, dass euer Kind den Alltag
        ohne dich durchzieht. Der Eltern-Bereich ist für drei Situationen
        gedacht:
      </p>

      <ul>
        <li>
          <strong>Einmal pro Woche</strong> ein ruhiger Blick in die Übersicht.
          Wie war die Woche, welche Stimmungen waren dabei, wo hat es gehakt.
        </li>
        <li>
          <strong>Wenn ihr was Neues reinnehmt</strong>, zum Beispiel eine
          neues Vorhaben oder eine zusätzliche Gewohnheit im Familie-Tab.
        </li>
        <li>
          <strong>Wenn etwas kaputt wirkt</strong>, dann nutze den
          Feedback-Knopf in Einstellungen.
        </li>
      </ul>

      <p>
        Und wenn du merkst, dass du täglich reinschaust um zu „kontrollieren
        wie es läuft": das ist das Zeichen, den Eltern-Bereich wieder
        zuzumachen und darauf zu vertrauen, dass euer Kind seinen Weg findet.
        Ronki ist dafür da, dich aus dem Morgen-Marathon rauszuhalten, nicht
        dich zum Mikro-Manager zu machen.
      </p>
    </RatgeberArticle>
  );
}
