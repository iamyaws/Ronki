import React from 'react';
import { DoodleIcon } from '../bilderbuch';

/**
 * FireBowl: Ronki's fire (Finch pass, 26 Sep 2026).
 *
 * One drawn flame per task of the block. Lit flames are filled ember with
 * a sun heart; the rest are ink outlines on paper. No numbers: a child
 * who cannot read sees the fire grow. Sits in the lower right corner of
 * the room scene on a small paper plate so the flames read on the art.
 *
 * Props: lit, total, size (flame size in px), justLit (index of the flame
 * that just lit; it pops once, and simply shows lit under reduced motion).
 */
export default function FireBowl({ lit = 0, total = 0, size = 26, justLit = -1, className = '', style }) {
  if (!total) return null;
  const n = Math.max(0, Math.min(total, lit));
  return (
    <>
      <div
        role="img"
        aria-label="Ronkis Feuer"
        data-testid="fire-bowl"
        data-lit={n}
        data-total={total}
        className={`inline-flex items-end rounded-full bg-paper ${className}`}
        style={{
          gap: 2,
          padding: '6px 10px 5px',
          border: '2.5px solid var(--color-ink)',
          maxWidth: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center',
          ...style,
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const on = i < n;
          return (
            <span
              key={i}
              data-flame={on ? 'lit' : 'off'}
              className={i === justLit ? 'fb-pop' : ''}
              style={{ position: 'relative', width: size, height: size, lineHeight: 0, display: 'inline-block' }}
            >
              {on ? (
                <>
                  <span style={{ position: 'absolute', inset: 0, color: 'var(--color-ember)' }}>
                    <DoodleIcon name="flame" size={size} filled />
                  </span>
                  <span style={{ position: 'absolute', left: '25%', top: '38%', color: 'var(--color-sun)' }}>
                    <DoodleIcon name="flame" size={Math.round(size * 0.5)} filled stroke={4} />
                  </span>
                </>
              ) : (
                <span style={{ position: 'absolute', inset: 0, color: 'var(--color-ink)', opacity: 0.55 }}>
                  <DoodleIcon name="flame" size={size} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes fb-pop {
          0%   { transform: scale(0.4); }
          60%  { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .fb-pop { animation: fb-pop 600ms ease-out; }
        @media (prefers-reduced-motion: reduce) { .fb-pop { animation: none; } }
      `}</style>
    </>
  );
}
