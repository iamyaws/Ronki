import React, { useEffect, useRef, useState } from 'react';
import MoodChibi from './MoodChibi';
import { useQuestEater } from './QuestEater';
import { useTask } from '../context/TaskContext';
import { SpeechBubble, MotionTicks } from './bilderbuch';

/**
 * PinnedRonki: the round companion chip in the top bar that follows
 * the kid across tabs. Bilderbuch cut, 25 Sep 2026: a sky-wash circle
 * with an ink outline, the routine progress as a cobalt drawn arc, the
 * burp as three sun motion ticks, the bubble the shared SpeechBubble
 * with its tail pointing up at the chip.
 *
 * Behaviour is unchanged: it registers its DOM node with the
 * QuestEater as the fallback target of the flying quest icon, subscribes
 * to the eater's burp and bubble triggers, fills the ring from the
 * current routine block, and mirrors the ambient mood.
 *
 * Props:
 *   - size         (number)   outer chip diameter, default 46
 *   - mood         accepted for back-compat; the ambient mood from state wins
 *   - bubble       (string)   optional speech bubble text
 *   - burpTrigger  (number)   bump to fire the motion ticks
 *   - onTap        (fn)       tap handler
 *   - ariaLabel    (string)   a11y label, default 'Ronki'
 */

const TICK_TONE = {
  flame: 'ember',
  ember: 'sun',
  sparkle: 'sun',
  heart: 'ember',
  rainbow: 'cobalt',
};

export default function PinnedRonki({
  size = 46,
  mood = 'happy', // eslint-disable-line no-unused-vars
  bubble: bubbleOverride,
  burpTrigger = 0,
  onTap,
  ariaLabel = 'Ronki',
}) {
  const eater = useQuestEater();
  const { state } = useTask();
  // Routine-based ring (Marc Apr 2026): time of day picks the active
  // block; the ring fills when THAT block's main quests are all done so
  // the kid knows it is safe to put the phone away.
  const _h = new Date().getHours();
  const activeAnchor =
    _h >= 6 && _h < 12 ? 'morning' :
    _h >= 12 && _h < 18 ? 'evening' :
    'bedtime';
  const blockQuests = (state?.quests || []).filter(
    q => q.anchor === activeAnchor && !q.sideQuest
  );
  const blockDone = blockQuests.filter(q => q.done).length;
  const blockTotal = blockQuests.length;
  const pct = blockTotal > 0 ? blockDone / blockTotal : 0;
  const allDone = blockTotal > 0 && blockDone === blockTotal;
  const ambientMood = state?.ronkiMood || 'normal';
  const variant = state?.companionVariant || 'amber';
  const pillRef = useRef(null);
  useEffect(() => {
    if (!eater || !pillRef.current) return;
    // Fallback slot: a scene Ronki takes priority when mounted; everywhere
    // else this chip is the target for the flying quest icon.
    eater.registerRonkiEl(pillRef.current, 'fallback');
    return () => eater.registerRonkiEl(null, 'fallback');
  }, [eater]);

  // Burp ticks: mount briefly when burpTrigger (prop) OR eater.burpKey
  // (context) changes. The flavor picks the tick colour.
  const [burpKey, setBurpKey] = useState(0);
  const [burpFlavor, setBurpFlavor] = useState('flame');
  const lastPropTrigger = useRef(burpTrigger);
  const lastCtxTrigger = useRef(eater?.burpKey ?? 0);
  useEffect(() => {
    if (burpTrigger !== lastPropTrigger.current) {
      lastPropTrigger.current = burpTrigger;
      setBurpKey(k => k + 1);
    }
  }, [burpTrigger]);
  useEffect(() => {
    const ctxKey = eater?.burpKey ?? 0;
    if (ctxKey !== lastCtxTrigger.current) {
      lastCtxTrigger.current = ctxKey;
      setBurpFlavor(eater?.burpFlavor || 'flame');
      setBurpKey(k => k + 1);
    }
  }, [eater?.burpKey, eater?.burpFlavor]);

  // Prefer explicit bubble prop; fall back to context bubble.
  const bubble = bubbleOverride ?? eater?.bubble;

  // Ronki's face fills about 78 percent of the chip.
  const innerSize = Math.round(size * 0.78);

  const Tag = onTap ? 'button' : 'div';

  // The ring is drawn on a slightly bigger box so the stroke sits just
  // outside the chip's outline.
  const padding = 5;
  const boxSize = size + padding * 2;
  const stroke = Math.max(3, Math.round(size * 0.08));
  const radius = (size + padding) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Tag
      ref={pillRef}
      onClick={onTap}
      aria-label={onTap ? ariaLabel : undefined}
      className="pr-pin active:scale-95 transition-transform"
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-sky-wash)',
        border: '2px solid var(--color-ink)',
        boxSizing: 'border-box',
        display: 'grid',
        placeItems: 'center',
        cursor: onTap ? 'pointer' : 'default',
        flexShrink: 0,
        padding: 0,
        overflow: 'visible',
      }}
    >
      {/* Progress ring: paper track, cobalt drawn arc. */}
      <svg
        aria-hidden="true"
        width={boxSize}
        height={boxSize}
        viewBox={`0 0 ${boxSize} ${boxSize}`}
        style={{
          position: 'absolute',
          inset: -padding - 2,
          pointerEvents: 'none',
          transform: 'rotate(-90deg)',
          overflow: 'visible',
        }}
      >
        <circle
          cx={boxSize / 2}
          cy={boxSize / 2}
          r={radius}
          fill="none"
          stroke="var(--color-paper-deep)"
          strokeWidth={stroke}
        />
        {pct > 0 && (
          <circle
            cx={boxSize / 2}
            cy={boxSize / 2}
            r={radius}
            fill="none"
            stroke={allDone ? 'var(--color-cobalt)' : 'var(--color-cobalt)'}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        )}
      </svg>

      {/* Ronki's face, the ambient mood. */}
      <div style={{ width: innerSize, height: innerSize, position: 'relative', zIndex: 1 }}>
        <MoodChibi size={innerSize} mood={ambientMood} variant={variant} stage={2} bare face />
      </div>

      {/* Burp: three motion ticks fanning up from the chip. Keyed so
          each trigger mounts a fresh animation run. */}
      {burpKey > 0 && (
        <span
          key={burpKey}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: -6,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 40,
            animation: 'prBurp 0.9s ease-out forwards',
          }}
        >
          <MotionTicks tone={TICK_TONE[burpFlavor] || 'sun'} size={Math.round(size * 0.55)} rotate={-90} />
        </span>
      )}

      {/* Speech bubble below the chip, tail pointing up at it. */}
      {bubble && (
        <div
          role="status"
          style={{
            position: 'absolute',
            zIndex: 30,
            top: 'calc(100% + 22px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            animation: 'prBubIn 0.25s cubic-bezier(.34,1.56,.64,1)',
          }}
        >
          <SpeechBubble side="top" tone="paper" rotate={0} className="text-left">
            {bubble}
          </SpeechBubble>
        </div>
      )}

      <style>{`
        @keyframes prBurp {
          0%   { opacity: 0; transform: translate(-50%, 4px) scale(0.5); }
          25%  { opacity: 1; transform: translate(-50%, -6px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -22px) scale(0.8); }
        }
        @keyframes prBubIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </Tag>
  );
}
