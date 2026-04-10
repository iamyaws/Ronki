import React from 'react';
import { T, WEEKLY_MISSIONS } from '../constants';

export default function WeeklyMissionCard({ weeklyMission, weeklyProgress }) {
  const wm = WEEKLY_MISSIONS.find(m => m.id === weeklyMission);
  if (!wm) return null;
  const wp = weeklyProgress || 0;
  const wmDone = wp >= wm.target;
  return (
    <div className="game-card" style={{ padding: 16, marginBottom: 12, background: wmDone ? "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))" : undefined, borderColor: wmDone ? `${T.success}40` : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: "1.4rem" }}>{wm.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 800, color: wmDone ? T.successDark : T.primary, textTransform: "uppercase" }}>{wmDone ? "\uD83D\uDCAA Geschafft!" : "Wochen-Mission"}</div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: T.textPrimary }}>{wm.title}</div>
        </div>
        <div className="mission-reward"><span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: wmDone ? T.success : T.primary }}>{Math.min(wp, wm.target)}/{wm.target}</span></div>
      </div>
      <div style={{ fontSize: "1rem", color: T.textSecondary, marginBottom: 8 }}>{wm.story}</div>
      <div className="mission-progress-track"><div className="mission-progress-fill" style={{ width: `${Math.min(100, (wp / wm.target) * 100)}%`, background: wmDone ? `linear-gradient(90deg,${T.success},#6EE7B7)` : `linear-gradient(90deg,${T.primary},${T.primaryLight})` }} /></div>
      {wmDone && <div style={{ fontSize: "1rem", color: T.success, fontWeight: 700, marginTop: 6, textAlign: "center" }}>{"\uD83C\uDF89"} +{wm.reward.amount} Heldenpunkte erhalten!</div>}
    </div>
  );
}
