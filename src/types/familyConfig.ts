// ── Family Config — customizable per-family settings ──

export interface DailyHabit {
  id: string;
  name: string;
  icon: string;
  iconDone: string;
  xp: number;
}

export interface SiblingConfig {
  name: string;
  relationship: 'Bruder' | 'Schwester' | 'Geschwister';
  pronouns: Pronouns;
  birthday?: string;  // ISO date
}

export interface RecurringActivity {
  id: string;
  name: string;
  icon: string;
  days: number[];  // 0=Sun..6=Sat
  xp: number;
  minutes: number;
}

export interface ParentMessage {
  /** Whether the message surfaces in-app. Default false — parents opt in from
   *  the dashboard. Keeps the Hub uncluttered until a parent actively writes
   *  something meant to be seen. */
  enabled?: boolean;
  title: string;
  body: string;
  signature: string;
}

export type Pronouns = 'er' | 'sie' | 'they';

export interface DragonVariant {
  palette: 'ember' | 'moss' | 'dusk';
  wings: 'rounded' | 'pointed' | 'feathered';
  horns: 'short' | 'curved' | 'spiraled';
}

// Helper to get pronoun forms for German text
export function pronouns(p: Pronouns) {
  switch (p) {
    case 'er':  return { nom: 'er', acc: 'ihn', dat: 'ihm', pos: 'sein', posE: 'seine', posEm: 'seinem', posEn: 'seinen' };
    case 'sie': return { nom: 'sie', acc: 'sie', dat: 'ihr', pos: 'ihr', posE: 'ihre', posEm: 'ihrem', posEn: 'ihren' };
    case 'they': return { nom: 'they', acc: 'they', dat: 'them', pos: 'their', posE: 'their', posEm: 'their', posEn: 'their' };
  }
}

export type FunkelzeitMode = 'entspannt' | 'normal' | 'strikt' | 'none';

/** How the ToothBrushGuide presents itself.
 *  - 'tasche' (default): dark calm screen, audio cues, encourages putting the phone down.
 *  - 'schau': illustrated zone guide with visible countdown (backup/learning mode). */
export type ToothBrushMode = 'tasche' | 'schau';

export interface FamilyConfig {
  childName: string;
  childBirthday?: string;  // ISO date
  childPronouns: Pronouns;
  siblings: SiblingConfig[];
  dailyHabits: DailyHabit[];
  recurringActivities: RecurringActivity[];
  parentMessage: ParentMessage;
  familyMotto: string;
  affirmation: string;
  dragonVariant?: DragonVariant;
  /** How restrictive the screen-time reward system is. Default 'entspannt' = current behavior. */
  funkelzeitMode?: FunkelzeitMode;
  /** Daily cap in minutes for 'strikt' mode. Default 30. */
  funkelzeitDailyCapMin?: number;
  /** Which tooth-brush UI mode to show by default. Default 'tasche'. */
  toothBrushDefaultMode?: ToothBrushMode;
  /** When true, show a "zeig mama/papa"-confirmation after each routine
   *  block (morning/evening/bedtime) for the first 14 completions per block.
   *  Default is OFF (Marc Apr 2026: "rather annoying" on first-run).
   *  Parents opt IN from the Eltern-Bereich Settings. */
  zeigMomentEnabled?: boolean;
  /** Which ONE parent vouches for the cheer moment when zeigMomentEnabled
   *  is true. Default 'mama'. Single-vouch keeps the moment simple:
   *  kid shows ONE grown-up, not "did BOTH see". */
  zeigMomentParent?: 'mama' | 'papa';
  /** Finch pass (26 Sep 2026): which task kinds the child does with Ronki
   *  in the morning and the evening. Absent = DEFAULT_ROUTINE
   *  (src/data/taskKinds.ts). Set in the parent step and the dashboard. */
  routine?: import('../data/taskKinds').RoutineConfig;
  /** Finch pass: when the family's evening starts ('17:00' to '18:30').
   *  Ronki's day trip returns at this time. Absent = '17:00'. */
  eveningStart?: import('../loop/types').EveningStart;
}

// ── Generic default template (Louis-specifics moved to seed-only flow) ──
// New accounts start with no siblings, no hardcoded "Zeit mit X" habit,
// and no football practice. Parents fill siblings / habits in parent
// onboarding (Familie step) or later from the Eltern-Bereich.
export const DEFAULT_FAMILY_CONFIG: FamilyConfig = {
  childName: '',
  childPronouns: 'er',
  siblings: [],
  dailyHabits: [],
  recurringActivities: [],
  parentMessage: {
    enabled: false, // parents opt in from the dashboard. Default is quiet.
    title: 'Botschaft für dich',
    body: 'Fehler sind okay. Deine Familie ist immer für dich da. 🧡',
    signature: 'Wir haben dich lieb.',
  },
  familyMotto: 'Lieb sein. Sich Mühe geben.\u00A0Zusammen sein.',
  affirmation: 'Ich bin geliebt, so wie ich bin.',
  funkelzeitMode: 'entspannt',
  funkelzeitDailyCapMin: 30,
  toothBrushDefaultMode: 'tasche',
  // Off by default — Marc flagged the overlay as "rather annoying" for
  // a first-run experience. Parents now opt IN from the Eltern-Bereich
  // settings tab; if on, they also pick which ONE parent vouches for
  // the cheer moment (not both).
  zeigMomentEnabled: false,
  zeigMomentParent: 'mama',
};
