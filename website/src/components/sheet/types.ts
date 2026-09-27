/** One step on a routine sheet. */
export interface SheetStep {
  /** Drawn task picture, a file name in /art/bilderbuch/tasks/ (e.g. "toothbrush.webp"). */
  img?: string;
  /** Emoji, only shown when the step has no picture. */
  icon?: string;
  /** Short label. Empty on the toddler sheet, which has no words. */
  label: string;
  /** Optional hint under the label. */
  hint?: string;
  /** Clock time the step starts, e.g. "7:05". Printed where the blank "___ Uhr" line would be. */
  time?: string;
  /**
   * Clock time for a drawn clock face beside the step, e.g. "7:05" (morning
   * builder only). Without `time` the row keeps the time for screen readers.
   */
  clock?: string;
  /** No picture: an empty dashed box the child draws the step into. */
  draw?: boolean;
}

/** Ronki poses in /art/bilderbuch/ronki/. */
export type RonkiPose = 'wave' | 'cheer' | 'calm' | 'happy';

/** Ronki at the top right of a sheet, with an optional speech bubble. */
export interface SheetHost {
  pose: RonkiPose;
  bubble?: string;
}

/** Duration bar without clock times (ADHS sheet). */
export interface SheetTimeBar {
  start: string;
  end: string;
  note?: string;
}
