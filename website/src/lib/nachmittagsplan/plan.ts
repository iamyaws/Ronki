/**
 * Nachmittagsplan: the data behind the tool at /tools/nachmittagsplan.
 *
 * A plan is the family's real afternoon, Monday to Friday: when school or
 * the OGS ends, where the homework happens (and when), and at most one fixed
 * appointment per day. On top, three things for the whole week: how long
 * the child needs to arrive at home (Ankommen), when dinner is, and the one
 * point where homework usually gets stuck (Knackpunkt). There is no field
 * for a name, a class or a school, so the share link can never carry one.
 *
 * Nothing is filled in for the parent. No default homework minutes, no
 * suggested time to arrive: an unset value stays unset and is left off the
 * sheet. `checkFit` only reports what does not fit; it never moves anything.
 *
 * The whole plan lives in the link. `encodePlan` writes a short query
 * string, `decodePlan` reads it back and quietly drops anything it does not
 * know or that is out of range. The untouched plan encodes to an empty
 * string, so the address bar stays clean until the parent changes something.
 *
 * Link format (keys only when something is set):
 *   mo=1215.h1530m20.tS1600-1700
 *                   a weekday (mo, di, mi, do, fr): parts joined by dots
 *     1215          school or OGS end as HHMM
 *     h1530m20      homework at home at 15:30 for 20 minutes; time and
 *                   minutes are each optional ("h", "h1530", "hm20")
 *     o | g | n     homework in the OGS, at Oma and Opa's, none today
 *     tS1600-1700   appointment: kind letter, then from and to as HHMM
 *                   (each optional, "to" only after "from")
 *     tE1600-1700.Fußball
 *                   an own appointment: E, the times, a dot and the word.
 *                   The appointment is always the last part, so the word
 *                   may hold dots of its own.
 *   ak=30           minutes to arrive: 15, 30, 45 or 60
 *   ab=1830         dinner as HHMM
 *   k=s|f|d|l       Knackpunkt: anfangen, Fehler, Dauer, Lesen üben
 */

import { FREE_TEXT_MAX, cleanFreeText, pictureForFree } from '../ranzen-packplan';

export type WeekdayId = 'mo' | 'di' | 'mi' | 'do' | 'fr';

export type HomeworkWhere = 'home' | 'ogs' | 'grandparents' | 'none';

export type Homework =
  | {
      where: 'home';
      /** Start time "HH:MM", or null while the parent has not picked one. */
      at: string | null;
      /** 5 to 90 in steps of five, or null: then no duration is printed. */
      minutes: number | null;
    }
  | { where: 'ogs' }
  | { where: 'grandparents' }
  | { where: 'none' };

export type AppointmentKindId = 'sport' | 'schwimmen' | 'musik' | 'malen' | 'buecherei' | 'eigen';

export interface Appointment {
  kind: AppointmentKindId;
  /** The own word for kind "eigen", cleaned and at most OWN_TEXT_MAX characters. Empty otherwise. */
  own: string;
  from: string | null;
  /** Only with `from`, and always after it. */
  to: string | null;
}

export interface DayPlan {
  /** School or OGS end "HH:MM", or null for a day the parent left open. */
  end: string | null;
  homework: Homework | null;
  appointment: Appointment | null;
}

export type ArriveMinutes = 15 | 30 | 45 | 60;

export type KnackId = 'start' | 'mistakes' | 'length' | 'reading';

export interface AfternoonPlan {
  days: Record<WeekdayId, DayPlan>;
  /** Minutes to arrive at home, chosen by the parent. Null until then. */
  arrive: ArriveMinutes | null;
  dinner: string | null;
  knack: KnackId | null;
}

/* ------------------------------------------------------------------ */
/* Catalogues                                                          */
/* ------------------------------------------------------------------ */

export const WEEKDAYS: ReadonlyArray<{ id: WeekdayId; label: string }> = [
  { id: 'mo', label: 'Montag' },
  { id: 'di', label: 'Dienstag' },
  { id: 'mi', label: 'Mittwoch' },
  { id: 'do', label: 'Donnerstag' },
  { id: 'fr', label: 'Freitag' },
];

/** Clock times "HH:MM" from `from` to `to` in 5-minute steps. */
export function clockRange(from: string, to: string): string[] {
  const times: string[] = [];
  for (let t = toMinutes(from); t <= toMinutes(to); t += 5) times.push(fromMinutes(t));
  return times;
}

/** When school or the OGS can end: 11:00 to 17:30. */
export const END_TIMES: readonly string[] = clockRange('11:00', '17:30');
/** Homework and appointments: 11:00 to 20:00. */
export const AFTERNOON_TIMES: readonly string[] = clockRange('11:00', '20:00');
/** Dinner: 17:00 to 19:30. */
export const DINNER_TIMES: readonly string[] = clockRange('17:00', '19:30');
/** Homework minutes a parent can pick. There is no default. */
export const HOMEWORK_MINUTES: readonly number[] = Array.from({ length: 18 }, (_, i) => (i + 1) * 5);
export const ARRIVE_MINUTES: readonly ArriveMinutes[] = [15, 30, 45, 60];

/** An own appointment word: at most 24 characters, cleaned like the packplan's free item. */
export const OWN_TEXT_MAX = FREE_TEXT_MAX;

export const HOMEWORK_OPTIONS: ReadonlyArray<{
  where: HomeworkWhere;
  code: string;
  /** On the page. */
  label: string;
  /** On the sheet, under "Hausaufgaben". Empty for home: the sheet prints the time. */
  note: string;
}> = [
  { where: 'home', code: 'h', label: 'zu Hause', note: '' },
  { where: 'ogs', code: 'o', label: 'in der OGS', note: 'in der OGS erledigt' },
  { where: 'grandparents', code: 'g', label: 'bei Oma, Opa', note: 'bei Oma, Opa' },
  { where: 'none', code: 'n', label: 'heute keine', note: 'heute keine' },
];

export const APPOINTMENT_KINDS: ReadonlyArray<{
  id: AppointmentKindId;
  code: string;
  label: string;
  /** Drawn picture in /art/bilderbuch/tasks/. None for an own word: see appointmentPicture. */
  img: string | null;
}> = [
  { id: 'sport', code: 'S', label: 'Sport', img: 'sneakers.webp' },
  { id: 'schwimmen', code: 'W', label: 'Schwimmen', img: 'swim-bag.webp' },
  { id: 'musik', code: 'M', label: 'Musik', img: 'recorder.webp' },
  { id: 'malen', code: 'K', label: 'Malen', img: 'paint-box.webp' },
  { id: 'buecherei', code: 'B', label: 'Bücherei', img: 'book.webp' },
  { id: 'eigen', code: 'E', label: 'Eigener Termin', img: null },
];

export const KNACKS: ReadonlyArray<{
  id: KnackId;
  code: string;
  label: string;
  /** One line on the page under the choice. */
  description: string;
  /** The sentence on the card, said to the child. */
  sentence: string;
}> = [
  {
    id: 'start',
    code: 's',
    label: 'Anfangen',
    description: 'Schon beim Wort Hausaufgaben geht es los.',
    sentence: 'Jetzt ist Hausaufgabenzeit.',
  },
  {
    id: 'mistakes',
    code: 'f',
    label: 'Fehler',
    description: 'Ein Fehler, und der Nachmittag kippt.',
    sentence: 'Fehler dürfen sein. Wir schauen danach zusammen.',
  },
  {
    id: 'length',
    code: 'd',
    label: 'Dauer',
    description: 'Es zieht sich, und alle werden müde.',
    sentence: 'Erst diese Aufgabe, dann eine kurze Pause.',
  },
  {
    id: 'reading',
    code: 'l',
    label: 'Lesen üben',
    description: 'Beim Lesen üben wird es schnell laut.',
    sentence: 'Du liest, ich höre zu.',
  },
];

/** The line for the class chat, sent together with the link. */
export const SHARE_TEXT =
  'Hier könnt ihr Abholen, Pause, Termine und Hausaufgaben auf einem Blatt für euren Nachmittag zusammenstellen.';

/* ------------------------------------------------------------------ */
/* Clock                                                               */
/* ------------------------------------------------------------------ */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const day = 24 * 60;
  const t = ((total % day) + day) % day;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

function addMinutes(hhmm: string, minutes: number): string {
  return fromMinutes(toMinutes(hhmm) + minutes);
}

/** "13:15" for the link: "1315". */
function packTime(hhmm: string): string {
  return hhmm.replace(':', '');
}

/** "1315" from the link, as "13:15" when it is one of `allowed`. */
function unpackTime(raw: string | undefined, allowed: readonly string[]): string | null {
  if (!raw || !/^\d{4}$/.test(raw)) return null;
  const time = `${raw.slice(0, 2)}:${raw.slice(2)}`;
  return allowed.includes(time) ? time : null;
}

/* ------------------------------------------------------------------ */
/* Plan helpers (pure)                                                 */
/* ------------------------------------------------------------------ */

function emptyDay(): DayPlan {
  return { end: null, homework: null, appointment: null };
}

export function defaultPlan(): AfternoonPlan {
  return {
    days: { mo: emptyDay(), di: emptyDay(), mi: emptyDay(), do: emptyDay(), fr: emptyDay() },
    arrive: null,
    dinner: null,
    knack: null,
  };
}

function withDay(plan: AfternoonPlan, day: WeekdayId, change: (d: DayPlan) => DayPlan): AfternoonPlan {
  return { ...plan, days: { ...plan.days, [day]: change(plan.days[day]) } };
}

export function setEnd(plan: AfternoonPlan, day: WeekdayId, end: string | null): AfternoonPlan {
  const value = end && END_TIMES.includes(end) ? end : null;
  return withDay(plan, day, (d) => ({ ...d, end: value }));
}

/** The same school end on all five days. */
export function setEndForAll(plan: AfternoonPlan, end: string | null): AfternoonPlan {
  return WEEKDAYS.reduce((next, { id }) => setEnd(next, id, end), plan);
}

/** Where the homework happens. Switching to "home" starts without a time or minutes. */
export function setHomeworkWhere(
  plan: AfternoonPlan,
  day: WeekdayId,
  where: HomeworkWhere | null,
): AfternoonPlan {
  return withDay(plan, day, (d) => {
    if (where === null) return { ...d, homework: null };
    if (where === 'home') {
      return d.homework?.where === 'home' ? d : { ...d, homework: { where: 'home', at: null, minutes: null } };
    }
    return { ...d, homework: { where } };
  });
}

export function setHomeworkAt(plan: AfternoonPlan, day: WeekdayId, at: string | null): AfternoonPlan {
  const value = at && AFTERNOON_TIMES.includes(at) ? at : null;
  return withDay(plan, day, (d) => {
    const minutes = d.homework?.where === 'home' ? d.homework.minutes : null;
    return { ...d, homework: { where: 'home', at: value, minutes } };
  });
}

export function setHomeworkMinutes(
  plan: AfternoonPlan,
  day: WeekdayId,
  minutes: number | null,
): AfternoonPlan {
  const value = minutes !== null && HOMEWORK_MINUTES.includes(minutes) ? minutes : null;
  return withDay(plan, day, (d) => {
    const at = d.homework?.where === 'home' ? d.homework.at : null;
    return { ...d, homework: { where: 'home', at, minutes: value } };
  });
}

/** The kind of appointment, or null for none. Times and the own word stay when the kind changes. */
export function setAppointmentKind(
  plan: AfternoonPlan,
  day: WeekdayId,
  kind: AppointmentKindId | null,
): AfternoonPlan {
  return withDay(plan, day, (d) => {
    if (kind === null) return { ...d, appointment: null };
    const prev = d.appointment;
    return {
      ...d,
      appointment: {
        kind,
        own: kind === 'eigen' ? (prev?.own ?? '') : '',
        from: prev?.from ?? null,
        to: prev?.to ?? null,
      },
    };
  });
}

export function setAppointmentOwn(plan: AfternoonPlan, day: WeekdayId, text: string): AfternoonPlan {
  return withDay(plan, day, (d) => ({
    ...d,
    appointment: {
      kind: 'eigen',
      own: cleanFreeText(text),
      from: d.appointment?.from ?? null,
      to: d.appointment?.to ?? null,
    },
  }));
}

/**
 * Start of the appointment. An end that would no longer come after it is
 * cleared, because an appointment cannot end before it starts; nothing else
 * is changed.
 */
export function setAppointmentFrom(plan: AfternoonPlan, day: WeekdayId, from: string | null): AfternoonPlan {
  const value = from && AFTERNOON_TIMES.includes(from) ? from : null;
  return withDay(plan, day, (d) => {
    if (!d.appointment) return d;
    const to = value && d.appointment.to && toMinutes(d.appointment.to) > toMinutes(value) ? d.appointment.to : null;
    return { ...d, appointment: { ...d.appointment, from: value, to } };
  });
}

/** End of the appointment. Only after the start; anything else leaves it open. */
export function setAppointmentTo(plan: AfternoonPlan, day: WeekdayId, to: string | null): AfternoonPlan {
  return withDay(plan, day, (d) => {
    if (!d.appointment) return d;
    const { from } = d.appointment;
    const ok = to && from && AFTERNOON_TIMES.includes(to) && toMinutes(to) > toMinutes(from);
    return { ...d, appointment: { ...d.appointment, to: ok ? to : null } };
  });
}

export function setArrive(plan: AfternoonPlan, arrive: ArriveMinutes | null): AfternoonPlan {
  return { ...plan, arrive: arrive !== null && ARRIVE_MINUTES.includes(arrive) ? arrive : null };
}

export function setDinner(plan: AfternoonPlan, dinner: string | null): AfternoonPlan {
  return { ...plan, dinner: dinner && DINNER_TIMES.includes(dinner) ? dinner : null };
}

export function setKnack(plan: AfternoonPlan, knack: KnackId | null): AfternoonPlan {
  return { ...plan, knack: knack && KNACKS.some((k) => k.id === knack) ? knack : null };
}

/** Times the "bis" field can offer: after the start, up to 20:00. */
export function appointmentEndTimes(from: string | null): string[] {
  if (!from) return [];
  return AFTERNOON_TIMES.filter((t) => toMinutes(t) > toMinutes(from));
}

/* ------------------------------------------------------------------ */
/* Names and pictures                                                  */
/* ------------------------------------------------------------------ */

const KIND_BY_ID = new Map(APPOINTMENT_KINDS.map((k) => [k.id, k]));

/** What the appointment is called on the sheet: the catalogue label or the own word. */
export function appointmentLabel(appointment: Appointment): string {
  if (appointment.kind === 'eigen') return appointment.own || 'Termin';
  return KIND_BY_ID.get(appointment.kind)?.label ?? 'Termin';
}

/** Picture file, or null when the sheet should show a box to draw in. */
export function appointmentPicture(appointment: Appointment): string | null {
  if (appointment.kind === 'eigen') return appointment.own ? pictureForFree(appointment.own) : null;
  return KIND_BY_ID.get(appointment.kind)?.img ?? null;
}

/** The appointment as it is named in a fit message: an own word in quotes. */
function nameInSentence(appointment: Appointment): string {
  if (appointment.kind !== 'eigen') return appointmentLabel(appointment);
  return appointment.own ? `„${appointment.own}“` : 'der Termin';
}

/* ------------------------------------------------------------------ */
/* Fit check                                                           */
/* ------------------------------------------------------------------ */

export type FitRule = 'arrive' | 'school' | 'overlap' | 'dinner';

export interface FitProblem {
  day: WeekdayId;
  rule: FitRule;
  /** Plain German, du-form: names the day and what to move. */
  message: string;
}

/**
 * Everything on the plan that does not fit, per day, in weekday order.
 * Pure: it never changes the plan. An empty list means the plan fits.
 *
 * (a) Homework at home starts before the child has arrived: school end
 *     plus Ankommen. With Ankommen unset, only the school end counts.
 * (b) An appointment starts before school ends. Homework before school
 *     ends is reported the same way.
 * (c) Homework and the appointment overlap. Homework with minutes is a
 *     span, without minutes the moment it starts; the same for an
 *     appointment without an end.
 * (d) With dinner set: homework starts at or after dinner or runs past it,
 *     or the appointment runs past it.
 */
export function checkFit(plan: AfternoonPlan): FitProblem[] {
  const problems: FitProblem[] = [];
  for (const { id, label } of WEEKDAYS) {
    const { end, homework, appointment } = plan.days[id];
    const add = (rule: FitRule, message: string) => problems.push({ day: id, rule, message });
    const home = homework?.where === 'home' && homework.at ? homework : null;
    const at = home?.at ?? null;
    const hwEnd = at && home?.minutes ? addMinutes(at, home.minutes) : null;
    const from = appointment?.from ?? null;
    const to = from ? (appointment?.to ?? null) : null;
    const name = appointment ? nameInSentence(appointment) : '';

    // (a) and (b): homework before school ends or before the child has arrived.
    if (at && end) {
      if (toMinutes(at) < toMinutes(end)) {
        add('school', `Am ${label} beginnen die Hausaufgaben um ${at}, die Schule endet erst um ${end}. Verschieb die Hausaufgaben.`);
      } else if (plan.arrive && toMinutes(at) < toMinutes(end) + plan.arrive) {
        add(
          'arrive',
          `Am ${label} beginnen die Hausaufgaben um ${at}, aber ihr seid erst um ${addMinutes(end, plan.arrive)} angekommen. Verschieb die Hausaufgaben oder nimm weniger Zeit zum Ankommen.`,
        );
      }
    }

    // (b) The appointment starts before school ends.
    if (from && end && toMinutes(from) < toMinutes(end)) {
      add('school', `Am ${label} beginnt ${name} um ${from}, die Schule endet erst um ${end}.`);
    }

    // (c) Homework and the appointment at the same time.
    if (at && from) {
      const hw: [number, number] = [toMinutes(at), hwEnd ? toMinutes(hwEnd) : toMinutes(at)];
      const ap: [number, number] = [toMinutes(from), to ? toMinutes(to) : toMinutes(from)];
      if (overlaps(hw, ap)) {
        const apText = to ? `${name} (${from} bis ${to})` : `${name} um ${from}`;
        const hwText = hwEnd ? `die Hausaufgaben (${at} bis ${hwEnd})` : `die Hausaufgaben um ${at}`;
        add('overlap', `Am ${label} überschneiden sich ${apText} und ${hwText}. Verschieb eins davon.`);
      }
    }

    // (d) Dinner.
    if (plan.dinner) {
      const dinner = toMinutes(plan.dinner);
      if (at && toMinutes(at) >= dinner) {
        add('dinner', `Am ${label} beginnen die Hausaufgaben um ${at}, aber um ${plan.dinner} gibt es Abendessen. Verschieb die Hausaufgaben.`);
      } else if (hwEnd && toMinutes(hwEnd) > dinner) {
        add(
          'dinner',
          `Am ${label} gehen die Hausaufgaben bis ${hwEnd}, aber um ${plan.dinner} gibt es Abendessen. Verschieb die Hausaufgaben oder nimm weniger Minuten.`,
        );
      }
      if (to && toMinutes(to) > dinner) {
        add('dinner', `Am ${label} geht ${name} bis ${to}, aber um ${plan.dinner} gibt es Abendessen. Verschieb den Termin oder das Abendessen.`);
      } else if (from && !to && toMinutes(from) >= dinner) {
        add('dinner', `Am ${label} beginnt ${name} um ${from}, aber um ${plan.dinner} gibt es Abendessen. Verschieb den Termin oder das Abendessen.`);
      }
    }
  }
  return problems;
}

/**
 * Two spans [start, end) overlap. A span of length zero is a moment: it
 * overlaps a span that contains it, or another moment at the same time.
 */
function overlaps(a: [number, number], b: [number, number]): boolean {
  const aPoint = a[0] === a[1];
  const bPoint = b[0] === b[1];
  if (aPoint && bPoint) return a[0] === b[0];
  if (aPoint) return b[0] <= a[0] && a[0] < b[1];
  if (bPoint) return a[0] <= b[0] && b[0] < a[1];
  return a[0] < b[1] && b[0] < a[1];
}

export function fits(plan: AfternoonPlan): boolean {
  return checkFit(plan).length === 0;
}

/* ------------------------------------------------------------------ */
/* What the sheet draws                                                */
/* ------------------------------------------------------------------ */

export type SheetItem =
  | {
      type: 'homework';
      where: HomeworkWhere;
      /** "15:30 Uhr" for homework at home with a time. */
      time: string | null;
      /** "20 Min." when the parent set minutes. */
      duration: string | null;
      /** "in der OGS erledigt", "bei Oma, Opa", "heute keine", or null at home. */
      note: string | null;
    }
  | {
      type: 'appointment';
      label: string;
      img: string | null;
      /** "16:00 bis 17:00", "ab 16:00" or null. */
      time: string | null;
    };

export interface SheetDay {
  id: WeekdayId;
  label: string;
  /** Nothing set for this day: the sheet prints "frei". */
  free: boolean;
  /** "13:15 Uhr" or null. */
  end: string | null;
  /** Ankommen, on every day that is not free. `duration` is "30 Min." once the parent chose it. */
  arrive: { duration: string | null } | null;
  /** Homework and the appointment, in the order of the afternoon. */
  items: SheetItem[];
}

export const FREE_DAY = 'frei';

function startOf(item: SheetItem, day: DayPlan): number | null {
  if (item.type === 'homework') return day.homework?.where === 'home' && day.homework.at ? toMinutes(day.homework.at) : null;
  return day.appointment?.from ? toMinutes(day.appointment.from) : null;
}

/** One day of the week strip, as the sheet draws it. */
export function sheetDay(plan: AfternoonPlan, id: WeekdayId): SheetDay {
  const label = WEEKDAYS.find((d) => d.id === id)?.label ?? id;
  const day = plan.days[id];
  const items: SheetItem[] = [];

  if (day.homework) {
    const hw = day.homework;
    const option = HOMEWORK_OPTIONS.find((o) => o.where === hw.where);
    items.push({
      type: 'homework',
      where: hw.where,
      time: hw.where === 'home' && hw.at ? `${hw.at} Uhr` : null,
      duration: hw.where === 'home' && hw.minutes ? `${hw.minutes} Min.` : null,
      note: hw.where === 'home' ? null : (option?.note ?? null),
    });
  }
  if (day.appointment) {
    const ap = day.appointment;
    const time = ap.from ? (ap.to ? `${ap.from} bis ${ap.to}` : `ab ${ap.from}`) : null;
    items.push({ type: 'appointment', label: appointmentLabel(ap), img: appointmentPicture(ap), time });
  }
  // Both with a time: the earlier one first. Otherwise homework first,
  // the order the tool is built around.
  if (items.length === 2) {
    const [a, b] = items.map((item) => startOf(item, day));
    if (a !== null && b !== null && b < a) items.reverse();
  }

  const free = !day.end && items.length === 0;
  return {
    id,
    label,
    free,
    end: day.end ? `${day.end} Uhr` : null,
    arrive: free ? null : { duration: plan.arrive ? `${plan.arrive} Min.` : null },
    items,
  };
}

export function sheetWeek(plan: AfternoonPlan): SheetDay[] {
  return WEEKDAYS.map(({ id }) => sheetDay(plan, id));
}

/** The Knackpunkt sentence for the card, or null when the parent chose none. */
export function knackSentence(plan: AfternoonPlan): string | null {
  return KNACKS.find((k) => k.id === plan.knack)?.sentence ?? null;
}

/** "Abendessen um 18:30 Uhr" or null. */
export function dinnerLine(plan: AfternoonPlan): string | null {
  return plan.dinner ? `Abendessen um ${plan.dinner} Uhr` : null;
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

const WHERE_CODE = new Map(HOMEWORK_OPTIONS.map((o) => [o.where, o.code]));
const WHERE_BY_CODE = new Map(HOMEWORK_OPTIONS.map((o) => [o.code, o.where]));
const KIND_CODE = new Map(APPOINTMENT_KINDS.map((k) => [k.id, k.code]));
const KIND_BY_CODE = new Map(APPOINTMENT_KINDS.map((k) => [k.code, k.id]));
const KNACK_CODE = new Map(KNACKS.map((k) => [k.id, k.code]));
const KNACK_BY_CODE = new Map(KNACKS.map((k) => [k.code, k.id]));

function encodeDay(day: DayPlan): string {
  const parts: string[] = [];
  if (day.end && END_TIMES.includes(day.end)) parts.push(packTime(day.end));

  const hw = day.homework;
  if (hw) {
    if (hw.where === 'home') {
      let part = 'h';
      if (hw.at && AFTERNOON_TIMES.includes(hw.at)) part += packTime(hw.at);
      if (hw.minutes && HOMEWORK_MINUTES.includes(hw.minutes)) part += `m${hw.minutes}`;
      parts.push(part);
    } else if (WHERE_CODE.has(hw.where)) {
      parts.push(WHERE_CODE.get(hw.where)!);
    }
  }

  const ap = day.appointment;
  if (ap && KIND_CODE.has(ap.kind)) {
    let part = `t${KIND_CODE.get(ap.kind)}`;
    const from = ap.from && AFTERNOON_TIMES.includes(ap.from) ? ap.from : null;
    if (from) {
      part += packTime(from);
      if (ap.to && AFTERNOON_TIMES.includes(ap.to) && toMinutes(ap.to) > toMinutes(from)) {
        part += `-${packTime(ap.to)}`;
      }
    }
    const own = ap.kind === 'eigen' ? cleanFreeText(ap.own) : '';
    if (own) part += `.${own}`;
    parts.push(part);
  }
  return parts.join('.');
}

/** The plan as a query string without the leading "?". Empty for the untouched plan. */
export function encodePlan(plan: AfternoonPlan): string {
  const params = new URLSearchParams();
  for (const { id } of WEEKDAYS) {
    const value = plan.days[id] ? encodeDay(plan.days[id]) : '';
    if (value) params.set(id, value);
  }
  if (plan.arrive && ARRIVE_MINUTES.includes(plan.arrive)) params.set('ak', String(plan.arrive));
  if (plan.dinner && DINNER_TIMES.includes(plan.dinner)) params.set('ab', packTime(plan.dinner));
  if (plan.knack && KNACK_CODE.has(plan.knack)) params.set('k', KNACK_CODE.get(plan.knack)!);
  return params.toString();
}

const HOME_PART = /^h(\d{4})?(?:m(\d{1,2}))?$/;
const APPOINTMENT_PART = /^t([A-Z])(\d{4})?(?:-(\d{4}))?(?:\.([\s\S]*))?$/;

function decodeAppointment(raw: string): Appointment | null {
  const match = APPOINTMENT_PART.exec(raw);
  if (!match) return null;
  const kind = KIND_BY_CODE.get(match[1]);
  if (!kind) return null;
  const from = unpackTime(match[2], AFTERNOON_TIMES);
  const to = from ? unpackTime(match[3], AFTERNOON_TIMES) : null;
  // An end that is not after the start: the appointment cannot be read, so it goes.
  if (from && match[3] && (!to || toMinutes(to) <= toMinutes(from))) return null;
  const own = kind === 'eigen' ? cleanFreeText(match[4] ?? '') : '';
  return { kind, own, from, to };
}

function decodeHomework(part: string): Homework | null {
  const simple = WHERE_BY_CODE.get(part);
  if (simple && simple !== 'home') return { where: simple } as Homework;
  const match = HOME_PART.exec(part);
  if (!match) return null;
  const at = unpackTime(match[1], AFTERNOON_TIMES);
  if (match[1] && !at) return null;
  const minutes = match[2] ? Number(match[2]) : null;
  if (minutes !== null && !HOMEWORK_MINUTES.includes(minutes)) return { where: 'home', at, minutes: null };
  return { where: 'home', at, minutes };
}

function decodeDay(value: string): DayPlan {
  const day = emptyDay();
  const parts = value.split('.');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('t')) {
      // The appointment is the last part; an own word may hold dots.
      if (!day.appointment) day.appointment = decodeAppointment(parts.slice(i).join('.'));
      break;
    }
    if (/^\d{4}$/.test(part)) {
      if (!day.end) day.end = unpackTime(part, END_TIMES);
    } else if (!day.homework) {
      day.homework = decodeHomework(part);
    }
  }
  return day;
}

/** Reads a plan back from a query string (with or without "?"). Unknown or bad values are ignored. */
export function decodePlan(search: string): AfternoonPlan {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const plan = defaultPlan();

  for (const { id } of WEEKDAYS) {
    const value = params.get(id);
    if (value) plan.days[id] = decodeDay(value);
  }

  const arrive = Number(params.get('ak'));
  if (ARRIVE_MINUTES.includes(arrive as ArriveMinutes)) plan.arrive = arrive as ArriveMinutes;
  plan.dinner = unpackTime(params.get('ab') ?? undefined, DINNER_TIMES);
  plan.knack = KNACK_BY_CODE.get(params.get('k') ?? '') ?? null;

  return plan;
}
