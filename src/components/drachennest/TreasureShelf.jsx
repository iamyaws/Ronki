import React from 'react';
import { DoodleIcon } from '../bilderbuch';
import { shelfItems } from '../RonkiPassport';

/**
 * TreasureShelf: the last three things Ronki brought home (Finch pass,
 * 26 Sep 2026; spec R8 on the Nest).
 *
 * Found treasures only, newest first, on small paper tiles. No dimmed
 * starters, no empty slots, no counts: nothing to catch up on. Renders
 * nothing until the first treasure is on the shelf. The child's favourite
 * (picked in Ronki's passport) always stands in front, with a heart.
 */
export default function TreasureShelf({ log, favorite = null }) {
  const all = shelfItems(log).reverse();
  const fav = favorite ? all.find(s => s.key === favorite) : null;
  const items = fav ? [fav, ...all.filter(s => s !== fav)].slice(0, 3) : all.slice(0, 3);
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
          key={m.key}
          role="listitem"
          aria-label={m.name || undefined}
          title={m.name || undefined}
          className="inline-flex items-center justify-center rounded-[18px] bg-paper"
          style={{ position: 'relative', width: 56, height: 56, border: '2.5px solid var(--color-ink)', fontSize: 28, lineHeight: 1, transform: `rotate(${i % 2 ? 2 : -2}deg)` }}
        >
          {m.emoji}
          {m === fav && (
            <span className="text-ember" style={{ position: 'absolute', right: -8, top: -8, lineHeight: 0 }} data-testid="shelf-heart">
              <DoodleIcon name="heart" size={18} filled />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
