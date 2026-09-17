import type { ReactNode } from 'react';
import { WashiTape } from '../primitives/WashiTape';

/* ------------------------------------------------------------------ */
/* 3. StickyNote                                                       */
/* ------------------------------------------------------------------ */

type Tone = 'sun' | 'sky-wash';

const TONE_CLASS: Record<Tone, string> = {
  sun: 'bg-sun',
  'sky-wash': 'bg-sky-wash',
};

const CURL_SHADE: Record<Tone, string> = {
  sun: '#E3B71D',
  'sky-wash': '#93C8E6',
};

/**
 * The square note somebody stuck on the page.
 *
 * Sun ground, a strip of tape, ink text, one corner lifting off the
 * paper. It explains a single word or idea in passing, so there is only
 * ever one per page. The moment a second one shows up, both stop being
 * a remark and start being a layout.
 */
export function StickyNote({
  children,
  eyebrow,
  title,
  tone = 'sun',
  /** Leave unset for the responsive default the start page uses. */
  rotate,
  tape = true,
  curl = true,
  className = '',
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  tone?: Tone;
  rotate?: number;
  tape?: boolean;
  curl?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[22px] px-6 py-7 sm:px-7 ${TONE_CLASS[tone]} ${
        rotate === undefined ? 'rotate-[0.8deg] sm:rotate-[1.5deg]' : ''
      } ${className}`}
      style={rotate === undefined ? undefined : { transform: `rotate(${rotate}deg)` }}
    >
      {tape && <WashiTape className="-top-3 left-8 w-24 h-9" rotate={-7} tone="paper" />}

      {eyebrow && (
        <p className="bb-hand text-xl uppercase leading-none text-ink/80">{eyebrow}</p>
      )}
      {title && <p className="bb-display mt-3 text-2xl sm:text-3xl text-ink">{title}</p>}
      <div className="mt-3 text-base sm:text-[1.05rem] text-ink/90 leading-relaxed">
        {children}
      </div>

      {/* The lifted corner. Two triangles: the shaded underside of the
       *  sheet and the white gap it leaves behind. CSS only. */}
      {curl && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 rounded-br-[22px]"
          style={{
            background: `linear-gradient(315deg, ${CURL_SHADE[tone]} 0 40%, rgba(4,8,18,0.22) 41%, rgba(4,8,18,0.06) 44%, rgba(4,8,18,0) 47%)`,
          }}
        />
      )}
    </div>
  );
}
