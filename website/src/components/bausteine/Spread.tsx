import type { ReactNode } from 'react';
import { PaperEdge } from '../primitives/PaperEdge';

/* ------------------------------------------------------------------ */
/* 17. Spread                                                          */
/* ------------------------------------------------------------------ */

type Ground = 'white' | 'paper' | 'sky-wash' | 'cobalt' | 'night';

const GROUND_CLASS: Record<Ground, string> = {
  white: 'bg-white text-ink',
  paper: 'bg-paper text-ink',
  'sky-wash': 'bg-sky-wash text-ink',
  cobalt: 'bg-cobalt text-white',
  night: 'bg-night text-white',
};

/**
 * One page of the book.
 *
 * It sets the ground, the vertical rhythm, the torn edge back into the
 * section above and the two slots every section repeats: a label at the
 * top left and a hand note in the margin. Sections stop re-inventing
 * their own padding, and two spreads in a row can never accidentally
 * carry the same ground without it being visible here.
 */
export function Spread({
  children,
  ground = 'white',
  /** A StickerLabel or a Ribbon. */
  label,
  /** A HandNote for the right margin. Hidden below lg, where it would
   *  sit on top of the copy. */
  note,
  edge = true,
  edgeVariant = 0,
  id,
  className = '',
  ...rest
}: {
  children: ReactNode;
  ground?: Ground;
  label?: ReactNode;
  note?: ReactNode;
  edge?: boolean;
  edgeVariant?: number;
  id?: string;
  className?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}) {
  return (
    <div className="relative">
      {edge && <PaperEdge tone={ground} variant={edgeVariant} />}
      <section
        id={id}
        className={`relative px-5 sm:px-6 py-12 sm:py-14 ${GROUND_CLASS[ground]} ${className}`}
        {...rest}
      >
        <div className="relative max-w-6xl mx-auto">
          {label}
          {note && (
            <div className="lg:absolute lg:right-2 lg:top-14 lg:w-[210px] lg:text-right">
              {note}
            </div>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}
