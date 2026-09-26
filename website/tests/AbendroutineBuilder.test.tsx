import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VorlageAbend from '../src/pages/VorlageAbend';
import prerenderSource from '../vite-plugin-prerender-meta.ts?raw';
import taskKindsSource from '../../src/data/taskKinds.ts?raw';
import {
  APP_EVENING_KINDS,
  EVENING,
  EVENING_STEPS,
  kitAddOwnStep,
  kitAddStep,
  kitCardLink,
  kitDecodePlan,
  kitDefaultPlan,
  kitEncodePlan,
  kitLeaveNote,
  kitSetLeave,
  kitSheetDescription,
  kitSheetSteps,
  setTimes,
} from '../src/lib/routine-builder';

const PAGE_PATH = '/vorlagen/abendroutine';

// File names of the drawn task pictures that ship with the site.
const TASK_ART = new Set(
  Object.keys(import.meta.glob('../public/art/bilderbuch/tasks/*.webp')).map((path) => path.split('/').pop()),
);

function renderPage(search = '') {
  window.history.replaceState(null, '', `${PAGE_PATH}${search}`);
  return render(
    <MemoryRouter initialEntries={[`${PAGE_PATH}${search}`]}>
      <VorlageAbend />
    </MemoryRouter>,
  );
}

function sheetRows() {
  return within(screen.getByRole('list', { name: 'Die Schritte' })).getAllByRole('listitem');
}

function sheetLabels() {
  return sheetRows().map((row) => row.querySelector('.rs-label')?.textContent ?? '');
}

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

describe('Evening kit', () => {
  it('keeps the four steps the page always had, with the same hints and line', () => {
    const steps = kitSheetSteps(EVENING, kitDefaultPlan(EVENING));
    expect(steps.map((s) => [s.label, s.hint, s.img])).toEqual([
      ['Zähne putzen', 'Auch die hinten im Mund.', 'toothbrush.webp'],
      ['Gesicht waschen', 'Mit Wasser, ganz sanft.', 'wash.webp'],
      ['Pyjama an', 'Die Sachen von heute in den Korb.', 'pajama.webp'],
      ['Licht aus', 'Eine Geschichte, dann schlafen.', 'light-off.webp'],
    ]);
    expect(kitSheetDescription(EVENING, kitDefaultPlan(EVENING))).toBe(
      'Vier Schritte bis ins Bett. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist.',
    );
    expect(kitEncodePlan(EVENING, kitDefaultPlan(EVENING))).toBe('');
  });

  it('has a picture that ships for every step, and unique codes', () => {
    for (const step of EVENING_STEPS) expect(TASK_ART.has(step.img)).toBe(true);
    expect(new Set(EVENING_STEPS.map((s) => s.code)).size).toBe(EVENING_STEPS.length);
    expect(EVENING_STEPS.some((s) => s.code === 'x')).toBe(false);
  });

  it('offers bath and shower before the pyjama, on paper only', () => {
    let plan = kitAddStep(EVENING, kitDefaultPlan(EVENING), 'e');
    expect(plan.steps).toEqual(['e', 'z', 'w', 'y', 'o']);
    plan = kitAddStep(EVENING, kitDefaultPlan(EVENING), 's');
    expect(plan.steps).toEqual(['s', 'z', 'w', 'y', 'o']);
    const bath = EVENING_STEPS.find((step) => step.code === 'e')!;
    const shower = EVENING_STEPS.find((step) => step.code === 's')!;
    expect([bath.label, bath.img, bath.app]).toEqual(['Baden', 'bath.webp', undefined]);
    expect([shower.label, shower.img, shower.app]).toEqual(['Duschen', 'shower.webp', undefined]);
    // The card never carries them.
    expect(kitCardLink(EVENING, kitDecodePlan(EVENING, 's=ezyo'))).toBe('/profil-erstellen?abend=teeth_pm,pyjama');
  });

  it('shows the evening version of laying out clothes and taking off glasses', () => {
    const img = (code: string) => EVENING_STEPS.find((step) => step.code === code)!.img;
    expect(img('g')).toBe('clothes-chair.webp');
    expect(img('b')).toBe('glasses-case.webp');
  });

  it('knows exactly the evening tasks the app offers', () => {
    const match = /evening:\s*\[([^\]]*)\]/.exec(taskKindsSource.split('ROUTINE_CHOICES')[1] ?? '');
    const appList = match ? match[1].split(',').map((k) => k.trim().replace(/'/g, '')).filter(Boolean) : [];
    expect([...APP_EVENING_KINDS]).toEqual(appList);
    for (const kind of APP_EVENING_KINDS) expect(EVENING_STEPS.some((s) => s.app === kind)).toBe(true);
  });

  it('counts back from lights out and says so in the done band', () => {
    const plan = kitSetLeave(EVENING, setTimes(kitDefaultPlan(EVENING), true), '19:30');
    // "Licht aus" is the moment itself: 19:30 on its row, the rest counts back
    // from it (exact starts 19:21, 19:24, 19:27, printed rounded where they change).
    expect(kitSheetSteps(EVENING, plan).map((s) => s.time)).toEqual(['19:20', undefined, '19:25', '19:30']);
    // Without "Licht aus" last, the last step simply ends at the time
    // (exact starts 19:11, 19:14, 19:17, 19:20).
    const noEnd = kitSetLeave(EVENING, setTimes(kitDecodePlan(EVENING, 's=zwyl'), true), '19:30');
    expect(kitSheetSteps(EVENING, noEnd).map((s) => s.time)).toEqual(['19:10', undefined, '19:15', '19:20']);
    expect(kitLeaveNote(EVENING, plan)).toBe('Für heute fertig. Licht aus um 19:30 Uhr.');
    expect(kitEncodePlan(EVENING, plan)).toBe('aus=1930');
  });

  it('places new steps in a usual evening order and the own step before lights out', () => {
    let plan = kitAddStep(EVENING, kitDefaultPlan(EVENING), 'a');
    expect(plan.steps).toEqual(['a', 'z', 'w', 'y', 'o']);
    plan = kitAddStep(EVENING, plan, 'l');
    expect(plan.steps).toEqual(['a', 'z', 'w', 'y', 'l', 'o']);
    const own = kitAddOwnStep(EVENING, kitDefaultPlan(EVENING), 'Medizin');
    expect(own.steps).toEqual(['z', 'w', 'y', 'x', 'o']);
  });

  it('does not promise the story twice when Vorlesen is its own step', () => {
    const withStory = kitSheetSteps(EVENING, kitDecodePlan(EVENING, 's=zlo'));
    expect(withStory.map((s) => s.hint)).toEqual([
      'Auch die hinten im Mund.',
      'Eine Geschichte zusammen.',
      'Augen zu, gute Nacht.',
    ]);
  });

  it('reads a link back and drops what it does not know', () => {
    const plan = kitDecodePlan(EVENING, '?s=azzq9lo&e=Kuscheltier&aus=2000&m=1.1.1');
    expect(plan.steps).toEqual(['a', 'z', 'l', 'o']);
    expect(plan.own).toBe('');
    expect(plan.times).toBe(true);
    expect(plan.leave).toBe('20:00');
    // Wrong number of minutes: the defaults.
    expect(plan.minutes).toEqual([20, 3, 10, 1]);
    // A morning time key does nothing here.
    expect(kitDecodePlan(EVENING, 'los=0740').times).toBe(false);
    expect(kitDecodePlan(EVENING, 'aus=2130').times).toBe(false);
  });

  it('links the app steps to the card page in the family order, never the own step', () => {
    const plan = kitDecodePlan(EVENING, 's=lyxzo&e=Medizin');
    expect(kitCardLink(EVENING, plan)).toBe('/profil-erstellen?abend=cuddle,pyjama,teeth_pm');
    expect(kitCardLink(EVENING, kitDecodePlan(EVENING, 's=kuo'))).toBeNull();
  });
});

describe('Abendroutine page with the builder', () => {
  beforeEach(() => {
    window.plausible = vi.fn() as unknown as typeof window.plausible;
  });
  afterEach(() => {
    delete window.plausible;
    window.history.replaceState(null, '', '/');
  });

  it('shows the four evening steps untouched, one H1 and the builder', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(sheetLabels()).toEqual(['Zähne putzen', 'Gesicht waschen', 'Pyjama an', 'Licht aus']);
    expect(screen.getByRole('heading', { name: 'Eure Schritte' })).toBeInTheDocument();
    expect(screen.getByText('Such bis zu sechs Schritte aus, in der Reihenfolge von eurem Abend.')).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  it('adds a step, asks for lights out and prints the evening note', () => {
    renderPage();
    click('Schritt dazunehmen');
    click('Vorlesen dazunehmen');
    expect(sheetLabels()).toEqual(['Zähne putzen', 'Gesicht waschen', 'Pyjama an', 'Vorlesen', 'Licht aus']);
    expect(window.location.search).toBe('?s=zwylo');
    fireEvent.click(screen.getByRole('switch', { name: 'Uhrzeiten dazuschreiben' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Wann ist Licht aus?' }), { target: { value: '20:00' } });
    expect(window.location.search).toBe('?s=zwylo&aus=2000');
    expect(screen.getByText('Für heute fertig. Licht aus um 20:00 Uhr.')).toBeInTheDocument();
    // The last row says the same time as the band, and has no minutes of its own.
    const rows = within(screen.getByRole('list', { name: 'Die Schritte' })).getAllByRole('listitem');
    expect(rows[rows.length - 1].querySelector('[data-time]')).toHaveTextContent('20:00 Uhr');
    expect(screen.queryByRole('button', { name: 'Licht aus: eine Minute mehr' })).toBeNull();
    expect(screen.getByText('um 20:00 Uhr')).toBeInTheDocument();
  });

  it('offers the card with the evening steps and counts it as the evening', () => {
    renderPage('?s=lyzo');
    const link = screen.getByRole('link', { name: /Kostenlose Ronki-Karte erstellen/ });
    expect(link).toHaveAttribute('href', '/profil-erstellen?abend=cuddle,pyjama,teeth_pm');
    expect(screen.getByText(/Dann fragt Ronki in eurer Reihenfolge nach: Vorlesen, Pyjama, Zähne putzen\./)).toBeInTheDocument();
    fireEvent.click(link);
    const calls = (window.plausible as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toContainEqual(['Karte aus Vorlage', { props: { vorlage: 'abend' } }]);
  });

  it('uses the same title and description for the browser and the crawler HTML', () => {
    renderPage();
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    expect(description).not.toMatch(/Abhaken/);
    expect(prerenderSource).toContain(description);
  });
});
