import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { PillButton, QuietLink, PaperCard, DoodleIcon } from '../bilderbuch';
import { TASK_LABEL, taskKind, taskPictureUrl } from '../../data/taskKinds';

/**
 * After a "Geschafft", further taps are ignored for this long, measured
 * from the tap and not reset when the next task comes onto the card: a
 * double tap on the same spot must not complete the next task too
 * (Astra FC-07, KIDUX-1). Nothing counts down on screen.
 */
export const TAP_GUARD_MS = 700;

/**
 * NowCard, the "Jetzt" card (Finch pass, 26 Sep 2026; spec R1).
 *
 * The one task the child does next: its picture big, its name small,
 * one pill "Geschafft" and a quiet "Später". Ronki's spoken ask lives in
 * his bubble in the room (RoomHub), not on the card.
 *
 * - "Geschafft" calls actions.complete(id) once and then onDone(quest)
 *   so the Nest can cheer and light the flame. For TAP_GUARD_MS after a
 *   completion every tap is ignored, also on the next task the card
 *   switches to (the card is one instance across tasks).
 * - "Später" only moves the task to the end of the row for this session
 *   (onLater); it lights nothing and writes nothing.
 * - `loud` false: the pill is the white secondary one (the away day,
 *   where the postcard is the loud item).
 */
export default function NowCard({ quest, onDone, onLater, loud = true }) {
  const { actions } = useTask();
  // When the last "Geschafft" landed; survives the switch to the next task.
  const lastDoneAt = useRef(-Infinity);
  const [picFailed, setPicFailed] = useState(false);

  useEffect(() => {
    setPicFailed(false);
  }, [quest?.id]);

  if (!quest) return null;
  const kind = taskKind(quest.id);
  const label = (kind && TASK_LABEL[kind]) || quest.name || '';
  const pic = taskPictureUrl(quest.id);

  const done = () => {
    if (quest.done) return;
    const t = Date.now();
    if (t - lastDoneAt.current < TAP_GUARD_MS) return;
    lastDoneAt.current = t;
    actions?.complete?.(quest.id);
    onDone?.(quest);
  };

  // Ronki answers "Später" in his bubble (task_later_01, RoomHub).
  const later = () => onLater?.(quest);

  return (
    <PaperCard
      tone="white"
      pad="md"
      className="flex flex-col items-center text-center"
      data-testid="now-card"
      data-loud={loud ? 'true' : undefined}
      data-quest={quest.id}
    >
      <div
        className="flex items-center justify-center rounded-[24px] bg-paper"
        style={{ width: 132, height: 132, border: '2.5px solid var(--color-ink)', overflow: 'hidden' }}
      >
        {pic && !picFailed ? (
          <img
            src={pic}
            alt=""
            draggable={false}
            onError={() => setPicFailed(true)}
            style={{ width: 120, height: 120, objectFit: 'contain' }}
          />
        ) : (
          <DoodleIcon name="sun" size={84} filled style={{ color: 'var(--color-sun)' }} />
        )}
      </div>
      <div className="font-headline font-semibold text-ink-soft" style={{ fontSize: 18, marginTop: 10, lineHeight: 1.1 }}>
        {label}
      </div>
      <div style={{ marginTop: 14, width: '100%' }}>
        <PillButton full size="lg" tone={loud ? 'primary' : 'secondary'} icon="check" onClick={done}>
          Geschafft
        </PillButton>
      </div>
      {onLater && (
        <div style={{ marginTop: 6 }}>
          <QuietLink onClick={later}>Später</QuietLink>
        </div>
      )}
    </PaperCard>
  );
}
