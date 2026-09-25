type Props = {
  /** Placement classes. Keep the shape inside its container so nothing
   *  can widen the page: no negative horizontal offsets. */
  className?: string;
  /** Mirror the cluster so neighbouring sections do not repeat exactly. */
  flip?: boolean;
};

/** Four-point sun star, drawn once and reused at three sizes. */
function Star({ x, y, r, rotate }: { x: number; y: number; r: number; rotate: number }) {
  const s = r / 24;
  return (
    <path
      d="M12 0 C13.4 7 17 10.6 24 12 C17 13.4 13.4 17 12 24 C10.6 17 7 13.4 0 12 C7 10.6 10.6 7 12 0 Z"
      fill="#FDD134"
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s}) translate(-12 -12)`}
    />
  );
}

/**
 * Corner decoration: two or three sun stars and a small cobalt leaf
 * cluster. Decoration only, so it is hidden from assistive tech, hidden
 * below md, and never placed where running text sits.
 */
export function Sparkles({ className = '', flip = false }: Props) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 120 110"
      className={`pointer-events-none absolute hidden md:block h-[110px] w-[120px] ${className}`}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <Star x={22} y={20} r={20} rotate={-8} />
      <Star x={62} y={44} r={12} rotate={14} />
      <Star x={30} y={62} r={8} rotate={4} />
      {/* Leaf cluster: a bent stem with two almond leaves. */}
      <g fill="none" stroke="#0544B0" strokeWidth="4" strokeLinecap="round">
        <path d="M74 100 C 82 88 88 76 90 64" />
      </g>
      <g fill="#0544B0" opacity="0.9">
        <path d="M89 66 C 79 60 76 50 82 42 C 92 46 95 58 89 66 Z" />
        <path d="M86 82 C 96 80 104 72 102 62 C 92 63 84 72 86 82 Z" />
      </g>
    </svg>
  );
}
