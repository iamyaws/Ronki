/**
 * Feature switches for the Finch pass (26 Sep 2026).
 *
 * Marc asked to reduce the features. Surfaces that do not carry the
 * daily loop are switched off here instead of deleted, so any of them
 * can come back by flipping one value. Parents can bring back the three
 * "Extras" (Tagebuch, Laden, Spielzeug) themselves from the dashboard;
 * everything else is a code switch.
 *
 * Spec: docs/specs/2026-09-26-finch-pass-spec.md (base design in
 * docs/reviews/2026-09-26-finch-pass/design-finch-faithful.md, section 7).
 */

export interface FeatureFlags {
  dayStrip: boolean;
  legacyProfile: boolean;
  expeditionMap: boolean;
  friends: boolean;
  praiseToast: boolean;
  tabUnlocks: boolean;
  victory: boolean;
  kidInstallSheet: boolean;
  badDays: boolean;
  roomStyle: boolean;
}

export const FEATURES: FeatureFlags = {
  /** RonkisTag, the old day strip. Its job moved to the Nest (Jetzt card, task row). */
  dayStrip: false,
  /** RonkiProfile with drawer, segments and EvolutionTree. The Ronki tab shows the passport. */
  legacyProfile: false,
  /** Expedition screen (Karte, Naturtagebuch, DiaryModal). Departure and return happen in the Nest.
   *  Note: the Nest no longer has a Karte tile, so flipping this alone brings nothing back;
   *  the Expedition component stays in the code for a later return (review INTEGRATION-2). */
  expeditionMap: false,
  /** Micropedia discoveries, FriendIntroCeremony takeovers, FreundCallbackCard. */
  friends: false,
  /** CompanionToast with rotating praise lines (PRD 6: no slot-machine praise). */
  praiseToast: false,
  /** TabUnlockCelebration toasts, coachmarks and locked-tab hints. Both tabs are always open. */
  tabUnlocks: false,
  /** Full-screen "Quest Complete!" victory celebration. The departure is the day's moment. */
  victory: false,
  /** Kid-facing PWA install sheet. Install is a tip line in the parent step. */
  kidInstallSheet: false,
  /** Scheduled random sad or tired days. Their comfort UI is unreachable, so they only showed a sad dragon. */
  badDays: false,
  /** CaveStyleSheet ("Einrichten"). Nothing paints the choice yet. */
  roomStyle: false,
};

export type FeatureName = keyof FeatureFlags;

/** True when a feature switch is on. */
export function featureOn(name: FeatureName): boolean {
  return FEATURES[name] === true;
}

/**
 * The parent "Extras zeigen" toggle (ParentalDashboard). Brings back
 * Tagebuch, Laden and Spielzeug with their old rules. Off for every save
 * unless a parent turns it on.
 */
export function extrasOn(state: { extrasEnabled?: boolean } | null | undefined): boolean {
  return state?.extrasEnabled === true;
}
