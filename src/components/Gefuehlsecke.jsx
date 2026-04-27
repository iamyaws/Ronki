import React, { useState, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import { useVoice } from '../companion/useVoice';
import VoiceBubble from './VoiceBubble';
import BaumPoseBeat from './BaumPoseBeat';
import SFX from '../utils/sfx';

/**
 * Gefühlsecke — on-demand feelings corner.
 *
 * Flow:
 *   picker  — "Wie fühlst du dich gerade?" + 5 big emoji cards
 *   tool    — matching regulation tool for the picked feeling
 *
 * Tools (one per feeling, expandable later):
 *   😊 gut         → tiny celebration moment ("Ronki freut sich mit dir!")
 *   😤 wuetend     → Box-Atmung (4-4-4-4, 2 cycles ≈ 32s)
 *   😢 traurig     → simple journal field ("Was ist los?") → feelingsLog note
 *   😰 aengstlich  → BaumPoseBeat (30s tree pose, reused)
 *   😴 muede       → static rest card with 3 quiet suggestions
 *
 * On picking an emotion we immediately call actions.logFeeling(feeling). Traurig
 * additionally patches the note when Louis saves text.
 *
 * Props:
 *   - onClose: () => void
 */

const FEELINGS = [
  { id: 'gut',        emoji: '😊', label: 'Gut',                   color: '#34d399', bg: 'rgba(52,211,153,0.12)',  ring: 'rgba(52,211,153,0.35)' },
  { id: 'wuetend',    emoji: '😤', label: 'Wütend',                color: '#f87171', bg: 'rgba(248,113,113,0.12)', ring: 'rgba(248,113,113,0.35)' },
  { id: 'traurig',    emoji: '😢', label: 'Traurig',               color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  ring: 'rgba(96,165,250,0.35)' },
  { id: 'aengstlich', emoji: '😰', label: 'Ängstlich',             color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', ring: 'rgba(167,139,250,0.35)' },
  { id: 'muede',      emoji: '😴', label: 'Müde',                  color: '#fcd34d', bg: 'rgba(252,211,77,0.18)',  ring: 'rgba(252,211,77,0.4)' },
];

export default function Gefuehlsecke({ onClose }) {
  const { actions } = useTask();
  const voice = useVoice();
  const [mode, setMode] = useState('picker'); // 'picker' | 'tool'
  const [feeling, setFeeling] = useState(null);

  // Escape key closes
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePick = (id) => {
    SFX.play('pop');
    actions.logFeeling(id);
    setFeeling(id);
    setMode('tool');
    // Mood-mirrored Ronki ack — fires per-feeling so the kid feels seen
    // before the regulation tool even starts. See docs/ronki-voicelines.md
    // (gefuehl_pick_* triggers added in the 2026-04-27 character pass).
    voice.say(`gefuehl_pick_${id}`);
  };

  // Happy-path completion handler. Fires the matching gefuehl_done_*
  // trigger so Ronki wraps the moment with warmth, then closes the
  // modal. Bail/escape paths route through onClose directly so the
  // closer voice line only fires when the kid actually finished.
  const handleSuccess = () => {
    if (feeling) voice.say(`gefuehl_done_${feeling}`);
    onClose?.();
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[500] flex items-center justify-center px-5 overflow-y-auto py-8"
      style={{ background: 'rgba(10,20,22,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={{
          background: '#fff8f1',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.14)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        {/* Close button always accessible */}
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center z-20 active:scale-95 transition-transform"
          style={{ background: 'rgba(18,67,70,0.08)', border: '1px solid rgba(18,67,70,0.12)' }}
        >
          <span className="material-symbols-outlined text-xl text-primary">close</span>
        </button>

        {/* Voice bubble — chip-variant inside the modal, top-of-content
            so the kid sees Ronki's reaction without it eating much
            real estate. Lives outside the per-flow components so the
            same bubble renders across picker → tool transitions. */}
        {voice.line && (
          <div className="px-6 pt-4">
            <VoiceBubble line={voice.line} onDismiss={voice.dismiss} variant="chip" />
          </div>
        )}

        {mode === 'picker' && <Picker onPick={handlePick} />}
        {mode === 'tool' && feeling === 'gut' && <GutFlow onClose={onClose} onSuccess={handleSuccess} />}
        {mode === 'tool' && feeling === 'wuetend' && <WuetendFlow onClose={onClose} onSuccess={handleSuccess} />}
        {mode === 'tool' && feeling === 'traurig' && <TraurigFlow onClose={onClose} onSuccess={handleSuccess} />}
        {mode === 'tool' && feeling === 'aengstlich' && <AengstlichFlow onClose={onClose} onSuccess={handleSuccess} />}
        {mode === 'tool' && feeling === 'muede' && <MuedeFlow onClose={onClose} onSuccess={handleSuccess} />}
      </div>
    </div>
  );
}

// ── Mode 1: Picker ──
function Picker({ onPick }) {
  return (
    <div className="px-6 pt-10 pb-8 flex flex-col items-center">
      <p
        className="font-bold text-xs font-label uppercase tracking-[0.22em]"
        style={{ color: '#A83E2C' }}
      >
        Gefühlsecke
      </p>
      <h2
        className="font-headline font-bold text-center mt-2 text-on-surface leading-tight"
        style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.75rem' }}
      >
        Wie fühlst du dich gerade?
      </h2>
      <p className="font-body text-base text-on-surface-variant mt-2 text-center">
        Tipp auf ein Gefühl. Ronki hilft dir.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full mt-8">
        {FEELINGS.map((f) => (
          <button
            key={f.id}
            onClick={() => onPick(f.id)}
            className="rounded-2xl flex flex-col items-center justify-center gap-2 p-4 active:scale-95 transition-transform"
            style={{
              minHeight: 112,
              minWidth: 64,
              background: f.bg,
              border: `2px solid ${f.ring}`,
              boxShadow: '0 4px 12px rgba(30,27,23,0.06)',
            }}
          >
            <span
              className="select-none leading-none"
              style={{ fontSize: 48, fontFamily: 'Fredoka, sans-serif' }}
            >
              {f.emoji}
            </span>
            <span
              className="font-headline font-bold text-lg"
              style={{ color: f.color, fontFamily: 'Fredoka, sans-serif' }}
            >
              {f.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Mode 2a: Gut — tiny celebration ──
function GutFlow({ onClose, onSuccess }) {
  return (
    <div className="px-6 pt-12 pb-8 flex flex-col items-center text-center relative overflow-hidden">
      {/* Sparkle dots */}
      <SparkleDots />

      <span style={{ fontSize: 96, fontFamily: 'Fredoka, sans-serif' }} className="select-none relative z-10">
        😊
      </span>
      <h3
        className="font-headline font-bold mt-4 relative z-10"
        style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.75rem', color: '#059669' }}
      >
        Schön!
      </h3>
      <p className="font-body text-lg text-on-surface mt-3 relative z-10 max-w-xs">
        Ronki freut sich mit dir.
      </p>

      <button
        onClick={onSuccess || onClose}
        className="mt-10 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform relative z-10"
        style={{ background: '#34d399', color: 'white', boxShadow: '0 6px 18px rgba(52,211,153,0.35)' }}
      >
        Weiter
      </button>
    </div>
  );
}

function SparkleDots() {
  // Light decorative sparkles around the emoji — no framer dependency needed.
  return (
    <>
      <span aria-hidden="true" className="absolute" style={{ top: '14%', left: '12%', fontSize: 22, animation: 'sparkle 2.4s ease-in-out infinite' }}>✦</span>
      <span aria-hidden="true" className="absolute" style={{ top: '22%', right: '18%', fontSize: 18, animation: 'sparkle 2.8s ease-in-out 0.4s infinite' }}>✦</span>
      <span aria-hidden="true" className="absolute" style={{ top: '42%', left: '8%',  fontSize: 14, animation: 'sparkle 2.2s ease-in-out 0.9s infinite' }}>✦</span>
      <span aria-hidden="true" className="absolute" style={{ top: '38%', right: '10%', fontSize: 16, animation: 'sparkle 2.6s ease-in-out 1.3s infinite' }}>✦</span>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50%      { opacity: 0.95; transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}

// ── Mode 2b: Wütend — Box-Atmung (4-4-4-4, 2 cycles ≈ 32s) ──
function WuetendFlow({ onClose, onSuccess }) {
  const { actions } = useTask();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0); // 0 Ein, 1 Halten, 2 Aus, 3 Halten
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycle, setCycle] = useState(0);
  const practicedRef = useRef(false); // guard so we only count one practice per flow

  const PHASES = [
    { label: 'Ein',    instruction: 'Atme ein',   color: '#34d399' },
    { label: 'Halten', instruction: 'Halte still', color: '#60a5fa' },
    { label: 'Aus',    instruction: 'Atme aus',   color: '#a78bfa' },
    { label: 'Halten', instruction: 'Halte still', color: '#f59e0b' },
  ];

  useEffect(() => {
    if (!started || done) return;
    if (secondsLeft <= 0) {
      // Advance phase
      const nextPhase = (phaseIdx + 1) % 4;
      const nextCycle = nextPhase === 0 ? cycle + 1 : cycle;
      if (nextPhase === 0 && cycle >= 1) {
        // Completed 2 cycles — count this as one Box-Atmung practice so
        // Ronki can learn it. Guard with practicedRef so re-renders
        // during the "done" state don't increment multiple times.
        if (!practicedRef.current) {
          practicedRef.current = true;
          actions.practiceSkill?.('boxAtmung');
        }
        setDone(true);
        return;
      }
      setPhaseIdx(nextPhase);
      setCycle(nextCycle);
      setSecondsLeft(4);
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, done, secondsLeft, phaseIdx, cycle]);

  const phase = PHASES[phaseIdx];
  const pct = ((4 - secondsLeft) / 4) * 100;
  // Ring grows during "Ein", shrinks during "Aus", holds otherwise
  const ringScale = phaseIdx === 0 ? 0.7 + (pct / 100) * 0.3
                  : phaseIdx === 2 ? 1.0 - (pct / 100) * 0.3
                  : phaseIdx === 1 ? 1.0
                  : 0.7;

  return (
    <div className="px-6 pt-12 pb-8 flex flex-col items-center text-center">
      <p className="font-bold text-xs font-label uppercase tracking-[0.22em]" style={{ color: '#A83E2C' }}>
        Box-Atmung
      </p>
      <h3
        className="font-headline font-bold mt-2"
        style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.75rem', color: '#f87171' }}
      >
        {!started ? 'Lass uns zusammen atmen' : done ? 'Stark gemacht!' : phase.instruction}
      </h3>
      {!started && (
        <p className="font-body text-base text-on-surface-variant mt-3 max-w-xs">
          Ronki atmet mit dir. Zwei Runden, dann ist es vorbei.
        </p>
      )}

      {started && !done && (
        <div className="relative w-56 h-56 mt-8 flex items-center justify-center">
          {/* Outer breath ring — scales with phase */}
          <div
            className="absolute rounded-full transition-transform"
            style={{
              width: 220,
              height: 220,
              background: `${phase.color}22`,
              border: `3px solid ${phase.color}`,
              transform: `scale(${ringScale})`,
              transitionDuration: '1s',
              transitionTimingFunction: 'linear',
            }}
          />
          <div
            className="relative rounded-full flex flex-col items-center justify-center"
            style={{
              width: 140,
              height: 140,
              background: 'white',
              boxShadow: `0 0 30px ${phase.color}40`,
              border: `2px solid ${phase.color}`,
            }}
          >
            <span
              className="font-headline font-bold tabular-nums"
              style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 44, color: phase.color }}
            >
              {secondsLeft}
            </span>
            <span className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: phase.color }}>
              {phase.label}
            </span>
          </div>
        </div>
      )}

      {started && !done && (
        <p className="font-label text-sm text-on-surface-variant mt-6">
          Runde {cycle + 1} von 2
        </p>
      )}

      {!started && (
        <button
          onClick={() => { SFX.play('pop'); setStarted(true); }}
          className="mt-10 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
          style={{ background: '#f87171', color: 'white', boxShadow: '0 6px 18px rgba(248,113,113,0.35)' }}
        >
          Ich bin bereit
        </button>
      )}

      {done && (
        <button
          onClick={onSuccess || onClose}
          className="mt-10 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
          style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 18px rgba(252,211,77,0.4)' }}
        >
          Fertig
        </button>
      )}
    </div>
  );
}

// ── Mode 2c: Traurig — simple journal entry ──
function TraurigFlow({ onClose, onSuccess }) {
  const { actions, state } = useTask();
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = note.trim();
    if (!trimmed) {
      // Allow closing without saving — but if they hit save with empty, just close
      onClose?.();
      return;
    }
    // Patch the latest feelingsLog entry with the note text
    const currentLog = state?.feelingsLog || [];
    if (currentLog.length > 0) {
      const last = currentLog[currentLog.length - 1];
      if (last.feeling === 'traurig' && !last.note) {
        const newLog = [...currentLog];
        newLog[newLog.length - 1] = { ...last, note: trimmed };
        actions.patchState({ feelingsLog: newLog });
      }
    }
    // Optional: also add to journal gratitude list as a memory
    const gratitude = state?.journalGratitude || [];
    actions.patchState({ journalGratitude: [...gratitude, trimmed] });
    setSaved(true);
    setTimeout(() => (onSuccess || onClose)?.(), 1400);
  };

  return (
    <div className="px-6 pt-12 pb-8 flex flex-col items-center text-center">
      <span style={{ fontSize: 72, fontFamily: 'Fredoka, sans-serif' }} className="select-none">
        😢
      </span>
      <h3
        className="font-headline font-bold mt-3"
        style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.65rem', color: '#2563eb' }}
      >
        {saved ? 'Danke dir.' : 'Das darf sein.'}
      </h3>
      {!saved && (
        <p className="font-body text-base text-on-surface-variant mt-2 max-w-xs">
          Erzähl Ronki davon, wenn du magst.
        </p>
      )}

      {!saved ? (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Was ist los?"
            rows={4}
            className="mt-6 w-full rounded-2xl p-4 font-body text-base resize-none"
            style={{
              background: 'rgba(96,165,250,0.08)',
              border: '1.5px solid rgba(96,165,250,0.3)',
              color: '#1c1b1e',
              outline: 'none',
            }}
          />
          <div className="flex gap-3 mt-6 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{ background: 'rgba(18,67,70,0.08)', color: '#124346', border: '1.5px solid rgba(18,67,70,0.15)' }}
            >
              Lieber nicht
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{ background: '#60a5fa', color: 'white', boxShadow: '0 6px 18px rgba(96,165,250,0.35)' }}
            >
              Ronki zeigen
            </button>
          </div>
        </>
      ) : (
        <p className="font-body text-lg text-on-surface mt-6 max-w-xs">
          Ronki hat es gehört.
        </p>
      )}
    </div>
  );
}

// ── Mode 2d: Ängstlich — BaumPoseBeat (30s tree pose) ──
function AengstlichFlow({ onClose, onSuccess }) {
  return (
    <div className="px-2 pt-8 pb-4">
      <p
        className="font-bold text-xs font-label uppercase tracking-[0.22em] text-center"
        style={{ color: '#A83E2C' }}
      >
        Baum-Pose
      </p>
      <p className="font-body text-base text-on-surface-variant text-center mt-2 px-6">
        Werde zu einem Baum. Fest und ruhig.
      </p>
      <BaumPoseBeat onComplete={onSuccess || onClose} />
    </div>
  );
}

// ── Mode 2e: Müde — static rest card ──
function MuedeFlow({ onClose, onSuccess }) {
  const suggestions = [
    { icon: '📖', text: 'Schau ein Buch an' },
    { icon: '🪟', text: 'Hör dem Fenster zu' },
    { icon: '✏️', text: 'Mach eine Zeichnung' },
  ];

  return (
    <div className="px-6 pt-12 pb-8 flex flex-col items-center text-center">
      <span style={{ fontSize: 72, fontFamily: 'Fredoka, sans-serif' }} className="select-none">
        😴
      </span>
      <h3
        className="font-headline font-bold mt-3"
        style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.65rem', color: '#a16207' }}
      >
        Das versteh ich.
      </h3>
      <p className="font-body text-base text-on-surface-variant mt-2 max-w-xs">
        Hier sind ein paar ruhige Ideen.
      </p>

      <div className="flex flex-col gap-3 w-full mt-6">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
              background: 'rgba(252,211,77,0.1)',
              border: '1.5px solid rgba(252,211,77,0.3)',
            }}
          >
            <span className="text-3xl" aria-hidden="true">{s.icon}</span>
            <span className="font-body text-base text-on-surface text-left flex-1">{s.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSuccess || onClose}
        className="mt-8 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
        style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 18px rgba(252,211,77,0.4)' }}
      >
        Schlaf gut
      </button>
    </div>
  );
}
