import { ReactNode } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';
import { SiteHeader } from './SiteHeader';

type Props = {
  children: ReactNode;
  /** Reading progress line at the top of the window. Only long reads
   *  (articles) want it; on every other page it is just a stray line. */
  readingProgress?: boolean;
};

/**
 * Page shell in the Bilderbuch look.
 *
 * The ground is plain white. No washes, no blurred orbs, no page-wide
 * grain: paper texture lives inside illustrations and stickers now, not
 * behind the copy. One cobalt crayon blob per page sits off the right
 * edge as the single piece of page decoration, faint enough that text
 * never lands on top of colour.
 */
export function PainterlyShell({ children, readingProgress = false }: Props) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <div className="relative min-h-screen bg-white text-ink selection:bg-sky-wash selection:text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-cobalt focus:text-white focus:font-display focus:font-semibold focus:text-sm"
      >
        Zum Hauptinhalt springen
      </a>

      {/* The one crayon blob on the page. Cropped by the right edge, low
       *  enough in opacity that running text stays on white. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute -right-32 top-[46vh] h-[360px] w-[320px] text-cobalt opacity-[0.07] md:-right-64 md:h-[620px] md:w-[560px]"
          viewBox="0 0 580 640"
          style={{ filter: 'url(#bb-crayon)' }}
        >
          <use href="#bb-blob" />
        </svg>
      </div>

      {readingProgress && (
        <motion.div
          aria-hidden
          style={reduced ? undefined : { scaleX: progress }}
          className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left bg-cobalt"
        />
      )}

      <SiteHeader />

      <div id="main-content" className="relative z-10">{children}</div>
    </div>
  );
}
