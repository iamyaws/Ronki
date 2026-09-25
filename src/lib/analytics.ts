/**
 * Kid-safe Supabase-native telemetry.
 *
 * Shipped 22 Apr 2026. Design notes:
 *   - Zero new vendor. Reuses the existing Supabase client (same pattern as
 *     src/utils/feedback.ts). All events hit one table: telemetry_events.
 *   - Anonymous device_id (UUID v4) in localStorage, rotated annually.
 *     Never tied to Supabase auth user.id — that link is the one thing a
 *     kids' analytics pipeline must never make (parental consent scope
 *     plus EU DSA data-minimisation).
 *   - Queue in memory, flush on visibilitychange / every 30s / beforeunload.
 *   - Offline queue in localStorage ('ronki_telemetry_queue'), capped at
 *     200 events (drop-oldest). Kids' app: losing an event is fine.
 *   - Hard-coded allowlist of event names + prop keys so accidental
 *     user-generated content (hero name, journal text, mood reasons) can
 *     never leak into props. Any prop whose value isn't a primitive gets
 *     dropped silently.
 *
 * NEVER send: journal content, heroName, mood reason text, any free-form
 * user string. The allowlist below is the hard constraint.
 */

import { supabase } from './supabase';

// ── Event schema (hard allowlist, matches spec) ──────────────────────
export type EventName =
  | 'app.open'
  | 'routine.complete'
  | 'quest.complete'
  | 'tool.open'
  | 'tool.complete'
  | 'mood.pick'
  | 'game.start'
  | 'game.end'
  | 'ronki.hatch'
  | 'ronki.evolve'
  | 'journal.write'
  | 'ausmalbild.redeem'
  | 'parent.pin.enter'
  | 'parent.dashboard.open'
  | 'parent.setting.change'
  // Drachennest companion-pillar events (cut #2 — Marc 25 Apr 2026):
  // the most expensive shipped feature was invisible to telemetry.
  // Each event is enum-bound or numeric; no free-form user content.
  | 'expedition.start'
  | 'expedition.return'
  | 'memento.received'
  | 'companion.sit'
  | 'companion.tap'
  // Meet onboarding + Tonight ritual (26 Apr 2026 design landing).
  // No props — these are pure ritual moments. The hatch fires
  // as part of meet completion and is already covered by
  // 'ronki.hatch'; that's why meet.complete is omitted.
  | 'tonight.start'
  | 'tonight.complete'
  // Finch pass (26 Sep 2026): the onboarding funnel and the first task.
  // Every prop is enum-bound or numeric; never a name the child typed.
  | 'onboarding.landing.view'
  | 'onboarding.egg.pick'
  | 'onboarding.name.confirm'
  | 'onboarding.parent.done'
  | 'onboarding.scan.start'
  | 'onboarding.scan.result'
  | 'onboarding.teachfire.complete'
  | 'onboarding.firstday.done'
  | 'first.task.complete'
  | 'quest.skip';

export type EventProps = Record<string, string | number | boolean>;

// Keys allowed on props by event name. Any prop key NOT in this list gets
// stripped silently before send. This is the defence-in-depth layer
// against accidental user-string leaks (e.g. a future caller typo'ing
// `heroName` instead of `toStage`).
const ALLOWED_PROP_KEYS: Record<EventName, readonly string[]> = {
  'app.open': [],
  'routine.complete': [],
  'quest.complete': ['questId', 'anchor', 'block', 'kind'],
  'tool.open': ['tool'],
  'tool.complete': ['tool', 'durationSec'],
  'mood.pick': ['mood', 'slot'],
  'game.start': ['gameId'],
  'game.end': ['gameId', 'durationSec', 'completed'],
  'ronki.hatch': [],
  'ronki.evolve': ['toStage', 'stage'],
  'journal.write': [],
  'ausmalbild.redeem': ['sceneId'],
  'parent.pin.enter': ['success'],
  'parent.dashboard.open': [],
  'parent.setting.change': ['key'],
  // Drachennest events. `biome` is the kid-facing biome id ('morgenwald'
  // today, more later) — enum-bounded, never user content. No memento
  // name on `memento.received` so the event can't leak a memento title
  // that might in some future build include kid-readable copy.
  'expedition.start': ['biome', 'kind'],
  'expedition.return': ['biome'],
  'memento.received': ['biome'],
  'companion.sit': [],
  'companion.tap': [],
  'tonight.start': [],
  'tonight.complete': [],
  // Finch pass funnel. `variant` is a colourway id, `source` and `result`
  // are short fixed words ('chip' / 'typed', 'camera' / 'code' / 'link',
  // 'ok' / 'fail'), `block` and `kind` come from src/loop and
  // src/data/taskKinds. The chosen nickname is never a prop.
  'onboarding.landing.view': [],
  'onboarding.egg.pick': ['variant'],
  'onboarding.name.confirm': ['source'],
  'onboarding.parent.done': [],
  'onboarding.scan.start': ['source'],
  'onboarding.scan.result': ['source', 'result'],
  'onboarding.teachfire.complete': ['rounds'],
  'onboarding.firstday.done': ['block'],
  'first.task.complete': ['block', 'kind'],
  'quest.skip': ['block', 'kind'],
};

// ── Storage keys ─────────────────────────────────────────────────────
const DEVICE_ID_KEY = 'ronki_analytics_device_id';
const DEVICE_ID_ROTATION_KEY = 'ronki_analytics_device_id_rotate_at';
const QUEUE_KEY = 'ronki_telemetry_queue';
const ENABLED_KEY = 'ronki_analytics_enabled';
const SESSION_APP_OPEN_KEY = 'ronki_telemetry_app_open_fired';
/** Set once a parent made the consent choice on this device (Finch pass). */
const CONSENT_DECIDED_KEY = 'ronki_analytics_consent_decided';

// ── Tunables ─────────────────────────────────────────────────────────
const FLUSH_INTERVAL_MS = 30_000;
const OFFLINE_QUEUE_CAP = 200;
const ROTATION_MS = 365 * 24 * 60 * 60 * 1000; // 1 year
/** Events held in memory while no consent choice exists yet (Finch pass). */
const CONSENT_BUFFER_CAP = 50;

// ── App version (best-effort; no fallback noise) ─────────────────────
const APP_VERSION: string | undefined = (() => {
  try {
    return (import.meta as any).env?.VITE_APP_VERSION || undefined;
  } catch {
    return undefined;
  }
})();

// ── In-memory state ──────────────────────────────────────────────────
interface QueuedEvent {
  device_id: string;
  name: EventName;
  props: EventProps;
  ts: string;
  app_version?: string;
}

let memoryQueue: QueuedEvent[] = [];
/**
 * Consent timing (Finch pass, 26 Sep 2026; census section 7). The funnel
 * starts before the parent step, so events fired while no consent choice
 * exists on this device wait here (memory only, never storage, cap 50)
 * instead of being dropped. A yes sends them through the normal path, a
 * no drops them. Nothing in here ever leaves the device without a yes.
 */
interface BufferedEvent { name: EventName; props?: EventProps; at: Date }
let consentBuffer: BufferedEvent[] = [];
let consentDecided = false;
let enabled = true;
let initialized = false;
let flushTimer: ReturnType<typeof setInterval> | null = null;

// ── UUID v4 (no crypto.randomUUID fallback for older iOS) ────────────
function uuidv4(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch { /* fall through */ }
  // RFC 4122 v4 — Math.random is fine here, device_id isn't secret.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Device ID (lazy, rotates annually) ───────────────────────────────
export function getDeviceId(): string {
  try {
    const now = Date.now();
    let id = localStorage.getItem(DEVICE_ID_KEY);
    const rotateAtRaw = localStorage.getItem(DEVICE_ID_ROTATION_KEY);
    const rotateAt = rotateAtRaw ? parseInt(rotateAtRaw, 10) : 0;
    if (!id || !rotateAt || now > rotateAt) {
      id = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, id);
      localStorage.setItem(DEVICE_ID_ROTATION_KEY, String(now + ROTATION_MS));
    }
    return id;
  } catch {
    // Private mode / storage disabled — fall back to a transient id so
    // the session still attributes correctly, but don't try to persist.
    return uuidv4();
  }
}

// ── Enable/disable ───────────────────────────────────────────────────
/**
 * Mirror of the consent flag (useAnalytics calls this on every change of
 * state.analyticsEnabled). `true` is always a parent's opt-in (the default
 * is off), so it also settles the consent choice and sends what waited.
 * `false` only stops sending: before the parent step it is the default,
 * not a choice, so waiting events stay held (and are never sent) until
 * setAnalyticsConsent decides.
 */
export function setAnalyticsEnabled(next: boolean): void {
  enabled = !!next;
  try { localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0'); } catch { /* ignore */ }
  if (enabled) markConsentDecided(true);
}

/**
 * The parent's consent choice (parent step, website card, dashboard).
 * Yes: enable and send the events that waited. No: disable and drop them.
 */
export function setAnalyticsConsent(granted: boolean): void {
  enabled = !!granted;
  try { localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0'); } catch { /* ignore */ }
  markConsentDecided(enabled);
}

/** True once a consent choice exists on this device. */
export function isConsentDecided(): boolean {
  return consentDecided;
}

function markConsentDecided(granted: boolean): void {
  consentDecided = true;
  try { localStorage.setItem(CONSENT_DECIDED_KEY, '1'); } catch { /* ignore */ }
  const held = consentBuffer;
  consentBuffer = [];
  if (!granted) return;
  for (const e of held) enqueue(e.name, e.props, e.at);
}

function readConsentDecidedFromStorage(): boolean {
  try {
    if (localStorage.getItem(CONSENT_DECIDED_KEY) === '1') return true;
    // A stored yes from before this change is a parent's opt-in too.
    return localStorage.getItem(ENABLED_KEY) === '1';
  } catch { return false; }
}

function readEnabledFromStorage(): boolean {
  // Default OFF per Art. 8 + Art. 25 DSGVO. The app must wait for the
  // parent to explicitly opt in via the ParentOnboarding disclosure or
  // the Parental Dashboard toggle before any event is sent. `useAnalytics`
  // mirrors state.analyticsEnabled into this flag on every render.
  try {
    const v = localStorage.getItem(ENABLED_KEY);
    if (v === null) return false;
    return v === '1';
  } catch { return false; }
}

// ── Sanitisation ─────────────────────────────────────────────────────
/**
 * Strip any prop key not in the allowlist for this event, and drop any
 * non-primitive value. Final belt against accidental PII leaks.
 */
function sanitizeProps(name: EventName, props?: EventProps): EventProps {
  if (!props) return {};
  const allow = ALLOWED_PROP_KEYS[name];
  const out: EventProps = {};
  for (const k of Object.keys(props)) {
    if (!allow.includes(k)) continue;
    const v = props[k];
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') {
      out[k] = v as string | number | boolean;
    }
  }
  return out;
}

/**
 * Truncate timestamp to the hour for mood.pick events. Rationale: the
 * exact "when did the kid feel sad" timing adds real fingerprinting risk
 * (one mood event at 06:42 on 7 days reveals schedule); the hour is enough
 * for the AM/PM segmentation we actually need from the slot prop.
 */
function timestampFor(name: EventName, now: Date): string {
  if (name === 'mood.pick') {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }
  return now.toISOString();
}

// ── Offline queue ────────────────────────────────────────────────────
function readOfflineQueue(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
  } catch { return []; }
}

function writeOfflineQueue(q: QueuedEvent[]): void {
  try {
    // Drop oldest if over cap — this is a kids' app, bounded memory wins.
    const trimmed = q.length > OFFLINE_QUEUE_CAP ? q.slice(q.length - OFFLINE_QUEUE_CAP) : q;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore storage errors */ }
}

function persistToOffline(events: QueuedEvent[]): void {
  if (events.length === 0) return;
  const current = readOfflineQueue();
  writeOfflineQueue([...current, ...events]);
}

// ── Core track ───────────────────────────────────────────────────────
export function track(name: EventName, props?: EventProps): void {
  if (typeof window === 'undefined') return;
  if (!ALLOWED_PROP_KEYS[name]) return; // unknown event name, drop
  if (!enabled) {
    // No consent choice yet on this device: hold the event in memory.
    if (!consentDecided) holdForConsent(name, props);
    return;
  }

  // Dedup app.open once per sessionStorage-lifetime so hot-reloads /
  // React StrictMode double-mounts don't double-count sessions.
  if (name === 'app.open') {
    try {
      if (sessionStorage.getItem(SESSION_APP_OPEN_KEY) === '1') return;
      sessionStorage.setItem(SESSION_APP_OPEN_KEY, '1');
    } catch { /* ignore — still send; non-critical */ }
  }

  enqueue(name, props, new Date());
}

function holdForConsent(name: EventName, props?: EventProps): void {
  if (name === 'app.open') {
    try {
      if (sessionStorage.getItem(SESSION_APP_OPEN_KEY) === '1') return;
      sessionStorage.setItem(SESSION_APP_OPEN_KEY, '1');
    } catch { /* ignore */ }
  }
  // Sanitise now so nothing unexpected is ever held, even in memory.
  consentBuffer.push({ name, props: sanitizeProps(name, props), at: new Date() });
  if (consentBuffer.length > CONSENT_BUFFER_CAP) {
    consentBuffer = consentBuffer.slice(consentBuffer.length - CONSENT_BUFFER_CAP);
  }
}

function enqueue(name: EventName, props: EventProps | undefined, at: Date): void {
  const clean = sanitizeProps(name, props);
  const evt: QueuedEvent = {
    device_id: getDeviceId(),
    name,
    props: clean,
    ts: timestampFor(name, at),
    app_version: APP_VERSION,
  };
  memoryQueue.push(evt);
  ensureInitialized();
}

// ── Flush ────────────────────────────────────────────────────────────
async function flush(opts: { blocking?: boolean } = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  const online = typeof navigator === 'undefined' ? true : navigator.onLine !== false;

  // Drain both in-memory and offline queues on every flush.
  const batch = [...readOfflineQueue(), ...memoryQueue];
  if (batch.length === 0) return;

  // Clear sources first so concurrent track() calls don't duplicate on error.
  memoryQueue = [];
  try { localStorage.removeItem(QUEUE_KEY); } catch { /* ignore */ }

  if (!online) {
    persistToOffline(batch);
    return;
  }

  try {
    const rows = batch.map(e => ({
      device_id: e.device_id,
      name: e.name,
      props: e.props,
      ts: e.ts,
      app_version: e.app_version ?? null,
    }));
    // Note: Supabase RLS allows INSERT for any authenticated user. An
    // unauthenticated request (offline user, expired session) will come
    // back with a 401; we re-queue below. beforeunload uses sendBeacon
    // to avoid the network-cancel the browser issues on nav.
    if (opts.blocking) {
      // Keep it simple: await the insert. sendBeacon requires a REST
      // endpoint (no supabase-js wrapper) and we prefer one code path.
      const { error } = await supabase.from('telemetry_events').insert(rows);
      if (error) persistToOffline(batch);
    } else {
      const { error } = await supabase.from('telemetry_events').insert(rows);
      if (error) persistToOffline(batch);
    }
  } catch {
    persistToOffline(batch);
  }
}

// ── Initialization (wires listeners once) ────────────────────────────
function ensureInitialized(): void {
  if (initialized) return;
  initialized = true;
  enabled = readEnabledFromStorage();
  consentDecided = consentDecided || readConsentDecidedFromStorage();

  if (typeof window === 'undefined') return;

  // Interval flush every 30s.
  flushTimer = setInterval(() => { void flush(); }, FLUSH_INTERVAL_MS);

  // Flush on tab hide (iOS PWA: this is the one reliable hook).
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush({ blocking: true });
  });

  // Flush any queued events from prior sessions the moment we come online.
  window.addEventListener('online', () => { void flush(); });

  // beforeunload is best-effort on mobile; visibilitychange above is the
  // real safety net. We still listen so desktop close/refresh doesn't lose
  // the last few events.
  window.addEventListener('beforeunload', () => { void flush({ blocking: true }); });
}

// Eager init on module import so the online/visibility listeners are in
// place before the first track() call. Safe no-op on SSR (guarded above).
ensureInitialized();

// ── Test / debug helpers (unused in prod paths) ──────────────────────
export function _resetForTests(): void {
  memoryQueue = [];
  consentBuffer = [];
  consentDecided = false;
  initialized = false;
  enabled = true;
  if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
  try {
    localStorage.removeItem(QUEUE_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(DEVICE_ID_ROTATION_KEY);
    localStorage.removeItem(ENABLED_KEY);
    localStorage.removeItem(CONSENT_DECIDED_KEY);
    sessionStorage.removeItem(SESSION_APP_OPEN_KEY);
  } catch { /* ignore */ }
}

// Direct flush trigger for tests. Production code flushes via
// visibilitychange / interval / beforeunload — jsdom's event-dispatch
// semantics for the cross-document/window bubble are not rock-solid, so
// tests use this instead of poking the DOM.
export async function _flushForTests(): Promise<void> {
  await flush({ blocking: true });
}

/** Test helper: how many events wait for a consent choice. */
export function _consentBufferSizeForTests(): number {
  return consentBuffer.length;
}

/** Test helper: re-read the stored flags as a fresh page load would. */
export function _reinitForTests(): void {
  initialized = false;
  consentDecided = false;
  if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
  ensureInitialized();
}
