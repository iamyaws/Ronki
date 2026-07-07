import React, { useEffect, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { track } from '../../lib/analytics';
import VoiceAudio from '../../utils/voiceAudio';
import MoodChibi from '../MoodChibi';

/**
 * MeetRonki — the 60-second first-encounter beat.
 *
 * Direction A from the Claude Design hi-fi handoff (26 Apr 2026):
 * "One continuous shot." The camera pushes into the cave from a
 * dim approach, the kid sees six eggs on a stone shelf, picks one,
 * the egg wobbles + cracks + hatches in a flash, Ronki appears
 * with his first voiced line, the kid names him, then we pull
 * back. Drachenmutter narrates the framing beats; Ronki only
 * speaks once he's hatched.
 *
 * Phases (auto-advances unless noted):
 *   approach (4.4s) → shelf (kid picks egg) → wobble (1.6s)
 *     → hatch (1.4s flash) → meet (4.5s, Ronki's first line)
 *     → name (kid types) → close (auto-dismisses)
 *
 * On 'close', calls onComplete with { companionVariant, heroName }
 * — the parent flow uses this to seed the kid's onboarding state.
 *
 * Voice + lines align with the BeiRonkiSein bar (soft, hedge-y,
 * no em-dashes, kid-readable). ElevenLabs audio shipped 2026-04-27
 * (Eleonore for Drachenmutter — German-native tender guide; Harry for
 * Ronki) — see docs/voice/ronki-voicelines.md narrator_meet_* + de_meet_*.
 *
 * Based on: docs/design-incoming/meet-tonight/project/src/hifi-meet.jsx
 */

const EGG_VARIANTS = [
  { id: 'amber',  tint: '#fde68a', deep: '#b45309', name: 'Amber' },
  { id: 'teal',   tint: '#a7f3d0', deep: '#0f766e', name: 'Mint' },
  { id: 'rose',   tint: '#fbcfe8', deep: '#be185d', name: 'Rose' },
  { id: 'violet', tint: '#c4b5fd', deep: '#6d28d9', name: 'Veilchen' },
  { id: 'forest', tint: '#bbf7d0', deep: '#15803d', name: 'Wald' },
  { id: 'sunset', tint: '#fdba74', deep: '#c2410c', name: 'Sonnen' },
];

const LINES = {
  // Apr 27 2026: Drachenmutter removed (Marc: "Ronki's voice only").
  // Pre-hatch beats (approach/shelf/wobble) are now silent-with-text —
  // no speaker attribution, no audio, the German line just fades in
  // visually like a storybook caption. Ronki can't speak from inside
  // the egg, but the cinematic still needs framing copy. Post-hatch
  // (meet/name/close) is Ronki's voice, his text. 'who: null' is the
  // signal to VoiceLine to render text without the speaker eyebrow.
  approach: { who: null,    text: 'Da hinten leuchtet etwas.' },
  shelf:    { who: null,    text: 'Welches Ei fühlt sich richtig an?' },
  wobble:   { who: null,    text: 'Eines zittert leicht.' },
  hatch:    null,
  meet:     { who: 'Ronki', text: 'Hallo. Ich hab auf dich gewartet. Glaub ich.' },
  name:     { who: 'Ronki', text: 'Hm, wie soll ich heißen?' },
  close:    { who: 'Ronki', text: 'Bis morgen. Versprochen.' },
};

export default function MeetRonki({ onComplete }) {
  const { actions } = useTask();
  const [phase, setPhase] = useState('approach');
  const [picked, setPicked] = useState(null);
  const [name, setName] = useState('');
  const [voiceKey, setVoiceKey] = useState(0);

  // Auto-advance through the phases the kid doesn't drive. Each branch
  // also fires its matching ElevenLabs line + returns a cleanup that
  // stops the audio if phase shifts mid-playback. Symmetric structure
  // (every branch returns a cleanup) keeps the contract obvious for
  // future-you. Audio files: narrator_meet_* (Drachenmutter, Charlotte)
  // and de_meet_*_01 (Ronki, Harry) — see docs/voice/ronki-voicelines.md.
  useEffect(() => {
    if (phase === 'approach') {
      // Pre-hatch: silent, on-screen text only. Ronki can't speak yet.
      // Phase length tightened from 4400 → 3600ms now that no voice needs
      // to land — pure visual beat with text fade-in.
      const t = setTimeout(() => { setPhase('shelf'); setVoiceKey(v => v + 1); }, 3600);
      return () => clearTimeout(t);
    }
    if (phase === 'shelf') {
      // Silent — kid is browsing eggs. Tapping advances.
      return undefined;
    }
    if (phase === 'wobble') {
      // Silent. Visual: chosen egg trembles, others dim, music carries.
      // Phase length 1400ms (faster now that no voice has to fit).
      const t = setTimeout(() => setPhase('hatch'), 1400);
      return () => clearTimeout(t);
    }
    if (phase === 'hatch') {
      const t = setTimeout(() => { setPhase('meet'); setVoiceKey(v => v + 1); }, 1400);
      return () => clearTimeout(t);
    }
    if (phase === 'meet') {
      // Ronki's first voiced line. Already shipped.
      VoiceAudio.playLocalized('meet_hello_01', 200);
      const t = setTimeout(() => { setPhase('name'); setVoiceKey(v => v + 1); }, 4500);
      return () => { clearTimeout(t); VoiceAudio.stop(); };
    }
    if (phase === 'name') {
      VoiceAudio.playLocalized('meet_namequest_01', 400);
      return () => VoiceAudio.stop();
    }
    if (phase === 'close') {
      // Was Drachenmutter narrator_meet_close ("Er bleibt hier...");
      // now Ronki saying his own goodbye. Voice file de_meet_close_01
      // is queued in docs/voice/ronki-voicelines.md for the next gen pass —
      // until that lands, playLocalized fails silently and the on-
      // screen "Bis morgen. Versprochen." text carries the moment.
      VoiceAudio.playLocalized('meet_close_01', 600);
      return () => VoiceAudio.stop();
    }
  }, [phase]);

  const pickEgg = (variant) => {
    if (phase !== 'shelf') return;
    setPicked(variant);
    setPhase('wobble');
    setVoiceKey(v => v + 1);
  };

  const confirmName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPhase('close');
    setVoiceKey(v => v + 1);
  };

  const finish = () => {
    if (!picked || !name.trim()) return;
    track('ronki.hatch');
    // NOTE: completeOnboarding is intentionally NOT called here. The
    // chained onboarding flow (CombinedParentSetup → HandoffBackCard
    // → MeetRonki → TeachFireStep → Hub) runs TeachFireStep AFTER this
    // surface, and TeachFireStep's onComplete is what flips
    // state.onboardingDone (via completeOnboarding with taughtSignature
    // = 'fire'). If we flipped onboardingDone here, the gate that
    // hides onboarding would unmount the chain mid-flight before
    // TeachFireStep even rendered.
    //
    // Standalone usage of MeetRonki (e.g. ?meet=1 preview) doesn't
    // need onboardingDone flipped — it's already onboarded.
    onComplete?.({ companionVariant: picked, heroName: name.trim() });
  };

  const pickedVar = picked ? EGG_VARIANTS.find(e => e.id === picked) : null;
  const cur = LINES[phase];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronki kennenlernen"
      style={{ position: 'fixed', inset: 0, zIndex: 950, overflow: 'hidden', background: '#050302' }}
    >
      <CaveScene phase={phase} pickedTint={pickedVar?.tint} pickedDeep={pickedVar?.deep} />

      {(phase === 'shelf' || phase === 'wobble' || phase === 'hatch') && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -10%)',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18, padding: '0 36px', width: '88%', justifyItems: 'center',
        }}>
          {EGG_VARIANTS.map(e => {
            const isPicked = picked === e.id;
            const dim = picked && !isPicked;
            return (
              <Egg
                key={e.id}
                tint={e.tint}
                deep={e.deep}
                size={62}
                picked={isPicked}
                dim={dim}
                wobble={isPicked && phase === 'wobble'}
                hatching={isPicked && phase === 'hatch'}
                onTap={!picked && phase === 'shelf' ? () => pickEgg(e.id) : undefined}
              />
            );
          })}
        </div>
      )}

      {(phase === 'meet' || phase === 'name' || phase === 'close') && pickedVar && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: phase === 'close'
            ? 'translate(-50%, -38%) scale(0.5)'
            : 'translate(-50%, -45%)',
          transition: 'transform 1400ms cubic-bezier(.34,1.4,.64,1)',
        }}>
          {/* Apr 2026 immersion fix: was a custom CSS-drawn RonkiHatchling
              that didn't match TeachBreathBeat's MoodChibi → kid saw two
              different Ronkis between hatching here and learning fire-
              breath in TeachFireStep. Now both surfaces share MoodChibi
              with stage=1 (baby) + variant from the egg pick. The wrapper
              div carries the awakening scale ramp + breathing animation
              that the old hatchling baked in. */}
          <RonkiHatchlingWrapper
            awakening={phase === 'meet' || phase === 'name' ? 1 : 0.6}
            breathe={phase !== 'hatch'}
            tint={pickedVar?.tint || '#fde68a'}
          >
            <MoodChibi
              variant={picked || 'amber'}
              stage={1}
              mood="normal"
              size={150}
              bare
            />
          </RonkiHatchlingWrapper>
        </div>
      )}

      {cur && phase !== 'hatch' && <VoiceLine key={voiceKey} who={cur.who} text={cur.text} />}

      {/* Waveform only on phases where Ronki actually speaks — was previously
          showing during the silent pre-hatch beats too, which read as a bug
          (waveform present, no audio). */}
      {cur && (phase === 'meet' || phase === 'close') && (
        <Waveform active />
      )}

      {phase === 'name' && (
        <div style={{
          position: 'absolute', bottom: 38, left: 28, right: 28,
          display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
          animation: 'mr-lineIn 700ms ease 400ms backwards',
        }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 18))}
            placeholder="hier tippen"
            autoFocus
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 14,
              background: 'rgba(255,255,255,.08)',
              border: '1.5px solid rgba(252,211,77,.4)',
              outline: 'none',
              font: '600 18px "Fredoka", sans-serif',
              color: '#fef3c7',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <button
            type="button"
            onClick={confirmName}
            disabled={!name.trim()}
            style={{
              padding: '12px 28px',
              borderRadius: 999,
              border: 'none',
              background: name.trim() ? '#fcd34d' : 'rgba(252,211,77,.2)',
              color: name.trim() ? '#5a3a08' : 'rgba(254,243,199,.4)',
              font: '700 13px "Plus Jakarta Sans", sans-serif',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              cursor: name.trim() ? 'pointer' : 'default',
              transition: 'all 300ms ease',
            }}
          >
            so soll er heißen
          </button>
        </div>
      )}

      {phase === 'close' && (
        <button
          type="button"
          onClick={finish}
          style={{
            position: 'absolute', inset: 0,
            background: 'transparent', border: 'none', cursor: 'pointer',
            font: '600 10px "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'rgba(255,242,217,.35)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 26,
            animation: 'mr-lineIn 800ms ease 3000ms backwards',
          }}
        >
          tippen zum schließen
        </button>
      )}

      <style>{`
        @keyframes mr-lineIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Cave (painterly, layered, animated) ────────────────────────

function CaveScene({ phase, pickedTint }) {
  const cameraScale =
    phase === 'approach' ? 1.0 :
    phase === 'shelf'    ? 1.4 :
    phase === 'wobble'   ? 1.7 :
    phase === 'hatch'    ? 1.9 :
    phase === 'meet'     ? 1.85 :
    phase === 'name'     ? 1.7 :
    phase === 'close'    ? 1.15 : 1.0;

  const cameraY =
    phase === 'approach' ? '0%' :
    phase === 'shelf'    ? '4%' :
    phase === 'wobble'   ? '6%' :
    phase === 'hatch'    ? '6%' :
    phase === 'meet'     ? '4%' :
    phase === 'name'     ? '2%' :
    phase === 'close'    ? '0%' : '0%';

  const lantern =
    phase === 'approach' ? 0.55 :
    phase === 'shelf'    ? 0.85 :
    phase === 'wobble'   ? 1.0 :
    phase === 'hatch'    ? 1.6 :
    phase === 'meet'     ? 1.15 :
    phase === 'name'     ? 1.0 : 0.9;

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 50% 65%, #1a0f08 0%, #050302 100%)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        transform: `scale(${cameraScale}) translateY(${cameraY})`,
        transformOrigin: '50% 60%',
        transition: 'transform 1800ms cubic-bezier(.65,.05,.36,1)',
      }}>
        <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice"
             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="mr-bgWarm" cx="50%" cy="65%" r="55%">
              <stop offset="0%" stopColor="#3a2310"/>
              <stop offset="50%" stopColor="#1c1108"/>
              <stop offset="100%" stopColor="#050302"/>
            </radialGradient>
            <radialGradient id="mr-lant" cx="50%" cy="58%" r="35%">
              <stop offset="0%"  stopColor={`rgba(252,211,77,${0.45 * lantern})`}/>
              <stop offset="40%" stopColor={`rgba(245,158,11,${0.18 * lantern})`}/>
              <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
            </radialGradient>
            <linearGradient id="mr-floorG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a2410"/>
              <stop offset="100%" stopColor="#0a0604"/>
            </linearGradient>
            <radialGradient id="mr-shelfG" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#5a3a20"/>
              <stop offset="100%" stopColor="#1c1108"/>
            </radialGradient>
          </defs>

          <rect width="400" height="700" fill="url(#mr-bgWarm)"/>

          {/* Side walls */}
          <path d="M0 0 L0 700 L70 700 Q40 500, 60 350 Q80 200, 30 90 Q20 40, 0 0 Z"
                fill="#1c1108" opacity="0.85"/>
          <path d="M400 0 L400 700 L330 700 Q360 500, 340 350 Q320 200, 370 90 Q380 40, 400 0 Z"
                fill="#1c1108" opacity="0.85"/>

          {/* Brush strokes */}
          <g opacity="0.4">
            <path d="M30 100 Q50 200, 35 300 Q20 400, 40 500" stroke="#2a1810" strokeWidth="2" fill="none"/>
            <path d="M50 50 Q70 180, 55 320" stroke="#3a2210" strokeWidth="1.5" fill="none"/>
            <path d="M360 80 Q345 220, 365 360" stroke="#2a1810" strokeWidth="2" fill="none"/>
            <path d="M375 150 Q360 280, 380 410" stroke="#3a2210" strokeWidth="1.5" fill="none"/>
          </g>

          {/* Floor */}
          <path d="M0 600 Q200 580, 400 600 L400 700 L0 700 Z" fill="url(#mr-floorG)"/>

          {/* Stone shelf */}
          <g style={{
            opacity: phase === 'approach' ? 0 : 1,
            transition: 'opacity 1400ms ease',
          }}>
            <ellipse cx="200" cy="430" rx="135" ry="14" fill="#0a0604" opacity="0.7"/>
            <path d="M65 420 Q200 405, 335 420 L335 445 Q200 455, 65 445 Z" fill="url(#mr-shelfG)"/>
            <path d="M65 420 Q200 405, 335 420" stroke="#7a4f28" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M120 430 L128 442" stroke="#0a0604" strokeWidth="1"/>
            <path d="M250 432 L255 440" stroke="#0a0604" strokeWidth="1"/>
          </g>

          <rect width="400" height="700" fill="url(#mr-lant)"/>

          {/* Lantern source */}
          <g style={{
            opacity: phase === 'approach' ? 0.6 : 1,
            transition: 'opacity 1400ms ease',
          }}>
            <circle cx="62" cy="180" r="3"  fill="#fef3c7"/>
            <circle cx="62" cy="180" r="14" fill="#fcd34d" opacity="0.18"/>
            <circle cx="62" cy="180" r="40" fill="#f59e0b" opacity="0.06"/>
          </g>
        </svg>

        {/* Floating dust motes */}
        {[...Array(18)].map((_, i) => {
          const seed = i * 47;
          return (
            <div key={i} style={{
              position: 'absolute',
              top:  `${20 + (seed % 60)}%`,
              left: `${10 + ((seed * 3) % 80)}%`,
              width: 1 + (i % 3), height: 1 + (i % 3),
              borderRadius: '50%',
              background: 'rgba(252,211,77,.35)',
              boxShadow: '0 0 4px rgba(252,211,77,.5)',
              animation: `mr-mote ${8 + (i % 5)}s ease-in-out infinite ${(i * 0.4) % 3}s`,
            }} />
          );
        })}
      </div>

      {/* Hatch flash */}
      {phase === 'hatch' && (
        <div key="flash" style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 55%, ${pickedTint || '#fef3c7'}cc 0%, transparent 50%)`,
          animation: 'mr-flash 1400ms ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes mr-mote {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50%      { transform: translateY(-12px) translateX(6px); opacity: 0.9; }
        }
        @keyframes mr-flash {
          0%   { opacity: 0; }
          18%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Egg ────────────────────────────────────────────────────────

function Egg({ tint, deep, size = 60, picked, dim, onTap, wobble, hatching }) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="Ei wählen"
      style={{
        background: 'transparent', border: 'none', padding: 0,
        cursor: onTap ? 'pointer' : 'default',
        position: 'relative',
        width: size, height: size * 1.28,
        opacity: dim ? 0.18 : 1,
        transform: picked ? `scale(${hatching ? 0 : 1.3})` : 'scale(1)',
        transition: hatching
          ? 'transform 900ms cubic-bezier(.7,0,.84,0), opacity 600ms ease'
          : 'transform 600ms ease, opacity 700ms ease',
        animation: wobble ? 'mr-eggWobble 1.4s ease-in-out infinite' : 'none',
        filter: picked
          ? 'drop-shadow(0 0 18px rgba(252,211,77,.7))'
          : 'drop-shadow(0 6px 10px rgba(0,0,0,.5))',
      }}
    >
      <svg viewBox="0 0 60 80" width={size} height={size * 1.28} style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`mr-eg-${tint.replace('#','')}`} cx="35%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9"/>
            <stop offset="18%"  stopColor={tint}/>
            <stop offset="65%"  stopColor={tint}/>
            <stop offset="100%" stopColor={deep} stopOpacity="0.6"/>
          </radialGradient>
        </defs>
        <ellipse cx="30" cy="42" rx="22" ry="34" fill={`url(#mr-eg-${tint.replace('#','')})`}/>
        <circle cx="22" cy="35" r="1.2" fill={deep} opacity="0.35"/>
        <circle cx="38" cy="48" r="1"   fill={deep} opacity="0.3"/>
        <circle cx="26" cy="58" r="1.4" fill={deep} opacity="0.4"/>
        <circle cx="35" cy="28" r="0.8" fill={deep} opacity="0.3"/>
        <ellipse cx="22" cy="28" rx="3" ry="6" fill="white" opacity="0.45"/>
      </svg>
      <style>{`
        @keyframes mr-eggWobble {
          0%, 100% { transform: rotate(-4deg); }
          50%      { transform: rotate(4deg); }
        }
      `}</style>
    </button>
  );
}

// ─── RonkiHatchlingWrapper — awakening scale + breathing animation ────
//
// Apr 2026 art-unification (Marc: "Ronki that hatches and Ronki getting
// taught firebreath aren't the same chibi but have to be"). The body
// is now MoodChibi (same primitive TeachBreathBeat uses), so the kid
// sees a continuous Ronki across the meet→teach handoff. This wrapper
// keeps the choreography that the old custom hatchling baked in:
//  · awakening: 0..1 — scale ramps from 0.4× to 1.0× over 900ms when
//    Ronki "wakes up" post-hatch (phase shifts from hatch → meet)
//  · breathe: gentle 3.4s breathing pulse once the chibi has settled
//  · drop-shadow with a variant-tinted glow so the egg's color carries
//    through visually on the hatchling
//
// Old custom-SVG hatchling deleted. EGG_VARIANTS still exports tint+deep
// for the egg artwork itself (the wobbling eggs on the shelf); the
// chibi colors come from MoodChibi's own palette via variant id.
function RonkiHatchlingWrapper({ children, awakening = 1, breathe = true, tint = '#fde68a' }) {
  return (
    <div style={{
      position: 'relative',
      transform: `scale(${0.4 + 0.6 * awakening})`,
      transition: 'transform 900ms cubic-bezier(.34,1.4,.64,1)',
      animation: breathe ? 'mr-ronkiBreathe 3.4s ease-in-out infinite' : 'none',
      filter: `drop-shadow(0 8px 14px rgba(0,0,0,.5)) drop-shadow(0 0 20px ${tint}88)`,
    }}>
      {children}
      <style>{`
        @keyframes mr-ronkiBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

// ─── Voice line + waveform ──────────────────────────────────────

function VoiceLine({ who, text }) {
  // who: 'Ronki' | null. Drachenmutter removed Apr 27 2026 — pre-hatch
  // beats now use who=null (storybook caption, no speaker eyebrow).
  const showSpeaker = who === 'Ronki';
  return (
    <div style={{
      position: 'absolute', bottom: 90, left: 28, right: 28,
      animation: 'mr-lineIn 800ms ease-out',
      pointerEvents: 'none', textAlign: 'center',
    }}>
      {showSpeaker && (
        <div style={{
          font: '700 9px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.32em', textTransform: 'uppercase',
          color: 'rgba(252,211,77,.7)',
          marginBottom: 8,
        }}>
          Ronki
        </div>
      )}
      <p style={{
        margin: 0,
        font: `400 ${showSpeaker ? 17 : 16}px/1.45 "Nunito", sans-serif`,
        fontStyle: 'italic',
        color: 'rgba(255,242,217,.92)',
      }}>
        {text}
      </p>
    </div>
  );
}

function Waveform({ active }) {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 3, alignItems: 'center', padding: '6px 12px',
      borderRadius: 999, background: 'rgba(0,0,0,.35)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      opacity: active ? 1 : 0, transition: 'opacity 400ms ease',
    }}>
      {[3,7,11,8,5,9,12,6,4].map((h, i) => (
        <div key={i} style={{
          width: 2, height: h, borderRadius: 1,
          background: 'rgba(252,211,77,.7)',
          animation: active ? `mr-wave 1s ease-in-out ${i * 0.08}s infinite` : 'none',
        }} />
      ))}
      <span style={{
        marginLeft: 6,
        font: '600 9px/1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '.18em', textTransform: 'uppercase',
        color: 'rgba(255,242,217,.6)',
      }}>spricht</span>
      <style>{`
        @keyframes mr-wave {
          0%, 100% { transform: scaleY(0.5); }
          50%      { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}
