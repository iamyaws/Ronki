import React from 'react';
import { T, BOSSES } from '../constants';

export default function BossCard({ boss }) {
  if (!boss) return null;
  const bossData = BOSSES.find(b => b.id === boss.id);
  if (!bossData) return null;
  if (boss.hp <= 0) {
    return (
      <div className="game-card" style={{ padding: 16, marginBottom: 12, background: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))", borderColor: `${T.success}40` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>{"\uD83C\uDFC6"}</span>
          <div>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: "1rem", color: T.successDark, textTransform: "uppercase" }}>Boss besiegt!</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{bossData.icon} {bossData.name} wurde besiegt!</div>
          </div>
        </div>
      </div>
    );
  }
  const hpPct = Math.round((boss.hp / boss.maxHp) * 100);
  return (
    <div className="game-card" style={{ padding: 16, marginBottom: 12, background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.04))", borderColor: "rgba(239,68,68,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: "1.6rem", animation: "bossShake 0.6s ease-in-out infinite" }}>{bossData.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>Wochen-Boss</div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: T.textPrimary }}>{bossData.name}</div>
        </div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: hpPct > 50 ? "#DC2626" : hpPct > 25 ? T.accentDark : T.success }}>{boss.hp}/{boss.maxHp} HP</div>
      </div>
      <div style={{ fontSize: "1rem", color: T.textSecondary, marginBottom: 8 }}>{bossData.desc}</div>
      <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 50, height: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 50, width: `${hpPct}%`, background: hpPct > 50 ? "linear-gradient(90deg, #EF4444, #F97316)" : hpPct > 25 ? "linear-gradient(90deg, #F59E0B, #FBBF24)" : "linear-gradient(90deg, #34D399, #6EE7B7)", transition: "width .6s ease" }} />
      </div>
      <div style={{ fontSize: ".95rem", color: T.textLight, marginTop: 6, textAlign: "center" }}>Aufgaben abschlie\u00DFen, um den Boss anzugreifen!</div>
    </div>
  );
}
