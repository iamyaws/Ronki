import { RONKI_ART_PATH } from './RonkiHost';

/** Sky-wash band at the end of the list: the "done" moment, with Ronki cheering. */
export function DoneBand({
  title = 'Geschafft!',
  note = 'Male den letzten Kreis aus. Ronki jubelt mit.',
}: {
  title?: string;
  note?: string;
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
        <p className="rs-done-note">{note}</p>
      </div>
    </div>
  );
}
