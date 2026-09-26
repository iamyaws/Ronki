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
 * 26 Sep 2026, reworked after review rounds 1 and 2):
 *   rev       the row's revision as last read or written (null = no row)
 *   server    the row's content at that revision
 *   base      the last state this page handed to its caller or wrote for it.
 *             The card always contains base, and every state the caller
 *             writes later grew from it. So a write sends
 *             mergeStates(base, state, card): the caller's changes since base,
 *             applied onto the card. A caller that never takes on another
 *             device's progress can still never overwrite it.
 *   inflights writes whose answer never came back: any of them may have
 *             landed. The card's short list of write ids (syncWrites) tells.
 * base and inflights travel inside the local copy itself (see LocalSync and
 * save()), written together with the state in one go. Whatever copy a cold
 * start finds, its content grew from the base stored with it, so the next
 * load can apply that copy's own changes onto the card.
 */
/** A write whose answer never came, the state it carried, and the revision it expected. */
type Inflight = { id: string; submitted: GameState; expectedRev: number | null; sentAt?: number; sentPerf?: number; page?: string };
type SyncInfo = { rev: number | null; server: GameState | null; base: GameState | null; inflights: Inflight[] };
/** The sync bookkeeping saved inside the local copy. */
type LocalSync = { token: string; base: GameState | null; inflights: Inflight[]; savedAt: number };
const sync = new Map<string, SyncInfo>();
/** How many recent write ids a card keeps (to spot a write whose answer got lost). */
const WRITE_IDS_KEPT = 20;
const INFLIGHTS_KEPT = 5;
/** A write with no answer after this long counts as "may have landed" and frees the queue. */
const WRITE_TIMEOUT_MS = 15_000;
/** A write not on the card this long after it was sent will not land any more (verifier R5-1). */
const LANDS_WITHIN_MS = 4 * WRITE_TIMEOUT_MS;
/** This page, so an unanswered write sent from it can be aged on the monotonic clock. */
const PAGE_ID = Math.random().toString(36).slice(2, 12);
const perfNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());
/** How long ago an unanswered write went out: on this page by the monotonic
 *  clock (a clock set forward cannot age it early), across a restart by the
 *  wall clock (verifier R6-2). */
function ageOf(f: Inflight): number {
  if (f.page === PAGE_ID && typeof f.sentPerf === 'number') return perfNow() - f.sentPerf;
  return Date.now() - (f.sentAt ?? 0);
}
/** Could this unanswered write still land on a card at cardRev? A negative age
 *  (the clock was set back) counts as expired, never as "just sent" (R6-3). */
const mayStillLand = (f: Inflight, cardRev: number | null) => {
  const age = ageOf(f);
  return f.expectedRev === cardRev && age >= 0 && age < LANDS_WITHIN_MS;
};
const LOCAL_SYNC_KEY = '__sync';

function getSync(token: string): SyncInfo {
  let s = sync.get(token);
  if (!s) { s = { rev: null, server: null, base: null, inflights: [] }; sync.set(token, s); }
  return s;
}

/** Order of this page's saves and captured writes: a later number is a newer state. */
let seq = 0;
/** The state this page last saved locally, and its number. */
let lastSaved: { state: GameState; seq: number } | null = null;

/** A state without the local-only bookkeeping. */
function stripLocal<T>(state: T): T {
  if (!state || typeof state !== 'object' || !(LOCAL_SYNC_KEY in (state as object))) return state;
  const { [LOCAL_SYNC_KEY]: _ignored, ...rest } = state as Record<string, unknown>;
  return rest as T;
}

function localSyncFor(token: string | null): LocalSync | null {
  if (!token) return null;
  const s = sync.get(token);
  if (!s || (!s.base && !s.inflights.length)) return null;
  // Strictly increasing on this page, so two saves in one millisecond never tie.
  lastStamp = Math.max(Date.now(), lastStamp + 1);
  return { token, base: s.base, inflights: s.inflights, savedAt: lastStamp };
}
let lastStamp = 0;
/** IndexedDB writes commit in the order they were made. */
let idbChain: Promise<unknown> = Promise.resolve();

/** Write the local copy (localStorage mirror first, then IndexedDB) with the
 *  bookkeeping of the card that owns this device's cache. */
async function writeLocal(state: GameState): Promise<void> {
  const bookkeeping = localSyncFor(getLocalProfileOwner());
  const blob = (bookkeeping ? { ...state, [LOCAL_SYNC_KEY]: bookkeeping } : state) as GameState;
  try {
    // Synchronous localStorage write first, guaranteed-persisted
    // before save() returns even if IDB later fails.
    localStorage.setItem(LS_KEY, JSON.stringify(blob));
  } catch { /* storage full or quota exceeded, IDB still tried below */ }
  const write = idbChain.then(async () => {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      tx.objectStore(STORE).put(blob, KEY);
    });
  });
  idbChain = write.catch(() => undefined);
  try {
    await write;
  } catch {
    // IDB unavailable / blocked. localStorage is the fallback,
    // already written above.
  }
}

/**
 * The card's bookkeeping changed: write it down with a local copy that
 * contains everything it refers to, the newer of the last saved state and
 * the state just sent.
 */
function resaveSync(token: string, sent: { state: GameState; seq: number }): void {
  if (writesFrozen || getLocalProfileOwner() !== token) return;
  if (!lastSaved || lastSaved.seq < sent.seq) lastSaved = { state: sent.state, seq: sent.seq };
  void writeLocal(lastSaved.state);
}

function newWriteId(): string {
  try { return crypto.randomUUID().replace(/-/g, '').slice(0, 12); } catch { return Math.random().toString(36).slice(2, 14); }
}

function writeIdsOf(state: unknown): string[] {
  const w = (state as { syncWrites?: unknown } | null)?.syncWrites;
  return Array.isArray(w) ? w.filter((x): x is string => typeof x === 'string') : [];
}

const asObj = (s: GameState | null) => s as unknown as Record<string, unknown> | null;
const merge3 = (base: GameState | null, local: GameState, card: GameState) =>
  mergeStates(asObj(base), asObj(local)!, asObj(card)!) as unknown as GameState;

/** The caller's changes since base, applied onto the card, stamped with this write's id. */
function compose(base: GameState | null, state: GameState, server: GameState | null, id: string): GameState {
  const merged = server ? merge3(base, state, server) : state;
  const ids = [...writeIdsOf(merged).filter(x => x !== id), id].slice(-WRITE_IDS_KEPT);
  return { ...merged, syncWrites: ids } as GameState;
}

/**
 * The card moved on while this page wrote. If it holds one of this page's
 * unanswered writes, that write landed: its state is the new base. If the
 * card's id list is full and none is found, nobody can tell: merge without
 * a base (never counts anything twice).
 */
function resolveBase(s: SyncInfo, base: GameState | null, card: GameState | null, cardRev: number | null): GameState | null {
  return baseAfter(s.inflights, base, card, cardRev);
}

/**
 * Given this device's unanswered writes and the card as it is now: the base
 * for this device's changes. A write on the card landed: its state is the
 * base. A write not on the card did not land if the card is at most
 * WRITE_IDS_KEPT writes past the revision it expected (had it landed, its id
 * would still be in the card's list); otherwise nobody can tell and the
 * merge runs without a base (verifier R3-1).
 */
function baseAfter(inflights: Inflight[], base: GameState | null, card: GameState | null, cardRev: number | null): GameState | null {
  const ids = writeIdsOf(card);
  for (let i = inflights.length - 1; i >= 0; i--) if (ids.includes(inflights[i].id)) return inflights[i].submitted;
  const rev = cardRev ?? 0;
  if (inflights.some(f => rev - (f.expectedRev ?? 0) > WRITE_IDS_KEPT)) return null;
  return base;
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

/** One cloud write per card at a time: a later save waits for the one in flight (verifier F3). */
const writeChains = new Map<string, Promise<unknown>>();
function serialize<T>(token: string, fn: () => Promise<T>): Promise<T> {
  const prev = writeChains.get(token) || Promise.resolve();
  const next = prev.then(fn, fn);
  writeChains.set(token, next.catch(() => undefined));
  return next;
}

/** Resolves like the call, or rejects after ms (the request may still land). */
function withTimeout<T>(p: PromiseLike<T>, ms: number, onTimeout?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => { try { onTimeout?.(); } catch { /* ignore */ } reject(new Error('timeout')); }, ms);
    Promise.resolve(p).then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); });
  });
}

/** An RPC that is cancelled, not just given up on, after WRITE_TIMEOUT_MS: a
 *  stuck upload cannot land a minute later (verifier R6-1). */
function rpcTimed<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let call = supabase.rpc(fn, args) as unknown as { abortSignal?: (s: AbortSignal) => unknown } & PromiseLike<T>;
  if (ctrl && typeof call.abortSignal === 'function') call = call.abortSignal(ctrl.signal) as typeof call;
  return withTimeout(call, WRITE_TIMEOUT_MS, () => ctrl?.abort());
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

/** An error answer from PostgREST or Postgres (it has a code): nothing was
 *  written. A network failure comes back from supabase-js as an error with an
 *  empty code (status 0), and the write may have landed (verifier R2-1). */
function definitelyNotWritten(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' && code.length > 0;
}

async function writeCard(token: string, sent: { state: GameState; seq: number }): Promise<CloudWrite> {
  if (writesFrozen) return { status: 'frozen' };
  if (casAvailable === false && Date.now() >= casRetryAt) casAvailable = null;
  const state = sent.state;
  const s = getSync(token);
  const id = newWriteId();
  if (casAvailable !== false && s.inflights.length) {
    // An earlier write never got its answer: read the card and settle it by
    // its id before writing again (verifier R4-1). Offline, the read fails and
    // nothing new goes out, so unanswered writes never pile up and one that
    // may have landed is never dropped.
    let res: { data?: unknown; error?: unknown };
    try {
      res = await rpcTimed<{ data?: unknown; error?: unknown }>('profile_get', { p_token: token });
    } catch {
      return { status: 'offline' };
    }
    if (res?.error) return { status: 'offline' };
    if (writesFrozen) return { status: 'frozen' };
    const d = res?.data as { state?: GameState; rev?: number } | null;
    const card = (d?.state as GameState) || null;
    const cardRev = d ? (typeof d.rev === 'number' ? d.rev : 0) : null;
    const landed = s.inflights.some(f => writeIdsOf(card).includes(f.id));
    s.base = baseAfter(s.inflights, s.base, card, cardRev);
    // Kept only while it could still land: nothing of ours is on the card, the
    // card is still at the revision it expected, and it went out less than a
    // minute ago. So writes the server keeps refusing without a code (a
    // gateway error, a timeout) never wedge the queue (verifier R5-1).
    s.inflights = landed ? [] : s.inflights.filter(f => mayStillLand(f, cardRev));
    s.rev = cardRev;
    s.server = card;
    resaveSync(token, sent);
  }
  if (casAvailable !== false && s.inflights.length >= INFLIGHTS_KEPT) return { status: 'offline' }; // never drop one that may land
  if (casAvailable !== false) {
    let base = s.base;
    let toWrite = compose(base, state, s.server, id);
    let missing = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      s.inflights = [...s.inflights.filter(f => f.id !== id), { id, submitted: state, expectedRev: s.rev, sentAt: Date.now(), sentPerf: perfNow(), page: PAGE_ID }];
      resaveSync(token, sent);
      let res: { data?: unknown; error?: unknown };
      try {
        res = await rpcTimed<{ data?: unknown; error?: unknown }>('profile_upsert_if', {
          p_token: token,
          p_state: toWrite as unknown as Record<string, unknown>,
          p_expected_rev: s.rev,
        });
      } catch {
        return { status: 'offline' }; // may have landed: stays in inflights
      }
      if (res?.error) {
        if (!definitelyNotWritten(res.error)) return { status: 'offline' }; // may have landed
        s.inflights = s.inflights.filter(f => f.id !== id);
        resaveSync(token, sent);
        if (missingFunction(res.error)) { missing = true; break; }
        return { status: 'offline' };
      }
      casAvailable = true;
      const d = (res?.data || {}) as { ok?: boolean; rev?: number | null; state?: GameState | null };
      if (d.ok) {
        // Earlier unanswered writes carried the same expected rev: none of them landed.
        s.rev = typeof d.rev === 'number' ? d.rev : null;
        s.server = toWrite;
        s.base = state;
        s.inflights = [];
        resaveSync(token, sent);
        const changed = !sameContent(toWrite, state);
        return { status: changed ? 'merged' : 'saved', state: toWrite, changed };
      }
      // The card moved on: another device wrote, or an earlier write of ours
      // landed without its answer (verifier F4). Apply our changes onto it.
      s.inflights = s.inflights.filter(f => f.id !== id);
      const remote = (d.state as GameState) || null;
      const remoteRev = remote && typeof d.rev === 'number' ? d.rev : null;
      base = resolveBase(s, base, remote, remoteRev);
      // The card moved past the revision they expected: none of them can land any more.
      s.inflights = [];
      s.rev = remoteRev;
      s.server = remote;
      s.base = base;
      resaveSync(token, sent);
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
    const res = await rpcTimed<{ data?: { rev?: number } | null; error?: unknown }>('profile_upsert', {
      p_token: token,
      p_state: toWrite as unknown as Record<string, unknown>,
    });
    if (res?.error) return { status: 'offline' };
    s.rev = typeof res?.data?.rev === 'number' ? res.data.rev : null;
    s.server = toWrite;
    s.base = state;
    s.inflights = [];
    resaveSync(token, sent);
    return { status: 'saved', state: toWrite, changed: !sameContent(toWrite, state) };
  } catch {
    // Silent fail, local IndexedDB + localStorage are the fallback
    return { status: 'offline' };
  }
}


/** Read the local copy: the newer of IndexedDB and the localStorage mirror
 *  (both carry the time of their save in the bookkeeping; without it,
 *  IndexedDB first as before, review round 2 R2-2), plus its bookkeeping. */
async function loadWithSync(): Promise<{ state: GameState | null; bookkeeping: LocalSync | null }> {
  // Apr 2026 fix: prefer IndexedDB, but treat localStorage as a
  // continuous fallback (NOT a one-shot migration that wipes itself).
  // Previous behaviour deleted the localStorage entry on first load
  // after migrating it to IDB, which meant if a later save's IDB
  // transaction failed to commit before tab-close (a real bug, see
  // save() comments), there was nothing to fall back on. Result for
  // Marc 27 Apr: Louis re-picks the egg every session.
  let fromLs: GameState | null = null;
  try {
    const ls = localStorage.getItem(LS_KEY);
    fromLs = ls ? (JSON.parse(ls) as GameState) : null;
  } catch { fromLs = null; }
  let fromIdb: GameState | null = null;
  try {
    const db = await openDB();
    fromIdb = await new Promise<GameState | null>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as GameState) || null);
      req.onerror = () => resolve(null);
    });
  } catch { fromIdb = null; }
  const savedAt = (x: GameState | null) => {
    const b = x ? (x as unknown as Record<string, unknown>)[LOCAL_SYNC_KEY] as LocalSync | undefined : undefined;
    return b && typeof b.savedAt === 'number' ? b.savedAt : -1;
  };
  const pick = fromIdb && fromLs ? (savedAt(fromLs) > savedAt(fromIdb) ? fromLs : fromIdb) : (fromIdb || fromLs);
  const raw = pick ? (pick as unknown as Record<string, unknown>)[LOCAL_SYNC_KEY] : null;
  const bookkeeping = raw && typeof raw === 'object' && typeof (raw as LocalSync).token === 'string'
    ? { ...(raw as LocalSync), inflights: Array.isArray((raw as LocalSync).inflights) ? (raw as LocalSync).inflights : [] }
    : null;
  return { state: pick ? stripLocal(pick) : null, bookkeeping };
}

/** The caller now holds `state` for this card (a load handed it out). */
function handOut(token: string, state: GameState | null): void {
  const s = getSync(token);
  s.base = state;
  s.inflights = [];
}

const storage = {
  // ── Local (IndexedDB with localStorage fallback) ──
  async load(): Promise<GameState | null> {
    return (await loadWithSync()).state;
  },

  /** Resolves once every cloud write and local IndexedDB write started so far has finished. */
  async settled(): Promise<void> {
    await Promise.all([...writeChains.values()]);
    await idbChain;
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
    //
    // Sep 2026 (compare-and-swap sync): the copy also carries the card's
    // sync bookkeeping (see writeLocal), written in the same go.
    const clean = stripLocal(state);
    lastSaved = { state: clean, seq: ++seq };
    await writeLocal(clean);
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
    const sent = { state: stripLocal(state), seq: ++seq };
    return serialize(token, () => writeCard(token, sent));
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
    const [{ state: localRaw, bookkeeping }, cloud] = await Promise.all([
      loadWithSync(),
      this.cloudLoadByToken(token),
    ]);

    // Sibling guard: the local cache belongs to the card that last loaded
    // on this device. If a different card was scanned, that cache is another
    // child's state. It must not be pushed into this card or win on date.
    // A cache without a recorded owner is treated as this card's own, which
    // keeps every existing device working after the update.
    let local = localRaw;
    // This device's bookkeeping for the card goes back into memory first, so
    // saves keep carrying it even when the read fails (verifier R3-2).
    const mine = bookkeeping && bookkeeping.token === token && bookkeeping.base ? bookkeeping : null;
    if (mine) {
      const sy = getSync(token);
      sy.base = mine.base;
      sy.inflights = mine.inflights.map(f => ({ ...f, expectedRev: typeof f.expectedRev === 'number' ? f.expectedRev : null }));
    }
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
        await this.save(cloud);
        return cloud;
      }
      // Compare-and-swap cold start (review rounds 1 and 2, CAS-05). The
      // local copy carries the base it grew from: its changes since then are
      // applied onto the card, whatever other devices did meanwhile. A write
      // of the previous page that is on the card already is part of the base;
      // one that is not may still land, so it is kept, restated onto this
      // card, for the next write to recognise.
      let base: GameState | null = null;
      let stillOut: Inflight[] = [];
      if (mine) {
        const cardRev = getSync(token).rev;
        const inflights = getSync(token).inflights;
        base = baseAfter(inflights, mine.base, cloud, cardRev);
        const ids = writeIdsOf(cloud);
        // A write still out can land only while the card is at the revision it expected.
        if (base === mine.base && !inflights.some(f => ids.includes(f.id))) {
          stillOut = inflights
            .filter(f => f.expectedRev !== null && mayStillLand(f, cardRev))
            .map(f => ({ id: f.id, submitted: merge3(mine.base, f.submitted, cloud), expectedRev: f.expectedRev, sentAt: f.sentAt }));
        }
      }
      // Without a base (the first start after this update, or no way to
      // tell): keep everything the card has and add what only the local
      // copy has; nothing is counted twice and nothing the card has goes back.
      const merged = merge3(base, local, cloud);
      handOut(token, cloud);
      getSync(token).inflights = stillOut;
      if (sameContent(merged, cloud)) {
        await this.save(cloud);
        return cloud;
      }
      await this.save(merged);
      await this.cloudSaveByToken(token, merged);
      return merged;
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
      await this.save(cloud);
      return cloud;
    }

    return null; // Brand-new token with no state anywhere
  },
};

export default storage;
