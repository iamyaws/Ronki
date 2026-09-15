import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProfileOnSite, generateToken, tokenDisplayFragment } from '../src/lib/profileSetup';

// Sep 2026: the site no longer writes public.profiles directly. anon could
// list that table and walk away with every family's token, and the token is
// the login. The write goes through the profile_upsert RPC now. These tests
// pin that contract plus the funnel event the 30 day decision depends on.
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock('../src/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { supabase as supabaseMaybe } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';

// supabase is non-null in tests because we mocked it above
const supabase = supabaseMaybe!;

describe('createProfileOnSite', () => {
  beforeEach(() => {
    vi.mocked(supabase.rpc).mockReset();
    vi.mocked(trackEvent).mockReset();
  });

  it('writes the seed profile through profile_upsert', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: { updated_at: '2026-09-15T08:00:00Z' }, error: null } as never);

    const result = await createProfileOnSite({ childName: 'Louis' });

    expect(result.ok).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledTimes(1);

    const [fnName, args] = vi.mocked(supabase.rpc).mock.calls[0] as [string, Record<string, unknown>];
    expect(fnName).toBe('profile_upsert');
    expect(args.p_token).toMatch(/^[a-f0-9]{32}$/);

    const state = args.p_state as Record<string, unknown>;
    expect(state.parentOnboardingDone).toBe(true);
    expect(state.parentHandoffBackSeen).toBe(true);
    expect(state.familyConfig).toEqual({ childName: 'Louis', siblings: [] });
  });

  it('tracks "Karte erstellt" after a successful write', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: {}, error: null } as never);

    await createProfileOnSite({ childName: 'Louis' });

    expect(trackEvent).toHaveBeenCalledWith('Karte erstellt', { source: 'website' });
  });

  it('reports an error and tracks nothing when the RPC fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'boom' } } as never);

    const result = await createProfileOnSite({ childName: 'Louis' });

    expect(result).toEqual({ ok: false, reason: 'error' });
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('rejects an empty child name and a non four digit PIN before touching Supabase', async () => {
    expect(await createProfileOnSite({ childName: '   ' })).toEqual({ ok: false, reason: 'invalid' });
    expect(await createProfileOnSite({ childName: 'Louis', pin: '12' })).toEqual({ ok: false, reason: 'invalid' });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});

describe('token helpers', () => {
  it('generates 32 hex chars', () => {
    expect(generateToken()).toMatch(/^[a-f0-9]{32}$/);
  });

  it('formats the printed fragment and refuses a malformed token', () => {
    expect(tokenDisplayFragment('a3f7c2e1b9d5408f2761c8e4ab90f3d6')).toBe('a3f7-c2e1');
    expect(tokenDisplayFragment('nope')).toBe('');
  });
});
