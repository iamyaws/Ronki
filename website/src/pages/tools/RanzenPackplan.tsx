/**
 * /tools/ranzen-packplan: a picture card per school day that says what goes
 * into the Ranzen.
 *
 * The weekly rhythm (Sport on Tuesday, Schwimmen on Thursday, Bücherei on
 * Friday) usually lives in a parent's head, so the child cannot know what to
 * pack. The parent taps it in once; the tool prints five cards the child can
 * read without reading.
 *
 * The plan lives only in the address bar (history.replaceState on every
 * change), so the address bar is always the share link and opening a link
 * restores the plan. Nothing is stored and there is no field for a name, a
 * class or a school. Analytics count prints and shares, never the plan.
 *
 * Printing: the preview is a scaled copy of the A4 sheet. A second, unscaled
 * copy sits in a portal on <body>; the page's print style hides everything
 * else, so "Drucken" gives exactly one A4 page.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { SheetPageStyle, TASK_ART_PATH } from '../../components/sheet';
import { PackplanSheet } from '../../components/ranzen-packplan/PackplanSheet';
import { trackEvent } from '../../lib/analytics';
import {
  DAILY_ITEMS,
  EXTRA_ITEMS,
  FREE_TEXT_MAX,
  SHARE_TEXT,
  SUPPORT_MODES,
  WEEKDAYS,
  decodePlan,
  encodePlan,
  setFree,
  setMode,
  toggleDaily,
  toggleExtra,
  type PackPlan,
  type WeekdayId,
} from '../../lib/ranzen-packplan';

const PAGE_PATH = '/tools/ranzen-packplan';
const ARTICLE_PATH = '/ratgeber/ranzen-packen-erste-klasse';

// Keep title and description in sync with website/vite-plugin-prerender-meta.ts.
const META_TITLE = 'Ranzen-Packplan: Bildkarten für jeden Schultag · Ronki';
const META_DESCRIPTION =
  'Was muss heute in den Ranzen? Tipp an, was an welchem Schultag mit muss, und druck für jeden Tag eine Bildkarte aus. Kostenlos, ohne Anmeldung.';

/** A4 at 96 dpi, the size the sheet is laid out at (sheet.css: 210 x 296 mm). */
const A4_WIDTH_PX = 793.7;
const A4_HEIGHT_PX = 1118.7;

type Drafts = Record<WeekdayId, string>;

function draftsFrom(plan: PackPlan): Drafts {
  return {
    mo: plan.days.mo.free,
    di: plan.days.di.free,
    mi: plan.days.mi.free,
    do: plan.days.do.free,
    fr: plan.days.fr.free,
  };
}

export default function RanzenPackplan() {
  const [plan, setPlan] = useState<PackPlan>(() =>
    decodePlan(typeof window === 'undefined' ? '' : window.location.search),
  );
  // What the parent is typing, spaces and all. The plan keeps the cleaned text.
  const [drafts, setDrafts] = useState<Drafts>(() => draftsFrom(plan));
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
  );
  const copiedTimer = useRef<number | undefined>(undefined);

  const query = encodePlan(plan);
  const shareUrl = `${typeof window === 'undefined' ? 'https://www.ronki.de' : window.location.origin}${PAGE_PATH}${query ? `?${query}` : ''}`;

  // The address bar is always the share link.
  useEffect(() => {
    const next = `${PAGE_PATH}${query ? `?${query}` : ''}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(window.history.state, '', next);
    }
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

  function changeFree(day: WeekdayId, text: string) {
    setDrafts((prev) => ({ ...prev, [day]: text }));
    setPlan((prev) => setFree(prev, day, text));
  }

  function handlePrint() {
    trackEvent('Packplan Drucken');
    window.print();
  }

  async function handleCopy() {
    if (!(await copyText(shareUrl))) return;
    trackEvent('Packplan Link', { weg: 'kopiert' });
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    try {
      await navigator.share({ title: 'Ranzen-Packplan', text: SHARE_TEXT, url: shareUrl });
      trackEvent('Packplan Link', { weg: 'geteilt' });
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
        ogImage="/og-tool-ranzen-packplan.jpg"
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
              Ranzen-Packplan: Was muss heute in den Ranzen?
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
              Dienstag Sport, Donnerstag Schwimmen, Freitag Bücherei. Meist weißt nur du, was
              wann mit muss. Hier machst du daraus eine Bildkarte für jeden Schultag. Dein Kind
              schaut auf die Karte, nicht zu dir.
            </p>
            <p className="mt-4 text-sm text-ink/65 leading-relaxed">
              Kostenlos, ohne Anmeldung.{' '}
              <Link
                to={ARTICLE_PATH}
                className="font-display font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
              >
                Warum Karten helfen
              </Link>
            </p>
          </header>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
            <div className="space-y-12 min-w-0">
              <Step n={1} id="pp-step-1" title="Jeden Tag dabei">
                <p className="text-sm text-ink/70 leading-relaxed">
                  Das kommt jeden Tag mit. Tipp an, was bei euch nicht dazugehört.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {DAILY_ITEMS.map((item) => (
                    <Tile
                      key={item.id}
                      img={item.img}
                      label={item.label}
                      shown={item.printLabel}
                      pressed={plan.daily.includes(item.id)}
                      onClick={() => setPlan((prev) => toggleDaily(prev, item.id))}
                      large
                    />
                  ))}
                </div>
              </Step>

              <Step n={2} id="pp-step-2" title="Was kommt an welchem Tag dazu?">
                <p className="text-sm text-ink/70 leading-relaxed">
                  Tipp für jeden Schultag an, was zusätzlich in den Ranzen muss. Fehlt etwas? Schreib
                  es ins Feld.
                </p>
                <div className="mt-5 space-y-4">
                  {WEEKDAYS.map((day) => (
                    <fieldset
                      key={day.id}
                      aria-labelledby={`pp-day-${day.id}`}
                      className="rounded-[22px] border-[2.5px] border-ink/15 p-3 sm:p-5"
                    >
                      <h3
                        id={`pp-day-${day.id}`}
                        className="font-display font-bold text-xl text-ink leading-none"
                      >
                        {day.label}
                      </h3>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {EXTRA_ITEMS.map((item) => (
                          <Tile
                            key={item.id}
                            img={item.img}
                            label={item.label}
                            shown={item.printLabel}
                            pressed={plan.days[day.id].extras.includes(item.id)}
                            onClick={() => setPlan((prev) => toggleExtra(prev, day.id, item.id))}
                          />
                        ))}
                      </div>
                      <label className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="font-display font-semibold text-sm text-ink/75">
                          Noch etwas?
                        </span>
                        <input
                          type="text"
                          value={drafts[day.id]}
                          onChange={(event) => changeFree(day.id, event.target.value)}
                          maxLength={FREE_TEXT_MAX}
                          aria-label={`Noch etwas am ${day.label}`}
                          placeholder="z. B. Geld für den Ausflug"
                          autoComplete="off"
                          className="min-w-0 flex-1 basis-56 rounded-xl border-[2.5px] border-ink/20 bg-white px-3 py-2 text-base text-ink placeholder:text-ink/40 focus:border-cobalt focus:outline-none"
                        />
                      </label>
                    </fieldset>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink/70 leading-relaxed">
                  Für alles bei „Noch etwas?“ bleibt auf der Karte ein leeres Feld. Da malt dein
                  Kind vor dem ersten Packen selbst hinein, was es ist. Trag dort nur Sachen ein, keine Namen, Klassen
                  oder Schulen: Der Text steht auch im Link.
                </p>
              </Step>

              <Step n={3} id="pp-step-3" title="Wie packt ihr?">
                <p className="text-sm text-ink/70 leading-relaxed">
                  Such aus, wie viel dein Kind schon selbst macht. Ihr könnt jederzeit wechseln, auch
                  wieder zurück.
                </p>
                <div className="mt-4 space-y-3">
                  {SUPPORT_MODES.map((mode) => {
                    const checked = plan.mode === mode.id;
                    return (
                      <label
                        key={mode.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-[22px] border-[2.5px] p-4 transition-colors ${
                          checked ? 'border-ink bg-sky-wash/60' : 'border-ink/15 hover:border-ink/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="packweise"
                          value={mode.id}
                          checked={checked}
                          onChange={() => setPlan((prev) => setMode(prev, mode.id))}
                          className="mt-1 h-5 w-5 shrink-0 accent-cobalt"
                        />
                        <span>
                          <span className="block font-display font-bold text-lg text-ink leading-tight">
                            {mode.label}
                          </span>
                          <span className="mt-1 block text-sm text-ink/70 leading-relaxed">
                            {mode.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Step>
            </div>

            <aside className="min-w-0 lg:sticky lg:top-6" aria-label="Vorschau und Drucken">
              <p className="bb-hand text-2xl uppercase text-cobalt leading-none mb-3">Vorschau</p>
              <ScaledPreview>
                <PackplanSheet plan={plan} />
              </ScaledPreview>
              <p className="mt-3 text-sm text-ink/65 leading-relaxed">
                Eine Seite A4 mit fünf Karten zum Ausschneiden. Leg abends die Karte für morgen zum
                Ranzen. Packt ihr erst morgens, nimm die Karte für heute.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
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
              <p className="mt-4 text-sm text-ink/65 leading-relaxed">
                Der Link ist euer Plan. Schick ihn in den Klassenchat, dann kann jede Familie ihn
                anpassen und selbst drucken. Im Link stehen eure Sachen, die Tage, wie ihr packt
                und alles aus „Noch etwas?“. Alle mit dem Link können das lesen.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <Footer />

      {typeof document !== 'undefined' &&
        createPortal(
          <div className="pp-print" aria-hidden>
            <PackplanSheet plan={plan} />
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
    <fieldset aria-labelledby={id} className="min-w-0">
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
    </fieldset>
  );
}

/**
 * A picture you tap on and off, the same drawing the card prints. `shown`
 * is the label with soft hyphens for narrow tiles; the button is named by
 * the plain label.
 */
function Tile({
  img,
  label,
  shown,
  pressed,
  onClick,
  large = false,
}: {
  img: string;
  label: string;
  shown?: string;
  pressed: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={`relative flex min-w-0 flex-col items-center gap-1 rounded-2xl border-[2.5px] px-1.5 pb-2 pt-2.5 text-center font-display font-semibold leading-tight [hyphens:manual] [overflow-wrap:normal] transition-colors ${
        large ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
      } ${pressed ? 'border-ink bg-sky-wash text-ink' : 'border-ink/15 bg-white text-ink/65 hover:border-ink/50'}`}
    >
      <img
        src={`${TASK_ART_PATH}${img}`}
        alt=""
        width={64}
        height={64}
        draggable={false}
        className={`${large ? 'h-12 w-12' : 'h-10 w-10'} object-contain transition-opacity ${
          pressed ? '' : 'opacity-45'
        }`}
      />
      <span aria-hidden className="block max-w-full">
        {shown ?? label}
      </span>
      {pressed && (
        <svg aria-hidden viewBox="0 0 64 64" className="absolute right-1.5 top-1.5 h-4 w-4 text-cobalt">
          <use href="#bb-check" />
        </svg>
      )}
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
      data-testid="pp-preview"
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

/** Clipboard with a fallback for browsers that block the async API. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the old way.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = typeof document.execCommand === 'function' && document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/*
 * Only while this page is mounted: print nothing but the unscaled sheet in
 * the portal. A stylesheet import would stay in the document after leaving
 * the page and hide every other page from the printer.
 */
const printCss = `
  .pp-print { display: none; }
  @media print {
    body > *:not(.pp-print) { display: none !important; }
    .pp-print { display: block !important; }
  }
`;
