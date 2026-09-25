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

  it('fades up during the guard and hands the press transition back once ready', () => {
    const { getByRole } = render(<CooldownButton delay={1} onClick={() => {}}>Weiter</CooldownButton>);
    const btn = getByRole('button');
    expect(btn.style.opacity).toBe('0.55');
    act(() => { vi.advanceTimersByTime(20); }); // one frame: the fade starts
    expect(btn.style.opacity).toBe('1');
    expect(btn.disabled).toBe(true);
    expect(btn.style.transition).toContain('opacity');
    act(() => { vi.advanceTimersByTime(1000); });
    expect(btn.disabled).toBe(false);
    expect(btn.style.transition).toBe('');
  });

  it('under reduced motion stays dim until the tap really counts', () => {
    const original = window.matchMedia;
    window.matchMedia = (q) => ({
      matches: /prefers-reduced-motion/.test(q),
      media: q,
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
    });
    try {
      const { getByRole } = render(<CooldownButton delay={1} onClick={() => {}}>Weiter</CooldownButton>);
      const btn = getByRole('button');
      act(() => { vi.advanceTimersByTime(500); });
      expect(btn.disabled).toBe(true);
      expect(btn.style.opacity).toBe('0.55');
      act(() => { vi.advanceTimersByTime(600); });
      expect(btn.disabled).toBe(false);
      expect(btn.style.opacity).toBe('1');
    } finally {
      window.matchMedia = original;
    }
  });

  it('keeps the icon hidden while guarding and shows the doodle once ready', () => {
    const { container } = render(<CooldownButton delay={1} icon="redeem" onClick={() => {}}>Einsammeln</CooldownButton>);
    expect(container.querySelector('svg')).toBeNull();
    act(() => { vi.advanceTimersByTime(1100); });
    expect(container.querySelector('button svg')).not.toBeNull();
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
