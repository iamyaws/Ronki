import React from 'react';
import { T, SHOP_ITEMS, UNLOCK_CONDITIONS } from '../constants';
import { ViewHeader } from './ui';
import { getCatStage } from '../utils/helpers';
import { useGame } from '../context/GameContext';
import GearSlots from './GearSlots';

function getProgress(cond, state) {
  switch (cond.type) {
    case 'streak':
      return { current: Math.max(state.sd || 0, state.bestStreak || 0), target: cond.value };
    case 'boss':
      return { current: (state.bossTrophies || []).length, target: cond.value };
    case 'tasks':
      return { current: (state.hist || []).length, target: cond.value };
    case 'catStage':
      return { current: getCatStage(state.catEvo || 0), target: cond.value };
    case 'weeklyMission':
      return { current: state.weeklyMissionsCompleted || 0, target: cond.value };
    default:
      return { current: 0, target: cond.value };
  }
}

export default function Shop() {
  const { state, actions, ui } = useGame();
  const { shopTab, setShopTab, setView } = ui;

  const items = SHOP_ITEMS[shopTab] || [];
  const unlocked = items.filter(it => (state.purchased || []).includes(it.id));

  const tabs = [
    { id: 'hero', l: 'Ausrüstung', i: '🎩', col: '#6D28D9' },
    { id: 'cat',  l: 'Begleiter',  i: '🐱', col: '#BE185D' },
    { id: 'room', l: 'Zimmer',     i: '🏠', col: '#B45309' },
  ];

  const activeCol = tabs.find(t => t.id === shopTab)?.col || T.primary;

  return (
    <div className="view-enter" style={{
      minHeight: '100vh',
      padding: '12px 16px 100px',
      background: '#EFF3FB',
    }}>
      <ViewHeader
        onBack={() => setView('hub')}
        title={'\u{1F3C6} Sammlung'}
      />

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className="btn-tap"
            onClick={() => setShopTab(t.id)}
            style={{
              flex: 1,
              background: shopTab === t.id ? 'white' : 'rgba(180,120,40,0.06)',
              border: shopTab === t.id ? `3px solid ${t.col}30` : '3px solid rgba(180,120,40,0.08)',
              borderRadius: 18,
              padding: '12px 8px',
              cursor: 'pointer',
              fontFamily: "'Fredoka',sans-serif",
              fontWeight: 800,
              fontSize: '.85rem',
              color: shopTab === t.id ? t.col : '#64748B',
              textTransform: 'uppercase',
              textAlign: 'center',
              minHeight: 48,
              boxShadow: shopTab === t.id ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
              transition: 'all .2s ease',
            }}
          >
            {t.i}<br />{t.l}
          </button>
        ))}
      </div>

      {/* ── Counter badge ── */}
      <div style={{
        textAlign: 'center',
        marginBottom: 16,
        padding: '8px 16px',
        background: `${activeCol}10`,
        borderRadius: 14,
        fontWeight: 800,
        fontSize: '1.05rem',
        color: activeCol,
        fontFamily: "'Fredoka',sans-serif",
      }}>
        {unlocked.length} / {items.length} freigeschaltet
      </div>

      {/* ── Gear Slots (Ausrüstung tab only) ── */}
      {shopTab === 'hero' && (
        <div style={{ padding: "0 4px", marginBottom: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: T.primary }}>
              Rüste deinen Begleiter aus!
            </div>
            <div style={{ fontSize: ".85rem", color: T.textSecondary, marginTop: 4 }}>
              Schalte Gegenstände frei und rüste sie aus.
            </div>
          </div>
          <GearSlots
            equippedGear={state.equippedGear || {}}
            purchased={state.purchased || []}
            onEquip={(slot, id) => actions.equipGear(slot, id)}
            onUnequip={(slot) => actions.unequipGear(slot)}
          />
        </div>
      )}

      {/* ── Item cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => {
          const owned = (state.purchased || []).includes(item.id);
          const cond = UNLOCK_CONDITIONS[item.id];
          const prog = cond ? getProgress(cond, state) : null;
          const pct = prog ? Math.min(1, prog.current / prog.target) : 0;

          return (
            <div
              key={item.id}
              className="game-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderColor: owned ? `${T.success}40` : undefined,
                opacity: owned ? 1 : 0.72,
                transition: 'all .25s ease',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: owned ? `${T.success}15` : 'rgba(180,120,40,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.7rem',
                filter: owned ? 'none' : 'grayscale(0.5)',
              }}>
                {owned ? item.icon : '\u{1F512}'}
              </div>

              {/* Text + progress */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: T.textPrimary,
                  marginBottom: owned ? 0 : 4,
                }}>
                  {item.name}
                </div>

                {owned ? (
                  <div style={{
                    fontSize: '.85rem',
                    fontWeight: 700,
                    color: T.successDark,
                  }}>
                    Freigeschaltet!
                  </div>
                ) : cond ? (
                  <>
                    <div style={{
                      fontSize: '.82rem',
                      color: T.textSecondary,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}>
                      {cond.icon} {cond.label}
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      width: '100%',
                      height: 10,
                      borderRadius: 5,
                      background: 'rgba(180,120,40,0.10)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct * 100}%`,
                        height: '100%',
                        borderRadius: 5,
                        background: pct >= 1
                          ? `linear-gradient(90deg, ${T.success}, ${T.successDark})`
                          : `linear-gradient(90deg, ${T.primaryLight}, ${T.primary})`,
                        transition: 'width .4s ease',
                      }} />
                    </div>

                    {/* Progress text */}
                    <div style={{
                      fontSize: '.78rem',
                      fontWeight: 700,
                      color: T.textLight,
                      marginTop: 3,
                      textAlign: 'right',
                    }}>
                      {prog.current} / {prog.target}
                    </div>
                  </>
                ) : null}
              </div>

              {/* Status badge */}
              {owned && (
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 50,
                  background: `${T.success}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}>
                  {'\u2705'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
