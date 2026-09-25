import React from 'react';
import DoodleIcon from './DoodleIcon';

/**
 * PillButton: the one action on a screen.
 *
 * Three dresses, one shape (mirrors website bausteine/Links.tsx):
 *   primary    cobalt fill, white label. For white and paper grounds.
 *   sun        sun fill, ink label. For cobalt, sky and night grounds.
 *              Never a cobalt or outlined pill on a blue ground.
 *   secondary  white fill, ink outline. The second choice beside a primary.
 *
 * Every tone has the .bb-press edge (a hard edge under the pill that the
 * pill sinks into on tap), a minimum height of 56 px for first-grader
 * thumbs, and a label that stays on one line. Disabled is flat: no edge,
 * no motion, a paper tint.
 *
 * Props:
 *   tone      'primary' | 'sun' | 'secondary'
 *   arrow     show the drawn chevron after the label (default false)
 *   icon      a DoodleIcon name shown before the label
 *   size      'md' (56 px) | 'lg' (64 px)
 *   full      stretch to the parent's width
 *   disabled  flat state, click ignored
 * Any other prop goes to the <button>.
 */

const TONE = {
  primary: 'bg-cobalt text-white bb-press bb-press--night',
  sun: 'bg-sun text-ink bb-press',
  secondary: 'bg-white text-ink border-[2.5px] border-ink bb-press',
};

const DISABLED = {
  primary: 'bg-paper-deep text-ink-soft',
  sun: 'bg-paper-deep text-ink-soft',
  secondary: 'bg-paper-warm text-ink-soft border-[2.5px] border-outline-variant',
};

export default function PillButton({
  children,
  tone = 'primary',
  arrow = false,
  icon,
  size = 'md',
  full = false,
  disabled = false,
  type = 'button',
  className = '',
  style,
  onClick,
  ...rest
}) {
  const look = disabled ? DISABLED[tone] || DISABLED.primary : TONE[tone] || TONE.primary;
  const pad = size === 'lg' ? 'px-8 min-h-[64px] text-xl' : 'px-7 min-h-[56px] text-lg';
  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={disabled ? undefined : onClick}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full font-headline font-bold leading-none whitespace-nowrap select-none ${pad} ${look} ${full ? 'w-full' : ''} ${className}`}
      style={{ letterSpacing: '-0.005em', ...style }}
      {...rest}
    >
      {icon && <DoodleIcon name={icon} size={22} />}
      <span className="truncate">{children}</span>
      {arrow && <DoodleIcon name="arrow" size={18} stroke={7} />}
    </button>
  );
}
