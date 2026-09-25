// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import CooldownButton, { GUARD_MAX_S } from './CooldownButton';

// Marc, 25 Sep 2026: a short guard (about 1 s) without numbers instead
// of the 3 to 5 s numbered countdown (Astra design review round 2, R5).
describe('CooldownButton (short guard, no numbers)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('shows no countdown digits and no ring while guarding', () => {
    const { container, getByRole } = render(
      <CooldownButton delay={5} onClick={() => {}}>Weiter</CooldownButton>,
    );
    expect(getByRole('button').disabled).toBe(true);
    expect(container.textContent).toBe('Weiter');
    expect(container.querySelector('circle')).toBeNull();
  });

  it('caps any requested delay at one second, then the tap counts', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <CooldownButton delay={5} onClick={onClick}>Weiter</CooldownButton>,
    );
    const btn = getByRole('button');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(GUARD_MAX_S * 1000 - 50); });
    expect(btn.disabled).toBe(true);
    act(() => { vi.advanceTimersByTime(60); });
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('maps the old icon names to doodles once ready, and shows none for unknown ones', () => {
    const { container, rerender } = render(
      <CooldownButton delay={0} icon="redeem" onClick={() => {}}>Einsammeln</CooldownButton>,
    );
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('.material-symbols-outlined')).toBeNull();
    rerender(<CooldownButton delay={0} icon="not_a_real_icon" onClick={() => {}}>Einsammeln</CooldownButton>);
    expect(container.querySelector('svg')).toBeNull();
  });
});
