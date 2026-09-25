/**
 * The torn crayon edge between two grounds.
 *
 * Same device as the top of the night closing band: the incoming section
 * draws its own colour as a wavy band that reaches back over the section
 * above, so the seam looks torn rather than ruled. It replaces every
 * hairline `border-t` the old SaaS layout used between sections.
 *
 * Three paths so two neighbouring edges never repeat, and the band is
 * always drawn taller than it sits, because the crayon displacement can
 * otherwise open a hairline gap against the section below.
 */

type Tone = 'white' | 'paper' | 'sky-wash' | 'night' | 'cobalt';

const TONE_CLASS: Record<Tone, string> = {
  white: 'text-white',
  paper: 'text-paper',
  'sky-wash': 'text-sky-wash',
  night: 'text-night',
  cobalt: 'text-cobalt',
};

const PATHS = [
  'M0 56 L0 26 C 130 14 250 34 372 24 C 494 14 604 36 726 28 C 848 20 962 40 1084 27 C 1206 14 1320 32 1440 21 L1440 56 Z',
  'M0 56 L0 30 C 96 40 214 18 330 26 C 460 35 560 15 682 22 C 820 30 918 42 1046 30 C 1180 17 1312 30 1440 24 L1440 56 Z',
  'M0 56 L0 22 C 120 34 232 18 356 28 C 470 37 590 20 708 30 C 838 41 940 22 1064 24 C 1200 26 1326 40 1440 28 L1440 56 Z',
];

export function PaperEdge({ tone, variant = 0 }: { tone: Tone; variant?: number }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1440 56"
      preserveAspectRatio="none"
      className={`absolute left-0 right-0 -top-[34px] h-[52px] w-full ${TONE_CLASS[tone]}`}
      style={{ filter: 'url(#bb-tear)' }}
    >
      <path d={PATHS[variant % PATHS.length]} fill="currentColor" />
    </svg>
  );
}
