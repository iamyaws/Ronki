import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { TAB_UNLOCKS } from '../data/tabUnlocks';
import { useCelebrationQueue } from '../context/CelebrationQueue';
import VoiceAudio from '../utils/voiceAudio';
import { featureOn } from '../config/features';

/**
 * TabUnlockCelebration, lightweight onboarding scaffolding for the
 * grey-locked NavBar (see data/tabUnlocks.ts).
 *
 * Two one-shot surfaces per tab, both persisted so they never re-fire:
 *   1. Unlock toast, a small gold pill at the top of the viewport that
 *      says "🔓 Tagebuch freigeschaltet". Fires the first time a tab's
 *      unlock criterion flips true. 3s auto-dismiss. Plays a soft "ding"
 *      via existing SFX.
 *   2. First-tap coachmark, a one-sentence overlay that appears the
 *      first time Louis navigates INTO a newly-unlocked tab, explaining
 *      what the tab is FOR. Single tap dismisses.
 *
 * Both states live on state.tabUnlocksSeen / state.tabCoachmarksSeen so
 * they survive reloads + profile-switch.
 *
 * Mount once at the app level; pass the current `view` so the coachmark
 * knows which tab the user just opened.
 */
export default function TabUnlockCelebration(props) {
  // Finch pass (26 Sep 2026): two tabs, both always open, so there is
  // nothing to unlock and no toast or coachmark (FEATURES.tabUnlocks).
  if (!featureOn('tabUnlocks')) return null;
  return <TabUnlockCelebrationInner {...props} />;
}

function TabUnlockCelebrationInner({ view }) {
  const { state, actions } = useTask();
  const { t } = useTranslation();
  const { enqueue } = useCelebrationQueue();
  const [coachFor, setCoachFor] = useState(null);    // tabId currently shown as coachmark
  const prevUnlockedRef = useRef(null);              // Set<string>
  const migratedRef = useRef(false);

  // ── One-time migration for existing users ──
  // The tabUnlocksSeen / tabCoachmarksSeen fields were added Apr 2026 after
  // Louis + Hector were already several sessions in. Without this, the
  // first render of this component would fire retroactive coachmarks for
  // tabs an experienced user has been using for weeks. Heuristic: if the
  // user has any task history AND none of the seen-flags are recorded yet,
  // mark all currently-unlocked tabs as "seen" so the UI stays quiet.
  useEffect(() => {
    if (!state || migratedRef.current) return;
    migratedRef.current = true;
    const hasHistory = (state.totalTasksDone || 0) > 0 || (state.streak || 0) > 0;
    const unlocksSeen = state.tabUnlocksSeen || {};
    const coachSeen = state.tabCoachmarksSeen || {};
    const anyFlagRecorded =
      Object.keys(unlocksSeen).length > 0 || Object.keys(coachSeen).length > 0;
    if (!hasHistory || anyFlagRecorded) return;
    for (const u of TAB_UNLOCKS) {
      if (u.isUnlocked(state)) {
        actions.markTabUnlockSeen?.(u.tabId);
        actions.markTabCoachmarkSeen?.(u.tabId);
      }
    }
  }, [state, actions]);

  // ── Effect 1: detect unlock transitions → enqueue toast ──
  // Routing through CelebrationQueue keeps the unlock pop from stacking
  // on top of other celebration surfaces (e.g. a creature discovery that
  // fires the same tick).
  useEffect(() => {
    if (!state) return;
    const nowUnlocked = new Set(
      TAB_UNLOCKS.filter(u => u.isUnlocked(state)).map(u => u.tabId)
    );
    const prev = prevUnlockedRef.current;
    prevUnlockedRef.current = nowUnlocked;
    if (!prev) return; // first render, don't retroactively toast

    const seen = state.tabUnlocksSeen || {};
    for (const tabId of nowUnlocked) {
      if (prev.has(tabId)) continue;           // already unlocked before
      if (seen[tabId]) continue;               // already toasted (belt + braces)
      const unlock = TAB_UNLOCKS.find(u => u.tabId === tabId);
      if (!unlock) continue;
      enqueue({
        id: `tab-unlock-${tabId}`,
        kind: 'toast',
        ttl: 3200,
        sfx: 'pop',
        // Unlock is a milestone moment, let it through even in the
        // day-1/2 quiet window so the kid sees the feedback after their
        // very first completed tasks.
        bypassQuietHours: true,
        render: ({ dismiss }) => (
          <TabUnlockToast unlock={unlock} t={t} onDismiss={dismiss} />
        ),
      });
      // Ronki celebrates the unlock, short toast voiceline (Apr 2026
      // voice pass). Files at de_nav_unlock_{ronki|journal|shop}.
      VoiceAudio.playLocalized(`nav_unlock_${tabId}`, 200);
      actions.markTabUnlockSeen?.(tabId);
      break; // only one unlock per state tick, others queue naturally on next flip
    }
  }, [state, actions, enqueue, t]);

  // ── Effect 2: show coachmark on first visit to a newly-unlocked tab ──
  // Race note: the 220ms delay lets the view-transition paint before the
  // coachmark mounts. React's useEffect-cleanup guarantees the timer is
  // cleared if `view` changes before it fires, so a mid-window tab-switch
  // can't trigger the old coachmark. The `cancelled` flag is belt-and-
  // braces for the async gap between clearTimeout being called and the
  // browser actually running our callback (theoretically zero, but
  // defensive, if the JS timer loop mis-schedules after cleanup, the
  // flag stops the stale call from taking effect).
  useEffect(() => {
    if (!state) return;
    const unlock = TAB_UNLOCKS.find(u => u.tabId === view);
    if (!unlock) return;                       // hub / quests have no coachmark
    if (!unlock.isUnlocked(state)) return;     // can only reach if unlocked or active
    if ((state.tabCoachmarksSeen || {})[view]) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setCoachFor(view);
      // Ronki reads the coachmark text aloud as the overlay reveals
      // (Apr 2026 voice pass). Files at de_nav_coach_{ronki|journal|shop}.
      VoiceAudio.playLocalized(`nav_coach_${view}`, 100);
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [view, state]);

  const dismissCoach = () => {
    if (coachFor) actions.markTabCoachmarkSeen?.(coachFor);
    setCoachFor(null);
  };

  const coachUnlock = coachFor ? TAB_UNLOCKS.find(u => u.tabId === coachFor) : null;

  // Anchor the coachmark pointer at the target nav button. The card itself
  // stays visually centered (fine for readability), but the arrow moves to
  // point at whichever tab we're explaining. Without this, the pointer was
  // stuck at the card's horizontal center, which on a 5-tab navbar lands
  // roughly on the middle (Ronki) tab, so the Tagebuch unlock "Here's your
  // Tagebuch!" arrow was pointing at Ronki. Embarrassing, fixed.
  const [pointerLeftPx, setPointerLeftPx] = useState(null);
  useEffect(() => {
    if (!coachFor) { setPointerLeftPx(null); return; }
    let rafId;
    const measure = () => {
      const tabEl = document.querySelector(`[data-tab-id="${coachFor}"]`);
      if (!tabEl) return;
      const rect = tabEl.getBoundingClientRect();
      setPointerLeftPx(rect.left + rect.width / 2);
    };
    // Measure after the coach mount has painted. rAF is enough; NavBar
    // is always mounted by the time a coachmark can fire.
    rafId = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measure);
    };
  }, [coachFor]);

  return (
    <>
      {/* Unlock toast is rendered by CelebrationQueue via `TabUnlockToast`
           below. This wrapper now only handles the first-tap coachmark. */}

      {/* First-tap coachmark, full-screen scrim + bottom card. Single tap
           anywhere dismisses. Localized. */}
      {coachUnlock && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t(coachUnlock.coachmarkKey)}
          className="fixed inset-0 z-[115]"
          onClick={dismissCoach}
          style={{
            background: 'rgba(18,67,70,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'tabCoachIn 0.25s ease-out',
          }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[min(420px,calc(100vw-32px))]"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 22px) + 112px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #fff8e1 100%)',
                boxShadow: '0 20px 50px -12px rgba(18,67,70,0.5), 0 8px 20px -4px rgba(0,0,0,0.18)',
                border: '1.5px solid rgba(252,211,77,0.5)',
              }}
            >
              <p className="font-body text-[15px] leading-snug text-on-surface">
                {t(coachUnlock.coachmarkKey)}
              </p>
              <button
                type="button"
                onClick={dismissCoach}
                className="mt-4 w-full py-3 rounded-full font-label font-bold uppercase text-[12px] tracking-[0.18em] active:scale-95 transition-transform"
                style={{
                  background: '#124346',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px -4px rgba(18,67,70,0.4)',
                  letterSpacing: '0.18em',
                }}
              >
                {t('nav.coach.close')}
              </button>
            </div>
          </div>
          {/* Pointer triangle anchored at the target nav button, fixed
               to the viewport so its left-coordinate is in the same
               coordinate system as the tab button we measured. Falls
               back to viewport-center if measurement hasn't resolved
               yet (first paint). */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: pointerLeftPx != null ? pointerLeftPx : '50%',
              // Sit just above the NavBar. NavBar bottom padding + height ≈
              // 80-90px on iOS; this lands the arrow over the active tab
              // icon zone. Using a fixed offset works across all kid-
              // plausible viewports (no magic numbers for tiny phones).
              bottom: 'calc(env(safe-area-inset-bottom, 22px) + 90px)',
              transform: pointerLeftPx != null
                ? 'translateX(-50%) rotate(45deg)'
                : 'translateX(-50%) rotate(45deg)',
              width: 14,
              height: 14,
              background: '#fff8e1',
              borderRight: '1.5px solid rgba(252,211,77,0.5)',
              borderBottom: '1.5px solid rgba(252,211,77,0.5)',
              pointerEvents: 'none',
            }}
          />
        </div>,
        document.body
      )}

      <style>{`
        @keyframes tabUnlockToastSlideIn {
          0%   { opacity: 0; transform: translateX(120%); }
          60%  { opacity: 1; transform: translateX(-8%); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes tabUnlockConfetti {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          40%  { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4); opacity: 0; }
        }
        @keyframes tabCoachIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}

/**
 * TabUnlockToast, the gold pill at the top of the viewport, rendered
 * by CelebrationQueue. The queue owns dismiss timing; this component is
 * a pure presenter. Entry animation plays via tabUnlockToastIn; the
 * exit animation is skipped for now because the queue tears the node
 * down at ttl. A follow-up can add a controlled fade-out.
 */
function TabUnlockToast({ unlock, t, onDismiss }) {
  // Marc flag 24 Apr 2026: top-center pill was covering the PinnedRonki
  // in the topbar. Moved to top-right below the Sterne pill, sliding in
  // from offscreen-right, with a small confetti burst for celebration.
  // 12 confetti particles, fixed positions + staggered delays + mixed
  // sizes. Pure CSS, no external deps.
  const confettiParticles = Array.from({ length: 12 }).map((_, i) => {
    // Distribute angles across 360° with slight jitter, distances 40-90px
    const angle = (i / 12) * 360 + (i % 3) * 12;
    const distance = 44 + (i % 4) * 14;
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad) * distance;
    const dy = Math.sin(rad) * distance;
    const palette = ['#fcd34d', '#f59e0b', '#fde68a', '#fb7185', '#34d399', '#60a5fa'];
    const color = palette[i % palette.length];
    const size = 6 + (i % 3) * 2;
    const delay = (i % 4) * 40;
    return { i, dx, dy, color, size, delay };
  });

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      className="fixed z-[120]"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + var(--alpha-banner-h, 28px) + 56px)',
        right: 16,
        animation: 'tabUnlockToastSlideIn 0.45s cubic-bezier(0.2, 0.8, 0.35, 1.15)',
        maxWidth: 'calc(100vw - 120px)',
        cursor: 'pointer',
      }}
    >
      {/* Confetti burst radiating outward from the pill's center.
           Absolute-positioned at left:50%, top:50% so they fan out of
           the pill itself. Purely decorative; pointer-events none. */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ left: '50%', top: '50%', width: 0, height: 0 }}
      >
        {confettiParticles.map(p => (
          <span
            key={p.i}
            style={{
              position: 'absolute',
              left: 0, top: 0,
              width: p.size, height: p.size,
              background: p.color,
              borderRadius: '50%',
              boxShadow: `0 0 6px ${p.color}`,
              transform: 'translate(-50%, -50%) scale(0)',
              animation: `tabUnlockConfetti 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) ${p.delay}ms forwards`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            }}
          />
        ))}
      </div>

      <div
        className="relative rounded-full px-5 py-2.5 font-body font-semibold text-[14px] whitespace-nowrap"
        style={{
          background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
          color: '#124346',
          boxShadow: '0 12px 28px -8px rgba(245,158,11,0.55), 0 4px 10px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '1px solid rgba(252,211,77,0.6)',
        }}
      >
        {t(unlock.toastKey)}
      </div>
    </div>,
    document.body
  );
}
