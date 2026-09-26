import { TaskPicture } from './TaskPicture';
import type { SheetStep } from './types';

/**
 * One step: number, drawn picture, label with an optional hint and an
 * optional "___ Uhr" line, and a cobalt ring the child colours in.
 *
 * `clipLane` adds a strip on the left where a clothespin marks the step
 * that is running right now (ADHS sheet).
 */
export function SheetRow({
  index,
  step,
  showTime = false,
  clipLane = false,
}: {
  index: number;
  step: SheetStep;
  showTime?: boolean;
  clipLane?: boolean;
}) {
  const hasBody = Boolean(step.label || step.hint || showTime);
  return (
    <li className="rs-row">
      {clipLane && <span className="rs-clip" data-clip-lane aria-hidden />}
      <span className="rs-num" aria-hidden>
        {index + 1}
      </span>
      <TaskPicture img={step.img} icon={step.icon} />
      {hasBody && (
        <span className="rs-body">
          {step.label && <span className="rs-label">{step.label}</span>}
          {step.hint && <span className="rs-hint">{step.hint}</span>}
          {showTime && (
            <span className="rs-time">
              <span className="rs-time-line" aria-hidden /> Uhr
            </span>
          )}
        </span>
      )}
      <span className="rs-ring" aria-hidden />
    </li>
  );
}
