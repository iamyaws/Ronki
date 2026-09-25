/**
 * Optional "what does this app cost in time" projection.
 *
 * Parent enters their child's typical daily usage of THIS app via a
 * slider. The component then computes a personal year-projection plus
 * three concrete-life-equivalents (football trainings, read-aloud
 * sessions, birthday parties) so the abstract minutes/day land as
 * something with shape.
 *
 * Brand-safe: every number is derived from the parent's own input. We
 * make no claim about the app — we just multiply what they said.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '../../lib/motion';

const FOOTBALL_TRAINING_MIN = 75;
const READ_ALOUD_SESSION_MIN = 15;
const BIRTHDAY_PARTY_MIN = 240;

function formatHours(mins: number): string {
  const hrs = mins / 60;
  if (hrs < 1) return `${Math.round(mins)} Min`;
  if (hrs < 10) return `${hrs.toFixed(1).replace('.', ',')} Std`;
  return `${Math.round(hrs)} Std`;
}

export function TimeCostProjection() {
  const reduced = useReducedMotion();
  const [minutesPerDay, setMinutesPerDay] = useState<number>(30);

  const yearMinutes = minutesPerDay * 365;
  const weekHours = (minutesPerDay * 7) / 60;
  const monthHours = (minutesPerDay * 30) / 60;
  const yearDaysContinuous = yearMinutes / 60 / 24;

  const trainings = Math.round(yearMinutes / FOOTBALL_TRAINING_MIN);
  const readAlouds = Math.round(yearMinutes / READ_ALOUD_SESSION_MIN);
  const birthdays = Math.round(yearMinutes / BIRTHDAY_PARTY_MIN);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="rounded-2xl bg-cream/70 ring-1 ring-inset ring-teal/15 px-7 py-7 sm:px-10 sm:py-9 space-y-6"
    >
      <div className="space-y-2">
        <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
          Was kostet diese App eigentlich an Zeit?
        </h3>
        <p className="text-sm text-ink/70 max-w-prose">
          Schieb den Regler auf die ungefähre tägliche Nutzungszeit. Die
          Hochrechnung ist nur Mathematik aus deiner Eingabe, keine Aussage
          über die App.
        </p>
      </div>

      <div>
        <label className="block">
          <span className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-ink/70">Min pro Tag</span>
            <span className="font-display font-bold text-2xl text-ink tabular-nums">
              {minutesPerDay}
            </span>
          </span>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={minutesPerDay}
            onChange={(e) => setMinutesPerDay(Number(e.target.value))}
            className="w-full accent-teal cursor-pointer"
            aria-label="Tägliche Nutzungszeit in Minuten"
          />
          <span className="flex justify-between text-xs text-ink/55 mt-1">
            <span>5</span>
            <span>30</span>
            <span>60</span>
            <span>90</span>
            <span>120</span>
          </span>
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-cream/60 border border-teal/10 p-4">
          <div className="text-xs text-ink/55 uppercase tracking-wider mb-1">
            pro Woche
          </div>
          <div className="font-display font-bold text-lg text-ink tabular-nums">
            {formatHours(minutesPerDay * 7)}
          </div>
        </div>
        <div className="rounded-xl bg-cream/60 border border-teal/10 p-4">
          <div className="text-xs text-ink/55 uppercase tracking-wider mb-1">
            pro Monat
          </div>
          <div className="font-display font-bold text-lg text-ink tabular-nums">
            {formatHours(minutesPerDay * 30)}
          </div>
        </div>
        <div className="rounded-xl bg-cream/60 border border-teal/10 p-4">
          <div className="text-xs text-ink/55 uppercase tracking-wider mb-1">
            pro Jahr
          </div>
          <div className="font-display font-bold text-lg text-ink tabular-nums">
            {formatHours(yearMinutes)}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-teal-dark/5 border border-teal-dark/10 p-5 text-sm text-ink/80 leading-relaxed">
        Im Jahr verbringt dein Kind dann etwa{' '}
        <strong className="text-ink tabular-nums">
          {weekHours >= 1 ? `${Math.round(yearDaysContinuous)} ganze 24-Stunden-Tage` : `${Math.round(yearMinutes / 60)} Stunden`}
        </strong>{' '}
        mit dieser App. Das entspricht ungefähr{' '}
        <strong className="text-ink tabular-nums">{trainings} Fußball-Trainings</strong>,{' '}
        <strong className="text-ink tabular-nums">{readAlouds} Vorlese-Stunden</strong>{' '}
        oder{' '}
        <strong className="text-ink tabular-nums">{birthdays} Geburtstagsfeiern</strong>.
      </div>

      <p className="text-xs text-ink/50 italic">
        Was deinem Kind die Zeit wert ist, weißt nur du. Wir machen keine
        Aussage darüber, ob das viel oder wenig ist. Wir zeigen nur was die
        Zahl ergibt.
      </p>
    </motion.div>
  );
}
