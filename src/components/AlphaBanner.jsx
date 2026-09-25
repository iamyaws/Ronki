import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * AlphaBanner — small persistent strip at the top of the app that sets
 * expectations for early testers. Parent-focused message; kids ignore it.
 * Includes a feedback mailto link + a DE/EN language toggle (Apr 2026 —
 * Hector feedback: no visible way out of browser-detected English).
 *
 * Publishes its own rendered height to the CSS variable `--alpha-banner-h`
 * on the document root so downstream fixed headers (TopBar, Hub's internal
 * header) can offset by exactly the banner's height — including the iOS
 * safe-area-inset-top which the banner absorbs. Without this, `fixed top-0`
 * headers render ON TOP of the sticky banner at scroll=0 and clip avatars.
 *
 * Look (Bilderbuch, 25 Sep 2026): night blue strip, white print, a sun
 * dot and a sun feedback link. Sun on night is a dark ground, so it may
 * carry text here.
 */
export default function AlphaBanner() {
  const { t, lang, setLang } = useTranslation();
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const publish = () => {
      document.documentElement.style.setProperty('--alpha-banner-h', `${node.offsetHeight}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(node);
    window.addEventListener('resize', publish);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', publish);
      document.documentElement.style.removeProperty('--alpha-banner-h');
    };
  }, []);

  return (
    <div
      ref={ref}
      role="note"
      className="sticky top-0 inset-x-0 z-[60] bg-night text-white font-headline"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-1.5 text-[12px] leading-tight">
        <span aria-hidden className="inline-block w-2 h-2 rounded-full bg-sun shrink-0" />
        <span className="font-semibold">{t('alpha.label')}</span>
        <span className="opacity-40" aria-hidden>·</span>
        <span className="opacity-80 truncate font-body text-[11px]">{t('alpha.body')}</span>
        <button
          type="button"
          onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
          aria-label={t('lang.switchTo')}
          className="ml-auto shrink-0 font-semibold opacity-90 hover:opacity-100 transition-opacity"
          style={{ fontSize: 12, letterSpacing: '0.06em', padding: '4px 8px', minHeight: 28 }}
        >
          {lang === 'de' ? 'DE ▸ EN' : 'EN ▸ DE'}
        </button>
        <span className="opacity-40" aria-hidden>·</span>
        <a
          href="mailto:hallo@ronki.de?subject=Ronki%20Alpha%20Feedback"
          className="shrink-0 font-semibold text-sun hover:text-white transition-colors underline decoration-sun/50 underline-offset-2"
        >
          {t('alpha.feedback')}
        </a>
      </div>
    </div>
  );
}
