// ── Ronki Storage, IndexedDB local + Supabase cloud sync ──
//
// EXPERIMENT BRANCH NOTE (drachennest): the storage names are namespaced
// with "_drachennest" so this branch's saves stay isolated from main/dev
// when both are served from the same origin (e.g. iamyaws.github.io/Ronki/dev/
// vs /Ronki/experiment/). The Drachennest reframe can be tested in parallel
// without clobbering Louis's existing dev state. When the experiment
// merges back to main the suffix gets removed in the same commit.
import type { GameState } from '../types';
import { supabase } from '../lib/supabase';
import { claimLocalProfile, getLocalProfileOwner } from '../lib/profileToken';

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

/** Per token: did this session's last cloud read reach the server? (Astra FC-01) */
const cloudReadStatus = new Map<string, 'ok' | 'failed'>();

/** Set just before a stale page reloads (useTripClock). From then on this
 *  page writes nothing, locally or to the cloud: its in-memory state may be
 *  older than what another device saved (review fix round 1, SAVES-1). */
let writesFrozen = false;

/** Per token: the write stamp (`_cloudStamp`) of the cloud row as this
 *  session last saw it, by a read or by its own write. 'none' = the read
 *  found no row. Absent = never read here. A write only goes through while
 *  the row still carries this stamp, so a device that fell behind (another
 *  device wrote meanwhile) never overwrites newer progress (Astra round 2,
 *  SAVES-1-R2 and FC-01-R2). */
const knownStamp = new Map<string, string | null>();
/** Per token: when a checked save last confirmed this device was current (ms). */
const verifiedAt = new Map<string, number>();

function stampOf(state: unknown): string | null {
  const v = (state as { _cloudStamp?: unknown } | null)?._cloudStamp;
  return typeof v === 'string' && v ? v : null;
}

function newStamp(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Result of a checked cloud save. */
export type CheckedSave = 'saved' | 'conflict' | 'offline' | 'frozen' | 'skipped';

const storage = {
  // ── Local (IndexedDB with localStorage fallback) ──
  async load(): Promise<GameState | null> {
    // Apr 2026 fix: prefer IndexedDB, but treat localStorage as a
    // continuous fallback (NOT a one-shot migration that wipes itself).
    // Previous behaviour deleted the localStorage entry on first load
    // after migrating it to IDB, which meant if a later save's IDB
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

  /** Stop every write from this page (see writesFrozen). One way: only a reload clears it. */
  freezeWrites(): void {
    writesFrozen = true;
  },

  /** True once freezeWrites() ran on this page. */
  writesFrozen(): boolean {
    return writesFrozen;
  },

  async save(state: GameState): Promise<void> {
    if (writesFrozen) return;
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
    // small (~50KB peak) and writes happen on a 400ms debounce, total
    // overhead is sub-millisecond per save.
    let serialized: string | null = null;
    try {
      serialized = JSON.stringify(state);
      // Synchronous localStorage write first, guaranteed-persisted
      // before save() returns even if IDB later fails.
      localStorage.setItem(LS_KEY, serialized);
    } catch { /* storage full or quota exceeded, IDB still tried below */ }

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
      // Silent fail, local IndexedDB is the fallback
    }
  },

  // ── Cloud (Supabase, token-keyed BeyArena pattern) ──
  // Token-as-credential model. The 32-hex token is both the row key
  // and the auth credential, anyone with it can read/write that
  // profile. Security relies on token entropy (128 bits, unguessable).
  //
  // Sep 2026: these two used to hit public.profiles directly, which
  // meant anon could also LIST the table and walk away with every
  // family's token. The table is now closed to anon and both calls go
  // through security-definer RPCs that take the token as an argument,
  // so a caller can only reach the profile they already hold the token
  // for. See supabase/migrations/20260915000200_profiles_rpc.sql and
  // docs/specs/qr-profile-auth.md.
  async cloudLoadByToken(token: string): Promise<GameState | null> {
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return null;
    try {
      // profile_get returns null when there is no row, which is the
      // same "no cloud state yet" case the old maybeSingle() returned.
      const { data, error } = await supabase.rpc('profile_get', { p_token: token });
      // Finch pass (26 Sep 2026, Astra FC-01): remember whether the read
      // really reached the server. A failed read and "no row" both return
      // null, but only a successful read may let local state be written
      // to this card (see cloudReadOk).
      if (error) {
        cloudReadStatus.set(token, 'failed');
        return null;
      }
      cloudReadStatus.set(token, 'ok');
      const state = data ? (((data as { state?: GameState }).state as GameState) || null) : null;
      knownStamp.set(token, state ? stampOf(state) : 'none');
      return state;
    } catch {
      cloudReadStatus.set(token, 'failed');
      return null;
    }
  },

  /**
   * True once a cloud read for this token has reached the server in this
   * session (a row or a real "no row"). Until then nothing local may be
   * written to the card: a failed read must never turn into an overwrite
   * of an existing dragon (Astra FC-01, Finch pass 26 Sep 2026).
   */
  cloudReadOk(token: string): boolean {
    return cloudReadStatus.get(token) === 'ok';
  },

  async cloudSaveByToken(token: string, state: GameState): Promise<void> {
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return;
    if (writesFrozen) return;
    try {
      // profile_upsert stamps updated_at server-side and records today
      // in profile_activity, which is what the active-family counter
      // reads. It rejects a malformed token with an error we swallow.
      // Every write carries a fresh _cloudStamp (see knownStamp).
      const stamp = newStamp();
      const res = await supabase.rpc('profile_upsert', {
        p_token: token,
        p_state: { ...(state as unknown as Record<string, unknown>), _cloudStamp: stamp },
      });
      if (!(res as { error?: unknown } | undefined)?.error) knownStamp.set(token, stamp);
    } catch {
      // Silent fail, local IndexedDB + localStorage are the fallback
    }
  },

  /**
   * The app's normal cloud save (Astra round 2). Reads the row first and
   * writes only when it still carries the stamp this session last saw:
   * - 'conflict': another device wrote since, or this session never
   *   reconciled a row that exists. Nothing is written; the caller freezes
   *   writes and reloads, so the normal sync merges the newer row.
   * - 'offline': the read failed. Nothing is written; local keeps everything.
   * - 'saved': written with a new stamp.
   */
  async cloudSaveChecked(token: string, state: GameState): Promise<CheckedSave> {
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return 'skipped';
    if (writesFrozen) return 'frozen';
    const before = knownStamp.has(token) ? knownStamp.get(token) : undefined;
    let remote: GameState | null = null;
    try {
      const { data, error } = await supabase.rpc('profile_get', { p_token: token });
      if (error) {
        cloudReadStatus.set(token, 'failed');
        return 'offline';
      }
      cloudReadStatus.set(token, 'ok');
      remote = data ? (((data as { state?: GameState }).state as GameState) || null) : null;
    } catch {
      cloudReadStatus.set(token, 'failed');
      return 'offline';
    }
    const now = remote ? stampOf(remote) : 'none';
    // Never read here: only a truly empty card (a token made on this
    // device) may be written blind.
    const current = before === undefined ? now === 'none' : now === before;
    if (!current) return 'conflict';
    if (writesFrozen) return 'frozen';
    await this.cloudSaveByToken(token, state);
    verifiedAt.set(token, Date.now());
    return 'saved';
  },

  /** True when a checked save confirmed this device was current within `ms`. */
  recentlyVerified(token: string, ms: number): boolean {
    const t = verifiedAt.get(token);
    return typeof t === 'number' && Date.now() - t <= ms;
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
        // Local is newer, push to cloud
        this.cloudSave(userId, local);
        return local;
      }
      // Cloud wins, cache locally
      this.save(cloud);
      return cloud;
    }

    if (local && !cloud) {
      // First login with existing local data, migrate to cloud
      this.cloudSave(userId, local);
      return local;
    }

    if (cloud && !local) {
      // New device, cache cloud data locally
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
    const [localRaw, cloud] = await Promise.all([
      this.load(),
      this.cloudLoadByToken(token),
    ]);

    // Sibling guard: the local cache belongs to the card that last loaded
    // on this device. If a different card was scanned, that cache is another
    // child's state. It must not be pushed into this card or win on date.
    // A cache without a recorded owner is treated as this card's own, which
    // keeps every existing device working after the update.
    let local = localRaw;
    const owner = getLocalProfileOwner();
    if (local && owner && owner !== token) {
      local = null;
      if (!cloud) await this.clear();
    }
    claimLocalProfile(token);

    if (cloud && local) {
      // A card created on the website arrives as a cloud seed with the
      // parent's name, PIN and parentOnboardingDone, but without lastDate.
      // The app has usually booted once before the scan and saved a
      // pristine local state dated today. Without this guard that empty
      // local state wins on date and overwrites the parent's seed.
      const localPristine = !(local as any).onboardingDone && !(local as any).parentOnboardingDone;
      const cloudFurther = !!(cloud as any).onboardingDone || !!(cloud as any).parentOnboardingDone;
      if (localPristine && cloudFurther) {
        this.save(cloud);
        return cloud;
      }
      const cloudDate = (cloud as any).lastDate || '';
      const localDate = (local as any).lastDate || '';
      if (localDate > cloudDate) {
        // Local is newer (this device played most recently). Push to
        // cloud, return local.
        this.cloudSaveByToken(token, local);
        return local;
      }
      // Cloud wins, cache locally for offline use + faster next boot.
      this.save(cloud);
      return cloud;
    }

    if (local && !cloud) {
      // Existing local profile getting tagged with a token for the
      // first time, migrate to cloud. Only when the read really found no
      // row: after a failed read the card may hold a dragon we could not
      // see, so local stays local (Astra FC-01).
      if (this.cloudReadOk(token)) this.cloudSaveByToken(token, local);
      return local;
    }

    if (cloud && !local) {
      // New device that received the token via shared URL, pull
      // cloud state down + cache locally.
      this.save(cloud);
      return cloud;
    }

    return null; // Brand-new token with no state anywhere
  },
};

export default storage;
