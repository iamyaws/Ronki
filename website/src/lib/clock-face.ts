/**
 * Geometry of the clock face on the morning sheet (pure, no React).
 *
 * The face is drawn in a 100 x 100 box with the centre at 50, 50. Angles are
 * in degrees, clockwise from 12. The hour hand moves with the minutes, the
 * way a kitchen clock does: at 7:30 it stands halfway between 7 and 8.
 */

export const FACE_SIZE = 100;
export const FACE_CENTRE = 50;

/** Radii in the 100 box. */
export const FACE_RIM = 45;
export const TICK_OUTER = 41;
export const TICK_INNER_MINOR = 36;
export const TICK_INNER_MAJOR = 32;
export const NUMERAL_RADIUS = 24;
export const HOUR_HAND = 19;
export const MINUTE_HAND = 34;

export interface Point {
  x: number;
  y: number;
}

export interface HandAngles {
  hour: number;
  minute: number;
}

/** Hours and minutes from "7:05" or "07:05", or null for anything else. */
export function parseClock(label: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(label.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
}

/** Hand angles in degrees clockwise from 12. The hour hand drifts with the minutes. */
export function handAngles(h: number, m: number): HandAngles {
  return { hour: ((h % 12) + m / 60) * 30, minute: m * 6 };
}

/** Two decimals are plenty for a drawing this size and keep the SVG short. */
function round(n: number): number {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

/** The point at `angle` degrees clockwise from 12, `radius` away from the centre. */
export function pointAt(angle: number, radius: number): Point {
  const rad = (angle * Math.PI) / 180;
  return {
    x: round(FACE_CENTRE + radius * Math.sin(rad)),
    y: round(FACE_CENTRE - radius * Math.cos(rad)),
  };
}

export interface Tick {
  from: Point;
  to: Point;
  /** 12, 3, 6 and 9 are longer and thicker. */
  major: boolean;
}

/** Twelve tick marks, one per hour, starting at 12. */
export function tickMarks(): Tick[] {
  return Array.from({ length: 12 }, (_, i) => {
    const major = i % 3 === 0;
    const angle = i * 30;
    return {
      from: pointAt(angle, major ? TICK_INNER_MAJOR : TICK_INNER_MINOR),
      to: pointAt(angle, TICK_OUTER),
      major,
    };
  });
}

/** The numerals 12, 3, 6 and 9 and where their centres sit. */
export function numerals(): { text: string; at: Point }[] {
  return [
    { text: '12', at: pointAt(0, NUMERAL_RADIUS) },
    { text: '3', at: pointAt(90, NUMERAL_RADIUS) },
    { text: '6', at: pointAt(180, NUMERAL_RADIUS) },
    { text: '9', at: pointAt(270, NUMERAL_RADIUS) },
  ];
}

export interface Hands {
  hour: Point;
  minute: Point;
  angles: HandAngles;
}

/** Tips of both hands for a clock time like "7:05", or null when it is not one. */
export function handsFor(label: string): Hands | null {
  const time = parseClock(label);
  if (!time) return null;
  const angles = handAngles(time.h, time.m);
  return {
    hour: pointAt(angles.hour, HOUR_HAND),
    minute: pointAt(angles.minute, MINUTE_HAND),
    angles,
  };
}
