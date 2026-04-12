import React from 'react';
import Companion from './Companion';
import Egg from './Egg';
import HeroSprite from './HeroSprite';
import { T, CAT_STAGES, COMPANION_TYPES } from '../constants';
import { getCatStage, getCatMood, GERMAN_DAYS_SHORT } from '../utils/helpers';
const GERMAN_MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export default function ProfileCard({ state, level, mood, weather, wInfo, todayDaily, actions, onCompanionTap }) {
  const today = new Date();
  const dayKey = GERMAN_DAYS_SHORT[today.getDay()];
  const stage = getCatStage(state.catEvo || 0);
  const stageInfo = CAT_STAGES[stage];
  const companionMood = (() => {
    const cm = getCatMood(state.catHunger, state.catHappy, state.catEnergy);
    return cm === "sleepy" ? "sleepy" : mood;
  })();

  return (
    <div className="mm-card p-5 mb-4">
      <div className="flex gap-4 items-start">
        {/* Companion + hero avatar */}
        <div className="flex flex-col items-center shrink-0 gap-2" style={{ minWidth: 120 }}>
          <div className="relative cursor-pointer" onClick={onCompanionTap}>
            {state.eggHatched ? (
              <Companion type={state.companionType || "cat"} variant={state.catVariant} mood={companionMood} size={110} stage={stage} gear={state.equippedGear} />
            ) : (
              <Egg type={state.eggType || "dragon"} size={90} progress={state.eggProgress || 0} />
            )}
            <div className="absolute -bottom-1 -right-3 w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center"
                 style={{ background: `radial-gradient(circle at 50% 60%, ${state.hero?.color || '#6D28D9'}30 0%, transparent 70%)` }}>
              <div style={{ transform: "scale(1.5) translateY(18%)" }}>
                <HeroSprite shape={state.hero?.shape} color={state.hero?.color} eyes={state.hero?.eyes} hair={state.hero?.hair} size={24} level={level} skinTone={state.hero?.skinTone} hairColor={state.hero?.hairColor} />
              </div>
            </div>
          </div>
          <p className="font-headline text-base font-bold text-on-surface text-center truncate max-w-[120px]">
            {state.catName || "Begleiter"}
          </p>
          <span className="inline-flex items-center gap-1 bg-secondary-fixed/20 border border-secondary-container/20 rounded-full px-2.5 py-0.5 font-headline text-xs font-bold text-secondary">
            {stageInfo?.emoji} {stageInfo?.name}
          </span>
        </div>

        {/* Stats grid */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="bg-secondary-fixed/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <div>
              <div className="font-headline text-lg font-bold text-secondary">{(state.coins || 0).toLocaleString("de-DE")}</div>
              <div className="font-label text-[10px] font-bold text-on-surface-variant">HP</div>
            </div>
          </div>
          <div className="bg-tertiary-fixed/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <span className="text-xl">🥚</span>
            <div>
              <div className="font-headline text-lg font-bold text-tertiary">{(state.drachenEier || 0).toLocaleString("de-DE")}</div>
              <div className="font-label text-[10px] font-bold text-on-surface-variant">Eier</div>
            </div>
          </div>
          <div className="bg-[#E0F2FE]/40 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-lg">{wInfo?.emoji || "☁️"}</span>
            <span className="font-headline text-sm font-bold text-[#0284C7]">
              {todayDaily ? `${todayDaily.tempMin}° / ${todayDaily.tempMax}°` : weather?.current ? `${weather.current.temp}°` : "•••"}
            </span>
          </div>
          <div className="bg-primary-fixed/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
            <span className="font-label text-xs font-bold text-primary">
              {dayKey}. {today.getDate()}. {GERMAN_MONTHS[today.getMonth()]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
