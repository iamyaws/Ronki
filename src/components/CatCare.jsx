import React, { useState } from 'react';
import { T, CAT_STAGES } from '../constants';
import { getCatStage, getCatStageProg } from '../utils/helpers';
import { ViewHeader } from './ui';
import Companion from './Companion';
import { useGame } from '../context/GameContext';

const ACTIONS = [
  { key: "fed", icon: "\u{1F363}", label: "F\u00FCttern", sfx: "feed", msg: "Mmmh, lecker! *mampf*", color: "#F97316" },
  { key: "petted", icon: "\u{1F90D}", label: "Streicheln", sfx: "purr", msg: "Schnurrr... das ist sch\u00F6n!", color: "#EC4899" },
  { key: "played", icon: "\u{1F9F6}", label: "Spielen", sfx: "pop", msg: "Miau! Fang mich!", color: "#6D28D9" },
];

export default function CatCare() {
  const { state, actions, ui } = useGame();
  const [anim, setAnim] = useState(null);
  const [msg, setMsg] = useState(null);

  if (!state) return null;

  const stage = getCatStage(state.catEvo || 0);
  const prog = getCatStageProg(state.catEvo || 0);
  const stageInfo = CAT_STAGES[stage];
  const nextStage = CAT_STAGES[stage + 1];

  const hunger = state.catHunger ?? 100;
  const happy = state.catHappy ?? 100;
  const energy = state.catEnergy ?? 100;
  const avg = Math.round((hunger + happy + energy) / 3);
  const catMood = avg >= 75 ? "excited" : avg >= 50 ? "happy" : avg >= 25 ? "neutral" : "sleepy";

  const doAction = (action) => {
    const doneKey = `cat${action.key.charAt(0).toUpperCase() + action.key.slice(1)}`;
    if (state[doneKey]) return;
    if (action.key === "fed") actions.feedCat();
    else if (action.key === "petted") actions.petCat();
    else if (action.key === "played") actions.playCat();
    setAnim(action.key);
    setMsg(action.msg);
    setTimeout(() => { setAnim(null); setMsg(null); }, 3000);
  };

  const stats = [
    { label: "Hunger", value: hunger, color: "#F97316", icon: "\u{1F363}" },
    { label: "Gl\u00FCck", value: happy, color: "#EC4899", icon: "\u{1F49B}" },
    { label: "Energie", value: energy, color: "#6D28D9", icon: "\u26A1" },
  ];

  return (
    <div className="view-enter" style={{ minHeight: "100vh" }}>
      <ViewHeader title={`${state.catName || "Katze"}`} icon={stageInfo.emoji} onBack={() => ui.setView("hub")} />

      <div style={{ padding: "0 16px 100px" }}>
        {/* Evolution Card */}
        <div className="game-card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: T.primary, textTransform: "uppercase" }}>Entwicklung</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: T.textPrimary }}>{stageInfo.emoji} {stageInfo.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.accent }}>{state.catEvo || 0} EP</div>
              {!prog.maxStage && <div style={{ fontSize: ".85rem", color: T.textLight }}>{prog.cur}/{prog.need} bis {nextStage?.name}</div>}
            </div>
          </div>
          <div style={{ background: "rgba(180,120,40,0.08)", borderRadius: 50, height: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 50, width: `${prog.maxStage ? 100 : Math.min(100, (prog.cur / prog.need) * 100)}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`, transition: "width .6s ease" }} />
          </div>
          {prog.maxStage && <div style={{ fontSize: ".85rem", color: T.success, fontWeight: 800, marginTop: 4, textAlign: "center" }}>{"\u2B50"} Maximale Stufe erreicht!</div>}
        </div>

        {/* Cat Display */}
        <div style={{ display: "flex", justifyContent: "center", margin: "24px 0 16px", position: "relative" }}>
          <div style={{ animation: anim ? "catBounce 0.4s ease" : "catIdle 4s ease-in-out infinite", position: "relative" }}>
            <Companion type={state.companionType} variant={state.catVariant} mood={catMood} size={140} stage={stage} />
          </div>
          {msg && <div style={{
            position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
            background: "white", borderRadius: 16, padding: "10px 20px", fontSize: "1rem", fontWeight: 700,
            color: T.textPrimary, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", whiteSpace: "nowrap",
            animation: "victorySlideUp 0.3s ease",
          }}>{msg}</div>}
        </div>

        {/* Stats */}
        <div className="game-card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".9rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 10 }}>Zustand</div>
          {stats.map(s => (
            <div key={s.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: ".95rem", fontWeight: 700, color: T.textPrimary }}>{s.icon} {s.label}</span>
                <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: s.value > 50 ? s.color : s.value > 25 ? T.accentDark : T.danger }}>{s.value}%</span>
              </div>
              <div style={{ background: "rgba(180,120,40,0.08)", borderRadius: 50, height: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 50, width: `${s.value}%`, background: s.value > 50 ? s.color : s.value > 25 ? T.accentDark : T.danger, transition: "width .6s ease" }} />
              </div>
            </div>
          ))}
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <span style={{ fontSize: ".9rem", fontWeight: 700, color: avg >= 75 ? T.success : avg >= 50 ? T.primary : avg >= 25 ? T.accentDark : T.danger }}>
              {avg >= 75 ? "\u{1F60D} Bestens versorgt!" : avg >= 50 ? "\u{1F60A} Zufrieden" : avg >= 25 ? "\u{1F615} Braucht Aufmerksamkeit" : "\u{1F622} Bitte k\u00FCmmere dich um mich!"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          {ACTIONS.map(a => {
            const doneKey = `cat${a.key.charAt(0).toUpperCase() + a.key.slice(1)}`;
            const done = state[doneKey];
            return (
              <button key={a.key} className={done ? "" : "btn-tap"} onClick={() => doAction(a)} disabled={done} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: done ? `${a.color}10` : `linear-gradient(135deg, ${a.color}, ${a.color}CC)`,
                border: done ? `2px solid ${a.color}30` : "none", borderRadius: 20, padding: "16px 8px",
                cursor: done ? "default" : "pointer", opacity: done ? 0.5 : 1,
                color: done ? a.color : "white", fontFamily: "'Nunito',sans-serif", minHeight: 88,
                transition: "all .2s", boxShadow: done ? "none" : `0 4px 16px ${a.color}30`,
              }}>
                <span style={{ fontSize: "1.8rem" }}>{a.icon}</span>
                <span style={{ fontSize: ".95rem", fontWeight: 800 }}>{a.label}</span>
                {done && <span style={{ fontSize: ".85rem", fontWeight: 700 }}>{"\u2705"}</span>}
                {!done && <span style={{ fontSize: ".85rem", fontWeight: 700, opacity: 0.8 }}>+5 {"\u2B50"}</span>}
              </button>
            );
          })}
        </div>

        {/* Stage info */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: ".85rem", color: T.textLight, fontWeight: 600, marginBottom: 8 }}>Entwicklungsstufen</div>
          <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
            {CAT_STAGES.map((cs, i) => (
              <div key={i} style={{
                padding: "6px 10px", borderRadius: 12, fontSize: ".85rem", fontWeight: 700,
                background: i <= stage ? `${T.primary}15` : "rgba(180,120,40,0.05)",
                color: i <= stage ? T.primary : T.textLight,
                border: i === stage ? `2px solid ${T.primary}` : "2px solid transparent",
              }}>{cs.emoji} {cs.name}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
