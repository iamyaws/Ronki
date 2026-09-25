import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Bestaetigt from '../src/pages/Bestaetigt';
import sitemap from '../public/sitemap.xml?raw';

function setup() {
  return render(
    <MemoryRouter>
      <Bestaetigt />
    </MemoryRouter>,
  );
}

describe('Bestaetigt (double opt-in landing)', () => {
  it('thanks the parent in one H1 and points back to the templates', () => {
    setup();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent('Danke, du bist dabei.');
    expect(screen.getByRole('link', { name: 'Zu den Vorlagen' })).toHaveAttribute('href', '/vorlagen');
  });

  it('says how to unsubscribe, in plain words', () => {
    setup();
    expect(screen.getByText(/in jeder Mail mit einem Klick abmelden/)).toBeInTheDocument();
  });

  it('stays out of search: noindex and not in the sitemap', () => {
    setup();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(sitemap).not.toContain('/bestaetigt');
  });
});
