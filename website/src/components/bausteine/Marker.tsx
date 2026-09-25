import type { CSSProperties, ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 12. MarkerHighlight and MarkerUnderline                             */
/* ------------------------------------------------------------------ */

type Tone = 'sun' | 'sky-wash';

/** The swipe shape: uneven ends, a slightly thin middle, like a pen
 *  that was drawn once across the words and not lifted cleanly. */
function swipe(hex: string) {
  const fill = hex.replace('#', '%23');
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40' preserveAspectRatio='none'><path d='M5 12 C 42 4 96 7 141 5 C 172 4 196 7 198 13 C 200 22 195 31 187 34 C 146 38 74 33 27 36 C 12 37 2 32 3 23 Z' fill='${fill}'/></svg>")`;
}

const HEX: Record<Tone, string> = {
  sun: '#FDD134',
  'sky-wash': '#B9E3FC',
};

/**
 * A marker swipe behind a few words.
 *
 * It sits behind the text, so the words stay ink. It keeps working over
 * a line break, because every line gets its own swipe with its own
 * ragged ends. Use it on two or three words, never on a whole sentence.
 */
export function MarkerHighlight({
  children,
  tone = 'sun',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const style: CSSProperties = {
    backgroundImage: swipe(HEX[tone]),
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
    padding: '0.08em 0.26em 0.14em',
    margin: '0 -0.06em',
  };
  return (
    <span className={`text-ink ${className}`} style={style}>
      {children}
    </span>
  );
}

/**
 * The drawn sun line under the last words of a headline.
 *
 * The device the headlines already use, packed as a block so it stops
 * being copied by hand into every section. The words never break across
 * lines inside it.
 */
export function MarkerUnderline({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    /* isolate, because the line is drawn at z-index -1: without a
     *  stacking context of its own it slides behind the background of
     *  whatever panel the headline sits in and disappears. */
    <span className={`bb-swipe isolate ${className}`}>
      {children}
      <svg aria-hidden focusable="false" viewBox="0 0 300 20" preserveAspectRatio="none">
        <use href="#bb-underline" />
      </svg>
    </span>
  );
}
