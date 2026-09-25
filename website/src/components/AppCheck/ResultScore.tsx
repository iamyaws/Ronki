/**
 * Result visual: score band gauge plus per-question explanations for
 * each "problematic" answer the parent gave.
 *
 * The framing is always "Aus deiner Sicht" — never "this app is X".
 *
 * Motion: each section fades up on scroll-in (whileInView once=true) so
 * the long result body has rhythm instead of dumping all at once. The
 * score number quietly counts up from 0 to N — intentional, not
 * celebratory; it reads "this number was calculated from your answers"
 * rather than "ta-da". Reduced-motion users skip all of this and see
 * the final state immediately.
 */

import { useEffect, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import {
  QUESTIONS,
  summariseAnswers,
  type AnswersMap,
} from '../../lib/app-check/questions';
import {
  BAND_VIGNETTES,
  bandForScore,
  type ScoreBandDef,
} from '../../lib/app-check/score';
import { BandActions } from './BandActions';
import { TimeCostProjection } from './TimeCostProjection';
import { ShareCard } from './ShareCard';
import { EASE_OUT } from '../../lib/motion';

interface Props {
  appName: string;
  answers: AnswersMap;
  score: number;
}

// Band tones use only defined Tailwind tokens (cream, teal, sage,
// mustard family). No "danger" colors — the tool is not a verdict.
// Severity is communicated via the actions list density, not via alarm.
const TONE_CLASSES: Record<ScoreBandDef['tone'], { bg: string; ring: string; accent: string }> = {
  sage: {
    bg: 'bg-sage/12',
    ring: 'ring-sage/25',
    accent: 'text-ink',
  },
  mustard: {
    bg: 'bg-mustard-soft/40',
    ring: 'ring-mustard/30',
    accent: 'text-ink',
  },
  serious: {
    bg: 'bg-teal-dark/8',
    ring: 'ring-teal-dark/25',
    accent: 'text-ink',
  },
};

export function ResultScore({ appName, answers, score }: Props) {
  const reduced = useReducedMotion();
  const band = bandForScore(score);
  const tone = TONE_CLASSES[band.tone];
  const stats = summariseAnswers(answers);

  // Identify which questions contributed problematic answers.
  const flaggedQuestions = QUESTIONS.filter((q) => {
    const v = answers[q.id];
    if (!v || v === 'unklar') return false;
    return q.scoreContribution(v) === 1;
  });

  // Surface the questions the parent flagged as "weiß ich nicht" as a
  // separate "you might want to look this up" section.
  const unclearQuestions = QUESTIONS.filter(
    (q) => answers[q.id] === 'unklar',
  );

  // Sparse-data handling: at 5+ unclear show a soft caveat; at 7+ the
  // band card itself is too misleading to render.
  const sparseData = stats.unclear >= 5;
  const tooSparseForBand = stats.unclear >= 7;

  // Quiet count-up on the score number. ~700ms, eased. Skipped for
  // reduced-motion users who see the final value right away.
  const scoreMotion = useMotionValue(reduced ? score : 0);
  const scoreDisplay = useTransform(scoreMotion, (v) => Math.round(v));
  const [scoreRendered, setScoreRendered] = useState(reduced ? score : 0);
  useEffect(() => {
    if (reduced) {
      setScoreRendered(score);
      return;
    }
    const controls = animate(scoreMotion, score, {
      duration: 0.7,
      ease: EASE_OUT,
    });
    const unsub = scoreDisplay.on('change', (v) => setScoreRendered(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [score, reduced, scoreMotion, scoreDisplay]);

  // Standard scroll-in fade-up for body sections. Each section fades on
  // its first time entering the viewport, then stays put.
  const sectionMotion = (delay = 0) =>
    reduced
      ? {}
      : ({
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-10%' },
          transition: { duration: 0.5, delay, ease: EASE_OUT },
        } as const);

  const vignette = !tooSparseForBand ? BAND_VIGNETTES[band.key] : null;

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Band card — hidden if data too sparse to be meaningful */}
      {!tooSparseForBand && (
        <motion.div
          {...sectionMotion(0)}
          className={`rounded-2xl ${tone.bg} ring-1 ring-inset ${tone.ring} px-7 py-8 sm:px-10 sm:py-10`}
        >
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-6xl font-display font-bold tabular-nums text-ink">
              {scoreRendered}
            </span>
            <span className="text-lg text-ink/55">/ 10 Pattern beobachtet</span>
          </div>
          <h2
            className={`font-display font-bold text-2xl sm:text-3xl leading-tight ${tone.accent} mb-3`}
          >
            {band.label}
          </h2>
          <p className="text-ink/75 leading-relaxed max-w-prose">
            {band.summary}
          </p>
        </motion.div>
      )}

      {/* Personal vignette — Marc's lived moment matched to the band so
          the score lands in a real story instead of just a number. */}
      {vignette && (
        <motion.figure
          {...sectionMotion(0.05)}
          className="border-l-4 border-mustard pl-6 py-2 italic"
        >
          <blockquote className="text-lg sm:text-xl text-ink leading-snug max-w-prose">
            „{vignette.quote}"
          </blockquote>
          <figcaption className="mt-3 text-sm text-ink/60 not-italic">
            — {vignette.attribution}
          </figcaption>
        </motion.figure>
      )}

      {tooSparseForBand && (
        <motion.div
          {...sectionMotion(0)}
          className="rounded-2xl bg-cream/80 ring-1 ring-inset ring-teal/15 px-7 py-8 sm:px-10 sm:py-10 space-y-3"
        >
          <h2 className="font-display font-bold text-2xl text-ink">
            Noch zu wenig zum Einordnen
          </h2>
          <p className="text-ink/75 leading-relaxed max-w-prose">
            Du hast bei den meisten Fragen "Weiß ich nicht" gewählt. Das ist
            ehrlich, aber wir können daraus noch nichts ableiten. Schau die App
            einmal kurz mit deinem Kind an, achte auf Push, Werbung und
            Cosmetics, und komm dann zurück.
          </p>
        </motion.div>
      )}

      {/* App being assessed + answer breakdown */}
      <motion.div
        {...sectionMotion(0.05)}
        className="space-y-2 text-sm text-ink/65"
      >
        <p>
          Bewertete App: <strong className="text-ink">{appName}</strong>
        </p>
        <p className="max-w-prose">
          Aus deinen Antworten:{' '}
          <strong className="text-ink">{stats.flagged}</strong> Pattern
          beobachtet,{' '}
          <strong className="text-ink">{stats.cleared}</strong> verneint,{' '}
          <strong className="text-ink">{stats.unclear}</strong> offen
          gelassen.
        </p>
      </motion.div>

      {sparseData && !tooSparseForBand && (
        <motion.div
          {...sectionMotion(0.1)}
          className="rounded-xl bg-cream/80 border border-teal/15 p-5 text-sm text-ink/75 leading-relaxed max-w-prose"
        >
          Du hast bei vielen Fragen "Weiß ich nicht" gewählt. Der Score zählt
          nur was du selbst beobachten konntest und ist deshalb im Zweifel
          niedriger als die App tatsächlich ist. Wenn du mehr Klarheit willst,
          schau ins App-Menü, in die Datenschutzerklärung der App, oder spiel
          mal eine Session zusammen mit deinem Kind.
        </motion.div>
      )}

      {/* Explanations of flagged answers, plus a "what this teaches your
          child" framing that puts the pattern in pedagogical terms. */}
      {flaggedQuestions.length > 0 && (
        <motion.div {...sectionMotion(0.1)} className="space-y-5">
          <h3 className="font-display font-bold text-xl text-ink">
            Was deine Antworten zu den einzelnen Pattern bedeuten
          </h3>
          <ul className="space-y-4">
            {flaggedQuestions.map((q) => (
              <li
                key={q.id}
                className="rounded-xl bg-cream/70 border border-teal/10 p-5 space-y-3"
              >
                <p className="font-display font-semibold text-ink max-w-prose">
                  {q.prompt}
                </p>
                <p className="text-sm font-display font-semibold italic text-teal max-w-prose">
                  {q.teaches}
                </p>
                <p className="text-sm text-ink/75 leading-relaxed max-w-prose">
                  {q.explainer}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {flaggedQuestions.length === 0 && stats.cleared > 0 && !tooSparseForBand && (
        <motion.div
          {...sectionMotion(0.1)}
          className="rounded-xl bg-sage/12 border border-sage/25 p-5 text-sm text-ink/75 leading-relaxed max-w-prose"
        >
          Aus deinen Antworten ergaben sich keine problematischen Pattern.
          Trotzdem gilt: schau die ersten Sessions zusammen mit deinem Kind,
          setz einen Zeitrahmen, und beobachte ob die App Stress oder Ruhe
          erzeugt.
        </motion.div>
      )}

      {/* Band-specific actionable next steps */}
      {!tooSparseForBand && (
        <motion.div {...sectionMotion(0.15)}>
          <BandActions band={band} answers={answers} />
        </motion.div>
      )}

      {/* Surface unclear questions as a "things you could look into" list. */}
      {unclearQuestions.length > 0 && (
        <motion.div {...sectionMotion(0.2)} className="space-y-4">
          <h3 className="font-display font-bold text-lg text-ink">
            Diese Fragen waren für dich unklar
          </h3>
          <ul className="space-y-3">
            {unclearQuestions.map((q) => (
              <li
                key={q.id}
                className="rounded-xl bg-cream/50 border border-teal/10 p-4"
              >
                <p className="text-sm text-ink mb-1 max-w-prose">
                  {q.prompt}
                </p>
                <p className="text-xs text-ink/60 leading-relaxed max-w-prose">
                  {q.explainer}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Optional time-cost projection — parent enters daily usage, we
          do the math. Brand-safe because every number is from their
          input, not a Ronki claim. */}
      {!tooSparseForBand && (
        <motion.div {...sectionMotion(0.25)}>
          <TimeCostProjection />
        </motion.div>
      )}

      {/* Closing reframe — the gut-line that makes the score feel less
          like an isolated finding and more like one parent noticing a
          standard industry pattern. */}
      {!tooSparseForBand && (
        <motion.div
          {...sectionMotion(0.3)}
          className="rounded-2xl bg-teal-dark/8 border border-teal-dark/15 px-7 py-7 sm:px-10 sm:py-9"
        >
          <p className="font-display font-semibold text-lg text-ink leading-relaxed max-w-prose">
            Was du gerade beobachtet hast, ist nicht die Ausnahme. Es ist
            Standard-Praxis in der Branche, weil diese Pattern messbar
            Sessions verlängern. Du bist nicht paranoid wenn dir das
            auffällt. Du hast jetzt eine Sprache dafür.
          </p>
        </motion.div>
      )}

      {/* Shareable PNG card — auto-generates a 1200x675 quote card with
          score + band + key learning. Parent downloads, posts wherever. */}
      {!tooSparseForBand && (
        <motion.div {...sectionMotion(0.35)} className="space-y-3">
          <h3 className="font-display font-bold text-lg text-ink">
            Karte für andere Eltern
          </h3>
          <ShareCard appName={appName} answers={answers} score={score} />
        </motion.div>
      )}
    </div>
  );
}
