import React, { useRef, useState } from 'react';
import { T, ANCHORS, RAINBOW, RAINBOW_LABELS, MOOD_EMOJIS, SCHOOL_QUESTS, VACATION_QUESTS } from '../constants';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';

export default function QuestBoard() {
  const { state, computed, actions, ui } = useGame();
  const { allDone, done, total, pct, byA, level } = computed;
  const { pMode, setQuestOpen, nq, setNq } = ui;
  const nqRef = useRef(null);
  const fileRef = useRef(null);

  // Weekly lunch local state
  const DAYS = ["Mo", "Di", "Mi", "Do", "Fr"];
  const [lunchDraft, setLunchDraft] = useState(() => {
    const wl = state.weeklyLunch || {};
    return { Mo: wl.Mo || "", Di: wl.Di || "", Mi: wl.Mi || "", Do: wl.Do || "", Fr: wl.Fr || "" };
  });

  // Special mission creator local state
  const [smName, setSmName] = useState("");
  const [smEmoji, setSmEmoji] = useState("\uD83C\uDF81");
  const [smHp, setSmHp] = useState(30);
  const SM_EMOJIS = ["\uD83C\uDF81", "\uD83E\uDDB7", "\uD83C\uDFE5", "\u26BD", "\uD83C\uDFB5", "\uD83D\uDCDD", "\uD83E\uDDF9", "\uD83C\uDFA8"];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 50px", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", cursor: "pointer" }} onClick={() => setQuestOpen(false)} />
      <div style={{ flex: "1 1 auto", background: "linear-gradient(180deg, #F7F3E3 0%, #FFFFFF 100%)", borderRadius: "32px 32px 0 0", padding: "0 16px 100px", overflow: "auto", animation: "slideUp .3s ease", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)", position: "relative" }}>
        {/* Handle + back button */}
        <div style={{ position: "sticky", top: 0, background: "linear-gradient(180deg, #F7F3E3, rgba(247,243,227,0.95))", paddingTop: 12, paddingBottom: 8, zIndex: 10, borderRadius: "32px 32px 0 0", backdropFilter: "blur(8px)" }}>
          <div style={{ width: 44, height: 5, borderRadius: 3, background: "rgba(180,120,40,0.14)", margin: "0 auto 8px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
            <button aria-label="Aufgaben schließen" onClick={() => setQuestOpen(false)} className="btn-tap" style={{ background: "white", border: "2.5px solid rgba(180,120,40,0.10)", borderRadius: 14, padding: "8px 14px", cursor: "pointer", fontSize: ".9rem", fontWeight: 800, color: T.textSecondary, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 4, minHeight: 44 }}>{"\u2190"} Zurück</button>
            <div style={{ flex: 1, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1rem", fontWeight: 800, color: T.primary, textTransform: "uppercase" }}>{"\u2B50"} Helden-Aufgaben</div>
          </div>
        </div>

        {/* Comeback Quest */}
        {state.comebackActive && <div className="mission-card" style={{ marginBottom: 14, background: "linear-gradient(135deg, #FFF7ED, #FFFBF5)", borderColor: "#F9731630" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FED7AA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{"\u{1F431}"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: "#EA580C", textTransform: "uppercase" }}>Willkommen zurück!</div>
            <div style={{ fontSize: ".85rem", color: T.textSecondary, fontWeight: 600 }}>Deine Katze hat auf dich gewartet!</div>
            <button className="btn-tap" onClick={actions.completeComeback} style={{
              width: "100%", marginTop: 8,
              background: "linear-gradient(135deg, #F97316, #FCD34D)",
              border: "none", borderRadius: 14, padding: "10px",
              color: "white", fontWeight: 800, fontSize: ".85rem", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: 44,
            }}>{"\u{1F43E}"} Ich bin wieder da! (+15 {"\u2B50"})</button>
          </div>
        </div>}

        {/* Overall progress */}
        <div className="game-card" style={{ padding: 16, marginBottom: 14, background: allDone ? "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))" : "white", borderColor: allDone ? `${T.success}40` : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: allDone ? T.successDark : T.textPrimary, textTransform: "uppercase" }}>{allDone ? "\u{1F4AA} Durchgehalten!" : `${done}/${total} Aufgaben`}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: T.primary }}>+{state.dt} Min</span>
          </div>
          <div className="mission-progress-track"><div className="mission-progress-fill" style={{ width: `${pct * 100}%`, background: allDone ? `linear-gradient(90deg,${T.success},#6EE7B7)` : `linear-gradient(90deg,${T.primary},${T.primaryLight})` }} /></div>
        </div>

        {/* Rainbow */}
        <div className="game-card" style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: T.textPrimary, textTransform: "uppercase" }}>{"\u{1F308}"} Iss den Regenbogen</span>
            {(state.rainbow || []).every(Boolean) && <span style={{ fontSize: ".85rem", fontWeight: 800, color: T.success }}>+25 {"\u2B50"}! {"\u{1F389}"}</span>}
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>{RAINBOW.map((emoji, i) => {
            const d = (state.rainbow || [])[i];
            return <button key={i} aria-label={`${RAINBOW_LABELS[i]} ${d ? "gegessen" : "nicht gegessen"}`} aria-pressed={d} onClick={() => actions.toggleRainbow(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", borderRadius: 14, background: d ? `${T.success}12` : "rgba(180,120,40,0.05)", border: d ? `2.5px solid ${T.success}40` : "2.5px solid rgba(180,120,40,0.08)", cursor: "pointer", transition: "all .15s", opacity: d ? 1 : 0.5, minHeight: 48 }}>
              <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
              <span style={{ fontSize: ".85rem", fontWeight: 700, color: d ? T.successDark : T.textLight }}>{RAINBOW_LABELS[i]}</span>
            </button>;
          })}</div>
        </div>

        {/* Evening mood */}
        {allDone && state.moodPM === null && <div className="game-card" style={{ padding: 16, marginBottom: 14, background: "linear-gradient(135deg, rgba(109,40,217,0.04), rgba(252,211,77,0.04))" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 10 }}>{"\u{1F319}"} Worauf bist du heute stolz?</div>
          <div role="group" aria-label="Abendstimmung wählen" style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 12 }}>{MOOD_EMOJIS.map((e, i) => <button key={i} aria-label={`Stimmung ${i + 1} von 6`} onClick={() => actions.setMood("moodPM", i)} style={{ fontSize: "1.8rem", background: state.moodPM === i ? `${T.primary}15` : "none", border: state.moodPM === i ? `2px solid ${T.primary}` : "none", cursor: "pointer", padding: "6px", borderRadius: 10, minHeight: 48, minWidth: 44 }}>{e}</button>)}</div>
        </div>}

        {/* ── Quest groups (Paper 2 mission card style) ── */}
        {Object.entries(ANCHORS).map(([a, m]) => {
          const qs = byA[a] || [];
          if (!qs.length) return null;
          const secDone = qs.every(q => q.done);
          return (
            <div key={a} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: `${m.col}15`, borderRadius: 50, padding: "5px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "1rem" }}>{m.icon}</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: m.col, textTransform: "uppercase", letterSpacing: ".06em" }}>{m.label}</span>
                </div>
                {secDone && <span style={{ fontSize: ".85rem", color: T.success, fontWeight: 800 }}>{"\u2713"} Geschafft!</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {qs.map(q => {
                  const grad = (state.graduated || []).includes(q.id);
                  return (
                    <button key={q.id} className={q.done ? "" : "btn-tap"} onClick={() => !q.done && !pMode && actions.complete(q.id)} disabled={q.done} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: grad ? "linear-gradient(135deg, #FFFBEB, #FEF3C7)" : q.done ? "linear-gradient(135deg, #F0FDF4, #DCFCE7)" : "white",
                      border: `2.5px solid ${grad ? T.accentDark + "30" : q.done ? T.success + "30" : "rgba(180,120,40,0.08)"}`,
                      borderRadius: 18, padding: "12px 14px", cursor: q.done ? "default" : "pointer",
                      width: "100%", textAlign: "left", transition: "all .15s",
                      opacity: q.done ? .7 : 1, fontFamily: "'Nunito',sans-serif", minHeight: 56,
                      boxShadow: q.done ? "none" : "0 3px 12px rgba(120,80,20,0.06)",
                    }}>
                      <div style={{ width: 46, height: 46, borderRadius: 14, background: grad ? `${T.accent}20` : q.done ? `${T.success}15` : `${m.col}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{grad ? "\u{1F393}" : q.done ? "\u2705" : q.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: ".88rem", textDecoration: q.done ? "line-through" : "none", color: T.textPrimary }}>{q.name}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                          <span style={{ fontSize: ".85rem", fontWeight: 700, color: T.primary }}>+{q.xp} {"\u2B50"}</span>
                          <span style={{ fontSize: ".85rem", fontWeight: 700, color: T.accentDark }}>+{q.minutes} Min</span>
                          {q.streak > 0 && <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#F97316" }}>{"\u{1F525}"}{q.streak}</span>}
                        </div>
                      </div>
                      {/* Reward coin stack (Paper 2 style) */}
                      {!q.done && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, background: "rgba(252,211,77,0.1)", border: "2px solid rgba(252,211,77,0.25)", borderRadius: 12, padding: "6px 8px", minWidth: 44 }}>
                        <span style={{ fontSize: ".9rem" }}>{"\u2B50"}</span>
                        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: T.accentDark }}>+{Math.floor(q.xp / 3)}</span>
                      </div>}
                      {pMode && <button aria-label={`${q.name} entfernen`} onClick={e => { e.stopPropagation(); actions.rmQuest(q.id); }} style={{ background: `${T.danger}12`, border: `2px solid ${T.danger}30`, borderRadius: 10, padding: "4px 10px", color: T.danger, cursor: "pointer", fontSize: ".85rem", fontWeight: 800, minHeight: 36 }}>{"\u2715"}</button>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Parent panel */}
        {pMode && <div style={{ background: "white", borderRadius: 22, padding: 16, border: `3px solid rgba(109,40,217,0.1)`, marginTop: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.primary, marginBottom: 10, textTransform: "uppercase" }}>{"\u2699\uFE0F"} Eltern</div>
          <button onClick={actions.togVac} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(180,120,40,0.04)", border: `2.5px solid ${state.vacMode ? T.success + "40" : "rgba(180,120,40,0.08)"}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer", marginBottom: 12, fontFamily: "'Nunito',sans-serif", minHeight: 48 }}>
            <span style={{ fontWeight: 700, fontSize: ".85rem", color: state.vacMode ? T.successDark : T.textPrimary }}>{state.vacMode ? "\u{1F3D6}\uFE0F Ferienmodus" : "\u{1F4DA} Schulmodus"}</span>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: state.vacMode ? T.success : "rgba(0,0,0,0.12)", position: "relative", transition: "all .3s" }}><div style={{ width: 18, height: 18, borderRadius: 9, background: "white", position: "absolute", top: 3, left: state.vacMode ? 23 : 3, transition: "all .3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} /></div>
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input ref={nqRef} value={nq.name} onChange={e => setNq(n => ({ ...n, name: e.target.value }))} placeholder="Neue Aufgabe..." style={{ background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 14, padding: "10px 14px", fontSize: ".85rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, minHeight: 44 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <select value={nq.anchor} onChange={e => setNq(n => ({ ...n, anchor: e.target.value }))} style={{ flex: 1, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".85rem", minHeight: 40 }}><option value="morning">{"\u{1F305}"} Morgens</option><option value="afternoon">{"\u2600\uFE0F"} Nachmittags</option><option value="evening">{"\u{1F319}"} Abends</option></select>
              <input type="number" value={nq.xp} onChange={e => setNq(n => ({ ...n, xp: +e.target.value }))} style={{ width: 55, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".85rem", textAlign: "center", minHeight: 40 }} placeholder="HP" />
              <input type="number" value={nq.minutes} onChange={e => setNq(n => ({ ...n, minutes: +e.target.value }))} style={{ width: 55, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".85rem", textAlign: "center", minHeight: 40 }} placeholder="Min" />
            </div>
            <button onClick={() => actions.addQuest(nq, () => setNq(n => ({ ...n, name: "" })))} style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`, border: "none", borderRadius: 14, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: 44 }}>Erstellen</button>
          </div>
          {/* Summary */}
          <div style={{ background: "rgba(180,120,40,0.04)", borderRadius: 16, padding: 12, marginTop: 10, border: "2.5px solid rgba(180,120,40,0.08)" }}>
            <div style={{ fontSize: ".85rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 8 }}>{"\u{1F4CA}"} Übersicht</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[{ v: state.sd, l: "Tage-Streak", c: T.primary }, { v: state.bestStreak || state.sd, l: "Bester Streak", c: "#F97316" }, { v: `\u2744\uFE0F ${state.streakFreezes || 0}`, l: "Streak-Schutz", c: T.teal }, { v: state.hist.length, l: "Aufgaben gesamt", c: T.success }, { v: (state.graduated || []).length, l: "Gemeistert \u{1F393}", c: T.accentDark }, { v: `Lvl ${level}`, l: `${state.xp} HP`, c: "#EC4899" }].map((s, i) => (
                <div key={i} style={{ background: "white", borderRadius: 12, padding: "10px", textAlign: "center", border: "2px solid rgba(180,120,40,0.06)" }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: ".85rem", color: T.textSecondary, fontWeight: 600 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {(state.graduated || []).length > 0 && <div style={{ marginTop: 8, fontSize: ".85rem", color: T.textSecondary }}>
              <span style={{ fontWeight: 700 }}>Gemeisterte Aufgaben:</span> {(state.graduated || []).map(gid => { const q = [...SCHOOL_QUESTS, ...VACATION_QUESTS].find(x => x.id === gid); return q ? q.name : gid; }).join(", ")}
            </div>}
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

          {/* Weekly Lunch Entry */}
          <div className="game-card" style={{ padding: 16, marginTop: 12, border: "2.5px solid rgba(234,160,60,0.18)", background: "linear-gradient(135deg, #FFFBF2, #FFFFFF)" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.primary, marginBottom: 10, textTransform: "uppercase" }}>{"\uD83C\uDF7D\uFE0F Wochenmenü"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DAYS.map(day => (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.textPrimary, width: 28, flexShrink: 0 }}>{day}</span>
                  <input
                    value={lunchDraft[day]}
                    onChange={e => setLunchDraft(prev => ({ ...prev, [day]: e.target.value }))}
                    placeholder={`${day} Mittagessen...`}
                    style={{ flex: 1, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "10px 14px", fontSize: ".95rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, minHeight: 44 }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => actions.updateWeeklyLunch(lunchDraft)}
              style={{ width: "100%", marginTop: 10, background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`, border: "none", borderRadius: 14, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: 44 }}
            >{"\uD83D\uDCBE"} Speichern</button>
          </div>

          {/* Special Mission Creator */}
          <div className="game-card" style={{ padding: 16, marginTop: 12, border: "2.5px solid rgba(109,40,217,0.12)", background: "linear-gradient(135deg, #F9F5FF, #FFFFFF)" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.primary, marginBottom: 10, textTransform: "uppercase" }}>{"\uD83C\uDFAF"} Spezial-Mission erstellen</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={smName}
                onChange={e => setSmName(e.target.value)}
                placeholder="z.B. Zahnarzt besuchen"
                style={{ background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 14, padding: "10px 14px", fontSize: ".95rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, minHeight: 44 }}
              />
              <div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, marginBottom: 4 }}>{"Emoji wählen:"}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {SM_EMOJIS.map(em => (
                    <button key={em} onClick={() => setSmEmoji(em)} style={{
                      fontSize: "1.3rem", padding: "6px 8px", borderRadius: 10, cursor: "pointer", minWidth: 40, minHeight: 40,
                      background: smEmoji === em ? `${T.primary}15` : "rgba(180,120,40,0.04)",
                      border: smEmoji === em ? `2.5px solid ${T.primary}` : "2.5px solid rgba(180,120,40,0.08)",
                      transition: "all .15s"
                    }}>{em}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: ".85rem", fontWeight: 700, color: T.textSecondary, whiteSpace: "nowrap" }}>HP Belohnung:</span>
                <input
                  type="number"
                  value={smHp}
                  onChange={e => setSmHp(+e.target.value)}
                  style={{ width: 70, background: "rgba(180,120,40,0.04)", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 12, padding: "8px", fontSize: ".9rem", textAlign: "center", fontFamily: "'Fredoka',sans-serif", fontWeight: 600, minHeight: 44 }}
                />
              </div>
              <button
                onClick={() => { if (smName.trim()) { actions.addSpecialMission({ name: smName.trim(), emoji: smEmoji, hp: smHp }); setSmName(""); setSmEmoji("\uD83C\uDF81"); setSmHp(30); } }}
                style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`, border: "none", borderRadius: 14, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: 44 }}
              >Erstellen</button>
            </div>
            {/* Active special missions list */}
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
                    <button
                      onClick={() => actions.removeSpecialMission(m.id)}
                      aria-label={`${m.name} entfernen`}
                      style={{ background: `${T.danger}12`, border: `2px solid ${T.danger}30`, borderRadius: 10, padding: "4px 10px", color: T.danger, cursor: "pointer", fontSize: ".85rem", fontWeight: 800, minHeight: 36 }}
                    >{"\u274C"}</button>
                  </div>
                ))}
              </div>
            </div>}
          </div>
        </div>}
      </div>
    </div>
  );
}
