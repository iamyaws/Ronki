import React from 'react';
import { T, SHOP_ITEMS, UNLOCK_CONDITIONS } from '../constants';
import { getCatStage } from '../utils/helpers';
import { useGame } from '../context/GameContext';
import GearSlots from './GearSlots';

function getProgress(cond, state) {
  switch (cond.type) {
    case 'streak': return { current: Math.max(state.sd || 0, state.bestStreak || 0), target: cond.value };
    case 'boss': return { current: (state.bossTrophies || []).length, target: cond.value };
    case 'tasks': return { current: (state.hist || []).length, target: cond.value };
    case 'catStage': return { current: getCatStage(state.catEvo || 0), target: cond.value };
    case 'weeklyMission': return { current: state.weeklyMissionsCompleted || 0, target: cond.value };
    default: return { current: 0, target: cond.value };
  }
}

export default function Shop() {
  const { state, actions, ui } = useGame();
  const { shopTab, setShopTab, setView } = ui;

  const items = SHOP_ITEMS[shopTab] || [];
  const unlocked = items.filter(it => (state.purchased || []).includes(it.id));

  const tabs = [
    { id: 'hero', l: 'Ausrüstung', icon: 'shield', col: 'text-primary' },
    { id: 'cat',  l: 'Begleiter',  icon: 'pets',   col: 'text-tertiary' },
    { id: 'room', l: 'Zimmer',     icon: 'chair',  col: 'text-secondary' },
  ];

  return (
    <div className="lotus-pattern px-6 pb-32 space-y-6">
      {/* ── Header ── */}
      <section className="space-y-3">
        <h2 className="text-3xl font-bold font-headline text-on-surface">Sammlung</h2>
        <p className="text-on-surface-variant font-body text-lg">
          Schalte Gegenstände durch Aufgaben und Abenteuer frei!
        </p>
      </section>

      {/* ── Tabs ── */}
      <div className="flex gap-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setShopTab(t.id)}
            className={`btn-tap flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl font-label font-bold text-sm uppercase tracking-wider transition-all ${
              shopTab === t.id
                ? `bg-surface-container-lowest border-2 border-primary/10 shadow-md ${t.col}`
                : 'bg-surface-container border-2 border-transparent text-on-surface-variant'
            }`}
            style={{ minHeight: 64 }}>
            <span className="material-symbols-outlined text-2xl">{t.icon}</span>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── Counter ── */}
      <div className="text-center py-3 px-5 bg-primary/5 rounded-lg">
        <span className="font-headline font-bold text-lg text-primary">
          {unlocked.length} / {items.length} freigeschaltet
        </span>
      </div>

      {/* ── Gear Slots (hero tab) ── */}
      {shopTab === 'hero' && (
        <div className="mm-card p-5">
          <div className="text-center mb-4">
            <h3 className="font-headline text-base font-bold text-primary">Rüste deinen Begleiter aus!</h3>
            <p className="font-body text-xs text-on-surface-variant mt-1">Schalte Gegenstände frei und rüste sie aus.</p>
          </div>
          <GearSlots
            equippedGear={state.equippedGear || {}}
            purchased={state.purchased || []}
            onEquip={(slot, id) => actions.equipGear(slot, id)}
            onUnequip={(slot) => actions.unequipGear(slot)}
          />
        </div>
      )}

      {/* ── Item Cards ── */}
      <div className="space-y-4">
        {items.map(item => {
          const owned = (state.purchased || []).includes(item.id);
          const cond = UNLOCK_CONDITIONS[item.id];
          const prog = cond ? getProgress(cond, state) : null;
          const pct = prog ? Math.min(1, prog.current / prog.target) : 0;

          return (
            <div key={item.id}
              className={`mm-card p-5 flex items-center gap-5 transition-all ${
                owned ? 'border border-emerald/20' : 'opacity-70'
              }`}>
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                owned ? 'bg-emerald/10' : 'bg-surface-container grayscale-[50%]'
              }`}>
                {owned ? item.icon : (
                  <span className="material-symbols-outlined text-outline text-2xl">lock</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-label font-bold text-base text-on-surface">{item.name}</h4>

                {owned ? (
                  <p className="font-label text-sm font-bold text-emerald-dark mt-1">Freigeschaltet!</p>
                ) : cond ? (
                  <>
                    <p className="font-body text-sm text-on-surface-variant mb-2 mt-1">
                      {cond.icon} {cond.label}
                    </p>
                    <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-400" style={{
                        width: `${pct * 100}%`,
                        background: pct >= 1 ? 'linear-gradient(90deg, #34D399, #059669)' : 'linear-gradient(90deg, #5300b7, #6d28d9)',
                      }} />
                    </div>
                    <p className="font-label text-xs font-bold text-on-surface-variant text-right mt-1">
                      {prog.current} / {prog.target}
                    </p>
                  </>
                ) : null}
              </div>

              {/* Status */}
              {owned && (
                <span className="material-symbols-outlined text-emerald text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bodhi leaf */}
      <div className="flex justify-center py-2 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
        </svg>
      </div>
    </div>
  );
}
