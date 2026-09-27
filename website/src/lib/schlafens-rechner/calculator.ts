/**
 * Schlafens-Rechner — sleep schedule math for kids 5-9.
 *
 * Recommendations are based on AAP / National Sleep Foundation
 * consensus ranges, simplified to one "good middle" value per age.
 * Screen-off rule scales by age: younger kids need more wind-down
 * because circadian-rhythm disruption from blue light hits harder
 * before puberty.
 */

export type ChildAge = 5 | 6 | 7 | 8 | 9;

export interface SleepRecommendation {
  age: ChildAge;
  /** Target sleep hours per night, single recommended value. */
  recommendedHours: number;
  /** Documented healthy range, shown as context. */
  rangeHours: [number, number];
  /** Minutes before bedtime when screens should be off. */
  screenOffMinutesBefore: number;
}

export const RECOMMENDATIONS: Record<ChildAge, SleepRecommendation> = {
  5: {
    age: 5,
    recommendedHours: 11,
    rangeHours: [10, 13],
    screenOffMinutesBefore: 90,
  },
  6: {
    age: 6,
    recommendedHours: 10.5,
    rangeHours: [9, 12],
    screenOffMinutesBefore: 90,
  },
  7: {
    age: 7,
    recommendedHours: 10,
    rangeHours: [9, 12],
    screenOffMinutesBefore: 90,
  },
  8: {
    age: 8,
    recommendedHours: 10,
    rangeHours: [9, 12],
    screenOffMinutesBefore: 60,
  },
  9: {
    age: 9,
    recommendedHours: 9.5,
    rangeHours: [9, 12],
    screenOffMinutesBefore: 60,
  },
};

export interface ScheduleOutput {
  bedtime: string;
  bedtimePrep: string;
  screenOff: string;
  storyTime: string;
  recommendation: SleepRecommendation;
  /** Hours of sleep this schedule actually delivers. */
  deliveredHours: number;
}

/**
 * Parses a "HH:MM" string into a Date pinned to today. Used for the
 * wake-up time input. Returns null on malformed input.
 */
function parseTime(input: string): Date | null {
  if (!/^\d{2}:\d{2}$/.test(input)) return null;
  const [h, m] = input.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Wake-up time from the `auf` query value ("0650" from the morning builder)
 * as "HH:MM", or null unless it is four digits and a valid clock time.
 */
export function wakeUpFromParam(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value)) return null;
  const hhmm = `${value.slice(0, 2)}:${value.slice(2)}`;
  return parseTime(hhmm) ? hhmm : null;
}

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function subtractMinutes(d: Date, mins: number): Date {
  const out = new Date(d);
  out.setMinutes(out.getMinutes() - mins);
  return out;
}

const FALL_ASLEEP_BUFFER_MIN = 15;
const BEDTIME_PREP_BEFORE_MIN = 30;
const STORY_BEFORE_BEDTIME_MIN = 15;

/**
 * Builds the recommended schedule for a child of given age and the
 * target wake-up time. All output times are clock strings.
 */
export function calculateSchedule(
  age: ChildAge,
  wakeUpInput: string,
): ScheduleOutput | null {
  const wakeUp = parseTime(wakeUpInput);
  if (!wakeUp) return null;

  const rec = RECOMMENDATIONS[age];
  const sleepMinutes = rec.recommendedHours * 60;

  // Bedtime = wake-up minus sleep duration minus fall-asleep buffer.
  // The buffer accounts for the time between lying down and actually
  // falling asleep (varies, 15 min is a calm-evening estimate).
  const bedtime = subtractMinutes(
    wakeUp,
    sleepMinutes + FALL_ASLEEP_BUFFER_MIN,
  );
  // If the calculation crosses midnight backward, JavaScript Date
  // rolls into the previous day automatically. We just want the time.
  const bedtimePrep = subtractMinutes(bedtime, BEDTIME_PREP_BEFORE_MIN);
  const storyTime = subtractMinutes(bedtime, STORY_BEFORE_BEDTIME_MIN);
  const screenOff = subtractMinutes(bedtime, rec.screenOffMinutesBefore);

  return {
    bedtime: formatTime(bedtime),
    bedtimePrep: formatTime(bedtimePrep),
    screenOff: formatTime(screenOff),
    storyTime: formatTime(storyTime),
    recommendation: rec,
    deliveredHours: rec.recommendedHours,
  };
}
