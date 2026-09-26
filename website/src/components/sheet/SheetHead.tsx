import type { ReactNode } from 'react';
import { RonkiWordmark } from '../primitives/RonkiWordmark';

/** Titles longer than this drop one size so they stay on two lines. */
const LONG_TITLE = 24;

/**
 * Top of a sheet: wordmark, sun sticker label in Gochi Hand, the Fredoka
 * title, an optional line under it and the "Das ist der Plan von" name
 * line (`nameLine={false}` leaves it out). `host` sits to the right (Ronki
 * with his bubble).
 */
export function SheetHead({
  eyebrow,
  title,
  description,
  heading: Heading = 'h1',
  host,
  nameLine = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  heading?: 'h1' | 'h2';
  host?: ReactNode;
  nameLine?: boolean;
}) {
  return (
    <header className="rs-head">
      <div className="rs-head-text">
        <RonkiWordmark size={26} className="rs-wordmark" />
        <span className="rs-sticker">{eyebrow}</span>
        <Heading className={`rs-title${title.length > LONG_TITLE ? ' rs-title--long' : ''}`}>
          {title}
        </Heading>
        {description && <p className="rs-desc">{description}</p>}
        {nameLine && (
          <p className="rs-name">
            Das ist der Plan von <span className="rs-name-line" aria-hidden />
          </p>
        )}
      </div>
      {host}
    </header>
  );
}
