import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { FeedbackForm } from '../components/FeedbackForm';
import { FAQPageSchema } from '../components/JsonLd';
import { EASE_OUT } from '../lib/motion';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  title: string;
  eyebrow: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    eyebrow: 'Kapitel 1',
    title: 'Zum Produkt',
    items: [
      {
        q: 'Ist Ronki eine App?',
        a: 'Ronki ist eine Web-App. Sie läuft direkt im Browser und lässt sich mit einem Tippen auf dem Startbildschirm installieren. Kein Download aus einem App Store, keine versteckten Berechtigungen.',
      },
      {
        q: 'Ab welchem Alter ist Ronki geeignet?',
        a: 'Ronki ist für Kinder zwischen 5 und 8 Jahren gedacht, also Vorschule und frühe Grundschule. In dieser Phase fängt ein Kind an, eigene Gefühle zu benennen und mit ihnen umzugehen. Genau dort setzt Ronki an.',
      },
      {
        q: 'Braucht mein Kind ein eigenes Gerät?',
        a: 'Nein. Ronki funktioniert auf dem Familien-Tablet oder einem geteilten Handy. Mehrere Kinder können jeweils ein eigenes Profil nutzen.',
      },
      {
        q: 'Funktioniert Ronki offline?',
        a: 'Ja. Als Progressive Web App läuft Ronki auch ohne Internetverbindung. Die Routinen funktionieren auch unterwegs, ohne WLAN, ohne Empfang.',
      },
      {
        q: 'Auf welchen Geräten läuft Ronki?',
        a: 'Ronki läuft auf iPhone, iPad, Android-Geräten und im Desktop-Browser. Ihr seid nicht auf eine Plattform festgelegt.',
      },
    ],
  },
  {
    eyebrow: 'Kapitel 2',
    title: 'Zum Kind',
    items: [
      {
        q: 'Was passiert, wenn mein Kind einen Tag verpasst?',
        a: 'Nichts reißt. Ronki hat keine Streaks und keine Strafen. Morgen wird einfach weitergemacht. Forschung zeigt: Gewohnheiten brauchen Wiederholung, nicht Druck.',
      },
      {
        q: 'Mein Kind hat Legasthenie oder lernt anders. Passt Ronki?',
        a: 'Ronki ist bewusst leselastarm aufgebaut: große Schrift, klare Icons, wenig Text. Ein Audio-Feature, das Aufgaben laut vorliest, ist in Vorbereitung.',
      },
      {
        q: 'Was, wenn mein Kind das Interesse verliert?',
        a: 'Ronki passt sich an. Der Drache reduziert seinen Input, wird leiser, meldet sich seltener. Das Ziel ist nicht, Aufmerksamkeit zu halten, sondern sich selbst überflüssig zu machen.',
      },
      {
        q: 'Können mehrere Kinder Ronki gemeinsam nutzen?',
        a: 'Ja. Jedes Kind bekommt ein eigenes Profil, geschützt und getrennt. Routinen, Fortschritt und Begleiter bleiben pro Kind individuell.',
      },
    ],
  },
  {
    eyebrow: 'Kapitel 3',
    title: 'Für Eltern',
    items: [
      {
        q: 'Was sehe ich als Elternteil?',
        a: 'Einen Eltern-Bereich mit ruhigen Stimmungs-Trends, ohne Überwachung und ohne Mikromanagement. Dieser Bereich kommt in den nächsten Wochen.',
      },
      {
        q: 'Kann ich bestimmen, was mein Kind macht?',
        a: 'Ja. Eltern richten die Routinen einmal ein und legen den Rahmen fest. Im Alltag wählt das Kind, was als Nächstes dran ist.',
      },
      {
        q: 'Gibt es eine Elternzeit oder Bildschirmzeit-Limitierung?',
        a: 'Geplant sind sanfte Hinweise, etwa wenn das Kind ungewöhnlich lange in der App bleibt. Eine Zwangsabschaltung gibt es nicht. Diese Entscheidung liegt bei euch als Familie.',
      },
    ],
  },
  {
    eyebrow: 'Kapitel 4',
    title: 'Zu Daten und Privatsphäre',
    items: [
      {
        q: 'Was speichert Ronki?',
        a: 'So wenig wie möglich. Die E-Mail-Adresse, falls ihr über den Start benachrichtigt werden wollt. Routinen-Daten liegen lokal auf dem Gerät. Der Fortschritt wird in einer EU-Datenbank gesichert. Details stehen in unserer Datenschutzerklärung.',
      },
      {
        q: 'Wo werden Daten gespeichert?',
        a: 'Ausschließlich in der EU. Wir nutzen Supabase in Frankfurt, Vercel Edge und Plausible Analytics (Estland). Keine Cookies, keine personenbezogenen Profile, keine Werbe-Pixel, nur eine aggregierte anonyme Reichweitenanalyse.',
      },
      {
        q: 'Kann ich meine Daten löschen?',
        a: 'Jederzeit. Eine kurze Mail an hallo@ronki.de reicht. Wir löschen alles, was wir über euch gespeichert haben.',
      },
    ],
  },
  {
    eyebrow: 'Kapitel 5',
    title: 'Preis und Zugang',
    items: [
      {
        q: 'Was kostet Ronki?',
        a: 'Aktuell ist Ronki in der Alpha kostenlos. Wenn es später etwas kostet, dann transparent und ehrlich, ohne versteckte In-App-Käufe.',
      },
      {
        q: 'Wie komme ich an die frühe Version?',
        a: 'Auf der Startseite eintragen und bei der Frage nach Feedback-Bereitschaft „Ja, gern" wählen. Ihr bekommt dann einen direkten Link zur App.',
      },
      {
        q: 'Was bedeutet „Alpha"?',
        a: 'Eine frühe Version. Sie funktioniert, hat aber noch Ecken und Kanten. Daten können sich ändern, einzelne Features werden umgebaut. Über Rückmeldungen freuen wir uns sehr.',
      },
    ],
  },
];

/* Flattened list for JSON-LD schema */
const ALL_ITEMS = GROUPS.flatMap((g) =>
  g.items.map((it) => ({ question: it.q, answer: it.a })),
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FAQ_Page() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Häufige Fragen zu Ronki"
        description="Antworten auf die häufigsten Fragen von Eltern zu Ronki: Geräte, Alter, Datenschutz, Preis und was das Alpha-Programm bedeutet."
        canonicalPath="/faq"
        ogImage="/og-faq.jpg"
      />
      <FAQPageSchema items={ALL_ITEMS} />

      {/* ─────────── Hero ─────────── */}
      <section className="px-6 pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors mb-10"
            >
              <span aria-hidden>&larr;</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Häufige Fragen
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.04] tracking-tight text-ink">
              Alles, was Eltern fragen.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Wenn eure Frage hier fehlt, schreibt uns einfach an{' '}
              <a
                href="mailto:hallo@ronki.de"
                className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
              >
                hallo@ronki.de
              </a>
              . Wir antworten persönlich.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Groups ─────────── */}
      {GROUPS.map((group, groupIdx) => (
        <FaqSection
          key={group.title}
          group={group}
          alt={groupIdx % 2 === 1}
          baseIndex={GROUPS.slice(0, groupIdx).reduce(
            (sum, g) => sum + g.items.length,
            0,
          )}
        />
      ))}

      {/* ─────────── Closing ─────────── */}
      <section className="px-6 py-24 sm:py-28 border-t border-teal/10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-6">
              Noch Fragen?
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl leading-[1.1] tracking-tight text-ink mb-6">
              Eure Frage fehlt hier? Schreibt sie uns.
            </h2>
            <p className="text-base sm:text-lg text-ink/75 leading-relaxed mb-10 max-w-xl mx-auto">
              Wir lesen jede Nachricht selbst. Ohne Ticket-System, ohne Chatbot, ohne Warteschleife. Eure Frage landet in der Liste, aus der wir den nächsten FAQ-Eintrag schreiben.
            </p>
            <div className="max-w-xl mx-auto text-left">
              <FeedbackForm
                source="faq"
                label="Was würdet ihr noch gerne wissen?"
                placeholder={'Zum Beispiel: \u201EFunktioniert Ronki offline?\u201C oder \u201EWie geht ihr mit mehreren Kindern um?\u201C'}
              />
            </div>
            <p className="text-xs text-ink/55 mt-8 max-w-xl mx-auto leading-relaxed">
              Lieber per E-Mail? Dann schreibt direkt an{' '}
              <a
                href="mailto:hallo@ronki.de"
                className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
              >
                hallo@ronki.de
              </a>
              . Landet bei Marc persönlich.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
              <Link
                to="/"
                className="text-ink/75 hover:text-ink transition-colors underline decoration-teal/30 underline-offset-4 hover:decoration-teal"
              >
                Zurück zur Startseite
              </Link>
              <Link
                to="/fuer-eltern"
                className="text-ink/75 hover:text-ink transition-colors underline decoration-teal/30 underline-offset-4 hover:decoration-teal"
              >
                Für Eltern
              </Link>
              <Link
                to="/wie-es-funktioniert"
                className="text-ink/75 hover:text-ink transition-colors underline decoration-teal/30 underline-offset-4 hover:decoration-teal"
              >
                Wie Ronki funktioniert
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

/* ------------------------------------------------------------------ */
/* Section component with per-group accordion state                    */
/* ------------------------------------------------------------------ */

function FaqSection({
  group,
  alt,
  baseIndex,
}: {
  group: FaqGroup;
  alt: boolean;
  baseIndex: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const headingId = `faq-group-${group.title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section
      className={`px-6 py-20 sm:py-24 border-t border-teal/10 ${alt ? 'bg-cream/40' : ''}`}
      aria-labelledby={headingId}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="mb-10"
        >
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-4">
            {group.eyebrow}
          </p>
          <h2
            id={headingId}
            className="font-display font-bold text-3xl sm:text-4xl leading-[1.08] tracking-tight text-ink"
          >
            {group.title}
          </h2>
        </motion.div>

        <div className="space-y-3">
          {group.items.map((item, i) => {
            const isOpen = open === i;
            const globalIdx = baseIndex + i + 1;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
                className="rounded-2xl border border-teal/10 bg-cream/60 backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`${headingId}-panel-${i}`}
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span
                      className="font-display font-semibold text-xs text-teal/55 tracking-[0.15em] shrink-0"
                      aria-hidden
                    >
                      {String(globalIdx).padStart(2, '0')}
                    </span>
                    <span className="font-display font-bold text-ink text-base sm:text-lg leading-snug">
                      {item.q}
                    </span>
                  </span>
                  <span
                    className="text-ink/40 text-xl shrink-0 transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${headingId}-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                      <p className="px-6 pb-6 pl-[4.25rem] text-sm sm:text-base text-ink/70 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
