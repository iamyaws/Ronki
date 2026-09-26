import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import VoiceAudio from '../../utils/voiceAudio';
import { PillButton, StickerBurst, useReducedMotion, MoodChibi } from '../bilderbuch';
import { lineText } from '../../data/ronkiLines';
import { CREATURES, creatureArt, creatureMeta } from '../../data/wesen';
import { TASK_LABEL, taskPictureUrl } from '../../data/taskKinds';
import { getCatStage } from '../../utils/helpers';

/**
 * The four Wesen moments (26 Sep 2026, plan docs/plans/2026-09-26-wesen-louis-test.md).
 * Each is full screen, white ground, one pill, and only marks itself seen
 * when the child finishes it (Astra W-07). None of them can fail.
 *
 *   WesenPick      three small creatures, one tap; the other two go home
 *   WesenMeet      the child rests a finger, the creature walks over and
 *                  touches it, Ronki shifts to make room (Astra Q7)
 *   WesenGrow      the friend's look grows, tied to what the child can do
 *   WesenGoodbye   the creature moves out with the task picture
 */

const SHELL = {
  position: 'fixed', inset: 0, zIndex: 86, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto',
};

function Line({ id }) {
  const text = id ? lineText(id) : '';
  if (!text) return null;
  return (
    <p className="bb-display text-ink text-center" style={{ fontSize: 26, lineHeight: 1.2, margin: '18px 0 0', maxWidth: 420 }}>
      {text}
    </p>
  );
}

function useSayOnce(id, delay = 500) {
  useEffect(() => {
    if (id) VoiceAudio.playLocalized(id, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

// ── Pick ─────────────────────────────────────────────────────────────

export function WesenPick({ onDone }) {
  const { actions } = useTask();
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState(null);
  const lineId = picked ? `wesen_picked_${picked}` : 'wesen_pick_01';
  useSayOnce(lineId, picked ? 200 : 600);

  const pick = (id) => {
    if (picked) return;
    setPicked(id);
    actions?.wesenPickCreature?.(id);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Ein Wesen aussuchen" data-testid="wesen-pick" className="bg-white text-ink" style={SHELL}>
      <div className="flex justify-center" style={{ gap: 10, width: '100%', maxWidth: 440 }}>
        {CREATURES.map(c => {
          const gone = picked && picked !== c.id;
          const chosen = picked === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              disabled={!!picked}
              aria-label={c.name}
              data-testid={`wesen-pick-${c.id}`}
              className="bb-press flex flex-col items-center rounded-[22px] bg-paper"
              style={{
                flex: chosen ? '0 1 220px' : '1 1 0',
                minWidth: 0,
                padding: '10px 6px 12px',
                border: `3px solid ${chosen ? 'var(--color-cobalt)' : 'var(--color-ink)'}`,
                opacity: gone ? 0 : 1,
                maxWidth: gone ? 0 : 240,
                overflow: 'hidden',
                transition: reduced ? 'none' : 'opacity 500ms ease, max-width 600ms ease, flex 600ms ease',
                cursor: picked ? 'default' : 'pointer',
              }}
            >
              <img
                src={creatureArt(c.id, 'small')}
                alt=""
                draggable={false}
                className={reduced || picked ? '' : 'wz-bob'}
                style={{ width: '100%', maxWidth: chosen ? 180 : 120, aspectRatio: '1 / 1', objectFit: 'contain', animationDelay: `${CREATURES.indexOf(c) * 300}ms` }}
              />
              <span className="bb-display" style={{ fontSize: 20, marginTop: 4 }}>{c.name}</span>
              <span className="text-ink-soft" style={{ fontSize: 13, lineHeight: 1.2, textAlign: 'center' }}>{c.hint}</span>
            </button>
          );
        })}
      </div>
      <Line id={lineId} />
      {picked && (
        <div style={{ marginTop: 24, width: '100%', maxWidth: 360 }}>
          <PillButton full size="lg" arrow onClick={() => onDone?.()}>Weiter</PillButton>
        </div>
      )}
      <WesenKeyframes />
    </div>
  );
}

// ── Meet (beside Ronki) ──────────────────────────────────────────────

const WALK_MS = 2200;

export function WesenMeet({ friend, onDone }) {
  const { state, actions } = useTask();
  const reduced = useReducedMotion();
  const meta = creatureMeta(friend.creatureId);
  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);
  const [arrived, setArrived] = useState(false);
  const last = useRef(0);
  const firedRef = useRef(false);
  const lineId = arrived ? `wesen_meet_done_${friend.creatureId}` : `wesen_meet_${friend.creatureId}`;
  useSayOnce(lineId, arrived ? 300 : 600);

  // Elapsed-time steps on a short timer: requestAnimationFrame stalls in
  // throttled views, a timer with real deltas keeps the walk honest.
  useEffect(() => {
    if (!holding || arrived) return undefined;
    last.current = Date.now();
    const id = setInterval(() => {
      const t = Date.now();
      const dt = t - last.current;
      last.current = t;
      setP(prev => Math.min(1, prev + dt / (reduced ? 600 : WALK_MS)));
    }, 40);
    return () => clearInterval(id);
  }, [holding, arrived, reduced]);
  useEffect(() => {
    if (p >= 1 && !arrived) setArrived(true);
  }, [p, arrived]);

  const finish = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    actions?.wesenMarkSeen?.(friend.id, 'besideSeen');
    onDone?.();
  };

  // Walk from the right edge to the finger spot; once there, sit beside Ronki.
  const walkX = 86 - p * 26; // percent of the stage width (centre)
  const creatureStyle = arrived
    ? { left: '66%', bottom: '10%', width: '28%' }
    : { left: `${walkX}%`, bottom: '26%', width: '24%' };

  return (
    <div role="dialog" aria-modal="true" aria-label={`${meta?.name} kommt zu dir`} data-testid="wesen-meet" className="bg-white text-ink" style={SHELL}>
      <div className="relative rounded-[28px] bg-paper" style={{ width: 'min(340px, 100%)', aspectRatio: '34 / 28', border: '3px solid var(--color-ink)', overflow: 'hidden' }}>
        {/* Ronki; he shifts over to make room when the friend arrives. */}
        <div
          style={{
            position: 'absolute', bottom: '6%', left: '6%', width: '52%', aspectRatio: '1 / 1',
            transform: arrived ? 'translateX(-10%)' : 'none',
            transition: reduced ? 'none' : 'transform 700ms ease',
          }}
        >
          <MoodChibi size={180} variant={state?.companionVariant} stage={getCatStage(state?.catEvo ?? 3)} mood="happy" keepStage bare style={{ width: '100%', height: '100%' }} />
        </div>

        {/* The finger spot. Holding it lets the creature come; letting go makes it wait. */}
        {!arrived && (
          <button
            type="button"
            aria-label="Finger hierhin legen"
            data-testid="wesen-finger"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setHolding(true); }}
            onPointerUp={() => setHolding(false)}
            onPointerCancel={() => setHolding(false)}
            onClick={(e) => { if (e.detail === 0) { setP(1); setArrived(true); } }}
            className="rounded-full"
            style={{
              position: 'absolute', left: '50%', bottom: '6%', width: 84, height: 84, transform: 'translateX(-10%)',
              border: '3px dashed var(--color-cobalt)',
              background: holding ? 'rgba(252, 211, 77, 0.55)' : 'rgba(252, 211, 77, 0.2)',
              transition: 'background 200ms ease',
              touchAction: 'none', cursor: 'pointer',
            }}
          />
        )}

        <img
          src={creatureArt(friend.creatureId, arrived ? 'friend' : 'small')}
          alt=""
          draggable={false}
          className={!reduced && holding && !arrived ? 'wz-walk' : (!reduced && arrived ? 'wz-hop' : '')}
          style={{
            position: 'absolute', aspectRatio: '1 / 1', objectFit: 'contain', transform: 'translateX(-50%)',
            transition: reduced ? 'none' : (arrived ? 'left 600ms ease, bottom 600ms ease, width 600ms ease' : 'none'),
            ...creatureStyle,
          }}
        />
        <StickerBurst active={arrived} size={320} />
      </div>
      <Line id={lineId} />
      {arrived && (
        <div style={{ marginTop: 24, width: '100%', maxWidth: 360 }}>
          <PillButton full size="lg" arrow onClick={finish}>Weiter</PillButton>
        </div>
      )}
      <WesenKeyframes />
    </div>
  );
}

// ── Grow ─────────────────────────────────────────────────────────────

export function WesenGrow({ friend, onDone }) {
  const { actions } = useTask();
  const reduced = useReducedMotion();
  const [showNew, setShowNew] = useState(reduced);
  const firedRef = useRef(false);
  const meta = creatureMeta(friend.creatureId);
  const lineId = `wesen_grow_${friend.creatureId}`;
  useSayOnce(lineId, 900);
  useEffect(() => {
    const t = setTimeout(() => setShowNew(true), reduced ? 0 : 500);
    return () => clearTimeout(t);
  }, [reduced]);
  const finish = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    actions?.wesenMarkSeen?.(friend.id, 'grownSeen');
    onDone?.();
  };
  const fade = reduced ? 'none' : 'opacity 1200ms ease, transform 1200ms ease';
  return (
    <div role="dialog" aria-modal="true" aria-label={`${meta?.name} ist gewachsen`} data-testid="wesen-grow" className="bg-white text-ink" style={SHELL}>
      <div className="relative rounded-[28px] bg-paper" style={{ width: 260, height: 260, border: '3px solid var(--color-ink)' }}>
        <img src={creatureArt(friend.creatureId, 'friend')} alt="" style={{ position: 'absolute', inset: 30, width: 200, height: 200, opacity: showNew ? 0 : 1, transition: fade }} />
        <img src={creatureArt(friend.creatureId, 'grown')} alt="" style={{ position: 'absolute', inset: 10, width: 240, height: 240, opacity: showNew ? 1 : 0, transform: showNew ? 'scale(1)' : 'scale(0.85)', transition: fade }} />
        <StickerBurst active={showNew} size={320} />
      </div>
      <Line id={lineId} />
      <div style={{ marginTop: 26, width: '100%', maxWidth: 360 }}>
        <PillButton full size="lg" arrow onClick={finish}>Weiter</PillButton>
      </div>
    </div>
  );
}

// ── Goodbye (moves out) ──────────────────────────────────────────────

export function WesenGoodbye({ friend, onDone }) {
  const { actions } = useTask();
  const reduced = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const firedRef = useRef(false);
  const meta = creatureMeta(friend.creatureId);
  const lineId = `wesen_bye_${friend.creatureId}`;
  useSayOnce(lineId, 700);
  const pic = taskPictureUrl(`s_${friend.taskKind}`);
  const bye = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setLeaving(true);
    setTimeout(() => {
      actions?.wesenMarkSeen?.(friend.id, 'goodbyeSeen');
      onDone?.();
    }, reduced ? 0 : 1100);
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={`${meta?.name} zieht in die Welt`} data-testid="wesen-goodbye" className="bg-white text-ink" style={SHELL}>
      <div
        className="flex items-end justify-center"
        style={{
          gap: 14,
          transform: leaving ? 'translateY(-60vh) scale(0.5)' : 'none',
          opacity: leaving ? 0 : 1,
          transition: reduced ? 'none' : 'transform 1100ms ease-in, opacity 1100ms ease-in',
        }}
      >
        <img src={creatureArt(friend.creatureId, 'grown')} alt={meta?.name || ''} style={{ width: 200, height: 200, objectFit: 'contain' }} className={reduced ? '' : 'wz-bob'} />
        {pic && (
          <div className="flex flex-col items-center rounded-[18px] bg-paper" style={{ padding: 8, border: '2.5px solid var(--color-ink)' }}>
            <img src={pic} alt="" style={{ width: 84, height: 84, objectFit: 'contain' }} />
            <span className="bb-display" style={{ fontSize: 15 }}>{TASK_LABEL[friend.taskKind]}</span>
          </div>
        )}
      </div>
      <Line id={lineId} />
      <div style={{ marginTop: 26, width: '100%', maxWidth: 360 }}>
        <PillButton full size="lg" onClick={bye} disabled={leaving}>{`Tschüss, ${meta?.name || ''}!`}</PillButton>
      </div>
      <WesenKeyframes />
    </div>
  );
}

export function WesenKeyframes() {
  return (
    <style>{`
      @keyframes wz-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5%); } }
      @keyframes wz-walk { 0%, 100% { rotate: -4deg; } 50% { rotate: 4deg; } }
      @keyframes wz-hop { 0% { translate: 0 0; } 30% { translate: 0 -18%; } 60% { translate: 0 0; } 80% { translate: 0 -6%; } 100% { translate: 0 0; } }
      .wz-bob { animation: wz-bob 2.4s ease-in-out infinite; }
      .wz-walk { animation: wz-walk 0.45s ease-in-out infinite; }
      .wz-hop { animation: wz-hop 0.8s ease-out 1; }
      @media (prefers-reduced-motion: reduce) { .wz-bob, .wz-walk, .wz-hop { animation: none; } }
    `}</style>
  );
}
