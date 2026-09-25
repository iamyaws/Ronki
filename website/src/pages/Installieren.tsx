import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { WaitlistCTA } from '../components/WaitlistCTA';
import { LAUNCH_STATE, getLaunchCopy } from '../config/launch-state';
import { EASE_OUT } from '../lib/motion';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface DeviceGuide {
  id: string;
  icon: string;
  label: string;
  subtitle: string;
  /** One or two introductory lines shown above the numbered steps. */
  intro: string;
  steps: string[];
  /** Optional callout rendered below the steps (alternatives, caveats). */
  note?: string;
}

const DEVICES: DeviceGuide[] = [
  {
    id: 'iphone',
    icon: '📱',
    label: 'iPhone / iPad',
    subtitle: 'iOS und iPadOS',
    intro:
      'Wichtig: Ronki lässt sich auf iPhone und iPad nur mit Safari installieren. Chrome auf iOS kann aus Apple-Gründen keine Web-Apps auf den Home-Bildschirm legen. Also kurz auf Safari wechseln.',
    steps: [
      'Safari öffnen.',
      'app.ronki.de in die Adresszeile eingeben und die Seite laden.',
      'Unten mittig auf das Teilen-Symbol tippen (das Quadrat mit dem Pfeil nach oben).',
      'In der Liste nach unten scrollen und auf „Zum Home-Bildschirm" tippen.',
      'Oben rechts auf „Hinzufügen" tippen. Das Ronki-Symbol liegt jetzt auf eurem Home-Bildschirm.',
    ],
  },
  {
    id: 'android-chrome',
    icon: '🤖',
    label: 'Android mit Chrome',
    subtitle: 'Die häufigste Android-Variante',
    intro:
      'Chrome erkennt Ronki als installierbare App und schlägt das meist von selbst vor. Falls nicht, gibt es den ⋮-Weg als Fallback.',
    steps: [
      'Chrome öffnen.',
      'app.ronki.de in die Adresszeile eingeben.',
      'Nach ein paar Sekunden erscheint unten ein Fenster: „Ronki installieren". Darauf tippen.',
      'Falls das Fenster nicht von selbst kommt: oben rechts auf das ⋮-Menü, dann auf „App installieren" oder „Zum Startbildschirm hinzufügen".',
      'Bestätigen. Das Ronki-Symbol liegt jetzt auf eurem Startbildschirm.',
    ],
    note:
      'Samsung Internet und Firefox auf Android funktionieren ähnlich: jeweils das Menü öffnen („Seite hinzufügen zu" bei Samsung, „Installieren" bei Firefox) und Ronki auf den Startbildschirm legen.',
  },
  {
    id: 'fire-tablet',
    icon: '🔥',
    label: 'Amazon Fire Tablet',
    subtitle: 'Die versteckte Option mit zwei Wegen',
    intro:
      'Fire Tablets nutzen standardmäßig den Silk-Browser. Silk kann Ronki installieren, hat aber Einschränkungen bei Offline-Nutzung. Der einfachere Weg: Chrome aus dem Amazon Appstore laden (kostenlos), dann wie bei Android vorgehen.',
    steps: [
      'Amazon Appstore auf dem Fire Tablet öffnen.',
      'Nach „Chrome" suchen und kostenlos installieren.',
      'Chrome öffnen, app.ronki.de eingeben.',
      'Wie bei Android mit Chrome: auf „Installieren" tippen oder über ⋮-Menü „Zum Startbildschirm".',
    ],
    note:
      'Lieber ohne Chrome? Alternativ in Silk app.ronki.de öffnen, ⋮-Menü antippen und „Zum Startbildschirm hinzufügen" wählen. Auf sehr alten Fire-Tablets (Generation 5 oder älter) läuft Ronki möglicherweise langsamer. Wenn etwas stottert: schreibt uns, wir testen laufend nach.',
  },
  {
    id: 'desktop',
    icon: '💻',
    label: 'Desktop',
    subtitle: 'Chrome, Edge, Brave auf Mac oder Windows',
    intro:
      'Auch auf dem Rechner lässt sich Ronki als eigenständiges Fenster installieren, falls Kind und Eltern gemeinsam am Laptop damit arbeiten wollen.',
    steps: [
      'Chrome, Edge oder Brave öffnen.',
      'app.ronki.de in die Adresszeile eingeben.',
      'Rechts in der Adresszeile erscheint ein kleines Installations-Symbol (ein Monitor mit Pfeil oder ein ⊞-Kästchen).',
      'Darauf klicken und mit „Installieren" bestätigen.',
      'Ronki öffnet sich jetzt in einem eigenen Fenster, ohne Browser-Leiste.',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Installieren() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Ronki installieren · iPhone, Android, Fire Tablet, Desktop"
        description="So legt ihr Ronki auf den Startbildschirm: Schritt-für-Schritt-Anleitung für iPhone, iPad, Android (Chrome, Samsung, Firefox), Amazon Fire Tablet und Desktop. Ohne App-Store, ohne Download."
        canonicalPath="/installieren"
      />

      {/* ─────────── Hero ─────────── */}
      <section className="px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors mb-8"
            >
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Ronki installieren
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
              Einmal antippen,{' '}
              <em className="italic text-sage whitespace-nowrap">fertig</em>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Ronki läuft direkt im Browser. Kein App-Store, kein Download, keine APK. Ihr öffnet einmal <span className="font-display font-semibold text-ink">app.ronki.de</span> und legt die Seite einmalig auf den Startbildschirm. Danach fühlt sich Ronki an wie jede andere App auf eurem Gerät.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Device picker ─────────── */}
      <section className="px-6 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60 font-semibold mb-5">
            Womit möchtet ihr starten?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {DEVICES.map((d, i) => (
              <motion.a
                key={d.id}
                href={`#${d.id}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_OUT }}
                whileHover={{ y: -2 }}
                className="flex flex-col items-start gap-1.5 rounded-2xl border border-teal/15 bg-cream/60 backdrop-blur-sm p-4 sm:p-5 hover:border-teal/40 hover:bg-cream transition-colors shadow-sm"
              >
                <span className="text-2xl" aria-hidden>
                  {d.icon}
                </span>
                <span className="font-display font-bold text-sm sm:text-base text-ink leading-tight">
                  {d.label}
                </span>
                <span className="text-[0.7rem] sm:text-xs text-ink/55 font-medium leading-snug">
                  {d.subtitle}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Per-device sections ─────────── */}
      <div className="px-6 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto flex flex-col gap-16 sm:gap-20">
          {DEVICES.map((d) => (
            <motion.section
              key={d.id}
              id={d.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="scroll-mt-28"
              aria-labelledby={`${d.id}-heading`}
            >
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {d.icon}
                </span>
                <div>
                  <h2
                    id={`${d.id}-heading`}
                    className="font-display font-bold text-2xl sm:text-3xl text-ink leading-tight tracking-tight"
                  >
                    {d.label}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.15em] text-teal font-semibold mt-1">
                    {d.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-base text-ink/75 leading-relaxed mb-8 max-w-2xl">
                {d.intro}
              </p>

              <ol className="install-steps">
                {d.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              {d.note && (
                <aside className="mt-6 rounded-2xl bg-mustard/10 border-l-4 border-mustard px-5 py-4 text-sm text-ink/80 leading-relaxed">
                  {d.note}
                </aside>
              )}
            </motion.section>
          ))}
        </div>
      </div>

      {/* ─────────── Die ersten 10 Minuten ─────────── */}
      <section
        className="px-6 py-20 sm:py-24 bg-cream/40 border-t border-teal/10"
        aria-labelledby="first-steps-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60 font-semibold mb-5">
              Die ersten 10 Minuten
            </p>
            <h2
              id="first-steps-heading"
              className="font-display font-bold text-3xl sm:text-4xl leading-[1.08] tracking-tight text-ink mb-8"
            >
              Ronki ist installiert. Was jetzt?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <article>
                <h3 className="font-display font-bold text-lg text-ink mb-3">
                  Als Elternteil
                </h3>
                <ol className="install-steps install-steps--compact">
                  <li>App öffnen, Elternprofil anlegen (der Vorname genügt).</li>
                  <li>Kind-Profil anlegen: Name, Alter, Lieblings-Farbe des Drachen.</li>
                  <li>
                    Eine konkrete Routine auswählen. Empfehlung zum Start:{' '}
                    <strong>Morgen oder Abend</strong>. Nicht beides gleichzeitig.
                  </li>
                  <li>Ein oder zwei Schritte in dieser Routine reichen, bevor dein Kind es einmal selbst probiert.</li>
                </ol>
              </article>
              <article>
                <h3 className="font-display font-bold text-lg text-ink mb-3">
                  Mit deinem Kind
                </h3>
                <ol className="install-steps install-steps--compact">
                  <li>Dein Kind setzt sich dazu. Ronki zeigt den Drachen und eine kurze Begrüßung.</li>
                  <li>Zusammen einmal durch die Routine klicken, ohne Zeitdruck.</li>
                  <li>Ab dem nächsten Morgen führt Ronki, nicht mehr du. Dein Kind bestimmt Tempo und Reihenfolge.</li>
                </ol>
              </article>
            </div>
            <div className="mt-10 rounded-2xl bg-teal-dark text-cream px-6 py-5 text-sm leading-relaxed">
              <strong className="text-mustard font-display">Wichtig:</strong>{' '}
              nicht am ersten Tag zehn Routinen anlegen. Ronki ist auf eine
              oder zwei ausgelegt, mit dem Ziel, dass sie nach ein paar Wochen
              sitzt. Der Drache wird dann leiser, nicht lauter.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="px-6 py-20 sm:py-24 border-t border-teal/10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="rounded-3xl bg-teal-dark text-cream p-8 sm:p-10"
            style={{ boxShadow: '0 24px 48px -24px rgba(4,8,18,0.35)' }}
          >
            <div className="grid sm:grid-cols-[1.1fr_1fr] gap-10 items-center">
              <div>
                {(() => {
                  const copy = getLaunchCopy(LAUNCH_STATE);
                  const isInstall = copy.ctaAction === 'install';
                  return (
                    <>
                      <p className="text-[0.7rem] uppercase tracking-[0.2em] text-mustard/80 font-semibold mb-4">
                        {isInstall ? 'Direkt loslegen' : 'Noch keinen Frühzugang?'}
                      </p>
                      <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-4">
                        {isInstall ? 'Ronki öffnet direkt im Browser.' : 'Trag dich ein, wir melden uns.'}
                      </h2>
                      <p
                        className="text-cream/70 leading-relaxed text-sm sm:text-base"
                        style={{
                          hyphens: 'manual',
                          WebkitHyphens: 'manual',
                          MozHyphens: 'manual',
                        }}
                      >
                        {isInstall
                          ? 'Public\u2011Alpha. Kein Store, kein Download, keine Anmeldung. Wenn etwas klemmt, schreibt an hallo@ronki.de. Landet direkt bei Marc.'
                          : 'Wir öffnen Ronki in kleinen Gruppen. Meist innerhalb von 48 Stunden nach Eintrag. Kein Spam, kein Store, keine Werbung.'}
                      </p>
                    </>
                  );
                })()}
              </div>
              <div className="text-cream">
                <WaitlistCTA launchState={LAUNCH_STATE} onDarkBackground />
              </div>
            </div>
          </motion.div>
          <p className="mt-8 text-sm text-ink/60 text-center leading-relaxed">
            Fragen zur Installation? Schreib direkt an{' '}
            <a
              href="mailto:hallo@ronki.de"
              className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal"
            >
              hallo@ronki.de
            </a>
            . Landet bei Marc persönlich.
          </p>
        </div>
      </section>

      {/* This page already ends on its own dark install CTA card. */}
      <Footer closing={false} />

      {/* Install-specific list styling — numbered, teal accents */}
      <style>{`
        .install-steps {
          counter-reset: install-item;
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .install-steps > li {
          counter-increment: install-item;
          position: relative;
          padding-left: 3rem;
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgb(26 32 34 / 0.85);
          text-wrap: pretty;
        }
        .install-steps > li::before {
          content: counter(install-item, decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0.05em;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 0.9rem;
          color: #0544B0;
          letter-spacing: 0.08em;
          width: 2.25rem;
          text-align: left;
        }
        .install-steps > li strong {
          color: #040812;
          font-weight: 700;
        }
        .install-steps--compact > li {
          font-size: 0.95rem;
          padding-left: 2.4rem;
          line-height: 1.55;
        }
        .install-steps--compact > li::before {
          font-size: 0.8rem;
          width: 1.8rem;
        }
      `}</style>
    </PainterlyShell>
  );
}
