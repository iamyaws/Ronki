import React, { useEffect, useRef } from 'react';
import VoiceAudio from '../../utils/voiceAudio';
import { PillButton, DoodleIcon, RonkiArt, useReducedMotion } from '../bilderbuch';
import StepStones from './StepStones';
import { localMinutes, minutesOfHHMM } from '../../loop/clock';

const ART = `${import.meta.env.BASE_URL}art/bilderbuch/`;
const MORGENWALD = `${ART}scenes/morgenwald.webp`;
const CLOUD_LOOP = `${ART}loops/ronki-cloud.webp`;

const DAY_FROM = 6 * 60;

/** Where "now" sits on the sun-to-moon path, 0 (morning) to 1 (evening start). */
export function dayFraction(now, eveningStart) {
  const end = minutesOfHHMM(eveningStart || '17:00');
  const m = localMinutes(now);
  if (end <= DAY_FROM) return 0;
  return Math.max(0, Math.min(1, (m - DAY_FROM) / (end - DAY_FROM)));
}

/**
 * SunMoonPath: time for a child who cannot read clocks. A drawn arc from
 * the sun to the moon with one marker at "now". When the marker reaches
 * the moon, Ronki is home. No countdown, no numbers.
 */
export function SunMoonPath({ now, eveningStart, onDark = false, style }) {
  const t = dayFraction(now, eveningStart);
  // Quadratic arc from (30, 58) over (160, -6) to (290, 58), viewBox 320 x 76.
  const x = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 160 + t * t * 290;
  const y = (1 - t) * (1 - t) * 58 + 2 * (1 - t) * t * -6 + t * t * 58;
  const ink = onDark ? '#ffffff' : 'var(--color-ink)';
  return (
    <div data-testid="sun-moon-path" data-t={t.toFixed(2)} aria-hidden="true" style={{ position: 'relative', width: '100%', maxWidth: 340, margin: '0 auto', ...style }}>
      <svg viewBox="0 0 320 76" width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <path d="M30 58 Q 160 -6 290 58" fill="none" stroke={ink} strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
        <circle cx={x} cy={y} r="11" fill="var(--color-sun)" stroke={ink} strokeWidth="3" />
      </svg>
      <span style={{ position: 'absolute', left: 0, bottom: -4, color: 'var(--color-sun)' }}>
        <DoodleIcon name="sun" size={40} filled />
      </span>
      <span style={{ position: 'absolute', right: 0, bottom: -4, color: onDark ? 'var(--color-sun)' : 'var(--color-cobalt)' }}>
        <DoodleIcon name="moon" size={36} filled />
      </span>
    </div>
  );
}

/**
 * DepartureSheet: the send-off after a full morning fire (Finch pass,
 * 26 Sep 2026; base design 3.1).
 *
 * Sky ground, the Morgenwald treetops, Ronki on his cloud, the
 * sun-to-moon path, the stepping stones to his next look (spoken once),
 * one sun pill "Tschüss, {nick}!". The goodbye line is the school one on
 * weekdays and the free one on weekends and holidays; RoomHub picks it
 * and does the departure in onBye. A close doodle lets the child stay a
 * little longer; the send-off card stays on the Nest.
 */
export default function DepartureSheet({
  nick,
  now,
  eveningStart,
  byeLineId = 'trip_bye_school_01',
  catEvo,
  adventureCount,
  variant,
  onBye,
  onClose,
}) {
  const reduced = useReducedMotion();
  const firedRef = useRef(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bye = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    VoiceAudio.playLocalized(byeLineId, 0);
    onBye?.();
  };

  const label = `Tschüss, ${(nick && nick.trim()) || 'Ronki'}!`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronki fliegt los"
      data-testid="departure-sheet"
      className="bg-sky text-ink"
      style={{ position: 'fixed', inset: 0, zIndex: 80, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      {/* The Morgenwald treetops, Ronki on his cloud in front of them. */}
      <div aria-hidden="true" style={{ position: 'relative', width: '100%', height: '46dvh', minHeight: 250, overflow: 'hidden', borderBottom: '3px solid var(--color-ink)' }}>
        <img
          src={MORGENWALD}
          alt=""
          draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%' }}
        />
        <div
          className={reduced ? '' : 'bb-idle-bob'}
          style={{ position: 'absolute', left: '50%', top: '18%', width: '52%', maxWidth: 240, transform: 'translateX(-50%)' }}
        >
          {reduced ? (
            <RonkiArt pose="cloud" size={240} style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1' }} />
          ) : (
            <img src={CLOUD_LOOP} alt="" draggable={false} style={{ display: 'block', width: '100%', height: 'auto' }} />
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Schließen"
        className="flex items-center justify-center rounded-full bg-white text-ink"
        style={{ position: 'absolute', top: 'calc(12px + env(safe-area-inset-top, 0px))', right: 12, width: 48, height: 48, border: '2.5px solid var(--color-ink)', zIndex: 2 }}
      >
        <DoodleIcon name="close" size={22} />
      </button>

      <div className="flex flex-col items-center" style={{ padding: '22px 16px calc(28px + env(safe-area-inset-bottom, 0px))', gap: 22, flex: 1 }}>
        <SunMoonPath now={now} eveningStart={eveningStart} />
        <div className="w-full rounded-[28px] bg-white" style={{ border: '3px solid var(--color-ink)', padding: '14px 12px' }}>
          <StepStones catEvo={catEvo} adventureCount={adventureCount} variant={variant} size="sm" speakOnMount />
        </div>
        <PillButton tone="sun" size="lg" full onClick={bye}>
          {label}
        </PillButton>
      </div>
    </div>
  );
}
