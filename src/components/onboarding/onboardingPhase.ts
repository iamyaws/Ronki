/**
 * Which onboarding screen to show (Finch pass, 26 Sep 2026).
 *
 * Egg first for everyone (spec section 0, base design 2.1): the child
 * meets Ronki before any parent screen. The parent comes in after the
 * hatch, on the same tablet, unless a website card already carried the
 * parent's answers (the seed sets parentOnboardingDone and
 * parentHandoffBackSeen, so those families go from the egg straight to
 * the fire lesson).
 *
 * Pure: the chain passes the loaded state plus two facts it knows about
 * the device, so a reload at any point lands on the right screen.
 *
 *   done      onboardingDone
 *   scan      someone tapped "Ich habe schon eine Karte" and this device
 *             has no profile token yet
 *   meet      the egg, the hatch, the name (kidIntroSeen false)
 *   parent    the short parent step (parentOnboardingDone false)
 *   handback  "Jetzt bist du wieder dran" and "Jetzt kenn ich dich"
 *             (parentHandoffBackSeen false)
 *   teach     the first breath
 *   firstday  the three first-day beats; local UI state after the teach
 *             beat, so a reload there shows the teach beat again
 */

export type OnboardingPhase = 'scan' | 'meet' | 'parent' | 'handback' | 'teach' | 'firstday' | 'done';

export interface OnboardingFlags {
  onboardingDone?: boolean;
  kidIntroSeen?: boolean;
  parentOnboardingDone?: boolean;
  parentHandoffBackSeen?: boolean;
}

export interface PhaseContext {
  /** A profile token is stored on this device (getActiveToken()). */
  hasToken?: boolean;
  /** Someone asked for the card scan sheet in this session. */
  wantsCard?: boolean;
  /** The teach beat finished in this session (local UI state). */
  teachDone?: boolean;
}

export function pickPhase(state: OnboardingFlags | null | undefined, ctx: PhaseContext = {}): OnboardingPhase {
  const s = state || {};
  if (s.onboardingDone) return 'done';
  if (ctx.wantsCard && !ctx.hasToken) return 'scan';
  if (!s.kidIntroSeen) return 'meet';
  if (!s.parentOnboardingDone) return 'parent';
  if (!s.parentHandoffBackSeen) return 'handback';
  if (ctx.teachDone) return 'firstday';
  return 'teach';
}
