import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VorlageMorgen from '../src/pages/VorlageMorgen';
import VorlageAbend from '../src/pages/VorlageAbend';
import VorlageAdhs from '../src/pages/VorlageAdhs';
import VorlageKleineGeschwister from '../src/pages/VorlageKleineGeschwister';
import { SHARE_TEXT } from '../src/lib/routine-builder';

const PAGE_PATH = '/vorlagen/morgenroutine';
const DEFAULT_DESCRIPTION =
  'Vier Schritte bis zur Tasche. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist.';
const LINK_NOTE =
  'Im Link stehen eure Schritte, die Uhrzeiten und euer eigener Schritt. Alle mit dem Link können das lesen.';
const PRIVACY = 'Trag hier nur einen Schritt ein, keine Namen: Der Text steht auch im Link.';

type PlausibleCall = [string, { props?: Record<string, unknown> }?];

function plausibleCalls(): PlausibleCall[] {
  return (window.plausible as unknown as ReturnType<typeof vi.fn>).mock.calls as PlausibleCall[];
}

function renderPage(search = '') {
  window.history.replaceState(null, '', `${PAGE_PATH}${search}`);
  return render(
    <MemoryRouter initialEntries={[`${PAGE_PATH}${search}`]}>
      <VorlageMorgen />
    </MemoryRouter>,
  );
}

/** Rows of the printed sheet. */
function sheetRows() {
  return within(screen.getByRole('list', { name: 'Die Schritte' })).getAllByRole('listitem');
}

function sheetLabels() {
  return sheetRows().map((row) => row.querySelector('.rs-label')?.textContent ?? '');
}

/** Rows of the builder list above the preview. */
function builderRows() {
  return within(screen.getByRole('list', { name: 'Eure Schritte' })).getAllByRole('listitem');
}

function sheetPictures(row: HTMLElement) {
  return Array.from(row.querySelectorAll('img')).map((img) => img.getAttribute('src'));
}

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

function openAdd() {
  const toggle = screen.getByRole('button', { name: 'Schritt dazunehmen' });
  if (toggle.getAttribute('aria-expanded') !== 'true') fireEvent.click(toggle);
}

describe('Morgenroutine builder', () => {
  beforeEach(() => {
    window.plausible = vi.fn() as unknown as typeof window.plausible;
  });

  afterEach(() => {
    delete window.plausible;
    delete (navigator as { share?: unknown }).share;
    delete (navigator as { clipboard?: unknown }).clipboard;
    window.history.replaceState(null, '', '/');
  });

  it('starts with the four steps, hints and line the page always had, and one H1', () => {
    const { container } = renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(sheetLabels()).toEqual(['Zähne putzen', 'Anziehen', 'Frühstücken', 'Tasche packen']);
    const rows = sheetRows();
    expect(rows[0]).toHaveTextContent('Oben, unten, außen, innen.');
    expect(rows[1]).toHaveTextContent('Wetter angucken, dann Sachen raussuchen.');
    expect(rows[2]).toHaveTextContent('Am Tisch, in Ruhe.');
    expect(rows[3]).toHaveTextContent('Brotdose, Trinken, Hausaufgaben.');
    expect(screen.getByText(DEFAULT_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByText('Für heute fertig. Ronki jubelt mit.')).toBeInTheDocument();
    // No times until the parent asks for them.
    expect(container.querySelector('.rs-sheet [data-time]')).toBeNull();
    expect(window.location.search).toBe('');
    expect(plausibleCalls()).toEqual([]);
  });

  it('keeps all builder controls off the paper', () => {
    const { container } = renderPage();
    const builder = container.querySelector('#eure-schritte')!;
    expect(builder).toHaveClass('print:hidden');
    const linkButton = screen.getByRole('button', { name: 'Link kopieren' });
    expect(linkButton.closest('.print\\:hidden')).not.toBeNull();
    expect(screen.getByRole('link', { name: /Mit Ronki weitermachen/ }).closest('.print\\:hidden')).not.toBeNull();
    // The sheet itself is not hidden in print.
    expect(screen.getByRole('list', { name: 'Die Schritte' }).closest('.print\\:hidden')).toBeNull();
  });

  it('asks for nothing personal: no field for a name, a child, a school or a class', () => {
    const { container } = renderPage('?s=zdx&e=Medizin&los=0740');
    const fields = Array.from(container.querySelectorAll('input, textarea, select'));
    const typed = fields.filter(
      (field) => field.tagName !== 'INPUT' || ['text', 'search', ''].includes(field.getAttribute('type') ?? ''),
    );
    for (const field of fields) {
      const words = [
        field.getAttribute('name'),
        field.getAttribute('id'),
        field.getAttribute('placeholder'),
        field.getAttribute('aria-label'),
        field.getAttribute('autocomplete'),
        ...(typed.includes(field) ? Array.from((field as HTMLInputElement).labels ?? []).map((l) => l.textContent) : []),
      ].join(' ');
      // The PDF form further up asks for an e-mail; the builder asks for nothing else.
      if (field.closest('#pdf')) continue;
      expect(words).not.toMatch(/name|kind|schule|klasse/i);
    }
    // The only builder field you type into is the own step.
    const builder = container.querySelector('#eure-schritte')!;
    expect(builder.querySelectorAll('input[type="text"], textarea')).toHaveLength(1);
  });

  it('moves a step down and up on the sheet and in the address bar', () => {
    renderPage();
    const up = screen.getByRole('button', { name: 'Zähne putzen nach oben' });
    expect(up).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tasche packen nach unten' })).toBeDisabled();

    click('Zähne putzen nach unten');
    expect(sheetLabels()).toEqual(['Anziehen', 'Zähne putzen', 'Frühstücken', 'Tasche packen']);
    expect(window.location.pathname).toBe(PAGE_PATH);
    expect(window.location.search).toBe('?s=dzfp');

    click('Frühstücken nach oben');
    expect(sheetLabels()).toEqual(['Anziehen', 'Frühstücken', 'Zähne putzen', 'Tasche packen']);
    expect(window.location.search).toBe('?s=dfzp');
  });

  it('removes steps and never the last one', () => {
    renderPage();
    click('Anziehen entfernen');
    expect(sheetLabels()).toEqual(['Zähne putzen', 'Frühstücken', 'Tasche packen']);
    expect(window.location.search).toBe('?s=zfp');
    expect(screen.getByText(/^Drei Schritte bis zur Tasche\./)).toBeInTheDocument();

    click('Zähne putzen entfernen');
    click('Frühstücken entfernen');
    expect(sheetLabels()).toEqual(['Tasche packen']);
    expect(screen.getByRole('button', { name: 'Tasche packen entfernen' })).toBeDisabled();
    expect(builderRows()).toHaveLength(1);
  });

  it('adds steps from the picture grid and stops at six', () => {
    renderPage();
    openAdd();
    click('Aufstehen dazunehmen');
    // It lands where it belongs in a morning: on top.
    expect(sheetLabels()).toEqual(['Aufstehen', 'Zähne putzen', 'Anziehen', 'Frühstücken', 'Tasche packen']);
    expect(window.location.search).toBe('?s=azdfp');
    const row = sheetRows()[0];
    expect(row).toHaveTextContent('Licht an, Vorhang auf.');
    expect(sheetPictures(row)).toEqual(['/art/bilderbuch/tasks/wake.webp']);
    // A chosen step leaves the grid.
    expect(screen.queryByRole('button', { name: 'Aufstehen dazunehmen' })).toBeNull();

    click('Haare kämmen dazunehmen');
    expect(sheetRows()).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Schritt dazunehmen' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Klo dazunehmen' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Eigenen Schritt dazunehmen' })).toBeNull();
    expect(screen.getByText(/^Sechs Schritte passen auf das Blatt\./)).toBeInTheDocument();

    click('Haare kämmen entfernen');
    expect(screen.getByRole('button', { name: 'Schritt dazunehmen' })).toBeEnabled();
  });

  it('adds an own step with a box to draw in, or a picture for a word the site knows', () => {
    renderPage();
    openAdd();
    const field = screen.getByRole('textbox', { name: 'Eigener Schritt' });
    expect(field).toHaveAttribute('maxLength', '24');
    expect(field).toHaveAttribute('placeholder', 'z. B. Medizin nehmen');
    expect(screen.getByText(PRIVACY)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eigenen Schritt dazunehmen' })).toBeDisabled();

    fireEvent.change(field, { target: { value: 'Medizin nehmen ' } });
    // Typing alone does not change the sheet yet.
    expect(sheetRows()).toHaveLength(4);
    click('Eigenen Schritt dazunehmen');

    // The own step goes in before the school bag.
    const own = sheetRows()[3];
    expect(own).toHaveTextContent('Medizin nehmen');
    expect(own.querySelectorAll('[data-draw]')).toHaveLength(1);
    expect(sheetPictures(own)).toEqual([]);
    expect(window.location.search).toBe('?s=zdfxp&e=Medizin+nehmen');

    // Now the step is edited right in its row; spaces stay while typing.
    const inline = within(builderRows()[3]).getByRole('textbox', { name: 'Eigener Schritt' });
    expect(inline).toHaveValue('Medizin nehmen ');
    fireEvent.change(inline, { target: { value: 'Kuscheltier ' } });
    expect(inline).toHaveValue('Kuscheltier ');
    expect(sheetPictures(sheetRows()[3])).toEqual(['/art/bilderbuch/tasks/teddy.webp']);
    expect(sheetRows()[3].querySelectorAll('[data-draw]')).toHaveLength(0);
    expect(window.location.search).toBe('?s=zdfxp&e=Kuscheltier');
    expect(screen.getByRole('button', { name: 'Kuscheltier entfernen' })).toBeEnabled();
  });

  it('writes the clock times on the sheet when the switch is on, and takes them off again', () => {
    const { container } = renderPage();
    const toggle = screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' });
    expect(toggle).not.toBeChecked();
    expect(screen.queryByRole('combobox', { name: 'Wann müsst ihr los?' })).toBeNull();

    fireEvent.click(toggle);
    expect(window.location.search).toBe('?los=0730');
    fireEvent.change(screen.getByRole('combobox', { name: 'Wann müsst ihr los?' }), { target: { value: '07:40' } });
    expect(window.location.search).toBe('?los=0740');
    expect(sheetRows().map((row) => row.querySelector('[data-time]')?.textContent)).toEqual([
      '7:07 Uhr',
      '7:10 Uhr',
      '7:20 Uhr',
      '7:35 Uhr',
    ]);
    expect(screen.getByText('Für heute fertig. Los um 7:40 Uhr.')).toBeInTheDocument();

    // Five more minutes for breakfast: everything before it starts earlier.
    for (let i = 0; i < 5; i += 1) click('Frühstücken: eine Minute mehr');
    expect(window.location.search).toBe('?los=0740&m=3.10.20.5');
    expect(sheetRows()[0].querySelector('[data-time]')).toHaveTextContent('7:02 Uhr');
    expect(sheetRows()[3].querySelector('[data-time]')).toHaveTextContent('7:35 Uhr');

    fireEvent.click(toggle);
    expect(container.querySelector('.rs-sheet [data-time]')).toBeNull();
    expect(screen.getByText('Für heute fertig. Ronki jubelt mit.')).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  it('keeps the minutes between 1 and 30', () => {
    const { unmount } = renderPage('?s=b&los=0730');
    expect(screen.getByRole('button', { name: 'Brille aufsetzen: eine Minute weniger' })).toBeDisabled();
    unmount();
    renderPage('?s=f&los=0730&m=30');
    expect(screen.getByRole('button', { name: 'Frühstücken: eine Minute mehr' })).toBeDisabled();
  });

  it('restores a plan from an opened link', () => {
    renderPage('?s=akzx&e=Medizin+nehmen&los=0745&m=5.3.3.4');
    expect(sheetLabels()).toEqual(['Aufstehen', 'Klo', 'Zähne putzen', 'Medizin nehmen']);
    expect(within(builderRows()[3]).getByRole('textbox', { name: 'Eigener Schritt' })).toHaveValue('Medizin nehmen');
    expect(screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' })).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Wann müsst ihr los?' })).toHaveValue('07:45');
    expect(sheetRows()[0].querySelector('[data-time]')).toHaveTextContent('7:30 Uhr');
    // Opening a link is not a change by the parent.
    expect(plausibleCalls()).toEqual([]);
  });

  it('follows the address bar when the parent goes back in the browser', () => {
    renderPage();
    window.history.pushState(null, '', `${PAGE_PATH}#main`);
    openAdd();
    click('Aufstehen dazunehmen');
    fireEvent.change(screen.getByRole('textbox', { name: 'Eigener Schritt' }), { target: { value: 'Medizin ' } });
    click('Eigenen Schritt dazunehmen');
    expect(window.location.search).toBe('?s=azdfxp&e=Medizin');

    // Back: the address bar shows an older plan; the page must follow, drafts too.
    act(() => {
      window.history.replaceState(null, '', `${PAGE_PATH}?s=zdfpx&e=Laterne`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(sheetLabels()).toEqual(['Zähne putzen', 'Anziehen', 'Frühstücken', 'Tasche packen', 'Laterne']);
    expect(within(builderRows()[4]).getByRole('textbox', { name: 'Eigener Schritt' })).toHaveValue('Laterne');

    act(() => {
      window.history.replaceState(null, '', PAGE_PATH);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(sheetLabels()).toEqual(['Zähne putzen', 'Anziehen', 'Frühstücken', 'Tasche packen']);
    expect(window.location.search).toBe('');
  });

  it('leaves a campaign link alone until the parent changes something', () => {
    renderPage('?utm_source=whatsapp&utm_campaign=morgenroutine-start');
    expect(window.location.search).toBe('?utm_source=whatsapp&utm_campaign=morgenroutine-start');
    click('Anziehen nach oben');
    expect(window.location.search).toBe('?s=dzfp');
  });

  it('copies a link that carries the plan and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderPage('?s=zdx&e=Medizin+nehmen&los=0740');
    click('Link kopieren');
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}${PAGE_PATH}?s=zdx&e=Medizin+nehmen&los=0740`);
    expect(await screen.findByText('Kopiert')).toBeInTheDocument();
    expect(screen.getByText(LINK_NOTE)).toBeInTheDocument();
  });

  it('shares the link where the phone can share', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    renderPage('?s=az');
    click('Teilen');
    expect(share).toHaveBeenCalledWith({
      title: 'Morgenroutine',
      text: SHARE_TEXT,
      url: `${window.location.origin}${PAGE_PATH}?s=az`,
    });
  });

  it('shows no share button where the browser cannot share', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: 'Teilen' })).toBeNull();
  });

  it('prints the sheet as shown', () => {
    const print = vi.fn();
    window.print = print;
    renderPage('?s=az');
    const buttons = screen.getAllByRole('button', { name: 'Drucken' });
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) fireEvent.click(button);
    expect(print).toHaveBeenCalledTimes(buttons.length);
  });

  it('carries the app steps into the card link, in sheet order and without the own step', () => {
    renderPage('?s=kzaxhp&e=Medizin+nehmen&los=0740');
    const link = screen.getByRole('link', { name: /Mit Ronki weitermachen/ });
    expect(link).toHaveAttribute('href', '/profil-erstellen?morgen=teeth_am,wake,packcheck');
    expect(link.getAttribute('href')).not.toMatch(/Medizin|los|e=/);
    expect(
      screen.getByText(
        'Ronki übernimmt in der App: Zähne putzen, Aufstehen, Schultasche. Der Rest bleibt auf eurem Blatt.',
      ),
    ).toBeInTheDocument();
  });

  it('names no rest when the app takes over every step', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Mit Ronki weitermachen/ })).toHaveAttribute(
      'href',
      '/profil-erstellen?morgen=teeth_am,dress,breakfast,packcheck',
    );
    expect(
      screen.getByText('Ronki übernimmt in der App: Zähne putzen, Anziehen, Frühstück, Schultasche.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Der Rest bleibt/)).toBeNull();
  });

  it('hides the card button when no chosen step is in the app', () => {
    renderPage('?s=khx&e=Medizin');
    expect(screen.queryByRole('link', { name: /Mit Ronki weitermachen/ })).toBeNull();
    expect(screen.queryByText(/Ronki übernimmt/)).toBeNull();
  });

  it('counts the first change once and the card button, never the steps', () => {
    renderPage();
    click('Zähne putzen nach unten');
    click('Anziehen entfernen');
    fireEvent.click(screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' }));
    fireEvent.click(screen.getByRole('link', { name: /Mit Ronki weitermachen/ }));
    expect(plausibleCalls()).toEqual([
      ['Vorlage angepasst', { props: { vorlage: 'morgen' } }],
      ['Karte aus Vorlage', { props: { vorlage: 'morgen' } }],
    ]);
    expect(JSON.stringify(plausibleCalls())).not.toMatch(/teeth|Zähne|s=|los/);
  });

  it('points the guide to the builder above', () => {
    renderPage();
    const guideLink = screen.getByRole('link', { name: 'Eure Schritte' });
    expect(guideLink).toHaveAttribute('href', '#eure-schritte');
    expect(document.getElementById('eure-schritte')).not.toBeNull();
    expect(screen.queryByText(/nimm Aufstehen und Waschen dazu/)).toBeNull();
  });
});

describe('Other template pages keep their fixed steps', () => {
  it.each([
    ['Abend', VorlageAbend, 4],
    ['ADHS', VorlageAdhs, 6],
    ['Kleine Geschwister', VorlageKleineGeschwister, 4],
  ] as const)('%s has no builder, no switch and no link row', (_, Page, count) => {
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('heading', { name: 'Eure Schritte' })).toBeNull();
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Link kopieren' })).toBeNull();
    expect(screen.queryByRole('link', { name: /Mit Ronki weitermachen/ })).toBeNull();
    expect(sheetRows()).toHaveLength(count);
  });
});
