import React from 'react';
import DoodleIcon from './DoodleIcon';

/**
 * TopBar (Bilderbuch): back chevron left, headline in the middle, one
 * optional round button right (sound or parent lock). Nothing else.
 *
 * Transparent by default so it sits on whatever the screen paints
 * underneath (white, paper, a scene). On dark grounds pass `onDark` to
 * flip the ink to white. Sits below the alpha banner via the
 * --alpha-banner-h variable, like the old header did.
 *
 * Props:
 *   title      headline text (or a node)
 *   onBack     back handler; the chevron only renders when given
 *   backLabel  aria label for the chevron (default "Zurück")
 *   right      'sound' | 'lock' | a custom node | undefined
 *   onRight    handler for the sound or lock button
 *   rightLabel aria label for the right button
 *   onDark     white ink for cobalt, sky and night grounds
 *   sticky     stay pinned at the top while the page scrolls
 */
export default function TopBar({
  title,
  onBack,
  backLabel = 'Zurück',
  right,
  onRight,
  rightLabel,
  onDark = false,
  sticky = false,
  className = '',
  style,
}) {
  const ink = onDark ? 'text-white' : 'text-ink';
  const roundBtn = onDark
    ? 'bg-white text-ink border-[2.5px] border-white'
    : 'bg-paper text-ink border-[2.5px] border-ink';
  const rightNode =
    right === 'sound' || right === 'lock' ? (
      <button
        type="button"
        onClick={onRight}
        aria-label={rightLabel || (right === 'sound' ? 'Vorlesen' : 'Eltern-Bereich')}
        className={`flex h-12 w-12 items-center justify-center rounded-full active:scale-95 transition-transform ${roundBtn}`}
      >
        <DoodleIcon name={right} size={24} />
      </button>
    ) : (
      right || null
    );

  return (
    <header
      className={`${sticky ? 'sticky z-40' : 'relative'} w-full max-w-lg mx-auto ${ink} ${className}`}
      style={{
        top: sticky ? 'var(--alpha-banner-h, 0px)' : undefined,
        padding: '10px 16px 8px',
        paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
        ...style,
      }}
    >
      <div className="grid items-center" style={{ gridTemplateColumns: '48px 1fr 48px', gap: 8 }}>
        <div className="flex justify-start">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={backLabel}
              className="flex h-12 w-12 items-center justify-center rounded-full active:scale-95 transition-transform"
            >
              <DoodleIcon name="back" size={28} stroke={7} />
            </button>
          ) : null}
        </div>
        <h1 className="bb-display text-center text-2xl truncate">{title}</h1>
        <div className="flex justify-end">{rightNode}</div>
      </div>
    </header>
  );
}
