import { ClockFace } from './ClockFace';
import { RONKI_ART_PATH } from './RonkiHost';

/**
 * Sky-wash band at the end of the list: the "done" moment, with Ronki
 * cheering. With `clock` a still face shows the time to leave (morning
 * builder, "Als Uhr" and "Beides").
 */
export function DoneBand({
  title = 'Geschafft!',
  note = 'Für heute fertig. Ronki jubelt mit.',
  clock,
}: {
  title?: string;
  note?: string;
  clock?: string;
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
      {clock && <ClockFace time={clock} className="rs-clock rs-done-clock" />}
    </div>
  );
}
