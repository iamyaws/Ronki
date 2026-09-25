import React from 'react';
import { DoodleIcon } from '../bilderbuch';
import { TASK_LABEL, taskKind, taskPictureUrl } from '../../data/taskKinds';

/**
 * TaskRow: the block's tasks as small pictures under the Jetzt card
 * (Finch pass, 26 Sep 2026).
 *
 * Done ones wear a flame sticker. Tapping a picture only makes it the
 * Jetzt card; it never completes a task (base design risk list: a child
 * would tick the whole row). The current one gets the cobalt ring.
 */
export default function TaskRow({ slots = [], currentId, onPick }) {
  if (!slots.length) return null;
  return (
    <div
      role="group"
      aria-label="Ronkis Aufgaben"
      data-testid="task-row"
      className="flex flex-wrap justify-center"
      style={{ gap: 10 }}
    >
      {slots.map(q => {
        const kind = taskKind(q.id);
        const label = (kind && TASK_LABEL[kind]) || q.name || '';
        const pic = taskPictureUrl(q.id);
        const current = q.id === currentId;
        return (
          <button
            key={q.id}
            type="button"
            aria-label={label}
            aria-pressed={current ? 'true' : 'false'}
            data-done={q.done ? 'true' : 'false'}
            disabled={q.done}
            onClick={() => { if (!q.done) onPick?.(q.id); }}
            className="relative flex items-center justify-center rounded-[18px] bg-white"
            style={{
              width: 56,
              height: 56,
              padding: 0,
              border: current ? '3px solid var(--color-cobalt)' : '2.5px solid var(--color-ink)',
              cursor: q.done ? 'default' : 'pointer',
            }}
          >
            {pic ? (
              <img src={pic} alt="" draggable={false} style={{ width: 44, height: 44, objectFit: 'contain', opacity: q.done ? 0.55 : 1 }} />
            ) : (
              <DoodleIcon name="sun" size={30} />
            )}
            {q.done && (
              <span
                aria-hidden="true"
                className="absolute inline-flex items-center justify-center rounded-full bg-sun"
                style={{ right: -6, top: -6, width: 26, height: 26, border: '2.5px solid var(--color-ink)', color: 'var(--color-ember)' }}
              >
                <DoodleIcon name="flame" size={16} filled stroke={4} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
