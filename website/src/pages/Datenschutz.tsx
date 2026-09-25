import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';

export default function Datenschutz() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Datenschutz: Ronki"
        description="Wie wir mit deinen Daten umgehen. DSGVO-konform, EU-Hosting, keine Cookies, keine personenbezogenen Profile."
        canonicalPath="/datenschutz"
      />
      <main className="relative px-6 py-20 sm:py-28">
        <article className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-teal-dark/70 hover:text-teal-dark transition-colors"
          >
            <span aria-hidden>←</span> Zurück zu Ronki
          </Link>

          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-teal font-medium">
            Rechtliches
          </p>
          <h1 className="mt-4 font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-teal-dark">
            Datenschutz&shy;erklärung
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
            Wir erheben so wenige Daten wie möglich. Nur, was wir wirklich brauchen, um Ronki an den Start zu bringen. Keine Werbung, keine Cookies, keine personenbezogenen Profile. Für eine anonyme Reichweitenanalyse nutzen wir Umami Analytics mit Datenverarbeitung in der EU (siehe Abschnitt 7).
          </p>
          <p className="mt-3 text-sm text-ink/60">Stand: 26. September 2026</p>

          <div className="mt-14 flex flex-col gap-12 text-[0.98rem] leading-[1.75] text-ink/85">

            <Section heading="1. Verantwortlicher im Sinne der DSGVO">
              <p>
                Verantwortlicher für die Verarbeitung personenbezogener Daten auf dieser Website ist (Art. 4 Nr. 7 DSGVO):
              </p>
              <address className="not-italic">
                Marc Förster<br />
                Föhringer Allee 33<br />
                85774 Unterföhring<br />
                Deutschland<br />
                <br />
                E-Mail: <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">hallo@ronki.de</a>
              </address>
              <p>
                Weitere Pflichtangaben findest du im <Link to="/impressum" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">Impressum</Link>.
              </p>
            </Section>

            <Section heading="2. Was bedeuten diese Begriffe?">
              <p>
                Wir verwenden die Begriffe aus der DSGVO, namentlich „personenbezogene Daten", „Verarbeitung", „Verantwortlicher", „Auftragsverarbeiter", „Einwilligung" und so weiter, in der Bedeutung, die ihnen Art. 4 DSGVO gibt. Kurz gesagt: personenbezogene Daten sind alle Informationen, die sich direkt oder indirekt auf dich beziehen, etwa deine E-Mail, deine IP-Adresse oder das Gerät, mit dem du hier liest.
              </p>
            </Section>

            <Section heading="3. Besuch dieser Website (Server-Logfiles)">
              <p>
                Wenn du diese Seite aufrufst, überträgt dein Browser technisch notwendige Daten an unseren Hosting-Provider. Diese werden in sogenannten Server-Logfiles gespeichert:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>gekürzte oder vollständige IP-Adresse</li>
                <li>Datum und Uhrzeit des Abrufs</li>
                <li>aufgerufene Seite und übertragene Datenmenge</li>
                <li>HTTP-Statuscode und Meldung über erfolgreichen Abruf</li>
                <li>Browser-Typ und -Version, Betriebssystem</li>
                <li>verweisende Seite (Referer), sofern vorhanden</li>
              </ul>
              <p>
                <strong className="text-teal-dark">Zweck:</strong> Betrieb, Stabilität und Sicherheit der Website; Abwehr von Angriffen.
              </p>
              <p>
                <strong className="text-teal-dark">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb der Seite).
              </p>
              <p>
                <strong className="text-teal-dark">Speicherdauer:</strong> maximal 14 Tage, danach werden die Logfiles automatisch gelöscht oder anonymisiert. Eine Zusammenführung dieser Daten mit anderen Datenquellen findet nicht statt.
              </p>
            </Section>

            <Section heading="4. Warteliste (einmalige Start-Benachrichtigung)">
              <p>
                Wenn du dich auf unsere Warteliste einträgst, verarbeiten wir deine E-Mail-Adresse sowie die von dir verwendete Sprache, damit wir dir am Start-Tag in deiner Sprache Bescheid geben können.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>E-Mail-Adresse (von dir eingegeben)</li>
                <li>Sprache (derzeit automatisch „de")</li>
                <li>Zeitpunkt der Anmeldung (technisch notwendig)</li>
                <li>Optional: falls du nach der Anmeldung den kurzen Eltern-Fragebogen ausfüllst, zusätzlich Altersgruppe deines Kindes (zum Beispiel „5–6"), thematischer Schwerpunkt (zum Beispiel „Morgen") und deine Bereitschaft, eine frühe Version mitzutesten. Diese Angaben sind freiwillig und helfen uns, Ronki am Bedarf entlang zu bauen.</li>
              </ul>
              <p>
                <strong className="text-teal-dark">Zweck:</strong> Eine einzige Benachrichtigung, wenn Ronki verfügbar ist. Kein Newsletter, keine Werbemails, keine Weitergabe an Dritte.
              </p>
              <p>
                <strong className="text-teal-dark">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO, d. h. deine Einwilligung, die du mit dem Absenden des Formulars erteilst.
              </p>
              <p>
                <strong className="text-teal-dark">Speicherdauer:</strong> Bis zum Versand der Start-Benachrichtigung und für höchstens 30 Tage danach, um technische Zustellprobleme nachvollziehen zu können. Danach wird deine E-Mail-Adresse gelöscht. Auch davor kannst du deine Einwilligung jederzeit formlos per E-Mail an <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">hallo@ronki.de</a> widerrufen; wir löschen dann umgehend deinen Eintrag.
              </p>
              <p>
                <strong className="text-teal-dark">Auftragsverarbeitung:</strong> Die Daten werden über einen Auftragsverarbeitungsvertrag nach Art. 28 DSGVO bei Supabase Inc. in der EU-Region gespeichert (siehe Abschnitt 7).
              </p>
            </Section>

            <Section heading="4b. Feedback-Formular und Themenwünsche">
              <p>
                Wenn du uns über ein Formular auf der Website (zum Beispiel im Ratgeber oder eine Feedback-Box) eine Nachricht schickst, verarbeiten wir den von dir geschriebenen Text, optional deine E-Mail-Adresse, die Quelle des Formulars (zum Beispiel „/ratgeber") sowie den Zeitpunkt der Übermittlung.
              </p>
              <p>
                <strong className="text-teal-dark">Zweck:</strong> Inhaltliche Auswertung deiner Rückmeldung und gegebenenfalls Antwort per E-Mail.
              </p>
              <p>
                <strong className="text-teal-dark">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung mit dem Absenden des Formulars). Bei Beantwortung zusätzlich Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Pflege des Nutzungsverhältnisses).
              </p>
              <p>
                <strong className="text-teal-dark">Speicherdauer:</strong> Bis zur abschließenden Bearbeitung deiner Rückmeldung, längstens 12 Monate. Danach werden personenbezogene Bestandteile gelöscht oder anonymisiert.
              </p>
            </Section>

            <Section heading="4a. App-Check Werkzeug (Bewertungs-Speicherung)">
              <p>
                Wenn du unter <a href="/tools/app-check" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">ronki.de/tools/app-check</a> eine App bewertest und deine Bewertung speicherst, verarbeiten wir folgende Daten, damit ein dauerhafter Permalink für deine Bewertung entstehen kann:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Den App-Namen, den du eingegeben oder ausgewählt hast</li>
                <li>Deine zehn Yes/No-Antworten zum Fragebogen</li>
                <li>Den daraus berechneten Score</li>
                <li>Den Zeitpunkt der Speicherung und die verwendete Sprache (derzeit „de")</li>
              </ul>
              <p>
                <strong className="text-teal-dark">Was wir nicht speichern:</strong> keine IP-Adresse dauerhaft, keine E-Mail, keinen Account, keinen Geräte-Fingerprint und keinen Hinweis darauf, wer den Permalink später öffnet. Eine Verknüpfung mit anderen Daten findet nicht statt.
              </p>
              <p>
                <strong className="text-teal-dark">Zweck:</strong> Damit du deine Bewertung über einen kurzen Permalink (zum Beispiel <code>/tools/app-check/r/x7k2pq3m</code>) erneut aufrufen oder mit anderen teilen kannst.
              </p>
              <p>
                <strong className="text-teal-dark">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO, d. h. deine Einwilligung, die du mit dem Klick auf „Bewertung speichern und teilen" erteilst.
              </p>
              <p>
                <strong className="text-teal-dark">Speicherdauer:</strong> Bis du eine Löschung anforderst. Sende uns dafür einfach den Permalink oder die Eval-ID per E-Mail an <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">hallo@ronki.de</a>; wir entfernen den Eintrag dann zeitnah.
              </p>
              <p>
                <strong className="text-teal-dark">Wichtig zum Verständnis:</strong> Die gespeicherten Bewertungen geben deine eigenen Beobachtungen wieder. Sie sind weder eine Aussage von Ronki über die jeweilige App noch ein verifizierter Test.
              </p>
            </Section>

            <Section id="vorlagen" heading="4c. Vorlagen-Download und Updates">
              <p>
                Auf den Vorlagen-Seiten kannst du dir eine Routine-Vorlage als PDF öffnen lassen. Dafür trägst du deine E-Mail-Adresse ein und setzt einen Haken. Wir speichern dann:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>deine E-Mail-Adresse</li>
                <li>die Vorlage, die du angefordert hast (zum Beispiel „vorlage-morgen")</li>
                <li>den Einwilligungstext, der beim Absenden auf dem Bildschirm stand, und den Zeitpunkt</li>
                <li>die Sprache (derzeit „de")</li>
              </ul>
              <p>
                <strong className="text-teal-dark">Zweck:</strong> Dir die Vorlage bereitstellen. Nur wenn du das zweite, freiwillige Häkchen setzt: dich gelegentlich über Neues bei Ronki informieren, höchstens einmal im Monat.
              </p>
              <p>
                <strong className="text-teal-dark">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO, also deine Einwilligung, die du mit dem Haken und dem Absenden erteilst.
              </p>
              <p>
                <strong className="text-teal-dark">Speicherung:</strong> Bei Supabase in der EU-Region (Frankfurt), auf Basis eines Auftragsverarbeitungsvertrags nach Art. 28 DSGVO (siehe Abschnitt 7). Wir speichern deinen Eintrag bis zu deinem Widerruf, spätestens 24 Monate nach deiner letzten Anforderung löschen wir ihn.
              </p>
              <p>
                <strong className="text-teal-dark">Widerruf:</strong> Jederzeit und ohne Angabe von Gründen mit einer formlosen Mail an <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">hallo@ronki.de</a>. Wir löschen deinen Eintrag dann umgehend. Die Rechtmäßigkeit der Verarbeitung bis zum Widerruf bleibt davon unberührt.
              </p>
              <p>
                <strong className="text-teal-dark">Ehrlich gesagt:</strong> Aktuell verschicken wir noch keine Update-Mails. Wenn wir damit anfangen, bekommst du zuerst eine Bestätigungs-Mail (Double-Opt-in).
              </p>
              <p>
                Ohne E-Mail geht es auch. Jede Vorlagen-Seite lässt sich direkt im Browser ausdrucken, dafür speichern wir nichts.
              </p>
            </Section>

            <Section heading="5. Cookies und vergleichbare Technologien">
              <p>
                Diese Website setzt <strong className="text-teal-dark">keine Cookies</strong> zur Analyse, Wiedererkennung oder Werbung. Auch kein Local Storage oder Session Storage wird zu Tracking-Zwecken genutzt. Schutzmechanismen gegen versehentliches mehrfaches Absenden eines Formulars laufen rein im Arbeitsspeicher der jeweiligen Seite und hinterlassen keine Spur im Browser.
              </p>
              <p>
                Auch die von uns genutzte Reichweitenanalyse (Umami Analytics) setzt bewusst keine Cookies und keinen Local Storage. Details siehe Abschnitt 7.
              </p>
            </Section>

            <Section heading="6. Eingebundene Dienste, Analytics, Werbung">
              <p>
                Für die Reichweitenanalyse dieser Website nutzen wir ausschließlich <strong className="text-teal-dark">Umami Analytics</strong> (Umami Software, Inc., Datenverarbeitung in der EU-Region von Umami Cloud). Umami ist eine datensparsame Alternative zu klassischen Tracking-Diensten: keine Cookies, keine Speicherung von IP-Adressen, keine personenbezogenen Profile, keine geräteübergreifende Wiedererkennung. Details siehe Abschnitt 7.
              </p>
              <p>
                Darüber hinaus binden wir <strong className="text-teal-dark">keine weiteren Dienste Dritter</strong> für Werbung, Social-Media-Plugins oder personenbezogenes Tracking ein:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>kein Google Analytics, kein Matomo, kein Hotjar</li>
                <li>keine Meta/Facebook-Pixel, keine LinkedIn- oder TikTok-Tags</li>
                <li>keine externen Schriftarten (Schriften sind lokal ausgeliefert)</li>
                <li>keine Werbe-Netzwerke</li>
                <li>keine nutzer- oder geräteübergreifenden Profile</li>
              </ul>
              <p>
                Sollte sich an der Liste etwas ändern, informieren wir dich an dieser Stelle transparent und holen, wo notwendig, deine Einwilligung ein.
              </p>
            </Section>

            <Section heading="7. Empfänger der Daten und Auftragsverarbeiter">
              <p>
                Wir geben deine Daten nur an folgende sorgfältig ausgewählte Dienstleister weiter, die für uns als Auftragsverarbeiter tätig sind (Art. 28 DSGVO):
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong className="text-teal-dark">Supabase Inc.:</strong> Datenbank und Backend für die Warteliste, die Vorlagen-Downloads, die Profil-Karten der App, das Feedback-Formular und den App-Check. Wir nutzen ausschließlich die EU-Region. Es besteht ein Auftragsverarbeitungsvertrag. Sitz: San Francisco, USA. Datenverarbeitung in der EU-Region; Übermittlung abgesichert durch EU-Standardvertragsklauseln.<br />
                  <span className="text-sm text-ink/65">Mehr: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">supabase.com/privacy</a></span>
                </li>
                <li>
                  <strong className="text-teal-dark">Vercel Inc.:</strong> Auslieferung der statischen Website-Inhalte und Server-Logfiles. Vercel betreibt Edge-Server in der EU (u. a. Frankfurt). Es besteht ein Data Processing Agreement.<br />
                  <span className="text-sm text-ink/65">Sitz: San Francisco, USA. Übermittlung auf Basis von EU-Standardvertragsklauseln. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">vercel.com/legal/privacy-policy</a></span>
                </li>
                <li>
                  <strong className="text-teal-dark">ImprovMX (Reflectiv SAS):</strong> E-Mail-Weiterleitung für eingehende Nachrichten an hallo@ronki.de. Sitz: Frankreich (EU). Personenbezogene Daten (Absender-E-Mail, Betreff) werden nur zur Weiterleitung verarbeitet und nicht gespeichert. Eingehende E-Mails werden anschließend an unser persönliches Postfach bei Google Workspace (Google Ireland Limited, Sitz Irland) zugestellt, wo sie inhaltlich gelesen und beantwortet werden. Dabei findet ein Drittlandtransfer in die USA auf Basis von EU-Standardvertragsklauseln statt.<br />
                  <span className="text-sm text-ink/65"><a href="https://improvmx.com/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">improvmx.com/privacy</a> &middot; <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">policies.google.com/privacy</a></span>
                </li>
                <li>
                  <strong className="text-teal-dark">Umami Analytics (Umami Software, Inc.):</strong> Anonyme Reichweitenanalyse unserer Website. Umami setzt keine Cookies, speichert keine IP-Adressen und erstellt keine geräteübergreifenden Profile. Erfasst werden Seitenaufrufe, Referrer (z. B. Suchmaschine, Social-Media-Plattform), Kampagnen-Angaben aus dem Link (z. B. utm_source=instagram), grobe Geo-Region (Land), Gerätetyp und Browser sowie drei Ereignisse ohne personenbezogene Inhalte: Klick auf einen Hauptbutton, erstellte Profil-Karte, Vorlagen-Download. Eine Zuordnung zu einzelnen Personen ist ausdrücklich nicht möglich. Die Daten werden nach sechs Monaten gelöscht. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verbesserung unseres Angebots). Eine Interessenabwägung ergibt: Umami setzt keine Cookies, speichert keine IP-Adressen, bildet keine geräteübergreifenden Profile und erlaubt keine Identifizierung einzelner Personen. Die Verarbeitung greift damit nur in geringfügigem Maße in deine Rechte ein, während wir ein nachvollziehbares Interesse an aggregierter Reichweitenmessung haben. Sitz: USA. Datenverarbeitung in der EU-Region von Umami Cloud.<br />
                  <span className="text-sm text-ink/65"><a href="https://umami.is/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">umami.is/privacy</a></span>
                </li>
              </ul>
              <p>
                Eine Weitergabe an andere Dritte findet nicht statt, außer wir sind gesetzlich dazu verpflichtet (z. B. auf Anordnung einer Behörde).
              </p>
            </Section>

            <Section heading="8. Datenübermittlung in Drittländer">
              <p>
                Supabase Inc. und Vercel Inc. haben ihren Hauptsitz in den USA. Wir nutzen jeweils die EU-Region (Supabase: EU-Region; Vercel: Edge-Server u. a. in Frankfurt). Ein operativer Zugriff aus den USA kann jedoch nicht vollständig ausgeschlossen werden. Die Übermittlung ist durch EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO) abgesichert.
              </p>
              <p>
                Sollte sich die Übermittlungslage ändern, informieren wir dich an dieser Stelle.
              </p>
            </Section>

            <Section heading="9. Deine Rechte als betroffene Person">
              <p>
                Nach der DSGVO hast du uns gegenüber folgende Rechte bezüglich deiner personenbezogenen Daten:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-teal-dark">Auskunft</strong> (Art. 15 DSGVO): du kannst jederzeit erfragen, welche Daten wir über dich verarbeiten.</li>
                <li><strong className="text-teal-dark">Berichtigung</strong> (Art. 16 DSGVO): unrichtige Daten werden auf deinen Wunsch korrigiert.</li>
                <li><strong className="text-teal-dark">Löschung</strong> (Art. 17 DSGVO, „Recht auf Vergessenwerden"): du kannst die Löschung verlangen.</li>
                <li><strong className="text-teal-dark">Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO).</li>
                <li><strong className="text-teal-dark">Datenübertragbarkeit</strong> (Art. 20 DSGVO): Herausgabe deiner Daten in einem strukturierten, maschinenlesbaren Format.</li>
                <li><strong className="text-teal-dark">Widerspruch</strong> (Art. 21 DSGVO): gegen Verarbeitungen auf Grundlage eines berechtigten Interesses.</li>
                <li><strong className="text-teal-dark">Widerruf deiner Einwilligung</strong> (Art. 7 Abs. 3 DSGVO): jederzeit und ohne Angabe von Gründen, mit Wirkung für die Zukunft.</li>
              </ul>
              <p>
                Um eines dieser Rechte auszuüben, reicht eine formlose Nachricht an <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">hallo@ronki.de</a>. Für die Identifizierung können wir dich um einen Nachweis bitten, da wir deine Daten ja auch nicht an Dritte herausgeben wollen.
              </p>
            </Section>

            <Section heading="10. Beschwerderecht bei einer Aufsichtsbehörde">
              <p>
                Du hast das Recht, dich mit einer Beschwerde an eine Datenschutz-Aufsichtsbehörde zu wenden, wenn du der Ansicht bist, dass wir gegen die DSGVO verstoßen. Zuständig ist in der Regel die Behörde des Bundeslandes, in dem du wohnst, oder die unseres Sitzes:
              </p>
              <address className="not-italic">
                Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
                Promenade 18<br />
                91522 Ansbach<br />
                <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">www.lda.bayern.de</a>
              </address>
              <p>
                Eine Liste der deutschen Aufsichtsbehörden findest du bei der Bundesbeauftragten für den Datenschutz:{' '}
                <a
                  href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-mustard underline-offset-4 hover:text-teal-dark break-words"
                >
                  bfdi.bund.de
                </a>
                .
              </p>
            </Section>

            <Section heading="11. Automatisierte Entscheidungen, Profiling">
              <p>
                Wir setzen keine automatisierten Entscheidungsverfahren im Sinne des Art. 22 DSGVO ein. Es findet kein Profiling statt.
              </p>
            </Section>

            <Section heading="12. Sicherheit">
              <p>
                Die Website wird ausschließlich über eine verschlüsselte TLS-Verbindung (HTTPS) ausgeliefert. Deine Daten werden auf Servern in der EU gespeichert und dort gegen unbefugten Zugriff nach aktuellem Stand der Technik geschützt.
              </p>
            </Section>

            <Section heading="13. Kinder">
              <p>
                Ronki ist für Kinder im Grundschulalter gedacht; angemeldet werden aber ausschließlich Eltern oder Erziehungsberechtigte. Diese Website richtet sich an Erwachsene. Personen unter 16 Jahren sollten ohne Zustimmung der Erziehungsberechtigten keine personenbezogenen Daten an uns übermitteln.
              </p>
            </Section>

            <Section heading="14. Änderungen dieser Erklärung">
              <p>
                Wir passen diese Datenschutzerklärung an, wenn sich Gesetze, Dienste oder Funktionen ändern. Wesentliche Änderungen kündigen wir, sofern deine E-Mail-Adresse bei uns gespeichert ist, per Nachricht an. Es gilt jeweils die Fassung mit dem oben genannten Stand.
              </p>
            </Section>

          </div>

          <div className="mt-16 border-t border-teal/15 pt-8">
            <p className="text-[0.7rem] uppercase tracking-[0.15em] text-teal/70 font-medium mb-3">
              Kurz gesagt
            </p>
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed max-w-2xl">
              Wir speichern deine E-Mail-Adresse, ausschließlich um dir am Start-Tag zu schreiben. Keine Werbung, keine Cookies, kein Verkauf an Dritte. Für eine anonyme Reichweitenanalyse nutzen wir Umami (Datenverarbeitung in der EU, keine Profile). Wenn du's dir anders überlegst, eine Mail an <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-teal-dark">hallo@ronki.de</a> reicht.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </PainterlyShell>
  );
}

function Section({
  heading,
  children,
  id,
}: {
  heading: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-24">
      <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-teal-dark">
        {heading}
      </h2>
      {children}
    </section>
  );
}
