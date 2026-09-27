import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  handAngles,
  handsFor,
  numerals,
  parseClock,
  pointAt,
  tickMarks,
  HOUR_HAND,
  MINUTE_HAND,
} from '../src/lib/clock-face';
import { ClockFace, RoutineSheet, type SheetStep } from '../src/components/sheet';
import { VorlagePrint, VORLAGE_PRINT_ADHS, VORLAGE_PRINT_MORGEN } from '../src/pages/print/VorlagePrint';
import VorlageAdhs from '../src/pages/VorlageAdhs';
import VorlageKleineGeschwister from '../src/pages/VorlageKleineGeschwister';

describe('Clock face geometry', () => {
  it.each([
    ['12:00', 0, 0],
    ['3:00', 90, 0],
    ['6:30', 195, 180],
    ['7:05', 212.5, 30],
    ['9:45', 292.5, 270],
  ])('%s puts the hour hand at %s° and the minute hand at %s°', (label, hour, minute) => {
    const time = parseClock(label)!;
    expect(handAngles(time.h, time.m)).toEqual({ hour, minute });
    expect(handsFor(label)!.angles).toEqual({ hour, minute });
  });

  it('lets the hour hand drift with the minutes, like a kitchen clock', () => {
    expect(handAngles(7, 0).hour).toBe(210);
    // Half past seven: halfway between 7 and 8.
    expect(handAngles(7, 30).hour).toBe(225);
    expect(handAngles(7, 59).hour).toBeGreaterThan(handAngles(7, 45).hour);
    expect(handAngles(7, 59).hour).toBeLessThan(handAngles(8, 0).hour);
    // Morning and evening look the same on a face with twelve hours.
    expect(handAngles(19, 30)).toEqual(handAngles(7, 30));
  });

  it('points the hands where they belong in the drawing', () => {
    expect(pointAt(90, 30)).toEqual({ x: 80, y: 50 });
    expect(handsFor('12:00')!.minute).toEqual({ x: 50, y: 50 - MINUTE_HAND });
    expect(handsFor('12:00')!.hour).toEqual({ x: 50, y: 50 - HOUR_HAND });
    expect(handsFor('3:00')!.hour).toEqual({ x: 50 + HOUR_HAND, y: 50 });
    expect(handsFor('6:30')!.minute).toEqual({ x: 50, y: 50 + MINUTE_HAND });
    expect(handsFor('9:45')!.minute).toEqual({ x: 50 - MINUTE_HAND, y: 50 });
    // 7:05: the hour hand has left the 7 a little towards the 8.
    const seven = pointAt(210, HOUR_HAND);
    const hour = handsFor('7:05')!.hour;
    expect(hour.x).toBeLessThan(seven.x);
    expect(hour.y).toBeGreaterThan(50);
  });

  it('reads "7:05" and "07:05" the same and nothing else', () => {
    expect(parseClock('7:05')).toEqual({ h: 7, m: 5 });
    expect(parseClock('07:05')).toEqual({ h: 7, m: 5 });
    for (const bad of ['', '7.05', '705', '24:00', '7:60', '7:5', 'abc', '-1:00']) {
      expect(parseClock(bad)).toBeNull();
      expect(handsFor(bad)).toBeNull();
    }
  });

  it('has twelve ticks, the thick ones at 12, 3, 6 and 9, and those four numerals', () => {
    const ticks = tickMarks();
    expect(ticks).toHaveLength(12);
    expect(ticks.flatMap((tick, i) => (tick.major ? [i] : []))).toEqual([0, 3, 6, 9]);
    expect(numerals().map((n) => n.text)).toEqual(['12', '3', '6', '9']);
  });
});

describe('ClockFace', () => {
  it('draws a still face with two hands, hidden from screen readers', () => {
    const { container } = render(<ClockFace time="7:05" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('data-clock', '7:05');
    expect(svg.querySelectorAll('[data-hand]')).toHaveLength(2);
    expect(svg.querySelector('[data-hand="second"]')).toBeNull();
    expect(svg.querySelectorAll('line[data-major]')).toHaveLength(4);
    expect(Array.from(svg.querySelectorAll('text')).map((t) => t.textContent)).toEqual(['12', '3', '6', '9']);
    // Nothing moves.
    expect(svg.querySelector('animate, animateTransform, animateMotion')).toBeNull();
    expect(svg.outerHTML).not.toMatch(/animation|transition/);
    for (const hand of svg.querySelectorAll('[data-hand]')) {
      expect(hand).toHaveAttribute('stroke', '#0544B0');
      expect(hand).toHaveAttribute('stroke-linecap', 'round');
    }
    expect(svg.querySelector('circle')).toHaveAttribute('stroke', '#040812');
  });

  it('draws nothing for a time it cannot read', () => {
    const { container } = render(<ClockFace time="halb acht" />);
    expect(container.querySelector('svg')).toBeNull();
  });
});

function rows() {
  return within(screen.getByRole('list', { name: 'Die Schritte' })).getAllByRole('listitem');
}

describe('Sheet rows with a clock face', () => {
  const base: SheetStep[] = [
    { img: 'wake.webp', label: 'Aufstehen', hint: 'Licht an, Vorhang auf.' },
    { img: 'toothbrush.webp', label: 'Zähne putzen', hint: 'Oben, unten, außen, innen.' },
    { img: 'plate.webp', label: 'Frühstücken', hint: 'Am Tisch, in Ruhe.' },
  ];

  it('shows the face and the time in words together', () => {
    const steps = [{ ...base[0], time: '6:50', clock: '6:50' }, base[1], { ...base[2], time: '7:05', clock: '7:05' }];
    render(<RoutineSheet eyebrow="Morgen" title="Die Morgenroutine" steps={steps} />);
    const [first, second, third] = rows();
    expect(first.querySelector('svg[data-clock="6:50"]')).not.toBeNull();
    expect(first.querySelector('[data-time]')).toHaveTextContent('6:50 Uhr');
    expect(first.querySelector('[data-clock-label]')).toBeNull();
    // A row with no printed time keeps the column empty, so the pictures line up.
    expect(second.querySelector('svg')).toBeNull();
    expect(second.querySelector('.rs-clock--none')).not.toBeNull();
    expect(third.querySelector('svg[data-clock="7:05"]')).not.toBeNull();
  });

  it('keeps the time for screen readers when only the face shows it', () => {
    const steps = [{ ...base[0], clock: '6:50' }, base[1]];
    const { container } = render(<RoutineSheet eyebrow="Morgen" title="Die Morgenroutine" steps={steps} />);
    const [first] = rows();
    expect(first.querySelector('[data-time]')).toBeNull();
    const hidden = first.querySelector('[data-clock-label]')!;
    expect(hidden).toHaveTextContent('6:50 Uhr');
    expect(hidden).toHaveClass('rs-sr');
    expect(first).toHaveTextContent('Aufstehen');
    // Still a timed sheet: rows pack as tightly as with the time in words.
    expect(container.querySelector('.rs-page')).toHaveClass('rs-page--timed');
  });

  it('draws no face and no empty column when no step has a clock', () => {
    const steps = [{ ...base[0], time: '6:50' }, base[1]];
    const { container } = render(<RoutineSheet eyebrow="Morgen" title="Die Morgenroutine" steps={steps} />);
    expect(container.querySelector('.rs-clock')).toBeNull();
    expect(container.querySelector('[data-clock-label]')).toBeNull();
    expect(container.querySelector('.rs-page')).not.toHaveClass('rs-page--clocks');
  });

  it('never puts a clock on the fixed template sheets', () => {
    for (const template of [VORLAGE_PRINT_MORGEN, VORLAGE_PRINT_ADHS]) {
      const { container, unmount } = render(
        <MemoryRouter>
          <VorlagePrint template={template} />
        </MemoryRouter>,
      );
      expect(container.querySelector('.rs-clock, svg[data-clock], [data-clock-label]')).toBeNull();
      unmount();
    }
    for (const Page of [VorlageAdhs, VorlageKleineGeschwister]) {
      const { container, unmount } = render(
        <MemoryRouter>
          <Page />
        </MemoryRouter>,
      );
      expect(container.querySelector('.rs-clock, svg[data-clock], [data-clock-label]')).toBeNull();
      unmount();
    }
  });
});
