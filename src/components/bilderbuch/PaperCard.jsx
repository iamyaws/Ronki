import React from 'react';

/**
 * PaperCard: the Bilderbuch frame.
 *
 * Ink outline about 3 px, corners about 28 px, white or paper fill. No
 * shadow; depth comes from overlap and the outline. `lift` adds the one
 * allowed depth device, a hard offset second sheet. `tone` also allows
 * the whole-moment grounds (sky-wash, sun, cobalt, night); on cobalt and
 * night the text flips to white.
 *
 * Props:
 *   tone     'white' (default) | 'paper' | 'paper-warm' | 'sky-wash' | 'sun' | 'cobalt' | 'night'
 *   lift     hard offset sheet behind the card
 *   pad      'none' | 'sm' | 'md' (default) | 'lg'
 *   as       element type (default 'div'); 'button' gets a press state
 */

const TONE = {
  white: 'bg-white text-ink border-ink',
  paper: 'bg-paper text-ink border-ink',
  'paper-warm': 'bg-paper-warm text-ink border-ink',
  'sky-wash': 'bg-sky-wash text-ink border-ink',
  sun: 'bg-sun text-ink border-ink',
  cobalt: 'bg-cobalt text-white border-ink',
  night: 'bg-night text-white border-ink',
};

const PAD = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export default function PaperCard({
  children,
  tone = 'white',
  lift = false,
  pad = 'md',
  as: Tag = 'div',
  className = '',
  style,
  ...rest
}) {
  const press = Tag === 'button' ? 'text-left active:scale-[0.985] transition-transform' : '';
  return (
    <Tag
      className={`relative rounded-[28px] border-[3px] ${TONE[tone] || TONE.white} ${PAD[pad] ?? PAD.md} ${lift ? 'bb-lift' : ''} ${press} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
