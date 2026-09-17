import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 16. DrawnLink and PillButton                                        */
/* ------------------------------------------------------------------ */

type LinkTone = 'cobalt' | 'ink' | 'white' | 'sun';

const LINK_TEXT: Record<LinkTone, string> = {
  cobalt: 'text-cobalt',
  ink: 'text-ink',
  white: 'text-white',
  sun: 'text-sun',
};

/**
 * A secondary link, with no box around it.
 *
 * A wobbly line under the words that stretches out when you point at it,
 * and a small drawn arrow that steps along. This is the block for every
 * link that is not the one action on the page. A link never wears a
 * card, and a link never wears a pill unless it is the main action.
 */
export function DrawnLink({
  children,
  href,
  tone = 'cobalt',
  arrow = true,
  onClick,
  className = '',
}: {
  children: ReactNode;
  href: string;
  tone?: LinkTone;
  arrow?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group relative inline-flex items-baseline gap-2 pb-2 font-display text-[1.05rem] font-semibold [hyphens:none] ${LINK_TEXT[tone]} ${className}`}
    >
      <span className="relative">
        {children}
        {/* The line keeps its 2.5px weight however far it is stretched,
         *  so it stays a drawn line and never turns into a smear. */}
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 300 12"
          preserveAspectRatio="none"
          className="absolute -bottom-[6px] left-0 h-[8px] w-full origin-left scale-x-[0.82] overflow-visible transition-transform duration-200 group-hover:scale-x-100"
        >
          <path
            d="M2 7 C 58 3 132 10 196 5 C 238 2 268 9 298 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
      {arrow && (
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 64 64"
          className="h-3.5 w-3.5 shrink-0 self-center transition-transform duration-200 group-hover:translate-x-1"
        >
          <use href="#bb-arrow" />
        </svg>
      )}
    </a>
  );
}

/* ------------------------------------------------------------------ */

type PillTone = 'primary' | 'outline' | 'on-dark' | 'on-night';

const PILL_CLASS: Record<PillTone, string> = {
  primary: 'bg-cobalt text-white',
  outline: 'border-[2.5px] border-ink bg-white text-ink',
  'on-dark': 'bg-white text-ink',
  'on-night': 'bg-sun text-ink',
};

/**
 * The one action on a page.
 *
 * Four dresses, one shape: cobalt on light grounds, white on cobalt, sun
 * on night, outlined for the second choice beside a primary. Everything
 * that is not an action stays out of a pill.
 */
export function PillButton({
  children,
  href,
  tone = 'primary',
  arrow = true,
  size = 'md',
  onClick,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  /** Renders an anchor. Without it the block renders a button. */
  href?: string;
  tone?: PillTone;
  arrow?: boolean;
  size?: 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 64 64"
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
        >
          <use href="#bb-arrow" />
        </svg>
      )}
    </>
  );

  const shared = `group inline-flex items-center justify-center gap-3 rounded-full font-display font-bold transition-transform hover:-translate-y-0.5 text-center [hyphens:none] ${
    size === 'lg' ? 'px-7 py-4 text-base sm:text-lg' : 'px-7 py-3.5 text-base'
  } ${PILL_CLASS[tone]} ${className}`;

  if (href) {
    return (
      <a href={href} onClick={onClick} className={shared}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={shared}>
      {inner}
    </button>
  );
}
