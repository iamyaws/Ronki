// ── Ronki Storage — IndexedDB local + Supabase cloud sync ──
//
// EXPERIMENT BRANCH NOTE (drachennest): the storage names are namespaced
// with "_drachennest" so this branch's saves stay isolated from main/dev
// when both are served from the same origin (e.g. iamyaws.github.io/Ronki/dev/
// vs /Ronki/experiment/). The Drachennest reframe can be tested in parallel
// without clobbering Louis's existing dev state. When the experiment
// merges back to main the suffix gets removed in the same commit.
import type { GameState } from '../types';
import { supabase } from '../lib/supabase';

const DB_NAME = "herodex_drachennest";
const STORE = "state";
const KEY = "hdx2_drachennest";
const LS_KEY = "hdx2_drachennest";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const storage = {
  // ── Local (IndexedDB with localStorage fallback) ──
  async load(): Promise<GameState | null> {
    // Apr 2026 fix: prefer IndexedDB, but treat localStorage as a
    // continuous fallback (NOT a one-shot migration that wipes itself).
    // Previous behaviour deleted the localStorage entry on first load
    // after migrating it to IDB — which meant if a later save's IDB
    // transaction failed to commit before tab-close (a real bug, see
    // save() comments), there was nothing to fall back on. Result for
    // Marc 27 Apr: Louis re-picks the egg every session.
    const readFromLocalStorage = (): GameState | null => {
      try {
        const ls = localStorage.getItem(LS_KEY);
        return ls ? (JSON.parse(ls) as GameState) : null;
      } catch { return null; }
    };

    try {
      const db = await openDB();
      const idbResult = await new Promise<GameState | null>((resolve) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(KEY);
        req.onsuccess = () => resolve((req.result as GameState) || null);
        req.onerror = () => resolve(null);
      });
      // If IDB has data, use it. Otherwise fall back to localStorage
      // (which may have a more-recent state from a tab-close save that
      // didn't make it to IDB).
      return idbResult || readFromLocalStorage();
    } catch {
      return readFromLocalStorage();
    }
  },

  async save(state: GameState): Promise<void> {
    // Apr 2026 fix: writes go to BOTH IndexedDB AND localStorage every
    // time, and the IDB write awaits transaction commit before resolving.
    //
    // Previously the IDB write fired the .put(...) request but didn't
    // await tx.oncomplete, so save() resolved before the transaction
    // committed. Combined with React's autosave debounce (400ms),
    // this meant: kid finishes onboarding → state changes → debounce
    // schedules save → save() opens transaction → page close → tab
    // unloads before the transaction commits → state lost. Next session
    // loads empty state, kid re-onboards.
    //
    // Two-pronged fix:
    //   1. Await tx.oncomplete on IDB write so save() doesn't resolve
    //      until the data is actually persisted.
    //   2. Mirror to localStorage synchronously every save. localStorage
    //      writes are synchronous in browsers and survive tab close
    //      reliably. So even if IDB commit gets cancelled by unload,
    //      the localStorage copy is still there for next load to pick up.
    //
    // The double-write doubles the storage cost but state objects are
    // small (~50KB peak) and writes happen on a 400ms debounce — total
    // overhead is sub-millisecond per save.
    let serialized: string | null = null;
    try {
      serialized = JSON.stringify(state);
      // Synchronous localStorage write first — guaranteed-persisted
      // before save() returns even if IDB later fails.
      localStorage.setItem(LS_KEY, serialized);
    } catch { /* storage full or quota exceeded — IDB still tried below */ }

    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
        tx.objectStore(STORE).put(state, KEY);
      });
    } catch {
      // IDB unavailable / blocked. localStorage is the fallback,
      // already written above.
    }
  },

  async clear(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(KEY);
    } catch { /* ignore */ }
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  },

  // ── Cloud (Supabase, legacy game_state path) ──
  // Apr 27 2026: legacy `game_state` table never actually existed on
  // the project (verified via Supabase advisor + list_tables). These
  // calls were silently failing, which is part of the reason Louis
  // lost state across sessions. Kept here for any latent caller that
  // still passes a userId; the new BeyArena-pattern token path below
  // (cloudLoadByToken/cloudSaveByToken) is what actually persists.
  async cloudLoad(userId: string): Promise<GameState | null> {
    try {
      const { data, error } = await supabase
        .from('game_state')
        .select('state')
        .eq('user_id', userId)
        .single();
      if (error || !data) return null;
      return data.state as GameState;
    } catch {
      return null;
    }
  },

  async cloudSave(userId: string, state: GameState): Promise<void> {
    try {
      await supabase
        .from('game_state')
        .upsert({
          user_id: userId,
          state,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch {
      // Silent fail — local IndexedDB is the fallback
    }
  },

  // ── Cloud (Supabase, token-keyed BeyArena pattern) ──
  // Token-as-credential model. The 32-hex token is both the row key
  // and the auth credential — anyone with it can read/write that
  // profile. RLS allows anon SELECT/INSERT/UPDATE filtered by token
  // shape; security relies on token entropy (128 bits, unguessable).
  // See migrations create_profiles_table_for_qr_auth +
  // harden_profiles_function_and_rls + docs/specs/qr-profile-auth.md.
  async cloudLoadByToken(token: string): Promise<GameState | null> {
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('state, updated_at')
        .eq('token', token)
        .maybeSingle();
      if (error || !data) return null;
      return (data.state as GameState) || null;
    } catch {
      return null;
    }
  },

  async cloudSaveByToken(token: string, state: GameState): Promise<void> {
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return;
    try {
      // Upsert by primary-key token. Server-side trigger updates
      // updated_at on any modification; we set last_active_at here
      // so cleanup heuristics ("inactive 90+ days") can rely on it.
      await supabase
        .from('profiles')
        .upsert({
          token,
          state: state as unknown as Record<string, unknown>,
          last_active_at: new Date().toISOString(),
        }, { onConflict: 'token' });
    } catch {
      // Silent fail — local IndexedDB + localStorage are the fallback
    }
  },

  // ── Sync: resolve local vs cloud, return best state ──
  async syncLoad(userId: string): Promise<GameState | null> {
    const [local, cloud] = await Promise.all([
      this.load(),
      this.cloudLoad(userId),
    ]);

    if (cloud && local) {
      // Pick whichever has the more recent date, fallback to cloud
      const cloudDate = (cloud as any).lastDate || '';
      const localDate = (local as any).lastDate || '';
      if (localDate > cloudDate) {
        // Local is newer — push to cloud
        this.cloudSave(userId, local);
        return local;
      }
      // Cloud wins — cache locally
      this.save(cloud);
      return cloud;
    }

    if (local && !cloud) {
      // First login with existing local data — migrate to cloud
      this.cloudSave(userId, local);
      return local;
    }

    if (cloud && !local) {
      // New device — cache cloud data locally
      this.save(cloud);
      return cloud;
    }

    return null; // Fresh user, no data anywhere
  },

  // ── Sync: token-keyed (BeyArena pattern) ──
  // Resolve local vs cloud for a given profile token. Same merge
  // strategy as syncLoad(userId) but keyed by token, not auth user.
  // Used by TaskContext when a profile token is present.
  async syncLoadByToken(token: string): Promise<GameState | null> {
    if (!token) return this.load();
    const [local, cloud] = await Promise.all([
      this.load(),
      this.cloudLoadByToken(token),
    ]);

    if (cloud && local) {
      const cloudDate = (cloud as any).lastDate || '';
      const localDate = (local as any).lastDate || '';
      if (localDate > cloudDate) {
        // Local is newer (this device played most recently). Push to
        // cloud, return local.
        this.cloudSaveByToken(token, local);
        return local;
      }
      // Cloud wins — cache locally for offline use + faster next boot.
      this.save(cloud);
      return cloud;
    }

    if (local && !cloud) {
      // Existing local profile getting tagged with a token for the
      // first time — migrate to cloud.
      this.cloudSaveByToken(token, local);
      return local;
    }

    if (cloud && !local) {
      // New device that received the token via shared URL — pull
      // cloud state down + cache locally.
      this.save(cloud);
      return cloud;
    }

    return null; // Brand-new token with no state anywhere
  },
};

export default storage;
