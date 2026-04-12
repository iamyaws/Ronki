import React, { useRef } from 'react';
import { T, RAINBOW, RAINBOW_LABELS, MOOD_EMOJIS, JOURNAL_QUESTIONS } from '../constants';
import { useGame } from '../context/GameContext';

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

export default function Journal() {
  const { state, computed, actions, ui } = useGame();
  const { done, total } = computed;
  const journalRef = useRef(null);

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...

  return (
    <div className="lotus-pattern px-6 pb-32 space-y-10">

      {/* ── Header ── */}
      <section className="space-y-3">
        <h2 className="text-4xl font-bold font-headline text-on-surface">Mein Journal</h2>
        <p className="text-on-surface-variant font-body text-lg leading-relaxed">
          Wie fühlst du dich heute in deiner mystischen Wiese?
        </p>
      </section>

      {/* ── Mood Selector — Tactile Floating Bubbles ── */}
      <section className="space-y-6">
        <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline/80">
          Aktuelle Stimmung
        </h3>
        <div className="flex justify-between items-end px-1">
          {MOOD_EMOJIS.map((emoji, i) => {
            const isSelected = state.moodAM === i;
            return (
              <button
                key={i}
                aria-label={`Stimmung: ${MOOD_LABELS[i] || `${i+1}`}`}
                onClick={() => actions.setMood("moodAM", i)}
                className={`btn-tap flex flex-col items-center gap-3 rounded-full transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary text-white p-5 scale-110 -translate-y-3 shadow-2xl shadow-primary/30'
                    : 'bg-surface-container-low p-4 hover:bg-surface-container'
                }`}
                style={isSelected ? {
                  boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), 0 20px 30px -10px rgba(83,0,183,0.3)',
                } : {
                  boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.03)',
                }}
              >
                <span className={`${isSelected ? 'text-5xl' : 'text-4xl'} transition-all`}>
                  {emoji}
                </span>
                <span className={`font-label text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? '' : 'text-outline/60'
                }`}>
                  {MOOD_LABELS[i] || ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Bento Layout: Weekly Calendar + Thought Box ── */}
      <div className="space-y-6">

        {/* Weekly Calendar — Gemstone Dots (Vertical List) */}
        <section className="bg-white/60 backdrop-blur-sm p-8 rounded-lg border border-white/40 shadow-sm relative overflow-hidden min-h-[320px]">
          <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline/80 mb-8">
            Wochenübersicht
          </h3>
          <div className="space-y-5">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => {
              const dayIdx = i + 1 > 6 ? 0 : i + 1; // Mo=1...Sa=6, So=0
              const isToday = dayIdx === dayOfWeek;
              const isPast = dayIdx < dayOfWeek || (dayOfWeek === 0 && dayIdx > 0);
              return (
                <div key={day} className={`flex justify-between items-center ${!isPast && !isToday ? 'opacity-40' : ''}`}>
                  <span className={`font-label text-base ${isToday ? 'font-bold text-primary' : 'font-semibold text-outline/60'}`}>
                    {day}
                  </span>
                  <div className="flex gap-2">
                    {isPast || isToday ? (
                      <div className={`w-4 h-4 rounded-full ${isToday ? 'bg-primary ring-4 ring-primary/10' : 'bg-secondary-container'}`}
                           style={{ boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.8)' }} />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-surface-container"
                           style={{ boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.8)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Daily Reflection — Journal Paper Feel */}
        <section className="bg-white p-8 rounded-lg border border-surface-variant/30 shadow-md flex flex-col min-h-[320px]">
          <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline/80 mb-6">
            Gedanken heute
          </h3>
          <div className="flex-grow relative">
            <textarea
              ref={journalRef}
              value={state.journal || ""}
              onChange={e => actions.setJournal(e.target.value)}
              placeholder="Was beschäftigt deinen Geist?"
              className="w-full h-full bg-transparent border-none focus:ring-0 p-0 text-on-surface font-body text-lg resize-none placeholder:text-outline/30 outline-none"
              style={{
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
                backgroundSize: '100% 2rem',
                lineHeight: '2rem',
                minHeight: 140,
              }}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn-tap bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-label font-bold text-base flex items-center gap-3 hover:shadow-lg transition-all">
              Speichern
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </button>
          </div>
        </section>
      </div>

      {/* ── Rainbow Progress ── */}
      <section className="mm-card p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline/80">
            Regenbogen heute
          </h3>
          {(state.rainbow || []).every(Boolean) && (
            <span className="font-label font-bold text-sm text-emerald-dark">+25 HP</span>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          {RAINBOW.map((e, i) => {
            const d = (state.rainbow || [])[i];
            return (
              <div key={i} className="text-center">
                <div className={`text-3xl transition-opacity ${d ? 'opacity-100' : 'opacity-25'}`}>{e}</div>
                <div className={`font-label text-[10px] font-bold mt-1 ${d ? 'text-emerald-dark' : 'text-outline/40'}`}>
                  {d ? "✓" : RAINBOW_LABELS[i]}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Guided Questions ── */}
      {JOURNAL_QUESTIONS.map(q => {
        const ans = (state.jAnswers || {})[q.id];
        return (
          <section key={q.id} className="mm-card p-6">
            <h3 className="font-label font-bold text-base text-on-surface-variant mb-4">{q.q}</h3>
            <div className="flex flex-wrap gap-3">
              {q.opts.map(o => (
                <button
                  key={o.v}
                  onClick={() => {
                    actions.setJAnswer(q.id, o.v);
                    if (q.id === "tomorrow") actions.commitTomorrow({ type: o.v, text: o.l });
                  }}
                  className={`btn-tap rounded-full px-5 py-3 font-body text-base font-bold transition-all ${
                    ans === o.v
                      ? 'bg-primary/10 border-2 border-primary/40 text-primary'
                      : 'bg-surface-container border-2 border-transparent text-on-surface hover:border-outline-variant/30'
                  }`}
                  style={{ minHeight: 48 }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {/* ── Evening Mood (if not set) ── */}
      {state.moodPM === null && (
        <section className="mm-card p-6">
          <h3 className="font-label font-bold text-xs uppercase tracking-widest text-primary mb-5">
            Abendstimmung
          </h3>
          <div role="group" aria-label="Abendstimmung wählen" className="flex justify-center gap-3">
            {MOOD_EMOJIS.map((e, i) => (
              <button
                key={i}
                aria-label={`Stimmung ${i + 1}`}
                onClick={() => actions.setMood("moodPM", i)}
                className={`btn-tap text-3xl p-3 rounded-full transition-all ${
                  state.moodPM === i ? 'bg-primary-container scale-110' : 'hover:bg-surface-container'
                }`}
                style={{ minHeight: 52, minWidth: 52 }}
              >
                {e}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Privacy Badge ── */}
      <div className="flex justify-center items-center gap-2 text-outline/40 pt-4">
        <span className="material-symbols-outlined text-sm">lock</span>
        <span className="font-label text-[11px] font-bold uppercase tracking-widest">
          Ende-zu-Ende verschlüsselt
        </span>
      </div>

      {/* Bodhi leaf */}
      <div className="flex justify-center py-2 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
        </svg>
      </div>
    </div>
  );
}
