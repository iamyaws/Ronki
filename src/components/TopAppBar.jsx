import React from 'react';
import { useGame } from '../context/GameContext';

export default function TopAppBar() {
  const { state, computed } = useGame();
  const xp = computed?.xp ?? 0;
  const hp = state?.hp ?? 0;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-md mx-auto">
        {/* Left: Avatar + Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            {state?.heroShape ? (
              <span className="text-white text-lg">
                {state.heroShape === 'round' ? '🟣' : '🔮'}
              </span>
            ) : (
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                person
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
            Ronki
          </h1>
        </div>

        {/* Right: XP / HP pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
          <span className="font-label font-bold text-sm text-primary">
            {xp} XP • {hp} HP
          </span>
        </div>
      </div>
    </header>
  );
}
