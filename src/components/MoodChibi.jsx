import React, { useEffect, useState } from 'react';
import useReducedMotion from './bilderbuch/useReducedMotion';

/**
 * MoodChibi: Ronki on the Bilderbuch art (25 Sep 2026).
 *
 * Renders image art from public/art/bilderbuch/ per the contract in
 * docs/plans/2026-09-25-bilderbuch-app-rollout.md section 5. The props
 * API of the old CSS chibi is kept so all 24 callers keep working:
 *
 *   size      outer square in px (default 180)
 *   mood      'normal' | 'gut' | 'tired' | 'sad' | 'besorgt' | 'magisch'
 *             (the new names calm/happy/sleepy/heavy/worried/proud work too)
 *   bare      no sky-wash circle behind the art
 *   variant   accepted, ignored: Ronki is always red-orange now
 *   stage     0 egg | 1 baby | 2, 3 mood set | 4 grown | 5 legendary
 *   face      tighter crop on the head, for small portraits
 *   animated  play loops/ronki-idle.webp when the mood is calm or happy,
 *             the stage is 2 or higher and motion is allowed
 *   label     accessible name; without it the art is decorative
 *
 * Every image fails gracefully: on error it falls back to ronki/calm.webp,
 * and if that is missing too it renders nothing visible (no broken-image
 * icon). Failures are remembered per instance only, and the chain starts
 * over on remount and when the device comes back online, so one flaky
 * load on a tablet never hides Ronki for the rest of the session
 * (Astra code review R1, 25 Sep 2026).
 */

const ART_BASE = `${import.meta.env.BASE_URL}art/bilderbuch/`;

export const MOOD_TO_ART = {
  normal: 'calm',
  gut: 'happy',
  tired: 'sleepy',
  sad: 'heavy',
  besorgt: 'worried',
  magisch: 'proud',
  calm: 'calm',
  happy: 'happy',
  sleepy: 'sleepy',
  heavy: 'heavy',
  worried: 'worried',
  proud: 'proud',
};

const IDLE_CLASS = {
  calm: 'bb-idle-breathe',
  happy: 'bb-idle-bob',
  sleepy: 'bb-idle-slow',
  heavy: 'bb-idle-sway',
  worried: 'bb-idle-fidget',
  proud: 'bb-idle-lift',
};

const CALM = `${ART_BASE}ronki/calm.webp`;

/** Resolve the art file for a mood and stage (exported for tests and callers). */
export function resolveRonkiArt({ mood = 'normal', stage = 2, animated = false, reduced = false } = {}) {
  const moodKey = MOOD_TO_ART[mood] || 'calm';
  const st = Number.isFinite(stage) ? stage : 2;
  if (st <= 0) return `${ART_BASE}eggs/egg-cream.webp`;
  // The hatchling art has one face; any other mood keeps its own
  // expression (drawn smaller by the caller) so feelings still read in
  // the first days (Astra code review R2).
  if (st === 1 && (moodKey === 'calm' || moodKey === 'happy')) return `${ART_BASE}ronki/baby.webp`;
  if (st === 1) return `${ART_BASE}ronki/${moodKey}.webp`;
  if (animated && !reduced && (moodKey === 'calm' || moodKey === 'happy')) {
    return `${ART_BASE}loops/ronki-idle.webp`;
  }
  if (st >= 5 && moodKey === 'calm') return `${ART_BASE}ronki/legendary.webp`;
  if (st === 4 && moodKey === 'calm') return `${ART_BASE}ronki/grown.webp`;
  return `${ART_BASE}ronki/${moodKey}.webp`;
}

/**
 * useArtSource: walks a list of candidate URLs and moves on when the
 * current one errors. The position resets when the list changes and when
 * the browser reports it is back online.
 */
function useArtSource(candidates) {
  const key = candidates.join('|');
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(0);
  }, [key]);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const retry = () => setIdx(0);
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, []);
  const src = candidates[idx];
  const onError = () => setIdx((i) => i + 1);
  return { src, onError, exhausted: idx >= candidates.length };
}

function ArtImage({ candidates, label, imgStyle }) {
  const { src, onError, exhausted } = useArtSource(candidates);
  if (exhausted || !src) return null;
  return (
    <img
      src={src}
      alt={label || ''}
      role={label ? 'img' : undefined}
      draggable={false}
      decoding="async"
      onError={onError}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: '50% 100%',
        ...imgStyle,
      }}
    />
  );
}

export default function MoodChibi({
  size = 180,
  mood = 'normal',
  bare = false,
  variant, // eslint-disable-line no-unused-vars
  stage = 2,
  face = false,
  animated = false,
  label,
  className = '',
  style,
}) {
  const reduced = useReducedMotion();
  const moodKey = MOOD_TO_ART[mood] || 'calm';
  const primary = resolveRonkiArt({ mood, stage, animated, reduced });
  const isLoop = primary.includes('/loops/');
  const still = isLoop ? resolveRonkiArt({ mood, stage }) : null;
  const candidates = [primary, still, CALM].filter((v, i, a) => v && a.indexOf(v) === i);

  const isEgg = stage <= 0;
  const isBaby = stage === 1;
  const idle = isEgg ? 'bb-egg-wobble' : isLoop ? '' : IDLE_CLASS[moodKey] || 'bb-idle-breathe';
  const artScale = isBaby ? 0.82 : isEgg ? 0.78 : 1;

  // Face mode: the head is roughly the top half of the square, so a 1.6x
  // zoom anchored at the top inside a circular clip shows the face.
  const faceClip = face
    ? { borderRadius: '50%', overflow: 'hidden' }
    : null;
  const faceImg = face
    ? { transform: 'scale(1.6)', transformOrigin: '50% 12%', objectPosition: '50% 0%' }
    : null;

  const artBox = bare
    ? { position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', width: `${artScale * 100}%`, height: `${artScale * 100}%` }
    : { position: 'absolute', left: '50%', bottom: '5%', transform: 'translateX(-50%)', width: `${artScale * 86}%`, height: `${artScale * 86}%` };

  return (
    <div
      aria-hidden={label ? undefined : 'true'}
      className={className}
      style={{ position: 'relative', width: size, height: size, ...style }}
    >
      {!bare && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'var(--color-sky-wash)',
            border: '2px solid var(--color-ink)',
            boxSizing: 'border-box',
          }}
        />
      )}
      <div style={{ ...artBox, ...faceClip }}>
        <div className={idle} style={{ width: '100%', height: '100%' }}>
          <ArtImage candidates={candidates} label={label} imgStyle={faceImg} />
        </div>
      </div>
    </div>
  );
}

/**
 * RonkiArt: one pose from the sheet, with the same fallback rules.
 *
 *   pose      'wave' | 'cheer' | 'cloud' | 'leaf' | 'sleep', a mood name
 *             (calm, happy, ...), a stage file (baby, grown, legendary)
 *             or an egg (egg-cream, egg-ember, egg-sun, egg-cobalt,
 *             egg-cracked, egg-peek)
 *   animated  'cheer' plays loops/ronki-cheer.webp when motion is allowed
 *   size      width in px; height follows the square art (default 200)
 *   idle      CSS idle class to apply (default none)
 */
export function RonkiArt({
  pose = 'wave',
  animated = false,
  size = 200,
  idle = '',
  label,
  className = '',
  style,
}) {
  const reduced = useReducedMotion();
  const isEgg = pose.startsWith('egg');
  const still = isEgg ? `${ART_BASE}eggs/${pose}.webp` : `${ART_BASE}ronki/${pose}.webp`;
  const loop = animated && !reduced && pose === 'cheer' ? `${ART_BASE}loops/ronki-cheer.webp` : null;
  const candidates = [loop, still, CALM].filter((v, i, a) => v && a.indexOf(v) === i);
  return (
    <div
      aria-hidden={label ? undefined : 'true'}
      className={`${idle} ${className}`}
      style={{ position: 'relative', width: size, height: size, ...style }}
    >
      <ArtImage candidates={candidates} label={label} />
    </div>
  );
}
