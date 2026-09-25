import React from 'react';
import { SpeechBubble } from '../bilderbuch';
import VoiceAudio from '../../utils/voiceAudio';

/**
 * RonkiSpeechBubble: what Ronki says in his room, right now.
 *
 * Finch pass (26 Sep 2026): a controlled bubble. The Nest decides the
 * line (the return greeting, the task ask, "Oh, das wärmt!") and passes
 * its text and voice id; the six rotating lines are retired. Tapping the
 * bubble plays the line again, for a child who cannot read it.
 *
 * Placement is the parent's job: RoomHub anchors the bubble above
 * Ronki's head from the measured scene geometry and passes it through
 * `style` (top or bottom) and `className`. Without a style the bubble
 * sits centred near the top of its positioned parent. No text, no bubble.
 */
export default function RonkiSpeechBubble({ text, voiceId, onTap, side = 'bottom', className = '', style }) {
  if (!text) return null;
  const tap = () => {
    if (voiceId) VoiceAudio.playLocalized(voiceId, 0);
    onTap?.();
  };
  return (
    <>
      <button
        key={text}
        type="button"
        onClick={tap}
        aria-label={`Ronki sagt: ${text}. Antippen zum Hören.`}
        data-testid="ronki-bubble"
        data-voice={voiceId || undefined}
        className={`rsb-root ${className}`}
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'max-content',
          maxWidth: 'min(300px, calc(100% - 32px))',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'center',
          zIndex: 8,
          animation: 'rsb-in 0.4s ease-out',
          ...style,
        }}
      >
        <SpeechBubble side={side} tone="paper" rotate={-1}>
          {text}
        </SpeechBubble>
      </button>
      <style>{`
        @keyframes rsb-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) { .rsb-root { animation: none !important; } }
      `}</style>
    </>
  );
}
