/**
 * /tools/app-check/r/:id — read-only permalink view of a saved evaluation.
 *
 * Renders the same score band visual as the live tool, plus share buttons
 * and the saved-page disclaimer (which makes the third-party-reading
 * framing explicit: "this is one parent's view, not Ronki's").
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { ResultScore } from '../../components/AppCheck/ResultScore';
import { ShareButtons } from '../../components/AppCheck/ShareButtons';
import { ToolDisclaimer } from '../../components/AppCheck/ToolDisclaimer';
import { ArrowRight } from '../../components/AppCheck/Icons';
import { fetchEval, type FetchedEval } from '../../lib/app-check/storage';
import { EASE_OUT } from '../../lib/motion';

export default function AppCheckResult() {
  const reduced = useReducedMotion();
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<
    | { phase: 'loading' }
    | { phase: 'found'; data: FetchedEval }
    | { phase: 'not-found' }
  >({ phase: 'loading' });

  useEffect(() => {
    if (!id) {
      setState({ phase: 'not-found' });
      return;
    }
    let cancelled = false;
    fetchEval(id).then((data) => {
      if (cancelled) return;
      setState(data ? { phase: 'found', data } : { phase: 'not-found' });
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <PainterlyShell>
      <PageMeta
        title={
          state.phase === 'found'
            ? `App-Check: ${state.data.appName}`
            : 'App-Check Bewertung'
        }
        description="Eine Eltern-Bewertung der App-Pattern, gespeichert über das Ronki App-Check Werkzeug."
        canonicalPath={`/tools/app-check/r/${id ?? ''}`}
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/tools/app-check"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink focus:outline-none focus-visible:text-ink focus-visible:underline underline-offset-4 transition-colors mb-8"
          >
            <span aria-hidden>←</span> Eigenen App-Check starten
          </Link>

          {state.phase === 'loading' && (
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="space-y-3"
            >
              <div
                aria-hidden
                className="h-8 w-44 rounded-md bg-cream/70 animate-pulse"
              />
              <div
                aria-hidden
                className="h-4 w-72 rounded-md bg-cream/60 animate-pulse"
              />
              <span className="sr-only">Lade Bewertung…</span>
            </motion.div>
          )}

          {state.phase === 'not-found' && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="space-y-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
                Hier war mal eine Bewertung
              </p>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
                Den Link <em className="italic text-sage">finden wir nicht</em>.
              </h1>
              <p className="text-base text-ink/75 max-w-prose leading-relaxed">
                Vielleicht hat ihn jemand verkürzt oder abgeschnitten. Vielleicht
                wurde die Bewertung auf Wunsch entfernt. So oder so: dein eigener
                App-Check ist drei Minuten weit weg.
              </p>
              <Link
                to="/tools/app-check"
                className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all"
              >
                Eigenen App-Check starten
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          )}

          {state.phase === 'found' && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="space-y-10"
            >
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-4">
                  Gespeicherte Bewertung
                </p>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
                  Eine <em className="italic text-sage">Eltern-Bewertung</em>.
                </h1>
              </header>

              <ResultScore
                appName={state.data.appName}
                answers={state.data.answers}
                score={state.data.score}
              />

              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl text-ink">
                  Diesen Permalink teilen
                </h2>
                <ShareButtons
                  appName={state.data.appName}
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                />
              </div>

              <ToolDisclaimer variant="saved" />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
