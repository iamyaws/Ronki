import { ReactNode } from 'react';
import { LAUNCH_STATE } from '../config/launch-state';
import { WaitlistCTA } from './WaitlistCTA';
import { HandNote } from './primitives/HandNote';

type Props = {
  /** Reserved slot for a future Ronki cut-out on the right. The band is
   *  designed to look finished with nothing in it, so it renders no box,
   *  no placeholder and no empty column when this is absent. */
  art?: ReactNode;
};

/** Scattered sun stars. Fixed list so the band looks the same on every
 *  render, varied in size and angle so it does not read as a pattern. */
const STARS = [
  { left: '2%', top: '16%', size: 12, rot: -12, phone: false },
  { left: '45%', top: '92%', size: 8, rot: 18, phone: false },
  { left: '64%', top: '14%', size: 12, rot: 6, phone: false },
  { left: '70%', top: '58%', size: 9, rot: -20, phone: false },
  { left: '76%', top: '30%', size: 14, rot: 22, phone: false },
  { left: '82%', top: '78%', size: 15, rot: -6, phone: false },
  { left: '88%', top: '8%', size: 11, rot: 12, phone: true },
  { left: '93%', top: '52%', size: 13, rot: -16, phone: false },
  { left: '90%', top: '93%', size: 10, rot: 8, phone: true },
  { left: '97%', top: '84%', size: 9, rot: -10, phone: false },
];

/**
 * The closing band: a full-width night block that ends the page.
 *
 * Torn crayon top edge, sun stars in the dark, the shared card CTA in
 * its night dress. Night is the one ground where a sun pill is allowed,
 * because sun on night carries enough contrast.
 */
export function ClosingBand({ art }: Props) {
  return (
    <div className="relative">
      {/* Torn top edge. Drawn a little taller than it sits so the crayon
       *  displacement can never open a seam against the band below. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 -top-[38px] h-[56px] w-full text-night"
        style={{ filter: 'url(#bb-crayon)' }}
      >
        <path
          d="M0 56 L0 26 C 130 14 250 34 372 24 C 494 14 604 36 726 28 C 848 20 962 40 1084 27 C 1206 14 1320 32 1440 21 L1440 56 Z"
          fill="currentColor"
        />
      </svg>

      <section
        className="relative overflow-hidden bg-night text-white"
        aria-labelledby="closing-band-heading"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {STARS.map((s) => (
            <svg
              key={`${s.left}-${s.top}`}
              viewBox="0 0 24 24"
              /* On a phone the copy fills the whole band, so only the
               *  stars below the text stay on. */
              className={`absolute ${s.phone ? '' : 'hidden sm:block'}`}
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
              }}
            >
              <path
                d="M12 0 C13.4 7 17 10.6 24 12 C17 13.4 13.4 17 12 24 C10.6 17 7 13.4 0 12 C7 10.6 10.6 7 12 0 Z"
                fill="#FDD134"
              />
            </svg>
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-16 sm:pt-20 sm:pb-20">
          <div
            className={
              art
                ? 'grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'
                : 'max-w-3xl'
            }
          >
            <div>
              <h2
                id="closing-band-heading"
                className="bb-display text-white text-3xl sm:text-4xl lg:text-5xl"
              >
                Fangt klein an. Eine Karte reicht.
              </h2>
              {/* Not the footer's sign-off line, which sits a few
               *  hundred pixels below this: the band needs its own. */}
              <p className="mt-5 text-base sm:text-lg text-white/[0.88] leading-relaxed max-w-xl">
                Kein Store, kein Download, keine Anmeldung.
              </p>

              <div className="mt-8">
                <WaitlistCTA launchState={LAUNCH_STATE} onNightBackground />
              </div>

              <HandNote tone="sun" rotate={-4} icon="heart" className="mt-8 origin-left">
                Karte drucken, fertig.
              </HandNote>
            </div>

            {art ? <div className="relative">{art}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
