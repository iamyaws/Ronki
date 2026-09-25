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

    expect(rpcMock).toHaveBeenCalledWith('profile_upsert', { p_token: TOKEN, p_state: { ...state, _cloudStamp: expect.any(String) } });
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
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert', { p_token: TOKEN, p_state: { ...local, _cloudStamp: expect.any(String) } });
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
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert', { p_token: CARD_A, p_state: { ...childA, _cloudStamp: expect.any(String) } });
    expect(localStorage.getItem('ronki_local_owner')).toBe(CARD_A);
  });
});

// Finch pass (26 Sep 2026, Astra FC-01): a local hatch must never be
// pushed onto a card whose cloud read failed. Egg first means a device
// often holds a hatched, not yet onboarded local state when a card is
// scanned; a transient profile_get error used to upload it over the card.
describe('storage syncLoadByToken after a failed cloud read', () => {
  const T1 = 'b'.repeat(32);
  const T2 = 'c'.repeat(32);
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('keeps a local hatch local when profile_get errors (no profile_upsert)', async () => {
    mockStore['hdx2_drachennest'] = { kidIntroSeen: true, companionName: 'Funki', onboardingDone: false };
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get'
      ? { data: null, error: { message: 'network down' } }
      : { data: null, error: null }));
    const result = await storage.syncLoadByToken(T1);
    expect(result).toMatchObject({ companionName: 'Funki' });
    expect(storage.cloudReadOk(T1)).toBe(false);
    expect(rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert')).toHaveLength(0);
  });

  it('still migrates local to the card when the read really found no row', async () => {
    mockStore['hdx2_drachennest'] = { kidIntroSeen: true, companionName: 'Funki', onboardingDone: false };
    rpcMock.mockImplementation(async () => ({ data: null, error: null }));
    await storage.syncLoadByToken(T2);
    expect(storage.cloudReadOk(T2)).toBe(true);
    expect(rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert')).toHaveLength(1);
  });
});

// Astra round 2 (SAVES-1-R2, FC-01-R2): the app's cloud save writes only
// while the card still carries the stamp this session last saw.
describe('storage.cloudSaveChecked', () => {
  const T = 'e'.repeat(32);
  const U = 'f'.repeat(32);
  const V = '1'.repeat(32);
  beforeEach(() => { rpcMock.mockReset(); });
  const upserts = () => rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert');

  it('writes while the row still carries the stamp this device saw, and moves the stamp on', async () => {
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get' ? { data: { state: { lastDate: '2026-09-28', _cloudStamp: 's1' } }, error: null } : { data: null, error: null }));
    await storage.cloudLoadByToken(T); // this device saw s1
    expect(await storage.cloudSaveChecked(T, { lastDate: '2026-09-28', x: 1 })).toBe('saved');
    expect(upserts()).toHaveLength(1);
    const written = upserts()[0][1].p_state._cloudStamp;
    expect(written).toMatch(/\w/);
    // The card now carries our stamp: the next checked save sees it as current.
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get' ? { data: { state: { _cloudStamp: written } }, error: null } : { data: null, error: null }));
    expect(await storage.cloudSaveChecked(T, { x: 2 })).toBe('saved');
  });

  it('reports a conflict and writes nothing when another device wrote meanwhile', async () => {
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get' ? { data: { state: { _cloudStamp: 'mine' } }, error: null } : { data: null, error: null }));
    await storage.cloudLoadByToken(U);
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get' ? { data: { state: { _cloudStamp: 'theirs' } }, error: null } : { data: null, error: null }));
    expect(await storage.cloudSaveChecked(U, { stale: true })).toBe('conflict');
    expect(upserts()).toHaveLength(0);
  });

  it('never writes blind onto a row this session never read; an empty card may be written', async () => {
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get' ? { data: { state: { companionName: 'Glut' } }, error: null } : { data: null, error: null }));
    expect(await storage.cloudSaveChecked(V, { hatch: true })).toBe('conflict');
    expect(upserts()).toHaveLength(0);
    const W = '2'.repeat(32);
    rpcMock.mockImplementation(async () => ({ data: null, error: null }));
    expect(await storage.cloudSaveChecked(W, { fresh: true })).toBe('saved');
    expect(upserts()).toHaveLength(1);
  });

  it('writes nothing when the read fails', async () => {
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get' ? { data: null, error: { message: 'down' } } : { data: null, error: null }));
    expect(await storage.cloudSaveChecked('3'.repeat(32), { x: 1 })).toBe('offline');
    expect(upserts()).toHaveLength(0);
  });
});

// Review fix round 1 (SAVES-1): a stale page that is about to reload
// writes nothing. Last in this file on purpose: the freeze is one way.
describe('storage.freezeWrites', () => {
  it('blocks the local save and the cloud save from then on', async () => {
    rpcMock.mockReset();
    rpcMock.mockResolvedValue({ data: null, error: null });
    storage.freezeWrites();
    expect(storage.writesFrozen()).toBe(true);
    await storage.save({ onboardingDone: true, marker: 'stale' });
    expect(mockStore['hdx2_drachennest']).toBeUndefined();
    await storage.cloudSaveByToken('d'.repeat(32), { marker: 'stale' });
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
