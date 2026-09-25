import type { ReactNode } from 'react';
import { WashiTape } from '../primitives/WashiTape';

/* ------------------------------------------------------------------ */
/* 6. Polaroid                                                         */
/* ------------------------------------------------------------------ */

/**
 * A photo somebody put on the table.
 *
 * White frame, a thick strip under the picture, a caption in the hand
 * voice. It is for real photographs only. Illustrations go in the
 * PictureFrame, because a drawing in a photo frame claims to be a
 * document of something that happened.
 */
export function Polaroid({
  src,
  alt,
  caption,
  width = 800,
  height = 800,
  rotate = -2,
  tape = false,
  className = '',
  children,
}: {
  src?: string;
  alt?: string;
  /** Hand written under the picture. Keep it to one short line. */
  caption?: ReactNode;
  width?: number;
  height?: number;
  rotate?: number;
  tape?: boolean;
  className?: string;
  /** Used instead of src when the picture is not an img. */
  children?: ReactNode;
}) {
  return (
    <figure
      className={`relative inline-block bg-white p-3 pb-2 ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 0 0 2px #040812, 6px 7px 0 rgba(4, 8, 18, 0.16)',
      }}
    >
      {tape && <WashiTape className="-top-3 left-1/2 -ml-[44px] w-[88px] h-8" rotate={-6} />}

      <div className="overflow-hidden bg-sky-wash ring-1 ring-ink/25">
        {children ??
          (src ? (
            <img
              src={src}
              alt={alt ?? ''}
              width={width}
              height={height}
              loading="lazy"
              className="block h-full w-full object-cover"
            />
          ) : null)}
      </div>

      {caption ? (
        <figcaption className="bb-hand pt-3 pb-2 text-center text-xl leading-tight text-ink">
          {caption}
        </figcaption>
      ) : (
        <div className="h-9" />
      )}
    </figure>
  );
}
