import React from 'react';
import DoodleIcon from './bilderbuch/DoodleIcon';

/**
 * JournalFeelings: the Tagebuch feelings as drawn doodles, shared by
 * the Journal (mood picker, calendar, old entries) and the Buch
 * (chapter mood marks) so a feeling looks the same on every page.
 *
 * Bilderbuch design brief section 5: the same symbol means the same
 * feeling everywhere. Sun for light (Gut), drop for heavy (Traurig),
 * moon for tired (Müde), the tangle in the worry colour for restless
 * (Besorgt). Okay and Magisch have no board symbol, so they take a
 * calm leaf and a spark.
 *
 * Indexed by the MOOD_EMOJIS order in constants.ts; the stored value
 * stays the index, only the picture changes.
 */
export const MOOD_DOODLES = [
  { name: 'drop',    fill: 'var(--color-sky)' },      // 0 Traurig
  { name: 'tangle',  stroke: 'var(--color-worry)' },  // 1 Besorgt
  { name: 'leaf',    fill: 'var(--color-leaf)' },     // 2 Okay
  { name: 'sun',     fill: 'var(--color-sun)' },      // 3 Gut
  { name: 'sparkle', fill: 'var(--color-ember)' },    // 4 Magisch
  { name: 'moon',    fill: 'var(--color-sky-wash)' }, // 5 Müde
];

/** A feeling as a drawn sticker: the colour shape with the ink line on top. */
export function FeelingDoodle({ idx, size = 40, label }) {
  const d = MOOD_DOODLES[idx];
  if (!d) return null;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' };
  if (d.stroke) {
    return (
      <span {...a11y} style={{ color: d.stroke, lineHeight: 0, display: 'inline-block' }}>
        <DoodleIcon name={d.name} size={size} stroke={6} />
      </span>
    );
  }
  return (
    <span {...a11y} style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <span style={{ color: d.fill, lineHeight: 0, display: 'inline-block' }}>
        <DoodleIcon name={d.name} size={size} filled />
      </span>
      <span style={{ position: 'absolute', inset: 0, color: 'var(--color-ink)', lineHeight: 0 }}>
        <DoodleIcon name={d.name} size={size} stroke={4.5} />
      </span>
    </span>
  );
}

export default FeelingDoodle;
