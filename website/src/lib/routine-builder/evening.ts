/**
 * Abendroutine builder: the evening kit for /vorlagen/abendroutine.
 *
 * Same plan logic as the morning (`kit.ts`); the clock time counts back
 * from lights out instead of leaving the house.
 *
 * Link format (keys only when they differ from the default):
 *   s=azwylo          step codes in order; the default is zwyo
 *   e=Medizin nehmen  the own step, only when x is in s
 *   aus=1930          lights-out time as HHMM; being there means times are on
 *   m=20.3.3.3.10.1   minutes per step, only when times are on and they differ
 */

import { clockRange, type RoutineKit, type RoutineStep } from './kit';

/** Evening steps the app knows. Must match ROUTINE_CHOICES.evening in src/data/taskKinds.ts (drift test). */
export const APP_EVENING_KINDS = ['dinner', 'teeth_pm', 'wash_pm', 'pyjama', 'cuddle'] as const;

export type AppEveningKind = (typeof APP_EVENING_KINDS)[number];

/** German labels the app shows under each picture (TASK_LABEL in the app). */
export const APP_EVENING_LABELS: Record<AppEveningKind, string> = {
  dinner: 'Abendbrot',
  teeth_pm: 'Zähne putzen',
  wash_pm: 'Waschen',
  pyjama: 'Pyjama',
  cuddle: 'Vorlesen',
};

/** Catalogue in the order of a usual evening; new steps are placed by it. */
export const EVENING_STEPS: ReadonlyArray<RoutineStep> = [
  { code: 'a', label: 'Abendessen', hint: 'Am Tisch, zusammen.', img: 'plate.webp', minutes: 20, app: 'dinner' },
  { code: 'g', label: 'Sachen rauslegen', hint: 'Kleidung für morgen auf den Stuhl.', img: 'shirt.webp', minutes: 3 },
  { code: 'p', label: 'Tasche packen', hint: 'Brotdose, Trinkflasche, Hausaufgaben.', img: 'bag.webp', minutes: 5 },
  { code: 'k', label: 'Klo', hint: 'Danach Hände waschen.', img: 'toilet.webp', minutes: 2 },
  { code: 'z', label: 'Zähne putzen', hint: 'Auch die hinten im Mund.', img: 'toothbrush.webp', minutes: 3, app: 'teeth_pm' },
  { code: 'w', label: 'Gesicht waschen', hint: 'Mit Wasser, ganz sanft.', img: 'wash.webp', minutes: 3, app: 'wash_pm' },
  { code: 'y', label: 'Pyjama an', hint: 'Die Sachen von heute in den Korb.', img: 'pajama.webp', minutes: 3, app: 'pyjama' },
  { code: 't', label: 'Wasser trinken', hint: 'Ein Schluck Wasser.', img: 'water.webp', minutes: 1 },
  { code: 'n', label: 'Tier füttern', hint: 'Futter in den Napf, frisches Wasser.', img: 'pet-bowl.webp', minutes: 3 },
  { code: 'b', label: 'Brille ablegen', hint: 'Ins Etui, neben das Bett.', img: 'glasses.webp', minutes: 1 },
  { code: 'l', label: 'Vorlesen', hint: 'Eine Geschichte zusammen.', img: 'book.webp', minutes: 10, app: 'cuddle' },
  { code: 'u', label: 'Kuscheltier', hint: 'Wer schläft heute mit?', img: 'teddy.webp', minutes: 1 },
  { code: 'm', label: 'Nachtlicht an', hint: 'Das kleine Licht darf anbleiben.', img: 'nightlight.webp', minutes: 1 },
  {
    code: 'o',
    label: 'Licht aus',
    hint: 'Eine Geschichte, dann schlafen.',
    // With "Vorlesen" on the sheet the story is its own step.
    altHint: { when: 'l', hint: 'Augen zu, gute Nacht.' },
    img: 'light-off.webp',
    minutes: 1,
  },
];

/** The four steps the page has always shown, in that order. */
export const EVENING_DEFAULT_STEPS: readonly string[] = ['z', 'w', 'y', 'o'];
export const EVENING_DEFAULT_TIME = '19:30';

/** Lights-out times a parent can pick: 18:30 to 21:00 in 5-minute steps. */
export const LIGHTS_OUT_TIMES: readonly string[] = clockRange('18:30', '21:00');

export const EVENING: RoutineKit = {
  id: 'abend',
  steps: EVENING_STEPS,
  defaultSteps: EVENING_DEFAULT_STEPS,
  ownBefore: 'o',
  lastWords: { code: 'o', words: 'bis ins Bett' },
  timeKey: 'aus',
  defaultTime: EVENING_DEFAULT_TIME,
  times: LIGHTS_OUT_TIMES,
  timeNote: (clock) => `Für heute fertig. Licht aus um ${clock} Uhr.`,
  appKinds: APP_EVENING_KINDS,
  appLabels: APP_EVENING_LABELS,
  cardParam: 'abend',
  notAloneInApp: [],
  shareTitle: 'Abendroutine',
  shareText: 'Unsere Abendroutine mit Bildern zum Ausdrucken. Du kannst die Schritte für euren Abend ändern.',
};
