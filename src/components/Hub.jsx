import React from 'react';
import { T, WEEKLY_MISSIONS, BOSSES, BOSS_TIERS, HERO_TIPS, MOOD_EMOJIS } from '../constants';
import { getTimeLabel, GERMAN_DAYS_SHORT } from '../utils/helpers';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import LoginBonus from './LoginBonus';
import ProfileCard from './ProfileCard';

export default function Hub() {
  const { state, computed, actions, ui } = useGame();
  const { level, xpP, done, total, allDone, pct, mood, dayN } = computed;
  const { setQuestOpen, setCeleb, pMode, setPMode, setPinShow } = ui;
  const { weather } = useWeather();
  const wInfo = weather?.current ? getWeatherInfo(weather.current.weatherCode) : null;
  const today = new Date();
  const dayKey = GERMAN_DAYS_SHORT[today.getDay()];
  const lunch = state.weeklyLunch?.[dayKey];
  const todayDaily = weather?.daily?.[0];
  const tip = HERO_TIPS[Math.floor(Date.now() / 86400000) % HERO_TIPS.length];
  const catAllDone = state.catFed && state.catPetted && state.catPlayed;

  return (
    <div className="view-enter" style={{ background: "#FFF8F0" }}>
      <div style={{ padding: "env(safe-area-inset-top, 12px) 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <img src={import.meta.env.BASE_URL + "ronki-egg.png"} alt="Ronki" style={{ height: 36, width: "auto" }} />
        <button aria-label={pMode ? "Elternmodus deaktivieren" : "Elternmodus aktivieren"} onClick={() => pMode ? setPMode(false) : setPinShow(true)} style={{ background: "rgba(180,120,40,0.08)", border: "2px solid rgba(180,120,40,0.10)", borderRadius: 50, padding: "6px 12px", cursor: "pointer", color: T.textSecondary, fontSize: ".95rem", fontWeight: 700, minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{pMode ? "\uD83D\uDD13" : "\uD83D\uDD12"}</button>
      </div>
      <div style={{ padding: "0 16px 20px" }}>
        <ProfileCard state={state} level={level} mood={mood} weather={weather} wInfo={wInfo} todayDaily={todayDaily} actions={actions} onCompanionTap={() => ui.setView("companion")} />
        <LoginBonus claimed={state.loginBonusClaimed} onCollect={() => actions.collectLoginBonus()} />

        {tip && (
          <div className="game-card" style={{ padding: 14, marginBottom: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))", borderColor: "rgba(245,158,11,0.2)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>{tip.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: 4 }}>Helden-Tipp von {tip.char}</div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 600, color: T.textPrimary, lineHeight: 1.4 }}>{tip.tip}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn-tap" onClick={() => { if (!state.dailyVitaminD) { actions.completeHabit("vitaminD"); if (navigator.vibrate) navigator.vibrate(50); } }} style={{ flex: 1, background: state.dailyVitaminD ? "rgba(52,211,153,0.1)" : "white", border: `2.5px solid ${state.dailyVitaminD ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`, borderRadius: 18, padding: "12px 6px", cursor: state.dailyVitaminD ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "1.4rem" }}>{state.dailyVitaminD ? "\u2705" : "\uD83D\uDC8A"}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: state.dailyVitaminD ? "#059669" : T.textPrimary }}>Vitamin D</span>
            {!state.dailyVitaminD && <span style={{ fontSize: ".9rem", fontWeight: 700, color: "#D97706" }}>+5 {"\u2B50"}</span>}
          </button>
          <button className="btn-tap" onClick={() => { if (!state.dailyBrother) { actions.completeHabit("brother"); if (navigator.vibrate) navigator.vibrate(50); } }} style={{ flex: 1, background: state.dailyBrother ? "rgba(52,211,153,0.1)" : "white", border: `2.5px solid ${state.dailyBrother ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`, borderRadius: 18, padding: "12px 6px", cursor: state.dailyBrother ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "1.4rem" }}>{state.dailyBrother ? "\u2705" : "\uD83D\uDC76"}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: state.dailyBrother ? "#059669" : T.textPrimary }}>Liam</span>
            {!state.dailyBrother && <span style={{ fontSize: ".9rem", fontWeight: 700, color: "#D97706" }}>+10 {"\u2B50"}</span>}
          </button>
          <button className="btn-tap" onClick={() => ui.setView("cat")} style={{ flex: 1, background: catAllDone ? "rgba(52,211,153,0.1)" : "white", border: `2.5px solid ${catAllDone ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`, borderRadius: 18, padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative" }}>
            <span style={{ fontSize: "1.6rem" }}>{"\uD83D\uDC31"}</span>
            {catAllDone && <span style={{ position: "absolute", top: 4, right: 4, fontSize: ".9rem" }}>{"\u2705"}</span>}
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{state.catName || "Katze"}</span>
            {!catAllDone && <span style={{ fontSize: ".9rem", fontWeight: 700, color: T.textLight }}>{[!state.catFed && "\uD83C\uDF63", !state.catPetted && "\uD83E\uDD0D", !state.catPlayed && "\uD83E\uDDF6"].filter(Boolean).join(" ")}</span>}
          </button>
        </div>

        {state.dailyVitaminD && state.dailyBrother && state.catFed && state.catPetted && state.catPlayed && (
          <div className="game-card" style={{
            padding: 14, marginBottom: 12,
            background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.06))",
            borderColor: "rgba(52,211,153,0.25)",
            textAlign: "center",
          }}>
            <span style={{ fontSize: "1.4rem" }}>{"\u{1F389}"}</span>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#059669", marginTop: 4 }}>
              Alle Gewohnheiten erledigt! Super gemacht!
            </div>
          </div>
        )}

        <button className="btn-tap" onClick={() => ui.setView("regeln")} style={{ width: "100%", background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))", border: "2.5px solid rgba(245,158,11,0.15)", borderRadius: 18, padding: "14px 12px", cursor: "pointer", fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: ".95rem", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 12 }}>{"\uD83D\uDEE1\uFE0F"} Helden-Kodex</button>

        {lunch && (
          <div className="game-card" style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.3rem" }}>{"\uD83C\uDF7D\uFE0F"}</span>
              <div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase" }}>Heute</div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{lunch}</div>
              </div>
            </div>
          </div>
        )}

        {state.moodAM === null && (
          <div className="game-card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 10 }}>Wie startest du in den Tag? {"\uD83C\uDF05"}</div>
            <div role="group" aria-label="Morgenstimmung w\u00E4hlen" style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
              {MOOD_EMOJIS.map((e, i) => (
                <button key={i} aria-label={`Stimmung ${i + 1} von ${MOOD_EMOJIS.length}`} onClick={() => { SFX.play("pop"); actions.setMood("moodAM", i); setCeleb(true); }} style={{ fontSize: "2rem", background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: 12, transition: "all .15s", minHeight: 52, minWidth: 52 }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {state.specialMissions?.filter(m => !m.done).map(mission => (
          <button key={mission.id} className="btn-tap game-card" onClick={() => actions.completeSpecialMission(mission.id)} style={{ width: "100%", padding: 14, marginBottom: 12, cursor: "pointer", background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))", borderColor: "rgba(245,158,11,0.25)", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
            <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{mission.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 800, color: "#B45309", textTransform: "uppercase" }}>Spezial-Mission</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{mission.name}</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #FCD34D, #F59E0B)", borderRadius: 50, padding: "4px 12px", fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: "white" }}>+{mission.hp} {"\u2B50"}</div>
          </button>
        ))}

        {(state.questChains || []).filter(c => !c.completed).map(chain => {
          const doneSteps = chain.steps.filter(s => s.done).length;
          const totalSteps = chain.steps.length;
          const firstUndoneIdx = chain.steps.findIndex(s => !s.done);
          const daysLeft = chain.deadline ? Math.ceil((new Date(chain.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
          return (
            <div key={chain.id} className="game-card" style={{ padding: 16, marginBottom: 12, background: "linear-gradient(135deg, rgba(109,40,217,0.04), rgba(252,211,77,0.04))", borderColor: "rgba(109,40,217,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>{chain.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 800, color: T.primary, textTransform: "uppercase" }}>Abenteuer-Kette</div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{chain.name}</div>
                </div>
                <div style={{ background: "linear-gradient(135deg, #FCD34D, #F59E0B)", borderRadius: 50, padding: "4px 12px", fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: "white" }}>+{chain.hp} {"\u2B50"}</div>
              </div>
              {daysLeft !== null && (
                <div style={{
                  fontSize: ".95rem", fontWeight: 800, marginBottom: 8,
                  color: daysLeft <= 5 ? "#DC2626" : daysLeft <= 10 ? "#F59E0B" : T.textSecondary,
                }}>
                  {"\uD83D\uDCC5"} {daysLeft > 0 ? `Noch ${daysLeft} Tage!` : daysLeft === 0 ? "Heute!" : "Abgelaufen"}
                </div>
              )}
              <div style={{ background: "rgba(109,40,217,0.08)", borderRadius: 50, height: 8, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ height: "100%", borderRadius: 50, width: `${(doneSteps / totalSteps) * 100}%`, background: "linear-gradient(90deg, #A78BFA, #7C3AED)", transition: "width .4s ease" }} />
              </div>
              <div style={{ fontSize: ".95rem", fontWeight: 700, color: T.textSecondary, marginBottom: 8 }}>{doneSteps}/{totalSteps} Schritte</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {chain.steps.map((step, idx) => {
                  const isCurrent = idx === firstUndoneIdx;
                  return (
                    <button key={step.id} className={!step.done && isCurrent ? "btn-tap" : ""} onClick={() => !step.done && actions.completeChainStep(chain.id, step.id)} style={{ display: "flex", alignItems: "center", gap: 10, background: step.done ? "rgba(52,211,153,0.06)" : isCurrent ? "rgba(252,211,77,0.1)" : "rgba(0,0,0,0.02)", border: `2px solid ${step.done ? "rgba(52,211,153,0.2)" : isCurrent ? "rgba(252,211,77,0.4)" : "rgba(0,0,0,0.05)"}`, borderRadius: 14, padding: "10px 12px", cursor: step.done ? "default" : "pointer", width: "100%", textAlign: "left", opacity: step.done ? 0.7 : !isCurrent ? 0.5 : 1, transition: "all .15s", boxShadow: isCurrent ? "0 2px 8px rgba(252,211,77,0.2)" : "none", minHeight: 44 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.done ? "#34D399" : isCurrent ? "#FCD34D" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", fontWeight: 800, color: step.done ? "white" : "#1E1B4B", flexShrink: 0 }}>{step.done ? "\u2713" : idx + 1}</div>
                      <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: step.done ? "#059669" : T.textPrimary, textDecoration: step.done ? "line-through" : "none" }}>{step.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {state.boss && state.boss.hp > 0 && (() => {
          const bossData = BOSSES.find(b => b.id === state.boss.id);
          if (!bossData) return null;
          const hpPct = Math.round((state.boss.hp / state.boss.maxHp) * 100);
          const tierInfo = BOSS_TIERS?.find(t => t.id === bossData?.tier);
          return (
            <div className="game-card" style={{ padding: 16, marginBottom: 12, background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.04))", borderColor: "rgba(239,68,68,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "1.6rem", animation: "bossShake 0.6s ease-in-out infinite" }}>{bossData.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 800, color: "#DC2626", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                    Wochen-Boss
                    {tierInfo && <span style={{ background: tierInfo.color + "20", color: tierInfo.color, borderRadius: 50, padding: "2px 10px", fontSize: ".95rem", fontWeight: 800, textTransform: "none" }}>{tierInfo.icon} {tierInfo.name}</span>}
                  </div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{bossData.name}</div>
                </div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 700, color: hpPct > 50 ? "#DC2626" : hpPct > 25 ? T.accentDark : T.success }}>{state.boss.hp}/{state.boss.maxHp} HP</div>
              </div>
              <div style={{ fontSize: ".9rem", color: T.textSecondary, marginBottom: 8 }}>{bossData.desc}</div>
              <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 50, height: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 50, width: `${hpPct}%`, background: hpPct > 50 ? "linear-gradient(90deg, #EF4444, #F97316)" : hpPct > 25 ? "linear-gradient(90deg, #F59E0B, #FBBF24)" : "linear-gradient(90deg, #34D399, #6EE7B7)", transition: "width .6s ease" }} />
              </div>
              <div style={{ fontSize: ".95rem", color: T.textLight, marginTop: 6, textAlign: "center" }}>Aufgaben abschlie\u00DFen, um den Boss anzugreifen!</div>
            </div>
          );
        })()}

        {state.boss && state.boss.hp <= 0 && (() => {
          const bossData = BOSSES.find(b => b.id === state.boss.id);
          if (!bossData) return null;
          return (
            <div className="game-card" style={{ padding: 16, marginBottom: 12, background: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))", borderColor: `${T.success}40` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>{"\uD83C\uDFC6"}</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: "1rem", color: T.successDark, textTransform: "uppercase" }}>Boss besiegt!</div>
                  <div style={{ fontSize: ".9rem", fontWeight: 700, color: T.textPrimary }}>{bossData.icon} {bossData.name} wurde besiegt!</div>
                </div>
              </div>
            </div>
          );
        })()}

        {(() => {
          const wm = WEEKLY_MISSIONS.find(m => m.id === state.weeklyMission);
          if (!wm) return null;
          const wp = state.weeklyProgress || 0;
          const wmDone = wp >= wm.target;
          return (
            <div className="game-card" style={{ padding: 16, marginBottom: 12, background: wmDone ? "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))" : undefined, borderColor: wmDone ? `${T.success}40` : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "1.4rem" }}>{wm.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 800, color: wmDone ? T.successDark : T.primary, textTransform: "uppercase" }}>{wmDone ? "\uD83D\uDCAA Geschafft!" : "Wochen-Mission"}</div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{wm.title}</div>
                </div>
                <div className="mission-reward"><span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: wmDone ? T.success : T.primary }}>{Math.min(wp, wm.target)}/{wm.target}</span></div>
              </div>
              <div style={{ fontSize: ".9rem", color: T.textSecondary, marginBottom: 8 }}>{wm.story}</div>
              <div className="mission-progress-track"><div className="mission-progress-fill" style={{ width: `${Math.min(100, (wp / wm.target) * 100)}%`, background: wmDone ? `linear-gradient(90deg,${T.success},#6EE7B7)` : `linear-gradient(90deg,${T.primary},${T.primaryLight})` }} /></div>
              {wmDone && <div style={{ fontSize: ".9rem", color: T.success, fontWeight: 700, marginTop: 6, textAlign: "center" }}>{"\uD83C\uDF89"} +{wm.reward.amount} Heldenpunkte erhalten!</div>}
            </div>
          );
        })()}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn-tap" onClick={() => ui.setView("journal")} style={{ flex: 1, background: "white", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 18, padding: "14px 12px", cursor: "pointer", fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: ".95rem", color: T.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>{"\uD83D\uDCD3"} Tagebuch</button>
          <button className="btn-tap" onClick={() => ui.setView("time")} style={{ flex: 1, background: "white", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 18, padding: "14px 12px", cursor: "pointer", fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: ".95rem", color: T.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>{"\u2B50"} Belohnungen</button>
        </div>
      </div>
    </div>
  );
}
