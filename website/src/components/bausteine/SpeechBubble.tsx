import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 5. SpeechBubble                                                     */
/* ------------------------------------------------------------------ */

type Tone = 'white' | 'cobalt' | 'sun';
type Tail = 'left' | 'right' | 'bottom';

const FILL: Record<Tone, string> = {
  white: '#FFFFFF',
  cobalt: '#0544B0',
  sun: '#FDD134',
};

const TEXT: Record<Tone, string> = {
  white: 'text-ink',
  cobalt: 'text-white',
  sun: 'text-ink',
};

/**
 * Somebody talking.
 *
 * Wobbly drawn outline, a tail that points at whoever is speaking. Used
 * for Ronki's lines, for a parent quote and for an answer in the FAQ.
 * Never for a paragraph of running copy: a bubble with six lines in it
 * is a card with a spike.
 */
export function SpeechBubble({
  children,
  tone = 'white',
  tail = 'left',
  rotate = -0.8,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  tail?: Tail;
  rotate?: number;
  className?: string;
}) {
  const fill = FILL[tone];
  const tailPos =
    tail === 'left' ? 'left-9' : tail === 'right' ? 'right-9' : 'left-1/2 -ml-5';

  return (
    <div
      className={`relative inline-block max-w-full ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className={`relative rounded-[30px_24px_28px_26px] border-[3px] border-ink px-6 py-5 ${TEXT[tone]}`}
        style={{ background: fill }}
      >
        <div className="text-[1.05rem] sm:text-lg leading-relaxed [hyphens:none]">
          {children}
        </div>
      </div>

      {/* The tail. Drawn at a fixed size so it never stretches, with a
       *  patch across its top that swallows the seam. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 40 32"
        width="40"
        height="32"
        className={`absolute -bottom-[29px] ${tailPos} overflow-visible`}
        style={{ transform: tail === 'right' ? 'scaleX(-1)' : undefined }}
      >
        <path
          d="M6 2 L34 2 C 30 12 24 21 7 31 C 13 21 12 11 6 2 Z"
          fill={fill}
          stroke="#040812"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect x="7" y="-4" width="26" height="8" fill={fill} />
      </svg>
    </div>
  );
}
