import React from 'react';
import { normalizeRoutine, TASK_LABEL, taskPictureUrl } from '../../data/taskKinds';
import { BESIDE_AFTER_DAYS, REVIEW_WEEK_CHOICES, WESEN_TASKS, creatureArt, creatureMeta } from '../../data/wesen';
import {
  wesenOf, activeFriend, movedOutFriends, stageOf, stepsOf, lookOf, askAloneDue, reviewDue,
  reviewDate, isRestored, routineHas,
} from '../../loop/wesen';
import { now as clockNow } from '../../loop/clock';

/**
 * Parent side of the Wesen test (26 Sep 2026). Shown in the Familie tab
 * under "Ronkis Tag", only on a card where the parent area was opened
 * once with ?wesen=1 (Astra W-08). Parents see numbers and dates; the
 * child never does. The "allein" question has no date shown ahead of
 * time (Astra W-03); the review never removes anything by itself (W-04).
 */

const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
};

function Switch({ on, onChange, label, testId }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on ? 'true' : 'false'}
      aria-label={label}
      data-testid={testId}
      onClick={() => onChange(!on)}
      className="shrink-0 rounded-full"
      style={{ width: 56, height: 32, border: '2.5px solid var(--color-ink)', background: on ? 'var(--color-cobalt)' : 'var(--color-paper)', position: 'relative', cursor: 'pointer' }}
    >
      <span aria-hidden="true" style={{ position: 'absolute', top: 2, left: on ? 26 : 2, width: 23, height: 23, borderRadius: 999, background: on ? 'white' : 'var(--color-ink-soft)', transition: 'left 150ms ease' }} />
    </button>
  );
}

function Btn({ children, onClick, primary = false, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="rounded-full font-headline font-semibold"
      style={{
        padding: '10px 16px', fontSize: 15, border: '2.5px solid var(--color-ink)',
        background: primary ? 'var(--color-cobalt)' : 'white', color: primary ? 'white' : 'var(--color-ink)', cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Ask({ children }) {
  return (
    <div className="rounded-xl flex flex-col gap-3" style={{ padding: 14, background: 'var(--color-paper)', border: '2px solid var(--color-ink)' }}>
      {children}
    </div>
  );
}

export default function WesenParentSection({ state, actions }) {
  const w = wesenOf(state);
  if (!w.offered) return null;
  const on = w.enabled === true;
  const kid = state.familyConfig?.childName || 'euer Kind';
  const routine = normalizeRoutine(state.familyConfig?.routine);
  const f = activeFriend(w);
  const now = clockNow();
  const offer = Object.keys(WESEN_TASKS).filter(k => routineHas(routine, k));
  const gone = movedOutFriends(w);

  return (
    <section className="rounded-2xl p-5 bg-white flex flex-col gap-4" style={{ border: '2.5px solid var(--color-ink)' }} data-testid="wesen-parent" aria-label="Wesen (Test)">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-ink" style={{ fontSize: 18 }}>Wesen (Test)</h3>
          <p className="font-body text-ink-soft" style={{ fontSize: 14, lineHeight: 1.4 }}>
            Ein kleines Wesen begleitet eine Aufgabe. Es kommt an jedem Tag mit der Aufgabe näher, setzt sich nach {BESIDE_AFTER_DAYS} Tagen zu Ronki, wächst, wenn {kid} es allein kann, und zieht aus, wenn Ronki nicht mehr erinnern muss.
          </p>
        </div>
        <Switch on={on} onChange={(v) => actions?.wesenSetEnabled?.(v)} label="Wesen ausprobieren" testId="switch-wesen" />
      </div>

      {!on && (f || w.pendingTask) && (
        <p className="font-body text-ink-soft" style={{ fontSize: 14 }}>Pausiert. Nichts zählt weiter und nichts zieht aus, bis ihr es wieder einschaltet.</p>
      )}

      {on && !f && (
        <div className="flex flex-col gap-3">
          <p className="font-headline font-semibold text-ink" style={{ fontSize: 16 }}>
            {w.pendingTask ? `Beim nächsten Öffnen sucht ${kid} ein Wesen aus.` : 'Welche Aufgabe soll ein Wesen begleiten?'}
          </p>
          {offer.length === 0 && (
            <p className="font-body text-ink-soft" style={{ fontSize: 14 }}>In Ronkis Tag ist keine passende Aufgabe (Zähne, Anziehen, Waschen, Schlafanzug, Wasser).</p>
          )}
          <div className="flex flex-col gap-2">
            {offer.map(k => {
              const chosen = w.pendingTask === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => actions?.wesenPickTask?.(k)}
                  data-testid={`wesen-task-${k}`}
                  aria-pressed={chosen ? 'true' : 'false'}
                  className="flex items-center gap-3 rounded-xl text-left"
                  style={{ padding: 10, border: `2.5px solid ${chosen ? 'var(--color-cobalt)' : 'var(--color-ink)'}`, background: chosen ? 'var(--color-paper)' : 'white', cursor: 'pointer' }}
                >
                  <img src={taskPictureUrl(`s_${k}`)} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                  <span className="flex-1 min-w-0">
                    <span className="font-headline font-semibold text-ink block" style={{ fontSize: 15 }}>{TASK_LABEL[k]}{k.endsWith('_pm') ? ' (abends)' : k === 'teeth_am' || k === 'wash' ? ' (morgens)' : ''}</span>
                    <span className="font-body text-ink-soft block" style={{ fontSize: 13, lineHeight: 1.35 }}>Allein heißt: {kid} {WESEN_TASKS[k]}.</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {f && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img src={creatureArt(f.creatureId, lookOf(f))} alt="" style={{ width: 72, height: 72, objectFit: 'contain' }} />
            <div className="flex-1 min-w-0">
              <p className="font-headline font-semibold text-ink" style={{ fontSize: 16 }}>{creatureMeta(f.creatureId)?.name} begleitet: {TASK_LABEL[f.taskKind]}</p>
              <p className="font-body text-ink-soft" style={{ fontSize: 14, lineHeight: 1.4 }} data-testid="wesen-status">
                {stageOf(f) === 'visitor' && `Kommt näher: ${stepsOf(f)} von ${BESIDE_AFTER_DAYS} Tagen mit der Aufgabe.`}
                {stageOf(f) === 'beside' && `Sitzt bei Ronki seit ${fmt(f.besideAt)}.`}
                {stageOf(f) === 'grown' && `Gewachsen am ${fmt(f.aloneAt)}.`}
              </p>
            </div>
          </div>

          {on && askAloneDue(w, now) && (
            <Ask>
              <p className="font-headline font-semibold text-ink" style={{ fontSize: 16 }}>Macht {kid} das inzwischen allein?</p>
              <p className="font-body text-ink-soft" style={{ fontSize: 14, lineHeight: 1.4 }}>Allein heißt: {kid} {WESEN_TASKS[f.taskKind]}. Die Antwort sieht nur ihr.</p>
              <div className="flex gap-2 flex-wrap">
                <Btn primary onClick={() => actions?.wesenAnswerAlone?.(true)} testId="wesen-alone-yes">Ja, allein</Btn>
                <Btn onClick={() => actions?.wesenAnswerAlone?.(false)} testId="wesen-alone-no">Noch nicht</Btn>
              </div>
            </Ask>
          )}

          {stageOf(f) === 'grown' && !f.moveOutConfirmedAt && !reviewDue(w, now) && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-ink-soft" style={{ fontSize: 14, lineHeight: 1.4 }}>
                Am {fmt(reviewDate(f)?.toISOString())} fragen wir euch, ob Ronki aufhören darf, an {TASK_LABEL[f.taskKind]} zu erinnern.
              </p>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="font-body text-ink-soft" style={{ fontSize: 14 }}>Nach</span>
                {REVIEW_WEEK_CHOICES.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => actions?.wesenSetReviewWeeks?.(n)}
                    aria-pressed={(f.reviewWeeks || 8) === n ? 'true' : 'false'}
                    className="rounded-full font-headline font-semibold"
                    style={{ padding: '6px 12px', fontSize: 14, border: '2px solid var(--color-ink)', background: (f.reviewWeeks || 8) === n ? 'var(--color-cobalt)' : 'white', color: (f.reviewWeeks || 8) === n ? 'white' : 'var(--color-ink)', cursor: 'pointer' }}
                  >
                    {n} Wochen
                  </button>
                ))}
              </div>
            </div>
          )}

          {on && reviewDue(w, now) && (
            <Ask>
              <p className="font-headline font-semibold text-ink" style={{ fontSize: 16 }}>Darf Ronki aufhören, an {TASK_LABEL[f.taskKind]} zu erinnern?</p>
              <p className="font-body text-ink-soft" style={{ fontSize: 14, lineHeight: 1.4 }}>
                Seit {fmt(f.aloneAt)} macht {kid} das allein. Bei Ja verabschiedet sich {creatureMeta(f.creatureId)?.name} beim nächsten Tagesstart und die Aufgabe fällt aus Ronkis Tag. Ihr könnt sie jederzeit zurückholen.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Btn primary onClick={() => actions?.wesenAnswerReview?.(true)} testId="wesen-review-yes">Ja, Erinnerung darf gehen</Btn>
                <Btn onClick={() => actions?.wesenAnswerReview?.(false)} testId="wesen-review-no">Noch nicht</Btn>
              </div>
            </Ask>
          )}

          {f.moveOutConfirmedAt && (
            <p className="font-body text-ink" style={{ fontSize: 14, lineHeight: 1.4 }} data-testid="wesen-moveout-note">
              Beim nächsten Tagesstart verabschiedet sich {creatureMeta(f.creatureId)?.name}, dann fällt {TASK_LABEL[f.taskKind]} aus Ronkis Tag.
            </p>
          )}
        </div>
      )}

      {gone.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-headline font-semibold text-ink" style={{ fontSize: 15 }}>In die Welt gezogen</p>
          {gone.map(x => (
            <div key={x.id} className="flex items-center gap-3">
              <img src={creatureArt(x.creatureId, 'grown')} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <span className="flex-1 min-w-0 font-body text-ink" style={{ fontSize: 14 }}>
                {creatureMeta(x.creatureId)?.name}, {TASK_LABEL[x.taskKind]}, am {fmt(x.movedOutAt)}
                {isRestored(x) ? ' (Aufgabe zurückgeholt)' : ''}
              </span>
              {!isRestored(x) && (
                <Btn onClick={() => actions?.wesenRestore?.(x.id)} testId={`wesen-restore-${x.id}`}>Wieder zurückholen</Btn>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
