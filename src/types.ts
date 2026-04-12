// ═══ Ronki — Shared Type Definitions ═══

export interface Hero {
  name: string;
  shape: string;
  color: string;
  eyes: string;
  hair: string;
  skinTone?: string;
  hairColor?: string;
}

export interface Quest {
  id: string;
  name: string;
  icon: string;
  anchor: 'morning' | 'evening';
  group?: string;  // visual sub-group: "school_prep", "bedtime", etc.
  xp: number;
  minutes: number;
  done: boolean;
  streak: number;
  order?: number;
  target?: number;
  bonus?: number;
  completions?: number;
  sideQuest?: boolean;
}

export interface QuestChain {
  id: string;
  name: string;
  emoji: string;
  steps: QuestChainStep[];
  hp: number;
  completed: boolean;
  deadline?: string;  // ISO date string e.g. "2026-04-26"
}

export interface QuestChainStep {
  id: string;
  name: string;
  done: boolean;
}

export interface Reward {
  id: string;
  name: string;
  icon: string;
  minutes: number;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  type: string;
}

export interface RareDrop {
  type: 'hp' | 'minutes' | 'emoji';
  amount?: number;
  label: string;
  icon: string;
  id?: string;
}

export interface ChestReward {
  type: 'hp' | 'item' | 'minutes' | 'xpboost';
  amount?: number;
  id?: string;
  label: string;
  icon: string;
}



export interface WeeklyMission {
  id: string;
  title: string;
  story: string;
  goal: string;
  target: number;
  reward: { type: 'hp'; amount: number };
  icon: string;
}

export interface JournalQuestion {
  id: string;
  q: string;
  opts: { v: string; l: string }[];
}

export interface Badge {
  i: string;
  n: string;
}

export type CatMood = 'sleepy' | 'neutral' | 'happy' | 'excited';

export interface Boss {
  id: string;
  hp: number;
  maxHp: number;
}

export interface BossTemplate {
  id: string;
  name: string;
  icon: string;
  hp: number;
  reward: { hp: number };
  desc: string;
  tier?: string;
}

export interface CatStageInfo {
  name: string;
  threshold: number;
  emoji: string;
  desc: string;
}

// ── New: Belohnungsbank ──
export interface Belohnung {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  active: boolean;
  currency?: 'hp' | 'eggs';  // which currency this costs (default: 'hp')
  availableAfter?: string;
  availableAfterFree?: string;
  weekendCost?: number;
}

// ── New: Spezial-Mission ──
export interface SpecialMission {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  done: boolean;
}

// ── New: Unlock Condition ──
export interface UnlockCondition {
  type: 'streak' | 'boss' | 'tasks' | 'catStage' | 'weeklyMission' | 'bossLoot';
  value: number;
  label: string;
  icon: string;
}

// ── New: Hero Tip ──
export interface HeroTip {
  char: string;
  emoji: string;
  tip: string;
}

export interface GameState {
  hero: Hero;
  catVariant: string;
  catName: string;
  xp: number;
  coins: number;
  drachenEier: number;  // dragon eggs — scarce media/screen time currency
  quests: Quest[];
  rewards: Reward[];
  acc: string[];
  sd: number;
  lastDate: string;
  dt: number;
  hist: { id: string; d: number }[];
  vacMode: boolean;
  sm: Record<string, number>;
  roomItems: string[];
  purchased: string[];
  moodAM: number | null;
  moodPM: number | null;
  journal: string;
  jAnswers: Record<string, string>;
  rainbow: boolean[];
  wheelSpun: boolean;
  memoryPlayed: boolean;
  chestMilestone: number | null;
  xpBoost: boolean;
  weeklyMission: string;
  weeklyProgress: number;
  weekStart: string;
  graduated: string[];
  streakFreezes: number;
  freezesUsedThisMonth: number;
  lastFreezeMonth: string;
  comebackActive: boolean;
  bestStreak: number;
  freezeUsedToday: boolean;
  // Cat care / evolution
  catEvo: number;
  catHunger: number;
  catHappy: number;
  catEnergy: number;
  catFed: boolean;
  catPetted: boolean;
  catPlayed: boolean;
  // Boss battles
  boss: Boss | null;
  bossTrophies: string[];
  // Companion
  companionType: string;
  // Egg hatching
  eggType: string | null;
  eggProgress: number;
  eggHatched: boolean;
  // ── New fields ──
  dailyVitaminD: boolean;
  dailyBrother: boolean;
  belohnungen: Belohnung[];
  belohnungenLog: { id: string; date: string }[];
  specialMissions: SpecialMission[];
  weeklyLunch: Record<string, string>;
  weeklyMissionsCompleted: number;
  // Login bonus calendar
  loginBonusDay: number;
  loginBonusClaimed: boolean;
  loginBonusStreak: number;
  // Boss defeat reward overlay
  bossDefeatReward: { bossName: string; bossIcon: string; hp: number; item: { name: string; icon: string } | null } | null;
  // Quest chains
  questChains: QuestChain[];
  // Companion gear
  equippedGear: { head?: string; body?: string; accessory?: string };
  // Evolution celebration overlay
  evolutionEvent: { oldStage: number; newStage: number; newBossTier?: string } | null;
  // Room customization
  roomTheme: { wallColor: string; floorType: string; windowStyle: string };
  // Daily game redemption limit
  dailyGameRedemptions: number;
  // Journal tomorrow commitment
  tomorrowCommitment: { type: string; text: string } | null;
  yesterdayCommitment: { type: string; text: string } | null;
  // Water drinking tracker
  dailyWaterCount: number;
  // Total task days (never resets)
  totalTaskDays: number;
}

export interface ComputedState {
  level: number;
  xpP: { cur: number; need: number };
  done: number;
  total: number;
  allDone: boolean;
  pct: number;
  mood: CatMood;
  dayN: string;
  byA: Record<string, Quest[]>;
  byGroup: Record<string, Quest[]>;
}
