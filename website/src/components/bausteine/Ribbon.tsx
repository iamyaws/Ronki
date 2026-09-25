import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 11. Ribbon                                                          */
/* ------------------------------------------------------------------ */

type Tone = 'cobalt' | 'sun';

const BAND: Record<Tone, string> = {
  cobalt: '#0544B0',
  sun: '#FDD134',
};

/** The folded end, one shade darker than the band it belongs to. */
const FOLD: Record<Tone, string> = {
  cobalt: '#03317F',
  sun: '#D9B01C',
};

const TEXT: Record<Tone, string> = {
  cobalt: 'text-white',
  sun: 'text-ink',
};

/**
 * A banner across the top of a chapter.
 *
 * Drawn band, two folded ends, Fredoka in caps. It opens a part of a
 * page that a small sticker label cannot carry on its own. One per
 * spread, never two under each other, and never with a sentence in it.
 */
export function Ribbon({
  children,
  tone = 'cobalt',
  rotate = -1.2,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  rotate?: number;
  className?: string;
}) {
  const band = BAND[tone];
  const fold = FOLD[tone];

  return (
    <span
      /* The folded ends hang 25px out on each side. The margin keeps
       *  that space free, so a ribbon never lands on its neighbour and
       *  never pokes over the edge of a phone screen. */
      className={`relative mx-[26px] inline-block ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Left and right folds, drawn at a fixed size so the notch keeps
       *  its shape however long the word is. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 34 64"
        preserveAspectRatio="none"
        className="absolute -left-[25px] top-0 h-full w-[26px]"
      >
        <path d="M34 4 L0 0 L13 32 L0 64 L34 60 Z" fill={fold} />
      </svg>
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 34 64"
        preserveAspectRatio="none"
        className="absolute -right-[25px] top-0 h-full w-[26px]"
      >
        <path d="M0 4 L34 0 L21 32 L34 64 L0 60 Z" fill={fold} />
      </svg>

      {/* The band itself. A drawn shape, not a rectangle: the top and
       *  bottom edges run a little uneven, like cut cloth. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 300 64"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M0 3 C 70 0 160 6 300 1 L300 61 C 210 64 110 58 0 62 Z"
          fill={band}
        />
      </svg>

      <span
        className={`relative block px-7 py-[14px] font-display text-lg font-bold uppercase leading-none tracking-[0.06em] sm:text-xl ${TEXT[tone]}`}
      >
        {children}
      </span>
    </span>
  );
}
