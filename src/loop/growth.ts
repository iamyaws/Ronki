/**
 * Ronki's growth (Finch pass, 26 Sep 2026). Spec ruling R6.
 *
 * - One adventure = one opened treasure. Nothing else counts.
 * - catEvo only moves when a treasure is opened, by at most one stage at
 *   a time, and never goes down. Existing saves (catEvo 3, "Baby") keep
 *   their look until their next treasure.
 * - Stages use the existing CAT_STAGES thresholds: Ei 0, Baby 3,
 *   Jungtier 9, Stolz 18, Heranwachsend 30, Legendär 45. So Baby to
 *   Jungtier takes 6 adventures, then 9, 12 and 15.
 */
import { CAT_STAGES } from '../constants';

const THRESHOLDS: number[] = CAT_STAGES.map(s => s.threshold);
const LAST = THRESHOLDS.length - 1;
/** catEvo a hatched Ronki starts with (stage Baby). */
export const HATCHED_EVO = 3;

/** Stage index (0 Ei ... 5 Legendär) for a catEvo value. */
export function stageOf(catEvo: number | null | undefined): number {
  const v = Number.isFinite(catEvo as number) ? (catEvo as number) : 0;
  for (let i = LAST; i >= 0; i--) if (v >= THRESHOLDS[i]) return i;
  return 0;
}

/** The catEvo that adventures alone would give. */
export function evoFromAdventures(adventureCount: number | null | undefined): number {
  const n = Number.isFinite(adventureCount as number) && (adventureCount as number) > 0 ? Math.floor(adventureCount as number) : 0;
  return HATCHED_EVO + n;
}

/**
 * catEvo after one more treasure was opened. `adventureCount` is the new
 * count (after + 1). Moves at most one stage past the current one, never
 * down.
 */
export function evoAfterTreasure(currentEvo: number | null | undefined, adventureCount: number): number {
  const cur = Number.isFinite(currentEvo as number) ? (currentEvo as number) : HATCHED_EVO;
  const target = evoFromAdventures(adventureCount);
  if (target <= cur) return cur;
  const stage = stageOf(cur);
  const capStage = Math.min(LAST, stage + 1);
  // Stay inside the next stage: never skip past its upper edge in one step.
  const upper = capStage < LAST ? THRESHOLDS[capStage + 1] - 1 : Number.POSITIVE_INFINITY;
  return Math.max(cur, Math.min(target, upper));
}

export interface StoneModel {
  /** Current stage index. */
  stage: number;
  /** True at the last stage (Legendär): show "Größer geht's nicht" instead of stones. */
  top: boolean;
  /** Stones between this look and the next (the span in adventures). */
  total: number;
  /** Stones already walked. */
  filled: number;
  /** Adventures still needed for the next look (>= 1 unless top). */
  left: number;
}

/**
 * The stepping stones to the next look, from what the child can see:
 * the current catEvo and the adventures so far. A pre-reader sees stones;
 * the parent dashboard may show `left` as a number.
 */
export function stonesToNext(catEvo: number | null | undefined, adventureCount: number | null | undefined): StoneModel {
  const cur = Number.isFinite(catEvo as number) ? (catEvo as number) : HATCHED_EVO;
  const stage = stageOf(cur);
  if (stage >= LAST) return { stage, top: true, total: 0, filled: 0, left: 0 };
  const from = THRESHOLDS[stage];
  const to = THRESHOLDS[stage + 1];
  const total = to - from;
  // Progress is what the adventures earned, clamped into this span.
  const earned = Math.max(cur, evoFromAdventures(adventureCount));
  const filled = Math.max(0, Math.min(total - 1, earned - from));
  return { stage, top: false, total, filled, left: Math.max(1, total - filled) };
}
