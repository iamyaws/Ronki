/**
 * profileToken — kid-friendly identity layer (BeyArena pattern).
 *
 * Marc 27 Apr 2026: "learn from the beyblade arena project where we
 * added a QR code for the kids to be thrown into the app instead of
 * a login flow that feels more natural." Full design:
 * docs/specs/qr-profile-auth.md.
 *
 * Phase 1 (this file): token generation, URL detection, localStorage
 * persistence. The token is generated once per profile, lives in
 * localStorage, and can be shared via URL or QR.
 *
 * Phase 2 (next session): Supabase profiles table for cloud-keyed
 * load by token, dashboard QR card with print-as-PDF, camera scan
 * flow, NoProfileLanding screen.
 *
 * For Phase 1 the token doesn't gate anything yet — it's a tag on
 * the existing local-IDB state. But it enables: parent shares the
 * URL with kid's tablet, both devices land on the same profile.
 * Cross-device cloud sync follows in Phase 2.
 */

const TOKEN_KEY = 'ronki_profile_token';
const URL_PARAM = 'p';
const TOKEN_REGEX = /^[a-f0-9]{32}$/;

/**
 * Generate a fresh 32-hex-char token (128 bits of entropy).
 * Uses crypto.getRandomValues — secure on all modern browsers.
 */
export function generateToken(): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    // Fallback for ancient environments — Math.random is NOT
    // cryptographically secure but the threat model here is
    // "sibling guesses your token," not actual identity theft.
    let s = '';
    for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/** Extract a valid token from the current URL's ?p= param, or null. */
export function readTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const p = new URLSearchParams(window.location.search).get(URL_PARAM);
    if (!p) return null;
    return TOKEN_REGEX.test(p) ? p : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the active profile token. Order:
 *   1. URL ?p=<token> — wins if present, persisted to localStorage,
 *      then stripped from the URL so it doesn't leak into history /
 *      shares / browser back-button.
 *   2. localStorage — for repeat visits on the same device.
 *   3. null — first-time visitor on a fresh device, no token yet.
 *
 * Side effect: when a URL token is consumed, this function rewrites
 * the URL via history.replaceState so subsequent reads don't keep
 * re-processing the same param.
 */
export function getActiveToken(): string | null {
  const fromUrl = readTokenFromUrl();
  if (fromUrl) {
    try { localStorage.setItem(TOKEN_KEY, fromUrl); } catch { /* quota / private mode */ }
    // Strip the param so it doesn't show in shared screenshots, browser
    // history, or referrer headers. Replace, don't push, to keep the
    // back-button behaviour clean.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete(URL_PARAM);
      const next = url.pathname + (url.search ? url.search : '') + url.hash;
      history.replaceState(null, '', next);
    } catch { /* non-browser env */ }
    return fromUrl;
  }
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored && TOKEN_REGEX.test(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Set the active profile token. Used at parent-setup completion + migration. */
export function setActiveToken(token: string): void {
  if (!TOKEN_REGEX.test(token)) {
    throw new Error('Invalid token shape — expected 32 hex chars');
  }
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* quota / private mode */ }
}

/** Clear the active profile token. Used by "Profil zurücksetzen". */
export function clearToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

/**
 * The 8-char display fragment shown on the dashboard + printable card.
 * Format: 'a3f7-c2e1' (groups of 4 with hyphen). Just a memory hook
 * for parents — the full 32-char token is the real auth.
 */
export function tokenDisplayFragment(token: string | null): string {
  if (!token || !TOKEN_REGEX.test(token)) return '';
  return `${token.slice(0, 4)}-${token.slice(4, 8)}`;
}

/**
 * Build the shareable URL for the given token. Used by the dashboard
 * "Teilen" button + future QR-code generation.
 */
export function buildShareUrl(token: string): string {
  if (typeof window === 'undefined') {
    return `https://app.ronki.de/?${URL_PARAM}=${token}`;
  }
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(URL_PARAM, token);
  return url.toString();
}

/**
 * One-shot migration: if there's existing onboarded local state but
 * no token yet, generate one and tag the device with it. Call on
 * TaskContext init AFTER state has been loaded from storage.
 *
 * Returns the resolved token (existing or freshly generated).
 *
 * Why this is safe: the token doesn't gate any existing code path
 * yet (Phase 1). It's just a tag. So even if migration runs on every
 * boot for a brief window, the only effect is that subsequent boots
 * see the same token and skip the generation branch.
 */
export function ensureTokenForExistingProfile(stateOnboardingDone: boolean): string | null {
  // Only auto-generate for users who already finished onboarding —
  // first-time visitors get their token assigned at parent-setup
  // completion (a more deliberate moment).
  if (!stateOnboardingDone) return getActiveToken();
  const existing = getActiveToken();
  if (existing) return existing;
  const fresh = generateToken();
  setActiveToken(fresh);
  return fresh;
}
