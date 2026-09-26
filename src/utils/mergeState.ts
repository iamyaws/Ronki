/**
 * Three-way merge of two devices' saves (26 Sep 2026, compare-and-swap sync).
 *
 * When profile_upsert_if reports that another device wrote first, the app
 * holds three versions of the family's card:
 *   base   - the card as this device last read or wrote it
 *   local  - what this device wants to write now
 *   remote - what the other device wrote meanwhile
 * Per top-level field: if only one side changed it, that side wins. If both
 * changed it, a field rule decides. Ronki's progress only ever grows
 * (treasures, adventures, tasks done), so most rules keep both devices'
 * progress: union for lists, max for counters, "done on either device" for
 * today's tasks. Anything without a rule goes to this device (its change is
 * the newest action the child took here).
 *
 * base may be null (this device never read the card, e.g. a failed first
 * read): then there is no common ancestor, every difference counts as
 * "both changed", and the card's own identity (dragon name, egg, onboarding)
 * comes from the card when the card is already onboarded.
 *
 * Pure and deterministic; heavily unit-tested in mergeState.test.ts.
 */

type Json = unknown;
type Obj = Record<string, Json>;
type Ctx = { base: Obj | null; local: Obj; remote: Obj };
type Rule = (b: Json, l: Json, r: Json, ctx: Ctx) => Json;

/** Deep equality for JSON-shaped values (key order does not matter). */
export function jsonEqual(a: Json, b: Json): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    // Treat undefined and null alike: a missing field and an explicit null mean "not set".
    return (a === undefined || a === null) && (b === undefined || b === null);
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as Json[];
    if (a.length !== bb.length) return false;
    for (let i = 0; i < a.length; i++) if (!jsonEqual(a[i], bb[i])) return false;
    return true;
  }
  const ao = a as Obj;
  const bo = b as Obj;
  const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
  for (const k of keys) if (!jsonEqual(ao[k], bo[k])) return false;
  return true;
}

const num = (v: Json): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const str = (v: Json): string => (typeof v === 'string' ? v : '');

/** The larger of two numbers (counters that only grow). */
function maxNum(_b: Json, l: Json, r: Json): Json {
  if (typeof l !== 'number' && typeof r !== 'number') return l ?? r;
  return Math.max(num(l), num(r));
}

/** The later of two ISO dates or day keys (string compare works for both). */
function maxStr(_b: Json, l: Json, r: Json): Json {
  const a = str(l);
  const c = str(r);
  if (!a) return r ?? l;
  if (!c) return l;
  return a >= c ? l : r;
}

/** The earlier of two ISO dates or day keys (a first day never moves later). */
function minStr(_b: Json, l: Json, r: Json): Json {
  const a = str(l);
  const c = str(r);
  if (!a) return r ?? l;
  if (!c) return l;
  return a <= c ? l : r;
}

/** True if true on either device (flags that only ever turn on). */
function orBool(_b: Json, l: Json, r: Json): Json {
  return l === true || r === true;
}

/** A spendable number: both devices' changes add up (Sterne earned on one, spent on the other). */
function deltaNum(b: Json, l: Json, r: Json): Json {
  // Only numbers add up; anything else stays this device's value.
  if ([b, l, r].some(v => v !== undefined && v !== null && typeof v !== 'number')) return l ?? r;
  // Without a common ancestor the two balances cannot be added up: keep the larger.
  if (b === undefined || b === null) return Math.max(num(l), num(r));
  return Math.max(0, num(b) + (num(l) - num(b)) + (num(r) - num(b)));
}

/** Without a common ancestor, which side's value stands in a conflict: the
 *  side that played the later day (its settings and balance are the newer
 *  ones; a stale copy is never on a later day); on the same day, the card. */
function newerSide(ctx: Ctx | undefined, l: Json, r: Json): Json {
  if (!ctx) return r ?? l;
  return str(ctx.local.lastDate) > str(ctx.remote.lastDate) ? l : (r ?? l);
}

/** Sterne: both devices' changes add up. Without a common ancestor the newer
 *  side's balance stands (a stale local copy must never refund a spend). */
function spendNum(b: Json, l: Json, r: Json, ctx?: Ctx): Json {
  if (b === undefined || b === null) return newerSide(ctx, l, r);
  return deltaNum(b, l, r);
}

/** A map of counts per id (totalQuestCompletions): each id adds up both devices' changes. */
function deltaMap(b: Json, l: Json, r: Json): Json {
  const isMap = (v: Json) => !!v && typeof v === 'object' && !Array.isArray(v);
  if (!isMap(l) || !isMap(r)) return isMap(l) ? l : r;
  const bo = (isMap(b) ? b : null) as Obj | null;
  const lo = l as Obj;
  const ro = r as Obj;
  const out: Obj = {};
  for (const k of new Set([...Object.keys(ro), ...Object.keys(lo)])) {
    out[k] = bo ? deltaNum(bo[k] ?? 0, lo[k] ?? 0, ro[k] ?? 0) : Math.max(num(lo[k]), num(ro[k]));
  }
  return out;
}

/** A spendable map (crystals per family): per id like spendNum. */
function spendMap(b: Json, l: Json, r: Json, ctx?: Ctx): Json {
  if (b === undefined || b === null) return newerSide(ctx, l, r);
  return deltaMap(b, l, r);
}

/** Union of two string lists, keeping first-seen order (remote first). */
function unionStrings(_b: Json, l: Json, r: Json): Json {
  const out: string[] = [];
  for (const list of [r, l]) {
    if (!Array.isArray(list)) continue;
    for (const v of list) if (typeof v === 'string' && !out.includes(v)) out.push(v);
  }
  return out;
}

/** Union of two lists of objects by a key (id), ordered by ts when present. */
function unionById(key: string) {
  return (_b: Json, l: Json, r: Json): Json => {
    const seen = new Map<string, Json>();
    for (const list of [r, l]) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        const id = item && typeof item === 'object' ? String((item as Obj)[key] ?? JSON.stringify(item)) : JSON.stringify(item);
        if (!seen.has(id)) seen.set(id, item);
      }
    }
    const items = [...seen.values()];
    const ts = (x: Json) => (x && typeof x === 'object' ? str((x as Obj).ts) : '');
    if (items.every(x => ts(x))) items.sort((x, y) => (ts(x) < ts(y) ? -1 : ts(x) > ts(y) ? 1 : 0));
    return items;
  };
}

/** Ronki's keepsakes: union by id, and one entry per trip per day (two devices
 *  that both ran the same trip keep one keepsake; there is one trip a day). */
function keepsakeLog(b: Json, l: Json, r: Json): Json {
  const items = unionById('id')(b, l, r) as Json[];
  const seen = new Set<string>();
  return items.filter(x => {
    const o = (x && typeof x === 'object' ? x : {}) as Obj;
    const trip = str(o.tripId);
    const day = str(o.ts).slice(0, 10);
    if (!trip || !day) return true;
    const k = `${trip}|${day}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** This client's recent write ids (compare-and-swap sync): a short union. */
function recentIds(b: Json, l: Json, r: Json): Json {
  return (unionStrings(b, l, r) as string[]).slice(-20);
}

/** Shallow three-way merge of a nested object (familyConfig, maps of counts). */
function nested3(b: Json, l: Json, r: Json, ctx?: Ctx): Json {
  const bo = (b && typeof b === 'object' && !Array.isArray(b) ? b : {}) as Obj;
  const lo = (l && typeof l === 'object' && !Array.isArray(l) ? l : {}) as Obj;
  const ro = (r && typeof r === 'object' && !Array.isArray(r) ? r : {}) as Obj;
  const out: Obj = { ...ro };
  for (const k of new Set([...Object.keys(lo), ...Object.keys(ro)])) {
    if (jsonEqual(lo[k], ro[k])) continue;
    const lChanged = !jsonEqual(lo[k], bo[k]);
    const rChanged = !jsonEqual(ro[k], bo[k]);
    if (lChanged && !rChanged) out[k] = lo[k];
    else if (!lChanged && rChanged) out[k] = ro[k];
    // Both changed: this device's value; without a base, the newer side's.
    else out[k] = b === undefined || b === null ? (ro[k] === undefined ? lo[k] : newerSide(ctx, lo[k], ro[k])) : lo[k];
  }
  return out;
}

/** Ronki's garden (Extras): plants and decor from both devices, owned decor united. */
function gardenRule(b: Json, l: Json, r: Json, ctx?: Ctx): Json {
  const bo = (b && typeof b === 'object' ? b : {}) as Obj;
  const lo = (l && typeof l === 'object' ? l : {}) as Obj;
  const ro = (r && typeof r === 'object' ? r : {}) as Obj;
  return {
    ...(nested3(b, l, r, ctx) as Obj),
    plants: unionById('id')(bo.plants, lo.plants, ro.plants),
    decor: unionById('id')(bo.decor, lo.decor, ro.decor),
    ownedDecor: unionStrings(bo.ownedDecor, lo.ownedDecor, ro.ownedDecor),
    lastWeeklyPlanting: maxStr(bo.lastWeeklyPlanting, lo.lastWeeklyPlanting, ro.lastWeeklyPlanting),
  };
}


/** Today's tasks: on the same day, a task done on either device is done. */
const questsRule: Rule = (_b, l, r, ctx) => {
  const lDay = str(ctx.local.lastDate);
  const rDay = str(ctx.remote.lastDate);
  if (lDay !== rDay) return lDay > rDay ? l : r;
  if (!Array.isArray(l) || !Array.isArray(r)) return Array.isArray(l) ? l : r;
  const byId = new Map<string, Obj>();
  for (const q of r as Obj[]) if (q && typeof q === 'object') byId.set(String(q.id), { ...q });
  for (const q of l as Obj[]) {
    if (!q || typeof q !== 'object') continue;
    const id = String(q.id);
    const other = byId.get(id);
    // Side quests are picked at random per device: the card keeps its own,
    // and one only this device picked survives only if it was done here.
    if (!other && q.sideQuest === true && q.done !== true) continue;
    if (!other) { byId.set(id, { ...q }); continue; }
    byId.set(id, {
      ...other,
      ...q,
      done: q.done === true || other.done === true,
      completions: Math.max(num(q.completions), num(other.completions)),
    });
  }
  // Keep the order of the device that owns the day's list (remote first).
  const order = [...(r as Obj[]).map(q => String(q?.id)), ...(l as Obj[]).map(q => String(q?.id))];
  return [...new Set(order)].map(id => byId.get(id)).filter(Boolean);
};

/** Ronki's trip: the side further along wins (more adventures, or out vs home). */
const expeditionRule: Rule = (_b, l, r, ctx) => {
  const la = num(ctx.local.adventureCount);
  const ra = num(ctx.remote.adventureCount);
  if (la !== ra) return la > ra ? l : r;
  const rank = (e: Json) => {
    const s = e && typeof e === 'object' ? str((e as Obj).state) : 'home';
    return s === 'waiting' ? 2 : s === 'away' || s === 'leaving' ? 1 : 0;
  };
  if (rank(l) !== rank(r)) return rank(l) > rank(r) ? l : r;
  // Same trip, same step (a parent moved the evening start on one device):
  // the side that changed it wins; both changed, this device's.
  if (ctx.base && jsonEqual(l, _b)) return r;
  return l;
};

/** The dragon's identity: an onboarded card keeps its own dragon. */
const identityRule: Rule = (_b, l, r, ctx) => {
  if (ctx.remote.onboardingDone === true && ctx.local.onboardingDone !== true) return r;
  return ctx.base ? l : newerSide(ctx, l, r);
};

const RULES: Record<string, Rule> = {
  // Progress that only grows.
  adventureCount: maxNum,
  tripCursor: maxNum,
  catEvo: maxNum,
  stageSeen: maxNum,
  totalTasksDone: deltaNum,
  totalQuestCompletions: deltaMap,
  xp: deltaNum,
  expeditionLog: keepsakeLog,
  treasuresFound: unionStrings,
  micropediaDiscovered: unionStrings,
  tabUnlocksSeen: unionStrings,
  tabCoachmarksSeen: unionStrings,
  completedSpecialQuests: unionStrings,
  unlockedBadges: unionStrings,
  gamesPlayedEver: unionStrings,
  mintBadgesEarned: unionStrings,
  journalHistory: unionById('date'),
  dailyHabits: nested3,
  syncWrites: recentIds,
  // Spendable.
  hp: spendNum,
  crystalInventory: spendMap,
  gearInventory: unionStrings,
  garden: gardenRule,
  // Dates.
  lastDate: maxStr,
  lastTripDate: maxStr,
  lastTripAt: maxStr,
  greetedDate: maxStr,
  eveningRitualCompletedAt: maxStr,
  lastLoginDate: maxStr,
  lastTaskCompletionAt: maxStr,
  onboardingDate: minStr,
  // Flags that only turn on.
  onboardingDone: orBool,
  kidIntroSeen: orBool,
  parentOnboardingDone: orBool,
  parentHandoffBackSeen: orBool,
  pwaPromptShown: orBool,
  // Structured.
  quests: questsRule,
  expedition: expeditionRule,
  familyConfig: nested3,
  taughtBreaths: nested3,
  // The dragon's identity.
  companionName: identityRule,
  companionVariant: identityRule,
  eggType: identityRule,
  taughtSignature: identityRule,
};

/**
 * Merge this device's save (local) with the card's current row (remote),
 * given the card as this device last knew it (base, or null).
 */
/** Numbers where both devices' changes add up, even when they land on the same value. */
const DELTA_KEYS = new Set(['hp', 'totalTasksDone', 'totalQuestCompletions', 'xp', 'crystalInventory']);
/** Fields tied to others (the trip state follows adventureCount): always decided by
 *  their rule, never by "only one side changed" (Astra CAS-03). */
const ALWAYS_RULE = new Set(['expedition']);

/** Tasks ticked on both devices on the same day since the base: counted once, not
 *  twice. A base from an earlier day had none of today's ticks (Astra CAS-04). */
function overlapDone(b: Obj, l: Obj, r: Obj): Obj[] {
  const day = str(l.lastDate);
  if (!day || str(r.lastDate) !== day) return [];
  const list = (x: Json) => (Array.isArray(x) ? (x as Obj[]) : []);
  const baseDone = new Set(str(b.lastDate) === day ? list(b.quests).filter(q => q && q.done === true).map(q => String(q.id)) : []);
  const lDone = new Set(list(l.quests).filter(q => q && q.done === true).map(q => String(q.id)));
  return list(r.quests).filter(q => q && q.done === true && !baseDone.has(String(q.id)) && lDone.has(String(q.id)));
}

export function mergeStates<T extends Obj>(base: T | null, local: T, remote: T): T {
  const b = (base || null) as Obj | null;
  const l = local as Obj;
  const r = remote as Obj;
  const ctx: Ctx = { base: b, local: l, remote: r };
  const out: Obj = { ...r };
  const deltaMerged = new Set<string>();
  for (const key of new Set([...Object.keys(l), ...Object.keys(r)])) {
    // Both devices added to a balance or a task counter: add both changes up,
    // even when they happen to land on the same number.
    // Always with a base (review round 2, CAS-04): a task ticked on both is
    // taken out once below, even when one side's net balance equals the base.
    if (b && DELTA_KEYS.has(key)) {
      out[key] = (RULES[key] || deltaNum)(b[key], l[key], r[key], ctx);
      deltaMerged.add(key);
      continue;
    }
    if (jsonEqual(l[key], r[key])) continue;
    if (ALWAYS_RULE.has(key)) { out[key] = RULES[key](b ? b[key] : undefined, l[key], r[key], ctx); continue; }
    // A field only this device has (the card never had it): keep it.
    if (r[key] === undefined) { out[key] = l[key]; continue; }
    if (b) {
      const lChanged = !jsonEqual(l[key], b[key]);
      const rChanged = !jsonEqual(r[key], b[key]);
      if (lChanged && !rChanged) { out[key] = l[key]; continue; }
      if (!lChanged && rChanged) { out[key] = r[key]; continue; }
    }
    const rule = RULES[key];
    // Both changed (or no common ancestor): the field rule, else this device's value
    // when there is a base, else the card's value (never overwrite what we never saw).
    out[key] = rule ? rule(b ? b[key] : undefined, l[key], r[key], ctx) : (b ? l[key] : newerSide(ctx, l[key], r[key]));
  }
  // A task ticked on both devices was counted by both: take it out once.
  if (b && deltaMerged.size) {
    const twice = overlapDone(b, l, r);
    if (twice.length) {
      const pts = twice.reduce((sum, q) => sum + num(q.xp), 0);
      if (deltaMerged.has('totalTasksDone')) out.totalTasksDone = Math.max(0, num(out.totalTasksDone) - twice.length);
      if (deltaMerged.has('totalQuestCompletions') && out.totalQuestCompletions && typeof out.totalQuestCompletions === 'object') {
        const m = { ...(out.totalQuestCompletions as Obj) };
        for (const q of twice) { const id = String(q.id); if (id in m) m[id] = Math.max(0, num(m[id]) - 1); }
        out.totalQuestCompletions = m;
      }
      if (deltaMerged.has('hp')) out.hp = Math.max(0, num(out.hp) - pts);
      if (deltaMerged.has('xp')) out.xp = Math.max(0, num(out.xp) - pts);
    }
  }
  return out as T;
}
