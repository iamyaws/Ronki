import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { VorlageDownload } from '../src/components/VorlageDownload';

vi.mock('../src/lib/leads', () => ({
  submitLead: vi.fn(),
}));

import { submitLead } from '../src/lib/leads';

function setup() {
  return render(
    <MemoryRouter>
      <VorlageDownload
        source="vorlage-morgen"
        title="Die Morgenroutine"
        pdfHref="/vorlagen/morgenroutine.pdf"
        printHref="/print/vorlage-morgen"
      />
    </MemoryRouter>,
  );
}

const submitButton = () => screen.getByRole('button', { name: /pdf öffnen/i });
// Exact string: the consent label also mentions "E-Mail-Adresse".
const emailField = () => screen.getByLabelText('E-Mail');
const consentBox = () => screen.getByRole('checkbox');

describe('VorlageDownload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps the submit button disabled until consent and a valid email are there', async () => {
    const user = userEvent.setup();
    setup();

    expect(submitButton()).toBeDisabled();

    await user.type(emailField(), 'marc@example.com');
    expect(submitButton()).toBeDisabled();

    await user.click(consentBox());
    expect(submitButton()).toBeEnabled();
  });

  it('stays disabled when the consent box is ticked but the email is broken', async () => {
    const user = userEvent.setup();
    setup();

    await user.click(consentBox());
    await user.type(emailField(), 'not-email');

    expect(submitButton()).toBeDisabled();
    expect(submitLead).not.toHaveBeenCalled();
  });

  it('shows the PDF link after a successful submission', async () => {
    (submitLead as any).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    setup();

    await user.type(emailField(), 'marc@example.com');
    await user.click(consentBox());
    await user.click(submitButton());

    const link = await screen.findByRole('link', { name: /als pdf öffnen/i });
    expect(link).toHaveAttribute('href', '/vorlagen/morgenroutine.pdf');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(/das pdf öffnet sich direkt/i)).toBeInTheDocument();
  });

  it('sends the consent text along with the lead', async () => {
    (submitLead as any).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    setup();

    await user.type(emailField(), 'marc@example.com');
    await user.click(consentBox());
    await user.click(submitButton());

    await screen.findByRole('link', { name: /als pdf öffnen/i });
    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'marc@example.com',
        source: 'vorlage-morgen',
        consent: true,
        consentText: expect.stringContaining('Datenschutzerklärung'),
      }),
    );
  });

  it('greets a known parent without making it feel like an error', async () => {
    (submitLead as any).mockResolvedValue({ ok: true, alreadyKnown: true });
    const user = userEvent.setup();
    setup();

    await user.type(emailField(), 'marc@example.com');
    await user.click(consentBox());
    await user.click(submitButton());

    expect(await screen.findByText(/dich kennen wir schon/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /als pdf öffnen/i })).toBeInTheDocument();
  });

  it('shows the friendly server message on failure', async () => {
    (submitLead as any).mockResolvedValue({ ok: false, reason: 'error' });
    const user = userEvent.setup();
    setup();

    await user.type(emailField(), 'marc@example.com');
    await user.click(consentBox());
    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /verbindung zum server fehlt/i,
    );
  });

  it('always offers the no-email route', () => {
    setup();
    const printLink = screen.getByRole('link', { name: /diese seite ist selbst schon druckbar/i });
    expect(printLink).toHaveAttribute('href', '/print/vorlage-morgen');
    expect(screen.getByText(/strg\+p genügt/i)).toBeInTheDocument();
  });
});
