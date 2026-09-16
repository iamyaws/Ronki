import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { FeedbackForm } from '../components/FeedbackForm';
import { EASE_OUT } from '../lib/motion';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface Concern {
  /** The question a parent would actually ask, in their words. */
  question: string;
  /** The answer, written parent-to-parent. JSX so we can link inline. */
  answer: React.ReactNode;
}

const CONCERNS: Concern[] = [
  {
    question: 'Ist das nicht nur wieder eine Bildschirm-App?',
    answer: (
      <>
        <p>
          Nein. Ronki ist bewusst so gebaut, dass er sich selbst überflüssig
          macht. Je besser eine Routine sitzt, desto leiser wird der Drache.
          Irgendwann schläft er ein und dein Kind macht den Morgen allein.
        </p>
        <p>
          Das Prinzip heißt <em className="italic text-sage">Fading Scaffolding</em>
          : echte Unterstützung zieht sich zurück, sobald das Kind sie nicht
          mehr braucht. Kein Timer, der Kinder länger hält. Keine Push-Nachricht
          am Abend. Keine Logik, die Wiederkehr belohnt.
        </p>
        <p>
          Die Forschung dahinter liest du unter{' '}
          <Link
            to="/wissenschaft"
            className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
          >
            Wissenschaft
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    question: 'Was sehe ich, was sieht mein Kind?',
    answer: (
      <>
        <p>
          Zwei getrennte Sichten. Dein Kind hat seine eigene Routinen-Ansicht:
          Drache, kleine Geschichten, die nächste Aufgabe. Kein Dashboard,
          keine Zahlen, kein Vergleich mit anderen Kindern.
        </p>
        <p>
          Du bekommst einen Eltern-Bereich: ein ruhiger Überblick über
          Stimmung und Fortschritt im Verlauf. Keine
          Minuten-genaue Überwachung, keine Aktivitäts-Heatmap. Genug, um zu
          sehen, wie es deinem Kind geht. Wenig genug, um nicht zum Kontroll-Werkzeug
          zu werden.
        </p>
      </>
    ),
  },
  {
    question: 'Was passiert mit unseren Daten?',
    answer: (
      <>
        <p>
          Ronki ist DSGVO-konform und läuft auf EU-Servern: Supabase in der
          EU-Region, Vercel mit Edge-Servern in Frankfurt. Keine Google
          Analytics, keine Plausible, keine Meta-Pixel. Keine Werbung, nie.
        </p>
        <p>
          Wir speichern so wenig wie möglich und nur, was für den Betrieb
          notwendig ist. Die vollständigen Details, inklusive Rechtsgrundlagen
          und Auftragsverarbeitern, findest du unter{' '}
          <Link
            to="/datenschutz"
            className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
          >
            Datenschutz
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    question: 'Warum keine Streaks, keine In-App-Käufe, keine Werbung?',
    answer: (
      <>
        <p>
          Weil das alles Dark Patterns sind, die bei Kindern besonders gut
          funktionieren. Streaks, die reißen, machen ein schlechtes Gewissen.
          In-App-Käufe trainieren Impulskauf-Verhalten. Werbung finanziert
          sich immer über die Aufmerksamkeit eines Kindes.
        </p>
        <p>
          Ronki setzt stattdessen auf intrinsische Motivation: das Kind
          entscheidet selbst, spürt eigene Kompetenz, erlebt Zugehörigkeit zum
          Drachen. Das hält länger als jeder Streak-Zähler.
        </p>
        <p>
          Die Quellen, auf die wir uns dabei stützen, findest du unter{' '}
          <Link
            to="/wissenschaft"
            className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
          >
            Wissenschaft
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    question: 'Was kostet Ronki?',
    answer: (
      <>
        <p>
          Aktuell ist Ronki in früher Alpha und kostenlos. Wenn es später
          etwas kostet, dann transparent als Familien-Abo mit einem klaren
          Preis. Kein Freemium-Druck, keine Premium-Drachen, keine
          versteckten Kosten im Spiel.
        </p>
        <p>
          Wir bauen Ronki nicht, um die Aufmerksamkeit deines Kindes zu
          verkaufen. Das Geschäftsmodell muss zum Versprechen passen, sonst
          zerreißt es früher oder später beides.
        </p>
        <p>
          Ronki kostet aktuell nichts und nimmt nichts. Wer trotzdem schon
          jetzt unterstützen will, kann uns auf{' '}
          <a
            href="https://ko-fi.com/ronkiapp"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
          >
            Ko-fi
          </a>{' '}
          eine Kugel Eis für Louis spendieren. Freiwillig, ohne
          Gegenleistung, einmalig. Für uns ist das aktuell die ehrlichste
          Monetarisierung: wer's mag und kann, gibt was. Wer nicht, ist
          genauso willkommen.
        </p>
      </>
    ),
  },
  {
    question: 'Ist das nicht noch unfertig?',
    answer: (
      <>
        <p>
          Doch, wir sind in Alpha. Wir öffnen Ronki in kleinen Gruppen und
          bauen mit echtem Feedback weiter. Es gibt Kanten, Lücken, Dinge, die
          wir selbst noch nicht lieben.
        </p>
        <p>
          Wenn ihr Probleme findet, wollen wir davon hören. Eine formlose Mail
          an{' '}
          <a
            href="mailto:hallo@ronki.de"
            className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
          >
            hallo@ronki.de
          </a>{' '}
          reicht. Wir lesen jede.
        </p>
      </>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FuerEltern() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Für Eltern: Ronki"
        description="Die Fragen, die sich Eltern stellen, bevor sie einer Kinder-App vertrauen. Ehrliche Antworten zu Bildschirmzeit, Daten, Kosten und Dark Patterns."
        canonicalPath="/fuer-eltern"
        ogImage="/og-fuer-eltern.jpg"
      />

      {/* ── Hero ── */}
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
              Für Eltern
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.04] tracking-tight text-ink">
              Die Fragen, die ihr euch stellt.{' '}
              <em className="italic text-sage">Ehrliche Antworten.</em>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
              className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed"
            >
              Wir kennen das Gefühl. Noch eine Kinder-App, die Gutes verspricht
              und das Gegenteil tut. Ronki ist anders gebaut: kein
              Routine-Tracker, sondern ein Begleiter für ein tägliches Ritual,
              das eurem Kind gehört. Hier reden wir deshalb nicht über
              Features, sondern über die Dinge, die ihr wirklich wissen wollt,
              bevor ihr Ronki in die Hände eures Kindes gebt.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Concerns (one per section) ── */}
      <section
        className="px-6 pb-24 sm:pb-28"
        aria-labelledby="concerns-heading"
      >
        <h2 id="concerns-heading" className="sr-only">
          Die Fragen, die Eltern stellen
        </h2>
        <div className="max-w-3xl mx-auto flex flex-col gap-16 sm:gap-20">
          {CONCERNS.map((c, i) => (
            <motion.article
              key={c.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: EASE_OUT }}
            >
              <div className="flex items-baseline gap-4 mb-5">
                <span className="font-display font-semibold text-xs text-teal/55 tracking-[0.2em]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-teal/15" aria-hidden />
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-[1.15] tracking-tight text-ink mb-5">
                {c.question}
              </h2>
              <div className="flex flex-col gap-4 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
                {c.answer}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Personal close: Wer baut das? ── */}
      <section
        className="px-6 py-24 sm:py-28 bg-cream/40"
        aria-labelledby="maker-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-6">
              Wer baut das?
            </p>
            <h2
              id="maker-heading"
              className="font-display font-bold text-3xl sm:text-4xl leading-[1.08] tracking-tight text-ink mb-6"
            >
              Ein Vater. Ein Sohn. Ein Drache.
            </h2>
            <div className="flex flex-col gap-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
              <p>
                Ronki wird von Marc Förster gebaut, gemeinsam mit seinem Sohn
                Louis. Louis ist in der ersten Klasse, Louis testet jede
                Version, Louis sagt ehrlich, was er doof findet. Das prägt,
                was am Ende in der App landet und was nicht.
              </p>
              <p>
                Mehr zur Geschichte dahinter, und warum Marc das überhaupt
                macht, steht im Abschnitt{' '}
                <Link
                  to="/#ueber-mich-heading"
                  className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
                >
                  Über den Macher
                </Link>{' '}
                auf der Startseite.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 sm:py-28" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="rounded-3xl border border-teal/15 bg-cream/60 backdrop-blur-sm p-8 sm:p-10"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-5">
              Helft uns, den nächsten Artikel zu planen
            </p>
            <h2
              id="cta-heading"
              className="font-display font-bold text-2xl sm:text-3xl leading-[1.12] tracking-tight text-ink mb-5"
            >
              Welche Frage haben wir nicht beantwortet?
            </h2>
            <p className="text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl mb-8">
              Der Ratgeber wächst mit den Fragen, die wir von Eltern bekommen.
              Schreibt uns, was hier noch fehlt, welche Sorge euch gerade
              umtreibt oder welches Thema ihr als nächstes lesen wollt. Wir
              antworten persönlich und planen damit, worüber wir als Nächstes
              schreiben.
            </p>
            <FeedbackForm source="fuer-eltern" />
            <p className="text-xs text-ink/55 mt-6 pt-6 border-t border-teal/10 leading-relaxed">
              Lieber per E-Mail? Schreibt direkt an{' '}
              <a
                href="mailto:hallo@ronki.de"
                className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
              >
                hallo@ronki.de
              </a>
              . Landet beim gleichen Marc, wird gleich gelesen.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
