import type { ReactNode } from 'react';

/**
 * The little tilted label that replaces the old grey uppercase eyebrow.
 *
 * Same shape as the "MORGEN" sticker on the printed routine sheet: a
 * rounded patch of colour, hand lettering, a few degrees off straight.
 * One per section.
 */

type Tone = 'sun' | 'cobalt' | 'white' | 'sky-wash';

const TONE_CLASS: Record<Tone, string> = {
  sun: 'bg-sun text-ink',
  cobalt: 'bg-cobalt text-white',
  white: 'bg-white text-ink',
  'sky-wash': 'bg-sky-wash text-ink',
};

export function StickerLabel({
  children,
  tone = 'sun',
  rotate = -3,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={`bb-hand inline-block rounded-[10px] px-4 py-1.5 text-lg sm:text-xl uppercase leading-none ${TONE_CLASS[tone]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
