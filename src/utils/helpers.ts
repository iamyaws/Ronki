import { LVL, SCHOOL_QUESTS, VACATION_QUESTS, FOOTBALL, CAT_STAGES, SIDE_QUESTS, SHOP_ITEMS, COMPANION_STAGES, BOSS_TIERS } from '../constants';
import type { Quest, CatMood, ShopItem } from '../types';
import { normalizeRoutine, taskKind } from '../data/taskKinds';

export function getLevel(xp: number): number {
  let l = 1;
  for (let i = 1; i < LVL.length; i++) {
    if (xp >= LVL[i]) l = i + 1; else break;
  }
  return l;
}

export function getLvlProg(xp: number): { cur: number; need: number } {
  const l = getLevel(xp);
  const c = LVL[l - 1] || 0;
  const n = LVL[l] || c + 500;
  return { cur: xp - c, need: n - c };
}

// School-prep evening quests only make sense on school nights.
// On Sat/Sun there's no schoolbag to pack, so skip them to avoid noise.
const WEEKEND_SKIP_IDS = new Set(['s_lunchbox', 's_packcheck', 's_signature', 's7']);

/**
 * Today's quests. `routine` is the family routine (familyConfig.routine,
 * Finch pass spec R15): the morning and bedtime main quests are kept only
 * when their kind is in it. An absent or odd routine means DEFAULT_ROUTINE
 * (normalizeRoutine). Afternoon ('evening') and 'hobby' quests and the side
 * quests are never filtered.
 */
export function buildDay(vac: boolean, routine?: unknown): Quest[] {
  const d = new Date().getDay();
  const isWeekend = d === 0 || d === 6;
  const source = vac ? VACATION_QUESTS : SCHOOL_QUESTS;
  const r = normalizeRoutine(routine);
  const morningKinds = new Set<string>(r.morning);
  const eveningKinds = new Set<string>(r.evening);
  const inRoutine = (q: { id: string; anchor: string }): boolean => {
    if (q.anchor !== 'morning' && q.anchor !== 'bedtime') return true;
    const kind = taskKind(q.id);
    if (!kind) return true;
    return q.anchor === 'morning' ? morningKinds.has(kind) : eveningKinds.has(kind);
  };
  const b: Quest[] = source
    .filter(q => !(isWeekend && !vac && WEEKEND_SKIP_IDS.has(q.id)))
    .filter(inRoutine)
    .map(q => ({ ...q, done: false, streak: 0, completions: 0 }));
  if ((d === 1 || d === 3) && !vac) b.push({ ...FOOTBALL, done: false, streak: 0, completions: 0 });
  // Pick 2 random side-quests for the day
  const shuffled = [...SIDE_QUESTS].sort(() => Math.random() - 0.5);
  const dailySides = shuffled.slice(0, 2).map(q => ({ ...q, done: false, streak: 0, completions: 0, sideQuest: true }));
  b.push(...dailySides);
  return b;
}

export function getSky(done: number, total: number): string {
  const p = total > 0 ? done / total : 0;
  if (p >= 1) return "linear-gradient(180deg, #0F172A 0%, #1E1B4B 40%, #312E81 100%)";
  if (p >= 0.66) return "linear-gradient(180deg, #312E81 0%, #6D28D9 20%, #C2410C 55%, #F59E0B 100%)";
  if (p >= 0.33) return "linear-gradient(180deg, #0C4A6E 0%, #0369A1 35%, #38BDF8 70%, #7DD3FC 100%)";
  return "linear-gradient(180deg, #1E3A5F 0%, #2563EB 25%, #60A5FA 50%, #FDE68A 80%, #F97316 100%)";
}

export function getSkyStars(d: number, t: number): boolean { return t > 0 && d / t >= 1; }

export function getTimeLabel(d: number, t: number): string {
  const p = t > 0 ? d / t : 0;
  if (p >= 1) return "Nacht \u{1F319}";
  if (p >= 0.66) return "Abend \u{1F305}";
  if (p >= 0.33) return "Tag \u2600\uFE0F";
  return "Morgen \u{1F305}";
}

export function getMood(allDone: boolean, pct: number): CatMood {
  if (allDone) return "excited";
  if (pct > 0.5) return "happy";
  if (pct > 0) return "neutral";
  return "sleepy";
}

export function getDayName(): string {
  return ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][new Date().getDay()];
}

export function getCatStage(catEvo: number): number {
  for (let i = CAT_STAGES.length - 1; i >= 0; i--) {
    if (catEvo >= CAT_STAGES[i].threshold) return i;
  }
  return 0;
}

/** Filename stems for Ronki art, indexed by stage (0..4). */
export const DRAGON_ART: readonly string[] = [
  'dragon-egg', 'dragon-baby', 'dragon-young', 'dragon-majestic', 'dragon-legendary',
];

/** Safe lookup: returns baby art for unknown stages. */
export function getDragonArt(stage: number): string {
  return DRAGON_ART[stage] || 'dragon-baby';
}

export function getCatStageProg(catEvo: number): { cur: number; need: number; stage: number; maxStage: boolean } {
  const s = getCatStage(catEvo);
  const cur = CAT_STAGES[s].threshold;
  const next = CAT_STAGES[s + 1]?.threshold || cur + 100;
  return { cur: catEvo - cur, need: next - cur, stage: s, maxStage: s >= CAT_STAGES.length - 1 };
}

export function getCatMood(hunger?: number, happy?: number, energy?: number): CatMood {
  const avg = ((hunger ?? 100) + (happy ?? 100) + (energy ?? 100)) / 3;
  if (avg >= 75) return "excited";
  if (avg >= 50) return "happy";
  if (avg >= 25) return "neutral";
  return "sleepy";
}

/** Find a shop item by ID across all categories */
export function findShopItem(id: string): ShopItem | null {
  for (const cat of Object.values(SHOP_ITEMS)) {
    const item = cat.find((i: ShopItem) => i.id === id);
    if (item) return item;
  }
  return null;
}

/** Get companion stage name with fallback to CAT_STAGES */
export function getCompanionStageName(type: string, stage: number): { name: string; emoji: string; desc: string } {
  return COMPANION_STAGES[type]?.[stage] || CAT_STAGES[stage] || { name: "Neue Stufe", emoji: "", desc: "" };
}

/** Get the highest boss tier available for a given companion stage */
export function getTierForStage(companionStage: number): typeof BOSS_TIERS[number] {
  const available = BOSS_TIERS.filter(t => companionStage >= t.minStage);
  return available[available.length - 1] || BOSS_TIERS[0];
}

export const GERMAN_DAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;
