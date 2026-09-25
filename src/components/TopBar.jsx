import React from 'react';
import { useTask } from '../context/TaskContext';
import { Pearl } from './CurrencyIcons';
import AnimatedCount from './AnimatedCount';
import { useTranslation } from '../i18n/LanguageContext';
import PinnedRonki from './PinnedRonki';
import { DoodleIcon } from './bilderbuch';

/**
 * TopBar (the old one, used by Journal and Belohnungsbank). Inline,
 * scrolls away with the page. Bilderbuch cut, 25 Sep 2026: a paper
 * back pill with an ink outline, the pinned Ronki chip in the middle,
 * the parent lock as a round paper button and the Sterne as a sun
 * sticker pill. No blur, no gradient, no shadow.
 *
 * Slots per view stay as they were:
 *   · Journal: no lock (kids-eyes-only), no Sterne pill
 *   · Shop:    lock + Sterne pill
 *   · Others:  Sterne pill only
 */
export default function TopBar({ onNavigate, view, onOpenParental }) {
  const { state } = useTask();
  const { lang } = useTranslation();
  const hp = state?.hp || 0;
  const showLock = view === 'shop';
  const showHp = view !== 'journal';

  return (
    <header
      className="relative w-full max-w-lg mx-auto text-ink"
      style={{
        padding: '10px 16px 12px',
        paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="flex justify-between items-center gap-3">
        {/* Left: back pill to the Nest. */}
        <button
          type="button"
          onClick={() => onNavigate?.('hub')}
          className="inline-flex items-center gap-1.5 rounded-full bg-paper text-ink shrink-0 active:scale-95 transition-transform"
          style={{ padding: '8px 16px 8px 10px', border: '2.5px solid var(--color-ink)', minHeight: 44 }}
        >
          <DoodleIcon name="back" size={18} stroke={7} />
          <span className="font-headline font-semibold" style={{ fontSize: 16, lineHeight: 1 }}>
            {lang === 'de' ? 'Lager' : 'Camp'}
          </span>
        </button>

        {/* Pinned Ronki: the companion follows the kid across tabs.
            Hidden on the Ronki tab itself. */}
        {view !== 'care' && view !== 'ronki' && (
          <PinnedRonki
            size={46}
            onTap={() => onNavigate?.('ronki')}
            ariaLabel={lang === 'de' ? 'Zu Ronki' : 'Go to Ronki'}
          />
        )}

        {/* Right: view-specific slots (parent lock + Sterne). */}
        <div className="flex items-center gap-2.5 shrink-0">
          {showLock && (
            <button
              type="button"
              onClick={onOpenParental}
              aria-label={lang === 'de' ? 'Eltern-Bereich' : 'Parent area'}
              className="flex items-center justify-center rounded-full bg-paper text-ink active:scale-95 transition-transform"
              style={{ width: 44, height: 44, border: '2.5px solid var(--color-ink)' }}
            >
              <DoodleIcon name="lock" size={22} />
            </button>
          )}
          {showHp && (
            <button
              type="button"
              onClick={() => onNavigate?.('shop')}
              aria-label={lang === 'de' ? 'Zum Laden' : 'Open shop'}
              data-sterne-pill
              className="flex items-center rounded-full bg-sun text-ink active:scale-95 transition-transform"
              style={{ padding: '6px 14px 6px 10px', gap: 8, border: '2.5px solid var(--color-ink)', minHeight: 44 }}
            >
              <Pearl size={22} />
              <div className="flex flex-col leading-none">
                <AnimatedCount
                  value={hp}
                  className="font-headline font-bold"
                  style={{ fontSize: 18, lineHeight: 1 }}
                />
                <span className="bb-hand" style={{ fontSize: 14, lineHeight: 1, marginTop: 2 }}>
                  {lang === 'de' ? 'Sterne' : 'Stars'}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
