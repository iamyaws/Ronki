/**
 * Shared SVG defs for the Bilderbuch look.
 *
 * Copied from the specimen in docs/design-incoming/bilderbuch, so the
 * site draws the same crayon blob, the same drawn chevron, check and
 * ring, and the same sun underline as the approved draft. Rendered once
 * per page by PainterlyShell and by the print shells.
 *
 * The crayon filter is displacement plus a faint dark grain. No white
 * speckles: those made every shape look dusty on a white ground.
 */
export function BilderbuchDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter
          id="bb-crayon"
          x="-6%"
          y="-6%"
          width="112%"
          height="112%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="warp" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="3" result="grain" />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0.12  0 0 0 0.22 0"
            result="dark"
          />
          <feComposite in="dark" in2="rough" operator="in" result="darkIn" />
          <feMerge>
            <feMergeNode in="rough" />
            <feMergeNode in="darkIn" />
          </feMerge>
        </filter>

        <symbol id="bb-blob" viewBox="0 0 580 640">
          <path
            d="M70 60 C 190 -6 420 6 505 88 C 594 176 566 336 526 452 C 486 590 330 640 204 606 C 72 570 -8 478 12 330 C 26 212 -18 104 70 60 Z"
            fill="currentColor"
          />
        </symbol>

        <symbol id="bb-arrow" viewBox="0 0 64 64">
          <path
            d="M22 10 L44 32 L22 54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>

        <symbol id="bb-back" viewBox="0 0 64 64">
          <path
            d="M42 10 L20 32 L42 54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>

        <symbol id="bb-check" viewBox="0 0 64 64">
          <path
            d="M10 34 C 16 40 21 45 26 50 C 34 36 44 24 55 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>

        <symbol id="bb-heart" viewBox="0 0 64 64">
          <path
            d="M32 55 C 9 40 6 22 19 16 C 27 12 31 18 32 23 C 34 18 38 12 46 15 C 59 20 55 40 32 55 Z"
            fill="currentColor"
          />
        </symbol>

        <symbol id="bb-ring" viewBox="0 0 64 64">
          <path
            d="M34 5 C 51 6 60 20 59 33 C 58 49 45 60 30 59 C 14 58 4 45 5 30 C 6 16 18 6 36 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </symbol>

        <symbol id="bb-underline" viewBox="0 0 300 20" preserveAspectRatio="none">
          <path
            d="M4 13 C 60 5 140 4 200 9 C 240 12 270 10 296 6"
            fill="none"
            stroke="#FDD134"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </symbol>

        <symbol id="bb-line" viewBox="0 0 300 12" preserveAspectRatio="none">
          <path
            d="M2 8 C 60 5 120 9 180 6 C 230 4 270 8 298 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </symbol>

        <symbol id="bb-dash" viewBox="0 0 600 6" preserveAspectRatio="none">
          <path
            d="M2 3 H598"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="14 10"
            strokeLinecap="round"
          />
        </symbol>

        <symbol id="bb-printer" viewBox="0 0 64 64">
          <rect x="18" y="8" width="28" height="16" rx="3" fill="#fff" stroke="currentColor" strokeWidth="3.5" />
          <rect x="8" y="22" width="48" height="24" rx="8" fill="#B9E3FC" stroke="currentColor" strokeWidth="3.5" />
          <rect x="18" y="38" width="28" height="18" rx="3" fill="#fff" stroke="currentColor" strokeWidth="3.5" />
        </symbol>
      </defs>
    </svg>
  );
}

/**
 * Yellow star sticker with the line drawn inside the star.
 *
 * Inline SVG rather than a clip-path so the words sit in the star's
 * centre at any size instead of drifting into the points.
 */
export function StarSticker({
  lines,
  className = '',
  rotate = 8,
}: {
  lines: string[];
  className?: string;
  rotate?: number;
}) {
  // Text baselines, not centres, so nudge the block down half a cap height.
  const start = 105 - ((lines.length - 1) * 15) / 2;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={lines.join(' ')}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path
        d="M100 2 L118 26 L146 10 L150 40 L182 36 L172 66 L200 80 L176 100 L200 122 L172 138 L182 168 L150 162 L146 194 L118 176 L100 200 L82 176 L54 194 L50 162 L18 168 L28 138 L0 122 L24 100 L0 80 L28 66 L18 36 L50 40 L54 10 L82 26 Z"
        fill="#FDD134"
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x="100"
          y={start + i * 15}
          textAnchor="middle"
          fill="#040812"
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '15px',
            textTransform: 'uppercase',
          }}
        >
          {line}
        </text>
      ))}
    </svg>
  );
}
