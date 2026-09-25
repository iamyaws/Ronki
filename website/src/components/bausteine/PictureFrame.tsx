import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 7. PictureFrame                                                     */
/* ------------------------------------------------------------------ */

/**
 * The drawn frame around an illustration.
 *
 * Soft rounded corners, one heavy outline, a slight tilt, nothing else.
 * Ink on light grounds, white on cobalt and night. It holds Ronki, the
 * friends and every piece of drawn art on the site. Photos do not go in
 * here, they go in the Polaroid.
 */
export function PictureFrame({
  src,
  alt,
  caption,
  tone = 'ink',
  rotate = -1.5,
  width = 800,
  height = 600,
  className = '',
  children,
}: {
  src?: string;
  alt?: string;
  /** A line in the hand voice under the frame. */
  caption?: ReactNode;
  tone?: 'ink' | 'white';
  rotate?: number;
  width?: number;
  height?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <figure className={`inline-block max-w-full ${className}`}>
      <div
        className={`bb-frame ${tone === 'white' ? 'bb-frame--light' : ''}`}
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {children ??
          (src ? (
            <img src={src} alt={alt ?? ''} width={width} height={height} loading="lazy" />
          ) : null)}
      </div>
      {caption && (
        <figcaption
          className={`bb-hand mt-3 text-xl leading-tight ${
            tone === 'white' ? 'text-sun' : 'text-cobalt'
          }`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
