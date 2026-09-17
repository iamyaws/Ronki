import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';
import { PaperEdge } from './primitives/PaperEdge';
import { StickerLabel } from './primitives/StickerLabel';
import { WashiTape } from './primitives/WashiTape';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface Task {
  label: string;
  done: boolean;
}

interface Beat {
  time: string;
  icon: string;
  title: string;
  body: string;
  tasks: Task[];
  /** Degrees. Each sheet lies a little differently on the table. */
  tilt: number;
}

const BEATS: Beat[] = [
  {
    time: 'Morgen',
    icon: '☀️',
    title: 'Drei von vier geschafft. Ohne Nachfragen.',
    body: 'Sieben Uhr. Louis kommt verschlafen ins Bad. Ronki zeigt ihm die Liste: Gesicht waschen, anziehen, frühstücken, Tasche packen. Drei Haken schon drin. Fehlt nur noch die Tasche. Niemand muss rufen.',
    tasks: [
      { label: 'Gesicht waschen', done: true },
      { label: 'Anziehen', done: true },
      { label: 'Frühstücken', done: true },
      { label: 'Tasche packen', done: false },
    ],
    tilt: -1.5,
  },
  {
    time: 'Nachmittag',
    icon: '🎨',
    title: 'Malen, Fußball, Gedicht. Sein Nachmittag.',
    body: 'Nach der Schule gehört der Tag Louis. Ronki schlägt drei Sachen vor. Was davon drankommt, entscheidet er selbst. Heute war Fußball-Training. Das Bild kommt morgen. Das Gedicht übt er abends.',
    tasks: [
      { label: 'Bild malen', done: true },
      { label: 'Fußball Training', done: true },
      { label: 'Gedicht üben', done: false },
    ],
    tilt: 1.2,
  },
  {
    time: 'Abend',
    icon: '🌙',
    title: 'Zähne, Pyjama, Licht aus. Ronki schläft schon.',
    body: 'Abendroutine. Zähne putzen, Gesicht waschen, Pyjama an. Drei von vier erledigt. Das Licht macht Louis gleich selbst aus. Ronki liegt schon im Nest. „Bis morgen." Niemand muss dreimal rufen.',
    tasks: [
      { label: 'Zähne putzen', done: true },
      { label: 'Gesicht waschen', done: true },
      { label: 'Pyjama an', done: true },
      { label: 'Licht aus', done: false },
    ],
    tilt: -0.8,
  },
];

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

/**
 * A day with Ronki, told as three printed sheets on the table.
 *
 * The old version showed three mocked-up app screens with progress bars
 * and a "Jetzt" chip. That is a product screenshot, not a picture book,
 * and it said the same thing three times down a very long page. Three
 * sheets side by side say it once.
 */
export function ArcStoryboard() {
  return (
    <div className="relative">
      <PaperEdge tone="sky-wash" variant={2} />
      <section
        id="storyboard"
        className="relative bg-sky-wash px-5 sm:px-6 py-12 sm:py-14"
        aria-labelledby="storyboard-heading"
      >
        <div className="relative max-w-6xl mx-auto">
          <StickerLabel tone="white" rotate={-2}>
            Wie ein Tag mit Ronki aussieht
          </StickerLabel>

          <h2
            id="storyboard-heading"
            className="bb-display mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] text-ink max-w-3xl"
          >
            Ein Tag. Drei ruhige{' '}
            <span className="bb-swipe">
              Routinen
              <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none">
                <use href="#bb-underline" />
              </svg>
            </span>{' '}
            für dein Kind.
          </h2>

          <p className="mt-4 text-[1.05rem] sm:text-lg text-ink/85 max-w-2xl leading-relaxed">
            Kein straffer Plan, kein Minutenzähler. Ronki zeigt deinem Kind, was heute dran ist. Was geschafft ist, sieht es selbst. Was noch fehlt, auch.
          </p>

          {/* Sits in the empty gap to the right of the headline block,
           *  which is capped at max-w-3xl for exactly this reason. */}
          <HandNote
            rotate={-4}
            className="mt-6 lg:mt-0 lg:absolute lg:right-2 lg:top-16 lg:w-[200px] lg:text-right"
          >
            Drei kleine Listen, mehr nicht.
          </HandNote>

          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
            {BEATS.map((beat, i) => (
              <BeatColumn key={beat.time} beat={beat} index={i} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="/wie-es-funktioniert"
              className="group inline-flex items-center gap-3 rounded-full bg-cobalt px-7 py-3.5 font-display font-bold text-base text-white transition-transform hover:-translate-y-0.5"
            >
              So funktioniert Ronki im Detail
              <svg
                aria-hidden
                viewBox="0 0 64 64"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              >
                <use href="#bb-arrow" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One sheet plus its beat                                             */
/* ------------------------------------------------------------------ */

function BeatColumn({ beat, index }: { beat: Beat; index: number }) {
  const doneCount = beat.tasks.filter((t) => t.done).length;

  return (
    <motion.article
      initial={{ opacity: 1, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE_OUT }}
      className="flex flex-col"
    >
      {/* The sheet */}
      <div
        className="relative rounded-[24px] border-[3px] border-ink bg-white px-5 pt-7 pb-6 [transform:rotate(calc(var(--tilt)*0.5))] md:[transform:rotate(var(--tilt))]"
        style={{ '--tilt': `${beat.tilt}deg` } as CSSProperties}
        role="img"
        aria-label={`${beat.time}routine: ${doneCount} von ${beat.tasks.length} erledigt`}
      >
        <WashiTape
          className="-top-3.5 left-1/2 -ml-[44px] w-[88px] h-8"
          rotate={index % 2 === 0 ? -6 : 5}
        />

        <div className="flex items-start justify-between gap-3">
          <StickerLabel tone="sun" rotate={-3}>
            {beat.time}
          </StickerLabel>
          <span aria-hidden className="text-2xl leading-none">
            {beat.icon}
          </span>
        </div>

        <p className="bb-display mt-4 text-xl sm:text-2xl text-ink">
          {beat.time}routine
        </p>

        <ul className="mt-4 flex flex-col gap-1 md:min-h-[204px]">
          {beat.tasks.map((task) => (
            <li
              key={task.label}
              className={`flex items-center gap-3 rounded-[14px] px-2.5 py-2 ${
                task.done ? '' : 'bg-sun'
              }`}
            >
              <span aria-hidden className="relative h-8 w-8 shrink-0">
                <svg viewBox="0 0 64 64" className="absolute inset-0 h-8 w-8 text-cobalt">
                  <use href="#bb-ring" />
                </svg>
                {task.done && (
                  <svg
                    viewBox="0 0 64 64"
                    className="absolute inset-[6px] h-5 w-5 text-cobalt"
                  >
                    <use href="#bb-check" />
                  </svg>
                )}
              </span>
              <span className="font-display font-semibold text-[0.95rem] sm:text-base text-ink leading-snug">
                {task.label}
              </span>
            </li>
          ))}
        </ul>

        <svg
          aria-hidden
          viewBox="0 0 600 6"
          preserveAspectRatio="none"
          className="mt-5 h-1.5 w-full text-ink/35"
        >
          <use href="#bb-dash" />
        </svg>
      </div>

      {/* The beat under it */}
      <h3 className="bb-display mt-7 text-[1.45rem] sm:text-[1.6rem] text-ink">
        {beat.title}
      </h3>
      <p className="mt-3 text-[1.02rem] text-ink/85 leading-relaxed">{beat.body}</p>
    </motion.article>
  );
}
