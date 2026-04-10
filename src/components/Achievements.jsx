import React from 'react';
import { T, BADGES as BADGE_DEFS } from '../constants';
import { ViewHeader } from './ui';
import HeroSprite from './HeroSprite';
import { useGame } from '../context/GameContext';

export default function Achievements() {
  const { state, computed, ui } = useGame();
  const { level } = computed;

  const badges = BADGE_DEFS.map((b, i) => ({
    ...b,
    u: [state.xp > 0, state.sd >= 3, state.sd >= 7, level >= 5, state.hist.length >= 50, level >= 10, state.sd >= 30, state.hist.length >= 100, state.acc.length > 0][i],
  }));

  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px", background: "#EFF3FB" }}>
      <ViewHeader onBack={() => ui.setView("hub")} title="Erfolge" />
      <div className="game-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 20, borderRadius: 22 }}>
        <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={80} level={level} />
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.05rem" }}>{state.hero.name}</div>
          <div style={{ fontSize: ".85rem", color: T.textSecondary, fontWeight: 600 }}>Level {level} Held</div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: ".85rem", fontWeight: 700, color: T.primary }}>{"\u26A1"}{state.xp}</span>
            <span style={{ fontSize: ".85rem", fontWeight: 700, color: T.accentDark }}>{"\u2B50"}{state.coins}</span>
            <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#F97316" }}>{"\u{1F525}"}{state.sd}d</span>
          </div>
        </div>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".85rem", color: "#64748B", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Badges</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
        {badges.map((b, i) => (
          <div key={i} className="game-card" style={{ padding: "16px 8px", textAlign: "center", opacity: b.u ? 1 : .35, borderColor: b.u ? `${T.primary}30` : undefined, boxShadow: b.u ? `0 4px 12px ${T.primary}10` : undefined }}>
            <div style={{ fontSize: "2rem", marginBottom: 4 }}>{b.i}</div>
            <div style={{ fontSize: ".85rem", fontWeight: 800, color: b.u ? T.primary : T.textLight }}>{b.n}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".85rem", color: "#64748B", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Stats</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[{ l: "Gesamt HP", v: state.xp, i: "\u26A1" }, { l: "Heldenpunkte", v: state.coins, i: "\u2B50" }, { l: "Aufgaben", v: state.hist.length, i: "\u2694\uFE0F" }, { l: "Streak", v: state.sd + "d", i: "\u{1F525}" }, { l: "Level", v: level, i: "\u{1F4C8}" }].map((s, i) => (
          <div key={i} className="game-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 16, padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: "1.2rem" }}>{s.i}</span><span style={{ fontSize: ".85rem", fontWeight: 700 }}>{s.l}</span></div>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: T.primary }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
