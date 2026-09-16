/**
 * Per-band action list shown on the result screen.
 *
 * Severity is encoded by list length and specificity, not by alarm copy
 * or color. The actions reference the parent's own answers ("Wenn du
 * Push beobachtet hast..."), so the high-band list expands or contracts
 * based on what was actually flagged. This keeps a 9/10 result feeling
 * substantive without manufacturing fear.
 */

import { motion, useReducedMotion } from 'motion/react';
import { BAND_ACTIONS, type ScoreBandDef } from '../../lib/app-check/score';
import { QUESTIONS, type AnswersMap } from '../../lib/app-check/questions';
import { EASE_OUT } from '../../lib/motion';

interface Props {
  band: ScoreBandDef;
  answers: AnswersMap;
}

export function BandActions({ band, answers }: Props) {
  const reduced = useReducedMotion();
  const config = BAND_ACTIONS[band.key];

  // Show items that have no `onlyIfFlagged` constraint, plus items whose
  // gating question was actually flagged in this parent's answers.
  const visible = config.items.filter((item) => {
    if (!item.onlyIfFlagged) return true;
    const q = QUESTIONS.find((q) => q.id === item.onlyIfFlagged);
    if (!q) return false;
    const v = answers[q.id];
    if (!v || v === 'unklar') return false;
    return q.scoreContribution(v) === 1;
  });

  if (visible.length === 0) return null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-2">
          Was du jetzt machen kannst
        </h3>
        <p className="text-sm text-ink/70 leading-relaxed max-w-prose">
          {config.intro}
        </p>
      </div>
      <ol className="space-y-4 list-none pl-0">
        {visible.map((item, i) => (
          <motion.li
            key={item.title}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.4, delay: i * 0.05, ease: EASE_OUT }
            }
            className="rounded-xl bg-cream/70 border border-teal/10 p-5 sm:p-6 flex gap-4"
          >
            <span
              aria-hidden
              className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-dark text-cream font-display font-bold text-sm tabular-nums"
            >
              {i + 1}
            </span>
            <div className="space-y-1.5 flex-1">
              <p className="font-display font-bold text-ink text-base max-w-prose">
                {item.title}
              </p>
              <p className="text-sm text-ink/75 leading-relaxed max-w-prose">
                {item.detail}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
