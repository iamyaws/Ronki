import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { LAUNCH_STATE, getLaunchCopy } from '../config/launch-state';
import { trackEvent } from '../lib/analytics';
import { EASE_OUT } from '../lib/motion';

/** Fallback for the "App öffnen" link when the launch state carries no appUrl. */
const APP_URL_FALLBACK = 'https://app.ronki.de/';

/** Variant F: dark hero with character art plus story-driven B+E copy. */
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
      className="relative flex flex-col items-center justify-center min-h-[92vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden bg-teal-dark"
      aria-label="Hero"
    >
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 0.07 } : { opacity: [0.05, 0.10, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 0.06 } : { opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, #50a082 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(62,116,120,0.18) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Main content: two-column on md+ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 lg:gap-16 items-center">

        {/* Left column: copy */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          {/* Eyebrow */}
          <motion.p
            {...fade(0.1)}
            className="text-sm uppercase tracking-[0.18em] text-cream/70 mb-8 font-semibold"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
            {copy.heroEyebrow}
          </motion.p>

          {/* Headline, B copy */}
          <motion.h1
            {...fade(0.2)}
            className="font-display font-extrabold leading-[0.95] tracking-tight text-[2.5rem] sm:text-[3.2rem] lg:text-[4rem] xl:text-[4.5rem] text-cream"
          >
            Stell dir vor, du sagst es{' '}
            <span className="relative inline-block">
              <span className="relative z-10">nur einmal.</span>
              <motion.span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-3 rounded-sm bg-mustard/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: reduced ? 0 : 0.9, ease: EASE_OUT }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h1>

          {/* Subtitle, B copy */}
          <motion.p
            {...fade(0.4)}
            className="mt-8 text-lg sm:text-xl text-cream/80 leading-relaxed max-w-lg"
          >
            Ein kleiner Drache, der morgens an die Zähne erinnert und abends zuhört, wenn der Tag schwer war. Nicht du. Nicht zum zehnten Mal.
          </motion.p>

          {/* CTA pair: create the card, or take the paper template.
           * Two honest ways in. The card is the product, the template
           * is the thing parents came to Google for. Stacks to one
           * column below sm so both buttons stay full width at 375px. */}
          <motion.div {...fade(0.55)} className="mt-8 w-full max-w-md text-cream">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/profil-erstellen"
                onClick={() => trackEvent('CTA Klick', { cta: 'karte', source: 'hero' })}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-mustard px-6 py-4 font-display font-semibold text-base sm:text-lg text-teal-dark shadow-md hover:bg-mustard-soft hover:shadow-lg transition-all text-center [hyphens:none]"
              >
                <span>Karte für euer Kind erstellen</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                to="/vorlagen"
                onClick={() => trackEvent('CTA Klick', { cta: 'vorlage', source: 'hero' })}
                className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-cream/35 px-6 py-4 font-display font-semibold text-base sm:text-lg text-cream hover:border-cream/70 hover:bg-cream/5 transition-all text-center [hyphens:none]"
              >
                Vorlage holen
              </Link>
            </div>

            <p
              className="mt-3 text-sm text-cream/75 leading-relaxed"
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
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-cream/55 hover:text-cream/85 underline underline-offset-4 transition-colors"
            >
              Schon eine Karte? App öffnen
            </a>
          </motion.div>

          {/* Secondary hook: ritual framing (option C).
           * Explicit line break between the two statements keeps the
           * rhythm Marc wants. hyphens: manual stops German auto-
           * hyphenation from splitting "Unterschied" mid-word on
           * narrow viewports. */}
          <motion.p
            {...fade(0.7)}
            className="mt-6 text-base sm:text-lg font-display font-semibold text-mustard/90 italic leading-snug"
            style={{
              hyphens: 'manual',
              WebkitHyphens: 'manual',
              MozHyphens: 'manual',
            }}
          >
            Routinen optimiert man. Rituale lebt man.
            <br />
            Ronki ist für den Unterschied gebaut.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            {...fade(0.8)}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center md:justify-start"
          >
            <TrustBadge label="Keine Werbung" />
            <TrustBadge label="Keine Streaks" />
            <TrustBadge label="Keine In-App-Käufe" />
          </motion.div>

          {/* Secondary link to storyboard */}
          <motion.a
            {...fade(0.9)}
            href="#storyboard"
            className="mt-6 inline-flex items-center text-sm text-cream/50 hover:text-cream/80 transition-colors font-medium"
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
          >
            <motion.div
              animate={reduced ? {} : { y: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-10 rounded-full blur-3xl opacity-30"
                  style={{ background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)' }}
                />
                <img
                  src="/art/routines/brushing-teeth.webp"
                  alt="Ein Junge und sein Drache Ronki beim Zähneputzen, fröhlich, im Abenteuer-Stil gemalt."
                  width={520}
                  height={520}
                  className="relative w-[360px] lg:w-[440px] xl:w-[500px] rounded-[2rem] shadow-2xl"
                  style={{ boxShadow: '0 32px 72px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)' }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile illustration, below copy */}
      <motion.div
        {...fade(0.5)}
        className="relative z-10 mt-10 flex md:hidden justify-center w-full"
      >
        <img
          src="/art/routines/brushing-teeth.webp"
          alt="Ein Junge und sein Drache Ronki beim Zähneputzen."
          width={320}
          height={320}
          className="w-64 sm:w-72 rounded-[1.5rem] shadow-2xl"
          style={{ boxShadow: '0 24px 56px rgba(0,0,0,0.35), 0 6px 20px rgba(0,0,0,0.18)' }}
        />
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase text-cream/35"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          scroll ↓
        </motion.span>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TrustBadge                                                          */
/* ------------------------------------------------------------------ */

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-cream/85 font-semibold">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mustard" />
      {label}
    </span>
  );
}
