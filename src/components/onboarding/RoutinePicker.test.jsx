// @vitest-environment jsdom
import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import RoutinePicker from './RoutinePicker';
import { DEFAULT_ROUTINE } from '../../data/taskKinds';

function tile(kind) {
  return document.querySelector(`[data-kind="${kind}"]`);
}
function pressed(kind) {
  return tile(kind)?.getAttribute('aria-pressed') === 'true';
}

/** A controlled wrapper, like the parent step and the dashboard use it. */
function Harness({ initial, onChange, vacation }) {
  const [v, setV] = useState(initial || {});
  return (
    <RoutinePicker
      routine={v.routine}
      eveningStart={v.eveningStart}
      vacation={vacation}
      onChange={(next) => { setV(next); onChange?.(next); }}
    />
  );
}

describe('RoutinePicker', () => {
  it('pre-ticks the default routine and 17:00 when nothing is set', () => {
    render(<RoutinePicker onChange={() => {}} />);
    for (const k of DEFAULT_ROUTINE.morning) expect(pressed(k)).toBe(true);
    for (const k of DEFAULT_ROUTINE.evening) expect(pressed(k)).toBe(true);
    expect(pressed('water')).toBe(false);
    expect(pressed('wash')).toBe(false);
    expect(pressed('dinner')).toBe(false);
    expect(screen.getByText('17:00').getAttribute('aria-pressed')).toBe('true');
    // task pictures from public/art/bilderbuch/tasks/
    expect(tile('breakfast').querySelector('img').getAttribute('src')).toContain('art/bilderbuch/tasks/plate.webp');
    expect(screen.getByText('Ronkis Morgen')).toBeTruthy();
    expect(screen.getByText('Ronkis Abend')).toBeTruthy();
  });

  it('toggles tiles on and off and keeps the display order', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(tile('water'));
    expect(onChange).toHaveBeenLastCalledWith({
      routine: { morning: ['wake', 'water', 'breakfast', 'teeth_am', 'dress', 'packcheck'], evening: DEFAULT_ROUTINE.evening },
      eveningStart: '17:00',
    });
    expect(pressed('water')).toBe(true);
    fireEvent.click(tile('dress'));
    expect(pressed('dress')).toBe(false);
    expect(onChange.mock.calls.at(-1)[0].routine.morning).toEqual(['wake', 'water', 'breakfast', 'teeth_am', 'packcheck']);
  });

  it('the last ticked tile of a block stays on', () => {
    const onChange = vi.fn();
    render(<Harness initial={{ routine: { morning: ['wake', 'dress'], evening: ['pyjama'] } }} onChange={onChange} />);
    fireEvent.click(tile('pyjama'));
    expect(onChange).not.toHaveBeenCalled();
    expect(pressed('pyjama')).toBe(true);
    expect(tile('pyjama').getAttribute('data-locked')).toBe('true');
    fireEvent.click(tile('wake'));
    expect(pressed('wake')).toBe(false);
    fireEvent.click(tile('dress'));
    expect(pressed('dress')).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('hides the school bag on holidays and never lets the visible block run empty', () => {
    const onChange = vi.fn();
    render(<Harness vacation initial={{ routine: { morning: ['wake', 'packcheck'], evening: ['pyjama'] } }} onChange={onChange} />);
    expect(tile('packcheck')).toBeNull();
    fireEvent.click(tile('wake'));
    expect(onChange).not.toHaveBeenCalled();
    expect(pressed('wake')).toBe(true);
  });

  it('evening start chips pick one value', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByText('18:30'));
    expect(onChange).toHaveBeenLastCalledWith({ routine: DEFAULT_ROUTINE, eveningStart: '18:30' });
    expect(screen.getByText('18:30').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('17:00').getAttribute('aria-pressed')).toBe('false');
    // tapping the chosen chip again changes nothing
    fireEvent.click(screen.getByText('18:30'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('falls back to 17:00 on an unknown evening start', () => {
    render(<RoutinePicker eveningStart="21:15" onChange={() => {}} />);
    expect(screen.getByText('17:00').getAttribute('aria-pressed')).toBe('true');
  });
});
