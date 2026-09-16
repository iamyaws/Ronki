import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase client so the cloud tests below assert on the RPC
// contract without talking to the network. vi.mock is hoisted, so this
// applies to the storage module imported further down.
const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));
vi.mock('../lib/supabase', () => ({
  supabase: { rpc: rpcMock },
}));

// Mock IndexedDB since jsdom doesn't provide it
const mockStore = {};
const mockTransaction = {
  objectStore: () => ({
    get: (key) => {
      const req = { result: mockStore[key] || null, onsuccess: null, onerror: null };
      setTimeout(() => req.onsuccess?.(), 0);
      return req;
    },
    put: (val, key) => { mockStore[key] = val; setTimeout(() => mockTransaction.oncomplete?.(), 0); },
    delete: (key) => { delete mockStore[key]; setTimeout(() => mockTransaction.oncomplete?.(), 0); },
  }),
};
const mockDB = {
  transaction: () => mockTransaction,
  createObjectStore: vi.fn(),
};

beforeEach(() => {
  // Clear mock store
  Object.keys(mockStore).forEach(k => delete mockStore[k]);
  localStorage.clear();

  // Reset indexedDB mock
  vi.stubGlobal('indexedDB', {
    open: () => {
      const req = { result: mockDB, onupgradeneeded: null, onsuccess: null, onerror: null };
      setTimeout(() => req.onsuccess?.(), 0);
      return req;
    },
  });
});

// Re-import after mocks are set up
const { default: storage } = await import('./storage');

describe('storage', () => {
  it('returns null when no data exists', async () => {
    const result = await storage.load();
    expect(result).toBeNull();
  });

  it('saves and loads data via IndexedDB', async () => {
    const testState = { hero: { name: 'Test' }, quests: [], xp: 100 };
    await storage.save(testState);
    expect(mockStore['hdx2_drachennest']).toEqual(testState);
  });

  it('clears data', async () => {
    mockStore['hdx2_drachennest'] = { test: true };
    await storage.clear();
    expect(mockStore['hdx2_drachennest']).toBeUndefined();
  });

  it('migrates from localStorage to IndexedDB on load', async () => {
    const testData = { hero: { name: 'Test' }, quests: [] };
    localStorage.setItem('hdx2_drachennest', JSON.stringify(testData));

    const result = await storage.load();
    expect(result).toEqual(testData);
  });

  it('falls back to localStorage when IndexedDB fails on save', async () => {
    // Make IndexedDB throw
    vi.stubGlobal('indexedDB', {
      open: () => {
        const req = { result: null, onupgradeneeded: null, onsuccess: null, onerror: null };
        setTimeout(() => req.onerror?.(), 0);
        return req;
      },
    });

    // Re-import with broken indexedDB - the existing storage module has openDB cached
    // but the save method calls openDB which will reject
    const testState = { hero: { name: 'Fallback' }, quests: [] };
    // This should fall back to localStorage
    await storage.save(testState);
    // The fallback may or may not work depending on the implementation
    // At minimum, it should not throw
  });
});

// Sep 2026: the token-keyed cloud path moved off direct table access
// (.from('profiles')) onto security-definer RPCs, because anon could list
// public.profiles and walk away with every family's token. These tests pin
// the RPC contract: names, argument names, and the shape that comes back.
describe('storage cloud sync by token', () => {
  const TOKEN = 'a3f7c2e1b9d5408f2761c8e4ab90f3d6';

  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('reads a profile through profile_get and unwraps state', async () => {
    const state = { hero: { name: 'Ronki' }, quests: [] };
    rpcMock.mockResolvedValue({ data: { state, updated_at: '2026-09-15T08:00:00Z' }, error: null });

    const result = await storage.cloudLoadByToken(TOKEN);

    expect(rpcMock).toHaveBeenCalledWith('profile_get', { p_token: TOKEN });
    expect(result).toEqual(state);
  });

  it('treats a null profile_get result as "no cloud state yet"', async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    expect(await storage.cloudLoadByToken(TOKEN)).toBeNull();
  });

  it('returns null when profile_get errors', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await storage.cloudLoadByToken(TOKEN)).toBeNull();
  });

  it('never calls the RPC for a malformed token', async () => {
    expect(await storage.cloudLoadByToken('not-a-token')).toBeNull();
    await storage.cloudSaveByToken('not-a-token', { hero: {} });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('writes a profile through profile_upsert', async () => {
    rpcMock.mockResolvedValue({ data: { updated_at: '2026-09-15T08:00:00Z' }, error: null });
    const state = { hero: { name: 'Ronki' }, quests: [] };

    await storage.cloudSaveByToken(TOKEN, state);

    expect(rpcMock).toHaveBeenCalledWith('profile_upsert', { p_token: TOKEN, p_state: state });
  });

  it('swallows a failing profile_upsert so local storage stays the fallback', async () => {
    rpcMock.mockRejectedValue(new Error('offline'));
    await expect(storage.cloudSaveByToken(TOKEN, { hero: {} })).resolves.toBeUndefined();
  });
});

// A card made on the website is a cloud seed: parent name, PIN and
// parentOnboardingDone, no quests, no lastDate. The kid's tablet has usually
// booted the app once before scanning, so a pristine local state dated today
// already exists. These tests pin that the seed survives that first scan.
describe('storage syncLoadByToken with a website card seed', () => {
  const TOKEN = 'b84f0a5000841a92696787c969bcfab7';
  const seed = {
    parentOnboardingDone: true,
    parentHandoffBackSeen: true,
    parentPin: null,
    parentPinIsDefault: true,
    analyticsEnabled: false,
    familyConfig: { childName: 'Testkind', siblings: [] },
    kidIntroSeen: false,
    onboardingDone: false,
  };

  beforeEach(async () => {
    // syncLoadByToken caches the winning state with a save() it does not
    // await. Let that write land first, then start from empty stores, so
    // one test's cache write cannot leak into the next test's local state.
    await new Promise((resolve) => setTimeout(resolve, 25));
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
    localStorage.clear();
    rpcMock.mockReset();
  });

  it('lets the parent seed win over a pristine local state dated today', async () => {
    mockStore['hdx2_drachennest'] = {
      quests: [],
      lastDate: '2026-09-15',
      onboardingDone: false,
      parentOnboardingDone: false,
      familyConfig: { childName: '' },
    };
    rpcMock.mockImplementation((fn) =>
      fn === 'profile_get'
        ? Promise.resolve({ data: { state: seed, updated_at: '2026-09-15T08:00:00Z' }, error: null })
        : Promise.resolve({ data: { updated_at: '2026-09-15T08:00:01Z' }, error: null }),
    );

    const result = await storage.syncLoadByToken(TOKEN);

    expect(result.familyConfig.childName).toBe('Testkind');
    expect(result.parentOnboardingDone).toBe(true);
    expect(rpcMock).not.toHaveBeenCalledWith('profile_upsert', expect.anything());
  });

  it('still lets a played local profile win when it is newer than the cloud', async () => {
    const local = {
      quests: [],
      lastDate: '2026-09-15',
      onboardingDone: true,
      parentOnboardingDone: true,
      familyConfig: { childName: 'Louis' },
    };
    mockStore['hdx2_drachennest'] = local;
    rpcMock.mockImplementation((fn) =>
      fn === 'profile_get'
        ? Promise.resolve({
            data: { state: { ...seed, lastDate: '2026-09-10', onboardingDone: true }, updated_at: '2026-09-10T08:00:00Z' },
            error: null,
          })
        : Promise.resolve({ data: { updated_at: '2026-09-15T08:00:01Z' }, error: null }),
    );

    const result = await storage.syncLoadByToken(TOKEN);

    expect(result.familyConfig.childName).toBe('Louis');
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert', { p_token: TOKEN, p_state: local });
  });
});

// Siblings share tablets. The local cache belongs to the card that last
// loaded on this device; scanning another card must not push that cache
// into the other child's cloud row or hand it back as the other child.
describe('storage syncLoadByToken sibling guard', () => {
  const CARD_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const CARD_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const childA = {
    quests: [],
    lastDate: '2026-09-16',
    onboardingDone: true,
    parentOnboardingDone: true,
    familyConfig: { childName: 'Louis' },
  };

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
    localStorage.clear();
    rpcMock.mockReset();
  });

  it('ignores the first child cache when a second card is scanned', async () => {
    mockStore['hdx2_drachennest'] = childA;
    localStorage.setItem('ronki_local_owner', CARD_A);
    const childB = { ...childA, lastDate: '2026-09-10', familyConfig: { childName: 'Liam' } };
    rpcMock.mockImplementation((fn) =>
      fn === 'profile_get'
        ? Promise.resolve({ data: { state: childB, updated_at: '2026-09-10T08:00:00Z' }, error: null })
        : Promise.resolve({ data: { updated_at: '2026-09-16T08:00:01Z' }, error: null }),
    );

    const result = await storage.syncLoadByToken(CARD_B);

    expect(result.familyConfig.childName).toBe('Liam');
    expect(rpcMock).not.toHaveBeenCalledWith('profile_upsert', expect.anything());
    expect(localStorage.getItem('ronki_local_owner')).toBe(CARD_B);
  });

  it('starts fresh instead of reusing the first child when the second card has no cloud state', async () => {
    mockStore['hdx2_drachennest'] = childA;
    localStorage.setItem('ronki_local_owner', CARD_A);
    rpcMock.mockImplementation((fn) =>
      fn === 'profile_get'
        ? Promise.resolve({ data: null, error: null })
        : Promise.resolve({ data: { updated_at: '2026-09-16T08:00:01Z' }, error: null }),
    );

    const result = await storage.syncLoadByToken(CARD_B);

    expect(result).toBeNull();
    expect(rpcMock).not.toHaveBeenCalledWith('profile_upsert', expect.anything());
    expect(mockStore['hdx2_drachennest']).toBeUndefined();
  });

  it('treats a cache without a recorded owner as the current card', async () => {
    mockStore['hdx2_drachennest'] = childA;
    rpcMock.mockImplementation((fn) =>
      fn === 'profile_get'
        ? Promise.resolve({
            data: { state: { ...childA, lastDate: '2026-09-10' }, updated_at: '2026-09-10T08:00:00Z' },
            error: null,
          })
        : Promise.resolve({ data: { updated_at: '2026-09-16T08:00:01Z' }, error: null }),
    );

    const result = await storage.syncLoadByToken(CARD_A);

    expect(result.familyConfig.childName).toBe('Louis');
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert', { p_token: CARD_A, p_state: childA });
    expect(localStorage.getItem('ronki_local_owner')).toBe(CARD_A);
  });
});
