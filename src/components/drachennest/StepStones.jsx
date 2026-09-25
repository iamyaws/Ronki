import React from 'react';
import MoodChibi from '../MoodChibi';
import VoiceAudio from '../../utils/voiceAudio';
import { stonesToNext } from '../../loop/growth';
import { growLeftLine, lineText } from '../../data/ronkiLines';

/**
 * StepStones: the way to Ronki's next look, for a child who cannot read
 * (Finch pass, 26 Sep 2026; spec R6, base design section 5).
 *
 * A row of round stones from Ronki's current look to a soft silhouette of
 * the next one. Walked stones are sun yellow, the rest paper with an ink
 * outline. No numbers. Tapping the row plays Ronki's spoken count
 * ("Noch zwei Abenteuer, dann werd ich größer."), and the same line sits
 * under the stones as text. At the last stage the stones give way to
 * "Größer geht's nicht. Aber ich wachse trotzdem weiter. Innen drin."
 *
 * Shared by DepartureSheet, TreasureReveal (Lane C) and RonkiPassport
 * (Lane D). Props: catEvo, adventureCount, variant, size ('md' | 'sm'),
 * speakOnMount (plays the count once when it appears).
 */
export default function StepStones({
  catEvo,
  adventureCount,
  variant,
  size = 'md',
  speakOnMount = false,
  className = '',
  style,
}) {
  const model = stonesToNext(catEvo, adventureCount);
  const lineId = model.top ? 'grow_top_01' : growLeftLine(model.left);
  const text = lineText(lineId);

  React.useEffect(() => {
    if (speakOnMount) VoiceAudio.playLocalized(lineId, 300);
    // Only on mount: a re-render must not repeat the line.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stone = size === 'sm' ? 16 : 22;
  const gap = size === 'sm' ? 5 : 7;
  const ronki = size === 'sm' ? 44 : 60;

  return (
    <button
      type="button"
      onClick={() => VoiceAudio.playLocalized(lineId, 0)}
      aria-label={text}
      className={`w-full bg-transparent border-0 p-0 text-ink ${className}`}
      style={{ cursor: 'pointer', ...style }}
      data-testid="step-stones"
    >
      {model.top ? (
        <div className="flex items-center justify-center gap-3">
          <MoodChibi size={ronki} variant={variant} stage={model.stage} mood="normal" bare />
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ gap }}>
          <MoodChibi size={ronki} variant={variant} stage={model.stage} mood="normal" bare />
          <div className="flex items-center flex-wrap justify-center" style={{ gap, maxWidth: 12 * (stone + gap) }}>
            {Array.from({ length: model.total }, (_, i) => {
              const walked = i < model.filled;
              return (
                <span
                  key={i}
                  aria-hidden="true"
                  data-walked={walked ? 'true' : 'false'}
                  style={{
                    width: stone,
                    height: stone,
                    borderRadius: '50%',
                    border: '2.5px solid var(--color-ink)',
                    background: walked ? 'var(--color-sun)' : 'var(--color-paper)',
                    display: 'inline-block',
                  }}
                />
              );
            })}
          </div>
          {/* The next look as a soft silhouette: a promise, not a lock. */}
          <div aria-hidden="true" style={{ opacity: 0.35, filter: 'grayscale(1)' }}>
            <MoodChibi size={ronki} variant={variant} stage={model.stage + 1} mood="normal" bare />
          </div>
        </div>
      )}
      <div className="bb-hand text-ink-soft text-center" style={{ fontSize: size === 'sm' ? 16 : 18, marginTop: 8, lineHeight: 1.15 }}>
        {text}
      </div>
    </button>
  );
}
