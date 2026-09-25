import { ReactNode, useRef, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

type Props = {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
};

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(253, 209, 52, 0.35)',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const smx = useSpring(mx, { stiffness: 120, damping: 20 });
  const smy = useSpring(my, { stiffness: 120, damping: 20 });
  const background = useTransform<number, string>(
    [smx, smy],
    ([x, y]) =>
      `radial-gradient(240px circle at ${x}px ${y}px, ${spotlightColor}, transparent 70%)`,
  );

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  function handleLeave() {
    mx.set(-200);
    my.set(-200);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`group relative overflow-hidden ${className}`}
    >
      {!reduced && (
        <motion.div
          aria-hidden
          style={{ background }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
