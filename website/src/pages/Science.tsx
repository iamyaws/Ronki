import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface Choice {
  /** What we decided — stated as a concrete action, not a concept. */
  action: string;
  /** Why, in parent-speak. */
  body: string;
  /** The research + author citation. */
  research: string;
  authors: string;
}

const CHOICES: Choice[] = [
  {
    action: 'Das Kind entscheidet, welche Routine dran ist.',
    body: 'Kinder bleiben dran, wenn sie drei Dinge spüren: eigene Entscheidung, wachsende Kompetenz und Zugehörigkeit. Deshalb bittet Ronki, er bestimmt nicht. Der Drache ist Begleiter, nicht Richter.',
    research: 'Selbstbestimmungstheorie',
    authors: 'Deci & Ryan',
  },
  {
    action: 'Ein verpasster Tag setzt nichts zurück.',
    body: 'Gewohnheiten entstehen durch Wiederholung im gleichen Kontext, nicht durch Druck oder Strafe. Streaks, die reißen, demotivieren Kinder. Wir haben sie weggelassen, weil Forschung sie nicht nur für unnötig, sondern für schädlich hält.',
    research: 'Habit Formation',
    authors: 'Lally et al., 2010',
  },
  {
    action: 'Der Rahmen ist vorbereitet. Das Kind macht den Rest.',
    body: 'Die Umgebung, in der ein Kind handelt, ist wichtiger als die Anweisung, die es bekommt. Ronki bereitet den Zeitpunkt, die kleine Geschichte, die nächste Aufgabe vor. Und tritt dann zurück.',
    research: 'Vorbereitete Umgebung',
    authors: 'Maria Montessori',
  },
  {
    action: 'Ronki wird leiser, nicht lauter.',
    body: 'Echte Unterstützung zieht sich zurück, sobald das Kind sie nicht mehr braucht. Ronkis Begleitung verblasst absichtlich mit wachsender Selbstständigkeit. Am Ende schläft der Drache ein, weil dein Kind die Routine allein kann.',
    research: 'Fading Scaffolding',
    authors: 'Vygotsky · Zone of Proximal Development',
  },
];

interface Anchor {
  name: string;
  label: string;
  url: string;
}

const ANCHORS: Anchor[] = [
  { name: 'BzKJ', label: 'Bundeszentrale Kinder- und Jugendmedienschutz', url: 'https://www.bzkj.de/' },
  { name: 'UNICEF', label: 'UNICEF RITEC-8', url: 'https://www.unicef-irc.org/' },
  { name: 'KIM', label: 'KIM-Studie (mpfs)', url: 'https://www.mpfs.de/' },
  { name: 'D4CR', label: 'Designing for Children\u2019s Rights', url: 'https://designingforchildrensrights.org/' },
  { name: 'WHO', label: 'WHO-Leitlinien Bildschirmzeit', url: 'https://www.who.int/' },
];

interface Source {
  title: string;
  note: string;
  url: string;
}

const SOURCES: Source[] = [
  {
    title: 'klicksafe: Dark Patterns, Manipulation im Netz',
    note: 'EU-Initiative für Medienkompetenz, vom BMFSFJ gefördert.',
    url: 'https://www.klicksafe.de/',
  },
  {
    title: 'Verbraucherzentrale: Lootboxen und Glücksspiel-Mechaniken',
    note: 'Warum variable Belohnungen bei Kindern besonders wirken.',
    url: 'https://www.verbraucherzentrale.de/',
  },
  {
    title: 'BzKJ: Kinder- und Jugendmedienschutz',
    note: 'Die Bundeszentrale sammelt Forschung zu digitalen Risiken.',
    url: 'https://www.bzkj.de/',
  },
  {
    title: 'Norwegian Consumer Council: „Insert Coin" (2022)',
    note: 'Meistzitierter Report zu Dark Patterns in Spielen für Kinder.',
    url: 'https://www.forbrukerradet.no/',
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Science() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Wissenschaftlicher Hintergrund: Ronki"
        description="Welche Forschung hinter Ronki steckt. Und warum wir bewusst auf Dark Patterns verzichten."
        canonicalPath="/wissenschaft"
        ogImage="https://www.ronki.de/og-wissenschaft.jpg"
      />

      {/* ─────────── Hero: the belief ─────────── */}
      <section className="px-6 pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors mb-10"
            >
              <span aria-hidden>&larr;</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Auf Forschung gebaut
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.04] tracking-tight text-ink">
              Wir haben zuerst gelesen.{' '}
              <em className="italic text-sage">Dann programmiert.</em>
            </h1>
            <p className="mt-8 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
              Ronki ist kein Produktivitäts-Werkzeug und kein Disziplin-Helfer.
              Er begleitet das tägliche Ritual deines Kindes, also die kleine
              Abfolge von Zähne, Anziehen, Ranzen, die jeden Morgen wieder
              stattfindet. Leise, ohne Streaks, ohne Druck. Ein Ritual gehört
              dem, der es lebt. Jede Entscheidung, die wir für Ronki getroffen
              haben, stützt sich deshalb auf Forschung statt auf Konversion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Act 1: The problem ─────────── */}
      <section className="px-6 pb-24 sm:pb-28" aria-labelledby="problem-heading">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-6">
              Erstmal ehrlich
            </p>
            <h2
              id="problem-heading"
              className="font-display font-bold text-3xl sm:text-4xl leading-[1.08] tracking-tight text-ink mb-8"
            >
              Deinem Kind wird die Aufmerksamkeit entzogen.
            </h2>
            <div className="space-y-5 text-base sm:text-lg text-ink/75 leading-relaxed">
              <p>
                Wir wissen, was auf dem Pausenhof läuft. Roblox, Fortnite, TikTok. Und wir wissen,
                was in den Apps drin ist: variable Belohnungen, In-Game-Währungen,
                Lootbox-Logik, Streaks, die bei einem verpassten Tag reißen.
              </p>
              <p>
                Diese Mechaniken funktionieren. Gerade bei Kindern. Nicht, weil Kinder schwach
                sind, sondern weil diese Mechaniken exakt für ihre Entwicklungsphase optimiert
                wurden.
              </p>
              <p className="font-display font-semibold text-ink">
                Ronki ist bewusst in die andere Richtung gebaut.
              </p>
              <p>
                Statt Aufmerksamkeit zu extrahieren, begleitet er ein tägliches
                Ritual. Das Ritual gehört dem Kind, nicht der App. Und es wird
                leiser, je besser es sitzt.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Act 2: The four decisions ─────────── */}
      <section
        className="px-6 pt-20 sm:pt-24 pb-24 sm:pb-28 bg-cream/40"
        aria-labelledby="choices-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-6">
              Vier bewusste Entscheidungen
            </p>
            <h2
              id="choices-heading"
              className="font-display font-bold text-3xl sm:text-4xl leading-[1.08] tracking-tight text-ink"
            >
              Was wir gemacht haben, und warum.
            </h2>
            <p className="mt-5 text-base text-ink/65 max-w-xl leading-relaxed">
              Jede Entscheidung stützt sich auf benannte Forschung. Nicht auf Bauchgefühl, nicht
              auf Marketing.
            </p>
          </motion.div>

          <div className="flex flex-col gap-14 sm:gap-16">
            {CHOICES.map((c, i) => (
              <motion.article
                key={c.research}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="relative"
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-display font-semibold text-xs text-teal/55 tracking-[0.2em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px flex-1 bg-teal/15" aria-hidden />
                </div>
                <p className="font-display font-bold text-2xl sm:text-3xl leading-[1.15] tracking-tight text-ink mb-4">
                  {c.action}
                </p>
                <p className="text-sm sm:text-base text-ink/70 leading-relaxed max-w-2xl mb-3">
                  {c.body}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-sage font-display font-semibold">
                  {c.research}
                  <span className="text-ink/40 font-normal normal-case tracking-normal"> · {c.authors}</span>
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Act 3: Accountability ─────────── */}
      <section className="px-6 py-24 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-6">
              Woran wir uns messen
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl leading-[1.12] tracking-tight text-ink mb-6">
              Nicht daran, wie lange dein Kind in der App hängt.
            </h2>
            <p className="text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
              Wir halten uns an die Leitlinien von{' '}
              {ANCHORS.map((a, i) => (
                <span key={a.name}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display font-semibold text-ink underline decoration-teal/30 underline-offset-4 hover:decoration-teal hover:text-teal transition-colors"
                    aria-label={`${a.label}, externe Seite öffnen`}
                  >
                    {a.label}
                  </a>
                  {i < ANCHORS.length - 2 && ', '}
                  {i === ANCHORS.length - 2 && ' und '}
                </span>
              ))}
              . Wenn eine Mechanik in Ronki nicht zu diesen Leitlinien passt, landet sie nicht in
              der App. Punkt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Act 4: Sources ─────────── */}
      <section className="px-6 py-20 sm:py-24 bg-cream/40" aria-labelledby="sources-heading">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-4">
              Für Eltern, die nachlesen wollen
            </p>
            <h2
              id="sources-heading"
              className="font-display font-bold text-2xl sm:text-3xl leading-[1.12] tracking-tight text-ink"
            >
              Quellen
            </h2>
          </motion.div>

          <ul className="divide-y divide-teal/10">
            {SOURCES.map((s, i) => (
              <motion.li
                key={s.url}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="py-4 first:pt-0 last:pb-0"
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 hover:text-teal transition-colors"
                >
                  <span className="flex-1">
                    <span className="block font-display font-semibold text-sm sm:text-base text-ink group-hover:text-teal transition-colors leading-snug">
                      {s.title}
                    </span>
                    <span className="block mt-1 text-xs sm:text-sm text-ink/60 leading-relaxed">
                      {s.note}
                    </span>
                  </span>
                  <span
                    className="mt-0.5 text-teal/50 group-hover:text-teal group-hover:translate-x-0.5 transition-all shrink-0"
                    aria-hidden
                  >
                    ↗
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
