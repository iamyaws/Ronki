import React, { useEffect, useRef, useState } from 'react';
import { SpeechBubble } from '../bilderbuch';

/**
 * RonkiSpeechBubble: the rotating line Ronki says in his room.
 *
 * Bilderbuch cut (25 Sep 2026): the body is the shared SpeechBubble
 * (paper fill, ink outline, tail pointing down at Ronki). Timing and
 * copy are unchanged from the Begleiter Polish port: six lines, one
 * every ~4.2 s, tap to dismiss, then a quiet window of ~6 s before
 * the next line shows.
 *
 * Placement is the parent's job now: RoomHub positions the bubble
 * right above Ronki's head from the measured scene geometry and
 * passes it through `style` (and `className`). Without a style the
 * bubble sits centred near the top of its positioned parent.
 *
 * Voice rule (feedback_no_ai_writing.md): no em-dashes, no tidy
 * three-beat fragments. The lines below were drafted under that rule.
 */

const MOOD_LINES = [
  'Ich mag es wenn du bei mir bist.',
  'Spielst du heute mit mir?',
  'Mein Bauch grummelt so ein bisschen…',
  'Erzähl mir was du heute erlebt hast.',
  'Kannst du mich mal streicheln?',
  'Ich hab heut Nacht von fliegenden Keksen geträumt.',
];

const ROTATE_MS = 4200;
const QUIET_AFTER_DISMISS_MS = 6000;

export default function RonkiSpeechBubble({ idx: idxProp, side = 'bottom', className = '', style }) {
  const [idx, setIdx] = useState(0);
  // 'visible' = bubble shown, 'dismissing' = play exit animation,
  // 'quiet' = waiting after a tap-dismiss before the next line cycles.
  const [phase, setPhase] = useState('visible');
  const dismissTimerRef = useRef(null);

  // Auto-rotate while visible. Skip the timer when controlled (idxProp)
  // or when in dismissing/quiet phase so we don't fight the user.
  useEffect(() => {
    if (typeof idxProp === 'number') return;
    if (phase !== 'visible') return;
    const id = setInterval(() => setIdx(i => (i + 1) % MOOD_LINES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [idxProp, phase]);

  useEffect(() => () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  }, []);

  const handleTap = () => {
    if (phase !== 'visible') return;
    setPhase('dismissing');
    // After the exit animation, drop into quiet, advance the line, then
    // come back. The advance happens during quiet so the next line
    // doesn't flash in the middle of the slide-up.
    setTimeout(() => {
      setIdx(i => (i + 1) % MOOD_LINES.length);
      setPhase('quiet');
      dismissTimerRef.current = setTimeout(() => setPhase('visible'), QUIET_AFTER_DISMISS_MS);
    }, 280);
  };

  const showIdx = typeof idxProp === 'number' ? idxProp % MOOD_LINES.length : idx;

  if (phase === 'quiet') return null;

  return (
    <button
      key={`${showIdx}-${phase}`}
      type="button"
      onClick={handleTap}
      aria-label="Nachricht von Ronki, antippen zum Schließen"
      className={`rsb-root ${className}`}
      style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(300px, calc(100% - 32px))',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'center',
        zIndex: 8,
        animation: phase === 'dismissing'
          ? 'rsb-out 0.28s ease-in forwards'
          : 'rsb-in 0.4s ease-out',
        ...style,
      }}
    >
      <SpeechBubble side={side} tone="paper" rotate={-1}>
        {MOOD_LINES[showIdx]}
      </SpeechBubble>
      <style>{`
        @keyframes rsb-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes rsb-out {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); }
        }
      `}</style>
    </button>
  );
}
