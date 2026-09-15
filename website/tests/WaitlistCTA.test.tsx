import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaitlistCTA } from '../src/components/WaitlistCTA';

// No live client in tests. The form guards on `supabase` being null and
// skips the waitlist_count lookup, so nothing reaches the network.
vi.mock('../src/lib/supabase', () => ({
  supabase: null,
}));

vi.mock('../src/lib/waitlist', () => ({
  submitWaitlistEmail: vi.fn(),
  submitScreener: vi.fn(),
  isValidEmail: (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
}));

import { submitWaitlistEmail } from '../src/lib/waitlist';

describe('WaitlistCTA, waitlist state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders waitlist copy when state is waitlist', () => {
    render(<WaitlistCTA launchState="waitlist" />);
    expect(screen.getByRole('button', { name: /bin dabei/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  it('shows success message after valid submission', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /bin dabei/i }));

    expect(await screen.findByText(/du bist dabei/i)).toBeInTheDocument();
  });

  it('shows duplicate message when email already exists', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: false, reason: 'duplicate' });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /bin dabei/i }));

    expect(await screen.findByText(/stehst schon auf der liste/i)).toBeInTheDocument();
  });

  it('shows invalid-email inline error without calling API', async () => {
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'not-email');
    await user.click(screen.getByRole('button', { name: /bin dabei/i }));

    expect(await screen.findByText(/bitte gib eine gültige/i)).toBeInTheDocument();
    expect(submitWaitlistEmail).not.toHaveBeenCalled();
  });

  it('shows generic error on server failure', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: false, reason: 'error' });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /bin dabei/i }));

    expect(await screen.findByText(/hat leider nicht geklappt/i)).toBeInTheDocument();
  });
});

describe('WaitlistCTA, install states', () => {
  it('renders a link to install instead of a form when live', () => {
    render(
      <MemoryRouter>
        <WaitlistCTA launchState="live" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /karte für euer kind erstellen/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument();
  });

  it('offers the card first and the app second when the state is public-alpha', () => {
    render(
      <MemoryRouter>
        <WaitlistCTA launchState="public-alpha" />
      </MemoryRouter>,
    );
    const card = screen.getByRole('link', { name: /karte für euer kind erstellen/i });
    expect(card).toHaveAttribute('href', '/profil-erstellen');
    const app = screen.getByRole('link', { name: /app öffnen/i });
    expect(app).toHaveAttribute('href', 'https://app.ronki.de/');
  });
});
