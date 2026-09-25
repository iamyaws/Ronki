import React, { useState, useEffect } from 'react';
import DoodleIcon from './bilderbuch/DoodleIcon';
import useReducedMotion from './bilderbuch/useReducedMotion';

/**
 * CooldownButton: a short guard so a tap that was meant for the moment
 * before does not skip a celebration or a game's end screen.
 *
 * 25 Sep 2026 (Marc, on Astra's design review round 2): no numbers and
 * no draining ring any more. A visible countdown reads as "wait" or
 * "hurry", which the no-pressure rule bans. The button is inactive for
 * about one second and simply wakes up (fades to full strength); the old
 * per-screen `delay` values (3 to 5 s) are capped at GUARD_MAX_S.
 *
 * Props:
 *  - delay: requested guard in seconds (capped at GUARD_MAX_S; default 1)
 *  - children: button label
 *  - onClick: fires when tapped after the guard
 *  - className, style: passed through to the button
 *  - icon: optional icon shown next to the label once ready; the old
 *    Material names are mapped to Bilderbuch doodles, unknown ones show none
 */
export const GUARD_MAX_S = 1;

const ICON_TO_DOODLE = {
  arrow_forward: 'arrow',
  redeem: 'gift',
  sports_esports: 'star',
  replay: 'sparkle',
  refresh: 'sparkle',
};

export default function CooldownButton({ delay = GUARD_MAX_S, children, onClick, className = '', style = {}, icon }) {
  const reduced = useReducedMotion();
  const guardMs = Math.max(0, Math.min(Number(delay) || 0, GUARD_MAX_S)) * 1000;
  const [ready, setReady] = useState(guardMs === 0);
  // `waking` flips one frame after mount so the opacity fades up during
  // the guard and reaches full strength exactly when the button is ready.
  const [waking, setWaking] = useState(guardMs === 0);

  useEffect(() => {
    if (guardMs === 0) {
      setReady(true);
      setWaking(true);
      return undefined;
    }
    setReady(false);
    setWaking(false);
    const raf = requestAnimationFrame(() => setWaking(true));
    const t = setTimeout(() => setReady(true), guardMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [guardMs]);

  const doodle = icon ? ICON_TO_DOODLE[icon] || null : null;

  return (
    <button
      type="button"
      onClick={ready ? onClick : undefined}
      disabled={!ready}
      aria-disabled={!ready}
      className={`relative ${ready ? 'active:scale-95' : 'cursor-default'} ${className}`}
      style={{
        ...style,
        // Reduced motion: stay dim until the tap really counts, then a plain
        // switch. Once ready, no inline transition, so classes like
        // .bb-press keep their own press transition (review workflow).
        opacity: ready || (waking && !reduced) ? 1 : 0.55,
        transition: ready ? undefined : reduced ? 'none' : `opacity ${guardMs}ms linear`,
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {doodle && ready && <DoodleIcon name={doodle} size={22} />}
        {children}
      </span>
    </button>
  );
}
