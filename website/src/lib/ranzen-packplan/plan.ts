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
  { id: 'trinkflasche', code: 't', label: 'Trinkflasche', printLabel: `Trink${SHY}flasche`, img: 'bottle.webp' },
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

/**
 * Pictures for free items the tool knows by name. Checked in this order, so
 * the specific word wins ("Hausschuhe" before "Schuhe", "Geld für den
 * Ausflug" gets the purse, not the backpack). A word matches when it is the
 * stem, starts with it (Laternenumzug) or ends with it (Taschengeld,
 * Sonnenhut), so a stem hidden inside another word ("hut" in "Schutz") does
 * not. Compounds need the specific entry first: "Handschuhe" ends with
 * "schuhe" and "Sonnenmütze" with "mütze". Anything else gets an empty box on the card to draw in.
 */
const FREE_PICTURES: ReadonlyArray<{ img: string; stems: readonly string[] }> = [
  { img: 'slippers.webp', stems: ['hausschuh', 'hausschuhe', 'puschen'] },
  { img: 'rubber-boots.webp', stems: ['gummistiefel', 'stiefel', 'matschsachen', 'matschhose'] },
  { img: 'coin-purse.webp', stems: ['geld', 'münze', 'münzen', 'euro', 'portemonnaie', 'geldbeutel', 'geldbörse'] },
  { img: 'lantern.webp', stems: ['laterne', 'laternen', 'lampion', 'lampions'] },
  { img: 'apple.webp', stems: ['obst', 'apfel', 'äpfel', 'frucht', 'früchte', 'gemüse'] },
  { img: 'glue-stick.webp', stems: ['kleber', 'klebestift', 'klebstoff'] },
  { img: 'scissors.webp', stems: ['schere'] },
  { img: 'sun-hat.webp', stems: ['sonnenhut', 'sonnenmütze', 'sonnencreme', 'hut', 'kappe'] },
  { img: 'hat-gloves.webp', stems: ['mütze', 'handschuh', 'handschuhe', 'schal'] },
  { img: 'sneakers.webp', stems: ['turnschuh', 'turnschuhe', 'sportschuh', 'sportschuhe', 'hallenschuh', 'hallenschuhe', 'schuh', 'schuhe'] },
  { img: 'chestnuts.webp', stems: ['kastanie', 'kastanien', 'eicheln', 'bastelsachen'] },
  { img: 'bottle.webp', stems: ['trinkflasche', 'flasche'] },
  { img: 'lunchbox.webp', stems: ['brotdose', 'frühstück', 'pausenbrot'] },
  { img: 'teddy.webp', stems: ['kuscheltier', 'teddy', 'stofftier'] },
  { img: 'school-letter.webp', stems: ['mitteilungsheft', 'elternbrief', 'brief', 'zettel', 'unterschrift', 'formular'] },
  { img: 'book.webp', stems: ['buch', 'bücher', 'lesebuch'] },
  { img: 'homework.webp', stems: ['hausaufgaben', 'hausaufgabenheft', 'heft', 'hefte', 'arbeitsblatt'] },
  { img: 'rain-jacket.webp', stems: ['jacke', 'regenjacke', 'matschjacke'] },
  { img: 'backpack.webp', stems: ['rucksack', 'ausflug', 'wandertag', 'waldtag'] },
];

/** Every picture a free item can get, for the check that the files ship. */
export const FREE_PICTURE_FILES: readonly string[] = [...new Set(FREE_PICTURES.map((entry) => entry.img))];

/** Picture file for a free item, or null when the card should show a box to draw in. */
export function pictureForFree(text: string): string | null {
  const words = cleanFreeText(text)
    .toLocaleLowerCase('de-DE')
    .split(/[^a-zäöüß]+/)
    .filter(Boolean);
  for (const entry of FREE_PICTURES) {
    for (const stem of entry.stems) {
      if (words.some((w) => w === stem || w.startsWith(stem) || (stem.length >= 3 && w.endsWith(stem)))) {
        return entry.img;
      }
    }
  }
  return null;
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
