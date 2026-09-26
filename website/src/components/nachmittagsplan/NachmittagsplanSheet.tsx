import { RONKI_ART_PATH, RonkiHost, SheetFooter, SheetHead, TaskPicture } from '../sheet';
import {
  dinnerLine,
  knackPicture,
  knackSentence,
  sheetWeek,
  FREE_DAY,
  type AfternoonPlan,
  type SheetDay,
  type SheetItem,
  type WeekdayId,
} from '../../lib/nachmittagsplan';
import '../sheet/sheet.css';
import './nachmittagsplan-sheet.css';

export const NACHMITTAG_TITLE = 'Nachmittagsplan';
export const NACHMITTAG_EYEBROW = 'Unsere Woche';
export const NACHMITTAG_DESC = 'Erst ankommen, dann die Hausaufgaben.';
export const ARRIVE_TITLE = 'Erst ankommen';
export const ARRIVE_BUBBLE = 'Was brauchst du gerade?';
export const FOR_YOU = 'Du musst jetzt nichts erklären. Du musst das nicht gewinnen.';
export const KNACK_TITLE = 'Bei den Hausaufgaben';
export const UNFIT_NOTE = 'passt noch nicht';
const FOOTER_URL = 'ronki.de/tools/nachmittagsplan';

/** Small pictures for Ankommen on the week strip. */
export const ARRIVE_STEPS: ReadonlyArray<{ img: string; label: string }> = [
  { img: 'plate.webp', label: 'Essen' },
  { img: 'water.webp', label: 'Trinken' },
  { img: 'move.webp', label: 'Bewegen' },
];

/**
 * What the child can pick on the Ankommen card. Choices, not a list to work
 * through, so no rings (Astra NP-05); resting is one of them.
 */
export const ARRIVE_CHOICES: ReadonlyArray<{ img: string; label: string }> = [
  ...ARRIVE_STEPS,
  { img: 'cushion.webp', label: 'Ausruhen' },
];

export type SheetVariant = 'blatt' | 'wochenplan';

/**
 * The printable Nachmittagsplan: one A4 page in the Bilderbuch look.
 *
 * "blatt": the week strip, then under a dashed cut line the child's
 * Ankommen card and, when the parent chose one, the Knackpunkt card, plus
 * a small note for the parent. "wochenplan": the week strip alone, for
 * Oma and Opa or the Hort.
 *
 * Built from the routine-sheet parts (components/sheet). No rings, no boxes
 * to tick and no sums over the week: the Ankommen card offers choices, the
 * homework card one sentence with a picture. `unfit` marks days whose times
 * do not fit, for the preview on the page only.
 */
export function NachmittagsplanSheet({
  plan,
  variant = 'blatt',
  heading = 'h2',
  unfit = [],
}: {
  plan: AfternoonPlan;
  variant?: SheetVariant;
  heading?: 'h1' | 'h2';
  unfit?: readonly WeekdayId[];
}) {
  const week = sheetWeek(plan);
  const dinner = dinnerLine(plan);
  const sentence = knackSentence(plan);
  const knackImg = knackPicture(plan);
  const full = variant === 'blatt';

  return (
    <section className="rs-sheet rs-sheet--a4 np-sheet" data-variant={variant}>
      <div className="rs-page np-page">
        <SheetHead
          eyebrow={NACHMITTAG_EYEBROW}
          title={NACHMITTAG_TITLE}
          description={NACHMITTAG_DESC}
          heading={heading}
          nameLine={false}
          host={<RonkiHost pose="calm" />}
        />

        <ul className="np-week" aria-label="Die Woche" data-week>
          {week.map((day) => (
            <DayColumn key={day.id} day={day} unfit={unfit.includes(day.id)} />
          ))}
        </ul>

        {(dinner || full) && (
          <div className="np-under">
            {dinner ? (
              <p className="np-dinner" data-dinner>
                <TaskPicture img="plate.webp" />
                <span>{dinner}</span>
              </p>
            ) : (
              <span />
            )}
            {full && (
              <aside className="np-foryou" data-for-you aria-label="Für dich">
                <span className="np-foryou-tag">Für dich</span>
                <p>{FOR_YOU}</p>
              </aside>
            )}
          </div>
        )}

        {full && (
          <>
            <div className="np-cut" aria-hidden>
              <Scissors />
            </div>
            <div className="np-cards" data-cards={sentence ? 'two' : 'one'}>
              <ArriveCard />
              {sentence && <KnackCard sentence={sentence} img={knackImg} />}
            </div>
          </>
        )}

        <SheetFooter url={FOOTER_URL} />
      </div>
    </section>
  );
}

function DayColumn({ day, unfit }: { day: SheetDay; unfit: boolean }) {
  // Homework done in the OGS happens before pickup; an appointment the child
  // goes to straight from school comes before Ankommen.
  const ogs = day.items.find((item) => item.type === 'homework' && item.where === 'ogs') ?? null;
  const first = day.appointmentFirst ? (day.items.find((item) => item.type === 'appointment') ?? null) : null;
  const rest = day.items.filter((item) => item !== ogs && item !== first);
  return (
    <li className="np-day" data-day={day.id} {...(day.free ? { 'data-free': '' } : {})} {...(unfit ? { 'data-unfit': '' } : {})}>
      <h3 className="np-day-name">{day.label}</h3>
      {unfit && <p className="np-unfit">{UNFIT_NOTE}</p>}
      {day.free ? (
        <p className="np-free">{FREE_DAY}</p>
      ) : (
        <>
          {ogs && <Item item={ogs} />}
          {day.end && (
            <div className="np-block" data-block="end">
              <TaskPicture img="school.webp" />
              <span className="np-label">Schule aus</span>
              <span className="np-time">{day.end}</span>
            </div>
          )}
          {first && <Item item={first} />}
          {day.arrive && (
            <div className="np-block" data-block="arrive">
              <span className="np-trio" aria-hidden>
                {ARRIVE_STEPS.map((step) => (
                  <TaskPicture key={step.img} img={step.img} />
                ))}
              </span>
              <span className="np-label">Ankommen</span>
              {day.arrive.duration && <span className="np-time">{day.arrive.duration}</span>}
            </div>
          )}
          {rest.map((item) => (
            <Item key={item.type} item={item} />
          ))}
        </>
      )}
    </li>
  );
}

function Item({ item }: { item: SheetItem }) {
  if (item.type === 'homework') {
    return (
      <div className="np-block" data-block="homework" data-where={item.where}>
        {item.where !== 'none' && <TaskPicture img="homework.webp" />}
        <span className="np-label">Hausaufgaben</span>
        {item.time && <span className="np-time">{item.time}</span>}
        {item.duration && <span className="np-dur">{item.duration}</span>}
        {item.note && <span className="np-note">{item.note}</span>}
      </div>
    );
  }
  return (
    <div className="np-block" data-block="appointment">
      {/* A known word gets its picture; anything else an empty box the
          child draws into, never a stand-in that shows the wrong thing. */}
      {item.img ? <TaskPicture img={item.img} /> : <TaskPicture draw />}
      <span className="np-label np-label--own">{item.label}</span>
      {item.time && <AppointmentTime time={item.time} />}
    </div>
  );
}

/** "16:00 bis 17:00" breaks only before "bis", never inside a time. */
function AppointmentTime({ time }: { time: string }) {
  const [from, to] = time.split(' bis ');
  return (
    <span className="np-time np-time--span">
      <span>{from}</span>
      {to !== undefined && (
        <>
          {' '}
          <span>bis {to}</span>
        </>
      )}
    </span>
  );
}

/** The child's card: what helps to arrive, as choices, and Ronki asks. */
function ArriveCard() {
  return (
    <div className="np-card np-card--arrive" data-card="ankommen">
      <h3 className="np-card-title">{ARRIVE_TITLE}</h3>
      <ul className="np-arrive" aria-label="Ankommen">
        {ARRIVE_CHOICES.map((step) => (
          <li key={step.img}>
            <TaskPicture img={step.img} />
            <span className="np-arrive-label">{step.label}</span>
          </li>
        ))}
      </ul>
      <div className="np-card-host">
        <img src={`${RONKI_ART_PATH}calm.webp`} alt="" width={512} height={512} draggable={false} />
        <p className="np-card-bubble">{ARRIVE_BUBBLE}</p>
      </div>
    </div>
  );
}

function KnackCard({ sentence, img }: { sentence: string; img: string | null }) {
  return (
    <div className="np-card np-card--knack" data-card="knackpunkt">
      <h3 className="np-card-title np-card-title--pic">
        {img && <TaskPicture img={img} />}
        <span>{KNACK_TITLE}</span>
      </h3>
      <div className="np-card-host np-card-host--big">
        <img src={`${RONKI_ART_PATH}happy.webp`} alt="" width={512} height={512} draggable={false} />
        <p className="np-card-bubble" data-knack>
          {sentence}
        </p>
      </div>
    </div>
  );
}

/** Small scissors where the cut line starts. Decoration only. */
function Scissors() {
  return (
    <svg className="np-scissors" viewBox="0 0 24 24" aria-hidden focusable="false">
      <g fill="none" stroke="#040812" strokeWidth="2" strokeLinecap="round">
        <circle cx="6" cy="7" r="3" />
        <circle cx="6" cy="17" r="3" />
        <path d="M8.6 8.6 20 18" />
        <path d="M8.6 15.4 20 6" />
      </g>
    </svg>
  );
}
