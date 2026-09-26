import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PackplanSheet } from '../src/components/ranzen-packplan/PackplanSheet';
import RanzenPackplan from '../src/pages/tools/RanzenPackplan';
import ToolsHub from '../src/pages/tools/ToolsHub';
import { AppRoutes } from '../src/routes';
import { ARTICLES } from '../src/data/ratgeber-articles';
import {
  EXTRA_ITEMS,
  SHARE_TEXT,
  WEEKDAYS,
  defaultPlan,
  setFree,
  setMode,
  toggleDaily,
  toggleExtra,
  type PackPlan,
} from '../src/lib/ranzen-packplan';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';
import sitemap from '../public/sitemap.xml?raw';

const PAGE_PATH = '/tools/ranzen-packplan';
const H1 = 'Ranzen-Packplan: Was muss heute in den Ranzen?';
const TOOL_TITLE = 'Ranzen-Packplan: Bildkarten für jeden Schultag · Ronki';
const ARTICLE_PATH = '/ratgeber/ranzen-packen-erste-klasse';
const ARTICLE_H1 = 'Ranzen packen in der 1. Klasse: eine Karte statt täglicher Suche';

/** Text without the soft hyphens the narrow cards use for line breaks. */
const plain = (el: Element | null) => (el?.textContent ?? '').replace(/­/g, '');

function cards(root: ParentNode) {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-day]'));
}

function card(root: ParentNode, day: string) {
  const found = root.querySelector<HTMLElement>(`[data-day="${day}"]`);
  if (!found) throw new Error(`no card for ${day}`);
  return found;
}

function pictures(root: ParentNode) {
  return Array.from(root.querySelectorAll('img')).map((img) => img.getAttribute('src'));
}

function examplePlan(): PackPlan {
  let plan = defaultPlan();
  plan = toggleExtra(plan, 'di', 'turnbeutel');
  plan = toggleExtra(plan, 'do', 'schwimmsachen');
  plan = toggleExtra(plan, 'do', 'wechselsachen');
  plan = setFree(plan, 'fr', 'Kuscheltier');
  return setMode(plan, 'pruefen');
}

function worstCasePlan(): PackPlan {
  let plan = defaultPlan();
  for (const day of WEEKDAYS) {
    for (const item of EXTRA_ITEMS) plan = toggleExtra(plan, day.id, item.id);
    plan = setFree(plan, day.id, 'Geld für den Ausflug mit');
  }
  return plan;
}

describe('Packplan sheet', () => {
  it('renders five day cards, Montag to Freitag', () => {
    const { container } = render(<PackplanSheet plan={examplePlan()} />);
    expect(cards(container).map((c) => c.dataset.day)).toEqual(['mo', 'di', 'mi', 'do', 'fr']);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
    ]);
  });

  const DAILY_PICTURES = [
    '/art/bilderbuch/tasks/lunchbox.webp',
    '/art/bilderbuch/tasks/water.webp',
    '/art/bilderbuch/tasks/pencil-case.webp',
    '/art/bilderbuch/tasks/homework.webp',
  ];

  it('puts the daily items on every card and the extras on their day', () => {
    const { container } = render(<PackplanSheet plan={examplePlan()} />);
    // Days with extras: the daily items ride along in the small strip.
    for (const day of ['di', 'do', 'fr']) {
      expect(pictures(card(container, day).querySelector('[data-daily]')!)).toEqual(DAILY_PICTURES);
    }
    const di = card(container, 'di');
    expect(plain(di)).toContain('Turnbeutel');
    expect(pictures(di)).toContain('/art/bilderbuch/tasks/gym-bag.webp');

    const donnerstag = card(container, 'do');
    expect(plain(donnerstag)).toContain('Schwimmsachen');
    expect(plain(donnerstag)).toContain('Wechselsachen');
    expect(plain(donnerstag)).not.toContain('Turnbeutel');

    // The free item gets an empty box to draw in, never a stand-in picture.
    const fr = card(container, 'fr');
    expect(plain(fr)).toContain('Kuscheltier');
    expect(pictures(fr.querySelector('[data-extras]')!)).toEqual([]);
    expect(fr.querySelectorAll('[data-draw]')).toHaveLength(1);
  });

  it('shows the daily items as the main pictures on a day with nothing on top', () => {
    const { container } = render(<PackplanSheet plan={examplePlan()} />);
    for (const day of ['mo', 'mi']) {
      const c = card(container, day);
      const main = c.querySelector<HTMLElement>('[data-extras]')!;
      expect(main).toHaveAttribute('data-only-daily');
      expect(pictures(main)).toEqual(DAILY_PICTURES);
      for (const label of ['Brotdose', 'Trinkflasche', 'Mäppchen', 'Hausaufgabenheft']) {
        expect(plain(main)).toContain(label);
      }
      expect(c.querySelector('[data-daily]')).toBeNull();
      expect(plain(c)).not.toContain('Heute nichts dazu');
      expect(pictures(c)).not.toContain('/art/bilderbuch/tasks/bag.webp');
    }
  });

  it('says "Heute nichts dazu" only on a day that carries nothing at all', () => {
    let plan = defaultPlan();
    for (const id of plan.daily) plan = toggleDaily(plan, id);
    plan = toggleExtra(plan, 'di', 'turnbeutel');
    const { container } = render(<PackplanSheet plan={plan} />);
    expect(plain(card(container, 'mo'))).toContain('Heute nichts dazu');
    expect(pictures(card(container, 'mo'))).toEqual([]);
    expect(plain(card(container, 'di'))).not.toContain('Heute nichts dazu');
  });

  it('carries the head, Ronki, the mode note and the sleeve hint, but no name line and no circles', () => {
    const { container } = render(<PackplanSheet plan={examplePlan()} />);
    expect(screen.getByText('Packplan')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Was kommt heute in den Ranzen?' })).toBeInTheDocument();
    expect(screen.getByText('Schau auf deine Karte!')).toBeInTheDocument();
    expect(screen.getByText('Du packst, dann schauen wir zusammen auf die Karte.')).toBeInTheDocument();
    expect(
      screen.getByText('In eine Klarsichthülle stecken, dann ist die Karte abwischbar.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Streaks gibt es hier nicht/)).toBeInTheDocument();
    expect(container.textContent).not.toContain('Das ist der Plan von');
    expect(container.querySelector('.rs-ring')).toBeNull();
    expect(container.textContent).not.toMatch(/geschafft/i);
  });

  it('shows the note for each way of packing', () => {
    const { rerender } = render(<PackplanSheet plan={setMode(defaultPlan(), 'zusammen')} />);
    expect(screen.getByText('Wir packen zusammen: du zeigst, ich reiche an.')).toBeInTheDocument();
    rerender(<PackplanSheet plan={setMode(defaultPlan(), 'selbst')} />);
    expect(screen.getByText('Du packst und prüfst mit der Karte.')).toBeInTheDocument();
  });

  it('draws the worst case, every extra and a free item on every day, in the small size', () => {
    const { container } = render(<PackplanSheet plan={worstCasePlan()} />);
    const all = cards(container);
    expect(all).toHaveLength(5);
    for (const c of all) {
      const extras = c.querySelector<HTMLElement>('[data-extras]')!;
      expect(extras.dataset.size).toBe('small');
      expect(pictures(extras)).toHaveLength(EXTRA_ITEMS.length);
      expect(extras.querySelectorAll('[data-draw]')).toHaveLength(1);
      expect(plain(extras)).toContain('Geld für den Ausflug mit');
    }
  });
});

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type PlausibleCall = [string, { props?: Record<string, unknown> }?];

function plausibleCalls(): PlausibleCall[] {
  return (window.plausible as unknown as ReturnType<typeof vi.fn>).mock.calls as PlausibleCall[];
}

function renderPage(search = '') {
  window.history.replaceState(null, '', `${PAGE_PATH}${search}`);
  return render(
    <MemoryRouter initialEntries={[`${PAGE_PATH}${search}`]}>
      <RanzenPackplan />
    </MemoryRouter>,
  );
}

function preview() {
  return screen.getByTestId('pp-preview');
}

function dayGroup(label: string) {
  return screen.getByRole('group', { name: label });
}

describe('Ranzen-Packplan page', () => {
  beforeEach(() => {
    window.plausible = vi.fn() as unknown as typeof window.plausible;
  });

  afterEach(() => {
    delete window.plausible;
    delete (navigator as { share?: unknown }).share;
    delete (navigator as { clipboard?: unknown }).clipboard;
    window.history.replaceState(null, '', '/');
  });

  it('has exactly one H1', () => {
    renderPage();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(H1);
  });

  it('asks for nothing personal: no field for a name, a child, a school or a class', () => {
    const { container } = renderPage();
    const fields = Array.from(container.querySelectorAll('input, textarea, select'));
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      const typed = field.tagName !== 'INPUT' || ['text', 'search', ''].includes(field.getAttribute('type') ?? '');
      const words = [
        field.getAttribute('name'),
        field.getAttribute('id'),
        field.getAttribute('placeholder'),
        field.getAttribute('aria-label'),
        field.getAttribute('autocomplete'),
        // Radio labels may say "dein Kind"; a field you type into may not ask for one.
        ...(typed ? Array.from((field as HTMLInputElement).labels ?? []).map((l) => l.textContent) : []),
      ].join(' ');
      expect(words).not.toMatch(/name|kind|schule|klasse/i);
    }
    // The only fields you type into are the five free items.
    expect(container.querySelectorAll('input[type="text"], textarea')).toHaveLength(5);
  });

  it('starts with the four daily items on', () => {
    renderPage();
    const daily = screen.getByRole('group', { name: 'Jeden Tag dabei' });
    for (const label of ['Brotdose', 'Trinkflasche', 'Mäppchen', 'Hausaufgabenheft']) {
      expect(within(daily).getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('keeps the plan in the address bar as the parent taps', () => {
    renderPage();
    expect(window.location.search).toBe('');
    fireEvent.click(within(dayGroup('Dienstag')).getByRole('button', { name: 'Turnbeutel' }));
    expect(window.location.pathname).toBe(PAGE_PATH);
    expect(window.location.search).toBe('?di=g');
    expect(plain(card(preview(), 'di'))).toContain('Turnbeutel');

    fireEvent.click(
      within(screen.getByRole('group', { name: 'Jeden Tag dabei' })).getByRole('button', {
        name: 'Hausaufgabenheft',
      }),
    );
    expect(window.location.search).toBe('?j=btm&di=g');
  });

  it('keeps spaces while typing the free item and puts the cleaned text on the card', () => {
    renderPage();
    const field = within(dayGroup('Freitag')).getByRole('textbox');
    expect(field).toHaveAttribute('maxLength', '24');
    fireEvent.change(field, { target: { value: 'Geld für ' } });
    expect(field).toHaveValue('Geld für ');
    expect(window.location.search).toBe('?fr=.Geld+f%C3%BCr');
    expect(plain(card(preview(), 'fr'))).toContain('Geld für');
  });

  it('restores a plan from an opened link', () => {
    renderPage('?j=bt&di=g&fr=l.Kuscheltier&m=s');
    const daily = screen.getByRole('group', { name: 'Jeden Tag dabei' });
    expect(within(daily).getByRole('button', { name: 'Brotdose' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(daily).getByRole('button', { name: 'Mäppchen' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(dayGroup('Dienstag')).getByRole('button', { name: 'Turnbeutel' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(dayGroup('Freitag')).getByRole('button', { name: 'Bücherei-Buch' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(dayGroup('Freitag')).getByRole('textbox')).toHaveValue('Kuscheltier');
    expect(screen.getByRole('radio', { name: /Selbst prüfen/ })).toBeChecked();
    expect(within(preview()).getByText('Du packst und prüfst mit der Karte.')).toBeInTheDocument();
  });

  it('follows the address bar when the parent goes back in the browser', () => {
    renderPage();
    window.history.pushState(null, '', `${PAGE_PATH}#main`);
    fireEvent.click(within(dayGroup('Dienstag')).getByRole('button', { name: 'Turnbeutel' }));
    fireEvent.change(within(dayGroup('Freitag')).getByRole('textbox'), { target: { value: 'Laterne' } });
    expect(window.location.search).toBe('?di=g&fr=.Laterne');

    // Back: the address bar shows the plan from before; the page must follow.
    act(() => {
      window.history.replaceState(null, '', PAGE_PATH);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(within(dayGroup('Dienstag')).getByRole('button', { name: 'Turnbeutel' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(within(dayGroup('Freitag')).getByRole('textbox')).toHaveValue('');
    expect(plain(card(preview(), 'di'))).not.toContain('Turnbeutel');
    expect(window.location.search).toBe('');
  });

  it('says honestly what the link carries', () => {
    const { container } = renderPage();
    const text = plain(container);
    expect(text).toContain('alles aus „Noch etwas?“. Alle mit dem Link können das lesen.');
    expect(text).toContain('keine Namen, Klassen oder Schulen');
    expect(text).not.toContain('Im Link stehen nur Wochentage und Sachen');
  });

  it('switches the note on the sheet with the way of packing', () => {
    renderPage();
    expect(screen.getByRole('radio', { name: /Zusammen packen/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Selbst packen, gemeinsam prüfen/ }));
    expect(window.location.search).toBe('?m=p');
    expect(
      within(preview()).getByText('Du packst, dann schauen wir zusammen auf die Karte.'),
    ).toBeInTheDocument();
  });

  it('prints and counts the print without any plan data', () => {
    const print = vi.fn();
    window.print = print;
    renderPage('?di=g');
    fireEvent.click(screen.getByRole('button', { name: 'Drucken' }));
    expect(print).toHaveBeenCalledTimes(1);
    expect(plausibleCalls()).toEqual([['Packplan Drucken']]);
  });

  it('copies the link and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderPage('?di=g');
    fireEvent.click(screen.getByRole('button', { name: 'Link kopieren' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}${PAGE_PATH}?di=g`);
    expect(await screen.findByText('Kopiert')).toBeInTheDocument();
    expect(plausibleCalls()).toEqual([['Packplan Link', { props: { weg: 'kopiert' } }]]);
  });

  it('shares the link with the class-chat line where the phone can share', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    renderPage('?do=s&fr=.Kuscheltier');
    fireEvent.click(screen.getByRole('button', { name: 'Teilen' }));
    expect(share).toHaveBeenCalledWith({
      title: 'Ranzen-Packplan',
      text: SHARE_TEXT,
      url: `${window.location.origin}${PAGE_PATH}?do=s&fr=.Kuscheltier`,
    });
    await vi.waitFor(() =>
      expect(plausibleCalls()).toEqual([['Packplan Link', { props: { weg: 'geteilt' } }]]),
    );
    // Events never carry the items or the free text.
    expect(JSON.stringify(plausibleCalls())).not.toMatch(/Kuscheltier|Schwimm|do=/);
  });

  it('shows no share button where the browser cannot share', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: 'Teilen' })).toBeNull();
  });

  it('links the guide article', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Warum Karten helfen/ })).toHaveAttribute('href', ARTICLE_PATH);
  });

  it('uses the same title and description for the browser and the prerendered crawler HTML', () => {
    renderPage();
    expect(document.title).toBe(TOOL_TITLE);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThan(160);
    expect(description).not.toContain(String.fromCharCode(0x2014));
    expect(prerenderSource).toContain(`path: '${PAGE_PATH}'`);
    expect(prerenderSource).toContain(`title: '${TOOL_TITLE}'`);
    expect(prerenderSource).toContain(description!);
    expect(prerenderSource).toContain(`ogImage: '/og-tool-ranzen-packplan.jpg'`);
  });
});

/* ------------------------------------------------------------------ */
/* Wiring                                                              */
/* ------------------------------------------------------------------ */

describe('Ranzen-Packplan wiring', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('serves the tool on its route', async () => {
    render(
      <MemoryRouter initialEntries={[PAGE_PATH]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: H1 })).toBeInTheDocument();
  });

  it('serves the guide article on its route with the crawler title', async () => {
    render(
      <MemoryRouter initialEntries={[ARTICLE_PATH]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: ARTICLE_H1 })).toBeInTheDocument();
    expect(document.title).toBe(`${ARTICLE_H1} · Ratgeber`);
    expect(prerenderSource).toContain(`path: '${ARTICLE_PATH}'`);
    expect(prerenderSource).toContain(`title: '${ARTICLE_H1} · Ratgeber · Ronki'`);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(prerenderSource).toContain(description!);
  });

  it('lists the article under Einschulung and both pages in the sitemap', () => {
    const entry = ARTICLES.find((a) => a.slug === 'ranzen-packen-erste-klasse');
    expect(entry?.category).toBe('Einschulung');
    expect(entry?.title).toBe(ARTICLE_H1);
    expect(sitemap).toContain(`<loc>https://www.ronki.de${PAGE_PATH}</loc>`);
    expect(sitemap).toContain(`<loc>https://www.ronki.de${ARTICLE_PATH}</loc>`);
  });

  it('has a card on the tools hub', () => {
    render(
      <MemoryRouter>
        <ToolsHub />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === PAGE_PATH);
    expect(links).toHaveLength(1);
  });
});
