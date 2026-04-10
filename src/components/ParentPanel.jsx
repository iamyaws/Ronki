import React, { useRef, useState } from 'react';
import { T, SCHOOL_QUESTS, VACATION_QUESTS, MOOD_EMOJIS } from '../constants';
import { useGame } from '../context/GameContext';

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr"];
const SM_EMOJIS = ["\uD83C\uDF81", "\uD83E\uDDB7", "\uD83C\uDFE5", "\u26BD", "\uD83C\uDFB5", "\uD83D\uDCDD", "\uD83E\uDDF9", "\uD83C\uDFA8"];

export default function ParentPanel() {
  const { state, computed, actions, ui } = useGame();
  const { level } = computed;
  const { nq, setNq } = ui;
  const nqRef = useRef(null);
  const fileRef = useRef(null);

  const [lunchDraft, setLunchDraft] = useState(() => {
    const wl = state.weeklyLunch || {};
    return { Mo: wl.Mo || "", Di: wl.Di || "", Mi: wl.Mi || "", Do: wl.Do || "", Fr: wl.Fr || "" };
  });
  const [smName, setSmName] = useState("");
  const [smEmoji, setSmEmoji] = useState("\uD83C\uDF81");
  const [smHp, setSmHp] = useState(30);

  return (
    <div style={{ background: "white", borderRadius: 22, padding: 16, border: `3px solid rgba(109,40,217,0.1)`, marginTop: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.primary, marginBottom: 10, textTransform: "uppercase" }}>{"\u2699\uFE0F"} Eltern</div>

      <button onClick={actions.togVac} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(180,120,40,0.04)", border: `2.5px solid ${state.vacMode ? T.success + "40" : "rgba(180,120,40,0.08)"}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer", marginBottom: 12, fontFamily: "'Nunito',sans-serif", minHeight: 48 }}>
        <span style={{ fontWeight: 700, fontSize: ".85rem", color: state.vacMode ? T.successDark : T.textPrimary }}>{state.vacMode ? "\u{1F3D6}\uFE0F Ferienmodus" : "\u{1F4DA} Schulmodus"}</span>
        <div style={{ width: 44, height: 24, borderRadius: 12, background: state.vacMode ? T.success : "rgba(0,0,0,0.12)", position: "relative", transition: "all .3s" }}><div style={{ width: 18, height: 18, borderRadius: 9, background: "white", position: "absolute", top: 3, left: state.vacMode ? 23 : 3, transition: "all .3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} /></div>
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <input ref={nqRef} value={nq.name} onChange={e => setNq(n => ({ ...n, name: e.target.value }))} placeholder="Neue Aufgabe..." style={{ background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 14, padding: "10px 14px", fontSize: ".85rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, minHeight: 44 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <select value={nq.anchor} onChange={e => setNq(n => ({ ...n, anchor: e.target.value }))} style={{ flex: 1, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".85rem", minHeight: 40 }}><option value="morning">{"\u{1F305}"} Morgens</option><option value="evening">{"\u{1F319}"} Abends</option></select>
          <input type="number" value={nq.xp} onChange={e => setNq(n => ({ ...n, xp: +e.target.value }))} style={{ width: 55, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".85rem", textAlign: "center", minHeight: 40 }} placeholder="HP" />
          <input type="number" value={nq.minutes} onChange={e => setNq(n => ({ ...n, minutes: +e.target.value }))} style={{ width: 55, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".85rem", textAlign: "center", minHeight: 40 }} placeholder="Min" />
        </div>
        <button onClick={() => actions.addQuest(nq, () => setNq(n => ({ ...n, name: "" })))} style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`, border: "none", borderRadius: 14, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: ".85rem", fontFamily: "'Fredoka',sans-serif", minHeight: 44 }}>Erstellen</button>
      </div>

      <div style={{ background: "rgba(180,120,40,0.04)", borderRadius: 16, padding: 12, marginTop: 10, border: "2.5px solid rgba(180,120,40,0.08)" }}>
        <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 8 }}>{"\u{1F4CA}"} \u00DCbersicht</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[{ v: state.sd, l: "Tage-Streak", c: T.primary }, { v: state.bestStreak || state.sd, l: "Bester Streak", c: "#F97316" }, { v: `\u2744\uFE0F ${state.streakFreezes || 0}`, l: "Streak-Schutz", c: T.teal }, { v: state.hist.length, l: "Aufgaben gesamt", c: T.success }, { v: (state.graduated || []).length, l: "Gemeistert \u{1F393}", c: T.accentDark }, { v: `Lvl ${level}`, l: `${state.xp} HP`, c: "#EC4899" }].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: "10px", textAlign: "center", border: "2px solid rgba(180,120,40,0.06)" }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: ".85rem", color: T.textSecondary, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {(state.graduated || []).length > 0 && <div style={{ marginTop: 8, fontSize: ".85rem", color: T.textSecondary }}><span style={{ fontWeight: 700 }}>Gemeisterte Aufgaben:</span> {(state.graduated || []).map(gid => { const q = [...SCHOOL_QUESTS, ...VACATION_QUESTS].find(x => x.id === gid); return q ? q.name : gid; }).join(", ")}</div>}
        {state.moodAM !== null && <div style={{ marginTop: 6, fontSize: ".85rem", color: T.textSecondary }}>Stimmung heute: {MOOD_EMOJIS[state.moodAM]} morgens{state.moodPM !== null ? `, ${MOOD_EMOJIS[state.moodPM]} abends` : ""}</div>}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <button onClick={() => actions.exportState(state)} style={{ flex: 1, background: `${T.success}10`, border: `2px solid ${T.success}40`, borderRadius: 12, padding: "10px", color: T.successDark, cursor: "pointer", fontSize: ".85rem", fontWeight: 800, minHeight: 44 }}>{"\u{1F4BE}"} Export</button>
        <button onClick={() => fileRef.current?.click()} style={{ flex: 1, background: `${T.primary}08`, border: `2px solid ${T.primary}30`, borderRadius: 12, padding: "10px", color: T.primary, cursor: "pointer", fontSize: ".85rem", fontWeight: 800, minHeight: 44 }}>{"\u{1F4C2}"} Import</button>
        <input ref={fileRef} type="file" accept=".json" onChange={actions.importState} style={{ display: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button onClick={actions.resetDay} style={{ flex: 1, background: `${T.accent}15`, border: `2px solid ${T.accent}40`, borderRadius: 12, padding: "10px", color: T.accentDark, cursor: "pointer", fontSize: ".85rem", fontWeight: 800, minHeight: 44 }}>{"\u{1F504}"} Tag</button>
        <button onClick={actions.resetAll} style={{ flex: 1, background: `${T.danger}10`, border: `2px solid ${T.danger}30`, borderRadius: 12, padding: "10px", color: T.danger, cursor: "pointer", fontSize: ".85rem", fontWeight: 800, minHeight: 44 }}>{"\u{1F5D1}\uFE0F"} Alles</button>
      </div>

      <div className="game-card" style={{ padding: 16, marginTop: 12, border: "2.5px solid rgba(234,160,60,0.18)", background: "linear-gradient(135deg, #FFFBF2, #FFFFFF)" }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.primary, marginBottom: 10, textTransform: "uppercase" }}>{"\uD83C\uDF7D\uFE0F Wochenmen\u00FC"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DAYS.map(day => (
            <div key={day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.textPrimary, width: 28, flexShrink: 0 }}>{day}</span>
              <input value={lunchDraft[day]} onChange={e => setLunchDraft(prev => ({ ...prev, [day]: e.target.value }))} placeholder={`${day} Mittagessen...`} style={{ flex: 1, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "10px 14px", fontSize: ".95rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, minHeight: 44 }} />
            </div>
          ))}
        </div>
        <button onClick={() => actions.updateWeeklyLunch(lunchDraft)} style={{ width: "100%", marginTop: 10, background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`, border: "none", borderRadius: 14, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: ".85rem", fontFamily: "'Fredoka',sans-serif", minHeight: 44 }}>{"\uD83D\uDCBE"} Speichern</button>
      </div>

      <div className="game-card" style={{ padding: 16, marginTop: 12, border: "2.5px solid rgba(109,40,217,0.12)", background: "linear-gradient(135deg, #F9F5FF, #FFFFFF)" }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.primary, marginBottom: 10, textTransform: "uppercase" }}>{"\uD83C\uDFAF"} Spezial-Mission erstellen</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={smName} onChange={e => setSmName(e.target.value)} placeholder="z.B. Zahnarzt besuchen" style={{ background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 14, padding: "10px 14px", fontSize: ".95rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, minHeight: 44 }} />
          <div>
            <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, marginBottom: 4 }}>Emoji w\u00E4hlen:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SM_EMOJIS.map(em => (
                <button key={em} onClick={() => setSmEmoji(em)} style={{ fontSize: "1.3rem", padding: "6px 8px", borderRadius: 10, cursor: "pointer", minWidth: 40, minHeight: 40, background: smEmoji === em ? `${T.primary}15` : "rgba(180,120,40,0.04)", border: smEmoji === em ? `2.5px solid ${T.primary}` : "2.5px solid rgba(180,120,40,0.08)", transition: "all .15s" }}>{em}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, whiteSpace: "nowrap" }}>HP Belohnung:</span>
            <input type="number" value={smHp} onChange={e => setSmHp(+e.target.value)} style={{ width: 70, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".9rem", textAlign: "center", fontFamily: "'Fredoka',sans-serif", fontWeight: 600, minHeight: 44 }} />
          </div>
          <button onClick={() => { if (smName.trim()) { actions.addSpecialMission({ name: smName.trim(), emoji: smEmoji, hp: smHp }); setSmName(""); setSmEmoji("\uD83C\uDF81"); setSmHp(30); } }} style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`, border: "none", borderRadius: 14, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: ".85rem", fontFamily: "'Fredoka',sans-serif", minHeight: 44 }}>Erstellen</button>
        </div>
        {(state.specialMissions || []).length > 0 && <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>Aktive Spezial-Missionen</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(state.specialMissions || []).map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, background: m.done ? `${T.success}08` : "rgba(180,120,40,0.04)", border: `2px solid ${m.done ? T.success + "30" : "rgba(180,120,40,0.08)"}`, borderRadius: 14, padding: "10px 12px" }}>
                <span style={{ fontSize: "1.2rem" }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: ".85rem", color: T.textPrimary, textDecoration: m.done ? "line-through" : "none" }}>{m.name}</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.primary }}>+{m.hp} HP</div>
                </div>
                <button onClick={() => actions.removeSpecialMission(m.id)} aria-label={`${m.name} entfernen`} style={{ background: `${T.danger}12`, border: `2px solid ${T.danger}30`, borderRadius: 10, padding: "4px 10px", color: T.danger, cursor: "pointer", fontSize: ".85rem", fontWeight: 800, minHeight: 36 }}>{"\u274C"}</button>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}
