import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* 9. Ticket                                                           */
/* ------------------------------------------------------------------ */

type Tone = 'white' | 'sun' | 'cobalt';
type Ground = 'white' | 'paper' | 'sky-wash' | 'night' | 'cobalt';

const TONE_CLASS: Record<Tone, string> = {
  white: 'bg-white text-ink',
  sun: 'bg-sun text-ink',
  cobalt: 'bg-cobalt text-white',
};

/** The colour behind the block, so the notches look bitten out. */
const GROUND_HEX: Record<Ground, string> = {
  white: '#FFFFFF',
  paper: '#FDFBF3',
  'sky-wash': '#B9E3FC',
  night: '#04225E',
  cobalt: '#0544B0',
};

/**
 * A ticket with a tear-off stub.
 *
 * Big number on the stub, the thing itself on the other side, a dashed
 * line and two bitten notches in between. It is the block for steps,
 * for a numbered sequence and for the card teaser. Anything that is not
 * countable does not belong on a ticket.
 */
export function Ticket({
  children,
  stub,
  tone = 'white',
  ground = 'white',
  rotate = -0.8,
  className = '',
}: {
  children: ReactNode;
  /** One number, one letter or one small drawn mark. */
  stub: ReactNode;
  tone?: Tone;
  ground?: Ground;
  rotate?: number;
  className?: string;
}) {
  const notch = GROUND_HEX[ground];
  const dash = tone === 'cobalt' ? 'text-white/70' : 'text-ink/45';

  return (
    <div
      className={`relative flex overflow-hidden rounded-[14px] border-[3px] border-ink ${TONE_CLASS[tone]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Stub */}
      <div className="flex w-[74px] shrink-0 items-center justify-center py-5">
        <span className="bb-display text-[2.6rem] leading-none">{stub}</span>
      </div>

      {/* Tear line with a notch bitten out at each end. */}
      <div className="relative w-[3px] shrink-0 self-stretch">
        <svg
          aria-hidden
          focusable="false"
          viewBox="0 0 6 200"
          preserveAspectRatio="none"
          className={`absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 ${dash}`}
        >
          <path
            d="M3 6 C 5 54 1 104 3 194"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="10 9"
            strokeLinecap="round"
          />
        </svg>
        <span
          aria-hidden
          className="absolute -top-[11px] left-1/2 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[3px] border-ink"
          style={{ background: notch }}
        />
        <span
          aria-hidden
          className="absolute -bottom-[11px] left-1/2 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[3px] border-ink"
          style={{ background: notch }}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 px-5 py-4 [hyphens:none]">{children}</div>
    </div>
  );
}

/**
 * The line of type on a ticket: a Fredoka head and one plain line under
 * it. Kept beside the Ticket so three steps always set the same way.
 */
export function TicketLine({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <p className="font-display font-bold text-[1.05rem] leading-tight">{title}</p>
      {children && <p className="mt-1.5 text-[0.93rem] leading-relaxed opacity-90">{children}</p>}
    </>
  );
}
