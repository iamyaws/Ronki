import { describe, expect, it } from 'vitest';
import {
  CHILDREN,
  DEFAULT_LIGHTS_OUT,
  DEFAULT_STEPS,
  KIT,
  LIGHTS_OUT_ALT_HINT,
  LISTEN_STEP,
  NEEDS_PICTURE,
  SHARE_TEXT,
  STEPS,
  addOwnStep,
  addStep,
  cardSteps,
  checkClash,
  decodePlan,
  defaultPlan,
  encodePlan,
  fits,
  lightsOutLine,
  moveStep,
  overviewRows,
  removeStep,
  setAdults,
  setLightsOut,
  setOwn,
  setStepMinutes,
  sharedSteps,
  timeline,
  toggleNeeds,
  toggleTogether,
  type ChildId,
  type TwoChildPlan,
} from '../src/lib/abend-zwei-kinder';
import { EVENING_STEPS } from '../src/lib/routine-builder/evening';

// File names of the drawn task pictures that ship with the site.
const TASK_ART = new Set(
  Object.keys(import.meta.glob('../public/art/bilderbuch/tasks/*.webp')).map((path) => path.split('/').pop()),
);

const EM_DASH = String.fromCharCode(0x2014);

/** A child with exactly these steps, lights out and "braucht dich" steps. */
function child(
  plan: TwoChildPlan,
  id: ChildId,
  steps: string,
  opts: { aus?: string; needs?: string; own?: string; minutes?: Record<string, number> } = {},
): TwoChildPlan {
  const codes = Array.from(steps);
  let next = plan;
  const prune = () => {
    for (let i = next.children[id].steps.length - 1; i >= 0; i--) {
      if (!codes.includes(next.children[id].steps[i])) next = removeStep(next, id, i);
    }
  };
  prune();
  for (const code of codes) {
    next = code === 'x' ? addOwnStep(next, id, opts.own ?? 'Eigenes') : addStep(next, id, code);
  }
  prune();
  // Put the steps in the order given.
  for (let target = 0; target < codes.length; target++) {
    let at = next.children[id].steps.indexOf(codes[target]);
    while (at > target) next = moveStep(next, id, at--, -1);
  }
  if (opts.own !== undefined && codes.includes('x')) next = setOwn(next, id, opts.own);
  for (const [code, minutes] of Object.entries(opts.minutes ?? {})) {
    next = setStepMinutes(next, id, next.children[id].steps.indexOf(code), minutes);
  }
  if (opts.aus) next = setLightsOut(next, id, opts.aus);
  for (const code of Array.from(opts.needs ?? '')) next = toggleNeeds(next, id, code);
  return next;
}

function starts(plan: TwoChildPlan, id: ChildId) {
  const clock = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  return timeline(plan, id).map((step) => `${step.code} ${clock(step.start)}-${clock(step.end)}`);
}

describe('Catalogue', () => {
  it('is the evening catalogue with the Hörspiel just before "Licht aus"', () => {
    expect(EVENING_STEPS.some((step) => step.code === 'h')).toBe(false);
    const codes = STEPS.map((step) => step.code);
    expect(codes.indexOf('h')).toBe(codes.indexOf('o') - 1);
    expect(STEPS.filter((step) => step.code !== 'h')).toEqual(EVENING_STEPS);
    expect(LISTEN_STEP).toMatchObject({ label: 'Hörspiel', img: 'headphones.webp', minutes: 15 });
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).not.toContain('x');
    expect(KIT.endStep).toBe('o');
  });

  it('has a drawn picture for every step, both children and the "braucht dich" mark', () => {
    for (const step of STEPS) expect(TASK_ART.has(step.img)).toBe(true);
    for (const c of CHILDREN) expect(TASK_ART.has(c.img)).toBe(true);
    expect(TASK_ART.has(NEEDS_PICTURE)).toBe(true);
    expect(CHILDREN.map((c) => c.name)).toEqual(['Stern-Kind', 'Mond-Kind']);
  });

  it('writes the catalogue and the share line without em-dashes', () => {
    for (const step of STEPS) expect(`${step.label} ${step.hint}`).not.toContain(EM_DASH);
    expect(SHARE_TEXT).toBe('Unser Abend mit zwei Kindern: wer wann was braucht.');
  });
});

describe('Default plan', () => {
  it('is one adult and two children with the four evening steps, lights out at 19:30, nothing marked', () => {
    const plan = defaultPlan();
    expect(plan.adults).toBe(1);
    for (const id of ['s', 'm'] as const) {
      expect(plan.children[id]).toEqual({
        steps: ['z', 'w', 'y', 'o'],
        own: '',
        lightsOut: '19:30',
        minutes: [3, 3, 3, 1],
        needs: [],
      });
    }
    expect(plan.together).toEqual([]);
    expect(DEFAULT_STEPS).toEqual(['z', 'w', 'y', 'o']);
    expect(DEFAULT_LIGHTS_OUT).toBe('19:30');
  });

  it('encodes to an empty string and has no clash', () => {
    expect(encodePlan(defaultPlan())).toBe('');
    expect(checkClash(defaultPlan())).toEqual([]);
    expect(decodePlan('')).toEqual(defaultPlan());
  });
});

describe('Steps per child', () => {
  it('places a new step by the catalogue, the Hörspiel right before "Licht aus"', () => {
    let plan = addStep(defaultPlan(), 's', 'h');
    expect(plan.children.s.steps).toEqual(['z', 'w', 'y', 'h', 'o']);
    expect(plan.children.s.minutes).toEqual([3, 3, 3, 15, 1]);
    plan = addStep(plan, 's', 'a');
    expect(plan.children.s.steps).toEqual(['a', 'z', 'w', 'y', 'h', 'o']);
    // Six is the most; the other child is untouched.
    expect(addStep(plan, 's', 'l').children.s.steps).toEqual(['a', 'z', 'w', 'y', 'h', 'o']);
    expect(plan.children.m.steps).toEqual(['z', 'w', 'y', 'o']);
  });

  it('adds the own step before "Licht aus" with the kit rules, and cleans its text', () => {
    let plan = addOwnStep(defaultPlan(), 'm', '  Medizin‮ nehmen​ ');
    expect(plan.children.m.steps).toEqual(['z', 'w', 'y', 'x', 'o']);
    expect(plan.children.m.own).toBe('Medizin nehmen');
    expect(addOwnStep(defaultPlan(), 'm', '   ')).toEqual(defaultPlan());
    plan = setOwn(plan, 'm', 'Ein sehr langer eigener Schritt am Abend');
    expect(Array.from(plan.children.m.own).length).toBeLessThanOrEqual(24);
  });

  it('keeps "braucht dich" with a step when it moves, and drops it when the step goes', () => {
    let plan = toggleNeeds(defaultPlan(), 's', 'z');
    plan = moveStep(plan, 's', 0, 1);
    expect(plan.children.s.steps).toEqual(['w', 'z', 'y', 'o']);
    expect(plan.children.s.needs).toEqual(['z']);
    plan = removeStep(plan, 's', 1);
    expect(plan.children.s.needs).toEqual([]);
  });

  it('keeps needs in catalogue order, whatever the order of tapping', () => {
    let plan = toggleNeeds(defaultPlan(), 's', 'o');
    plan = toggleNeeds(plan, 's', 'z');
    expect(plan.children.s.needs).toEqual(['z', 'o']);
    expect(toggleNeeds(plan, 's', 'z').children.s.needs).toEqual(['o']);
    // A step the child does not have cannot need the adult.
    expect(toggleNeeds(plan, 's', 'l')).toBe(plan);
  });

  it('only takes lights-out times from the list and minutes from 1 to 30', () => {
    expect(setLightsOut(defaultPlan(), 's', '21:30').children.s.lightsOut).toBe('19:30');
    expect(setLightsOut(defaultPlan(), 's', '18:30').children.s.lightsOut).toBe('18:30');
    expect(setStepMinutes(defaultPlan(), 's', 0, 99).children.s.minutes[0]).toBe(30);
    expect(setStepMinutes(defaultPlan(), 's', 0, 0).children.s.minutes[0]).toBe(1);
  });

  it('switches the number of adults between one and two', () => {
    expect(setAdults(defaultPlan(), 2).adults).toBe(2);
    expect(setAdults(setAdults(defaultPlan(), 2), 1).adults).toBe(1);
  });
});

describe('Together', () => {
  it('is offered only for steps both children have, never for an own step', () => {
    let plan = child(defaultPlan(), 's', 'lxo', { own: 'Medizin' });
    plan = child(plan, 'm', 'zlxo', { own: 'Medizin' });
    expect(sharedSteps(plan)).toEqual(['l', 'o']);
    expect(toggleTogether(plan, 'x')).toBe(plan);
    expect(toggleTogether(plan, 'z')).toBe(plan);
  });

  it('marks the step "braucht dich" for both children', () => {
    const plan = toggleTogether(defaultPlan(), 'z');
    expect(plan.together).toEqual(['z']);
    expect(plan.children.s.needs).toEqual(['z']);
    expect(plan.children.m.needs).toEqual(['z']);
    // Off again: the marks stay, only "zusammen" goes.
    const off = toggleTogether(plan, 'z');
    expect(off.together).toEqual([]);
    expect(off.children.s.needs).toEqual(['z']);
  });

  it('ends when either child loses the step or its "braucht dich"', () => {
    const plan = toggleTogether(defaultPlan(), 'z');
    const removed = removeStep(plan, 'm', 0);
    expect(removed.together).toEqual([]);
    expect(removed.children.s.needs).toEqual(['z']);
    const unmarked = toggleNeeds(plan, 's', 'z');
    expect(unmarked.together).toEqual([]);
    expect(unmarked.children.s.needs).toEqual([]);
    expect(unmarked.children.m.needs).toEqual(['z']);
  });
});

describe('Timeline', () => {
  it('counts back from lights out like the evening builder; "Licht aus" last is the moment itself', () => {
    expect(starts(defaultPlan(), 's')).toEqual(['z 19:21-19:24', 'w 19:24-19:27', 'y 19:27-19:30', 'o 19:30-19:31']);
    const plan = child(defaultPlan(), 'm', 'zwy', { aus: '20:00' });
    expect(starts(plan, 'm')).toEqual(['z 19:51-19:54', 'w 19:54-19:57', 'y 19:57-20:00']);
  });

  it('leaves an empty own step out of the timing and counts a filled one', () => {
    let plan = child(defaultPlan(), 's', 'zxo', { own: 'Medizin' });
    plan = setOwn(plan, 's', '');
    expect(plan.children.s.steps).toEqual(['z', 'x', 'o']);
    expect(starts(plan, 's')).toEqual(['z 19:27-19:30', 'o 19:30-19:31']);
    plan = setOwn(plan, 's', 'Medizin');
    expect(starts(plan, 's')).toEqual(['z 19:22-19:25', 'x 19:25-19:30', 'o 19:30-19:31']);
  });

  it('counts "Licht aus" as a normal step when it is not last', () => {
    const plan = child(defaultPlan(), 's', 'zoy');
    expect(starts(plan, 's')).toEqual(['z 19:23-19:26', 'o 19:26-19:27', 'y 19:27-19:30']);
  });
});

describe('Clash check', () => {
  it('names the moment both children need the one adult, with the sheet time and one fix', () => {
    let plan = child(defaultPlan(), 's', 'lo', { needs: 'l' });
    plan = child(plan, 'm', 'zwyo', { needs: 'z' });
    const clashes = checkClash(plan);
    expect(clashes).toHaveLength(1);
    expect(clashes[0].rule).toBe('beide');
    expect(clashes[0].star.code).toBe('l');
    expect(clashes[0].moon.code).toBe('z');
    // Vorlesen 19:20 to 19:30, Zähne from 19:21: the sheet prints 19:20.
    expect(clashes[0].message).toBe(
      'Um 19:20 brauchen dich beide: das Stern-Kind bei „Vorlesen“, das Mond-Kind bei „Zähne putzen“. Verschieb eine Licht-aus-Zeit, ändere die Minuten, oder ein Kind macht in der Zeit etwas ohne dich, etwa ein Hörspiel.',
    );
    expect(fits(plan)).toBe(false);
  });

  it('only counts steps marked "braucht dich" on both sides', () => {
    let plan = child(defaultPlan(), 's', 'lo', { needs: 'l' });
    plan = child(plan, 'm', 'zwyo');
    expect(checkClash(plan)).toEqual([]);
  });

  it('treats one step right after the other as fine (back to back)', () => {
    let plan = child(defaultPlan(), 's', 'lo', { needs: 'l' }); // Vorlesen 19:20 to 19:30
    plan = child(plan, 'm', 'zo', { aus: '19:20', needs: 'z' }); // Zähne 19:17 to 19:20
    expect(checkClash(plan)).toEqual([]);
    // One minute more for the teeth and they touch the story.
    const longer = setStepMinutes(plan, 'm', 0, 4);
    expect(checkClash(longer)).toEqual([]);
    const later = setLightsOut(plan, 'm', '19:25'); // Zähne 19:22 to 19:25
    expect(checkClash(later)).toHaveLength(1);
  });

  it('suggests doing the same step together, and is fine once it is', () => {
    const plan = toggleNeeds(toggleNeeds(defaultPlan(), 's', 'z'), 'm', 'z');
    const [clash] = checkClash(plan);
    expect(clash.message).toBe(
      'Um 19:20 brauchen dich beide bei „Zähne putzen“. Macht es zusammen: Tipp es unter „Was macht ihr zusammen?“ an.',
    );
    expect(checkClash(toggleTogether(plan, 'z'))).toEqual([]);
  });

  it('suggests the same time when the same step overlaps at different times', () => {
    let plan = child(defaultPlan(), 's', 'lo', { needs: 'l' }); // 19:20 to 19:30
    plan = child(plan, 'm', 'lo', { aus: '19:35', needs: 'l' }); // 19:25 to 19:35
    const [clash] = checkClash(plan);
    expect(clash.message).toBe(
      'Um 19:25 brauchen dich beide bei „Vorlesen“. Legt es auf dieselbe Zeit und macht es zusammen, oder verschieb eine Licht-aus-Zeit.',
    );
  });

  it('flags a "zusammen" step at two different times, once, with one adult or two', () => {
    let plan = child(defaultPlan(), 's', 'lo', { aus: '19:20' }); // Vorlesen 19:10
    plan = child(plan, 'm', 'lo'); // Vorlesen 19:20
    plan = toggleTogether(plan, 'l');
    const message =
      '„Vorlesen“ macht ihr zusammen, aber beim Stern-Kind beginnt es um 19:10 und beim Mond-Kind um 19:20. Legt es auf dieselbe Zeit oder nehmt „zusammen“ wieder weg.';
    expect(checkClash(plan).map((c) => [c.rule, c.message])).toEqual([['zusammen', message]]);
    expect(checkClash(setAdults(plan, 2)).map((c) => [c.rule, c.message])).toEqual([['zusammen', message]]);
    // Same time again: nothing left.
    expect(checkClash(setLightsOut(plan, 's', '19:30'))).toEqual([]);
  });

  it('flags a "zusammen" step with the same start but other minutes', () => {
    // Mond: Zähne 19:20 to 19:24, Stern 19:21 to 19:24. The sheet shows 19:20 for both,
    // so the message names the exact minutes.
    const plan = setStepMinutes(toggleTogether(defaultPlan(), 'z'), 'm', 0, 4);
    const two = checkClash(setAdults(plan, 2));
    expect(two).toHaveLength(1);
    expect(two[0].message).toBe(
      '„Zähne putzen“ macht ihr zusammen, aber beim Stern-Kind beginnt es um 19:21 und beim Mond-Kind um 19:20. Legt es auf dieselbe Minute oder nehmt „zusammen“ wieder weg.',
    );
    // Same start, other length.
    let same = child(defaultPlan(), 's', 'lo');
    same = child(same, 'm', 'lzo', { minutes: { l: 7 } });
    same = toggleTogether(same, 'l'); // Stern 19:20 to 19:30, Mond 19:20 to 19:27
    expect(checkClash(same).map((c) => c.message)).toContain(
      '„Vorlesen“ macht ihr zusammen, aber es dauert beim Stern-Kind 10 und beim Mond-Kind 7 Minuten. Stellt dieselben Minuten ein oder nehmt „zusammen“ wieder weg.',
    );
  });

  it('never needs two adults for a "zusammen" step at the same time', () => {
    let plan = child(defaultPlan(), 's', 'zlo');
    plan = child(plan, 'm', 'zlo');
    plan = toggleTogether(toggleTogether(plan, 'z'), 'l');
    expect(checkClash(plan)).toEqual([]);
  });

  it('with two adults, nothing overlaps', () => {
    let plan = child(defaultPlan(), 's', 'lo', { needs: 'lo' });
    plan = child(plan, 'm', 'zwyo', { needs: 'zwyo' });
    expect(checkClash(plan).length).toBeGreaterThan(0);
    expect(checkClash(setAdults(plan, 2))).toEqual([]);
  });

  it('gives "Licht aus" one minute: two at the same time clash, a minute apart they do not', () => {
    const both = toggleNeeds(toggleNeeds(defaultPlan(), 's', 'o'), 'm', 'o');
    expect(checkClash(both).map((c) => c.message)).toEqual([
      'Um 19:30 brauchen dich beide bei „Licht aus“. Macht es zusammen: Tipp es unter „Was macht ihr zusammen?“ an.',
    ]);
    expect(checkClash(toggleTogether(both, 'o'))).toEqual([]);
    expect(checkClash(setLightsOut(both, 'm', '19:35'))).toEqual([]);
    // "Licht aus" in the middle of the other child's story.
    let plan = child(defaultPlan(), 's', 'zo', { needs: 'o' });
    plan = child(plan, 'm', 'lo', { aus: '19:35', needs: 'l' }); // Vorlesen 19:25 to 19:35
    expect(checkClash(plan).map((c) => c.message)).toEqual([
      'Um 19:30 brauchen dich beide: das Stern-Kind bei „Licht aus“, das Mond-Kind bei „Vorlesen“. Verschieb eine Licht-aus-Zeit, ändere die Minuten, oder ein Kind macht in der Zeit etwas ohne dich, etwa ein Hörspiel.',
    ]);
  });

  it('checks different lights-out times against each other', () => {
    let plan = child(defaultPlan(), 's', 'lo', { aus: '19:00', needs: 'l' }); // 18:50 to 19:00
    plan = child(plan, 'm', 'lo', { aus: '19:30', needs: 'l' }); // 19:20 to 19:30
    expect(checkClash(plan)).toEqual([]);
    expect(checkClash(setLightsOut(plan, 's', '19:25'))).toHaveLength(1);
  });

  it('ignores an empty own step and checks a filled one', () => {
    let plan = child(defaultPlan(), 's', 'xo', { own: 'Medizin', needs: 'x' }); // Medizin 19:25 to 19:30
    plan = child(plan, 'm', 'zwyo', { needs: 'y' }); // Pyjama 19:27 to 19:30
    expect(checkClash(plan).map((c) => c.message)).toEqual([
      'Um 19:25 brauchen dich beide: das Stern-Kind bei „Medizin“, das Mond-Kind bei „Pyjama an“. Verschieb eine Licht-aus-Zeit, ändere die Minuten, oder ein Kind macht in der Zeit etwas ohne dich, etwa ein Hörspiel.',
    ]);
    expect(checkClash(setOwn(plan, 's', ''))).toEqual([]);
  });

  it('gives one message per overlapping pair, sorted by time', () => {
    let plan = child(defaultPlan(), 's', 'zwyo', { needs: 'zwy' });
    plan = child(plan, 'm', 'lo', { needs: 'l' }); // Vorlesen 19:20 to 19:30 against all three
    const clashes = checkClash(plan);
    expect(clashes.map((c) => `${c.star.code}-${c.moon.code}`)).toEqual(['z-l', 'w-l', 'y-l']);
    expect(clashes.map((c) => c.at)).toEqual([...clashes.map((c) => c.at)].sort((a, b) => a - b));
    expect(new Set(clashes.map((c) => c.message)).size).toBe(3);
    for (const clash of clashes) expect(clash.message).not.toContain(EM_DASH);
  });
});

describe('Sheet data', () => {
  it('prints the card steps like the evening sheet, with the lights-out band', () => {
    const plan = child(defaultPlan(), 's', 'azlo', { aus: '20:00' });
    const steps = cardSteps(plan, 's');
    expect(steps.map((s) => [s.code, s.time])).toEqual([
      ['a', '19:25'],
      ['z', '19:45'],
      ['l', '19:50'],
      ['o', '20:00'],
    ]);
    expect(lightsOutLine(plan, 's')).toBe('Licht aus um 20:00 Uhr.');
  });

  it('says good night at "Licht aus" after a story or a Hörspiel', () => {
    const plain = cardSteps(defaultPlan(), 's').find((s) => s.code === 'o')!;
    expect(plain.hint).toBe('Eine Geschichte, dann schlafen.');
    for (const story of ['l', 'h']) {
      const plan = addStep(defaultPlan(), 'm', story);
      expect(cardSteps(plan, 'm').find((s) => s.code === 'o')!.hint).toBe(LIGHTS_OUT_ALT_HINT);
      expect(cardSteps(plan, 's').find((s) => s.code === 'o')!.hint).toBe('Eine Geschichte, dann schlafen.');
    }
    expect(LIGHTS_OUT_ALT_HINT).toBe('Augen zu, gute Nacht.');
    expect(cardSteps(addStep(defaultPlan(), 's', 'h'), 's').find((s) => s.code === 'h')!.hint).toBe(
      'Zuhören im Bett, bis Licht aus.',
    );
  });

  it('keeps an empty own step off the card and draws a box for an unknown one', () => {
    let plan = child(defaultPlan(), 's', 'xo', { own: 'Medizin' });
    expect(cardSteps(plan, 's').map((s) => [s.label, s.img])).toEqual([
      ['Medizin', null],
      ['Licht aus', 'light-off.webp'],
    ]);
    plan = setOwn(plan, 's', '');
    expect(cardSteps(plan, 's').map((s) => s.code)).toEqual(['o']);
  });

  it('lays out the overview by the sheet time, a "zusammen" step once across both columns', () => {
    const rows = overviewRows(defaultPlan());
    expect(rows.map((r) => (r.kind === 'paar' ? [r.time, r.star.map((i) => i.code).join(''), r.moon.map((i) => i.code).join('')] : r))).toEqual([
      ['19:20', 'zw', 'zw'],
      ['19:25', 'y', 'y'],
      ['19:30', 'o', 'o'],
    ]);
    const together = overviewRows(toggleTogether(defaultPlan(), 'z'));
    expect(together[0]).toMatchObject({ kind: 'zusammen', time: '19:20', item: { code: 'z', needs: true } });
    // Printed only where it changes: the rest of the five minutes has no time of its own.
    expect(together[1]).toMatchObject({ kind: 'paar', time: undefined });
    expect(together.filter((r) => r.kind === 'zusammen')).toHaveLength(1);
  });

  it('puts a "zusammen" step at two times in each column, not across', () => {
    let plan = child(defaultPlan(), 's', 'lo', { aus: '19:20' });
    plan = toggleTogether(child(plan, 'm', 'lo'), 'l');
    expect(overviewRows(plan).some((r) => r.kind === 'zusammen')).toBe(false);
  });

  it('lists steps of different lights-out times in the order of the evening', () => {
    let plan = child(defaultPlan(), 's', 'lo', { aus: '19:00' });
    plan = child(plan, 'm', 'zo', { aus: '20:00' });
    const rows = overviewRows(plan).map((r) => (r.kind === 'paar' ? `${r.time} ${r.star.map((i) => i.code).join('')}|${r.moon.map((i) => i.code).join('')}` : ''));
    expect(rows).toEqual(['18:50 l|', '19:00 o|', '19:55 |z', '20:00 |o']);
  });
});

describe('Link', () => {
  function full(): TwoChildPlan {
    let plan = setAdults(defaultPlan(), 2);
    plan = child(plan, 's', 'azxlho', { own: 'Medizin nehmen', aus: '19:00', needs: 'zlo', minutes: { a: 25, l: 12 } });
    plan = child(plan, 'm', 'azwyo', { aus: '19:45', needs: 'wy' });
    return toggleTogether(plan, 'z');
  }

  it('writes only what differs, short and readable', () => {
    expect(encodePlan(setAdults(defaultPlan(), 2))).toBe('a=2');
    expect(encodePlan(toggleNeeds(defaultPlan(), 's', 'z'))).toBe('sb=z');
    expect(encodePlan(toggleTogether(defaultPlan(), 'z'))).toBe('sb=z&mb=z&z=z');
    expect(encodePlan(setLightsOut(defaultPlan(), 'm', '20:15'))).toBe('ma=2015');
    expect(encodePlan(full())).toBe(
      'a=2&s=azxlho&se=Medizin+nehmen&sa=1900&sm=25.3.5.12.15.1&sb=zlo&m=azwyo&ma=1945&mb=zwy&z=z',
    );
  });

  it('reads every plan back exactly', () => {
    const plans = [
      defaultPlan(),
      full(),
      setAdults(defaultPlan(), 2),
      toggleTogether(toggleNeeds(defaultPlan(), 'm', 'o'), 'o'),
      setOwn(child(defaultPlan(), 'm', 'xo', { own: 'Zahnspange' }), 'm', ''),
      child(defaultPlan(), 's', 'yzo', { minutes: { y: 30, z: 1 } }),
    ];
    for (const plan of plans) {
      expect(decodePlan(encodePlan(plan))).toEqual(plan);
      expect(decodePlan(`?${encodePlan(plan)}`)).toEqual(plan);
    }
  });

  it('never throws on hostile input and falls back per field', () => {
    const hostile = [
      '%',
      '%E0%A4%A',
      '?s=&m=&a=&z=',
      '?a=3&a=2',
      '?s=qqq%00%01',
      '?s=' + 'z'.repeat(200_000),
      '?se=' + 'A'.repeat(200_000),
      '?s=zx&se=' + encodeURIComponent('‮Medizin​⁦ nehmen'),
      '?sa=2500&ma=abcd',
      '?sm=0.99.x.3&mm=1.2',
      '?sb=qqqzzzz&mb=x&z=xq',
      '?constructor=1&__proto__=2',
    ];
    for (const search of hostile) expect(() => decodePlan(search)).not.toThrow();
    expect(decodePlan(undefined as unknown as string)).toEqual(defaultPlan());
    expect(decodePlan('?a=3').adults).toBe(1);
    expect(decodePlan('?s=qqq').children.s.steps).toEqual(['z', 'w', 'y', 'o']);
    // Unknown codes and doubles go; at most six steps.
    expect(decodePlan('?s=zzwwqloyhae').children.s.steps).toEqual(['z', 'w', 'l', 'o', 'y', 'h']);
    // Invisible and bidi characters never reach the sheet.
    expect(decodePlan('?s=xo&se=' + encodeURIComponent('‮Medizin​⁦ nehmen')).children.s.own).toBe(
      'Medizin nehmen',
    );
    expect(Array.from(decodePlan('?s=xo&se=' + 'A'.repeat(200_000)).children.s.own).length).toBe(24);
    // Own text without the own step is dropped.
    expect(decodePlan('?se=Medizin').children.s.own).toBe('');
    // A bad time or minutes fall back for that field only.
    const times = decodePlan('?sa=2500&ma=2015&sm=0.99.x.3');
    expect(times.children.s.lightsOut).toBe('19:30');
    expect(times.children.m.lightsOut).toBe('20:15');
    expect(times.children.s.minutes).toEqual([3, 3, 3, 3]);
    expect(decodePlan('?sm=1.2').children.s.minutes).toEqual([3, 3, 3, 1]);
    expect(decodePlan('?sa=1933').children.s.lightsOut).toBe('19:30');
    // Needs only for the child's own steps; together only for shared steps, never the own step.
    const marks = decodePlan('?s=xzo&se=Tee&sb=qzxl&m=zo&mb=o&z=xzl');
    expect(marks.children.s.needs).toEqual(['z', 'x']);
    expect(marks.together).toEqual(['z']);
    expect(marks.children.m.needs).toEqual(['z', 'o']);
  });
});
