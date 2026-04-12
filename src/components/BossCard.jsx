import React from 'react';
import { BOSSES } from '../constants';

export default function BossCard({ boss }) {
  if (!boss) return null;
  const bossData = BOSSES.find(b => b.id === boss.id);
  if (!bossData) return null;

  if (boss.hp <= 0) {
    return (
      <div className="bg-surface-container-lowest rounded-lg p-5 border border-emerald/20">
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
    <div className="bg-surface-container-lowest rounded-lg p-5 relative overflow-hidden">
      {/* Boss header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl" style={{ animation: "bossShake 0.6s ease-in-out infinite" }}>
          {bossData.icon}
        </span>
        <div className="flex-1">
          <p className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant">
            Wöchentlicher Boss
          </p>
          <h3 className="font-headline text-lg font-bold text-on-surface">{bossData.name}</h3>
        </div>
        <span className="font-headline text-base font-bold" style={{
          color: hpPct > 50 ? '#DC2626' : hpPct > 25 ? '#F59E0B' : '#34D399'
        }}>
          {boss.hp}/{boss.maxHp} HP
        </span>
      </div>

      {/* Description */}
      <p className="font-body text-sm text-on-surface-variant mb-3">{bossData.desc}</p>

      {/* HP bar */}
      <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${hpPct}%`,
            background: hpPct > 50
              ? 'linear-gradient(90deg, #5300b7, #6d28d9)'
              : hpPct > 25
                ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                : 'linear-gradient(90deg, #34D399, #6EE7B7)',
          }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </div>
      </div>

      <p className="text-center font-body text-xs text-on-surface-variant italic mt-3">
        Schließe deine Aufgaben ab, um dem Boss Schaden zuzufügen!
      </p>
    </div>
  );
}
