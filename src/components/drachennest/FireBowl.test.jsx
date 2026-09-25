// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FireBowl from './FireBowl';

describe('FireBowl', () => {
  it('draws one flame per task and fills the lit ones', () => {
    const { container, getByTestId } = render(<FireBowl lit={2} total={5} />);
    expect(container.querySelectorAll('[data-flame]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-flame="lit"]')).toHaveLength(2);
    expect(getByTestId('fire-bowl').getAttribute('data-lit')).toBe('2');
  });

  it('never shows a number to the child', () => {
    const { getByTestId } = render(<FireBowl lit={3} total={4} />);
    expect(getByTestId('fire-bowl').textContent).not.toMatch(/\d/);
  });

  it('clamps and renders nothing without tasks', () => {
    const { container, rerender } = render(<FireBowl lit={9} total={3} />);
    expect(container.querySelectorAll('[data-flame="lit"]')).toHaveLength(3);
    rerender(<FireBowl lit={0} total={0} />);
    expect(container.querySelector('[data-testid="fire-bowl"]')).toBeNull();
  });
});
