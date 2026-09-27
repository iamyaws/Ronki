import { describe, expect, it } from 'vitest';
import {
  EVENING,
  MORNING,
  kitDecodeClockStyle,
  kitDecodePlan,
  kitEncodePlan,
  kitEncodeQuery,
  kitPrintClockProp,
  kitSheetSteps,
  kitDoneLine,
  kitWakeLine,
  LEAVE_FACE_NOTE,
  printedTimes,
  showClockChangeNote,
  sleepCalculatorLink,
  type ClockStyle,
} from '../src/lib/routine-builder';

const morning = (search: string) => kitDecodePlan(MORNING, search);

describe('Clock style in the link', () => {
  it.each(['zahl', 'uhr', 'beides'] as ClockStyle[])('round trips "%s" next to the plan', (style) => {
    const plan = morning('?s=akzx&e=Medizin+nehmen&los=0745&m=5.3.3.4');
    const query = kitEncodeQuery(MORNING, plan, style);
    expect(query).toBe(
      style === 'zahl' ? 's=akzx&e=Medizin+nehmen&los=0745&m=5.3.3.4' : `s=akzx&e=Medizin+nehmen&los=0745&m=5.3.3.4&u=${style}`,
    );
    expect(kitDecodeClockStyle(MORNING, `?${query}`)).toBe(style);
    expect(morning(`?${query}`)).toEqual(plan);
  });

  it('puts the key after the leave time on the default steps', () => {
    const plan = morning('?los=0730');
    expect(kitEncodeQuery(MORNING, plan, 'uhr')).toBe('los=0730&u=uhr');
    expect(kitEncodeQuery(MORNING, plan, 'beides')).toBe('los=0730&u=beides');
  });

  it('reads old links without the key as "zahl" and writes them back unchanged', () => {
    for (const search of [
      '',
      '?s=zdfp',
      '?s=akzx&e=Medizin+nehmen&los=0745&m=5.3.3.4',
      '?los=0740',
      '?utm_source=whatsapp&utm_campaign=morgenroutine-start',
    ]) {
      const plan = morning(search);
      expect(kitDecodeClockStyle(MORNING, search)).toBe('zahl');
      expect(kitEncodeQuery(MORNING, plan, 'zahl')).toBe(kitEncodePlan(MORNING, plan));
    }
  });

  it('never lets the key change the plan itself', () => {
    expect(morning('?los=0740&u=uhr')).toEqual(morning('?los=0740'));
    expect(morning('?s=az&u=beides')).toEqual(morning('?s=az'));
  });

  it('reads anything unknown as "zahl"', () => {
    for (const value of [
      'UHR',
      'Uhr',
      ' uhr',
      'uhr ',
      '',
      'zahl',
      'uhr%00',
      '%3Cscript%3Ealert(1)%3C%2Fscript%3E',
      'beides;drop',
      '__proto__',
      'constructor',
      'toString',
      'x'.repeat(5000),
    ]) {
      expect(kitDecodeClockStyle(MORNING, `?los=0740&u=${value}`)).toBe('zahl');
    }
    // A doubled key counts once, the first one.
    expect(kitDecodeClockStyle(MORNING, '?los=0740&u=beides&u=uhr')).toBe('beides');
    // An explicit "zahl" is the default and is not written back.
    expect(kitEncodeQuery(MORNING, morning('?los=0740&u=zahl'), 'zahl')).toBe('los=0740');
  });

  it('ignores the key while times are off', () => {
    expect(kitDecodeClockStyle(MORNING, '?u=uhr')).toBe('zahl');
    expect(kitDecodeClockStyle(MORNING, '?s=az&u=beides')).toBe('zahl');
    expect(kitEncodeQuery(MORNING, morning(''), 'uhr')).toBe('');
    expect(kitEncodeQuery(MORNING, morning('?s=az'), 'beides')).toBe('s=az');
  });

  it('ignores the key on the evening kit', () => {
    expect(EVENING.clockFaces).toBeUndefined();
    expect(MORNING.clockFaces).toBe(true);
    const plan = kitDecodePlan(EVENING, '?aus=1930&u=uhr');
    expect(kitDecodeClockStyle(EVENING, '?aus=1930&u=uhr')).toBe('zahl');
    expect(kitEncodeQuery(EVENING, plan, 'uhr')).toBe('aus=1930');
    expect(kitSheetSteps(EVENING, plan, 'beides')).toEqual(kitSheetSteps(EVENING, plan));
    expect(kitSheetSteps(EVENING, plan, 'uhr').some((step) => 'clock' in step)).toBe(false);
  });
});

describe('Clock faces on the sheet follow the printed times', () => {
  // Aufstehen 5, Wasser 1, Zähne 3, Anziehen 10, leave 7:30: starts 7:11,
  // 7:16, 7:17, 7:20. Rounded 7:10, 7:15, 7:15 (not printed again), 7:20.
  const plan = morning('?s=atzd&los=0730');

  it('puts a face exactly on the rows that print a time', () => {
    expect(printedTimes(plan)).toEqual(['7:10', '7:15', undefined, '7:20']);
    expect(kitSheetSteps(MORNING, plan, 'uhr').map((step) => step.clock)).toEqual(['7:10', '7:15', undefined, '7:20']);
    expect(kitSheetSteps(MORNING, plan, 'beides').map((step) => step.clock)).toEqual([
      '7:10',
      '7:15',
      undefined,
      '7:20',
    ]);
  });

  it('drops the time in words for "uhr" and keeps it for "beides"', () => {
    expect(kitSheetSteps(MORNING, plan, 'uhr').map((step) => step.time)).toEqual([undefined, undefined, undefined, undefined]);
    expect(kitSheetSteps(MORNING, plan, 'beides').map((step) => step.time)).toEqual(['7:10', '7:15', undefined, '7:20']);
  });

  it('keeps "zahl" exactly as the sheet always was', () => {
    const before = kitSheetSteps(MORNING, plan);
    expect(kitSheetSteps(MORNING, plan, 'zahl')).toStrictEqual(before);
    expect(before.some((step) => 'clock' in step)).toBe(false);
  });

  it('draws no face while times are off, whatever the style', () => {
    const off = morning('?s=atzd');
    for (const style of ['uhr', 'beides'] as ClockStyle[]) {
      expect(kitSheetSteps(MORNING, off, style)).toStrictEqual(kitSheetSteps(MORNING, off));
    }
  });

  it('skips an own step without text, as the sheet does', () => {
    const withEmptyOwn = morning('?s=axzd&los=0730');
    const steps = kitSheetSteps(MORNING, withEmptyOwn, 'uhr');
    expect(steps.map((step) => step.label)).toEqual(['Aufstehen', 'Zähne putzen', 'Anziehen']);
    expect(steps.every((step) => step.clock)).toBe(true);
  });
});

describe('Wake-up line on the morning page', () => {
  it('names Aufstehen when it is the first step on the sheet', () => {
    // 5 + 3 + 10 + 15 + 5 = 38 minutes before 7:30: 6:52, printed 6:50.
    const line = kitWakeLine(MORNING, morning('?s=azdfp&los=0730'));
    expect(line).toEqual({ text: 'Auf dem Blatt: Aufstehen um 6:50 Uhr.', auf: '0650' });
    expect(sleepCalculatorLink(line!.auf)).toBe('/tools/schlafens-rechner?auf=0650');
  });

  it('names the first step otherwise, even when Aufstehen comes later, and guesses no wake-up time', () => {
    expect(kitWakeLine(MORNING, morning('?los=0740'))).toEqual({
      text: 'Der erste Schritt beginnt um 7:05 Uhr.',
      auf: null,
    });
    expect(sleepCalculatorLink(null)).toBe('/tools/schlafens-rechner');
    expect(kitWakeLine(MORNING, morning('?s=za&los=0730'))!.text).toBe('Der erste Schritt beginnt um 7:20 Uhr.');
  });

  it('counts from the first row that is really on the sheet', () => {
    expect(kitWakeLine(MORNING, morning('?s=xaz&los=0730'))).toEqual({
      text: 'Auf dem Blatt: Aufstehen um 7:20 Uhr.',
      auf: '0720',
    });
  });

  it('uses the rounded time the sheet prints, with the same time in the link', () => {
    // 6:30 minus 5 + 3 minutes: 6:22, printed 6:20.
    expect(kitWakeLine(MORNING, morning('?s=az&los=0630'))).toEqual({
      text: 'Auf dem Blatt: Aufstehen um 6:20 Uhr.',
      auf: '0620',
    });
  });

  it('says nothing while times are off or on the evening page', () => {
    expect(kitWakeLine(MORNING, morning('?s=az'))).toBeNull();
    expect(kitWakeLine(EVENING, kitDecodePlan(EVENING, '?aus=1930'))).toBeNull();
  });
});

describe('Clock change note', () => {
  it('shows up to and including 25 October 2026', () => {
    expect(showClockChangeNote(new Date(2026, 8, 27, 12))).toBe(true);
    expect(showClockChangeNote(new Date(2026, 9, 25, 0, 0))).toBe(true);
    expect(showClockChangeNote(new Date(2026, 9, 25, 23, 59))).toBe(true);
    expect(showClockChangeNote(new Date(2026, 9, 26, 0, 0))).toBe(false);
    expect(showClockChangeNote(new Date(2027, 2, 1))).toBe(false);
    expect(showClockChangeNote(new Date(Number.NaN))).toBe(false);
  });
});

describe('Print event value', () => {
  it('says "aus" without times and the style the sheet shows otherwise', () => {
    expect(kitPrintClockProp(MORNING, morning(''), 'uhr')).toBe('aus');
    for (const style of ['zahl', 'uhr', 'beides'] as ClockStyle[]) {
      expect(kitPrintClockProp(MORNING, morning('?los=0730'), style)).toBe(style);
    }
    const evening = kitDecodePlan(EVENING, '?aus=1930');
    expect(kitPrintClockProp(EVENING, evening, 'uhr')).toBe('zahl');
    expect(kitPrintClockProp(EVENING, kitDecodePlan(EVENING, ''), 'beides')).toBe('aus');
  });
});

describe('Done band with the time to leave (Astra UHR-01, Claude F2)', () => {
  const plan = morning('?los=0740');

  it('adds a face only with "Als Uhr" and "Beides", on the morning kit, with times on', () => {
    expect(kitDoneLine(MORNING, plan, 'zahl')).toEqual({ note: 'Für heute fertig. Los um 7:40 Uhr.' });
    expect(kitDoneLine(MORNING, plan, 'uhr')).toEqual({ note: LEAVE_FACE_NOTE, clock: '7:40' });
    expect(kitDoneLine(MORNING, plan, 'beides')).toEqual({ note: 'Für heute fertig. Los um 7:40 Uhr.', clock: '7:40' });
    expect(kitDoneLine(MORNING, morning('?s=az'), 'uhr')).toEqual({ note: undefined });
    const evening = kitDecodePlan(EVENING, '?aus=1930');
    expect(kitDoneLine(EVENING, evening, 'uhr').clock).toBeUndefined();
    expect(LEAVE_FACE_NOTE).toBe('Für heute fertig. Los geht es, wenn die Uhr so aussieht.');
  });
});
