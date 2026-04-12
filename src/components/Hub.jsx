import React from 'react';
import { T, WEEKLY_MISSIONS, BOSSES, BOSS_TIERS, HERO_TIPS, MOOD_EMOJIS, COMPANION_TYPES } from '../constants';
import { getTimeLabel, GERMAN_DAYS_SHORT, getCatStage } from '../utils/helpers';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import LoginBonus from './LoginBonus';
import BossCard from './BossCard';
import Companion from './Companion';
import Egg from './Egg';

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

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
  const remaining = total - done;
  const stage = getCatStage(state.catEvo || 0);
  const companionMood = mood;

  return (
    <div className="lotus-pattern px-6 pb-8 space-y-6">

      {/* ── Companion / Egg Hero Section ── */}
      <section className="relative py-8 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Moss patch */}
          <div className="absolute bottom-2 w-36 h-10 bg-[#b5c99a] blur-xl opacity-40 rounded-full scale-x-125" />

          <div className="relative z-10 cursor-pointer" onClick={() => ui.setView("companion")}>
            {state.eggHatched ? (
              <Companion type={state.companionType || "cat"} variant={state.catVariant} mood={companionMood} size={140} stage={stage} gear={state.equippedGear} />
            ) : (
              <Egg type={state.eggType || "dragon"} size={120} progress={state.eggProgress || 0} />
            )}
          </div>

          {/* Stage label */}
          <div className="absolute -bottom-1 bg-white px-4 py-1.5 rounded-full border border-outline-variant/30 shadow-sm z-20">
            <p className="font-label font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
              {state.eggHatched ? (state.catName || "Begleiter") : `Stufe ${stage + 1} Ei`}
            </p>
          </div>
        </div>

        {/* Heldenpunkte pill */}
        <div className="mt-8 mm-card flex items-center gap-2 px-6 py-3 rounded-full">
          <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
          <span className="font-label font-extrabold text-on-surface text-base">{state.hp || 0} Heldenpunkte</span>
        </div>
      </section>

      {/* ── Login Bonus ── */}
      <LoginBonus claimed={state.loginBonusClaimed} onCollect={() => actions.collectLoginBonus()} />

      {/* ── Daily Summary Card ── */}
      <section className="mm-card p-6 relative overflow-hidden">
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <h3 className="font-headline font-bold text-lg text-on-surface">
              {allDone ? "Alles geschafft!" : `Noch ${remaining} Aufgaben heute`}
            </h3>
            <p className="font-body text-on-surface-variant text-sm">
              {allDone ? "Du bist ein wahrer Held!" : "Bleib dran, dein Drache wächst!"}
            </p>
          </div>
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-surface-container" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="5" />
              <circle className="text-secondary-container" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor"
                strokeDasharray="176" strokeDashoffset={176 - pct * 176} strokeLinecap="round" strokeWidth="5" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {allDone ? 'celebration' : 'auto_awesome'}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-secondary-container/10 rounded-full blur-2xl" />
      </section>

      {/* ── Quick Stats Grid: Mood + Water ── */}
      <section className="grid grid-cols-2 gap-4">
        {/* Mood Card */}
        <div className="mm-card p-5 flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight: 150 }}>
          {state.moodAM !== null ? (
            <>
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-3xl shadow-sm">
                {MOOD_EMOJIS[state.moodAM]}
              </div>
              <div>
                <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase tracking-widest">Stimmung</p>
                <p className="font-headline font-bold text-lg text-on-surface">{MOOD_LABELS[state.moodAM]}</p>
              </div>
            </>
          ) : (
            <>
              <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase tracking-widest">Stimmung</p>
              <div className="flex gap-1 flex-wrap justify-center">
                {MOOD_EMOJIS.slice(0, 5).map((e, i) => (
                  <button key={i} onClick={() => { SFX.play("pop"); actions.setMood("moodAM", i); setCeleb(true); }}
                    className="btn-tap text-2xl p-1.5 rounded-full hover:bg-surface-container transition-all"
                    style={{ minWidth: 40, minHeight: 40 }}>
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Water Tracker Card */}
        <div className="mm-card p-5 flex flex-col justify-between" style={{ minHeight: 150 }}>
          <div className="flex justify-between items-center mb-3">
            <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase tracking-widest">Wasser</p>
            <span className="material-symbols-outlined text-primary text-lg">water_drop</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {[0,1,2,3,4,5].map(i => (
              <button key={i}
                className={`btn-tap w-6 h-6 rounded-full border-2 transition-all ${
                  i < (state.dailyWaterCount || 0)
                    ? 'bg-primary border-primary'
                    : 'border-primary/20 bg-surface-container-low'
                }`}
                onClick={() => i === (state.dailyWaterCount || 0) && actions.drinkWater()}
                style={{ cursor: i === (state.dailyWaterCount || 0) ? 'pointer' : 'default' }}
              />
            ))}
          </div>
          <p className="text-center font-label font-bold text-[10px] mt-2 text-on-surface-variant">
            {state.dailyWaterCount || 0}/6 Gläser
          </p>
        </div>
      </section>

      {/* ── Boss Card ── */}
      {state.boss && <BossCard boss={state.boss} />}

      {/* ── Weekly Mission ── */}
      {(() => {
        const wm = WEEKLY_MISSIONS.find(m => m.id === state.weeklyMission);
        if (!wm) return null;
        const wp = state.weeklyProgress || 0;
        const wmDone = wp >= wm.target;
        return (
          <div className={`mm-card p-6 border-2 border-dashed ${wmDone ? 'border-emerald/30' : 'border-primary/20'}`}
               style={{ background: wmDone ? 'rgba(52,211,153,0.05)' : undefined }}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{wm.icon}</span>
                <h4 className="font-label font-bold text-sm text-primary uppercase tracking-tight">
                  {wmDone ? "Geschafft!" : "Wochen-Mission"}
                </h4>
              </div>
              <span className="font-label font-bold text-sm text-on-surface-variant">
                {Math.min(wp, wm.target)} / {wm.target}
              </span>
            </div>
            <p className="font-headline font-bold text-lg text-on-surface mb-1">{wm.title}</p>
            <p className="font-body text-sm text-on-surface-variant">{wm.story}</p>
            {wmDone && (
              <p className="font-label text-sm font-bold text-emerald-dark mt-3">+{wm.reward.amount} Heldenpunkte erhalten!</p>
            )}
          </div>
        );
      })()}

      {/* ── Special Missions ── */}
      {state.specialMissions?.filter(m => !m.done).length > 0 && (
        <div className="space-y-3">
          {state.specialMissions.filter(m => !m.done).map(mission => (
            <button key={mission.id} className="btn-tap w-full mm-card p-5 flex items-center gap-4 text-left"
              onClick={() => actions.completeSpecialMission(mission.id)}>
              <span className="text-2xl shrink-0">{mission.emoji}</span>
              <div className="flex-1">
                <p className="font-label font-bold text-[10px] uppercase tracking-wider text-secondary">Spezial-Mission</p>
                <p className="font-body font-bold text-base text-on-surface">{mission.name}</p>
              </div>
              <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1.5 font-label font-bold text-xs">
                +{mission.hp} HP
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Quest Chains ── */}
      {(state.questChains || []).filter(c => !c.completed).map(chain => {
        const doneSteps = chain.steps.filter(s => s.done).length;
        const totalSteps = chain.steps.length;
        const daysLeft = chain.deadline ? Math.ceil((new Date(chain.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        return (
          <div key={chain.id} className="mm-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{chain.emoji}</span>
              <div className="flex-1">
                <p className="font-label font-bold text-[10px] uppercase tracking-wider text-primary">Abenteuer-Kette</p>
                <p className="font-headline font-bold text-base text-on-surface">{chain.name}</p>
              </div>
              <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1.5 font-label font-bold text-xs">
                +{chain.hp} HP
              </span>
            </div>
            {daysLeft !== null && (
              <p className={`font-label font-bold text-xs mb-2 ${daysLeft <= 5 ? 'text-error' : 'text-on-surface-variant'}`}>
                📅 {daysLeft > 0 ? `Noch ${daysLeft} Tage!` : daysLeft === 0 ? "Heute!" : "Abgelaufen"}
              </p>
            )}
            <div className="h-2 bg-surface-container rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full bg-primary transition-all duration-400" style={{ width: `${(doneSteps / totalSteps) * 100}%` }} />
            </div>
            <p className="font-label text-xs font-bold text-on-surface-variant">{doneSteps}/{totalSteps} Schritte</p>
          </div>
        );
      })}

      {/* ── Decorative spacer ── */}
      <div className="flex justify-center pt-2 opacity-10">
        <span className="material-symbols-outlined text-4xl">local_florist</span>
      </div>

      {/* ── Parent Panel ── */}
      {pMode && (
        <div className="mt-4">
          <div className="mm-card p-4 mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">shield_person</span>
            <div>
              <p className="font-headline font-bold text-lg text-primary">Eltern-Bereich</p>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">PIN-Geschützt</p>
            </div>
          </div>
          <ParentPanelInline />
        </div>
      )}
    </div>
  );
}

function ParentPanelInline() {
  const ParentPanel = React.lazy(() => import('./ParentPanel'));
  return (
    <React.Suspense fallback={<div className="text-center p-4 font-body text-on-surface-variant">Laden...</div>}>
      <ParentPanel />
    </React.Suspense>
  );
}
