import { useEffect, useRef } from 'react';
import VoiceAudio from '../utils/voiceAudio';

/** Sliding window in ms within which rapid advances are counted. */
const WINDOW_MS = 5_000;
/** Advances inside the window that trip the detector. */
const THRESHOLD = 3;
/** Cooldown between firings so the brake stays rare and preserves impact. */
const DEDUP_MS = 2 * 60 * 1000;

/**
 * useQuietAttention — fires a gentle Ronki voice line when Louis advances
 * screens too fast. Mounted at App level with the current view/navigation
 * key so every view change ticks the tracker.
 *
 * Heuristic: if THRESHOLD advances land inside a WINDOW_MS window, Ronki
 * says a "slow down, look around" line (handled by VoiceAudio.play — fails
 * silently when the audio file is missing or muted). After firing, the
 * window resets and a DEDUP_MS cooldown prevents back-to-back nagging.
 *
 * Intentionally forgiving: the very first view change in a session won't
 * fire because there's only one timestamp in the window.
 */
export function useQuietAttention(currentView: string): void {
  const timestampsRef = useRef<number[]>([]);
  const lastFiredRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    // Record this advance
    timestampsRef.current.push(now);
    // Prune entries outside the window
    timestampsRef.current = timestampsRef.current.filter(t => now - t < WINDOW_MS);

    if (
      timestampsRef.current.length >= THRESHOLD &&
      now - lastFiredRef.current > DEDUP_MS
    ) {
      lastFiredRef.current = now;
      // Graceful fallback: VoiceAudio.play() no-ops on missing file or muted state.
      // de_slowdown_01.mp3 was recorded in the Finch pass (GUARDRAILS-6); a
      // throwing player still never breaks the view change that triggered it.
      try {
        VoiceAudio.playLocalized('slowdown_01', 400);
      } catch {
        // stay silent
      }
      // Reset the window so we don't fire again immediately on the 4th advance
      timestampsRef.current = [];
    }
  }, [currentView]);
}
