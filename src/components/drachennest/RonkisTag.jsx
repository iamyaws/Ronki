import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import MoodChibi, { RonkiArt } from '../MoodChibi';
import { useQuestEater } from '../QuestEater';
import { flavorForQuest } from '../FireBreathPuff';
import ToothbrushTimer from '../ToothbrushTimer';
import VoiceAudio from '../../utils/voiceAudio';
import {
  TopBar,
  PaperCard,
  PillButton,
  DoodleIcon,
  SceneLoop,
  StickerBurst,
  useReducedMotion,
} from '../bilderbuch';
import { SunCheck, SunSticker } from './RoomHubBits';

/**
 * RonkisTag: the day as a strip (morning, afternoon, evening).
 *
 * Bilderbuch cut, 25 Sep 2026. White ground, the shared TopBar with
 * the read-aloud button, the morning scene (scenes/morgen.webp) in a
 * drawn frame at the top, block headers in the display face, every
 * task a paper card with a marker doodle (the eight CSS prop
 * paintings are gone), the current task inside the cobalt drawn ring
 * with a "jetzt" sun sticker, done tasks with the sun check sticker.
 * When a task or a whole block completes, a StickerBurst fires and
 * Ronki does a happy jump, all within 1.5 s. The end of the day is the
 * night loop (Ronki asleep, blanket breathing) with one sun pill to
 * the Tonight ritual.
 *
 * Everything that is not paint is unchanged: quest grouping, the tap
 * to complete (with the QuestEater flight and the toothbrush timer
 * detour), the voice lines on mount, expedition readiness, routing.
 */

const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;

// Quest IDs that detour through the toothbrush timer (mirrors TaskList).
const TEETH_QUEST_IDS = new Set(['s3', 's12', 'v3', 'v10']);

// ── Helpers ───────────────────────────────────────────────────────

// Map a quest's source `anchor` field to one of three strip blocks.
// `evening` and `hobby` both fold into "afternoon" so the kid sees a
// 3-block day, not 4.
function blockFor(anchor) {
  if (anchor === 'morning') return 'morning';
  if (anchor === 'bedtime') return 'bedtime';
  return 'afternoon';
}

// Map a quest to a doodle family. Same routing as the old painted
// props, by quest icon family or id keyword; falls back to a sparkle.
function artFor(quest) {
  const id = (quest?.id || '').toLowerCase();
  const name = (quest?.name || '').toLowerCase();
  const icon = (quest?.icon || '').toLowerCase();
  const all = `${id} ${name} ${icon}`;
  if (/aufsteh|wach|wake|morgen-start|bett kommen|aus dem bett/.test(all)) return 'sun';
  // 'zähn' too: "Zähne putzen" never matched 'zahn', so teeth fell back
  // to the sparkle (found 25 Sep 2026).
  if (/zahn|zähn|tooth|teeth|brush/.test(all)) return 'toothbrush';
  if (/pyjama|schlafan/.test(all))           return 'pajama';
  if (/anzieh|kleid|wäsche|clothes|shirt/.test(all)) return 'shirt';
  if (/wasch|gesicht|seife|dusch/.test(all))  return 'wash';
  if (/wasser|water|trinken|cup/.test(all))  return 'water';
  if (/essen|food|frühstück|mahlzeit|brot/.test(all)) return 'plate';
  if (/lese|book|buch|vorles/.test(all))     return 'book';
  if (/hausaufgab|schule|homework/.test(all)) return 'homework';
  if (/tasche|ranzen/.test(all))             return 'bag';
  if (/beweg|sport|drauß|spiel|toben/.test(all)) return 'move';
  if (/nacht|licht|lampe|bett|sleep|ruhe/.test(all)) return 'nightlight';
  return 'badge';
}

// The marker doodle per family: sun for waking, sparkle for shiny
// teeth, drop for water and washing, egg for meals, book, scribble for
// homework, cloud for the pyjama, star for getting dressed, bag for
// the school bag, bolt for moving, moon for the little light.
const DOODLE = {
  sun:        { name: 'sun', color: 'var(--color-sun)', filled: true },
  toothbrush: { name: 'sparkle', color: 'var(--color-sky)', filled: true },
  water:      { name: 'drop', color: 'var(--color-cobalt)', filled: true },
  wash:       { name: 'drop', color: 'var(--color-sky)', filled: true },
  plate:      { name: 'egg', color: 'var(--color-ink)', filled: false },
  book:       { name: 'book', color: 'var(--color-ink)', filled: false },
  homework:   { name: 'scribble', color: 'var(--color-cobalt)', filled: false },
  pajama:     { name: 'cloud', color: 'var(--color-sky)', filled: false },
  shirt:      { name: 'star', color: 'var(--color-sun)', filled: true },
  bag:        { name: 'bag', color: 'var(--color-ink)', filled: false },
  move:       { name: 'bolt', color: 'var(--color-ember)', filled: false },
  nightlight: { name: 'moon', color: 'var(--color-sun)', filled: true },
  badge:      { name: 'sparkle', color: 'var(--color-sun)', filled: true },
};

// Tasks where Ronki appears inside the scene rather than as a side
// avatar: the designer cited these explicitly.
function ronkiInScene(quest) {
  const id = (quest?.id || '').toLowerCase();
  const name = (quest?.name || '').toLowerCase();
  return /aufsteh|wach|hausaufgab|pyjama|schule/.test(`${id} ${name}`);
}

// Phase of day: which block is "now" right now.
function currentPhaseFromHour(h) {
  if (h < 11) return 'morning';
  if (h < 17) return 'afternoon';
  return 'bedtime';
}

function momentLabel(phase) {
  if (phase === 'morning')   return 'früh';
  if (phase === 'afternoon') return 'Mittag';
  return 'Abend';
}

function dateLabelDe() {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  return days[new Date().getDay()];
}

// Voiced "moment" lines per phase + state. Soft observational, no
// instructions. Picked once per quest so it doesn't shimmer.
const MOMENT_LINES = {
  morning: {
    now:    ['Er sitzt schon am Fenster und schaut raus.', 'Er hat schon gewartet.', 'Er ist heute früh wach.'],
    past:   ['Sonne war rosa.', 'War schön mit dir.', 'Sind beide aufgewacht.'],
    future: ['', '', ''],
  },
  afternoon: {
    now:    ['Er hat sich neben den Tisch gelegt.', 'Er beobachtet leise.', 'Er rückt näher.'],
    past:   ['Hat er gemerkt.', 'Habt ihr zusammen.', 'War gut so.'],
    future: ['', '', ''],
  },
  bedtime: {
    now:    ['Er gähnt einmal.', 'Er macht die Augen schmal.', 'Er kuschelt sich ein.'],
    past:   ['Schon ruhig.', 'Hat geklappt.', 'Hat gut funktioniert.'],
    future: ['', '', ''],
  },
};

function pickMomentLine(phase, state, seed) {
  const pool = MOMENT_LINES[phase]?.[state] || [];
  if (!pool.length) return '';
  return pool[Math.abs(seed) % pool.length];
}

// ── Top-level component ──────────────────────────────────────────

export default function RonkisTag({ onClose, onOpenExpedition, onOpenTonight }) {
  const { state, actions } = useTask();
  const eater = useQuestEater();
  const variant = state?.companionVariant || 'forest';
  const stageIdx = getCatStage(state?.catEvo ?? 0) || 1;

  const quests = state?.quests || [];

  // Group quests into the 3 strip blocks; main quests only.
  const blocks = useMemo(() => {
    const main = quests.filter(q => !q.sideQuest);
    const byBlock = { morning: [], afternoon: [], bedtime: [] };
    for (const q of main) {
      const b = blockFor(q.anchor);
      if (byBlock[b]) byBlock[b].push(q);
    }
    for (const k of Object.keys(byBlock)) byBlock[k].sort((a, b) => (a.order || 0) - (b.order || 0));
    return byBlock;
  }, [quests]);

  // Phase of day = which block is "now."
  const phase = useMemo(() => currentPhaseFromHour(new Date().getHours()), []);

  // Voice on mount: Drachenmutter narrator framing + Ronki warmth.
  useEffect(() => {
    VoiceAudio.playNarrator('tag_intro_01', 600);
    const t = setTimeout(() => VoiceAudio.playLocalized('tag_warmth_01', 0), 4200);
    return () => clearTimeout(t);
  }, []);

  // Block completion
  const morningAll = blocks.morning.length > 0 && blocks.morning.every(q => q.done);
  const afternoonAll = blocks.afternoon.length > 0 && blocks.afternoon.every(q => q.done);
  const bedtimeAll = blocks.bedtime.length > 0 && blocks.bedtime.every(q => q.done);
  const fullDay = morningAll && afternoonAll && bedtimeAll;

  const expeditionReady = morningAll && state?.expedition?.state === 'home';

  // Celebration: a sticker burst plus Ronki's happy jump. `big` when a
  // whole block just completed (the guardrail: bigger only when the
  // routine is done, never longer).
  const [cheer, setCheer] = useState({ key: 0, big: false });
  const doneRef = useRef({ morningAll, afternoonAll, bedtimeAll });
  useEffect(() => {
    const prev = doneRef.current;
    const flipped =
      (!prev.morningAll && morningAll) ||
      (!prev.afternoonAll && afternoonAll) ||
      (!prev.bedtimeAll && bedtimeAll);
    doneRef.current = { morningAll, afternoonAll, bedtimeAll };
    if (flipped) setCheer(c => ({ key: c.key + 1, big: true }));
  }, [morningAll, afternoonAll, bedtimeAll]);

  // Toothbrush timer detour state
  const [teethTimerQuestId, setTeethTimerQuestId] = useState(null);

  const handleTap = (quest, evt) => {
    if (quest.done) return;
    if (TEETH_QUEST_IDS.has(quest.id)) {
      setTeethTimerQuestId(quest.id);
      return;
    }
    if (eater && evt?.currentTarget) {
      try {
        eater.eatQuest({
          fromRect: evt.currentTarget.getBoundingClientRect(),
          emoji: quest.icon || '⭐',
          hp: quest.xp || 0,
          flavor: flavorForQuest(quest, state.taughtBreaths),
        });
      } catch { /* surface-agnostic; never block the tap */ }
    }
    actions.complete(quest.id);
    setCheer(c => ({ key: c.key + 1, big: false }));
  };

  // Open on the block that is "now": in the afternoon or evening the
  // morning picture and its cards would otherwise push the current task
  // below the fold (Astra design review R3). Order and rules unchanged.
  const stripRef = useRef(null);
  useEffect(() => {
    if (phase === 'morning') return undefined;
    const t = setTimeout(() => {
      const box = stripRef.current;
      const el = box?.querySelector('[data-current-block="true"]');
      if (!box || !el) return;
      const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 76;
      box.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    }, 120);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      ref={stripRef}
      role="dialog"
      aria-modal="true"
      aria-label="Ronkis Tag"
      className="bg-white text-ink font-body"
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
      }}
    >
      {fullDay ? (
        <EndOfDayScene onClose={onClose} onOpenTonight={onOpenTonight} />
      ) : (
        <>
          <TopBar
            sticky
            title="Ronkis Tag"
            onBack={onClose}
            backLabel="Zurück zur Höhle"
            /* No read-aloud button: the narrator track is hard-muted
               since 27 Apr 2026, so it would do nothing (Astra design
               review R2). Bring it back with a Ronki voice line. */
            className="bg-white"
            style={{ top: 0 }}
          />

          <div className="w-full max-w-lg mx-auto" style={{ padding: '4px 16px 40px' }}>
            <MorningHeader phase={phase} />

            {/* Morning */}
            {blocks.morning.length > 0 && (
              <BlockStrip
                title="Morgen"
                phase={phase}
                blockId="morning"
                quests={blocks.morning}
                isCurrent={phase === 'morning'}
                allDone={morningAll}
                collapse={phase === 'bedtime' || phase === 'afternoon' && morningAll}
                variant={variant}
                stageIdx={stageIdx}
                onTap={handleTap}
              />
            )}

            {/* Anchor-complete transition for morning → expedition */}
            {expeditionReady && phase !== 'bedtime' && (
              <AnchorCompleteCard onOpenExpedition={onOpenExpedition} />
            )}

            {/* Afternoon */}
            {blocks.afternoon.length > 0 && (
              <BlockStrip
                title="Nachmittag"
                phase={phase}
                blockId="afternoon"
                quests={blocks.afternoon}
                isCurrent={phase === 'afternoon'}
                allDone={afternoonAll}
                collapse={phase === 'bedtime'}
                variant={variant}
                stageIdx={stageIdx}
                onTap={handleTap}
              />
            )}

            {/* Bedtime, never collapsed. */}
            {blocks.bedtime.length > 0 && (
              <BlockStrip
                title="Abend"
                phase={phase}
                blockId="bedtime"
                quests={blocks.bedtime}
                isCurrent={phase === 'bedtime'}
                allDone={bedtimeAll}
                collapse={false}
                variant={variant}
                stageIdx={stageIdx}
                onTap={handleTap}
              />
            )}
          </div>
        </>
      )}

      {/* Task or block done: burst plus Ronki's jump, under 1.5 s. */}
      <CheerMoment cheerKey={cheer.key} big={cheer.big} />

      {/* Toothbrush timer */}
      {teethTimerQuestId && (
        <ToothbrushTimer
          onClose={() => setTeethTimerQuestId(null)}
          onComplete={() => {
            actions.complete(teethTimerQuestId);
            setTeethTimerQuestId(null);
            setCheer(c => ({ key: c.key + 1, big: false }));
          }}
        />
      )}
    </div>
  );
}

// ── MorningHeader (the morning scene with the day sticker) ──────

function MorningHeader({ phase }) {
  return (
    <div className="bb-frame relative w-full" style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
      <SceneLoop poster={`${ART}scenes/morgen.webp`} objectPosition="50% 54%" priority />
      <div className="absolute" style={{ top: 12, left: 12, zIndex: 2 }}>
        <SunSticker rotate={-3} style={{ fontSize: 20, padding: '8px 14px 7px' }}>
          {dateLabelDe()}, {momentLabel(phase)}
        </SunSticker>
      </div>
    </div>
  );
}

// ── BlockStrip: one anchor section ──────────────────────────────

function BlockStrip({ title, phase, blockId, quests, isCurrent, allDone, collapse, variant, stageIdx, onTap }) {
  const hint =
    allDone   ? 'vorbei' :
    isCurrent ? 'jetzt' :
                phase === 'morning' && blockId === 'afternoon' ? 'kommt noch' :
                phase === 'morning' && blockId === 'bedtime'   ? 'später' :
                blockId === 'morning' && phase !== 'morning'   ? 'vorbei' :
                                                                 `${quests.length} Sachen`;
  const icon = blockId === 'morning' ? 'sun' : blockId === 'afternoon' ? 'leaf' : 'moon';
  const iconColor = blockId === 'morning' ? 'var(--color-sun)' : blockId === 'afternoon' ? 'var(--color-leaf)' : 'var(--color-night)';

  return (
    <>
      <StripSection icon={icon} iconColor={iconColor} hint={hint} current={isCurrent && !allDone} done={allDone}>
        {title}
      </StripSection>
      {collapse ? (
        <CollapsedGrid quests={quests} />
      ) : (
        <div className="flex flex-col" style={{ gap: 14 }}>
          {quests.map((q) => {
            const sceneState = q.done ? 'past' : (isCurrent && firstUndone(quests)?.id === q.id ? 'now' : 'future');
            return (
              <StripScene
                key={q.id}
                quest={q}
                state={sceneState}
                phase={blockId}
                variant={variant}
                stageIdx={stageIdx}
                onTap={onTap}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function firstUndone(list) {
  return list.find(q => !q.done);
}

// ── StripSection (display headline, hand hint, drawn dashed line) ─

function StripSection({ children, icon, iconColor, hint, current, done }) {
  return (
    <div className="flex items-center" data-current-block={current ? 'true' : undefined} style={{ gap: 10, margin: '26px 2px 12px' }}>
      <span className="flex items-center" style={{ color: iconColor }}>
        <DoodleIcon name={icon} size={26} filled={icon !== 'leaf'} />
      </span>
      <h2 className="bb-display" style={{ fontSize: 26, margin: 0 }}>{children}</h2>
      {hint && (
        <span
          className={`bb-hand ${current ? 'text-cobalt' : done ? 'text-leaf-deep' : 'text-ink-soft'}`}
          style={{ fontSize: 18, lineHeight: 1, paddingTop: 2 }}
        >
          {hint}
        </span>
      )}
      <svg aria-hidden="true" focusable="false" className="flex-1" height="6" preserveAspectRatio="none" viewBox="0 0 100 6" style={{ minWidth: 24 }}>
        <path d="M1 3.5 C 25 2 50 5 99 3" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 6" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

// ── StripScene (one task as a paper card) ────────────────────────

function StripScene({ quest, state, phase, variant, stageIdx, onTap }) {
  const seed = useMemo(() => {
    let h = 0;
    for (const c of quest.id) h = (h * 31 + c.charCodeAt(0)) | 0;
    return h;
  }, [quest.id]);
  const line = pickMomentLine(phase, state === 'now' ? 'now' : state === 'past' ? 'past' : 'future', seed);
  const stateAria =
    state === 'past' ? ', fertig' :
    state === 'now'  ? ', jetzt dran' :
                       ', später';
  const done = state === 'past';
  const now = state === 'now';

  return (
    <div className="relative" style={{ marginTop: now ? 4 : 0 }}>
      <PaperCard
        as="button"
        tone={done ? 'white' : 'paper'}
        pad="sm"
        onClick={(e) => onTap(quest, e)}
        disabled={done}
        aria-label={`${quest.name || quest.id}${stateAria}`}
        aria-current={now ? 'step' : undefined}
        className="w-full grid items-center gap-3"
        style={{ gridTemplateColumns: '84px 1fr', padding: 12, opacity: done ? 0.92 : 1 }}
      >
        <TaskDoodle quest={quest} phase={phase} state={state} variant={variant} stageIdx={stageIdx} />
        <div className="min-w-0" style={{ paddingRight: now || done ? 40 : 4 }}>
          <div
            className={`font-headline font-bold ${done ? 'text-ink-soft' : 'text-ink'}`}
            style={{ fontSize: 20, lineHeight: 1.2 }}
          >
            {quest.name || quest.id}
          </div>
          {line && (
            <div
              className="font-body text-ink-soft"
              style={{
                fontSize: 16, lineHeight: 1.4, marginTop: 3,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}
            >
              {line}
            </div>
          )}
        </div>
      </PaperCard>

      {/* The cobalt drawn ring around the current task. */}
      {now && <CobaltRing />}

      {/* State stickers sit on the card's corner. */}
      {done && (
        <span className="absolute" style={{ top: -8, right: -6, zIndex: 2 }}>
          <SunCheck size={36} />
        </span>
      )}
      {now && (
        <span className="absolute" style={{ top: -12, right: 6, zIndex: 2 }}>
          <SunSticker rotate={-5}>jetzt</SunSticker>
        </span>
      )}
    </div>
  );
}

// The hand-drawn cobalt ring from ChoiceTile, drawn around a card.
function CobaltRing() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute"
      style={{ inset: -9, width: 'calc(100% + 18px)', height: 'calc(100% + 18px)', overflow: 'visible', color: 'var(--color-cobalt)', zIndex: 1 }}
    >
      <path
        d="M22 3 C 45 1 70 2 82 4 C 94 6 98 16 97 30 C 96 50 98 68 96 84 C 95 95 88 98 76 98 C 55 99 34 98 20 97 C 8 96 3 90 3 78 C 2 60 1 40 3 22 C 4 9 10 4 22 3 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// The task's marker doodle in a white box; Ronki peeks in on the
// scenes the designer put him in (waking, homework, pyjama).
function TaskDoodle({ quest, phase, state, variant, stageIdx, compact = false }) {
  const kind = artFor(quest);
  const d = DOODLE[kind] || DOODLE.badge;
  const inScene = ronkiInScene(quest);
  const sleepy = phase === 'bedtime' && state !== 'past';
  const box = compact ? 44 : 84;
  const icon = compact ? 26 : 46;
  return (
    <div
      aria-hidden="true"
      className="relative flex items-center justify-center rounded-[22px] bg-white shrink-0"
      style={{
        width: box,
        height: box,
        border: '2.5px solid var(--color-ink)',
        color: d.color,
        opacity: state === 'past' ? 0.6 : 1,
      }}
    >
      <TaskPicture kind={kind} size={compact ? 34 : 64} fallback={d} />
      {inScene && !compact && (
        <span className="absolute" style={{ right: -10, bottom: -10 }}>
          <MoodChibi size={40} variant={variant} stage={stageIdx} mood={sleepy ? 'tired' : 'normal'} face />
        </span>
      )}
    </div>
  );
}

// ── TaskPicture: what the task is, drawn (Astra design review R2) ─
// A first grader reads the picture, not the word, so each task family
// has its own crayon picture from the Ronki art set (tasks sheet,
// Higgsfield, 25 Sep 2026). Unknown tasks keep the sparkle doodle.
const TASK_ART = {
  sun: 'wake', toothbrush: 'toothbrush', water: 'water', wash: 'wash',
  plate: 'plate', book: 'book', homework: 'homework', pajama: 'pajama',
  shirt: 'shirt', bag: 'bag', move: 'move', nightlight: 'nightlight',
};
const TASK_ART_BASE = `${import.meta.env.BASE_URL}art/bilderbuch/tasks/`;

function TaskPicture({ kind, size, fallback }) {
  const [failed, setFailed] = useState(false);
  const file = TASK_ART[kind];
  if (!file || failed) {
    const d = fallback || DOODLE.badge;
    return (
      <span style={{ color: d.color, lineHeight: 0 }}>
        <DoodleIcon name={d.name} size={Math.round(size * 0.72)} filled={d.filled} />
      </span>
    );
  }
  return (
    <img
      src={`${TASK_ART_BASE}${file}.webp`}
      alt=""
      draggable={false}
      decoding="async"
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  );
}

// ── CollapsedGrid (past anchors when evening rolls in) ───────────

function CollapsedGrid({ quests }) {
  // Two columns: wide enough for a whole "Frühstücken" without a
  // mid-word break, which reads as a typo to a first grader.
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {quests.map(q => {
        const kind = artFor(q);
        const d = DOODLE[kind] || DOODLE.badge;
        return (
          <PaperCard key={q.id} tone="white" pad="sm" className="relative flex flex-col items-center gap-1 text-center min-w-0" style={{ opacity: q.done ? 0.85 : 1 }}>
            <TaskPicture kind={kind} size={40} fallback={d} />
            <span
              className="font-headline font-semibold text-ink w-full"
              style={{
                fontSize: 16, lineHeight: 1.15, overflowWrap: 'normal',
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              }}
            >
              {q.name || q.id}
            </span>
            {q.done && (
              <span className="absolute" style={{ top: -8, right: -6 }}>
                <SunCheck size={24} />
              </span>
            )}
          </PaperCard>
        );
      })}
    </div>
  );
}

// ── AnchorCompleteCard (morning 100% → expedition) ──────────────

function AnchorCompleteCard({ onOpenExpedition }) {
  const [burst, setBurst] = useState(true);
  return (
    <PaperCard tone="sun" pad="md" lift className="relative overflow-visible" style={{ marginTop: 20 }}>
      <StickerBurst active={burst} size={300} count={22} onDone={() => setBurst(false)} />
      <div className="flex items-center gap-3">
        {/* The still cheer with a short bob; the 4 s cheer clip broke the
            1.5 s rule for celebrations (Astra design review R5). */}
        <RonkiArt pose="cheer" idle="bb-idle-bob" size={96} />
        <div className="min-w-0 flex-1">
          <div className="bb-hand text-ink uppercase" style={{ fontSize: 18, lineHeight: 1 }}>Morgen ist gemacht</div>
          <div className="font-headline font-semibold text-ink" style={{ fontSize: 18, lineHeight: 1.3, marginTop: 6 }}>
            "Ich geh mal kurz raus. Bin zum Mittag wieder da."
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <PillButton full arrow onClick={onOpenExpedition} aria-label="Reise verfolgen, Morgen ist gemacht">
          Reise verfolgen
        </PillButton>
      </div>
    </PaperCard>
  );
}

// ── CheerMoment: burst plus Ronki's happy jump (under 1.5 s) ────

const CHEER_MS = 1400;

function CheerMoment({ cheerKey, big }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!cheerKey) return undefined;
    setShown(cheerKey);
    const id = setTimeout(() => setShown(0), CHEER_MS);
    return () => clearTimeout(id);
  }, [cheerKey]);
  if (!shown) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none" style={{ position: 'fixed', inset: 0, zIndex: 95 }}>
      <StickerBurst fixed active size={big ? 460 : 340} count={big ? 34 : 22} />
      <div
        key={shown}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 'calc(18% + env(safe-area-inset-bottom, 0px))',
          transform: 'translateX(-50%)',
          animation: reduced ? 'rt-cheer-still 1.4s ease-out both' : 'rt-cheer-jump 1.4s ease-out both',
          transformOrigin: '50% 100%',
        }}
      >
        <RonkiArt pose="cheer" size={big ? 190 : 150} />
      </div>
      <style>{`
        @keyframes rt-cheer-jump {
          0%   { opacity: 0; transform: translateX(-50%) translateY(12%) scale(0.9); }
          12%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          30%  { transform: translateX(-50%) translateY(4%) scale(1.06, 0.94); }
          52%  { transform: translateX(-50%) translateY(-38%) scale(0.96, 1.06); }
          72%  { transform: translateX(-50%) translateY(0) scale(1.04, 0.96); }
          84%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(6%) scale(0.98); }
        }
        @keyframes rt-cheer-still {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── EndOfDayScene (full day done → the night loop and Tonight) ───

function EndOfDayScene({ onClose, onOpenTonight }) {
  return (
    <div className="relative bg-night text-white" style={{ minHeight: '100dvh' }}>
      <SceneLoop
        poster={`${ART}loops/nacht-poster.webp`}
        video={`${ART}loops/nacht.mp4`}
        objectPosition="50% 60%"
        priority
      />
      <div className="relative flex flex-col" style={{ minHeight: '100dvh', zIndex: 2 }}>
        <TopBar sticky onDark title="" onBack={onClose} backLabel="Zurück zur Höhle" style={{ top: 0 }} />
        <div className="text-center" style={{ padding: '6px 24px 0' }}>
          <div className="bb-hand uppercase" style={{ fontSize: 20, lineHeight: 1, color: 'var(--color-sun)' }}>
            {dateLabelDe()}, zu Ende
          </div>
          <h1 className="bb-display text-white" style={{ fontSize: 40, marginTop: 10 }}>Ein guter Tag.</h1>
          <p className="font-headline font-semibold text-white" style={{ fontSize: 20, lineHeight: 1.35, marginTop: 14, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
            "Wir haben heute alles geteilt. Sogar das Brot mit den Krümeln."
          </p>
        </div>
        <div className="mt-auto flex justify-center" style={{ padding: '24px 24px calc(120px + env(safe-area-inset-bottom, 0px))' }}>
          <PillButton tone="sun" size="lg" arrow onClick={onOpenTonight} aria-label="Ins Lager, Tonight-Ritual öffnen">
            Ins Lager
          </PillButton>
        </div>
      </div>
    </div>
  );
}
