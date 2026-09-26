// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TreasureShelf from './TreasureShelf';

describe('TreasureShelf', () => {
  it('renders nothing when empty', () => {
    const { container } = render(<TreasureShelf log={[]} />);
    expect(container.innerHTML).toBe('');
  });
  it('shows the last three found treasures, newest first, no counts', () => {
    const log = ['🍁', '🪶', '🪨', '🌰'].map((emoji, i) => ({ id: `m${i}`, emoji, name: `n${i}` }));
    const { getByTestId } = render(<TreasureShelf log={log} />);
    const shelf = getByTestId('treasure-shelf');
    expect(shelf.querySelectorAll('[role="listitem"]')).toHaveLength(3);
    expect(shelf.textContent).toBe('🌰🪨🪶');
  });
  it('keeps the child\'s favourite in front, with a heart', () => {
    const m = (tripId, emoji) => ({ id: `m-${tripId}`, ts: '2026-09-26T17:00:00.000Z', emoji, name: tripId, tripId });
    const log = [m('t01', 'a'), m('t02', 'b'), m('t03', 'c'), m('t04', 'd')];
    const { getAllByRole, getByTestId } = render(<TreasureShelf log={log} favorite="trip-t01" />);
    const items = getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toContain('🍁');
    expect(items[0].contains(getByTestId('shelf-heart'))).toBe(true);
  });
});
