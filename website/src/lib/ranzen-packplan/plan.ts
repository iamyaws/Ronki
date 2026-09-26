/**
 * Ranzen-Packplan: the data behind the tool at /tools/ranzen-packplan.
 *
 * A plan is only three things: what goes into the Ranzen every day, what
 * comes on top on each school day (Monday to Friday, plus one free item per
 * day), and how the family packs. There is no field for a name, a class or a
 * school, so the share link can never carry one.
 *
 * The whole plan lives in the link. `encodePlan` writes it as a short query
 * string (one letter per item), `decodePlan` reads it back and quietly drops
 * anything it does not know. The untouched plan encodes to an empty string,
 * so the address bar stays clean until the parent taps something.
 *
 * Link format (keys only when they differ from the default):
 *   j=btmh          daily items, one letter each ("jeden Tag"); `j=` means none
 *   mo=gs           Monday extras; same for di, mi, do, fr
 *   fr=l.Kuscheltier  extras, a dot, then the free item (the first dot splits)
 *   m=z|p|s         zusammen, pruefen, selbst
 */

export type WeekdayId = 'mo' | 'di' | 'mi' | 'do' | 'fr';

export type DailyItemId = 'brotdose' | 'trinkflasche' | 'maeppchen' | 'hausaufgabenheft';

export type ExtraItemId =
  | 'turnbeutel'
  | 'schwimmsachen'
  | 'buecherei'
  | 'blockfloete'
  | 'malkasten'
  | 'hausschuhe'
  | 'wechselsachen'
  | 'regenjacke'
  | 'mitteilungsheft';

export type SupportMode = 'zusammen' | 'pruefen' | 'selbst';

export interface PackItem<Id extends string = string> {
  id: Id;
  /** One letter in the share link. Unique across all items. */
  code: string;
  label: string;
  /** Soft hyphens where a narrow card may break the word. Defaults to `label`. */
  printLabel?: string;
  /** Drawn picture, a file in /art/bilderbuch/tasks/. */
  img: string;
}

export interface DayPlan {
  extras: ExtraItemId[];
  /** One free item, at most FREE_TEXT_MAX characters. Empty when unused. */
  free: string;
}

export interface PackPlan {
  daily: DailyItemId[];
  days: Record<WeekdayId, DayPlan>;
  mode: SupportMode;
}

const SHY = '­';

export const WEEKDAYS: ReadonlyArray<{ id: WeekdayId; label: string }> = [
  { id: 'mo', label: 'Montag' },
  { id: 'di', label: 'Dienstag' },
  { id: 'mi', label: 'Mittwoch' },
  { id: 'do', label: 'Donnerstag' },
  { id: 'fr', label: 'Freitag' },
];

export const DAILY_ITEMS: ReadonlyArray<PackItem<DailyItemId>> = [
  { id: 'brotdose', code: 'b', label: 'Brotdose', img: 'lunchbox.webp' },
  { id: 'trinkflasche', code: 't', label: 'Trinkflasche', printLabel: `Trink${SHY}flasche`, img: 'water.webp' },
  { id: 'maeppchen', code: 'm', label: 'Mäppchen', img: 'pencil-case.webp' },
  {
    id: 'hausaufgabenheft',
    code: 'h',
    label: 'Hausaufgabenheft',
    printLabel: `Haus${SHY}aufgaben${SHY}heft`,
    img: 'homework.webp',
  },
];

export const EXTRA_ITEMS: ReadonlyArray<PackItem<ExtraItemId>> = [
  { id: 'turnbeutel', code: 'g', label: 'Turnbeutel', printLabel: `Turn${SHY}beutel`, img: 'gym-bag.webp' },
  { id: 'schwimmsachen', code: 's', label: 'Schwimmsachen', printLabel: `Schwimm${SHY}sachen`, img: 'swim-bag.webp' },
  { id: 'buecherei', code: 'l', label: 'Bücherei-Buch', img: 'book.webp' },
  { id: 'blockfloete', code: 'f', label: 'Blockflöte', printLabel: `Block${SHY}flöte`, img: 'recorder.webp' },
  { id: 'malkasten', code: 'k', label: 'Malkasten', printLabel: `Mal${SHY}kasten`, img: 'paint-box.webp' },
  { id: 'hausschuhe', code: 'p', label: 'Hausschuhe', printLabel: `Haus${SHY}schuhe`, img: 'slippers.webp' },
  { id: 'wechselsachen', code: 'w', label: 'Wechselsachen', printLabel: `Wechsel${SHY}sachen`, img: 'spare-clothes.webp' },
  { id: 'regenjacke', code: 'r', label: 'Regenjacke', printLabel: `Regen${SHY}jacke`, img: 'rain-jacket.webp' },
  { id: 'mitteilungsheft', code: 'z', label: 'Mitteilungsheft', printLabel: `Mit${SHY}tei${SHY}lungs${SHY}heft`, img: 'school-letter.webp' },
];

/** Picture for the free item: the Ranzen itself. */
export const FREE_ITEM_IMG = 'bag.webp';

export const FREE_TEXT_MAX = 24;

export const SUPPORT_MODES: ReadonlyArray<{
  id: SupportMode;
  code: string;
  label: string;
  /** One sentence under the choice on the page. */
  description: string;
  /** Hand-written note on the sheet, spoken to the child. */
  note: string;
}> = [
  {
    id: 'zusammen',
    code: 'z',
    label: 'Zusammen packen',
    description: 'Ihr packt gemeinsam. Dein Kind zeigt auf die Karte, du reichst an.',
    note: 'Wir packen zusammen: du zeigst, ich reiche an.',
  },
  {
    id: 'pruefen',
    code: 'p',
    label: 'Selbst packen, gemeinsam prüfen',
    description: 'Dein Kind packt allein. Danach schaut ihr zusammen auf die Karte.',
    note: 'Du packst, dann schauen wir zusammen auf die Karte.',
  },
  {
    id: 'selbst',
    code: 's',
    label: 'Selbst prüfen',
    description: 'Dein Kind packt und vergleicht selbst mit der Karte.',
    note: 'Du packst und prüfst mit der Karte.',
  },
];

/** The line for the class chat, sent together with the link. */
export const SHARE_TEXT =
  'Hier könnt ihr für jeden Schultag eine Bildkarte machen, auf der steht, was in den Ranzen muss.';

/* ------------------------------------------------------------------ */
/* Plan helpers (pure)                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_MODE: SupportMode = 'zusammen';

export function defaultPlan(): PackPlan {
  return {
    daily: DAILY_ITEMS.map((i) => i.id),
    days: {
      mo: { extras: [], free: '' },
      di: { extras: [], free: '' },
      mi: { extras: [], free: '' },
      do: { extras: [], free: '' },
      fr: { extras: [], free: '' },
    },
    mode: DEFAULT_MODE,
  };
}

/**
 * Free item as it goes on the card and into the link: control characters
 * out, spaces folded, trimmed, at most FREE_TEXT_MAX characters (counted as
 * characters, so an emoji is never cut in half).
 */
export function cleanFreeText(raw: string): string {
  // eslint-disable-next-line no-control-regex
  const folded = raw.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim();
  return Array.from(folded).slice(0, FREE_TEXT_MAX).join('').trim();
}

function inOrder<Id extends string>(catalogue: ReadonlyArray<PackItem<Id>>, ids: Iterable<Id>): Id[] {
  const wanted = new Set(ids);
  return catalogue.filter((item) => wanted.has(item.id)).map((item) => item.id);
}

export function toggleDaily(plan: PackPlan, id: DailyItemId): PackPlan {
  const has = plan.daily.includes(id);
  const next = has ? plan.daily.filter((d) => d !== id) : [...plan.daily, id];
  return { ...plan, daily: inOrder(DAILY_ITEMS, next) };
}

export function toggleExtra(plan: PackPlan, day: WeekdayId, id: ExtraItemId): PackPlan {
  const current = plan.days[day].extras;
  const next = current.includes(id) ? current.filter((e) => e !== id) : [...current, id];
  return {
    ...plan,
    days: { ...plan.days, [day]: { ...plan.days[day], extras: inOrder(EXTRA_ITEMS, next) } },
  };
}

export function setFree(plan: PackPlan, day: WeekdayId, text: string): PackPlan {
  return {
    ...plan,
    days: { ...plan.days, [day]: { ...plan.days[day], free: cleanFreeText(text) } },
  };
}

export function setMode(plan: PackPlan, mode: SupportMode): PackPlan {
  return { ...plan, mode };
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

const DAILY_BY_CODE = new Map(DAILY_ITEMS.map((i) => [i.code, i.id]));
const EXTRA_BY_CODE = new Map(EXTRA_ITEMS.map((i) => [i.code, i.id]));
const DAILY_CODE = new Map(DAILY_ITEMS.map((i) => [i.id, i.code]));
const EXTRA_CODE = new Map(EXTRA_ITEMS.map((i) => [i.id, i.code]));
const MODE_BY_CODE = new Map(SUPPORT_MODES.map((m) => [m.code, m.id]));
const MODE_CODE = new Map(SUPPORT_MODES.map((m) => [m.id, m.code]));

function codesToIds<Id extends string>(
  codes: string,
  byCode: Map<string, Id>,
  catalogue: ReadonlyArray<PackItem<Id>>,
): Id[] {
  const ids: Id[] = [];
  for (const ch of codes) {
    const id = byCode.get(ch);
    if (id) ids.push(id);
  }
  return inOrder(catalogue, ids);
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** The plan as a query string without the leading "?". Empty for the default plan. */
export function encodePlan(plan: PackPlan): string {
  const params = new URLSearchParams();

  const daily = inOrder(DAILY_ITEMS, plan.daily);
  if (!sameIds(daily, defaultPlan().daily)) {
    params.set('j', daily.map((id) => DAILY_CODE.get(id)).join(''));
  }

  for (const { id: day } of WEEKDAYS) {
    const extras = inOrder(EXTRA_ITEMS, plan.days[day]?.extras ?? []);
    const free = cleanFreeText(plan.days[day]?.free ?? '');
    const codes = extras.map((id) => EXTRA_CODE.get(id)).join('');
    if (codes || free) params.set(day, free ? `${codes}.${free}` : codes);
  }

  if (plan.mode !== DEFAULT_MODE && MODE_CODE.has(plan.mode)) {
    params.set('m', MODE_CODE.get(plan.mode)!);
  }

  return params.toString();
}

/** Reads a plan back from a query string (with or without "?"). Unknown or bad values are ignored. */
export function decodePlan(search: string): PackPlan {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const plan = defaultPlan();

  const daily = params.get('j');
  if (daily !== null) plan.daily = codesToIds(daily, DAILY_BY_CODE, DAILY_ITEMS);

  for (const { id: day } of WEEKDAYS) {
    const value = params.get(day);
    if (value === null) continue;
    const dot = value.indexOf('.');
    const codes = dot === -1 ? value : value.slice(0, dot);
    const free = dot === -1 ? '' : value.slice(dot + 1);
    plan.days[day] = {
      extras: codesToIds(codes, EXTRA_BY_CODE, EXTRA_ITEMS),
      free: cleanFreeText(free),
    };
  }

  const mode = MODE_BY_CODE.get(params.get('m') ?? '');
  if (mode) plan.mode = mode;

  return plan;
}
