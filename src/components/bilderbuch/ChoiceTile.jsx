import React from 'react';
import DoodleIcon from './DoodleIcon';

/**
 * ChoiceTile: a doodle plus one word.
 *
 * The feelings picker ("Leicht", "Wild", "Schwer"), the egg pick, any
 * "which one?" moment. Paper fill with a thin ink outline; the selected
 * tile gets a hand-drawn cobalt ring around it, not a fill and not a
 * checkmark. The doodle takes `doodleColor` so the same symbol means the
 * same feeling everywhere (sun for light, scribble for wild, drop for
 * heavy, flame for angry, moon for tired, purple tangle for restless).
 *
 * Props:
 *   label        the one word (required)
 *   doodle       a DoodleIcon name; or pass `children` for custom art
 *   doodleColor  CSS colour for the doodle (default ink)
 *   selected     draws the cobalt ring and sets aria-pressed
 *   size         'md' (default, about 104 px) | 'lg' (about 132 px)
 *   filled       pass the doodle as a solid sticker
 */
export default function ChoiceTile({
  label,
  doodle,
  doodleColor = 'var(--color-ink)',
  filled = false,
  selected = false,
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  style,
  children,
  ...rest
}) {
  const dims = size === 'lg' ? { minWidth: 132, minHeight: 132 } : { minWidth: 104, minHeight: 104 };
  const iconSize = size === 'lg' ? 56 : 44;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected ? 'true' : 'false'}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-[24px] border-[2.5px] border-ink bg-paper px-3 py-3 font-headline font-semibold text-ink select-none transition-transform active:scale-[0.97] ${disabled ? 'opacity-50' : ''} ${className}`}
      style={{ ...dims, ...style }}
      {...rest}
    >
      {selected && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute"
          style={{ inset: -9, width: 'calc(100% + 18px)', height: 'calc(100% + 18px)', overflow: 'visible', color: 'var(--color-cobalt)' }}
        >
          <path
            d="M22 3 C 45 1 70 2 82 4 C 94 6 98 16 97 30 C 96 50 98 68 96 84 C 95 95 88 98 76 98 C 55 99 34 98 20 97 C 8 96 3 90 3 78 C 2 60 1 40 3 22 C 4 9 10 4 22 3 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <span className="flex items-center justify-center" style={{ color: doodleColor, height: iconSize }}>
        {children || (doodle && <DoodleIcon name={doodle} size={iconSize} filled={filled} />)}
      </span>
      <span className="text-base leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}
