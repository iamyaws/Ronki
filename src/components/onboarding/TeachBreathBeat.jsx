import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import MoodChibi from '../MoodChibi';
import FireBreathPuff from '../FireBreathPuff';
import VoiceAudio from '../../utils/voiceAudio';
import { lineText } from '../../data/ronkiLines';
import { DoodleIcon, MotionTicks, PillButton } from '../bilderbuch';

/**
 * TeachBreathBeat: the reusable "teach Ronki a fire-breath flavor" beat.
 *
 * Pulled out of TeachFireStep v2 so post-onboarding rituals (Herzfeuer
 * / Funkenstern / Glut / Regenbogenfeuer) share the same 2-round
 * failure-first mechanic without each one re-implementing the state
 * machine. Takes props for:
 *   · variant     : chibi colorway (forest/amber/teal/rose/violet/sunset)
 *   · t           : translation function (parent injects its own useTranslation)
 *   · targetFlavor: the flavor that plays on round 2 success. 'flame'
 *                    for onboarding; 'heart' / 'sparkle' / 'ember' /
 *                    'rainbow' for unlock rituals. Round 1 always plays
 *                    'smoke' regardless.
 *   · copyKeys    : { title, intro, tryFail, tryAgain, holdHint,
 *                      smokeFail, celebrate, soloLine, holdLabel,
 *                      next }: i18n keys for each phase's copy. The
 *                      wrapper owns which language namespace to use.
 *   · onComplete  : called when phase='done' (after the solo repeat).
 *                    Wrapper decides what to do next (continue onboarding
 *                    → step 7, or dismiss modal + actions.teachBreath).
 *
 * Onboarding flame (Finch pass, 26 Sep 2026, base 2.1 screen 10): teach
 * through success. Round 1 always ends in a small spark, never "zu kurz":
 * "Oh, ein Funke! Nochmal. Ganz lange Luft holen." (teach_fire_spark_01,
 * ember puff, happy face). Round 2 always makes the flame for any hold
 * of 0.22 s or more, then "Jaaa! So geht's!" (teach_fire_celebrate_01)
 * and "Das hast du mir gezeigt. Das vergess ich nie."
 * (teach_fire_learned_01). Kid words for these beats come from
 * finchLines.de.json. The ritual flavors keep their old two rounds.
 *
 * Fix round 1 (Astra FC-06, KIDUX-3): the first prompt shows and speaks
 * "Drück ganz lange auf den Knopf. Und dann lass los!" (teach_fire_hold_01)
 * in place of the muted narrator intro, and the hold button shows the
 * move itself (it sinks in, stays down, comes back up) until the first
 * real hold. A press shorter than the minimum speaks the line again and
 * brings the demonstration back (with a cooldown, so fast taps never
 * restart the line mid-sentence).
 *
 * Renders:
 *   · H1 title (from copyKeys.title)
 *   · Chibi stage (360×360) with fire/smoke puff + mouth glow
 *   · Phase-keyed copy line
 *   · Hold button OR continue button (depending on phase)
 *
 * Does NOT render:
 *   · Outer page chrome (bg image, safe-area paddings, ProgressBar).
 *     Wrapper provides those. See TeachFireStep.jsx for the onboarding
 *     wrapping, TeachRitualModal (future) for the post-onboarding modal
 *     wrapping.
 */

// Minimum press duration to count as a deliberate "hold": filters
// accidental double-taps. Any release above this advances the round;
// there is no "too early" branch anymore.
const MIN_HOLD_MS = 220;
const SMOKE_TO_PROMPT_DELAY = 2100;
// The spark line is longer than the old smoke line; let it finish.
const SPARK_TO_PROMPT_DELAY = 2800;
// The learned line starts once "Jaaa! So geht's!" has played.
const LEARNED_VOICE_DELAY = 900;
const SUCCESS_TO_SOLO_DELAY = 1300;
const SOLO_TO_DONE_DELAY = 1200;
const INTRO_DURATION_MS = 2200;
// The hold line on the first prompt waits for the prompt to settle.
const HOLD_VOICE_DELAY = 300;
// The hold line takes about 3 s; a short tap inside that window does not
// restart it.
const HOLD_VOICE_COOLDOWN_MS = 3000;

// Chibi container: nominal 540px (50% larger than v2's 360px per Marc
// 24 Apr 2026 "ronki could be 50% bigger"). Actual size measured at
// runtime so on narrow viewports the chibi scales down proportionally
// instead of overflowing. MoodChibi's internal layout is percent-based,
// so passing the measured size keeps horns/eyes/mouth correctly placed.
const NOMINAL_CHIBI_SIZE = 540;

// Per-flavor mouth anchor. Each flavor's internal emission origin sits
// at a different offset inside its own wrapper box:
//   · flame/heart/rainbow: cone/shape originates near wrapper top-left
//     (cone extends rightward, heart mass near upper edge).
//   · smoke: cloud puffs drift right-and-up from wrapper left edge.
//   · sparkle: stars are bottom-anchored inside their wrapper and
//     drift upward. Wrapper must be placed so its BOTTOM lands at the
//     mouth line (anchor top pushed well above mouth).
//   · ember: dots radiate from wrapper's LEFT-MIDDLE. Anchor shifted
//     up slightly so mid-wrapper hits the mouth line.
// Tuned empirically 24 Apr 2026 after Marc flagged sparkle + ember
// weren't aligned to the mouth like heart + rainbow were.
const FLAVOR_MOUTH_ANCHORS = {
  flame:   { top: '68%', left: '54%' },
  smoke:   { top: '68%', left: '54%' },
  heart:   { top: '68%', left: '54%' },
  rainbow: { top: '68%', left: '54%' },
  sparkle: { top: '38%', left: '50%' },
  ember:   { top: '56%', left: '48%' },
};

// Per-flavor fire size + duration. Each successive ritual in the unlock
// order renders a bigger, longer breath: the progression system made
// tangible. flame (onboarding) is the baseline; rainbow is the biggest
// because it's the last unlock (after 3 boss-arc completions). sparkle
// + ember bumped 24 Apr 2026 per Marc ("could both also be bigger") to
// bring them in line with heart + rainbow at-a-glance heft.
const FIRE_SIZE_BY_FLAVOR = {
  flame:   { scale: 2.5,  duration: 1.5  },
  sparkle: { scale: 3.2,  duration: 1.8  },
  heart:   { scale: 3.0,  duration: 1.8  },
  ember:   { scale: 3.5,  duration: 1.95 },
  rainbow: { scale: 3.5,  duration: 2.1  },
};

// Inhale scale: chibi puffs up during the hold. Was 1.08 (subtle) in
// v2; bumped to 1.55 per Marc ("full intake should be also 50% than
// right now" = ~+50% from the 1.08 state). Reduced-motion still gets
// a flat 1.0.
const INHALE_SCALE = 1.55;

export default function TeachBreathBeat({
  variant,
  t,
  targetFlavor = 'flame',
  copyKeys,
  onComplete,
  // Header rendered above the chibi. Optional: wrappers that have
  // their own heading (e.g. a modal with a title bar) can pass null
  // to skip the inner H1.
  showTitle = true,
}) {
  // 'intro' → 'prompt' → 'inhaling' → 'smoke' → 'prompt' → 'inhaling'
  // → 'released' → 'solo' → 'done'
  const [phase, setPhase] = useState('intro');
  const [attemptNum, setAttemptNum] = useState(1);  // 1 = will smoke; 2 = will fire
  const [fireKey, setFireKey] = useState(0);
  const [fireFlavor, setFireFlavor] = useState(targetFlavor);
  // A press shorter than MIN_HOLD_MS happened in this round: show the
  // hold line and the demonstration again (onboarding flame only).
  const [holdNudge, setHoldNudge] = useState(false);
  const holdStart = useRef(null);
  const timersRef = useRef([]);
  const prefersReducedMotion = useReducedMotion();

  // Responsive chibi sizing. Measures the container via ResizeObserver
  // so MoodChibi renders at the right size for the viewport. Falls back
  // to NOMINAL on SSR / pre-mount. Narrow phones (375-wide) cap at
  // viewport width minus onboarding horizontal padding.
  const containerRef = useRef(null);
  const [chibiSize, setChibiSize] = useState(NOMINAL_CHIBI_SIZE);
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = Math.floor(e.contentRect.width);
        if (w > 0) setChibiSize(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Size + duration for this ritual's target flavor. Smoke inherits the
  // same scale so round 1's failed cough reads at the same magnitude as
  // the successful round 2 breath.
  const { scale: FIRE_SCALE, duration: FIRE_DURATION_S } = useMemo(
    () => FIRE_SIZE_BY_FLAVOR[targetFlavor] || FIRE_SIZE_BY_FLAVOR.flame,
    [targetFlavor],
  );
  // Mouth-glow dimensions scale proportionally with the flame scale so
  // the glow envelope stays consistent with the flame at any tier.
  // Baseline glow was 118×78 at flame scale 1.65; keep that ratio.
  const glowW = Math.round(118 * (FIRE_SCALE / 1.65));
  const glowH = Math.round(78 * (FIRE_SCALE / 1.65));

  // Auto-advance intro → prompt
  useEffect(() => {
    if (phase !== 'intro') return;
    const id = setTimeout(() => setPhase('prompt'), INTRO_DURATION_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // ── Voice: phase-keyed playback (Apr 2026 character pass).
  // Drachenmutter (Eleonore) narrates framing beats; Ronki (Harry)
  // voices first-person reactions. No cleanup-stop: each new
  // phase's play() naturally overrides the previous via
  // VoiceAudio.stop() inside play(), so audio chains cleanly without
  // gaps. Onboarding-flame only: ritual unlock variants will get
  // their own audio bank when those modals ship.
  const isOnboardingFlame = targetFlavor === 'flame';
  // The narrator is muted app-wide, so the intro used to be silent. Ronki
  // now says the move himself on the first prompt (teach_fire_hold_01).
  const holdLinePlayedRef = useRef(false);
  const lastHoldVoiceAt = useRef(-Infinity);
  const speakHoldLine = (delayMs) => {
    lastHoldVoiceAt.current = performance.now();
    VoiceAudio.playLocalized('teach_fire_hold_01', delayMs);
  };
  useEffect(() => {
    if (!isOnboardingFlame) return;
    if (phase === 'prompt' && attemptNum === 1 && !holdLinePlayedRef.current) {
      holdLinePlayedRef.current = true;
      speakHoldLine(HOLD_VOICE_DELAY);
    } else if (phase === 'smoke') {
      VoiceAudio.playLocalized('teach_fire_spark_01', 200);
    } else if (phase === 'released') {
      VoiceAudio.playLocalized('teach_fire_celebrate_01', 100);
    } else if (phase === 'solo') {
      VoiceAudio.playLocalized('teach_fire_learned_01', LEARNED_VOICE_DELAY);
    }
  }, [phase, attemptNum, isOnboardingFlame]);

  // Cleanup pending timers on unmount
  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startHold = (e) => {
    if (phase !== 'prompt') return;
    e.preventDefault();
    holdStart.current = performance.now();
    setPhase('inhaling');
  };

  const endHold = () => {
    if (phase !== 'inhaling') return;
    const duration = performance.now() - (holdStart.current || 0);
    holdStart.current = null;

    if (duration < MIN_HOLD_MS) {
      setPhase('prompt');
      if (isOnboardingFlame) {
        // A quick tap: Ronki says the move again, and the button shows it.
        setHoldNudge(true);
        if (performance.now() - lastHoldVoiceAt.current >= HOLD_VOICE_COOLDOWN_MS) {
          speakHoldLine(0);
        }
      }
      return;
    }
    setHoldNudge(false);

    if (attemptNum === 1) {
      // Round 1: deterministic per spec. Onboarding: a small spark (a
      // first success). Rituals: the old smoke cough.
      setFireFlavor(isOnboardingFlame ? 'ember' : 'smoke');
      setFireKey(k => k + 1);
      setPhase('smoke');

      const t1 = setTimeout(() => {
        setAttemptNum(2);
        setPhase('prompt');
      }, isOnboardingFlame ? SPARK_TO_PROMPT_DELAY : SMOKE_TO_PROMPT_DELAY);
      timersRef.current.push(t1);
    } else {
      // Round 2: always targetFlavor. Celebration → Ronki solo → done.
      setFireFlavor(targetFlavor);
      setFireKey(k => k + 1);
      setPhase('released');

      const t1 = setTimeout(() => {
        setFireFlavor(targetFlavor);
        setFireKey(k => k + 1);
        setPhase('solo');
      }, SUCCESS_TO_SOLO_DELAY);
      timersRef.current.push(t1);

      const t2 = setTimeout(() => {
        setPhase('done');
      }, SUCCESS_TO_SOLO_DELAY + SOLO_TO_DONE_DELAY);
      timersRef.current.push(t2);
    }
  };

  const isCelebrating = phase === 'released' || phase === 'solo' || phase === 'done';
  const chibiMood =
    phase === 'smoke' ? (isOnboardingFlame ? 'gut' : 'besorgt') :
    isCelebrating     ? 'magisch' :
    'normal';

  const isInhaling = phase === 'inhaling' || phase === 'solo';
  const chibiScale = prefersReducedMotion ? 1 : (isInhaling ? INHALE_SCALE : 1);
  const inhaleDuration = prefersReducedMotion ? 0.01 : (
    phase === 'inhaling' ? 2.0 :
    phase === 'solo'     ? 0.9 :
    0.4
  );

  // Copy line per phase × attempt. copyKeys is injected by wrapper.
  const copyKey =
    phase === 'intro'    ? copyKeys.intro :
    phase === 'prompt'   ? (attemptNum === 2 ? copyKeys.tryAgain : copyKeys.tryFail) :
    phase === 'inhaling' ? copyKeys.holdHint :
    phase === 'smoke'    ? copyKeys.smokeFail :
    phase === 'released' ? copyKeys.celebrate :
                           copyKeys.soloLine;
  // Onboarding flame: Ronki's own lines from finchLines.de.json. The
  // first prompt (and any prompt after a too-short press) is the hold
  // line; the spark line stays up for round 2 ("Nochmal. Ganz lange Luft
  // holen.").
  const showHoldLine = isOnboardingFlame && phase === 'prompt' && (attemptNum === 1 || holdNudge);
  const lineId = !isOnboardingFlame ? null :
    showHoldLine ? 'teach_fire_hold_01' :
    (phase === 'smoke' || (phase === 'prompt' && attemptNum === 2)) ? 'teach_fire_spark_01' :
    (phase === 'solo' || phase === 'done') ? 'teach_fire_learned_01' :
    null;
  const copyText = lineId ? lineText(lineId) : t(copyKey);

  const showHoldButton = phase === 'prompt' || phase === 'inhaling';
  // The button shows the move (press in, stay down, let go) while the
  // hold line is up. Reduced motion keeps it still; the voice still says it.
  const demoHold = showHoldLine && !prefersReducedMotion;
  const showContinue = phase === 'done';

  // Mouth glow suppressed under reduced-motion.
  const showMouthGlow = !prefersReducedMotion && (phase === 'released' || phase === 'solo');

  return (
    <>
      {showTitle && (
        <header className="space-y-2 max-w-md">
          <h1 className="bb-display text-4xl text-white">
            {t(copyKeys.title)}
          </h1>
        </header>
      )}

      {/* Chibi stage: nominal 540×540 container (50% bigger than v2 per
          Marc 24 Apr 2026). `width: min(NOMINAL, 92vw)` caps on narrow
          phones so the chibi never overflows horizontally. aspect-ratio
          keeps the box square. ResizeObserver measures actual width and
          feeds it to MoodChibi's size prop so internal layout (horns,
          eyes, mouth anchor) stays correctly placed at any viewport. */}
      <div
        ref={containerRef}
        className="relative"
        style={{
          width: `min(${NOMINAL_CHIBI_SIZE}px, 92vw)`,
          aspectRatio: '1 / 1',
        }}
      >
        <motion.div
          animate={{ scale: chibiScale }}
          transition={{ duration: inhaleDuration, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, transformOrigin: '50% 90%' }}
        >
          <MoodChibi
            size={chibiSize}
            // Callers pass the companionVariant id (a string); older
            // callers passed an object with an id.
            variant={typeof variant === 'string' ? variant : variant?.id}
            stage={1}
            mood={chibiMood}
            bare
          />

          {/* Breath ticks: the drawn marks around a chest that fills. */}
          {isInhaling && !prefersReducedMotion && (
            <>
              <MotionTicks
                tone="sun"
                size={Math.round(chibiSize * 0.13)}
                rotate={-30}
                className="absolute tbb-tick"
                style={{ top: '30%', right: '6%' }}
              />
              <MotionTicks
                tone="sun"
                size={Math.round(chibiSize * 0.13)}
                rotate={210}
                className="absolute tbb-tick"
                style={{ top: '30%', left: '6%', animationDelay: '0.2s' }}
              />
            </>
          )}

          {/* Mouth sparkle when the fire lands, one burst of sun ticks. */}
          {showMouthGlow && (
            <span
              key={`glow-${fireKey}`}
              aria-hidden="true"
              className="tbb-glow"
              style={{
                position: 'absolute',
                top: '70%',
                left: '54%',
                width: glowW,
                height: glowH,
                transform: 'translate(-50%, -50%)',
                animation: `tbbGlow ${FIRE_DURATION_S}s ease-out forwards`,
                pointerEvents: 'none',
                zIndex: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <MotionTicks tone="sun" size={Math.round(glowH * 0.6)} rotate={200} />
              <MotionTicks tone="sun" size={Math.round(glowH * 0.6)} rotate={-20} />
            </span>
          )}

          <FireBreathPuff
            fireKey={fireKey}
            flavor={fireFlavor}
            top={(FLAVOR_MOUTH_ANCHORS[fireFlavor] || FLAVOR_MOUTH_ANCHORS.flame).top}
            left={(FLAVOR_MOUTH_ANCHORS[fireFlavor] || FLAVOR_MOUTH_ANCHORS.flame).left}
            scale={FIRE_SCALE}
            duration={FIRE_DURATION_S}
          />
        </motion.div>
      </div>

      {/* Phase-keyed copy line */}
      <motion.p
        key={lineId || copyKey}
        initial={{ opacity: 0.35, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="text-white font-headline font-semibold text-xl leading-snug max-w-sm"
        style={{ textWrap: 'balance', minHeight: '3em' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {copyText}
      </motion.p>

      {/* Action zone: hold button OR continue button */}
      <div className="w-full max-w-xs mt-2 min-h-[120px] flex flex-col items-center justify-center gap-3">
        {showHoldButton && (
          <>
            {/* The hold button: a sun disc with the ink edge it sinks into. */}
            <button
              type="button"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              data-demo={demoHold ? 'hold' : undefined}
              className={`w-28 h-28 rounded-full border-[3px] border-ink bg-sun text-ember flex items-center justify-center select-none${demoHold ? ' tbb-demo' : ''}`}
              style={{
                boxShadow: phase === 'inhaling' ? '0 1px 0 var(--color-ink)' : '0 6px 0 var(--color-ink)',
                transform: phase === 'inhaling' ? 'translateY(5px)' : 'translateY(0)',
                transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
                cursor: 'pointer',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              aria-label={t(copyKeys.holdLabel)}
            >
              <DoodleIcon name="flame" size={56} filled={phase === 'inhaling'} />
            </button>
            <p className="text-white font-headline font-semibold text-lg inline-flex items-center gap-2">
              <MotionTicks tone="white" size={20} rotate={-20} />
              {t(copyKeys.holdLabel)}
            </p>
          </>
        )}

        {showContinue && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* Sun pill on the sky ground: never a cobalt pill on blue. */}
            <PillButton tone="sun" size="lg" full arrow onClick={onComplete}>
              {t(copyKeys.next)}
            </PillButton>
          </motion.div>
        )}
      </div>

      {/* Local keyframes: cfFireBreath (for the flame puff) must be
          available even if no campfire-scene stylesheet is mounted;
          tbbGlow is the mouth sparkle, tbbTick the breath ticks. */}
      <style>{`
        @keyframes cfFireBreath {
          0%   { opacity: 0; transform: scaleX(0.2) scaleY(0.6); }
          25%  { opacity: 1; transform: scaleX(1) scaleY(1); }
          80%  { opacity: 0.8; transform: scaleX(1.3) scaleY(0.9); }
          100% { opacity: 0; transform: scaleX(1.6) scaleY(0.5); }
        }
        @keyframes tbbGlow {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          25%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes tbbTick {
          0%, 100% { opacity: 0.55; transform: scale(0.9); }
          50%      { opacity: 1; transform: scale(1.08); }
        }
        .tbb-tick { animation: tbbTick 1.2s ease-in-out infinite; }
        @keyframes tbbPressDemo {
          0%, 18%   { transform: translateY(0); box-shadow: 0 6px 0 var(--color-ink); }
          28%, 72%  { transform: translateY(5px) scale(0.96); box-shadow: 0 1px 0 var(--color-ink); }
          82%, 100% { transform: translateY(0); box-shadow: 0 6px 0 var(--color-ink); }
        }
        .tbb-demo { animation: tbbPressDemo 2.4s ease-in-out infinite; }
      `}</style>
    </>
  );
}

/**
 * Default copy key set for the original onboarding flame teach.
 * Exported so wrappers + preview harnesses can reuse it.
 */
export const ONBOARDING_FLAME_COPY = {
  title: 'onboarding.teach.title',
  intro: 'onboarding.teach.intro',
  tryFail: 'onboarding.teach.tryFail',
  tryAgain: 'onboarding.teach.tryAgain',
  holdHint: 'onboarding.teach.holdHint',
  smokeFail: 'onboarding.teach.smokeFail',
  celebrate: 'onboarding.teach.celebrate',
  soloLine: 'onboarding.teach.soloLine',
  holdLabel: 'onboarding.teach.holdLabel',
  next: 'onboarding.teach.next',
};
