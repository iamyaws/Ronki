import { ClockFace } from './ClockFace';
import { TaskPicture } from './TaskPicture';
import type { SheetStep } from './types';

/**
 * One step: number, drawn picture, label with an optional hint and an
 * optional "___ Uhr" line, and a cobalt ring the child colours in. A step
 * with its own `time` prints that time ("7:05 Uhr") in place of the line.
 *
 * A step with a `clock` gets a drawn clock face before the picture. On a
 * sheet with clock faces (`clockLane`), a row without one keeps the space
 * empty so the pictures stay in one column.
 *
 * `clipLane` adds a strip on the left where a clothespin marks the step
 * that is running right now (ADHS sheet).
 */
export function SheetRow({
  index,
  step,
  showTime = false,
  clipLane = false,
  clockLane = false,
}: {
  index: number;
  step: SheetStep;
  showTime?: boolean;
  clipLane?: boolean;
  clockLane?: boolean;
}) {
  const hasTime = Boolean(step.time || step.clock || showTime);
  const hasBody = Boolean(step.label || step.hint || hasTime);
  return (
    <li className="rs-row">
      {clipLane && <span className="rs-clip" data-clip-lane aria-hidden />}
      <span className="rs-num" aria-hidden>
        {index + 1}
      </span>
      {step.clock ? (
        <ClockFace time={step.clock} />
      ) : (
        clockLane && <span className="rs-clock rs-clock--none" aria-hidden />
      )}
      <TaskPicture img={step.img} icon={step.icon} draw={step.draw} />
      {hasBody && (
        <span className="rs-body">
          {step.label && <span className="rs-label">{step.label}</span>}
          {step.hint && <span className="rs-hint">{step.hint}</span>}
          {step.time ? (
            <span className="rs-time rs-time--set" data-time>
              {step.time} Uhr
            </span>
          ) : step.clock ? (
            <span className="rs-sr" data-clock-label>
              {step.clock} Uhr
            </span>
          ) : (
            showTime && (
              <span className="rs-time">
                <span className="rs-time-line" aria-hidden /> Uhr
              </span>
            )
          )}
        </span>
      )}
      <span className="rs-ring" aria-hidden />
    </li>
  );
}
