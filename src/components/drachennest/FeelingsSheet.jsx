import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { track } from '../../lib/analytics';
import VoiceAudio from '../../utils/voiceAudio';
import MoodChibi from '../MoodChibi';
import FeelingDoodle from '../JournalFeelings';
import { ChoiceTile, SpeechBubble, PillButton, QuietLink, DoodleIcon } from '../bilderbuch';
import { lineText } from '../../data/ronkiLines';
import { linesDe } from '../../companion/lines/de';
import { moodSlot } from './returnBeat';

/** The six feelings: labels and indexes as on the old RoomHub prompt and the Tagebuch. */
export const MOODS = [
  { idx: 3, label: 'Gut' },
  { idx: 4, label: 'Magisch' },
  { idx: 2, label: 'Okay' },
  { idx: 0, label: 'Traurig' },
  { idx: 1, label: 'Besorgt' },
  { idx: 5, label: 'Müde' },
];

/** Telemetry names by index, as the Tagebuch sends them (Journal.jsx MOOD_ENUM). */
const MOOD_ENUM = ['sad', 'worried', 'okay', 'good', 'magical', 'tired'];

/** Ronki's reply voice per feeling index (existing files in public/audio/ronki). */
export const REPLY_FOR = {
  3: 'mood_happy_01',
  4: 'mood_happy_01',
  2: 'mood_okay_01',
  0: 'mood_sad_01',
  1: 'mood_worried_01',
  5: 'mood_tired_01',
};

/** After these Ronki offers to sit together (spec R5). */
export const SIT_OFFER = new Set([0, 1]);

/**
 * The reply text of an existing voice line. The recorded worried line was
 * written with a long dash; the text on screen never shows one.
 */
export function replyText(voiceId) {
  const raw = linesDe.find(l => l.id === `de_${voiceId}`)?.text || '';
  return raw
    .replace(/\s*[\u2013\u2014]\s*(\S)/g, (_, c) => `. ${c.toUpperCase()}`)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * FeelingsSheet: "Wie geht's dir?" (Finch pass, 26 Sep 2026; spec R5).
 *
 * Opens from the face button in the Nest header at any time (mood_ask_01)
 * and once a day in the evening, right after the treasure story
 * (eve_mood_ask_01). Six feelings as choice tiles. A pick writes moodAM
 * before 12:00 and moodPM after (or the slot the caller forces), fires
 * mood.pick and plays Ronki's reply. After Traurig or Besorgt Ronki asks
 * "Magst du kurz bei mir sitzen?" with the pill "Bei Ronki sitzen" and a
 * quiet "Später". The close doodle works from the first frame.
 */
export default function FeelingsSheet({ askId = 'mood_ask_01', slot, now, onClose, onSit, onPick }) {
  const { state, actions } = useTask();
  const [picked, setPicked] = useState(null);
  const closeTimer = useRef(null);
  const variant = state?.companionVariant;
  const nick = state?.companionName;
  const kind = state?.familyConfig?.childName;

  useEffect(() => {
    VoiceAudio.playLocalized(askId, 250);
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (idx) => {
    if (picked !== null) return;
    const target = slot || moodSlot(now || new Date());
    actions?.setMood?.(target, idx);
    track('mood.pick', { mood: MOOD_ENUM[idx] || 'unknown', slot: target === 'moodAM' ? 'AM' : 'PM' });
    setPicked(idx);
    onPick?.(idx);
    if (SIT_OFFER.has(idx)) {
      // The reply first, then the offer to sit together.
      VoiceAudio.playLocalized(REPLY_FOR[idx], 0);
      closeTimer.current = setTimeout(() => VoiceAudio.playLocalized('mood_sit_offer_01', 0), 3600);
    } else {
      VoiceAudio.playLocalized(REPLY_FOR[idx], 0);
      closeTimer.current = setTimeout(() => onClose?.(), 4200);
    }
  };

  const sitOffer = picked !== null && SIT_OFFER.has(picked);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wie geht's dir?"
      data-testid="feelings-sheet"
      className="bg-white text-ink"
      style={{ position: 'fixed', inset: 0, zIndex: 84, overflowY: 'auto' }}
    >
      <button
        type="button"
        onClick={() => onClose?.()}
        aria-label="Schließen"
        className="flex items-center justify-center rounded-full bg-white text-ink"
        style={{ position: 'absolute', top: 'calc(12px + env(safe-area-inset-top, 0px))', right: 12, width: 48, height: 48, border: '2.5px solid var(--color-ink)', zIndex: 2 }}
      >
        <DoodleIcon name="close" size={22} />
      </button>

      <div className="flex flex-col" style={{ maxWidth: 460, margin: '0 auto', padding: 'calc(72px + env(safe-area-inset-top, 0px)) 16px 32px' }}>
        <div className="flex items-end gap-3">
          <MoodChibi size={72} variant={variant} stage={1} mood="normal" face />
          <div className="min-w-0 flex-1">
            <SpeechBubble side="left" tone="paper" rotate={0} size="lg">
              {picked === null
                ? lineText(askId, { nick, kind })
                : replyText(REPLY_FOR[picked])}
            </SpeechBubble>
          </div>
        </div>

        {picked === null && (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginTop: 22 }}
            role="group"
            aria-label="Gefühl aussuchen"
          >
            {MOODS.map(m => (
              <ChoiceTile key={m.idx} label={m.label} className="w-full" style={{ minWidth: 0 }} onClick={() => pick(m.idx)}>
                <FeelingDoodle idx={m.idx} size={44} />
              </ChoiceTile>
            ))}
          </div>
        )}

        {sitOffer && (
          <div className="flex flex-col items-center" style={{ marginTop: 26, gap: 10 }}>
            <SpeechBubble side="none" tone="sky-wash" rotate={-0.6}>
              {lineText('mood_sit_offer_01', { nick, kind })}
            </SpeechBubble>
            <div style={{ width: '100%', marginTop: 8 }}>
              <PillButton full size="lg" icon="flame" onClick={() => onSit?.()}>
                Bei Ronki sitzen
              </PillButton>
            </div>
            <QuietLink onClick={() => onClose?.()}>Später</QuietLink>
          </div>
        )}
      </div>
    </div>
  );
}
