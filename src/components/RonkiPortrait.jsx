import React from 'react';
import { useTask } from '../context/TaskContext';
import { getCatStage } from '../utils/helpers';
import MoodChibi, { ambientMood } from './MoodChibi';

/**
 * RonkiPortrait — state-aware chibi portrait of the kid's companion.
 *
 * Single wrapper for every surface that used to `<img src="dragon-baby.webp">`
 * or `getDragonArt(stage)`. Pulls the kid-picked variant + current stage
 * from TaskContext so the portrait always reflects the colorway the kid
 * chose at onboarding. Any mood state Ronki happens to be in (normal,
 * sad, tired, besorgt, magisch) renders automatically unless overridden.
 *
 * Rationale: before this wrapper, callsites imported an image file
 * directly and baked in the painted Midjourney art — same dragon for
 * every kid, regardless of variant. Louis picked a sunset-colored egg
 * and still saw an amber dragon in EveningRitual, ToothBrushGuide,
 * CompanionToast, etc. Marc flagged this 23 Apr 2026.
 *
 * Props:
 *   size      — outer square pixel size (default 120)
 *   variant   — override the kid's picked variant (rare; tests only)
 *   stage     — override evolution stage. Default: derived from catEvo.
 *   mood      — override mood. Default: state.ronkiMood or 'normal'.
 *   bare      — pass-through to MoodChibi (skip outer circle bg)
 *   ringed    — wrap in a subtle cream ring + soft shadow (matches the
 *               legacy `<div className="rounded-full overflow-hidden">`
 *               wrapper most callsites used around the old img).
 *   className — extra classes on the outer wrapper
 *   style     — extra styles on the outer wrapper
 */
export default function RonkiPortrait({
  size = 120,
  variant,
  stage,
  mood,
  bare = false,
  ringed = false,
  className = '',
  style,
}) {
  const { state } = useTask();

  const resolvedVariant = variant ?? state?.companionVariant ?? 'amber';
  // No Math.min(3, ...) cap — MoodChibi handles stages 4 (teen) + 5
  // (legend) with their own aura/wing treatments. getCatStage already
  // clamps to CAT_STAGES.length - 1.
  const resolvedStage = stage ?? getCatStage(state?.catEvo ?? 0);
  // An explicit mood prop wins (feelings screens); the ambient state
  // never shows a worried Ronki after days away.
  const resolvedMood = mood ?? ambientMood(state?.ronkiMood);

  const chibi = (
    <MoodChibi
      size={size}
      variant={resolvedVariant}
      stage={resolvedStage}
      mood={resolvedMood}
      bare={bare}
    />
  );

  if (!ringed) {
    return (
      <div className={className} style={style}>
        {chibi}
      </div>
    );
  }

  // Ringed variant: a sky-wash circle with a thin ink outline (the
  // Bilderbuch locket), the art sitting on it without being cropped.
  return (
    <div
      className={`rounded-full flex items-center justify-center bg-sky-wash ${className}`}
      style={{
        width: size,
        height: size,
        border: '2px solid var(--color-ink)',
        ...style,
      }}
    >
      <MoodChibi
        size={Math.round(size * 0.9)}
        variant={resolvedVariant}
        stage={resolvedStage}
        mood={resolvedMood}
        bare
      />
    </div>
  );
}
