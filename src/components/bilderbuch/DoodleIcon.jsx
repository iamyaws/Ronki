import React from 'react';

/**
 * DoodleIcon: the drawn marker icons of the Bilderbuch app.
 *
 * One component, one set of shapes, all in currentColor, all drawn with
 * the same round marker stroke and a slight wobble. They replace the
 * Material Symbols glyphs on kid-facing screens (tab bar, top bar,
 * toasts, choice tiles). Decorative by default: `aria-hidden`, unless
 * a `label` is passed, which turns the icon into an accessible image.
 *
 * Props:
 *   name    one of DOODLE_ICON_NAMES
 *   size    rendered height in px (default 24); width follows the box
 *   filled  closed shapes (star, heart, sparkle, moon, drop, sun disc)
 *           render as solid stickers instead of outlines
 *   stroke  stroke width in viewBox units (default 5.5)
 *   label   accessible name; omit for purely decorative use
 */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const SHAPES = {
  home: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M9 33 C 17 25 25 18 32 11 C 39 18 47 26 55 33" />
        <path d="M16 29 C 16 37 16 45 17 52 C 27 52 38 52 48 52 C 48 45 48 37 48 29" />
        <path d="M27 52 C 27 48 27 44 27 40 C 30 40 34 40 37 40 C 37 44 37 48 37 52" />
      </g>
    ),
  },
  leaf: {
    box: '0 0 64 64',
    node: (filled) => (
      <g>
        <path
          d="M32 8 C 50 14 56 34 46 50 C 30 54 16 42 18 26 C 20 16 26 10 32 8 Z"
          fill={filled ? 'currentColor' : 'none'}
        />
        <path d="M32 14 C 34 28 38 40 45 48" stroke={filled ? '#fff' : 'currentColor'} strokeOpacity={filled ? 0.55 : 1} />
        <path d="M44 50 C 40 55 36 58 30 60" />
      </g>
    ),
  },
  book: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M32 17 C 24 11 14 11 8 14 C 8 27 8 40 8 52 C 14 49 24 49 32 55 C 40 49 50 49 56 52 C 56 40 56 27 56 14 C 50 11 40 11 32 17 Z" />
        <path d="M32 17 C 32 30 32 43 32 55" />
      </g>
    ),
  },
  sun: {
    box: '0 0 64 64',
    node: (filled) => (
      <g>
        <path
          d="M32 17 C 41 17 47 24 46 32 C 45 40 39 46 31 45 C 23 44 18 38 19 30 C 20 23 25 17 32 17 Z"
          fill={filled ? 'currentColor' : 'none'}
        />
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
    node: (filled) => (
      <path
        d="M40 6 C 24 10 14 22 15 36 C 16 50 28 60 42 58 C 31 51 26 40 28 29 C 30 18 34 11 40 6 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  star: {
    box: '0 0 64 64',
    node: (filled) => (
      <path
        d="M32 5 C 34 11 37 17 39 23 C 45 24 52 24 58 25 C 53 29 48 33 43 37 C 45 43 46 50 48 56 C 43 53 37 49 32 46 C 27 49 21 53 16 56 C 18 50 19 43 21 37 C 16 33 11 29 6 25 C 12 24 19 24 25 23 C 27 17 30 11 32 5 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  sparkle: {
    box: '0 0 64 64',
    node: (filled) => (
      <path
        d="M32 5 C 35 20 43 28 58 32 C 43 36 35 44 32 59 C 29 44 21 36 6 32 C 21 28 29 20 32 5 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  sound: {
    box: '0 0 64 64',
    node: (filled) => (
      <g>
        <path
          d="M8 26 C 8 30 8 34 8 38 C 12 38 16 38 18 38 C 22 42 26 46 30 50 C 30 36 30 22 30 11 C 26 15 22 20 18 24 C 15 24 11 25 8 26 Z"
          fill={filled ? 'currentColor' : 'none'}
        />
        <path d="M38 22 C 42 27 42 33 38 40" />
        <path d="M45 15 C 52 24 52 36 45 46" />
      </g>
    ),
  },
  lock: {
    box: '0 0 64 64',
    node: (filled) => (
      <g>
        <path
          d="M14 30 C 14 38 14 46 15 54 C 26 54 38 54 49 54 C 50 46 50 38 50 30 C 38 30 26 30 14 30 Z"
          fill={filled ? 'currentColor' : 'none'}
        />
        <path d="M22 30 C 22 22 22 13 32 12 C 42 13 42 22 42 30" />
        <path d="M32 38 C 32 41 32 44 32 46" stroke={filled ? '#fff' : 'currentColor'} />
      </g>
    ),
  },
  back: {
    box: '0 0 64 64',
    node: () => <path d="M40 10 C 33 17 26 24 19 32 C 26 39 33 46 40 54" />,
  },
  arrow: {
    box: '0 0 64 64',
    node: () => <path d="M24 10 C 31 17 38 24 45 32 C 38 39 31 46 24 54" />,
  },
  check: {
    box: '0 0 64 64',
    node: () => <path d="M10 34 C 16 40 21 45 26 50 C 34 36 44 24 55 14" />,
  },
  close: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M14 13 C 26 26 38 38 51 51" />
        <path d="M51 14 C 38 27 25 39 13 50" />
      </g>
    ),
  },
  plus: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M32 11 C 33 25 33 39 32 53" />
        <path d="M11 32 C 25 31 39 31 53 32" />
      </g>
    ),
  },
  heart: {
    box: '0 0 64 64',
    node: (filled) => (
      <path
        d="M32 55 C 9 40 6 22 19 16 C 27 12 31 18 32 23 C 34 18 38 12 46 15 C 59 20 55 40 32 55 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  dragon: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M32 14 C 45 14 53 23 53 34 C 53 46 44 55 32 55 C 20 55 11 46 11 34 C 11 23 19 14 32 14 Z" />
        <path d="M21 17 C 19 12 17 8 15 4" />
        <path d="M43 17 C 45 12 47 8 49 4" />
        <path d="M28 21 C 30 17 33 15 36 19" strokeWidth="4" />
        <circle cx="25" cy="34" r="3" fill="currentColor" stroke="none" />
        <circle cx="39" cy="34" r="3" fill="currentColor" stroke="none" />
        <path d="M26 44 C 30 48 34 48 38 44" />
      </g>
    ),
  },
  paw: {
    box: '0 0 64 64',
    node: (filled) => (
      <g fill={filled ? 'currentColor' : 'none'}>
        <path d="M32 54 C 24 54 17 48 20 41 C 22 35 27 33 32 33 C 37 33 42 35 44 41 C 47 48 40 54 32 54 Z" />
        <circle cx="16" cy="29" r="5" />
        <circle cx="26" cy="19" r="5" />
        <circle cx="38" cy="19" r="5" />
        <circle cx="48" cy="29" r="5" />
      </g>
    ),
  },
  gift: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M10 29 C 10 37 10 45 11 54 C 25 54 39 54 53 54 C 54 45 54 37 54 29" />
        <path d="M6 20 C 6 23 6 26 6 29 C 24 29 40 29 58 29 C 58 26 58 23 58 20 C 40 20 24 20 6 20 Z" />
        <path d="M32 20 C 32 31 32 42 32 54" />
        <path d="M32 20 C 26 12 18 9 20 15 C 22 19 28 20 32 20 C 36 20 42 19 44 15 C 46 9 38 12 32 20" />
      </g>
    ),
  },
  bag: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M12 22 C 12 33 12 44 13 55 C 26 55 38 55 51 55 C 52 44 52 33 52 22 C 38 22 26 22 12 22 Z" />
        <path d="M22 22 C 22 14 26 8 32 8 C 38 8 42 14 42 22" />
      </g>
    ),
  },
  cloud: {
    box: '0 0 64 64',
    node: (filled) => (
      <path
        d="M16 46 C 8 46 3 40 5 33 C 7 27 13 24 18 26 C 19 15 29 9 38 13 C 45 16 48 23 47 28 C 55 27 60 33 58 40 C 56 45 51 47 46 46 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  flame: {
    box: '0 0 64 64',
    node: (filled) => (
      <g>
        <path
          d="M32 6 C 42 18 48 26 46 38 C 45 50 38 58 32 58 C 24 58 18 50 18 38 C 18 30 24 26 26 20 C 27 26 31 28 32 22 C 33 16 33 12 32 6 Z"
          fill={filled ? 'currentColor' : 'none'}
        />
        <path d="M32 58 C 27 56 25 50 27 46 C 29 42 31 42 32 38 C 33 42 36 44 37 47 C 39 51 37 56 32 58" stroke={filled ? '#fff' : 'currentColor'} strokeOpacity={filled ? 0.6 : 1} strokeWidth="4" />
      </g>
    ),
  },
  drop: {
    box: '0 0 64 64',
    node: (filled) => (
      <path
        d="M32 6 C 40 18 50 28 50 40 C 50 50 42 58 32 58 C 22 58 14 50 14 40 C 14 28 24 18 32 6 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  egg: {
    box: '0 0 64 64',
    node: (filled) => (
      <path
        d="M32 6 C 44 6 52 22 52 36 C 52 50 43 58 32 58 C 21 58 12 50 12 36 C 12 22 20 6 32 6 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  bolt: {
    box: '0 0 64 64',
    node: (filled) => (
      <path
        d="M37 6 C 31 17 25 27 19 37 C 24 37 28 37 32 37 C 30 44 28 51 27 58 C 34 48 40 38 46 28 C 41 28 37 28 33 28 C 34 21 36 13 37 6 Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    ),
  },
  scribble: {
    box: '0 0 120 100',
    node: () => (
      <path d="M18 62 C 6 44 20 20 44 16 C 70 12 96 26 100 48 C 104 70 84 86 62 84 C 40 82 26 70 26 56 C 26 40 44 30 60 34 C 76 38 82 54 74 64 C 66 74 50 72 46 62 C 42 52 52 44 60 48" />
    ),
  },
  tangle: {
    box: '0 0 120 100',
    node: () => (
      <g>
        <path d="M10 72 C 14 26 58 8 92 28" />
        <path d="M100 32 C 116 62 90 94 56 84" />
        <path d="M60 88 C 22 80 10 44 44 26" />
        <path d="M42 22 C 78 12 100 48 76 66 C 60 78 40 64 50 48" />
      </g>
    ),
  },
  ticks: {
    box: '0 0 64 64',
    node: () => (
      <g>
        <path d="M8 18 L34 10" />
        <path d="M6 32 L38 30" />
        <path d="M8 46 L34 53" />
      </g>
    ),
  },
};

export const DOODLE_ICON_NAMES = Object.keys(SHAPES);

export default function DoodleIcon({
  name,
  size = 24,
  filled = false,
  stroke = 5.5,
  label,
  className = '',
  style,
}) {
  const shape = SHAPES[name] || SHAPES.sparkle;
  const [, , boxW, boxH] = shape.box.split(' ').map(Number);
  const width = Math.round((size * boxW) / boxH);
  return (
    <svg
      viewBox={shape.box}
      width={width}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
      className={`inline-block shrink-0 align-middle ${className}`}
      style={{ overflow: 'visible', ...style }}
      {...S}
      strokeWidth={stroke}
    >
      {shape.node(filled)}
    </svg>
  );
}
