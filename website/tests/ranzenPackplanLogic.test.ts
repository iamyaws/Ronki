import { describe, it, expect } from 'vitest';
import {
  DAILY_ITEMS,
  EXTRA_ITEMS,
  FREE_TEXT_MAX,
  SHARE_TEXT,
  SUPPORT_MODES,
  WEEKDAYS,
  cleanFreeText,
  decodePlan,
  defaultPlan,
  encodePlan,
  setFree,
  setMode,
  toggleDaily,
  toggleExtra,
  type PackPlan,
} from '../src/lib/ranzen-packplan';

// File names of the drawn task pictures that ship with the site.
const TASK_ART = new Set(
  Object.keys(import.meta.glob('../public/art/bilderbuch/tasks/*.webp')).map((path) =>
    path.split('/').pop(),
  ),
);

/** Every extra on every day plus a full free item: the heaviest sheet there is. */
function worstCasePlan(): PackPlan {
  let plan = defaultPlan();
  for (const day of WEEKDAYS) {
    for (const item of EXTRA_ITEMS) plan = toggleExtra(plan, day.id, item.id);
    plan = setFree(plan, day.id, 'Geld für den Ausflug mit');
  }
  return setMode(plan, 'pruefen');
}

describe('Ranzen-Packplan catalogue', () => {
  it('has the four daily items and nine weekday extras with a picture each', () => {
    expect(DAILY_ITEMS.map((i) => i.label)).toEqual([
      'Brotdose',
      'Trinkflasche',
      'Mäppchen',
      'Hausaufgabenheft',
    ]);
    expect(EXTRA_ITEMS.map((i) => i.label)).toEqual([
      'Turnbeutel',
      'Schwimmsachen',
      'Bücherei-Buch',
      'Blockflöte',
      'Malkasten',
      'Hausschuhe',
      'Wechselsachen',
      'Regenjacke',
      'Mitteilungsheft',
    ]);
    for (const item of [...DAILY_ITEMS, ...EXTRA_ITEMS]) {
      expect(TASK_ART.has(item.img), item.img).toBe(true);
    }
  });

  it('gives every item a unique one-letter code for the link', () => {
    const codes = [...DAILY_ITEMS, ...EXTRA_ITEMS].map((i) => i.code);
    for (const code of codes) expect(code).toMatch(/^[a-z]$/);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('has the three ways to pack and a sheet note for each, without deadlines', () => {
    expect(SUPPORT_MODES.map((m) => [m.id, m.label])).toEqual([
      ['zusammen', 'Zusammen packen'],
      ['pruefen', 'Selbst packen, gemeinsam prüfen'],
      ['selbst', 'Selbst prüfen'],
    ]);
    for (const mode of SUPPORT_MODES) {
      expect(mode.description.length).toBeGreaterThan(0);
      expect(mode.note.length).toBeGreaterThan(0);
      for (const text of [mode.label, mode.description, mode.note]) {
        expect(text).not.toMatch(/bis wann|Frist|Woche|Tage lang|geschafft/i);
        expect(text).not.toContain('—');
      }
    }
  });

  it('keeps the class-chat share text', () => {
    expect(SHARE_TEXT).toBe(
      'Hier könnt ihr für jeden Schultag eine Bildkarte machen, auf der steht, was in den Ranzen muss.',
    );
  });
});

describe('Ranzen-Packplan defaults', () => {
  it('starts with the four daily items, nothing extra and packing together', () => {
    const plan = defaultPlan();
    expect(plan.daily).toEqual(['brotdose', 'trinkflasche', 'maeppchen', 'hausaufgabenheft']);
    expect(Object.keys(plan.days)).toEqual(['mo', 'di', 'mi', 'do', 'fr']);
    for (const day of WEEKDAYS) expect(plan.days[day.id]).toEqual({ extras: [], free: '' });
    expect(plan.mode).toBe('zusammen');
  });

  it('holds no personal field at all', () => {
    expect(Object.keys(defaultPlan()).sort()).toEqual(['daily', 'days', 'mode']);
    expect(Object.keys(defaultPlan().days.mo).sort()).toEqual(['extras', 'free']);
  });

  it('gives an empty link for the untouched plan and reads an empty link as the defaults', () => {
    expect(encodePlan(defaultPlan())).toBe('');
    expect(decodePlan('')).toEqual(defaultPlan());
    expect(decodePlan('?')).toEqual(defaultPlan());
  });
});

describe('Ranzen-Packplan link', () => {
  it('writes a short link with one-letter ids', () => {
    let plan = defaultPlan();
    plan = toggleDaily(plan, 'hausaufgabenheft');
    plan = toggleExtra(plan, 'di', 'turnbeutel');
    plan = toggleExtra(plan, 'do', 'wechselsachen');
    plan = toggleExtra(plan, 'do', 'schwimmsachen');
    plan = toggleExtra(plan, 'fr', 'buecherei');
    plan = setFree(plan, 'fr', 'Kuscheltier');
    plan = setMode(plan, 'selbst');
    expect(encodePlan(plan)).toBe('j=btm&di=g&do=sw&fr=l.Kuscheltier&m=s');
  });

  it('round-trips a plan exactly, with umlauts and spaces in the free item', () => {
    let plan = defaultPlan();
    plan = toggleDaily(plan, 'trinkflasche');
    plan = toggleExtra(plan, 'mo', 'regenjacke');
    plan = toggleExtra(plan, 'mo', 'blockfloete');
    plan = setFree(plan, 'mi', 'Geld für Ausflug & Kuchen');
    plan = setFree(plan, 'do', 'Brille. Und: Hut?');
    plan = setMode(plan, 'pruefen');
    const back = decodePlan(encodePlan(plan));
    expect(back).toEqual(plan);
    expect(encodePlan(back)).toBe(encodePlan(plan));
  });

  it('round-trips the worst case and keeps the link short', () => {
    const plan = worstCasePlan();
    const link = encodePlan(plan);
    expect(decodePlan(link)).toEqual(plan);
    expect(decodePlan(`?${link}`)).toEqual(plan);
    expect(link.length).toBeLessThan(260);
  });

  it('round-trips a plan with no daily items', () => {
    let plan = defaultPlan();
    for (const item of DAILY_ITEMS) plan = toggleDaily(plan, item.id);
    expect(plan.daily).toEqual([]);
    expect(decodePlan(encodePlan(plan))).toEqual(plan);
  });

  it('keeps items in catalogue order whatever order they were tapped in', () => {
    let plan = defaultPlan();
    plan = toggleExtra(plan, 'mi', 'mitteilungsheft');
    plan = toggleExtra(plan, 'mi', 'turnbeutel');
    expect(plan.days.mi.extras).toEqual(['turnbeutel', 'mitteilungsheft']);
    plan = toggleExtra(plan, 'mi', 'turnbeutel');
    expect(plan.days.mi.extras).toEqual(['mitteilungsheft']);
  });

  it('ignores unknown ids, doubles, wrong-list ids, bad modes and unknown keys', () => {
    const plan = decodePlan(
      'j=bxqbG&mo=gg9Zs&di=b&mi=%3C%3E%22&m=nope&name=Lea&schule=Grundschule+Nord&xx=1',
    );
    expect(plan.daily).toEqual(['brotdose']);
    expect(plan.days.mo.extras).toEqual(['turnbeutel', 'schwimmsachen']);
    // "b" is a daily item, not a weekday extra.
    expect(plan.days.di.extras).toEqual([]);
    expect(plan.days.mi).toEqual({ extras: [], free: '' });
    expect(plan.mode).toBe('zusammen');
    expect(Object.keys(plan).sort()).toEqual(['daily', 'days', 'mode']);
    expect(JSON.stringify(plan)).not.toMatch(/Lea|Grundschule/);
  });

  it('never writes a key outside the plan', () => {
    const keys = [...new URLSearchParams(encodePlan(worstCasePlan())).keys()];
    for (const key of keys) expect(['j', 'mo', 'di', 'mi', 'do', 'fr', 'm']).toContain(key);
  });

  it('caps and trims a free item that arrives too long through the link', () => {
    const plan = decodePlan(`fr=l.${'  Sehr langer Text '.repeat(4)}`);
    expect(plan.days.fr.extras).toEqual(['buecherei']);
    expect(plan.days.fr.free.length).toBeLessThanOrEqual(FREE_TEXT_MAX);
    expect(plan.days.fr.free).toBe(plan.days.fr.free.trim());
    expect(plan.days.fr.free.startsWith('Sehr langer Text')).toBe(true);
  });
});

describe('Ranzen-Packplan free item', () => {
  it('is at most 24 characters', () => {
    expect(FREE_TEXT_MAX).toBe(24);
  });

  it('trims, folds inner spaces and caps at 24 characters', () => {
    expect(cleanFreeText('  Geld   für  den Ausflug  ')).toBe('Geld für den Ausflug');
    expect(cleanFreeText('abcdefghijklmnopqrstuvwxyz0123')).toBe('abcdefghijklmnopqrstuvwx');
    expect(cleanFreeText('Turnschuhe und Socken mitnehmen')).toBe('Turnschuhe und Socken mi');
    // No trailing space left behind by the cut.
    expect(cleanFreeText('12345678901234567890123 5')).toBe('12345678901234567890123');
    expect(cleanFreeText('   ')).toBe('');
  });

  it('drops control characters and never splits an emoji', () => {
    expect(cleanFreeText('Hut\u0000\u0007 und\nSchal')).toBe('Hut und Schal');
    const text = cleanFreeText(`${'a'.repeat(23)}🎒🎒`);
    expect(Array.from(text)).toHaveLength(24);
    expect(text.endsWith('🎒')).toBe(true);
  });

  it('is stored cleaned when set through the helpers', () => {
    const plan = setFree(defaultPlan(), 'mo', '  Kuscheltier  ');
    expect(plan.days.mo.free).toBe('Kuscheltier');
  });
});
