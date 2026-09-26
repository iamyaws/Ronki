import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NachmittagsplanSheet } from '../src/components/nachmittagsplan/NachmittagsplanSheet';
import Nachmittagsplan from '../src/pages/tools/Nachmittagsplan';
import ToolsHub from '../src/pages/tools/ToolsHub';
import { AppRoutes } from '../src/routes';
import {
  SHARE_TEXT,
  WEEKDAYS,
  defaultPlan,
  setAppointmentFrom,
  setAppointmentKind,
  setAppointmentOwn,
  setAppointmentTo,
  setArrive,
  setDinner,
  setEnd,
  setHomeworkAt,
  setHomeworkMinutes,
  setHomeworkWhere,
  setKnack,
  type AfternoonPlan,
} from '../src/lib/nachmittagsplan';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';
import sitemap from '../public/sitemap.xml?raw';

const PAGE_PATH = '/tools/nachmittagsplan';
const H1 = 'Nachmittagsplan: erst ankommen, dann Hausaufgaben';
const TOOL_TITLE = 'Nachmittagsplan für Grundschulkinder: erst ankommen, dann Hausaufgaben · Ronki';
const ARTICLE_PATH = '/ratgeber/hausaufgaben-streit-erste-klasse';
const EM_DASH = String.fromCharCode(0x2014);

function column(root: ParentNode, day: string) {
  const found = root.querySelector<HTMLElement>(`[data-week] [data-day="${day}"]`);
  if (!found) throw new Error(`no column for ${day}`);
  return found;
}

function blocks(root: ParentNode) {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-block]')).map((b) => b.dataset.block);
}

function pictures(root: ParentNode) {
  return Array.from(root.querySelectorAll('img')).map((img) => img.getAttribute('src'));
}

/** Monday with everything, Tuesday OGS and Schwimmen, Wednesday free, Thursday Oma, Friday none. */
function examplePlan(): AfternoonPlan {
  let plan = defaultPlan();
  plan = setEnd(plan, 'mo', '13:15');
  plan = setHomeworkAt(plan, 'mo', '14:00');
  plan = setHomeworkMinutes(plan, 'mo', 20);
  plan = setAppointmentKind(plan, 'mo', 'sport');
  plan = setAppointmentFrom(plan, 'mo', '16:00');
  plan = setAppointmentTo(plan, 'mo', '17:00');
  plan = setEnd(plan, 'di', '16:00');
  plan = setHomeworkWhere(plan, 'di', 'ogs');
  plan = setAppointmentKind(plan, 'di', 'schwimmen');
  plan = setAppointmentFrom(plan, 'di', '16:30');
  plan = setEnd(plan, 'do', '12:00');
  plan = setHomeworkWhere(plan, 'do', 'grandparents');
  plan = setEnd(plan, 'fr', '11:45');
  plan = setHomeworkWhere(plan, 'fr', 'none');
  plan = setAppointmentOwn(plan, 'fr', 'Ergotherapie');
  return setArrive(plan, 30);
}

describe('Nachmittagsplan sheet', () => {
  it('draws five columns, Montag to Freitag', () => {
    const { container } = render(<NachmittagsplanSheet plan={examplePlan()} />);
    const days = Array.from(container.querySelectorAll<HTMLElement>('[data-week] [data-day]'));
    expect(days.map((d) => d.dataset.day)).toEqual(['mo', 'di', 'mi', 'do', 'fr']);
    expect(days.map((d) => d.querySelector('h3')?.textContent)).toEqual([
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
    ]);
  });

  it('shows the right blocks per day in the order of the afternoon', () => {
    const { container } = render(<NachmittagsplanSheet plan={examplePlan()} />);
    const mo = column(container, 'mo');
    expect(blocks(mo)).toEqual(['end', 'arrive', 'homework', 'appointment']);
    expect(mo.textContent).toContain('Schule aus');
    expect(mo.textContent).toContain('13:15 Uhr');
    expect(mo.textContent).toContain('30 Min.');
    expect(mo.textContent).toContain('14:00 Uhr');
    expect(mo.textContent).toContain('20 Min.');
    expect(mo.textContent).toContain('Sport');
    expect(mo.textContent).toContain('16:00 bis 17:00');
    expect(pictures(mo)).toEqual([
      '/art/bilderbuch/tasks/school.webp',
      '/art/bilderbuch/tasks/plate.webp',
      '/art/bilderbuch/tasks/water.webp',
      '/art/bilderbuch/tasks/move.webp',
      '/art/bilderbuch/tasks/homework.webp',
      '/art/bilderbuch/tasks/sneakers.webp',
    ]);

    const di = column(container, 'di');
    // OGS homework happens before pickup, so it comes first (Astra NP-04).
    expect(blocks(di)[0]).toBe('homework');
    expect(di.textContent).toContain('in der OGS');
    expect(di.textContent).not.toContain('erledigt');
    expect(di.textContent).toContain('ab 16:30');
    expect(pictures(di)).toContain('/art/bilderbuch/tasks/swim-bag.webp');

    expect(column(container, 'do').textContent).toContain('bei Oma, Opa');

    const fr = column(container, 'fr');
    expect(fr.textContent).toContain('heute keine');
    expect(fr.textContent).toContain('Ergotherapie');
    // An own word the tool has no picture for: a box to draw in.
    expect(fr.querySelectorAll('[data-draw]')).toHaveLength(1);
    // "heute keine" gets no homework picture.
    expect(pictures(fr)).not.toContain('/art/bilderbuch/tasks/homework.webp');
  });

  it('prints an empty day as "frei"', () => {
    const { container } = render(<NachmittagsplanSheet plan={examplePlan()} />);
    const mi = column(container, 'mi');
    expect(mi).toHaveAttribute('data-free');
    expect(mi.textContent).toBe('Mittwochfrei');
    expect(blocks(mi)).toEqual([]);
  });

  it('shows Ankommen without a time while the parent has not chosen one', () => {
    const plan = setEnd(defaultPlan(), 'mo', '13:15');
    const { container } = render(<NachmittagsplanSheet plan={plan} />);
    const arrive = column(container, 'mo').querySelector('[data-block="arrive"]')!;
    expect(arrive.textContent).toBe('Ankommen');
  });

  it('has no rings, boxes to tick or week sums anywhere; the Ankommen card offers choices', () => {
    const { container } = render(<NachmittagsplanSheet plan={examplePlan()} />);
    const week = container.querySelector('[data-week]')!;
    expect(week.querySelectorAll('.rs-ring, input, [role="checkbox"]')).toHaveLength(0);
    expect(week.textContent).not.toMatch(/Summe|gesamt|Woche:/i);
    const card = container.querySelector('[data-card="ankommen"]')!;
    // Choices, not a list to work through (Astra NP-05): no rings, resting included.
    expect(card.querySelectorAll('.rs-ring')).toHaveLength(0);
    for (const label of ['Essen', 'Trinken', 'Bewegen', 'Ausruhen']) expect(card.textContent).toContain(label);
    expect(pictures(card)).toEqual([
      '/art/bilderbuch/tasks/plate.webp',
      '/art/bilderbuch/tasks/water.webp',
      '/art/bilderbuch/tasks/move.webp',
      '/art/bilderbuch/tasks/cushion.webp',
      '/art/bilderbuch/ronki/512/calm.webp',
    ]);
    expect(card.textContent).toContain('Erst ankommen');
    expect(card.textContent).toContain('Was brauchst du gerade?');
  });

  it('puts an appointment the child goes to straight from school before Ankommen', () => {
    let plan = setEnd(defaultPlan(), 'mo', '13:00');
    plan = setAppointmentKind(plan, 'mo', 'sport');
    plan = setAppointmentFrom(plan, 'mo', '13:15');
    plan = setAppointmentTo(plan, 'mo', '14:00');
    plan = setArrive(plan, 60);
    const { container } = render(<NachmittagsplanSheet plan={plan} />);
    expect(blocks(column(container, 'mo'))).toEqual(['end', 'appointment', 'arrive']);
  });

  it('names the homework moment with a picture on its card', () => {
    const { container } = render(<NachmittagsplanSheet plan={setKnack(examplePlan(), 'reading')} />);
    const card = container.querySelector('[data-card="knackpunkt"]')!;
    expect(pictures(card)[0]).toBe('/art/bilderbuch/tasks/book.webp');
    expect(card.textContent).toContain('Du liest, ich höre zu.');
  });

  it('carries the head, the note for the parent and the footer, but no name line', () => {
    const { container } = render(<NachmittagsplanSheet plan={examplePlan()} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Nachmittagsplan' })).toBeInTheDocument();
    expect(pictures(container.querySelector('.rs-head')!)).toContain('/art/bilderbuch/ronki/512/calm.webp');
    expect(container.querySelector('[data-for-you]')?.textContent).toContain(
      'Du musst jetzt nichts erklären. Du musst das nicht gewinnen.',
    );
    expect(container.textContent).toContain('ronki.de/tools/nachmittagsplan');
    expect(container.textContent).not.toContain('Das ist der Plan von');
    expect(container.textContent).not.toContain(EM_DASH);
  });

  it('shows the Knackpunkt card only with a choice, and the Ankommen card alone without one', () => {
    const { container, rerender } = render(<NachmittagsplanSheet plan={examplePlan()} />);
    expect(container.querySelector('[data-card="knackpunkt"]')).toBeNull();
    expect(container.querySelector('[data-cards]')).toHaveAttribute('data-cards', 'one');

    rerender(<NachmittagsplanSheet plan={setKnack(examplePlan(), 'mistakes')} />);
    const knack = container.querySelector('[data-card="knackpunkt"]')!;
    expect(knack.querySelector('[data-knack]')?.textContent).toBe(
      'Fehler dürfen sein. Wir schauen danach zusammen.',
    );
    expect(container.querySelector('[data-cards]')).toHaveAttribute('data-cards', 'two');

    rerender(<NachmittagsplanSheet plan={setKnack(examplePlan(), 'reading')} />);
    expect(container.querySelector('[data-knack]')?.textContent).toBe('Du liest, ich höre zu.');
  });

  it('writes dinner once for the week when set', () => {
    const { container, rerender } = render(<NachmittagsplanSheet plan={examplePlan()} />);
    expect(container.querySelector('[data-dinner]')).toBeNull();
    rerender(<NachmittagsplanSheet plan={setDinner(examplePlan(), '18:30')} />);
    expect(container.querySelectorAll('[data-dinner]')).toHaveLength(1);
    expect(container.querySelector('[data-dinner]')?.textContent).toBe('Abendessen um 18:30 Uhr');
  });

  it('prints the Wochenplan as the strip alone: no cards, no note for the parent', () => {
    const plan = setDinner(setKnack(examplePlan(), 'start'), '18:30');
    const { container } = render(<NachmittagsplanSheet plan={plan} variant="wochenplan" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Nachmittagsplan' })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-week] [data-day]')).toHaveLength(5);
    expect(container.querySelector('[data-card]')).toBeNull();
    expect(container.querySelector('[data-cards]')).toBeNull();
    expect(container.querySelector('[data-for-you]')).toBeNull();
    expect(container.querySelector('.rs-ring')).toBeNull();
    expect(container.querySelector('[data-dinner]')).not.toBeNull();
  });

  it('marks days that do not fit, for the preview', () => {
    const { container } = render(<NachmittagsplanSheet plan={examplePlan()} unfit={['di']} />);
    expect(column(container, 'di')).toHaveAttribute('data-unfit');
    expect(column(container, 'di').textContent).toContain('passt noch nicht');
    expect(column(container, 'mo')).not.toHaveAttribute('data-unfit');
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
      <Nachmittagsplan />
    </MemoryRouter>,
  );
}

function preview() {
  return screen.getByTestId('np-preview');
}

function dayGroup(label: string) {
  return screen.getByRole('group', { name: label });
}

function printButtons() {
  return [
    screen.getByRole('button', { name: 'Drucken' }),
    screen.getByRole('button', { name: 'Nur den Wochenplan drucken (für Oma, Opa oder den Hort)' }),
  ];
}

// Monday: school until 13:15, 30 minutes to arrive, homework at 13:30. Does not fit.
const UNFIT = '?mo=1315.h1330&ak=30';

describe('Nachmittagsplan page', () => {
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
    const { container } = renderPage('?mo=tE&di=tE&mi=tE&do=tE&fr=tE');
    const fields = Array.from(container.querySelectorAll('input, textarea, select'));
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      const typed = field.tagName === 'TEXTAREA' || (field.tagName === 'INPUT' && ['text', 'search', ''].includes(field.getAttribute('type') ?? ''));
      const words = [
        field.getAttribute('name'),
        field.getAttribute('id'),
        field.getAttribute('autocomplete'),
        // Time pickers may say "Schule aus"; a field you type into may not ask for a name or a child.
        ...(typed
          ? [
              field.getAttribute('placeholder'),
              field.getAttribute('aria-label'),
              ...Array.from((field as HTMLInputElement).labels ?? []).map((l) => l.textContent),
            ]
          : []),
      ].join(' ');
      expect(words).not.toMatch(/name|kind|schule|klasse/i);
    }
    // The only fields you type into are the five own appointments.
    expect(container.querySelectorAll('input[type="text"], textarea')).toHaveLength(5);
    expect(container.textContent).toContain('Trag nur einen Termin ein, keine Namen: Der Text steht auch im Link.');
  });

  it('starts with nothing chosen: no arrive time, no Knackpunkt, no dinner', () => {
    renderPage();
    for (const minutes of [15, 30, 45, 60]) {
      expect(screen.getByRole('button', { name: `${minutes} Minuten` })).toHaveAttribute('aria-pressed', 'false');
    }
    for (const label of ['Anfangen', 'Fehler', 'Dauer', 'Lesen üben']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${label}`) })).toHaveAttribute('aria-pressed', 'false');
    }
    expect(screen.getByLabelText('Wann gibt es Abendessen?')).toHaveValue('');
    expect(window.location.search).toBe('');
  });

  it('keeps the plan in the address bar as the parent changes it', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Montag: Schule aus um'), { target: { value: '13:15' } });
    expect(window.location.pathname).toBe(PAGE_PATH);
    expect(window.location.search).toBe('?mo=1315');
    fireEvent.click(within(dayGroup('Hausaufgaben am Montag')).getByRole('button', { name: 'zu Hause' }));
    fireEvent.change(screen.getByLabelText('Montag: Hausaufgaben um'), { target: { value: '15:30' } });
    fireEvent.change(screen.getByLabelText('Montag: Hausaufgaben wie lange'), { target: { value: '20' } });
    fireEvent.click(within(dayGroup('Termin am Montag')).getByRole('button', { name: 'Sport' }));
    fireEvent.change(screen.getByLabelText('Montag: Termin von'), { target: { value: '16:00' } });
    fireEvent.change(screen.getByLabelText('Montag: Termin bis'), { target: { value: '17:00' } });
    fireEvent.click(screen.getByRole('button', { name: '30 Minuten' }));
    fireEvent.change(screen.getByLabelText('Wann gibt es Abendessen?'), { target: { value: '18:30' } });
    fireEvent.click(screen.getByRole('button', { name: /^Anfangen/ }));
    expect(window.location.search).toBe('?mo=1315.h1530m20.tS1600-1700&ak=30&ab=1830&k=s');
    const mo = column(preview(), 'mo');
    expect(mo.textContent).toContain('15:30 Uhr');
    expect(mo.textContent).toContain('16:00 bis 17:00');
    expect(within(preview()).getByText('Jetzt ist Hausaufgabenzeit.')).toBeInTheDocument();
  });

  it('copies one school end to all days', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: /für alle Tage übernehmen/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Dienstag: Schule aus um'), { target: { value: '12:15' } });
    fireEvent.click(screen.getByRole('button', { name: '12:15 Uhr für alle Tage übernehmen' }));
    for (const day of WEEKDAYS) {
      expect(screen.getByLabelText(`${day.label}: Schule aus um`)).toHaveValue('12:15');
    }
    expect(window.location.search).toBe('?mo=1215&di=1215&mi=1215&do=1215&fr=1215');
    expect(screen.queryByRole('button', { name: /für alle Tage übernehmen/ })).toBeNull();
  });

  it('offers only end times after the start of an appointment', () => {
    renderPage('?di=tW');
    const to = screen.getByLabelText('Dienstag: Termin bis');
    expect(to).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Dienstag: Termin von'), { target: { value: '19:30' } });
    const options = Array.from((to as HTMLSelectElement).options).map((o) => o.value);
    expect(options).toEqual(['', '19:35', '19:40', '19:45', '19:50', '19:55', '20:00']);
  });

  it('keeps spaces while typing an own appointment and puts the cleaned word on the sheet', () => {
    renderPage();
    fireEvent.click(within(dayGroup('Termin am Freitag')).getByRole('button', { name: 'Eigener Termin' }));
    const field = screen.getByRole('textbox', { name: 'Eigener Termin am Freitag' });
    expect(field).toHaveAttribute('maxLength', '24');
    fireEvent.change(field, { target: { value: 'Reiten ' } });
    expect(field).toHaveValue('Reiten ');
    expect(window.location.search).toBe('?fr=tE.Reiten');
    expect(column(preview(), 'fr').textContent).toContain('Reiten');
  });

  it('jumps with the skip link without a history entry, so Back never wipes the plan (Claude F2)', () => {
    renderPage(UNFIT);
    const before = window.history.length;
    fireEvent.click(screen.getByRole('link', { name: 'Zum Hauptinhalt springen' }));
    expect(window.history.length).toBe(before);
    expect(window.location.hash).toBe('');
    expect(window.location.search).toBe(UNFIT);
  });

  it('shares the family week with a line for the people who help, not a class-chat tip (Claude F1)', () => {
    renderPage();
    expect(document.body.textContent).toContain('Schick ihn nur an Menschen, die euren Nachmittag kennen dürfen');
  });

  it('shows a plan that does not fit next to the day and above the print buttons, and blocks printing', () => {
    const print = vi.fn();
    window.print = print;
    renderPage(UNFIT);
    const message =
      'Am Montag beginnen die Hausaufgaben um 13:30, aber ihr seid erst um 13:45 angekommen. Verschieb die Hausaufgaben.';
    const dayMessages = document.querySelector('[data-fit-day="mo"]')!;
    expect(dayMessages.textContent).toBe(message);
    const summary = document.querySelector('[data-fit-summary]')!;
    expect(summary.textContent).toContain('Das passt noch nicht zusammen:');
    expect(summary.textContent).toContain(message);
    expect(column(preview(), 'mo')).toHaveAttribute('data-unfit');

    for (const button of printButtons()) {
      expect(button).toBeDisabled();
      expect(button).toHaveAccessibleDescription(
        'Drucken geht, sobald alles zusammenpasst. Ändere dafür oben die Zeiten.',
      );
      fireEvent.click(button);
    }
    expect(print).not.toHaveBeenCalled();
    // Nothing was moved for the parent.
    expect(window.location.search).toBe(UNFIT);
    expect(screen.getByLabelText('Montag: Hausaufgaben um')).toHaveValue('13:30');
    // Even the browser's own print gets a note instead of the sheet.
    expect(document.querySelector('.np-print .np-sheet')).toBeNull();
    expect(document.querySelector('.np-print-unfit')).not.toBeNull();
  });

  it('enables printing once the parent changes the plan so it fits', () => {
    const print = vi.fn();
    window.print = print;
    renderPage(UNFIT);
    fireEvent.change(screen.getByLabelText('Montag: Hausaufgaben um'), { target: { value: '14:00' } });
    for (const button of printButtons()) expect(button).toBeEnabled();
    expect(document.querySelector('[data-fit-day="mo"]')).toBeNull();
    expect(document.querySelector('[data-fit-summary]')!.textContent).toBe('');
    expect(screen.queryByText('Drucken geht, sobald alles zusammenpasst. Ändere dafür oben die Zeiten.')).toBeNull();
    expect(document.querySelectorAll('.np-print .np-sheet')).toHaveLength(2);
  });

  it('also fits after taking less time to arrive', () => {
    renderPage(UNFIT);
    fireEvent.click(screen.getByRole('button', { name: '15 Minuten' }));
    for (const button of printButtons()) expect(button).toBeEnabled();
  });

  it('prints the full sheet or the Wochenplan alone and counts only which one', () => {
    const print = vi.fn();
    window.print = print;
    renderPage('?mo=1315.h1400.tE1600-1700.Reiten&ak=30&k=f');
    const portal = document.querySelector<HTMLElement>('.np-print')!;

    fireEvent.click(screen.getByRole('button', { name: 'Drucken' }));
    expect(portal.dataset.variant).toBe('blatt');
    fireEvent.click(printButtons()[1]);
    expect(portal.dataset.variant).toBe('wochenplan');
    expect(print).toHaveBeenCalledTimes(2);
    expect(plausibleCalls()).toEqual([
      ['Nachmittagsplan Drucken', { props: { weg: 'blatt' } }],
      ['Nachmittagsplan Drucken', { props: { weg: 'wochenplan' } }],
    ]);
    expect(JSON.stringify(plausibleCalls())).not.toMatch(/Reiten|1315|mo=/);
  });

  it('counts the first change once, without plan data', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Montag: Schule aus um'), { target: { value: '13:15' } });
    fireEvent.change(screen.getByLabelText('Dienstag: Schule aus um'), { target: { value: '13:15' } });
    expect(plausibleCalls()).toEqual([['Nachmittagsplan erstellt']]);
  });

  it('restores a plan from an opened link', () => {
    renderPage('?di=1600.o.tW1630-1730&fr=tE.Reiten&ak=45&ab=1830&k=l');
    expect(screen.getByLabelText('Dienstag: Schule aus um')).toHaveValue('16:00');
    expect(within(dayGroup('Hausaufgaben am Dienstag')).getByRole('button', { name: 'in der OGS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(dayGroup('Termin am Dienstag')).getByRole('button', { name: 'Schwimmen' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('Dienstag: Termin von')).toHaveValue('16:30');
    expect(screen.getByLabelText('Dienstag: Termin bis')).toHaveValue('17:30');
    expect(screen.getByRole('textbox', { name: 'Eigener Termin am Freitag' })).toHaveValue('Reiten');
    expect(screen.getByRole('button', { name: '45 Minuten' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Wann gibt es Abendessen?')).toHaveValue('18:30');
    expect(screen.getByRole('button', { name: /^Lesen üben/ })).toHaveAttribute('aria-pressed', 'true');
    expect(within(preview()).getByText('Du liest, ich höre zu.')).toBeInTheDocument();
  });

  it('follows the address bar when the parent goes back in the browser', () => {
    renderPage();
    window.history.pushState(null, '', `${PAGE_PATH}#main`);
    fireEvent.change(screen.getByLabelText('Dienstag: Schule aus um'), { target: { value: '12:00' } });
    fireEvent.click(within(dayGroup('Termin am Freitag')).getByRole('button', { name: 'Eigener Termin' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Eigener Termin am Freitag' }), {
      target: { value: 'Reiten' },
    });
    expect(window.location.search).toBe('?di=1200&fr=tE.Reiten');

    // Back: the address bar shows the plan from before; the page must follow.
    act(() => {
      window.history.replaceState(null, '', `${PAGE_PATH}?fr=tE.Malen`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByLabelText('Dienstag: Schule aus um')).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Eigener Termin am Freitag' })).toHaveValue('Malen');
    expect(column(preview(), 'di')).toHaveAttribute('data-free');
    expect(window.location.search).toBe('?fr=tE.Malen');
  });

  it('says honestly what the link carries', () => {
    const { container } = renderPage();
    expect(container.textContent).toContain(
      'Im Link stehen eure Zeiten, Termine und was ihr bei eigenen Terminen eintragt. Alle mit dem Link können das lesen.',
    );
  });

  it('copies the link and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderPage('?mo=1315');
    fireEvent.click(screen.getByRole('button', { name: 'Link kopieren' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}${PAGE_PATH}?mo=1315`);
    expect(await screen.findByText('Kopiert')).toBeInTheDocument();
    expect(plausibleCalls()).toEqual([['Nachmittagsplan Link', { props: { weg: 'kopiert' } }]]);
  });

  it('shares the link with the chat line where the phone can share, even while it does not fit', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    renderPage(UNFIT);
    fireEvent.click(screen.getByRole('button', { name: 'Teilen' }));
    expect(share).toHaveBeenCalledWith({
      title: 'Nachmittagsplan',
      text: SHARE_TEXT,
      url: `${window.location.origin}${PAGE_PATH}${UNFIT}`,
    });
    await vi.waitFor(() =>
      expect(plausibleCalls()).toEqual([['Nachmittagsplan Link', { props: { weg: 'geteilt' } }]]),
    );
  });

  it('links the article, the evening routine and the free Ronki card without plan data', () => {
    renderPage('?mo=1315&ak=30');
    const article = screen.getAllByRole('link', { name: 'Warum erst ankommen' });
    expect(article.length).toBeGreaterThan(0);
    for (const link of article) expect(link).toHaveAttribute('href', ARTICLE_PATH);
    expect(screen.getByRole('link', { name: 'die Abendroutine zum Ausdrucken' })).toHaveAttribute(
      'href',
      '/vorlagen/abendroutine',
    );
    expect(screen.getByRole('link', { name: 'Kostenlose Ronki-Karte erstellen' })).toHaveAttribute(
      'href',
      '/profil-erstellen',
    );
  });

  it('writes the page copy without em-dashes, streaks, points or rewards', () => {
    const { container } = renderPage();
    // The shared sheet footer says the opposite on purpose: "Streaks gibt es hier nicht."
    const text = (container.textContent ?? '').replace('Streaks gibt es hier nicht.', '');
    expect(text).not.toContain(EM_DASH);
    expect(text).not.toMatch(/Streak|Punkte|Belohnung|Sterne sammeln/);
  });

  it('uses the same title and description for the browser and the prerendered crawler HTML', () => {
    renderPage();
    expect(document.title).toBe(TOOL_TITLE);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThan(160);
    expect(description).not.toContain(EM_DASH);
    expect(prerenderSource).toContain(`path: '${PAGE_PATH}'`);
    expect(prerenderSource).toContain(`title: '${TOOL_TITLE}'`);
    expect(prerenderSource).toContain(description!);
    expect(prerenderSource).toContain(`ogImage: '/og-tool-nachmittagsplan.jpg'`);
  });
});

/* ------------------------------------------------------------------ */
/* Wiring                                                              */
/* ------------------------------------------------------------------ */

describe('Nachmittagsplan wiring', () => {
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

  it('has a card on the tools hub, and the hub counts and names the tools', () => {
    const { container } = render(
      <MemoryRouter>
        <ToolsHub />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === PAGE_PATH);
    expect(links).toHaveLength(1);
    const cards = container.querySelectorAll('ul > li a[href^="/tools/"]');
    expect(cards).toHaveLength(6);
    expect(container.textContent).toContain('Diese sechs sind der Anfang.');
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    expect(description).not.toContain('Aktuell: der App-Check');
    expect(description).toContain('Nachmittagsplan');
    expect(description.length).toBeLessThan(160);
  });
});
