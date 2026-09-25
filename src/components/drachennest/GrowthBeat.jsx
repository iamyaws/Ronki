import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import VoiceAudio from '../../utils/voiceAudio';
import MoodChibi from '../MoodChibi';
import { PillButton, StickerBurst, useReducedMotion } from '../bilderbuch';
import { growStageLine, lineText } from '../../data/ronkiLines';

/**
 * GrowthBeat: Ronki's new look (Finch pass, 26 Sep 2026; spec R6, base
 * design section 5).
 *
 * Shown once per stage, right after the treasure that crossed it: the
 * old look crossfades into the new one on paper, a sticker burst, one
 * line ("Schau mal! Meine Eierschale ist ab!"), one pill "Weiter", which
 * calls markStageSeen(stage). Growth never changes what Ronki can do.
 */
export default function GrowthBeat({ stage, onDone }) {
  const { state, actions } = useTask();
  const reduced = useReducedMotion();
  const [showNew, setShowNew] = useState(reduced);
  const firedRef = useRef(false);
  const lineId = growStageLine(stage);
  const variant = state?.companionVariant;

  useEffect(() => {
    const t = setTimeout(() => setShowNew(true), reduced ? 0 : 500);
    if (lineId) VoiceAudio.playLocalized(lineId, 900);
    return () => clearTimeout(t);
    // Once per beat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    actions?.markStageSeen?.(stage);
    onDone?.();
  };

  const fade = reduced ? 'none' : 'opacity 1200ms ease';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronki wächst"
      data-testid="growth-beat"
      className="bg-white text-ink"
      style={{ position: 'fixed', inset: 0, zIndex: 86, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}
    >
      <div className="relative rounded-[28px] bg-paper" style={{ width: 260, height: 260, border: '3px solid var(--color-ink)' }}>
        <div style={{ position: 'absolute', inset: 10, opacity: showNew ? 0 : 1, transition: fade }}>
          <MoodChibi size={240} variant={variant} stage={Math.max(1, stage - 1)} mood="happy" bare />
        </div>
        <div style={{ position: 'absolute', inset: 10, opacity: showNew ? 1 : 0, transition: fade }}>
          <MoodChibi size={240} variant={variant} stage={stage} mood="happy" bare />
        </div>
        <StickerBurst active={showNew} size={320} />
      </div>
      {lineId && (
        <p className="bb-display text-ink text-center" style={{ fontSize: 28, lineHeight: 1.2, margin: '22px 0 0', maxWidth: 420 }}>
          {lineText(lineId)}
        </p>
      )}
      <div style={{ marginTop: 26, width: '100%', maxWidth: 360 }}>
        <PillButton full size="lg" arrow onClick={next}>
          Weiter
        </PillButton>
      </div>
    </div>
  );
}
