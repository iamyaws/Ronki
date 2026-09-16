import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { submitWaitlistEmail, isValidEmail } from '../lib/waitlist';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { getLaunchCopy, LaunchState } from '../config/launch-state';
import { Confetti } from './primitives/Confetti';
import { WaitlistScreener } from './WaitlistScreener';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'duplicate' }
  | { kind: 'invalid' }
  | { kind: 'error' };

type Props = {
  launchState: LaunchState;
  appUrl?: string;
  /** Set to true when the CTA is rendered on a dark background (hero,
   *  dark-teal callout). Swaps the button to mustard-on-teal-dark for
   *  proper contrast, the default teal-on-teal-dark is unreadable. */
  onDarkBackground?: boolean;
};

export function WaitlistCTA({ launchState, appUrl, onDarkBackground }: Props) {
  const copy = getLaunchCopy(launchState);
  // Route by the copy's declared action rather than the state name ,
  // that way any future 'install'-action state (live, public-alpha,
  // etc.) gets the direct-link button automatically, and waitlist-
  // action states (waitlist, beta) get the email form.
  const resolvedAppUrl = appUrl ?? copy.appUrl ?? '/app';

  if (copy.ctaAction === 'install') {
    const btnBg = onDarkBackground
      ? 'bg-mustard text-teal-dark hover:bg-mustard-soft'
      : 'bg-teal text-cream';
    const helperColor = onDarkBackground ? 'text-cream/80' : 'opacity-70';
    // Parents create the card on the website first; the app is a kid
    // space that only scans. So the primary action is the card, the app
    // link stays for families that already have one.
    const cardLinkClass = onDarkBackground ? 'text-cream/80 hover:text-cream' : 'text-teal-dark/70 hover:text-teal-dark';
    return (
      <div className="flex flex-col items-start gap-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/profil-erstellen"
            onClick={() => trackEvent('CTA Klick', { cta: 'karte', source: 'cta_block' })}
            className={`group relative inline-flex items-center gap-3 rounded-full px-8 py-4 font-display font-semibold text-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${btnBg}`}
          >
            <span className="relative z-10">Karte für euer Kind erstellen</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
        <p
          className={`text-sm ${helperColor}`}
          style={{
            hyphens: 'manual',
            WebkitHyphens: 'manual',
            MozHyphens: 'manual',
          }}
        >
          Eltern erstellen die Karte in einer Minute, das Kind scannt sie in der App. Kostenlos, frühe Version.
        </p>
        <a
          href={resolvedAppUrl}
          onClick={() => trackEvent('CTA Klick', { cta: 'app', source: 'cta_block' })}
          className={`text-sm underline underline-offset-4 ${cardLinkClass}`}
        >
          Schon eine Karte? App öffnen
        </a>
      </div>
    );
  }

  return <WaitlistForm copy={copy} />;
}

function WaitlistForm({ copy }: { copy: ReturnType<typeof getLaunchCopy> }) {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [screenerDismissed, setScreenerDismissed] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.rpc('waitlist_count').then(({ data, error }) => {
      if (!error && typeof data === 'number' && data > 0) {
        setWaitlistCount(data);
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setStatus({ kind: 'invalid' });
      return;
    }

    setStatus({ kind: 'submitting' });
    const result = await submitWaitlistEmail(email);
    if (result.ok) {
      setSubmittedEmail(email.trim().toLowerCase());
      setStatus({ kind: 'success' });
      setEmail('');
      return;
    }
    if (result.reason === 'invalid') setStatus({ kind: 'invalid' });
    else if (result.reason === 'duplicate') setStatus({ kind: 'duplicate' });
    else setStatus({ kind: 'error' });
  }

  if (status.kind === 'success') {
    return (
      <div className="relative w-full max-w-md">
        <Confetti active />
        <motion.p
          role="status"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-display font-semibold py-4"
        >
          Du bist dabei. Wir melden uns, wenn es für euch losgeht.
        </motion.p>
        {waitlistCount !== null && waitlistCount > 1 && (
          <p className="text-[0.65rem] opacity-40 mb-2">
            Du bist einer von {waitlistCount}.
          </p>
        )}
        {submittedEmail && !screenerDismissed && (
          <WaitlistScreener
            email={submittedEmail}
            onComplete={() => setScreenerDismissed(true)}
            onSkip={() => setScreenerDismissed(true)}
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md" noValidate>
      <div
        className={`relative flex items-center rounded-full border-2 transition-all duration-300 bg-cream ${
          focused ? 'border-teal shadow-md' : 'border-teal/25'
        }`}
      >
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="deine@email.de"
          aria-label="E-Mail"
          className="flex-1 bg-transparent pl-6 pr-2 py-3.5 text-base text-teal-dark placeholder:text-teal-dark/35 focus:outline-none"
          required
        />
        <motion.button
          type="submit"
          disabled={status.kind === 'submitting'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="group relative m-1 inline-flex shrink-0 items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-cream font-display font-semibold text-sm whitespace-nowrap [hyphens:none] disabled:opacity-50 shadow-sm hover:shadow-md transition-shadow"
        >
          {status.kind === 'submitting' ? '…' : copy.ctaLabel}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </motion.button>
      </div>
      <p className="text-xs opacity-60 pl-6">{copy.ctaHelper}</p>
      {waitlistCount !== null && waitlistCount > 1 && (
        <p className="text-[0.65rem] text-center opacity-35">
          {waitlistCount} Eltern auf der Warteliste.
        </p>
      )}
      <p className="mt-1 text-[0.65rem] text-center opacity-40">
        Mit dem Absenden stimmst du der{' '}
        <a href="/datenschutz" className="underline hover:opacity-70">Datenschutzerklärung</a> zu.
      </p>
      <AnimatePresence>
        {status.kind === 'invalid' && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-sage pl-6"
          >
            Bitte gib eine gültige E-Mail-Adresse ein.
          </motion.p>
        )}
        {status.kind === 'duplicate' && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-sage pl-6"
          >
            Du stehst schon auf der Liste. Wir melden uns am Start-Tag.
          </motion.p>
        )}
        {status.kind === 'error' && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-sage pl-6"
          >
            Das hat leider nicht geklappt. Bitte versuch es gleich noch mal.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
