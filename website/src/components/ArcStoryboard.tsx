import { motion } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { HandNote } from './primitives/HandNote';

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
  accent: string;
  accentLight: string;
  wash: string;
  tasks: Task[];
  progress: string;
}

const BEATS: Beat[] = [
  {
    time: 'Morgen',
    icon: '☀️',
    title: 'Drei von vier geschafft. Ohne Nachfragen.',
    body: 'Sieben Uhr. Louis kommt verschlafen ins Bad. Ronki zeigt ihm die Liste: Gesicht waschen, anziehen, frühstücken, Tasche packen. Drei Haken schon drin. Fehlt nur noch die Tasche. Niemand muss rufen.',
    accent: '#0544B0',
    accentLight: 'rgba(5,68,176,0.10)',
    wash: 'rgba(217,119,6,0.08)',
    tasks: [
      { label: 'Gesicht waschen', done: true },
      { label: 'Anziehen', done: true },
      { label: 'Frühstücken', done: true },
      { label: 'Tasche packen', done: false },
    ],
    progress: '7:12',
  },
  {
    time: 'Nachmittag',
    icon: '🎨',
    title: 'Malen, Fußball, Gedicht. Sein Nachmittag.',
    body: 'Nach der Schule gehört der Tag Louis. Ronki schlägt drei Sachen vor. Was davon drankommt, entscheidet er selbst. Heute war Fußball-Training. Das Bild kommt morgen. Das Gedicht übt er abends.',
    accent: '#0544B0',
    accentLight: 'rgba(5,68,176,0.10)',
    wash: 'rgba(5,68,176,0.08)',
    tasks: [
      { label: 'Bild malen', done: true },
      { label: 'Fußball Training', done: true },
      { label: 'Gedicht üben', done: false },
    ],
    progress: '15:30',
  },
  {
    time: 'Abend',
    icon: '🌙',
    title: 'Zähne, Pyjama, Licht aus. Ronki schläft schon.',
    body: 'Abendroutine. Zähne putzen, Gesicht waschen, Pyjama an. Drei von vier erledigt. Das Licht macht Louis gleich selbst aus. Ronki liegt schon im Nest. „Bis morgen." Niemand muss dreimal rufen.',
    accent: '#04225E',
    accentLight: 'rgba(4,34,94,0.10)',
    wash: 'rgba(67,56,202,0.08)',
    tasks: [
      { label: 'Zähne putzen', done: true },
      { label: 'Gesicht waschen', done: true },
      { label: 'Pyjama an', done: true },
      { label: 'Licht aus', done: false },
    ],
    progress: '19:45',
  },
];

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function ArcStoryboard() {
  return (
    <section
      id="storyboard"
      className="relative border-t border-teal/10 px-6 py-16 sm:py-24"
      aria-labelledby="storyboard-heading"
    >
      <div className="relative max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 1, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-medium"
        >
          Wie ein Tag mit Ronki aussieht
        </motion.p>
        <motion.h2
          id="storyboard-heading"
          initial={{ opacity: 1, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-ink max-w-3xl"
        >
          Ein Tag. Drei ruhige <em className="italic text-sage whitespace-nowrap">Routinen</em> für dein Kind.
        </motion.h2>
        <motion.p
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-base sm:text-lg text-ink/70 max-w-2xl leading-relaxed"
        >
          Kein straffer Plan, kein Minutenzähler. Ronki zeigt deinem Kind, was heute dran ist. Was geschafft ist, sieht es selbst. Was noch fehlt, auch.
        </motion.p>

        <HandNote
          rotate={-5}
          className="mt-6 lg:mt-0 lg:absolute lg:right-0 lg:top-2 lg:w-[190px] lg:text-right"
        >
          Drei kleine Listen, mehr nicht.
        </HandNote>

        <div className="mt-10 flex flex-col gap-12">
          {BEATS.map((beat, i) => (
            <BeatRow key={beat.time} beat={beat} flip={i % 2 === 1} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 text-center"
        >
          <a
            href="/wie-es-funktioniert"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold text-teal hover:text-ink transition-colors"
          >
            So funktioniert Ronki im Detail
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* BeatRow                                                             */
/* ------------------------------------------------------------------ */

function BeatRow({
  beat,
  flip,
  index,
}: {
  beat: Beat;
  flip: boolean;
  index: number;
}) {
  const doneCount = beat.tasks.filter(t => t.done).length;

  return (
    <motion.article
      initial={{ opacity: 1, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.8, delay: 0.05, ease: EASE_OUT }}
      className={`grid gap-8 sm:gap-12 md:grid-cols-[1fr_1.1fr] items-center ${
        flip ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* Routine card */}
      <figure className="relative">
        <div
          aria-hidden
          className="absolute -inset-6 rounded-[2.5rem] blur-3xl opacity-60"
          style={{ backgroundColor: beat.wash }}
        />
        <div
          className="relative rounded-[1.5rem] bg-white p-4 sm:p-5 ring-1 ring-inset ring-black/[0.04]"
          style={{ boxShadow: '0 20px 50px -20px rgba(4,8,18,0.20), 0 4px 16px -4px rgba(4,8,18,0.08)' }}
          role="img"
          aria-label={`${beat.time}routine: ${doneCount} von ${beat.tasks.length} erledigt`}
        >
          {/* Accent top bar */}
          <div
            className="absolute inset-x-0 top-0 h-1 rounded-t-[1.5rem]"
            style={{ background: beat.accent }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 mt-1">
            <span className="text-xl" aria-hidden>{beat.icon}</span>
            <div className="flex-1">
              <p className="font-display font-bold text-ink text-sm sm:text-base leading-tight">
                {beat.time}routine
              </p>
              <p className="text-xs text-ink/40 mt-0.5">Heute, {beat.progress}</p>
            </div>
            <span
              className="flex items-center gap-1.5 text-xs font-display font-bold rounded-full px-2.5 py-1"
              style={{ backgroundColor: beat.accentLight, color: beat.accent }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: beat.accent }}
              />
              {doneCount}/{beat.tasks.length}
            </span>
          </div>

          {/* Task list */}
          <ul className="flex flex-col gap-2">
            {beat.tasks.map((task, ti) => (
              <motion.li
                key={ti}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: ti * 0.1 }}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2 transition-colors ${
                  task.done
                    ? 'bg-black/[0.02]'
                    : ''
                }`}
                style={!task.done ? { backgroundColor: beat.accentLight, outline: `1px solid ${beat.accent}22` } : undefined}
              >
                {task.done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: ti * 0.1 + 0.2 }}
                    className="flex-none flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: beat.accent }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span
                    className="flex-none flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-transparent"
                    style={{ border: `2px solid ${beat.accent}` }}
                  />
                )}
                <span
                  className={`text-sm font-medium leading-none ${
                    task.done
                      ? 'text-ink/40 line-through'
                      : 'text-ink'
                  }`}
                >
                  {task.label}
                </span>
                {!task.done && (
                  <span
                    className="ml-auto text-[10px] font-display font-bold uppercase tracking-wide"
                    style={{ color: beat.accent }}
                  >
                    Jetzt
                  </span>
                )}
              </motion.li>
            ))}
          </ul>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1.5 w-full rounded-full bg-black/[0.04] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-full rounded-full"
                style={{
                  transformOrigin: 'left',
                  width: `${(doneCount / beat.tasks.length) * 100}%`,
                  backgroundColor: beat.accent,
                }}
              />
            </div>
          </div>
        </div>
      </figure>

      {/* Text */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 items-center rounded-full px-4 font-display font-semibold text-xs uppercase tracking-[0.15em] text-white shadow-sm"
            style={{ backgroundColor: beat.accent }}
          >
            {beat.time}
          </span>
          <span
            aria-hidden
            className="h-px flex-1 origin-left"
            style={{ backgroundColor: beat.accent, opacity: 0.4 }}
          />
        </div>
        <h3 className="font-display font-bold text-[1.6rem] sm:text-[2rem] lg:text-[2.3rem] leading-[1.12] tracking-tight text-ink">
          {beat.title}
        </h3>
        <p className="text-ink/75 leading-[1.7] text-base sm:text-lg max-w-xl">
          {beat.body}
        </p>
      </div>
    </motion.article>
  );
}
