import type { CSSProperties, ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 1. NotebookPage                                                     */
/* ------------------------------------------------------------------ */

type Props = {
  children: ReactNode;
  /** Degrees. Kept inside the kit range so the sheet lies, not tilts. */
  rotate?: number;
  /** Ruled line spacing in px. The checklist rows sit on these lines. */
  ruleHeight?: number;
  /** A drawn ink outline. Off by default: the hard paper edge reads
   *  better and keeps the block apart from the outlined cards. */
  outlined?: boolean;
  className?: string;
};

/**
 * A page torn out of a school exercise book.
 *
 * Pale sky ruling drawn with a repeating gradient, an ember margin rule
 * down the left, three punched holes. No ink outline: the sheet gets a
 * hard paper edge instead, so it never reads as one more white card.
 *
 * Use it for lists a parent could have written by hand. Not for running
 * text, and not for anything that needs a picture in it.
 */
export function NotebookPage({
  children,
  rotate = -1.1,
  ruleHeight = 34,
  outlined = false,
  className = '',
}: Props) {
  const style: CSSProperties = {
    transform: `rotate(${rotate}deg)`,
    // Ruling starts below the top padding so the first line meets the
    // first row of text instead of cutting through the heading.
    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${
      ruleHeight - 1.5
    }px, rgba(185, 227, 252, 0.95) ${ruleHeight - 1.5}px, rgba(185, 227, 252, 0.95) ${ruleHeight}px)`,
    backgroundPosition: '0 14px',
    boxShadow: outlined
      ? undefined
      : '0 0 0 1px rgba(4, 8, 18, 0.10), 7px 8px 0 rgba(4, 8, 18, 0.09)',
  };

  return (
    <div
      className={`relative bg-white pl-14 pr-5 py-6 sm:pl-16 sm:pr-7 ${
        outlined ? 'border-[3px] border-ink rounded-[6px]' : 'rounded-[3px]'
      } ${className}`}
      style={style}
    >
      {/* Margin rule, the red-orange line every exercise book has. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[42px] w-[2px] bg-ember/45 sm:left-[48px]"
      />

      {/* Three punched holes. Real shapes, not dots: a darker well with a
       *  soft ink ring, so they read as holes on white and on paper. */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-[14px] sm:left-[17px]">
        {['18%', '50%', '82%'].map((top) => (
          <span
            key={top}
            className="absolute h-[15px] w-[15px] -translate-y-1/2 rounded-full"
            style={{
              top,
              background: 'rgba(4, 8, 18, 0.11)',
              boxShadow: 'inset 0 0 0 1px rgba(4, 8, 18, 0.30)',
            }}
          />
        ))}
      </span>

      <div style={{ lineHeight: `${ruleHeight}px` }}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ChecklistItem                                                       */
/* ------------------------------------------------------------------ */

/**
 * One line on the notebook page, with a drawn mark in front of it.
 *
 * The mark is the same crayon check and crayon cross the honest list
 * uses, so a ticked line here and a ticked line there mean the same
 * thing.
 */
export function ChecklistItem({
  children,
  mark = 'check',
  className = '',
}: {
  children: ReactNode;
  mark?: 'check' | 'cross' | 'none';
  className?: string;
}) {
  return (
    <li className={`flex items-start gap-3 ${className}`}>
      {mark !== 'none' && (
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 64 64"
          className={`mt-[7px] h-[19px] w-[19px] shrink-0 ${
            mark === 'check' ? 'text-cobalt' : 'text-ink/70'
          }`}
        >
          <use href={mark === 'check' ? '#bb-check' : '#bb-cross'} />
        </svg>
      )}
      <span className="font-display font-semibold text-[1.02rem] text-ink [hyphens:none]">
        {children}
      </span>
    </li>
  );
}
