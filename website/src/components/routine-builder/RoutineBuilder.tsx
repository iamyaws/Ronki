/**
 * The routine builder on /vorlagen/morgenroutine and /vorlagen/abendroutine
 * (the kit in `builder.kit` says which).
 *
 * `RoutineBuilderControls` sits above the sheet preview: the chosen steps
 * with buttons to move and remove them, a picture grid to add more, one
 * step in the family's own words and optional clock times.
 * `RoutineBuilderShare` sits under the preview: print, the link and the way
 * into a free Ronki card with the steps the app knows.
 *
 * Everything here is screen-only. "Drucken" prints the sheet exactly as the
 * preview shows it. Analytics count that the builder was used, that the
 * card button was tapped and that the sheet was printed (with times or
 * not, and how they look), never which steps.
 *
 * The morning page also offers clock faces beside the times, names the
 * first time on the sheet with a link to the Schlafens-Rechner, and
 * mentions the clock change in October while it is ahead.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TASK_ART_PATH } from '../sheet';
import { trackEvent } from '../../lib/analytics';
import { copyText } from '../../lib/clipboard';
import {
  CLOCK_STYLES,
  MAX_MINUTES,
  MIN_MINUTES,
  MORNING,
  OWN_STEP_CODE,
  OWN_STEP_MAX,
  canAdd,
  cleanOwnText,
  clockLabel,
  isEndStep,
  kitAddStep,
  kitAppKindsFor,
  kitCardLink,
  kitPrintClockProp,
  kitSetLeave,
  kitStepLabel,
  kitStepPicture,
  kitWakeLine,
  moveStep,
  printedTimes,
  removeStep,
  setMinutes,
  setTimes,
  showClockChangeNote,
  sleepCalculatorLink,
  stepOf,
  type ClockStyle,
  type RoutineKit,
} from '../../lib/routine-builder';
import type { RoutinePlanState } from './useRoutinePlan';

/** Anchor of the builder, for links from the guide on the same page. */
export const BUILDER_ANCHOR = 'eure-schritte';

/** Words that differ between the morning and the evening builder. */
const COPY = {
  morgen: {
    dayPart: 'Morgen',
    ownExample: 'Mütze oder Hausaufgaben',
    timeQuestion: 'Wann müsst ihr los?',
    countBack: 'Wir rechnen rückwärts: Der letzte Schritt ist fertig, wenn ihr losmüsst.',
  },
  abend: {
    dayPart: 'Abend',
    ownExample: 'Kuscheltier oder Buch',
    timeQuestion: 'Wann ist Licht aus?',
    countBack: 'Wir rechnen vom Lichtausmachen rückwärts: Bis dahin sind die Schritte davor fertig.',
  },
} as const;

/** The note under the own step: picture or a box to draw in, and no names. */
export function ownStepNote(kit: RoutineKit): string {
  const copy = COPY[kit.id];
  return `Kennen wir das Wort, etwa ${copy.ownExample}, kommt ein Bild aufs Blatt. Sonst bleibt ein leeres Feld, in das dein Kind vor dem ersten ${copy.dayPart} selbst ein Bild malt. Trag hier nur einen Schritt ein, keine Namen: Der Text steht auch im Link.`;
}

export const OWN_STEP_PRIVACY = ownStepNote(MORNING);

/** The three ways a time can stand on the sheet, as the pills name them. */
const CLOCK_STYLE_LABELS: Record<ClockStyle, string> = {
  zahl: 'Als Zahl',
  uhr: 'Als Uhr',
  beides: 'Beides',
};

export const CLOCK_STYLE_QUESTION = 'Wie steht die Uhrzeit auf dem Blatt?';
export const CLOCK_STYLE_NOTE =
  'Als Uhr: Neben dem Schritt steht eine Uhr, die so aussieht wie eure Küchenuhr zu der Zeit.';

const TEXT_LINK = 'text-cobalt underline decoration-2 underline-offset-4 hover:text-ink';

/**
 * The clocks go back on 25 October 2026. Shown on the morning page up to
 * and including that day; `today` is there for tests.
 */
export function ClockChangeNote({ today = new Date() }: { today?: Date }) {
  if (!showClockChangeNote(today)) return null;
  return (
    <p data-clock-change className="mt-4 rounded-2xl bg-sky-wash/50 px-4 py-3 text-sm text-ink/75 leading-relaxed">
      Am 25. Oktober werden die Uhren eine Stunde zurückgestellt. Wie ihr den Morgen davor anpasst,
      steht im{' '}
      <Link to="/ratgeber/zeitumstellung-kinder" className={TEXT_LINK}>
        Artikel zur Zeitumstellung
      </Link>
      .
    </p>
  );
}

/** Scrolls to the builder without a history entry, so Back never lands on an older plan. */
export function JumpToBuilder({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${BUILDER_ANCHOR}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        document.getElementById(BUILDER_ANCHOR)?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
      }}
    >
      {children}
    </a>
  );
}
export const LINK_NOTE =
  'Im Link stehen eure Schritte, die Uhrzeiten und euer eigener Schritt. Alle mit dem Link können das lesen.';

/** "Die Uhrzeiten, die Minuten pro Schritt und die anderen Schritte bleiben auf eurem Blatt." or nothing. */
function paperOnly(times: boolean, rest: boolean): string {
  const parts = [
    ...(times ? ['die Uhrzeiten', 'die Minuten pro Schritt'] : []),
    ...(rest ? ['die anderen Schritte'] : []),
  ];
  if (!parts.length) return '';
  const joined = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} und ${parts[parts.length - 1]}` : parts[0];
  return ` ${joined[0].toUpperCase()}${joined.slice(1)} bleiben auf eurem Blatt.`;
}

/* ------------------------------------------------------------------ */
/* Above the preview                                                   */
/* ------------------------------------------------------------------ */

export function RoutineBuilderControls({ builder, today }: { builder: RoutinePlanState; today?: Date }) {
  const { kit, plan, clockStyle, ownDraft, update, changeClockStyle, changeOwn, addOwn } = builder;
  const copy = COPY[kit.id];
  const ownNote = ownStepNote(kit);
  const [adding, setAdding] = useState(false);
  const full = !canAdd(plan);
  const hasOwn = plan.steps.includes(OWN_STEP_CODE);
  const times = printedTimes(plan, kit.endStep);
  const missing = kit.steps.filter((step) => !plan.steps.includes(step.code));
  const titleId = `${BUILDER_ANCHOR}-titel`;
  const wake = kitWakeLine(kit, plan);

  return (
    <section
      id={BUILDER_ANCHOR}
      aria-labelledby={titleId}
      className="print:hidden scroll-mt-24 rounded-[28px] border-[3px] border-ink p-3 sm:p-6"
    >
      <h2 id={titleId} className="bb-display text-2xl sm:text-3xl text-ink">
        Eure Schritte
      </h2>
      <p className="mt-2 text-sm sm:text-base text-ink/70 leading-relaxed">
        Such bis zu sechs Schritte aus, in der Reihenfolge von eurem {copy.dayPart}.
      </p>

      <ol aria-labelledby={titleId} className="mt-4 space-y-2">
        {plan.steps.map((code, i) => (
          <StepItem
            key={code}
            builder={builder}
            code={code}
            index={i}
            start={times[i]}
          />
        ))}
      </ol>
      {hasOwn && <p className="mt-2 text-sm text-ink/65 leading-relaxed">{ownNote}</p>}

      <div className="mt-4">
        <button
          type="button"
          aria-expanded={adding && !full}
          aria-controls="rb-add"
          disabled={full}
          onClick={() => setAdding((open) => !open)}
          className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-5 py-2.5 font-display font-bold text-sm text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4">
            <use href="#bb-plus" />
          </svg>
          Schritt dazunehmen
        </button>
        {full && (
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Sechs Schritte passen auf das Blatt. Nimm einen raus, wenn du einen anderen willst.
          </p>
        )}
      </div>

      {adding && !full && (
        <div id="rb-add" className="mt-3 rounded-[22px] border-[2.5px] border-ink/15 p-3 sm:p-4">
          {missing.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {missing.map((step) => (
                <button
                  key={step.code}
                  type="button"
                  aria-label={`${step.label} dazunehmen`}
                  onClick={() => update((prev) => kitAddStep(kit, prev, step.code))}
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
              <label htmlFor="rb-own" className="font-display font-semibold text-sm text-ink/75">
                Eigener Schritt
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <input
                  id="rb-own"
                  type="text"
                  value={ownDraft}
                  onChange={(event) => changeOwn(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && cleanOwnText(ownDraft)) addOwn();
                  }}
                  maxLength={OWN_STEP_MAX}
                  placeholder="z. B. Medizin nehmen"
                  autoComplete="off"
                  className="min-w-0 flex-1 basis-48 rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 text-base text-ink placeholder:text-ink/40 focus:border-cobalt focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Eigenen Schritt dazunehmen"
                  disabled={!cleanOwnText(ownDraft)}
                  onClick={addOwn}
                  className="rounded-full border-[2.5px] border-ink bg-white px-4 py-2 font-display font-bold text-sm text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Dazunehmen
                </button>
              </div>
              <p className="mt-2 text-sm text-ink/65 leading-relaxed">{ownNote}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Switch checked={plan.times} onChange={(on) => update((prev) => setTimes(prev, on))}>
          Uhrzeiten dazuschreiben
        </Switch>
        <p className="mt-2 text-sm text-ink/65 leading-relaxed">
          Die Uhrzeiten sind freiwillig. Wird dein Kind davon eher nervös, lass sie weg.
        </p>
        {plan.times && (
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="rb-los" className="font-display font-semibold text-base text-ink">
                {copy.timeQuestion}
              </label>
              <select
                id="rb-los"
                value={plan.leave}
                onChange={(event) => update((prev) => kitSetLeave(kit, prev, event.target.value))}
                className="rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 font-display font-semibold text-base text-ink focus:border-cobalt focus:outline-none"
              >
                {kit.times.map((time) => (
                  <option key={time} value={time}>
                    {clockLabel(time)} Uhr
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-sm text-ink/65 leading-relaxed">
              {copy.countBack} Wie lange
              ein Schritt dauert, stellst du oben mit Minus und Plus ein. Auf dem Blatt stehen die
              Zeiten auf fünf Minuten abgerundet, so findet dein Kind sie leichter auf der Uhr.
            </p>
            {wake && (
              <p data-wake-line className="mt-2 text-sm text-ink/65 leading-relaxed">
                <span className="font-display font-semibold text-ink">{wake.text}</span> Welche
                Schlafenszeit passt dazu?{' '}
                <Link to={sleepCalculatorLink(wake.auf)} className={TEXT_LINK}>
                  Der Schlafens-Rechner rechnet es aus
                </Link>
                .
              </p>
            )}
            {kit.clockFaces && <ClockStylePicker value={clockStyle} onChange={changeClockStyle} />}
          </div>
        )}
        {kit.id === 'morgen' && <ClockChangeNote today={today} />}
      </div>
    </section>
  );
}

/** "Als Zahl", "Als Uhr", "Beides": radio buttons drawn as pills, like the page's other buttons. */
function ClockStylePicker({ value, onChange }: { value: ClockStyle; onChange: (style: ClockStyle) => void }) {
  return (
    <fieldset className="mt-4">
      <legend className="font-display font-semibold text-base text-ink">{CLOCK_STYLE_QUESTION}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {CLOCK_STYLES.map((style) => (
          <label key={style} className="cursor-pointer">
            <input
              type="radio"
              name="rb-uhr"
              value={style}
              checked={value === style}
              onChange={() => onChange(style)}
              className="peer sr-only"
            />
            <span className="inline-flex items-center rounded-full border-[2.5px] border-ink/20 bg-white px-4 py-2 font-display font-bold text-sm text-ink transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-cobalt peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt">
              {CLOCK_STYLE_LABELS[style]}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-sm text-ink/65 leading-relaxed">{CLOCK_STYLE_NOTE}</p>
    </fieldset>
  );
}

function StepItem({
  builder,
  code,
  index,
  start,
}: {
  builder: RoutinePlanState;
  code: string;
  index: number;
  start?: string;
}) {
  const { kit, plan, ownDraft, update, changeOwn } = builder;
  const label = kitStepLabel(kit, plan, code);
  const img = kitStepPicture(kit, plan, code);
  const count = plan.steps.length;
  const minutes = plan.minutes[index];
  // "Licht aus" as the last step is the moment itself: no minutes, "um" instead of "ab".
  const isEnd = isEndStep(kit, plan, index);

  return (
    <li className="rounded-2xl border-[2.5px] border-ink/15 bg-white p-2 pr-2.5">
      {/* One line from sm up. On a phone the buttons get their own line, so
          the label keeps the width it needs. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:flex-nowrap sm:gap-x-3">
        <span aria-hidden className="w-5 shrink-0 text-center font-display font-bold text-lg text-cobalt">
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
              value={ownDraft}
              onChange={(event) => changeOwn(event.target.value)}
              maxLength={OWN_STEP_MAX}
              aria-label="Eigener Schritt"
              placeholder="z. B. Medizin nehmen"
              autoComplete="off"
              className="w-full min-w-0 rounded-lg border-2 border-ink/20 bg-white px-2 py-1 font-display font-bold text-base text-ink placeholder:font-normal placeholder:text-ink/40 focus:border-cobalt focus:outline-none"
            />
          ) : (
            <span className="block font-display font-bold text-base leading-tight text-ink">
              {stepOf(kit, code)?.label}
            </span>
          )}
          {plan.times && start && (
            <span className="mt-0.5 block text-sm text-ink/65">
              {isEnd ? 'um' : 'ab'} {start} Uhr
            </span>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
          {plan.times && !isEnd && (
            <div className="mr-auto flex items-center gap-1 sm:mr-2">
              <IconButton
                label={`${label}: eine Minute weniger`}
                disabled={minutes <= MIN_MINUTES}
                onClick={() => update((prev) => setMinutes(prev, index, minutes - 1))}
              >
                <path d="M16 32 H48" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
              </IconButton>
              <span className="w-14 text-center font-display font-semibold text-sm text-ink">
                {minutes} Min.
              </span>
              <IconButton
                label={`${label}: eine Minute mehr`}
                disabled={minutes >= MAX_MINUTES}
                onClick={() => update((prev) => setMinutes(prev, index, minutes + 1))}
              >
                <use href="#bb-plus" />
              </IconButton>
            </div>
          )}
          <div className="flex gap-1">
            <IconButton
              label={`${label} nach oben`}
              disabled={index === 0}
              onClick={() => update((prev) => moveStep(prev, index, -1))}
            >
              <use href="#bb-arrow" transform="rotate(-90 32 32)" />
            </IconButton>
            <IconButton
              label={`${label} nach unten`}
              disabled={index === count - 1}
              onClick={() => update((prev) => moveStep(prev, index, 1))}
            >
              <use href="#bb-arrow" transform="rotate(90 32 32)" />
            </IconButton>
            <IconButton
              label={`${label} entfernen`}
              disabled={count <= 1}
              onClick={() => update((prev) => removeStep(prev, index))}
            >
              <use href="#bb-cross" />
            </IconButton>
          </div>
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

/** The site's switch: a checkbox with role="switch" and a drawn track. */
function Switch({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 font-display font-semibold text-base text-ink">
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full border-[2.5px] border-ink bg-white transition-colors peer-checked:bg-cobalt peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt after:absolute after:left-0.5 after:top-1/2 after:h-4.5 after:w-4.5 after:-translate-y-1/2 after:rounded-full after:bg-ink after:transition-transform after:content-[''] peer-checked:after:translate-x-5 peer-checked:after:bg-white"
      />
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Under the preview                                                   */
/* ------------------------------------------------------------------ */

export function RoutineBuilderShare({ builder }: { builder: RoutinePlanState }) {
  const { kit, plan, clockStyle, shareUrl } = builder;
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
  );
  const copiedTimer = useRef<number | undefined>(undefined);
  const card = kitCardLink(kit, plan);
  const kinds = kitAppKindsFor(kit, plan);
  const rest = plan.steps.some((code) => !stepOf(kit, code)?.app);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  async function handleCopy() {
    if (!(await copyText(shareUrl))) return;
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    try {
      await navigator.share({ title: kit.shareTitle, text: kit.shareText, url: shareUrl });
    } catch {
      // Closed the share sheet, or the browser refused. Nothing to do.
    }
  }

  return (
    <div className="print:hidden mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            // How the sheet looks, never what is on it.
            trackEvent('Vorlage Drucken', {
              vorlage: kit.id,
              weg: 'baukasten',
              uhr: kitPrintClockProp(kit, plan, clockStyle),
            });
            window.print();
          }}
          className="bb-press bb-press--night inline-flex items-center gap-2 rounded-full bg-cobalt px-6 py-3 font-display font-bold text-base text-white"
        >
          <svg aria-hidden viewBox="0 0 64 64" className="h-5 w-5">
            <use href="#bb-printer" />
          </svg>
          Drucken
        </button>
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
      <p className="mt-3 text-sm text-ink/65 leading-relaxed">{LINK_NOTE}</p>

      {card && (
        <div className="mt-8 rounded-[22px] border-[2.5px] border-ink bg-sky-wash/50 p-4 sm:p-5">
          <Link
            to={card}
            onClick={() => trackEvent('Karte aus Vorlage', { vorlage: kit.id })}
            className="bb-press inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-sun px-6 py-3 font-display font-bold text-base text-ink"
          >
            Kostenlose Ronki-Karte erstellen
            <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4">
              <use href="#bb-arrow" />
            </svg>
          </Link>
          <p className="mt-3 text-sm text-ink/75 leading-relaxed">
            Ronki ist unsere kostenlose App für Kinder, ohne E-Mail und ohne Werbung. Du bekommst
            eine Karte mit QR-Code, die dein Kind auf dem Tablet scannt. Dann fragt Ronki in eurer
            Reihenfolge nach: {kinds.map((kind) => kit.appLabels[kind]).join(', ')}.
            {paperOnly(plan.times, rest)}
          </p>
        </div>
      )}
    </div>
  );
}
