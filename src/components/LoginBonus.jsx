import React from 'react';

export default function LoginBonus({ onCollect, claimed }) {
  if (claimed) return null;

  return (
    <button
      className="btn-tap w-full mm-card p-5 flex items-center gap-4 text-left transition-all hover:shadow-md"
      onClick={onCollect}
      style={{ animation: "loginPulse 2s ease-in-out infinite" }}
    >
      <span className="text-3xl shrink-0">👋</span>
      <div className="flex-1">
        <p className="font-headline text-base font-bold text-secondary">
          Willkommen zurück, Held!
        </p>
        <p className="font-body text-sm text-on-surface-variant mt-0.5">
          Tippe für deinen täglichen Heldenpunkt
        </p>
      </div>
      <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1.5 font-label font-bold text-xs whitespace-nowrap">
        +5 HP
      </span>
    </button>
  );
}
