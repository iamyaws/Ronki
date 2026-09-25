import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 10. Chalkboard                                                      */
/* ------------------------------------------------------------------ */

/**
 * The board in the kitchen, after dark.
 *
 * Night ground, a plain drawn frame, chalk white type and a chalk line
 * under the heading. It carries the evening half of the day and every
 * quiet, dark panel. Sun and ember are allowed on it, because night is
 * the one ground that carries them.
 */
export function Chalkboard({
  children,
  title,
  eyebrow,
  frame = 'white',
  rotate = -0.6,
  className = '',
}: {
  children: ReactNode;
  title?: ReactNode;
  /** Small hand line above the heading, in sun. */
  eyebrow?: ReactNode;
  frame?: 'white' | 'ink';
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border-[3px] bg-night px-6 py-6 text-white sm:px-7 ${
        frame === 'white' ? 'border-white/85' : 'border-ink'
      } ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Two faint chalk smudges. Low enough that the board stays clean
       *  and no text sits on a visible cloud. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 top-4 h-24 w-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07), transparent 68%)' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-8 bottom-0 h-20 w-36 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)' }}
      />

      <div className="relative">
        {eyebrow && (
          <p className="bb-hand text-xl uppercase leading-none text-sun">{eyebrow}</p>
        )}
        {title && (
          <>
            <h3 className={`bb-display text-2xl sm:text-[1.7rem] text-white ${eyebrow ? 'mt-3' : ''}`}>
              {title}
            </h3>
            {/* The chalk line under the heading. */}
            <svg
              aria-hidden
              focusable="false"
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              className="mt-2 h-3 w-[62%] overflow-visible text-white/80"
            >
              <path
                d="M2 8 C 60 4 120 10 180 6 C 230 3 270 9 298 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </>
        )}
        <div className={`text-[1.02rem] leading-relaxed text-white/[0.88] ${title || eyebrow ? 'mt-4' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
