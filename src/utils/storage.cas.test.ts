// Compare-and-swap sync, two devices against one fake card server (review
// round 1, 26 Sep 2026). The fake follows the same contract as the SQL in
// supabase/migrations/20260926000100_profiles_cas.sql and the mock server
// (checked identical against real Postgres). Harness adapted from the
// adversarial verifier's experiments. Each device is a fresh copy of the
// storage module; they share the browser's localStorage, so every test
// loads its devices first and only then plays.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type Row = { state: any; rev: number };
const server = { rows: new Map<string, Row>() };
const clone = (x: any) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
function handle(fn: string, a: any) {
  const row = server.rows.get(a.p_token) || null;
  if (fn === 'profile_get') return { data: row ? { state: clone(row.state), rev: row.rev, updated_at: 'x' } : null, error: null };
  if (fn === 'profile_upsert') {
    const rev = row ? row.rev + 1 : 1;
    server.rows.set(a.p_token, { state: clone(a.p_state), rev });
    return { data: { rev, updated_at: 'x' }, error: null };
  }
  if (fn === 'profile_upsert_if') {
    const expected = a.p_expected_rev ?? null;
    const ok = expected === null ? row === null : row !== null && row.rev === Number(expected);
    if (ok) {
      const rev = row ? row.rev + 1 : 1;
      server.rows.set(a.p_token, { state: clone(a.p_state), rev });
      return { data: { ok: true, rev, updated_at: 'x' }, error: null };
    }
    if (!row) return { data: { ok: false, rev: null, state: null }, error: null };
    return { data: { ok: false, rev: row.rev, state: clone(row.state) }, error: null };
  }
  return { data: null, error: { message: 'unknown ' + fn } };
}
let hook: null | ((fn: string, a: any, run: () => any) => Promise<any>) = null;
const calls: string[] = [];
(globalThis as any).__casRpc = async (fn: string, a: any) => {
  calls.push(fn);
  const run = () => handle(fn, clone(a));
  return hook ? hook(fn, a, run) : run();
};
vi.mock('../lib/supabase', () => ({ supabase: { rpc: (fn: string, a: any) => (globalThis as any).__casRpc(fn, a) } }));

/** A fresh copy of the storage module = one device. */
async function device() {
  vi.resetModules();
  return (await import('./storage')).default as any;
}
/** Load the card on a device as the app does (a fresh device: no local copy). */
async function load(dev: any, token: string) {
  localStorage.removeItem('hdx2_drachennest');
  localStorage.removeItem(`ronki_sync_${token}`);
  return dev.syncLoadByToken(token);
}

const D = '2026-09-28';
const q = (id: string, done = false, xp = 10, extra: object = {}) => ({ id, anchor: 'morning', xp, done, completions: done ? 1 : 0, ...extra });
const S0 = (): any => ({
  lastDate: D, onboardingDone: true, parentOnboardingDone: true, companionName: 'Knisti',
  hp: 10, xp: 10, totalTasksDone: 5,
  totalQuestCompletions: { s_wake: 3, s_breakfast: 2 },
  quests: [q('s_wake'), q('s_breakfast', false, 5), q('sq_geschirr', false, 10, { target: 2, sideQuest: true })],
  treasuresFound: ['t01'], adventureCount: 1, tripCursor: 1, catEvo: 2,
  expedition: { state: 'home', biome: 'morgenwald' },
  expeditionLog: [{ id: 'm1', ts: '2026-09-26T07:00:00.000Z' }],
});
/** What complete(id) does to the fields the merge cares about. */
function tick(s: any, id: string) {
  const quest = s.quests.find((x: any) => x.id === id);
  const completions = (quest.completions || 0) + 1;
  const done = completions >= (quest.target || 1);
  return {
    ...s,
    quests: s.quests.map((x: any) => (x.id === id ? { ...x, completions, done } : x)),
    hp: s.hp + quest.xp, xp: s.xp + quest.xp, totalTasksDone: s.totalTasksDone + 1,
    totalQuestCompletions: { ...s.totalQuestCompletions, [id]: (s.totalQuestCompletions[id] || 0) + 1 },
  };
}
const pet = (s: any) => ({ ...s, catPetted: true, hp: s.hp + 1 });
const feed = (s: any) => ({ ...s, catFed: true, hp: s.hp + 1 });
const reward = (s: any, n: number) => ({ ...s, hp: s.hp + n });
const card = (t: string) => server.rows.get(t)!.state;
const done = (s: any) => s.quests.filter((x: any) => x.done).map((x: any) => x.id).sort();

beforeEach(() => {
  server.rows.clear();
  hook = null;
  calls.length = 0;
  localStorage.clear();
  // No IndexedDB in jsdom: storage falls back to its localStorage mirror.
  vi.stubGlobal('indexedDB', { open: () => { throw new Error('no indexedDB in tests'); } });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('compare-and-swap: a page never has to take on a merge to stay safe', () => {
  it('a merged write the page ignores (the hide flush) is not overwritten by its next write (verifier F2, Astra CAS-01)', async () => {
    const T = 'a'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    const B = await device();
    await load(B, T);
    const SB1 = { ...tick(S0(), 's_breakfast'), treasuresFound: ['t01', 't02'], adventureCount: 2, tripCursor: 2 };
    expect((await B.cloudSaveByToken(T, SB1)).status).toBe('saved');
    const SA1 = tick(S0(), 's_wake');
    const flush = await A.cloudSaveByToken(T, SA1); // result ignored, as the hide flush does
    expect(flush.status).toBe('merged');
    await A.cloudSaveByToken(T, pet(SA1)); // the page still holds SA1 and goes on
    expect(card(T).treasuresFound).toEqual(['t01', 't02']);
    expect(done(card(T))).toEqual(['s_breakfast', 's_wake']);
    expect(card(T).hp).toBe(26);
    await B.cloudSaveByToken(T, feed(SB1));
    const fin = card(T);
    expect(fin.hp).toBe(10 + 5 + 10 + 1 + 1);
    expect(fin.xp).toBe(25);
    expect(fin.totalTasksDone).toBe(7);
    expect(fin.totalQuestCompletions).toEqual({ s_wake: 4, s_breakfast: 3 });
    expect(fin.adventureCount).toBe(2);
  });

  it('two writes from one page in flight at once go one after the other and count once (verifier F3)', async () => {
    const T = 'b'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    let release!: () => void;
    const gate = new Promise<void>(r => { release = r; });
    let first = true;
    hook = async (fn, _a, run) => {
      if (fn === 'profile_upsert_if' && first) { first = false; await gate; }
      return run();
    };
    const W1 = reward(S0(), 10);
    const W2 = tick(pet(W1), 'sq_geschirr');
    const p1 = A.cloudSaveByToken(T, W1);
    const p2 = A.cloudSaveByToken(T, W2);
    release();
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.status).toBe('saved');
    expect(r2.status).toBe('saved');
    expect(card(T).hp).toBe(31);
    expect(card(T).totalTasksDone).toBe(6);
  });

  it('a write that landed without its answer is not counted twice (verifier F4)', async () => {
    const T = 'c'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    hook = async (fn, _a, run) => {
      if (fn === 'profile_upsert_if') { hook = null; run(); throw new Error('network gone after the write'); }
      return run();
    };
    const W1 = reward(S0(), 10);
    expect((await A.cloudSaveByToken(T, W1)).status).toBe('offline');
    expect(card(T).hp).toBe(20); // it landed
    await A.cloudSaveByToken(T, pet(W1));
    expect(card(T).hp).toBe(21);
  });

  it('a lost answer is still recognised after another device wrote on top of it', async () => {
    const T = 'd'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    const B = await device();
    await load(B, T);
    hook = async (fn, _a, run) => {
      if (fn === 'profile_upsert_if') { hook = null; run(); throw new Error('network gone after the write'); }
      return run();
    };
    const W1 = reward(S0(), 10);
    await A.cloudSaveByToken(T, W1);
    await B.cloudSaveByToken(T, tick(S0(), 's_breakfast'));
    await A.cloudSaveByToken(T, pet(W1));
    expect(card(T).hp).toBe(10 + 10 + 5 + 1);
    expect(done(card(T))).toEqual(['s_breakfast']);
  });
});

describe('compare-and-swap: answers that never come (review round 2)', () => {
  it('a network failure as supabase-js reports it (an error with an empty code) may have landed (verifier R2-1, Astra CAS-09)', async () => {
    const T = '3'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    hook = async (fn, _a, run) => {
      if (fn === 'profile_upsert_if') { hook = null; run(); return { data: null, error: { message: 'TypeError: Failed to fetch', code: '' }, status: 0 }; }
      return run();
    };
    const W1 = reward(S0(), 10);
    expect((await A.cloudSaveByToken(T, W1)).status).toBe('offline');
    await A.cloudSaveByToken(T, pet(W1));
    expect(card(T).hp).toBe(21);
  });

  it('a second unanswered write does not make the first one forgotten (verifier R2-5)', async () => {
    const T = '4'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    let n = 0;
    hook = async (fn, _a, run) => {
      if (fn !== 'profile_upsert_if') return run();
      n++;
      if (n === 1) { run(); throw new Error('landed, answer lost'); }
      if (n === 2) throw new Error('never sent');
      return run();
    };
    const W1 = reward(S0(), 10);
    const W2 = pet(W1);
    await A.cloudSaveByToken(T, W1);
    await A.cloudSaveByToken(T, W2);
    await A.cloudSaveByToken(T, feed(W2));
    expect(card(T).hp).toBe(22);
  });

  it('a write that landed as the wifi dropped is never forgotten, however many offline saves follow (verifier R4-1)', async () => {
    const T = 'ba'.repeat(16);
    server.rows.set(T, { state: { ...S0(), hp: 50 }, rev: 1 });
    const A = await device();
    let S = await load(A, T);
    let reachable = true;
    let loseNextAnswer = true;
    hook = async (fn, _a, run) => {
      if (!reachable) return { data: null, error: { message: 'TypeError: Failed to fetch', code: '' }, status: 0 };
      if (fn === 'profile_upsert_if' && loseNextAnswer) { loseNextAnswer = false; run(); reachable = false; return { data: null, error: { message: 'TypeError: Failed to fetch', code: '' }, status: 0 }; }
      return run();
    };
    S = reward(S, 10);
    await A.save(S);
    await A.cloudSaveByToken(T, S); // landed, answer lost, then the wifi is gone
    for (let i = 0; i < 12; i++) { S = reward(S, 1); await A.save(S); await A.cloudSaveByToken(T, S); }
    reachable = true;
    await A.cloudSaveByToken(T, S);
    expect(card(T).hp).toBe(50 + 10 + 12);
    // and the same after a restart instead of a live save
    const T2 = 'bb'.repeat(16);
    server.rows.set(T2, { state: { ...S0(), hp: 50 }, rev: 1 });
    const B = await device();
    let S2 = await load(B, T2);
    reachable = true; loseNextAnswer = true;
    S2 = reward(S2, 10);
    await B.save(S2);
    await B.cloudSaveByToken(T2, S2);
    for (let i = 0; i < 12; i++) { S2 = reward(S2, 1); await B.save(S2); await B.cloudSaveByToken(T2, S2); }
    reachable = true;
    const B2 = await device();
    const got = await B2.syncLoadByToken(T2);
    expect(got.hp).toBe(72);
    expect(card(T2).hp).toBe(72);
  });

  it('writes the gateway keeps refusing without a code never stop the sync for good (verifier R5-1)', async () => {
    let now = Date.parse('2026-09-28T07:00:00Z');
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const gateway = { down: true };
    hook = async (fn, _a, run) => (fn === 'profile_upsert_if' && gateway.down
      ? { data: null, error: { message: '<html>504 Gateway Time-out</html>' }, status: 504 } // not written, no code
      : run());
    for (const restart of [false, true]) {
      const T = restart ? 'bd'.repeat(16) : 'bc'.repeat(16);
      server.rows.set(T, { state: { ...S0(), hp: 50 }, rev: 1 });
      gateway.down = true;
      const A = await device();
      let S = await load(A, T);
      for (let i = 0; i < 12; i++) {
        S = reward(S, 1);
        await A.save(S);
        await A.cloudSaveByToken(T, S);
        now += 1_500;
      }
      expect(card(T).hp).toBe(50);
      gateway.down = false;
      now += 61_000; // a minute later the gateway is back
      if (restart) {
        const A2 = await device();
        const got = await A2.syncLoadByToken(T);
        expect(got.hp).toBe(62);
      } else {
        S = reward(S, 1);
        await A.save(S);
        expect((await A.cloudSaveByToken(T, S)).status).toBe('saved');
      }
      expect(card(T).hp).toBe(restart ? 62 : 63);
    }
  });

  it('a request that never answers frees the queue after the timeout (verifier R2-4)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const T = '5'.repeat(32);
      server.rows.set(T, { state: S0(), rev: 1 });
      const A = await device();
      await load(A, T);
      let first = true;
      hook = async (fn, _a, run) => {
        if (fn === 'profile_upsert_if' && first) { first = false; return new Promise(() => {}); }
        return run();
      };
      const W1 = reward(S0(), 10);
      const p1 = A.cloudSaveByToken(T, W1);
      const p2 = A.cloudSaveByToken(T, pet(W1));
      await vi.advanceTimersByTimeAsync(15_000);
      expect((await p1).status).toBe('offline');
      expect((await p2).status).toBe('saved');
      expect(card(T).hp).toBe(21);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a write of the previous page that lands after the restart is not counted twice (verifier R2-3)', async () => {
    const T = '6'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    let held: null | (() => void) = null;
    let firstWrite = true;
    hook = async (fn, _a, run) => {
      if (fn !== 'profile_upsert_if') return run();
      if (firstWrite) { firstWrite = false; return new Promise(res => { held = () => res(run()); }); }
      if (held) { held(); held = null; } // the old page's write reaches the server first
      return run();
    };
    const W1 = reward(S0(), 10);
    await A.save(W1);
    void A.cloudSaveByToken(T, W1); // still out when the page closes
    await Promise.resolve();
    const A2 = await device(); // the app starts again
    const got = await A2.syncLoadByToken(T);
    expect(got.hp).toBe(20);
    expect(card(T).hp).toBe(20);
  });
});

describe('compare-and-swap: a card whose id list is full (verifier R3-1)', () => {
  const full = () => Array.from({ length: 20 }, (_, i) => `old${i}`);
  it('an offline write that never reached the card keeps the base at the next start (M1)', async () => {
    const T = 'cd'.repeat(16);
    server.rows.set(T, { state: { ...S0(), syncWrites: full() }, rev: 30 });
    const A = await device();
    const S = await A.syncLoadByToken(T);
    const online = tick(S, 's_wake');
    await A.save(online);
    await A.cloudSaveByToken(T, online); // lands
    hook = async (fn, _a, run) => (fn === 'profile_upsert_if'
      ? { data: null, error: { message: 'TypeError: Failed to fetch', code: '' }, status: 0 } // never reached the card
      : run());
    const offline = tick(online, 's_breakfast');
    await A.save(offline);
    await A.cloudSaveByToken(T, offline);
    hook = null;
    const A2 = await device();
    const got = await A2.syncLoadByToken(T);
    expect(got.hp).toBe(10 + 10 + 5);
    expect(card(T).hp).toBe(25);
    expect(card(T).totalTasksDone).toBe(7);
  });

  it('an offline write, then another device, then this device again: nothing lost (M2)', async () => {
    const T = 'ef'.repeat(16);
    server.rows.set(T, { state: { ...S0(), hp: 50, syncWrites: full() }, rev: 30 });
    const A = await device();
    const S = await A.syncLoadByToken(T);
    hook = async (fn, _a, run) => (fn === 'profile_upsert_if'
      ? { data: null, error: { message: 'TypeError: Failed to fetch', code: '' }, status: 0 }
      : run());
    const W1 = reward(S, 15);
    await A.cloudSaveByToken(T, W1); // never reached the card
    hook = null;
    const B = await device();
    await load(B, T); // a separate device: no local copy of its own yet
    await B.cloudSaveByToken(T, pet({ ...S0(), hp: 50, syncWrites: full() })); // the other device: +1
    await A.cloudSaveByToken(T, W1);
    expect(card(T).hp).toBe(50 + 15 + 1);
  });
});

describe('compare-and-swap: two tabs and failed local saves (review round 2)', () => {
  it('two tabs on one device behave like two devices (Astra CAS-08)', async () => {
    const T = '7'.repeat(32);
    server.rows.set(T, { state: { ...S0(), hp: 50 }, rev: 1 });
    const tab1 = await device();
    await load(tab1, T);
    const tab2 = await device();
    await tab2.syncLoadByToken(T); // same localStorage, same card
    await tab1.cloudSaveByToken(T, { ...S0(), hp: 30 }); // a parent redeems 20
    hook = async fn => { if (fn === 'profile_upsert_if') throw new Error('offline'); return { data: null, error: null }; };
    const petted = pet({ ...S0(), hp: 50 });
    await tab2.save(petted); // the child pets Ronki in the other tab, offline
    await tab2.cloudSaveByToken(T, petted);
    hook = null;
    const again = await device();
    const got = await again.syncLoadByToken(T);
    expect(got.hp).toBe(31);
    expect(card(T).hp).toBe(31);
    expect(got.catPetted).toBe(true);
  });

  it("a tab whose read failed keeps its bookkeeping: its pet and the other tab's spend both count (verifier N7, R3-2)", async () => {
    const T = '9'.repeat(32);
    server.rows.set(T, { state: { ...S0(), hp: 50 }, rev: 1 });
    const tab1 = await device();
    await load(tab1, T); // the local copy now carries this device's bookkeeping
    hook = async (fn, _a, run) => (fn === 'profile_get' ? { data: null, error: { message: 'network down' } } : run());
    const tab2 = await device();
    const held = await tab2.syncLoadByToken(T); // read failed: it goes on from the local copy
    hook = null;
    expect(held.hp).toBe(50);
    await tab1.cloudSaveByToken(T, { ...S0(), hp: 30 }); // a parent redeems 20 in the other tab
    await tab2.save(pet(held)); // the child pets Ronki in the tab whose read failed
    const again = await device();
    const got = await again.syncLoadByToken(T);
    expect(got.hp).toBe(31);
    expect(card(T).hp).toBe(31);
    expect(got.catPetted).toBe(true);
  });

  it('a start whose read fails keeps the bookkeeping, so the next online start is exact (verifier R3-2, M3)', async () => {
    const T = 'ab'.repeat(16);
    server.rows.set(T, { state: { ...S0(), hp: 50 }, rev: 1 });
    const tablet = await device();
    await load(tablet, T);
    // The phone earns 20 Sterne on the card.
    server.rows.set(T, { state: { ...S0(), hp: 70 }, rev: 2 });
    hook = async (fn, _a, run) => (fn === 'profile_get' ? { data: null, error: { message: 'network down' } } : run());
    const offline = await device();
    const held = await offline.syncLoadByToken(T); // the tablet starts offline
    await offline.save(tick(tick(held, 's_wake'), 's_breakfast')); // +10 +5
    hook = null;
    const online = await device();
    const got = await online.syncLoadByToken(T);
    expect(got.hp).toBe(70 + 10 + 5);
    expect(card(T).hp).toBe(85);
  });

  it('a reward written to the card before the local copy saved it is not undone (Astra CAS-05-R2)', async () => {
    const T = '8'.repeat(32);
    server.rows.set(T, { state: { ...S0(), hp: 100 }, rev: 1 });
    const A = await device();
    await load(A, T); // the local copy holds hp 100
    await A.cloudSaveByToken(T, { ...S0(), hp: 110, rewardSeen: true }); // no local save of it happened
    const A2 = await device();
    const got = await A2.syncLoadByToken(T);
    expect(got.hp).toBe(110);
    expect(got.rewardSeen).toBe(true);
    expect(card(T).hp).toBe(110);
  });

  it('when the local copy cannot be saved at all, the copy on disk and its base stay a matching pair', async () => {
    const T = '0'.repeat(32);
    server.rows.set(T, { state: { ...S0(), hp: 100 }, rev: 1 });
    const A = await device();
    await load(A, T);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    await A.cloudSaveByToken(T, { ...S0(), hp: 110, rewardSeen: true });
    setItem.mockRestore();
    const A2 = await device();
    const got = await A2.syncLoadByToken(T);
    expect(got.hp).toBe(110);
    expect(got.rewardSeen).toBe(true);
  });
});

describe('compare-and-swap: cold start (Astra CAS-05)', () => {
  it("applies this device's unsent changes onto a card another device changed meanwhile", async () => {
    const T = 'e'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    hook = async fn => { if (fn === 'profile_upsert_if') throw new Error('offline'); return { data: null, error: null }; };
    const SA1 = tick(S0(), 's_wake');
    await A.save(SA1);
    expect((await A.cloudSaveByToken(T, SA1)).status).toBe('offline');
    hook = null;
    // Meanwhile the parent phone ticks breakfast and opens a treasure.
    server.rows.set(T, { state: { ...tick(S0(), 's_breakfast'), treasuresFound: ['t01', 't02'], adventureCount: 2 }, rev: 2 });
    const A2 = await device(); // the tablet starts again
    const got = await A2.syncLoadByToken(T);
    for (const s of [got, card(T)]) {
      expect(done(s)).toEqual(['s_breakfast', 's_wake']);
      expect(s.treasuresFound).toEqual(['t01', 't02']);
      expect(s.hp).toBe(25);
      expect(s.totalTasksDone).toBe(7);
    }
  });

  it('a local copy that is behind what this device last synced does not undo progress', async () => {
    const T = 'f'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T); // local copy = S0
    await A.cloudSaveByToken(T, tick(S0(), 's_wake')); // landed; the local save of it never finished
    const A2 = await device();
    const got = await A2.syncLoadByToken(T);
    expect(done(got)).toEqual(['s_wake']);
    expect(got.hp).toBe(20);
    expect(card(T).hp).toBe(20);
  });
});

describe('compare-and-swap: the old write only when the function is really missing (Astra CAS-06)', () => {
  it('a permission error never turns into an unconditional write', async () => {
    const T = '1'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    hook = async (fn, _a, run) => (fn === 'profile_upsert_if'
      ? { data: null, error: { code: '42501', message: 'permission denied for function profile_upsert_if' } }
      : run());
    expect((await A.cloudSaveByToken(T, tick(S0(), 's_wake'))).status).toBe('offline');
    expect(calls).not.toContain('profile_upsert');
  });

  it('a missing function uses the old write, and compare-and-swap is tried again after ten minutes', async () => {
    const T = '2'.repeat(32);
    server.rows.set(T, { state: S0(), rev: 1 });
    const A = await device();
    await load(A, T);
    let now = Date.parse('2026-09-28T07:00:00Z');
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    let missing = true;
    hook = async (fn, _a, run) => (fn === 'profile_upsert_if' && missing
      ? { data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }
      : run());
    const s1 = tick(S0(), 's_wake');
    expect((await A.cloudSaveByToken(T, s1)).status).toBe('saved');
    calls.length = 0;
    await A.cloudSaveByToken(T, pet(s1));
    expect(calls).toEqual(['profile_upsert']);
    missing = false; // the migration lands
    now += 11 * 60 * 1000;
    calls.length = 0;
    await A.cloudSaveByToken(T, feed(pet(s1)));
    expect(calls).toEqual(['profile_upsert_if']);
    expect(card(T).hp).toBe(22);
  });
});
