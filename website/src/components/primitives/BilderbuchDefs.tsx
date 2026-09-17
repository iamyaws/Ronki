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

        {/* Torn paper edges between sections: displacement only. The grain
         *  of the full crayon filter shows up as grey specks on light grounds. */}
        <filter id="bb-tear" x="-2%" y="-40%" width="104%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Gentler displacement for small shapes: bars, dots, plus signs.
         *  The full crayon filter warps a 20 px bar into mush. */}
        <filter
          id="bb-crayon-soft"
          x="-8%"
          y="-40%"
          width="116%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="5" result="warp" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
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

        {/* Drawn cross. Two strokes that miss the exact centre, the way a
         *  crossed-out line on paper does. */}
        <symbol id="bb-cross" viewBox="0 0 64 64">
          <path
            d="M14 13 C 26 26 38 38 51 51"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M51 14 C 38 27 25 39 13 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </symbol>

        {/* Drawn plus for the FAQ. Rotating it by 45 degrees turns it into
         *  the cross above, which is exactly what the open state wants. */}
        <symbol id="bb-plus" viewBox="0 0 64 64">
          <path
            d="M32 11 C 33 25 33 39 32 53"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M11 32 C 25 31 39 31 53 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </symbol>

        {/* Four-point star, used as a bullet on dark grounds. */}
        <symbol id="bb-star" viewBox="0 0 24 24">
          <path
            d="M12 0 C13.4 7 17 10.6 24 12 C17 13.4 13.4 17 12 24 C10.6 17 7 13.4 0 12 C7 10.6 10.6 7 12 0 Z"
            fill="currentColor"
          />
        </symbol>

        {/* A scribbled ball, the "wild morning" doodle from the boards. */}
        <symbol id="bb-scribble" viewBox="0 0 120 100">
          <path
            d="M18 62 C 6 44 20 20 44 16 C 70 12 96 26 100 48 C 104 70 84 86 62 84 C 40 82 26 70 26 56 C 26 40 44 30 60 34 C 76 38 82 54 74 64 C 66 74 50 72 46 62 C 42 52 52 44 60 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
  // The star's inner circle is about 150 units wide. Short lines in the
  // headline face fill it; long lines in the hand face floated tiny in the
  // middle. Text baselines, not centres, so nudge down a third of the size.
  const size = lines.length >= 4 ? 25 : lines.length === 3 ? 28 : 30;
  const step = size * 1.02;
  const start = 100 + size * 0.34 - ((lines.length - 1) * step) / 2;
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
          y={start + i * step}
          textAnchor="middle"
          fill="#040812"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: `${size}px`,
            letterSpacing: '-0.01em',
          }}
        >
          {line}
        </text>
      ))}
    </svg>
  );
}
