import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';

export default function AGB() {
  return (
    <PainterlyShell>
      <PageMeta
        title="AGB: Ronki"
        description="Allgemeine Geschäftsbedingungen für die Nutzung von Ronki."
        canonicalPath="/agb"
      />
      <main className="relative px-6 py-20 sm:py-28">
        <article className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-ink transition-colors"
          >
            <span aria-hidden>←</span> Zurück zu Ronki
          </Link>

          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-teal font-medium">
            Rechtliches
          </p>
          <h1 className="mt-4 font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink">
            Allgemeine Geschäfts&shy;bedingungen
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
            Die Spielregeln für die Nutzung von Ronki, so kurz und klar wie möglich.
          </p>
          <p className="mt-3 text-sm text-ink/60">Stand: 25. April 2026</p>

          <div className="mt-14 flex flex-col gap-12 text-[0.98rem] leading-[1.75] text-ink/85">

            <Section heading="§1 Geltungsbereich">
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Webseite ronki.de und der Web-App Ronki, betrieben von Marc Förster, Föhringer Allee 33, 85774 Unterföhring. Mit der Nutzung akzeptierst du diese Bedingungen.
              </p>
            </Section>

            <Section heading="§2 Leistungsbeschreibung">
              <p>
                Ronki ist eine Web-App, die Kindern hilft, Gefühle zu benennen, durchzuatmen und ihren Alltag mit einem digitalen Drachen-Begleiter zu gestalten. Die App befindet sich aktuell in der Public-Alpha. Über die Warteliste können sich Interessierte für den nächsten Schritt registrieren.
              </p>
              <p>
                Der Funktionsumfang kann sich bis zum Launch ändern. Ein Rechtsanspruch auf bestimmte Funktionen besteht nicht.
              </p>
            </Section>

            <Section heading="§3 Warteliste">
              <p>
                Die Eintragung auf die Warteliste ist kostenlos und unverbindlich.
              </p>
              <p>
                Wir speichern ausschließlich die E-Mail-Adresse. Diese wird nur für eine einmalige Benachrichtigung am Start-Tag verwendet.
              </p>
              <p>
                Eine Abmeldung ist jederzeit möglich, eine formlose Nachricht an <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-ink">hallo@ronki.de</a> reicht.
              </p>
            </Section>

            <Section heading="§4 Nutzung durch Kinder">
              <p>
                Ronki richtet sich an Kinder im Alter von 5–8 Jahren. Die Einrichtung und Verwaltung erfolgt durch einen Erziehungsberechtigten.
              </p>
              <p>
                Kinder nutzen die App unter Aufsicht oder mit Einverständnis der Eltern.
              </p>
            </Section>

            <Section heading="§5 Geistiges Eigentum">
              <p>
                Alle Inhalte (Texte, Illustrationen, Code, Designelemente) sind urheberrechtlich geschützt. Eine Vervielfältigung oder Weiterverwendung ohne Zustimmung ist nicht gestattet.
              </p>
            </Section>

            <Section heading="§6 Haftung">
              <p>
                Ronki wird „wie besehen" bereitgestellt. Wir übernehmen keine Garantie für ununterbrochene Verfügbarkeit.
              </p>
              <p>
                Ronki befindet sich in einer öffentlichen Alpha-Phase. Funktionen, Spielmechaniken und Speicherformate können sich kurzfristig ändern oder entfallen. Inhalte, die du oder dein Kind im Spiel anlegen (zum Beispiel Charakter-Fortschritt, Sammelbuch), können bei Versionswechseln zurückgesetzt werden, wenn dies aus technischen oder gestalterischen Gründen erforderlich ist. Wir empfehlen daher, keine unersetzlichen Inhalte ausschließlich in Ronki zu hinterlegen.
              </p>
              <p>
                Für Schäden durch die Nutzung haften wir nur bei Vorsatz oder grober Fahrlässigkeit. Dies gilt nicht für die Verletzung wesentlicher Vertragspflichten (Kardinalspflichten). In diesem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
              </p>
            </Section>

            <Section heading="§7 Änderungen der AGB">
              <p>
                Wir behalten uns vor, diese AGB anzupassen. Wesentliche Änderungen kündigen wir per E-Mail an, sofern du auf der Warteliste eingetragen bist. Die jeweils aktuelle Fassung findest du auf dieser Seite.
              </p>
            </Section>

            <Section heading="§8 Online-Streitbeilegung">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit, die du unter <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="underline decoration-mustard underline-offset-4 hover:text-ink break-words">ec.europa.eu/consumers/odr</a> erreichst. Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </Section>

            <Section heading="§9 Schlussbestimmungen">
              <p>
                Es gilt deutsches Recht.
              </p>
              <p>
                Sollten einzelne Bestimmungen unwirksam sein, bleiben die übrigen Bestimmungen davon unberührt.
              </p>
            </Section>

          </div>

          <div className="mt-16 border-t border-teal/15 pt-8">
            <p className="text-[0.7rem] uppercase tracking-[0.15em] text-teal/70 font-medium mb-3">
              Kurz gesagt
            </p>
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed max-w-2xl">
              Ronki ist kostenlos, respektvoll und für Kinder gemacht. Wir speichern nur das Nötigste und ändern diese Bedingungen nur, wenn es einen guten Grund gibt. Fragen? <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-ink">hallo@ronki.de</a>.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </PainterlyShell>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-ink">
        {heading}
      </h2>
      {children}
    </section>
  );
}
