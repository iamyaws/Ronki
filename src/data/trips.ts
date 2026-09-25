/**
 * Ronki's trips (Finch pass, 26 Sep 2026).
 *
 * Fourteen trips in a fixed order, one per adventure. The order never
 * depends on what the child did (no random or rarer rewards, PRD 6).
 * After the fourteenth the order starts again and Ronki says so honestly
 * ("Da war ich schon mal. Aber es war wieder schön."); no new treasure is
 * added for a repeat.
 *
 * Voice files: de_trip_story_<NN>.mp3 and de_trip_hook_<NN>.mp3 in
 * public/audio/ronki/, NN = 01 to 14. Words in finchLines.de.json.
 */
import data from './finchLines.de.json';

export interface Trip {
  /** Stable id, 't01' to 't14'. Stored in saves (expedition.tripId, treasuresFound). */
  id: string;
  /** Two-digit number, '01' to '14'. */
  nn: string;
  place: string;
  emoji: string;
  treasure: string;
  story: string;
  hook: string;
  /** Voice ids for VoiceAudio.playLocalized. */
  storyVoice: string;
  hookVoice: string;
}

export const TRIPS: Trip[] = (data.trips as Array<Omit<Trip, 'nn' | 'storyVoice' | 'hookVoice'>>).map(t => {
  const nn = t.id.slice(1);
  return { ...t, nn, storyVoice: `trip_story_${nn}`, hookVoice: `trip_hook_${nn}` };
});

export const TRIP_COUNT = TRIPS.length;

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
