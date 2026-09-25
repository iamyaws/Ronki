import React from 'react';
import { DoodleIcon } from '../bilderbuch';

/**
 * Small Bilderbuch pieces shared by the home lane (RoomHub, RonkisTag,
 * Belohnungsbank). Kept next to the screens instead of in the
 * primitives folder, which belongs to the foundation.
 */

/** A sun disc with an ink check on it: the Bilderbuch "done" sticker. */
export function SunCheck({ size = 28, className = '', style }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-sun text-ink shrink-0 ${className}`}
      style={{ width: size, height: size, border: '2.5px solid var(--color-ink)', boxSizing: 'border-box', ...style }}
    >
      <DoodleIcon name="check" size={Math.round(size * 0.6)} stroke={8} />
    </span>
  );
}

/** A sun sticker with a hand-written word on it ("jetzt", "fertig"). */
export function SunSticker({ children, rotate = -4, className = '', style }) {
  return (
    <span
      className={`bb-hand inline-flex items-center justify-center rounded-full bg-sun text-ink ${className}`}
      style={{
        padding: '6px 12px 5px',
        border: '2.5px solid var(--color-ink)',
        fontSize: 18,
        lineHeight: 1,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
