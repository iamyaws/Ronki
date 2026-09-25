import React, { useEffect, useRef } from 'react';
import { useTask } from '../../context/TaskContext';
import VoiceAudio from '../../utils/voiceAudio';
import { PillButton, PaperCard, DoodleIcon, StickerBurst } from '../bilderbuch';
import StepStones from './StepStones';
import { tripById, isRepeat } from '../../data/trips';
import { lineText } from '../../data/ronkiLines';
import { evoAfterTreasure } from '../../loop/growth';

const REPEAT_GAP_MS = 3400;

/** What the treasure is: the trip it came from, or an old save's memento. */
export function treasureOf(expedition) {
  const m = expedition?.pendingMemento || null;
  const trip = tripById(expedition?.tripId || m?.tripId);
  if (trip) {
    return { emoji: trip.emoji, name: trip.treasure, place: trip.place, story: trip.story, storyVoice: trip.storyVoice, trip };
  }
  if (m) {
    return { emoji: m.emoji || '', name: m.name || '', place: m.location || '', story: m.quote || '', storyVoice: null, trip: null };
  }
  return null;
}

/**
 * TreasureReveal: Ronki unwraps what he brought (Finch pass, 26 Sep 2026;
 * base design 3.3).
 *
 * The treasure large on paper on the sky ground (not over the Morgenwald
 * painting, which shows Ronki with the maple leaf; own read O2), its
 * name and place,
 * and his short story as big text, spoken. A repeat trip (after the 14th)
 * first says honestly "Da war ich schon mal. Aber es war wieder schön."
 * The stepping stones show the way to his next look, counting this
 * adventure. One sun pill "Ins Regal stellen" calls receiveTreasure()
 * once; a double tap does nothing more.
 */
export default function TreasureReveal({ onDone }) {
  const { state, actions } = useTask();
  const firedRef = useRef(false);
  const expedition = state?.expedition;
  const treasure = treasureOf(expedition);
  const repeat = isRepeat(state?.tripCursor ?? 0) && !!treasure?.trip;
  const adventures = (state?.adventureCount ?? 0) + 1;
  const evo = evoAfterTreasure(state?.catEvo ?? 3, adventures);

  useEffect(() => {
    if (!treasure) return undefined;
    if (repeat) {
      VoiceAudio.playLocalized('trip_again_01', 300);
      if (treasure.storyVoice) {
        const t = setTimeout(() => VoiceAudio.playLocalized(treasure.storyVoice, 0), REPEAT_GAP_MS);
        return () => clearTimeout(t);
      }
      return undefined;
    }
    if (treasure.storyVoice) VoiceAudio.playLocalized(treasure.storyVoice, 400);
    return undefined;
    // Once per reveal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shelve = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    VoiceAudio.playLocalized('treasure_shelf_01', 0);
    actions?.receiveTreasure?.();
    onDone?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronkis Schatz"
      data-testid="treasure-reveal"
      className="bg-sky text-ink"
      style={{ position: 'fixed', inset: 0, zIndex: 85, overflowY: 'auto' }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{ minHeight: '100dvh', padding: 'calc(20px + env(safe-area-inset-top, 0px)) 16px calc(28px + env(safe-area-inset-bottom, 0px))', gap: 16 }}
      >
        <PaperCard tone="paper" pad="md" className="w-full flex flex-col items-center text-center" style={{ maxWidth: 440 }}>
          <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
            <span aria-hidden="true" style={{ fontSize: 104, lineHeight: 1 }}>{treasure?.emoji || ''}</span>
            {!treasure?.emoji && <DoodleIcon name="gift" size={96} />}
            <StickerBurst active size={260} />
          </div>
          {treasure?.name && (
            <div className="bb-display text-ink" style={{ fontSize: 30, marginTop: 6 }}>{treasure.name}</div>
          )}
          {treasure?.place && (
            <div className="bb-hand text-ink-soft" style={{ fontSize: 20, marginTop: 2, lineHeight: 1.1 }}>{treasure.place}</div>
          )}
          {repeat && (
            <p className="font-headline font-semibold text-ink" style={{ fontSize: 19, lineHeight: 1.35, margin: '14px 0 0' }}>
              {lineText('trip_again_01')}
            </p>
          )}
          {treasure?.story && (
            <button
              type="button"
              onClick={() => treasure.storyVoice && VoiceAudio.playLocalized(treasure.storyVoice, 0)}
              className="bb-display text-ink bg-transparent border-0"
              style={{ fontSize: 22, lineHeight: 1.35, margin: '14px 0 0', padding: 0, fontWeight: 600, cursor: 'pointer' }}
            >
              {treasure.story}
            </button>
          )}
          <div className="w-full" style={{ marginTop: 16 }}>
            <StepStones catEvo={evo} adventureCount={adventures} variant={state?.companionVariant} size="sm" />
          </div>
        </PaperCard>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <PillButton tone="sun" size="lg" full icon="gift" onClick={shelve}>
            Ins Regal stellen
          </PillButton>
        </div>
      </div>
    </div>
  );
}
