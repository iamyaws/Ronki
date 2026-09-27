import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import VorlageMorgen from '../src/pages/VorlageMorgen';
import VorlageAbend from '../src/pages/VorlageAbend';
import { ClockChangeNote } from '../src/components/routine-builder/RoutineBuilder';

const MORNING_PATH = '/vorlagen/morgenroutine';
const EVENING_PATH = '/vorlagen/abendroutine';
const QUESTION = 'Wie steht die Uhrzeit auf dem Blatt?';
const NOTE =
  'Am 25. Oktober werden die Uhren eine Stunde zurückgestellt. Wie ihr den Morgen davor anpasst, steht im Artikel zur Zeitumstellung.';

type PlausibleCall = [string, { props?: Record<string, unknown> }?];

function plausibleCalls(): PlausibleCall[] {
  return (window.plausible as unknown as ReturnType<typeof vi.fn>).mock.calls as PlausibleCall[];
}

function renderAt(path: string, search: string, Page: ComponentType) {
  window.history.replaceState(null, '', `${path}${search}`);
  return render(
    <MemoryRouter initialEntries={[`${path}${search}`]}>
      <Page />
    </MemoryRouter>,
  );
}

const renderMorning = (search = '') => renderAt(MORNING_PATH, search, VorlageMorgen);
const renderEvening = (search = '') => renderAt(EVENING_PATH, search, VorlageAbend);

function sheetRows() {
  return within(screen.getByRole('list', { name: 'Die Schritte' })).getAllByRole('listitem');
}

function sheet() {
  return screen.getByRole('list', { name: 'Die Schritte' }).closest('.rs-sheet')!;
}

function faces() {
  return sheetRows().map((row) => row.querySelector('svg[data-clock]')?.getAttribute('data-clock'));
}

function writtenTimes() {
  return sheetRows().map((row) => row.querySelector('[data-time]')?.textContent);
}

function hiddenTimes() {
  return sheetRows().map((row) => row.querySelector('[data-clock-label]')?.textContent);
}

function pick(name: 'Als Zahl' | 'Als Uhr' | 'Beides') {
  fireEvent.click(screen.getByRole('radio', { name }));
}

/** The print button under the sheet (the toolbar at the top has one too). */
function builderPrintButton() {
  return screen.getAllByRole('button', { name: 'Drucken' }).find((button) => button.classList.contains('bb-press'))!;
}

beforeEach(() => {
  window.plausible = vi.fn() as unknown as typeof window.plausible;
  window.print = vi.fn();
});

afterEach(() => {
  delete window.plausible;
  vi.useRealTimers();
  window.history.replaceState(null, '', '/');
});

describe('Clock style on the morning builder', () => {
  it('asks how the time stands on the sheet only while times are on', () => {
    renderMorning();
    expect(screen.queryByRole('group', { name: QUESTION })).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();

    fireEvent.click(screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' }));
    const group = screen.getByRole('group', { name: QUESTION });
    expect(within(group).getAllByRole('radio').map((radio) => radio.closest('label')!.textContent)).toEqual([
      'Als Zahl',
      'Als Uhr',
      'Beides',
    ]);
    expect(screen.getByRole('radio', { name: 'Als Zahl' })).toBeChecked();
    expect(
      screen.getByText('Als Uhr: Neben dem Schritt steht eine Uhr, die so aussieht wie eure Küchenuhr zu der Zeit.'),
    ).toBeInTheDocument();
    expect(group.closest('.print\\:hidden')).not.toBeNull();
  });

  it('draws a face instead of the time with "Als Uhr", and both with "Beides"', () => {
    renderMorning('?los=0740');
    const asNumbers = sheet().outerHTML;

    pick('Als Uhr');
    expect(window.location.search).toBe('?los=0740&u=uhr');
    expect(faces()).toEqual(['7:05', '7:10', '7:20', '7:35']);
    expect(writtenTimes()).toEqual([undefined, undefined, undefined, undefined]);
    // The time stays readable for screen readers.
    expect(hiddenTimes()).toEqual(['7:05 Uhr', '7:10 Uhr', '7:20 Uhr', '7:35 Uhr']);
    for (const face of sheet().querySelectorAll('svg[data-clock]')) expect(face).toHaveAttribute('aria-hidden', 'true');

    pick('Beides');
    expect(window.location.search).toBe('?los=0740&u=beides');
    expect(faces()).toEqual(['7:05', '7:10', '7:20', '7:35']);
    expect(writtenTimes()).toEqual(['7:05 Uhr', '7:10 Uhr', '7:20 Uhr', '7:35 Uhr']);
    expect(hiddenTimes()).toEqual([undefined, undefined, undefined, undefined]);

    // Back to numbers: exactly the sheet from before.
    pick('Als Zahl');
    expect(window.location.search).toBe('?los=0740');
    expect(sheet().outerHTML).toBe(asNumbers);
  });

  it('prints "Als Zahl" exactly as the sheet always was', () => {
    renderMorning('?los=0740');
    expect(sheet().querySelector('.rs-clock, svg[data-clock], [data-clock-label]')).toBeNull();
    expect(sheet().querySelector('.rs-page')!.className).toBe('rs-page rs-page--roomy rs-page--timed');
    expect(writtenTimes()).toEqual(['7:05 Uhr', '7:10 Uhr', '7:20 Uhr', '7:35 Uhr']);
  });

  it('puts faces only on rows that print a time, and keeps their column', () => {
    // Starts 7:11, 7:16, 7:17, 7:20: the third row repeats 7:15 and prints nothing.
    renderMorning('?s=atzd&los=0730&u=uhr');
    expect(faces()).toEqual(['7:10', '7:15', undefined, '7:20']);
    expect(sheetRows()[2].querySelector('.rs-clock--none')).not.toBeNull();
    expect(hiddenTimes()).toEqual(['7:10 Uhr', '7:15 Uhr', undefined, '7:20 Uhr']);
  });

  it('keeps the choice while times are off and brings it back with them', () => {
    renderMorning('?los=0740&u=uhr');
    expect(screen.getByRole('radio', { name: 'Als Uhr' })).toBeChecked();
    const toggle = screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' });

    fireEvent.click(toggle);
    expect(window.location.search).toBe('');
    expect(screen.queryByRole('radio')).toBeNull();
    expect(sheet().querySelector('svg[data-clock], [data-clock-label], [data-time]')).toBeNull();

    fireEvent.click(toggle);
    expect(window.location.search).toBe('?los=0740&u=uhr');
    expect(screen.getByRole('radio', { name: 'Als Uhr' })).toBeChecked();
  });

  it('restores the style from an opened link without counting a change', () => {
    renderMorning('?s=az&los=0730&u=beides');
    expect(screen.getByRole('radio', { name: 'Beides' })).toBeChecked();
    expect(faces()).toEqual(['7:20', '7:25']);
    expect(writtenTimes()).toEqual(['7:20 Uhr', '7:25 Uhr']);
    expect(plausibleCalls()).toEqual([]);
  });

  it('reads an old link without the key, or a key it does not know, as "Als Zahl"', () => {
    renderMorning('?los=0740&u=Uhr');
    expect(screen.getByRole('radio', { name: 'Als Zahl' })).toBeChecked();
    expect(sheet().querySelector('svg[data-clock]')).toBeNull();
    // The link is left alone until the parent changes something.
    expect(window.location.search).toBe('?los=0740&u=Uhr');
  });

  it('follows the address bar back and forward, style included', () => {
    renderMorning('?los=0740');
    pick('Als Uhr');
    expect(window.location.search).toBe('?los=0740&u=uhr');

    act(() => {
      window.history.replaceState(null, '', `${MORNING_PATH}?los=0740&u=beides`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('radio', { name: 'Beides' })).toBeChecked();
    expect(writtenTimes()).toEqual(['7:05 Uhr', '7:10 Uhr', '7:20 Uhr', '7:35 Uhr']);
    expect(faces()).toEqual(['7:05', '7:10', '7:20', '7:35']);

    act(() => {
      window.history.replaceState(null, '', `${MORNING_PATH}?los=0740`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('radio', { name: 'Als Zahl' })).toBeChecked();
    expect(sheet().querySelector('svg[data-clock]')).toBeNull();
    expect(window.location.search).toBe('?los=0740');
  });

  it('counts a style change as the one first change, without plan data', () => {
    renderMorning('?los=0740');
    pick('Als Uhr');
    pick('Beides');
    expect(plausibleCalls()).toEqual([['Vorlage angepasst', { props: { vorlage: 'morgen' } }]]);
  });

  it('carries the style in the copied link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderMorning('?los=0740&u=uhr');
    fireEvent.click(screen.getByRole('button', { name: 'Link kopieren' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}${MORNING_PATH}?los=0740&u=uhr`);
    await screen.findByText('Kopiert');
    delete (navigator as { clipboard?: unknown }).clipboard;
  });
});

describe('Wake-up line on the morning builder', () => {
  it('names Aufstehen when it comes first and links the Schlafens-Rechner with that time', () => {
    renderMorning('?s=azdfp&los=0730');
    const line = document.querySelector('[data-wake-line]')!;
    expect(line.textContent).toBe(
      'Auf dem Blatt: Aufstehen um 6:50 Uhr. Welche Schlafenszeit passt dazu? Der Schlafens-Rechner rechnet es aus.',
    );
    expect(screen.getByRole('link', { name: 'Der Schlafens-Rechner rechnet es aus' })).toHaveAttribute(
      'href',
      '/tools/schlafens-rechner?auf=0650',
    );
    expect(line.closest('.print\\:hidden')).not.toBeNull();
  });

  it('names the first step otherwise and follows the leave time', () => {
    renderMorning('?los=0740');
    expect(screen.getByText('Der erste Schritt beginnt um 7:05 Uhr.')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Wann müsst ihr los?' }), { target: { value: '07:00' } });
    // 7:00 minus 33 minutes: 6:27, printed 6:25.
    expect(screen.getByText('Der erste Schritt beginnt um 6:25 Uhr.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Der Schlafens-Rechner rechnet es aus' })).toHaveAttribute(
      'href',
      '/tools/schlafens-rechner?auf=0625',
    );
  });

  it('is not there while times are off', () => {
    renderMorning('?s=az');
    expect(document.querySelector('[data-wake-line]')).toBeNull();
    expect(screen.queryByRole('link', { name: /Schlafens-Rechner/ })).toBeNull();
  });
});

describe('Clock change note', () => {
  it('shows on 25 October and links the article', () => {
    render(
      <MemoryRouter>
        <ClockChangeNote today={new Date(2026, 9, 25, 7, 0)} />
      </MemoryRouter>,
    );
    expect(document.querySelector('[data-clock-change]')!.textContent).toBe(NOTE);
    expect(screen.getByRole('link', { name: 'Artikel zur Zeitumstellung' })).toHaveAttribute(
      'href',
      '/ratgeber/zeitumstellung-kinder',
    );
  });

  it('is gone on 26 October', () => {
    const { container } = render(
      <MemoryRouter>
        <ClockChangeNote today={new Date(2026, 9, 26, 0, 0)} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('sits in the morning builder with times on or off, up to the day itself', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 25, 21, 0));
    const { unmount } = renderMorning();
    const note = document.querySelector('[data-clock-change]')!;
    expect(note.textContent).toBe(NOTE);
    expect(note.closest('#eure-schritte')).not.toBeNull();
    fireEvent.click(screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' }));
    expect(document.querySelector('[data-clock-change]')).not.toBeNull();
    unmount();

    vi.setSystemTime(new Date(2026, 9, 26, 6, 0));
    renderMorning('?los=0740');
    expect(document.querySelector('[data-clock-change]')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Artikel zur Zeitumstellung' })).toBeNull();
  });
});

describe('Print event', () => {
  it.each([
    ['', 'aus'],
    ['?los=0740', 'zahl'],
    ['?los=0740&u=uhr', 'uhr'],
    ['?los=0740&u=beides', 'beides'],
    ['?u=beides', 'aus'],
  ])('morning %s sends uhr=%s and nothing about the plan', (search, uhr) => {
    renderMorning(`?s=azx&e=Medizin${search ? `&${search.slice(1)}` : ''}`);
    fireEvent.click(builderPrintButton());
    expect(window.print).toHaveBeenCalledTimes(1);
    expect(plausibleCalls()).toEqual([
      ['Vorlage Drucken', { props: { vorlage: 'morgen', weg: 'baukasten', uhr } }],
    ]);
    expect(JSON.stringify(plausibleCalls())).not.toMatch(/Medizin|Aufstehen|s=|los|0740|u=/);
  });

  it('follows a style picked on the page', () => {
    renderMorning('?los=0740');
    pick('Als Uhr');
    fireEvent.click(builderPrintButton());
    expect(plausibleCalls()).toContainEqual([
      'Vorlage Drucken',
      { props: { vorlage: 'morgen', weg: 'baukasten', uhr: 'uhr' } },
    ]);
  });

  it.each([
    ['', 'aus'],
    ['?aus=1930', 'zahl'],
    ['?aus=1930&u=uhr', 'zahl'],
  ])('evening %s sends uhr=%s', (search, uhr) => {
    renderEvening(search);
    fireEvent.click(builderPrintButton());
    expect(plausibleCalls()).toEqual([['Vorlage Drucken', { props: { vorlage: 'abend', weg: 'baukasten', uhr } }]]);
  });
});

describe('Evening builder', () => {
  it('shows no clock controls, faces, wake-up line or clock change note', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 1, 18, 0));
    renderEvening('?aus=1930&u=beides');
    expect(screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' })).toBeChecked();
    expect(screen.queryByRole('group', { name: QUESTION })).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
    expect(sheet().querySelector('svg[data-clock], .rs-clock, [data-clock-label]')).toBeNull();
    expect(document.querySelector('[data-wake-line], [data-clock-change]')).toBeNull();
    expect(screen.queryByRole('link', { name: /Schlafens-Rechner|Zeitumstellung/ })).toBeNull();
  });
});
