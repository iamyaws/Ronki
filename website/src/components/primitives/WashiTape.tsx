/**
 * A strip of sun-yellow washi tape.
 *
 * Was copy-pasted three times across the page; this is the one copy.
 * Purely decorative, so it carries aria-hidden and never holds text.
 */
export function WashiTape({
  className = '',
  rotate = -8,
  tone = 'sun',
}: {
  /** Placement, e.g. "-top-3 left-8 w-24 h-9". */
  className?: string;
  rotate?: number;
  /** Sun tape disappears on a sun ground, so those stick paper tape. */
  tone?: 'sun' | 'paper';
}) {
  const fill = tone === 'paper' ? '#FDFBF3' : '#FDD134';
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 120 40"
      preserveAspectRatio="none"
      className={`absolute pointer-events-none ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <rect x="0" y="4" width="120" height="32" rx="2" fill={fill} fillOpacity="0.92" />
      <line x1="8" y1="14" x2="112" y2="14" stroke="#040812" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="8" y1="26" x2="112" y2="26" stroke="#040812" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="6 4" />
    </svg>
  );
}
