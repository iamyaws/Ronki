import React, { useEffect, useRef, useState } from 'react';
import VoiceAudio from '../../utils/voiceAudio';
import { lineText } from '../../data/ronkiLines';
import { blockAt } from '../../loop/dayPhase';
import { now as clockNow } from '../../loop/clock';
import MoodChibi, { RonkiArt } from '../MoodChibi';
import { DoodleIcon, PaperCard, PillButton, SpeechBubble } from '../bilderbuch';

/**
 * FirstDayIntro: three short beats after the first breath (Finch pass,
 * base design 2.1 screens 12 to 14, spec R4).
 *
 *   fire   Ronki beside his fire, two of four flames lit: "Vom Pusten ist
 *          es schon halb warm." (fd_fire_half_01)
 *   trip   full fire, Ronki on his cloud, a gift: "Wenn es ganz warm
 *          ist, flieg ich los." (fd_fire_trip_01)
 *   day1   paper card, sun sticker, Ronki cheers: "Heute ist unser
 *          erster Tag!" plus the start line of the current block
 *
 * The start line depends on the clock (blockAt): morning, day (no
 * send-off on day 1, R4: Ronki stays and the evening warms his fire),
 * evening or night. Every beat is on white, tappable anywhere, with its
 * pill visible at once. Words come from finchLines.de.json; a missing
 * voice file stays silent and the text stays on screen.
 *
 * Props: { eveningStart, onDone, now? } (now is for tests and previews).
 */

const BEATS = ['fire', 'trip', 'day1'];
const TAP_GUARD_MS = 450;

export function startLineFor(block) {
  if (block === 'morning') return 'fd_start_morning_01';
  if (block === 'day') return 'fd_start_day_01';
  return 'fd_start_evening_01';
}

export default function FirstDayIntro({ eveningStart, onDone, now }) {
  const [beat, setBeat] = useState(0);
  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const at = now instanceof Date ? now : clockNow();
  const startId = startLineFor(blockAt(at, { eveningStart }));

  useEffect(() => {
    shownAt.current = Date.now();
    const b = BEATS[beat];
    const timers = [];
    if (b === 'fire') VoiceAudio.playLocalized('fd_fire_half_01', 300);
    if (b === 'trip') VoiceAudio.playLocalized('fd_fire_trip_01', 300);
    if (b === 'day1') {
      VoiceAudio.playLocalized('fd_day1_01', 300);
      timers.push(setTimeout(() => VoiceAudio.playLocalized(startId), 2200));
    }
    return () => timers.forEach(clearTimeout);
  }, [beat, startId]);

  const next = () => {
    if (Date.now() - shownAt.current < TAP_GUARD_MS) return;
    if (beat < BEATS.length - 1) {
      setBeat(beat + 1);
      return;
    }
    if (doneRef.current) return;
    doneRef.current = true;
    onDone?.();
  };

  const b = BEATS[beat];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronkis erster Tag"
      className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-white text-ink font-body"
      onClick={next}
    >
      <main
        key={b}
        className="relative min-h-full flex flex-col items-center px-5 fdi-in"
        style={{
          paddingTop: 'calc(28px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm min-w-0">
          {b === 'fire' && (
            <>
              <SpeechBubble side="bottom" size="lg" style={{ maxWidth: 320 }}>
                {lineText('fd_fire_half_01')}
              </SpeechBubble>
              <div className="flex items-end justify-center gap-3 w-full">
                <MoodChibi stage={1} mood="gut" size={150} bare label="Ronki" />
                <FlameRow lit={2} total={4} size={40} label="Zwei von vier Flammen brennen" />
              </div>
            </>
          )}

          {b === 'trip' && (
            <>
              <SpeechBubble side="bottom" size="lg" style={{ maxWidth: 320 }}>
                {lineText('fd_fire_trip_01')}
              </SpeechBubble>
              <div className="flex items-center justify-center gap-1.5 w-full" aria-label="Volles Feuer, Ronki fliegt los, ein Geschenk" role="img">
                <FlameRow lit={4} total={4} size={24} />
                <DoodleIcon name="arrow" size={18} stroke={7} />
                <RonkiArt pose="cloud" size={112} />
                <DoodleIcon name="arrow" size={18} stroke={7} />
                <span style={{ color: 'var(--color-cobalt)' }}>
                  <DoodleIcon name="gift" size={52} />
                </span>
              </div>
            </>
          )}

          {b === 'day1' && (
            <PaperCard tone="paper" lift pad="lg" className="w-full flex flex-col items-center text-center" style={{ transform: 'rotate(-1deg)' }}>
              <div className="relative mb-2" aria-hidden="true">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-ink bg-sun text-ink">
                  <DoodleIcon name="sun" size={40} />
                </div>
              </div>
              <RonkiArt pose="cheer" animated size={170} label="Ronki freut sich" />
              <h1 className="bb-display text-3xl m-0 mt-2">{lineText('fd_day1_01')}</h1>
              <p className="font-headline font-semibold text-xl leading-snug m-0 mt-3" data-line={startId}>
                {lineText(startId)}
              </p>
            </PaperCard>
          )}
        </div>

        <div className="w-full max-w-sm pt-4">
          <PillButton
            full
            size="lg"
            arrow
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            {b === 'day1' ? "Los geht's" : 'Weiter'}
          </PillButton>
        </div>
      </main>

      <style>{`
        @keyframes fdiIn { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: none; } }
        .fdi-in { animation: fdiIn 450ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .fdi-in { animation: none; } }
      `}</style>
    </div>
  );
}

/** A drawn row of flames, the first `lit` filled. */
function FlameRow({ lit, total, size, label }) {
  return (
    <div
      className="flex items-end gap-1"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      data-lit={lit}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ color: i < lit ? 'var(--color-ember)' : 'var(--color-ink-soft)' }} data-flame={i < lit ? 'lit' : 'unlit'}>
          <DoodleIcon name="flame" size={size} filled={i < lit} />
        </span>
      ))}
    </div>
  );
}
