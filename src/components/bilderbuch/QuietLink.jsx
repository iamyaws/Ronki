import React from 'react';
import DoodleIcon from './DoodleIcon';

/**
 * QuietLink: the quiet way out.
 *
 * An underlined drawn link, never a box. "Für heute fertig", "Weiß ich
 * noch nicht", "Erst mal anschauen". A wobbly line under the words and,
 * if wanted, a small drawn chevron. Renders a <button> unless `href` is
 * given. Tap target stays at least 44 px tall.
 *
 * Props:
 *   tone   'cobalt' (default, for light grounds) | 'ink' | 'white' (line in sun)
 *   arrow  show the chevron after the words
 */

const TONE_TEXT = {
  cobalt: 'text-cobalt',
  ink: 'text-ink',
  white: 'text-white',
};

export default function QuietLink({
  children,
  tone = 'cobalt',
  arrow = false,
  href,
  onClick,
  className = '',
  style,
  ...rest
}) {
  const cls = `group relative inline-flex items-center gap-2 min-h-[44px] px-1 font-headline font-semibold text-lg leading-none bg-transparent border-0 ${TONE_TEXT[tone] || TONE_TEXT.cobalt} ${className}`;
  const inner = (
    <>
      <span className="relative pb-1">
        {children}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 300 12"
          preserveAspectRatio="none"
          className="absolute -bottom-[3px] left-0 h-[8px] w-full overflow-visible"
          style={tone === 'white' ? { color: 'var(--color-sun)' } : undefined}
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
      {arrow && <DoodleIcon name="arrow" size={14} stroke={8} />}
    </>
  );
  if (href) {
    return (
      <a href={href} onClick={onClick} className={cls} style={style} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} style={style} {...rest}>
      {inner}
    </button>
  );
}
