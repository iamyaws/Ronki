import React from 'react';
import { T, WEEKLY_MISSIONS, BOSSES, BOSS_TIERS, HERO_TIPS, MOOD_EMOJIS } from '../constants';
import { getTimeLabel, GERMAN_DAYS_SHORT } from '../utils/helpers';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import LoginBonus from './LoginBonus';
import ProfileCard from './ProfileCard';
import BossCard from './BossCard';

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
    <div className="lotus-pattern px-6 pb-8 space-y-6">

      {/* ── Parent mode toggle (floating) ── */}
      <div className="flex justify-end">
        <button
          aria-label={pMode ? "Elternmodus deaktivieren" : "Elternmodus aktivieren"}
          onClick={() => pMode ? setPMode(false) : setPinShow(true)}
          className="btn-tap w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            {pMode ? 'lock_open' : 'lock'}
          </span>
        </button>
      </div>

      {/* ── Profile Card (kept as-is, migrated later) ── */}
      <ProfileCard state={state} level={level} mood={mood} weather={weather} wInfo={wInfo} todayDaily={todayDaily} actions={actions} onCompanionTap={() => ui.setView("companion")} />

      {/* ── Login Bonus ── */}
      <LoginBonus claimed={state.loginBonusClaimed} onCollect={() => actions.collectLoginBonus()} />

      {/* ── Hero Tip ── */}
      {tip && (
        <div className="mm-card-tint bg-secondary-fixed/20 border-l-4 border-l-secondary p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{tip.emoji}</span>
            <div>
              <p className="font-label font-bold text-xs uppercase tracking-wider text-secondary">
                Helden-Tipp von {tip.char}
              </p>
              <p className="font-headline text-base font-semibold text-on-surface mt-1 leading-snug">
                {tip.tip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Yesterday's commitment ── */}
      {state.yesterdayCommitment && (
        <div className="mm-card p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">assignment</span>
          <div>
            <p className="font-label font-bold text-xs text-primary">Gestern vorgenommen:</p>
            <p className="font-body font-bold text-sm text-on-surface">{state.yesterdayCommitment.text}</p>
          </div>
        </div>
      )}

      {/* ── Morning Mood (if not set) ── */}
      {state.moodAM === null && (
        <div className="mm-card p-6">
          <p className="font-label font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-5">
            Wie startest du in den Tag?
          </p>
          <div role="group" aria-label="Morgenstimmung wählen" className="flex justify-between gap-2">
            {MOOD_EMOJIS.map((e, i) => (
              <button key={i} aria-label={`Stimmung ${i + 1}`}
                onClick={() => { SFX.play("pop"); actions.setMood("moodAM", i); setCeleb(true); }}
                className="btn-tap text-4xl p-3 rounded-full hover:bg-surface-container transition-all"
                style={{ minHeight: 64, minWidth: 56 }}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Habit Buttons ── */}
      <div className="grid grid-cols-3 gap-4">
        <button className="btn-tap mm-card p-4 flex flex-col items-center gap-3 transition-all"
          onClick={() => { if (!state.dailyVitaminD) { actions.completeHabit("vitaminD"); if (navigator.vibrate) navigator.vibrate(50); } }}
          style={{
            background: state.dailyVitaminD ? 'rgba(52,211,153,0.1)' : undefined,
            borderColor: state.dailyVitaminD ? 'rgba(52,211,153,0.3)' : undefined,
            minHeight: 96,
          }}>
          <span className="text-2xl">{state.dailyVitaminD ? "✅" : "💊"}</span>
          <span className="font-label font-bold text-base text-on-surface">Vitamin D</span>
          {!state.dailyVitaminD && <span className="font-label text-sm font-bold text-secondary">+5 HP</span>}
        </button>

        <button className="btn-tap mm-card p-4 flex flex-col items-center gap-3 transition-all"
          onClick={() => { if (!state.dailyBrother) { actions.completeHabit("brother"); if (navigator.vibrate) navigator.vibrate(50); } }}
          style={{
            background: state.dailyBrother ? 'rgba(52,211,153,0.1)' : undefined,
            borderColor: state.dailyBrother ? 'rgba(52,211,153,0.3)' : undefined,
            minHeight: 96,
          }}>
          <span className="text-2xl">{state.dailyBrother ? "✅" : "👶"}</span>
          <span className="font-label font-bold text-base text-on-surface">Liam</span>
          {!state.dailyBrother && <span className="font-label text-sm font-bold text-secondary">+10 HP</span>}
        </button>

        <button className="btn-tap mm-card p-4 flex flex-col items-center gap-3 transition-all relative"
          onClick={() => ui.setView("cat")}
          style={{
            background: catAllDone ? 'rgba(52,211,153,0.1)' : undefined,
            borderColor: catAllDone ? 'rgba(52,211,153,0.3)' : undefined,
            minHeight: 96,
          }}>
          <span className="text-2xl">🐱</span>
          {catAllDone && <span className="absolute top-1 right-1 text-base">✅</span>}
          <span className="font-label font-bold text-base text-on-surface">{state.catName || "Katze"}</span>
          {!catAllDone && (
            <span className="font-label text-sm text-on-surface-variant">
              {[!state.catFed && "🍣", !state.catPetted && "🤍", !state.catPlayed && "🧶"].filter(Boolean).join(" ")}
            </span>
          )}
        </button>
      </div>

      {/* All habits done celebration */}
      {state.dailyVitaminD && state.dailyBrother && catAllDone && (
        <div className="mm-card-tint bg-emerald/5 p-4 text-center">
          <span className="text-xl">🎉</span>
          <p className="font-headline text-sm font-bold text-emerald-dark mt-1">
            Alle Gewohnheiten erledigt! Super!
          </p>
        </div>
      )}

      {/* ── Water Tracker ── */}
      <div className="mm-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">water_drop</span>
          <span className="font-label font-bold text-base text-primary">
            Wasser trinken ({state.dailyWaterCount || 0}/6)
          </span>
        </div>
        <div className="flex gap-2">
          {[0,1,2,3,4,5].map(i => (
            <button key={i} className="btn-tap flex-1 h-10 rounded-lg transition-all"
              onClick={() => i === (state.dailyWaterCount || 0) && actions.drinkWater()}
              style={{
                background: i < (state.dailyWaterCount || 0) ? 'linear-gradient(180deg, #3B82F6, #60A5FA)' : 'rgba(59,130,246,0.06)',
                border: '2px solid rgba(59,130,246,0.15)',
                opacity: i < (state.dailyWaterCount || 0) ? 1 : i === (state.dailyWaterCount || 0) ? 0.7 : 0.3,
                cursor: i === (state.dailyWaterCount || 0) ? 'pointer' : 'default',
              }}>
              {i < (state.dailyWaterCount || 0) && <span className="text-white text-sm">💧</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lunch ── */}
      {lunch && (
        <div className="mm-card p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">restaurant</span>
          <div>
            <p className="font-label font-bold text-xs uppercase tracking-wider text-on-surface-variant">Heute</p>
            <p className="font-body font-bold text-sm text-on-surface">{lunch}</p>
          </div>
        </div>
      )}

      {/* ── Helden-Kodex ── */}
      <button className="btn-tap w-full mm-card p-4 flex items-center justify-center gap-2 font-label font-bold text-sm text-secondary"
        onClick={() => ui.setView("regeln")}>
        <span className="material-symbols-outlined text-secondary">shield</span>
        Helden-Kodex
      </button>

      {/* ── Special Missions ── */}
      {state.specialMissions?.filter(m => !m.done).map(mission => (
        <button key={mission.id} className="btn-tap w-full bg-secondary-fixed/20 border border-secondary-container/30 rounded-lg p-4 flex items-center gap-3 text-left"
          onClick={() => actions.completeSpecialMission(mission.id)}>
          <span className="text-2xl shrink-0">{mission.emoji}</span>
          <div className="flex-1">
            <p className="font-label font-bold text-xs uppercase tracking-wider text-secondary">Spezial-Mission</p>
            <p className="font-body font-bold text-sm text-on-surface">{mission.name}</p>
          </div>
          <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 font-label font-bold text-xs">
            +{mission.hp} ⭐
          </span>
        </button>
      ))}

      {/* ── Quest Chains ── */}
      {(state.questChains || []).filter(c => !c.completed).map(chain => {
        const doneSteps = chain.steps.filter(s => s.done).length;
        const totalSteps = chain.steps.length;
        const firstUndoneIdx = chain.steps.findIndex(s => !s.done);
        const daysLeft = chain.deadline ? Math.ceil((new Date(chain.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        return (
          <div key={chain.id} className="mm-card p-5 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{chain.emoji}</span>
              <div className="flex-1">
                <p className="font-label font-bold text-xs uppercase tracking-wider text-primary">Abenteuer-Kette</p>
                <p className="font-body font-bold text-sm text-on-surface">{chain.name}</p>
              </div>
              <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 font-label font-bold text-xs">
                +{chain.hp} ⭐
              </span>
            </div>
            {daysLeft !== null && (
              <p className={`font-label font-bold text-xs mb-2 ${daysLeft <= 5 ? 'text-error' : daysLeft <= 10 ? 'text-secondary' : 'text-on-surface-variant'}`}>
                📅 {daysLeft > 0 ? `Noch ${daysLeft} Tage!` : daysLeft === 0 ? "Heute!" : "Abgelaufen"}
              </p>
            )}
            <div className="h-2 bg-surface-container rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full bg-primary transition-all duration-400" style={{ width: `${(doneSteps / totalSteps) * 100}%` }} />
            </div>
            <p className="font-label text-xs font-bold text-on-surface-variant mb-3">{doneSteps}/{totalSteps} Schritte</p>
            <div className="space-y-2">
              {chain.steps.map((step, idx) => {
                const isCurrent = idx === firstUndoneIdx;
                return (
                  <button key={step.id} className={`btn-tap w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    step.done ? 'bg-emerald/5 opacity-60' : isCurrent ? 'bg-secondary-fixed/20 border border-secondary-container/30' : 'bg-surface-container opacity-40'
                  }`} onClick={() => !step.done && actions.completeChainStep(chain.id, step.id)}
                    style={{ minHeight: 44 }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      step.done ? 'bg-emerald text-white' : isCurrent ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {step.done ? "✓" : idx + 1}
                    </div>
                    <span className={`font-label font-bold text-sm ${step.done ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>
                      {step.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Boss Card ── */}
      {state.boss && <BossCard boss={state.boss} />}

      {/* ── Weekly Mission ── */}
      {(() => {
        const wm = WEEKLY_MISSIONS.find(m => m.id === state.weeklyMission);
        if (!wm) return null;
        const wp = state.weeklyProgress || 0;
        const wmDone = wp >= wm.target;
        return (
          <div className={`mm-card p-5 ${wmDone ? 'border border-emerald/20' : ''}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{wm.icon}</span>
              <div className="flex-1">
                <p className={`font-label font-bold text-xs uppercase tracking-wider ${wmDone ? 'text-emerald-dark' : 'text-primary'}`}>
                  {wmDone ? "💪 Geschafft!" : "Wochen-Mission"}
                </p>
                <p className="font-body font-bold text-sm text-on-surface">{wm.title}</p>
              </div>
              <span className={`font-headline text-base font-bold ${wmDone ? 'text-emerald-dark' : 'text-primary'}`}>
                {Math.min(wp, wm.target)}/{wm.target}
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant mb-3">{wm.story}</p>
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-600" style={{
                width: `${Math.min(100, (wp / wm.target) * 100)}%`,
                background: wmDone ? 'linear-gradient(90deg, #34D399, #6EE7B7)' : 'linear-gradient(90deg, #5300b7, #6d28d9)',
              }} />
            </div>
            {wmDone && <p className="text-center font-label text-xs font-bold text-emerald-dark mt-3">🎉 +{wm.reward.amount} Heldenpunkte erhalten!</p>}
          </div>
        );
      })()}

      {/* ── Bottom Quick Links ── */}
      <div className="flex gap-4">
        <button className="btn-tap flex-1 mm-card p-5 flex items-center justify-center gap-3 font-label font-bold text-base text-on-surface"
          onClick={() => ui.setView("journal")}
          style={{ minHeight: 60 }}>
          <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
          Tagebuch
        </button>
        <button className="btn-tap flex-1 mm-card p-5 flex items-center justify-center gap-3 font-label font-bold text-base text-on-surface"
          onClick={() => ui.setView("time")}
          style={{ minHeight: 60 }}>
          <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          Belohnungen
        </button>
      </div>

      {/* ── Parent Panel (inline when parent mode active) ── */}
      {pMode && (
        <div className="mt-4">
          <div className="bg-surface-container-high rounded-lg p-4 mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">shield_person</span>
            <div>
              <p className="font-headline font-bold text-lg text-primary">Eltern-Bereich</p>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">PIN-Geschützt</p>
            </div>
          </div>
          {/* Import the existing ParentPanel component */}
          <ParentPanelInline />
        </div>
      )}
    </div>
  );
}

// Lazy inline import to avoid circular deps
function ParentPanelInline() {
  const ParentPanel = React.lazy(() => import('./ParentPanel'));
  return (
    <React.Suspense fallback={<div className="text-center p-4 font-body text-on-surface-variant">Laden...</div>}>
      <ParentPanel />
    </React.Suspense>
  );
}
