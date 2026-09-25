import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 13. Stamp                                                           */
/* ------------------------------------------------------------------ */

type Tone = 'ember' | 'cobalt';
type Shape = 'round' | 'rect';

const RING: Record<Tone, string> = {
  ember: '#EE4F35',
  cobalt: '#0544B0',
};

/**
 * A rubber stamp pressed onto the page.
 *
 * A worn ring that breaks where the ink did not take, one short word in
 * caps, pressed on crooked. It marks a state: early version, free, done,
 * checked. Ember stamps set their word in ink, because ember type on a
 * white ground is against the kit.
 */
export function Stamp({
  children,
  tone = 'ember',
  shape = 'rect',
  rotate = -9,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  shape?: Shape;
  rotate?: number;
  className?: string;
}) {
  const ring = RING[tone];
  return (
    <span
      className={`relative inline-flex items-center justify-center px-5 py-2.5 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* The ring. Long uneven dashes leave the gaps a tired stamp pad
       *  leaves, and the soft crayon filter takes the machine edge off. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 200 74"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{ filter: 'url(#bb-crayon-soft)' }}
      >
        {shape === 'rect' ? (
          <>
            <rect
              x="4"
              y="4"
              width="192"
              height="66"
              rx="12"
              fill="none"
              stroke={ring}
              strokeWidth="5"
              strokeDasharray="74 7 46 5 96 6"
              strokeLinecap="round"
            />
            <rect
              x="12"
              y="12"
              width="176"
              height="50"
              rx="7"
              fill="none"
              stroke={ring}
              strokeWidth="2"
              strokeOpacity="0.7"
              strokeDasharray="120 9 60 7"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <ellipse
              cx="100"
              cy="37"
              rx="95"
              ry="33"
              fill="none"
              stroke={ring}
              strokeWidth="5"
              strokeDasharray="88 8 54 6 110 7"
              strokeLinecap="round"
            />
            <ellipse
              cx="100"
              cy="37"
              rx="86"
              ry="26"
              fill="none"
              stroke={ring}
              strokeWidth="2"
              strokeOpacity="0.7"
              strokeDasharray="130 10 70 8"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      <span
        className={`relative font-display text-[0.95rem] font-bold uppercase leading-none tracking-[0.12em] ${
          tone === 'cobalt' ? 'text-cobalt' : 'text-ink'
        }`}
      >
        {children}
      </span>
    </span>
  );
}
