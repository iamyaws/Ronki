import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import VoiceAudio from '../utils/voiceAudio';
import { lineText } from '../data/ronkiLines';
import MoodChibi from './MoodChibi';
import { DoodleIcon, MotionTicks, PaperCard, PillButton, SpeechBubble } from './bilderbuch';

/**
 * HandoffBackCard: the parent hands the tablet back to the child.
 *
 * Finch pass (26 Sep 2026, base 2.1 screens 8 and 9): shown once after
 * the parent step, which now comes after the hatch. Two short beats on
 * white, each tappable anywhere, the pill visible at once:
 *
 *   back   "Fertig!" and Ronki's "Jetzt bist du wieder dran!"
 *          (handoff_back_01), pill "Los geht's"
 *   know   Ronki waves, the child's name big, "Hallo {Kind}! Jetzt kenn
 *          ich dich. Schön!" (meet_nowiknow_01; the recording leaves the
 *          name out), pill "Weiter"
 *
 * onContinue fires after the second beat. The chain then writes
 * parentHandoffBackSeen, so a reload in between shows this card again.
 *
 * Props: { onContinue, childName, variant }
 */

const TAP_GUARD_MS = 450;

export default function HandoffBackCard({ onContinue, childName, variant }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('back');
  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const kind = (childName || '').trim();

  useEffect(() => {
    shownAt.current = Date.now();
    VoiceAudio.playLocalized(step === 'back' ? 'handoff_back_01' : 'meet_nowiknow_01', 300);
  }, [step]);

  const next = () => {
    if (Date.now() - shownAt.current < TAP_GUARD_MS) return;
    if (step === 'back') {
      setStep('know');
      return;
    }
    if (doneRef.current) return;
    doneRef.current = true;
    onContinue?.();
  };

  const pillTap = (e) => {
    e.stopPropagation();
    next();
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-white text-ink font-body"
      onClick={next}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') next();
      }}
      aria-label={step === 'back' ? t('handoff.parentToKid.title') : lineText('meet_nowiknow_01', { kind })}
    >
      <motion.main
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 min-h-full flex flex-col items-center justify-center px-6 text-center"
        style={{
          paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {step === 'back' && (
          <motion.div
            initial={{ scale: 0.92, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'backOut' }}
            className="w-full max-w-sm"
          >
            <PaperCard tone="paper" lift pad="lg" className="flex flex-col items-center">
              <div className="relative mb-6" aria-hidden="true">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-ink bg-sun text-ink">
                  <DoodleIcon name="check" size={64} stroke={7} />
                </div>
                <MotionTicks tone="cobalt" size={34} rotate={-40} className="absolute" style={{ top: -6, right: -26 }} />
                <MotionTicks tone="cobalt" size={34} rotate={220} className="absolute" style={{ top: -6, left: -26 }} />
              </div>

              <h1 className="bb-display text-5xl mb-3">{t('handoff.parentToKid.title')}</h1>
              <p className="font-headline font-semibold text-2xl text-ink leading-snug mb-6">
                {lineText('handoff_back_01')}
              </p>

              <PillButton size="lg" arrow onClick={pillTap}>
                Los geht&apos;s
              </PillButton>
            </PaperCard>
          </motion.div>
        )}

        {step === 'know' && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5">
            {kind && (
              <p className="bb-display text-5xl m-0 break-words" style={{ maxWidth: 320 }}>{kind}</p>
            )}
            <SpeechBubble side="bottom" size="lg" style={{ maxWidth: 300 }}>
              {lineText('meet_nowiknow_01', { kind })}
            </SpeechBubble>
            <MoodChibi stage={1} mood="gut" variant={variant} size={200} bare label="Ronki" />
            <PillButton size="lg" arrow full onClick={pillTap}>
              Weiter
            </PillButton>
          </div>
        )}
      </motion.main>
    </div>
  );
}
