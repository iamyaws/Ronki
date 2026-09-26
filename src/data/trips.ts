/**
 * Ronki's trips (Finch pass, 26 Sep 2026).
 *
 * Twenty-eight trips in a fixed order, one per adventure (the first wave of
 * 14 on 26 Sep 2026, the second wave t15 to t28 after it). The order never
 * depends on what the child did (no random or rarer rewards, PRD 6).
 * After the last one the order starts again and Ronki says so honestly
 * ("Da war ich schon mal. Aber es war wieder schön."); no new treasure is
 * added for a repeat.
 *
 * Voice files: de_trip_story_<NN>.mp3 and de_trip_hook_<NN>.mp3 in
 * public/audio/ronki/, NN = 01 to 28. Words in finchLines.de.json.
 */
import data from './finchLines.de.json';

const BASE_URL: string = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) || '/';

export interface Trip {
  /** Stable id, 't01' to 't28'. Stored in saves (expedition.tripId, treasuresFound). */
  id: string;
  /** Two-digit number, '01' to '28'. */
  nn: string;
  place: string;
  emoji: string;
  treasure: string;
  story: string;
  hook: string;
  /** Voice ids for VoiceAudio.playLocalized. */
  storyVoice: string;
  hookVoice: string;
  /** Small drawing of the place (art/bilderbuch/places/tNN.webp), shown with
   *  the hook the evening before: tomorrow as a picture (26 Sep 2026). */
  picture: string;
}

export const TRIPS: Trip[] = (data.trips as Array<Omit<Trip, 'nn' | 'storyVoice' | 'hookVoice' | 'picture'>>).map(t => {
  const nn = t.id.slice(1);
  return { ...t, nn, storyVoice: `trip_story_${nn}`, hookVoice: `trip_hook_${nn}`, picture: `${BASE_URL}art/bilderbuch/places/${t.id}.webp` };
});

export const TRIP_COUNT = TRIPS.length;

/**
 * The cursor of the next departure: opening a pending treasure moves the
 * cursor only when it came from a trip (the same rule as openTreasure in
 * TaskContext), so a preview never shows a place Ronki will not fly to.
 */
export function nextTripCursor(state: { tripCursor?: number; expedition?: { pendingMemento?: { tripId?: string } | null; tripId?: string } | null } | null | undefined): number {
  const cur = Number.isFinite(state?.tripCursor) && (state?.tripCursor as number) > 0 ? Math.floor(state?.tripCursor as number) : 0;
  const e = state?.expedition;
  const advances = !!e?.pendingMemento && !!(e.pendingMemento.tripId || e.tripId);
  return cur + (advances ? 1 : 0);
}

/** The trip at a cursor position (wraps after the last one). */
export function tripAt(cursor: number): Trip {
  const n = Number.isFinite(cursor) && cursor > 0 ? Math.floor(cursor) : 0;
  return TRIPS[n % TRIP_COUNT];
}

/** True when this cursor position repeats a trip the child has already had. */
export function isRepeat(cursor: number): boolean {
  return Number.isFinite(cursor) && cursor >= TRIP_COUNT;
}

/** Trip by id, or null. */
export function tripById(id: string | null | undefined): Trip | null {
  return TRIPS.find(t => t.id === id) || null;
}
