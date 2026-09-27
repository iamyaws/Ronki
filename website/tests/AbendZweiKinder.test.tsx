import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AbendZweiKinderSheet } from '../src/components/abend-zwei-kinder/AbendZweiKinderSheet';
import AbendZweiKinder from '../src/pages/tools/AbendZweiKinder';
import ToolsHub from '../src/pages/tools/ToolsHub';
import { AppRoutes } from '../src/routes';
import {
  SHARE_TEXT,
  addStep,
  checkClash,
  decodePlan,
  defaultPlan,
  setAdults,
  setLightsOut,
  toggleNeeds,
  toggleTogether,
} from '../src/lib/abend-zwei-kinder';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';
import sitemap from '../public/sitemap.xml?raw';

const PAGE_PATH = '/tools/abend-mit-zwei-kindern';
const H1 = 'Abend mit zwei Kindern: wer braucht wann deine Hilfe?';
const TOOL_TITLE = 'Abend mit zwei Kindern: wer braucht wann deine Hilfe? · Ronki';
const EM_DASH = String.fromCharCode(0x2014);

function pictures(root: ParentNode) {
  return Array.from(root.querySelectorAll('img')).map((img) => img.getAttribute('src'));
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

describe('Abend mit zwei Kindern sheet', () => {
  it('shows the adult overview with both children as columns and their lights-out times', () => {
    const plan = setLightsOut(defaultPlan(), 'm', '20:00');
    const { container } = render(<AbendZweiKinderSheet plan={plan} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Unser Abend' })).toBeInTheDocument();
    const star = container.querySelector('[data-col-head="s"]')!;
    const moon = container.querySelector('[data-col-head="m"]')!;
    expect(star.textContent).toBe('Stern-KindLicht aus 19:30');
    expect(moon.textContent).toBe('Mond-KindLicht aus 20:00');
    expect(pictures(star)).toEqual(['/art/bilderbuch/tasks/star.webp']);
    expect(pictures(moon)).toEqual(['/art/bilderbuch/tasks/moon.webp']);
    expect(container.textContent).toContain('Wer braucht wann deine Hilfe? Die Hand zeigt es.');
  });

  it('marks every "braucht dich" step with the hands and a "zusammen" step once across both columns', () => {
    let plan = toggleTogether(defaultPlan(), 'z');
    plan = toggleNeeds(plan, 's', 'o');
    const { container } = render(<AbendZweiKinderSheet plan={plan} />);
    const overview = container.querySelector('[data-overview]')!;
    const together = overview.querySelectorAll('[data-together]');
    expect(together).toHaveLength(1);
    expect(together[0].textContent).toContain('Zähne putzen');
    expect(together[0].textContent).toContain('zusammen');
    expect(together[0].querySelectorAll('[data-needs]')).toHaveLength(1);
    // Zähne putzen once for both, plus "Licht aus" for the Stern-Kind.
    expect(overview.querySelectorAll('[data-rows] [data-needs]')).toHaveLength(2);
    expect(overview.querySelectorAll('[data-rows] [data-code="z"]')).toHaveLength(1);
    expect(pictures(overview)).toContain('/art/bilderbuch/tasks/hands.webp');
  });

  it('has no rings or boxes to tick on the overview; the cards keep the evening rings', () => {
    const { container } = render(<AbendZweiKinderSheet plan={defaultPlan()} />);
    const overview = container.querySelector('[data-overview]')!;
    expect(overview.querySelectorAll('.rs-ring, input, [role="checkbox"]')).toHaveLength(0);
    for (const id of ['s', 'm']) {
      expect(container.querySelectorAll(`[data-card="${id}"] .rs-ring`)).toHaveLength(4);
    }
  });

  it('gives each child a card with its symbol, "Mein Abend", the steps and the lights-out band', () => {
    const plan = setLightsOut(addStep(defaultPlan(), 'm', 'h'), 'm', '20:15');
    const { container } = render(<AbendZweiKinderSheet plan={plan} />);
    const star = container.querySelector('[data-card="s"]')!;
    const moon = container.querySelector('[data-card="m"]')!;
    expect(within(star as HTMLElement).getByRole('heading', { level: 3 })).toHaveTextContent('Mein Abend');
    expect(pictures(star)[0]).toBe('/art/bilderbuch/tasks/star.webp');
    expect(pictures(moon)[0]).toBe('/art/bilderbuch/tasks/moon.webp');
    expect(star.querySelector('[data-band]')?.textContent).toBe('Licht aus um 19:30 Uhr.');
    expect(moon.querySelector('[data-band]')?.textContent).toBe('Licht aus um 20:15 Uhr.');
    expect(pictures(moon)).toContain('/art/bilderbuch/tasks/headphones.webp');
    // With the Hörspiel, "Licht aus" says good night.
    expect(moon.querySelector('[data-code="o"]')?.textContent).toContain('Augen zu, gute Nacht.');
    expect(star.querySelector('[data-code="o"]')?.textContent).toContain('Augen zu, gute Nacht.');
    expect(moon.querySelector('[data-code="o"] [data-time]')?.textContent).toBe('20:15 Uhr');
  });

  it('says "Ihr seid zu zweit." in the head with two adults', () => {
    const { container } = render(<AbendZweiKinderSheet plan={setAdults(defaultPlan(), 2)} />);
    expect(container.querySelector('.rs-head')?.textContent).toContain('Ihr seid zu zweit.');
  });

  it('prints no name line, no falling-asleep time and no end time for the adult', () => {
    const { container } = render(<AbendZweiKinderSheet plan={toggleTogether(defaultPlan(), 'z')} />);
    const text = container.textContent ?? '';
    expect(text).not.toContain('Das ist der Plan von');
    expect(text).not.toMatch(/einschlaf|schläft ein|Feierabend|fertig um|Ende um/i);
    expect(text).not.toContain(EM_DASH);
    expect(text).toContain('ronki.de/tools/abend-mit-zwei-kindern');
  });

  it('marks the steps that clash, for the preview', () => {
    const plan = toggleNeeds(toggleNeeds(defaultPlan(), 's', 'z'), 'm', 'z');
    const { container } = render(<AbendZweiKinderSheet plan={plan} clashes={checkClash(plan)} />);
    expect(container.querySelectorAll('[data-clash]')).toHaveLength(2);
    expect(container.querySelector('[data-clash]')?.textContent).toContain('passt noch nicht');
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
      <AbendZweiKinder />
    </MemoryRouter>,
  );
}

function preview() {
  return screen.getByTestId('az-preview');
}

function printButton() {
  return screen.getByRole('button', { name: 'Drucken' });
}

function togetherGroup() {
  return screen.getByRole('group', { name: 'Was macht ihr zusammen?' });
}

// Both children need the adult for the teeth at 19:21. Does not fit with one adult.
const SAME_STEP = '?sb=z&mb=z';
// Stern-Kind: Vorlesen 19:20 to 19:30, Mond-Kind: Zähne putzen from 19:21.
const TWO_STEPS = '?s=lo&sb=l&mb=z';
const TWO_STEPS_MESSAGE =
  'Um 19:21 brauchen dich beide: das Stern-Kind bei „Vorlesen“, das Mond-Kind bei „Zähne putzen“. Verschieb eine Licht-aus-Zeit oder ändere die Minuten. Oder ein Kind macht in der Zeit etwas ohne dich, etwa ein Hörspiel.';

describe('Abend mit zwei Kindern page', () => {
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

  it('asks for no name anywhere: the only fields you type into are the own steps', () => {
    const { container } = renderPage('?s=xo&m=xo');
    const typed = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="text"], textarea'));
    expect(typed).toHaveLength(2);
    for (const field of Array.from(container.querySelectorAll('input, textarea, select'))) {
      const words = [
        field.getAttribute('name'),
        field.getAttribute('id'),
        field.getAttribute('autocomplete'),
        field.getAttribute('placeholder'),
        field.getAttribute('aria-label'),
        ...Array.from((field as HTMLInputElement).labels ?? []).map((l) => l.textContent),
      ].join(' ');
      expect(words).not.toMatch(/name|vorname|heißt|geburt|alter/i);
    }
    for (const field of typed) {
      expect(field).toHaveAttribute('autocomplete', 'off');
      expect(field).toHaveAttribute('maxLength', '24');
    }
    expect(container.textContent).toContain('Trag nur einen Schritt ein, keine Namen: Der Text steht auch im Link.');
  });

  it('says once that the family decides who is Stern and who is Mond, and that it predicts no sleep and is no race', () => {
    const { container } = renderPage();
    const text = container.textContent ?? '';
    expect(text.split('Welches Kind ist Stern, welches Mond, entscheidet ihr.')).toHaveLength(2);
    expect(text).toContain('Der Plan sagt nicht, wann ein Kind einschläft.');
    expect(text).toContain('kein Wettrennen');
  });

  it('starts with one adult, the four evening steps for both and nothing marked', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Einer' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Zwei' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('Stern-Kind: Wann ist Licht aus?')).toHaveValue('19:30');
    expect(screen.getByLabelText('Mond-Kind: Wann ist Licht aus?')).toHaveValue('19:30');
    for (const name of ['Stern-Kind', 'Mond-Kind']) {
      for (const label of ['Zähne putzen', 'Gesicht waschen', 'Pyjama an', 'Licht aus']) {
        expect(screen.getByRole('button', { name: `${name}: ${label} braucht dich` })).toHaveAttribute('aria-pressed', 'false');
      }
    }
    expect(window.location.search).toBe('');
    expect(printButton()).toBeEnabled();
  });

  it('keeps the plan in the address bar as the parent changes it', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Stern-Kind: Zähne putzen braucht dich' }));
    expect(window.location.pathname).toBe(PAGE_PATH);
    expect(window.location.search).toBe('?sb=z');
    fireEvent.change(screen.getByLabelText('Mond-Kind: Wann ist Licht aus?'), { target: { value: '20:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mond-Kind: Schritt dazunehmen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mond-Kind: Hörspiel dazunehmen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mond-Kind: Hörspiel, eine Minute mehr' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zwei' }));
    expect(window.location.search).toBe('?a=2&sb=z&m=zwyho&ma=2000&mm=3.3.3.16.1');
    expect(within(preview()).getAllByText('Hörspiel')).toHaveLength(2);
  });

  it('adds an own step, keeps spaces while typing and puts the cleaned text on the sheet', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Stern-Kind: Schritt dazunehmen' }));
    const draft = document.getElementById('az-own-s') as HTMLInputElement;
    fireEvent.change(draft, { target: { value: 'Medizin ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Stern-Kind: eigenen Schritt dazunehmen' }));
    const field = screen.getByRole('textbox', { name: 'Stern-Kind: eigener Schritt' });
    expect(field).toHaveValue('Medizin ');
    expect(window.location.search).toBe('?s=zwyxo&se=Medizin');
    expect(preview().querySelector('[data-card="s"]')?.textContent).toContain('Medizin');
  });

  it('offers "zusammen" only for steps both children have, and hides the question when there is none', () => {
    renderPage('?s=lzo&m=zo');
    const buttons = within(togetherGroup()).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['Zähne putzen', 'Licht aus']);
    act(() => {
      window.history.replaceState(null, '', `${PAGE_PATH}?s=l&m=z`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.queryByRole('group', { name: 'Was macht ihr zusammen?' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Was macht ihr zusammen?' })).toBeNull();
  });

  it('shows a short clash line next to both children, the full message once above print, and blocks printing', () => {
    const print = vi.fn();
    window.print = print;
    renderPage(TWO_STEPS);
    for (const id of ['s', 'm']) {
      const near = document.querySelector(`[data-clash-child="${id}"]`)?.textContent;
      expect(near).toContain('19:21: Beide brauchen dich.');
      expect(near).not.toContain(TWO_STEPS_MESSAGE);
    }
    const summary = document.querySelector('[data-clash-summary]')!;
    expect(summary.textContent).toContain('Das passt noch nicht:');
    expect(summary.textContent).toContain(TWO_STEPS_MESSAGE);
    expect(preview().querySelectorAll('[data-clash]').length).toBeGreaterThan(0);
    // The check comes before the print button in the page order.
    expect(summary.compareDocumentPosition(printButton()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(printButton()).toBeDisabled();
    expect(printButton()).toHaveAccessibleDescription(
      'Drucken geht, sobald alles zusammenpasst. Ändere dafür oben Zeiten oder Schritte.',
    );
    fireEvent.click(printButton());
    expect(print).not.toHaveBeenCalled();
    // Nothing was moved for the parent.
    expect(window.location.search).toBe(TWO_STEPS);
    // Even the browser's own print gets a note instead of the sheet.
    expect(document.querySelector('.az-print .az-sheet')).toBeNull();
    expect(document.querySelector('.az-print-unfit')).not.toBeNull();
  });

  it('prints once the same step is done together', () => {
    renderPage(SAME_STEP);
    expect(printButton()).toBeDisabled();
    expect(document.querySelector('[data-clash-summary]')?.textContent).toContain(
      'Um 19:21 brauchen dich beide bei „Zähne putzen“. Mach es mit beiden zusammen: Tipp es unter „Was macht ihr zusammen?“ an. Oder verschieb eine Licht-aus-Zeit.',
    );
    fireEvent.click(within(togetherGroup()).getByRole('button', { name: 'Zähne putzen' }));
    expect(within(togetherGroup()).getByRole('button', { name: 'Zähne putzen' })).toHaveAttribute('aria-pressed', 'true');
    expect(printButton()).toBeEnabled();
    expect(document.querySelector('[data-clash-child="s"]')).toBeNull();
    expect(document.querySelectorAll('.az-print .az-sheet')).toHaveLength(1);
    expect(window.location.search).toBe('?sb=z&mb=z&z=z');
  });

  it('prints with two adults, and says only "zusammen" steps must line up', () => {
    renderPage(TWO_STEPS);
    fireEvent.click(screen.getByRole('button', { name: 'Zwei' }));
    expect(printButton()).toBeEnabled();
    expect(document.querySelector('[data-clash-summary]')?.textContent).toContain(
      'Ihr seid zu zweit: Jeder von euch kann ein Kind ins Bett bringen. Nur was ihr mit beiden zusammen macht, muss bei beiden zur selben Zeit sein.',
    );
    expect(document.querySelector('[data-clash-child="s"]')).toBeNull();
  });

  it('still blocks a "zusammen" step at two times with two adults', () => {
    renderPage('?a=2&s=lo&sa=1920&sb=l&m=lo&mb=l&z=l');
    expect(printButton()).toBeDisabled();
    expect(document.querySelector('[data-clash-summary]')?.textContent).toContain(
      '„Vorlesen“ macht ihr zusammen, aber beim Stern-Kind beginnt es um 19:10 und beim Mond-Kind um 19:20.',
    );
  });

  it('prints and counts it without plan data', () => {
    const print = vi.fn();
    window.print = print;
    renderPage('?s=xo&se=Medizin&sb=x');
    fireEvent.click(printButton());
    expect(print).toHaveBeenCalledTimes(1);
    expect(plausibleCalls()).toEqual([['Abend mit zwei Kindern Drucken']]);
    expect(JSON.stringify(plausibleCalls())).not.toMatch(/Medizin|sb=|xo/);
  });

  it('counts the first change once, without plan data', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Stern-Kind: Zähne putzen braucht dich' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mond-Kind: Pyjama an braucht dich' }));
    expect(plausibleCalls()).toEqual([['Abend mit zwei Kindern erstellt']]);
  });

  it('restores a plan from an opened link', () => {
    renderPage('?a=2&s=zlo&sa=2000&sb=zl&m=zho&ma=1945&mb=z&z=z');
    expect(screen.getByRole('button', { name: 'Zwei' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Stern-Kind: Wann ist Licht aus?')).toHaveValue('20:00');
    expect(screen.getByLabelText('Mond-Kind: Wann ist Licht aus?')).toHaveValue('19:45');
    expect(screen.getByRole('button', { name: 'Stern-Kind: Vorlesen braucht dich' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Mond-Kind: Hörspiel braucht dich' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(togetherGroup()).getByRole('button', { name: 'Zähne putzen' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(preview()).getAllByText('Hörspiel').length).toBeGreaterThan(0);
    expect(window.location.search).toBe('?a=2&s=zlo&sa=2000&sb=zl&m=zho&ma=1945&mb=z&z=z');
  });

  it('follows the address bar when the parent goes back in the browser', () => {
    renderPage();
    window.history.pushState(null, '', `${PAGE_PATH}#main`);
    fireEvent.click(screen.getByRole('button', { name: 'Zwei' }));
    fireEvent.click(screen.getByRole('button', { name: 'Stern-Kind: Schritt dazunehmen' }));
    fireEvent.change(document.getElementById('az-own-s')!, { target: { value: 'Tee' } });
    fireEvent.click(screen.getByRole('button', { name: 'Stern-Kind: eigenen Schritt dazunehmen' }));
    expect(window.location.search).toBe('?a=2&s=zwyxo&se=Tee');

    // Back: the address bar shows the plan from before; the page must follow.
    act(() => {
      window.history.replaceState(null, '', `${PAGE_PATH}?s=xo&se=Malen`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('button', { name: 'Einer' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Stern-Kind: eigener Schritt' })).toHaveValue('Malen');
    expect(window.location.search).toBe('?s=xo&se=Malen');
  });

  it('jumps with the skip link without a history entry, so Back never wipes the plan', () => {
    renderPage(TWO_STEPS);
    const before = window.history.length;
    fireEvent.click(screen.getByRole('link', { name: 'Zum Hauptinhalt springen' }));
    expect(window.history.length).toBe(before);
    expect(window.location.hash).toBe('');
    expect(window.location.search).toBe(TWO_STEPS);
  });

  it('says honestly what the link carries and who it is for, with no class-chat line', () => {
    const { container } = renderPage();
    const text = container.textContent ?? '';
    expect(text).toContain('Der Plan steht nur im Link, gespeichert wird nichts.');
    expect(text).toContain('Schick ihn an die Person, die mit dir die Kinder ins Bett bringt');
    expect(text).toContain('Babysitter');
    expect(text).not.toMatch(/Klasse|Klassenchat|Elternchat/);
  });

  it('copies the link and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderPage('?sb=z');
    fireEvent.click(screen.getByRole('button', { name: 'Link kopieren' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}${PAGE_PATH}?sb=z`);
    expect(await screen.findByText('Kopiert')).toBeInTheDocument();
    expect(plausibleCalls()).toEqual([['Abend mit zwei Kindern Link', { props: { weg: 'kopiert' } }]]);
  });

  it('shares the link with the evening line where the phone can share, even while it clashes', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    renderPage(TWO_STEPS);
    fireEvent.click(screen.getByRole('button', { name: 'Teilen' }));
    expect(SHARE_TEXT).toBe('Unser Abend mit zwei Kindern: wer wann was braucht.');
    expect(share).toHaveBeenCalledWith({
      title: 'Abend mit zwei Kindern',
      text: SHARE_TEXT,
      url: `${window.location.origin}${PAGE_PATH}${TWO_STEPS}`,
    });
    await vi.waitFor(() =>
      expect(plausibleCalls()).toEqual([['Abend mit zwei Kindern Link', { props: { weg: 'geteilt' } }]]),
    );
  });

  it('links the evening template, the Schlafens-Rechner and its article (Claude F3)', () => {
    const { container } = renderPage('?sb=z');
    expect(screen.getByRole('link', { name: 'die Abendroutine zum Ausdrucken' })).toHaveAttribute(
      'href',
      '/vorlagen/abendroutine',
    );
    expect(screen.getByRole('link', { name: 'der Schlafens-Rechner' })).toHaveAttribute('href', '/tools/schlafens-rechner');
    expect(screen.getByRole('link', { name: 'Abendroutine mit zwei Kindern' })).toHaveAttribute(
      'href',
      '/ratgeber/abendroutine-zwei-kinder',
    );
    for (const link of Array.from(container.querySelectorAll('a'))) {
      expect(link.getAttribute('href') ?? '').not.toContain('sb=');
    }
  });

  it('writes the page copy without em-dashes, streaks, points, rewards or a race', () => {
    const { container } = renderPage(TWO_STEPS);
    // The shared sheet footer says the opposite on purpose: "Streaks gibt es hier nicht."
    const text = (container.textContent ?? '').replace('Streaks gibt es hier nicht.', '');
    expect(text).not.toContain(EM_DASH);
    expect(text).not.toMatch(/Streak|Punkte|Belohnung|Sticker|schneller als|gewinnt/);
  });

  it('uses the same title and description for the browser and the prerendered crawler HTML', () => {
    renderPage();
    expect(document.title).toBe(TOOL_TITLE);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThan(156);
    expect(description).not.toContain(EM_DASH);
    expect(prerenderSource).toContain(`path: '${PAGE_PATH}'`);
    expect(prerenderSource).toContain(`title: '${TOOL_TITLE}'`);
    expect(prerenderSource).toContain(description!);
    expect(prerenderSource).toContain(`ogImage: '/og-tool-abend-zwei-kinder.jpg'`);
  });
});

/* ------------------------------------------------------------------ */
/* Wiring                                                              */
/* ------------------------------------------------------------------ */

describe('Abend mit zwei Kindern wiring', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('serves the tool on its route', async () => {
    render(
      <MemoryRouter initialEntries={[PAGE_PATH]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: H1 })).toBeInTheDocument();
  });

  it('lists the tool in the sitemap', () => {
    expect(sitemap).toContain(`<loc>https://www.ronki.de${PAGE_PATH}</loc>`);
  });

  it('has a card on the tools hub with its own button words, and the hub counts seven tools', () => {
    const { container } = render(
      <MemoryRouter>
        <ToolsHub />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === PAGE_PATH);
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain('Abend mit zwei Kindern planen');
    expect(container.querySelectorAll('ul > li a[href^="/tools/"]')).toHaveLength(7);
    expect(container.textContent).toContain('Diese sieben sind der Anfang.');
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    expect(description).toContain('Abend mit zwei Kindern');
    expect(description.length).toBeLessThan(160);
  });

  it('keeps the default plan out of the link', () => {
    expect(decodePlan('')).toEqual(defaultPlan());
  });
});
