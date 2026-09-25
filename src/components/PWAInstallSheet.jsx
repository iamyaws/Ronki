import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import VoiceAudio from '../utils/voiceAudio';
import { PillButton, QuietLink, DoodleIcon } from './bilderbuch';

const IOS_STEPS = [
  {
    icon: 'arrow',
    title: 'Teilen-Knopf antippen',
    text: 'Am unteren Rand von Safari: das kleine Viereck mit dem Pfeil nach oben.',
  },
  {
    icon: 'plus',
    title: 'Zum Home-Bildschirm',
    text: 'Scrolle nach unten und wähle „Zum Home-Bildschirm" aus der Liste.',
  },
  {
    icon: 'check',
    title: 'Hinzufügen antippen',
    text: 'Oben rechts auf „Hinzufügen". Dann erscheint Ronki auf eurem Bildschirm! 🎉',
  },
];

/**
 * Bottom-sheet PWA install prompt.
 * Props: isIOS, androidPrompt, onInstall, onSkip
 *
 * Headline + body now live in i18n (pwa.prompt.title / .body) because
 * this sheet is fired post-engagement — the copy had to shift from
 * "please install" to "great job, now keep going". The iOS step cards
 * stay hardcoded DE because they're procedural instructions about the
 * Safari UI, not marketing copy.
 *
 * Look (Bilderbuch, 25 Sep 2026): white sheet with an ink outline and
 * 28 px top corners, sky-wash icon circle, sun number stickers on the
 * iOS steps, one cobalt pill, a quiet link to skip.
 */
export default function PWAInstallSheet({ isIOS, androidPrompt, onInstall, onSkip }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Ronki invitation to put him on the homescreen — fires once when
  // the sheet mounts, after the slide-in begins (Apr 2026 voice pass).
  useEffect(() => {
    VoiceAudio.playLocalized('pwa_install_01', 600);
  }, []);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[800] flex items-end justify-center"
      style={{ background: 'rgba(4,34,94,0.45)' }}
      onClick={onSkip}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-lg bg-white text-ink px-6 pb-10 pt-4 border-[3px] border-b-0 border-ink"
        style={{
          borderRadius: '28px 28px 0 0',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 rounded-full bg-ink" style={{ width: 44, height: 4, opacity: 0.35 }} />

        {/* Home icon in a sky-wash circle */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-sky-wash border-[2.5px] border-ink text-ink">
          <DoodleIcon name="home" size={32} />
        </div>

        <h2 className="bb-display text-2xl text-center mb-2">
          {t('pwa.prompt.title')}
        </h2>
        <p className="font-body text-base text-ink-soft text-center mb-6 leading-relaxed">
          {t('pwa.prompt.body')}
        </p>

        {/* ── iOS instructions ── */}
        {isIOS && (
          <>
            <div className="flex flex-col gap-4 mb-7">
              {IOS_STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 relative bg-paper border-[2.5px] border-ink text-cobalt">
                    <DoodleIcon name={s.icon} size={22} stroke={6} />
                    {/* step number sticker */}
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-headline font-bold bg-sun text-ink border-[2px] border-ink"
                      style={{ fontSize: 12, transform: 'rotate(-8deg)' }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-headline font-bold text-base text-ink leading-tight">{s.title}</p>
                    <p className="font-body text-sm text-ink-soft leading-snug mt-0.5">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <PillButton tone="primary" full onClick={onSkip}>
              Verstanden!
            </PillButton>
          </>
        )}

        {/* ── Android / desktop ── */}
        {!isIOS && androidPrompt && (
          <div className="flex flex-col items-center gap-2">
            <PillButton tone="primary" full onClick={onInstall} arrow>
              Jetzt installieren
            </PillButton>
            <QuietLink tone="ink" onClick={onSkip}>
              Überspringen
            </QuietLink>
          </div>
        )}

        {/* ── Already installed / unknown ── */}
        {!isIOS && !androidPrompt && (
          <PillButton tone="primary" full onClick={onSkip} arrow>
            Weiter
          </PillButton>
        )}
      </div>
    </div>
  );
}
