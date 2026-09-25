import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import { track } from '../../lib/analytics';
import MoodChibi, { ambientMood } from '../MoodChibi';
import VoiceAudio from '../../utils/voiceAudio';
import {
  PillButton,
  SpeechBubble,
  ChoiceTile,
  PaperCard,
  DoodleIcon,
  SceneLoop,
  useReducedMotion,
} from '../bilderbuch';
import FeelingDoodle from '../JournalFeelings';
import RonkiSpeechBubble from './RonkiSpeechBubble';
import { SunCheck } from './RoomHubBits';
import Expedition from './Expedition';
import BeiRonkiSein from './BeiRonkiSein';
import CaveStyleSheet from './CaveStyleSheet';

// Ronki-tap voice gate (Apr 2026 voice pass). Marc: "doesn't have to
// shoot for every tap but once in a while between tapping." Combined
// cooldown + probabilistic gate keeps Ronki vocal but not chatty.
const ROOM_TAP_VOICE_COUNT = 10; // de_room_tap_0 through de_room_tap_9
const ROOM_TAP_COOLDOWN_MS = 7000;

/**
 * RoomHub, "Ronkis Zimmer": the home. Bilderbuch cut, 25 Sep 2026.
 *
 * The room is the painted Seedance scene (loops/zuhause.mp4 with its
 * poster; plants and sun move, the cushion stays still) inside the
 * drawn frame. Ronki is NOT baked into the video: he sits on top as a
 * cut-out through MoodChibi (bare, animated, mood and stage from
 * state) so he keeps reacting to moods and taps. A copy of the poster
 * clipped to the cushion's front rim is laid over his ankles, so he
 * sits IN the nest instead of on it. The speech bubble is anchored
 * above his head from the same measured geometry.
 *
 * Below the scene everything sits on white: Ronki's mood question as
 * choice tiles, one cobalt pill (sit with Ronki), the evening as a
 * night paper card, the day's asks as a paper card, the object tiles,
 * the mementos, and "Einrichten" as a secondary pill.
 *
 * Behaviour is unchanged: tap reactions and voice gate, mood pick,
 * expedition unlock, navigation targets, memento slots.
 */

// Poster geometry. The loop and its poster are 720 x 1280; every
// placement below is a fraction of that frame so Ronki lands on the
// cushion at any width. SCENE_POS_Y is the vertical object-position
// of the crop (0.34 keeps the sun and the whole cushion in view).
const POSTER_W = 720;
const POSTER_H = 1280;
const SCENE_POS_Y = 0.34;
/** The room style sheet waits until the painted room can show a pick. */
const SHOW_ROOM_STYLE = false;
const POSTER = `${import.meta.env.BASE_URL}art/bilderbuch/loops/zuhause-poster.webp`;
const LOOP = `${import.meta.env.BASE_URL}art/bilderbuch/loops/zuhause.mp4`;

// Ronki's square on the poster: centre x, bottom edge, width (fractions).
const RONKI_CX = 0.47;
const RONKI_BOTTOM = 0.75;
const RONKI_W = 0.62;
const RONKI_LEFT = RONKI_CX - RONKI_W / 2;
const RONKI_TOP = RONKI_BOTTOM - RONKI_W * (POSTER_W / POSTER_H);
const RONKI_HEAD = RONKI_TOP + 0.03 * RONKI_W * (POSTER_W / POSTER_H);

// The cushion's front rim, traced on the poster (x, y in poster px):
// the line where the blue front tufts meet the yellow seat. Everything
// below it is drawn again on top of Ronki.
const RIM_EDGE = [
  [0, 826], [40, 838], [80, 850], [120, 862], [160, 872], [200, 882], [240, 889],
  [280, 895], [320, 901], [360, 906], [400, 908], [440, 906], [480, 904], [520, 897],
  [560, 882], [600, 864], [640, 850], [680, 838], [720, 828],
];

function rimPath(scale) {
  const pts = RIM_EDGE.map(([x, y]) => `${(x * scale).toFixed(1)} ${(y * scale).toFixed(1)}`);
  const w = (POSTER_W * scale).toFixed(1);
  const h = (POSTER_H * scale).toFixed(1);
  return `M ${pts.join(' L ')} L ${w} ${h} L 0 ${h} Z`;
}

function sceneGeometry(w, h) {
  const scale = Math.max(w / POSTER_W, h / POSTER_H);
  const drawnW = POSTER_W * scale;
  const drawnH = POSTER_H * scale;
  return {
    scale,
    drawnW,
    drawnH,
    offX: (w - drawnW) / 2,
    offY: (h - drawnH) * SCENE_POS_Y,
    w,
    h,
  };
}

const ANCHOR_LABEL = {
  morning: 'Morgens',
  evening: 'Nachmittag',
  bedtime: 'Abends',
};

export default function RoomHub({ onNavigate }) {
  const { state, actions } = useTask();
  // The "Karte" tile and the window both open the Expedition surface.
  const [showExpedition, setShowExpedition] = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const [showStyleSheet, setShowStyleSheet] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const reduced = useReducedMotion();

  // "Wie geht's dir?" entry on the room (Marc, 25 Sep 2026, on Astra's
  // design review R3): the room stays the first thing a kid sees, and one
  // small sticker at its bottom edge leads to the full feelings picker
  // below. Tapping scrolls there, rings the tiles for a moment and puts
  // focus on the first one. No state change until a feeling is picked.
  const moodRef = useRef(null);
  const [moodNudge, setMoodNudge] = useState(false);
  const nudgeTimers = useRef([]);
  useEffect(() => () => nudgeTimers.current.forEach(clearTimeout), []);
  const openFeelings = () => {
    const el = moodRef.current;
    if (!el) return;
    // Focus first (without scrolling), then scroll: a delayed focus would
    // pull a keyboard user back to "Gut" after they already moved on
    // (Astra delta review R1).
    el.querySelector('button')?.focus?.({ preventScroll: true });
    el.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    nudgeTimers.current.forEach(clearTimeout);
    setMoodNudge(true);
    nudgeTimers.current = [setTimeout(() => setMoodNudge(false), 1600)];
  };

  const variant = state?.companionVariant || 'forest';
  const stageIdx = getCatStage(state?.catEvo ?? 0);
  const mood = ambientMood(state?.ronkiMood);
  const heroName = state?.familyConfig?.childName || state?.heroName || 'du';

  // Scene measurement: the frame's box decides how the poster is
  // drawn (cover), and Ronki, the rim and the bubble follow that.
  const sceneRef = useRef(null);
  const [box, setBox] = useState({ w: 358, h: 477 });
  useLayoutEffect(() => {
    const el = sceneRef.current;
    if (!el) return undefined;
    const measure = () => {
      if (sceneRef.current) {
        setBox({ w: sceneRef.current.clientWidth, h: sceneRef.current.clientHeight });
      }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const geo = sceneGeometry(box.w, box.h);


  const quests = state?.quests || [];
  const undoneByAnchor = ['morning', 'evening', 'bedtime'].map(anchor => {
    const items = quests.filter(q => q.anchor === anchor && !q.done);
    return { anchor, label: ANCHOR_LABEL[anchor], count: items.length };
  });
  const morningDone = quests.filter(q => q.anchor === 'morning').every(q => q.done) && quests.some(q => q.anchor === 'morning');
  const bedtimeDone = quests.filter(q => q.anchor === 'bedtime').every(q => q.done) && quests.some(q => q.anchor === 'bedtime');
  const expeditionUnlocked = morningDone && bedtimeDone;

  // Tap-Ronki reaction rotation (Marc 25 Apr 2026): six body moves,
  // every third tap escalates into one; every tap spawns a glyph.
  const reactionTimerRef = useRef(null);
  const [reaction, setReaction] = useState(null);
  const tapCountRef = useRef(0);
  const reactionIdxRef = useRef(0);
  // Voice: round-robin through the 10-line pool with a 7 s cooldown and
  // a 1-in-3 chance gate.
  const voiceLastRef = useRef(0);
  const voiceIdxRef = useRef(Math.floor(Math.random() * ROOM_TAP_VOICE_COUNT));

  const tapRonki = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    tapCountRef.current += 1;

    // Glyph burst on every tap.
    const variants = ['heart', 'sparkle', 'giggle'];
    const glyph = variants[Math.floor(Math.random() * variants.length)];
    setFloatingHearts(prev => [...prev, { id, x, y, kind: glyph }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 950);

    // Telemetry: every companion-touch moment counts.
    track('companion.tap');

    // Voice, gated by cooldown and chance.
    const now = Date.now();
    if (now - voiceLastRef.current >= ROOM_TAP_COOLDOWN_MS && Math.random() < 0.34) {
      const idx = voiceIdxRef.current;
      voiceIdxRef.current = (idx + 1) % ROOM_TAP_VOICE_COUNT;
      VoiceAudio.playLocalized(`room_tap_${idx}`, 80);
      voiceLastRef.current = now;
    }

    // Body-reaction escalation every 3rd tap.
    if (tapCountRef.current % 3 === 0) {
      const moves = ['bounce', 'spin', 'wink', 'flameBurp', 'shake', 'wiggle'];
      reactionIdxRef.current = (reactionIdxRef.current + 1 + Math.floor(Math.random() * 2)) % moves.length;
      const move = moves[reactionIdxRef.current];
      setReaction(move);
      // TODO(voiceline): per-reaction Ronki samples, see reference_voice_casting.md.
      const dur = move === 'flameBurp' ? 1100 : move === 'spin' ? 950 : 900;
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = setTimeout(() => setReaction(null), dur);
    }
  };

  useEffect(() => () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
  }, []);

  const reactionAnim =
    reaction === 'bounce'    ? 'rh-rk-bounce 0.85s ease-out'
    : reaction === 'spin'    ? 'rh-rk-spin 0.95s ease-in-out'
    : reaction === 'wink'    ? 'rh-rk-wink 0.8s ease-out'
    : reaction === 'flameBurp' ? 'rh-rk-burp 1.05s ease-out'
    : reaction === 'shake'   ? 'rh-rk-shake 0.85s ease-in-out'
    : reaction === 'wiggle'  ? 'rh-rk-wiggle 0.85s ease-in-out'
    : undefined;

  // Bubble anchor: just above Ronki's head, measured from the frame's
  // bottom so the bubble's own height never matters. The egg and the
  // baby draw smaller inside MoodChibi's square (0.78 and 0.82); the idle
  // loop is cropped like the stills, so both use the same 0.94.
  const artScale = stageIdx <= 0 ? 0.78 : stageIdx === 1 ? 0.82 : 1;
  const artHeight = RONKI_W * (POSTER_W / POSTER_H) * artScale * 0.94;
  const headTopPx = geo.offY + geo.drawnH * (RONKI_BOTTOM - artHeight);
  const bubbleBottom = Math.max(24, Math.round(geo.h - headTopPx + 30));

  return (
    <div
      className="relative bg-white text-ink"
      style={{ minHeight: '100dvh', paddingBottom: 110, overflow: 'hidden' }}
    >
      {/* Greeting */}
      <header
        className="relative z-10 flex items-end justify-between gap-3"
        style={{ padding: '12px 16px 8px' }}
      >
        <div className="min-w-0">
          <div className="bb-hand text-cobalt uppercase" style={{ fontSize: 18, letterSpacing: '0.04em', lineHeight: 1 }}>
            Ronkis Zimmer
          </div>
          <h1 className="bb-display text-ink" style={{ fontSize: 30, marginTop: 4 }}>
            Hallo {heroName}!
          </h1>
        </div>
        {/* "Wie geht's dir?" sits beside the greeting, outside the picture:
            always in the first view, never on Ronki or his bubble, on any
            screen height (review workflow, 25 Sep 2026: inside the frame it
            covered him on short phones). Its heart is not one of the answers. */}
        {state?.moodAM === null && (
          <button
            type="button"
            onClick={openFeelings}
            aria-label="Wie geht's dir? Gefühl aussuchen"
            className="bb-press shrink-0 flex items-center gap-2 font-headline font-semibold text-ink"
            style={{
              padding: '8px 14px 8px 10px',
              marginBottom: 4,
              borderRadius: 999,
              border: '2.5px solid var(--color-ink)',
              background: 'var(--color-paper)',
              fontSize: 17,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            <DoodleIcon name="heart" size={22} filled style={{ color: 'var(--color-ember)' }} />
            Wie geht's dir?
          </button>
        )}
      </header>

      {/* The room */}
      <section style={{ padding: '4px 16px 0' }}>
        <div
          ref={sceneRef}
          className="bb-frame relative w-full"
          style={{ aspectRatio: '3 / 4', maxHeight: '62dvh', overflow: 'hidden' }}
        >
          {/* Stage: the poster's drawn box. Everything inside shares
              the poster's coordinate system. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: geo.offX,
              top: geo.offY,
              width: geo.drawnW,
              height: geo.drawnH,
            }}
          >
            <SceneLoop poster={POSTER} video={LOOP} priority objectPosition="50% 50%" paused={showExpedition || showPresence || showStyleSheet} />

            {/* Ronki, a cut-out on the cushion. */}
            <button
              type="button"
              onClick={tapRonki}
              aria-label="Ronki streicheln"
              style={{
                position: 'absolute',
                left: `${RONKI_LEFT * 100}%`,
                top: `${RONKI_TOP * 100}%`,
                width: `${RONKI_W * 100}%`,
                aspectRatio: '1 / 1',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  animation: reactionAnim,
                  transformOrigin: '50% 100%',
                }}
              >
                {/* The loops are cropped like the stills (25 Sep 2026), so the
                    idle loop and the still draw Ronki at the same size. */}
                <div style={{ width: '100%', height: '100%' }}>
                  <MoodChibi
                    size={100}
                    variant={variant}
                    stage={stageIdx}
                    mood={mood}
                    bare
                    animated={!showExpedition && !showPresence && !showStyleSheet}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                {floatingHearts.map(h => (
                  <span
                    key={h.id}
                    aria-hidden="true"
                    className={h.kind === 'giggle' ? 'bb-hand' : ''}
                    style={{
                      position: 'absolute',
                      left: h.x,
                      top: h.y,
                      pointerEvents: 'none',
                      fontSize: 22,
                      color: 'var(--color-sun-deep)',
                      lineHeight: 1,
                      animation: 'rh-heart 0.95s ease-out forwards',
                      zIndex: 12,
                    }}
                  >
                    {h.kind === 'sparkle' ? (
                      <DoodleIcon name="sparkle" size={30} filled style={{ color: 'var(--color-sun)' }} />
                    ) : h.kind === 'giggle' ? (
                      'hihi'
                    ) : (
                      <DoodleIcon name="heart" size={30} filled style={{ color: 'var(--color-ember)' }} />
                    )}
                  </span>
                ))}
              </div>
            </button>

            {/* The cushion's front rim, drawn again over Ronki's ankles. */}
            <img
              src={POSTER}
              alt=""
              draggable={false}
              decoding="async"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                pointerEvents: 'none',
                zIndex: 3,
                clipPath: `path('${rimPath(geo.scale)}')`,
              }}
            />
          </div>

          {/* Ronki's line, anchored above his head. Tap to dismiss is
              wired inside the component. */}
          <RonkiSpeechBubble style={{ top: 'auto', bottom: bubbleBottom }} />
        </div>

      </section>

      {/* Ronki asks how the day feels; picking a mood hides it for the day. */}
      {state?.moodAM === null && (
        <RonkiMoodPrompt
          sectionRef={moodRef}
          highlight={moodNudge}
          heroName={heroName}
          variant={variant}
          stageIdx={stageIdx}
          onPick={(idx) => actions?.setMood?.('moodAM', idx)}
        />
      )}

      {/* Presence beat: the one primary action of the room. Free, no
          Sterne, no vital change; opens BeiRonkiSein. */}
      <section style={{ padding: '22px 16px 0' }}>
        <PillButton
          full
          size="lg"
          icon="flame"
          onClick={() => setShowPresence(true)}
          aria-label="Bei Ronki sein"
        >
          Bei Ronki sitzen
        </PillButton>
        <div className="bb-hand text-ink-soft text-center" style={{ fontSize: 17, marginTop: 8, lineHeight: 1 }}>
          ohne Sterne
        </div>

        {/* Heute Abend: the bedtime ritual as a night card. */}
        <PaperCard
          as="button"
          tone="night"
          pad="md"
          onClick={() => onNavigate?.('tonight')}
          aria-label="Heute Abend mit Ronki"
          className="w-full flex items-center gap-4"
          style={{ marginTop: 14 }}
        >
          <span className="flex items-center justify-center shrink-0" style={{ width: 52, height: 52, color: 'var(--color-sun)' }}>
            <DoodleIcon name="moon" size={44} filled />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="bb-display text-white" style={{ fontSize: 24 }}>Heute Abend</span>
            <span className="bb-hand" style={{ fontSize: 18, color: 'var(--color-sun)', marginTop: 4, lineHeight: 1 }}>mit Ronki</span>
          </span>
          <span className="ml-auto text-white shrink-0"><DoodleIcon name="arrow" size={22} stroke={7} /></span>
        </PaperCard>
      </section>

      {/* Adventure-ready card once the morning routine is complete. */}
      {morningDone && (state?.expedition?.state === 'home') && (
        <section style={{ padding: '14px 16px 0' }}>
          <PaperCard
            as="button"
            tone="sun"
            pad="md"
            lift
            onClick={() => {
              actions?.startExpedition?.();
              setShowExpedition(true);
            }}
            className="w-full flex items-center gap-4"
          >
            <span className="flex items-center justify-center shrink-0 text-ink" style={{ width: 52, height: 52 }}>
              <DoodleIcon name="leaf" size={44} />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="bb-hand text-ink uppercase" style={{ fontSize: 17, lineHeight: 1 }}>Ronki ist bereit</span>
              <span className="font-headline font-semibold text-ink" style={{ fontSize: 18, lineHeight: 1.25, marginTop: 4 }}>
                "Lass uns auf Abenteuer gehen, ich bringe dir was Schönes mit."
              </span>
            </span>
          </PaperCard>
        </section>
      )}

      {/* Ronki's asks today: the day strip, grouped by anchor. */}
      <section style={{ padding: '22px 16px 0' }}>
        <div className="bb-hand text-ink-soft uppercase" style={{ fontSize: 17, marginBottom: 8, paddingLeft: 4, lineHeight: 1 }}>
          Ronki bittet dich heute um Hilfe
        </div>
        <PaperCard tone="paper" pad="md" className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('aufgaben')}
            className="flex w-full items-center justify-between gap-3 bg-transparent border-0 p-0 text-left text-ink active:scale-[0.99] transition-transform"
            aria-label="Alle Aufgaben anzeigen"
          >
            <span className="bb-display" style={{ fontSize: 22 }}>Heute auf der Schriftrolle</span>
            <DoodleIcon name="arrow" size={22} stroke={7} />
          </button>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {undoneByAnchor.map(a => (
              <button
                key={a.anchor}
                type="button"
                onClick={() => onNavigate?.('aufgaben', { anchor: a.anchor })}
                aria-label={`${a.label}: ${a.count > 0 ? `${a.count} offen` : 'fertig'}`}
                className="flex flex-col items-center gap-1 rounded-[20px] border-[2.5px] border-ink bg-white text-ink active:scale-[0.96] transition-transform"
                style={{ padding: '10px 6px 9px' }}
              >
                <span className="font-headline font-semibold" style={{ fontSize: 16, lineHeight: 1 }}>{a.label}</span>
                {a.count > 0 ? (
                  <span className="bb-display" style={{ fontSize: 26, lineHeight: 1 }}>{a.count}</span>
                ) : (
                  <SunCheck size={30} />
                )}
                <span className="bb-hand text-ink-soft" style={{ fontSize: 16, lineHeight: 1 }}>
                  {a.count > 0 ? 'offen' : 'fertig'}
                </span>
              </button>
            ))}
          </div>
        </PaperCard>
      </section>

      {/* Object tiles: Spielzeug and Karte (the rest lives in the tab bar). */}
      <section className="grid gap-3" style={{ padding: '16px 16px 0', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <ChoiceTile
          label="Spielzeug"
          doodle="star"
          filled
          doodleColor="var(--color-sun)"
          className="w-full"
          onClick={() => onNavigate?.('spiele')}
        />
        <ChoiceTile
          label="Karte"
          doodle="leaf"
          filled={expeditionUnlocked}
          doodleColor={expeditionUnlocked ? 'var(--color-leaf)' : 'var(--color-ink)'}
          className="w-full"
          onClick={() => setShowExpedition(true)}
          aria-label={expeditionUnlocked ? 'Karte, Ronki ist startklar' : 'Karte'}
        />
      </section>

      {expeditionUnlocked && (
        <div style={{ padding: '12px 16px 0' }}>
          <PaperCard tone="sky-wash" pad="sm" className="text-center">
            <span className="font-headline font-semibold" style={{ fontSize: 17 }}>
              Ronki ist startklar für ein Abenteuer. Tipp auf <b>Karte</b>.
            </span>
          </PaperCard>
        </div>
      )}

      {/* Mementos from the expeditions, on paper tiles. */}
      <section style={{ padding: '16px 16px 0' }}>
        <Fundstuecke expeditionLog={state?.expeditionLog || []} />
      </section>

      {/* Einrichten: the room style sheet. Hidden since 25 Sep 2026: the
          painted room no longer repaints from state.caveStyle, so a pick
          would change nothing a kid can see. The saved choice and the
          sheet stay; flip SHOW_ROOM_STYLE when the room can show it. */}
      {SHOW_ROOM_STYLE && <section className="flex justify-center" style={{ padding: '16px 16px 0' }}>
        <PillButton
          tone="secondary"
          icon="scribble"
          onClick={() => setShowStyleSheet(true)}
          aria-label="Ronkis Zimmer einrichten"
        >
          Einrichten
        </PillButton>
      </section>}

      <style>{`
        @keyframes rh-heart {
          0%   { opacity: 0; transform: translate(-50%, 0) scale(0.6); }
          18%  { opacity: 1; transform: translate(-50%, -10px) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -70px) scale(0.85); }
        }
        @keyframes rh-rk-bounce {
          0%   { transform: translateY(0) scale(1); }
          25%  { transform: translateY(-6%) scale(1.04); }
          55%  { transform: translateY(2%) scale(0.98); }
          80%  { transform: translateY(-3%) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes rh-rk-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rh-rk-wink {
          0%   { transform: scale(1) rotate(0deg); }
          25%  { transform: scale(0.96, 1.02) rotate(-1deg); }
          55%  { transform: scale(1.02, 0.98) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes rh-rk-burp {
          0%   { transform: translateY(0) scale(1); }
          15%  { transform: translateY(2%) scale(0.94, 1.06); }
          35%  { transform: translateY(-3%) scale(1.08, 0.94); }
          60%  { transform: translateY(0) scale(1); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes rh-rk-shake {
          0%, 100% { transform: translateX(0); }
          15%      { transform: translateX(-3%); }
          30%      { transform: translateX(3%); }
          45%      { transform: translateX(-3%); }
          60%      { transform: translateX(3%); }
          75%      { transform: translateX(-2%); }
        }
        @keyframes rh-rk-wiggle {
          0%   { transform: scale(1) rotate(0deg); }
          25%  { transform: translateY(2%) scale(1.05, 0.95) rotate(-3deg); }
          50%  { transform: translateY(-2%) scale(0.95, 1.05) rotate(0deg); }
          75%  { transform: translateY(2%) scale(1.05, 0.95) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>

      {/* Karte + window: Expedition (Reise / Naturtagebuch surface). */}
      {showExpedition && <Expedition onClose={() => setShowExpedition(false)} />}

      {/* Presence moment: full-screen sit with Ronki. */}
      {showPresence && <BeiRonkiSein onClose={() => setShowPresence(false)} />}

      {/* Room style sheet (wallpaper and floor picks are kept in state;
          the painted room does not repaint from them any more). */}
      {showStyleSheet && <CaveStyleSheet onClose={() => setShowStyleSheet(false)} />}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

// Ronki asks how the day feels. Six feelings as choice tiles, drawn
// with the same FeelingDoodle as the Tagebuch and the Buch, so one
// feeling has one picture everywhere (Astra design review R7).
const MOODS = [
  { idx: 3, label: 'Gut' },
  { idx: 4, label: 'Magisch' },
  { idx: 2, label: 'Okay' },
  { idx: 0, label: 'Traurig' },
  { idx: 1, label: 'Besorgt' },
  { idx: 5, label: 'Müde' },
];

function RonkiMoodPrompt({ sectionRef, highlight = false, heroName, variant, stageIdx, onPick }) {
  return (
    <section ref={sectionRef} style={{ padding: '20px 16px 0', scrollMarginTop: 80 }}>
      <div className="flex items-end gap-3">
        <MoodChibi size={64} variant={variant} stage={stageIdx || 1} mood="normal" face />
        <div className="min-w-0 flex-1">
          <div className="bb-hand text-cobalt uppercase" style={{ fontSize: 17, lineHeight: 1, marginBottom: 6, marginLeft: 6 }}>
            Ronki fragt
          </div>
          <SpeechBubble side="left" tone="paper" rotate={0}>
            Wie geht's dir heute, {heroName}?
          </SpeechBubble>
        </div>
      </div>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          marginTop: 16,
          // A drawn cobalt ring for a moment after the room's entry is
          // tapped, so the eye lands on the tiles (no motion needed).
          borderRadius: 26,
          outline: highlight ? '3px solid var(--color-cobalt)' : '3px solid transparent',
          outlineOffset: 6,
          transition: 'outline-color 300ms ease-out',
        }}
        role="group"
        aria-label="Ronkis Frage beantworten"
      >
        {MOODS.map(m => (
          <ChoiceTile
            key={m.idx}
            label={m.label}
            className="w-full"
            style={{ minWidth: 0 }}
            onClick={() => onPick(m.idx)}
          >
            <FeelingDoodle idx={m.idx} size={44} />
          </ChoiceTile>
        ))}
      </div>
    </section>
  );
}

// Mementos from the Reise. The three most recent sit up front (a dimmed
// starter trio on day one so the row never looks broken); the decor
// slots that used to hang in the cave (4th, 7th and 10th memento) join
// the same row as the log grows.
const STARTER = ['🍂', '🪶', '🪨'];

function Fundstuecke({ expeditionLog }) {
  const log = expeditionLog || [];
  const recent = log.slice(-3).reverse();
  const front = [0, 1, 2].map(i => (recent[i] ? { emoji: recent[i].emoji, real: true } : { emoji: STARTER[i], real: false }));
  const extra = [log.length >= 4 ? log[3] : null, log.length >= 7 ? log[6] : null, log.length >= 10 ? log[9] : null]
    .filter(Boolean)
    .map(m => ({ emoji: m.emoji, real: true }));
  const items = [...front, ...extra];

  return (
    <PaperCard tone="paper" pad="md">
      <div className="flex items-center justify-between gap-3">
        <span className="bb-display" style={{ fontSize: 20 }}>Ronkis Fundstücke</span>
        <DoodleIcon name="bag" size={24} />
      </div>
      <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
        {items.map((it, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="inline-flex items-center justify-center rounded-full bg-white"
            style={{
              width: 52,
              height: 52,
              border: '2.5px solid var(--color-ink)',
              fontSize: 24,
              lineHeight: 1,
              opacity: it.real ? 1 : 0.45,
              filter: it.real ? 'none' : 'saturate(0.5)',
            }}
          >
            {it.emoji}
          </span>
        ))}
      </div>
    </PaperCard>
  );
}
