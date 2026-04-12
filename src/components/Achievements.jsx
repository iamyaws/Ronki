import React from 'react';
import { BADGES as BADGE_DEFS } from '../constants';
import HeroSprite from './HeroSprite';
import { useGame } from '../context/GameContext';

export default function Achievements() {
  const { state, computed, ui } = useGame();
  const { level } = computed;

  const badges = BADGE_DEFS.map((b, i) => ({
    ...b,
    u: [state.xp > 0, state.sd >= 3, state.sd >= 7, level >= 5, (state.hist||[]).length >= 50, level >= 10, state.sd >= 30, (state.hist||[]).length >= 100, (state.acc||[]).length > 0][i],
  }));

  return (
    <div className="lotus-pattern px-6 pb-32 space-y-6">
      {/* Hero card */}
      <div className="mm-card p-5 flex items-center gap-4">
        <HeroSprite shape={state.hero?.shape} color={state.hero?.color} eyes={state.hero?.eyes} hair={state.hero?.hair} size={80} level={level} skinTone={state.hero?.skinTone} hairColor={state.hero?.hairColor} />
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">{state.hero?.name}</h2>
          <p className="font-label text-sm text-on-surface-variant">Level {level} Held</p>
          <div className="flex gap-3 mt-2">
            <span className="font-label text-xs font-bold text-primary">⚡{state.xp}</span>
            <span className="font-label text-xs font-bold text-secondary">⭐{state.coins}</span>
            <span className="font-label text-xs font-bold text-tertiary">🔥{state.sd}d</span>
          </div>
        </div>
      </div>

      {/* Streak card */}
      <div className="bg-secondary-fixed/20 border border-secondary-container/20 rounded-lg p-5 flex items-center gap-4">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="font-headline text-2xl font-bold text-tertiary">{state.sd || 0} Tage Streak</p>
          <p className="font-label text-sm font-bold text-on-surface-variant">Bester: {state.bestStreak || 0} Tage</p>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3 px-1">Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b, i) => (
            <div key={i} className={`mm-card p-4 text-center transition-all ${
              b.u ? 'border border-primary/10 shadow-sm' : 'opacity-35'
            }`}>
              <div className="text-3xl mb-1">{b.i}</div>
              <div className={`font-label text-xs font-bold ${b.u ? 'text-primary' : 'text-on-surface-variant'}`}>{b.n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3 px-1">Stats</h3>
        <div className="space-y-2">
          {[
            { l: "Gesamt HP", v: state.xp, icon: "bolt" },
            { l: "Heldenpunkte", v: state.coins, icon: "stars" },
            { l: "Aufgaben", v: (state.hist||[]).length, icon: "task_alt" },
            { l: "Streak", v: state.sd + "d", icon: "local_fire_department" },
            { l: "Level", v: level, icon: "trending_up" },
          ].map((s, i) => (
            <div key={i} className="mm-card px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">{s.icon}</span>
                <span className="font-label font-bold text-sm text-on-surface">{s.l}</span>
              </div>
              <span className="font-headline text-base font-bold text-primary">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
