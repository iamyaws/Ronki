import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import RonkiAwayLoop from './RonkiAwayLoop';
import VoiceAudio from '../../utils/voiceAudio';
import { RonkiArt } from '../MoodChibi';
import {
  DoodleIcon,
  MotionTicks,
  PaperCard,
  PillButton,
  SceneLoop,
  SpeechBubble,
  StickerBurst,
  TopBar,
} from '../bilderbuch';

// ─── Voice (Apr 2026 voice pass) ──────────────────────────────────
// State-keyed Ronki narration. Each state entry fires one matching
// line; refs prevent re-fire on re-render. Pack/depart/browse pull
// from indexed pools so the kid hears a different take across days.
const KARTE_POOL_SIZE = 3;       // de_karte_0..2
const PACK_POOL_SIZE = 2;        // de_expedition_pack_01..02
const DEPART_POOL_SIZE = 2;      // de_expedition_depart_01..02
const BROWSE_POOL_SIZE = 5;      // de_expedition_browse_01..05
const BIOME_TO_VOICE = {
  morgenwald: 'expedition_arrive_morgenwald',
  forest:     'expedition_arrive_morgenwald',  // alias for forest chapter
  water:      'expedition_arrive_water',
  sky:        'expedition_arrive_sky',
  dream:      'expedition_arrive_dream',
  hearth:     'expedition_arrive_hearth',
};

function randPoolId(prefix, size, suffix1Indexed = false) {
  const i = Math.floor(Math.random() * size);
  return suffix1Indexed
    ? `${prefix}_${String(i + 1).padStart(2, '0')}`  // _01 / _02
    : `${prefix}_${i}`;                              // _0 / _1 / _2
}

const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;
const MORGENWALD = `${ART}scenes/morgenwald.webp`;

/**
 * Expedition: the Reise surface (Drachennest, 25 Apr 2026), on the
 * Bilderbuch art (25 Sep 2026, lane B).
 *
 * State machine (unchanged):
 *
 *   home    Ronki at the camp, ritual % visible, CTA hint.
 *   leaving Triggered when the morning ritual hits 100%. Walk-out
 *           animation (~2.5 s) carries Ronki off-frame, then we flip to
 *           'away' via rangerDeparted() which sets departedAt, returnAt
 *           and pendingMemento.
 *   away    Ronki gone. A polling effect checks every 30 s; once
 *           now > returnAt we flip to 'waiting' via rangerArrived().
 *   waiting Ronki returned. The diary sticker at the camp; tap opens
 *           the diary sheet. Closing it calls receiveMemento(), which
 *           pushes pendingMemento into the expeditionLog and resets the
 *           state to 'home'.
 *
 * The return beat: the Morgenwald behind, Ronki as a cut-out waving on
 * arrival with a sticker burst, the memento on a sun paper card, the
 * diary as paper.
 *
 * Dev affordance: ?expedition=home|leaving|away|waiting forces a state
 * for QA. DEV-only.
 */

export default function Expedition({ onClose }) {
  const { state, actions } = useTask();
  const expedition = state?.expedition || { state: 'home', biome: 'morgenwald' };
  const log = state?.expeditionLog || [];

  const [showDiary, setShowDiary] = useState(false);
  // Local "diary just received the bar fill" trigger so the progress
  // bar inside the diary sheet animates in after mount.
  const [diaryFillKey, setDiaryFillKey] = useState(0);

  // Dev URL param: force a state for QA. One-shot on mount.
  const devForcedRef = useRef(false);
  useEffect(() => {
    if (devForcedRef.current) return;
    if (typeof window === 'undefined' || !import.meta.env?.DEV) return;
    const p = new URLSearchParams(window.location.search).get('expedition');
    if (!p) return;
    devForcedRef.current = true;
    if (p === 'home') {
      actions.setExpedition?.({ state: 'home', biome: 'morgenwald' });
    } else if (p === 'leaving') {
      actions.setExpedition?.({ state: 'leaving', biome: 'morgenwald' });
    } else if (p === 'away') {
      actions.rangerDeparted?.();
    } else if (p === 'waiting') {
      // Force a return: depart, then arrive, then bypass the wait.
      actions.rangerDeparted?.();
      setTimeout(() => actions.rangerArrived?.(), 50);
    }
  }, [actions]);

  // ─── Voice: state-keyed Ronki narration ──
  // home:    Karte voice on first mount (kid is browsing the map)
  // leaving: pack voice (Ronki narrates packing) +
  //          depart voice 1.5 s later (synced with the walk-out anim)
  // away:    arrive voice (per biome) on first render of away state
  // waiting: return voice ("Ich bin wieder da. Schau, was ich gefunden hab.")
  const voiceFiredRef = useRef({ home: false, leaving: false, away: false, waiting: false });
  useEffect(() => {
    const s = expedition.state;
    if (s === 'home' && !voiceFiredRef.current.home) {
      voiceFiredRef.current.home = true;
      VoiceAudio.playLocalized(randPoolId('karte', KARTE_POOL_SIZE), 600);
    } else if (s === 'leaving' && !voiceFiredRef.current.leaving) {
      voiceFiredRef.current.leaving = true;
      VoiceAudio.playLocalized(randPoolId('expedition_pack', PACK_POOL_SIZE, true), 200);
      // Depart line lands as Ronki actually walks off (~1.6 s in).
      const t = setTimeout(() => {
        VoiceAudio.playLocalized(randPoolId('expedition_depart', DEPART_POOL_SIZE, true), 0);
      }, 1600);
      return () => clearTimeout(t);
    } else if (s === 'away' && !voiceFiredRef.current.away) {
      voiceFiredRef.current.away = true;
      const biomeId = expedition.biome || 'morgenwald';
      const baseId = BIOME_TO_VOICE[biomeId] || 'expedition_arrive_morgenwald';
      VoiceAudio.playLocalized(baseId, 400);
      // Browse line plays a few seconds after arrival.
      const t = setTimeout(() => {
        VoiceAudio.playLocalized(randPoolId('expedition_browse', BROWSE_POOL_SIZE, true), 0);
      }, 5000);
      return () => clearTimeout(t);
    } else if (s === 'waiting' && !voiceFiredRef.current.waiting) {
      voiceFiredRef.current.waiting = true;
      VoiceAudio.playLocalized('expedition_return_01', 400);
    }
    return undefined;
  }, [expedition.state, expedition.biome]);

  // 'leaving' → 'away' transition: the walk-out animation runs ~2.4 s,
  // then we hand off to the reducer. Guarded so re-renders during the
  // animation do not double-trigger.
  const departingRef = useRef(false);
  useEffect(() => {
    if (expedition.state !== 'leaving') {
      departingRef.current = false;
      return undefined;
    }
    if (departingRef.current) return undefined;
    departingRef.current = true;
    const t = setTimeout(() => {
      actions.rangerDeparted?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [expedition.state, actions]);

  // 'away' → 'waiting' poll: every 30 s, check if now > returnAt.
  useEffect(() => {
    if (expedition.state !== 'away') return undefined;
    const tick = () => {
      const target = expedition.returnAt ? new Date(expedition.returnAt).getTime() : 0;
      if (target && Date.now() >= target) {
        actions.rangerArrived?.();
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [expedition.state, expedition.returnAt, actions]);

  const morningQuests = (state?.quests || []).filter(q => q.anchor === 'morning');
  const morningDone = morningQuests.filter(q => q.done).length;
  const morningTotal = morningQuests.length;
  const morningPct = morningTotal > 0 ? Math.round((morningDone / morningTotal) * 100) : 0;
  const ritualDone = morningTotal > 0 && morningDone === morningTotal;

  // Status card copy per state. Mirrors the spec's CAMP_STATES table.
  const statusByState = {
    home:    { icon: 'leaf', title: '',                          sub: '' },
    leaving: { icon: 'bag',  title: 'Ronki packt den Rucksack.', sub: 'Bis zum Nachmittag' },
    away:    { icon: 'leaf', title: 'Ronki ist im Morgenwald.',  sub: returnLabel(expedition.returnAt) },
    waiting: { icon: 'book', title: 'Ronki ist zurück.',         sub: 'Er hat etwas mitgebracht' },
  };
  const status = statusByState[expedition.state] || statusByState.home;

  const titleByState = {
    home:    'Guten Morgen.',
    leaving: 'Bis zum Nachmittag.',
    away:    'Ronki ist unterwegs.',
    waiting: 'Etwas Neues wartet.',
  };

  const ctaSubByState = {
    home:    'Wenn fertig, zieht Ronki los',
    leaving: 'Ronki ist gleich unterwegs',
    away:    'Das Ritual ist fertig',
    waiting: 'Tipp auf die Seite',
  };

  const openDiary = () => { setShowDiary(true); setDiaryFillKey(k => k + 1); };
  const ctaLabel =
    expedition.state === 'waiting' ? 'Tagebuch öffnen' :
    expedition.state === 'home' && !ritualDone ? 'Zur Schriftrolle' :
    'Ronki ist unterwegs';
  const ctaIdle = expedition.state === 'away' || expedition.state === 'leaving';

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-white text-ink font-body"
      style={{ zIndex: 80, WebkitOverflowScrolling: 'touch' }}
    >
      {/* This surface covers the alpha banner, so the bar pins at 0, not
          at the banner offset the shared TopBar assumes. */}
      <TopBar sticky title="Ronkis Reise" onBack={onClose} backLabel="Zurück ins Zimmer" className="bg-white" style={{ top: 0 }} />

      {/* The camp scene. Away swaps to the drifting loop. */}
      <ExpeditionScene
        expState={expedition.state}
        biome={expedition.biome}
        variant={state?.companionVariant}
        discovered={state?.micropediaDiscovered || []}
        onTapDiary={openDiary}
        status={status}
      />

      {/* Below the picture */}
      <section className="px-5 pt-5 pb-10 max-w-lg mx-auto">
        <div className="text-center mb-5">
          <p className="bb-hand text-xl text-cobalt mb-1">Lagerfeuer</p>
          <h2 className="bb-display text-3xl">{titleByState[expedition.state]}</h2>
        </div>

        {/* Ritual row */}
        <PaperCard tone="paper" pad="sm" className="flex items-center gap-3 mb-4">
          <span
            aria-hidden="true"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink ${ritualDone ? 'bg-sun text-ink' : 'bg-white text-ink'}`}
          >
            <DoodleIcon name={ritualDone ? 'check' : 'sun'} size={28} stroke={6.5} />
          </span>
          <span className="flex-1 min-w-0">
            <b className="block font-headline font-semibold text-lg leading-tight">Morgen-Ritual</b>
            <span className="block text-base text-ink-soft mt-0.5">
              {morningTotal === 0
                ? 'Heute keine Aufgaben'
                : `${morningDone} von ${morningTotal} Aufgaben${ritualDone ? ' · erledigt' : ''}`}
            </span>
          </span>
          <span className={`shrink-0 rounded-full border-[2.5px] border-ink px-3 py-1 font-headline font-bold text-base ${ritualDone ? 'bg-sun' : 'bg-white'}`}>
            {morningPct}%
          </span>
        </PaperCard>

        {/* CTA: idle while Ronki is out, the diary once he is back */}
        <PillButton
          full
          size="lg"
          arrow={!ctaIdle}
          icon={expedition.state === 'waiting' ? 'book' : undefined}
          disabled={ctaIdle}
          onClick={() => {
            if (expedition.state === 'waiting') openDiary();
            else if (expedition.state === 'home') onClose?.();
          }}
        >
          {ctaLabel}
        </PillButton>
        <p className="text-center text-base text-ink-soft mt-2 mb-6">{ctaSubByState[expedition.state]}</p>

        {/* Naturtagebuch: the mementos shelf and recent pages */}
        <Naturtagebuch log={log} expedition={expedition} />
      </section>

      {/* Diary sheet */}
      {showDiary && expedition.pendingMemento && (
        <DiaryModal
          key={diaryFillKey}
          memento={expedition.pendingMemento}
          totalCollected={log.length + 1}
          onClose={() => {
            setShowDiary(false);
            actions.receiveMemento?.();
          }}
        />
      )}

      {/* Dev affordance: state cycler for QA. Opt in with ?devCycler=1
          or ?expedition=… Hidden in prod always. */}
      {import.meta.env?.DEV && typeof window !== 'undefined' && (() => {
        const params = new URLSearchParams(window.location.search);
        if (!params.get('devCycler') && !params.get('expedition')) return null;
        return <DevStateCycler current={expedition.state} actions={actions} />;
      })()}

      <style>{`
        @keyframes exp-walk {
          0%   { transform: translateX(-50%) translateY(0); opacity: 1; }
          20%  { transform: translateX(-46%) translateY(-6px); }
          45%  { transform: translateX(-20%) translateY(0); opacity: 1; }
          70%  { transform: translateX(40%) translateY(-6px); opacity: 0.9; }
          100% { transform: translateX(120%) translateY(0); opacity: 0; }
        }
        @keyframes exp-sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes exp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .exp-walk-out { animation: exp-walk 2.4s cubic-bezier(0.5, 0, 0.5, 1) forwards; }
      `}</style>
    </div>
  );
}

// ─── The camp scene ─────────────────────────────────────────────

function ExpeditionScene({ expState, biome, variant, discovered, onTapDiary, status }) {
  const showStatus = expState !== 'home';
  const walking = expState === 'leaving';
  const [burst, setBurst] = useState(false);

  // The arrival celebration: one sticker burst when Ronki is back.
  useEffect(() => {
    setBurst(expState === 'waiting');
  }, [expState]);

  const speech =
    expState === 'home' ? 'Ich bin heute voller Vorfreude.' :
    expState === 'leaving' ? 'Ich schnapp mir meinen Rucksack. Bis zum Nachmittag.' :
    expState === 'waiting' ? 'Ich hab dir was mitgebracht. Willst du es sehen?' :
    null;

  return (
    <div className="relative w-full overflow-hidden bg-sky-wash" style={{ height: 'min(52vh, 440px)', minHeight: 320 }}>
      {expState === 'away' ? (
        <RonkiAwayLoop biome={biome} variant={variant} discovered={discovered} />
      ) : (
        <>
          <Morgenwald />

          {/* Ronki, a cut-out at the camp. Leaving jumps once and walks off. */}
          <div
            aria-hidden="true"
            className={`absolute ${walking ? 'exp-walk-out' : ''}`}
            style={{ left: '50%', bottom: 8, transform: 'translateX(-50%)', width: 'min(56%, 230px)', aspectRatio: '1 / 1' }}
          >
            <RonkiArt
              pose={walking ? 'cheer' : 'wave'}
              animated={walking}
              size={230}
              idle={walking ? '' : 'bb-idle-breathe'}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* His line */}
          {speech && (
            <div
              className="absolute left-4 right-4 flex justify-center"
              style={{ top: showStatus ? 92 : 18, pointerEvents: 'none', animation: 'exp-fade-in 0.4s ease' }}
            >
              <SpeechBubble side="bottom" tone="white" style={{ maxWidth: 300 }}>
                {speech}
              </SpeechBubble>
            </div>
          )}

          {/* The diary, back with him */}
          {expState === 'waiting' && (
            <button
              type="button"
              onClick={onTapDiary}
              aria-label="Tagebuch öffnen"
              className="absolute flex flex-col items-center gap-1 rounded-[20px] border-[2.5px] border-ink bg-sun px-3 py-2 bb-idle-bob"
              style={{ left: 14, bottom: 18, transform: 'rotate(-6deg)' }}
            >
              <DoodleIcon name="book" size={30} />
              <span className="font-headline font-bold text-base leading-none">Tagebuch</span>
              <MotionTicks tone="cobalt" size={22} rotate={-40} className="absolute" style={{ top: -12, right: -14 }} />
            </button>
          )}

          <StickerBurst active={burst} size={300} count={22} onDone={() => setBurst(false)} />
        </>
      )}

      {/* Status card, pinned inside the picture */}
      {showStatus && (
        <PaperCard
          tone="paper"
          pad="sm"
          className="absolute left-3 right-3 top-3 flex items-center gap-3"
          style={{ animation: 'exp-fade-in 0.4s ease' }}
        >
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink ${expState === 'waiting' ? 'bg-sun' : 'bg-white'}`}
          >
            <DoodleIcon name={status.icon} size={24} />
          </span>
          <span className="min-w-0">
            <b className="block font-headline font-semibold text-lg leading-tight truncate">{status.title}</b>
            <span className="block text-base text-ink-soft truncate">{status.sub}</span>
          </span>
        </PaperCard>
      )}
    </div>
  );
}

/**
 * The Morgenwald scene, cropped to its treetops: the picture has Ronki
 * painted into its lower half, so the frame shows the top of the art
 * (enlarged 1.5x) and the cut-out Ronki stands in front of it.
 */
function Morgenwald() {
  return (
    <div aria-hidden="true" className="absolute" style={{ left: '-25%', top: 0, width: '150%', aspectRatio: '9 / 16' }}>
      <SceneLoop poster={MORGENWALD} objectPosition="50% 0%" />
    </div>
  );
}

// ─── Naturtagebuch: shelf and pages ───────────────────────────────

function Naturtagebuch({ log, expedition }) {
  // Show 8 slots; fill with what we have, dash the rest. Recent 3
  // pages go below as the "Seiten" strip.
  const SHELF_SLOTS = 8;
  const slots = Array.from({ length: SHELF_SLOTS }, (_, i) => log[log.length - 1 - i] || null);
  const recent = log.slice(-3).reverse();
  const isEmpty = log.length === 0;

  return (
    <PaperCard tone="paper" pad="md">
      <div>
        <p className="bb-hand text-xl text-cobalt mb-1">Naturtagebuch</p>
        <h3 className="bb-display text-2xl">Was Ronki gesammelt hat</h3>
        <p className="text-base text-ink-soft mt-2 leading-relaxed">
          Jede Seite ein kleiner Streifzug. Keine Punkte, keine Serie, nur was er mitbringt.
        </p>
      </div>

      {/* The map: where Ronki is going, drawn as a line. */}
      <ExpeditionTrail
        expedition={expedition}
        label={`Morgenwald · ${Math.min(99, Math.round((log.length / 24) * 100))}%`}
      />

      {isEmpty ? (
        <PaperCard tone="white" pad="sm" className="mt-4 flex items-center gap-3 p-4">
          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-sun">
            <DoodleIcon name="book" size={30} />
          </span>
          <span className="min-w-0">
            <b className="block font-headline font-semibold text-lg leading-tight">Noch leer.</b>
            <span className="block text-base text-ink-soft mt-1 leading-snug">
              Wenn Ronki vom Morgenwald zurückkommt, landen seine Funde hier auf der Seite.
            </span>
          </span>
        </PaperCard>
      ) : (
        <>
          {/* Mementos shelf */}
          <div className="flex justify-between items-baseline pt-4 pb-2">
            <h4 className="font-headline font-semibold text-lg m-0">Mementos</h4>
            <span className="bb-hand text-lg text-sun-deep">{log.length} von 24</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {slots.map((m, i) => m ? (
              <div
                key={m.id}
                className="flex items-center justify-center rounded-[16px] border-[2.5px] border-ink bg-white"
                style={{ aspectRatio: '1 / 1', fontSize: 28 }}
              >
                <span aria-hidden="true">{m.emoji}</span>
              </div>
            ) : (
              <div
                key={`empty-${i}`}
                className="rounded-[16px] border-[2.5px] border-dashed border-outline-variant bg-white"
                style={{ aspectRatio: '1 / 1' }}
              />
            ))}
          </div>
        </>
      )}

      {/* Recent pages */}
      {recent.length > 0 && (
        <>
          <div className="flex justify-between items-baseline pt-5 pb-2">
            <h4 className="font-headline font-semibold text-lg m-0">Seiten</h4>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map(m => (
              <PaperCard key={m.id} tone="white" pad="sm" className="grid items-center gap-3" style={{ gridTemplateColumns: '48px 1fr auto' }}>
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] border-ink bg-sky-wash"
                  style={{ fontSize: 22 }}
                >
                  {m.emoji}
                </span>
                <span className="min-w-0">
                  <b className="block font-headline font-semibold text-lg leading-tight truncate">{m.name}</b>
                  <span className="block text-base text-ink-soft truncate">Morgenwald · {m.location}</span>
                </span>
                <time className="bb-hand text-lg text-sun-deep">{relativeTime(m.ts)}</time>
              </PaperCard>
            ))}
          </div>
        </>
      )}
    </PaperCard>
  );
}

// ─── ExpeditionTrail: the live route, drawn ───────────────────────
//
// Marc 25 Apr 2026: "show where ronki is going in the woods and how
// there might be an expedition line of where he is going and track
// that trail like the Uber Magic Map."
//
//   · A paper map with a few leaf blobs as landmarks.
//   · A route from the camp (left, fixed) to the find (right, varies
//     per trip via a deterministic seed off departedAt).
//   · Cobalt dashed line for the way ahead, solid leaf for the part
//     Ronki has covered, a Ronki dot at the current progress.
//   · Idle / home shows the route faint so the map still reads as a
//     map without giving away the next route.
//   · Ticks once a minute while Ronki is away.
//
// Pure visual, no game logic. Geometry in a fixed 320 x 160 viewBox.

function ExpeditionTrail({ expedition, label }) {
  const expState = expedition?.state || 'home';
  const isMoving = expState === 'away' || expState === 'waiting' || expState === 'leaving';

  const [, forceTick] = useState(0);
  useEffect(() => {
    if (expState !== 'away') return undefined;
    const id = setInterval(() => forceTick(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, [expState]);

  // Progress 0..1, driven by the trip's actual timestamps.
  const progress = (() => {
    if (expState === 'waiting') return 1;
    if (expState === 'leaving') return 0.04;
    if (expState !== 'away') return 0;
    if (!expedition?.departedAt || !expedition?.returnAt) return 0;
    const start = new Date(expedition.departedAt).getTime();
    const end = new Date(expedition.returnAt).getTime();
    const now = Date.now();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
    return Math.max(0, Math.min(1, (now - start) / (end - start)));
  })();

  // Deterministic path per trip.
  const seed = expedition?.departedAt
    ? new Date(expedition.departedAt).getTime()
    : 12345; // stable idle preview seed
  const path = useMemo(() => makeTrailPath(seed), [seed]);

  const dot = bezierAt(path, progress);
  const waypoints = useMemo(() => (
    [0.22, 0.5, 0.78].map((t, i) => ({ t, ...bezierAt(path, t), key: i }))
  ), [path]);

  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(360);
  useEffect(() => {
    if (pathRef.current && pathRef.current.getTotalLength) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, [path]);

  const preview = !isMoving;

  return (
    <div className="relative mt-3 overflow-hidden rounded-[20px] border-[2.5px] border-ink bg-white" style={{ height: 168 }}>
      <svg
        viewBox="0 0 320 160"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* Leaf blobs as landmarks */}
        <g fill="var(--color-leaf)" opacity={0.28}>
          <ellipse cx="70" cy="50" rx="22" ry="14" />
          <ellipse cx="134" cy="112" rx="26" ry="15" />
          <ellipse cx="205" cy="60" rx="20" ry="13" />
          <ellipse cx="243" cy="125" rx="18" ry="12" />
          <ellipse cx="282" cy="36" rx="16" ry="11" />
        </g>
        {/* The way ahead: cobalt dashed */}
        <path
          d={path.d}
          fill="none"
          stroke="var(--color-cobalt)"
          strokeWidth={preview ? 2 : 3}
          strokeLinecap="round"
          strokeDasharray="6 7"
          opacity={preview ? 0.35 : 1}
        />
        {/* The part Ronki has covered: solid leaf */}
        {!preview && (
          <path
            ref={pathRef}
            d={path.d}
            fill="none"
            stroke="var(--color-leaf-deep)"
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeDasharray={pathLen}
            strokeDashoffset={pathLen * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        )}
        {waypoints.map(wp => {
          const passed = !preview && progress >= wp.t;
          return (
            <circle
              key={wp.key}
              cx={wp.x} cy={wp.y} r={3}
              fill={passed ? 'var(--color-leaf-deep)' : '#ffffff'}
              stroke="var(--color-ink)"
              strokeWidth={1.6}
            />
          );
        })}
        {/* The camp (start) */}
        <g transform={`translate(${path.p0.x - 8} ${path.p0.y - 9})`} stroke="var(--color-ink)" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
          <path d="M1 8 L8 1 L15 8" fill="none" />
          <path d="M3 7 L3 15 L13 15 L13 7" fill="var(--color-paper)" />
        </g>
        {/* The find (end): a sun star */}
        <g transform={`translate(${path.p3.x} ${path.p3.y})`}>
          <path
            d="M0 -8 C 1 -3 3 -1 8 0 C 3 1 1 3 0 8 C -1 3 -3 1 -8 0 C -3 -1 -1 -3 0 -8 Z"
            fill={expState === 'waiting' ? 'var(--color-sun)' : '#ffffff'}
            stroke="var(--color-ink)"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </g>
        {/* Ronki dot, only on a real trip */}
        {!preview && (
          <g transform={`translate(${dot.x} ${dot.y})`} style={{ transition: 'transform 1.2s ease-out' }}>
            <circle r={7} fill="var(--color-ember)" stroke="var(--color-ink)" strokeWidth={1.8} />
            <circle r={2.2} fill="#ffffff" />
          </g>
        )}
      </svg>

      {/* Biome + collection label */}
      <span className="absolute bottom-2 right-3 bb-hand text-lg text-sun-deep">{label}</span>

      {/* Status pill while Ronki is moving */}
      {isMoving && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-cobalt px-3 py-1 font-headline font-semibold text-base text-white">
          <DoodleIcon name={expState === 'waiting' ? 'check' : 'paw'} size={16} stroke={7} />
          {expState === 'waiting'
            ? 'Zurück'
            : expState === 'leaving'
            ? 'Aufbruch'
            : `Unterwegs · ${Math.round(progress * 100)}%`}
        </span>
      )}
    </div>
  );
}

// ─── Trail-path math (deterministic bezier per trip) ──────────────

function bezierAt({ p0, p1, p2, p3 }, t) {
  const u = 1 - t;
  return {
    x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
    y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,
  };
}

function makeTrailPath(seed) {
  const rand = mulberry32(seed || 1);
  const p0 = { x: 32,  y: 124 };  // camp anchor
  const p3 = {
    x: 286,
    y: 28 + Math.floor(rand() * 80),
  };
  const p1 = {
    x: 90  + Math.floor(rand() * 60),
    y: 30  + Math.floor(rand() * 50),
  };
  const p2 = {
    x: 200 + Math.floor(rand() * 60),
    y: 80  + Math.floor(rand() * 50),
  };
  const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
  return { p0, p1, p2, p3, d };
}

// Tiny seeded PRNG (public-domain mulberry32).
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Diary sheet ────────────────────────────────────────────────

function DiaryModal({ memento, totalCollected, onClose }) {
  const pct = Math.min(99, Math.round((totalCollected / 24) * 100));
  // Animate the bar fill in after mount
  const [fillTarget, setFillTarget] = useState('0%');
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFillTarget(`${pct}%`), 200);
    const b = setTimeout(() => setBurst(true), 350);
    return () => { clearTimeout(t); clearTimeout(b); };
  }, [pct]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tagebuch"
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 90, background: 'rgba(4, 34, 94, 0.55)', animation: 'exp-fade-in 0.3s ease' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-y-auto rounded-t-[28px] border-[3px] border-b-0 border-ink bg-paper text-ink px-5 pt-5"
        style={{
          maxHeight: '92%',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
          animation: 'exp-sheet-up 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        {/* Drag handle */}
        <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 top-2 h-1.5 w-10 rounded-full bg-ink" />

        <p className="bb-hand text-xl text-cobalt text-center mt-2 mb-1">Heute · {timeOfDay()}</p>
        <h3 className="bb-display text-3xl text-center mb-4">Ein {memento.name}</h3>

        {/* Ronki with his find, the burst on top */}
        <div className="relative flex justify-center mb-3">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[2.5px] border-ink bg-sky-wash">
            <RonkiArt pose="leaf" size={150} idle="bb-idle-lift" style={{ marginTop: 8 }} />
            <MotionTicks tone="sun" size={30} rotate={-40} className="absolute" style={{ top: 6, right: -8 }} />
          </div>
          <StickerBurst active={burst} size={260} count={20} onDone={() => setBurst(false)} />
        </div>

        <p className="font-headline font-semibold text-lg text-center leading-snug mb-4 px-1">
          „{memento.quote}“
        </p>

        {/* Memento card, on sun */}
        <PaperCard tone="sun" pad="sm" className="grid items-center gap-3 p-4 mb-4" style={{ gridTemplateColumns: '68px 1fr' }}>
          <span
            aria-hidden="true"
            className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[2.5px] border-ink bg-white"
            style={{ fontSize: 36 }}
          >
            {memento.emoji}
          </span>
          <span className="min-w-0">
            <span className="block bb-hand text-lg text-sun-deep">Spur · Für dich</span>
            <span className="block font-headline font-bold text-xl leading-tight">{memento.name}</span>
            <span className="block text-base text-ink-soft mt-0.5">{memento.location}</span>
          </span>
        </PaperCard>

        {/* Progress */}
        <PaperCard tone="white" pad="sm" className="mb-5 p-4">
          <div className="flex justify-between items-center mb-2">
            <b className="font-headline font-semibold text-lg">Morgenwald entdeckt</b>
            <span className="bb-hand text-lg text-sun-deep">{pct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border-[2px] border-ink bg-paper-deep">
            <div
              className="h-full rounded-full bg-cobalt"
              style={{ width: fillTarget, transition: 'width 1.2s cubic-bezier(0.5, 0, 0.2, 1)' }}
            />
          </div>
        </PaperCard>

        <PillButton full size="lg" onClick={onClose}>
          Aufs Regal stellen
        </PillButton>
      </div>
    </div>
  );
}

// ─── Dev-only state cycler ─────────────────────────────────────

function DevStateCycler({ current, actions }) {
  const STATES = ['home', 'leaving', 'away', 'waiting'];
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border-[2.5px] border-ink bg-ink px-2 py-1 font-headline font-semibold text-sm text-white"
      style={{ bottom: 90, zIndex: 70 }}
    >
      <span className="opacity-60 px-1">DEV</span>
      {STATES.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => {
            if (s === 'away') actions.rangerDeparted?.();
            else if (s === 'waiting') {
              actions.rangerDeparted?.();
              setTimeout(() => actions.rangerArrived?.(), 50);
            }
            else actions.setExpedition?.({ state: s, biome: 'morgenwald' });
          }}
          className={`rounded-full px-2 py-1 ${current === s ? 'bg-sun text-ink' : 'text-white'}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function returnLabel(returnAt) {
  // Kid-readable return-time copy: map the return time to a daytime
  // anchor the kid already knows so the wait is concrete.
  if (!returnAt) return '';
  const t = new Date(returnAt);
  const hh = t.getHours();
  if (hh < 11) return 'Kommt vor dem Mittag zurück';
  if (hh < 14) return 'Kommt zum Mittagessen zurück';
  if (hh < 17) return 'Kommt am Nachmittag zurück';
  if (hh < 20) return 'Kommt zum Abendessen zurück';
  return 'Kommt morgen früh zurück';
}

function timeOfDay() {
  const t = new Date();
  return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

function relativeTime(iso) {
  if (!iso) return '';
  const t = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - t.getTime()) / 86_400_000);
  if (diffDays < 1) return 'Heute';
  if (diffDays < 2) return 'Gestern';
  if (diffDays < 7) return ['So','Mo','Di','Mi','Do','Fr','Sa'][t.getDay()];
  return t.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}
