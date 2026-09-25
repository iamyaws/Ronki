import React from 'react';
import { DoodleIcon } from '../bilderbuch';

/**
 * TreasureShelf: the last three things Ronki brought home (Finch pass,
 * 26 Sep 2026; spec R8 on the Nest).
 *
 * Found treasures only, newest first, on small paper tiles. No dimmed
 * starters, no empty slots, no counts: nothing to catch up on. Renders
 * nothing until the first treasure is on the shelf.
 */
export default function TreasureShelf({ log }) {
  const items = (Array.isArray(log) ? log : []).filter(m => m && m.emoji).slice(-3).reverse();
  if (!items.length) return null;
  return (
    <div
      role="list"
      aria-label="Ronkis Schatzregal"
      data-testid="treasure-shelf"
      className="flex items-center justify-center"
      style={{ gap: 12 }}
    >
      <span aria-hidden="true" className="text-ink-soft" style={{ lineHeight: 0 }}>
        <DoodleIcon name="gift" size={26} />
      </span>
      {items.map((m, i) => (
        <span
          key={m.id || `${m.emoji}-${i}`}
          role="listitem"
          aria-label={m.name || undefined}
          title={m.name || undefined}
          className="inline-flex items-center justify-center rounded-[18px] bg-paper"
          style={{ width: 56, height: 56, border: '2.5px solid var(--color-ink)', fontSize: 28, lineHeight: 1, transform: `rotate(${i % 2 ? 2 : -2}deg)` }}
        >
          {m.emoji}
        </span>
      ))}
    </div>
  );
}
