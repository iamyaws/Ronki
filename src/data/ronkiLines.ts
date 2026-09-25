/**
 * Ronki's lines for the Finch pass (26 Sep 2026).
 *
 * The words live in finchLines.de.json (shared with the voice batch in
 * scripts/gen-finch-voice.py). This file gives the app typed access and
 * the few rules that pick a line. Every line is voiced by Ronki as
 * public/audio/ronki/de_<id>.mp3; play it with
 * `VoiceAudio.playLocalized(id)`. A missing file stays silent and the
 * text stays on screen (spec R11).
 *
 * Names are never voiced: `text` may carry {nick} (Ronki's nickname) or
 * {kind} (the child's name); `spoken` is what the recording says.
 */
import data from './finchLines.de.json';

export interface RonkiLine {
  id: string;
  text: string;
  spoken: string;
}

type RawLine = { text: string; spoken?: string };
const RAW = data.lines as Record<string, RawLine>;

/** Every Finch-pass line by id. */
export const LINES: Record<string, RonkiLine> = Object.fromEntries(
  Object.entries(RAW).map(([id, l]) => [id, { id, text: l.text, spoken: l.spoken ?? l.text }]),
);

export interface LineVars {
  /** Ronki's nickname (state.companionName, fallback "Ronki"). */
  nick?: string | null;
  /** The child's name (state.familyConfig.childName, fallback "du"). */
  kind?: string | null;
}

/** Bubble text of a line with names filled in. Unknown ids return ''. */
export function lineText(id: string, vars: LineVars = {}): string {
  const l = LINES[id];
  if (!l) return '';
  const nick = (vars.nick && vars.nick.trim()) || 'Ronki';
  const kind = (vars.kind && vars.kind.trim()) || 'du';
  // Function replacements so a "$" in a typed name is never a pattern.
  return l.text.replace(/\{nick\}/g, () => nick).replace(/\{kind\}/g, () => kind);
}

/** True when a line id exists. */
export function hasLine(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(LINES, id);
}

export type DayBlock = 'morning' | 'day' | 'evening' | 'night';

/**
 * The first line of the day on the Nest (the return beat). It notices the
 * return, never the absence (PRD 4.1): no "Ich hab auf dich gewartet".
 * gapDays = whole days between the last played day and today (0 = same
 * day, 1 = yesterday).
 */
export function returnLineFor(gapDays: number, block: DayBlock): string {
  if (gapDays >= 5) return 'return_long_01';
  if (gapDays >= 2) return 'return_short_01';
  if (block === 'morning') return 'greet_day_01';
  if (block === 'evening' || block === 'night') return 'greet_eve_01';
  return 'greet_day_02';
}

/** Ronki's spoken count to the next look. `left` = adventures still needed (>= 1). */
export function growLeftLine(left: number): string {
  if (left <= 1) return 'grow_left_1';
  if (left === 2) return 'grow_left_2';
  if (left === 3) return 'grow_left_3';
  return 'grow_left_more';
}

/** Ronki's line when he reaches a stage index (2 = Jungtier ... 5 = Legendär). */
export function growStageLine(stage: number): string | null {
  return stage >= 2 && stage <= 5 ? `grow_stage_${stage}` : null;
}
