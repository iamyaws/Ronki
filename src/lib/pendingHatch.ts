/**
 * A hatch that waits for a card scan (Finch pass, spec R7, 26 Sep 2026).
 *
 * The case: a child hatched Ronki on a fresh tablet, then the parent
 * scans the family's ronki.de card from the parent screen. The scan
 * stores the card's token and reloads; the cloud seed wins the load
 * (its parent flags make the local state count as pristine), so the
 * dragon the child just met would be gone.
 *
 * Just before the token is stored, the chain writes the child's picks
 * here. After the reload it applies them only when the loaded state has
 * not met Ronki yet (kidIntroSeen false, onboardingDone false). A card
 * whose Ronki already hatched (another device, an onboarded cloud row)
 * keeps its own Ronki and the stash is dropped. src/utils/storage.ts is
 * not touched.
 *
 * The stash is bound to the token of the card it was written for. It
 * applies only while that same token is active; under any other token
 * (a sibling's card opened later on the same device) it is dropped, so
 * one child's picks never land in another child's card.
 */

import { getLocalProfileOwner, readTokenFromUrl } from './profileToken';

export const PENDING_HATCH_KEY = 'ronki_pending_hatch';

/** A stash older than this is stale (the scan did not happen right away). */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingHatch {
  companionName: string;
  companionVariant: string;
}

export interface PendingHatchToSave extends PendingHatch {
  /** The token of the card about to be opened. Required. */
  token: string;
}

interface Stash extends PendingHatch {
  token: string;
  savedAt: number;
}

function normToken(t: unknown): string {
  return typeof t === 'string' ? t.trim().toLowerCase() : '';
}

interface HatchState {
  kidIntroSeen?: boolean;
  onboardingDone?: boolean;
}

/**
 * Remember the child's picks before the card scan reloads the app.
 * Without a name or without the card's token nothing is written.
 */
export function savePendingHatch(h: PendingHatchToSave, nowMs: number = Date.now()): void {
  if (!h || !h.companionName) return;
  const token = normToken(h.token);
  if (!token) return;
  const stash: Stash = {
    companionName: String(h.companionName),
    companionVariant: String(h.companionVariant || 'forest'),
    token,
    savedAt: nowMs,
  };
  try { localStorage.setItem(PENDING_HATCH_KEY, JSON.stringify(stash)); } catch { /* private mode */ }
}

/** Forget the stash. */
export function clearPendingHatch(): void {
  try { localStorage.removeItem(PENDING_HATCH_KEY); } catch { /* private mode */ }
}

function read(): Stash | null {
  try {
    const raw = localStorage.getItem(PENDING_HATCH_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v || typeof v.companionName !== 'string' || !v.companionName) return null;
    return {
      companionName: v.companionName,
      companionVariant: typeof v.companionVariant === 'string' && v.companionVariant ? v.companionVariant : 'forest',
      token: normToken(v.token),
      savedAt: Number(v.savedAt) || 0,
    };
  } catch {
    return null;
  }
}

/**
 * The fields to patch into the loaded state, or null.
 *
 * Applies only to a state that has not met Ronki yet, loaded under the
 * token the stash was written for. Drops (and clears) the stash for a
 * state that already has its own Ronki, for any other token (or none),
 * and a stash older than a day. A stash that applies stays until the state
 * shows kidIntroSeen (the next call drops it) or clearPendingHatch()
 * runs at onboardingDone, so a reload before the patch is saved still
 * finds it.
 */
export function takePendingHatch(
  state: HatchState | null | undefined,
  opts: { token?: string | null; nowMs?: number } = {},
): { kidIntroSeen: true; companionName: string; companionVariant: string } | null {
  if (!state) return null;
  const nowMs = typeof opts.nowMs === 'number' ? opts.nowMs : Date.now();
  const stash = read();
  if (!stash) {
    clearPendingHatch();
    return null;
  }
  const token = normToken(opts.token);
  if (!stash.token || !token || stash.token !== token) {
    clearPendingHatch();
    return null;
  }
  if (state.onboardingDone || state.kidIntroSeen || nowMs - stash.savedAt > MAX_AGE_MS || stash.savedAt > nowMs + 60000) {
    clearPendingHatch();
    return null;
  }
  return { kidIntroSeen: true, companionName: stash.companionName, companionVariant: stash.companionVariant };
}

/** localStorage mirror of the game save (src/utils/storage.ts LS_KEY). */
const LOCAL_SAVE_KEY = 'hdx2_drachennest';

/**
 * The share link path (SAVES-2). A parent opens `?p=<token>` on the
 * tablet where the child already hatched Ronki (kidIntroSeen and a name,
 * no onboardingDone). The token is stored and the cloud row wins the
 * load (the local hatch counts as pristine), so the named dragon would be
 * gone. Call this before anything consumes the URL token (AuthGate, in
 * its first render): it writes the same stash the scan path writes, and
 * takePendingHatch applies it by the usual rules after the load.
 *
 * Nothing is written without a valid URL token, when the local save
 * belongs to another card (a sibling's), or when the local Ronki has not
 * hatched or is already onboarded. Returns true when it wrote the stash.
 */
export function stashLocalHatchForShareLink(): boolean {
  try {
    const urlToken = readTokenFromUrl();
    if (!urlToken) return false;
    const owner = getLocalProfileOwner();
    if (owner && owner !== urlToken) return false;
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!raw) return false;
    const local = JSON.parse(raw) as {
      kidIntroSeen?: boolean;
      onboardingDone?: boolean;
      companionName?: unknown;
      companionVariant?: unknown;
    } | null;
    if (!local || !local.kidIntroSeen || local.onboardingDone) return false;
    const name = typeof local.companionName === 'string' ? local.companionName.trim() : '';
    if (!name) return false;
    const variant = typeof local.companionVariant === 'string' && local.companionVariant ? local.companionVariant : 'forest';
    savePendingHatch({ companionName: name, companionVariant: variant, token: urlToken });
    return true;
  } catch {
    return false;
  }
}
