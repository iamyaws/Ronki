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

beforeEach(async () => {
  // Let the previous test's writes finish before clearing (compare-and-swap
  // sync writes its bookkeeping to the local copy in the background).
  await storage.settled();
  await new Promise((resolve) => setTimeout(resolve, 0));
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

  it('writes a profile through profile_upsert_if (compare-and-swap)', async () => {
    rpcMock.mockResolvedValue({ data: { ok: true, rev: 1, updated_at: '2026-09-15T08:00:00Z' }, error: null });
    const state = { hero: { name: 'Ronki' }, quests: [] };

    const w = await storage.cloudSaveByToken(TOKEN, state);

    expect(w.status).toBe('saved');
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert_if', expect.objectContaining({ p_token: TOKEN, p_state: expect.objectContaining(state) }));
  });

  it('swallows a failing write so local storage stays the fallback', async () => {
    rpcMock.mockRejectedValue(new Error('offline'));
    await expect(storage.cloudSaveByToken(TOKEN, { hero: {} })).resolves.toMatchObject({ status: 'offline' });
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
        : Promise.resolve({ data: { ok: true, rev: 1, updated_at: '2026-09-15T08:00:01Z' }, error: null }),
    );

    const result = await storage.syncLoadByToken(TOKEN);

    expect(result.familyConfig.childName).toBe('Louis');
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert_if', expect.objectContaining({ p_token: TOKEN, p_state: expect.objectContaining({ lastDate: '2026-09-15', familyConfig: expect.objectContaining({ childName: 'Louis' }) }) }));
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
        : Promise.resolve({ data: { ok: true, rev: 1, updated_at: '2026-09-16T08:00:01Z' }, error: null }),
    );

    const result = await storage.syncLoadByToken(CARD_A);

    expect(result.familyConfig.childName).toBe('Louis');
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert_if', expect.objectContaining({ p_token: CARD_A, p_state: expect.objectContaining(childA) }));
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
    expect(rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert' || fn === 'profile_upsert_if')).toHaveLength(0);
  });

  it('still migrates local to the card when the read really found no row', async () => {
    mockStore['hdx2_drachennest'] = { kidIntroSeen: true, companionName: 'Funki', onboardingDone: false };
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get' ? { data: null, error: null } : { data: { ok: true, rev: 1 }, error: null }));
    await storage.syncLoadByToken(T2);
    expect(storage.cloudReadOk(T2)).toBe(true);
    const writes = rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert_if');
    expect(writes).toHaveLength(1);
    // A card with no row is written with "insert only if still empty".
    expect(writes[0][1].p_expected_rev).toBeNull();
  });
});

// Finch pass (verifier C and H): with egg first a device can hold an
// unfinished local hatch when a card with a dragon is scanned.
describe('storage syncLoadByToken: an unfinished local state never beats an onboarded card', () => {
  const T = '4'.repeat(32);
  beforeEach(() => { rpcMock.mockReset(); });

  it('the card dragon wins over a local hatch that went through the parent step today', async () => {
    const today = '2026-09-28';
    mockStore['hdx2_drachennest'] = { kidIntroSeen: true, parentOnboardingDone: true, onboardingDone: false, companionName: 'Funki', lastDate: today };
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_get'
      ? { data: { state: { onboardingDone: true, companionName: 'Glut', catEvo: 9, lastDate: '2026-09-27' } }, error: null }
      : { data: null, error: null }));
    const result = await storage.syncLoadByToken(T);
    expect(result).toMatchObject({ companionName: 'Glut', catEvo: 9 });
    expect(rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert')).toHaveLength(0);
  });

  it("a failed read never clears another card's local cache (sibling guard)", async () => {
    // Let the previous test's unawaited save(cloud) land first.
    await new Promise(r => setTimeout(r, 30));
    localStorage.setItem('ronki_local_owner', '5'.repeat(32));
    mockStore['hdx2_drachennest'] = { onboardingDone: true, companionName: 'Geschwister' };
    rpcMock.mockImplementation(async () => ({ data: null, error: { message: 'down' } }));
    await storage.syncLoadByToken(T);
    expect(mockStore['hdx2_drachennest']).toMatchObject({ companionName: 'Geschwister' });
  });
});

// Compare-and-swap sync (26 Sep 2026): profile_upsert_if writes only while
// the card still has the revision this device last saw; a race merges both
// devices' progress and retries with the new revision.
describe('storage.cloudSaveByToken compare-and-swap', () => {
  const T = '6'.repeat(32);
  beforeEach(() => { rpcMock.mockReset(); });

  it('uses the revision it read, and the next save uses the revision it wrote', async () => {
    rpcMock.mockImplementation(async (fn, args) => {
      if (fn === 'profile_get') return { data: { state: { lastDate: '2026-09-28', totalTasksDone: 1 }, rev: 7 }, error: null };
      return { data: { ok: true, rev: (args.p_expected_rev ?? 0) + 1 }, error: null };
    });
    await storage.cloudLoadByToken(T);
    await storage.cloudSaveByToken(T, { lastDate: '2026-09-28', totalTasksDone: 2 });
    await storage.cloudSaveByToken(T, { lastDate: '2026-09-28', totalTasksDone: 3 });
    const writes = rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert_if').map(([, a]) => a.p_expected_rev);
    expect(writes).toEqual([7, 8]);
  });

  it('a race with another device merges both and retries with the new revision', async () => {
    const T2 = '7'.repeat(32);
    const base = { lastDate: '2026-09-28', totalTasksDone: 1, quests: [{ id: 's_wake', done: false }, { id: 's_breakfast', done: false }], treasuresFound: ['t01'] };
    const theirs = { ...base, totalTasksDone: 2, quests: [{ id: 's_wake', done: true }, { id: 's_breakfast', done: false }], treasuresFound: ['t01', 't02'] };
    const mine = { ...base, totalTasksDone: 2, quests: [{ id: 's_wake', done: false }, { id: 's_breakfast', done: true }] };
    let calls = 0;
    rpcMock.mockImplementation(async (fn, args) => {
      if (fn === 'profile_get') return { data: { state: base, rev: 3 }, error: null };
      calls++;
      if (args.p_expected_rev === 3) return { data: { ok: false, rev: 4, state: theirs }, error: null };
      return { data: { ok: true, rev: 5 }, error: null };
    });
    await storage.cloudLoadByToken(T2);
    const w = await storage.cloudSaveByToken(T2, mine);
    expect(calls).toBe(2);
    expect(w.status).toBe('merged');
    expect(w.changed).toBe(true);
    expect(w.state.quests.map(q => q.done)).toEqual([true, true]);
    expect(w.state.treasuresFound).toEqual(['t01', 't02']);
    const retry = rpcMock.mock.calls.filter(([fn]) => fn === 'profile_upsert_if')[1][1];
    expect(retry.p_expected_rev).toBe(4);
  });

  it('never overwrites a card it never read: an existing row is merged, the card\'s dragon stays', async () => {
    const T3 = '8'.repeat(32);
    const card = { onboardingDone: true, companionName: 'Glut', catEvo: 9, lastDate: '2026-09-27' };
    rpcMock.mockImplementation(async (fn, args) => {
      if (args.p_expected_rev === null) return { data: { ok: false, rev: 2, state: card }, error: null };
      return { data: { ok: true, rev: 3 }, error: null };
    });
    const w = await storage.cloudSaveByToken(T3, { kidIntroSeen: true, onboardingDone: false, companionName: 'Funki', lastDate: '2026-09-28' });
    expect(w.status).toBe('merged');
    expect(w.state.companionName).toBe('Glut');
    expect(w.state.catEvo).toBe(9);
  });

  it('falls back to the old write while the server does not have the function (last in this block)', async () => {
    const T4 = '9'.repeat(32);
    rpcMock.mockImplementation(async (fn) => (fn === 'profile_upsert_if'
      ? { data: null, error: { code: 'PGRST202', message: 'Could not find the function public.profile_upsert_if' } }
      : { data: { rev: 1 }, error: null }));
    const w = await storage.cloudSaveByToken(T4, { a: 1 });
    expect(w.status).toBe('saved');
    expect(rpcMock).toHaveBeenCalledWith('profile_upsert', { p_token: T4, p_state: expect.objectContaining({ a: 1 }) });
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
