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
  // Without a common ancestor the two balances cannot be added up: keep the larger.
  if (b === undefined || b === null) return Math.max(num(l), num(r));
  return Math.max(0, num(b) + (num(l) - num(b)) + (num(r) - num(b)));
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

/** Shallow three-way merge of a nested object (familyConfig, maps of counts). */
function nested3(b: Json, l: Json, r: Json): Json {
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
    else out[k] = lo[k];
  }
  return out;
}

type Ctx = { base: Obj | null; local: Obj; remote: Obj };
type Rule = (b: Json, l: Json, r: Json, ctx: Ctx) => Json;

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
  return rank(l) >= rank(r) ? l : r;
};

/** The dragon's identity: an onboarded card keeps its own dragon. */
const identityRule: Rule = (_b, l, r, ctx) => (ctx.remote.onboardingDone === true && ctx.local.onboardingDone !== true ? r : l);

const RULES: Record<string, Rule> = {
  // Progress that only grows.
  adventureCount: maxNum,
  tripCursor: maxNum,
  catEvo: maxNum,
  stageSeen: maxNum,
  totalTasksDone: maxNum,
  totalQuestCompletions: maxNum,
  xp: maxNum,
  expeditionLog: unionById('id'),
  treasuresFound: unionStrings,
  micropediaDiscovered: unionStrings,
  tabUnlocksSeen: unionStrings,
  tabCoachmarksSeen: unionStrings,
  completedSpecialQuests: unionStrings,
  unlockedBadges: unionStrings,
  journalHistory: unionById('date'),
  // Spendable.
  hp: deltaNum,
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
export function mergeStates<T extends Obj>(base: T | null, local: T, remote: T): T {
  const b = (base || null) as Obj | null;
  const l = local as Obj;
  const r = remote as Obj;
  const ctx: Ctx = { base: b, local: l, remote: r };
  const out: Obj = { ...r };
  for (const key of new Set([...Object.keys(l), ...Object.keys(r)])) {
    if (jsonEqual(l[key], r[key])) continue;
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
    out[key] = rule ? rule(b ? b[key] : undefined, l[key], r[key], ctx) : (b ? l[key] : r[key]);
  }
  // Keys only this device knows are kept (a new field added by this build).
  return out as T;
}
