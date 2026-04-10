import React, { useRef } from 'react';
import { T, RAINBOW, RAINBOW_LABELS, MOOD_EMOJIS, JOURNAL_QUESTIONS } from '../constants';
import { ViewHeader } from './ui';
import { useGame } from '../context/GameContext';

export default function Journal() {
  const { state, computed, actions, ui } = useGame();
  const { done, total } = computed;
  const journalRef = useRef(null);

  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px", background: "#EFF3FB" }}>
      <ViewHeader onBack={() => ui.setView("hub")} title="Tagebuch" />

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#1E1B4B" }}>{new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>

      {/* Mood summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="game-card" style={{ flex: 1, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>{"\u{1F305}"} Morgens</div>
          <div style={{ fontSize: "2.2rem" }}>{state.moodAM !== null ? MOOD_EMOJIS[state.moodAM] : "\u2014"}</div>
        </div>
        <div className="game-card" style={{ flex: 1, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>{"\u{1F319}"} Abends</div>
          <div style={{ fontSize: "2.2rem" }}>{state.moodPM !== null ? MOOD_EMOJIS[state.moodPM] : "\u2014"}</div>
          {state.moodPM === null && <div role="group" aria-label="Abendstimmung wählen" style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 6 }}>{MOOD_EMOJIS.map((e, i) => <button key={i} aria-label={`Stimmung ${i + 1} von 6`} onClick={() => actions.setMood("moodPM", i)} style={{ fontSize: "1.3rem", background: "none", border: "none", cursor: "pointer", padding: "3px", minHeight: 36, minWidth: 36 }}>{e}</button>)}</div>}
        </div>
      </div>

      {/* Rainbow */}
      <div className="game-card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>{"\u{1F308}"} Regenbogen heute</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>{RAINBOW.map((e, i) => {
          const d = (state.rainbow || [])[i];
          return <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", opacity: d ? 1 : 0.25 }}>{e}</div>
            <div style={{ fontSize: ".85rem", fontWeight: 700, color: d ? T.successDark : T.textLight, marginTop: 2 }}>{d ? "\u2713" : RAINBOW_LABELS[i]}</div>
          </div>;
        })}</div>
        {(state.rainbow || []).every(Boolean) && <div style={{ textAlign: "center", fontSize: ".85rem", fontWeight: 800, color: T.success, marginTop: 8 }}>{"\u{1F389}"} Alle Farben geschafft! +25 {"\u2B50"}</div>}
      </div>

      {/* Guided Journal */}
      {JOURNAL_QUESTIONS.map(q => {
        const ans = (state.jAnswers || {})[q.id];
        return (
          <div key={q.id} className="game-card" style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 10 }}>{q.q}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {q.opts.map(o => (
                <button key={o.v} onClick={() => actions.setJAnswer(q.id, o.v)} style={{
                  background: ans === o.v ? `${T.primary}10` : "rgba(180,120,40,0.04)",
                  border: ans === o.v ? `2.5px solid ${T.primary}40` : "2.5px solid rgba(180,120,40,0.08)",
                  borderRadius: 50, padding: "8px 16px", cursor: "pointer",
                  fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: ".85rem",
                  color: ans === o.v ? T.primary : T.textPrimary,
                  transition: "all .15s", minHeight: 40,
                }}>{o.l}</button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Free text */}
      <div className="game-card" style={{ padding: 14 }}>
        <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 10 }}>{"\u270F\uFE0F"} Noch etwas? (Optional)</div>
        <textarea
          ref={journalRef}
          value={state.journal || ""}
          onChange={e => actions.setJournal(e.target.value)}
          placeholder="Was dich bewegt, was passiert ist, ein Highlight..."
          style={{ width: "100%", minHeight: 100, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 16, padding: "14px 16px", color: T.textPrimary, fontSize: ".9rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      {/* Today stats */}
      <div className="game-card" style={{ padding: 14, marginTop: 16 }}>
        <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 8 }}>{"\u{1F4CA}"} Heute</div>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div><div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.25rem", fontWeight: 700, color: T.primary }}>{done}/{total}</div><div style={{ fontSize: ".85rem", color: T.textSecondary }}>Aufgaben</div></div>
          <div><div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.25rem", fontWeight: 700, color: T.accentDark }}>+{state.dt}min</div><div style={{ fontSize: ".85rem", color: T.textSecondary }}>Verdient</div></div>
          <div><div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.25rem", fontWeight: 700, color: T.success }}>{(state.rainbow || []).filter(Boolean).length}/6</div><div style={{ fontSize: ".85rem", color: T.textSecondary }}>Farben</div></div>
        </div>
      </div>
    </div>
  );
}
