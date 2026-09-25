import React, { useEffect, useRef, useState } from 'react';
import { tripAllowed } from '../../loop/tripRules';
import { useTask } from '../../context/TaskContext';
import { track } from '../../lib/analytics';
import VoiceAudio from '../../utils/voiceAudio';
import { SceneLoop, QuietLink, DoodleIcon, useReducedMotion } from '../bilderbuch';
import MoodChibi from '../MoodChibi';
import { getCatStage } from '../../utils/helpers';
import { now as clockNow, dayKey } from '../../loop/clock';
import { fireOfBlock } from '../../loop/fire';
import { tripAt, tripById } from '../../data/trips';
import { lineText } from '../../data/ronkiLines';

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
 * Phases (all auto-advance; a tap moves on sooner):
 *   enter   (2.4s, title fades in on the night ground)
 *   lookup  (4.4s, the bedroom fades in)
 *   story   (the story line fades in; a tap, or about 15s)
 *   hook    (Finch pass: what comes next, about 6.5s or a tap)
 *   curtain (12s, the room dims to night, stars come out, lullaby plays)
 *   black   (sleeping Ronki, "Schlaf gut.", the way out; closes itself
 *            after about 20s so a tablet left on never keeps it up)
 *
 * Finch pass (26 Sep 2026, spec 3.4 and R3):
 *   - A close doodle works from the first frame (the census found no
 *     way out for 6.8 s). "Nochmal" is gone.
 *   - Before the curtain, one line about what comes next (tonightHook):
 *     after a trip today the next trip's hook ("Als Nächstes flieg ich
 *     zum Bach.", never a time word); with a full evening fire and no
 *     trip today the dream trip ("Heute Nacht flieg ich im Traum los.");
 *     otherwise "Schlaf gut. Ich bin hier im Nest."
 *   - The evening is done when the hook is shown: completeTonight() and,
 *     for the dream trip, departTrip('night') run as the promise is
 *     spoken, so closing during the hook or the lullaby keeps it
 *     (LOOP-2, KIDUX-2). Closing before the hook changes nothing.
 *   - After a trip that came back today, the story is today's trip story
 *     (its text and trip_story_NN voice), the same one the treasure told;
 *     the ten old lines are for days without one (own read O4).
 *   - At the end Ronki sleeps in his own look (MoodChibi with the child's
 *     stage and egg, tired), never the generic pose art (Astra FC-05).
 *
 * Voice lines, analytics events, the story pool and the lullaby are
 * the same as before the Bilderbuch pass.
 */

/** The ten bedtime stories. Index i matches public/audio/ronki/de_tonight_story_<i>.mp3. */
export const TONIGHT_STORIES = [
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

/**
 * The trip that came back today, or null. A day trip left today
 * (lastTripDate) and is back: its treasure waits, or it is on the shelf.
 * A trip still out, or a dream trip, is not today's story.
 */
export function todaysTrip(state, when) {
  if (!state || state.lastTripDate !== dayKey(when)) return null;
  const exp = state.expedition || { state: 'home' };
  if (exp.state === 'waiting') {
    if (exp.kind === 'night') return null;
    return tripById(exp.tripId || exp.pendingMemento?.tripId);
  }
  if (exp.state === 'home' || exp.state === 'leaving' || !exp.state) {
    const log = Array.isArray(state.expeditionLog) ? state.expeditionLog : [];
    const last = log[log.length - 1];
    if (!last || !last.ts || Number.isNaN(Date.parse(last.ts))) return null;
    if (dayKey(new Date(last.ts)) !== dayKey(when)) return null;
    return tripById(last.tripId);
  }
  return null;
}

/** The story of tonight: today's trip story, or one of the ten old lines. */
export function tonightStory(state, when) {
  const trip = todaysTrip(state, when);
  if (trip) return { text: trip.story, voice: trip.storyVoice };
  const { text, idx } = pickStory();
  return { text, voice: `tonight_story_${idx}` };
}

function pickStory() {
  // Stable for the duration of one Tonight session: uses session
  // storage so a kid who taps "nochmal ansehen" sees a different
  // story instead of the same one twice. Falls back to index 0 if
  // storage is unavailable. Returns { text, idx } so the matching
  // audio file (de_tonight_story_<idx>) can play in lockstep.
  try {
    const recent = JSON.parse(window.sessionStorage.getItem('tonight_recent') || '[]');
    const fresh = TONIGHT_STORIES.map((_, i) => i).filter(i => !recent.includes(i));
    const pool = fresh.length > 0 ? fresh : TONIGHT_STORIES.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];
    const next = [...recent, idx].slice(-3);
    window.sessionStorage.setItem('tonight_recent', JSON.stringify(next));
    return { text: TONIGHT_STORIES[idx], idx };
  } catch {
    return { text: TONIGHT_STORIES[0], idx: 0 };
  }
}

/**
 * The line before the curtain: what comes next. `dream` true means the
 * end of the ritual sends Ronki on his dream trip.
 */
export function tonightHook(state, when) {
  const today = dayKey(when);
  // The dream is promised only when the engine will really send him
  // (tripAllowed: one trip a day, 8 hours apart), never as a promise
  // departTrip would then ignore.
  const dreamOk = tripAllowed(state, 'night', when);
  if (state?.lastTripDate === today || (!dreamOk && state?.lastTripAt)) {
    const trip = tripAt((state?.tripCursor ?? 0) + (state?.expedition?.pendingMemento ? 1 : 0));
    return { id: trip.hookVoice, text: trip.hook, dream: false };
  }
  if (dreamOk && fireOfBlock(state || {}, 'evening', when).full) {
    return { id: 'night_trip_01', text: lineText('night_trip_01'), dream: true };
  }
  return { id: 'sleep_nest_01', text: lineText('sleep_nest_01'), dream: false };
}

const HOOK_MS = 6500;
/** The story moves to the hook by itself, for a child who cannot read the tap hint. */
export const STORY_MS = 15000;
/** The black end closes itself. */
export const BLACK_MS = 20000;

// Height of the open sky above the scene. The story line lives here,
// clear of the window and the moon in the painting.
const SKY_BAND = 'clamp(200px, 36vh, 340px)';

export default function TonightRitual({ onClose }) {
  const { state, actions } = useTask();
  const [phase, setPhase] = useState('enter');
  const [tapped, setTapped] = useState(false);
  // Decided once when the ritual opens, so a state change underneath
  // (the fire, a trip, the commit at the hook) cannot swap a line mid-way.
  const [{ text: story, voice: storyVoice }] = useState(() => tonightStory(state, clockNow()));
  const [hook] = useState(() => tonightHook(state, clockNow()));
  const [sleepLook] = useState(() => ({
    stage: getCatStage(state?.catEvo ?? 0),
    variant: state?.companionVariant || 'forest',
  }));
  const hookTimerRef = useRef(null);
  // Guards the curtain to black auto-advance. Without it, replay()
  // mid-curtain (or repeated taps) would leave a dangling 12s timer
  // that fires `tonight.complete` again and yanks the kid back to
  // black during the second viewing. Cleared on tap, replay, unmount.
  const curtainTimerRef = useRef(null);
  const completeFiredRef = useRef(false);
  const endTrackedRef = useRef(false);

  // Auto-advance into lookup, then story, then (untapped) the hook; the
  // black end closes itself.
  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('lookup'), 2400);
      return () => clearTimeout(t);
    }
    if (phase === 'lookup') {
      const t = setTimeout(() => setPhase('story'), 4400);
      return () => clearTimeout(t);
    }
    if (phase === 'story') {
      const t = setTimeout(() => enterHook(), STORY_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'black') {
      const t = setTimeout(() => onClose?.(), BLACK_MS);
      return () => clearTimeout(t);
    }
    return undefined;
    // enterHook and onClose belong to this mount; the phase drives it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      VoiceAudio.playLocalized(storyVoice, 600);
    } else if (phase === 'hook') {
      VoiceAudio.playLocalized(hook.id, 200);
    }
  }, [phase, storyVoice, hook.id]);

  // Cleanup any pending curtain timer on unmount so an early dismiss
  // doesn't fire `tonight.complete` for a moment that didn't finish.
  useEffect(() => () => {
    if (curtainTimerRef.current) clearTimeout(curtainTimerRef.current);
    if (hookTimerRef.current) clearTimeout(hookTimerRef.current);
  }, []);

  // ESC dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // The hook is shown: the evening is done, and a dream trip leaves now
  // (the promise was just spoken). Once per mount.
  const commitEvening = () => {
    if (completeFiredRef.current) return;
    completeFiredRef.current = true;
    actions?.completeTonight?.();
    if (hook.dream) actions?.departTrip?.('night');
  };

  // The ritual reached its end (analytics; the commit already ran). Once per mount.
  const fireComplete = () => {
    commitEvening();
    if (endTrackedRef.current) return;
    endTrackedRef.current = true;
    track('tonight.complete');
  };

  const startCurtain = () => {
    if (hookTimerRef.current) {
      clearTimeout(hookTimerRef.current);
      hookTimerRef.current = null;
    }
    setPhase('curtain');
    curtainTimerRef.current = setTimeout(() => {
      setPhase('black');
      fireComplete();
      curtainTimerRef.current = null;
    }, 12000);
  };

  // Story to hook, by a tap or by itself. Once per mount.
  const hookEnteredRef = useRef(false);
  function enterHook() {
    if (hookEnteredRef.current) return;
    hookEnteredRef.current = true;
    setTapped(true);
    setPhase('hook');
    commitEvening();
    hookTimerRef.current = setTimeout(startCurtain, HOOK_MS);
  }

  const handleTap = () => {
    if (phase === 'story' && !tapped) {
      enterHook();
    } else if (phase === 'hook') {
      startCurtain();
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

      {/* The way out, from the first frame. */}
      {phase !== 'black' && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          aria-label="Schließen"
          data-testid="tonight-close"
          className="flex items-center justify-center rounded-full text-white"
          style={{
            position: 'absolute', zIndex: 3,
            top: 'calc(12px + env(safe-area-inset-top, 0px))', right: 12,
            width: 48, height: 48,
            border: '2.5px solid rgba(255,255,255,0.85)', background: NIGHT_SKY,
            touchAction: 'manipulation',
          }}
        >
          <DoodleIcon name="close" size={22} />
        </button>
      )}

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
      {phase === 'hook' && <StoryLine text={hook.text} kicker={null} />}

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
          <div data-testid="tonight-sleep">
            <MoodChibi size={220} variant={sleepLook.variant} stage={sleepLook.stage} mood="tired" bare keepStage className="bb-idle-breathe" />
          </div>
          <div className="bb-display text-white text-center" style={{ fontSize: 44, marginTop: 18 }}>
            Schlaf gut.
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 36 }}>
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

function StoryLine({ text, kicker = 'Ronki erzählt' }) {
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
      {kicker && (
        <span
          className="bb-hand inline-block rounded-[10px] bg-sun px-4 py-1.5 text-lg uppercase leading-none text-ink"
          style={{ transform: 'rotate(-3deg)', marginBottom: 16 }}
        >
          {kicker}
        </span>
      )}
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
      // Some engines (and jsdom) return nothing from play().
      let p;
      try { p = a.play(); } catch { p = null; }
      if (p && typeof p.then === 'function') {
        p.then(() => setAudioReady(true)).catch(() => setAudioReady(false));
      }
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
