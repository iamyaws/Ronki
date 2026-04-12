import React, { useState } from 'react';
import { T, CAT_STAGES, COMPANION_STAGES, COMPANION_TYPES } from '../constants';
import { getCatStage, getCatStageProg, getCatMood } from '../utils/helpers';
import Companion from './Companion';
import GearSlots from './GearSlots';
import { useGame } from '../context/GameContext';

const CARE_ACTIONS = [
  { key: "fed", icon: "restaurant", label: "Füttern", msg: "Mmmh, lecker! *mampf*", color: "#F97316" },
  { key: "petted", icon: "favorite", label: "Streicheln", msg: "Schnurrr... das ist schön!", color: "#EC4899" },
  { key: "played", icon: "sports_esports", label: "Spielen", msg: "Miau! Fang mich!", color: "#6D28D9" },
];

const FUN_FACTS = {
  cat: { species: "Hauskatze", likes: "Sonnenstrahlen, Fisch", dislikes: "Regen, laute Geräusche", talent: "Kann im Schlaf schnurren", motto: "Schnurr... das Leben ist schön!" },
  dragon: { species: "Vietnamesischer Rồng", likes: "Feuer, Flüge, Abenteuer", dislikes: "Kälte, Langeweile", talent: "Kann kleine Flammen pusten", motto: "Mut ist stärker als Feuer!" },
  wolf: { species: "Grauer Wolf", likes: "Mondschein, Teamwork", dislikes: "Einsamkeit, Hitze", talent: "Spürt Gefühle anderer", motto: "Zusammen sind wir stark!" },
  phoenix: { species: "Feuerphönix", likes: "Sonnenaufgänge, Musik", dislikes: "Dunkelheit, Ketten", talent: "Leuchtet im Dunkeln", motto: "Aus der Asche wird Licht!" },
};

export default function CompanionProfile() {
  const { state, actions, ui, computed } = useGame();
  const { mood } = computed;
  const [careMsg, setCareMsg] = useState(null);

  const type = state.companionType || "cat";
  const stage = getCatStage(state.catEvo || 0);
  const stageNames = COMPANION_STAGES[type] || COMPANION_STAGES.cat;
  const stageInfo = stageNames[stage];
  const typeInfo = COMPANION_TYPES[type] || COMPANION_TYPES.cat;
  const facts = FUN_FACTS[type] || FUN_FACTS.cat;
  const companionMood = getCatMood(state.catHunger, state.catHappy, state.catEnergy);

  const hunger = state.catHunger ?? 100;
  const happy = state.catHappy ?? 100;
  const energy = state.catEnergy ?? 100;
  const avg = Math.round((hunger + happy + energy) / 3);

  const prog = getCatStageProg(state.catEvo || 0);

  const doCare = (action) => {
    const doneKey = `cat${action.key.charAt(0).toUpperCase() + action.key.slice(1)}`;
    if (state[doneKey]) return;
    if (action.key === "fed") actions.feedCat();
    else if (action.key === "petted") actions.petCat();
    else if (action.key === "played") actions.playCat();
    setCareMsg(action.msg);
    setTimeout(() => setCareMsg(null), 4500);
  };

  return (
    <div className="lotus-pattern px-6 pb-32 space-y-8">

      {/* ── Hero Section: The Companion ── */}
      <section className="flex flex-col items-center">
        <div className="relative w-full aspect-square max-w-[280px] mx-auto">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-secondary-container opacity-20 blur-3xl rounded-full scale-75" />
          {/* Companion render */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
            <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}>
              <Companion type={type} variant={state.catVariant} mood={companionMood === "sleepy" ? "sleepy" : mood} size={180} stage={stage} gear={state.equippedGear} />
            </div>
          </div>
        </div>
        {/* Name & species */}
        <div className="text-center mt-4">
          <span className="font-label text-xs font-extrabold uppercase tracking-[0.2em] text-primary/60">
            {facts.species}
          </span>
          <h2 className="text-4xl font-headline font-bold text-on-surface mt-1">
            {state.catName || typeInfo.name}
          </h2>
        </div>
      </section>

      {/* ── Care feedback message ── */}
      {careMsg && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-secondary-container/20 border border-secondary-container/30 mx-auto max-w-xs"
             style={{ animation: "celebText 2.5s ease-out forwards" }}>
          <span className="text-lg">{typeInfo.emoji}</span>
          <span className="font-headline text-sm font-bold text-secondary">{careMsg}</span>
        </div>
      )}

      {/* ── Stats Grid (Bento Style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bond Level Card */}
        <div className="bg-surface-container-lowest rounded-lg p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 text-on-surface group-hover:rotate-12 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl">favorite</span>
          </div>
          <h3 className="font-label font-bold text-base text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Bindungslevel
          </h3>
          <p className="font-body text-sm text-on-surface/60 mt-1">
            {avg >= 75 ? "Unzertrennlich!" : avg >= 50 ? "Gute Freunde" : "Braucht mehr Liebe"}
          </p>
          <div className="mt-6 flex items-end gap-4">
            <span className="text-5xl font-headline text-primary">Lv. {stage + 1}</span>
            <div className="flex-1 mb-3">
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-600"
                  style={{ width: `${prog.maxStage ? 100 : Math.min(100, (prog.cur / prog.need) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Happiness Card */}
        <div className="bg-surface-container-lowest rounded-lg p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 text-on-surface group-hover:-rotate-12 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl">sentiment_very_satisfied</span>
          </div>
          <h3 className="font-label font-bold text-base text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>sunny</span>
            Zufriedenheit
          </h3>
          <p className="font-body text-sm text-on-surface/60 mt-1">
            {avg >= 75 ? "Strahlt förmlich!" : avg >= 50 ? "Zufrieden" : avg >= 25 ? "Etwas traurig" : "Braucht Hilfe!"}
          </p>
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-headline text-on-surface">{avg}%</span>
              <div className="flex gap-1">
                {[hunger, happy, energy, avg, 100 - avg].map((v, i) => (
                  <span key={i} className={`w-1.5 rounded-full ${i < 4 ? 'bg-secondary-container' : 'bg-surface-container'}`}
                        style={{ height: `${Math.max(16, v * 0.48)}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Condition Bars ── */}
      <div className="bg-surface-container-lowest rounded-lg p-6">
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">Zustand</h3>
        {[
          { label: "Hunger", value: hunger, color: "#F97316", icon: "restaurant" },
          { label: "Glück", value: happy, color: "#EC4899", icon: "favorite" },
          { label: "Energie", value: energy, color: "#3B82F6", icon: "bolt" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-on-surface-variant text-lg" style={{ color: s.color }}>{s.icon}</span>
            <span className="font-label text-sm font-bold text-on-surface-variant w-14">{s.label}</span>
            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-400" style={{ width: `${s.value}%`, background: s.color }} />
            </div>
            <span className="font-headline text-sm font-bold w-10 text-right" style={{ color: s.color }}>{s.value}%</span>
          </div>
        ))}
      </div>

      {/* ── Evolution Tracker ── */}
      <section className="bg-surface-container-low rounded-lg p-6">
        <h3 className="font-label font-bold text-base text-on-surface mb-6 text-center">Evolutionspfad</h3>
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-outline-variant/30 hidden md:block" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {stageNames.map((s, i) => {
              const isCompleted = i < stage;
              const isCurrent = i === stage;
              const isFuture = i > stage;
              return (
                <div key={i} className={`flex flex-col items-center gap-3 ${isFuture ? 'opacity-40' : ''}`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-transform ${
                    isCurrent ? 'bg-primary-container text-white scale-110 shadow-lg' : isCompleted ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    ) : (
                      <span className="text-xl">{s.emoji}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`font-label font-bold text-sm ${isCurrent ? 'text-primary' : ''}`}>{s.name}</p>
                    {isCurrent && <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Aktuell</p>}
                    {isFuture && <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Locked</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress to next */}
        {!prog.maxStage && stageNames[stage + 1] && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label text-xs font-bold text-on-surface-variant">
                {stageInfo.name} → {stageNames[stage + 1].name}
              </span>
              <span className="font-headline text-sm font-bold text-secondary">
                {prog.cur}/{prog.need} EP
              </span>
            </div>
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-600"
                   style={{ width: `${Math.max(2, (prog.cur / prog.need) * 100)}%` }} />
            </div>
          </div>
        )}
        {prog.maxStage && (
          <p className="text-center font-headline text-sm font-bold text-emerald-dark mt-4">⭐ Maximale Stufe erreicht!</p>
        )}
      </section>

      {/* ── Gear Slots ── */}
      <div className="bg-surface-container-lowest rounded-lg p-6">
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">Ausrüstung</h3>
        <GearSlots
          equippedGear={state.equippedGear || {}}
          purchased={state.purchased || []}
          onEquip={(slot, id) => actions.equipGear(slot, id)}
          onUnequip={(slot) => actions.unequipGear(slot)}
        />
      </div>

      {/* ── Care Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {CARE_ACTIONS.map(a => {
          const doneKey = `cat${a.key.charAt(0).toUpperCase() + a.key.slice(1)}`;
          const done = state[doneKey];
          return (
            <button
              key={a.key}
              onClick={() => doCare(a)}
              disabled={done}
              className={`btn-tap flex-1 rounded-full px-6 py-4 font-label font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                done
                  ? 'bg-surface-container text-on-surface-variant opacity-50 cursor-default'
                  : 'bg-primary-container text-white hover:opacity-90 active:scale-95'
              }`}
              style={!done ? { background: a.color } : undefined}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
              {a.label}
              {done && <span className="material-symbols-outlined text-emerald-dark text-lg">check</span>}
              {!done && <span className="text-xs opacity-80">+5 ⭐</span>}
            </button>
          );
        })}
      </div>

      {/* ── Fun Facts Card ── */}
      <div className="bg-surface-container-lowest rounded-lg p-6">
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">Steckbrief</h3>
        <div className="space-y-3">
          {[
            { label: "Mag", value: facts.likes, icon: "favorite" },
            { label: "Mag nicht", value: facts.dislikes, icon: "block" },
            { label: "Talent", value: facts.talent, icon: "auto_awesome" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">{s.icon}</span>
              <div>
                <span className="font-label text-xs font-bold text-on-surface-variant">{s.label}: </span>
                <span className="font-body text-sm text-on-surface">{s.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 px-4 py-3 bg-primary-fixed/30 rounded-lg border border-primary/10 text-center">
          <p className="font-headline text-sm font-semibold text-primary italic">
            „{facts.motto}"
          </p>
        </div>
      </div>

      {/* Bodhi leaf divider */}
      <div className="flex justify-center py-2 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
        </svg>
      </div>
    </div>
  );
}
