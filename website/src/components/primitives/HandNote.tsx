import { ReactNode } from 'react';

type Tone = 'cobalt' | 'sun';
type NoteIcon = 'none' | 'heart' | 'arrow';

type Props = {
  children: ReactNode;
  /** cobalt on white, sun on cobalt or night. Never sun on white. */
  tone?: Tone;
  /** Degrees, kept between -6 and 6 so it reads as a pinned note, not a gimmick. */
  rotate?: number;
  icon?: NoteIcon;
  /** Placement. Sections pass the desktop margin position here. */
  className?: string;
};

/**
 * A note in the margin, in the hand voice.
 *
 * One per section on the start page. Real text, not decoration, so it
 * carries no aria-hidden and it never starts at opacity 0: it renders
 * with the section, animation or not. On phones it sits inline under
 * the section head; the position classes a section passes in move it
 * into the margin from lg upwards.
 */
export function HandNote({
  children,
  tone = 'cobalt',
  rotate = -4,
  icon = 'none',
  className = '',
}: Props) {
  const color = tone === 'sun' ? 'text-sun' : 'text-cobalt';
  return (
    <p
      className={`bb-hand text-xl sm:text-2xl leading-[1.15] ${color} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
      {icon !== 'none' && (
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 64 64"
          className={`ml-2 inline-block h-5 w-5 align-[-0.05em] ${
            icon === 'heart' ? 'text-ember' : ''
          }`}
        >
          <use href={icon === 'heart' ? '#bb-heart' : '#bb-arrow'} />
        </svg>
      )}
    </p>
  );
}
