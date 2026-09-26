// ── Ronki Storage, IndexedDB local + Supabase cloud sync ──
//
// EXPERIMENT BRANCH NOTE (drachennest): the storage names are namespaced
// with "_drachennest" so this branch's saves stay isolated from main/dev
// when both are served from the same origin (e.g. iamyaws.github.io/Ronki/dev/
// vs /Ronki/experiment/). The Drachennest reframe can be tested in parallel
// without clobbering Louis's existing dev state. When the experiment
// merges back to main the suffix gets removed in the same commit.
import type { GameState } from '../types';
import { mergeStates, jsonEqual } from './mergeState';
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

/**
 * Per card, what this page knows about the cloud row (compare-and-swap sync,
 * 26 Sep 2026, reworked after review round 1):
 *   rev      the row's revision as last read or written (null = no row)
 *   server   the row's content at that revision
 *   base     the last state this page handed to its caller or wrote for it.
 *            The card always contains base, and every state the caller
 *            writes later grew from it. So a write sends
 *            mergeStates(base, state, card): the caller's changes since base,
 *            applied onto the card. A caller that never takes on another
 *            device's progress can still never overwrite it.
 *   inflight a write whose answer never came back: it may have landed.
 * base and inflight are also kept in localStorage per card, so the next cold
 * start can apply the local copy onto the card instead of picking one side.
 */
type Inflight = { id: string; submitted: GameState };
type SyncInfo = { rev: number | null; server: GameState | null; base: GameState | null; inflight: Inflight | null };
const sync = new Map<string, SyncInfo>();
const SYNC_KEY = (token: string) => `ronki_sync_${token}`;
/** How many recent write ids a card keeps (to spot a write whose answer got lost). */
const WRITE_IDS_KEPT = 20;

function getSync(token: string): SyncInfo {
  let s = sync.get(token);
  if (!s) { s = { rev: null, server: null, base: null, inflight: null }; sync.set(token, s); }
  return s;
}

function persistSync(token: string, s: SyncInfo): void {
  try {
    if (!s.base && !s.inflight) { localStorage.removeItem(SYNC_KEY(token)); return; }
    localStorage.setItem(SYNC_KEY(token), JSON.stringify({ rev: s.rev, base: s.base, inflight: s.inflight }));
  } catch {
    // A base that cannot be stored must not survive stale: drop it, so the
    // next cold start falls back to the day rule instead of a wrong merge.
    try { localStorage.removeItem(SYNC_KEY(token)); } catch { /* ignore */ }
  }
}

function readPersistedSync(token: string): { rev: number | null; base: GameState | null; inflight: Inflight | null } | null {
  try {
    const raw = localStorage.getItem(SYNC_KEY(token));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** The caller now holds `state` for this card (a load handed it out). */
function handOut(token: string, state: GameState | null): void {
  const s = getSync(token);
  s.base = state;
  s.inflight = null;
  persistSync(token, s);
}

function newWriteId(): string {
  try { return crypto.randomUUID().replace(/-/g, '').slice(0, 12); } catch { return Math.random().toString(36).slice(2, 14); }
}

function writeIdsOf(state: unknown): string[] {
  const w = (state as { syncWrites?: unknown } | null)?.syncWrites;
  return Array.isArray(w) ? w.filter((x): x is string => typeof x === 'string') : [];
}

/** The caller's changes since base, applied onto the card, stamped with this write's id. */
function compose(base: GameState | null, state: GameState, server: GameState | null, id: string): GameState {
  const merged = server
    ? mergeStates(base as unknown as Record<string, unknown> | null, state as unknown as Record<string, unknown>, server as unknown as Record<string, unknown>) as unknown as GameState
    : state;
  const ids = [...writeIdsOf(merged).filter(x => x !== id), id].slice(-WRITE_IDS_KEPT);
  return { ...merged, syncWrites: ids } as GameState;
}

/** Same content apart from the write ids. */
function sameContent(a: unknown, b: unknown): boolean {
  const strip = (v: unknown) => {
    if (!v || typeof v !== 'object') return v;
    const { syncWrites: _ignored, ...rest } = v as Record<string, unknown>;
    return rest;
  };
  return jsonEqual(strip(a), strip(b));
}

/**
 * Does `local` look like it grew from `base`? Checked on everything that only
 * grows. A local copy that is behind (its last save never finished) must not
 * be applied onto the card: its "changes" would undo progress.
 */
function descendsFrom(base: GameState, local: GameState): boolean {
  const b = base as unknown as Record<string, unknown>;
  const l = local as unknown as Record<string, unknown>;
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
  const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id?: unknown }).id : undefined);
  const isDone = (v: unknown) => !!v && typeof v === 'object' && (v as { done?: unknown }).done === true;
  if (s(l.lastDate) < s(b.lastDate)) return false;
  for (const k of ['totalTasksDone', 'adventureCount', 'tripCursor', 'catEvo']) if (n(l[k]) < n(b[k])) return false;
  const found = arr(l.treasuresFound);
  if (arr(b.treasuresFound).some(t => !found.includes(t))) return false;
  const logIds = new Set(arr(l.expeditionLog).map(idOf));
  if (arr(b.expeditionLog).some(e => idOf(e) !== undefined && !logIds.has(idOf(e)))) return false;
  if (s(l.lastDate) === s(b.lastDate)) {
    const done = new Set(arr(l.quests).filter(isDone).map(q => String(idOf(q))));
    if (arr(b.quests).some(q => isDone(q) && !done.has(String(idOf(q))))) return false;
  }
  return true;
}

/** One cloud write per card at a time: a later save waits for the one in flight (verifier F3). */
const writeChains = new Map<string, Promise<unknown>>();
function serialize<T>(token: string, fn: () => Promise<T>): Promise<T> {
  const prev = writeChains.get(token) || Promise.resolve();
  const next = prev.then(fn, fn);
  writeChains.set(token, next.catch(() => undefined));
  return next;
}

/** Whether the server has profile_upsert_if; null until the first try. A
 *  "missing" answer is tried again after CAS_RETRY_MS (the migration may land). */
let casAvailable: boolean | null = null;
let casRetryAt = 0;
const CAS_RETRY_MS = 10 * 60 * 1000;

/** Result of a cloud write. 'merged': the card also holds another device's
 *  progress; `state` is what the card now holds. The caller need not take it
 *  on: its later writes are applied onto the card. */
export type CloudWrite = {
  status: 'saved' | 'merged' | 'offline' | 'frozen' | 'skipped';
  state?: GameState;
  /** True when what was written differs from what the caller asked to write. */
  changed?: boolean;
};

/** Only a confirmed "no such function" answer, never a permission or other error (Astra CAS-06). */
function missingFunction(error: unknown): boolean {
  const e = (error || {}) as { code?: string };
  return e.code === 'PGRST202' || e.code === '42883';
}

async function writeCard(token: string, state: GameState): Promise<CloudWrite> {
  if (writesFrozen) return { status: 'frozen' };
  if (casAvailable === false && Date.now() >= casRetryAt) casAvailable = null;
  const s = getSync(token);
  const id = newWriteId();
  if (casAvailable !== false) {
    let pending = s.inflight; // an earlier write whose answer never came
    let base = s.base;
    let toWrite = compose(base, state, s.server, id);
    let missing = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      s.inflight = { id, submitted: state };
      persistSync(token, s);
      let res: { data?: unknown; error?: unknown };
      try {
        res = await supabase.rpc('profile_upsert_if', {
          p_token: token,
          p_state: toWrite as unknown as Record<string, unknown>,
          p_expected_rev: s.rev,
        }) as { data?: unknown; error?: unknown };
      } catch {
        return { status: 'offline' }; // may have landed: inflight stays
      }
      if (res?.error) {
        // An error answer means nothing was written.
        s.inflight = pending;
        persistSync(token, s);
        if (missingFunction(res.error)) { missing = true; break; }
        return { status: 'offline' };
      }
      casAvailable = true;
      const d = (res?.data || {}) as { ok?: boolean; rev?: number | null; state?: GameState | null };
      if (d.ok) {
        s.rev = typeof d.rev === 'number' ? d.rev : null;
        s.server = toWrite;
        s.base = state;
        s.inflight = null;
        persistSync(token, s);
        const changed = !sameContent(toWrite, state);
        return { status: changed ? 'merged' : 'saved', state: toWrite, changed };
      }
      // The card moved on: another device wrote, or an earlier write of ours
      // landed without its answer (verifier F4). Apply our changes onto it.
      const remote = (d.state as GameState) || null;
      if (pending && remote && writeIdsOf(remote).includes(pending.id)) base = pending.submitted;
      pending = null;
      s.rev = remote && typeof d.rev === 'number' ? d.rev : null;
      s.server = remote;
      s.base = base;
      s.inflight = null;
      persistSync(token, s);
      if (writesFrozen) return { status: 'frozen' };
      toWrite = compose(base, state, remote, id);
    }
    if (!missing) return { status: 'offline' }; // three races in a row: the next save tries again
    casAvailable = false;
    casRetryAt = Date.now() + CAS_RETRY_MS;
  }
  try {
    // Old unconditional write (server without profile_upsert_if yet).
    const toWrite = compose(s.base, state, s.server, id);
    const res = await supabase.rpc('profile_upsert', {
      p_token: token,
      p_state: toWrite as unknown as Record<string, unknown>,
    }) as { data?: { rev?: number } | null; error?: unknown };
    if (res?.error) return { status: 'offline' };
    s.rev = typeof res?.data?.rev === 'number' ? res.data.rev : null;
    s.server = toWrite;
    s.base = state;
    s.inflight = null;
    persistSync(token, s);
    return { status: 'saved', state: toWrite, changed: !sameContent(toWrite, state) };
  } catch {
    // Silent fail, local IndexedDB + localStorage are the fallback
    return { status: 'offline' };
  }
}


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
      const sy = getSync(token);
      if (!data) {
        sy.rev = null;
        sy.server = null;
        return null;
      }
      const d = data as { state?: GameState; rev?: number };
      const state = (d.state as GameState) || null;
      sy.rev = typeof d.rev === 'number' ? d.rev : 0;
      sy.server = state;
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

  /**
   * Write one family's card. Compare-and-swap (profile_upsert_if): the write
   * goes through only while the card still has the revision this page last
   * saw, and it carries the caller's changes since the state this page last
   * handed out or wrote, applied onto the card (see SyncInfo). If another
   * device wrote first, the changes are applied onto its row and tried again,
   * up to three times. One write per card at a time. Falls back to the old
   * unconditional profile_upsert while the server lacks the function (tried
   * again after ten minutes). Never throws.
   */
  async cloudSaveByToken(token: string, state: GameState): Promise<CloudWrite> {
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return { status: 'skipped' };
    if (writesFrozen) return { status: 'frozen' };
    return serialize(token, () => writeCard(token, state));
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
    // What this device last synced with the card, from the previous session
    // (read before anything in this load replaces it).
    const persisted = readPersistedSync(token);
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
      // Only a read that really found no row may clear the other card's
      // cache; a failed read keeps it (verifier H, Finch pass).
      if (!cloud && this.cloudReadOk(token)) await this.clear();
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
      // Finch pass (verifier C): with egg first, a local state can be hatched
      // and even through the parent step while the card already holds a
      // dragon. An unfinished local state never beats an onboarded card.
      const localUnfinished = !(local as any).onboardingDone;
      const cloudOnboarded = !!(cloud as any).onboardingDone;
      if ((localPristine && cloudFurther) || (localUnfinished && cloudOnboarded)) {
        handOut(token, cloud);
        this.save(cloud);
        return cloud;
      }
      // Compare-and-swap cold start (Astra CAS-05): this device knows what it
      // last synced with the card. Its local changes since then are applied
      // onto the card, whatever other devices did meanwhile.
      if (persisted?.base) {
        let base = persisted.base;
        // A write whose answer never came back: if the card holds it, it landed.
        if (persisted.inflight && writeIdsOf(cloud).includes(persisted.inflight.id)) base = persisted.inflight.submitted;
        handOut(token, cloud);
        if (descendsFrom(base, local)) {
          const merged = mergeStates(base as unknown as Record<string, unknown>, local as unknown as Record<string, unknown>, cloud as unknown as Record<string, unknown>) as unknown as GameState;
          if (sameContent(merged, cloud)) { this.save(cloud); return cloud; }
          await this.cloudSaveByToken(token, merged);
          await this.save(merged);
          return merged;
        }
        // The local copy is behind what this device last synced (its last
        // save never finished): everything it knew is on the card already.
        this.save(cloud);
        return cloud;
      }
      handOut(token, cloud);
      const cloudDate = (cloud as any).lastDate || '';
      const localDate = (local as any).lastDate || '';
      if (localDate > cloudDate) {
        // Local is newer (this device played most recently). Push to
        // cloud (compare-and-swap: a race with another device merges on
        // the card; this page's later writes are applied onto it).
        await this.cloudSaveByToken(token, local);
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
      if (this.cloudReadOk(token)) await this.cloudSaveByToken(token, local);
      return local;
    }

    if (cloud && !local) {
      // New device that received the token via shared URL, pull
      // cloud state down + cache locally.
      handOut(token, cloud);
      this.save(cloud);
      return cloud;
    }

    return null; // Brand-new token with no state anywhere
  },
};

export default storage;
