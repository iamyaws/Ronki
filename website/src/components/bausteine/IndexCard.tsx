import type { CSSProperties, ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 8. IndexCard                                                        */
/* ------------------------------------------------------------------ */

const BODY_STYLE: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(185, 227, 252, 0.85) 27px, rgba(185, 227, 252, 0.85) 28px)',
  backgroundPosition: '0 6px',
};

/**
 * A card out of the index box.
 *
 * Square corners, a cobalt rule under the head, pale ruling in the body
 * and a tab sticking out at the top that names the drawer it came from.
 * It is the teaser block: one article, one template, one tool. The tab
 * always carries the category, never the headline.
 */
export function IndexCard({
  children,
  tab,
  title,
  meta,
  image,
  imageAlt = '',
  rotate = -0.6,
  className = '',
}: {
  children?: ReactNode;
  /** The drawer name on the tab. Two or three words. */
  tab: string;
  title: ReactNode;
  /** Small line beside the title: reading time, date, count. */
  meta?: ReactNode;
  image?: string;
  imageAlt?: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <article
      className={`relative pt-[26px] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* The tab, pushed up out of the card. */}
      <span className="absolute left-6 top-0 z-10 rounded-t-[8px] border-[2.5px] border-b-0 border-ink bg-sky-wash px-3 pt-1 pb-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink">
        {tab}
      </span>

      <div className="relative rounded-[8px] border-[2.5px] border-ink bg-white">
        <div className="flex items-start gap-4 px-5 pt-5 pb-4">
          {image && (
            <span className="block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] border-[2.5px] border-ink bg-sky-wash">
              <img
                src={image}
                alt={imageAlt}
                width={200}
                height={200}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="bb-display text-[1.18rem] sm:text-[1.28rem] leading-[1.14] text-ink">
              {title}
            </h3>
            {meta && <p className="bb-hand mt-1.5 text-lg leading-none text-cobalt">{meta}</p>}
          </div>
        </div>

        {/* The cobalt rule. Runs the full width of the card, like the
         *  printed head line on a real index card. */}
        <span aria-hidden className="block h-[2.5px] w-full bg-cobalt" />

        {children && (
          <div className="px-5 pt-1.5 pb-4 text-[0.95rem] leading-7 text-ink/85" style={BODY_STYLE}>
            {children}
          </div>
        )}
      </div>
    </article>
  );
}
