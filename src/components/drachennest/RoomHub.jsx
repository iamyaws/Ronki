import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import { track } from '../../lib/analytics';
import MoodChibi, { ambientMood } from '../MoodChibi';
import VoiceAudio from '../../utils/voiceAudio';
import {
  PillButton,
  QuietLink,
  ChoiceTile,
  DoodleIcon,
  SceneLoop,
  StickerBurst,
  useReducedMotion,
} from '../bilderbuch';
import RonkiSpeechBubble from './RonkiSpeechBubble';
import { DepartureCard, TreasureCard, MoonCard } from './RoomHubBits';
import BeiRonkiSein from './BeiRonkiSein';
import FireBowl from './FireBowl';
import NowCard from './NowCard';
import TaskRow from './TaskRow';
import DepartureSheet from './DepartureSheet';
import AwayCard from './AwayCard';
import TreasureReveal from './TreasureReveal';
import GrowthBeat from './GrowthBeat';
import FeelingsSheet, { SIT_OFFER } from './FeelingsSheet';
import TreasureShelf from './TreasureShelf';
import { nestBeat, greetingFor, afternoonTasks, orderWithLater, byeLine } from './returnBeat';
import { now as clockNow } from '../../loop/clock';
import { stageOf } from '../../loop/growth';
import { lineText } from '../../data/ronkiLines';
import { taskAskLineId } from '../../data/taskKinds';
import { extrasOn, FEATURES } from '../../config/features';
import CaveStyleSheet from './CaveStyleSheet';

// Ronki-tap voice gate (Apr 2026 voice pass). Marc: "doesn't have to
// shoot for every tap but once in a while between tapping." Combined
// cooldown + probabilistic gate keeps Ronki vocal but not chatty.
const ROOM_TAP_VOICE_COUNT = 10; // de_room_tap_0 through de_room_tap_9
const ROOM_TAP_COOLDOWN_MS = 7000;

/** How often the Nest looks at the clock again (the trip clock also runs globally). */
const TICK_MS = 30000;
/** How long a passing line (greeting, "Oh, das wärmt!") stays before the context line returns. */
const PASSING_MS = 3600;
/**
 * The send-off sheet opens only after Ronki's "Mein Feuer ist ganz warm!
 * Jetzt kann ich losfliegen." has finished (KIDUX-5): the line starts
 * after any passing line (at least 400 ms in), runs about 3.9 s
 * (ffprobe of de_fire_full_morning_01.mp3), then a short breath. After
 * the last task that is about 2.4 + 3.9 + 0.4 = 6.7 s, so the stones'
 * spoken count never cuts the line.
 */
export const FIRE_FULL_LINE_MS = 3900;
const DEPARTURE_BREATH_MS = 400;
/** A child is "present" this long after a tap or a visible open (LOOP-3). */
export const PRESENCE_MS = 5 * 60 * 1000;
/** Hit area of the small header buttons (KIDUX-13). */
const HIT_PX = 48;
/** Ronki floats out of the room after "Tschüss". */
const FLOAT_OUT_MS = 1500;

/**
 * RoomHub, the Nest: the one home screen (Finch pass, 26 Sep 2026).
 *
 * Top to bottom: the header ("Hallo {Kind}!", the face button for
 * feelings, the small parent lock), the painted room with Ronki, his
 * bubble and his fire, the one loud item of the moment, the task row,
 * the treasure shelf, one quiet link. The state comes from the clock,
 * the fire and the trip (nestBeat in returnBeat.js):
 *
 *   fire       Jetzt card (task picture, "Geschafft", "Später"), task row
 *   departure  Ronki cheers, then the send-off sheet ("Tschüss, {Nick}!")
 *   stay       Ronki stays home in the day block; afternoon task if any
 *   away       the room without Ronki; his postcard
 *   waiting    Ronki back with a wrapped treasure ("Aufmachen")
 *   evening    the moon card into TonightRitual (loud when the fire is full)
 *   night      Ronki asleep in the night room; no card
 *
 * The room is the painted Seedance scene (loops/zuhause.mp4 with its
 * poster). Ronki is NOT baked into the video: he sits on top as a
 * cut-out (MoodChibi, bare) so he keeps reacting to moods and taps. A
 * copy of the poster clipped to the cushion's front rim is laid over his
 * ankles, so he sits IN the nest. The bubble is anchored above his head
 * from the same measured geometry.
 *
 * Kid words come from src/data/finchLines.de.json (lineText) and are
 * voiced with VoiceAudio.playLocalized(id); names are only in the text.
 */

// Poster geometry. The loop and its poster are 720 x 1280; every
// placement below is a fraction of that frame so Ronki lands on the
// cushion at any width. SCENE_POS_Y is the vertical object-position
// of the crop (0.34 keeps the sun and the whole cushion in view).
const POSTER_W = 720;
const POSTER_H = 1280;
const SCENE_POS_Y = 0.34;
const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;
const POSTER = `${ART}loops/zuhause-poster.webp`;
const LOOP = `${ART}loops/zuhause.mp4`;
const NIGHT_POSTER = `${ART}loops/nacht-poster.webp`;
const NIGHT_LOOP = `${ART}loops/nacht.mp4`;

// Ronki's square on the poster: centre x, bottom edge, width (fractions).
const RONKI_CX = 0.47;
const RONKI_BOTTOM = 0.75;
const RONKI_W = 0.62;
const RONKI_LEFT = RONKI_CX - RONKI_W / 2;
const RONKI_TOP = RONKI_BOTTOM - RONKI_W * (POSTER_W / POSTER_H);

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

/** The line Ronki says for the state the Nest is in (null: no bubble). */
function contextLineFor(beat, cardQuest) {
  switch (beat.mode) {
    case 'fire': return cardQuest ? taskAskLineId(cardQuest.id) : null;
    case 'departure': return 'fire_full_morning_01';
    case 'stay':
      // With a task on the card Ronki asks for it (KIDUX-12).
      if (cardQuest) return taskAskLineId(cardQuest.id) || (beat.firstDay ? 'fd_start_day_01' : 'home_stay_01');
      return beat.firstDay ? 'fd_start_day_01' : 'home_stay_01';
    case 'waiting': return beat.tripKind === 'night' ? 'trip_back_night_01' : 'trip_back_01';
    case 'evening': return beat.fire.total > 0 ? 'fire_full_evening_01' : 'eve_moon_01';
    default: return null;
  }
}

export default function RoomHub({ onNavigate, onOpenParental, onOpenTonight }) {
  const { state, actions } = useTask();
  const reduced = useReducedMotion();

  // The clock: look again every 30 s and when the app comes back.
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick(t => t + 1);
    const id = setInterval(bump, TICK_MS);
    const onVis = () => { if (typeof document === 'undefined' || !document.hidden) bump(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  const current = clockNow();
  const beat = nestBeat(state, current);
  const { mode, fire, block, today } = beat;

  const nick = state?.companionName || '';
  const kidName = state?.familyConfig?.childName || '';
  const vars = { nick, kind: kidName };
  const heroName = kidName || 'du';
  const variant = state?.companionVariant || 'forest';
  const stageIdx = getCatStage(state?.catEvo ?? 0);
  // Ronki never looks worried or sad on the Nest because of a gap.
  const rawMood = ambientMood(state?.ronkiMood);
  const mood = (state?.lastGapDays ?? 0) >= 2 && (rawMood === 'sad' || rawMood === 'tired') ? 'normal' : rawMood;

  // Overlays.
  const [showPresence, setShowPresence] = useState(false);
  const [showStyleSheet, setShowStyleSheet] = useState(false);
  const [feelings, setFeelings] = useState(null); // { askId, slot }
  const [showReveal, setShowReveal] = useState(false);
  const [departureOpen, setDepartureOpen] = useState(false);
  const [departureDismissed, setDepartureDismissed] = useState(false);
  const [growthDone, setGrowthDone] = useState(0);
  const [askAfterTreasure, setAskAfterTreasure] = useState(false);
  // After Traurig or Besorgt, "Bei Ronki sitzen" is the loud card for this open (spec R5).
  const [sitLoud, setSitLoud] = useState(false);

  // Growth: a stage the child has not seen yet (stageSeen written by markStageSeen).
  const stageNow = stageOf(state?.catEvo);
  const growthPending = typeof state?.stageSeen === 'number' && stageNow >= 2
    && stageNow > state.stageSeen && stageNow > growthDone;
  const showGrowth = growthPending && !showReveal;

  // The Jetzt card: the next task, "Später" moves one to the back, a
  // tap in the row picks one. Session only, nothing is stored.
  const [laterIds, setLaterIds] = useState([]);
  const [pickedId, setPickedId] = useState(null);
  // Afternoon tasks only from the day block on: while Ronki is off in
  // the morning the postcard is the only card, so the child can put the
  // tablet down before school (own read O3).
  const cardList = mode === 'fire'
    ? orderWithLater(fire.slots, laterIds)
    : (mode === 'stay' || mode === 'away') && block !== 'morning'
      ? orderWithLater(afternoonTasks(state?.quests), laterIds)
      : [];
  const cardQuest = cardList.find(q => q.id === pickedId) || cardList[0] || null;

  // Celebration and the flame that just lit.
  const [cheer, setCheer] = useState(false);
  const [justLit, setJustLit] = useState(-1);
  const [floatOut, setFloatOut] = useState(false);
  const floatTimer = useRef(null);

  // Ronki's bubble: a passing line (greeting, "Oh, das wärmt!") over the
  // line of the moment. Each line is spoken once when it appears.
  const [passing, setPassing] = useState(null);
  const passingTimer = useRef(null);
  const passingUntil = useRef(0);
  const sayPassing = useCallback((id, ms = PASSING_MS) => {
    if (!id) return;
    clearTimeout(passingTimer.current);
    passingUntil.current = Date.now() + ms;
    setPassing(id);
    VoiceAudio.playLocalized(id, 0);
    passingTimer.current = setTimeout(() => setPassing(null), ms);
  }, []);
  useEffect(() => () => {
    clearTimeout(passingTimer.current);
    clearTimeout(floatTimer.current);
  }, []);

  const overlayOpen = showPresence || showStyleSheet || !!feelings || showReveal || showGrowth || (mode === 'departure' && departureOpen);

  // Presence (LOOP-3): Ronki speaks by himself and the day's greeting is
  // used up only while the tab is visible and a child is there: a visible
  // open, a return to the tab, or a tap in the last few minutes. A Nest
  // left on overnight stays quiet when the clock alone changes the state;
  // the line waits in the bubble and is spoken when the child comes.
  const presentAtRef = useRef(-Infinity);
  const [presence, setPresence] = useState(0);
  useEffect(() => {
    const visible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';
    const mark = () => {
      if (!visible()) return;
      const t = Date.now();
      const stale = t - presentAtRef.current >= PRESENCE_MS;
      presentAtRef.current = t;
      // Re-render only when presence starts again, not on every tap.
      if (stale) setPresence(n => n + 1);
    };
    mark();
    const onVis = () => { if (visible()) mark(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointerdown', mark, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointerdown', mark);
    };
  }, []);
  const isPresent = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false;
    return Date.now() - presentAtRef.current < PRESENCE_MS;
  };

  // The return beat: the first Nest open of the day (spec 3.5). While a
  // treasure waits, Ronki's "Ich bin wieder da!" is the greeting, so the
  // day is marked greeted without a second line (KIDUX-11).
  const greetId = greetingFor(state, current);
  const greetDue = !!greetId && mode !== 'away' && mode !== 'night';
  // Holds the day key of the last greeting, so a Nest left open overnight
  // greets again the next morning (once a child is there).
  const greetedRef = useRef(null);
  useEffect(() => {
    if (!greetDue || greetedRef.current === today) return;
    if (!isPresent()) return;
    greetedRef.current = today;
    if (mode !== 'waiting') sayPassing(greetId);
    actions?.markGreeted?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greetDue, today, presence]);

  const contextId = contextLineFor(beat, cardQuest);
  const spokenRef = useRef(null);
  useEffect(() => {
    if (!contextId || overlayOpen) return;
    if (spokenRef.current === contextId) return;
    if (!isPresent()) return;
    spokenRef.current = contextId;
    VoiceAudio.playLocalized(contextId, Math.max(400, passingUntil.current - Date.now()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId, overlayOpen, presence]);

  const bubbleId = mode === 'away' ? null : (passing || contextId);
  const bubbleText = bubbleId ? lineText(bubbleId, vars) : '';

  // Ronki is back: a burst when the Nest first sees him waiting.
  const prevMode = useRef(mode);
  useEffect(() => {
    if (mode === 'waiting' && prevMode.current !== 'waiting') setCheer(true);
    if (mode !== 'departure') setDepartureOpen(false);
    prevMode.current = mode;
  }, [mode]);

  // The send-off sheet opens after his cheer.
  useEffect(() => {
    if (mode !== 'departure' || departureDismissed) return undefined;
    const lineStart = Math.max(400, passingUntil.current - Date.now());
    const t = setTimeout(() => setDepartureOpen(true), lineStart + FIRE_FULL_LINE_MS + DEPARTURE_BREATH_MS);
    return () => clearTimeout(t);
  }, [mode, departureDismissed]);

  // The once-a-day feelings ask, right after the treasure story in the evening (spec R5).
  useEffect(() => {
    if (!askAfterTreasure || showReveal || showGrowth) return;
    setAskAfterTreasure(false);
    if ((block === 'evening' || block === 'night') && state?.moodPM == null) {
      setFeelings({ askId: 'eve_mood_ask_01', slot: 'moodPM' });
    }
  }, [askAfterTreasure, showReveal, showGrowth, block, state?.moodPM]);

  const onTaskDone = (q) => {
    setCheer(true);
    setPickedId(null);
    setLaterIds(ids => ids.filter(id => id !== q.id));
    if (mode === 'fire') {
      setJustLit(fire.lit);
      sayPassing('fire_lit_01', 2400);
    }
  };

  const onTaskLater = (q) => {
    setPickedId(null);
    setLaterIds(ids => [...ids.filter(id => id !== q.id), q.id]);
    sayPassing('task_later_01', 2400);
  };

  const byeId = byeLine(current, state?.vacMode);
  const departedRef = useRef(false);
  const bye = (voiced) => {
    if (departedRef.current) return;
    departedRef.current = true;
    if (!voiced) VoiceAudio.playLocalized(byeId, 0);
    setDepartureOpen(false);
    setFloatOut(true);
    clearTimeout(floatTimer.current);
    floatTimer.current = setTimeout(() => setFloatOut(false), FLOAT_OUT_MS);
    actions?.departTrip?.('day');
  };
  useEffect(() => {
    if (mode === 'departure') departedRef.current = false;
  }, [mode]);

  // A new day while the Nest stays open (the tablet sat on it overnight):
  // everything that belongs to one day starts fresh (spec 2, Base 3).
  const dayRef = useRef(today);
  useEffect(() => {
    if (dayRef.current === today) return;
    dayRef.current = today;
    setDepartureDismissed(false);
    setDepartureOpen(false);
    setSitLoud(false);
    setLaterIds([]);
    setPickedId(null);
    setAskAfterTreasure(false);
    departedRef.current = false;
    spokenRef.current = null;
  }, [today]);

  // Into TonightRitual. Falls back to the old route when the host does
  // not pass onOpenTonight yet.
  const openTonight = () => {
    if (onOpenTonight) onOpenTonight();
    else onNavigate?.('tonight');
  };

  const openFeelings = () => setFeelings({ askId: 'mood_ask_01', slot: undefined });

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

  // Tap-Ronki reaction rotation (Marc 25 Apr 2026): six body moves,
  // every third tap escalates into one; every tap spawns a glyph.
  const [floatingHearts, setFloatingHearts] = useState([]);
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
    const glyphs = ['heart', 'sparkle', 'giggle'];
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    setFloatingHearts(prev => [...prev, { id, x, y, kind: glyph }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 950);

    // Telemetry: every companion-touch moment counts.
    track('companion.tap');

    // Voice, gated by cooldown and chance.
    const t = Date.now();
    if (t - voiceLastRef.current >= ROOM_TAP_COOLDOWN_MS && Math.random() < 0.34) {
      const idx = voiceIdxRef.current;
      voiceIdxRef.current = (idx + 1) % ROOM_TAP_VOICE_COUNT;
      VoiceAudio.playLocalized(`room_tap_${idx}`, 80);
      voiceLastRef.current = t;
    }

    // Body-reaction escalation every 3rd tap.
    if (tapCountRef.current % 3 === 0) {
      const moves = ['bounce', 'spin', 'wink', 'flameBurp', 'shake', 'wiggle'];
      reactionIdxRef.current = (reactionIdxRef.current + 1 + Math.floor(Math.random() * 2)) % moves.length;
      const move = moves[reactionIdxRef.current];
      setReaction(move);
      const dur = move === 'flameBurp' ? 1100 : move === 'spin' ? 950 : 900;
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = setTimeout(() => setReaction(null), dur);
    }
  };

  useEffect(() => () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
  }, []);

  const reactionAnim = reduced ? undefined
    : reaction === 'bounce'    ? 'rh-rk-bounce 0.85s ease-out'
    : reaction === 'spin'      ? 'rh-rk-spin 0.95s ease-in-out'
    : reaction === 'wink'      ? 'rh-rk-wink 0.8s ease-out'
    : reaction === 'flameBurp' ? 'rh-rk-burp 1.05s ease-out'
    : reaction === 'shake'     ? 'rh-rk-shake 0.85s ease-in-out'
    : reaction === 'wiggle'    ? 'rh-rk-wiggle 0.85s ease-in-out'
    : undefined;

  // Bubble anchor: just above Ronki's head, measured from the frame's
  // bottom so the bubble's own height never matters. The egg and the
  // baby draw smaller inside MoodChibi's square (0.78 and 0.82); the idle
  // loop is cropped like the stills, so both use the same 0.94.
  const artScale = stageIdx <= 0 ? 0.78 : stageIdx === 1 ? 0.82 : 1;
  const artHeight = RONKI_W * (POSTER_W / POSTER_H) * artScale * 0.94;
  const headTopPx = geo.offY + geo.drawnH * (RONKI_BOTTOM - artHeight);
  const bubbleBottom = Math.max(24, Math.round(geo.h - headTopPx + 30));

  const night = mode === 'night';
  const ronkiHome = mode !== 'away' && !night;
  const showCutout = ronkiHome || floatOut;
  const pauseScene = overlayOpen;
  const showFire = (mode === 'fire' || mode === 'departure' || mode === 'evening') && fire.total > 0;

  // Back with a treasure and at the send-off Ronki is happy, in his own
  // look (stage and egg): the Nest scene never shows the generic pose
  // art (Astra FC-05).
  const cutoutMood = mode === 'waiting' || mode === 'departure' ? 'happy' : mood;

  const loudSit = sitLoud && (mode === 'fire' || mode === 'stay' || mode === 'evening');
  const moonText = lineText('eve_moon_01', vars);

  return (
    <div
      className="relative bg-white text-ink"
      data-mode={mode}
      style={{ minHeight: '100dvh', paddingBottom: 110, overflow: 'hidden' }}
    >
      {/* Greeting, feelings face, parent lock */}
      <header className="relative z-10 flex items-center justify-between gap-3" style={{ padding: '12px 16px 8px' }}>
        <h1 className="bb-display text-ink min-w-0" style={{ fontSize: 30, margin: 0, overflowWrap: 'anywhere' }}>
          Hallo {heroName}!
        </h1>
        <div className="flex items-center shrink-0" style={{ gap: 6 }}>
          <button
            type="button"
            onClick={openFeelings}
            aria-label="Wie geht's dir?"
            data-testid="face-button"
            className="bb-press flex items-center justify-center rounded-full bg-paper"
            style={{ width: 52, height: 52, minWidth: HIT_PX, minHeight: HIT_PX, border: '2.5px solid var(--color-ink)' }}
          >
            <DoodleIcon name="heart" size={28} filled style={{ color: 'var(--color-ember)' }} />
          </button>
          {/* The lock looks small (40 px) but its hit area is 48 px. */}
          <button
            type="button"
            onClick={() => onOpenParental?.()}
            aria-label="Eltern-Bereich"
            data-testid="parent-lock"
            className="flex items-center justify-center bg-transparent"
            style={{ width: HIT_PX, height: HIT_PX, padding: 0, border: 0 }}
          >
            <span
              aria-hidden="true"
              className="flex items-center justify-center rounded-full bg-white text-ink-soft"
              style={{ width: 40, height: 40, border: '2px solid var(--color-ink-soft)' }}
            >
              <DoodleIcon name="lock" size={18} />
            </span>
          </button>
        </div>
      </header>

      {/* The room */}
      <section style={{ padding: '4px 16px 0' }}>
        <div
          ref={sceneRef}
          className="bb-frame relative w-full"
          data-testid="nest-scene"
          style={{ aspectRatio: '3 / 4', maxHeight: '62dvh', overflow: 'hidden' }}
        >
          {night ? (
            // Asleep: the night room has Ronki painted into his bed.
            <button
              type="button"
              onClick={() => sayPassing('away_sleep_01')}
              aria-label="Ronki schläft"
              data-testid="nest-asleep"
              style={{ position: 'absolute', inset: 0, background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <SceneLoop poster={NIGHT_POSTER} video={NIGHT_LOOP} objectPosition="50% 60%" paused={pauseScene} />
            </button>
          ) : (
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: geo.offX, top: geo.offY, width: geo.drawnW, height: geo.drawnH }}
            >
              <SceneLoop poster={POSTER} video={LOOP} priority objectPosition="50% 50%" paused={pauseScene} />

              {showCutout && (
                <>
                  {/* Ronki, a cut-out on the cushion. */}
                  <button
                    type="button"
                    onClick={ronkiHome ? tapRonki : undefined}
                    aria-label="Ronki streicheln"
                    data-testid="ronki-cutout"
                    tabIndex={ronkiHome ? 0 : -1}
                    className={floatOut && !ronkiHome ? (reduced ? 'rh-fade-out' : 'rh-float-out') : ''}
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
                    <div style={{ position: 'relative', width: '100%', height: '100%', animation: reactionAnim, transformOrigin: '50% 100%' }}>
                      <div style={{ width: '100%', height: '100%' }}>
                        <MoodChibi
                          size={100}
                          variant={variant}
                          stage={stageIdx}
                          mood={cutoutMood}
                          bare
                          animated={!pauseScene}
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
                </>
              )}
            </div>
          )}

          {/* Ronki's line, anchored above his head; tap to hear it again. */}
          {bubbleText && (
            <RonkiSpeechBubble
              text={bubbleText}
              voiceId={bubbleId}
              style={night ? { top: 12 } : { top: 'auto', bottom: bubbleBottom }}
            />
          )}

          {/* His fire, lower right. */}
          {showFire && (
            <div style={{ position: 'absolute', right: 10, bottom: 10, left: 10, display: 'flex', justifyContent: 'flex-end', zIndex: 9, pointerEvents: 'none' }}>
              <FireBowl lit={fire.lit} total={fire.total} justLit={justLit} />
            </div>
          )}

          <StickerBurst active={cheer} size={300} onDone={() => setCheer(false)} />
        </div>
      </section>

      {/* The one loud item of the moment, and what goes with it. */}
      <section className="flex flex-col" style={{ padding: '18px 16px 0', gap: 14 }}>
        {loudSit && (
          <PillButton full size="lg" icon="flame" data-loud="true" onClick={() => setShowPresence(true)}>
            Bei Ronki sitzen
          </PillButton>
        )}

        {mode === 'fire' && cardQuest && (
          <NowCard quest={cardQuest} onDone={onTaskDone} onLater={onTaskLater} loud={!loudSit} />
        )}

        {mode === 'departure' && (
          <DepartureCard label={`Tschüss, ${nick || 'Ronki'}!`} onBye={() => bye(false)} />
        )}

        {mode === 'stay' && (cardQuest ? (
          <NowCard quest={cardQuest} onDone={onTaskDone} onLater={onTaskLater} loud={!loudSit} />
        ) : !loudSit && (
          <PillButton full size="lg" icon="flame" data-loud="true" onClick={() => setShowPresence(true)}>
            Bei Ronki sitzen
          </PillButton>
        ))}

        {mode === 'away' && (
          <>
            <AwayCard now={current} eveningStart={state?.familyConfig?.eveningStart} />
            {cardQuest && <NowCard quest={cardQuest} onDone={onTaskDone} onLater={onTaskLater} loud={false} />}
          </>
        )}

        {mode === 'waiting' && <TreasureCard onOpen={() => setShowReveal(true)} />}

        {/* Only while the fire builds: at the send-off the fire is full,
            and on day 1 undone pictures under a full fire would read as
            tasks left over (GUARDRAILS-3). */}
        {mode === 'fire' && fire.slots.length > 0 && (
          <TaskRow slots={fire.slots} currentId={cardQuest?.id} onPick={id => setPickedId(id)} />
        )}

        {/* The way to bed is there from the evening start, at any fire
            level and while a treasure waits (spec 3.4, never earned). */}
        {(mode === 'evening' || ((mode === 'fire' || mode === 'waiting') && block === 'evening')) && (
          <MoonCard text={moonText} loud={mode === 'evening' && !loudSit} onOpen={openTonight} />
        )}

        {/* The quiet way to just be with him. */}
        {(mode === 'fire' || mode === 'evening' || (mode === 'stay' && cardQuest)) && !loudSit && (
          <div className="flex justify-center">
            <QuietLink onClick={() => setShowPresence(true)}>Bei Ronki sitzen</QuietLink>
          </div>
        )}
      </section>

      {/* Toys, only with the parent's Extras switch on. */}
      {extrasOn(state) && (
        <section style={{ padding: '16px 16px 0' }}>
          <ChoiceTile
            label="Spielzeug"
            doodle="star"
            filled
            doodleColor="var(--color-sun)"
            className="w-full"
            onClick={() => onNavigate?.('spiele')}
          />
        </section>
      )}

      {/* Einrichten: hidden behind FEATURES.roomStyle until the painted
          room can show a pick (the saved choice and the sheet stay). */}
      {FEATURES.roomStyle && (
        <section className="flex justify-center" style={{ padding: '16px 16px 0' }}>
          <PillButton tone="secondary" icon="scribble" onClick={() => setShowStyleSheet(true)} aria-label="Ronkis Zimmer einrichten">
            Einrichten
          </PillButton>
        </section>
      )}

      {/* The last treasures he brought home. */}
      <section style={{ padding: '18px 16px 0' }}>
        <TreasureShelf log={state?.expeditionLog} />
      </section>

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
        @keyframes rh-float-out {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-120%); opacity: 0; }
        }
        @keyframes rh-fade-out {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        .rh-float-out { animation: rh-float-out ${FLOAT_OUT_MS}ms ease-in forwards; pointer-events: none; }
        .rh-fade-out { animation: rh-fade-out ${FLOAT_OUT_MS}ms ease forwards; pointer-events: none; }
      `}</style>

      {mode === 'departure' && departureOpen && (
        <DepartureSheet
          nick={nick}
          now={current}
          eveningStart={state?.familyConfig?.eveningStart}
          byeLineId={byeId}
          catEvo={state?.catEvo}
          adventureCount={state?.adventureCount}
          variant={variant}
          onBye={() => bye(true)}
          onClose={() => { setDepartureOpen(false); setDepartureDismissed(true); }}
        />
      )}

      {showReveal && (
        <TreasureReveal onDone={() => { setShowReveal(false); setAskAfterTreasure(true); }} />
      )}

      {showGrowth && (
        <GrowthBeat stage={stageNow} onDone={() => setGrowthDone(stageNow)} />
      )}

      {feelings && (
        <FeelingsSheet
          askId={feelings.askId}
          slot={feelings.slot}
          now={current}
          onPick={(idx) => { if (SIT_OFFER.has(idx)) setSitLoud(true); }}
          onClose={() => setFeelings(null)}
          onSit={() => { setFeelings(null); setShowPresence(true); }}
        />
      )}

      {showStyleSheet && <CaveStyleSheet onClose={() => setShowStyleSheet(false)} />}

      {/* Presence moment: full-screen sit with Ronki. */}
      {showPresence && (
        <BeiRonkiSein
          onClose={() => {
            setShowPresence(false);
            // The sit took place: the offer after Traurig is used up (KIDUX-9).
            setSitLoud(false);
          }}
        />
      )}
    </div>
  );
}
