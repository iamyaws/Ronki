import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';

export default function Impressum() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Impressum: Ronki"
        description="Anbieterkennzeichnung nach § 5 DDG und § 18 MStV."
        canonicalPath="/impressum"
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
            Impressum
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
            Anbieterkennzeichnung gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag (MStV).
          </p>
          <p className="mt-3 text-sm text-ink/60">Stand: 25. April 2026</p>

          <div className="mt-14 flex flex-col gap-12 text-[0.98rem] leading-[1.75] text-ink/85">

            <Section heading="Diensteanbieter">
              <address className="not-italic">
                Marc Förster<br />
                Föhringer Allee 33<br />
                85774 Unterföhring<br />
                Deutschland
              </address>
            </Section>

            <Section heading="Kontakt">
              <p>
                E-Mail: <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-ink">hallo@ronki.de</a><br />
                Telefon: <a href="tel:+4917657904421" className="underline decoration-mustard underline-offset-4 hover:text-ink">+49 176 57904421</a>
              </p>
            </Section>

            <Section heading="Umsatzsteuer-Identifikationsnummer">
              <p className="text-sm text-ink/65">
                Nicht vorhanden (Kleinunternehmerregelung nach § 19 UStG).
              </p>
            </Section>

            <Section heading="Berufsrechtliche Angaben">
              <p className="text-sm text-ink/65">
                Nicht zutreffend. Es wird kein reglementierter Beruf im Sinne des § 5 Abs. 1 Nr. 5 DDG ausgeübt.
              </p>
            </Section>

            <Section heading="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
              <address className="not-italic">
                Marc Förster<br />
                Föhringer Allee 33<br />
                85774 Unterföhring
              </address>
            </Section>

            <Section heading="EU-Streitschlichtung">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-mustard underline-offset-4 hover:text-ink break-words"
                >
                  ec.europa.eu/consumers/odr
                </a>
                .
              </p>
              <p>
                Unsere E-Mail-Adresse findest du oben unter „Kontakt".
              </p>
            </Section>

            <Section heading="Verbraucherstreitbeilegung nach § 36 VSBG">
              <p>
                Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </Section>

            <Section heading="Haftung für Inhalte">
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach den §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p>
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </Section>

            <Section heading="Haftung für Links">
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren nicht erkennbar.
              </p>
              <p>
                Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>
            </Section>

            <Section heading="Urheberrecht">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Verfassers.
              </p>
              <p>
                Soweit die Inhalte auf dieser Seite nicht von uns erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Solltest du trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen kurzen Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </Section>

            <Section heading="Bildnachweise & KI-Transparenz">
              <p>
                Große Teile der Bild-Inhalte auf dieser Website, insbesondere die Drachen-Figur Ronki, die Szenen-Bilder (Morgenwald, Naschgarten, Sternenmeer, Sonnenglast, Wolkengrat) sowie die sieben Begleit-Charaktere (Sternenweberin, Tiefentaucherin, Brückenbauer, Flackerfuchs, Lichtbringerin, Pilzhüter, Windreiterin), wurden mit Unterstützung generativer KI-Systeme erstellt, namentlich Midjourney (midjourney.com) und Google Gemini / Imagen. Wir haben die Ergebnisse ausgewählt, nachbearbeitet, zusammengestellt und in den gestalterischen Gesamtkontext dieser Website gesetzt.
              </p>
              <p>
                Nach aktueller Rechtslage genießen rein KI-generierte Bilder in Deutschland grundsätzlich keinen urheberrechtlichen Schutz (§ 2 Abs. 2 UrhG), da es an einer persönlichen geistigen Schöpfung fehlt. Soweit wir durch eigene kreative Bearbeitung, Auswahl oder Montage ein schutzfähiges Werk geschaffen haben, beanspruchen wir das Urheberrecht ausschließlich an dieser Bearbeitung, nicht am KI-Ausgangsbild.
              </p>
              <p>
                Die abgebildeten Figuren und Szenen stellen keine realen Personen, Orte oder Ereignisse dar. Sollte dennoch unbeabsichtigt eine Ähnlichkeit mit realen Personen oder geschützten Werken entstanden sein, bitten wir um einen kurzen Hinweis an <a href="mailto:hallo@ronki.de" className="underline decoration-mustard underline-offset-4 hover:text-ink">hallo@ronki.de</a>. Wir prüfen und ersetzen entsprechende Inhalte umgehend.
              </p>
              <p>
                Das Foto von Marc Förster im „Über den Macher"-Bereich ist ein echtes Personenfoto und nicht KI-generiert. Avatar-Grafiken auf älteren oder Test-Varianten der Website sind Platzhalter und zeigen keine realen Personen; etwaige Aussagen daneben stehen in keinem Bezug zu den abgebildeten Avataren.
              </p>
            </Section>

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
