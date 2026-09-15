import { useId, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { submitLead, LeadSource } from '../lib/leads';
import { isValidEmail } from '../lib/waitlist';
import { trackEvent } from '../lib/analytics';

/**
 * Email gate in front of a template PDF.
 *
 * The honest version of a lead magnet: the sheet on this page stays free
 * and printable without giving us anything. The PDF is the convenient
 * version. Both routes are visible at the same time, the checkbox is not
 * pre-ticked, and there is no countdown, no "nur heute", no fake scarcity.
 */

/** Stored verbatim in leads.consent_text so we can prove what was agreed to. */
export const CONSENT_TEXT =
  'Ich bin einverstanden, dass Ronki meine E-Mail-Adresse speichert, um mir die Vorlage ' +
  'bereitzustellen. Details in der Datenschutzerklärung.';

/** Appended to consent_text only when the parent ticks the optional second box. */
export const UPDATES_TEXT =
  'Ja, informiert mich gelegentlich über Neues bei Ronki (höchstens einmal im Monat, ' +
  'jederzeit abbestellbar per Mail an hallo@ronki.de). Update-Mails verschicken wir noch ' +
  'nicht. Sobald wir anfangen, bekomme ich zuerst eine Bestätigungs-Mail.';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'done'; alreadyKnown: boolean }
  | { kind: 'invalid' }
  | { kind: 'error' };

interface Props {
  source: LeadSource;
  /** Public path of the generated PDF, e.g. "/vorlagen/morgenroutine.pdf". */
  pdfHref: string;
  /** Sheet name, used in the headline and the link label. */
  title: string;
  /** Route of the clean print page for the no-email path. */
  printHref: string;
}

export function VorlageDownload({ source, pdfHref, title, printHref }: Props) {
  const emailId = useId();
  const consentId = useId();
  const updatesId = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [wantsUpdates, setWantsUpdates] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const ready = consent && isValidEmail(email.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ready) return;

    setStatus({ kind: 'submitting' });
    const result = await submitLead({
      email,
      source,
      consent,
      consentText: wantsUpdates ? `${CONSENT_TEXT} ${UPDATES_TEXT}` : CONSENT_TEXT,
      wantsUpdates,
    });

    if (result.ok) {
      setStatus({ kind: 'done', alreadyKnown: !!result.alreadyKnown });
      return;
    }
    if (result.reason === 'invalid') setStatus({ kind: 'invalid' });
    else if (result.reason === 'consent') setStatus({ kind: 'idle' });
    else setStatus({ kind: 'error' });
  }

  return (
    <section
      id="pdf"
      aria-labelledby={`${emailId}-heading`}
      className="scroll-mt-24 rounded-2xl border border-teal/15 bg-white/70 p-6 sm:p-8"
      style={{ boxShadow: '0 10px 30px -18px rgba(45,90,94,0.3)' }}
    >
      <p className="text-[0.7rem] uppercase tracking-[0.2em] text-teal font-semibold mb-3">
        Als PDF zum Ausdrucken
      </p>
      <h2
        id={`${emailId}-heading`}
        className="font-display font-bold text-xl sm:text-2xl text-teal-dark leading-tight"
      >
        {title} als fertiges PDF
      </h2>

      {status.kind === 'done' ? (
        <div className="mt-4">
          <p role="status" className="text-base text-teal-dark leading-relaxed">
            {status.alreadyKnown
              ? 'Dich kennen wir schon. Hier ist die Vorlage.'
              : 'Fertig. Hier ist die Vorlage.'}
          </p>
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3.5 text-cream font-display font-bold text-sm shadow-sm hover:shadow-md hover:bg-teal transition-all"
          >
            {title} als PDF öffnen
            <span aria-hidden>→</span>
          </a>
          <p className="mt-4 text-sm text-ink/65 leading-relaxed">
            Das PDF öffnet sich direkt. Wir schicken dir erst dann Mails, wenn es wirklich
            Neues gibt.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
          <p className="text-sm text-ink/70 leading-relaxed">
            Eine Seite A4, zum Aufhängen an den Kühlschrank. Trag deine E-Mail ein, dann
            öffnen wir dir das PDF.
          </p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={emailId}
              className="text-xs uppercase tracking-[0.15em] text-teal-dark/60 font-semibold"
            >
              E-Mail
            </label>
            <input
              id={emailId}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="w-full rounded-xl border-2 border-teal/25 bg-cream px-4 py-3 text-base text-teal-dark placeholder:text-teal-dark/35 focus:border-teal focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id={consentId}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-teal/40 accent-teal"
            />
            <label htmlFor={consentId} className="text-sm text-ink/75 leading-relaxed">
              Ich bin einverstanden, dass Ronki meine E-Mail-Adresse speichert, um mir die
              Vorlage bereitzustellen. Details in der{' '}
              <Link
                to="/datenschutz#vorlagen"
                className="underline decoration-mustard underline-offset-4 hover:text-teal-dark"
              >
                Datenschutzerklärung
              </Link>
              .
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              id={updatesId}
              type="checkbox"
              checked={wantsUpdates}
              onChange={(e) => setWantsUpdates(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-teal/40 accent-teal"
            />
            <label htmlFor={updatesId} className="text-sm text-ink/60 leading-relaxed">
              Optional: Ja, informiert mich gelegentlich über Neues bei Ronki (höchstens
              einmal im Monat, jederzeit abbestellbar per Mail an{' '}
              <a
                href="mailto:hallo@ronki.de"
                className="underline decoration-mustard underline-offset-4"
              >
                hallo@ronki.de
              </a>
              ). Update-Mails verschicken wir noch nicht. Sobald wir anfangen, bekommst du
              zuerst eine Bestätigungs-Mail.
            </label>
          </div>

          <button
            type="submit"
            disabled={!ready || status.kind === 'submitting'}
            className="self-start inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3.5 text-cream font-display font-bold text-sm shadow-sm transition-all enabled:hover:shadow-md enabled:hover:bg-teal disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status.kind === 'submitting' ? '…' : 'PDF öffnen'}
          </button>

          {status.kind === 'invalid' && (
            <p role="alert" className="text-sm text-sage">
              Bitte gib eine gültige E-Mail-Adresse ein.
            </p>
          )}
          {status.kind === 'error' && (
            <p role="alert" className="text-sm text-sage">
              Verbindung zum Server fehlt. Versuch es gleich nochmal oder druck die Seite
              direkt.
            </p>
          )}
        </form>
      )}

      <p className="mt-6 border-t border-teal/10 pt-4 text-sm text-ink/65 leading-relaxed">
        Ohne E-Mail:{' '}
        <Link
          to={printHref}
          onClick={() => trackEvent('Vorlage Download', { vorlage: source, weg: 'druck' })}
          className="underline decoration-mustard underline-offset-4 hover:text-teal-dark"
        >
          Diese Seite ist selbst schon druckbar
        </Link>
        . Strg+P genügt.
      </p>
    </section>
  );
}
