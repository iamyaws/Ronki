import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitLead } from '../src/lib/leads';

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../src/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { supabase as supabaseMaybe } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
// supabase is non-null in tests because we mocked it above
const supabase = supabaseMaybe!;

const CONSENT = 'Ich bin einverstanden, dass Ronki meine E-Mail-Adresse speichert.';

function lead(overrides: Record<string, unknown> = {}) {
  return {
    email: 'marc@example.com',
    source: 'vorlage-morgen' as const,
    consent: true,
    consentText: CONSENT,
    ...overrides,
  };
}

describe('submitLead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts a valid lead and tracks the download', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitLead(lead());

    expect(result).toEqual({ ok: true });
    expect(supabase.from).toHaveBeenCalledWith('leads');
    expect(insert).toHaveBeenCalledWith({
      email: 'marc@example.com',
      source: 'vorlage-morgen',
      consent: true,
      consent_text: CONSENT,
      locale: 'de',
    });
    expect(trackEvent).toHaveBeenCalledWith('Vorlage Download', {
      vorlage: 'vorlage-morgen',
    });
  });

  it('normalizes the email to lowercase and trims it', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert });

    await submitLead(lead({ email: '  Marc@Example.COM  ' }));

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'marc@example.com' }),
    );
  });

  it('rejects an invalid email without touching Supabase', async () => {
    const result = await submitLead(lead({ email: 'not-email' }));

    expect(result).toEqual({ ok: false, reason: 'invalid' });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('rejects a missing consent without touching Supabase', async () => {
    const result = await submitLead(lead({ consent: false }));

    expect(result).toEqual({ ok: false, reason: 'consent' });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('maps a duplicate to ok with alreadyKnown', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitLead(lead({ source: 'vorlage-abend' }));

    expect(result).toEqual({ ok: true, alreadyKnown: true });
    expect(trackEvent).toHaveBeenCalledWith('Vorlage Download', {
      vorlage: 'vorlage-abend',
    });
  });

  it('returns error on any other database failure', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '42501', message: 'permission denied' },
    });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitLead(lead());

    expect(result).toEqual({ ok: false, reason: 'error' });
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('passes an explicit locale through', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert });

    await submitLead(lead({ locale: 'en' }));

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ locale: 'en' }));
  });
});

describe('submitLead without a configured Supabase client', () => {
  it('returns error like the waitlist does', async () => {
    vi.resetModules();
    vi.doMock('../src/lib/supabase', () => ({ supabase: null }));
    vi.doMock('../src/lib/analytics', () => ({ trackEvent: vi.fn() }));

    const { submitLead: submitWithoutClient } = await import('../src/lib/leads');
    const result = await submitWithoutClient(lead());

    expect(result).toEqual({ ok: false, reason: 'error' });
    vi.doUnmock('../src/lib/supabase');
    vi.doUnmock('../src/lib/analytics');
    vi.resetModules();
  });
});
