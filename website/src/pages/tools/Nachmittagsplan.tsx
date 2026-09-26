/**
 * /tools/nachmittagsplan: the family's real afternoon on one A4 sheet.
 *
 * When school or the OGS ends, time to arrive (Ankommen), fixed
 * appointments and where the homework happens, Monday to Friday. A plan
 * that does not fit is shown as not fitting, next to the day and above the
 * print buttons, and cannot be printed until the parent changes it. The
 * tool never squeezes or moves anything by itself.
 *
 * Same shape as the Ranzen-Packplan: the plan lives only in the address
 * bar (history.replaceState on every change), so the address bar is always
 * the share link and opening a link restores the plan; a popstate listener
 * restores plan and typed drafts on back and forward. Nothing is stored and
 * there is no field for a name, a class or a school. Analytics count that
 * the tool was used, prints and shares, never the plan.
 *
 * Printing: the preview is a scaled copy of the A4 sheet. Unscaled copies
 * of both variants (full sheet, Wochenplan alone) sit in a portal on
 * <body>; the page's print style hides everything else and shows the one
 * the parent chose, so a print gives exactly one A4 page. While the plan
 * does not fit, the portal holds a short note instead of the sheet.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { SheetPageStyle, TASK_ART_PATH } from '../../components/sheet';
import {
  NachmittagsplanSheet,
  type SheetVariant,
} from '../../components/nachmittagsplan/NachmittagsplanSheet';
import { trackEvent } from '../../lib/analytics';
import { copyText } from '../../lib/clipboard';
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
  checkFit,
  decodePlan,
  encodePlan,
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
  type AfternoonPlan,
  type FitProblem,
  type WeekdayId,
} from '../../lib/nachmittagsplan';

const PAGE_PATH = '/tools/nachmittagsplan';
const ARTICLE_PATH = '/ratgeber/hausaufgaben-streit-erste-klasse';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Nachmittagsplan für Grundschulkinder: erst ankommen, dann Hausaufgaben · Ronki';
const META_DESCRIPTION =
  'Schule aus, ankommen, Termine, Hausaufgaben: Leg euren Nachmittag auf ein A4-Blatt und sieh, was nicht zusammenpasst. Kostenlos, ohne Anmeldung.';

const LINK_NOTE =
  'Im Link stehen eure Zeiten, Termine und was ihr bei eigenen Terminen eintragt. Alle mit dem Link können das lesen.';
const OWN_NOTE = 'Trag nur einen Termin ein, keine Namen: Der Text steht auch im Link.';
const PRINT_BLOCKED = 'Drucken geht, sobald alles zusammenpasst. Ändere dafür oben die Zeiten.';

/** A4 at 96 dpi, the size the sheet is laid out at (sheet.css: 210 x 296 mm). */
const A4_WIDTH_PX = 793.7;
const A4_HEIGHT_PX = 1118.7;

type Drafts = Record<WeekdayId, string>;

function draftsFrom(plan: AfternoonPlan): Drafts {
  const own = (id: WeekdayId) => plan.days[id].appointment?.own ?? '';
  return { mo: own('mo'), di: own('di'), mi: own('mi'), do: own('do'), fr: own('fr') };
}

function problemsOn(problems: FitProblem[], day: WeekdayId): FitProblem[] {
  return problems.filter((p) => p.day === day);
}

export default function Nachmittagsplan() {
  const [plan, setPlan] = useState<AfternoonPlan>(() =>
    decodePlan(typeof window === 'undefined' ? '' : window.location.search),
  );
  // What the parent types into an own appointment, spaces and all. The plan keeps the cleaned text.
  const [drafts, setDrafts] = useState<Drafts>(() => draftsFrom(plan));
  const [printVariant, setPrintVariant] = useState<SheetVariant>('blatt');
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
  );
  const copiedTimer = useRef<number | undefined>(undefined);
  const counted = useRef(false);

  const query = encodePlan(plan);
  const shareUrl = `${typeof window === 'undefined' ? 'https://www.ronki.de' : window.location.origin}${PAGE_PATH}${query ? `?${query}` : ''}`;
  const problems = checkFit(plan);
  const fits = problems.length === 0;
  const unfitDays = WEEKDAYS.map((d) => d.id).filter((id) => problems.some((p) => p.day === id));

  // The address bar is always the share link. It is only rewritten once the
  // plan differs from the one it holds, so campaign tags on an opened link
  // stay until the parent changes something.
  useEffect(() => {
    if (encodePlan(decodePlan(window.location.search)) === query) return;
    const next = `${PAGE_PATH}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', next);
  }, [query]);

  // Back and forward change the address bar without remounting the page, so
  // read the plan from it again; otherwise the preview and the link differ.
  useEffect(() => {
    function restore() {
      const next = decodePlan(window.location.search);
      setPlan(next);
      setDrafts(draftsFrom(next));
    }
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  /** Applies a change from the parent. The first one in a page view is counted, without plan data. */
  const update = useCallback((change: (prev: AfternoonPlan) => AfternoonPlan) => {
    setPlan(change);
    if (!counted.current) {
      counted.current = true;
      trackEvent('Nachmittagsplan erstellt');
    }
  }, []);

  function changeOwn(day: WeekdayId, text: string) {
    setDrafts((prev) => ({ ...prev, [day]: text }));
    update((prev) => setAppointmentOwn(prev, day, text));
  }

  function handlePrint(variant: SheetVariant) {
    if (!fits) return;
    flushSync(() => setPrintVariant(variant));
    trackEvent('Nachmittagsplan Drucken', { weg: variant });
    window.print();
  }

  async function handleCopy() {
    if (!(await copyText(shareUrl))) return;
    trackEvent('Nachmittagsplan Link', { weg: 'kopiert' });
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    try {
      await navigator.share({ title: 'Nachmittagsplan', text: SHARE_TEXT, url: shareUrl });
      trackEvent('Nachmittagsplan Link', { weg: 'geteilt' });
    } catch {
      // Closed the share sheet, or the browser refused. Nothing to do.
    }
  }

  // The first school end the parent set, for "für alle Tage übernehmen".
  const firstEnd = WEEKDAYS.map((d) => plan.days[d.id].end).find(Boolean) ?? null;
  const allSame = WEEKDAYS.every((d) => plan.days[d.id].end === firstEnd);

  return (
    <PainterlyShell>
      <PageMeta
        title={META_TITLE}
        description={META_DESCRIPTION}
        canonicalPath={PAGE_PATH}
        ogImage="/og-tool-nachmittagsplan.jpg"
      />
      <SheetPageStyle />
      <style>{printCss}</style>

      <section className="px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 font-display font-semibold text-sm text-ink/70 hover:text-ink transition-colors mb-8"
          >
            <svg aria-hidden viewBox="0 0 64 64" className="h-3.5 w-3.5">
              <use href="#bb-back" />
            </svg>
            Werkzeuge
          </Link>

          <header className="max-w-3xl">
            <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-3">
              Werkzeug für Eltern
            </p>
            <h1 className="bb-display text-4xl sm:text-5xl lg:text-6xl text-ink">
              Nachmittagsplan: erst ankommen, dann Hausaufgaben
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
              Schule aus, Hunger, Sport um vier, und dazwischen noch die Hausaufgaben. Hier legst du
              euren echten Nachmittag auf ein Blatt: wann Schule aus ist, wie lange ihr ankommt,
              welche Termine es gibt und wo die Hausaufgaben passieren. Passt etwas nicht zusammen,
              siehst du es sofort. Was du verschiebst, entscheidest du.
            </p>
            <p className="mt-4 text-sm text-ink/65 leading-relaxed">
              Kostenlos, ohne Anmeldung.{' '}
              <Link
                to={ARTICLE_PATH}
                className="font-display font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
              >
                Warum erst ankommen
              </Link>
            </p>
          </header>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
            <div className="space-y-12 min-w-0">
              <Step n={1} id="np-step-1" title="Wann ist Schule aus?">
                <p className="text-sm text-ink/70 leading-relaxed">
                  Wann holst du dein Kind ab, oder wann ist es zu Hause? Geht es in die OGS, nimm das
                  Ende der OGS. Einen Tag ohne Zeit lässt du einfach offen.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {WEEKDAYS.map((day) => (
                    <label
                      key={day.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border-[2.5px] border-ink/15 bg-white px-4 py-2.5"
                    >
                      <span className="font-display font-bold text-lg text-ink">{day.label}</span>
                      <TimeSelect
                        label={`${day.label}: Schule aus um`}
                        value={plan.days[day.id].end}
                        times={END_TIMES}
                        empty="offen"
                        onChange={(end) => update((prev) => setEnd(prev, day.id, end))}
                      />
                    </label>
                  ))}
                </div>
                {firstEnd && !allSame && (
                  <button
                    type="button"
                    onClick={() => update((prev) => setEndForAll(prev, firstEnd))}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-5 py-2.5 font-display font-bold text-sm text-ink transition-transform hover:-translate-y-0.5"
                  >
                    {firstEnd} Uhr für alle Tage übernehmen
                  </button>
                )}
              </Step>

              <Step n={2} id="np-step-2" title="Hausaufgaben und Termine">
                <p className="text-sm text-ink/70 leading-relaxed">
                  Für jeden Tag: Wo passieren die Hausaufgaben, und gibt es einen festen Termin? Was
                  du leer lässt, kommt nicht aufs Blatt.
                </p>
                <div className="mt-5 space-y-4">
                  {WEEKDAYS.map((day) => (
                    <DayFields
                      key={day.id}
                      day={day.id}
                      label={day.label}
                      plan={plan}
                      draft={drafts[day.id]}
                      problems={problemsOn(problems, day.id)}
                      update={update}
                      onOwn={(text) => changeOwn(day.id, text)}
                      onKindChange={() => setDrafts((prev) => ({ ...prev, [day.id]: '' }))}
                    />
                  ))}
                </div>
              </Step>

              <Step n={3} id="np-step-3" title="Für euch alle">
                <div className="space-y-8">
                  <div role="group" aria-labelledby="np-arrive-title">
                    <h3 id="np-arrive-title" className="font-display font-bold text-xl text-ink">
                      Wie lange braucht dein Kind zum Ankommen?
                    </h3>
                    <p className="mt-1 text-sm text-ink/70 leading-relaxed">
                      Essen, trinken, bewegen, bevor die Hausaufgaben kommen. Du kennst dein Kind:
                      Nimm die Zeit, die bei euch passt.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ARRIVE_MINUTES.map((minutes) => (
                        <Pill
                          key={minutes}
                          pressed={plan.arrive === minutes}
                          onClick={() =>
                            update((prev) => setArrive(prev, prev.arrive === minutes ? null : minutes))
                          }
                        >
                          {minutes} Minuten
                        </Pill>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="np-dinner" className="font-display font-bold text-xl text-ink">
                      Wann gibt es Abendessen?
                    </label>
                    <p className="mt-1 text-sm text-ink/70 leading-relaxed">
                      Freiwillig. Steht hier eine Zeit, zeigt dir der Plan, wenn etwas bis ins
                      Abendessen reicht.
                    </p>
                    <div className="mt-3">
                      <TimeSelect
                        id="np-dinner"
                        value={plan.dinner}
                        times={DINNER_TIMES}
                        empty="keine feste Zeit"
                        onChange={(dinner) => update((prev) => setDinner(prev, dinner))}
                      />
                    </div>
                  </div>

                  <div role="group" aria-labelledby="np-knack-title">
                    <h3 id="np-knack-title" className="font-display font-bold text-xl text-ink">
                      Wo hakt es bei den Hausaufgaben am meisten?
                    </h3>
                    <p className="mt-1 text-sm text-ink/70 leading-relaxed">
                      Freiwillig. Such einen Punkt aus. Der Satz dazu kommt auf eine eigene Karte,
                      für dich und dein Kind.
                    </p>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {KNACKS.map((knack) => {
                        const pressed = plan.knack === knack.id;
                        return (
                          <button
                            key={knack.id}
                            type="button"
                            aria-pressed={pressed}
                            onClick={() =>
                              update((prev) => setKnack(prev, prev.knack === knack.id ? null : knack.id))
                            }
                            className={`rounded-[22px] border-[2.5px] p-4 text-left transition-colors ${
                              pressed ? 'border-ink bg-sky-wash/60' : 'border-ink/15 bg-white hover:border-ink/50'
                            }`}
                          >
                            <span className="block font-display font-bold text-lg text-ink leading-tight">
                              {knack.label}
                            </span>
                            <span className="mt-1 block text-sm text-ink/70 leading-relaxed">
                              {knack.description}
                            </span>
                            <span className="mt-2 block text-sm text-ink leading-relaxed">
                              Auf der Karte: „{knack.sentence}“
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Step>
            </div>

            <aside className="min-w-0 lg:sticky lg:top-6" aria-label="Vorschau und Drucken">
              <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-3">Vorschau</p>
              <ScaledPreview>
                <NachmittagsplanSheet plan={plan} unfit={unfitDays} />
              </ScaledPreview>
              <p className="mt-3 text-sm text-ink/65 leading-relaxed">
                Eine Seite A4. Oben eure Woche, unten zum Ausschneiden die Ankommen-Karte für dein
                Kind und, wenn du einen Punkt ausgesucht hast, euer Satz für die Hausaufgaben.
              </p>

              <div className="mt-5" data-fit-summary role="status" aria-live="polite">
                {!fits && (
                  <div className="rounded-[22px] border-[2.5px] border-dashed border-cobalt bg-white p-4">
                    <p className="font-display font-bold text-base text-ink">
                      Das passt noch nicht zusammen:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink/80 leading-relaxed">
                      {problems.map((problem) => (
                        <li key={`${problem.day}-${problem.rule}-${problem.message}`}>{problem.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePrint('blatt')}
                  disabled={!fits}
                  aria-describedby={fits ? undefined : 'np-print-blocked'}
                  className="bb-press bb-press--night inline-flex items-center gap-2 rounded-full bg-cobalt px-6 py-3 font-display font-bold text-base text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg aria-hidden viewBox="0 0 64 64" className="h-5 w-5">
                    <use href="#bb-printer" />
                  </svg>
                  Drucken
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint('wochenplan')}
                  disabled={!fits}
                  aria-describedby={fits ? undefined : 'np-print-blocked'}
                  className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-5 py-2.5 text-left font-display font-bold text-sm text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Nur den Wochenplan drucken (für Oma, Opa oder den Hort)
                </button>
              </div>
              {!fits && (
                <p id="np-print-blocked" className="mt-3 text-sm font-semibold text-ink leading-relaxed">
                  {PRINT_BLOCKED}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-5 py-2.5 font-display font-bold text-sm text-ink transition-transform hover:-translate-y-0.5"
                >
                  Link kopieren
                </button>
                {canShare && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-5 py-2.5 font-display font-bold text-sm text-ink transition-transform hover:-translate-y-0.5"
                  >
                    Teilen
                  </button>
                )}
                <span role="status" aria-live="polite" className="min-h-[1.5rem]">
                  {copied && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sun px-3 py-1 font-display font-bold text-sm text-ink">
                      <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4">
                        <use href="#bb-check" />
                      </svg>
                      Kopiert
                    </span>
                  )}
                </span>
              </div>
              <p className="mt-4 text-sm text-ink/65 leading-relaxed">
                Der Link ist euer Plan, zum Weiterschicken oder für später. {LINK_NOTE}
              </p>
            </aside>
          </div>

          <div className="mt-16 max-w-3xl rounded-[22px] border-[2.5px] border-ink bg-sky-wash/50 p-5 sm:p-6">
            <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
              Und danach? Für den Abend gibt es{' '}
              <Link
                to="/vorlagen/abendroutine"
                className="font-display font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
              >
                die Abendroutine zum Ausdrucken
              </Link>
              . Mehr dazu, warum Ankommen vor den Hausaufgaben kommt:{' '}
              <Link
                to={ARTICLE_PATH}
                className="font-display font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
              >
                Warum erst ankommen
              </Link>
              .
            </p>
            <p className="mt-4 text-sm sm:text-base text-ink/80 leading-relaxed">
              Ronki ist unsere kostenlose App für Kinder, ohne E-Mail und ohne Werbung.
            </p>
            <Link
              to="/profil-erstellen"
              className="bb-press mt-3 inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-sun px-6 py-3 font-display font-bold text-base text-ink"
            >
              Kostenlose Ronki-Karte erstellen
              <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4">
                <use href="#bb-arrow" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {typeof document !== 'undefined' &&
        createPortal(
          <div className="np-print" data-variant={printVariant} aria-hidden>
            {fits ? (
              <>
                <div className="np-print-blatt">
                  <NachmittagsplanSheet plan={plan} variant="blatt" />
                </div>
                <div className="np-print-wochenplan">
                  <NachmittagsplanSheet plan={plan} variant="wochenplan" />
                </div>
              </>
            ) : (
              <p className="np-print-unfit">
                Dieser Nachmittagsplan passt noch nicht zusammen. Ändere die Zeiten auf der Seite,
                dann kannst du ihn drucken.
              </p>
            )}
          </div>,
          document.body,
        )}
    </PainterlyShell>
  );
}

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

function Step({
  n,
  id,
  title,
  children,
}: {
  n: number;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <span
          aria-hidden
          className="bb-hand flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-sun text-2xl leading-none text-ink"
        >
          {n}
        </span>
        <h2 id={id} className="bb-display text-2xl sm:text-3xl text-ink">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** A time picked from a list, or the empty choice. */
function TimeSelect({
  id,
  label,
  value,
  times,
  empty,
  disabled = false,
  onChange,
}: {
  id?: string;
  label?: string;
  value: string | null;
  times: readonly string[];
  empty: string;
  disabled?: boolean;
  onChange: (time: string | null) => void;
}) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value ?? ''}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value || null)}
      className="rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 font-display font-semibold text-base text-ink focus:border-cobalt focus:outline-none disabled:opacity-40"
    >
      <option value="">{empty}</option>
      {times.map((time) => (
        <option key={time} value={time}>
          {time} Uhr
        </option>
      ))}
    </select>
  );
}

/** A choice you tap on and off. */
function Pill({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border-[2.5px] px-4 py-2 font-display font-semibold text-sm transition-colors ${
        pressed ? 'border-ink bg-sky-wash text-ink' : 'border-ink/15 bg-white text-ink/70 hover:border-ink/50'
      }`}
    >
      {children}
    </button>
  );
}

function DayFields({
  day,
  label,
  plan,
  draft,
  problems,
  update,
  onOwn,
  onKindChange,
}: {
  day: WeekdayId;
  label: string;
  plan: AfternoonPlan;
  draft: string;
  problems: FitProblem[];
  update: (change: (prev: AfternoonPlan) => AfternoonPlan) => void;
  onOwn: (text: string) => void;
  onKindChange: () => void;
}) {
  const { homework, appointment } = plan.days[day];
  const home = homework?.where === 'home' ? homework : null;
  const froms = AFTERNOON_TIMES.slice(0, -1);

  return (
    <fieldset
      aria-labelledby={`np-day-${day}`}
      data-day-fields={day}
      className={`rounded-[22px] border-[2.5px] p-3 sm:p-5 ${problems.length ? 'border-dashed border-cobalt' : 'border-ink/15'}`}
    >
      <h3 id={`np-day-${day}`} className="font-display font-bold text-xl text-ink leading-none">
        {label}
      </h3>

      {problems.length > 0 && (
        <ul data-fit-day={day} className="mt-3 space-y-1.5">
          {problems.map((problem) => (
            <li
              key={`${problem.rule}-${problem.message}`}
              className="rounded-xl bg-sun/60 px-3 py-2 text-sm text-ink leading-relaxed"
            >
              {problem.message}
            </li>
          ))}
        </ul>
      )}

      <div role="group" aria-label={`Hausaufgaben am ${label}`} className="mt-4">
        <p className="font-display font-semibold text-sm text-ink/75">Hausaufgaben</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HOMEWORK_OPTIONS.map((option) => (
            <Pill
              key={option.where}
              pressed={homework?.where === option.where}
              onClick={() =>
                update((prev) =>
                  setHomeworkWhere(prev, day, prev.days[day].homework?.where === option.where ? null : option.where),
                )
              }
            >
              {option.label}
            </Pill>
          ))}
        </div>
        {home && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 font-display font-semibold text-sm text-ink/75">
              Um
              <TimeSelect
                label={`${label}: Hausaufgaben um`}
                value={home.at}
                times={AFTERNOON_TIMES}
                empty="Uhrzeit"
                onChange={(at) => update((prev) => setHomeworkAt(prev, day, at))}
              />
            </label>
            <label className="flex items-center gap-2 font-display font-semibold text-sm text-ink/75">
              Wie lange?
              <select
                aria-label={`${label}: Hausaufgaben wie lange`}
                value={home.minutes ?? ''}
                onChange={(event) =>
                  update((prev) => setHomeworkMinutes(prev, day, event.target.value ? Number(event.target.value) : null))
                }
                className="rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 font-display font-semibold text-base text-ink focus:border-cobalt focus:outline-none"
              >
                <option value="">ohne Angabe</option>
                {HOMEWORK_MINUTES.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} Min.
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <div role="group" aria-label={`Termin am ${label}`} className="mt-5">
        <p className="font-display font-semibold text-sm text-ink/75">Ein fester Termin?</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {APPOINTMENT_KINDS.map((kind) => {
            const pressed = appointment?.kind === kind.id;
            return (
              <button
                key={kind.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => {
                  if (kind.id !== 'eigen' || pressed) onKindChange();
                  update((prev) =>
                    setAppointmentKind(prev, day, prev.days[day].appointment?.kind === kind.id ? null : kind.id),
                  );
                }}
                className={`relative flex min-w-0 flex-col items-center gap-1 rounded-2xl border-[2.5px] px-1.5 pb-2 pt-2.5 text-center font-display font-semibold text-xs leading-tight sm:text-sm transition-colors ${
                  pressed ? 'border-ink bg-sky-wash text-ink' : 'border-ink/15 bg-white text-ink/65 hover:border-ink/50'
                }`}
              >
                {kind.img ? (
                  <img
                    src={`${TASK_ART_PATH}${kind.img}`}
                    alt=""
                    width={64}
                    height={64}
                    draggable={false}
                    className={`h-10 w-10 object-contain transition-opacity ${pressed ? '' : 'opacity-45'}`}
                  />
                ) : (
                  <span aria-hidden className="h-10 w-10 rounded-lg border-2 border-dashed border-ink/40" />
                )}
                <span className="block max-w-full">{kind.label}</span>
              </button>
            );
          })}
        </div>

        {appointment && (
          <div className="mt-3 space-y-3">
            {appointment.kind === 'eigen' && (
              <div>
                <label className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="font-display font-semibold text-sm text-ink/75">Was?</span>
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) => onOwn(event.target.value)}
                    maxLength={OWN_TEXT_MAX}
                    aria-label={`Eigener Termin am ${label}`}
                    placeholder="z. B. Fußball"
                    autoComplete="off"
                    className="min-w-0 flex-1 basis-48 rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 text-base text-ink placeholder:text-ink/40 focus:border-cobalt focus:outline-none"
                  />
                </label>
                <p className="mt-2 text-sm text-ink/65 leading-relaxed">
                  {OWN_NOTE} Kennen wir das Wort, kommt ein Bild aufs Blatt. Sonst bleibt ein leeres
                  Feld, in das dein Kind selbst malt.
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <label className="flex items-center gap-2 font-display font-semibold text-sm text-ink/75">
                Von
                <TimeSelect
                  label={`${label}: Termin von`}
                  value={appointment.from}
                  times={froms}
                  empty="Uhrzeit"
                  onChange={(from) => update((prev) => setAppointmentFrom(prev, day, from))}
                />
              </label>
              <label className="flex items-center gap-2 font-display font-semibold text-sm text-ink/75">
                bis
                <TimeSelect
                  label={`${label}: Termin bis`}
                  value={appointment.to}
                  times={appointmentEndTimes(appointment.from)}
                  empty="Uhrzeit"
                  disabled={!appointment.from}
                  onChange={(to) => update((prev) => setAppointmentTo(prev, day, to))}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
}

/**
 * The A4 sheet at its real size, scaled down to the column. The sheet keeps
 * its print layout, so the preview shows exactly what the printer gets.
 */
function ScaledPreview({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / A4_WIDTH_PX);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      data-testid="np-preview"
      className="relative overflow-hidden rounded-xl border-[3px] border-ink bg-white"
      style={{ height: Math.round(A4_HEIGHT_PX * scale) }}
    >
      <div
        className="absolute left-0 top-0"
        style={{ width: A4_WIDTH_PX, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {children}
      </div>
    </div>
  );
}

/*
 * Only while this page is mounted: print nothing but the unscaled sheet in
 * the portal, and of that only the variant the parent chose. A stylesheet
 * import would stay in the document after leaving the page and hide every
 * other page from the printer.
 */
const printCss = `
  .np-print { display: none; }
  @media print {
    body > *:not(.np-print) { display: none !important; }
    .np-print { display: block !important; }
    .np-print[data-variant='blatt'] .np-print-wochenplan,
    .np-print[data-variant='wochenplan'] .np-print-blatt { display: none !important; }
    .np-print-unfit { margin: 20mm; font: 600 16pt 'Fredoka', system-ui, sans-serif; color: #040812; }
  }
`;
