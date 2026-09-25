// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';

// ParentalDashboard, Finch pass (26 Sep 2026): the "Ronkis Tag" section,
// the Ronki status in the Übersicht and the PIN fix (census 3.7).
let mockState;
const actions = {
  setRoutine: vi.fn(),
  setEveningStart: vi.fn(),
  setExtras: vi.fn(),
  patchState: vi.fn(),
  updateFamilyConfig: vi.fn(),
  restoreStamina: vi.fn(),
};
vi.mock('../context/TaskContext', () => ({
  useTask: () => ({ state: mockState, actions }),
}));
vi.mock('../hooks/useAnalytics', () => ({ useAnalytics: () => ({ track: vi.fn() }) }));
vi.mock('../utils/voiceAudio', () => ({
  default: { playLocalized: vi.fn(), playNarrator: vi.fn(), isMuted: () => true, setMuted: vi.fn(), stop: vi.fn() },
}));
const pickerProps = [];
// Lane A builds RoutinePicker in parallel with the agreed props
// { routine, eveningStart, onChange({ routine, eveningStart }), vacation }.
// The section takes the picker as a prop, so this stand-in drives it.
function FakePicker(props) {
  pickerProps.push(props);
  return (
    <div data-testid="routine-picker">
      <button
        type="button"
        onClick={() => props.onChange({ routine: { morning: ['wake', 'teeth_am'], evening: ['pyjama'] }, eveningStart: props.eveningStart })}
      >
        picker-routine
      </button>
      <button
        type="button"
        onClick={() => props.onChange({ routine: props.routine, eveningStart: '18:30' })}
      >
        picker-evening
      </button>
    </div>
  );
}

import ParentalDashboard, { pinMatches, ronkiWhereLabel, RonkisTagSection } from './ParentalDashboard';

const base = () => ({
  quests: [],
  hp: 0,
  moodAM: null,
  moodPM: null,
  catEvo: 3,
  companionName: 'Funki',
  adventureCount: 4,
  expeditionLog: [],
  expedition: { state: 'away' },
  vacMode: false,
  extrasEnabled: false,
  parentPin: '4711',
  parentPinIsDefault: false,
  familyConfig: { childName: 'Louis', eveningStart: '17:30' },
});

function openTab(utils, id) {
  fireEvent.click(utils.container.querySelector(`[data-tab-id="${id}"]`));
}

describe('ParentalDashboard: Finch pass', () => {
  beforeEach(() => {
    mockState = base();
    pickerProps.length = 0;
    Object.values(actions).forEach((f) => f.mockClear());
    Element.prototype.scrollIntoView = vi.fn();
    localStorage.clear();
  });
  afterEach(() => {
    delete Element.prototype.scrollIntoView;
  });

  it('Übersicht shows the adventures and where Ronki is', () => {
    const utils = render(<ParentalDashboard preauthorized onClose={() => {}} />);
    const card = utils.getByTestId('ronki-status');
    expect(card.textContent).toContain('Abenteuer: 4');
    expect(card.textContent).toContain('unterwegs');
  });

  it('labels every trip state for parents', () => {
    expect(ronkiWhereLabel({ state: 'home' })).toBe('zu Hause');
    expect(ronkiWhereLabel({ state: 'leaving' })).toBe('zu Hause');
    expect(ronkiWhereLabel(undefined)).toBe('zu Hause');
    expect(ronkiWhereLabel({ state: 'away' })).toBe('unterwegs');
    expect(ronkiWhereLabel({ state: 'waiting' })).toBe('zurück mit einem Schatz');
  });

  it('Familie opens with "Ronkis Tag"', () => {
    const utils = render(<ParentalDashboard preauthorized onClose={() => {}} />);
    openTab(utils, 'family');
    const section = utils.getByTestId('ronkis-tag');
    expect(within(section).getByText('Ronkis Tag')).toBeTruthy();
    // It sits above the child's profile card.
    const kind = utils.getByText('Kind');
    expect(section.compareDocumentPosition(kind) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('hands the routine, evening start and holiday flag to the picker', () => {
    render(<RonkisTagSection state={mockState} actions={actions} Picker={FakePicker} />);
    const last = pickerProps[pickerProps.length - 1];
    // No routine saved yet: the default routine (5 morning, 4 evening).
    expect(last.routine.morning).toHaveLength(5);
    expect(last.routine.evening).toHaveLength(4);
    expect(last.eveningStart).toBe('17:30');
    expect(last.vacation).toBe(false);
  });

  it('a routine change calls setRoutine, an evening change calls setEveningStart', () => {
    const utils = render(<RonkisTagSection state={mockState} actions={actions} Picker={FakePicker} />);
    fireEvent.click(utils.getByText('picker-routine'));
    expect(actions.setRoutine).toHaveBeenCalledWith({ morning: ['wake', 'teeth_am'], evening: ['pyjama'] });
    expect(actions.setEveningStart).not.toHaveBeenCalled();
    fireEvent.click(utils.getByText('picker-evening'));
    expect(actions.setEveningStart).toHaveBeenCalledWith('18:30');
    expect(actions.setRoutine).toHaveBeenCalledTimes(1);
  });

  it('the Ferien switch writes vacMode', () => {
    const utils = render(<ParentalDashboard preauthorized onClose={() => {}} />);
    openTab(utils, 'family');
    expect(utils.getByText('Ab morgen kommen die Ferien-Aufgaben.')).toBeTruthy();
    const sw = utils.getByTestId('switch-ferien');
    expect(sw.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(sw);
    expect(actions.patchState).toHaveBeenCalledWith({ vacMode: true });
  });

  it('the Extras switch calls setExtras', () => {
    mockState = { ...base(), extrasEnabled: true };
    const utils = render(<ParentalDashboard preauthorized onClose={() => {}} />);
    openTab(utils, 'family');
    expect(utils.getByText('Bringt Tagebuch, Laden und Spielzeug zurück.')).toBeTruthy();
    const sw = utils.getByTestId('switch-extras');
    expect(sw.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(sw);
    expect(actions.setExtras).toHaveBeenCalledWith(false);
  });

  it('pinMatches reads the save, like PinModal', () => {
    expect(pinMatches({ parentPin: '4711', parentPinIsDefault: false }, '4711')).toBe(true);
    expect(pinMatches({ parentPin: '4711', parentPinIsDefault: false }, '1234')).toBe(false);
    expect(pinMatches({ parentPin: null, parentPinIsDefault: true }, '1234')).toBe(true);
    expect(pinMatches({}, '1234')).toBe(true);
  });

  it('"PIN ändern" checks state.parentPin and writes the new PIN into the save, never localStorage', () => {
    localStorage.setItem('ronki_pin', '9999');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const utils = render(<ParentalDashboard preauthorized onClose={() => {}} />);
    openTab(utils, 'settings');
    fireEvent.click(utils.getByText('PIN jetzt ändern'));
    const pad = utils.getByText('Aktuellen PIN eingeben').parentElement;
    const press = (digits) => {
      for (const d of digits) fireEvent.click(within(pad).getByText(d));
    };
    // The old localStorage PIN no longer opens the change.
    press('9999');
    expect(utils.getByText('Falscher PIN')).toBeTruthy();
    // The PIN from the save does.
    press('4711');
    expect(utils.getByText('Neuen PIN wählen (4 Ziffern)')).toBeTruthy();
    press('2580');
    expect(utils.getByText('PIN wiederholen')).toBeTruthy();
    press('2580');
    expect(actions.patchState).toHaveBeenCalledWith({ parentPin: '2580', parentPinIsDefault: false });
    expect(setItem.mock.calls.some(([k]) => k === 'ronki_pin')).toBe(false);
    setItem.mockRestore();
  });

  it('the fallback gate inside the dashboard takes the PIN from the save', () => {
    const utils = render(<ParentalDashboard onClose={() => {}} />);
    expect(utils.getByText('Eltern-Bereich')).toBeTruthy();
    for (const d of '4711') fireEvent.click(utils.getByText(d));
    expect(utils.container.querySelector('[data-tab-id="overview"]')).toBeTruthy();
  });
});
