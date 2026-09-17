import type { CSSProperties, ReactNode } from 'react';
import { StickerLabel } from '../primitives/StickerLabel';
import { WashiTape } from '../primitives/WashiTape';

/* ------------------------------------------------------------------ */
/* 4. PrintedSheet                                                     */
/* ------------------------------------------------------------------ */

type LabelTone = 'sun' | 'cobalt' | 'white' | 'sky-wash';

/**
 * The printed sheet lying on the table.
 *
 * White, ink outline, taped at the top, a sticker label in the corner
 * and a dashed tear line at the foot. It is the block for anything that
 * exists on paper in real life: a routine, a plan, a list a child ticks
 * off. Lifted out of the "Ein Tag" section unchanged.
 *
 * Rows go in as SheetRow, so a sheet always ticks the same way.
 */
export function PrintedSheet({
  children,
  label,
  labelTone = 'sun',
  labelRotate = -3,
  title,
  corner,
  tilt = 0,
  tape = true,
  tapeRotate = -6,
  tearLine = true,
  className = '',
  ...rest
}: {
  children: ReactNode;
  label?: ReactNode;
  labelTone?: LabelTone;
  labelRotate?: number;
  /** The Fredoka line under the label. */
  title?: ReactNode;
  /** Top right slot: an emoji, a doodle, a stamp. */
  corner?: ReactNode;
  /** Degrees. Halved below md so nothing pokes out of a phone column. */
  tilt?: number;
  tape?: boolean;
  tapeRotate?: number;
  tearLine?: boolean;
  className?: string;
  role?: string;
  'aria-label'?: string;
}) {
  return (
    <div
      className={`relative rounded-[24px] border-[3px] border-ink bg-white px-5 pt-7 pb-6 [transform:rotate(calc(var(--tilt)*0.5))] md:[transform:rotate(var(--tilt))] ${className}`}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
      {...rest}
    >
      {tape && (
        <WashiTape
          className="-top-3.5 left-1/2 -ml-[44px] w-[88px] h-8"
          rotate={tapeRotate}
        />
      )}

      {(label || corner) && (
        <div className="flex items-start justify-between gap-3">
          {label ? (
            <StickerLabel tone={labelTone} rotate={labelRotate}>
              {label}
            </StickerLabel>
          ) : (
            <span />
          )}
          {corner && (
            <span aria-hidden className="text-2xl leading-none">
              {corner}
            </span>
          )}
        </div>
      )}

      {title && <p className="bb-display mt-4 text-xl sm:text-2xl text-ink">{title}</p>}

      {children}

      {tearLine && (
        <svg
          aria-hidden
          viewBox="0 0 600 6"
          preserveAspectRatio="none"
          className="mt-5 h-1.5 w-full text-ink/35"
        >
          <use href="#bb-dash" />
        </svg>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SheetRow                                                            */
/* ------------------------------------------------------------------ */

type RowState = 'done' | 'current' | 'open';

/**
 * One line on a printed sheet.
 *
 * done      drawn ring with a cobalt check inside
 * current   drawn ring on a sun band, the thing that is next
 * open      drawn ring, nothing else
 */
export function SheetRow({
  children,
  state = 'open',
  className = '',
}: {
  children: ReactNode;
  state?: RowState;
  className?: string;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-[14px] px-2.5 py-2 ${
        state === 'current' ? 'bg-sun' : ''
      } ${className}`}
    >
      <span aria-hidden className="relative h-8 w-8 shrink-0">
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-8 w-8 text-cobalt">
          <use href="#bb-ring" />
        </svg>
        {state === 'done' && (
          <svg viewBox="0 0 64 64" className="absolute inset-[6px] h-5 w-5 text-cobalt">
            <use href="#bb-check" />
          </svg>
        )}
      </span>
      <span className="font-display font-semibold text-[0.95rem] sm:text-base text-ink leading-snug">
        {children}
      </span>
    </li>
  );
}
