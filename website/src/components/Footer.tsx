import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ClosingBand } from './ClosingBand';
import { trackEvent } from '../lib/analytics';
import { getLaunchCopy, LAUNCH_STATE } from '../config/launch-state';
import { RonkiWordmark } from './primitives/RonkiWordmark';
import { WashiTape } from './primitives/WashiTape';

type FooterProps = {
  /** The night closing band that ends the page. Pages that already end
   *  on a dark CTA block of their own pass false, so no two dark blocks
   *  stack up at the bottom. */
  closing?: boolean;
  /** Start page only: the band also carries the three install steps. */
  install?: boolean;
};

export function Footer({ closing = true, install = false }: FooterProps) {
  const copy = getLaunchCopy(LAUNCH_STATE);
  const year = new Date().getFullYear();

  return (
    <>
      {closing && <ClosingBand install={install} />}
      <footer className="relative bg-white px-5 sm:px-6 pt-8 pb-10">
      <div className="relative max-w-6xl mx-auto rounded-[28px] bg-white border-2 border-ink px-6 sm:px-12 pt-12 pb-8">
        <WashiTape className="-top-4 left-6 sm:left-10 w-24 h-10" rotate={-8} />
        <WashiTape className="-bottom-4 right-6 sm:right-10 w-24 h-10" rotate={8} />

        <div className="flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 1, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            /* Stack vertically up to medium viewports; only flip to side-
               by-side at lg+ (1024px). Between sm and md the text column
               was getting squeezed to ~230px by the CTA's min-w-[320px],
               producing ugly 1-to-3-word-per-line wraps. lg+ has enough
               room (~960px inner minus 320px CTA = 640px paragraph). */
            className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10"
          >
            {/* The card CTA lives in the closing band above the footer
                now, so this line is the footer's own quiet sign-off. */}
            <p
              className="font-display font-semibold text-2xl sm:text-3xl leading-snug text-ink lg:flex-1 lg:max-w-2xl"
              style={{
                hyphens: 'manual',
                WebkitHyphens: 'manual',
                MozHyphens: 'manual',
              }}
            >
              {copy.footerMicro}
            </p>
          </motion.div>

          {/* Four-column grid on desktop: Ronki (product), Mitmachen
              (community hub — Gründungs-Familien, Discord, install),
              Entdecken (browsing content), Rechtliches + Mehr. On
              tablet collapses to 2 cols, on mobile to 1. */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* ── Ronki (product understanding) ────────── */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-cobalt mb-4 font-display font-bold">
                Ronki
              </p>
              <nav aria-label="Ronki" className="flex flex-col gap-2 text-sm">
                <Link to="/" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Start
                </Link>
                <Link to="/wie-es-funktioniert" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Wie es funktioniert
                </Link>
                <Link to="/fuer-eltern" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Für Eltern
                </Link>
                <Link to="/wissenschaft" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Wissenschaft
                </Link>
                <Link to="/faq" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Häufige Fragen
                </Link>
              </nav>
            </div>

            {/* ── Mitmachen (community hub) ─────────────── */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-cobalt mb-4 font-display font-bold">
                Mitmachen
              </p>
              <nav aria-label="Mitmachen" className="flex flex-col gap-2 text-sm">
                <Link
                  to="/mitmachen"
                  onClick={() => trackEvent('Mitmachen Click', { source: 'footer' })}
                  className="text-ink hover:text-sage transition-colors w-fit py-2.5 font-display font-semibold"
                >
                  Gründungs-Familien
                </Link>
                <a
                  href="https://discord.gg/e8yns9A4X"
                  onClick={() => trackEvent('Discord Click', { source: 'footer' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5 inline-flex items-center gap-1.5"
                >
                  Discord-Community
                  <span aria-hidden className="text-sage/70 text-[10px] leading-none">↗</span>
                </a>
                <Link to="/installieren" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Ronki installieren
                </Link>
                <a
                  href="mailto:hallo@ronki.de"
                  className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5"
                >
                  hallo@ronki.de
                </a>
              </nav>
            </div>

            {/* ── Entdecken (content) ───────────────────── */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-cobalt mb-4 font-display font-bold">
                Entdecken
              </p>
              <nav aria-label="Entdecken" className="flex flex-col gap-2 text-sm">
                <Link to="/ratgeber" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Ratgeber
                </Link>
                <Link to="/vorlagen" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Vorlagen zum Ausdrucken
                </Link>
                <Link to="/drachen-sammelkarten" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Drachen-Sammelkarten
                </Link>
                <a
                  href="https://app.ronki.de/?compendium=1"
                  onClick={() => trackEvent('Compendium Click', { source: 'footer' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5 inline-flex items-center gap-1.5"
                >
                  Drachen-Compendium
                  <span aria-hidden className="text-teal/50 text-[10px] leading-none">↗</span>
                </a>
              </nav>
            </div>

            {/* ── Rechtliches + Mehr ────────────────────── */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-cobalt mb-4 font-display font-bold">
                Rechtliches &amp; Mehr
              </p>
              <nav aria-label="Rechtliches und Mehr" className="flex flex-col gap-2 text-sm">
                <Link to="/impressum" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Impressum
                </Link>
                <Link to="/datenschutz" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  Datenschutz
                </Link>
                <Link to="/agb" className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5">
                  AGB
                </Link>
                <a
                  href="https://ko-fi.com/ronkiapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5 inline-flex items-center gap-1.5"
                >
                  <span aria-hidden>🍨</span> Louis ein Eis ausgeben
                  <span aria-hidden className="text-teal/50 text-[10px] leading-none">↗</span>
                </a>
                <Link
                  to="/en"
                  className="text-ink/85 hover:text-cobalt transition-colors w-fit py-2.5 inline-flex items-center gap-1.5"
                >
                  <span aria-hidden>🇬🇧</span> English version
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-8 border-t-2 border-ink/15">
            <RonkiWordmark size={56} tone="cobalt" />
            <p className="text-xs text-ink/75">
              © {year} Ronki · Ein unabhängiges Projekt · Keine Werbepartner, keine Cookies.
            </p>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}
