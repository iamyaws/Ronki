import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 2. TornNote                                                         */
/* ------------------------------------------------------------------ */

type Tone = 'paper' | 'white';
type Pin = 'pin' | 'tape' | 'none';

const FILL: Record<Tone, string> = {
  paper: '#FDFBF3',
  white: '#FFFFFF',
};

/**
 * A strip torn off a bigger sheet.
 *
 * No outline at all, a real torn bottom edge, held by a drawn ember pin
 * or a piece of tape. It carries the small print of a page: the caveat,
 * the limit, the thing that is not finished yet. Never a headline, and
 * never more than a short paragraph, because a torn strip that runs for
 * ten lines stops looking torn.
 */
export function TornNote({
  children,
  tone = 'paper',
  pin = 'pin',
  rotate = -2,
  className = '',
}: {
  children: ReactNode;
  /** paper on white grounds, white on paper and sky grounds. */
  tone?: Tone;
  pin?: Pin;
  rotate?: number;
  className?: string;
}) {
  const fill = FILL[tone];
  return (
    <div
      className={`relative ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        filter: 'drop-shadow(3px 4px 0 rgba(4, 8, 18, 0.16))',
      }}
    >
      <div
        className="relative px-5 pt-7 pb-3 sm:px-6"
        style={{ background: fill }}
      >
        {pin === 'pin' && <DrawnPin />}
        {pin === 'tape' && <Tape />}
        {children}
      </div>

      {/* The tear. Drawn in the sheet colour, so everything under the
       *  wave is simply gone. Displacement only, no grain: grain turns
       *  into grey speckle on a light ground. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 400 26"
        preserveAspectRatio="none"
        className="relative block h-[22px] w-full"
        style={{ filter: 'url(#bb-tear)', marginTop: '-1px' }}
      >
        <path
          d="M0 0 H400 V9 C 366 17 344 6 312 12 C 276 19 258 8 226 13 C 192 18 172 7 140 12 C 108 17 86 6 56 11 C 32 15 16 8 0 12 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/** A pin: ember head, a short ink needle, one white highlight. */
function DrawnPin() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 40 40"
      className="absolute -top-3 left-6 h-9 w-9"
      style={{ transform: 'rotate(-9deg)' }}
    >
      <path
        d="M20 22 C 21 27 22 32 23 37"
        fill="none"
        stroke="#040812"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="19" cy="15" r="9.5" fill="#EE4F35" />
      <circle cx="19" cy="15" r="9.5" fill="none" stroke="#040812" strokeWidth="2.2" />
      <circle cx="15.5" cy="11.5" r="2.6" fill="#ffffff" fillOpacity="0.75" />
    </svg>
  );
}

/** A short strip of paper tape, fibre hint included. */
function Tape() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 120 40"
      preserveAspectRatio="none"
      className="absolute -top-3 left-5 h-8 w-20"
      style={{ transform: 'rotate(-7deg)' }}
    >
      <rect x="0" y="4" width="120" height="32" rx="2" fill="#FDD134" fillOpacity="0.88" />
      <line x1="8" y1="14" x2="112" y2="14" stroke="#040812" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="8" y1="26" x2="112" y2="26" stroke="#040812" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="6 4" />
    </svg>
  );
}
