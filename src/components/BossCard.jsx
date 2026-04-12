import React from 'react';
import { BOSSES } from '../constants';

export default function BossCard({ boss }) {
  if (!boss) return null;
  const bossData = BOSSES.find(b => b.id === boss.id);
  if (!bossData) return null;

  if (boss.hp <= 0) {
    return (
      <div className="mm-card p-5 border border-emerald/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            military_tech
          </span>
          <div className="flex-1">
            <p className="font-label font-bold text-sm text-emerald-dark uppercase tracking-wider">Boss besiegt!</p>
            <p className="font-body text-sm text-on-surface">{bossData.icon} {bossData.name} wurde besiegt!</p>
          </div>
          <span className="font-label text-xs font-bold text-primary bg-primary-fixed px-3 py-1.5 rounded-full">
            Neuer Boss morgen! 🕐
          </span>
        </div>
      </div>
    );
  }

  const hpPct = Math.round((boss.hp / boss.maxHp) * 100);

  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/20 shadow-sm relative overflow-hidden">
      {/* Boss header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center shrink-0">
          <span className="text-2xl">{bossData.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <p className="font-label font-bold text-[10px] text-error uppercase tracking-widest">Boss-Kampf</p>
            <p className="font-label font-bold text-xs" style={{
              color: hpPct > 50 ? '#DC2626' : hpPct > 25 ? '#F59E0B' : '#34D399'
            }}>
              {boss.hp}/{boss.maxHp} HP
            </p>
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{bossData.name}</h3>
        </div>
      </div>

      {/* HP bar */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative"
            style={{
              width: `${hpPct}%`,
              background: hpPct > 50
                ? 'linear-gradient(90deg, #DC2626, #EF4444)'
                : hpPct > 25
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                  : 'linear-gradient(90deg, #34D399, #6EE7B7)',
            }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
        <p className="font-body text-[11px] text-on-surface-variant italic">
          {bossData.desc}
        </p>
      </div>
    </div>
  );
}
