import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitSiteFeedback } from '../lib/site-feedback';

type Props = {
  /** Page slug that produced the submission. Stored as the `source` column. */
  source: string;
  /** Optional override for the textarea label. */
  label?: string;
  /** Optional override for the textarea placeholder. */
  placeholder?: string;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'invalid-message' }
  | { kind: 'invalid-email' }
  | { kind: 'error' };

const DEFAULT_LABEL =
  'Was fehlt euch? Welche Frage haben wir nicht beantwortet?';

const DEFAULT_PLACEHOLDER =
  'Zum Beispiel: „Wie geht Ronki mit Geschwisterkindern um?" oder „Ich wünsche mir einen Artikel zu Hausaufgaben."';

export function FeedbackForm({ source, label, placeholder }: Props) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  /**
   * Honeypot field — invisible to humans, usually filled by naive bots.
   * If it ever has a value on submit, we fake a success state so the bot
   * thinks it won and doesn't adapt, and we skip the Supabase insert.
   */
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const trimmedMessage = message.trim();
  const canSubmit =
    trimmedMessage.length >= 4 &&
    trimmedMessage.length <= 4000 &&
    status.kind !== 'submitting';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // Honeypot: silently drop bot submissions with fake-success UI.
    if (website) {
      setStatus({ kind: 'success' });
      setMessage('');
      setEmail('');
      setWebsite('');
      return;
    }

    // Simple email sanity check if provided.
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus({ kind: 'invalid-email' });
      return;
    }

    setStatus({ kind: 'submitting' });
    const result = await submitSiteFeedback({
      message: trimmedMessage,
      email: trimmedEmail || null,
      source,
    });

    if (result.ok) {
      setStatus({ kind: 'success' });
      setMessage('');
      setEmail('');
    } else {
      setStatus({ kind: 'error' });
    }
  }

  if (status.kind === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border-2 border-mustard/40 bg-mustard/10 p-5 sm:p-6 shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.15em] font-display font-bold text-ink mb-2">
          Angekommen · Danke
        </p>
        <p className="font-display font-bold text-lg leading-tight text-ink mb-2">
          Wir lesen jede Nachricht.
        </p>
        <p className="text-sm text-ink/70 leading-relaxed">
          Wenn ihr eine E-Mail dagelassen habt, melden wir uns persönlich.
          Ansonsten fließt eure Frage in den nächsten Ratgeber-Artikel.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Honeypot — visually hidden, aria-hidden, not tab-reachable. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <label>
          Deine Website (bitte leer lassen)
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-display font-semibold text-ink">
          {label || DEFAULT_LABEL}
        </span>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (status.kind === 'invalid-message' || status.kind === 'error') {
              setStatus({ kind: 'idle' });
            }
          }}
          rows={4}
          maxLength={4000}
          placeholder={placeholder || DEFAULT_PLACEHOLDER}
          className="w-full rounded-2xl border border-teal/20 bg-cream/80 px-4 py-3 text-base text-ink/90 placeholder:text-ink/40 resize-y min-h-[112px] focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-colors"
          required
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-display font-medium text-ink/70">
          E-Mail (optional, nur falls ihr eine persönliche Antwort wollt)
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind === 'invalid-email') {
              setStatus({ kind: 'idle' });
            }
          }}
          placeholder="deine@email.de"
          className="w-full rounded-full border border-teal/20 bg-cream/80 px-5 py-2.5 text-sm text-ink/90 placeholder:text-ink/40 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-colors"
        />
      </label>

      <AnimatePresence>
        {(status.kind === 'invalid-email' || status.kind === 'error') && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-orange-700"
          >
            {status.kind === 'invalid-email'
              ? 'Die E-Mail-Adresse sieht nicht richtig aus. Bitte nochmal prüfen.'
              : 'Irgendwas ist schiefgelaufen. Versuch es noch mal, oder schreib an hallo@ronki.de.'}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-ink/50">
          {trimmedMessage.length === 0
            ? 'Ein Satz reicht. Wir lesen alles.'
            : `${trimmedMessage.length} Zeichen`}
        </p>
        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.02 } : undefined}
          whileTap={canSubmit ? { scale: 0.97 } : undefined}
          className="inline-flex items-center gap-2 rounded-full bg-cobalt px-5 py-2.5 text-white font-display font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform enabled:hover:-translate-y-0.5"
        >
          {status.kind === 'submitting' ? 'Sende…' : 'Absenden'}
          <span aria-hidden>→</span>
        </motion.button>
      </div>
    </form>
  );
}
