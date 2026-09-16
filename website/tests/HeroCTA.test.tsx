import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HeroVariantF } from '../src/components/HeroVariantF';

vi.mock('../src/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from '../src/lib/analytics';

function renderHero() {
  return render(
    <MemoryRouter>
      <HeroVariantF />
    </MemoryRouter>,
  );
}

describe('Hero CTA pair', () => {
  beforeEach(() => vi.clearAllMocks());

  it('offers the card as the primary way in', () => {
    renderHero();
    const link = screen.getByRole('link', { name: /karte für euer kind erstellen/i });
    expect(link).toHaveAttribute('href', '/profil-erstellen');
  });

  it('offers the paper template as the secondary way in', () => {
    renderHero();
    const link = screen.getByRole('link', { name: /vorlage holen/i });
    expect(link).toHaveAttribute('href', '/vorlagen');
  });

  it('sends parents who already have a card straight to the app', () => {
    renderHero();
    const link = screen.getByRole('link', { name: /schon eine karte\? app öffnen/i });
    expect(link).toHaveAttribute('href', 'https://app.ronki.de/');
  });

  it('keeps the honest public-alpha eyebrow', () => {
    renderHero();
    expect(screen.getByText(/public alpha · jetzt spielbar/i)).toBeInTheDocument();
  });

  it('explains the card in one honest line', () => {
    renderHero();
    expect(
      screen.getByText(/das kind scannt sie in der app\. kostenlos, frühe version\./i),
    ).toBeInTheDocument();
  });

  it('keeps the trust badges and the storyboard link', () => {
    renderHero();
    expect(screen.getByText('Keine Werbung')).toBeInTheDocument();
    expect(screen.getByText('Keine Streaks')).toBeInTheDocument();
    expect(screen.getByText('Keine In-App-Käufe')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /so sieht ein tag aus/i })).toHaveAttribute(
      'href',
      '#storyboard',
    );
  });

  it('tracks each CTA click with its own cta prop', async () => {
    const user = userEvent.setup();
    renderHero();

    await user.click(screen.getByRole('link', { name: /karte für euer kind erstellen/i }));
    expect(trackEvent).toHaveBeenCalledWith('CTA Klick', { cta: 'karte', source: 'hero' });

    await user.click(screen.getByRole('link', { name: /vorlage holen/i }));
    expect(trackEvent).toHaveBeenCalledWith('CTA Klick', { cta: 'vorlage', source: 'hero' });

    await user.click(screen.getByRole('link', { name: /schon eine karte\? app öffnen/i }));
    expect(trackEvent).toHaveBeenCalledWith('CTA Klick', { cta: 'app', source: 'hero' });

    expect(trackEvent).toHaveBeenCalledTimes(3);
  });
});
