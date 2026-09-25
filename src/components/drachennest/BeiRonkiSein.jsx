import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import { track } from '../../lib/analytics';
import MoodChibi from '../MoodChibi';
import VoiceAudio from '../../utils/voiceAudio';
import { SpeechBubble, DoodleIcon, QuietLink } from '../bilderbuch';
import { TONIGHT_STORIES } from './TonightRitual';

/**
 * BeiRonkiSein: the presence beat (Marc 25 Apr 2026).
 *
 * A slow, cosy sit at the fire with Ronki saying one short kid-readable
 * line. No Funken, no vital, no meter. Tap anywhere to dismiss.
 *
 * Bilderbuch cut, 25 Sep 2026: this is a whole calm moment, so the
 * ground is night. A few sun stars, Ronki large and bare on his idle
 * loop, the fire as a drawn flame, the story in the shared SpeechBubble
 * above him, the way out a white drawn link. No gradients, no glow.
 *
 * Rotation rules stay: a line not shown in the last three sits (per
 * session), voiced through the same tonight_story_<i> bank, and since the
 * Finch pass the text shown is the text that bank says.
 */

// The texts on screen are the ones the voice files say: the
// tonight_story_<i> recordings belong to TonightRitual's ten bedtime
// stories (census 2.5: the sit showed ten other texts over that audio).
const STORIES = TONIGHT_STORIES;

// Sun stars on the night sky, fixed so the scene stays calm.
const STARS = [
  { top: '9%', left: '12%', size: 22 },
  { top: '15%', left: '78%', size: 16 },
  { top: '26%', left: '88%', size: 12 },
  { top: '31%', left: '8%', size: 13 },
  { top: '6%', left: '52%', size: 12 },
];

export default function BeiRonkiSein({ onClose }) {
  const { state } = useTask();
  const variant = state?.companionVariant || 'forest';
  // Match RoomHub's canonical mapping; never the egg here since the kid
  // has hatched by the time they sit down at the fire.
  const stageIdx = getCatStage(state?.catEvo ?? 0) || 1;

  // Track recently-shown line indexes per session so the rotation
  // doesn't repeat itself in quick succession.
  const recentRef = useRef(typeof window !== 'undefined' ? (window.__beiRonkiRecent || []) : []);
  const { story, storyIdx } = useMemo(() => {
    const recent = recentRef.current;
    const fresh = STORIES.map((_, i) => i).filter(i => !recent.includes(i));
    const pool = fresh.length > 0 ? fresh : STORIES.map((_, i) => i);
    const pickIdx = pool[Math.floor(Math.random() * pool.length)];
    const next = [...recent, pickIdx].slice(-3);
    recentRef.current = next;
    if (typeof window !== 'undefined') window.__beiRonkiRecent = next;
    return { story: STORIES[pickIdx], storyIdx: pickIdx };
  }, []);

  // ESC dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Telemetry: once per mount, "kid sat with Ronki".
  useEffect(() => { track('companion.sit'); }, []);

  // Reveal the story line ~700 ms after the scene fades in.
  const [showStory, setShowStory] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShowStory(true), 700);
    return () => clearTimeout(id);
  }, []);

  // Voice the picked story when it reveals.
  useEffect(() => {
    if (!showStory) return;
    VoiceAudio.playLocalized(`tonight_story_${storyIdx}`, 100);
  }, [showStory, storyIdx]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bei Ronki sitzen"
      onClick={onClose}
      className="bg-night text-white"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        animation: 'brs-fade-in 0.6s ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Sun stars */}
      {STARS.map((s, i) => (
        <span key={i} aria-hidden="true" className="absolute" style={{ top: s.top, left: s.left, color: 'var(--color-sun)' }}>
          <DoodleIcon name="star" size={s.size} filled />
        </span>
      ))}

      {/* The sit: story above, Ronki, the fire, the way out. */}
      <div
        className="relative flex flex-col items-center justify-end w-full"
        style={{ maxWidth: 460, minHeight: '100dvh', padding: '0 24px calc(28px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Story bubble */}
        <div style={{ minHeight: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', marginBottom: 24 }}>
          {showStory && (
            <div style={{ maxWidth: 360, animation: 'brs-bubble-in 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both' }}>
              <SpeechBubble side="bottom" tone="paper" rotate={-0.6} className="text-center">
                {story}
              </SpeechBubble>
            </div>
          )}
        </div>

        {/* Ronki, breathing, with the fire at his side. */}
        <div aria-hidden="true" className="relative" style={{ zIndex: 2, paddingLeft: 70 }}>
          <MoodChibi size={230} variant={variant} stage={stageIdx} mood="normal" bare animated />
          {/* The fire: a drawn flame, ember with a sun heart, on an ink log. */}
          <div className="absolute flex items-end justify-center" style={{ left: -12, bottom: -6, width: 110, height: 96, zIndex: 3 }}>
            <span className="absolute" style={{ bottom: 8, color: 'var(--color-ember)' }}>
              <DoodleIcon name="flame" size={84} filled />
            </span>
            <span className="absolute" style={{ bottom: 12, color: 'var(--color-sun)' }}>
              <DoodleIcon name="flame" size={44} filled />
            </span>
            <span className="absolute" style={{ bottom: 0, width: 110, height: 14, borderRadius: 7, background: 'var(--color-ink)' }} />
          </div>
        </div>

        {/* Quiet way out */}
        <div style={{ marginTop: 40 }}>
          <QuietLink tone="white" onClick={onClose}>
            Tipp irgendwo, um zurück zu gehen
          </QuietLink>
        </div>
      </div>

      <style>{`
        @keyframes brs-fade-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes brs-bubble-in {
          0%   { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
