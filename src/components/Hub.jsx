import React from 'react';
import { T, WEEKLY_MISSIONS, CAT_STAGES, BOSSES, HERO_TIPS, MOOD_EMOJIS } from '../constants';
import { getTimeLabel, getCatStage, getCatMood } from '../utils/helpers';
import HeroSprite from './HeroSprite';
import Companion from './Companion';
import Egg from './Egg';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import LoginBonus from './LoginBonus';

function HeroPortrait({ shape, color, eyes, hair, level, size, skinTone, hairColor }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 50% 60%, ${color}30 0%, transparent 70%)`,
    }}>
      <div style={{ transform: "scale(1.6) translateY(18%)" }}>
        <HeroSprite shape={shape} color={color} eyes={eyes} hair={hair} size={size * 0.7} level={level} skinTone={skinTone} hairColor={hairColor} />
      </div>
    </div>
  );
}

const GERMAN_DAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const GERMAN_MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

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
    <div className="view-enter" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFF8F0" }}>

      {/* --- 1. Top Bar (logo + lock) --- */}
      <div style={{
        padding: "env(safe-area-inset-top, 12px) 16px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 10,
      }}>
        <img src={import.meta.env.BASE_URL + "ronki-egg.png"} alt="Ronki" style={{ height: 36, width: "auto" }} />
        <button
          aria-label={pMode ? "Elternmodus deaktivieren" : "Elternmodus aktivieren"}
          onClick={() => pMode ? setPMode(false) : setPinShow(true)}
          style={{
            background: "rgba(180,120,40,0.08)", border: "2px solid rgba(180,120,40,0.10)",
            borderRadius: 50, padding: "6px 12px", cursor: "pointer",
            color: T.textSecondary, fontSize: ".85rem", fontWeight: 700,
            minHeight: 44, minWidth: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {pMode ? "\uD83D\uDD13" : "\uD83D\uDD12"}
        </button>
      </div>

      <div style={{ flex: 1, padding: "0 16px 20px" }}>

        {/* --- 2. Profile Card --- */}
        <div className="game-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {/* LEFT: Portrait + Cat + Name + Level */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 4 }}>
              <div style={{ position: "relative", marginBottom: 4 }}>
                <div style={{
                  width: 96, height: 96, borderRadius: "50%", padding: 3,
                  background: `linear-gradient(135deg, ${state.hero.color}, ${state.hero.color}88, rgba(255,255,255,0.3))`,
                  boxShadow: `0 4px 16px ${state.hero.color}30`,
                }}>
                  <HeroPortrait shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} level={level} size={90} skinTone={state.hero.skinTone} hairColor={state.hero.hairColor} />
                </div>
                <div style={{ position: "absolute", bottom: -6, right: -18, animation: "catIdle 4s ease-in-out infinite" }}>
                  {state.eggHatched ? (
                    <Companion
                      type={state.companionType}
                      variant={state.catVariant}
                      mood={(() => { const cm = getCatMood(state.catHunger, state.catHappy, state.catEnergy); return cm === "sleepy" ? "sleepy" : mood; })()}
                      size={36}
                      stage={getCatStage(state.catEvo || 0)}
                    />
                  ) : (
                    <Egg type={state.eggType || "dragon"} progress={state.eggProgress || 0} size={36} />
                  )}
                </div>
              </div>
              <div style={{ textAlign: "center", maxWidth: 100 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700,
                  color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {state.hero.name}
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #A78BFA, #7C3AED)", borderRadius: 50,
                  padding: "2px 10px", fontFamily: "'Fredoka',sans-serif",
                  fontSize: ".85rem", fontWeight: 700, color: "white",
                  display: "inline-block", marginTop: 2,
                }}>
                  LVL {level}
                </div>
              </div>
            </div>

            {/* RIGHT: 2x2 grid — HP, Streak, Weather, Date */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {/* Heldenpunkte */}
              <div style={{
                background: "#FEF3C720", borderRadius: 14, padding: "10px 10px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: "1.4rem" }}>{"\u2B50"}</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#D97706" }}>
                    {(state.coins || 0).toLocaleString("de-DE")}
                  </div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textLight }}>HP</div>
                </div>
              </div>
              {/* Streak */}
              <div style={{
                background: "#FEF3C720", borderRadius: 14, padding: "10px 10px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: "1.4rem" }}>{"\uD83D\uDD25"}</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#EA580C" }}>
                    {state.sd || 0}
                  </div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textLight }}>Tage</div>
                </div>
              </div>
              {/* Weather — min/max */}
              <div style={{
                background: "#E0F2FE40", borderRadius: 14, padding: "8px 10px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: "1.3rem" }}>{wInfo?.emoji || "\u2601\uFE0F"}</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0284C7" }}>
                    {todayDaily ? `${todayDaily.tempMin}\u00B0 / ${todayDaily.tempMax}\u00B0` : weather?.current ? `${weather.current.temp}\u00B0` : "\u2022\u2022\u2022"}
                  </div>
                </div>
              </div>
              {/* Date — Do. 9. April */}
              <div style={{
                background: "#EDE9FE40", borderRadius: 14, padding: "8px 10px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: "1.2rem" }}>{"\uD83D\uDCC5"}</span>
                <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: "#6366F1" }}>
                  {dayKey}. {today.getDate()}. {GERMAN_MONTHS[today.getMonth()]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2b. Login Bonus Card --- */}
        {!state.loginBonusClaimed && (
          <LoginBonus
            day={state.loginBonusDay || 0}
            streak={state.loginBonusStreak || 0}
            onCollect={() => actions.collectLoginBonus()}
          />
        )}

        {/* --- 3. Helden-Tipp Card --- */}
        {tip && (
          <div className="game-card" style={{
            padding: 14, marginBottom: 12,
            background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))",
            borderColor: "rgba(245,158,11,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>{tip.emoji}</span>
              <div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".9rem", fontWeight: 800,
                  color: "#B45309", textTransform: "uppercase", marginBottom: 4,
                }}>
                  Helden-Tipp von {tip.char}
                </div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 600,
                  color: T.textPrimary, lineHeight: 1.4,
                }}>
                  {tip.tip}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. Daily Habits Row --- */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {/* Vitamin D */}
          <button
            className="btn-tap"
            onClick={() => { if (!state.dailyVitaminD) actions.completeHabit("vitaminD"); }}
            style={{
              flex: 1, background: state.dailyVitaminD ? "rgba(52,211,153,0.1)" : "white",
              border: `2.5px solid ${state.dailyVitaminD ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`,
              borderRadius: 18, padding: "12px 6px", cursor: state.dailyVitaminD ? "default" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{state.dailyVitaminD ? "\u2705" : "\uD83D\uDC8A"}</span>
            <span style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
              color: state.dailyVitaminD ? "#059669" : T.textPrimary,
            }}>
              Vitamin D
            </span>
            {!state.dailyVitaminD && (
              <span style={{ fontSize: ".9rem", fontWeight: 700, color: "#D97706" }}>+5 {"\u2B50"}</span>
            )}
          </button>

          {/* Liam */}
          <button
            className="btn-tap"
            onClick={() => { if (!state.dailyBrother) actions.completeHabit("brother"); }}
            style={{
              flex: 1, background: state.dailyBrother ? "rgba(52,211,153,0.1)" : "white",
              border: `2.5px solid ${state.dailyBrother ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`,
              borderRadius: 18, padding: "12px 6px", cursor: state.dailyBrother ? "default" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{state.dailyBrother ? "\u2705" : "\uD83D\uDC76"}</span>
            <span style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
              color: state.dailyBrother ? "#059669" : T.textPrimary,
            }}>
              Liam
            </span>
            {!state.dailyBrother && (
              <span style={{ fontSize: ".9rem", fontWeight: 700, color: "#D97706" }}>+10 {"\u2B50"}</span>
            )}
          </button>

          {/* Katze — always clickable to visit cat */}
          <button
            className="btn-tap"
            onClick={() => ui.setView("cat")}
            style={{
              flex: 1, background: catAllDone ? "rgba(52,211,153,0.1)" : "white",
              border: `2.5px solid ${catAllDone ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`,
              borderRadius: 18, padding: "12px 6px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              position: "relative",
            }}
          >
            <span style={{ fontSize: "1.6rem" }}>{"\uD83D\uDC31"}</span>
            {catAllDone && (
              <span style={{
                position: "absolute", top: 4, right: 4, fontSize: ".9rem",
              }}>{"\u2705"}</span>
            )}
            <span style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
              color: T.textPrimary,
            }}>
              {state.catName || "Katze"}
            </span>
            {!catAllDone && (
              <span style={{ fontSize: ".9rem", fontWeight: 700, color: T.textLight }}>
                {[!state.catFed && "\uD83C\uDF63", !state.catPetted && "\uD83E\uDD0D", !state.catPlayed && "\uD83E\uDDF6"].filter(Boolean).join(" ")}
              </span>
            )}
          </button>
        </div>

        {/* --- 5. Today's Lunch Card --- */}
        {lunch && (
          <div className="game-card" style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.3rem" }}>{"\uD83C\uDF7D\uFE0F"}</span>
              <div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
                  color: T.textSecondary, textTransform: "uppercase",
                }}>
                  Heute
                </div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
                  color: T.textPrimary,
                }}>
                  {lunch}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 6. Mood Check --- */}
        {state.moodAM === null && (
          <div className="game-card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
              color: T.textSecondary, textTransform: "uppercase", marginBottom: 10,
            }}>
              Wie startest du in den Tag? {"\uD83C\uDF05"}
            </div>
            <div
              role="group"
              aria-label="Morgenstimmung wählen"
              style={{ display: "flex", justifyContent: "space-between", gap: 4 }}
            >
              {MOOD_EMOJIS.map((e, i) => (
                <button
                  key={i}
                  aria-label={`Stimmung ${i + 1} von ${MOOD_EMOJIS.length}`}
                  onClick={() => { SFX.play("pop"); actions.setMood("moodAM", i); setCeleb(true); }}
                  style={{
                    fontSize: "2rem", background: "none", border: "none",
                    cursor: "pointer", padding: "8px", borderRadius: 12,
                    transition: "all .15s", minHeight: 52, minWidth: 52,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- 7. Special Missions --- */}
        {state.specialMissions?.filter(m => !m.done).map(mission => (
          <button
            key={mission.id}
            className="btn-tap game-card"
            onClick={() => actions.completeSpecialMission(mission.id)}
            style={{
              width: "100%", padding: 14, marginBottom: 12, cursor: "pointer",
              background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))",
              borderColor: "rgba(245,158,11,0.25)",
              display: "flex", alignItems: "center", gap: 12, textAlign: "left",
            }}
          >
            <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{mission.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
                color: "#B45309", textTransform: "uppercase",
              }}>
                Spezial-Mission
              </div>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
                color: T.textPrimary,
              }}>
                {mission.name}
              </div>
            </div>
            <div style={{
              background: "linear-gradient(135deg, #FCD34D, #F59E0B)", borderRadius: 50,
              padding: "4px 12px", fontFamily: "'Fredoka',sans-serif",
              fontSize: ".85rem", fontWeight: 700, color: "white",
            }}>
              +{mission.hp} {"\u2B50"}
            </div>
          </button>
        ))}

        {/* --- 8. Boss Card (active) --- */}
        {state.boss && state.boss.hp > 0 && (() => {
          const bossData = BOSSES.find(b => b.id === state.boss.id);
          if (!bossData) return null;
          const hpPct = Math.round((state.boss.hp / state.boss.maxHp) * 100);
          return (
            <div className="game-card" style={{
              padding: 16, marginBottom: 12,
              background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.04))",
              borderColor: "rgba(239,68,68,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "1.6rem", animation: "bossShake 0.6s ease-in-out infinite" }}>{bossData.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
                    color: "#DC2626", textTransform: "uppercase",
                  }}>
                    Wochen-Boss
                  </div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
                    color: T.textPrimary,
                  }}>
                    {bossData.name}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: ".9rem", fontWeight: 700,
                  color: hpPct > 50 ? "#DC2626" : hpPct > 25 ? T.accentDark : T.success,
                }}>
                  {state.boss.hp}/{state.boss.maxHp} HP
                </div>
              </div>
              <div style={{ fontSize: ".9rem", color: T.textSecondary, marginBottom: 8 }}>{bossData.desc}</div>
              <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 50, height: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 50, width: `${hpPct}%`,
                  background: hpPct > 50
                    ? "linear-gradient(90deg, #EF4444, #F97316)"
                    : hpPct > 25
                      ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                      : "linear-gradient(90deg, #34D399, #6EE7B7)",
                  transition: "width .6s ease",
                }} />
              </div>
              <div style={{ fontSize: ".85rem", color: T.textLight, marginTop: 6, textAlign: "center" }}>
                Schließe Aufgaben ab, um den Boss anzugreifen!
              </div>
            </div>
          );
        })()}

        {/* Boss defeated */}
        {state.boss && state.boss.hp <= 0 && (() => {
          const bossData = BOSSES.find(b => b.id === state.boss.id);
          if (!bossData) return null;
          return (
            <div className="game-card" style={{
              padding: 16, marginBottom: 12,
              background: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))",
              borderColor: `${T.success}40`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>{"\uD83C\uDFC6"}</span>
                <div>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".9rem",
                    color: T.successDark, textTransform: "uppercase",
                  }}>
                    Boss besiegt!
                  </div>
                  <div style={{ fontSize: ".9rem", fontWeight: 700, color: T.textPrimary }}>
                    {bossData.icon} {bossData.name} wurde besiegt! +{bossData.reward.xp} XP, +{bossData.reward.coins} Heldenpunkte
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* --- 9. Weekly Mission Card --- */}
        {(() => {
          const wm = WEEKLY_MISSIONS.find(m => m.id === state.weeklyMission);
          if (!wm) return null;
          const wp = state.weeklyProgress || 0;
          const wmDone = wp >= wm.target;
          return (
            <div className="game-card" style={{
              padding: 16, marginBottom: 12,
              background: wmDone ? "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))" : undefined,
              borderColor: wmDone ? `${T.success}40` : undefined,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "1.4rem" }}>{wm.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
                    color: wmDone ? T.successDark : T.primary, textTransform: "uppercase",
                  }}>
                    {wmDone ? "\uD83D\uDCAA Geschafft!" : "Wochen-Mission"}
                  </div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
                    color: T.textPrimary,
                  }}>
                    {wm.title}
                  </div>
                </div>
                <div className="mission-reward">
                  <span style={{
                    fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700,
                    color: wmDone ? T.success : T.primary,
                  }}>
                    {Math.min(wp, wm.target)}/{wm.target}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: ".9rem", color: T.textSecondary, marginBottom: 8 }}>{wm.story}</div>
              <div className="mission-progress-track">
                <div className="mission-progress-fill" style={{
                  width: `${Math.min(100, (wp / wm.target) * 100)}%`,
                  background: wmDone
                    ? `linear-gradient(90deg,${T.success},#6EE7B7)`
                    : `linear-gradient(90deg,${T.primary},${T.primaryLight})`,
                }} />
              </div>
              {wmDone && (
                <div style={{
                  fontSize: ".9rem", color: T.success, fontWeight: 700, marginTop: 6, textAlign: "center",
                }}>
                  {"\uD83C\uDF89"} +{wm.reward.amount} {wm.reward.type === "coins" ? "Heldenpunkte" : "XP"} erhalten!
                </div>
              )}
            </div>
          );
        })()}

        {/* --- 10. Quick Links --- */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            className="btn-tap"
            onClick={() => ui.setView("journal")}
            style={{
              flex: 1, background: "white", border: "2.5px solid rgba(180,120,40,0.08)",
              borderRadius: 18, padding: "14px 12px", cursor: "pointer",
              fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: ".95rem",
              color: T.textPrimary, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, minHeight: 52,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {"\uD83D\uDCD3"} Tagebuch
          </button>
          <button
            className="btn-tap"
            onClick={() => ui.setView("time")}
            style={{
              flex: 1, background: "white", border: "2.5px solid rgba(180,120,40,0.08)",
              borderRadius: 18, padding: "14px 12px", cursor: "pointer",
              fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: ".95rem",
              color: T.textPrimary, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, minHeight: 52,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {"\u2B50"} Belohnungen
          </button>
        </div>

        {/* Familienregeln button */}
        <button
          className="btn-tap"
          onClick={() => ui.setView("regeln")}
          style={{
            width: "100%", background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))",
            border: "2.5px solid rgba(245,158,11,0.15)",
            borderRadius: 18, padding: "14px 12px", cursor: "pointer",
            fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: ".95rem",
            color: "#B45309", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, minHeight: 52,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 12,
          }}
        >
          {"\uD83D\uDCDC"} Familienregeln
        </button>

      </div>
    </div>
  );
}
