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
 */

export const PENDING_HATCH_KEY = 'ronki_pending_hatch';

/** A stash older than this is stale (the scan did not happen right away). */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingHatch {
  companionName: string;
  companionVariant: string;
}

interface Stash extends PendingHatch {
  savedAt: number;
}

interface HatchState {
  kidIntroSeen?: boolean;
  onboardingDone?: boolean;
}

/** Remember the child's picks before the card scan reloads the app. */
export function savePendingHatch(h: PendingHatch, nowMs: number = Date.now()): void {
  if (!h || !h.companionName) return;
  const stash: Stash = {
    companionName: String(h.companionName),
    companionVariant: String(h.companionVariant || 'forest'),
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
      savedAt: Number(v.savedAt) || 0,
    };
  } catch {
    return null;
  }
}

/**
 * The fields to patch into the loaded state, or null.
 *
 * Applies only to a state that has not met Ronki yet. Drops (and
 * clears) the stash for a state that already has its own Ronki, and a
 * stash older than a day. A stash that applies stays until the state
 * shows kidIntroSeen (the next call drops it) or clearPendingHatch()
 * runs at onboardingDone, so a reload before the patch is saved still
 * finds it.
 */
export function takePendingHatch(
  state: HatchState | null | undefined,
  nowMs: number = Date.now(),
): { kidIntroSeen: true; companionName: string; companionVariant: string } | null {
  if (!state) return null;
  const stash = read();
  if (!stash) {
    clearPendingHatch();
    return null;
  }
  if (state.onboardingDone || state.kidIntroSeen || nowMs - stash.savedAt > MAX_AGE_MS || stash.savedAt > nowMs + 60000) {
    clearPendingHatch();
    return null;
  }
  return { kidIntroSeen: true, companionName: stash.companionName, companionVariant: stash.companionVariant };
}
