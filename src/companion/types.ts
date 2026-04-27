// Ronki's voice system — types shared across engine, hook, and line catalogs.
// Voice tone: "curious younger friend" (Baby stage). Never lectures.

import type { ArcLifecyclePhase } from '../arcs/types';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type WeatherTag = 'rain' | 'cold' | 'hot' | 'clear' | 'snow';
export type MoodTag = 'magisch' | 'gut' | 'okay' | 'besorgt' | 'traurig' | 'müde';
export type StageTag = 'egg' | 'baby' | 'juvenile' | 'adult';
export type Trigger =
  | 'hub_open'
  | 'sanctuary_open'
  | 'quest_complete'
  | 'all_done'       // fires when the final main-quest tap flips allDone=true
  | 'freund_met'     // fires when a new Freund is unlocked/revealed
  | 'care_action'
  | 'idle'
  // ── Northstar tiers (2026-04-26 voice rewrite) — wired when Garden /
  //    witness beats / parent-first onboarding UI ships. Bank already has
  //    audio + text for each.
  | 'garden_plant_offer'      // Sunday: kid picks species + spot
  | 'garden_planted'          // kid placed a seed
  | 'garden_decor_placed'     // kid placed a decor item (stone/lantern/etc.)
  | 'garden_quiet_week'       // soft-fire on Sunday after a leaderless week
  | 'garden_visit'            // kid entered garden mode
  | 'witness_invite_monthly'  // monthly horizon-crossing invite
  | 'witness_reveal_tree'     // monthly reveal — sapling → Bäumchen
  | 'witness_invite_season'   // seasonal sensory beat
  | 'journey_reflection'      // rare elder beat — sets up Wave-3 fade-out
  | 'onboarding_kid_intro'    // parent-first Phase 1: kid's first beat
  | 'lagerfeuer_arrival'      // parent-first Phase 6: post-hatch arrival
  // ── Character-pass additions (2026-04-27) — fills silent surfaces
  //    found in the prod audit. Text-bubble first; audio gen pending.
  //    (LoginBonus skipped — surface retired per northstar / retention-bait.)
  | 'reward_approved'         // parent tapped "Genehmigt!" in BelohnungRedeemModal
  | 'gefuehl_pick_gut'        // Gefühlsecke picker — kid picked 😊
  | 'gefuehl_pick_wuetend'    //                       — kid picked 😤
  | 'gefuehl_pick_traurig'    //                       — kid picked 😢
  | 'gefuehl_pick_aengstlich' //                       — kid picked 😰
  | 'gefuehl_pick_muede'      //                       — kid picked 😴
  | 'gefuehl_done_gut'        // Gefühlsecke tool wrap — gut flow finished
  | 'gefuehl_done_wuetend'    //                       — wütend flow finished
  | 'gefuehl_done_traurig'    //                       — traurig flow finished
  | 'gefuehl_done_aengstlich' //                       — ängstlich flow finished
  | 'gefuehl_done_muede'      //                       — müde flow finished
  | 'evolution_reveal';       // EvolutionCelebration Phase 3 reveal
export type CareAction = 'fed' | 'petted' | 'played';

export interface VoiceContext {
  trigger: Trigger;
  timeOfDay: TimeOfDay;
  weather: WeatherTag | null;
  mood: MoodTag | null;
  stage: StageTag;
  questsCompletedToday: number;
  careAction?: CareAction;
  arcPhase?: ArcLifecyclePhase;
  lang: 'de' | 'en';
  /** Trait IDs Louis has earned from completed arcs. */
  earnedTraits: string[];
}

export interface VoiceLine {
  id: string;
  text: string;
  // Any of these tags must match context (OR within kind, AND across kinds).
  triggers: Trigger[];
  timeOfDay?: TimeOfDay[];
  weather?: WeatherTag[];
  mood?: MoodTag[];
  stage?: StageTag[];
  careAction?: CareAction[];
  arcPhase?: ArcLifecyclePhase;
  minQuestsToday?: number;
  cooldownHours?: number; // default 24
  weight?: number; // default 1
  /** Require at least one of these traits to be earned for this line to fire. */
  requiredTraits?: string[];
  /** Require ALL of these traits to be earned (used for "you have many traits" lines). */
  requireAllTraits?: string[];
}

export type VoiceHistory = Record<string, number>; // lineId -> unix ms of last use
