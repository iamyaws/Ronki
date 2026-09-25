type Tone = 'ink' | 'white' | 'cobalt';

type Props = {
  /** Rendered height in px. The width follows the 300 x 110 box. */
  size?: number;
  tone?: Tone;
  className?: string;
};

const FILL: Record<Tone, string> = {
  ink: '#040812',
  white: '#ffffff',
  cobalt: '#0544B0',
};

/**
 * The Ronki wordmark: live Fredoka text inside an SVG, plus three ember
 * tick marks fanning off the top right of the "i" like motion trails.
 *
 * Live text rather than outlines, so the mark always matches the loaded
 * display face and stays selectable and searchable. Measured at font
 * size 100 the word is 228.9 units wide with a 73 unit ascent, which is
 * where the box and the tick positions come from.
 */
export function RonkiWordmark({ size = 36, tone = 'ink', className = '' }: Props) {
  const height = size;
  const width = Math.round((size * 300) / 110);
  return (
    <svg
      role="img"
      viewBox="0 0 300 110"
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
    >
      <title>Ronki</title>
      <text
        x="6"
        y="88"
        fill={FILL[tone]}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '100px',
          letterSpacing: '-0.015em',
        }}
      >
        ronki
      </text>
      <g
        stroke="#EE4F35"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        aria-hidden="true"
      >
        <path d="M243 18 L269 4" />
        <path d="M248 31 L278 29" />
        <path d="M244 44 L270 51" />
      </g>
    </svg>
  );
}
