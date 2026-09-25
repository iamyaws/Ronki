import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** True when the device asks for reduced motion. Safe without a window. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return false;
  }
}

/**
 * useReducedMotion: live reduced-motion flag. Kept local (ten lines)
 * so MoodChibi does not have to pull the motion package into every
 * screen that shows a small Ronki.
 */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    let mq;
    try {
      mq = window.matchMedia(QUERY);
    } catch {
      return undefined;
    }
    const onChange = () => setReduced(mq.matches);
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange);
      else if (typeof mq.removeListener === 'function') mq.removeListener(onChange);
    };
  }, []);
  return reduced;
}
