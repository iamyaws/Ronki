/**
 * /tools/schlafens-rechner — sleep schedule calculator for kids 5-9.
 *
 * Two inputs (Alter, Aufstehzeit), four output time-cards (Bildschirm
 * aus, Bett-Vorbereiten, Vorlesen, Bettzeit), and an explanation
 * paragraph that shows why those numbers come out the way they do.
 *
 * Brand-safe: every recommendation cites the underlying sleep-science
 * range. We don't say "your kid MUST sleep X". We say "for healthy
 * sleep at this age, the consensus range is Y, this schedule lands in
 * the middle of it".
 *
 * NORTHSTAR CARVE-OUT (26 Apr 2026): The Ronki app is positioned for
 * 5-8 year olds, but this parent-tool keeps the broader 5-9 picker.
 * Reason: sleep schedules genuinely apply across the full primary-school
 * range, and tightening the picker hurts SEO ("schlafenszeit 9-jährige")
 * without product justification. Parent-tools serve a wider audience
 * than the app itself by design.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { ToolDisclaimer } from '../../components/AppCheck/ToolDisclaimer';
import { ArrowRight } from '../../components/AppCheck/Icons';
import { SchlafensShareCard } from '../../components/AppCheck/SchlafensShareCard';
import {
  calculateSchedule,
  type ChildAge,
} from '../../lib/schlafens-rechner/calculator';
import { EASE_OUT, fadeUp } from '../../lib/motion';

const AGES: ChildAge[] = [5, 6, 7, 8, 9];

export default function SchlafensRechner() {
  const reduced = useReducedMotion();
  const [age, setAge] = useState<ChildAge>(7);
  const [wakeUp, setWakeUp] = useState<string>('06:30');

  const schedule = calculateSchedule(age, wakeUp);

  return (
    <PainterlyShell>
      <PageMeta
        title="Schlafens-Rechner: gute Bettzeit für Kinder 5-9"
        description="Wann sollte dein Grundschulkind ins Bett, wann sollte der Bildschirm aus sein, wann ist die richtige Zeit zum Vorlesen? Schnelle Mathematik, basiert auf Schlafmedizin-Konsens."
        canonicalPath="/tools/schlafens-rechner"
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink focus:outline-none focus-visible:text-ink focus-visible:underline underline-offset-4 transition-colors mb-8"
          >
            <span aria-hidden>←</span> Werkzeuge
          </Link>

          <motion.div {...fadeUp(0, reduced)} className="space-y-10">
            <header className="space-y-6">
              <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
                Werkzeug für Eltern
              </p>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
                Wann muss dein Kind ins{' '}
                <em className="italic text-sage">Bett</em>?
              </h1>
              <p className="text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
                Sag uns das Alter und die Aufstehzeit, wir rechnen rückwärts:
                wann sollte der Bildschirm aus sein, wann sollte der
                Bett-Vorbereiten-Block beginnen, wann ist Bettzeit. Mathematik
                aus Schlafmedizin-Konsens, kein Urteil.
              </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Age picker */}
              <div className="rounded-2xl bg-cream/70 border border-teal/15 p-6 space-y-4">
                <label className="block">
                  <span className="text-sm text-ink/70 mb-3 block">
                    Wie alt ist dein Kind?
                  </span>
                  <div
                    role="radiogroup"
                    aria-label="Alter des Kindes"
                    className="flex flex-wrap gap-2"
                  >
                    {AGES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        role="radio"
                        aria-checked={age === a}
                        onClick={() => setAge(a)}
                        className={`min-w-[3rem] py-2.5 px-3 rounded-xl border-2 font-display font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all ${
                          age === a
                            ? 'border-teal bg-teal text-cream shadow-sm'
                            : 'border-teal/20 bg-cream text-ink hover:border-teal'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              {/* Wake-up time */}
              <div className="rounded-2xl bg-cream/70 border border-teal/15 p-6 space-y-4">
                <label className="block">
                  <span className="text-sm text-ink/70 mb-3 block">
                    Wann muss es morgens raus?
                  </span>
                  <input
                    type="time"
                    value={wakeUp}
                    onChange={(e) => setWakeUp(e.target.value)}
                    className="w-full text-2xl font-display font-bold text-ink bg-cream border-2 border-teal/20 rounded-xl px-4 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:border-transparent tabular-nums"
                  />
                  <p className="text-xs text-ink/55 mt-2">
                    Schule, Kita, oder einfach euer normaler Werktag-Start.
                  </p>
                </label>
              </div>
            </div>

            {schedule && (
              <motion.div
                key={`${age}-${wakeUp}`}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="space-y-8"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-4">
                    Dein Abend-Plan, rückwärts
                  </p>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-2">
                    {schedule.recommendation.recommendedHours}{' '}
                    Stunden Schlaf für ein {age}-jähriges Kind.
                  </h2>
                  <p className="text-sm text-ink/65">
                    Der Konsens der Schlafmedizin liegt bei{' '}
                    {schedule.recommendation.rangeHours[0]}–
                    {schedule.recommendation.rangeHours[1]} Stunden in diesem
                    Alter. Diese Rechnung landet genau in der Mitte.
                  </p>
                </div>

                <ol className="grid sm:grid-cols-2 gap-4 list-none p-0">
                  <ScheduleStep
                    label="Bildschirm aus"
                    time={schedule.screenOff}
                    detail={`${schedule.recommendation.screenOffMinutesBefore} Min vor Bettzeit. Blaulicht und Mechaniken ziehen den Schlaf nach hinten.`}
                    accent="sage"
                  />
                  <ScheduleStep
                    label="Bett-Vorbereiten"
                    time={schedule.bedtimePrep}
                    detail="Zähne putzen, Schlafanzug anziehen, kurz aufräumen. 30 Min vor Bettzeit."
                    accent="sage"
                  />
                  <ScheduleStep
                    label="Vorlesen oder Ritual"
                    time={schedule.storyTime}
                    detail="Letzte 15 Min im Bett, ruhige Stimme, kein Bildschirm. Brücke zwischen wach und schläfrig."
                    accent="mustard"
                  />
                  <ScheduleStep
                    label="Bettzeit"
                    time={schedule.bedtime}
                    detail={`Licht aus, leise. Aufstehzeit ${wakeUp} minus ${schedule.recommendation.recommendedHours}h Schlaf minus 15 Min Einschlafzeit.`}
                    accent="teal"
                  />
                </ol>

                <div className="rounded-2xl bg-cream/80 ring-1 ring-inset ring-teal/15 px-6 py-6 sm:px-8 sm:py-7 space-y-3">
                  <h3 className="font-display font-bold text-lg text-ink">
                    Was die Zahlen bedeuten
                  </h3>
                  <p className="text-sm text-ink/75 leading-relaxed max-w-prose">
                    Schlaf ist keine Belohnung, sondern Bauphase. Im
                    Grundschulalter wird in der Tiefschlafphase Gelerntes
                    gefestigt, das Wachstumshormon ausgeschüttet, und der
                    Stress-Cortisol-Spiegel des Tages reguliert. Eine Stunde
                    weniger Schlaf macht sich am Folgetag fast immer messbar
                    bemerkbar, in Aufmerksamkeit und in Frust-Toleranz.
                  </p>
                  <p className="text-sm text-ink/75 leading-relaxed max-w-prose">
                    Die Bildschirm-Aus-Zeit ist nicht Strafe. Sie gibt eurem
                    Kind das Zeitfenster, in dem das Gehirn die letzten
                    Reize verarbeitet und in den Schlafmodus runterfährt.
                    Bei Bildschirm bis kurz vor Bett dauert das Einschlafen
                    in der Regel deutlich länger.
                  </p>
                </div>

                <div className="rounded-2xl bg-teal-dark/8 border border-teal-dark/15 px-6 py-6 sm:px-8 sm:py-7">
                  <p className="font-display font-semibold text-base text-ink leading-relaxed max-w-prose">
                    Das ist ein Vorschlag, kein Dogma. Eure Familie hat
                    Tagesabläufe, an die sich der Plan anpassen muss. Aber
                    wenn ihr morgens regelmäßig schwer aus dem Bett kommt,
                    schau auf die Bettzeit oben und vergleich sie mit eurer
                    aktuellen Realität. Oft ist der Unterschied 30 Minuten,
                    die alles ändern.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display font-bold text-lg text-ink">
                    Karte für andere Eltern
                  </h3>
                  <SchlafensShareCard
                    age={age}
                    wakeUp={wakeUp}
                    schedule={schedule}
                  />
                </div>

                <ToolDisclaimer variant="tool" />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

interface StepProps {
  label: string;
  time: string;
  detail: string;
  accent: 'sage' | 'mustard' | 'teal';
}

/**
 * The accent-color now drives the card BACKGROUND, not just a small
 * pill at the top, so each step is instantly distinguishable. The
 * Bettzeit card goes full teal-dark to read as the destination of
 * the evening; the lead-up cards stay in lighter sage/mustard tints.
 */
const ACCENT_CLASSES: Record<
  StepProps['accent'],
  {
    card: string;
    chip: string;
    timeText: string;
    detailText: string;
  }
> = {
  sage: {
    card: 'bg-sage/20 ring-sage/35',
    chip: 'bg-cream/70 text-ink',
    timeText: 'text-ink',
    detailText: 'text-ink/75',
  },
  mustard: {
    card: 'bg-mustard-soft/55 ring-mustard/40',
    chip: 'bg-cream/80 text-ink',
    timeText: 'text-ink',
    detailText: 'text-ink/80',
  },
  teal: {
    card: 'bg-teal-dark ring-teal-dark/40',
    chip: 'bg-cream/15 text-cream',
    timeText: 'text-cream',
    detailText: 'text-cream/80',
  },
};

function ScheduleStep({ label, time, detail, accent }: StepProps) {
  const c = ACCENT_CLASSES[accent];
  return (
    <li
      className={`rounded-2xl ${c.card} ring-1 ring-inset px-6 py-5 sm:px-7 sm:py-6 flex flex-col gap-3 transition-colors`}
    >
      <span
        className={`inline-flex items-center self-start text-xs uppercase tracking-[0.18em] font-semibold rounded-full px-3 py-1 ${c.chip}`}
      >
        {label}
      </span>
      <span
        className={`text-4xl sm:text-5xl font-display font-bold tabular-nums ${c.timeText}`}
      >
        {time}
      </span>
      <span className={`text-sm leading-relaxed ${c.detailText}`}>
        {detail}
      </span>
    </li>
  );
}
