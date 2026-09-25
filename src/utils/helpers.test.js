import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLevel, getLvlProg, buildDay, getSky, getSkyStars, getTimeLabel, getMood, getDayName } from './helpers';

describe('getLevel', () => {
  it('returns level 1 for 0 XP', () => {
    expect(getLevel(0)).toBe(1);
  });

  it('returns level 1 for XP below first threshold', () => {
    expect(getLevel(49)).toBe(1);
  });

  it('returns level 2 at exactly 50 XP', () => {
    expect(getLevel(50)).toBe(2);
  });

  it('returns level 3 at 120 XP', () => {
    expect(getLevel(120)).toBe(3);
  });

  it('returns level 16 at max XP', () => {
    expect(getLevel(7200)).toBe(16);
  });

  it('returns level 16 for XP beyond max threshold', () => {
    expect(getLevel(99999)).toBe(16);
  });

  it('returns correct levels at each threshold boundary', () => {
    const thresholds = [0, 50, 120, 220, 360, 550, 800, 1100, 1500, 2000, 2600, 3300, 4100, 5000, 6000, 7200];
    thresholds.forEach((xp, i) => {
      expect(getLevel(xp)).toBe(i + 1);
    });
  });
});

describe('getLvlProg', () => {
  it('returns correct progress for level 1 start', () => {
    const p = getLvlProg(0);
    expect(p.cur).toBe(0);
    expect(p.need).toBe(50);
  });

  it('returns progress within level 1', () => {
    const p = getLvlProg(25);
    expect(p.cur).toBe(25);
    expect(p.need).toBe(50);
  });

  it('returns progress at level 2 start', () => {
    const p = getLvlProg(50);
    expect(p.cur).toBe(0);
    expect(p.need).toBe(70); // 120 - 50
  });

  it('returns progress mid-level 2', () => {
    const p = getLvlProg(85);
    expect(p.cur).toBe(35);
    expect(p.need).toBe(70);
  });

  it('uses fallback for max level', () => {
    const p = getLvlProg(7200);
    // At level 16, LVL[16] is undefined, so need = 7200 + 500 - 7200 = 500
    expect(p.cur).toBe(0);
    expect(p.need).toBe(500);
  });
});

describe('buildDay', () => {
  it('returns school quests when not vacation', () => {
    const quests = buildDay(false);
    // School quests have IDs starting with 's'
    const schoolIds = quests.filter(q => q.id.startsWith('s'));
    expect(schoolIds.length).toBeGreaterThan(0);
    expect(quests.every(q => q.done === false)).toBe(true);
    expect(quests.every(q => q.streak === 0)).toBe(true);
  });

  it('returns vacation quests when vacation mode', () => {
    const quests = buildDay(true);
    const vacIds = quests.filter(q => q.id.startsWith('v'));
    expect(vacIds.length).toBeGreaterThan(0);
    // Should not contain football in vacation
    expect(quests.find(q => q.id === 'ft')).toBeUndefined();
  });

  it('adds football on Monday (day=1) in school mode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 6)); // Monday April 6 2026
    const quests = buildDay(false);
    expect(quests.find(q => q.id === 'ft')).toBeDefined();
    vi.useRealTimers();
  });

  it('adds football on Wednesday (day=3) in school mode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 8)); // Wednesday April 8 2026
    const quests = buildDay(false);
    expect(quests.find(q => q.id === 'ft')).toBeDefined();
    vi.useRealTimers();
  });

  it('does not add football on Tuesday in school mode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 7)); // Tuesday April 7 2026
    const quests = buildDay(false);
    expect(quests.find(q => q.id === 'ft')).toBeUndefined();
    vi.useRealTimers();
  });

  it('does not add football on Monday in vacation mode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 6)); // Monday
    const quests = buildDay(true);
    expect(quests.find(q => q.id === 'ft')).toBeUndefined();
    vi.useRealTimers();
  });

  it('all quests have required fields', () => {
    const quests = buildDay(false);
    quests.forEach(q => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('name');
      expect(q).toHaveProperty('icon');
      expect(q).toHaveProperty('anchor');
      expect(q).toHaveProperty('xp');
      expect(q).toHaveProperty('minutes');
      expect(q).toHaveProperty('done');
      expect(q).toHaveProperty('streak');
    });
  });
});

describe('buildDay with a family routine (spec R15)', () => {
  const MONDAY = new Date(2026, 8, 28, 7, 0); // Monday 28 Sep 2026
  const SATURDAY = new Date(2026, 8, 26, 7, 0);
  const main = (qs, anchor) => qs.filter(q => !q.sideQuest && q.anchor === anchor).map(q => q.id);

  it('without a routine uses the default: 5 morning, 4 bedtime on a school day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(MONDAY);
    const qs = buildDay(false);
    expect(main(qs, 'morning')).toEqual(['s_wake', 's_breakfast', 's_teeth_am', 's_dress', 's_packcheck']);
    expect(main(qs, 'bedtime')).toEqual(['s_teeth_pm', 's_wash_pm', 's_pyjama', 's_cuddle']);
    vi.useRealTimers();
  });

  it('keeps the afternoon, hobby and side quests unfiltered', () => {
    vi.useFakeTimers();
    vi.setSystemTime(MONDAY);
    const qs = buildDay(false, { morning: [], evening: [] });
    expect(main(qs, 'morning')).toEqual([]);
    expect(main(qs, 'bedtime')).toEqual([]);
    expect(qs.find(q => q.id === 's_move')).toBeDefined();
    expect(qs.find(q => q.id === 'ft')).toBeDefined(); // Monday
    expect(qs.filter(q => q.sideQuest).length).toBe(2);
    vi.useRealTimers();
  });

  it('filters by kind with a chosen routine', () => {
    vi.useFakeTimers();
    vi.setSystemTime(MONDAY);
    const qs = buildDay(false, { morning: ['wake', 'water', 'teeth_am'], evening: ['dinner', 'pyjama'] });
    expect(main(qs, 'morning')).toEqual(['s_wake', 's_water', 's_teeth_am']);
    expect(main(qs, 'bedtime')).toEqual(['s_dinner', 's_pyjama']);
    vi.useRealTimers();
  });

  it('uses the same kinds for the holiday list', () => {
    vi.useFakeTimers();
    vi.setSystemTime(MONDAY);
    const qs = buildDay(true, { morning: ['wake', 'dress', 'packcheck'], evening: ['cuddle'] });
    // v_ has no school bag, so packcheck simply finds nothing
    expect(main(qs, 'morning')).toEqual(['v_wake', 'v_dress']);
    expect(main(qs, 'bedtime')).toEqual(['v_cuddle']);
    expect(qs.find(q => q.id === 'v_outside')).toBeDefined();
    vi.useRealTimers();
  });

  it('holiday default: the default kinds that exist in the holiday list', () => {
    vi.useFakeTimers();
    vi.setSystemTime(MONDAY);
    const qs = buildDay(true);
    expect(main(qs, 'morning')).toEqual(['v_wake', 'v_breakfast', 'v_teeth_am', 'v_dress']);
    expect(main(qs, 'bedtime')).toEqual(['v_teeth_pm', 'v_wash_pm', 'v_pyjama', 'v_cuddle']);
    vi.useRealTimers();
  });

  it('drops the school bag on a weekend even when it is in the routine', () => {
    vi.useFakeTimers();
    vi.setSystemTime(SATURDAY);
    const qs = buildDay(false);
    expect(main(qs, 'morning')).toEqual(['s_wake', 's_breakfast', 's_teeth_am', 's_dress']);
    vi.useRealTimers();
  });

  it('ignores unknown kinds and a broken routine value', () => {
    vi.useFakeTimers();
    vi.setSystemTime(MONDAY);
    const odd = buildDay(false, { morning: ['wake', 'fly', 42], evening: 'nope' });
    expect(main(odd, 'morning')).toEqual(['s_wake']);
    // a block that is not a list falls back to the default for that block
    expect(main(odd, 'bedtime')).toEqual(['s_teeth_pm', 's_wash_pm', 's_pyjama', 's_cuddle']);
    const junk = buildDay(false, 'junk');
    expect(main(junk, 'morning').length).toBe(5);
    vi.useRealTimers();
  });
});

describe('getSky', () => {
  it('returns sunrise gradient at 0% progress', () => {
    expect(getSky(0, 10)).toContain('#F97316');
  });

  it('returns day gradient at ~33% progress', () => {
    expect(getSky(4, 10)).toContain('#38BDF8');
  });

  it('returns sunset gradient at ~66% progress', () => {
    expect(getSky(7, 10)).toContain('#C2410C');
  });

  it('returns night gradient at 100% progress', () => {
    expect(getSky(10, 10)).toContain('#0F172A');
  });

  it('returns sunrise gradient when total is 0', () => {
    expect(getSky(0, 0)).toContain('#F97316');
  });
});

describe('getSkyStars', () => {
  it('returns true when all done', () => {
    expect(getSkyStars(10, 10)).toBe(true);
  });

  it('returns false when not all done', () => {
    expect(getSkyStars(9, 10)).toBe(false);
  });

  it('returns false when total is 0', () => {
    expect(getSkyStars(0, 0)).toBe(false);
  });
});

describe('getTimeLabel', () => {
  it('returns Morgen at 0%', () => {
    expect(getTimeLabel(0, 10)).toContain('Morgen');
  });

  it('returns Tag around 33%', () => {
    expect(getTimeLabel(4, 10)).toContain('Tag');
  });

  it('returns Abend around 66%', () => {
    expect(getTimeLabel(7, 10)).toContain('Abend');
  });

  it('returns Nacht at 100%', () => {
    expect(getTimeLabel(10, 10)).toContain('Nacht');
  });

  it('returns Morgen when total is 0', () => {
    expect(getTimeLabel(0, 0)).toContain('Morgen');
  });
});

describe('getMood', () => {
  it('returns excited when all done', () => {
    expect(getMood(true, 1)).toBe('excited');
  });

  it('returns happy when pct > 0.5', () => {
    expect(getMood(false, 0.6)).toBe('happy');
  });

  it('returns neutral when pct > 0', () => {
    expect(getMood(false, 0.3)).toBe('neutral');
  });

  it('returns sleepy at pct 0', () => {
    expect(getMood(false, 0)).toBe('sleepy');
  });
});

describe('getDayName', () => {
  it('returns German day names', () => {
    const validDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    expect(validDays).toContain(getDayName());
  });

  it('returns Montag on a Monday', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 6)); // Monday
    expect(getDayName()).toBe('Montag');
    vi.useRealTimers();
  });
});
