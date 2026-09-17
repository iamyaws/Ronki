import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { LAUNCH_STATE, getLaunchCopy } from '../config/launch-state';
import { trackEvent } from '../lib/analytics';
import { EASE_OUT } from '../lib/motion';
import { StarSticker } from './primitives/BilderbuchDefs';

/** Fallback for the "App öffnen" link when the launch state carries no appUrl. */
const APP_URL_FALLBACK = 'https://app.ronki.de/';

/**
 * Variant F in the Bilderbuch look: the one full cobalt block on the
 * start page. White pill for the action, sun yellow for the eyebrow,
 * the underline and the hand note, sky blob behind the art.
 */
export function HeroVariantF() {
  const reduced = useReducedMotion();
  const copy = getLaunchCopy(LAUNCH_STATE);

  const fade = (delay: number) =>
    reduced
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          // Start visible and only move. Content that waits at opacity 0
          // for the animation stays blank on slow phones, in background
          // tabs and for crawlers, and it delays the largest paint.
          initial: { opacity: 1, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE_OUT },
        };

  return (
    <section
      className="relative flex flex-col items-center justify-center md:min-h-[640px] px-6 pt-24 pb-14 sm:pt-28 sm:pb-16 md:pb-20 overflow-hidden bg-cobalt"
      aria-label="Hero"
    >
      {/* Main content: two-column on md+ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 lg:gap-16 items-center">

        {/* Left column: copy */}
        <div className="flex flex-col items-start text-left">
          {/* Eyebrow */}
          <motion.p
            {...fade(0.1)}
            className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-sun mb-6 font-display font-bold"
          >
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-ember" />
            {copy.heroEyebrow}
          </motion.p>

          {/* Headline, B copy */}
          <motion.h1
            {...fade(0.2)}
            className="bb-display text-[2.5rem] sm:text-[3.2rem] lg:text-[4rem] xl:text-[4.5rem] text-white"
          >
            Stell dir vor, du sagst es{' '}
            <span className="bb-swipe">
              nur einmal.
              <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                <use href="#bb-underline" />
              </svg>
            </span>
          </motion.h1>

          {/* Subtitle, B copy */}
          <motion.p
            {...fade(0.4)}
            className="mt-6 text-lg sm:text-xl text-white/[0.88] leading-relaxed max-w-lg"
          >
            Ein kleiner Drache, der morgens an die Zähne erinnert und abends zuhört, wenn der Tag schwer war. Nicht du. Nicht zum zehnten Mal.
          </motion.p>

          {/* CTA pair: create the card, or take the paper template.
           * Two honest ways in. The card is the product, the template
           * is the thing parents came to Google for. Stacks to one
           * column below sm so both buttons stay full width at 375px. */}
          <motion.div {...fade(0.55)} className="mt-8 w-full max-w-md text-white">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/profil-erstellen"
                onClick={() => trackEvent('CTA Klick', { cta: 'karte', source: 'hero' })}
                className="group inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-white px-6 py-4 font-display font-bold text-base sm:text-lg text-ink transition-transform hover:-translate-y-0.5 text-center [hyphens:none]"
              >
                <span>Karte für euer Kind erstellen</span>
                <svg
                  aria-hidden
                  viewBox="0 0 64 64"
                  className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                >
                  <use href="#bb-arrow" />
                </svg>
              </Link>
              <Link
                to="/vorlagen"
                onClick={() => trackEvent('CTA Klick', { cta: 'vorlage', source: 'hero' })}
                className="inline-flex shrink-0 items-center justify-center rounded-full border-[2.5px] border-white bg-transparent px-6 py-4 font-display font-bold text-base sm:text-lg text-white transition-colors hover:bg-white/10 text-center [hyphens:none]"
              >
                Vorlage holen
              </Link>
            </div>

            <p
              className="mt-3 text-sm text-white/[0.88] leading-relaxed"
              style={{
                hyphens: 'manual',
                WebkitHyphens: 'manual',
                MozHyphens: 'manual',
              }}
            >
              Eltern erstellen die Karte in einer Minute, das Kind scannt sie in der App. Kostenlos, frühe Version.
            </p>

            <a
              href={copy.appUrl ?? APP_URL_FALLBACK}
              onClick={() => trackEvent('CTA Klick', { cta: 'app', source: 'hero' })}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-display font-semibold text-white underline decoration-2 underline-offset-4"
            >
              Schon eine Karte? App öffnen
            </a>
          </motion.div>

          {/* Secondary hook: ritual framing (option C), in the hand voice.
           * Explicit line break between the two statements keeps the
           * rhythm Marc wants. hyphens: manual stops German auto-
           * hyphenation from splitting "Unterschied" mid-word on
           * narrow viewports. */}
          <motion.p
            {...fade(0.7)}
            className="bb-hand mt-6 text-2xl sm:text-3xl leading-tight text-sun -rotate-2 origin-left"
            style={{
              hyphens: 'manual',
              WebkitHyphens: 'manual',
              MozHyphens: 'manual',
            }}
          >
            Routinen optimiert man. Rituale lebt man.
            <br />
            Ronki ist für den Unterschied gebaut.{' '}
            <svg
              aria-hidden
              viewBox="0 0 64 64"
              className="inline-block h-6 w-6 align-baseline text-ember"
            >
              <use href="#bb-heart" />
            </svg>
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            {...fade(0.8)}
            className="mt-8 flex flex-wrap items-center gap-2.5"
          >
            <TrustBadge label="Keine Werbung" />
            <TrustBadge label="Keine Streaks" />
            <TrustBadge label="Keine In-App-Käufe" />
          </motion.div>

          {/* Secondary link to storyboard */}
          <motion.a
            {...fade(0.9)}
            href="#storyboard"
            className="mt-6 inline-flex items-center text-sm text-white/70 hover:text-white transition-colors font-display font-semibold"
          >
            So sieht ein Tag aus →
          </motion.a>
        </div>

        {/* Right column: character illustration (md+) */}
        <div className="hidden md:flex items-center justify-center">
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE_OUT }}
            className="relative w-[360px] lg:w-[440px] h-[520px] lg:h-[600px]"
          >
            <svg
              aria-hidden
              viewBox="0 0 580 640"
              className="absolute -left-16 top-4 h-full w-[130%] text-sky"
              style={{ filter: 'url(#bb-crayon)' }}
            >
              <use href="#bb-blob" />
            </svg>
            <motion.div
              animate={reduced ? {} : { y: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="bb-frame bb-frame--light absolute left-6 top-8 w-[76%] h-[84%] -rotate-[2.5deg]"
            >
              <img
                src="/art/bilderbuch/hero-zuhause.webp"
                alt="Ronki, ein kleiner roter Drache mit blauem Kamm, liegt auf einem blauen Kissen und fragt: Magst du kurz bei mir sitzen?"
                width={716}
                height={1024}
              />
            </motion.div>
            <StarSticker
              lines={['Kleiner Drache.', 'Große Gefühle.']}
              className="absolute right-0 -top-4 h-[180px] w-[180px]"
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile illustration, below copy */}
      <motion.div
        {...fade(0.5)}
        className="relative z-10 mt-10 flex md:hidden justify-center w-full"
      >
        <div className="relative w-[280px] h-[400px]">
          <svg
            aria-hidden
            viewBox="0 0 580 640"
            className="absolute -left-12 top-2 h-full w-[140%] text-sky"
            style={{ filter: 'url(#bb-crayon)' }}
          >
            <use href="#bb-blob" />
          </svg>
          <div className="bb-frame bb-frame--light absolute left-5 top-6 w-[78%] h-[86%] -rotate-[2.5deg]">
            <img
              src="/art/bilderbuch/hero-zuhause.webp"
              alt="Ronki, ein kleiner roter Drache mit blauem Kamm, liegt auf einem blauen Kissen und fragt: Magst du kurz bei mir sitzen?"
              width={716}
              height={1024}
            />
          </div>
          <StarSticker
            lines={['Kleiner Drache.', 'Große Gefühle.']}
            className="absolute -right-4 -top-6 h-[124px] w-[124px]"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TrustBadge                                                          */
/* ------------------------------------------------------------------ */

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 px-3.5 py-1.5 font-display font-bold text-sm text-white">
      <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4 text-sun">
        <use href="#bb-check" />
      </svg>
      {label}
    </span>
  );
}
