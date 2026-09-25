import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { isTabUnlocked, getTabUnlock } from '../data/tabUnlocks';
import SFX from '../utils/sfx';
import { triggerHaptic } from '../lib/haptics';
import VoiceAudio from '../utils/voiceAudio';
import DoodleIcon from './bilderbuch/DoodleIcon';
import { featureOn, extrasOn } from '../config/features';

// Map nav tab IDs to their voice line base IDs (Apr 2026 voice pass).
// playLocalized resolves to de_/en_ at play time. Cooldown gates this
// so Ronki only chimes in once in a while, not every tap (Marc:
// "doesn't have to shoot for every tap").
const NAV_VOICE_MAP = {
  hub:     'nav_tap_nest',
  quests:  'nav_tap_heute',
  ronki:   'nav_tap_ronki',
  journal: 'nav_tap_tagebuch',
  shop:    'nav_tap_laden',
};
const NAV_VOICE_COOLDOWN_MS = 12000; // min gap between any two nav-tap voice lines

// Pflege merged into Ronki's page (April 2026), care actions
// (Füttern/Streicheln/Spielen) now live at the top of RonkiProfile.
// The 'care' view route stays in App.jsx so eggTriggers + dreamHighlights
// + any in-app links that still point at 'care' keep working.
//
// Progressive disclosure (Apr 2026, see backlog_progressive_hub_disclosure.md):
// Tabs that aren't yet earned render DIMMED with a padlock overlay instead
// of being hidden. Tapping a locked tab doesn't navigate, it surfaces a
// one-line hint sheet with the exact unlock requirement + current progress.
// Hector feedback: "hidden tabs feel off, grey them out and tell me when
// they open." Unlock criteria live in data/tabUnlocks.ts.
//
// Dev override: ?reveal=all or ?reveal=N still forces unlock state so
// Marc can preview any stage without touching Louis's real save.
// Icons are Bilderbuch doodles (DoodleIcon names), drawn in the marker
// style of the boards: a little house for the Nest, the sun for Heute,
// Ronki's face for his page, the open book for the Tagebuch, the bag
// for the Laden. The 'Nest' label is Marc's (Lager to Nest, 25 Apr 2026).
const TAB_KEYS = [
  { id: 'hub',     key: 'nav.hub',     icon: 'home' },
  { id: 'quests',  key: 'nav.quests',  icon: 'sun' },
  { id: 'ronki',   key: 'nav.ronki',   icon: 'dragon' },
  { id: 'journal', key: 'nav.journal', icon: 'book' },
  { id: 'shop',    key: 'nav.shop',    icon: 'bag' },
];

/**
 * The tabs this child sees (Finch pass, 26 Sep 2026, base design
 * section 7). Two by default: Nest and Ronki, both always open. The old
 * day strip tab only with FEATURES.dayStrip. Tagebuch and Laden come back
 * with the parent "Extras zeigen" toggle, with their old unlock rules.
 */
export function visibleTabs(state) {
  const extras = extrasOn(state);
  return TAB_KEYS.filter((tab) => {
    if (tab.id === 'quests') return featureOn('dayStrip');
    if (tab.id === 'journal' || tab.id === 'shop') return extras;
    return true;
  });
}

function useRevealOverride() {
  // Dev preview: ?reveal=all: everything unlocked regardless of state.
  // Everything else falls through to real state, so natural unlocks (first
  // task to Ronki, first mood + 3 tasks to Tagebuch, 50 Sterne to Laden) still
  // fire as the kid plays, Marc's preview workflow needs that to verify
  // the unlock ceremony actually plays.
  //
  // Note: the old ?reveal=0 "force everything locked" mode was dropped
  // because it masked real state changes, making it impossible to preview
  // an unlock firing. To preview the locked look now, start a fresh
  // profile via onboarding (or clear IndexedDB).
  const [param] = useState(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('reveal');
  });
  if (param === 'all') return { forceUnlockAll: true };
  return { forceUnlockAll: false };
}

export default function NavBar({ active = 'quests', onNavigate }) {
  const { t } = useTranslation();
  const { state } = useTask();
  const { forceUnlockAll } = useRevealOverride();
  // Locked hint state: null OR { tabId, anchorX } so the hint bubble can
  // anchor its pointer at the tapped tab instead of dead-centering.
  const [lockedHintFor, setLockedHintFor] = useState(null);
  const btnRefsRef = useRef({}); // tabId: button element

  // Auto-dismiss the hint after 3.5s so a kid who taps something locked
  // doesn't need to know they have to close the sheet manually. Also
  // dismiss on any outside pointerdown WITHOUT intercepting the click:
  // the previous full-viewport backdrop was eating the next tap, so the
  // kid had to tap twice to switch tabs. Using `capture: false` means the
  // tapped element still receives its own event.
  useEffect(() => {
    if (!lockedHintFor) return;
    const timer = setTimeout(() => setLockedHintFor(null), 3500);
    const handleOutside = (e) => {
      const sheet = document.getElementById('nav-lock-hint-sheet');
      if (sheet && !sheet.contains(e.target)) setLockedHintFor(null);
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleOutside);
    };
  }, [lockedHintFor]);

  // Last-fired timestamp lives on a ref so cooldown survives re-renders
  // without adding state. Module-scope would also work but a ref keeps
  // it scoped to this NavBar instance (parent-first onboarding can
  // remount the bar fresh).
  const lastNavVoiceRef = useRef(0);

  const handleTap = (tab, locked) => {
    if (locked) {
      // Without FEATURES.tabUnlocks there is no hint sheet: a locked
      // Extras tab only answers with the soft bump, never with a list of
      // what is missing (Finch pass: no progress nagging for the child).
      // Locked tab: gentle bump (warning haptic + soft pop) so the kid
      // FEELS the tap was registered, even though navigation didn't fire.
      // Without this the locked-tab tap felt dead, kid would think the
      // app froze.
      try { triggerHaptic('warning'); } catch {}
      SFX.play('pop');
      const el = btnRefsRef.current[tab.id];
      const rect = el?.getBoundingClientRect();
      const anchorX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      if (featureOn('tabUnlocks')) setLockedHintFor({ tabId: tab.id, anchorX });
      return;
    }
    // Unlocked tap: light haptic + soft pop SFX. Marc 27 Apr 2026:
    // "there should also either be sounds and/or haptics when i click
    // buttons like nav", both, light. Phones without a haptic engine
    // ignore the call silently; muted devices skip the SFX. Either way,
    // the device-capable kid gets a confirming tactile beat.
    try { triggerHaptic('light'); } catch {}
    SFX.play('tap');
    setLockedHintFor(null);
    // Ronki nav-tap voice, gated by 12s cooldown across all tabs so it
    // doesn't fire on rapid switching. Probabilistic (1-in-3) on top so
    // even within-cooldown taps are sometimes silent. Result: Ronki
    // chimes in maybe once per minute of normal navigation, never spammy.
    const voiceBaseId = NAV_VOICE_MAP[tab.id];
    if (voiceBaseId) {
      const now = Date.now();
      const okCooldown = now - lastNavVoiceRef.current >= NAV_VOICE_COOLDOWN_MS;
      const okChance = Math.random() < 0.34;
      if (okCooldown && okChance) {
        VoiceAudio.playLocalized(voiceBaseId, 200);
        lastNavVoiceRef.current = now;
      }
    }
    onNavigate?.(tab.id);
  };

  const hintUnlock = lockedHintFor ? getTabUnlock(lockedHintFor.tabId) : null;
  const hintVars = hintUnlock?.hintVars ? hintUnlock.hintVars(state) : undefined;

  // Anchor math: sheet is up to 360px wide, clamped 16px from each viewport
  // edge, ideally centered on the tapped tab. Triangle points at the exact
  // tab center (anchorX), even if the sheet has to shift to stay onscreen,
  // the triangle stays at the anchor.
  let sheetLeft = 0;
  let sheetWidth = 0;
  let triangleLeft = 0;
  if (lockedHintFor && typeof window !== 'undefined') {
    const vw = window.innerWidth;
    sheetWidth = Math.min(360, vw - 32);
    const idealLeft = lockedHintFor.anchorX - sheetWidth / 2;
    sheetLeft = Math.max(16, Math.min(idealLeft, vw - sheetWidth - 16));
    triangleLeft = lockedHintFor.anchorX - sheetLeft;
  }

  return (
    <>
      {/* Locked-tab hint sheet, floats just above the nav, points at the
           tapped tab with a gentle bounce. Auto-dismisses after 3.5s or
           on any outside pointerdown. No backdrop, the previous version
           intercepted the next tap which broke tab switching. */}
      {featureOn('tabUnlocks') && lockedHintFor && hintUnlock && (
          <div
            id="nav-lock-hint-sheet"
            className="fixed z-[56]"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 22px) + 96px)',
              left: sheetLeft,
              width: sheetWidth,
              animation: 'navLockHintIn 0.22s ease-out',
            }}
          >
            <div
              role="dialog"
              aria-modal="false"
              aria-label={t('nav.locked.sheetTitle')}
              className="rounded-[22px] p-4 bg-paper text-ink border-[3px] border-ink"
            >
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 mt-0.5 text-cobalt" aria-hidden="true">
                  <DoodleIcon name="lock" size={22} />
                </span>
                <p className="font-headline font-semibold text-[16px] leading-snug flex-1">
                  {t(hintUnlock.hintKey, hintVars)}
                </p>
              </div>
            </div>
            {/* Triangle points at the tapped tab (anchorX), clamped so it
                stays within the sheet's rounded corners. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -8,
                left: Math.max(18, Math.min(triangleLeft, sheetWidth - 18)),
                transform: 'translateX(-50%) rotate(45deg)',
                width: 14,
                height: 14,
                background: 'var(--color-paper)',
                borderRight: '3px solid var(--color-ink)',
                borderBottom: '3px solid var(--color-ink)',
              }}
            />
          </div>
      )}

      <nav
        className="fixed bottom-0 left-0 w-full z-50 bg-white"
        style={{
          // Bilderbuch tab bar: a white shelf with a drawn ink line along
          // the top. No blur, no shadow; the line is the depth.
          paddingTop: 3,
        }}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 600 6"
          preserveAspectRatio="none"
          className="absolute left-0 top-0 w-full"
          style={{ height: 6, overflow: 'visible', color: 'var(--color-ink)' }}
        >
          <path
            d="M0 3 C 80 1.5 160 4.5 240 3 C 330 1.5 420 4.5 510 3 C 550 2.2 580 2.8 600 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className="flex justify-around items-end max-w-lg mx-auto"
          style={{
            padding: '10px 10px 0',
            paddingBottom: 'max(18px, env(safe-area-inset-bottom, 18px))',
          }}
        >
          {visibleTabs(state).map(tab => {
            const isActive = tab.id === active;
            const unlocked = forceUnlockAll || isTabUnlocked(tab.id, state);
            // Never lock the currently-active tab, it would strand the
            // user inside a tab they can't reopen by tapping it.
            const locked = !unlocked && !isActive;
            const label = t(tab.key);
            // Sparkle pulse on tabs that have unlocked but whose coachmark
            // hasn't been dismissed yet, draws the eye to the new surface
            // until the kid actually opens it. Hub + Quests are never
            // "new" so skip them. Dropped once coachmark is marked seen.
            const hasCoachmark = tab.id === 'ronki' || tab.id === 'journal' || tab.id === 'shop';
            const isFreshUnlock = featureOn('tabUnlocks')
              && hasCoachmark
              && unlocked
              && !isActive
              && !(state?.tabCoachmarksSeen || {})[tab.id];
            return (
              <button
                key={tab.id}
                ref={(el) => { btnRefsRef.current[tab.id] = el; }}
                data-tab-id={tab.id}
                aria-label={locked ? `${label}, ${t('nav.locked.aria')}` : label}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={locked ? 'true' : 'false'}
                onClick={() => handleTap(tab, locked)}
                className="relative flex flex-col items-center justify-end transition-colors duration-200 active:scale-95"
                style={{
                  gap: 3,
                  padding: '6px 6px 4px',
                  minWidth: 60,
                  minHeight: 56,
                  color: isActive ? 'var(--color-cobalt)' : 'var(--color-ink)',
                  opacity: locked ? 0.35 : isActive ? 1 : 0.72,
                }}
              >
                <DoodleIcon name={tab.icon} size={28} stroke={isActive ? 6 : 5} />
                <span
                  className="font-headline font-semibold"
                  style={{ fontSize: 13, lineHeight: 1, letterSpacing: '0.005em' }}
                >
                  {label}
                </span>
                {/* Short hand-drawn dash under the active label. */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 40 8"
                  width="28"
                  height="6"
                  style={{ overflow: 'visible', opacity: isActive ? 1 : 0, transition: 'opacity 0.2s' }}
                >
                  <path
                    d="M3 5 C 12 2.5 24 6 37 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Sun sparkle on freshly-unlocked tabs: a small sticker
                     that twinkles until the coachmark is dismissed. */}
                {isFreshUnlock && (
                  <span
                    aria-hidden="true"
                    className="absolute text-sun"
                    style={{
                      top: -2, right: 4,
                      animation: 'navTabUnlockSparkle 1.6s ease-in-out infinite',
                    }}
                  >
                    <DoodleIcon name="sparkle" size={16} filled stroke={3} />
                  </span>
                )}
                {/* Padlock badge on locked tabs: the lock doodle, top right. */}
                {locked && (
                  <span
                    aria-hidden="true"
                    className="absolute flex items-center justify-center rounded-full bg-white text-ink"
                    style={{ top: 0, right: 4, width: 18, height: 18, border: '2px solid var(--color-ink)' }}
                  >
                    <DoodleIcon name="lock" size={11} stroke={7} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes navLockHintIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes navTabUnlockSparkle {
          0%   { opacity: 0.3; transform: scale(0.6) rotate(-10deg); }
          50%  { opacity: 1; transform: scale(1.1) rotate(8deg); }
          100% { opacity: 0.3; transform: scale(0.6) rotate(-10deg); }
        }
      `}</style>
    </>
  );
}
