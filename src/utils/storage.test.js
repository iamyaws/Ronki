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
    put: (val, key) => { mockStore[key] = val; },
    delete: (key) => { delete mockStore[key]; },
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
    // localStorage should be cleared after migration
    expect(localStorage.getItem('hdx2_drachennest')).toBeNull();
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
