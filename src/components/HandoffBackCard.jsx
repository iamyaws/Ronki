import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import { DoodleIcon, MotionTicks, PaperCard, PillButton } from './bilderbuch';

/**
 * HandoffBackCard: phase 1 of the lean onboarding chain.
 *
 * Displayed once, after the parent finishes CombinedParentSetup and
 * before the kid meets Ronki.
 *
 * Design notes (from the Q2 and Q4 picks, Apr 2026):
 *   · Parent stays blind to Ronki: no chibi, no egg, no forest. The
 *     first Ronki reveal belongs to the kid in the hatch.
 *   · Trust handoff, not a held-button ceremony: a tap anywhere
 *     dismisses and opens the kid flow. The pill is the same tap, made
 *     visible.
 *
 * Bilderbuch cut (25 Sep 2026): one paper card on white with the drawn
 * tilt, a sun check sticker instead of the cream texture and the
 * Material glyph, the hint in the hand voice, one cobalt pill.
 *
 * See docs/discovery/2026-04-23-onboarding-parent-first/transcript.md
 */
export default function HandoffBackCard({ onContinue }) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-white text-ink font-body"
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onContinue();
      }}
      aria-label={t('handoff.parentToKid.title')}
    >
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 min-h-full flex flex-col items-center justify-center px-6 text-center"
        style={{
          paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'backOut' }}
          className="w-full max-w-sm"
        >
          <PaperCard tone="paper" lift pad="lg" className="flex flex-col items-center">
            {/* Sun check sticker: simple, not a character */}
            <div className="relative mb-6" aria-hidden="true">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-ink bg-sun text-ink">
                <DoodleIcon name="check" size={64} stroke={7} />
              </div>
              <MotionTicks tone="cobalt" size={34} rotate={-40} className="absolute" style={{ top: -6, right: -26 }} />
              <MotionTicks tone="cobalt" size={34} rotate={220} className="absolute" style={{ top: -6, left: -26 }} />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bb-display text-5xl mb-3"
            >
              {t('handoff.parentToKid.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="text-xl text-ink-soft leading-relaxed mb-6"
            >
              {t('handoff.parentToKid.body')}
            </motion.p>

            <PillButton
              size="lg"
              arrow
              onClick={(e) => {
                e.stopPropagation();
                onContinue();
              }}
            >
              Los geht&apos;s
            </PillButton>

            {/* "tap anywhere" hint in the hand voice */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="bb-hand text-2xl text-sun-deep mt-6"
            >
              {t('handoff.parentToKid.hint')}
            </motion.p>
          </PaperCard>
        </motion.div>
      </motion.main>
    </div>
  );
}
