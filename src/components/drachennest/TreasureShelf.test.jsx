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
});
