import React, { useMemo, useState } from 'react';
import ChibiFriend, { hasChibiFriend } from './ChibiFriend';
import { SceneLoop, useReducedMotion } from '../bilderbuch';

/**
 * RonkiAwayLoop: Ronki away in the Morgenwald, on the Bilderbuch art
 * (25 Sep 2026, lane B).
 *
 * The CSS parallax forest is gone. The scene is the painted Morgenwald
 * (scenes/morgenwald.webp, cropped to its treetops so the Ronki painted
 * into the picture stays out of frame) and Ronki himself is a cut-out
 * drifting on a cloud across it (loops/ronki-cloud.webp, the breathing
 * loop; the still ronki/cloud.webp under reduced motion or when the loop
 * is missing). Up to three discovered friends still peek in along the
 * bottom edge, so `discovered` keeps meaning something.
 *
 * Pure visual, no game logic, no taps. Fills its parent. Expedition keeps
 * the status card above this scene. `variant` is accepted and ignored:
 * Ronki is always red-orange now.
 */

const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;
const SCENES = {
  morgenwald: `${ART}scenes/morgenwald.webp`,
};
const CLOUD_LOOP = `${ART}loops/ronki-cloud.webp`;
const CLOUD_STILL = `${ART}ronki/cloud.webp`;

export default function RonkiAwayLoop({ biome = 'morgenwald', variant, discovered = [] }) { // eslint-disable-line no-unused-vars
  const reduced = useReducedMotion();
  const poster = SCENES[biome] || SCENES.morgenwald;
  const [loopFailed, setLoopFailed] = useState(false);
  const src = reduced || loopFailed ? CLOUD_STILL : CLOUD_LOOP;

  // Friend cameos: discovered creatures with a chibi renderer peek up
  // along the bottom edge. Stable across renders so they do not hop.
  const cameos = useMemo(() => {
    const ids = (discovered || [])
      .map(d => (typeof d === 'string' ? d : d?.id))
      .filter(id => id && hasChibiFriend(id));
    return ids.slice(0, 3).map((id, i) => ({
      key: `${id}-${i}`,
      id,
      left: `${14 + i * 30 + (i * 7) % 9}%`,
      delay: i * 0.6,
    }));
  }, [discovered]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-sky-wash" aria-hidden="true">
      {/* The picture has Ronki painted into its lower half: show the
          treetops only (top of the art, enlarged 1.5x). */}
      <div className="absolute" style={{ left: '-25%', top: 0, width: '150%', aspectRatio: '9 / 16' }}>
        <SceneLoop poster={poster} objectPosition="50% 0%" />
      </div>

      {/* Ronki on his cloud, drifting slowly from side to side. */}
      <div
        className="absolute rwl-drift"
        style={{ left: '50%', top: '30%', width: '46%', maxWidth: 220, aspectRatio: '1 / 1' }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          decoding="async"
          onError={() => setLoopFailed(true)}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Discovered friends peek in at the bottom edge. */}
      {cameos.map(c => (
        <div
          key={c.key}
          className="absolute rwl-peek"
          style={{ left: c.left, bottom: -6, width: 52, height: 52, animationDelay: `${c.delay}s` }}
        >
          <ChibiFriend id={c.id} size={52} withBg={false} />
        </div>
      ))}

      <style>{`
        @keyframes rwl-drift {
          0%   { transform: translate(-70%, 0) rotate(-2deg); }
          50%  { transform: translate(-30%, -10px) rotate(2deg); }
          100% { transform: translate(-70%, 0) rotate(-2deg); }
        }
        @keyframes rwl-peek {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%      { transform: translateY(-4px) rotate(2deg); }
        }
        .rwl-drift { animation: rwl-drift 9s ease-in-out infinite; transform: translate(-50%, 0); }
        .rwl-peek { animation: rwl-peek 3.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
