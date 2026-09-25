/**
 * The Nest's beats (Finch pass, 26 Sep 2026). Pure functions, no React.
 *
 * - greetingFor: the first Nest open of the day plays one return line.
 *   It notices the return, never the absence (spec 3.5, PRD 4.1).
 * - nestBeat: which of the Nest's states is on right now, from the clock,
 *   the fire and the trip. RoomHub renders exactly one loud item per mode.
 *
 * Modes:
 *   fire       Ronki home, morning or evening block, the fire is building
 *   departure  morning fire full, no trip today yet: the send-off
 *   stay       Ronki home in the day block (morning not full, or day 1)
 *   away       Ronki on a day trip: the empty room and the postcard
 *   waiting    Ronki back with a treasure (wins over every other mode)
 *   evening    evening block, fire full or no evening tasks: the moon card
 *   night      TonightRitual done this evening, or a dream trip: asleep
 *
 * Spec: docs/specs/2026-09-26-finch-pass-spec.md (R2, R4, R5) and the
 * base design section 3.
 */
import { blockAt, isWeekend } from '../../loop/dayPhase';
import { fireFor, fireOfBlock, isFirstDay } from '../../loop/fire';
import { dayKey } from '../../loop/clock';
import { returnLineFor } from '../../data/ronkiLines';

/** Block options from a save. */
export function blockOptions(state) {
  return {
    eveningStart: state?.familyConfig?.eveningStart,
    vacation: !!state?.vacMode,
    tonightDoneAt: state?.eveningRitualCompletedAt,
  };
}

/** The first line of the day, or null when today's line already played. */
export function greetingFor(state, now) {
  if (!state) return null;
  const today = dayKey(now);
  if (state.greetedDate === today) return null;
  const gap = Number.isFinite(state.lastGapDays) ? state.lastGapDays : 0;
  return returnLineFor(gap, blockAt(now, blockOptions(state)));
}

/** Afternoon tasks: main quests with anchor 'evening' or 'hobby', not yet done. */
export function afternoonTasks(quests) {
  return (quests || [])
    .filter(q => q && !q.sideQuest && !q.done && (q.anchor === 'evening' || q.anchor === 'hobby'))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Undone quests in their order, with the ones set aside by "Später"
 * moved to the end (for this session only; nothing is stored).
 */
export function orderWithLater(quests, laterIds = []) {
  const undone = (quests || []).filter(q => q && !q.done);
  const later = new Set(laterIds);
  const front = undone.filter(q => !later.has(q.id));
  const back = laterIds.map(id => undone.find(q => q.id === id)).filter(Boolean);
  return [...front, ...back];
}

/** The mood slot a feeling picked now writes to (spec R5). */
export function moodSlot(now) {
  return now.getHours() < 12 ? 'moodAM' : 'moodPM';
}

/** Ronki's goodbye: school days vs weekends and holidays. */
export function byeLine(now, vacMode) {
  return isWeekend(now) || vacMode ? 'trip_bye_free_01' : 'trip_bye_school_01';
}

/** Which state the Nest is in right now. */
export function nestBeat(state, now) {
  const opts = blockOptions(state);
  const block = blockAt(now, opts);
  const fire = fireFor(state || {}, now);
  const today = dayKey(now);
  const firstDay = isFirstDay(state || {}, now);
  const exp = state?.expedition || { state: 'home' };
  const tripToday = state?.lastTripDate === today;
  const base = { block, fire, today, firstDay, tripToday };

  if (exp.state === 'waiting') return { ...base, mode: 'waiting', tripKind: exp.kind === 'night' ? 'night' : 'day' };
  if (exp.state === 'away') {
    // A dream trip happens in his sleep: he lies in the nest, asleep.
    if (exp.kind === 'night') return { ...base, mode: 'night' };
    return { ...base, mode: 'away' };
  }
  // 'home', and the legacy 'leaving' (never shown, migrated to home).
  if (block === 'night') return { ...base, mode: 'night' };

  if (block === 'morning') {
    if (fire.total > 0 && fire.full && !tripToday) return { ...base, mode: 'departure' };
    if (fire.total > 0 && !fire.full) return { ...base, mode: 'fire' };
    return { ...base, mode: 'stay' };
  }

  if (block === 'day') {
    // A morning fire that really is full still sends him off after the
    // block ticked over, except on day 1 (spec R4: no send-off after an
    // afternoon install). An unfinished morning never does (spec R2).
    const morning = fireOfBlock(state || {}, 'morning', now);
    if (!firstDay && morning.total > 0 && morning.full && !tripToday) {
      return { ...base, fire: morning, mode: 'departure' };
    }
    return { ...base, mode: 'stay' };
  }

  // Evening block.
  if (fire.total > 0 && !fire.full) return { ...base, mode: 'fire' };
  return { ...base, mode: 'evening' };
}
