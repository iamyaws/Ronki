import { FACE_CENTRE, FACE_RIM, FACE_SIZE, handsFor, numerals, tickMarks } from '../../lib/clock-face';

const INK = '#040812';
const COBALT = '#0544B0';

/**
 * A still clock face for one step on the sheet: ink rim, twelve ticks
 * (thicker at 12, 3, 6 and 9), the numerals 12, 3, 6 and 9, and cobalt
 * hour and minute hands. No seconds hand, nothing moves. The child holds
 * the sheet next to the kitchen clock: when both look the same, this step
 * is next.
 *
 * Hidden from screen readers: the row says the time in words.
 */
export function ClockFace({ time, className = 'rs-clock' }: { time: string; className?: string }) {
  const hands = handsFor(time);
  if (!hands) return null;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${FACE_SIZE} ${FACE_SIZE}`}
      aria-hidden="true"
      focusable="false"
      data-clock={time}
    >
      <circle cx={FACE_CENTRE} cy={FACE_CENTRE} r={FACE_RIM} fill="#ffffff" stroke={INK} strokeWidth={4} />
      {tickMarks().map((tick, i) => (
        <line
          key={i}
          x1={tick.from.x}
          y1={tick.from.y}
          x2={tick.to.x}
          y2={tick.to.y}
          stroke={INK}
          strokeWidth={tick.major ? 4 : 2}
          strokeLinecap="round"
          data-major={tick.major ? '' : undefined}
        />
      ))}
      {numerals().map((n) => (
        <text
          key={n.text}
          x={n.at.x}
          y={n.at.y}
          fill={INK}
          fontFamily="'Fredoka', system-ui, sans-serif"
          fontWeight={700}
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {n.text}
        </text>
      ))}
      <line
        data-hand="hour"
        x1={FACE_CENTRE}
        y1={FACE_CENTRE}
        x2={hands.hour.x}
        y2={hands.hour.y}
        stroke={COBALT}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <line
        data-hand="minute"
        x1={FACE_CENTRE}
        y1={FACE_CENTRE}
        x2={hands.minute.x}
        y2={hands.minute.y}
        stroke={COBALT}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <circle cx={FACE_CENTRE} cy={FACE_CENTRE} r={4.5} fill={INK} />
    </svg>
  );
}
