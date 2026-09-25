import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Props = {
  active: boolean;
  count?: number;
};

const COLORS = ['#FDD134', '#0544B0', '#0544B0', '#FFE68A', '#B9E3FC'];

export function Confetti({ active, count = 30 }: Props) {
  const reduced = useReducedMotion();
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      x: (Math.random() - 0.5) * 400,
      y: 200 + Math.random() * 200,
      rotate: Math.random() * 540,
      size: 6 + Math.random() * 6,
      delay: Math.random() * 0.12,
    }));
  }, [count]);

  if (!active || reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 origin-center rounded-sm"
          style={{ width: p.size, height: p.size * 0.4, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: 0 }}
          transition={{ duration: 1.2, delay: p.delay, ease: [0.12, 0.7, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
