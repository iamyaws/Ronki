import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 5. SpeechBubble                                                     */
/* ------------------------------------------------------------------ */

type Tone = 'white' | 'cobalt' | 'sun' | 'sky-wash';
type Tail = 'left' | 'right' | 'bottom' | 'none';
type TailEdge = 'bottom' | 'top';

const FILL: Record<Tone, string> = {
  white: '#FFFFFF',
  cobalt: '#0544B0',
  sun: '#FDD134',
  'sky-wash': '#B9E3FC',
};

const TEXT: Record<Tone, string> = {
  white: 'text-ink',
  cobalt: 'text-white',
  sun: 'text-ink',
  'sky-wash': 'text-ink',
};

/**
 * Somebody talking.
 *
 * Wobbly drawn outline, a tail that points at whoever is speaking. Used
 * for Ronki's lines, for a parent quote and for an answer in the FAQ.
 * Never for a paragraph of running copy: a bubble with six lines in it
 * is a card with a spike.
 *
 * The tail can sit on the top edge instead of the bottom, for an answer
 * that hangs under the question it belongs to. It can also be switched
 * off, or switched per width: a bubble beside a photo points sideways on
 * a wide screen and has no tail on a phone, where the photo has moved
 * above it and a sideways tail would point at nothing.
 */
export function SpeechBubble({
  children,
  tone = 'white',
  tail = 'left',
  /** The tail used from md upwards. The base tail is hidden there. */
  tailAtMd,
  /** Which edge the tail hangs off. Top points up at the thing above. */
  tailEdge = 'bottom',
  rotate = -0.8,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  tail?: Tail;
  tailAtMd?: Tail;
  tailEdge?: TailEdge;
  rotate?: number;
  className?: string;
}) {
  const fill = FILL[tone];

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

      <TailShape
        tail={tail}
        edge={tailEdge}
        fill={fill}
        className={tailAtMd ? 'md:hidden' : ''}
      />
      {tailAtMd && (
        <TailShape tail={tailAtMd} edge={tailEdge} fill={fill} className="hidden md:block" />
      )}
    </div>
  );
}

/* The tail. Drawn at a fixed size so it never stretches, with a patch
 * across its top that swallows the seam against the bubble. */
function TailShape({
  tail,
  edge,
  fill,
  className = '',
}: {
  tail: Tail;
  edge: TailEdge;
  fill: string;
  className?: string;
}) {
  if (tail === 'none') return null;

  const pos =
    tail === 'left' ? 'left-9' : tail === 'right' ? 'right-9' : 'left-1/2 -ml-5';
  const flips = [
    edge === 'top' ? 'scaleY(-1)' : '',
    tail === 'right' ? 'scaleX(-1)' : '',
  ].filter(Boolean);

  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 40 32"
      width="40"
      height="32"
      className={`absolute ${
        edge === 'top' ? '-top-[29px]' : '-bottom-[29px]'
      } ${pos} overflow-visible ${className}`}
      style={{ transform: flips.length ? flips.join(' ') : undefined }}
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
  );
}
