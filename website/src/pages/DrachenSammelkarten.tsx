/**
 * Public download/print hub for the Drachen-Sammelkarten.
 *
 * Why: the /print/* routes are internal utilities — great for single-
 * tap PDF generation but hidden from sitemap/robots/nav. Marc wanted
 * a kid- and parent-friendly landing page that:
 *   - shows all 9 dragons in a gallery (so kids want to collect them)
 *   - offers one-click print CTAs for single card or full 2-sheet set
 *   - explains the manual-duplex workflow in steps a parent can follow
 *   - gently teases the in-app Drachen-Compendium as the digital
 *     counterpart (app.ronki.de/?compendium=1)
 *
 * Everything about the Sammelkarte data lives in one place:
 * `./PrintA6FlyerKidsCard` re-exports the DRAGONS pool. This page
 * just imports and lays them out for browsing.
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { EASE_OUT } from '../lib/motion';
import { trackEvent } from '../lib/analytics';
import { DRAGONS } from './PrintA6FlyerKidsCard';

export default function DrachenSammelkarten() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Drachen-Sammelkarten zum Ausdrucken: Ronki"
        description="Neun eigene Sammelkarten mit Drachen aus dem Ronki-Universum. Druck sie zu Hause aus, unterschreib sie, gib deinem Drachen einen Namen und tausch sie am Schulhof."
        canonicalPath="/drachen-sammelkarten"
      />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="px-6 pt-32 pb-10 sm:pt-40 sm:pb-14">
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
              Für dein Sammelalbum
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-ink">
              Drachen-Sammelkarten{' '}
              <em className="italic text-sage whitespace-nowrap">zum Ausdrucken</em>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Neun Drachen aus dem Ronki-Universum. Druck sie zu Hause aus,
              unterschreib sie auf der Rückseite, gib deinem Drachen einen
              eigenen Namen und tausch sie am Schulhof.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Print CTAs ──────────────────────────────────── */}
      <section className="px-6 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <Link
              to="/print/a6-flyer-kids-card"
              className="group relative flex flex-col rounded-2xl bg-white overflow-hidden h-full"
              style={{ boxShadow: '0 8px 28px -12px rgba(4,8,18,0.18)' }}
            >
              <div className="h-1.5 w-full bg-sage" />
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <span className="self-start inline-flex items-center rounded-full px-3 py-1 text-[10px] font-display font-bold uppercase tracking-[0.15em] mb-4 bg-sage-soft/50 text-sage">
                  Eine Karte
                </span>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink leading-tight mb-3">
                  Eine zufällige Karte
                </h2>
                <p className="text-sm text-ink/70 leading-relaxed mb-6 flex-1">
                  Ein Klick, zufällig einen Drachen ziehen, als A6-Flyer drucken.
                  Jeder Reload zieht einen anderen.
                </p>
                <span className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 bg-sage text-cream font-display font-bold text-sm shadow-sm group-hover:gap-3 group-hover:shadow-md transition-all">
                  Karte öffnen
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
          >
            <Link
              to="/print/sheet-a4-kids-card"
              className="group relative flex flex-col rounded-2xl bg-white overflow-hidden h-full"
              style={{ boxShadow: '0 8px 28px -12px rgba(4,8,18,0.18)' }}
            >
              <div className="h-1.5 w-full bg-mustard" />
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <span className="self-start inline-flex items-center rounded-full px-3 py-1 text-[10px] font-display font-bold uppercase tracking-[0.15em] mb-4 bg-mustard-soft/50 text-ochre">
                  Komplett-Set
                </span>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink leading-tight mb-3">
                  2 A4-Bögen, 8 Karten
                </h2>
                <p className="text-sm text-ink/70 leading-relaxed mb-6 flex-1">
                  Zwei Bögen mit jeweils vier verschiedenen Drachen, eine
                  gemeinsame Rückseite. Zum Drucken, Wenden, Schneiden.
                </p>
                <span className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 bg-ochre text-cream font-display font-bold text-sm shadow-sm group-hover:gap-3 group-hover:shadow-md transition-all">
                  Komplett-Set öffnen
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Dragon gallery ─────────────────────────────── */}
      <section className="px-6 pb-20 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-12 text-center"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
              Das Sammel-Set
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink">
              Neun Drachen.{' '}
              <em className="italic text-sage">Ein Album.</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {DRAGONS.map((d, i) => (
              <motion.article
                key={d.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: EASE_OUT }}
                className="rounded-2xl bg-white overflow-hidden"
                style={{ boxShadow: '0 6px 20px -10px rgba(4,8,18,0.15)' }}
              >
                <Link
                  to={`/print/a6-flyer-kids-card?d=${d.slug}`}
                  className="block group"
                >
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{
                      background:
                        'radial-gradient(ellipse 100% 100% at 50% 30%, #FFE68A 0%, #F2BC5B 100%)',
                    }}
                  >
                    <img
                      src={d.art}
                      alt={d.name}
                      className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
                      style={{
                        objectFit: d.fit === 'contain' ? 'contain' : 'cover',
                        padding: d.fit === 'contain' ? '10%' : 0,
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-teal/60 font-display font-semibold mb-1.5">
                      {d.type}
                    </p>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-ink leading-tight mb-2">
                      {d.name}
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-ink/55">
                        HP {d.hp}
                      </span>
                      <span className="text-[10px] font-display font-bold text-cobalt tracking-wider">
                        {d.rarity}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How-to ──────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20 bg-cream/40">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink/60 font-semibold mb-4">
              So drucke ich das
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
              Fünf Schritte, acht Karten.
            </h2>
          </motion.div>

          <ol className="flex flex-col gap-4 sm:gap-5">
            {[
              {
                t: 'Komplett-Set öffnen',
                d: 'Klick oben auf „2 A4-Bögen, 8 Karten". Der Browser-Druckdialog zeigt dir drei A4-Seiten.',
              },
              {
                t: 'Bogen 1 drucken',
                d: 'Seite 1 auf ein leeres A4. Du hast jetzt 4 Vorderseiten.',
              },
              {
                t: 'Papier wenden, Rückseite drucken',
                d: 'Dasselbe Papier an der langen Kante flippen, zurück in den Drucker, Seite 3 (Rückseiten) drucken.',
              },
              {
                t: 'Bogen 2 + Rückseiten',
                d: 'Zweites A4: Seite 2 drucken, wenden, wieder Seite 3. Jetzt hast du 8 doppelseitige Karten auf 2 Bögen.',
              },
              {
                t: 'Schneiden & sammeln',
                d: 'Beide Bögen entlang der Schnittmarken in 4 zerschneiden. 8 Karten. Unterschreib sie, tausch sie, beschütz sie.',
              },
            ].map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_OUT }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-white"
                style={{ boxShadow: '0 4px 14px -10px rgba(4,8,18,0.18)' }}
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-sage text-cream font-display font-bold text-base flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 pt-0.5">
                  <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-1 leading-tight">
                    {step.t}
                  </h3>
                  <p className="text-sm text-ink/70 leading-relaxed">{step.d}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-xs text-ink/55 text-center mt-8 leading-relaxed"
          >
            Tipp: 200 g Papier oder dicker macht die Karten haltbarer. Normales
            Druckerpapier reicht aber auch völlig für den Schulhof-Tausch.
          </motion.p>
        </div>
      </section>

      {/* ── Compendium teaser ──────────────────────────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl bg-teal-dark text-cream px-8 sm:px-12 py-12 sm:py-16 overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-mustard/10 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-sage/15 blur-3xl"
            />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.2em] text-mustard font-medium mb-4">
                In der Ronki-App
              </p>
              <h3 className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-4">
                Ein ganzes Drachen-Compendium{' '}
                <em className="italic text-mustard">wartet auf dich</em>.
              </h3>
              <p className="text-base sm:text-lg opacity-85 leading-relaxed max-w-xl mb-8">
                In der App kannst du alle Drachen entdecken, lernen wie sie
                leben, was sie mögen und wie du Freundschaft mit ihnen
                schließt, ganz ohne Tauschen.
              </p>
              <a
                href="https://app.ronki.de/?compendium=1"
                onClick={() => trackEvent('Compendium Click', { source: 'sammelkarten_teaser' })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 bg-white text-ink font-display font-bold text-sm transition-all hover:gap-3"
              >
                Compendium öffnen
                <span aria-hidden>↗</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
