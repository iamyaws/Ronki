import React from 'react';
import {
  DEFAULT_ROUTINE,
  ROUTINE_CHOICES,
  TASK_LABEL,
  TASK_PICTURE,
  normalizeRoutine,
} from '../../data/taskKinds';
import { DEFAULT_EVENING_START, EVENING_STARTS } from '../../loop/types';
import { DoodleIcon } from '../bilderbuch';

/**
 * RoutinePicker: which tasks the child does with Ronki, and when the
 * family's evening starts (Finch pass, base design 2.2, spec section 2).
 *
 * Parent register: picture toggle tiles per block (the task pictures in
 * public/art/bilderbuch/tasks/), then the evening start chips. Used in
 * the parent step of onboarding and in the dashboard (Lane D).
 *
 * Props:
 *   routine       { morning: kind[], evening: kind[] }; absent = DEFAULT_ROUTINE
 *   eveningStart  '17:00' | '17:30' | '18:00' | '18:30'; absent = '17:00'
 *   onChange      ({ routine, eveningStart }) on every change
 *   vacation      holiday list in use: the school bag tile is hidden
 *
 * A block never ends up empty: the last ticked tile of a block cannot
 * be unticked (the fire needs at least one task to fill).
 */

const BASE = import.meta.env.BASE_URL || '/';

const BLOCKS = [
  { id: 'morning', title: 'Ronkis Morgen' },
  { id: 'evening', title: 'Ronkis Abend' },
];

export default function RoutinePicker({ routine, eveningStart, onChange, vacation = false }) {
  const value = normalizeRoutine(routine ?? DEFAULT_ROUTINE);
  const start = EVENING_STARTS.includes(eveningStart) ? eveningStart : DEFAULT_EVENING_START;

  const visible = (block) => ROUTINE_CHOICES[block].filter((k) => !(vacation && k === 'packcheck'));

  const toggle = (block, kind) => {
    const current = value[block];
    const on = current.includes(kind);
    if (on) {
      const shownOn = current.filter((k) => visible(block).includes(k));
      if (shownOn.length <= 1) return; // the last tile stays
    }
    const nextSet = on ? current.filter((k) => k !== kind) : [...current, kind];
    // Keep the display order, so the saved list reads like the day.
    const ordered = ROUTINE_CHOICES[block].filter((k) => nextSet.includes(k));
    onChange?.({ routine: { ...value, [block]: ordered }, eveningStart: start });
  };

  const pickStart = (s) => {
    if (s === start) return;
    onChange?.({ routine: value, eveningStart: s });
  };

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      <p className="text-base text-ink-soft leading-relaxed m-0">
        Jede Aufgabe macht Ronkis Feuer wärmer. Weniger ist am Anfang mehr.
      </p>

      {BLOCKS.map((b) => {
        const kinds = visible(b.id);
        const shownOn = value[b.id].filter((k) => kinds.includes(k));
        return (
          <section key={b.id} className="min-w-0" aria-label={b.title}>
            <h3 className="font-headline font-semibold text-lg m-0 mb-3">{b.title}</h3>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))' }}
            >
              {kinds.map((kind) => {
                const on = value[b.id].includes(kind);
                const locked = on && shownOn.length <= 1;
                return (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={on ? 'true' : 'false'}
                    aria-label={`${TASK_LABEL[kind]}${on ? ', an' : ', aus'}`}
                    data-kind={kind}
                    data-locked={locked ? 'true' : undefined}
                    onClick={() => toggle(b.id, kind)}
                    className={`relative flex flex-col items-center justify-start gap-1.5 rounded-[20px] bg-paper px-2 pt-2 pb-2.5 min-w-0 select-none transition-transform active:scale-[0.97] ${on ? 'border-[3px] border-cobalt' : 'border-[2.5px] border-ink'}`}
                    style={{ minHeight: 118 }}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-[2.5px] ${on ? 'border-cobalt bg-cobalt text-white' : 'border-ink bg-white text-transparent'}`}
                    >
                      <DoodleIcon name="check" size={14} stroke={8} />
                    </span>
                    <img
                      src={`${BASE}art/bilderbuch/tasks/${TASK_PICTURE[kind]}.webp`}
                      alt=""
                      draggable={false}
                      decoding="async"
                      className="block"
                      style={{ width: 64, height: 64, objectFit: 'contain', opacity: on ? 1 : 0.55 }}
                    />
                    <span className="font-headline font-semibold text-sm leading-tight text-ink text-center break-words" style={{ hyphens: 'manual' }}>
                      {TASK_LABEL[kind]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="min-w-0" aria-label="Abendbeginn">
        <h3 className="font-headline font-semibold text-lg m-0 mb-1">Wann fängt bei euch der Abend an?</h3>
        <p className="text-base text-ink-soft leading-relaxed m-0 mb-3">Dann kommt Ronki von seiner Reise zurück.</p>
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Abendbeginn wählen">
          {EVENING_STARTS.map((s) => {
            const on = s === start;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on ? 'true' : 'false'}
                onClick={() => pickStart(s)}
                className={`min-h-[48px] rounded-full px-4 font-headline font-semibold text-lg ${on ? 'bg-cobalt text-white border-[2.5px] border-cobalt' : 'bg-white text-ink border-[2.5px] border-ink'}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
