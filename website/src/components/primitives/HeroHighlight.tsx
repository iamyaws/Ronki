import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import { EASE_OUT } from '../../lib/motion';

type Props = {
  children: ReactNode;
  color?: string;
  delay?: number;
};

export function HeroHighlight({ children, color = '#FDD134', delay = 0.6 }: Props) {
  const reduced = useReducedMotion();
  return (
    <span className="relative inline-block">
      <motion.span
        aria-hidden
        initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduced ? 0 : 0.9, delay, ease: EASE_OUT }}
        className="absolute inset-x-[-0.12em] bottom-[0.08em] top-[0.48em] -z-0 origin-left rounded-[0.2em]"
        style={{ backgroundColor: color, opacity: 0.65 }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
