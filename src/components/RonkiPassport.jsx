import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import VoiceAudio from '../utils/voiceAudio';
import { getCatStage } from '../utils/helpers';
import { lineText } from '../data/ronkiLines';
import { tripById } from '../data/trips';
import MoodChibi, { ambientMood } from './MoodChibi';
import StepStones from './drachennest/StepStones';
import { PaperCard, QuietLink, SpeechBubble, DoodleIcon } from './bilderbuch';

/**
 * RonkiPassport: Ronki's page on the Ronki tab (Finch pass, 26 Sep 2026;
 * spec R8, base design section 6).
 *
 * White ground, one scroll, no segments and no drawer. It shows who
 * Ronki is and what the two of them remember, and nothing to catch up on:
 *   1. Ronki large in his current look; a tap plays passport_hello_01.
 *   2. His name, and whose friend he is.
 *   3. Stickers that only count up: the fire the child taught him, and
 *      the adventures (only once there is at least one).
 *   4. The stepping stones to his next look (shared StepStones).
 *   5. The treasure shelf: only treasures found so far, no empty slots,
 *      no "x of 14". A tap shows the story again and Ronki tells it.
 *   6. A small "Für Eltern" link into the PIN gate.
 *
 * Props: onNavigate (tab switch, unused for now), onOpenParental.
 */

/** "Ronkis", "Funkis", but "Max'" for names that end in an s sound. */
function genitive(name) {
  return /[sßxz]$/i.test(name) ? `${name}’` : `${name}s`;
}

/**
 * The shelf: expeditionLog in the order found. A trip id shows once (a
 * repeat of a trip after the fourteenth brings no new treasure); old
 * mementos from before the pass have no trip id and all stay.
 */
export function shelfItems(expeditionLog) {
  const seen = new Set();
  const out = [];
  for (const m of Array.isArray(expeditionLog) ? expeditionLog : []) {
    if (!m || !m.emoji) continue;
    const trip = m.tripId ? tripById(m.tripId) : null;
    if (trip) {
      if (seen.has(trip.id)) continue;
      seen.add(trip.id);
      out.push({ key: `trip-${trip.id}`, emoji: trip.emoji || m.emoji, name: trip.treasure || m.name, place: trip.place, story: trip.story, voice: trip.storyVoice });
    } else {
      out.push({ key: `m-${m.id || m.ts || out.length}`, emoji: m.emoji, name: m.name, place: m.name || '', story: m.quote || '', voice: null });
    }
  }
  return out;
}

export default function RonkiPassport({ onNavigate, onOpenParental }) {
  const { state } = useTask();
  const [hello, setHello] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  if (!state) return null;

  const nick = (state.companionName && String(state.companionName).trim()) || 'Ronki';
  const kind = (state.familyConfig?.childName && String(state.familyConfig.childName).trim()) || '';
  const catEvo = Number.isFinite(state.catEvo) ? state.catEvo : 3;
  const log = Array.isArray(state.expeditionLog) ? state.expeditionLog : [];
  const adventures = Number.isFinite(state.adventureCount) ? state.adventureCount : log.length;
  const stage = getCatStage(catEvo);
  const mood = ambientMood(state.ronkiMood);
  const variant = state.companionVariant;
  const taughtFire = state.taughtSignature === 'fire';
  const shelf = shelfItems(log);
  const open = shelf.find((s) => s.key === openKey) || null;

  const tapRonki = () => {
    setHello(true);
    VoiceAudio.playLocalized('passport_hello_01', 0);
  };

  const tapTreasure = (item) => {
    setOpenKey(item.key);
    if (item.voice) VoiceAudio.playLocalized(item.voice, 0);
  };

  return (
    <div className="min-h-dvh bg-white text-ink" data-testid="ronki-passport">
      <div className="max-w-lg mx-auto px-4" style={{ paddingTop: 20, paddingBottom: 132 }}>
        {/* 1. Ronki, big. */}
        <div className="flex flex-col items-center">
          <div style={{ minHeight: 64, display: 'flex', alignItems: 'flex-end' }}>
            {hello && (
              <SpeechBubble side="bottom" size="md">
                {lineText('passport_hello_01', { nick, kind })}
              </SpeechBubble>
            )}
          </div>
          <button
            type="button"
            onClick={tapRonki}
            aria-label={nick}
            className="bg-transparent border-0 p-0 active:scale-[0.98] transition-transform"
            style={{ cursor: 'pointer', marginTop: 6 }}
            data-testid="passport-ronki"
          >
            <MoodChibi size={200} stage={stage} mood={mood} variant={variant} animated />
          </button>

          {/* 2. Name and friend. */}
          <h1 className="bb-display text-ink text-center" style={{ fontSize: 34, marginTop: 10, lineHeight: 1.05 }}>
            {nick}
          </h1>
          <p className="font-headline font-semibold text-ink-soft text-center" style={{ fontSize: 20, marginTop: 4 }}>
            {kind ? `Der Freund von ${kind}` : 'Dein Freund'}
          </p>
        </div>

        {/* 3. Stickers, count-ups only. */}
        {(taughtFire || adventures > 0) && (
          <div className="flex flex-col gap-3" style={{ marginTop: 22 }}>
            {taughtFire && (
              <PaperCard tone="paper" pad="sm" style={{ transform: 'rotate(-0.8deg)' }} data-testid="sticker-fire">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-ember" aria-hidden="true">
                    <DoodleIcon name="flame" size={34} filled />
                  </span>
                  <span className="font-headline font-semibold" style={{ fontSize: 19, lineHeight: 1.2 }}>
                    {`Kann Feuer pusten. ${kind || 'Du'} ${kind ? 'hat' : 'hast'} es ihm gezeigt.`}
                  </span>
                </div>
              </PaperCard>
            )}
            {adventures > 0 && (
              <PaperCard tone="paper" pad="sm" style={{ transform: 'rotate(0.6deg)' }} data-testid="sticker-adventures">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-cobalt" aria-hidden="true">
                    <DoodleIcon name="cloud" size={34} />
                  </span>
                  <span className="font-headline font-semibold" style={{ fontSize: 19, lineHeight: 1.2 }}>
                    {`${adventures} Abenteuer`}
                  </span>
                </div>
              </PaperCard>
            )}
          </div>
        )}

        {/* 4. The way to the next look. */}
        <div style={{ marginTop: 26 }}>
          <StepStones catEvo={catEvo} adventureCount={adventures} variant={variant} />
        </div>

        {/* 5. The treasure shelf: found only. */}
        {shelf.length > 0 && (
          <section style={{ marginTop: 30 }} aria-label={`${genitive(nick)} Schatzregal`}>
            <h2 className="bb-display text-ink" style={{ fontSize: 26, marginBottom: 12 }}>
              {`${genitive(nick)} Schatzregal`}
            </h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }} data-testid="treasure-shelf">
              {shelf.map((item) => {
                const selected = item.key === openKey;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => tapTreasure(item)}
                    aria-pressed={selected}
                    aria-label={item.name || item.place}
                    className="bg-paper text-ink rounded-[20px] flex flex-col items-center justify-start active:scale-[0.97] transition-transform"
                    style={{
                      border: `3px solid ${selected ? 'var(--color-cobalt)' : 'var(--color-ink)'}`,
                      padding: '10px 6px 8px',
                      minHeight: 96,
                      cursor: 'pointer',
                    }}
                    data-testid="treasure-tile"
                  >
                    <span aria-hidden="true" style={{ fontSize: 38, lineHeight: 1 }}>{item.emoji}</span>
                    <span className="font-headline font-semibold text-center" style={{ fontSize: 14, lineHeight: 1.15, marginTop: 6 }}>
                      {item.place}
                    </span>
                  </button>
                );
              })}
            </div>
            {open && open.story && (
              <PaperCard tone="white" pad="md" style={{ marginTop: 14 }} data-testid="treasure-story">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" style={{ fontSize: 34, lineHeight: 1 }}>{open.emoji}</span>
                  <p className="font-headline" style={{ fontSize: 19, lineHeight: 1.35 }}>{open.story}</p>
                </div>
              </PaperCard>
            )}
          </section>
        )}

        {/* 6. The quiet way into the parent area. */}
        <div className="flex justify-center" style={{ marginTop: 36 }}>
          <QuietLink tone="ink" onClick={() => onOpenParental?.()}>
            Für Eltern
          </QuietLink>
        </div>
      </div>
    </div>
  );
}
