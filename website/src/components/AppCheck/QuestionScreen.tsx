/**
 * One-question screen of the app-check questionnaire.
 *
 * Shows: progress indicator, prompt, optional "Erklär mir das" toggle,
 * primary answer buttons (Yes/No or Content/Mechanic), and a softer
 * "Weiß ich nicht" escape hatch underneath. Mobile-tuned: the unclear
 * button collapses to a centered text link below the screen on phones
 * so it doesn't visually compete with the primary pair when everything
 * is stacked.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { QuestionDef } from '../../lib/app-check/questions';
import { EASE_OUT } from '../../lib/motion';

interface Props {
  question: QuestionDef;
  index: number;
  total: number;
  current: string | undefined;
  /** Briefly true after an answer click so a double-tap can't skip ahead. */
  disabled?: boolean;
  onAnswer: (value: string) => void;
  onBack: () => void;
}

export function QuestionScreen({
  question,
  index,
  total,
  current,
  disabled = false,
  onAnswer,
  onBack,
}: Props) {
  const reduced = useReducedMotion();
  const [explainerOpen, setExplainerOpen] = useState(false);

  const primary = question.options.filter((o) => o.value !== 'unklar');
  const unclear = question.options.find((o) => o.value === 'unklar');

  // Subtle press feedback on primary answer buttons. Quiet, not celebratory.
  const tapProps = reduced ? {} : { whileTap: { scale: 0.98 } };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-1.5 bg-cream/70 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Frage ${index + 1} von ${total}`}
        >
          <motion.div
            className="h-full bg-sage rounded-full"
            initial={false}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }
            }
          />
        </div>
        <span className="text-xs text-ink/60 tabular-nums">
          Frage {index + 1} / {total}
        </span>
      </div>

      {/* Prompt */}
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink leading-snug">
        {question.prompt}
      </h2>

      {/* Explainer toggle */}
      <button
        type="button"
        onClick={() => setExplainerOpen((v) => !v)}
        aria-expanded={explainerOpen}
        className="text-sm text-teal underline underline-offset-4 decoration-teal/30 hover:decoration-teal focus:outline-none focus-visible:decoration-teal focus-visible:decoration-2 transition-colors rounded-sm"
      >
        {explainerOpen ? 'Weniger anzeigen' : 'Erklär mir das'}
      </button>

      {explainerOpen && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="rounded-xl bg-cream/80 border border-teal/10 p-5 text-sm text-ink/75 leading-relaxed"
        >
          {question.explainer}
        </motion.div>
      )}

      {/* Answer buttons. Primary pair gets equal visual weight. The
          "Weiß ich nicht" option is rendered softer to keep parents
          leaning toward an actual answer when they have one. On mobile
          (<sm) it shrinks to a centered text link so it doesn't compete
          visually with the stacked primary pair. */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          {primary.map((opt) => {
            const selected = current === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => onAnswer(opt.value)}
                disabled={disabled}
                {...tapProps}
                className={`flex-1 rounded-xl border-2 px-6 py-4 text-base font-display font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60 disabled:cursor-not-allowed transition-all ${
                  selected
                    ? 'border-teal bg-teal text-cream shadow-md'
                    : 'border-teal/20 bg-cream text-ink hover:border-teal hover:shadow-sm'
                }`}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </div>
        {unclear && (
          <>
            {/* Mobile: text-link affordance */}
            <button
              type="button"
              onClick={() => onAnswer(unclear.value)}
              disabled={disabled}
              className={`block sm:hidden w-full text-center text-sm py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                current === unclear.value
                  ? 'text-ink underline underline-offset-4 decoration-teal/40'
                  : 'text-ink/55 hover:text-ink hover:underline underline-offset-4'
              }`}
            >
              {unclear.label}
            </button>
            {/* Desktop: full-width softer button */}
            <button
              type="button"
              onClick={() => onAnswer(unclear.value)}
              disabled={disabled}
              className={`hidden sm:block w-full rounded-xl border px-6 py-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60 disabled:cursor-not-allowed transition-all ${
                current === unclear.value
                  ? 'border-teal-dark/40 bg-teal-dark/10 text-ink'
                  : 'border-teal/15 bg-cream/50 text-ink/65 hover:border-teal/30 hover:text-ink'
              }`}
            >
              {unclear.label}
            </button>
          </>
        )}
      </div>

      {/* Back nav */}
      {index > 0 && (
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="text-sm text-ink/55 hover:text-ink/80 focus:outline-none focus-visible:text-ink focus-visible:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Vorige Frage
        </button>
      )}
    </div>
  );
}
