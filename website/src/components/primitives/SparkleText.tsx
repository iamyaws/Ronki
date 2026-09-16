import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Props = {
  children: string;
  sparkleCount?: number;
  color?: string;
  className?: string;
};

export function SparkleText({
  children,
  sparkleCount = 10,
  color = '#FDD134',
  className = '',
}: Props) {
  const reduced = useReducedMotion();
  const sparkles = useMemo(() => {
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      duration: 1.6 + Math.random() * 1.2,
    }));
  }, [sparkleCount]);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      {!reduced &&
        sparkles.map((s) => (
          <motion.span
            key={s.id}
            aria-hidden
            className="absolute pointer-events-none"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3], rotate: [0, 90, 180] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 16 16" fill={color} className="w-full h-full">
              <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
            </svg>
          </motion.span>
        ))}
    </span>
  );
}
