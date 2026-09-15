/**
 * profileSetup, website-side parent flow for creating a kid profile.
 *
 * Marc 3 May 2026: "the one-time setup could be handled via the
 * website for parents to generate a code for their kids and print it
 * out. no 32 digit codes to remember but an artifact that can live on
 * the fridge or in the kid's room ready to scan and continue their
 * ronki experience."
 *
 * This is the site-side counterpart to the app's profileToken.ts +
 * CombinedParentSetup. The parent fills a one-screen form on the
 * website, this lib generates a 32-hex token, seeds the cloud row in
 * Supabase profiles with the same shape CombinedParentSetup writes,
 * and returns the token. The page then renders a printable QR card.
 *
 * The kid then opens app.ronki.de on their tablet, scans the printed
 * card (NoProfileLanding → camera → jsQR), and the app's
 * syncLoadByToken pulls the seeded state. The kid skips
 * CombinedParentSetup AND HandoffBackCard because both flags are
 * already true in the seeded row, landing straight on MeetRonki to
 * name Ronki + pick a variant.
 */
import { supabase } from './supabase';
import { trackEvent } from './analytics';

const TOKEN_REGEX = /^[a-f0-9]{32}$/;

/**
 * Generate a fresh 32-hex-char token (128 bits of entropy). Same
 * implementation as the app's profileToken.ts so the format is
 * identical (apps and site-issued cards are interchangeable).
 */
export function generateToken(): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    // Fallback for ancient environments, Math.random isn't crypto-
    // strong but the threat model here ("annoyed sibling guesses
    // your token") doesn't need it.
    let s = '';
    for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export type CreateProfileResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'invalid' | 'config' | 'error' };

export interface CreateProfileParams {
  childName: string;
  /** Optional 4-digit parent-area PIN; null/empty falls back to default 1234. */
  pin?: string | null;
  /**
   * Whether to opt into anonymized analytics. Default false (privacy-
   * safe, matches CombinedParentSetup's default). Parents can flip
   * later in the in-app dashboard.
   */
  analyticsEnabled?: boolean;
}

/**
 * Create a fresh profile row in Supabase keyed by a new token.
 * Returns the generated token so the caller can render the QR + share
 * URL. Seed state matches CombinedParentSetup's output PLUS pre-flips
 * parentHandoffBackSeen (the handoff card is meaningless when the kid
 * is the one scanning on their tablet, they were never the parent's
 * device handed-off).
 */
export async function createProfileOnSite(
  params: CreateProfileParams,
): Promise<CreateProfileResult> {
  const childName = params.childName.trim();
  const pin = (params.pin || '').trim();
  const analyticsEnabled = params.analyticsEnabled === true;
  if (!childName) return { ok: false, reason: 'invalid' };
  if (pin && !/^\d{4}$/.test(pin)) return { ok: false, reason: 'invalid' };
  if (!supabase) return { ok: false, reason: 'config' };

  const token = generateToken();
  const seedState: Record<string, unknown> = {
    parentOnboardingDone: true,
    // Skip the "hand the tablet to the kid" card, there's no parent
    // setup on the kid's tablet anymore; they scan directly.
    parentHandoffBackSeen: true,
    parentPin: pin || null,
    parentPinIsDefault: !pin,
    analyticsEnabled,
    familyConfig: {
      childName,
      siblings: [],
    },
    kidIntroSeen: false,
    onboardingDone: false,
  };

  // Sep 2026: this used to upsert public.profiles directly. The table is
  // closed to anon now (anon could list every family's token), so the write
  // goes through the security-definer RPC instead. Same effect, and it also
  // records today in profile_activity for the active-family counter.
  const { error } = await supabase.rpc('profile_upsert', {
    p_token: token,
    p_state: seedState,
  });
  if (error) return { ok: false, reason: 'error' };

  // Funnel gate for the 30 day decision: how many parents actually made a
  // card, not how many landed on the page.
  trackEvent('Karte erstellt', { source: 'website' });

  return { ok: true, token };
}

/**
 * Build the shareable scan URL the QR encodes. The app's AuthGate
 * detects ?p=<token> on first load and persists it via setActiveToken.
 */
export function buildShareUrl(token: string, appUrl = 'https://app.ronki.de/'): string {
  const base = appUrl.endsWith('/') ? appUrl : `${appUrl}/`;
  return `${base}?p=${token}`;
}

/**
 * The 8-char display fragment shown on the printed card. Format
 * 'a3f7-c2e1', just a memory hook for parents; the QR is the real
 * mechanism.
 */
export function tokenDisplayFragment(token: string | null): string {
  if (!token || !TOKEN_REGEX.test(token)) return '';
  return `${token.slice(0, 4)}-${token.slice(4, 8)}`;
}
