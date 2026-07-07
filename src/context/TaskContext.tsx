import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Quest, GameState, Boss, EggItem, CollectedEgg, PlantSpecies, DecorType, GardenPlant, GardenDecor } from '../types';
import { DECOR_BY_ID, DEFAULT_OWNED_DECOR } from '../data/gardenConstants';
import type { FamilyConfig, DragonVariant } from '../types/familyConfig';
import type { ArcEngineState, RoutineBeat } from '../arcs/types';
import type { DreamHighlightsData, PrevDaySnapshot } from '../dream/types'; // used in applyDayTransition (Task 4)
import { buildHighlights } from '../dream/dreamHighlights';
import { advanceBeat, initialArcState } from '../arcs/ArcEngine';
import { findArc } from '../arcs/arcs';
import { DEFAULT_FAMILY_CONFIG } from '../types/familyConfig';
import { ensureTokenForExistingProfile, getActiveToken } from '../lib/profileToken';
import { buildDay, getLevel, getLvlProg, getCatStage } from '../utils/helpers';
import { BOSSES, CAT_STAGES, WEEKLY_MISSIONS, GEAR_ITEMS, BADGES, SCHOOL_QUESTS, VACATION_QUESTS, SIDE_QUESTS, FOOTBALL } from '../constants';
import { SPECIAL_QUESTS } from '../data/specialQuests';
import { MINT_SEQUENCE } from '../data/mintGames';
import storage from '../utils/storage';
import { useAuth } from './AuthContext';
import { track } from '../lib/analytics';

// ── Fire-breath progression ──
/**
 * The five unlockable fire-breath flavors. `smoke` is NOT in this union
 * because it's the universal failed-attempt state, never something the
 * kid "owns". Each flavor gets taught via its own 2-round ritual
 * (TeachFireStep v2 pattern) at a milestone; the ritual stamps an ISO
 * date into state.taughtBreaths[flavor]. Until taught, flavorForQuest
 * falls back to 'flame' so non-flame animations never play unlocked.
 *
 * See backlog_fire_breath_progression.md for the full design + planned
 * unlock schedule.
 */
export type FireBreathFlavor = 'flame' | 'sparkle' | 'heart' | 'ember' | 'rainbow';

/**
 * Totals-based milestones. Each entry maps a flavor to the minimum
 * totalTasksDone for its teach ritual to unlock. Uses totalTasksDone
 * as the universal "kid has engaged with the game" proxy — a single
 * counter is easier to reason about than per-kind sub-counts, and it
 * still produces an escalating curve (Louis does ~5-10 tasks/day):
 *
 *   sparkle (Funkenstern)     @ 30 tasks   — ~4-6 days
 *   heart   (Herzfeuer)       @ 70 tasks   — ~2 weeks
 *   ember   (Glut)            @ 130 tasks  — ~4-5 weeks
 *   rainbow (Regenbogenfeuer) @ 200 tasks  — ~2-3 months
 *
 * Tune via this constant — no other call-site changes required. When
 * totalTasksDone crosses a threshold AND the flavor is not yet taught
 * AND no other ritual is pending, complete() queues it as
 * state.pendingRitual. The kid discovers the ritual on their next
 * Ronki-profile Feuer-tab visit; tapping the "Ritual wartet" card
 * mounts TeachRitualModal which calls teachBreath() on completion.
 */
export const RITUAL_TASK_THRESHOLDS: Record<Exclude<FireBreathFlavor, 'flame'>, number> = {
  sparkle: 30,
  heart: 70,
  ember: 130,
  rainbow: 200,
};

/** Flavor unlock order — the order we check when picking which ritual
 *  to queue if multiple thresholds happen to cross in the same tick
 *  (e.g. a kid catching up via a large batch completion). Earliest
 *  threshold fires first. */
export const RITUAL_UNLOCK_ORDER: Exclude<FireBreathFlavor, 'flame'>[] = [
  'sparkle', 'heart', 'ember', 'rainbow',
];

// ── Journal entry for history ──
export interface JournalEntry {
  date: string;
  memory: string;
  gratitude: string[];
  dayEmoji: number | null;
  achievements: string[];
  mood: number | null;
}

// ── Parent-created quest-lines ──
export interface ParentQuestLine {
  id: string;
  templateId: 'learn' | 'event' | 'skill';
  title: string;
  subtitle?: string;
  emoji?: string;
  createdAt: string;
  targetDate?: string;
  days: QuestLineDay[];
  completedDayIds: string[];
  completed: boolean;
  completedAt?: string;
  archived?: boolean;
}

export interface QuestLineDay {
  id: string;
  dayNumber: number;
  icon?: string;
  title: string;
  description: string;
  isMilestone?: boolean;
}

// ── Friend snapshot + wink event (Drachennest social, 25 Apr 2026) ──
// Cached view of another kid's nest. We persist a flat snapshot
// rather than a live pointer so the visit surface can render
// offline + privacy-cleanly (no vitals, no live mood). The
// snapshot gets refreshed on a re-add (kid types the same code
// again). Decor is the kid's last 10 expeditionLog entries
// summarised by emoji + name; the visit surface uses the same
// 4-slot mapping the home cave uses.
export interface FriendSnapshot {
  emojiCode: string[];
  firstName: string;
  variant: string;
  stage: number;
  hatchTraits: string[];
  decor: {
    shelf: Array<{ emoji: string; name: string }>;
    hanging?: { emoji: string; name: string };
    wallArt?: { emoji: string; name: string };
    cornerItem?: { emoji: string; name: string };
  };
  addedAt: string;
}

export interface WinkEvent {
  fromCode: string[];
  fromName: string;
  receivedAt: string;
  seen?: boolean;
}

// Local record of a wink sent BY this kid TO a friend. Used to
// enforce Q3's 3/day-per-friend cap (Marc 25 Apr 2026: "single
// button, capped at 3/day"). We don't need to persist who
// received the wink elsewhere — the friend will see it when
// their app reads back their own winksReceived feed (real
// backend wiring is the follow-up). For the prototype, this
// array is local-only and only feeds the cap calculation.
export interface WinkSentRecord {
  toCode: string[];
  sentAt: string;
}

// ── Expedition memento (Drachennest reframe, 25 Apr 2026) ──
// One per return trip. Renders both as a shelf tile in the
// Naturtagebuch and as the hero artifact inside the diary modal that
// pops on Ronki's return. Quote is the kid-facing line; location
// names a sub-area inside the biome to make each find feel like a
// real little place rather than "from the woods, again."
export interface ExpeditionMemento {
  id: string;            // unique-per-collection (timestamp + emoji)
  emoji: string;         // 🍁 / 🪶 / 🪨 / 🍂 / 🌰 / 🍄 / 🐌 / 🌿
  name: string;          // "Ahornblatt"
  biome: 'morgenwald';
  location: string;      // "Ein kleiner Pfad hinter den Birken"
  quote: string;         // "Im Morgenwald hat es nach nassem Moos gerochen…"
  ts: string;            // ISO collected-at
}

// ── Minimal state shape for the task list ──
export interface TaskState {
  quests: Quest[];
  sm: Record<string, number>;
  lastDate: string;
  vacMode: boolean;
  dt: number;
  hp: number;
  /** Cut #6 (25 Apr 2026): drachenEier is no longer mutated. Kept on
   *  the type so persistence migration can read legacy values without
   *  errors, but no surface reads or writes it anymore. Will be
   *  removed once all persisted client states have aged out. */
  drachenEier?: number;
  eggType: string | null;
  heroGender: string | null;
  eggProgress: number;
  eggHatched: boolean;
  moodAM: number | null;
  moodPM: number | null;
  dailyWaterCount: number;
  boss: Boss | null;
  bossTrophies: string[];
  catFed: boolean;
  catPetted: boolean;
  catPlayed: boolean;
  catEvo: number;
  /** Drachennest reframe (24 Apr 2026): Ronki's vital meters.
   *  Each 0..100. Topped up by quest completions (anchor-routed) + the
   *  three care verbs (Füttern / Streicheln / Spielen). Kid-positive —
   *  never decays to "starving"; the floor is whatever happens not to
   *  push it lower. The vitals are HIS signal; stars stay the kid's. */
  ronkiVitals?: { hunger: number; liebe: number; energie: number };
  /** Drachennest "Funken" token currency (25 Apr 2026 — Marc's
   *  insight: care verbs were free taps, the loop wasn't earned).
   *  Each completed quest grants +1 Funken; each tap on a care verb
   *  costs 1. The kid choses which vital to top up with their
   *  earned Funken. Capped at 12 so the kid can't hoard between
   *  days. Resets at midnight via the day-transition logic. */
  careTokens?: number;
  /** Friends + sign-up unique code (Marc 25 Apr 2026).
   *  Kid picks 3 emojis from EMOJI_VOCABULARY during onboarding;
   *  becomes their shareable code. Friends added by typing each
   *  other's 3-emoji codes get cached as snapshots in the friends
   *  array. Visit surface renders the snapshot read-only — no
   *  vitals, no live state, just chibi + decor + first name. */
  emojiCode?: string[];
  /** Cached friend snapshots — added when the kid types another
   *  kid's emoji code. Each entry is a frozen view of that
   *  friend's nest (variant / stage / hatchTraits + decor) at
   *  add-time. Re-syncs are a follow-up — for prototype the
   *  snapshot is static after add. */
  friends?: FriendSnapshot[];
  /** Winks received from friends (Marc Q3 = A: single-button
   *  wink, capped at 3/day per friend). For the prototype these
   *  are seeded locally so the kid sees the indicator without a
   *  real backend round-trip. */
  winksReceived?: WinkEvent[];
  /** Winks sent by this kid. Drives the 3/day-per-friend cap
   *  (Marc Q3) — the action counts entries with sentAt in
   *  today's local date matching the target's emojiCode and
   *  refuses the wink once the count hits 3. Local-only; the
   *  real social layer ships later. */
  winksSent?: WinkSentRecord[];
  /** Per-Ronki distinguishing features (25 Apr 2026 — Marc's
   *  clarified model: "when an evolution happens a ronki gets one
   *  unique trait out of the potential 6, added to the evolution
   *  stage, keep it simple"). Flat array of trait IDs accumulated
   *  across evolution stage transitions. One trait gets rolled per
   *  stage advance from a pool of 18 (3 slots × 6 variants worth
   *  of options), excluding traits the kid already has. With 5
   *  evolution stages past the egg, a fully-evolved Ronki lands
   *  with 5 traits — variant × C(18,5) = 6 × 8568 = 51,408 unique
   *  Ronkis at most. Visual on-chibi rendering of these traits is
   *  a follow-up pass; for v1 the array is collected + shown in
   *  the Compendium / future RonkiProfile chip strip. */
  hatchTraits?: string[];
  /** Cave personalisation (Marc 25 Apr 2026 — "louis really liked the
   *  garden and to give it his personal touch I would like to allow
   *  him the same for ronki's room. it's not about the mementos its
   *  about the colors of the room, the furniture, etc."). Free, no
   *  HP economy: kid taps a swatch and the cave wallpaper + floor
   *  apply instantly. Each id is looked up in
   *  `src/data/caveStyles.ts`; a missing id falls back to the
   *  default (warm-amber sandstone), so removing a variant in a
   *  future build is safe. */
  caveStyle?: { wallpaper: string; floor: string };
  /** Drachennest expedition state (25 Apr 2026): Ronki goes on a trip
   *  when the morning ritual hits 100%, returns hours later with a
   *  memento for the Naturtagebuch. v1 = one biome (Morgenwald), one
   *  memento per return. State machine: home → leaving → away →
   *  waiting → home (waiting transitions back when the kid taps the
   *  diary). The departedAt + returnAt timestamps drive the transition
   *  from away → waiting via a polling effect at the surface. */
  expedition?: {
    state: 'home' | 'leaving' | 'away' | 'waiting' | 'night-away';
    biome: 'morgenwald';
    departedAt?: string;
    returnAt?: string;
    pendingMemento?: ExpeditionMemento;
  };
  /** Past expedition mementos. Renders as the Naturtagebuch shelf
   *  inside the expedition surface. Capped at 24 to keep storage
   *  bounded (one daily memento → roughly a month of trips). */
  expeditionLog?: ExpeditionMemento[];
  /** ISO timestamp of the most recent quest completion. Used by the
   *  PWA prompt gate (and any future "quiet after task" guard) to
   *  hold modal-class notifications back during the inline beat that
   *  fires on a tick (QuestEater puff + Ronki burp + bubble). 25 Apr
   *  2026 — Marc QA flag: three notifications were stacking when the
   *  first quest closed. */
  lastTaskCompletionAt?: string;
  loginBonusClaimed: boolean;
  onboardingDone: boolean;
  /** Kid saw the Phase-1 forest intro ("Hallo! Bevor wir uns kennenlernen …")
   *  and tapped through to the kid→parent handoff. Gates whether we show the
   *  KidIntro before ParentOnboarding on first launch. Added in the
   *  onboarding-parent-first rework (23 Apr 2026). */
  kidIntroSeen?: boolean;
  /** Parent tapped through the Phase-4 "Fertig! / Jetzt bist du dran." card
   *  after finishing their 5-step setup. Gates the kid's entry to the
   *  existing Onboarding.jsx (egg hatch + name). Added 23 Apr 2026. */
  parentHandoffBackSeen?: boolean;
  /** Kid has seen Ronki's first speech bubble at the Lagerfeuer (Phase 6
   *  gentle pull: "Magst du mir zeigen, was du morgens machst?"). Drives
   *  the one-shot overlay + visual thread to the routine card on first
   *  Hub arrival. Added 23 Apr 2026. */
  lagerfeuerGreeted?: boolean;
  journalMemory: string;
  journalGratitude: string[];
  journalDayEmoji: number | null;
  journalAchievements: string[];
  journalHistory: JournalEntry[];
  journalSaved: boolean;
  bossDmgToday: number;
  orbs: { vitality: number; radiance: number; patience: number; wisdom: number };
  heroStats: { mut: number; fokus: number; ordnung: number };
  xp: number;
  chestsClaimed: number[];
  activeMissions: { id: string; progress: number; startDate: string }[];
  completedMissions: string[];
  gearInventory: string[];
  equippedGear: { head?: string; back?: string; neck?: string };
  unlockedBadges: string[];
  totalTasksDone: number;
  gamesPlayedToday: string[];
  birthdayEpic: { done: string[]; completed: boolean };
  earnedTraits: string[];
  /** ISO date (YYYY-MM-DD) when evening ritual was last completed. Resets daily. */
  eveningRitualCompletedAt?: string;
  /** Current Ronki stamina for minigames (0..minigameStaminaMax). Recharges
   *  +1 every RECHARGE_MINUTES. Only consumed when minigameAccessMode !== 'frei'. */
  ronkiStamina?: number;
  /** ISO timestamp of the last stamina update (used for lazy recharge). */
  ronkiStaminaUpdatedAt?: string;
  /** How minigames are gated for Louis. Added Apr 2026 after playtest showed
   *  the old "routine-only" gate backfired (Louis hit an invisible wall on
   *  weekends). Default: 'frei' (no gate, parents manage externally).
   *   · 'frei'        — always available, stamina disabled (unlimited play)
   *   · 'routine'     — unlocks after today's routine block is complete,
   *                     stamina still applies
   *   · 'zeitfenster' — only available in minigameTimeWindow, stamina applies */
  minigameAccessMode?: 'frei' | 'routine' | 'zeitfenster';
  /** Parent-configured max stamina cap. Default 10 (current 5 becomes "streng"). */
  minigameStaminaMax?: number;
  /** Time window (24h clock) when 'zeitfenster' mode is active. Default 16:00–18:00. */
  minigameTimeWindow?: { startHour: number; endHour: number };

  // ── Parent account + onboarding track (added 22 Apr 2026) ──
  /** Parent PIN set during the new parent-onboarding Track A. Null means
   *  the default "1234" is still active (parentPinIsDefault === true). */
  parentPin?: string | null;
  /** True when the parent hasn't customized the PIN yet. Drives the
   *  yellow "PIN ist noch 1234 — jetzt ändern" warning banner in the
   *  Parental Dashboard. Flips false on first real PIN set. */
  parentPinIsDefault?: boolean;
  /** Marks Track A (ParentOnboarding) as complete. Runs BEFORE the kid's
   *  7-step Onboarding.jsx so the parent sets up the account before
   *  handing the phone to the kid. */
  parentOnboardingDone?: boolean;
  /** True when the post-engagement PWA install prompt has been shown +
   *  acted on (install / skip). Controlled by usePWAPromptGate hook. */
  pwaPromptShown?: boolean;
  /** ISO date string of the last time the kid logged in. Used by the
   *  PWA prompt's "day-2 retry" logic — if dismissed on day 1, re-offer
   *  on day 2 when the parent is likely to be back at the phone. */
  lastLoginDate?: string;

  // ── Haptics (added 22 Apr 2026 per research plan) ──
  /** Master haptic enable flag. Default true. When false, all haptic calls
   *  no-op regardless of mode. */
  hapticsEnabled?: boolean;
  /** Haptic intensity mode.
   *   · 'gentle' (default) — halved pulse durations, widened pauses. Right
   *     for age 6 per startle-reflex research.
   *   · 'normal' — full patterns as defined in src/lib/haptics.ts. */
  hapticsMode?: 'gentle' | 'normal';

  // ── Analytics (added 22 Apr 2026) ──
  /** Anonymous device identifier (UUID v4). Generated once on first launch,
   *  persisted in localStorage. Never tied to Supabase auth user.id. */
  analyticsDeviceId?: string;
  /** Parent consent for anonymous usage telemetry. Default true (with
   *  first-run disclosure on Track A). Opt-out via Parental Dashboard.
   *  Events drop silently when false. */
  analyticsEnabled?: boolean;

  // ── RPG mode (added 22 Apr 2026 — dormant feature) ──
  /** When true, surfaces the boss mechanic + HP rewards for combat for
   *  an older-cohort experience under the same Ronki umbrella. Default
   *  false for the 5-8yo default audience (whose core loop is routine
   *  + care, not combat). The boss data, BossChest, and voicelines are
   *  all preserved in code so activation is a flag flip, not a rebuild.
   *  See memory/backlog_rpg_mode.md. */
  rpgModeEnabled?: boolean;

  // ── Hero chibi customization (added 22 Apr 2026) ──
  /** Optional kid-customized avatar composition. Renders via HeroChibi
   *  (pure CSS) when set; otherwise the default hero-default.webp /
   *  hero-default-girl.webp image shows through. Discovered via tapping
   *  the top-bar hero pill — deliberately NOT part of onboarding per
   *  Marc's "kid explores by himself" directive. */
  heroFace?: {
    skin: string;       // one of SKIN_TONES ids (light / warm / tan / deep / pale)
    hair: string;       // one of HAIR_STYLES ids (short-brown / long-black / ...)
    expression: string; // one of EXPRESSIONS ids (happy / curious / cool / shy)
  };
  /** Creatures discovered via useMicropediaDiscovery. One entry per unlock. */
  micropediaDiscovered?: Array<{ id: string; chapter: string; discoveredAt: string }>;
  /** Freund reunion arcs Louis has completed end-to-end (all 4 beats). */
  freundArcsCompleted?: string[];
  /** Scheduled callback beats waiting to fire 5-7 days after beat 3. */
  freundCallbacksPending?: Array<{ freundId: string; triggerAt: string }>;
  /** Parent-created quest-lines. Lifecycle: active → completed → (optionally) archived. */
  parentQuestLines?: ParentQuestLine[];
  /** Set once Louis dismisses the parent-zone intro overlay. */
  louisSeenParentIntro?: boolean;
  /** Sticky Tagebuch unlock. Set the first time the kid met the combined
   *  3-tasks + mood-logged threshold. Without this, the day-rollover in
   *  applyDayTransition wipes moodAM/moodPM and the Tagebuch re-locks
   *  mid-session until the kid logs today's mood — a regression flagged
   *  by a tester 25 Apr 2026 ("had Tagebuch, lost it again"). */
  journalEverUnlocked?: boolean;
  /** Entries logged each time Louis uses Gefühlsecke. Tracks feeling patterns for parents (future). */
  feelingsLog?: Array<{ ts: string; feeling: 'gut' | 'wuetend' | 'traurig' | 'aengstlich' | 'muede'; note?: string }>;
  /** MINT game badges Louis has earned (one per game, awarded on first completion). */
  mintBadgesEarned?: string[];
  /** MINT games Louis has played at least once (first-play tracker, separate from badges). */
  mintGamesPlayed?: string[];
  /** True when all 5 MINT badges earned — unlocks the Forscher-Funkel bonus creature. */
  forscherFunkelUnlocked?: boolean;
  poemQuest?: { done: string[]; completed: boolean; title?: string };
  onboardingDate?: string; // ISO date string — set when onboarding completes
  // Wave-3 callback anchor: the signature move the kid taught Ronki at
  // hatch. Currently always 'fire' (set by TeachFireStep on 2026-04-23).
  // Read by the journey-tier farewell surface (not yet built — see
  // docs/discovery/2026-04-23-core-gameloop-time-stack/) to render lines
  // like "Weißt du noch, wie du mir das beigebracht hast?" months later.
  taughtSignature?: 'fire';
  taughtAt?: string; // ISO date string — when the teach beat was completed
  /** Which fire-breath flavors the kid has taught Ronki, each keyed by
   *  the ISO date (YYYY-MM-DD) of the teach ritual. `flame` is
   *  auto-seeded at onboarding completion (mirroring taughtAt). Other
   *  flavors unlock via milestone-triggered rituals (sparkle/heart/
   *  ember/rainbow). Gated by flavorForQuest() — any flavor absent
   *  from this map falls back to 'flame' when a quest fires. See
   *  backlog_fire_breath_progression.md. */
  taughtBreaths?: Partial<Record<FireBreathFlavor, string>>;
  /** Currently-pending teach ritual, queued by complete() when the kid
   *  crosses a totalTasksDone threshold (see RITUAL_TASK_THRESHOLDS).
   *  Undefined when no ritual is waiting. The Ronki-profile Feuer tab
   *  shows a "Ritual wartet" card that mounts TeachRitualModal when
   *  tapped; on completion teachBreath() is called and this field is
   *  cleared. Stays set if the kid dismisses without completing, so
   *  the ritual remains discoverable on next visit. */
  pendingRitual?: Exclude<FireBreathFlavor, 'flame'>;
  familyConfig: FamilyConfig;
  _v2_economy_reset?: boolean;
  arcEngine?: ArcEngineState;
  bossKilledToday?: boolean;
  arcBeatAdvancedToday?: boolean;
  dreamHighlights?: DreamHighlightsData;
  totalQuestCompletions?: Record<string, number>;
  completedSpecialQuests?: Record<string, boolean>;
  viewsVisited?: string[];
  // Egg system
  pendingEgg?: EggItem | null;
  collectedEggs?: CollectedEgg[];
  eggTriggersFired?: Record<string, boolean>;
  gamesPlayedEver?: string[];
  /** Cut #6 (25 Apr 2026): funkelzeitMinutesToday + funkelzeitLog
   *  deleted. Keys retained as optional/never written for one
   *  release cycle so persistence migrations don't choke on old
   *  state shape. */
  /** ISO dates when the "zeig mama/papa"-confirmation was shown for each
   *  routine block. One per block per day to prevent re-triggering. */
  zeigMomentShownDates?: { morning?: string; evening?: string; bedtime?: string };
  /** Per-block count of confirmations seen. Teaching period fades once each
   *  block hits 14 (Louis has internalized the habit). */
  zeigMomentCounts?: { morning?: number; evening?: number; bedtime?: number };
  /** One of COMPANION_VARIANTS.id — Louis's picked colorway at onboarding.
   *  Undefined for saves that pre-date the variant system (triggers migration). */
  companionVariant?: string;

  // ── Bonding Agent (Apr 2026) ──
  // Ronki has rare bad days (every 14-21 days, app-decided, never Louis).
  // On those days Louis picks a gentle reaction — Kuscheln / Still zusammen
  // sitzen / Warmen Tee kochen — reversing the normal care direction.
  // Separately, Louis practices coping skills (Box-Atmung) in Gefühlsecke;
  // at 5× Ronki "learns" the skill and offers it back on his next bad day.
  // Matches the Feature Previews spec "Ronki hat schlechte Tage · und lernt
  // von Louis" — the deepest bonding move of all engagement reports.

  /** Ronki's current mood. 'normal' most days; 'sad' or 'tired' on rare
   *  bad days. Apr 2026 expansion: 'besorgt' (worried), 'gut' (extra
   *  good), 'magisch' (special — streaks, magical moments) so the chibi
   *  can reflect the full 6-emotion taxonomy the Stimmung card supports.
   *  Drives the profile portrait skin + Pflege action set. */
  ronkiMood?: 'normal' | 'sad' | 'tired' | 'besorgt' | 'gut' | 'magisch';
  /** ISO date (YYYY-MM-DD) when Ronki's current bad mood was set. A bad
   *  mood lives 1 day; on a new date we revert to 'normal' and schedule
   *  the next one. */
  ronkiMoodSetDate?: string;
  /** ISO date of the next scheduled bad-Ronki day. Sampled as today+14-21d
   *  when a bad day starts so the rhythm is unpredictable but bounded. */
  ronkiNextBadDayDate?: string;
  /** Skills Louis has taught Ronki via ≥5 practice sessions in Gefühlsecke.
   *  Today: 'boxAtmung' is the only skill. When Ronki is sad AND knows
   *  a skill, a 4th action ("Atmen mit Ronki") appears. */
  ronkiLearnedSkills?: string[];
  /** Per-skill practice count from Gefühlsecke (incremented by the
   *  Gefühlsecke hook each time Louis uses the skill). At threshold 5 the
   *  skill moves to ronkiLearnedSkills + the "Ronki hat X gelernt" banner
   *  fires once. */
  ronkiSkillPractice?: Record<string, number>;
  /** Has the "Ronki hat X gelernt" golden banner been shown for this skill?
   *  One shot per skill. */
  ronkiLearnBannerSeen?: Record<string, boolean>;
  /** Tab IDs whose unlock toast has fired already. One shot per tab. */
  tabUnlocksSeen?: Record<string, boolean>;
  /** Tab IDs whose first-tap coachmark overlay has been dismissed.
   *  One shot per tab. */
  tabCoachmarksSeen?: Record<string, boolean>;
  /** Crystal inventory — shared state between the Cave Mining game
   *  (adds) and Campfire Visitors (spends). Keyed by color family:
   *  'ember' | 'lagoon' | 'meadow' | 'blossom' | 'star'. 'star' is the
   *  rare drop from deep-dig mining. Apr 2026 — see
   *  backlog_mint_crystal_game_rework.md for the full loop design. */
  crystalInventory?: Record<string, number>;
  /** Friendship progress per Freund character. 0..5 gifts unlocks the
   *  next "scene evolution" for that friend (cozier nest, bigger
   *  mushroom, etc.). */
  freundFriendship?: Record<string, number>;
  /** Which Freund is currently visiting the campfire today, if any. */
  todaysVisitor?: { freundId: string; wish: string; date: string } | null;
  /** Completed coloring-page saves — each entry is one scene. Dedup by
   *  sceneId so repeat saves overwrite instead of append. Buch v2 reads
   *  these as polaroids. */
  completedColoringPages?: Array<{
    sceneId: string;
    fills: Record<string, string>;
    completedAt: string;
  }>;
  /** Today's Kraftwort (from KraftwortTool). Hub reads this to surface
   *  the chosen word as an ambient chip. Refreshes daily via date match. */
  todaysKraftwort?: { word: string; label: string; emoji: string; date: string } | null;
  /** Garden state (Phase 1 of core-gameloop-time-stack). Lives as the
   *  Hub's painted backdrop; plants accumulate week-over-week, decor is
   *  free-placed by the kid. Lazily initialized on first interaction —
   *  state with `garden === undefined` renders an empty garden preview
   *  and all garden actions construct the default shape on demand. */
  garden?: import('../types').GardenState;
}

interface TaskComputed {
  done: number;
  total: number;
  allDone: boolean;
  pct: number;
  byGroup: Record<string, Quest[]>;
  level: number;
  xpProgress: { cur: number; need: number };
}

interface TaskActions {
  complete: (id: string) => void;
  setMood: (period: string, val: number) => void;
  drinkWater: () => void;
  completeHabit: (habitId: string) => void;
  feedCompanion: () => void;
  petCompanion: () => void;
  playCompanion: () => void;
  collectLoginBonus: () => void;
  completeOnboarding: (cfg?: { eggType?: string; dragonVariant?: DragonVariant; companionVariant?: string; heroName?: string; heroGender?: string; taughtSignature?: 'fire'; taughtAt?: string }) => void;
  /** Mark a fire-breath flavor as taught. Idempotent — calling twice
   *  with the same flavor won't overwrite the original teach date.
   *  Used by post-onboarding teach rituals (sparkle/heart/ember/
   *  rainbow) to unlock the flavor for future QuestEater completions. */
  teachBreath: (flavor: FireBreathFlavor) => void;
  /** Clear pendingRitual without teaching the flavor. Currently unused
   *  in product; exposed for Phase E (parent defer toggle) + tests. */
  dismissPendingRitual: () => void;
  /** Drachennest reframe: standing care verbs that top up Ronki's vital
   *  meters when the kid taps Füttern / Streicheln / Spielen. Caps at
   *  100 per vital. The amounts mirror the Begleiter Polish design. */
  // careForRonki — deleted in Cut #9 (26 Apr 2026, vitals system removed).
  /** Friends + sign-up — emoji code picker writes the kid's three
   *  emojis here. Idempotent. Validates length === 3 + each entry
   *  exists in EMOJI_VOCABULARY; bad input is ignored. */
  setEmojiCode: (code: string[]) => void;
  /** Cache a friend's snapshot (kid types their code, we add them
   *  to the friends list). De-dupes by emojiCode so the same kid
   *  gets refreshed rather than duplicated on re-add. */
  addFriend: (snap: FriendSnapshot) => void;
  /** Mark a wink as seen so the inbox indicator clears. */
  markWinkSeen: (receivedAt: string) => void;
  /** Cave personalisation — kid picks a wallpaper or floor swatch
   *  in the "Einrichten" sheet. Partial so the picker can update
   *  one axis at a time without clobbering the other. Free, no
   *  HP/Funkelzeit cost. */
  setCaveStyle: (partial: Partial<{ wallpaper: string; floor: string }>) => void;
  /** Record a wink the kid just sent to a friend. Enforces the
   *  3/day-per-friend cap (Marc Q3). Returns true if the wink
   *  was accepted, false if the cap was already reached today.
   *  The UI uses the boolean to either flip into the success
   *  state or show the "morgen wieder" copy. */
  recordWinkSent: (friend: FriendSnapshot) => boolean;
  /** Drachennest expedition: explicit state setter so the prototype's
   *  dev URL params (?expedition=away|waiting|home) and the Reise
   *  surface's polling effect can drive transitions without each
   *  caller having to reason about the rest of the state shape. */
  setExpedition: (next: NonNullable<TaskState['expedition']>) => void;
  /** Move expedition.state to 'leaving' if it's currently 'home'. The
   *  walk-out animation runs ~2.5s in the surface, then the surface
   *  flips state to 'away' with departedAt + returnAt set. Reducer
   *  guards against double-departures so a flurry of morning quest
   *  completions doesn't restart the trip mid-flight. */
  startExpedition: () => void;
  /** Move expedition.state to 'away' with departedAt = now and
   *  returnAt = now + 4h (capped to 14:00 same day, matching the spec's
   *  "Zurück gegen 14:00" copy). Generates the pendingMemento now so
   *  the kid never sees an empty diary slot during the wait. */
  rangerDeparted: () => void;
  /** Move expedition.state to 'waiting'. Fires when the polling effect
   *  detects now > returnAt; pendingMemento is already set from
   *  rangerDeparted. */
  rangerArrived: () => void;
  /** Pop the pendingMemento into expeditionLog and reset state to
   *  'home'. Called when the kid closes the diary modal. */
  receiveMemento: () => void;
  saveJournal: (data: { memory: string, gratitude: string[], dayEmoji: number | null, achievements: string[] }) => void;
  redeemReward: (currency: 'hp' | 'eggs', cost: number) => void;
  dismissCelebration: () => void;
  startMission: (id: string) => void;
  abandonMission: (id: string) => void;
  addHP: (amount: number) => void;
  claimGameReward: (gameId: string) => void;
  // addScreenMinutes / addFunkelzeitUsage / refundFunkelzeitUsage —
  // deleted in cut #6 (Funkelzeit removal). Callers cleaned up.
  consumeStamina: () => void;
  restoreStamina: () => void;
  equipGear: (gearId: string) => void;
  unequipGear: (slot: 'head' | 'back' | 'neck') => void;
  updateBirthdayEpic: (data: { done: string[]; completed: boolean }) => void;
  updateFamilyConfig: (config: FamilyConfig) => void;
  patchState: (partial: Partial<TaskState>) => void;
  completeSpecialQuest: (id: string) => void;
  recordViewVisit: (view: string) => void;
  spawnEgg: (egg: EggItem) => void;
  collectEgg: () => void;
  fireCelebration: () => void;
  createQuestLine: (ql: ParentQuestLine) => void;
  updateQuestLine: (id: string, patch: Partial<ParentQuestLine>) => void;
  completeQuestLineDay: (questLineId: string, dayId: string) => void;
  archiveQuestLine: (id: string) => void;
  logFeeling: (feeling: 'gut' | 'wuetend' | 'traurig' | 'aengstlich' | 'muede', note?: string) => void;
  claimMintBadge: (badgeId: string, gameId: string) => void;
  recordMintGamePlay: (gameId: string) => void;

  // ── Bonding Agent ──
  /** Run on Ronki screen mount. (1) If a bad mood was set on a prior
   *  date, revert to 'normal'. (2) If mood is 'normal' and today >= the
   *  scheduled next bad-day, fire a bad mood (sad or tired) + roll the
   *  next bad-day 14-21d out. Idempotent per-day. */
  syncRonkiMood: () => void;
  /** Louis picked a gentle reaction on a bad-Ronki day. Ends the bad
   *  mood early (Ronki feels seen). Writes a memory into journalHistory
   *  so the moment shows up in the Buch later. `reaction` is one of
   *  'kuscheln' | 'stille' | 'tee' | 'atmen'. */
  pickRonkiSadReaction: (reaction: string) => void;
  /** Louis used a coping skill in Gefühlsecke. Increments the per-skill
   *  practice counter. At threshold (5), promotes the skill to
   *  ronkiLearnedSkills so Ronki can offer it back on his next bad day. */
  practiceSkill: (skillId: string) => void;
  /** Marks the "Ronki hat X gelernt" banner as seen (one shot per skill). */
  markLearnBannerSeen: (skillId: string) => void;
  /** Marks a tab's unlock toast as already shown. */
  markTabUnlockSeen: (tabId: string) => void;
  /** Marks a tab's first-tap coachmark overlay as dismissed. */
  markTabCoachmarkSeen: (tabId: string) => void;
  /** Cave Mining: add N crystals of a color family to the inventory. */
  addCrystals: (family: string, n: number) => void;
  /** Campfire Visitors: remove N crystals of a family (returns true on
   *  success, false if not enough in the bank). */
  spendCrystals: (family: string, n: number) => boolean;
  /** Campfire Visitors: record a completed gift-exchange with a Freund,
   *  bumping friendship (capped at 5 per friend). */
  giftCrystalToFreund: (freundId: string) => void;

  // ── Garden (Phase 1 of core-gameloop-time-stack) ──
  /** Plant a seed of the given species at the given scene position.
   *  Free — planting is the weekly ritual, not a shop transaction.
   *  Updates lastWeeklyPlanting to today so the Sunday offer cools until
   *  next week. */
  plantSeed: (species: PlantSpecies, position: { x: number; y: number }) => void;
  /** Place a decor item in the garden. Returns true on success.
   *  If not yet owned, deducts the decor's Sterne cost from state.hp
   *  and adds the type to ownedDecor. If HP too low, returns false
   *  without mutating. Already-owned items place for free. */
  placeDecor: (type: DecorType, position: { x: number; y: number }) => boolean;
  /** Update position of an existing placed decor item. */
  moveDecor: (id: string, position: { x: number; y: number }) => void;
  /** Remove a decor item from the scene. Ownership persists (ownedDecor
   *  is not mutated) so the kid can re-place it later without re-paying. */
  removeDecor: (id: string) => void;
  /** Mark a plant's current stage as "witnessed" (kid saw + dismissed
   *  Ronki's invitation). Updates garden.witnessedStages[plantId].
   *  No-op if the plant doesn't exist. Phase 2 of the time-stack. */
  witnessPlant: (plantId: string, stage: import('../types').PlantStage) => void;
}

interface CelebrationEvent {
  type: 'victory' | 'levelUp' | 'evolution' | 'chest' | 'forscherGraduation';
  payload?: Record<string, any>;
}

interface TaskContextValue {
  state: TaskState | null;
  computed: TaskComputed;
  actions: TaskActions;
  loading: boolean;
  celebration: CelebrationEvent | null;
  toastTrigger: number;
}

function assignBoss(catEvo: number = 0): Boss {
  const stage = getCatStage(catEvo);
  // Tier pool grows with companion evolution
  const allowedTiers = ['tier1'];
  if (stage >= 2) allowedTiers.push('tier2');
  if (stage >= 3) allowedTiers.push('tier3');
  const pool = BOSSES.filter(b => allowedTiers.includes(b.tier));
  const b = pool[Math.floor(Math.random() * pool.length)];
  return { id: b.id, hp: b.hp, maxHp: b.hp };
}

// ── Bonding Agent scheduler ──
// Samples a random offset in [14, 21] days and returns the resulting ISO
// date string. Called whenever we need to plan the *next* bad-Ronki day,
// which is after a bad day fires or during initial-state seeding. The
// band keeps spacing between bad days unpredictable but always "rare
// enough that it feels real" per the Feature Previews pitch.
function scheduleNextBadRonkiDay(from: Date): string {
  const days = 14 + Math.floor(Math.random() * 8); // 14..21 inclusive
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Pick which kind of bad day Ronki is having today — sad or tired. 50/50
// for now; could bias toward 'sad' if we find kids respond better to
// that reaction set later. Keep this separate from the date scheduler
// so the two decisions are independently testable.
function pickBadRonkiMood(): 'sad' | 'tired' {
  return Math.random() < 0.5 ? 'sad' : 'tired';
}

// ── Morgenwald memento pool (Drachennest expedition v1) ──
// Eight finds Ronki can bring back. We try not to repeat the most
// recent two so the kid sees variety even on a short test session.
// Quotes follow Marc's voice rules: longer slightly-stumbly lines, no
// em-dashes, no tidy three-beat fragments. Each entry pairs an emoji
// with a short location and a quote that reads like a child's
// observation rather than copy-deck description.
const MORGENWALD_MEMENTOS: Array<Omit<ExpeditionMemento, 'id' | 'ts'>> = [
  { emoji: '🍁', name: 'Ahornblatt',     biome: 'morgenwald', location: 'Ein kleiner Pfad hinter den Birken', quote: 'Im Morgenwald hat es nach nassem Moos gerochen, und ich habe ein rotes Blatt mitgebracht weil es leuchtet wenn die Sonne drauf scheint.' },
  { emoji: '🪶', name: 'Feder',          biome: 'morgenwald', location: 'Stille Lichtung am Baumwipfel',     quote: 'Auf der Lichtung ist eine Feder runtergesegelt während ich gewartet habe, ich glaube ein Vogel hat sie nicht mehr gebraucht.' },
  { emoji: '🪨', name: 'Bachstein',       biome: 'morgenwald', location: 'Am kleinen Bach',                    quote: 'Der Stein war ganz glatt vom Wasser und kühl in der Hand, ein bisschen wie ein kleines Geheimnis vom Bach.' },
  { emoji: '🍂', name: 'Eichenblatt',     biome: 'morgenwald', location: 'Am Wegesrand vor der Eiche',         quote: 'Es hat geknistert als ich draufgetreten bin, und das Goldene drin sieht aus als hätte jemand mit Sonne gemalt.' },
  { emoji: '🌰', name: 'Eichel',          biome: 'morgenwald', location: 'Unter der dicken Eiche',             quote: 'Die hatte sogar noch ihr kleines Hütchen drauf, ich finde das sieht aus wie eine winzige Mütze für einen Wichtel.' },
  { emoji: '🍄', name: 'Roter Pilz',      biome: 'morgenwald', location: 'Im schattigen Tannenkreis',          quote: 'Den durfte ich nur anschauen, nicht mitnehmen, aber er war wirklich hübsch mit den weißen Punkten oben drauf.' },
  { emoji: '🐌', name: 'Schneckenhaus',   biome: 'morgenwald', location: 'Auf einem Stein in der Sonne',       quote: 'Es war ganz leer und sauber drin und gespiralt, fast als ob jemand ganz vorsichtig damit gespielt hätte.' },
  { emoji: '🌿', name: 'Moosbüschel',     biome: 'morgenwald', location: 'Vom alten Wurzelhang',               quote: 'Das Moos ist so weich und feucht, riecht nach Erde nach Regen, und du musst es vorsichtig anfassen damit es nicht plattgedrückt wird.' },
];

function pickMorgenwaldMemento(log: ExpeditionMemento[]): ExpeditionMemento {
  const recentNames = new Set(log.slice(-2).map(m => m.name));
  const pool = MORGENWALD_MEMENTOS.filter(m => !recentNames.has(m.name));
  const choice = pool[Math.floor(Math.random() * pool.length)] || MORGENWALD_MEMENTOS[0];
  const ts = new Date().toISOString();
  return {
    id: `${ts}-${choice.emoji}`,
    ts,
    ...choice,
  };
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function useTask() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyComputed: TaskComputed = { done: 0, total: 0, allDone: false, pct: 0, byGroup: {}, level: 1, xpProgress: { cur: 0, need: 50 } };

export function createInitialState(): TaskState {
  return {
    quests: buildDay(false),
    sm: {},
    lastDate: new Date().toISOString().slice(0, 10),
    vacMode: false,
    dt: 0,
    hp: 0,
    drachenEier: 0,
    eggType: 'dragon',
    heroGender: null,
    eggProgress: 0,
    eggHatched: false,
    moodAM: null,
    moodPM: null,
    dailyWaterCount: 0,
    boss: assignBoss(0),
    bossTrophies: [],
    catFed: false,
    catPetted: false,
    catPlayed: false,
    catEvo: 0,
    ronkiVitals: { hunger: 70, liebe: 70, energie: 70 },
    careTokens: 0,
    hatchTraits: [],
    emojiCode: undefined,  // picked during onboarding via EmojiCodePicker
    friends: [],
    winksReceived: [],
    winksSent: [],
    caveStyle: { wallpaper: 'warm-amber', floor: 'amber' },
    expedition: { state: 'home', biome: 'morgenwald' },
    expeditionLog: [],
    loginBonusClaimed: false,
    onboardingDone: false,
    // Onboarding-parent-first rework (23 Apr 2026): three new gates drive
    // the KidIntro → ParentOnboarding → HandoffBack → kid Onboarding →
    // Lagerfeuer-greeting choreography. All start false on a fresh save.
    kidIntroSeen: false,
    parentHandoffBackSeen: false,
    lagerfeuerGreeted: false,
    journalMemory: '',
    journalGratitude: [],
    journalDayEmoji: null,
    journalAchievements: [],
    journalHistory: [],
    journalSaved: false,
    bossDmgToday: 0,
    orbs: { vitality: 0, radiance: 0, patience: 0, wisdom: 0 },
    heroStats: { mut: 0, fokus: 0, ordnung: 0 },
    xp: 0,
    chestsClaimed: [],
    activeMissions: [],
    completedMissions: [],
    gearInventory: [],
    equippedGear: {},
    unlockedBadges: [],
    totalTasksDone: 0,
    gamesPlayedToday: [],
    birthdayEpic: { done: [], completed: false },
    earnedTraits: [],
    eveningRitualCompletedAt: undefined,
    ronkiStamina: 10,
    ronkiStaminaUpdatedAt: new Date().toISOString(),
    // Drachennest default flipped 'frei' → 'routine' (Marc 25 Apr
    // 2026 — "let's also reactivate the stamina bar"). Stamina now
    // ticks down each game start. Parents can switch back via the
    // dashboard if they want unlimited play.
    minigameAccessMode: 'routine',
    minigameStaminaMax: 10,
    minigameTimeWindow: { startHour: 16, endHour: 18 },
    // Parent account + onboarding defaults — Track A will set parentPin
    // and flip parentPinIsDefault to false on first PIN customization.
    parentPin: null,
    parentPinIsDefault: true,
    parentOnboardingDone: false,
    pwaPromptShown: false,
    lastLoginDate: undefined,
    // Haptics — defaults per research plan (gentle for age 6).
    hapticsEnabled: true,
    hapticsMode: 'gentle',
    // Analytics — device_id generated lazily by src/lib/analytics.ts.
    // Default OFF (opt-in) per Art. 8 DSGVO (child consent) + Art. 25
    // (privacy by default). Parents opt IN from ParentOnboarding's
    // disclosure screen; the Parental Dashboard also exposes the toggle.
    // Flipped from ON to OFF in the launch-prep code review (Apr 2026).
    analyticsDeviceId: undefined,
    analyticsEnabled: false,
    // RPG-Modus — off by default, parent-opt-in for older kids.
    rpgModeEnabled: false,
    // Hero chibi — undefined until the kid discovers the builder.
    heroFace: undefined,
    // Bonding Agent defaults — Ronki starts in a normal mood; the next
    // rare bad day is scheduled 14-21d out so a first-week user doesn't
    // see it immediately (the surprise should land after trust is built).
    ronkiMood: 'normal',
    ronkiNextBadDayDate: scheduleNextBadRonkiDay(new Date()),
    ronkiLearnedSkills: [],
    ronkiSkillPractice: {},
    ronkiLearnBannerSeen: {},
    micropediaDiscovered: [],
    freundArcsCompleted: [],
    freundCallbacksPending: [],
    parentQuestLines: [],
    louisSeenParentIntro: false,
    journalEverUnlocked: false,
    feelingsLog: [],
    mintBadgesEarned: [],
    mintGamesPlayed: [],
    forscherFunkelUnlocked: false,
    familyConfig: DEFAULT_FAMILY_CONFIG,
    arcEngine: initialArcState(),
    bossKilledToday: false,
    arcBeatAdvancedToday: false,
    completedSpecialQuests: {},
    dailyHabits: {},
    viewsVisited: [],
    pendingEgg: null,
    collectedEggs: [],
    eggTriggersFired: {},
    gamesPlayedEver: [],
    funkelzeitMinutesToday: 0,
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<TaskState | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const [toastTrigger, setToastTrigger] = useState(0);
  const celebQueue = useRef<CelebrationEvent[]>([]);
  const [celebTick, setCelebTick] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const cloudTimer = useRef<ReturnType<typeof setTimeout>>();
  // Forward-reference to syncRonkiMood so earlier-declared callbacks
  // (e.g. `complete`) can trigger it without hitting the TDZ. Assigned
  // below once syncRonkiMood is declared.
  const syncRonkiMoodRef = useRef<(() => void) | null>(null);

  const queueCelebration = useCallback((evt: CelebrationEvent) => {
    celebQueue.current.push(evt);
    setCelebTick(t => t + 1); // trigger effect
  }, []);

  // Drain celebration queue one at a time
  useEffect(() => {
    if (celebration || celebQueue.current.length === 0) return;
    const next = celebQueue.current.shift();
    if (next) setCelebration(next);
  }, [celebration, celebTick]);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const fireCelebration = useCallback(() => {
    queueCelebration({ type: 'victory' });
  }, [queueCelebration]);

  // ── Load on mount (cloud-aware) ──
  useEffect(() => {
    (async () => {
      let raw: (GameState & TaskState) | null = null;
      try {
        // Any exception during rehydration used to leave setLoading(true)
        // forever → app stuck on "Lädt..." pill. Marc flag 24 Apr 2026:
        // phone stuck on Loading. Fallback to a fresh-start initial state
        // so the kid at least sees SOMETHING instead of a dead screen.
        //
        // Load priority (Apr 27 2026, QR auth Phase 2):
        //   1. Profile token (BeyArena pattern) → cloud-keyed by token,
        //      merged with local. This is the new default path.
        //   2. Auth user.id → legacy game_state path (the table never
        //      existed; kept for any latent caller).
        //   3. Local-only IndexedDB / localStorage.
        const activeToken = getActiveToken();
        raw = (activeToken
          ? await storage.syncLoadByToken(activeToken)
          : user
            ? await storage.syncLoad(user.id)
            : await storage.load()
        ) as (GameState & TaskState) | null;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[storage] load failed, booting fresh:', err);
      }
      if (raw && raw.quests) {
        // Drop quests whose id no longer exists in the source lists.
        // This catches stale persisted quests after a quest is removed
        // from constants.ts (e.g. s_water retired Apr 2026) — without
        // this filter, the UI renders `quest.<id>` literal because the
        // i18n key is also gone.
        const KNOWN_QUEST_IDS = new Set([
          ...SCHOOL_QUESTS.map(q => q.id),
          ...VACATION_QUESTS.map(q => q.id),
          ...SIDE_QUESTS.map(q => q.id),
          FOOTBALL.id,
        ]);
        const cleanedQuests = (raw.quests as Quest[]).filter(q => KNOWN_QUEST_IDS.has(q.id));
        let s: TaskState = {
          quests: cleanedQuests,
          sm: raw.sm || {},
          lastDate: raw.lastDate || '',
          vacMode: raw.vacMode || false,
          dt: raw.dt || 0,
          hp: raw.coins || raw.hp || 0,
          drachenEier: raw.drachenEier || 0,
          eggType: raw.eggType || 'dragon',
          heroGender: raw.heroGender || null,
          eggProgress: raw.eggProgress || 0,
          eggHatched: raw.eggHatched || false,
          moodAM: raw.moodAM ?? null,
          moodPM: raw.moodPM ?? null,
          dailyWaterCount: raw.dailyWaterCount || 0,
          boss: raw.boss || null,
          bossTrophies: raw.bossTrophies || [],
          bossKilledToday: raw.bossKilledToday ?? false,
          arcBeatAdvancedToday: raw.arcBeatAdvancedToday ?? false,
          dreamHighlights: raw.dreamHighlights?.highlights && typeof raw.dreamHighlights.seen === 'boolean'
            ? raw.dreamHighlights
            : undefined,
          catFed: raw.catFed || false,
          catPetted: raw.catPetted || false,
          catPlayed: raw.catPlayed || false,
          catEvo: raw.catEvo || 0,
          // Drachennest reframe: rehydrate vital meters; default to 70 each
          // for legacy saves that pre-date the field.
          ronkiVitals: (raw as any).ronkiVitals || { hunger: 70, liebe: 70, energie: 70 },
          // Drachennest Funken — default to 0, capped at 12 in
          // reducer math so a stale save with a higher value still
          // collapses cleanly on next earn.
          careTokens: typeof (raw as any).careTokens === 'number' ? (raw as any).careTokens : 0,
          // hatchTraits: array of trait IDs accumulated across
          // evolution rolls. Default empty array for legacy saves
          // that pre-date the field.
          hatchTraits: Array.isArray((raw as any).hatchTraits) ? (raw as any).hatchTraits : [],
          // Friends + sign-up — emojiCode is undefined until the
          // kid picks 3 emojis; friends + winksReceived default
          // to empty arrays so the visit surface always renders.
          emojiCode: Array.isArray((raw as any).emojiCode) ? (raw as any).emojiCode : undefined,
          friends: Array.isArray((raw as any).friends) ? (raw as any).friends : [],
          winksReceived: Array.isArray((raw as any).winksReceived) ? (raw as any).winksReceived : [],
          winksSent: Array.isArray((raw as any).winksSent) ? (raw as any).winksSent : [],
          caveStyle: (raw as any).caveStyle && typeof (raw as any).caveStyle === 'object'
            ? {
                wallpaper: (raw as any).caveStyle.wallpaper || 'warm-amber',
                floor:     (raw as any).caveStyle.floor     || 'amber',
              }
            : { wallpaper: 'warm-amber', floor: 'amber' },
          // Drachennest expedition state: default to home/morgenwald with an
          // empty log for legacy saves that pre-date the field.
          expedition: (raw as any).expedition || { state: 'home', biome: 'morgenwald' },
          expeditionLog: (raw as any).expeditionLog || [],
          lastTaskCompletionAt: (raw as any).lastTaskCompletionAt,
          loginBonusClaimed: raw.loginBonusClaimed || false,
          onboardingDone: raw.onboardingDone || false,
          // Onboarding-parent-first rework (23 Apr 2026) — migration:
          // pre-rework users already past onboardingDone shouldn't be dragged
          // through the new intros/handoff/greeting retroactively. If their
          // save has onboardingDone=true, we default all three new flags to
          // true. Fresh installs get the full sequence.
          kidIntroSeen: (raw as any).kidIntroSeen ?? !!raw.onboardingDone,
          parentHandoffBackSeen: (raw as any).parentHandoffBackSeen ?? !!raw.onboardingDone,
          lagerfeuerGreeted: (raw as any).lagerfeuerGreeted ?? !!raw.onboardingDone,
          journalMemory: raw.journalMemory || '',
          journalGratitude: raw.journalGratitude || [],
          journalDayEmoji: raw.journalDayEmoji ?? null,
          journalAchievements: raw.journalAchievements || [],
          journalHistory: raw.journalHistory || [],
          journalSaved: raw.journalSaved || false,
          bossDmgToday: raw.bossDmgToday || 0,
          orbs: raw.orbs || { vitality: 0, radiance: 0, patience: 0, wisdom: 0 },
          heroStats: raw.heroStats || { mut: 0, fokus: 0, ordnung: 0 },
          xp: raw.xp || raw.coins || 0,
          chestsClaimed: raw.chestsClaimed || [],
          activeMissions: raw.activeMissions || [],
          completedMissions: raw.completedMissions || [],
          gearInventory: raw.gearInventory || [],
          equippedGear: raw.equippedGear || {},
          unlockedBadges: raw.unlockedBadges || [],
          totalTasksDone: raw.totalTasksDone || 0,
          gamesPlayedToday: raw.gamesPlayedToday || [],
          birthdayEpic: raw.birthdayEpic || { done: [], completed: false },
          earnedTraits: raw.earnedTraits || [],
          eveningRitualCompletedAt: raw.eveningRitualCompletedAt || undefined,
          ronkiStamina: raw.ronkiStamina ?? 10,
          ronkiStaminaUpdatedAt: raw.ronkiStaminaUpdatedAt || new Date().toISOString(),
          // Minigame gating — default 'frei' (no gate) per playtest feedback
          // 22 Apr 2026: the old routine-gate backfired on weekends (Louis
          // hit an invisible wall). Parents who want the gate opt IN.
          minigameAccessMode: raw.minigameAccessMode || 'frei',
          minigameStaminaMax: raw.minigameStaminaMax ?? 10,
          minigameTimeWindow: raw.minigameTimeWindow || { startHour: 16, endHour: 18 },
          // Parent account + onboarding — existing users pre-rework get
          // parentOnboardingDone=true so we don't force them through
          // Track A retroactively. New users go through it.
          parentPin: raw.parentPin ?? null,
          parentPinIsDefault: raw.parentPinIsDefault ?? true,
          parentOnboardingDone: raw.parentOnboardingDone ?? !!raw.onboardingDone,
          pwaPromptShown: raw.pwaPromptShown ?? false,
          lastLoginDate: raw.lastLoginDate,
          // Haptics — default gentle for age-6 safety.
          hapticsEnabled: raw.hapticsEnabled ?? true,
          hapticsMode: raw.hapticsMode ?? 'gentle',
          // Analytics — existing users default OFF (opt-in), matching
          // fresh-install. Prior installs that briefly defaulted ON during
          // the 22-23 Apr 2026 dev window revert here too — explicit opt-in
          // wins. Device_id stays undefined until analytics.ts lazy-init.
          analyticsDeviceId: raw.analyticsDeviceId,
          analyticsEnabled: raw.analyticsEnabled ?? false,
          // RPG-Modus — off for all existing users; parent-opt-in later.
          rpgModeEnabled: raw.rpgModeEnabled ?? false,
          // Hero chibi composition — preserved verbatim if saved, else
          // undefined (falls back to stock hero-default image).
          heroFace: raw.heroFace,
          // Bonding Agent migration — saves predating Apr 2026 don't have
          // these fields. Default to normal mood + schedule a first bad
          // day 14-21d out so returning users aren't ambushed on next open.
          ronkiMood: (raw as any).ronkiMood || 'normal',
          ronkiMoodSetDate: (raw as any).ronkiMoodSetDate,
          ronkiNextBadDayDate: (raw as any).ronkiNextBadDayDate || scheduleNextBadRonkiDay(new Date()),
          ronkiLearnedSkills: (raw as any).ronkiLearnedSkills || [],
          ronkiSkillPractice: (raw as any).ronkiSkillPractice || {},
          ronkiLearnBannerSeen: (raw as any).ronkiLearnBannerSeen || {},
          tabUnlocksSeen: (raw as any).tabUnlocksSeen || {},
          tabCoachmarksSeen: (raw as any).tabCoachmarksSeen || {},
          crystalInventory: (raw as any).crystalInventory || {},
          freundFriendship: (raw as any).freundFriendship || {},
          todaysVisitor: (raw as any).todaysVisitor ?? null,
          completedColoringPages: (raw as any).completedColoringPages || [],
          todaysKraftwort: (raw as any).todaysKraftwort ?? null,
          micropediaDiscovered: raw.micropediaDiscovered || [],
          freundArcsCompleted: raw.freundArcsCompleted || [],
          freundCallbacksPending: raw.freundCallbacksPending || [],
          parentQuestLines: raw.parentQuestLines || [],
          louisSeenParentIntro: raw.louisSeenParentIntro ?? false,
          journalEverUnlocked: raw.journalEverUnlocked ?? false,
          feelingsLog: raw.feelingsLog || [],
          mintBadgesEarned: raw.mintBadgesEarned || [],
          mintGamesPlayed: raw.mintGamesPlayed || [],
          forscherFunkelUnlocked: raw.forscherFunkelUnlocked ?? false,
          // Merge with DEFAULT so legacy saves that only persisted a subset of
          // familyConfig keys (e.g. {childName, parentMessage}) still get a
          // full, valid config on boot — otherwise FamilyTab would crash trying
          // to read .length on missing arrays like `siblings`/`dailyHabits`.
          familyConfig: {
            ...DEFAULT_FAMILY_CONFIG,
            ...(raw.familyConfig || {}),
            siblings: Array.isArray(raw.familyConfig?.siblings)
              ? raw.familyConfig.siblings
              : DEFAULT_FAMILY_CONFIG.siblings,
            dailyHabits: Array.isArray(raw.familyConfig?.dailyHabits)
              ? raw.familyConfig.dailyHabits
              : DEFAULT_FAMILY_CONFIG.dailyHabits,
            recurringActivities: Array.isArray(raw.familyConfig?.recurringActivities)
              ? raw.familyConfig.recurringActivities
              : DEFAULT_FAMILY_CONFIG.recurringActivities,
            parentMessage: (raw.familyConfig?.parentMessage && typeof raw.familyConfig.parentMessage === 'object')
              ? { ...DEFAULT_FAMILY_CONFIG.parentMessage, ...raw.familyConfig.parentMessage }
              : DEFAULT_FAMILY_CONFIG.parentMessage,
          },
          completedSpecialQuests: raw.completedSpecialQuests || {},
          dailyHabits: (raw as any).dailyHabits || {},
          viewsVisited: raw.viewsVisited || [],
          pendingEgg: raw.pendingEgg || null,
          collectedEggs: raw.collectedEggs || [],
          eggTriggersFired: raw.eggTriggersFired || {},
          gamesPlayedEver: raw.gamesPlayedEver || [],
          funkelzeitMinutesToday: raw.funkelzeitMinutesToday || 0,
          // Intentionally left as-is: undefined on pre-variant saves triggers
          // the one-time CompanionVariantMigration modal. Once set, it sticks.
          companionVariant: (raw as any).companionVariant,
          // Onboarding + teach-beat anchors (code-review flag 24 Apr 2026:
          // these were saved but never rehydrated, so the quiet-window
          // math + Wave-3 callback fell back every reload).
          onboardingDate: (raw as any).onboardingDate,
          taughtSignature: (raw as any).taughtSignature,
          taughtAt: (raw as any).taughtAt,
          // Fire-breath progression — per-flavor teach dates. Gates
          // flavorForQuest so non-flame animations only play after their
          // ritual has been completed. See backlog_fire_breath_progression.md.
          taughtBreaths: (raw as any).taughtBreaths,
          pendingRitual: (raw as any).pendingRitual,
          // Garden (core-gameloop-time-stack Phase 1) — lazy-shape.
          // Undefined on saves predating the garden feature; stays
          // undefined until the kid first interacts (plantSeed/placeDecor
          // construct the default shape via getOrInitGarden). Without
          // this field in the allowlist, planted seeds + placed decor
          // were silently dropped on every reload.
          // QA flag 24 Apr 2026 (C1): persistence bug.
          garden: (raw as any).garden,
        };
        // One-time migration: reset inflated HP from old economy
        if (!raw._v2_economy_reset) {
          s.hp = Math.min(s.hp, 50); // cap at 50 from pre-rebalance inflation
          s.heroStats = s.heroStats || { mut: 0, fokus: 0, ordnung: 0 };
          s._v2_economy_reset = true;
        }
        // Migration (fire-breath progression): kids who completed the
        // onboarding teach-beat before taughtBreaths existed still have
        // their taughtAt anchor. Back-fill taughtBreaths.flame from it
        // so they don't have to re-teach the base flame just to see any
        // fire animations. If taughtAt is missing too, the next
        // completeOnboarding / teachBreath call will seed it fresh.
        if (s.taughtAt && !s.taughtBreaths?.flame) {
          s.taughtBreaths = {
            ...(s.taughtBreaths || {}),
            flame: s.taughtAt,
          };
        }
        // Catch-up ritual for saves loaded AFTER the feature shipped that
        // are already past one or more thresholds. Without this, a kid
        // with totalTasksDone=75 at deploy time has `wasAbove=true` on
        // every future threshold check for sparkle + heart → those
        // rituals never queue. Queue the lowest-threshold untaught
        // flavor here (if any) so they get a chance to earn it on next
        // Ronki-profile visit. Only runs if no ritual is already pending.
        // Code-review finding 24 Apr 2026.
        if (!s.pendingRitual) {
          const tasks = s.totalTasksDone || 0;
          const taught = s.taughtBreaths || {};
          for (const flavor of RITUAL_UNLOCK_ORDER) {
            if (!taught[flavor] && tasks >= RITUAL_TASK_THRESHOLDS[flavor]) {
              s.pendingRitual = flavor;
              break;
            }
          }
        }
        // Day transition: rebuild quests if date changed
        if (s.lastDate !== today()) {
          s = applyDayTransition(s);
        }
        // Ensure boss exists
        const allBossIds = BOSSES.map(b => b.id);
        if (!s.boss || !allBossIds.includes(s.boss.id)) s.boss = assignBoss(s.catEvo || 0);
        setState(s);
      } else {
        // Fresh start
        setState(createInitialState());
      }
      // QR-auth Phase 1 (Apr 27 2026): tag any already-onboarded
      // profile with a profile token so the parent can share the URL
      // with another device and land on the same profile. No-op for
      // first-time visitors (their token gets assigned at parent-
      // setup completion in Phase 2). See docs/specs/qr-profile-auth.md.
      try {
        const onboarded = !!(raw && (raw as any).onboardingDone);
        ensureTokenForExistingProfile(onboarded);
      } catch { /* private mode / quota — non-fatal */ }
      // Always flip loading off, even if rebuild failed halfway — a
      // partially-populated state is better than a stuck Loading screen.
      setLoading(false);
    })().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[TaskContext] rehydration threw, booting fresh:', err);
      try { setState(createInitialState()); } catch { /* last-ditch */ }
      setLoading(false);
    });
  }, []);

  // ── Save on state change (debounced local + cloud) ──
  useEffect(() => {
    if (!state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      // Merge into full GameState for storage compatibility
      const raw = await storage.load() as GameState | null;
      const merged = { ...(raw || {}), ...state } as GameState;
      await storage.save(merged);
    }, 400);

    // Cloud sync (debounced, slightly longer than local). Apr 27 2026
    // Phase-2: token-keyed save is the primary path. The legacy user-
    // id path is kept for any latent caller, but the game_state table
    // never existed so it always no-op'd anyway.
    const activeToken = getActiveToken();
    if (activeToken) {
      clearTimeout(cloudTimer.current);
      cloudTimer.current = setTimeout(async () => {
        const raw = await storage.load() as GameState | null;
        const merged = { ...(raw || {}), ...state } as GameState;
        await storage.cloudSaveByToken(activeToken, merged);
      }, 1500);
    } else if (user) {
      clearTimeout(cloudTimer.current);
      cloudTimer.current = setTimeout(async () => {
        const raw = await storage.load() as GameState | null;
        const merged = { ...(raw || {}), ...state } as GameState;
        await storage.cloudSave(user.id, merged);
      }, 1500);
    }

    return () => {
      clearTimeout(saveTimer.current);
      clearTimeout(cloudTimer.current);
    };
  }, [state, user]);

  // ── Arc on-accept hydration: tag routine beats onto matching quests ──
  useEffect(() => {
    if (state?.arcEngine?.phase !== 'active' || !state.arcEngine.activeArcId) return;
    const arc = findArc(state.arcEngine.activeArcId);
    if (!arc) return;
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        quests: prev.quests.map(q => {
          const matchingBeat = arc.beats.find(
            (b): b is RoutineBeat => b.kind === 'routine' && (b as RoutineBeat).questId === q.id
          );
          return matchingBeat ? { ...q, arcBeatId: matchingBeat.id } : q;
        }),
      };
    });
  }, [state?.arcEngine?.phase]);

  // ── Day transition ──
  function applyDayTransition(s: TaskState): TaskState {
    // Update streak map from yesterday's completed quests
    const newSm = { ...s.sm };
    for (const q of s.quests) {
      if (q.sideQuest) continue;
      if (q.done) {
        newSm[q.id] = (newSm[q.id] || 0) + 1;
      } else {
        newSm[q.id] = 0;
      }
    }
    // Check if all main quests were done yesterday
    const mainQuests = s.quests.filter(q => !q.sideQuest);
    const allDoneYesterday = mainQuests.length > 0 && mainQuests.every(q => q.done);

    // Chest milestone check (streak-based milestones removed in Phase 1)
    const chestsClaimed = [...(s.chestsClaimed || [])];

    // Mission progress from yesterday's quests
    const morningDone = s.quests.filter(q => q.anchor === 'morning' && q.done && !q.sideQuest);
    const eveningDone = s.quests.filter(q => q.anchor === 'evening' && q.done && !q.sideQuest);
    const allMorningDone = morningDone.length > 0 && s.quests.filter(q => q.anchor === 'morning' && !q.sideQuest).every(q => q.done);
    const allEveningDone = eveningDone.length > 0 && s.quests.filter(q => q.anchor === 'evening' && !q.sideQuest).every(q => q.done);
    const readDone = s.quests.some(q => q.id === 's8' && q.done) || s.quests.some(q => q.id === 'v6' && q.done);
    const footballDone = s.quests.some(q => q.id === 'ft' && q.done);

    let activeMissions = [...(s.activeMissions || [])];
    let completedMissions = [...(s.completedMissions || [])];
    let missionHp = 0;
    let missionEvo = 0;
    const gearAwarded: string[] = [];

    activeMissions = activeMissions.map(m => {
      const def = WEEKLY_MISSIONS.find(wm => wm.id === m.id);
      if (!def || m.progress >= def.target) return m;
      let inc = 0;
      if (def.goal === 'allMorning' && allMorningDone) inc = 1;
      if (def.goal === 'allEvening' && allEveningDone) inc = 1;
      if (def.goal === 'allDone' && allDoneYesterday) inc = 1;
      if (def.goal === 'read' && readDone) inc = 1;
      if (def.goal === 'football' && footballDone) inc = 1;
      if (def.goal === 'water') inc = 0; // water tracked in real-time
      const newProg = Math.min(m.progress + inc, def.target);
      if (newProg >= def.target && !completedMissions.includes(m.id)) {
        completedMissions.push(m.id);
        missionHp += def.reward.hp;
        missionEvo += def.reward.evo;
        // Award gear for this mission
        const gear = GEAR_ITEMS.find(g => g.missionId === def.id);
        if (gear && !gearAwarded.includes(gear.id)) gearAwarded.push(gear.id);
        queueCelebration({ type: 'victory', payload: { mission: def.title, hp: def.reward.hp, evo: def.reward.evo } });
      }
      return { ...m, progress: newProg };
    });
    // Remove completed missions from active
    activeMissions = activeMissions.filter(m => !completedMissions.includes(m.id) || !s.completedMissions?.includes(m.id));
    s = { ...s, hp: (s.hp || 0) + missionHp, catEvo: (s.catEvo || 0) + missionEvo, gearInventory: [...(s.gearInventory || []), ...gearAwarded] };

    // Rebuild quests for today, preserve streaks
    const quests = buildDay(s.vacMode).map(q => ({
      ...q,
      streak: newSm[q.id] || 0,
    }));

    // Archive yesterday's journal entry if it had content
    let journalHistory = [...(s.journalHistory || [])];
    if (s.journalMemory || (s.journalGratitude && s.journalGratitude.length > 0) || s.journalDayEmoji !== null) {
      const entry: JournalEntry = {
        date: s.lastDate,
        memory: s.journalMemory || '',
        gratitude: s.journalGratitude || [],
        dayEmoji: s.journalDayEmoji ?? null,
        achievements: s.journalAchievements || [],
        mood: s.moodAM ?? null,
      };
      const existingIdx = journalHistory.findIndex(e => e.date === entry.date);
      if (existingIdx >= 0) journalHistory[existingIdx] = entry;
      else journalHistory.push(entry);
    }

    // ── Dream Strip snapshot ──
    // Capture yesterday's highlights before the daily reset so DreamStrip
    // can show Ronki's impressions when Louis opens the app tomorrow.
    const dreamSnap: PrevDaySnapshot = {
      bossKilledToday: s.bossKilledToday ?? false,
      allCareDone: Boolean(s.catFed && s.catPetted && s.catPlayed),
      allQuestsDone: allDoneYesterday,
      arcBeatAdvancedToday: s.arcBeatAdvancedToday ?? false,
    };
    const dreamHighlights = buildHighlights(dreamSnap);

    return {
      ...s,
      quests,
      sm: newSm,
      chestsClaimed,
      activeMissions,
      completedMissions,
      lastDate: today(),
      dt: 0,
      moodAM: null,
      moodPM: null,
      dailyWaterCount: 0,
      boss: assignBoss(s?.catEvo || 0),
      catFed: false,
      catPetted: false,
      catPlayed: false,
      // Reset the daily-habit completion map so today's taps re-enable the
      // habit quests. Without this, doneMap carries over from yesterday,
      // `completeHabit` short-circuits via the idempotent guard, AND the
      // diminishing-returns multiplier reads a nonzero count → first habit
      // today rewards 0 HP instead of full. Caught in the launch-prep
      // code review (Apr 2026) before any kid hit the wall.
      dailyHabits: {},
      loginBonusClaimed: false,
      journalMemory: '',
      journalGratitude: [],
      journalDayEmoji: null,
      journalAchievements: [],
      journalHistory,
      journalSaved: false,
      bossDmgToday: 0,
      gamesPlayedToday: [],
      // Day transition: refill stamina to the parent-configured max.
      ronkiStamina: prev.minigameStaminaMax ?? 10,
      ronkiStaminaUpdatedAt: new Date().toISOString(),
      dreamHighlights,
      bossKilledToday: false,
      arcBeatAdvancedToday: false,
      funkelzeitMinutesToday: 0,
    };
  }

  // ── Complete a quest ──
  const complete = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      const q = prev.quests.find(q => q.id === id);
      if (!q) return prev;

      const quests = prev.quests.map(quest => {
        if (quest.id !== id) return quest;
        const completions = (quest.completions || 0) + 1;
        const target = quest.target || 1;
        const done = completions >= target;
        return { ...quest, completions, done };
      });

      const dt = prev.dt + (q.minutes || 0);
      const hpGain = q.xp; // 1:1 XP to HP
      let hp = (prev.hp || 0) + hpGain;
      let screenMin = (prev.drachenEier || 0) + 1; // +1 screen minute per quest
      const prevXp = prev.xp || 0;
      const newXp = prevXp + q.xp;

      // Boss damage — gear courage boosts damage, defense boosts loot
      let boss = prev.boss ? { ...prev.boss } : null;
      let bossTrophies = [...(prev.bossTrophies || [])];
      let bossDmgToday = prev.bossDmgToday || 0;
      let bossKilledToday = prev.bossKilledToday ?? false;
      let arcBeatAdvancedToday = prev.arcBeatAdvancedToday ?? false;
      if (boss && boss.hp > 0) {
        // Calculate gear bonus from equipped courage stat
        const equipped = prev.equippedGear || {};
        let gearCourage = 0;
        let gearDefense = 0;
        for (const slotId of Object.values(equipped)) {
          const g = GEAR_ITEMS.find(gi => gi.id === slotId);
          if (g) {
            gearCourage += g.stats.courage || 0;
            gearDefense += g.stats.defense || 0;
          }
        }
        // Base damage + courage bonus (1 extra dmg per 5 courage)
        const baseDmg = Math.max(5, Math.floor(q.xp * 0.8));
        const courageBonus = Math.floor(gearCourage / 5);
        const dmg = baseDmg + courageBonus;
        boss.hp = Math.max(0, boss.hp - dmg);
        bossDmgToday += dmg;
        if (boss.hp <= 0) {
          // Boss HP reward zeroed in the Apr 2026 economy rebalance per
          // Marc — the boss mechanic stays alive for a potential future
          // older-cohort "RPG-Modus" but mints zero HP for today's kid
          // audience (whose core loop is routine + care, not combat).
          // bd lookup + trophy + killed-today flag preserved so the
          // existing Buch / celebration surfaces continue to read boss
          // history correctly when the feature is re-activated via
          // state.rpgModeEnabled.
          const bd = BOSSES.find(b => b.id === boss!.id);
          if (bd && !bossTrophies.includes(boss.id)) bossTrophies.push(boss.id);
          bossKilledToday = true;
        }
      }

      // Award orb based on quest category
      const orbMap: Record<string, keyof typeof prev.orbs> = {
        // Vitalität — hygiene & body care
        s1: 'vitality', s3: 'vitality', s12: 'vitality', s13: 'vitality', s14: 'vitality',
        s15: 'vitality', s6b: 'vitality', v1: 'vitality', v3: 'vitality', v10: 'vitality',
        v11: 'vitality', v12: 'vitality', v13: 'vitality', v5b: 'vitality',
        // Weisheit — learning & reading
        s7: 'wisdom', s8: 'wisdom', v6: 'wisdom', s_signature: 'wisdom',
        // Geduld — responsibility & chores
        s2: 'patience', s4: 'patience', s5: 'patience', s_lunchbox: 'patience',
        s_water: 'patience', s_packcheck: 'patience', v2: 'patience', v4: 'patience',
        v7: 'patience', sq_geschirr: 'patience', sq_zimmer: 'patience',
        // Leuchten — physical & outdoors
        sq_draussen: 'radiance', sq_fussball: 'radiance', ft: 'radiance',
      };
      const orbTypes = ['vitality', 'radiance', 'patience', 'wisdom'] as const;
      const orbTotal = (Object.values(prev.orbs) as number[]).reduce((a, b) => a + b, 0);
      const orbKey = orbMap[id] || orbTypes[orbTotal % 4];
      const orbs = { ...(prev.orbs || { vitality: 0, radiance: 0, patience: 0, wisdom: 0 }) };
      orbs[orbKey] += 1;

      // Accumulate hero stats (long-term progression)
      const heroStats = { ...(prev.heroStats || { mut: 0, fokus: 0, ordnung: 0 }) };
      const anchor = q.anchor || '';
      if (anchor === 'morning' || anchor === 'bedtime') heroStats.ordnung += 1;
      else if (anchor === 'evening') heroStats.fokus += 1;
      if (q.sideQuest || anchor === 'hobby') heroStats.mut += 2;
      if (boss && boss.hp <= 0 && prev.boss && prev.boss.hp > 0) heroStats.mut += 3; // boss defeat bonus

      // Level-up detection
      const prevLevel = getLevel(prevXp);
      const newLevel = getLevel(newXp);
      if (newLevel > prevLevel) {
        queueCelebration({ type: 'levelUp', payload: { level: newLevel, prevLevel } });
      }

      // Victory detection — all main quests done
      const mainQuests = quests.filter(qq => !qq.sideQuest);
      const allDone = mainQuests.length > 0 && mainQuests.every(qq => qq.done);
      const wasDone = prev.quests.filter(qq => !qq.sideQuest).every(qq => qq.done);
      if (allDone && !wasDone) {
        queueCelebration({ type: 'victory' });
        screenMin += 3; // bonus screen minutes for completing all quests
      }

      // Track total tasks done
      const totalTasksDone = (prev.totalTasksDone || 0) + 1;

      // Badge checking
      const unlockedBadges = [...(prev.unlockedBadges || [])];
      const checkVals: Record<string, boolean> = {
        sd1: totalTasksDone >= 1,
        sd3: false,
        sd7: false,
        sd30: false,
        lvl5: getLevel(newXp) >= 5,
        lvl10: getLevel(newXp) >= 10,
        tasks50: totalTasksDone >= 50,
        tasks100: totalTasksDone >= 100,
        gear3: (prev.gearInventory || []).length >= 3,
      };
      for (const badge of BADGES) {
        if (!unlockedBadges.includes(badge.id) && checkVals[badge.check]) {
          unlockedBadges.push(badge.id);
        }
      }

      // If the completed quest is tagged as an arc beat, advance the arc state.
      let arcEngine = prev.arcEngine ?? initialArcState();
      if (q.arcBeatId) {
        const prevBeatIndex = arcEngine.activeBeatIndex;
        const prevCompletedLen = arcEngine.completedArcIds.length;
        arcEngine = advanceBeat(arcEngine, q.arcBeatId);
        if (
          arcEngine.activeBeatIndex !== prevBeatIndex ||
          arcEngine.completedArcIds.length !== prevCompletedLen
        ) {
          arcBeatAdvancedToday = true;
        }
      }

      const prevTotal = (prev.totalQuestCompletions ?? {})[id] || 0;
      const totalQuestCompletions = { ...(prev.totalQuestCompletions ?? {}), [id]: prevTotal + 1 };

      // Fire-breath ritual trigger. If totalTasksDone just crossed a
      // threshold AND the flavor isn't taught yet AND no ritual is
      // already pending, queue it. The Feuer tab in RonkiProfile shows
      // a "Ritual wartet" card that the kid taps to start the ritual.
      // Only fires once per threshold crossing (the wasAbove check).
      let pendingRitual = prev.pendingRitual;
      if (!pendingRitual) {
        const taught = prev.taughtBreaths || {};
        for (const flavor of RITUAL_UNLOCK_ORDER) {
          const threshold = RITUAL_TASK_THRESHOLDS[flavor];
          const wasAbove = (prev.totalTasksDone || 0) >= threshold;
          const isAbove = totalTasksDone >= threshold;
          if (!taught[flavor] && isAbove && !wasAbove) {
            pendingRitual = flavor;
            break;  // one ritual at a time; later crossings wait their turn
          }
        }
      }

      // Drachennest reframe: the kid completing a task tops up one of
      // Ronki's vital meters based on the quest's anchor. Morning quests
      // Cut #9 (Marc 26 Apr 2026): the entire vitals system was
      // deleted. The anchor-routed top-up had been commented out
      // already, careForRonki was wired but never called from any
      // surface, and the expedition CTA gated on "all vitals = 100"
      // was therefore unreachable in normal play. The three-agent
      // audit (child UX / companion comparables / code) all
      // recommended cutting; the Northstar's "presence not metric"
      // line made it an honesty call. Vitals + careTokens stay on
      // the type for persistence migration safety but are no
      // longer mutated. Expedition CTA in RoomHub now triggers off
      // morning-routine-complete.
      const careTokens = prev.careTokens || 0;
      const ronkiVitals = prev.ronkiVitals || { hunger: 70, liebe: 70, energie: 70 };
      const expedition = prev.expedition || { state: 'home' as const, biome: 'morgenwald' as const };

      // Stamp the latest completion time so the PWA prompt gate (and
      // any future "settle after task" guard) can hold quiet
      // notifications back during the inline QuestEater beat. Marc
      // 25 Apr 2026 flagged that three notifications fired at once
      // when the first quest closed — install prompt + achievement
      // + Ronki burp. The PWA gate now waits 8s after this stamp.
      const lastTaskCompletionAt = new Date().toISOString();

      return { ...prev, quests, dt, hp, drachenEier: screenMin, xp: newXp, boss, bossTrophies, bossDmgToday, orbs, heroStats, totalTasksDone, unlockedBadges, arcEngine, bossKilledToday, arcBeatAdvancedToday, totalQuestCompletions, pendingRitual, ronkiVitals, careTokens, expedition, lastTaskCompletionAt };
    });
    setToastTrigger(t => t + 1);
    // Re-evaluate organic mood triggers right after the completion
    // lands — fixes the case where Louis is ALREADY on the Hub tab
    // when he ticks the last main quest of the day: without this
    // call, Hub's mount effect has already run (empty deps), so the
    // 'gut' flip wouldn't fire until he navigated away and back.
    // syncRonkiMood is idempotent per day so extra calls are safe.
    queueMicrotask(() => syncRonkiMoodRef.current?.());
  }, []);

  // ── Set mood ──
  const setMood = useCallback((period: string, val: number) => {
    setState(prev => prev ? { ...prev, [period]: val } : prev);
  }, []);

  // ── Daily habits (parent-defined: Vitamin D, Zeit mit Liam, etc.) ──
  // Ticks a habit, bumps HP by its configured XP, tracks dailyHabits map.
  // Idempotent per id per day. Orphan fix Apr 2026: DailyHabits.jsx called
  // actions.completeHabit but TaskContext never exposed one, so taps silently
  // no-op'd.
  const completeHabit = useCallback((habitId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const doneMap = (prev as any).dailyHabits || {};
      if (doneMap[habitId]) return prev;
      const habits = prev.familyConfig?.dailyHabits || [];
      const def = habits.find(h => h.id === habitId);
      const baseReward = def?.xp || 5;
      // Diminishing returns (economy rebalance Apr 2026) — 1st habit full
      // reward, 2nd habit 60%, 3rd+ habits 0 HP. Prevents "dummy habits"
      // becoming a mint: a parent configuring 10 habits shouldn't let
      // Louis farm 50 HP/day just by tapping a row of checkboxes. The
      // habit is still marked done + Ronki still reacts — kid gets the
      // confirmation loop without the inflation.
      const n = Object.keys(doneMap).length;
      const multiplier = n === 0 ? 1 : n === 1 ? 0.6 : 0;
      const reward = Math.floor(baseReward * multiplier);
      return {
        ...prev,
        dailyHabits: { ...doneMap, [habitId]: true },
        hp: (prev.hp || 0) + reward,
      } as TaskState;
    });
    setToastTrigger(t => t + 1);
    // Parallel to complete(): re-evaluate moods (habits don't flip
    // gut on their own, but they may cross a hp threshold that a
    // future trigger cares about; also cheap + idempotent).
    queueMicrotask(() => syncRonkiMoodRef.current?.());
  }, []);

  // ── Drink water (also tracks water missions) ──
  const drinkWater = useCallback(() => {
    setState(prev => {
      if (!prev || (prev.dailyWaterCount || 0) >= 6) return prev;
      let activeMissions = [...(prev.activeMissions || [])];
      let completedMissions = [...(prev.completedMissions || [])];
      let bonusHp = 0;
      let bonusEvo = 0;
      const newGear: string[] = [];
      activeMissions = activeMissions.map(m => {
        const def = WEEKLY_MISSIONS.find(wm => wm.id === m.id);
        if (!def || def.goal !== 'water' || m.progress >= def.target) return m;
        const newProg = m.progress + 1;
        if (newProg >= def.target && !completedMissions.includes(m.id)) {
          completedMissions.push(m.id);
          bonusHp += def.reward.hp;
          bonusEvo += def.reward.evo;
          const gear = GEAR_ITEMS.find(g => g.missionId === def.id);
          if (gear && !(prev.gearInventory || []).includes(gear.id)) newGear.push(gear.id);
          queueCelebration({ type: 'victory', payload: { mission: def.title, hp: def.reward.hp, evo: def.reward.evo } });
        }
        return { ...m, progress: newProg };
      });
      return {
        ...prev,
        dailyWaterCount: (prev.dailyWaterCount || 0) + 1,
        // Water sip: +1 HP (was +2). Kept small-positive so the bar
        // fill still mints a tangible point but 6 sips = +6/day, not +12.
        hp: (prev.hp || 0) + 1 + bonusHp,
        catEvo: (prev.catEvo || 0) + bonusEvo,
        activeMissions,
        completedMissions,
        gearInventory: [...(prev.gearInventory || []), ...newGear],
      };
    });
  }, [queueCelebration]);

  // ── Companion care (with evolution detection) ──
  const evolveCheck = useCallback((prevEvo: number, newEvo: number) => {
    const prevStage = getCatStage(prevEvo);
    const newStage = getCatStage(newEvo);
    if (newStage > prevStage) {
      const stageInfo = CAT_STAGES[newStage];
      queueCelebration({ type: 'evolution', payload: { stage: newStage, name: stageInfo.name, emoji: stageInfo.emoji } });
    }
  }, []);

  // Cat-care HP grants compressed from +5/+3/+8 (=+16/day) to +1 each
  // (=+3/day) in the Apr 2026 economy rebalance. Care actions are bonds,
  // not economy taps — their job is evolution progress (catEvo ticks)
  // and the 3-sec animation reaction, not minting HP. The +1 keeps a
  // tiny signal so the kid still feels the tap "counts."
  const feedCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catFed) return prev;
      const newEvo = (prev.catEvo || 0) + 1;
      evolveCheck(prev.catEvo || 0, newEvo);
      return { ...prev, catFed: true, hp: (prev.hp || 0) + 1, catEvo: newEvo };
    });
  }, [evolveCheck]);

  const petCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPetted) return prev;
      const newEvo = (prev.catEvo || 0) + 1;
      evolveCheck(prev.catEvo || 0, newEvo);
      return { ...prev, catPetted: true, hp: (prev.hp || 0) + 1, catEvo: newEvo };
    });
  }, [evolveCheck]);

  const playCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPlayed) return prev;
      const newEvo = (prev.catEvo || 0) + 1;
      evolveCheck(prev.catEvo || 0, newEvo);
      return { ...prev, catPlayed: true, hp: (prev.hp || 0) + 1, catEvo: newEvo };
    });
  }, [evolveCheck]);

  // ── Login bonus ──
  // Apr 2026 economy rebalance: HP grant zeroed per Marc ("shouldn't
  // exist anymore"). The action + state flag stay so legacy call sites
  // don't throw, but claiming mints zero HP — the login-bonus mechanic
  // is dormant pending any future re-introduction.
  const collectLoginBonus = useCallback(() => {
    setState(prev => {
      if (!prev || prev.loginBonusClaimed) return prev;
      return { ...prev, loginBonusClaimed: true };
    });
  }, []);

  const completeOnboarding = useCallback((cfg?: { eggType?: string; dragonVariant?: DragonVariant; companionVariant?: string; heroName?: string; heroGender?: string; taughtSignature?: 'fire'; taughtAt?: string }) => {
    setState(prev => {
      if (!prev) return prev;
      // Onboarding runs the hatch animation in-flow (HatchStep). The
      // companion is visibly hatched by the time we reach the Hub, so
      // bump catEvo past the Baby threshold (CAT_STAGES[1].threshold = 3)
      // on completion. Without this, Hub renders a stage-0 egg right
      // after a dramatic hatch, which reads as broken.
      const babyEvo = Math.max(prev.catEvo || 0, CAT_STAGES[1]?.threshold ?? 3);
      const taughtAtIso = cfg?.taughtAt || prev.taughtAt || new Date().toISOString().slice(0, 10);
      const updated = {
        ...prev,
        onboardingDone: true,
        onboardingDate: prev.onboardingDate || new Date().toISOString().slice(0, 10),
        eggType: cfg?.eggType || prev.eggType,
        heroGender: cfg?.heroGender || prev.heroGender || null,
        catEvo: babyEvo,
        // Piece 3: one-pick-forever colorway. Only set if the onboarding flow
        // actually passed one through (re-pick flow + initial onboarding do).
        companionVariant: cfg?.companionVariant || prev.companionVariant,
        // Wave-3 callback anchor — set once at hatch by TeachFireStep.
        // Falls back to 'fire'/today so re-onboarding flows that don't
        // re-run the teach beat still leave the anchors populated.
        taughtSignature: cfg?.taughtSignature || prev.taughtSignature || 'fire',
        taughtAt: taughtAtIso,
        // Fire-breath progression — flame is the base unlock, granted
        // by completing the onboarding teach beat. Preserve existing
        // date if already set (re-onboarding flow); otherwise seed from
        // the same ISO date as taughtAt so the two anchors agree.
        taughtBreaths: {
          ...(prev.taughtBreaths || {}),
          flame: prev.taughtBreaths?.flame || taughtAtIso,
        },
      };
      const familyConfigPatch: Partial<FamilyConfig> = {};
      if (cfg?.heroName) familyConfigPatch.childName = cfg.heroName;
      if (cfg?.dragonVariant) familyConfigPatch.dragonVariant = cfg.dragonVariant;
      if (Object.keys(familyConfigPatch).length > 0) {
        updated.familyConfig = { ...prev.familyConfig, ...familyConfigPatch };
      }
      return updated;
    });
  }, []);

  // ── Teach a new fire-breath flavor (idempotent) ──
  // Called by post-onboarding teach rituals (sparkle/heart/ember/rainbow)
  // once the kid completes the 2-round success beat. Stamps today's ISO
  // date into state.taughtBreaths[flavor]; noop if the flavor is already
  // taught (protects against double-fire from navigation races).
  // Also clears pendingRitual if the just-taught flavor matches it, so
  // complete() can queue the next one on subsequent milestone crossings.
  const teachBreath = useCallback((flavor: FireBreathFlavor) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.taughtBreaths?.[flavor]) return prev;  // already taught — idempotent
      return {
        ...prev,
        taughtBreaths: {
          ...(prev.taughtBreaths || {}),
          [flavor]: new Date().toISOString().slice(0, 10),
        },
        pendingRitual: prev.pendingRitual === flavor ? undefined : prev.pendingRitual,
      };
    });
  }, []);

  // ── Dismiss a pending ritual without completing it ──
  // Currently unused (the pending ritual stays offered until the kid
  // completes it — that's the design) but exposed for parent-dashboard
  // defer toggle (Phase E) + test harnesses.
  const dismissPendingRitual = useCallback(() => {
    setState(prev => {
      if (!prev || !prev.pendingRitual) return prev;
      return { ...prev, pendingRitual: undefined };
    });
  }, []);

  // careForRonki — deleted in Cut #9 (Marc 26 Apr 2026). Was wired
  // into the actions object but never called from any UI surface
  // after Cut #3 removed the verb tile-row. The action is gone
  // along with the entire vitals-as-mechanic system.

  // ── Friends + sign-up (Drachennest social, 25 Apr 2026) ──
  const setEmojiCode = useCallback((code: string[]) => {
    if (!Array.isArray(code) || code.length !== 3) return;
    setState(prev => prev ? { ...prev, emojiCode: code } : prev);
  }, []);

  const addFriend = useCallback((snap: FriendSnapshot) => {
    if (!snap?.emojiCode || snap.emojiCode.length !== 3) return;
    setState(prev => {
      if (!prev) return prev;
      const list = prev.friends || [];
      const matchIdx = list.findIndex(f =>
        f.emojiCode?.[0] === snap.emojiCode[0] &&
        f.emojiCode?.[1] === snap.emojiCode[1] &&
        f.emojiCode?.[2] === snap.emojiCode[2]
      );
      // De-dupe — refresh the existing entry rather than appending.
      const next = matchIdx >= 0
        ? list.map((f, i) => i === matchIdx ? snap : f)
        : [...list, snap];
      return { ...prev, friends: next };
    });
  }, []);

  const markWinkSeen = useCallback((receivedAt: string) => {
    setState(prev => {
      if (!prev) return prev;
      const list = prev.winksReceived || [];
      return {
        ...prev,
        winksReceived: list.map(w =>
          w.receivedAt === receivedAt ? { ...w, seen: true } : w
        ),
      };
    });
  }, []);

  // setCaveStyle — partial update so a swatch tap on wallpaper
  // doesn't reset the floor (and vice versa). Falls back to the
  // current value, then the default, if either axis is missing.
  const setCaveStyle = useCallback((partial: Partial<{ wallpaper: string; floor: string }>) => {
    setState(prev => {
      if (!prev) return prev;
      const current = prev.caveStyle || { wallpaper: 'warm-amber', floor: 'amber' };
      return {
        ...prev,
        caveStyle: {
          wallpaper: partial.wallpaper ?? current.wallpaper,
          floor:     partial.floor     ?? current.floor,
        },
      };
    });
  }, []);

  // recordWinkSent — caps at 3 per local day per friend (Marc Q3).
  // We close over the cap check + the append in a single setState
  // pass so two rapid taps can't both squeeze through. The boolean
  // return mirrors the in-state check: if the resulting list is the
  // same reference, the cap was hit; otherwise the wink got through.
  const recordWinkSent = useCallback((friend: FriendSnapshot): boolean => {
    if (!friend?.emojiCode || friend.emojiCode.length !== 3) return false;
    const today = new Date().toISOString().slice(0, 10);
    let accepted = false;
    setState(prev => {
      if (!prev) return prev;
      const list = prev.winksSent || [];
      const sentTodayToFriend = list.filter(w =>
        typeof w.sentAt === 'string' &&
        w.sentAt.slice(0, 10) === today &&
        w.toCode?.[0] === friend.emojiCode[0] &&
        w.toCode?.[1] === friend.emojiCode[1] &&
        w.toCode?.[2] === friend.emojiCode[2]
      ).length;
      if (sentTodayToFriend >= 3) {
        // Cap reached — leave state untouched, return false.
        accepted = false;
        return prev;
      }
      accepted = true;
      return {
        ...prev,
        winksSent: [
          ...list,
          { toCode: friend.emojiCode.slice(), sentAt: new Date().toISOString() },
        ],
      };
    });
    return accepted;
  }, []);

  // ── Expedition state machine (Drachennest, 25 Apr 2026) ──
  // Pure state transitions for the Reise surface. Memento generation
  // happens in rangerDeparted so the kid never sees an empty diary
  // slot during the wait. The Reise component owns animation timing
  // (walk-out -> away) + the polling effect that flips away -> waiting
  // when now > returnAt.
  const setExpedition = useCallback((next: NonNullable<TaskState['expedition']>) => {
    setState(prev => prev ? { ...prev, expedition: next } : prev);
  }, []);

  const startExpedition = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const e = prev.expedition || { state: 'home' as const, biome: 'morgenwald' as const };
      // Guard against double-departures: if Ronki is mid-trip, skip.
      if (e.state !== 'home') return prev;
      return { ...prev, expedition: { ...e, state: 'leaving' as const } };
    });
  }, []);

  const rangerDeparted = useCallback(() => {
    // Track only on real state transitions (not no-op guards). Closure
    // flag is set inside the updater because setState is synchronous;
    // by the time setState returns, the flag reflects whether the
    // transition actually fired.
    let didDepart = false;
    let biome: 'morgenwald' = 'morgenwald';
    setState(prev => {
      if (!prev) return prev;
      const e = prev.expedition || { state: 'home' as const, biome: 'morgenwald' as const };
      if (e.state !== 'leaving' && e.state !== 'home') return prev;
      const now = new Date();
      // Return at min(now + 4h, today 14:00). Mirrors the spec copy
      // "Zurück gegen 14:00" so the kid's expectation aligns with the
      // status strip. If it's already past 14:00, return 4h from now.
      const fourLater = new Date(now.getTime() + 4 * 3600 * 1000);
      const today14 = new Date(now);
      today14.setHours(14, 0, 0, 0);
      const returnDate = today14 > now && today14 < fourLater ? today14 : fourLater;
      const memento = pickMorgenwaldMemento(prev.expeditionLog || []);
      didDepart = true;
      biome = e.biome || 'morgenwald';
      return {
        ...prev,
        expedition: {
          state: 'away' as const,
          biome: 'morgenwald' as const,
          departedAt: now.toISOString(),
          returnAt: returnDate.toISOString(),
          pendingMemento: memento,
        },
      };
    });
    if (didDepart) track('expedition.start', { biome });
  }, []);

  const rangerArrived = useCallback(() => {
    let didArrive = false;
    let biome: 'morgenwald' = 'morgenwald';
    setState(prev => {
      if (!prev) return prev;
      const e = prev.expedition;
      if (!e || e.state !== 'away') return prev;
      didArrive = true;
      biome = e.biome || 'morgenwald';
      return { ...prev, expedition: { ...e, state: 'waiting' as const } };
    });
    if (didArrive) track('expedition.return', { biome });
  }, []);

  const receiveMemento = useCallback(() => {
    let didReceive = false;
    let biome: 'morgenwald' = 'morgenwald';
    setState(prev => {
      if (!prev) return prev;
      const e = prev.expedition;
      if (e?.pendingMemento) {
        didReceive = true;
        biome = e.biome || 'morgenwald';
      }
      // Vitals decay back to a baseline 70 each on adventure return
      // (Marc 25 Apr 2026 — Funken loop redesign). Without this the
      // kid would only need to fill vitals once forever; the trip
      // wears Ronki out, the kid earns more Funken via tomorrow's
      // routines, the loop restarts. 70 (not 0) keeps the read
      // friendly — Ronki isn't starving, just ready for more care.
      const tiredVitals = { hunger: 70, liebe: 70, energie: 70 };
      if (!e || !e.pendingMemento) {
        return {
          ...prev,
          expedition: { state: 'home' as const, biome: 'morgenwald' as const },
          ronkiVitals: tiredVitals,
        };
      }
      const log = [...(prev.expeditionLog || []), e.pendingMemento].slice(-24);
      return {
        ...prev,
        expedition: { state: 'home' as const, biome: 'morgenwald' as const },
        expeditionLog: log,
        ronkiVitals: tiredVitals,
      };
    });
    if (didReceive) track('memento.received', { biome });
  }, []);

  // ── Save journal (also archives to history) ──
  const saveJournal = useCallback((data: { memory: string, gratitude: string[], dayEmoji: number | null, achievements: string[] }) => {
    setState(prev => {
      if (!prev) return prev;
      const entry: JournalEntry = {
        date: prev.lastDate,
        memory: data.memory,
        gratitude: data.gratitude,
        dayEmoji: data.dayEmoji,
        achievements: data.achievements,
        mood: prev.moodAM ?? null,
      };
      const history = [...(prev.journalHistory || [])];
      const existingIdx = history.findIndex(e => e.date === entry.date);
      if (existingIdx >= 0) history[existingIdx] = entry;
      else history.push(entry);
      return {
        ...prev,
        journalMemory: data.memory,
        journalGratitude: data.gratitude,
        journalDayEmoji: data.dayEmoji,
        journalAchievements: data.achievements,
        journalHistory: history,
        journalSaved: true,
      };
    });
  }, []);

  // ── Redeem reward (HP-only after cut #6) ──
  // The 'eggs'/Funkelzeit branch was removed. The signature still
  // takes currency for backwards compatibility with any caller still
  // passing it, but a non-'hp' value is now a no-op.
  const redeemReward = useCallback((currency: 'hp' | 'eggs', cost: number) => {
    if (currency !== 'hp') return;
    setState(prev => {
      if (!prev) return prev;
      if ((prev.hp || 0) < cost) return prev;
      return { ...prev, hp: prev.hp - cost };
    });
  }, []);

  // ── Mission management ──
  const startMission = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.activeMissions.some(m => m.id === id)) return prev;
      if (prev.completedMissions.includes(id)) return prev;
      return {
        ...prev,
        activeMissions: [...prev.activeMissions, { id, progress: 0, startDate: today() }],
      };
    });
  }, []);

  const abandonMission = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activeMissions: prev.activeMissions.filter(m => m.id !== id),
      };
    });
  }, []);

  // ── Add HP (used by birthday epic etc. — NOT for mini-games) ──
  const addHP = useCallback((amount: number) => {
    setState(prev => prev ? { ...prev, hp: (prev.hp || 0) + amount } : prev);
  }, []);

  // ── Mini-game reward (cut #6): no more screen-minute reward ──
  // Used to grant +1 drachenEier (screen minute) per unique game per
  // day. After Funkelzeit deletion the action just stamps the
  // played-list and consumes stamina; minigames now cost stamina but
  // don't earn currency. Spielzeug-bei-Ronki ethos.
  const claimGameReward = useCallback((gameId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const played = prev.gamesPlayedToday || [];
      const alreadyClaimed = played.includes(gameId);
      return {
        ...prev,
        gamesPlayedToday: alreadyClaimed ? played : [...played, gameId],
        gamesPlayedEver: prev.gamesPlayedEver?.includes(gameId)
          ? prev.gamesPlayedEver
          : [...(prev.gamesPlayedEver || []), gameId],
        ronkiStamina: Math.max(0, (prev.ronkiStamina ?? 5) - 1),
        ronkiStaminaUpdatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // addScreenMinutes / addFunkelzeitUsage / refundFunkelzeitUsage —
  // all deleted in cut #6 (Funkelzeit deletion, 25 Apr 2026).

  // ── Stamina actions ──
  const consumeStamina = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      // Materialize the lazy-computed current value FIRST, then
      // decrement (code-review fix 25 Apr 2026 — without this the
      // hook reads `base + Math.floor(elapsed/RECHARGE)` for display
      // but the reducer only sees `base`, so a kid who comes back
      // after a long break and taps a game would lose hours of
      // recharge in one tap when we reset ronkiStaminaUpdatedAt
      // here). Same elapsed math the hook uses, kept inline so the
      // helper can stay UI-only.
      const RECHARGE_MIN = 20;
      const max = prev.minigameStaminaMax ?? 10;
      const base = prev.ronkiStamina ?? max;
      const updatedAt = prev.ronkiStaminaUpdatedAt;
      let current = base;
      if (updatedAt && base < max) {
        const elapsedMin = (Date.now() - new Date(updatedAt).getTime()) / 60000;
        const gained = Math.floor(elapsedMin / RECHARGE_MIN);
        current = Math.min(max, base + gained);
      }
      return {
        ...prev,
        ronkiStamina: Math.max(0, current - 1),
        ronkiStaminaUpdatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const restoreStamina = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ronkiStamina: prev.minigameStaminaMax ?? 10,
        ronkiStaminaUpdatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const equipGear = useCallback((gearId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const gear = GEAR_ITEMS.find(g => g.id === gearId);
      if (!gear || !prev.gearInventory.includes(gearId)) return prev;
      return { ...prev, equippedGear: { ...prev.equippedGear, [gear.slot]: gearId } };
    });
  }, []);

  const unequipGear = useCallback((slot: 'head' | 'back' | 'neck') => {
    setState(prev => {
      if (!prev) return prev;
      const eq = { ...prev.equippedGear };
      delete eq[slot];
      return { ...prev, equippedGear: eq };
    });
  }, []);

  const updateBirthdayEpic = useCallback((data: { done: string[]; completed: boolean }) => {
    setState(prev => prev ? { ...prev, birthdayEpic: data } : prev);
  }, []);

  const updateFamilyConfig = useCallback((config: FamilyConfig) => {
    setState(prev => prev ? { ...prev, familyConfig: config } : prev);
  }, []);

  const patchState = useCallback((partial: Partial<TaskState>) => {
    setState(prev => prev ? { ...prev, ...partial } : prev);
  }, []);

  // ── Complete a special/discovery quest (idempotent, silent) ──
  const completeSpecialQuest = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.completedSpecialQuests?.[id]) return prev; // idempotent
      const quest = SPECIAL_QUESTS.find(q => q.id === id);
      const xpBonus = quest?.xpReward ?? 0;
      return {
        ...prev,
        completedSpecialQuests: { ...(prev.completedSpecialQuests || {}), [id]: true },
        xp: (prev.xp || 0) + xpBonus,
      };
    });
  }, []);

  // ── Record first visit to a view (idempotent) ──
  const recordViewVisit = useCallback((view: string) => {
    setState(prev => {
      if (!prev) return prev;
      if ((prev.viewsVisited || []).includes(view)) return prev; // idempotent
      return { ...prev, viewsVisited: [...(prev.viewsVisited || []), view] };
    });
  }, []);

  // ── Egg system actions ──
  const spawnEgg = useCallback((egg: EggItem) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.pendingEgg) return prev; // already one pending
      if (prev.eggTriggersFired?.[egg.triggerId]) return prev; // already fired
      return {
        ...prev,
        pendingEgg: egg,
        eggTriggersFired: { ...(prev.eggTriggersFired || {}), [egg.triggerId]: true },
      };
    });
  }, []);

  const collectEgg = useCallback(() => {
    setState(prev => {
      if (!prev?.pendingEgg) return prev;
      const egg = prev.pendingEgg;
      return {
        ...prev,
        pendingEgg: null,
        collectedEggs: [
          ...(prev.collectedEggs || []),
          {
            triggerId: egg.triggerId,
            labelDe: egg.labelDe,
            labelEn: egg.labelEn,
            accentColor: egg.accentColor,
            collectedAt: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ── Parent-created quest-line actions ──
  const createQuestLine = useCallback((ql: ParentQuestLine) => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, parentQuestLines: [...(prev.parentQuestLines || []), ql] };
    });
  }, []);

  const updateQuestLine = useCallback((id: string, patch: Partial<ParentQuestLine>) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        parentQuestLines: (prev.parentQuestLines || []).map(q => q.id === id ? { ...q, ...patch } : q),
      };
    });
  }, []);

  const completeQuestLineDay = useCallback((questLineId: string, dayId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const updated = (prev.parentQuestLines || []).map(q => {
        if (q.id !== questLineId) return q;
        if (q.completedDayIds.includes(dayId)) return q;
        const newDone = [...q.completedDayIds, dayId];
        const allDone = newDone.length >= q.days.length;
        return {
          ...q,
          completedDayIds: newDone,
          completed: allDone,
          completedAt: allDone ? new Date().toISOString() : q.completedAt,
        };
      });
      return { ...prev, parentQuestLines: updated };
    });
  }, []);

  const archiveQuestLine = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        parentQuestLines: (prev.parentQuestLines || []).map(q => q.id === id ? { ...q, archived: true } : q),
      };
    });
  }, []);

  // ── Gefühlsecke: log a feeling check-in ──
  const logFeeling = useCallback((feeling: 'gut' | 'wuetend' | 'traurig' | 'aengstlich' | 'muede', note?: string) => {
    setState(prev => prev ? {
      ...prev,
      feelingsLog: [...(prev.feelingsLog || []), { ts: new Date().toISOString(), feeling, note }],
    } : prev);
  }, []);

  // ── Forscher-Ecke: claim a MINT badge (idempotent) ──
  // When this claim completes the final implemented badge, fire the
  // graduation celebration. forscherFunkelUnlocked stays gated on ALL 5
  // games (including Kristall-Sortierer) for the creature reveal; graduation
  // fires at MINT_SEQUENCE completion (implemented-only, currently 4).
  const claimMintBadge = useCallback((badgeId: string, gameId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const badges = prev.mintBadgesEarned || [];
      const played = prev.mintGamesPlayed || [];
      const alreadyEarned = badges.includes(badgeId);
      const newBadges = alreadyEarned ? badges : [...badges, badgeId];
      const newPlayed = played.includes(gameId) ? played : [...played, gameId];
      const allComplete = newBadges.length >= 5;

      // Graduation transition: only fire once, on the specific claim that
      // crosses the boundary from "not graduated" to "graduated".
      if (!alreadyEarned && MINT_SEQUENCE.length > 0) {
        const wasGrad = MINT_SEQUENCE.every(g => badges.includes(g.badgeId));
        const isGrad = MINT_SEQUENCE.every(g => newBadges.includes(g.badgeId));
        if (!wasGrad && isGrad) {
          queueCelebration({ type: 'forscherGraduation' });
        }
      }

      return {
        ...prev,
        mintBadgesEarned: newBadges,
        mintGamesPlayed: newPlayed,
        forscherFunkelUnlocked: allComplete,
      };
    });
  }, [queueCelebration]);

  // ── Forscher-Ecke: record first play of a MINT game (idempotent, no badge) ──
  const recordMintGamePlay = useCallback((gameId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const played = prev.mintGamesPlayed || [];
      if (played.includes(gameId)) return prev;
      return { ...prev, mintGamesPlayed: [...played, gameId] };
    });
  }, []);

  // ── Bonding Agent: Ronki mood scheduler ──
  // Called from Hub + RonkiProfile mount, and after every quest complete.
  // Responsibilities:
  //   1. Expire yesterday's non-normal mood — ronkiMoodSetDate !== today
  //      flips back to 'normal'. (Moods are one-day events.)
  //   2. Organic triggers (Apr 2026 expansion) — idempotent per day:
  //      · magisch  → streak milestone (7/14/21/30/50/75/100 days)
  //      · gut      → all main quests done today
  //      · besorgt  → kid just opened after 2+ days away
  //   3. Scheduled bad day — keep existing sad/tired pick.
  // Priority: magisch > gut > besorgt > scheduled-bad. Once one fires,
  // others short-circuit until the next day.
  const syncRonkiMood = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const t = today();
      let next = prev;

      // Step 1 — expire yesterday's non-normal mood
      if (next.ronkiMood && next.ronkiMood !== 'normal' && next.ronkiMoodSetDate !== t) {
        next = { ...next, ronkiMood: 'normal', ronkiMoodSetDate: undefined };
      }

      // Don't overwrite an already-set mood from earlier today.
      const alreadySetToday =
        next.ronkiMoodSetDate === t && (next.ronkiMood || 'normal') !== 'normal';

      if (!alreadySetToday) {
        // Step 2a — magisch on streak milestones.
        //
        // Code-review fix (22 Apr 2026): `state.streak` is not a field
        // on TaskState (the `streak` prop in the schema belongs to a
        // Quest, not the user). The prior milestone check read
        // `next.streak` which was always undefined → dead code. Derive
        // an effective day-streak from the max-consistent quest in
        // `sm` (skill-map of per-quest consecutive-day counts). A kid
        // keeping their routine for 7 days will have at least one
        // quest at streak=7 in sm. Not perfect ("best quest streak"
        // ≠ "session streak") but fires at the intended moments
        // without a schema migration.
        const smVals = Object.values(next.sm || {});
        const effectiveStreak = smVals.length > 0
          ? Math.max(...smVals.map(v => Number(v) || 0))
          : 0;
        const STREAK_MILESTONES = new Set([7, 14, 21, 30, 50, 75, 100, 150, 200, 365]);
        if (STREAK_MILESTONES.has(effectiveStreak)) {
          next = { ...next, ronkiMood: 'magisch', ronkiMoodSetDate: t };
        }
        // Step 2b — gut when all main quests done today
        else {
          const mainQuests = (next.quests || []).filter(q => !q.sideQuest);
          const mainAllDone = mainQuests.length > 0 && mainQuests.every(q => q.done);
          if (mainAllDone) {
            next = { ...next, ronkiMood: 'gut', ronkiMoodSetDate: t };
          }
        }
        // Step 2c — besorgt on long absence. QA fix (22 Apr 2026):
        // old code used `Math.floor((now - last) / 86_400_000)` in
        // epoch-ms, which silently miscounts across DST transitions
        // (spring-forward: legitimate 2-day gap reads as 1). Switch
        // to YYYY-MM-DD string parsing + UTC day-count so DST doesn't
        // suppress the trigger.
        if ((next.ronkiMood || 'normal') === 'normal' && next.lastDate) {
          const dayNum = (iso: string) => {
            const [y, m, d] = iso.split('-').map(Number);
            return Date.UTC(y, (m || 1) - 1, d || 1) / 86_400_000;
          };
          const daysSince = dayNum(t) - dayNum(next.lastDate);
          if (daysSince >= 2) {
            next = { ...next, ronkiMood: 'besorgt', ronkiMoodSetDate: t };
          }
        }
      }

      // Step 3 — scheduled bad day (existing). Only if nothing else fired.
      const due = next.ronkiNextBadDayDate && t >= next.ronkiNextBadDayDate;
      if ((next.ronkiMood || 'normal') === 'normal' && due) {
        next = {
          ...next,
          ronkiMood: pickBadRonkiMood(),
          ronkiMoodSetDate: t,
          ronkiNextBadDayDate: scheduleNextBadRonkiDay(new Date()),
        };
      }

      return next === prev ? prev : next;
    });
  }, []);

  // Expose syncRonkiMood to earlier-declared callbacks (complete,
  // completeHabit, etc.) via a ref so organic mood triggers fire the
  // instant relevant state changes, not only on tab mount.
  syncRonkiMoodRef.current = syncRonkiMood;

  // ── Bonding Agent: Louis picks a gentle reaction on a bad-Ronki day ──
  // All reactions (Kuscheln / Stille / Tee / Atmen) are "right" — no
  // points, no loser. Writes a journal memory so the moment shows up in
  // the Buch, ends the bad mood early (Ronki feels seen), schedules the
  // next bad day 14-21d out.
  const pickRonkiSadReaction = useCallback((reaction: string) => {
    setState(prev => {
      if (!prev) return prev;
      const t = today();
      const mood = prev.ronkiMood || 'normal';
      const memoryText = (() => {
        const mp = mood === 'tired' ? 'müde' : 'traurig';
        switch (reaction) {
          case 'kuscheln': return `Ronki war ${mp}. Ich habe ihn gekuschelt.`;
          case 'stille':   return `Ronki war ${mp}. Wir haben still zusammen gesessen.`;
          case 'tee':      return `Ronki war ${mp}. Ich habe warmen Tee gekocht.`;
          case 'atmen':    return `Ronki war ${mp}. Wir haben zusammen geatmet.`;
          default:         return `Ronki war ${mp}. Ich war für ihn da.`;
        }
      })();
      const entry: JournalEntry = {
        date: t,
        memory: memoryText,
        gratitude: [],
        dayEmoji: null,
        achievements: ['ronki-bad-day'],
        mood: null,
      };
      const history = prev.journalHistory || [];
      return {
        ...prev,
        ronkiMood: 'normal',
        ronkiMoodSetDate: undefined,
        ronkiNextBadDayDate: scheduleNextBadRonkiDay(new Date()),
        journalHistory: [...history, entry],
      };
    });
  }, []);

  // ── Bonding Agent: Louis practices a coping skill in Gefühlsecke ──
  // Increments per-skill counter. At threshold 5, promotes to
  // ronkiLearnedSkills so Ronki can offer the skill back on his next
  // bad day. The golden "Ronki hat X gelernt" banner is triggered by
  // the UI reading (learnedSkills.includes(skill) && !learnBannerSeen[skill]).
  const practiceSkill = useCallback((skillId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const practice = { ...(prev.ronkiSkillPractice || {}) };
      const cur = practice[skillId] || 0;
      const nextCount = cur + 1;
      practice[skillId] = nextCount;
      const learned = prev.ronkiLearnedSkills || [];
      const wasAlreadyLearned = learned.includes(skillId);
      const nextLearned = nextCount >= 5 && !wasAlreadyLearned
        ? [...learned, skillId]
        : learned;
      return {
        ...prev,
        ronkiSkillPractice: practice,
        ronkiLearnedSkills: nextLearned,
      };
    });
  }, []);

  const markLearnBannerSeen = useCallback((skillId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const seen = { ...(prev.ronkiLearnBannerSeen || {}) };
      if (seen[skillId]) return prev;
      seen[skillId] = true;
      return { ...prev, ronkiLearnBannerSeen: seen };
    });
  }, []);

  const markTabUnlockSeen = useCallback((tabId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const seen = { ...(prev.tabUnlocksSeen || {}) };
      if (seen[tabId]) return prev;
      seen[tabId] = true;
      return { ...prev, tabUnlocksSeen: seen };
    });
  }, []);

  // ── Crystal inventory (Cave Mining → Campfire Visitors compound loop) ──
  const addCrystals = useCallback((family: string, n: number) => {
    if (!family || !n) return;
    setState(prev => {
      if (!prev) return prev;
      const inv = { ...(prev.crystalInventory || {}) };
      inv[family] = (inv[family] || 0) + n;
      return { ...prev, crystalInventory: inv };
    });
  }, []);

  const spendCrystals = useCallback((family: string, n: number): boolean => {
    let success = false;
    setState(prev => {
      if (!prev) return prev;
      const current = (prev.crystalInventory || {})[family] || 0;
      if (current < n) return prev; // not enough
      success = true;
      const inv = { ...(prev.crystalInventory || {}) };
      inv[family] = current - n;
      return { ...prev, crystalInventory: inv };
    });
    return success;
  }, []);

  const giftCrystalToFreund = useCallback((freundId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const friendship = { ...(prev.freundFriendship || {}) };
      friendship[freundId] = Math.min(5, (friendship[freundId] || 0) + 1);
      return { ...prev, freundFriendship: friendship, todaysVisitor: null };
    });
  }, []);

  const markTabCoachmarkSeen = useCallback((tabId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const seen = { ...(prev.tabCoachmarksSeen || {}) };
      if (seen[tabId]) return prev;
      seen[tabId] = true;
      return { ...prev, tabCoachmarksSeen: seen };
    });
  }, []);

  // ── Garden actions (Phase 1 of core-gameloop-time-stack) ─────────────
  // Garden state lives at state.garden and is created lazily on first
  // interaction. No migration needed — older state loads with garden
  // undefined and these actions construct the default shape on demand.
  const getOrInitGarden = (prev: TaskState) => prev.garden ?? {
    plants: [],
    decor: [],
    lastWeeklyPlanting: null,
    ownedDecor: [...DEFAULT_OWNED_DECOR],
  };

  const plantSeed = useCallback((species: PlantSpecies, position: { x: number; y: number }) => {
    setState(prev => {
      if (!prev) return prev;
      const garden = getOrInitGarden(prev);
      const today = new Date().toISOString().slice(0, 10);
      const newPlant: GardenPlant = {
        id: `${species}-${today}-${Math.random().toString(36).slice(2, 8)}`,
        species,
        plantedAt: today,
        position,
      };
      return {
        ...prev,
        garden: {
          ...garden,
          plants: [...garden.plants, newPlant],
          lastWeeklyPlanting: today,
        },
      };
    });
  }, []);

  const placeDecor = useCallback((type: DecorType, position: { x: number; y: number }): boolean => {
    let success = false;
    setState(prev => {
      if (!prev) return prev;
      const garden = getOrInitGarden(prev);
      const info = DECOR_BY_ID[type];
      if (!info) return prev;

      const alreadyOwned = garden.ownedDecor.includes(type);
      const cost = alreadyOwned ? 0 : info.price;
      const currentHp = prev.hp || 0;
      if (cost > currentHp) return prev;  // silently fail — UI disables tiles you can't afford

      const newDecor: GardenDecor = {
        id: `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        position,
      };

      success = true;
      return {
        ...prev,
        hp: currentHp - cost,
        garden: {
          ...garden,
          decor: [...garden.decor, newDecor],
          ownedDecor: alreadyOwned ? garden.ownedDecor : [...garden.ownedDecor, type],
        },
      };
    });
    return success;
  }, []);

  const moveDecor = useCallback((id: string, position: { x: number; y: number }) => {
    setState(prev => {
      if (!prev?.garden) return prev;
      return {
        ...prev,
        garden: {
          ...prev.garden,
          decor: prev.garden.decor.map(d => d.id === id ? { ...d, position } : d),
        },
      };
    });
  }, []);

  const removeDecor = useCallback((id: string) => {
    setState(prev => {
      if (!prev?.garden) return prev;
      return {
        ...prev,
        garden: {
          ...prev.garden,
          decor: prev.garden.decor.filter(d => d.id !== id),
        },
      };
    });
  }, []);

  const witnessPlant = useCallback((plantId: string, stage: import('../types').PlantStage) => {
    setState(prev => {
      if (!prev) return prev;
      const garden = getOrInitGarden(prev);
      const plant = garden.plants.find(p => p.id === plantId);
      if (!plant) return prev;  // plant removed or never existed
      return {
        ...prev,
        garden: {
          ...garden,
          witnessedStages: {
            ...(garden.witnessedStages || {}),
            [plantId]: stage,
          },
        },
      };
    });
  }, []);

  // ── Computed values ──
  const computed: TaskComputed = state ? (() => {
    const mainQuests = state.quests.filter(q => !q.sideQuest);
    const done = mainQuests.filter(q => q.done).length;
    const total = mainQuests.length;
    const allDone = total > 0 && done === total;
    const pct = total > 0 ? done / total : 0;
    const byGroup: Record<string, Quest[]> = {};
    for (const q of state.quests) {
      const key = q.anchor;
      if (!byGroup[key]) byGroup[key] = [];
      byGroup[key].push(q);
    }
    // Sort each group by order
    for (const key of Object.keys(byGroup)) {
      byGroup[key].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const level = getLevel(state.xp || 0);
    const xpProgress = getLvlProg(state.xp || 0);
    return { done, total, allDone, pct, byGroup, level, xpProgress };
  })() : emptyComputed;

  return (
    <TaskContext.Provider value={{ state, computed, actions: { complete, setMood, drinkWater, feedCompanion, petCompanion, playCompanion, collectLoginBonus, completeOnboarding, teachBreath, dismissPendingRitual, setEmojiCode, addFriend, markWinkSeen, recordWinkSent, setCaveStyle, setExpedition, startExpedition, rangerDeparted, rangerArrived, receiveMemento, saveJournal, redeemReward, dismissCelebration, startMission, abandonMission, addHP, claimGameReward, consumeStamina, restoreStamina, equipGear, unequipGear, updateBirthdayEpic, updateFamilyConfig, patchState, completeSpecialQuest, recordViewVisit, spawnEgg, collectEgg, fireCelebration, createQuestLine, updateQuestLine, completeQuestLineDay, archiveQuestLine, logFeeling, claimMintBadge, recordMintGamePlay, syncRonkiMood, pickRonkiSadReaction, practiceSkill, markLearnBannerSeen, markTabUnlockSeen, markTabCoachmarkSeen, completeHabit, addCrystals, spendCrystals, giftCrystalToFreund, plantSeed, placeDecor, moveDecor, removeDecor, witnessPlant }, loading, celebration, toastTrigger }}>
      {children}
    </TaskContext.Provider>
  );
}
