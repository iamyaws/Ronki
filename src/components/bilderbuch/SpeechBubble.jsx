import React from 'react';

/**
 * SpeechBubble: Ronki talking.
 *
 * Paper fill, ink outline, a short tail toward whoever speaks. Two lines
 * at most by design: the type is big and the padding generous, so a line
 * that needs a third row is a line that wants cutting. A bubble with six
 * lines in it is a card with a spike.
 *
 * Props:
 *   side   where the tail points: 'left' | 'right' | 'bottom' | 'top' | 'none'
 *   tone   'paper' (default) | 'white' | 'sun' | 'sky-wash' | 'cobalt'
 *   rotate degrees off straight (default -0.8, the drawn feel)
 *   size   'md' (default) | 'lg' (the one big line of a screen)
 */

const FILL = {
  paper: 'var(--color-paper)',
  white: '#ffffff',
  sun: 'var(--color-sun)',
  'sky-wash': 'var(--color-sky-wash)',
  cobalt: 'var(--color-cobalt)',
};

const TEXT = {
  paper: 'text-ink',
  white: 'text-ink',
  sun: 'text-ink',
  'sky-wash': 'text-ink',
  cobalt: 'text-white',
};

export default function SpeechBubble({
  children,
  side = 'left',
  tone = 'paper',
  rotate = -0.8,
  size = 'md',
  className = '',
  style,
  ...rest
}) {
  const fill = FILL[tone] || FILL.paper;
  const type = size === 'lg' ? 'text-2xl leading-snug' : 'text-lg leading-snug';
  return (
    <div
      className={`relative inline-block max-w-full ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}
      {...rest}
    >
      <div
        className={`relative rounded-[30px_24px_28px_26px] border-[3px] border-ink px-5 py-4 font-headline font-semibold ${type} ${TEXT[tone] || TEXT.paper}`}
        style={{ background: fill, hyphens: 'manual', WebkitHyphens: 'manual' }}
      >
        {children}
      </div>
      <Tail side={side} fill={fill} />
    </div>
  );
}

/* The tail. Drawn at a fixed size so it never stretches, with a patch
   across its base that swallows the seam against the bubble. */
function Tail({ side, fill }) {
  if (side === 'none') return null;
  const vertical = side === 'top' || side === 'bottom';
  const pos =
    side === 'left' ? { left: 28 } :
    side === 'right' ? { right: 28 } :
    { left: '50%', marginLeft: -16 };
  const edge = side === 'top' ? { top: -23 } : { bottom: -23 };
  const flips = [];
  if (side === 'top') flips.push('scaleY(-1)');
  if (side === 'right') flips.push('scaleX(-1)');
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 40 32"
      width="32"
      height="26"
      className="absolute overflow-visible"
      style={{ ...pos, ...edge, transform: flips.length ? flips.join(' ') : undefined }}
    >
      <path
        d={vertical
          ? 'M8 2 L32 2 C 28 12 24 21 20 31 C 16 21 12 11 8 2 Z'
          : 'M6 2 L34 2 C 30 12 24 21 7 31 C 13 21 12 11 6 2 Z'}
        fill={fill}
        stroke="#040812"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="7" y="-4" width="26" height="8" fill={fill} />
    </svg>
  );
}
