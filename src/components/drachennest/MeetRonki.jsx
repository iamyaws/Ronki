import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { track } from '../../lib/analytics';
import VoiceAudio from '../../utils/voiceAudio';
import MoodChibi, { RonkiArt } from '../MoodChibi';
import {
  ChoiceTile,
  DoodleIcon,
  MotionTicks,
  PaperCard,
  PillButton,
  SceneLoop,
  SpeechBubble,
  useReducedMotion,
} from '../bilderbuch';

/**
 * MeetRonki: the 60-second first-encounter beat, on the Bilderbuch art
 * (25 Sep 2026, lane B).
 *
 * The hatch beat of the rollout plan. One picture-book sequence:
 *
 *   approach  his room, empty cushion, the plants and the sun move
 *             (scenes/zuhause + loops/zuhause.mp4), a caption card.
 *   shelf     white page, four art eggs on ChoiceTiles, the kid taps one.
 *   wobble    the chosen egg sits on the cushion of the hatch poster and
 *             trembles (CSS on the still).
 *   hatch     loops/hatch.mp4 plays once over its poster and ends on
 *             loops/hatch-end.webp. Under reduced motion, or when play()
 *             is refused, the egg still shows egg-cracked and then the
 *             end frame with a short crossfade (the old 1.4 s beat).
 *   meet      Ronki peeks out of the shell and says his first line in a
 *             speech bubble.
 *   name      white page, Ronki asks for his name, one cobalt pill.
 *   close     Ronki says good night, tap anywhere to finish.
 *
 * Phases, timers, voice lines, analytics and the onComplete payload are
 * the ones of the previous version. The old six colourways collapse to
 * the four eggs; Ronki is always red-orange now. Each egg still writes
 * one of the existing companionVariant ids so the profile, the dev
 * `?variant=` shortcut and every other reader keep working.
 *
 * Voice files: de_meet_* (Ronki, Harry), see docs/voice/ronki-voicelines.md.
 */

const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;
const ROOM_POSTER = `${ART}scenes/zuhause.webp`;
const ROOM_LOOP = `${ART}loops/zuhause.mp4`;
const HATCH_POSTER = `${ART}loops/hatch-poster.webp`;
const HATCH_CLIP = `${ART}loops/hatch.mp4`;
const HATCH_END = `${ART}loops/hatch-end.webp`;

/**
 * The four eggs. `variant` is the companionVariant id written to state,
 * one of the six ids the rest of the app already accepts.
 */
export const EGGS = [
  { id: 'cream', variant: 'forest', label: 'Weiß' },
  { id: 'ember', variant: 'sunset', label: 'Rot' },
  { id: 'sun', variant: 'amber', label: 'Gelb' },
  { id: 'cobalt', variant: 'teal', label: 'Blau' },
];

/** Where the egg sits in loops/hatch-poster.webp (fractions of the frame). */
const POSTER = { w: 720, h: 1280 };
const EGG_ANCHOR = { cx: 0.485, cy: 0.522, box: 0.35 };

/** How long the hatch phase may take before we move on regardless. */
const HATCH_MAX_MS = 8000;

const LINES = {
  // Pre-hatch beats are silent captions: Ronki cannot speak from inside
  // the egg. 'who: null' renders a caption card instead of a bubble.
  approach: { who: null, text: 'Da hinten leuchtet etwas.' },
  shelf: { who: null, text: 'Welches Ei fühlt sich richtig an?' },
  wobble: { who: null, text: 'Eines zittert leicht.' },
  hatch: null,
  meet: { who: 'Ronki', text: 'Hallo. Ich hab auf dich gewartet. Glaub ich.' },
  name: { who: 'Ronki', text: 'Hm, wie soll ich heißen?' },
  close: { who: 'Ronki', text: 'Bis morgen. Versprochen.' },
};

export default function MeetRonki({ onComplete }) {
  useTask();
  const [phase, setPhase] = useState('approach');
  const [picked, setPicked] = useState(null);
  const [name, setName] = useState('');
  const [voiceKey, setVoiceKey] = useState(0);

  // Auto-advance through the phases the kid does not drive. Each branch
  // fires its matching line and returns a cleanup that stops the audio
  // if the phase shifts mid-playback.
  useEffect(() => {
    if (phase === 'approach') {
      const t = setTimeout(() => { setPhase('shelf'); setVoiceKey(v => v + 1); }, 3600);
      return () => clearTimeout(t);
    }
    if (phase === 'shelf') {
      return undefined;
    }
    if (phase === 'wobble') {
      const t = setTimeout(() => setPhase('hatch'), 1400);
      return () => clearTimeout(t);
    }
    if (phase === 'hatch') {
      // The clip's onEnded moves us on; this is the net under it.
      const t = setTimeout(() => { setPhase('meet'); setVoiceKey(v => v + 1); }, HATCH_MAX_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'meet') {
      VoiceAudio.playLocalized('meet_hello_01', 200);
      const t = setTimeout(() => { setPhase('name'); setVoiceKey(v => v + 1); }, 4500);
      return () => { clearTimeout(t); VoiceAudio.stop(); };
    }
    if (phase === 'name') {
      VoiceAudio.playLocalized('meet_namequest_01', 400);
      return () => VoiceAudio.stop();
    }
    if (phase === 'close') {
      // de_meet_close_01 is still queued; until it lands playLocalized
      // fails silently and the on-screen line carries the moment.
      VoiceAudio.playLocalized('meet_close_01', 600);
      return () => VoiceAudio.stop();
    }
    return undefined;
  }, [phase]);

  const pickEgg = (eggId) => {
    if (phase !== 'shelf') return;
    setPicked(eggId);
    setPhase('wobble');
    setVoiceKey(v => v + 1);
  };

  const hatched = useCallback(() => {
    setPhase(p => (p === 'hatch' ? 'meet' : p));
    setVoiceKey(v => v + 1);
  }, []);

  const confirmName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPhase('close');
    setVoiceKey(v => v + 1);
  };

  const finish = () => {
    if (!picked || !name.trim()) return;
    track('ronki.hatch');
    // completeOnboarding is intentionally NOT called here: TeachFireStep
    // runs after this surface and flips onboardingDone. See App.jsx
    // OnboardingChain.
    const egg = EGGS.find(e => e.id === picked);
    onComplete?.({ companionVariant: egg?.variant || 'forest', heroName: name.trim() });
  };

  const cur = LINES[phase];
  const onScene = phase === 'approach' || phase === 'wobble' || phase === 'hatch' || phase === 'meet';
  const onWhite = !onScene;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronki kennenlernen"
      className="bg-white text-ink"
      style={{ position: 'fixed', inset: 0, zIndex: 950, overflow: 'hidden' }}
    >
      {/* Approach: his room, alive. */}
      {phase === 'approach' && (
        <div className="absolute inset-0 mr-fade">
          <SceneLoop poster={ROOM_POSTER} video={ROOM_LOOP} objectPosition="50% 40%" priority />
        </div>
      )}

      {/* Wobble, hatch, meet: the egg on the cushion, then the clip. */}
      {(phase === 'wobble' || phase === 'hatch' || phase === 'meet') && picked && (
        <HatchStage egg={picked} phase={phase} onEnded={hatched} />
      )}

      {/* Shelf: the four eggs. */}
      {phase === 'shelf' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-5 mr-fade"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <h1 key={voiceKey} className="bb-display text-center text-3xl mb-8 mr-line-in" style={{ maxWidth: 300 }}>
            {LINES.shelf.text}
          </h1>
          <div className="grid grid-cols-2 gap-4" role="group" aria-label="Ei wählen">
            {EGGS.map((e, i) => (
              <ChoiceTile
                key={e.id}
                size="lg"
                label={e.label}
                aria-label={`Ei wählen: ${e.label}`}
                onClick={() => pickEgg(e.id)}
                className="mr-pop"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <RonkiArt
                  pose={`egg-${e.id}`}
                  size={64}
                  idle="bb-egg-wobble"
                  style={{ animationDelay: `${i * 0.45}s` }}
                />
              </ChoiceTile>
            ))}
          </div>
        </div>
      )}

      {/* Name and close: Ronki on white. */}
      {(phase === 'name' || phase === 'close') && (
        <div
          className="absolute inset-0 flex flex-col items-center px-6 mr-fade"
          style={{
            paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-sm">
            {cur && (
              <SpeechBubble key={voiceKey} side="bottom" size="lg" className="mr-line-in" style={{ maxWidth: 300 }}>
                {cur.text}
              </SpeechBubble>
            )}
            <MoodChibi stage={1} mood="normal" size={phase === 'close' ? 260 : 220} bare label="Ronki" />
          </div>

          {phase === 'name' && (
            <div className="w-full max-w-sm flex flex-col items-center gap-4 mr-line-in" style={{ animationDelay: '300ms' }}>
              <label htmlFor="mr-name" className="sr-only">Name für Ronki</label>
              <input
                id="mr-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 18))}
                placeholder="hier tippen"
                autoFocus
                autoComplete="off"
                className="w-full min-w-0 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-3 text-center font-headline font-semibold text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-cobalt"
                style={{ fontSize: 22, lineHeight: 1.2 }}
              />
              <PillButton full size="lg" onClick={confirmName} disabled={!name.trim()}>
                so soll er heißen
              </PillButton>
            </div>
          )}
        </div>
      )}

      {/* Captions for the silent beats, on the scene or the white page. */}
      {cur && cur.who === null && phase !== 'shelf' && (
        <Caption key={voiceKey} text={cur.text} />
      )}

      {/* Ronki's first line, above the shell. */}
      {phase === 'meet' && cur && (
        <div
          key={voiceKey}
          className="absolute left-0 right-0 flex justify-center px-6 mr-line-in"
          style={{ top: 'calc(14% + env(safe-area-inset-top, 0px))', pointerEvents: 'none' }}
        >
          <SpeechBubble side="bottom" size="lg" style={{ maxWidth: 300 }}>
            {cur.text}
          </SpeechBubble>
        </div>
      )}

      {/* "spricht" only while a voiced line plays. */}
      {(phase === 'meet' || phase === 'close') && <Speaking />}

      {phase === 'close' && (
        <button
          type="button"
          onClick={finish}
          aria-label="tippen zum schließen"
          className="absolute inset-0 flex items-end justify-center bg-transparent border-0 cursor-pointer"
          style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}
        >
          <span
            className="font-headline font-semibold text-lg text-cobalt mr-line-in"
            style={{ animationDelay: '3000ms', animationFillMode: 'backwards' }}
          >
            tippen zum schließen
          </span>
        </button>
      )}

      <style>{`
        @keyframes mr-lineIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes mr-fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes mr-pop {
          0% { opacity: 0; transform: scale(0.85); }
          70% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes mr-tremble {
          0%, 100% { transform: translate(-50%, -50%) rotate(-5deg); }
          25% { transform: translate(-50%, -50%) rotate(4deg); }
          50% { transform: translate(-50%, -50%) rotate(-4deg); }
          75% { transform: translate(-50%, -50%) rotate(5deg); }
        }
        @keyframes mr-crack {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          30% { transform: translate(-50%, -52%) rotate(-3deg); }
          60% { transform: translate(-50%, -50%) rotate(3deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
        .mr-line-in { animation: mr-lineIn 700ms ease-out backwards; }
        .mr-fade { animation: mr-fadeIn 500ms ease-out both; }
        .mr-pop { animation: mr-pop 500ms cubic-bezier(.34,1.4,.64,1) backwards; }
      `}</style>
    </div>
  );
}

/* Storybook caption: a paper card at the bottom, a little off straight. */
function Caption({ text }) {
  return (
    <div
      className="absolute left-0 right-0 flex justify-center px-6 mr-line-in"
      style={{ bottom: 'calc(36px + env(safe-area-inset-bottom, 0px))', pointerEvents: 'none' }}
    >
      <PaperCard tone="paper" pad="md" style={{ transform: 'rotate(-1deg)', maxWidth: 320 }}>
        <p className="bb-display text-center text-2xl m-0">{text}</p>
      </PaperCard>
    </div>
  );
}

/* Small "spricht" sticker while Ronki's voice plays. */
function Speaking() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-paper px-3 py-1.5 mr-fade"
      style={{ top: 'calc(14px + env(safe-area-inset-top, 0px))' }}
    >
      <DoodleIcon name="sound" size={20} />
      <span className="font-headline font-semibold text-base text-ink leading-none">spricht</span>
      <MotionTicks tone="sun" size={18} rotate={-20} />
    </div>
  );
}

/**
 * HatchStage: the hatch poster with the chosen egg on its cushion. Wobble
 * trembles the egg, hatch plays the one-shot clip, meet keeps the end
 * frame. Mounted from the wobble phase so the clip preloads while the
 * egg trembles.
 *
 * Rules: poster always there; the video is muted, playsInline, no loop,
 * fades in only once it plays; never mounted under reduced motion; a
 * refused play() or a video error falls back to the stills (chosen egg,
 * egg-cracked, end frame) on the old 1.4 s timing.
 */
function HatchStage({ egg, phase, onEnded }) {
  const reduced = useReducedMotion();
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const [mode, setMode] = useState(reduced ? 'still' : 'clip');
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [stillStep, setStillStep] = useState(0);
  const doneRef = useRef(false);
  const box = useCoverBox(stageRef, POSTER.w, POSTER.h);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setEnded(true);
    onEnded?.();
  }, [onEnded]);

  useEffect(() => {
    if (reduced) setMode('still');
  }, [reduced]);

  // Hatch, clip mode: play once. A refused play() drops to the stills.
  useEffect(() => {
    if (phase !== 'hatch' || mode !== 'clip') return undefined;
    const v = videoRef.current;
    if (!v) return undefined;
    v.muted = true;
    v.defaultMuted = true;
    let cancelled = false;
    const p = v.play?.();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { if (!cancelled) setMode('still'); });
    }
    return () => { cancelled = true; };
  }, [phase, mode]);

  // Hatch, still mode: crack, then the end frame, then move on.
  useEffect(() => {
    if (phase !== 'hatch' || mode !== 'still') return undefined;
    const a = setTimeout(() => setStillStep(1), 150);
    const b = setTimeout(() => setStillStep(2), 900);
    const c = setTimeout(finish, 1400);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, [phase, mode, finish]);

  useEffect(() => () => { videoRef.current?.pause?.(); }, []);

  const showEnd = ended || stillStep === 2 || phase === 'meet';
  const showChosen = !showEnd && !playing && stillStep === 0;
  const showCracked = !showEnd && mode === 'still' && stillStep === 1;
  const eggPx = box ? box.drawnH * EGG_ANCHOR.box : 0;
  const eggStyle = box
    ? {
        position: 'absolute',
        left: box.offX + box.drawnW * EGG_ANCHOR.cx,
        top: box.offY + box.drawnH * EGG_ANCHOR.cy,
        width: eggPx,
        height: eggPx,
        transform: 'translate(-50%, -50%)',
        transformOrigin: '50% 90%',
      }
    : { display: 'none' };
  const layer = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%' };

  return (
    <div ref={stageRef} className="absolute inset-0 overflow-hidden bg-paper mr-fade" aria-hidden="true">
      <img src={HATCH_POSTER} alt="" draggable={false} decoding="async" style={layer} />

      {mode === 'clip' && (
        <video
          ref={videoRef}
          src={HATCH_CLIP}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onEnded={finish}
          onError={() => setMode('still')}
          style={{ ...layer, opacity: playing ? 1 : 0, transition: 'opacity 350ms ease-out', pointerEvents: 'none' }}
        />
      )}

      <img
        src={HATCH_END}
        alt=""
        draggable={false}
        decoding="async"
        style={{ ...layer, opacity: showEnd ? 1 : 0, transition: 'opacity 320ms ease-out' }}
      />

      {/* The chosen egg on the cushion: trembles on wobble, covers the
          poster egg until the clip is really playing. */}
      {(showChosen || showCracked) && (
        <div
          style={{
            ...eggStyle,
            transition: 'opacity 300ms ease-out',
            animation: showCracked
              ? 'mr-crack 500ms ease-out both'
              : phase === 'wobble'
                ? 'mr-tremble 700ms ease-in-out infinite'
                : 'none',
          }}
        >
          <RonkiArt pose={showCracked ? 'egg-cracked' : `egg-${egg}`} size={eggPx || 1} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
}

/**
 * useCoverBox: where an image with object-fit cover actually lands
 * inside `ref`, so a cut-out can sit on a spot of the picture at any
 * viewport size.
 */
function useCoverBox(ref, imgW, imgH) {
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (!W || !H) return;
      const scale = Math.max(W / imgW, H / imgH);
      const drawnW = imgW * scale;
      const drawnH = imgH * scale;
      setBox({ drawnW, drawnH, offX: (W - drawnW) / 2, offY: (H - drawnH) / 2 });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, imgW, imgH]);
  return box;
}
