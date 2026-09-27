import { RonkiHost, SheetFooter, SheetHead, TASK_ART_PATH, TaskPicture } from '../sheet';
import {
  CHILDREN,
  NEEDS_PICTURE,
  cardSteps,
  lightsOutLine,
  overviewRows,
  type ChildId,
  type Clash,
  type OverviewItem,
  type TwoChildPlan,
} from '../../lib/abend-zwei-kinder';
import { clockLabel } from '../../lib/routine-builder/kit';
import '../sheet/sheet.css';
import './abend-zwei-kinder-sheet.css';

export const AZ_TITLE = 'Unser Abend';
export const AZ_EYEBROW = 'Abend mit zwei Kindern';
export const ONE_ADULT_LINE = 'Wer braucht wann deine Hilfe? Die Hand zeigt es.';
export const TWO_ADULTS_LINE = 'Ihr seid zu zweit. Die Hand zeigt, wann ein Kind Hilfe braucht.';
export const NEEDS_LABEL = 'braucht dich';
export const TOGETHER_LABEL = 'zusammen';
export const CARD_TITLE = 'Mein Abend';
export const CLASH_NOTE = 'passt noch nicht';
const FOOTER_URL = 'ronki.de/tools/abend-mit-zwei-kindern';

/**
 * The printable Abend mit zwei Kindern: one A4 page in the Bilderbuch look.
 *
 * Top, for the adult: "Unser Abend", both children's steps side by side in
 * the order of the evening, one row per five minutes as the sheet prints
 * them. Every step where a child needs the adult carries a small pair of
 * hands; a "zusammen" step at the same time for both runs across both
 * columns once. No rings, no boxes to tick, no end time for the adult and
 * no falling-asleep time.
 *
 * Under a dashed cut line, one card per child: the symbol, "Mein Abend",
 * the steps as the evening sheet prints them and "Licht aus um ... Uhr.".
 *
 * `clashes` marks the steps that do not work yet, for the preview on the
 * page only; the page never prints a plan with a clash.
 */
export function AbendZweiKinderSheet({
  plan,
  heading = 'h2',
  clashes = [],
}: {
  plan: TwoChildPlan;
  heading?: 'h1' | 'h2';
  clashes?: readonly Clash[];
}) {
  const rows = overviewRows(plan);
  const marked = new Set(clashes.flatMap((c) => [`s:${c.star.code}`, `m:${c.moon.code}`]));
  const isMarked = (id: ChildId, item: OverviewItem) => marked.has(`${id}:${item.code}`);

  return (
    <section className="rs-sheet rs-sheet--a4 az-sheet" data-adults={plan.adults}>
      <div className="rs-page az-page">
        <SheetHead
          eyebrow={AZ_EYEBROW}
          title={AZ_TITLE}
          description={plan.adults === 2 ? TWO_ADULTS_LINE : ONE_ADULT_LINE}
          heading={heading}
          nameLine={false}
          host={<RonkiHost pose="calm" />}
        />

        <div className="az-over" data-overview>
          <div className="az-over-head">
            <span className="az-gutter" aria-hidden />
            {CHILDREN.map((child) => (
              <div key={child.id} className="az-col-head" data-col-head={child.id}>
                <TaskPicture img={child.img} />
                <span className="az-col-text">
                  <span className="az-col-name">{child.name}</span>
                  <span className="az-col-aus">Licht aus {clockLabel(plan.children[child.id].lightsOut)}</span>
                </span>
              </div>
            ))}
            <p className="az-legend" data-legend>
              <img src={`${TASK_ART_PATH}${NEEDS_PICTURE}`} alt="" width={256} height={256} draggable={false} />
              <span>{NEEDS_LABEL}</span>
            </p>
          </div>

          <ol className="az-rows" aria-label="Unser Abend" data-rows>
            {rows.map((row, i) =>
              row.kind === 'zusammen' ? (
                <li key={`z-${row.item.code}-${i}`} className="az-row az-row--both" data-row="zusammen">
                  <span className="az-time">{row.time}</span>
                  <div className="az-cell az-cell--both" data-together>
                    <Item
                      item={row.item}
                      clash={isMarked('s', row.item) || isMarked('m', row.item)}
                      tag={TOGETHER_LABEL}
                    />
                  </div>
                </li>
              ) : (
                <li key={`p-${i}`} className="az-row" data-row="paar">
                  <span className="az-time">{row.time}</span>
                  <div className="az-cell" data-col="s">
                    {row.star.map((item) => (
                      <Item key={item.code} item={item} clash={isMarked('s', item)} />
                    ))}
                  </div>
                  <div className="az-cell" data-col="m">
                    {row.moon.map((item) => (
                      <Item key={item.code} item={item} clash={isMarked('m', item)} />
                    ))}
                  </div>
                </li>
              ),
            )}
          </ol>

        </div>

        <div className="az-cut" aria-hidden>
          <Scissors />
        </div>

        <div className="az-cards">
          {CHILDREN.map((child) => (
            <ChildCard key={child.id} plan={plan} id={child.id} img={child.img} />
          ))}
        </div>

        <SheetFooter url={FOOTER_URL} />
      </div>
    </section>
  );
}

function Needs() {
  return (
    <img
      className="az-needs"
      data-needs
      src={`${TASK_ART_PATH}${NEEDS_PICTURE}`}
      alt={NEEDS_LABEL}
      width={256}
      height={256}
      draggable={false}
    />
  );
}

function Item({ item, clash, tag }: { item: OverviewItem; clash: boolean; tag?: string }) {
  return (
    <div className="az-item" data-code={item.code} {...(clash ? { 'data-clash': '' } : {})}>
      {item.img ? <TaskPicture img={item.img} /> : <TaskPicture draw />}
      <span className="az-label">{item.label}</span>
      {tag && <span className="az-tag">{tag}</span>}
      {item.needs && <Needs />}
      {clash && <span className="az-clash">{CLASH_NOTE}</span>}
    </div>
  );
}

function ChildCard({ plan, id, img }: { plan: TwoChildPlan; id: ChildId; img: string }) {
  const steps = cardSteps(plan, id);
  const needs = plan.children[id].needs;
  return (
    <div className="az-card" data-card={id}>
      <div className="az-card-head">
        <TaskPicture img={img} />
        <h3 className="az-card-title">{CARD_TITLE}</h3>
      </div>
      <ol className="az-card-steps" data-count={steps.length}>
        {steps.map((step) => (
          <li key={step.code} className="az-card-row" data-code={step.code}>
            {step.img ? <TaskPicture img={step.img} /> : <TaskPicture draw />}
            <span className="az-card-body">
              <span className="az-card-top">
                <span className="az-card-label">{step.label}</span>
              </span>
              {step.hint && <span className="az-card-hint">{step.hint}</span>}
            </span>
            {needs.includes(step.code) ? <Needs /> : <span className="az-needs-space" aria-hidden />}
            <span className="rs-ring az-ring" aria-hidden />
          </li>
        ))}
      </ol>
      <p className="az-band" data-band>
        {lightsOutLine(plan, id)}
      </p>
    </div>
  );
}

/** Small scissors where the cut line starts. Decoration only. */
function Scissors() {
  return (
    <svg className="az-scissors" viewBox="0 0 24 24" aria-hidden focusable="false">
      <g fill="none" stroke="#040812" strokeWidth="2" strokeLinecap="round">
        <circle cx="6" cy="7" r="3" />
        <circle cx="6" cy="17" r="3" />
        <path d="M8.6 8.6 20 18" />
        <path d="M8.6 15.4 20 6" />
      </g>
    </svg>
  );
}
