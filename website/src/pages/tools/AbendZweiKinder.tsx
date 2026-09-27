/**
 * /tools/abend-mit-zwei-kindern: one adult, two children, two bedtimes.
 *
 * Per child (Stern-Kind and Mond-Kind, no names) the evening steps from the
 * evening kit with minutes, a lights-out time and a "braucht dich" mark per
 * step; on top the number of adults and the steps done with both children
 * at once. With one adult, every moment both children need the adult is
 * shown next to both children and above the print button, and the plan
 * cannot be printed until the parent changes it. The tool never moves
 * anything by itself, predicts no sleep and never compares the children.
 *
 * Same shape as the Nachmittagsplan: the plan lives only in the address
 * bar (history.replaceState on every change), so the address bar is always
 * the share link and opening a link restores the plan; a popstate listener
 * restores plan and typed drafts on back and forward. Nothing is stored.
 * Analytics count that the tool was used, prints and shares, never the plan.
 *
 * Printing: the preview is a scaled copy of the A4 sheet. An unscaled copy
 * sits in a portal on <body>; the page's print style hides everything else,
 * so a print gives exactly one A4 page. While anything clashes, the portal
 * holds a short note instead of the sheet.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { SheetPageStyle, TASK_ART_PATH } from '../../components/sheet';
import { AbendZweiKinderSheet } from '../../components/abend-zwei-kinder/AbendZweiKinderSheet';
import { trackEvent } from '../../lib/analytics';
import { copyText } from '../../lib/clipboard';
import { OWN_STEP_MAX, cleanOwnText, clockLabel, isEndStep } from '../../lib/routine-builder/kit';
import {
  CHILDREN,
  KIT,
  LIGHTS_OUT_TIMES,
  MAX_MINUTES,
  MIN_MINUTES,
  NEEDS_PICTURE,
  OWN_STEP_CODE,
  SHARE_TEXT,
  STEPS,
  addOwnStep,
  addStep,
  canAddStep,
  canMoveStep,
  checkClash,
  decodePlan,
  encodePlan,
  moveStep,
  removeStep,
  setAdults,
  setLightsOut,
  setOwn,
  setStepMinutes,
  sharedSteps,
  shortClash,
  stepLabel,
  stepPicture,
  stepStarts,
  toRoutine,
  toggleNeeds,
  toggleTogether,
  type ChildId,
  type Clash,
  type TwoChildPlan,
} from '../../lib/abend-zwei-kinder';

const PAGE_PATH = '/tools/abend-mit-zwei-kindern';
const EVENING_TEMPLATE_PATH = '/vorlagen/abendroutine';
const BEDTIME_PATH = '/tools/schlafens-rechner';
const ARTICLE_PATH = '/ratgeber/abendroutine-zwei-kinder';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Abend mit zwei Kindern: wer braucht wann deine Hilfe? · Ronki';
const META_DESCRIPTION =
  'Zwei Kinder, ein Erwachsener: Leg beide Abende nebeneinander und sieh, wann dich beide zugleich brauchen. Ein A4-Blatt, kostenlos, ohne Anmeldung.';

export const LINK_NOTE =
  'Der Plan steht nur im Link, gespeichert wird nichts. Im Link stehen eure Schritte, Zeiten und eigenen Schritte, und alle mit dem Link können das lesen. Schick ihn an die Person, die mit dir die Kinder ins Bett bringt, etwa deinen Partner, deine Partnerin oder den Babysitter.';
const OWN_NOTE =
  'Trag nur einen Schritt ein, keine Namen: Der Text steht auch im Link. Kennen wir das Wort, kommt ein Bild aufs Blatt. Sonst bleibt ein leeres Feld, in das dein Kind selbst malt.';
export const PRINT_BLOCKED = 'Drucken geht, sobald alles zusammenpasst. Ändere dafür oben Zeiten oder Schritte.';
export const TWO_ADULTS_NOTE =
  'Ihr seid zu zweit: Jeder von euch kann ein Kind ins Bett bringen. Nur was ihr mit beiden zusammen macht, muss bei beiden zur selben Zeit sein.';
const NOTHING_MARKED = 'Tipp bei den Schritten an, wobei ein Kind dich braucht. Dann siehst du hier, ob sich etwas überschneidet.';
const ALL_CLEAR = 'Passt: Nach eurem Plan brauchen dich die beiden nie zur selben Zeit.';

/** A4 at 96 dpi, the size the sheet is laid out at (sheet.css: 210 x 296 mm). */
const A4_WIDTH_PX = 793.7;
const A4_HEIGHT_PX = 1118.7;

type Drafts = Record<ChildId, string>;

function draftsFrom(plan: TwoChildPlan): Drafts {
  return { s: plan.children.s.own, m: plan.children.m.own };
}

export default function AbendZweiKinder() {
  const [plan, setPlan] = useState<TwoChildPlan>(() =>
    decodePlan(typeof window === 'undefined' ? '' : window.location.search),
  );
  // What the parent types into an own step, spaces and all. The plan keeps the cleaned text.
  const [drafts, setDrafts] = useState<Drafts>(() => draftsFrom(plan));
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
  );
  const copiedTimer = useRef<number | undefined>(undefined);
  const counted = useRef(false);

  const query = encodePlan(plan);
  const shareUrl = `${typeof window === 'undefined' ? 'https://www.ronki.de' : window.location.origin}${PAGE_PATH}${query ? `?${query}` : ''}`;
  const clashes = checkClash(plan);
  const fits = clashes.length === 0;
  const anyNeeds = plan.children.s.needs.length > 0 || plan.children.m.needs.length > 0;
  const shared = sharedSteps(plan);

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
  const update = useCallback((change: (prev: TwoChildPlan) => TwoChildPlan) => {
    setPlan(change);
    if (!counted.current) {
      counted.current = true;
      trackEvent('Abend mit zwei Kindern erstellt');
    }
  }, []);

  function changeOwn(id: ChildId, text: string) {
    setDrafts((prev) => ({ ...prev, [id]: text }));
    update((prev) => setOwn(prev, id, text));
  }

  function handlePrint() {
    if (!fits) return;
    trackEvent('Abend mit zwei Kindern Drucken');
    window.print();
  }

  async function handleCopy() {
    if (!(await copyText(shareUrl))) return;
    trackEvent('Abend mit zwei Kindern Link', { weg: 'kopiert' });
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    try {
      await navigator.share({ title: 'Abend mit zwei Kindern', text: SHARE_TEXT, url: shareUrl });
      trackEvent('Abend mit zwei Kindern Link', { weg: 'geteilt' });
    } catch {
      // Closed the share sheet, or the browser refused. Nothing to do.
    }
  }

  return (
    <PainterlyShell>
      <PageMeta
        title={META_TITLE}
        description={META_DESCRIPTION}
        canonicalPath={PAGE_PATH}
        ogImage="/og-tool-abend-zwei-kinder.jpg"
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
              Abend mit zwei Kindern: wer braucht wann deine Hilfe?
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
              Zwei Kinder, zwei Abende, und du bist nur einmal da. Hier legst du beide Abende
              nebeneinander: welche Schritte, wie lange, wann Licht aus ist und wobei ein Kind dich
              braucht. Brauchen dich beide im selben Moment, siehst du es sofort. Was du verschiebst,
              entscheidest du.
            </p>
            <p className="mt-4 text-base text-ink/75 leading-relaxed max-w-2xl">
              Der Plan sagt nicht, wann ein Kind einschläft. Und er ist kein Wettrennen zwischen den
              beiden: Er zeigt nur, wann du wo gebraucht wirst.
            </p>
            <p className="mt-4 text-sm text-ink/65 leading-relaxed max-w-2xl">
              Eure Kinder heißen hier Stern-Kind und Mond-Kind. Welches Kind ist Stern, welches Mond,
              entscheidet ihr. Kostenlos, ohne Anmeldung.
            </p>
          </header>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
            <div className="space-y-12 min-w-0">
              <Step n={1} id="az-step-1" title="Wie viele Erwachsene sind abends da?">
                <div role="group" aria-labelledby="az-step-1" className="flex flex-wrap gap-2">
                  <Pill pressed={plan.adults === 1} onClick={() => update((prev) => setAdults(prev, 1))}>
                    Einer
                  </Pill>
                  <Pill pressed={plan.adults === 2} onClick={() => update((prev) => setAdults(prev, 2))}>
                    Zwei
                  </Pill>
                </div>
                <p className="mt-3 text-sm text-ink/70 leading-relaxed">
                  {plan.adults === 2
                    ? 'Dann kann jeder von euch ein Kind ins Bett bringen.'
                    : 'Du bist allein mit beiden. Dann zeigt der Plan, wann dich beide zugleich brauchen.'}
                </p>
              </Step>

              {CHILDREN.map((child, i) => (
                <Step
                  key={child.id}
                  n={i + 2}
                  id={`az-step-${child.id}`}
                  title={child.name}
                  img={child.img}
                >
                  <ChildBuilder
                    id={child.id}
                    name={child.name}
                    plan={plan}
                    draft={drafts[child.id]}
                    clashes={clashes}
                    update={update}
                    onOwn={(text) => changeOwn(child.id, text)}
                    onOwnGone={() => setDrafts((prev) => ({ ...prev, [child.id]: '' }))}
                  />
                </Step>
              ))}

              {shared.length > 0 && (
                <Step n={4} id="az-step-together" title="Was macht ihr zusammen?">
                  <p className="text-sm text-ink/70 leading-relaxed">
                    Machst du einen Schritt mit beiden Kindern zugleich, etwa Vorlesen im selben Bett?
                    Dann tipp ihn an. Er braucht dich dann bei beiden, und er muss bei beiden zur selben
                    Zeit sein.
                  </p>
                  <div
                    role="group"
                    aria-label="Was macht ihr zusammen?"
                    className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5"
                  >
                    {shared.map((code) => {
                      const step = STEPS.find((s) => s.code === code)!;
                      const pressed = plan.together.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => update((prev) => toggleTogether(prev, code))}
                          className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl border-[2.5px] px-1.5 pb-2 pt-2.5 text-center font-display font-semibold text-xs leading-tight sm:text-sm transition-colors ${
                            pressed ? 'border-ink bg-sky-wash text-ink' : 'border-ink/15 bg-white text-ink/70 hover:border-ink/50'
                          }`}
                        >
                          <img
                            src={`${TASK_ART_PATH}${step.img}`}
                            alt=""
                            width={64}
                            height={64}
                            draggable={false}
                            className={`h-10 w-10 object-contain ${pressed ? '' : 'opacity-60'}`}
                          />
                          <span className="block max-w-full">{step.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Step>
              )}
            </div>

            <aside className="min-w-0 lg:sticky lg:top-6" aria-label="Vorschau und Drucken">
              <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-3">Vorschau</p>
              <ScaledPreview>
                <AbendZweiKinderSheet plan={plan} clashes={clashes} />
              </ScaledPreview>
              <p className="mt-3 text-sm text-ink/65 leading-relaxed">
                Eine Seite A4. Oben euer Abend für dich, auf die Minute. Unten zum Ausschneiden eine
                Karte für jedes Kind, mit Zeiten auf fünf Minuten abgerundet. Häng jede Karte dort auf,
                wo das Kind seinen Abend macht.
              </p>

              <div className="mt-5" data-clash-summary role="status" aria-live="polite">
                {plan.adults === 2 && (
                  <p className="rounded-[22px] border-[2.5px] border-ink/15 bg-white p-4 text-sm font-semibold text-ink leading-relaxed">
                    {TWO_ADULTS_NOTE}
                  </p>
                )}
                {!fits && (
                  <div className="mt-3 rounded-[22px] border-[2.5px] border-dashed border-cobalt bg-white p-4">
                    <p className="font-display font-bold text-base text-ink">Das passt noch nicht:</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink/80 leading-relaxed">
                      {clashes.map((clash) => (
                        <li key={clash.message}>{clash.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {fits && plan.adults === 1 && (
                  <p className="rounded-[22px] border-[2.5px] border-ink/15 bg-white p-4 text-sm text-ink/80 leading-relaxed">
                    {anyNeeds ? ALL_CLEAR : NOTHING_MARKED}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!fits}
                  aria-describedby={fits ? undefined : 'az-print-blocked'}
                  className="bb-press bb-press--night inline-flex items-center gap-2 rounded-full bg-cobalt px-6 py-3 font-display font-bold text-base text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg aria-hidden viewBox="0 0 64 64" className="h-5 w-5">
                    <use href="#bb-printer" />
                  </svg>
                  Drucken
                </button>
              </div>
              {!fits && (
                <p id="az-print-blocked" className="mt-3 text-sm font-semibold text-ink leading-relaxed">
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
              <p className="mt-4 text-sm text-ink/65 leading-relaxed">{LINK_NOTE}</p>
            </aside>
          </div>

          <div className="mt-16 max-w-3xl rounded-[22px] border-[2.5px] border-ink bg-sky-wash/50 p-5 sm:p-6">
            <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
              Nur ein Kind am Abend? Dann passt{' '}
              <Link
                to={EVENING_TEMPLATE_PATH}
                className="font-display font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
              >
                die Abendroutine zum Ausdrucken
              </Link>
              . Welche Licht-aus-Zeit zum Alter passt, rechnet dir{' '}
              <Link
                to={BEDTIME_PATH}
                className="font-display font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
              >
                der Schlafens-Rechner
              </Link>{' '}
              aus.
            </p>
            <p className="mt-4 text-sm sm:text-base text-ink/80 leading-relaxed">
              Warum nicht jeder Schritt dich braucht, steht im Ratgeber{' '}
              <Link
                to={ARTICLE_PATH}
                className="font-display font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
              >
                Abendroutine mit zwei Kindern
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
          <div className="az-print" aria-hidden>
            {fits ? (
              <AbendZweiKinderSheet plan={plan} />
            ) : (
              <p className="az-print-unfit">
                Dieser Abend passt noch nicht zusammen. Ändere die Zeiten oder Schritte auf der Seite,
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
  img,
  children,
}: {
  n: number;
  id: string;
  title: string;
  img?: string;
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
        {img && (
          <img
            src={`${TASK_ART_PATH}${img}`}
            alt=""
            width={64}
            height={64}
            draggable={false}
            className="h-10 w-10 shrink-0 object-contain"
          />
        )}
        <h2 id={id} className="bb-display text-2xl sm:text-3xl text-ink">
          {title}
        </h2>
      </div>
      {children}
    </section>
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
      className={`rounded-full border-[2.5px] px-5 py-2 font-display font-semibold text-base transition-colors ${
        pressed ? 'border-ink bg-sky-wash text-ink' : 'border-ink/15 bg-white text-ink/70 hover:border-ink/50'
      }`}
    >
      {children}
    </button>
  );
}

function ChildBuilder({
  id,
  name,
  plan,
  draft,
  clashes,
  update,
  onOwn,
  onOwnGone,
}: {
  id: ChildId;
  name: string;
  plan: TwoChildPlan;
  draft: string;
  clashes: Clash[];
  update: (change: (prev: TwoChildPlan) => TwoChildPlan) => void;
  onOwn: (text: string) => void;
  onOwnGone: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const child = plan.children[id];
  const routine = toRoutine(child);
  const times = stepStarts(plan, id);
  const full = !canAddStep(plan, id);
  const hasOwn = child.steps.includes(OWN_STEP_CODE);
  const missing = STEPS.filter((step) => !child.steps.includes(step.code));
  // Every clash is about both children, so both sections show it.
  const mine = clashes;
  const addId = `az-add-${id}`;
  const ownId = `az-own-${id}`;
  const ausId = `az-aus-${id}`;

  return (
    <div
      data-child={id}
      className={`rounded-[28px] border-[3px] p-2.5 sm:p-5 ${mine.length ? 'border-dashed border-cobalt' : 'border-ink'}`}
    >
      {mine.length > 0 && (
        <ul data-clash-child={id} className="mb-4 space-y-1.5">
          {mine.map((clash) => (
            <li key={clash.message} className="rounded-xl bg-sun/60 px-3 py-2 text-sm font-semibold text-ink leading-relaxed">
              {shortClash(clash)}
            </li>
          ))}
          <li className="px-1 text-sm text-ink/70 leading-relaxed">Was du tun kannst, steht über dem Drucken.</li>
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={ausId} className="font-display font-semibold text-base text-ink">
          Wann ist Licht aus?
        </label>
        <select
          id={ausId}
          aria-label={`${name}: Wann ist Licht aus?`}
          value={child.lightsOut}
          onChange={(event) => update((prev) => setLightsOut(prev, id, event.target.value))}
          className="rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 font-display font-semibold text-base text-ink focus:border-cobalt focus:outline-none"
        >
          {LIGHTS_OUT_TIMES.map((time) => (
            <option key={time} value={time}>
              {clockLabel(time)} Uhr
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-ink/70 leading-relaxed">
        Bis zu sechs Schritte, in eurer Reihenfolge. Wir rechnen vom Lichtausmachen rückwärts. Tipp
        bei jedem Schritt an, ob dein Kind dich dabei braucht.
      </p>

      <ol aria-label={`Schritte: ${name}`} className="mt-3 space-y-2">
        {child.steps.map((code, index) => (
          <StepRow
            key={code}
            id={id}
            name={name}
            plan={plan}
            code={code}
            index={index}
            start={times[index]}
            isEnd={isEndStep(KIT, routine, index)}
            draft={draft}
            update={update}
            onOwn={onOwn}
            onOwnGone={onOwnGone}
          />
        ))}
      </ol>
      {hasOwn && <p className="mt-2 text-sm text-ink/65 leading-relaxed">{OWN_NOTE}</p>}

      <div className="mt-4">
        <button
          type="button"
          aria-expanded={adding && !full}
          aria-controls={addId}
          disabled={full}
          onClick={() => setAdding((open) => !open)}
          aria-label={`${name}: Schritt dazunehmen`}
          className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-5 py-2.5 font-display font-bold text-sm text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4">
            <use href="#bb-plus" />
          </svg>
          Schritt dazunehmen
        </button>
        {full && (
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Sechs Schritte passen auf die Karte. Nimm einen raus, wenn du einen anderen willst.
          </p>
        )}
      </div>

      {adding && !full && (
        <div id={addId} className="mt-3 rounded-[22px] border-[2.5px] border-ink/15 p-3 sm:p-4">
          {missing.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {missing.map((step) => (
                <button
                  key={step.code}
                  type="button"
                  aria-label={`${name}: ${step.label} dazunehmen`}
                  onClick={() => update((prev) => addStep(prev, id, step.code))}
                  className="flex min-w-0 flex-col items-center gap-1 rounded-2xl border-[2.5px] border-ink/15 bg-white px-1.5 pb-2 pt-2.5 text-center font-display font-semibold text-xs sm:text-sm leading-tight text-ink/80 transition-colors hover:border-ink/50"
                >
                  <img
                    src={`${TASK_ART_PATH}${step.img}`}
                    alt=""
                    width={64}
                    height={64}
                    draggable={false}
                    className="h-10 w-10 object-contain"
                  />
                  <span aria-hidden className="block max-w-full">
                    {step.label}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!hasOwn && (
            <div className={missing.length > 0 ? 'mt-4' : ''}>
              <label htmlFor={ownId} className="font-display font-semibold text-sm text-ink/75">
                Eigener Schritt
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <input
                  id={ownId}
                  type="text"
                  value={draft}
                  onChange={(event) => onOwn(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && cleanOwnText(draft)) update((prev) => addOwnStep(prev, id, draft));
                  }}
                  maxLength={OWN_STEP_MAX}
                  placeholder="z. B. Medizin nehmen"
                  autoComplete="off"
                  className="min-w-0 flex-1 basis-40 rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 text-base text-ink placeholder:text-ink/40 focus:border-cobalt focus:outline-none"
                />
                <button
                  type="button"
                  aria-label={`${name}: eigenen Schritt dazunehmen`}
                  disabled={!cleanOwnText(draft)}
                  onClick={() => update((prev) => addOwnStep(prev, id, draft))}
                  className="rounded-full border-[2.5px] border-ink bg-white px-4 py-2 font-display font-bold text-sm text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Dazunehmen
                </button>
              </div>
              <p className="mt-2 text-sm text-ink/65 leading-relaxed">{OWN_NOTE}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepRow({
  id,
  name,
  plan,
  code,
  index,
  start,
  isEnd,
  draft,
  update,
  onOwn,
  onOwnGone,
}: {
  id: ChildId;
  name: string;
  plan: TwoChildPlan;
  code: string;
  index: number;
  start?: string;
  isEnd: boolean;
  draft: string;
  update: (change: (prev: TwoChildPlan) => TwoChildPlan) => void;
  onOwn: (text: string) => void;
  onOwnGone: () => void;
}) {
  const child = plan.children[id];
  const label = stepLabel(child, code);
  const img = stepPicture(child, code);
  const count = child.steps.length;
  const minutes = child.minutes[index];
  const needs = child.needs.includes(code);
  const together = plan.together.includes(code);

  return (
    <li className="rounded-2xl border-[2.5px] border-ink/15 bg-white p-2 pr-2.5" data-step={code}>
      <div className="flex items-center gap-2">
        <span aria-hidden className="w-4 shrink-0 text-center font-display font-bold text-base text-cobalt">
          {index + 1}
        </span>
        {img ? (
          <img
            src={`${TASK_ART_PATH}${img}`}
            alt=""
            width={64}
            height={64}
            draggable={false}
            className="h-10 w-10 shrink-0 object-contain"
          />
        ) : (
          <span aria-hidden className="h-10 w-10 shrink-0 rounded-lg border-2 border-dashed border-ink/40" />
        )}
        <div className="min-w-0 flex-1">
          {code === OWN_STEP_CODE ? (
            <input
              type="text"
              value={draft}
              onChange={(event) => onOwn(event.target.value)}
              maxLength={OWN_STEP_MAX}
              aria-label={`${name}: eigener Schritt`}
              placeholder="z. B. Medizin nehmen"
              autoComplete="off"
              className="w-full min-w-0 rounded-lg border-2 border-ink/20 bg-white px-2 py-1 font-display font-bold text-base text-ink placeholder:font-normal placeholder:text-ink/40 focus:border-cobalt focus:outline-none"
            />
          ) : (
            <span className="block font-display font-bold text-base leading-tight text-ink">{label}</span>
          )}
          {start && (
            <span className="mt-0.5 block text-sm text-ink/65">
              {isEnd ? 'um' : 'ab'} {start} Uhr
              {together && (
                <span className="ml-1.5 inline-block whitespace-nowrap rounded bg-sky-wash px-1.5 font-display font-semibold text-ink">
                  zusammen
                </span>
              )}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-pressed={needs}
          aria-label={`${name}: ${label} braucht dich`}
          onClick={() => update((prev) => toggleNeeds(prev, id, code))}
          className={`flex w-[60px] shrink-0 flex-col items-center gap-0.5 rounded-2xl border-[2.5px] px-1 pb-1 pt-1.5 text-center font-display font-semibold text-[11px] leading-[1.05] transition-colors ${
            needs ? 'border-ink bg-sun text-ink' : 'border-ink/15 bg-white text-ink/60 hover:border-ink/50'
          }`}
        >
          <img
            src={`${TASK_ART_PATH}${NEEDS_PICTURE}`}
            alt=""
            width={64}
            height={64}
            draggable={false}
            className={`h-6 w-6 object-contain ${needs ? '' : 'opacity-50'}`}
          />
          <span aria-hidden>braucht dich</span>
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-end gap-2">
        {!isEnd && (
          <div className="mr-auto flex items-center gap-1">
            <IconButton
              label={`${name}: ${label}, eine Minute weniger`}
              disabled={minutes <= MIN_MINUTES}
              onClick={() => update((prev) => setStepMinutes(prev, id, index, minutes - 1))}
            >
              <path d="M16 32 H48" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            </IconButton>
            <span className="w-14 text-center font-display font-semibold text-sm text-ink">{minutes} Min.</span>
            <IconButton
              label={`${name}: ${label}, eine Minute mehr`}
              disabled={minutes >= MAX_MINUTES}
              onClick={() => update((prev) => setStepMinutes(prev, id, index, minutes + 1))}
            >
              <use href="#bb-plus" />
            </IconButton>
          </div>
        )}
        <div className="flex gap-1">
          <IconButton
            label={`${name}: ${label} nach oben`}
            disabled={!canMoveStep(plan, id, index, -1)}
            onClick={() => update((prev) => moveStep(prev, id, index, -1))}
          >
            <use href="#bb-arrow" transform="rotate(-90 32 32)" />
          </IconButton>
          <IconButton
            label={`${name}: ${label} nach unten`}
            disabled={!canMoveStep(plan, id, index, 1)}
            onClick={() => update((prev) => moveStep(prev, id, index, 1))}
          >
            <use href="#bb-arrow" transform="rotate(90 32 32)" />
          </IconButton>
          <IconButton
            label={`${name}: ${label} entfernen`}
            disabled={count <= 1}
            onClick={() => {
              if (code === OWN_STEP_CODE) onOwnGone();
              update((prev) => removeStep(prev, id, index));
            }}
          >
            <use href="#bb-cross" />
          </IconButton>
        </div>
      </div>
    </li>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink/25 bg-white text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25"
    >
      <svg aria-hidden viewBox="0 0 64 64" className="h-3.5 w-3.5">
        {children}
      </svg>
    </button>
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
      data-testid="az-preview"
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
 * the portal. A stylesheet import would stay in the document after leaving
 * the page and hide every other page from the printer.
 */
const printCss = `
  .az-print { display: none; }
  @media print {
    body > *:not(.az-print) { display: none !important; }
    .az-print { display: block !important; }
    .az-print-unfit { margin: 20mm; font: 600 16pt 'Fredoka', system-ui, sans-serif; color: #040812; }
  }
`;
