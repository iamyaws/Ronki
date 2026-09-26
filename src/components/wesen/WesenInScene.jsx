import React, { useEffect, useState } from 'react';
import { DoodleIcon, useReducedMotion } from '../bilderbuch';
import { BESIDE_AFTER_DAYS, creatureArt, creatureMeta } from '../../data/wesen';
import { lookOf, stepsOf } from '../../loop/wesen';

/**
 * The Wesen friend inside the Nest scene (26 Sep 2026). Positions are
 * fractions of the poster (720 x 1280), like Ronki's own square in RoomHub.
 *
 * A visitor stands on the floor at the left and is friendly from day one
 * (Astra W-01): it bobs and waves when tapped. Each counted day moves it
 * along the path, with a paw print for every day behind it, no numbers.
 * Once the meeting has played it sits beside Ronki on the cushion, behind
 * the rim (zIndex 1) so the cushion front overlaps its feet like his.
 */

// Visitor path on the floor: centre x from the left edge towards Ronki.
const PATH_X0 = 0.11;
const PATH_X1 = 0.28;
const FLOOR_BOTTOM = 0.81;
const SMALL_W = 0.17;
// Beside Ronki, on the left of the cushion.
const BESIDE_CX = 0.2;
const BESIDE_BOTTOM = 0.705;
const FRIEND_W = 0.25;
const GROWN_W = 0.29;

export default function WesenInScene({ friend, hop = 0 }) {
  const reduced = useReducedMotion();
  const [tapHop, setTapHop] = useState(0);
  const [hopping, setHopping] = useState(false);
  const meta = creatureMeta(friend.creatureId);
  const look = lookOf(friend);
  const beside = look !== 'small';
  const steps = stepsOf(friend);
  const t = Math.min(1, steps / (BESIDE_AFTER_DAYS - 1));

  useEffect(() => {
    if (!hop && !tapHop) return undefined;
    setHopping(true);
    const id = setTimeout(() => setHopping(false), 850);
    return () => clearTimeout(id);
  }, [hop, tapHop]);

  const cx = beside ? BESIDE_CX : PATH_X0 + (PATH_X1 - PATH_X0) * t;
  const w = look === 'grown' ? GROWN_W : beside ? FRIEND_W : SMALL_W;
  const bottom = beside ? BESIDE_BOTTOM : FLOOR_BOTTOM;
  // Square box: height in poster fractions is w * (720 / 1280).
  const hFrac = w * (720 / 1280);

  return (
    <>
      {!beside && steps > 0 && Array.from({ length: steps }).map((_, i) => {
        const px = PATH_X0 - 0.06 + ((cx - PATH_X0 + 0.02) * (i + 0.5)) / Math.max(1, steps);
        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute', left: `${px * 100}%`, top: `${(FLOOR_BOTTOM - 0.022 + (i % 2) * 0.01) * 100}%`,
              width: '5%', zIndex: 4, pointerEvents: 'none', color: 'var(--color-ink)', opacity: 0.7,
              transform: `rotate(${i % 2 ? 12 : -8}deg)`,
            }}
          >
            <DoodleIcon name="paw" size={22} filled />
          </span>
        );
      })}
      <button
        type="button"
        onClick={() => setTapHop(n => n + 1)}
        aria-label={meta ? `${meta.name}` : 'Wesen'}
        data-testid="wesen-in-scene"
        data-look={look}
        data-steps={steps}
        style={{
          position: 'absolute',
          left: `${(cx - w / 2) * 100}%`,
          top: `${(bottom - hFrac) * 100}%`,
          width: `${w * 100}%`,
          aspectRatio: '1 / 1',
          background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          zIndex: beside ? 1 : 4,
          transition: reduced ? 'none' : 'left 900ms ease, top 900ms ease, width 900ms ease',
        }}
      >
        <img
          src={creatureArt(friend.creatureId, look)}
          alt=""
          draggable={false}
          className={reduced ? '' : (hopping ? 'wz-hop' : 'wz-bob')}
          style={{ width: '100%', height: '100%', objectFit: 'contain', transformOrigin: '50% 100%' }}
        />
      </button>
    </>
  );
}
