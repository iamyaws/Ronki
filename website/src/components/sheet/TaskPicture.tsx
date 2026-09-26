export const TASK_ART_PATH = '/art/bilderbuch/tasks/';

/**
 * The drawn task picture for a step, the same one the app shows, so a
 * child recognises the step on paper and on the screen.
 *
 * Decorative: the label next to it says what the step is, so the picture
 * gets an empty alt. Falls back to the emoji when a step has no picture.
 */
export function TaskPicture({
  img,
  icon,
  className = '',
}: {
  img?: string;
  icon?: string;
  className?: string;
}) {
  return (
    <span className={`rs-pic ${className}`.trim()} aria-hidden={img ? undefined : true}>
      {img ? (
        <img src={`${TASK_ART_PATH}${img}`} alt="" width={256} height={256} draggable={false} />
      ) : (
        <span className="rs-pic-emoji">{icon}</span>
      )}
    </span>
  );
}
