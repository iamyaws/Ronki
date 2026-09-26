import type { RonkiPose } from './types';

/**
 * 512 px copies of the Ronki poses: sharp on paper (over 230 ppi at the
 * size the sheet prints them) and a quarter of the 1024 px weight in the PDF.
 */
export const RONKI_ART_PATH = '/art/bilderbuch/ronki/512/';

/** Sun tick, the small drawn spark from the site. Decoration only. */
export function SunTick({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 34 34" aria-hidden focusable="false">
      <g stroke="#FDD134" strokeWidth="4" strokeLinecap="round">
        <path d="M17 3v7" />
        <path d="M17 24v7" />
        <path d="M3 17h7" />
        <path d="M24 17h7" />
      </g>
    </svg>
  );
}

/**
 * Ronki hosting the sheet from the top right, with a speech bubble in an
 * ink outline to the left of him. No bubble on the toddler sheet.
 */
export function RonkiHost({ pose, bubble }: { pose: RonkiPose; bubble?: string }) {
  return (
    <div className={`rs-host${bubble ? '' : ' rs-host--quiet'}`}>
      <img
        className="rs-host-img"
        src={`${RONKI_ART_PATH}${pose}.webp`}
        alt=""
        width={512}
        height={512}
        draggable={false}
      />
      {bubble && (
        <p className="rs-bubble" data-ronki-bubble>
          {bubble}
        </p>
      )}
      <SunTick className="rs-tick" />
    </div>
  );
}
