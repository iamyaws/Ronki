/**
 * /tools/app-check — Dark Pattern Scanner V1.
 *
 * Single-page state machine with five phases:
 *   1. landing  — pitch + CTA
 *   2. entry    — pick app from curated list or type free text
 *   3. quiz     — 10 yes/no questions, one per screen
 *   4. result   — score + per-question explanations + save CTA
 *   5. saving   — submitting to Supabase
 *
 * After successful save, navigates to /tools/app-check/r/:id which is
 * a separate, read-only permalink page (AppCheckResult.tsx).
 *
 * Legal framing reminder: every assertion is the parent's, not Ronki's.
 * The ToolDisclaimer is rendered on every phase.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { AppEntry } from '../../components/AppCheck/AppEntry';
import { QuestionScreen } from '../../components/AppCheck/QuestionScreen';
import { ResultScore } from '../../components/AppCheck/ResultScore';
import { ToolDisclaimer } from '../../components/AppCheck/ToolDisclaimer';
import {
  QUESTIONS,
  calculateScore,
  isComplete,
  type AnswersMap,
} from '../../lib/app-check/questions';
import { saveEval } from '../../lib/app-check/storage';
import { ArrowRight } from '../../components/AppCheck/Icons';
import { EASE_OUT, fadeUp } from '../../lib/motion';

type Phase = 'landing' | 'entry' | 'quiz' | 'result' | 'saving';

/**
 * Forward = +1 (next question), back = -1. Drives the directional slide
 * on the question screen so going back doesn't feel like another forward.
 */
type Direction = 1 | -1;

export default function AppCheck() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('landing');
  const [appName, setAppName] = useState<string>('');
  const [curatedId, setCuratedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [questionIdx, setQuestionIdx] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [error, setError] = useState<string | null>(null);
  // Briefly disable answer buttons after a click so a double-tap can't
  // skip two questions in one motion frame.
  const [advancing, setAdvancing] = useState(false);

  const score = calculateScore(answers);
  const complete = isComplete(answers);

  function handleAnswer(value: string) {
    if (advancing) return;
    setAdvancing(true);
    const q = QUESTIONS[questionIdx];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    setDirection(1);
    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      setPhase('result');
    }
    // Re-enable shortly after the slide settles.
    setTimeout(() => setAdvancing(false), reduced ? 0 : 280);
  }

  function handleBack() {
    setDirection(-1);
    setQuestionIdx(Math.max(0, questionIdx - 1));
  }

  async function handleSave() {
    if (!complete) return;
    setPhase('saving');
    setError(null);
    const result = await saveEval({
      appName,
      appIdCurated: curatedId,
      answers,
      score,
      locale: 'de',
    });
    if (result.ok) {
      navigate(`/tools/app-check/r/${result.id}`);
    } else {
      setPhase('result');
      setError(
        result.reason === 'no-supabase'
          ? 'Speichern aktuell nicht möglich, die Verbindung zur Datenbank fehlt. Du kannst die Bewertung trotzdem als Screenshot teilen.'
          : 'Speichern hat nicht geklappt. Versuch es bitte gleich noch mal. Falls es weiter hakt, schreib uns an hallo@ronki.de.',
      );
    }
  }

  function handleRestart() {
    setPhase('entry');
    setAnswers({});
    setQuestionIdx(0);
    setDirection(1);
    setAppName('');
    setCuratedId(null);
    setError(null);
  }

  // Question slide direction. Reduced motion → no slide, just opacity.
  const slideX = reduced ? 0 : direction * 12;

  return (
    <PainterlyShell>
      <PageMeta
        title="App-Check: prüfe Kinder-Apps in zehn Fragen"
        description="Beantworte zehn Beobachtungs-Fragen über eine Kinder-App. Du bekommst eine Einschätzung der Pattern aus deiner Sicht. Kostenlos, kein Account, du bewertest."
        canonicalPath="/tools/app-check"
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink focus:outline-none focus-visible:text-ink focus-visible:underline underline-offset-4 transition-colors mb-8"
          >
            <span aria-hidden>←</span> Werkzeuge
          </Link>

          {phase === 'landing' && (
            <Landing onStart={() => setPhase('entry')} reduced={reduced} />
          )}

          {phase === 'entry' && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="space-y-10"
            >
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-4">
                  Schritt 1 von 3
                </p>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
                  Welche App willst du <em className="italic text-sage">prüfen</em>?
                </h1>
              </header>
              <AppEntry
                onContinue={({ name, curatedId }) => {
                  setAppName(name);
                  setCuratedId(curatedId);
                  setPhase('quiz');
                  setQuestionIdx(0);
                  setDirection(1);
                }}
              />
              <ToolDisclaimer variant="tool" />
            </motion.div>
          )}

          {phase === 'quiz' && (
            <div className="space-y-10">
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-2">
                  Schritt 2 von 3 · {appName}
                </p>
              </header>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={questionIdx}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: slideX }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -slideX }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  className="space-y-10"
                >
                  <QuestionScreen
                    question={QUESTIONS[questionIdx]}
                    index={questionIdx}
                    total={QUESTIONS.length}
                    current={answers[QUESTIONS[questionIdx].id]}
                    disabled={advancing}
                    onAnswer={handleAnswer}
                    onBack={handleBack}
                  />
                </motion.div>
              </AnimatePresence>
              <ToolDisclaimer variant="tool" />
            </div>
          )}

          {(phase === 'result' || phase === 'saving') && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="space-y-10"
            >
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-4">
                  Schritt 3 von 3 · Ergebnis
                </p>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
                  Deine <em className="italic text-sage">Bewertung</em>.
                </h1>
              </header>

              <ResultScore appName={appName} answers={answers} score={score} />

              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-cream/80 border border-teal/30 p-4 text-sm text-ink"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={phase === 'saving'}
                  onClick={handleSave}
                  className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {phase === 'saving' ? (
                    <>
                      <span
                        aria-hidden
                        className="inline-block w-4 h-4 rounded-full border-2 border-cream/30 border-t-cream animate-spin"
                      />
                      Speichere…
                    </>
                  ) : (
                    <>
                      Bewertung speichern und teilen
                      <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-6 py-3 text-sm text-ink font-display font-medium hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
                >
                  Andere App prüfen
                </button>
              </div>

              <ToolDisclaimer variant="result" />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

function Landing({
  onStart,
  reduced,
}: {
  onStart: () => void;
  reduced: boolean | null;
}) {
  return (
    <motion.div {...fadeUp(0, reduced)} className="space-y-10">
      <header className="space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
          Werkzeug für Eltern
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
          Welche App will <em className="italic text-sage">dein Kind</em>?
        </h1>
        <p className="text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
          Beantworte zehn Fragen aus deiner eigenen Beobachtung. Du bekommst eine
          Einschätzung, was die App-Mechaniken aus deiner Sicht über sie
          verraten. Du kannst die Bewertung speichern und teilen, wenn du willst.
        </p>
      </header>

      {/* Hero anchor: a preview of the three score bands the tool emits.
          Tells the parent at a glance "I'll come out somewhere on this
          spectrum." Uses sage / mustard-soft / teal-dark in their semantic
          places (calm / attention / dense). */}
      <ScoreBandPreview reduced={reduced} />

      <ul className="space-y-3 text-sm text-ink/70">
        <li className="flex gap-3">
          <span aria-hidden className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
          <span>Etwa drei Minuten, zehn Yes/No-Fragen.</span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
          <span>
            Ohne Anmeldung und ohne Tracking. Wir speichern weder deinen
            Namen noch deine E-Mail.
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
          <span>
            Du bewertest, wir geben dir den Rahmen. Wir machen keine Aussagen
            über einzelne Apps.
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
          <span>
            Wenn du speicherst, landet die Bewertung ohne Bezug zu deiner
            Person in unserer Datenbank.{' '}
            <a
              href="/datenschutz"
              className="text-teal underline underline-offset-2 hover:text-ink focus:outline-none focus-visible:text-ink focus-visible:decoration-2"
            >
              Was wir genau speichern
            </a>
            .
          </span>
        </li>
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-8 py-4 text-cream font-display font-bold text-base shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all"
      >
        App prüfen
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>

      <ToolDisclaimer variant="tool" />
    </motion.div>
  );
}

/**
 * Three-tile preview of the score bands the tool emits. Sits above the
 * fold on the landing page so a parent immediately understands the
 * shape of the answer they'll get back. Each tile uses the same accent
 * tokens (sage / mustard-soft / teal-dark) the actual ResultScore
 * component uses, so the visual promise matches the visual delivery.
 */
function ScoreBandPreview({ reduced }: { reduced: boolean | null }) {
  const bands = [
    {
      range: '0–2',
      label: 'Relativ ruhig',
      hint: 'Wenig Druck-Mechaniken sichtbar.',
      cardClass: 'bg-sage/15 ring-sage/35',
      labelClass: 'text-ink',
      rangeClass: 'text-teal',
    },
    {
      range: '3–5',
      label: 'Hingucken und begleiten',
      hint: 'Einige Pattern sind da, lassen sich bändigen.',
      cardClass: 'bg-mustard-soft/55 ring-mustard/40',
      labelClass: 'text-ink',
      rangeClass: 'text-teal',
    },
    {
      range: '6–10',
      label: 'Hier ist viel los',
      hint: 'Viele Druck-Mechaniken parallel.',
      cardClass: 'bg-teal-dark ring-teal-dark/40',
      labelClass: 'text-cream',
      rangeClass: 'text-cream/70',
    },
  ];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.1 }}
      className="space-y-3"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-teal font-semibold">
        Was am Ende rauskommt
      </p>
      <ol className="grid sm:grid-cols-3 gap-3 list-none p-0">
        {bands.map((b) => (
          <li
            key={b.label}
            className={`rounded-2xl ring-1 ring-inset ${b.cardClass} px-5 py-4`}
          >
            <p
              className={`text-xs font-display font-bold tabular-nums ${b.rangeClass}`}
            >
              {b.range}
            </p>
            <p className={`text-base font-display font-semibold mt-1 ${b.labelClass}`}>
              {b.label}
            </p>
            <p className={`text-xs mt-1.5 leading-snug ${b.labelClass} opacity-85`}>
              {b.hint}
            </p>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
