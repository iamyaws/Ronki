/**
 * Community hub / founding-members invitation page.
 *
 * Positioning: "Gründungs-Familien" — not "beta testers", not "users",
 * but "the first families who shape Ronki". Gives early adopters a
 * meaningful identity and creates a narrative Marc can reference later
 * ("the first 30 families"). Matches Marc's "wir bauen das mit euch"
 * voice from UeberMich.
 *
 * What readers get: direct line to Marc, Discord channel, early-access,
 * their input flowing into next version. What we ask: a week or two of
 * real use, one honest reply, optional Discord participation.
 *
 * Entry-points: three CTAs stacked by commitment level — Discord (most
 * engaged), App preview (low-friction), Mail (personal touch). Keeps
 * it inclusive: Discord-native parents get their channel, Mail-native
 * parents get theirs, nobody feels shut out.
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { EASE_OUT } from '../lib/motion';
import { trackEvent } from '../lib/analytics';

const DISCORD_INVITE = 'https://discord.gg/e8yns9A4X';
const APP_URL = 'https://app.ronki.de/';

export default function MitMachen() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Werdet Gründungs-Familie: Ronki mitgestalten"
        description="Die ersten Familien, die Ronki mit uns formen. Direkter Draht zu Marc, Discord-Community, früh dabei sein. Keine Gebühr, keine Verpflichtung, keine Werbung."
        canonicalPath="/mitmachen"
      />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors mb-8"
            >
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Public&#8209;Alpha &middot; kleine Gruppe
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
              Werdet{' '}
              <em className="italic text-sage whitespace-nowrap">
                Gründungs&#8209;Familie
              </em>
              .
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Ronki ist ein leiser Drache für Kinder zwischen 5 und 8. Er
              hilft beim Benennen, was ein Kind gerade fühlt. Er atmet mit,
              wenn ein Tag zu viel war. Am Abend weiß das Kind: jemand hat
              zugehört. Wir bauen ihn gerade, mein Sohn und ich. Jetzt
              suchen wir in der Public&#8209;Alpha die ersten Familien, die
              ihn mit uns formen. Bevor daraus etwas Größeres wird.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Was ist das ─────────────────────────────────── */}
      <section className="px-6 pb-14 sm:pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="flex flex-col gap-5 text-base sm:text-lg text-ink/75 leading-relaxed"
            style={{
              hyphens: 'manual',
              WebkitHyphens: 'manual',
              MozHyphens: 'manual',
            }}
          >
            <p>
              Eine Gründungs&#8209;Familie ist eine der ersten Familien, die Ronki im echten Alltag ausprobiert. Drei bis vier Morgen, vielleicht eine Woche. Genug Zeit für ein Gefühl, was klappt und was nicht. Ihr seid keine Testkunden. Ihr seid die, auf die wir hören.
            </p>
            <p>
              Warum das zählt: in den ersten Wochen einer App entscheidet sich, welche Ideen bleiben und welche rausfliegen. Eure Rückmeldung formt buchstäblich, wie Ronki sich in einem Jahr anfühlt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Was ihr bekommt / Was wir brauchen ─────────── */}
      <section className="px-6 pb-20 sm:pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="rounded-2xl bg-white p-7 sm:p-8"
            style={{ boxShadow: '0 8px 28px -12px rgba(4,8,18,0.18)' }}
          >
            <div className="h-1 w-12 bg-sage rounded-full mb-5" aria-hidden />
            <p className="text-xs uppercase tracking-[0.15em] text-sage font-display font-bold mb-3">
              Was ihr von uns bekommt
            </p>
            <ul className="flex flex-col gap-3.5 text-sm sm:text-base text-ink/80 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-sage flex-shrink-0 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Direkten Draht zu mir per Mail. Jede Antwort landet bei Marc, nicht bei einem Support&#8209;Bot.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage flex-shrink-0 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Einen Discord&#8209;Kanal für schnellen Austausch. Fragen, Bugs, Aha&#8209;Momente zwischen Eltern, die Ronki gerade auch ausprobieren.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage flex-shrink-0 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Frühen Zugang zu neuen Features, bevor sie öffentlich werden.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sage flex-shrink-0 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Eure Ideen und Sorgen fließen direkt in die nächste Version. Nicht „wir prüfen das", sondern „wir bauen das als Nächstes".
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
            className="rounded-2xl bg-white p-7 sm:p-8"
            style={{ boxShadow: '0 8px 28px -12px rgba(4,8,18,0.18)' }}
          >
            <div className="h-1 w-12 bg-mustard rounded-full mb-5" aria-hidden />
            <p className="text-xs uppercase tracking-[0.15em] text-cobalt font-display font-bold mb-3">
              Was wir uns von euch wünschen
            </p>
            <ul className="flex flex-col gap-3.5 text-sm sm:text-base text-ink/80 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-cobalt flex-shrink-0 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Eine oder zwei Wochen ausprobieren. Kein langer Vertrag, keine Mindestnutzung.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cobalt flex-shrink-0 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Eine Rückmeldung wenn's passt, auch wenn sie kurz ist. „Cool, aber mein Kind klickt immer auf diesen Knopf" ist 1000x wertvoller als Sterne&#8209;Bewertungen.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cobalt flex-shrink-0 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Wenn Discord etwas für euch ist: gelegentlich reinschauen, vielleicht was teilen. Wenn nicht, reicht die Mail völlig.
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── CTAs ────────────────────────────────────────── */}
      <section className="px-6 pb-20 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-3">
              So steigt ihr ein
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink">
              Drei Wege, und alle sind ok.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <CTACard
              accent="sage"
              eyebrow="Discord"
              title="In die Community"
              body="Chat mit anderen Gründungs-Familien. Schnelle Fragen, Aha-Momente, gelegentlich mein Input."
              cta="Discord beitreten"
              href={DISCORD_INVITE}
              external
              primary
              delay={0}
            />
            <CTACard
              accent="teal"
              eyebrow="Die App"
              title="Erst mal probieren"
              body="Ronki läuft direkt im Browser. Kein Store, kein Download, kostenlos. Schauen, spielen, eigenen Eindruck holen."
              cta="Ronki ausprobieren"
              href={APP_URL}
              external
              delay={0.1}
            />
            <CTACard
              accent="ochre"
              eyebrow="Persönlich"
              title="Kurz vorstellen"
              body="Lieber erst mal in Ruhe per Mail? Schreibt mir zwei Sätze, ich antworte persönlich."
              cta="Mail an Marc"
              href="mailto:hallo@ronki.de"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20 bg-cream/40">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-4">
              Kleine Fragen
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
              Was ihr wahrscheinlich wissen wollt.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-4">
            {[
              {
                q: 'Kostet das etwas?',
                a: 'Nein. Ronki ist kostenlos in der Public\u2011Alpha. Falls sich daran in einer späteren Phase etwas ändert, kommunizieren wir es transparent und mit Vorlauf, bevor irgendetwas passiert.',
              },
              {
                q: 'Muss ich ständig aktiv sein?',
                a: 'Nein. Einmal ausprobieren, eine Rückmeldung wenn ihr mögt. Discord ist Kür, nicht Pflicht.',
              },
              {
                q: 'Werden meine Daten verkauft?',
                a: 'Nein. Keine Werbung, keine Tracker, keine Drittanbieter. Mehr Details im Datenschutz.',
              },
              {
                q: 'Kann ich wieder raus?',
                a: 'Immer. Kein Abo, keine Verpflichtung, keine E\u2011Mail-Flut. Discord einfach verlassen, eine kurze Mail „nein danke" reicht.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_OUT }}
                className="rounded-2xl bg-white p-5 sm:p-6"
                style={{ boxShadow: '0 4px 14px -10px rgba(4,8,18,0.18)' }}
              >
                <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-2 leading-tight">
                  {item.q}
                </h3>
                <p
                  className="text-sm text-ink/75 leading-relaxed"
                  style={{
                    hyphens: 'manual',
                    WebkitHyphens: 'manual',
                    MozHyphens: 'manual',
                  }}
                >
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ─────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display font-semibold text-xl sm:text-2xl lg:text-3xl leading-snug text-ink max-w-2xl mx-auto"
            style={{
              hyphens: 'manual',
              WebkitHyphens: 'manual',
              MozHyphens: 'manual',
            }}
          >
            Ich bin Marc, ich baue Ronki mit meinem Sohn. Wenn ihr dabei sein wollt, schreibt oder kommt in den Discord. Eure Kinder werden am Ende formen, was Ronki ist.
          </motion.p>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

/* ── CTA card sub-component ─────────────────────────── */

type CTACardProps = {
  accent: 'sage' | 'teal' | 'ochre';
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  external?: boolean;
  primary?: boolean;
  delay?: number;
};

function CTACard({
  accent,
  eyebrow,
  title,
  body,
  cta,
  href,
  external,
  primary,
  delay = 0,
}: CTACardProps) {
  const accentClasses = {
    sage: {
      bar: 'bg-sage',
      eyebrow: 'text-sage bg-sage-soft/40',
      btn: 'bg-sage text-cream',
    },
    teal: {
      bar: 'bg-teal',
      eyebrow: 'text-teal bg-teal/10',
      btn: 'bg-teal text-cream',
    },
    ochre: {
      bar: 'bg-ochre',
      eyebrow: 'text-ink bg-mustard-soft/70',
      btn: 'bg-cobalt text-white',
    },
  }[accent];

  const LinkComp: any = external ? 'a' : href.startsWith('mailto:') ? 'a' : Link;
  const linkProps: any = external
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : href.startsWith('mailto:')
    ? { href }
    : { to: href };
  // Tag which CTA was clicked — eyebrow doubles as event name
  // (short, stable, 1:1 with what's on the page). All three land in
  // Plausible as 'Mitmachen CTA' with a `cta` prop for filtering.
  linkProps.onClick = () =>
    trackEvent('Mitmachen CTA', { cta: eyebrow.toLowerCase() });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      <LinkComp
        {...linkProps}
        className="group relative flex flex-col rounded-2xl bg-white overflow-hidden h-full"
        style={{
          boxShadow: primary
            ? '0 12px 32px -12px rgba(5,68,176,0.35)'
            : '0 8px 24px -12px rgba(4,8,18,0.18)',
        }}
      >
        <div className={`h-1.5 w-full ${accentClasses.bar}`} />
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          <span
            className={`self-start inline-flex items-center rounded-full px-3 py-1 text-[10px] font-display font-bold uppercase tracking-[0.15em] mb-4 ${accentClasses.eyebrow}`}
          >
            {eyebrow}
          </span>
          <h3 className="font-display font-bold text-lg sm:text-xl text-ink leading-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-ink/70 leading-relaxed mb-5 flex-1">
            {body}
          </p>
          <span
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 ${accentClasses.btn} font-display font-bold text-xs sm:text-sm shadow-sm group-hover:gap-3 group-hover:shadow-md transition-all`}
          >
            {cta}
            <span aria-hidden>{external ? '↗' : '→'}</span>
          </span>
        </div>
      </LinkComp>
    </motion.div>
  );
}
