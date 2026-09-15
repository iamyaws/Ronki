import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

describe('App smoke test', () => {
  it('renders homepage at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /stell dir vor, du sagst es nur einmal/i,
    );
  });

  it('puts the card CTA on the homepage', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getAllByRole('link', { name: /karte für euer kind erstellen/i })[0],
    ).toHaveAttribute('href', '/profil-erstellen');
  });

  it('renders 404 for unknown route', async () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <App />
      </MemoryRouter>,
    );
    // The 404 page is lazy-loaded, so wait past the suspense spinner.
    expect(
      await screen.findByText(/verflogen\. aber nicht verloren\./i),
    ).toBeInTheDocument();
  });
});
