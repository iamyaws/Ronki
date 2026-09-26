import { describe, expect, it } from 'vitest';
import {
  AFTERNOON_TIMES,
  APPOINTMENT_KINDS,
  ARRIVE_MINUTES,
  DINNER_TIMES,
  END_TIMES,
  HOMEWORK_MINUTES,
  HOMEWORK_OPTIONS,
  KNACKS,
  OWN_TEXT_MAX,
  SHARE_TEXT,
  WEEKDAYS,
  appointmentEndTimes,
  appointmentPicture,
  checkFit,
  decodePlan,
  defaultPlan,
  dinnerLine,
  encodePlan,
  fits,
  knackSentence,
  setAppointmentFrom,
  setAppointmentKind,
  setAppointmentOwn,
  setAppointmentTo,
  setArrive,
  setDinner,
  setEnd,
  setEndForAll,
  setHomeworkAt,
  setHomeworkMinutes,
  setHomeworkWhere,
  setKnack,
  sheetDay,
  sheetWeek,
  type AfternoonPlan,
  type AppointmentKindId,
  type WeekdayId,
  knackPicture,
  fitNotes,
} from '../src/lib/nachmittagsplan';

// File names of the drawn task pictures that ship with the site.
const TASK_ART = new Set(
  Object.keys(import.meta.glob('../public/art/bilderbuch/tasks/*.webp')).map((path) =>
    path.split('/').pop(),
  ),
);

const EM_DASH = String.fromCharCode(0x2014);

/** A day with school end, homework at home and an appointment. */
function day(
  plan: AfternoonPlan,
  id: WeekdayId,
  opts: {
    end?: string;
    at?: string;
    minutes?: number;
    kind?: AppointmentKindId;
    own?: string;
    from?: string;
    to?: string;
  },
): AfternoonPlan {
  let next = plan;
  if (opts.end) next = setEnd(next, id, opts.end);
  if (opts.at || opts.minutes) next = setHomeworkWhere(next, id, 'home');
  if (opts.at) next = setHomeworkAt(next, id, opts.at);
  if (opts.minutes) next = setHomeworkMinutes(next, id, opts.minutes);
  if (opts.kind) next = setAppointmentKind(next, id, opts.kind);
  if (opts.own !== undefined) next = setAppointmentOwn(next, id, opts.own);
  if (opts.from) next = setAppointmentFrom(next, id, opts.from);
  if (opts.to) next = setAppointmentTo(next, id, opts.to);
  return next;
}

/** Five full days, a 24-character own word each, dinner and Knackpunkt set. It fits. */
function worstCasePlan(): AfternoonPlan {
  let plan = defaultPlan();
  for (const { id } of WEEKDAYS) {
    plan = day(plan, id, {
      end: '13:15',
      at: '14:00',
      minutes: 45,
      kind: 'eigen',
      own: 'Schwimmkurs im Hallenbad',
      from: '15:30',
      to: '17:15',
    });
  }
  plan = setArrive(plan, 45);
  plan = setDinner(plan, '18:30');
  return setKnack(plan, 'mistakes');
}

describe('Nachmittagsplan catalogue', () => {
  it('has the five appointment kinds with pictures that ship, and an own word', () => {
    expect(APPOINTMENT_KINDS.map((k) => [k.label, k.img])).toEqual([
      ['Sport', 'sneakers.webp'],
      ['Schwimmen', 'swim-bag.webp'],
      ['Musik', 'recorder.webp'],
      ['Malen', 'paint-box.webp'],
      ['Bücherei', 'book.webp'],
      ['Eigener Termin', null],
    ]);
    for (const kind of APPOINTMENT_KINDS) if (kind.img) expect(TASK_ART.has(kind.img), kind.img).toBe(true);
    for (const img of ['plate.webp', 'water.webp', 'move.webp', 'homework.webp', 'school.webp']) {
      expect(TASK_ART.has(img), img).toBe(true);
    }
  });

  it('has the four places for homework with the words for the sheet', () => {
    expect(HOMEWORK_OPTIONS.map((o) => [o.where, o.label, o.note])).toEqual([
      ['home', 'zu Hause', ''],
      ['ogs', 'in der OGS', 'in der OGS'],
      ['grandparents', 'bei Oma, Opa', 'bei Oma, Opa'],
      ['none', 'heute keine', 'heute keine'],
    ]);
  });

  it('has the four Knackpunkte with their sentences and a picture each', () => {
    expect(KNACKS.map((k) => [k.label, k.sentence, k.img])).toEqual([
      ['Anfangen', 'Jetzt ist Hausaufgabenzeit.', 'homework.webp'],
      ['Fehler', 'Fehler dürfen sein. Wir schauen danach zusammen.', 'eraser.webp'],
      // The pause does not wait until the task is done (Astra NP-06).
      ['Dauer', 'Wir machen eine Pause. Danach schauen wir zusammen weiter.', 'hourglass.webp'],
      ['Lesen üben', 'Du liest, ich höre zu.', 'book.webp'],
    ]);
  });

  it('offers the allowed times in 5-minute steps and suggests nothing', () => {
    expect(END_TIMES[0]).toBe('11:00');
    expect(END_TIMES[END_TIMES.length - 1]).toBe('17:30');
    expect(END_TIMES).toContain('13:15');
    expect(END_TIMES).not.toContain('13:13');
    expect(DINNER_TIMES[0]).toBe('17:00');
    expect(DINNER_TIMES[DINNER_TIMES.length - 1]).toBe('19:30');
    expect(AFTERNOON_TIMES[0]).toBe('11:00');
    expect(AFTERNOON_TIMES[AFTERNOON_TIMES.length - 1]).toBe('20:00');
    expect(HOMEWORK_MINUTES[0]).toBe(5);
    expect(HOMEWORK_MINUTES[HOMEWORK_MINUTES.length - 1]).toBe(90);
    expect(ARRIVE_MINUTES).toEqual([15, 30, 45, 60]);
    expect(OWN_TEXT_MAX).toBe(24);
  });

  it('keeps the share text and uses no em-dash anywhere', () => {
    // The link carries this family's week: the line is for Oma, Opa or the Hort, not a class chat.
    expect(SHARE_TEXT).toBe('Unser Nachmittagsplan für die Woche: wann Schule aus ist, Termine und Hausaufgaben.');
    const words = [
      SHARE_TEXT,
      ...KNACKS.flatMap((k) => [k.label, k.description, k.sentence]),
      ...HOMEWORK_OPTIONS.flatMap((o) => [o.label, o.note]),
      ...APPOINTMENT_KINDS.map((k) => k.label),
    ];
    for (const text of words) {
      expect(text).not.toContain(EM_DASH);
      expect(text).not.toMatch(/streak|punkte|belohn|geschafft/i);
    }
  });
});

describe('Nachmittagsplan defaults', () => {
  it('starts with nothing set: no times, no arrive, no dinner, no Knackpunkt', () => {
    const plan = defaultPlan();
    expect(Object.keys(plan.days)).toEqual(['mo', 'di', 'mi', 'do', 'fr']);
    for (const { id } of WEEKDAYS) {
      expect(plan.days[id]).toEqual({ end: null, homework: null, appointment: null });
    }
    expect(plan.arrive).toBeNull();
    expect(plan.dinner).toBeNull();
    expect(plan.knack).toBeNull();
  });

  it('holds no personal field at all', () => {
    expect(Object.keys(defaultPlan()).sort()).toEqual(['arrive', 'days', 'dinner', 'knack']);
    expect(Object.keys(defaultPlan().days.mo).sort()).toEqual(['appointment', 'end', 'homework']);
  });

  it('gives homework at home no minutes until the parent picks them', () => {
    const plan = setHomeworkWhere(defaultPlan(), 'mo', 'home');
    expect(plan.days.mo.homework).toEqual({ where: 'home', at: null, minutes: null });
    const withTime = setHomeworkAt(plan, 'mo', '15:00');
    expect(withTime.days.mo.homework).toEqual({ where: 'home', at: '15:00', minutes: null });
  });

  it('encodes the untouched plan as an empty string and reads an empty link as the defaults', () => {
    expect(encodePlan(defaultPlan())).toBe('');
    expect(decodePlan('')).toEqual(defaultPlan());
    expect(decodePlan('?')).toEqual(defaultPlan());
  });
});

describe('Nachmittagsplan helpers', () => {
  it('copies one school end to all days', () => {
    const plan = setEndForAll(defaultPlan(), '13:15');
    for (const { id } of WEEKDAYS) expect(plan.days[id].end).toBe('13:15');
    expect(setEndForAll(plan, null).days.fr.end).toBeNull();
  });

  it('ignores times outside the allowed ranges', () => {
    expect(setEnd(defaultPlan(), 'mo', '18:00').days.mo.end).toBeNull();
    expect(setEnd(defaultPlan(), 'mo', '13:13').days.mo.end).toBeNull();
    expect(setDinner(defaultPlan(), '16:00').dinner).toBeNull();
    expect(setHomeworkMinutes(defaultPlan(), 'mo', 95).days.mo.homework).toEqual({
      where: 'home',
      at: null,
      minutes: null,
    });
    expect(setArrive(defaultPlan(), 20 as never).arrive).toBeNull();
  });

  it('keeps an appointment end after its start and clears one that no longer is', () => {
    let plan = day(defaultPlan(), 'di', { kind: 'schwimmen', from: '15:30', to: '16:30' });
    expect(plan.days.di.appointment).toMatchObject({ from: '15:30', to: '16:30' });
    expect(setAppointmentTo(plan, 'di', '15:00').days.di.appointment?.to).toBeNull();
    plan = setAppointmentFrom(plan, 'di', '17:00');
    expect(plan.days.di.appointment).toMatchObject({ from: '17:00', to: null });
    expect(appointmentEndTimes('19:30')).toEqual(['19:35', '19:40', '19:45', '19:50', '19:55', '20:00']);
    expect(appointmentEndTimes(null)).toEqual([]);
  });

  it('keeps times when the kind changes and forgets the own word for a catalogue kind', () => {
    let plan = day(defaultPlan(), 'mi', { kind: 'eigen', own: 'Reiten', from: '15:00', to: '16:00' });
    plan = setAppointmentKind(plan, 'mi', 'musik');
    expect(plan.days.mi.appointment).toEqual({ kind: 'musik', own: '', from: '15:00', to: '16:00' });
    expect(setAppointmentKind(plan, 'mi', null).days.mi.appointment).toBeNull();
  });

  it('cleans and caps the own word', () => {
    const plan = setAppointmentOwn(defaultPlan(), 'mo', '  Logopädie   am\nNachmittag und dann noch mehr ');
    expect(plan.days.mo.appointment?.own).toBe('Logopädie am Nachmittag');
    expect(Array.from(plan.days.mo.appointment!.own).length).toBeLessThanOrEqual(OWN_TEXT_MAX);
  });

  it('gives an own word its picture when the tool knows it, otherwise a box to draw in', () => {
    const known = setAppointmentOwn(defaultPlan(), 'mo', 'Laternenumzug');
    expect(appointmentPicture(known.days.mo.appointment!)).toBe('lantern.webp');
    const unknown = setAppointmentOwn(defaultPlan(), 'mo', 'Ergotherapie');
    expect(appointmentPicture(unknown.days.mo.appointment!)).toBeNull();
  });
});

describe('Nachmittagsplan link', () => {
  it('writes the compact format', () => {
    let plan = day(defaultPlan(), 'mo', { end: '12:15', at: '15:30', minutes: 20, kind: 'sport', from: '16:00', to: '17:00' });
    plan = setHomeworkWhere(plan, 'di', 'ogs');
    plan = setHomeworkWhere(plan, 'mi', 'grandparents');
    plan = setHomeworkWhere(plan, 'do', 'none');
    plan = day(plan, 'fr', { kind: 'eigen', own: 'Oma besuchen', from: '15:00' });
    plan = setArrive(plan, 30);
    plan = setDinner(plan, '18:30');
    plan = setKnack(plan, 'start');
    expect(encodePlan(plan)).toBe(
      'mo=1215.h1530m20.tS1600-1700&di=o&mi=g&do=n&fr=tE1500.Oma+besuchen&ak=30&ab=1830&k=s',
    );
  });

  it('round-trips a normal week and the worst case exactly', () => {
    let plan = day(defaultPlan(), 'mo', { end: '13:15', at: '14:15' });
    plan = day(plan, 'di', { end: '16:00', kind: 'schwimmen', from: '16:30', to: '17:30' });
    plan = setHomeworkWhere(plan, 'di', 'ogs');
    plan = day(plan, 'mi', { end: '12:00', minutes: 30 });
    plan = setArrive(plan, 60);
    plan = setKnack(plan, 'reading');
    expect(decodePlan(encodePlan(plan))).toEqual(plan);
    expect(encodePlan(decodePlan(encodePlan(plan)))).toBe(encodePlan(plan));

    const worst = worstCasePlan();
    const link = encodePlan(worst);
    expect(decodePlan(link)).toEqual(worst);
    expect(decodePlan(`?${link}`)).toEqual(worst);
    expect(link.length).toBeLessThan(400);
  });

  it('round-trips own words with dots, umlauts, ampersands and emoji', () => {
    for (const own of ['Dr. Müller', 'Ergo & Logo', 'Treffen.13 Uhr', 'Reiten 🐴', 'tS1600-1700']) {
      const plan = day(defaultPlan(), 'fr', { end: '12:00', at: '13:00', kind: 'eigen', own, from: '15:00', to: '16:00' });
      expect(decodePlan(encodePlan(plan))).toEqual(plan);
    }
  });

  it('never writes a key outside the plan', () => {
    const keys = [...new URLSearchParams(encodePlan(worstCasePlan())).keys()];
    for (const key of keys) expect(['mo', 'di', 'mi', 'do', 'fr', 'ak', 'ab', 'k']).toContain(key);
  });

  it('drops unknown keys, names and schools', () => {
    const plan = decodePlan('name=Lea&schule=Grundschule+Nord&klasse=1b&mo=1215&xx=1');
    expect(plan.days.mo.end).toBe('12:15');
    expect(JSON.stringify(plan)).not.toMatch(/Lea|Grundschule|1b/);
    expect(Object.keys(plan).sort()).toEqual(['arrive', 'days', 'dinner', 'knack']);
  });

  it('drops times outside the allowed ranges and bad family values', () => {
    const plan = decodePlan('mo=1800&di=1313&mi=0930.h2130&do=h1500m95&fr=h1500m7&ak=20&ab=2000&k=x');
    expect(plan.days.mo.end).toBeNull();
    expect(plan.days.di.end).toBeNull();
    expect(plan.days.mi).toEqual({ end: null, homework: null, appointment: null });
    // Minutes out of range go, the time stays.
    expect(plan.days.do.homework).toEqual({ where: 'home', at: '15:00', minutes: null });
    expect(plan.days.fr.homework).toEqual({ where: 'home', at: '15:00', minutes: null });
    expect(plan.arrive).toBeNull();
    expect(plan.dinner).toBeNull();
    expect(plan.knack).toBeNull();
  });

  it('drops an appointment whose end is not after its start, or unreadable', () => {
    expect(decodePlan('mo=tS1600-1600').days.mo.appointment).toBeNull();
    expect(decodePlan('mo=tS1600-1500').days.mo.appointment).toBeNull();
    expect(decodePlan('mo=tS1600-2400').days.mo.appointment).toBeNull();
    expect(decodePlan('mo=tX1600-1700').days.mo.appointment).toBeNull();
    expect(decodePlan('mo=ts1600-1700').days.mo.appointment).toBeNull();
    // An end without a start is not read; the appointment stays without times.
    expect(decodePlan('mo=tS-1700').days.mo.appointment).toEqual({ kind: 'sport', own: '', from: null, to: null });
    expect(decodePlan('mo=tS1600').days.mo.appointment).toEqual({ kind: 'sport', own: '', from: '16:00', to: null });
  });

  it('survives hostile input without throwing', () => {
    const hostile = [
      'mo=%3Cscript%3Ealert(1)%3C%2Fscript%3E',
      'mo=....&di=t&mi=h&do=hh&fr=1215.1300.o.g.tS',
      `mo=tE1500-1600.${encodeURIComponent('<img src=x onerror=alert(1)>'.repeat(10))}`,
      'mo=tE.%E2%80%AEenretaL%00%07',
      '%%%&&&==',
      'ak=30&ak=45&ab=1830&ab=1900',
      `mo=${'h1500.'.repeat(500)}`,
    ];
    for (const search of hostile) {
      const plan = decodePlan(search);
      expect(Object.keys(plan).sort()).toEqual(['arrive', 'days', 'dinner', 'knack']);
      for (const { id } of WEEKDAYS) {
        const own = plan.days[id].appointment?.own ?? '';
        expect(Array.from(own).length).toBeLessThanOrEqual(OWN_TEXT_MAX);
        expect(own).not.toMatch(/[\u0000-\u001F‮]/);
      }
    }
    expect(decodePlan('mi=h').days.mi.homework).toEqual({ where: 'home', at: null, minutes: null });
    expect(decodePlan('fr=1215.1300.o.g.tS').days.fr).toEqual({
      end: '12:15',
      homework: { where: 'ogs' },
      appointment: { kind: 'sport', own: '', from: null, to: null },
    });
    expect(decodePlan('ak=30&ak=45').arrive).toBe(30);
  });

  it('caps an own word that arrives too long through the link', () => {
    const plan = decodePlan(`mo=tE1500.${encodeURIComponent('  Sehr langer eigener Termin mit viel Text ')}`);
    expect(plan.days.mo.appointment?.own).toBe('Sehr langer eigener Term');
  });
});

describe('Nachmittagsplan fit check', () => {
  it('lets an empty plan and a normal week pass', () => {
    expect(checkFit(defaultPlan())).toEqual([]);
    let plan = day(defaultPlan(), 'mo', { end: '13:00', at: '14:00', minutes: 30, kind: 'sport', from: '15:00', to: '16:00' });
    plan = setArrive(plan, 30);
    plan = setDinner(plan, '18:00');
    expect(checkFit(plan)).toEqual([]);
    expect(fits(plan)).toBe(true);
  });

  describe('(a) homework before the child has arrived', () => {
    it('fails with the time the child arrives', () => {
      const plan = setArrive(day(defaultPlan(), 'mo', { end: '12:15', at: '12:30' }), 30);
      expect(checkFit(plan)).toEqual([
        {
          day: 'mo',
          rule: 'arrive',
          message:
            'Am Montag beginnen die Hausaufgaben um 12:30, aber ihr seid erst um 12:45 angekommen. Verschieb die Hausaufgaben.',
        },
      ]);
    });

    it('passes when homework starts right after arriving', () => {
      const plan = setArrive(day(defaultPlan(), 'mo', { end: '12:15', at: '12:45' }), 30);
      expect(checkFit(plan)).toEqual([]);
    });

    it('uses no arrive time while the parent has not chosen one, but not the very minute school ends', () => {
      const plan = day(defaultPlan(), 'mo', { end: '12:15', at: '12:30' });
      expect(plan.arrive).toBeNull();
      expect(checkFit(plan)).toEqual([]);
      // Claude F3: homework the minute school ends does not fit "erst ankommen".
      const same = day(defaultPlan(), 'mo', { end: '12:15', at: '12:15' });
      expect(checkFit(same)).toEqual([
        {
          day: 'mo',
          rule: 'arrive',
          message:
            'Am Montag beginnen die Hausaufgaben um 12:15, genau wenn die Schule endet. Wähl oben, wie lange ihr ankommt, oder verschieb die Hausaufgaben.',
        },
      ]);
    });

    it('lets the child go straight from school to an appointment and arrive after it', () => {
      // School 13:00, Ankommen 60, Sport 13:15 to 14:00: Ankommen after sport, homework from 15:00.
      let plan = day(defaultPlan(), 'mo', { end: '13:00', kind: 'sport', from: '13:15', to: '14:00', at: '15:00' });
      plan = setArrive(plan, 60);
      expect(checkFit(plan)).toEqual([]);
      expect(sheetDay(plan, 'mo').appointmentFirst).toBe(true);
      const early = setHomeworkAt(plan, 'mo', '14:30');
      expect(checkFit(early)).toEqual([
        {
          day: 'mo',
          rule: 'arrive',
          message: 'Am Montag beginnen die Hausaufgaben um 14:30, aber nach Sport seid ihr erst um 15:00 angekommen. Verschieb die Hausaufgaben.',
        },
      ]);
      // An appointment after Ankommen keeps the usual order.
      const later = setArrive(day(defaultPlan(), 'mo', { end: '13:00', kind: 'sport', from: '14:00', to: '15:00' }), 60);
      expect(sheetDay(later, 'mo').appointmentFirst).toBe(false);
    });

    it('still reports homework that starts before school ends, arrive set or not', () => {
      const unset = day(defaultPlan(), 'mi', { end: '13:00', at: '12:30' });
      expect(checkFit(unset)).toEqual([
        {
          day: 'mi',
          rule: 'school',
          message: 'Am Mittwoch beginnen die Hausaufgaben um 12:30, die Schule endet erst um 13:00. Verschieb die Hausaufgaben.',
        },
      ]);
      expect(checkFit(setArrive(unset, 15)).map((p) => p.rule)).toEqual(['school']);
    });

    it('needs both a school end and a homework time', () => {
      expect(checkFit(setArrive(day(defaultPlan(), 'mo', { at: '11:00' }), 60))).toEqual([]);
      expect(checkFit(setArrive(day(defaultPlan(), 'mo', { end: '13:00', minutes: 30 }), 60))).toEqual([]);
    });
  });

  describe('(b) appointment before school ends', () => {
    it('fails', () => {
      const plan = day(defaultPlan(), 'di', { end: '13:00', kind: 'schwimmen', from: '12:00', to: '13:30' });
      expect(checkFit(plan)).toEqual([
        { day: 'di', rule: 'school', message: 'Am Dienstag beginnt Schwimmen um 12:00, die Schule endet erst um 13:00.' },
      ]);
    });

    it('passes when the appointment starts when school ends', () => {
      expect(checkFit(day(defaultPlan(), 'di', { end: '13:00', kind: 'sport', from: '13:00' }))).toEqual([]);
    });

    it('names an own appointment in quotes', () => {
      const plan = day(defaultPlan(), 'do', { end: '15:00', kind: 'eigen', own: 'Ergotherapie', from: '14:00' });
      expect(checkFit(plan)[0].message).toBe(
        'Am Donnerstag beginnt „Ergotherapie“ um 14:00, die Schule endet erst um 15:00.',
      );
    });
  });

  describe('(c) homework and appointment at the same time', () => {
    it('fails for homework without minutes inside the appointment', () => {
      const plan = day(defaultPlan(), 'di', { at: '16:00', kind: 'schwimmen', from: '15:30', to: '16:30' });
      expect(checkFit(plan)).toEqual([
        {
          day: 'di',
          rule: 'overlap',
          message:
            'Am Dienstag überschneiden sich Schwimmen (15:30 bis 16:30) und die Hausaufgaben um 16:00. Verschieb eins davon.',
        },
      ]);
    });

    it('fails for homework with minutes that runs into the appointment', () => {
      const plan = day(defaultPlan(), 'fr', { at: '15:00', minutes: 45, kind: 'musik', from: '15:30', to: '16:15' });
      expect(checkFit(plan)[0].message).toBe(
        'Am Freitag überschneiden sich Musik (15:30 bis 16:15) und die Hausaufgaben (15:00 bis 15:45). Verschieb eins davon.',
      );
    });

    it('fails for an appointment without an end that starts during homework', () => {
      const plan = day(defaultPlan(), 'fr', { at: '15:00', minutes: 45, kind: 'buecherei', from: '15:15' });
      expect(checkFit(plan)[0].message).toBe(
        'Am Freitag überschneiden sich Bücherei um 15:15 und die Hausaufgaben (15:00 bis 15:45). Verschieb eins davon.',
      );
    });

    it('passes when one ends as the other starts', () => {
      expect(checkFit(day(defaultPlan(), 'di', { at: '15:00', minutes: 30, kind: 'sport', from: '15:30', to: '16:30' }))).toEqual([]);
      expect(checkFit(day(defaultPlan(), 'di', { at: '16:30', kind: 'sport', from: '15:30', to: '16:30' }))).toEqual([]);
      expect(checkFit(day(defaultPlan(), 'di', { at: '15:00', kind: 'sport', from: '15:30', to: '16:30' }))).toEqual([]);
    });
  });

  describe('(d) dinner', () => {
    it('fails when homework starts exactly at dinner', () => {
      const plan = setDinner(day(defaultPlan(), 'mo', { at: '18:30' }), '18:30');
      expect(checkFit(plan)).toEqual([
        {
          day: 'mo',
          rule: 'dinner',
          message: 'Am Montag beginnen die Hausaufgaben um 18:30, genau zum Abendessen. Verschieb die Hausaufgaben.',
        },
      ]);
    });

    it('fails when homework runs across dinner', () => {
      const plan = setDinner(day(defaultPlan(), 'mo', { at: '18:00', minutes: 45 }), '18:30');
      expect(checkFit(plan)[0].message).toBe(
        'Am Montag überschneiden sich die Hausaufgaben (18:00 bis 18:45) und das Abendessen um 18:30. Verschieb eins davon.',
      );
    });

    it('fails when an appointment runs across dinner', () => {
      const plan = setDinner(day(defaultPlan(), 'mi', { kind: 'sport', from: '17:30', to: '18:45' }), '18:30');
      expect(checkFit(plan)[0].message).toBe(
        'Am Mittwoch überschneiden sich Sport (17:30 bis 18:45) und das Abendessen um 18:30. Verschieb den Termin oder das Abendessen.',
      );
      const late = setDinner(day(defaultPlan(), 'mi', { kind: 'sport', from: '18:30' }), '18:30');
      expect(checkFit(late)[0].rule).toBe('dinner');
    });

    it('allows homework and appointments after dinner (dinner is a moment, Astra NP-01)', () => {
      let plan = day(defaultPlan(), 'mo', { at: '18:00', minutes: 30, kind: 'sport', from: '18:45', to: '19:30' });
      plan = setDinner(plan, '17:00');
      expect(checkFit(plan)).toEqual([]);
    });

    it('passes when everything ends by dinner', () => {
      let plan = day(defaultPlan(), 'mo', { at: '17:45', minutes: 45, kind: 'sport', from: '16:30', to: '17:30' });
      plan = setDinner(plan, '18:30');
      expect(checkFit(plan)).toEqual([]);
    });

    it('checks nothing against dinner while dinner is unset', () => {
      const plan = day(defaultPlan(), 'mo', { at: '19:30', minutes: 30, kind: 'sport', from: '18:00', to: '19:00' });
      expect(checkFit(plan)).toEqual([]);
    });
  });

  it('lists several problems per day in weekday order and never changes the plan', () => {
    let plan = day(defaultPlan(), 'fr', { end: '14:00', at: '13:30', kind: 'sport', from: '13:00', to: '14:30' });
    plan = day(plan, 'mo', { end: '12:00', at: '12:10' });
    plan = setArrive(plan, 15);
    const before = JSON.stringify(plan);
    const problems = checkFit(plan);
    expect(problems.map((p) => [p.day, p.rule])).toEqual([
      ['mo', 'arrive'],
      ['fr', 'school'],
      ['fr', 'school'],
      ['fr', 'overlap'],
    ]);
    expect(JSON.stringify(plan)).toBe(before);
    for (const p of problems) {
      expect(p.message).toMatch(/^Am (Montag|Dienstag|Mittwoch|Donnerstag|Freitag) /);
      expect(p.message).not.toContain(EM_DASH);
    }
  });

  it('lets the worst case fit', () => {
    expect(checkFit(worstCasePlan())).toEqual([]);
  });
});

describe('Nachmittagsplan sheet helpers', () => {
  it('prints an empty day as free', () => {
    const week = sheetWeek(defaultPlan());
    expect(week.map((d) => [d.label, d.free, d.arrive])).toEqual([
      ['Montag', true, null],
      ['Dienstag', true, null],
      ['Mittwoch', true, null],
      ['Donnerstag', true, null],
      ['Freitag', true, null],
    ]);
  });

  it('shows Ankommen without a time until the parent chooses one', () => {
    const plan = setEnd(defaultPlan(), 'mo', '13:15');
    expect(sheetDay(plan, 'mo')).toMatchObject({ free: false, end: '13:15 Uhr', arrive: { duration: null } });
    expect(sheetDay(setArrive(plan, 45), 'mo').arrive).toEqual({ duration: '45 Min.' });
  });

  it('writes homework time and minutes only when set', () => {
    const plan = day(defaultPlan(), 'mo', { at: '15:30' });
    expect(sheetDay(plan, 'mo').items).toEqual([
      { type: 'homework', where: 'home', time: '15:30 Uhr', duration: null, note: null },
    ]);
    expect(sheetDay(setHomeworkMinutes(plan, 'mo', 20), 'mo').items[0]).toMatchObject({ duration: '20 Min.' });
    expect(sheetDay(setHomeworkWhere(plan, 'mo', 'ogs'), 'mo').items[0]).toMatchObject({ note: 'in der OGS', time: null });
    expect(sheetDay(setHomeworkWhere(plan, 'mo', 'grandparents'), 'mo').items[0]).toMatchObject({ note: 'bei Oma, Opa' });
    expect(sheetDay(setHomeworkWhere(plan, 'mo', 'none'), 'mo').items[0]).toMatchObject({ note: 'heute keine' });
  });

  it('puts homework and the appointment in the order of the afternoon', () => {
    const late = day(defaultPlan(), 'di', { at: '15:00', kind: 'schwimmen', from: '16:00', to: '17:00' });
    expect(sheetDay(late, 'di').items.map((i) => i.type)).toEqual(['homework', 'appointment']);
    const early = day(defaultPlan(), 'di', { at: '17:00', kind: 'schwimmen', from: '14:00', to: '15:00' });
    expect(sheetDay(early, 'di').items.map((i) => i.type)).toEqual(['appointment', 'homework']);
    expect(sheetDay(early, 'di').items[0]).toEqual({
      type: 'appointment',
      label: 'Schwimmen',
      img: 'swim-bag.webp',
      time: '14:00 bis 15:00',
    });
  });

  it('names an own appointment with its word, a known picture or none', () => {
    const plan = day(defaultPlan(), 'mi', { kind: 'eigen', own: 'Ergotherapie', from: '15:00' });
    expect(sheetDay(plan, 'mi').items[0]).toEqual({ type: 'appointment', label: 'Ergotherapie', img: null, time: 'ab 15:00' });
    const empty = setAppointmentKind(defaultPlan(), 'mi', 'eigen');
    expect(sheetDay(empty, 'mi').items[0]).toMatchObject({ label: 'Termin', img: null, time: null });
  });

  it('gives the Knackpunkt sentence and the dinner line only when chosen', () => {
    expect(knackSentence(defaultPlan())).toBeNull();
    expect(knackSentence(setKnack(defaultPlan(), 'length'))).toBe('Wir machen eine Pause. Danach schauen wir zusammen weiter.');
    expect(knackPicture(setKnack(defaultPlan(), 'length'))).toBe('hourglass.webp');
    expect(knackPicture(defaultPlan())).toBeNull();
    expect(dinnerLine(defaultPlan())).toBeNull();
    expect(dinnerLine(setDinner(defaultPlan(), '18:30'))).toBe('Abendessen um 18:30 Uhr');
  });
});

describe('fit notes', () => {
  it('asks the parent to check homework without minutes before an appointment, without blocking', () => {
    const plan = day(defaultPlan(), 'mo', { end: '13:00', at: '14:00', kind: 'sport', from: '14:05', to: '15:00' });
    expect(checkFit(plan)).toEqual([]);
    expect(fitNotes(plan)).toEqual([
      { day: 'mo', message: 'Für Montag fehlt die Dauer der Hausaufgaben. Prüf selbst, ob bis Sport um 14:05 genug Zeit bleibt.' },
    ]);
    expect(fitNotes(setHomeworkMinutes(plan, 'mo', 30))).toEqual([]);
  });
});
