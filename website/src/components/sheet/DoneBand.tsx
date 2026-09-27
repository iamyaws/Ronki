import { ClockFace } from './ClockFace';
import { RONKI_ART_PATH } from './RonkiHost';
import { TASK_ART_PATH } from './TaskPicture';

/**
 * Sky-wash band at the end of the list: the "done" moment, with Ronki
 * cheering. With `clock` a still face shows the time to leave (morning
 * builder, "Als Uhr" and "Beides"), with `clockImg` beside it: what
 * happens at that time (an open front door).
 */
export function DoneBand({
  title = 'Geschafft!',
  note = 'Für heute fertig. Ronki jubelt mit.',
  clock,
  clockImg,
}: {
  title?: string;
  note?: string;
  clock?: string;
  clockImg?: string;
}) {
  return (
    <div className="rs-done">
      <img
        className="rs-done-img"
        src={`${RONKI_ART_PATH}cheer.webp`}
        alt=""
        width={512}
        height={512}
        draggable={false}
      />
      <div className="rs-done-text">
        <p className="rs-done-title">{title}</p>
        <p className="rs-done-note">
          {note}
          {clock && !note.includes(clock) && <span className="rs-sr"> {clock} Uhr</span>}
        </p>
      </div>
      {clock && (
        <span className="rs-done-leave" data-leave>
          {clockImg && (
            <img
              className="rs-done-leave-img"
              src={`${TASK_ART_PATH}${clockImg}`}
              alt=""
              width={256}
              height={256}
              draggable={false}
            />
          )}
          <ClockFace time={clock} className="rs-clock rs-done-clock" />
        </span>
      )}
    </div>
  );
}
