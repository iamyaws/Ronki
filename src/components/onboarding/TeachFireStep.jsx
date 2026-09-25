import React from 'react';
import TeachBreathBeat, { ONBOARDING_FLAME_COPY } from './TeachBreathBeat';

/**
 * TeachFireStep: onboarding's "Der erste Funke" beat.
 *
 * Phase 2 refactor (24 Apr 2026): the 2-round mechanic, chibi, fire and
 * smoke puff are in TeachBreathBeat.jsx so the same beat can be reused by
 * post-onboarding unlock rituals. This file only provides the onboarding
 * chrome: the ground, ProgressBar at the top, safe-area paddings.
 *
 * Bilderbuch cut (25 Sep 2026): a sky ground. Breathing together is a
 * whole moment and may be blue; the teal wash image is gone.
 *
 * Still the onboarding entry point with the same prop signature
 * (variant, t, ProgressBar, onComplete). Onboarding persists
 * `state.taughtSignature` + `state.taughtAt` + `state.taughtBreaths.flame`
 * at completion (see TaskContext.completeOnboarding).
 */
export default function TeachFireStep({ variant, t, ProgressBar, onComplete }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-sky text-white font-body">
      <main
        className="relative z-10 min-h-full flex flex-col px-6 text-center"
        style={{
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <ProgressBar />

        <div className="my-auto flex flex-col items-center gap-5">
          <TeachBreathBeat
            variant={variant}
            t={t}
            targetFlavor="flame"
            copyKeys={ONBOARDING_FLAME_COPY}
            onComplete={onComplete}
          />
        </div>
      </main>
    </div>
  );
}
