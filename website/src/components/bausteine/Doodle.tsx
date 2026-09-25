import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 15. Doodle                                                          */
/* ------------------------------------------------------------------ */

export type DoodleName =
  | 'star'
  | 'sparkle-trio'
  | 'leaf'
  | 'tangle'
  | 'arrow-curved'
  | 'arrow-straight'
  | 'heart'
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'motion-ticks'
  | 'spiral'
  | 'zigzag'
  | 'check'
  | 'cross'
  | 'plus';

/** Every doodle draws in currentColor, so a doodle takes the colour of
 *  whatever it sits next to. */
const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const SHAPES: Record<DoodleName, { box: string; node: ReactNode }> = {
  star: {
    box: '0 0 64 64',
    node: (
      <path
        d="M32 3 C35.7 21 43 28.3 61 32 C43 35.7 35.7 43 32 61 C28.3 43 21 35.7 3 32 C21 28.3 28.3 21 32 3 Z"
        fill="currentColor"
      />
    ),
  },
  'sparkle-trio': {
    box: '0 0 64 64',
    node: (
      <g fill="currentColor">
        <path d="M22 4 C24.4 15 28 18.6 39 21 C28 23.4 24.4 27 22 38 C19.6 27 16 23.4 5 21 C16 18.6 19.6 15 22 4 Z" />
        <path d="M48 28 C49.3 34 51 35.7 57 37 C51 38.3 49.3 40 48 46 C46.7 40 45 38.3 39 37 C45 35.7 46.7 34 48 28 Z" />
        <path d="M18 46 C18.9 50 20 51.1 24 52 C20 52.9 18.9 54 18 58 C17.1 54 16 52.9 12 52 C16 51.1 17.1 50 18 46 Z" />
      </g>
    ),
  },
  leaf: {
    box: '0 0 64 64',
    node: (
      <g>
        {/* One almond leaf on a bent stem, with a midrib. */}
        <path
          d="M32 10 C 48 18 54 34 46 48 C 30 52 18 40 20 26 C 21 18 26 13 32 10 Z"
          fill="currentColor"
        />
        <path d="M33 14 C 34 28 38 38 45 46" stroke="#fff" strokeOpacity="0.5" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M44 48 C 40 54 35 58 28 60" {...S} strokeWidth={4} />
      </g>
    ),
  },
  tangle: {
    box: '0 0 120 100',
    node: (
      <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
        {/* Crossing loops, the way a scribbled-out morning looks. */}
        <path d="M10 72 C 14 26 58 8 92 28" />
        <path d="M100 32 C 116 62 90 94 56 84" />
        <path d="M60 88 C 22 80 10 44 44 26" />
        <path d="M42 22 C 78 12 100 48 76 66 C 60 78 40 64 50 48" />
      </g>
    ),
  },
  'arrow-curved': {
    box: '0 0 64 64',
    node: (
      <g {...S}>
        <path d="M6 52 C 12 24 28 10 52 14" />
        <path d="M40 8 C 45 10 49 12 53 14 C 50 18 47 22 45 27" />
      </g>
    ),
  },
  'arrow-straight': {
    box: '0 0 64 64',
    node: (
      <g {...S}>
        <path d="M5 32 C 20 30 38 33 54 31" />
        <path d="M41 19 L55 31 L41 44" />
      </g>
    ),
  },
  heart: {
    box: '0 0 64 64',
    node: <use href="#bb-heart" />,
  },
  sun: {
    box: '0 0 64 64',
    node: (
      <g {...S}>
        <path d="M32 16 C 42 16 48 24 47 32 C 46 41 39 47 31 46 C 22 45 17 38 18 30 C 19 22 25 16 33 17" />
        <path d="M32 3 L32 9" />
        <path d="M32 55 L32 61" />
        <path d="M3 32 L9 32" />
        <path d="M55 32 L61 32" />
        <path d="M12 12 L16 16" />
        <path d="M48 48 L52 52" />
        <path d="M52 12 L48 16" />
        <path d="M16 48 L12 52" />
      </g>
    ),
  },
  moon: {
    box: '0 0 64 64',
    node: (
      <path
        d="M41 5 C 24 8 12 21 13 36 C 14 51 27 61 42 59 C 30 51 25 40 27 29 C 29 18 34 10 41 5 Z"
        fill="currentColor"
      />
    ),
  },
  cloud: {
    box: '0 0 64 64',
    node: (
      <path
        d="M16 46 C 8 46 3 40 5 33 C 7 27 13 24 18 26 C 19 15 29 9 38 13 C 45 16 48 23 47 28 C 55 27 60 33 58 40 C 56 45 51 47 46 46 Z"
        {...S}
      />
    ),
  },
  'motion-ticks': {
    box: '0 0 64 64',
    node: (
      <g {...S} strokeWidth={6}>
        <path d="M8 18 L34 10" />
        <path d="M6 32 L38 30" />
        <path d="M8 46 L34 53" />
      </g>
    ),
  },
  spiral: {
    box: '0 0 64 64',
    node: (
      <path
        d="M33 34 C 28 34 26 29 30 26 C 36 22 43 28 42 36 C 41 46 31 52 21 48 C 9 43 5 28 14 16 C 22 6 38 2 50 8"
        {...S}
      />
    ),
  },
  zigzag: {
    box: '0 0 64 64',
    node: <path d="M4 44 L18 20 L31 43 L45 20 L60 42" {...S} />,
  },
  check: {
    box: '0 0 64 64',
    node: <use href="#bb-check" />,
  },
  cross: {
    box: '0 0 64 64',
    node: <use href="#bb-cross" />,
  },
  plus: {
    box: '0 0 64 64',
    node: <use href="#bb-plus" />,
  },
};

/**
 * The drawn marks.
 *
 * One component, sixteen shapes, all in currentColor, all drawn with the
 * same crayon wobble. They are punctuation: a star beside a promise, a
 * curved arrow to the next step, a tangle where a morning went wrong.
 * They never stand in for an icon set and never carry meaning on their
 * own, which is why they are hidden from screen readers.
 */
export function Doodle({
  name,
  size = 32,
  rough = true,
  className = '',
  rotate = 0,
}: {
  name: DoodleName;
  /** Rendered size in px. */
  size?: number;
  /** The soft crayon wobble. Off for very small marks. */
  rough?: boolean;
  className?: string;
  rotate?: number;
}) {
  const shape = SHAPES[name];
  // Not every doodle sits in a square box. The tangle is wider than it
  // is tall, so the width follows the box instead of being forced.
  const [, , boxW, boxH] = shape.box.split(' ').map(Number);
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={shape.box}
      width={Math.round((size * boxW) / boxH)}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      style={{
        filter: rough ? 'url(#bb-crayon-soft)' : undefined,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      {shape.node}
    </svg>
  );
}

export const DOODLE_NAMES = Object.keys(SHAPES) as DoodleName[];
