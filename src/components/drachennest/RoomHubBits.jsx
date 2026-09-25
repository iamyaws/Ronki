import React from 'react';
import { DoodleIcon, PaperCard, PillButton, RonkiArt } from '../bilderbuch';

/**
 * Small Bilderbuch pieces shared by the home lane (RoomHub, RonkisTag,
 * Belohnungsbank). Kept next to the screens instead of in the
 * primitives folder, which belongs to the foundation.
 */

/** A sun disc with an ink check on it: the Bilderbuch "done" sticker. */
export function SunCheck({ size = 28, className = '', style }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-sun text-ink shrink-0 ${className}`}
      style={{ width: size, height: size, border: '2.5px solid var(--color-ink)', boxSizing: 'border-box', ...style }}
    >
      <DoodleIcon name="check" size={Math.round(size * 0.6)} stroke={8} />
    </span>
  );
}

/** A sun sticker with a hand-written word on it ("jetzt", "fertig"). */
export function SunSticker({ children, rotate = -4, className = '', style }) {
  return (
    <span
      className={`bb-hand inline-flex items-center justify-center rounded-full bg-sun text-ink ${className}`}
      style={{
        padding: '6px 12px 5px',
        border: '2.5px solid var(--color-ink)',
        fontSize: 18,
        lineHeight: 1,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * The Nest's loud cards (Finch pass, 26 Sep 2026). Each carries
 * data-loud="true" when it is the one loud item of its state.
 */

/** The send-off after a full morning fire: Ronki on his cloud and one pill. */
export function DepartureCard({ label, onBye }) {
  return (
    <PaperCard tone="sun" pad="md" data-testid="departure-card" data-loud="true" className="w-full flex flex-col items-center">
      <RonkiArt pose="cloud" size={140} idle="bb-idle-bob" />
      <div className="w-full" style={{ marginTop: 10 }}>
        <PillButton full size="lg" onClick={onBye}>{label}</PillButton>
      </div>
    </PaperCard>
  );
}

/** The wrapped treasure Ronki brought home: sun paper, a gift, "Aufmachen". */
export function TreasureCard({ onOpen }) {
  return (
    <PaperCard tone="sun" pad="md" lift data-testid="treasure-card" data-loud="true" className="w-full flex flex-col items-center">
      <span aria-hidden="true" className="bb-idle-bob" style={{ color: 'var(--color-ink)', lineHeight: 0 }}>
        <DoodleIcon name="gift" size={96} />
      </span>
      <div className="w-full" style={{ marginTop: 12 }}>
        <PillButton full size="lg" icon="gift" onClick={onOpen}>Aufmachen</PillButton>
      </div>
    </PaperCard>
  );
}

/**
 * The way to bed, present from the evening start at any fire level
 * (spec 3.4, never earned). Quiet: a drawn link with the moon. Loud (the
 * evening fire is full, or there are no evening tasks): the night card.
 */
export function MoonCard({ text, loud = false, onOpen }) {
  if (loud) {
    return (
      <PaperCard
        as="button"
        tone="night"
        pad="md"
        onClick={onOpen}
        data-testid="moon-card"
        data-loud="true"
        className="w-full flex items-center gap-4"
      >
        <span className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, color: 'var(--color-sun)' }}>
          <DoodleIcon name="moon" size={48} filled />
        </span>
        <span className="bb-display text-white" style={{ fontSize: 24, lineHeight: 1.2 }}>{text}</span>
        <span className="ml-auto text-white shrink-0"><DoodleIcon name="arrow" size={22} stroke={7} /></span>
      </PaperCard>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid="moon-card"
      className="w-full flex items-center justify-center gap-2 bg-transparent border-0 font-headline font-semibold text-cobalt"
      style={{ minHeight: 48, fontSize: 18, lineHeight: 1.2, padding: '4px 8px', textDecoration: 'underline', textDecorationThickness: 2, textUnderlineOffset: 5 }}
    >
      <span aria-hidden="true" style={{ color: 'var(--color-cobalt)', lineHeight: 0 }}>
        <DoodleIcon name="moon" size={24} filled />
      </span>
      {text}
    </button>
  );
}
