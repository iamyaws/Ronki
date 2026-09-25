import React from 'react';

/**
 * MotionTicks: the three small tick marks the boards draw around a head
 * that just turned, a claw that just waved, a thing that just happened.
 *
 * Props:
 *   tone    'sun' | 'cobalt' | 'ink' (default 'sun')
 *   size    height in px (default 28)
 *   rotate  degrees; 0 fans to the right, -90 fans upward
 *   count   2 or 3 ticks (default 3)
 */

const TONE = {
  sun: 'var(--color-sun)',
  cobalt: 'var(--color-cobalt)',
  ink: 'var(--color-ink)',
  ember: 'var(--color-ember)',
  white: '#ffffff',
};

export default function MotionTicks({
  tone = 'sun',
  size = 28,
  rotate = 0,
  count = 3,
  className = '',
  style,
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      style={{
        color: TONE[tone] || TONE.sun,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        overflow: 'visible',
        ...style,
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
    >
      <path d="M8 18 L34 10" />
      <path d="M6 32 L38 30" />
      {count >= 3 && <path d="M8 46 L34 53" />}
    </svg>
  );
}
