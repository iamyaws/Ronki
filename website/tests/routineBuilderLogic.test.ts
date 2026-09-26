import { describe, it, expect } from 'vitest';
import {
  APP_KIND_LABELS,
  APP_MORNING_KINDS,
  DEFAULT_LEAVE,
  LEAVE_TIMES,
  MAX_STEPS,
  MORNING_STEPS,
  OWN_STEP_MAX,
  OWN_STEP_MINUTES,
  SHARE_TEXT,
  addOwnStep,
  addStep,
  appKindPicture,
  appKindsFor,
  cardLink,
  cleanAppKinds,
  cleanOwnText,
  clockLabel,
  decodePlan,
  defaultMinutes,
  defaultPlan,
  encodePlan,
  leaveNote,
  moveStep,
  removeStep,
  setLeave,
  setMinutes,
  setOwnText,
  setTimes,
  sheetDescription,
  sheetSteps,
  startTimes,
  type RoutinePlan,
  type StepCode,
  printedTimes,
} from '../src/lib/routine-builder';
import taskKindsSource from '../../src/data/taskKinds.ts?raw';

// File names of the drawn task pictures that ship with the site.
const TASK_ART = new Set(
  Object.keys(import.meta.glob('../public/art/bilderbuch/tasks/*.webp')).map((path) =>
    path.split('/').pop(),
  ),
);

function withSteps(codes: StepCode[]): RoutinePlan {
  return { ...defaultPlan(), steps: [...codes], minutes: codes.map(defaultMinutes) };
}

/** Six steps, times on, a 20-character own step: the heaviest sheet there is. */
function fullPlan(): RoutinePlan {
  let plan = withSteps(['a', 'k', 'z', 'd', 'f']);
  plan = addOwnStep(plan, 'Hausaufgabenkontroll');
  plan = setTimes(plan, true);
  plan = setLeave(plan, '07:40');
  return setMinutes(plan, 4, 20);
}

describe('Morning catalogue', () => {
  it('has the fourteen steps with label, hint, picture and minutes', () => {
    expect(MORNING_STEPS.map((s) => [s.code, s.label, s.img, s.minutes, s.app ?? null])).toEqual([
      ['a', 'Aufstehen', 'wake.webp', 5, 'wake'],
      ['k', 'Klo', 'toilet.webp', 3, null],
      ['w', 'Waschen', 'wash.webp', 3, 'wash'],
      ['z', 'Zähne putzen', 'toothbrush.webp', 3, 'teeth_am'],
      ['d', 'Anziehen', 'shirt.webp', 10, 'dress'],
      ['h', 'Haare kämmen', 'hairbrush.webp', 2, null],
      ['b', 'Brille aufsetzen', 'glasses.webp', 1, null],
      ['e', 'Bett machen', 'bed.webp', 2, null],
      ['f', 'Frühstücken', 'plate.webp', 15, 'breakfast'],
      ['t', 'Wasser trinken', 'water.webp', 1, 'water'],
      ['n', 'Tier füttern', 'pet-bowl.webp', 3, null],
      ['s', 'Schuhe anziehen', 'sneakers.webp', 3, null],
      ['j', 'Jacke anziehen', 'rain-jacket.webp', 2, null],
      ['p', 'Tasche packen', 'bag.webp', 5, 'packcheck'],
    ]);
    for (const step of MORNING_STEPS) expect(step.hint.length).toBeGreaterThan(0);
  });

  it('only points to pictures that ship with the site', () => {
    for (const step of MORNING_STEPS) expect(TASK_ART.has(step.img), step.img).toBe(true);
    for (const kind of APP_MORNING_KINDS) expect(TASK_ART.has(appKindPicture(kind)), kind).toBe(true);
  });

  it('gives every step a unique one-letter code, and x stays free for the own step', () => {
    const codes = MORNING_STEPS.map((s) => s.code);
    for (const code of codes) expect(code).toMatch(/^[a-z]$/);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).not.toContain('x');
  });

  it('writes no em-dash, no streak and no pressure into any line', () => {
    const texts = [...MORNING_STEPS.flatMap((s) => [s.label, s.hint]), SHARE_TEXT];
    for (const text of texts) {
      expect(text).not.toContain(String.fromCharCode(0x2014));
      expect(text).not.toMatch(/streak|punkte|belohn|schnell|sofort/i);
    }
  });
});

describe('Default plan', () => {
  it('is the four steps the page always had, times off', () => {
    const plan = defaultPlan();
    expect(plan.steps).toEqual(['z', 'd', 'f', 'p']);
    expect(plan.times).toBe(false);
    expect(plan.leave).toBe('07:30');
    expect(plan.minutes).toEqual([3, 10, 15, 5]);
    expect(plan.own).toBe('');
  });

  it('holds no personal field at all', () => {
    expect(Object.keys(defaultPlan()).sort()).toEqual(['leave', 'minutes', 'own', 'steps', 'times']);
  });

  it('draws the same four steps, hints and line as the page always did', () => {
    const plan = defaultPlan();
    expect(sheetSteps(plan)).toEqual([
      { img: 'toothbrush.webp', label: 'Zähne putzen', hint: 'Oben, unten, außen, innen.', time: undefined },
      { img: 'shirt.webp', label: 'Anziehen', hint: 'Wetter angucken, dann Sachen raussuchen.', time: undefined },
      { img: 'plate.webp', label: 'Frühstücken', hint: 'Am Tisch, in Ruhe.', time: undefined },
      { img: 'bag.webp', label: 'Tasche packen', hint: 'Brotdose, Trinken, Hausaufgaben.', time: undefined },
    ]);
    expect(sheetDescription(plan)).toBe(
      'Vier Schritte bis zur Tasche. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist.',
    );
    expect(leaveNote(plan)).toBeUndefined();
  });

  it('gives an empty link and reads an empty link as the default', () => {
    expect(encodePlan(defaultPlan())).toBe('');
    expect(decodePlan('')).toEqual(defaultPlan());
    expect(decodePlan('?')).toEqual(defaultPlan());
  });
});

describe('Editing the plan', () => {
  it('adds a step in its usual morning spot with its default minutes, once', () => {
    let plan = addStep(defaultPlan(), 'a');
    expect(plan.steps).toEqual(['a', 'z', 'd', 'f', 'p']);
    expect(plan.minutes).toEqual([5, 3, 10, 15, 5]);
    expect(addStep(plan, 'a')).toBe(plan);
    // Schuhe go after Frühstücken, before the school bag. In an order the parent
    // changed, a new step goes before the first step that usually comes later.
    expect(addStep(defaultPlan(), 's').steps).toEqual(['z', 'd', 'f', 's', 'p']);
    expect(addStep(withSteps(['p', 'z']), 'd').steps).toEqual(['d', 'p', 'z']);
    expect(addStep(withSteps(['f']), 'j').steps).toEqual(['f', 'j']);
  });

  it('stops at six steps', () => {
    let plan = defaultPlan();
    plan = addStep(plan, 'a');
    plan = addStep(plan, 'w');
    expect(plan.steps).toHaveLength(MAX_STEPS);
    expect(addStep(plan, 'k')).toBe(plan);
    expect(addOwnStep(plan, 'Medizin nehmen')).toBe(plan);
  });

  it('moves a step with its minutes and never past either end', () => {
    let plan = setMinutes(defaultPlan(), 0, 7);
    plan = moveStep(plan, 0, 1);
    expect(plan.steps).toEqual(['d', 'z', 'f', 'p']);
    expect(plan.minutes).toEqual([10, 7, 15, 5]);
    expect(moveStep(plan, 0, -1)).toBe(plan);
    expect(moveStep(plan, 3, 1)).toBe(plan);
  });

  it('removes steps but keeps the last one', () => {
    let plan = defaultPlan();
    plan = removeStep(plan, 1);
    expect(plan.steps).toEqual(['z', 'f', 'p']);
    expect(plan.minutes).toEqual([3, 15, 5]);
    plan = removeStep(removeStep(plan, 0), 0);
    expect(plan.steps).toEqual(['p']);
    expect(removeStep(plan, 0)).toBe(plan);
  });

  it('adds the own step only with text, and drops its text when it is removed', () => {
    expect(addOwnStep(defaultPlan(), '   ')).toEqual(defaultPlan());
    let plan = addOwnStep(defaultPlan(), '  Medizin   nehmen ');
    // The own step goes in before the school bag.
    expect(plan.steps).toEqual(['z', 'd', 'f', 'x', 'p']);
    expect(plan.own).toBe('Medizin nehmen');
    expect(plan.minutes[3]).toBe(OWN_STEP_MINUTES);
    plan = setOwnText(plan, 'Vitamin D');
    expect(plan.own).toBe('Vitamin D');
    plan = removeStep(plan, 3);
    expect(plan.own).toBe('');
    // Without the step there is nowhere for the text to go.
    expect(setOwnText(plan, 'Kuchen')).toBe(plan);
  });

  it('keeps minutes between 1 and 30 and the leave time on the list', () => {
    expect(setMinutes(defaultPlan(), 0, 0).minutes[0]).toBe(1);
    expect(setMinutes(defaultPlan(), 0, 99).minutes[0]).toBe(30);
    expect(setLeave(defaultPlan(), '08:30').leave).toBe('08:30');
    expect(setLeave(defaultPlan(), '09:00').leave).toBe(DEFAULT_LEAVE);
    expect(setLeave(defaultPlan(), '07:33').leave).toBe(DEFAULT_LEAVE);
  });

  it('offers leave times from 6:30 to 8:30 in five-minute steps', () => {
    expect(LEAVE_TIMES[0]).toBe('06:30');
    expect(LEAVE_TIMES.at(-1)).toBe('08:30');
    expect(LEAVE_TIMES).toHaveLength(25);
    expect(LEAVE_TIMES).toContain('07:40');
  });
});

describe('Own step', () => {
  it('is at most 24 characters, cleaned like a packplan free item', () => {
    expect(OWN_STEP_MAX).toBe(24);
    expect(cleanOwnText('  Medizin \n nehmen  ')).toBe('Medizin nehmen');
    // Long German words fit: 21 characters.
    expect(cleanOwnText('Hausaufgabenkontrolle')).toBe('Hausaufgabenkontrolle');
    expect(cleanOwnText('Hausaufgabenkontrolle machen')).toBe('Hausaufgabenkontrolle ma');
    expect(cleanOwnText('12345678901234567890123 x')).toBe('12345678901234567890123');
    expect(Array.from(cleanOwnText(`${'a'.repeat(23)}🎒🎒`))).toHaveLength(24);
  });

  it('gets a picture for a word the site knows, otherwise a box to draw in', () => {
    const known = sheetSteps(addOwnStep(withSteps(['z']), 'Kuscheltier suchen'));
    expect(known.at(-1)).toEqual({ img: 'teddy.webp', label: 'Kuscheltier suchen', time: undefined });
    const unknown = sheetSteps(addOwnStep(withSteps(['z']), 'Medizin nehmen'));
    expect(unknown.at(-1)).toEqual({ draw: true, label: 'Medizin nehmen', time: undefined });
  });
});

describe('Clock times', () => {
  it('counts back from the leave time: the last step ends when you leave', () => {
    expect(startTimes('07:40', [3, 10, 15, 5])).toEqual(['07:07', '07:10', '07:20', '07:35']);
    expect(startTimes('06:30', [30, 30, 30, 30, 30, 30])[0]).toBe('03:30');
  });

  it('writes times the way the sheet prints them', () => {
    expect(clockLabel('07:05')).toBe('7:05');
    expect(clockLabel('08:30')).toBe('8:30');
    expect(clockLabel('10:00')).toBe('10:00');
  });

  it('puts the times on the sheet and the leave time in the done band only when times are on', () => {
    let plan = setLeave(setTimes(defaultPlan(), true), '07:40');
    // Printed rounded down to five minutes (the exact starts are 7:07, 7:10, 7:20, 7:35).
    expect(sheetSteps(plan).map((s) => s.time)).toEqual(['7:05', '7:10', '7:20', '7:35']);
    expect(leaveNote(plan)).toBe('Für heute fertig. Los um 7:40 Uhr.');
    plan = setTimes(plan, false);
    expect(sheetSteps(plan).map((s) => s.time)).toEqual([undefined, undefined, undefined, undefined]);
    expect(leaveNote(plan)).toBeUndefined();
  });

  it('counts the steps in the line under the title', () => {
    expect(sheetDescription(withSteps(['a', 'z']))).toBe(
      'Zwei Schritte. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist.',
    );
    expect(sheetDescription(fullPlan())).toMatch(/^Sechs Schritte\. /);
    expect(sheetDescription(withSteps(['a', 'z', 'd', 'f', 'p']))).toMatch(/^Fünf Schritte bis zur Tasche\. /);
    expect(sheetDescription(withSteps(['p']))).toMatch(/^Ein Schritt bis zur Tasche\. /);
  });
});

describe('Link', () => {
  it('writes short keys only for what differs from the default', () => {
    expect(encodePlan(addStep(defaultPlan(), 'a'))).toBe('s=azdfp');
    expect(encodePlan(setTimes(defaultPlan(), true))).toBe('los=0730');
    expect(encodePlan(setMinutes(setTimes(defaultPlan(), true), 1, 12))).toBe('los=0730&m=3.12.15.5');
    // Minutes only travel while times are on.
    expect(encodePlan(setMinutes(defaultPlan(), 1, 12))).toBe('');
    expect(encodePlan(fullPlan())).toBe('s=akzdfx&e=Hausaufgabenkontroll&los=0740&m=5.3.3.10.20.5');
  });

  it('round-trips plans exactly, with umlauts and spaces in the own step', () => {
    const plans = [
      fullPlan(),
      addOwnStep(withSteps(['t', 'h']), 'Zöpfe flechten & los'),
      moveStep(moveStep(defaultPlan(), 3, -1), 0, 1),
      setLeave(setTimes(withSteps(['n', 'j', 's']), true), '06:30'),
    ];
    for (const plan of plans) {
      const link = encodePlan(plan);
      expect(decodePlan(link)).toEqual(plan);
      expect(decodePlan(`?${link}`)).toEqual(plan);
      expect(encodePlan(decodePlan(link))).toBe(link);
    }
    expect(encodePlan(fullPlan()).length).toBeLessThan(120);
  });

  it('drops unknown and duplicate codes and cuts after six', () => {
    expect(decodePlan('s=zQzd9f!pp').steps).toEqual(['z', 'd', 'f', 'p']);
    expect(decodePlan('s=akwzdhbef').steps).toEqual(['a', 'k', 'w', 'z', 'd', 'h']);
    expect(decodePlan('s=').steps).toEqual(['z', 'd', 'f', 'p']);
    expect(decodePlan('s=%3C%3E%22').steps).toEqual(['z', 'd', 'f', 'p']);
  });

  it('reads the own step only when x is in the steps, and caps it', () => {
    expect(decodePlan('e=Kuchen').own).toBe('');
    const plan = decodePlan(`s=zx&e=${encodeURIComponent('  Sehr langer eigener Schritt ')}`);
    expect(plan.steps).toEqual(['z', 'x']);
    expect(plan.own).toBe('Sehr langer eigener Schr');
    expect(plan.own.length).toBeLessThanOrEqual(OWN_STEP_MAX);
  });

  it('ignores a bad leave time or bad minutes and falls back to the defaults', () => {
    for (const los of ['0900', '0733', '730', 'abcd', '07:30', '']) {
      const plan = decodePlan(`los=${los}&m=1.1.1.1`);
      expect(plan.times, los).toBe(false);
      expect(plan.leave).toBe('07:30');
      expect(plan.minutes).toEqual([3, 10, 15, 5]);
    }
    for (const m of ['1.2.3', '1.2.3.4.5', '0.10.15.5', '31.10.15.5', 'a.b.c.d', '3.10.15.5.']) {
      const plan = decodePlan(`los=0745&m=${m}`);
      expect(plan.times, m).toBe(true);
      expect(plan.leave).toBe('07:45');
      expect(plan.minutes).toEqual([3, 10, 15, 5]);
    }
    expect(decodePlan('los=0745&m=4.11.16.6').minutes).toEqual([4, 11, 16, 6]);
  });

  it('never takes a name, a class or a school from a link', () => {
    const plan = decodePlan('s=zd&name=Lea&schule=Grundschule+Nord&klasse=1b&xx=1');
    expect(Object.keys(plan).sort()).toEqual(['leave', 'minutes', 'own', 'steps', 'times']);
    expect(JSON.stringify(plan)).not.toMatch(/Lea|Grundschule|1b/);
  });

  it('never writes a key outside the plan', () => {
    const keys = [...new URLSearchParams(encodePlan(fullPlan())).keys()];
    for (const key of keys) expect(['s', 'e', 'los', 'm']).toContain(key);
  });
});

describe('Ronki app', () => {
  it('knows the same morning kinds as the app (ROUTINE_CHOICES.morning)', () => {
    const block = /ROUTINE_CHOICES[^=]*=\s*\{\s*morning:\s*\[([^\]]*)\]/.exec(taskKindsSource);
    expect(block, 'ROUTINE_CHOICES.morning not found in src/data/taskKinds.ts').not.toBeNull();
    const appKinds = [...block![1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
    expect(appKinds).toEqual([...APP_MORNING_KINDS]);
  });

  it('has the German app label for every kind', () => {
    expect(APP_MORNING_KINDS.map((kind) => APP_KIND_LABELS[kind])).toEqual([
      'Aufstehen',
      'Wasser trinken',
      'Waschen',
      'Frühstück',
      'Zähne putzen',
      'Anziehen',
      'Schultasche',
    ]);
    // Same labels as the app's TASK_LABEL.
    for (const kind of APP_MORNING_KINDS) {
      expect(taskKindsSource).toContain(`${kind}: '${APP_KIND_LABELS[kind]}'`);
    }
  });

  it('carries the app kinds of the chosen steps in sheet order, never the own step', () => {
    const plan = addOwnStep(withSteps(['k', 'z', 'a', 'h', 'p']), 'Medizin nehmen');
    expect(appKindsFor(plan)).toEqual(['teeth_am', 'wake', 'packcheck']);
    expect(cardLink(plan)).toBe('/profil-erstellen?morgen=teeth_am,wake,packcheck');
    expect(cardLink(defaultPlan())).toBe('/profil-erstellen?morgen=teeth_am,dress,breakfast,packcheck');
    expect(cardLink(withSteps(['k', 'h']))).toBeNull();
  });

  it('keeps only kinds the app knows, once each, in the given order', () => {
    expect(cleanAppKinds('dress,teeth_am,dress,nope,pyjama, wake ,')).toEqual(['dress', 'teeth_am', 'wake']);
    expect(cleanAppKinds(['packcheck', 7, 'water'])).toEqual(['packcheck', 'water']);
    expect(cleanAppKinds('')).toEqual([]);
    expect(cleanAppKinds(null)).toEqual([]);
  });
});

describe('Printed times and the card link, after review', () => {
  it('prints a rounded time only where it changes from the row above', () => {
    // Exact starts 7:24, 7:27, 7:28, 7:30: rounded 7:20, 7:25, 7:25, 7:30.
    const plan = setMinutes(setMinutes(setMinutes(setLeave(setTimes(withSteps(['z', 't', 'b', 'p']), true), '07:35'), 0, 3), 1, 1), 2, 2);
    expect(printedTimes(plan)).toEqual(['7:20', '7:25', undefined, '7:30']);
  });

  it('gives no card link when the school bag is the only app step', () => {
    expect(cardLink(withSteps(['k', 's', 'p']))).toBeNull();
    expect(cardLink(withSteps(['k', 'z', 'p']))).toBe('/profil-erstellen?morgen=teeth_am,packcheck');
  });
});
