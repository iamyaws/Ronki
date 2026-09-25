import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import useReducedMotion from './useReducedMotion';

/**
 * StickerBurst: the Bilderbuch celebration.
 *
 * Sun stars, cobalt ticks and a few ember crayon bits burst from the
 * centre, slow down, settle a little and fade. About 1.2 s, drawn in SVG,
 * animated with the motion package. Replaces the confetti canvas and the
 * Lottie confetti of the benchmark app. Under reduced motion one still
 * sun sticker shows in the centre for the same 1.2 s instead.
 *
 * Usage:
 *   <div className="relative"> ... <StickerBurst active={fired} onDone={...} /> </div>
 *   <StickerBurst fixed active />   full-screen overlay, centred on the viewport
 *
 * Props:
 *   active   mount and play while true; flipping it true again replays
 *   fixed    cover the viewport instead of the nearest positioned parent
 *   size     burst diameter in px (default 320; fixed mode uses the shorter side)
 *   count    number of particles (default 26)
 *   onDone   called once the burst has settled
 *   origin   { x, y } in px inside the parent; defaults to the centre
 */

const DURATION = 1.2;
const SPARKLE = 'M32 5 C 35 20 43 28 58 32 C 43 36 35 44 32 59 C 29 44 21 36 6 32 C 21 28 29 20 32 5 Z';

function makeParticles(count, radius) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const kind = i % 13 < 6 ? 'star' : i % 13 < 11 ? 'tick' : 'bit';
    // Even spread with a little jitter so the burst never looks like a clock.
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = radius * (0.55 + Math.random() * 0.45);
    out.push({
      id: i,
      kind,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      angleDeg: (angle * 180) / Math.PI,
      spin: (Math.random() - 0.5) * 240,
      scale: kind === 'star' ? 0.8 + Math.random() * 0.7 : 0.7 + Math.random() * 0.5,
      delay: Math.random() * 0.12,
    });
  }
  return out;
}

function Shape({ kind, angleDeg }) {
  if (kind === 'star') {
    return (
      <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true" focusable="false" style={{ overflow: 'visible' }}>
        <path d={SPARKLE} fill="var(--color-sun)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'tick') {
    return (
      <svg
        viewBox="0 0 32 32"
        width="26"
        height="26"
        aria-hidden="true"
        focusable="false"
        style={{ overflow: 'visible', transform: `rotate(${angleDeg}deg)` }}
      >
        <path d="M6 16 L26 16" fill="none" stroke="var(--color-cobalt)" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 12" width="18" height="11" aria-hidden="true" focusable="false" style={{ overflow: 'visible' }}>
      <rect x="1" y="1" width="18" height="10" rx="4" fill="var(--color-ember)" />
    </svg>
  );
}

export default function StickerBurst({
  active = true,
  fixed = false,
  size = 320,
  count = 26,
  onDone,
  origin,
  className = '',
  style,
}) {
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const wasActive = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // A rising edge on `active` starts a new run. Each run has its own
  // particle set so a replay never reuses the settled positions.
  useEffect(() => {
    if (active && !wasActive.current) setRun((r) => r + 1);
    wasActive.current = active;
  }, [active]);

  useEffect(() => {
    if (!active || run === 0) return undefined;
    const id = setTimeout(() => doneRef.current?.(), DURATION * 1000 + 80);
    return () => clearTimeout(id);
  }, [active, run]);

  const radius = useMemo(() => {
    if (!fixed || typeof window === 'undefined') return size / 2;
    return Math.min(size, window.innerWidth * 0.9, window.innerHeight * 0.9) / 2;
  }, [fixed, size]);

  const particles = useMemo(() => (run > 0 ? makeParticles(count, radius) : []), [run, count, radius]);

  if (!active || run === 0) return null;

  const layer = fixed
    ? { position: 'fixed', inset: 0, zIndex: 600 }
    : { position: 'absolute', inset: 0 };
  const centre = origin
    ? { left: origin.x, top: origin.y }
    : { left: '50%', top: '50%' };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className}`}
      style={{ ...layer, ...style }}
    >
      <div style={{ position: 'absolute', ...centre, width: 0, height: 0 }}>
        {reduced ? (
          <motion.div
            key={`still-${run}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: DURATION, times: [0, 0.15, 0.85, 1] }}
            style={{ position: 'absolute', left: -48, top: -48 }}
          >
            <svg viewBox="0 0 64 64" width="96" height="96" style={{ overflow: 'visible' }}>
              <path d={SPARKLE} fill="var(--color-sun)" stroke="var(--color-ink)" strokeWidth="3.5" strokeLinejoin="round" />
            </svg>
          </motion.div>
        ) : (
          particles.map((p) => (
            <motion.div
              key={`${run}-${p.id}`}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: [0, p.dx * 0.9, p.dx],
                y: [0, p.dy * 0.9, p.dy + 22],
                scale: [0, p.scale * 1.15, p.scale],
                rotate: [0, p.spin * 0.8, p.spin],
                opacity: [1, 1, 1, 0],
              }}
              transition={{
                duration: DURATION,
                delay: p.delay,
                times: [0, 0.45, 1],
                ease: ['easeOut', 'easeInOut'],
                opacity: { duration: DURATION, delay: p.delay, times: [0, 0.6, 0.85, 1] },
              }}
              style={{ position: 'absolute', left: -15, top: -15, willChange: 'transform, opacity' }}
            >
              <Shape kind={p.kind} angleDeg={p.angleDeg} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
