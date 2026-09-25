import React, { useEffect, useRef, useState } from 'react';
import { track } from '../../lib/analytics';
import VoiceAudio from '../../utils/voiceAudio';
import { SceneLoop, QuietLink, DoodleIcon, RonkiArt, useReducedMotion } from '../bilderbuch';

// Path to the lullaby audio. Royalty-free 4-bar loop, ~30s.
// File is not committed yet; Marc to drop in once curated. The
// component plays through best-effort and silently no-ops if the
// file is missing (fetch fails, audio element stays muted).
// Spec: gentle major-key acoustic, no vocals, no percussion, soft
// fade-in/out built into the file. Loops naturally during 'curtain'.
const LULLABY_SRC = '/audio/lullaby/tonight_lullaby_01.mp3';

const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;
const NACHT_POSTER = `${ART}loops/nacht-poster.webp`;
const NACHT_VIDEO = `${ART}loops/nacht.mp4`;

// The night ground of this moment. The night token deepened to the
// painted sky of loops/nacht-poster.webp (sampled from its top rows),
// so the ground above the scene and the scene meet without a seam.
const NIGHT_SKY = '#011551';

/**
 * TonightRitual: the bedtime ritual, "Schlaf gut." on the Bilderbuch
 * boards (25 Sep 2026).
 *
 * The whole moment sits on night blue. The scene is the painted
 * bedroom (loops/nacht.mp4 through SceneLoop: Ronki asleep, the
 * blanket breathing, the star lamp glowing). Above it, in the open
 * sky, one line from Ronki. One quiet way out. No counters.
 *
 * Phases (auto-advance unless noted, timings unchanged):
 *   enter   (2.4s, title fades in on the night ground)
 *   lookup  (4.4s, the bedroom fades in)
 *   story   (kid taps when ready, the story line fades in)
 *   curtain (12s, the room dims to night, stars come out, lullaby plays)
 *   black   (final state: sleeping Ronki, "Schlaf gut.", replay link)
 *
 * Voice lines, analytics events, the story pool and the lullaby are
 * the same as before the Bilderbuch pass.
 */

const STORY_LINES = [
  // BeiRonkiSein-bar bedtime stories. Soft, hedge-y, no em-dashes.
  // Rotation lives here for now; ParentalDashboard tooling for
  // adding family-specific lines is a v1.5 follow-up.
  'Heute hat ein Glühwürmchen mich gefragt, ob ich auch leuchten kann. Ich hab gesagt: noch nicht. Aber bald.',
  'Mama-Drache hat mir gezeigt, wie man die Sterne zählt, wenn man nicht einschlafen kann. Sie hat aber bei sechzehn aufgehört.',
  'Im Morgenwald war heute ein Reh. Es hat mich angeschaut, als wüsste es was, das ich nicht weiß.',
  'Heute morgen hat es nach Regen gerochen, obwohl es gar nicht geregnet hat. Komisch.',
  'Manchmal denk ich, der Mond schaut zurück. Glaubst du das auch?',
  'Ich hab heute eine Eichel gefunden, die wie ein Hut aussieht. Ich hab sie liegen lassen, falls eine Eule sie braucht.',
  'Weißt du was lustig ist, mein Schwanz war heute schneller wach als ich. Ich musste warten, bis der Rest mich einholt.',
  'Wenn ich die Augen zumache, seh ich manchmal noch das Feuer von unserem Lagerfeuer. Auch wenn es längst aus ist.',
  'Heute hat ein kleiner Wind durch die Höhle geschaut. Ich glaub er hat sich nur kurz ausgeruht.',
  'Wir haben heute viel zusammen erlebt, oder? Ich erinner mich an alles. Versprochen.',
];

function pickStory() {
  // Stable for the duration of one Tonight session: uses session
  // storage so a kid who taps "nochmal ansehen" sees a different
  // story instead of the same one twice. Falls back to index 0 if
  // storage is unavailable. Returns { text, idx } so the matching
  // audio file (de_tonight_story_<idx>) can play in lockstep.
  try {
    const recent = JSON.parse(window.sessionStorage.getItem('tonight_recent') || '[]');
    const fresh = STORY_LINES.map((_, i) => i).filter(i => !recent.includes(i));
    const pool = fresh.length > 0 ? fresh : STORY_LINES.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];
    const next = [...recent, idx].slice(-3);
    window.sessionStorage.setItem('tonight_recent', JSON.stringify(next));
    return { text: STORY_LINES[idx], idx };
  } catch {
    return { text: STORY_LINES[0], idx: 0 };
  }
}

// Height of the open sky above the scene. The story line lives here,
// clear of the window and the moon in the painting.
const SKY_BAND = 'clamp(200px, 36vh, 340px)';

export default function TonightRitual({ onClose }) {
  const [phase, setPhase] = useState('enter');
  const [tapped, setTapped] = useState(false);
  const [{ text: story, idx: storyIdx }] = useState(() => pickStory());
  // Guards the curtain to black auto-advance. Without it, replay()
  // mid-curtain (or repeated taps) would leave a dangling 12s timer
  // that fires `tonight.complete` again and yanks the kid back to
  // black during the second viewing. Cleared on tap, replay, unmount.
  const curtainTimerRef = useRef(null);
  const completeFiredRef = useRef(false);

  // Auto-advance into lookup, then story.
  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('lookup'), 2400);
      return () => clearTimeout(t);
    }
    if (phase === 'lookup') {
      const t = setTimeout(() => setPhase('story'), 4400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Telemetry: fire start once per mount.
  useEffect(() => { track('tonight.start'); }, []);

  // Voice: phase-keyed playback (Apr 2026 voice pass).
  // enter:   Drachenmutter "Heute Abend. Wir schauen kurz raus."
  // lookup:  Ronki "Komm. Wir setzen uns. Ich will dir was erzählen."
  // story:   Ronki tells the picked story (matched by index).
  // curtain: lullaby already wired via the Lullaby component.
  useEffect(() => {
    if (phase === 'enter') {
      VoiceAudio.playNarrator('tonight_intro_01', 600);
    } else if (phase === 'lookup') {
      VoiceAudio.playLocalized('tonight_invite_01', 200);
    } else if (phase === 'story') {
      VoiceAudio.playLocalized(`tonight_story_${storyIdx}`, 600);
    }
  }, [phase, storyIdx]);

  // Cleanup any pending curtain timer on unmount so an early dismiss
  // doesn't fire `tonight.complete` for a moment that didn't finish.
  useEffect(() => () => {
    if (curtainTimerRef.current) clearTimeout(curtainTimerRef.current);
  }, []);

  // ESC dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fireComplete = () => {
    if (completeFiredRef.current) return;
    completeFiredRef.current = true;
    track('tonight.complete');
  };

  const handleTap = () => {
    if (phase === 'story' && !tapped) {
      setTapped(true);
      setPhase('curtain');
      curtainTimerRef.current = setTimeout(() => {
        setPhase('black');
        fireComplete();
        curtainTimerRef.current = null;
      }, 12000);
    } else if (phase === 'curtain') {
      // Kid tapped early to skip the curtain. Cancel pending timer,
      // jump straight to black, fire complete once.
      if (curtainTimerRef.current) {
        clearTimeout(curtainTimerRef.current);
        curtainTimerRef.current = null;
      }
      setPhase('black');
      fireComplete();
    }
  };

  const replay = () => {
    if (curtainTimerRef.current) {
      clearTimeout(curtainTimerRef.current);
      curtainTimerRef.current = null;
    }
    completeFiredRef.current = false;
    setPhase('enter');
    setTapped(false);
  };

  // How much of the bedroom shows: none on the title card, all of it
  // while Ronki talks, dimming under the curtain, gone at the end.
  const sceneOpacity =
    phase === 'enter' ? 0 :
    phase === 'black' ? 0 : 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Heute Abend mit Ronki"
      onClick={handleTap}
      style={{
        position: 'fixed', inset: 0, zIndex: 950, overflow: 'hidden',
        background: NIGHT_SKY,
        cursor: phase === 'story' ? 'pointer' : 'default',
        // Kills the 300ms tap delay: important for the "tap when
        // ready" beat, which should feel immediate to a tired kid.
        touchAction: 'manipulation',
      }}
    >
      {/* The bedroom, under the open sky band. Top-anchored so the
          painted sky meets the ground; 55% keeps Ronki in view on
          short phones and on tablets alike. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, top: SKY_BAND,
          opacity: sceneOpacity,
          transition: 'opacity 1600ms ease',
        }}
      >
        <SceneLoop
          poster={NACHT_POSTER}
          video={NACHT_VIDEO}
          objectPosition="50% 55%"
          priority
          style={{ background: NIGHT_SKY }}
        />
        <NightFall active={phase === 'curtain'} />
      </div>

      <SkyStars phase={phase} />

      {phase === 'enter' && (
        <div
          className="text-center"
          style={{
            position: 'absolute', top: '38%', left: 24, right: 24,
            animation: 'tn-lineIn 1400ms ease',
          }}
        >
          <div className="bb-display text-white" style={{ fontSize: 40 }}>
            Heute Abend
          </div>
          <div
            className="font-body text-white"
            style={{ marginTop: 16, fontSize: 18, lineHeight: 1.45, fontWeight: 500 }}
          >
            wir schauen kurz raus, du und ich
          </div>
        </div>
      )}

      {phase === 'story' && <StoryLine text={story} />}

      <Lullaby active={phase === 'curtain'} />

      {phase === 'story' && !tapped && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0,
            bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
            display: 'flex', justifyContent: 'center',
            animation: 'tn-lineIn 1200ms ease 4000ms backwards',
          }}
        >
          {/* No onClick of its own: the tap bubbles to the dialog, which
              owns the story to curtain step (a second handler here would
              start a second curtain timer). */}
          <QuietLink tone="white">
            Tippen wenn du müde bist
          </QuietLink>
        </div>
      )}

      {phase === 'black' && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            padding: '24px',
            animation: 'tn-lineIn 2400ms ease 800ms backwards',
          }}
        >
          <RonkiArt pose="sleep" size={220} idle="bb-idle-slow" />
          <div className="bb-display text-white text-center" style={{ fontSize: 44, marginTop: 18 }}>
            Schlaf gut.
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 36 }}>
            <QuietLink
              tone="white"
              onClick={(e) => { e.stopPropagation(); replay(); }}
              style={{ touchAction: 'manipulation' }}
            >
              Nochmal
            </QuietLink>
            <QuietLink
              tone="white"
              onClick={(e) => { e.stopPropagation(); onClose?.(); }}
              style={{ touchAction: 'manipulation' }}
            >
              Schließen
            </QuietLink>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tn-lineIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes tn-twinkle {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(0.72); }
        }
        @keyframes tn-starIn {
          0%   { opacity: 0; transform: scale(0.4); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// Sun stars in the open sky band, so the flat ground reads as sky
// above the painted room. A slow twinkle (one small shrink every 4 to
// 6 seconds, full colour so the sun never turns muddy on the night),
// still under reduced motion.
const SKY_STAR_SPOTS = [
  { top: 4, left: 6, size: 12 }, { top: 9, left: 90, size: 15 },
  { top: 17, left: 4, size: 9 }, { top: 21, left: 93, size: 10 },
  { top: 27, left: 14, size: 14 }, { top: 30, left: 62, size: 9 },
  { top: 33, left: 36, size: 12 }, { top: 28, left: 84, size: 11 },
]

// The extra stars that come out one by one while the room dims. Kept
// clear of the middle, where the sleeping Ronki lands at the end.
const CURTAIN_STAR_SPOTS = [
  { top: 13, left: 22, size: 14 }, { top: 38, left: 8, size: 16 },
  { top: 15, left: 70, size: 12 }, { top: 44, left: 88, size: 10 },
  { top: 24, left: 44, size: 16 }, { top: 47, left: 6, size: 13 },
  { top: 6, left: 56, size: 11 }, { top: 58, left: 5, size: 12 },
  { top: 33, left: 86, size: 9 }, { top: 20, left: 30, size: 10 },
  { top: 50, left: 92, size: 14 }, { top: 8, left: 36, size: 9 },
]

function SkyStars({ phase }) {
  const reduced = useReducedMotion();
  const sky = phase === 'enter' ? 0 : 1;
  const curtain = phase === 'curtain' || phase === 'black';
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: sky, transition: 'opacity 1800ms ease' }}>
        {SKY_STAR_SPOTS.map((s, i) => (
          <Star key={`s${i}`} spot={s} style={reduced ? undefined : {
            animation: `tn-twinkle ${4 + (i % 3)}s ease-in-out ${(i * 0.7) % 3}s infinite`,
          }} />
        ))}
      </div>
      {curtain && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {CURTAIN_STAR_SPOTS.map((s, i) => (
            <Star
              key={`c${i}`}
              spot={s}
              style={reduced || phase === 'black' ? undefined : {
                // One new star about every 0.8 s across the 12 s curtain.
                animation: `tn-starIn 900ms ease-out ${600 + i * 800}ms backwards`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Star({ spot, style }) {
  return (
    <span
      style={{
        position: 'absolute', top: `${spot.top}%`, left: `${spot.left}%`,
        color: 'var(--color-sun)', lineHeight: 0,
        ...style,
      }}
    >
      <DoodleIcon name="star" size={spot.size} filled stroke={4} />
    </span>
  );
}

// ─── Nightfall over the room ─────────────────────────────────────

function NightFall({ active }) {
  // A flat night sheet that slowly covers the painted room during the
  // curtain, like a lamp being turned down. Colour only, no gradient.
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        background: NIGHT_SKY,
        opacity: active ? 0.72 : 0,
        transition: active ? 'opacity 10000ms linear' : 'opacity 600ms ease',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Story line ─────────────────────────────────────────────────

function StoryLine({ text }) {
  return (
    <div
      style={{
        position: 'absolute', left: 24, right: 24, top: 0,
        height: SKY_BAND,
        paddingTop: 'calc(28px + env(safe-area-inset-top, 0px))',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'tn-storyIn 2200ms ease forwards',
        pointerEvents: 'none',
        textAlign: 'center',
      }}
    >
      <span
        className="bb-hand inline-block rounded-[10px] bg-sun px-4 py-1.5 text-lg uppercase leading-none text-ink"
        style={{ transform: 'rotate(-3deg)', marginBottom: 16 }}
      >
        Ronki erzählt
      </span>
      <p
        className="bb-display text-white"
        style={{
          margin: 0,
          fontSize: 'clamp(20px, 5.6vw, 26px)',
          lineHeight: 1.28,
          fontWeight: 600,
          maxWidth: 440,
        }}
      >
        {text}
      </p>
      <style>{`
        @keyframes tn-storyIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Lullaby indicator ──────────────────────────────────────────

function Lullaby({ active }) {
  // Audio plays best-effort. If the lullaby file isn't yet committed,
  // play() rejects silently and the visual indicator still renders
  // (graceful degradation). The wave bars stop under reduced motion.
  const audioRef = useRef(null);
  const [, setAudioReady] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (active) {
      a.volume = 0.45;
      a.loop = true;
      // play() returns a promise on modern browsers; reject is fine
      // (file 404 / autoplay policy). We just won't have audio.
      a.play().then(() => setAudioReady(true)).catch(() => setAudioReady(false));
    } else {
      a.pause();
      a.currentTime = 0;
    }
  }, [active]);

  return (
    <>
      <audio ref={audioRef} src={LULLABY_SRC} preload="auto" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="font-headline font-semibold text-white"
        style={{
          position: 'absolute',
          top: 'calc(24px + env(safe-area-inset-top, 0px))',
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 10, alignItems: 'center', padding: '10px 18px',
          borderRadius: 999,
          border: '2.5px solid rgba(255,255,255,0.85)',
          background: NIGHT_SKY,
          fontSize: 16, lineHeight: 1,
          opacity: active ? 1 : 0, transition: 'opacity 800ms ease',
        }}
      >
        <span style={{ color: 'var(--color-sun)', lineHeight: 0 }}>
          <DoodleIcon name="sound" size={20} />
        </span>
        Schlaflied
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginLeft: 2 }}>
          {[6, 11, 8, 13, 7].map((h, i) => (
            <div key={i} style={{
              width: 3, height: h + 1, borderRadius: 2,
              background: 'var(--color-sun)',
              animation: active && !reduced ? `tn-lullawave 1.4s ease-in-out ${i * 0.12}s infinite` : 'none',
            }} />
          ))}
        </div>
        <style>{`
          @keyframes tn-lullawave {
            0%, 100% { transform: scaleY(0.4); }
            50%      { transform: scaleY(1.2); }
          }
        `}</style>
      </div>
    </>
  );
}
