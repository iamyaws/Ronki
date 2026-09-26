import React from 'react';
import { DoodleIcon, PaperCard } from '../bilderbuch';
import { BESIDE_AFTER_DAYS, creatureArt, creatureMeta } from '../../data/wesen';
import { TASK_LABEL, taskPictureUrl } from '../../data/taskKinds';
import { wesenOf, isOn, activeFriend, movedOutFriends, lookOf, stageOf, stepsOf } from '../../loop/wesen';

/**
 * Ronki's passport, Wesen block (26 Sep 2026). Kid-facing: paw marks, no
 * numbers. The friend now, and the row of friends that moved out, each
 * with the task picture it took along (the task goes on, Astra A5).
 */
export default function WesenPassportBlock({ state }) {
  const w = wesenOf(state);
  if (!isOn(w)) return null;
  const f = activeFriend(w);
  const gone = movedOutFriends(w);
  if (!f && gone.length === 0) return null;

  return (
    <section style={{ marginTop: 30 }} aria-label="Wesen" data-testid="wesen-passport">
      {f && (
        <PaperCard tone="paper" pad="sm" style={{ transform: 'rotate(-0.5deg)' }}>
          <div className="flex items-center gap-3">
            <img src={creatureArt(f.creatureId, lookOf(f))} alt="" style={{ width: 84, height: 84, objectFit: 'contain' }} />
            <div className="flex-1 min-w-0">
              <p className="font-headline font-semibold" style={{ fontSize: 20, lineHeight: 1.15 }}>
                {creatureMeta(f.creatureId)?.name}
              </p>
              <p className="font-headline text-ink-soft" style={{ fontSize: 16, lineHeight: 1.25 }}>
                {stageOf(f) === 'visitor' ? 'Ist noch ein bisschen schüchtern.' : 'Wohnt bei Ronki.'}
              </p>
              {stageOf(f) === 'visitor' && (
                <div className="flex" style={{ gap: 4, marginTop: 4 }} aria-hidden="true">
                  {Array.from({ length: BESIDE_AFTER_DAYS }).map((_, i) => (
                    <span key={i} style={{ color: i < stepsOf(f) ? 'var(--color-ink)' : 'var(--color-ink-soft)', opacity: i < stepsOf(f) ? 0.9 : 0.25 }}>
                      <DoodleIcon name="paw" size={20} filled />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PaperCard>
      )}
      {gone.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h2 className="bb-display text-ink" style={{ fontSize: 24, marginBottom: 10 }}>In die Welt gezogen</h2>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {gone.map(x => (
              <div key={x.id} className="bg-paper rounded-[20px] flex flex-col items-center" style={{ border: '3px solid var(--color-ink)', padding: '8px 6px' }}>
                <div className="flex items-end" style={{ gap: 2 }}>
                  <img src={creatureArt(x.creatureId, 'grown')} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                  <img src={taskPictureUrl(`s_${x.taskKind}`)} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                </div>
                <span className="font-headline font-semibold text-center" style={{ fontSize: 14, lineHeight: 1.15 }}>
                  {creatureMeta(x.creatureId)?.name}
                </span>
                <span className="font-headline text-ink-soft text-center" style={{ fontSize: 13, lineHeight: 1.15 }}>
                  {TASK_LABEL[x.taskKind]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
