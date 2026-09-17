import { ReactNode } from 'react';
import { LAUNCH_STATE } from '../config/launch-state';
import { WaitlistCTA } from './WaitlistCTA';
import { HandNote } from './primitives/HandNote';
import {
  getPlatformLabel,
  getSteps,
  useInstallPlatform,
} from '../lib/install-steps';

type Props = {
  /** Reserved slot for a future Ronki cut-out on the right. The band is
   *  designed to look finished with nothing in it, so it renders no box,
   *  no placeholder and no empty column when this is absent. */
  art?: ReactNode;
  /** Start page only: the three taps that put Ronki on the home screen,
   *  drawn into the right half of the band. Every other page keeps the
   *  quiet two-thirds band and links to /installieren instead. */
  install?: boolean;
};

/** Scattered sun stars. Fixed list so the band looks the same on every
 *  render, varied in size and angle so it does not read as a pattern. */
const STARS = [
  { left: '2%', top: '16%', size: 12, rot: -12, phone: false, edge: true },
  { left: '45%', top: '92%', size: 8, rot: 18, phone: false, edge: true },
  { left: '64%', top: '14%', size: 12, rot: 6, phone: false, edge: false },
  { left: '70%', top: '58%', size: 9, rot: -20, phone: false, edge: false },
  { left: '76%', top: '30%', size: 14, rot: 22, phone: false, edge: false },
  { left: '82%', top: '78%', size: 15, rot: -6, phone: false, edge: false },
  { left: '88%', top: '6%', size: 11, rot: 12, phone: true, edge: true },
  { left: '98%', top: '52%', size: 13, rot: -16, phone: false, edge: true },
  { left: '90%', top: '95%', size: 10, rot: 8, phone: false, edge: true },
  { left: '52%', top: '6%', size: 9, rot: -10, phone: false, edge: true },
];

/**
 * The closing band: a full-width night block that ends the page.
 *
 * Torn crayon top edge, sun stars in the dark, the shared card CTA in
 * its night dress. Night is the one ground where a sun pill is allowed,
 * because sun on night carries enough contrast.
 */
export function ClosingBand({ art, install = false }: Props) {
  const platform = useInstallPlatform();
  const steps = getSteps(platform === 'unknown' ? 'ios' : platform);
  const twoColumn = install || Boolean(art);

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
          {STARS.filter((s) => !install || s.edge).map((s) => (
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

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 pt-14 pb-14 sm:pt-16 sm:pb-16">
          <div
            className={
              twoColumn
                ? 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16'
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

            {install ? (
              <div className="relative">
                <p className="bb-hand text-xl uppercase leading-none text-sun">
                  So wird die Installation aussehen
                </p>
                {platform !== 'unknown' && (
                  <p className="mt-2 font-display font-semibold text-sm text-white/[0.8]">
                    Anleitung für {getPlatformLabel(platform)}
                  </p>
                )}

                <ol className="mt-7 flex flex-col gap-7">
                  {steps.map((s, i) => (
                    <li key={s.step} className="relative flex items-start gap-5 [hyphens:none]">
                      {/* The dashed line down to the next circle. Drawn
                       *  per step, so it always stops at step three. */}
                      {i < steps.length - 1 && (
                        <svg
                          aria-hidden
                          focusable="false"
                          viewBox="0 0 6 100"
                          preserveAspectRatio="none"
                          className="pointer-events-none absolute left-[26px] top-[58px] -bottom-[30px] w-1.5 text-white/35"
                        >
                          <path
                            d="M3 0 C 5 30 1 60 3 100"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeDasharray="12 10"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                      <span
                        aria-hidden
                        className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[2.5px] border-white bg-night font-display font-bold text-xl text-sun"
                      >
                        {s.step}
                      </span>
                      <div className="pt-1.5">
                        <h3 className="font-display font-bold text-white text-lg leading-tight">
                          {s.title}
                        </h3>
                        <p className="mt-1.5 text-[0.95rem] text-white/[0.85] leading-relaxed">
                          {s.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {art ? <div className="relative">{art}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
