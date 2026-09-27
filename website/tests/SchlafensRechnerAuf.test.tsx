import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SchlafensRechner from '../src/pages/tools/SchlafensRechner';
import { wakeUpFromParam } from '../src/lib/schlafens-rechner/calculator';

describe('wakeUpFromParam', () => {
  it('takes four digits that make a clock time, nothing else', () => {
    expect(wakeUpFromParam('0650')).toBe('06:50');
    expect(wakeUpFromParam('0000')).toBe('00:00');
    expect(wakeUpFromParam('2359')).toBe('23:59');
    for (const bad of [null, undefined, '', '650', '06:50', '2400', '0760', 'abcd', '06500', ' 0650', '０６５０']) {
      expect(wakeUpFromParam(bad)).toBeNull();
    }
  });
});

describe('Schlafens-Rechner takes the wake-up time from the builder', () => {
  function renderRechner(search: string) {
    return render(
      <MemoryRouter initialEntries={[`/tools/schlafens-rechner${search}`]}>
        <SchlafensRechner />
      </MemoryRouter>,
    );
  }

  function wakeInput() {
    return document.querySelector('input[type="time"]') as HTMLInputElement;
  }

  it('fills in a valid time and leaves the address bar alone', () => {
    const replace = vi.spyOn(window.history, 'replaceState');
    const push = vi.spyOn(window.history, 'pushState');
    renderRechner('?auf=0650');
    expect(wakeInput()).toHaveValue('06:50');
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    replace.mockRestore();
    push.mockRestore();
  });

  // Every bad value is covered by wakeUpFromParam above; three on the page.
  it.each(['', '?auf=2460', '?auf=06:50'])(
    'keeps 6:30 for %s',
    (search) => {
      renderRechner(search);
      expect(wakeInput()).toHaveValue('06:30');
    },
  );

  it('still lets the parent change the time', () => {
    renderRechner('?auf=0705');
    expect(wakeInput()).toHaveValue('07:05');
    fireEvent.change(wakeInput(), { target: { value: '06:45' } });
    expect(wakeInput()).toHaveValue('06:45');
  });
});
