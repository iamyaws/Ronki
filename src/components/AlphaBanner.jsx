import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * AlphaBanner: small persistent strip at the top of the app that sets
 * expectations for early testers. Parent-focused message; kids ignore it.
 *
 * Finch pass (26 Sep 2026): the kid-tappable "DE > EN" switch and the
 * "Rückmeldung" mail link are gone from here. Both live in the parent
 * dashboard (Einstellungen: Sprache, Feedback an Marc), behind the PIN.
 * Only the Alpha label stays.
 *
 * Publishes its own rendered height to the CSS variable `--alpha-banner-h`
 * on the document root so downstream fixed headers (TopBar, Hub's internal
 * header) can offset by exactly the banner's height, including the iOS
 * safe-area-inset-top which the banner absorbs. Without this, `fixed top-0`
 * headers render ON TOP of the sticky banner at scroll=0 and clip avatars.
 *
 * Look (Bilderbuch, 25 Sep 2026): night blue strip, white print and a
 * sun dot.
 */
export default function AlphaBanner() {
  const { t } = useTranslation();
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
      </div>
    </div>
  );
}
