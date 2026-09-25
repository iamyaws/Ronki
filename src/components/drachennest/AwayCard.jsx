import React, { useEffect, useRef, useState } from 'react';
import VoiceAudio from '../../utils/voiceAudio';
import { PaperCard, DoodleIcon, RonkiArt } from '../bilderbuch';
import { SunMoonPath } from './DepartureSheet';
import RonkiAwayLoop from './RonkiAwayLoop';

const PEEK_MS = 7000;

/**
 * AwayCard: Ronki's postcard while he is on his day trip (Finch pass,
 * 26 Sep 2026; base design 3.2).
 *
 * A paper postcard with Ronki on his cloud and the sun-to-moon path: when
 * the marker reaches the moon, he is home. Tapping it plays "Ich bin
 * unterwegs. Wenn es Abend wird, bin ich wieder da." and opens a short
 * look at him in the Morgenwald (RonkiAwayLoop), which closes by itself
 * after a few seconds or on any tap. Nothing to do, nothing to wait for.
 */
export default function AwayCard({ now, eveningStart, onPeek }) {
  const [peek, setPeek] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const open = () => {
    VoiceAudio.playLocalized('away_day_01', 0);
    onPeek?.();
    setPeek(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeek(false), PEEK_MS);
  };
  const close = () => {
    clearTimeout(timer.current);
    setPeek(false);
  };

  return (
    <>
      <PaperCard
        as="button"
        tone="paper"
        pad="md"
        lift
        onClick={open}
        aria-label="Ronkis Postkarte"
        data-testid="away-card"
        data-loud="true"
        className="w-full flex flex-col items-center"
        style={{ transform: 'rotate(-1deg)' }}
      >
        <div className="flex items-center justify-center w-full" style={{ gap: 8 }}>
          <RonkiArt pose="cloud" size={130} idle="bb-idle-bob" />
          <span aria-hidden="true" style={{ color: 'var(--color-cobalt)' }}>
            <DoodleIcon name="sound" size={28} />
          </span>
        </div>
        <SunMoonPath now={now} eveningStart={eveningStart} style={{ marginTop: 8 }} />
      </PaperCard>

      {peek && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ronki unterwegs"
          data-testid="away-peek"
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 80, cursor: 'pointer' }}
        >
          <RonkiAwayLoop />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); close(); }}
            aria-label="Schließen"
            className="flex items-center justify-center rounded-full bg-white text-ink"
            style={{ position: 'absolute', top: 'calc(12px + env(safe-area-inset-top, 0px))', right: 12, width: 48, height: 48, border: '2.5px solid var(--color-ink)' }}
          >
            <DoodleIcon name="close" size={22} />
          </button>
        </div>
      )}
    </>
  );
}
