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
 *
 * This is the one action card on a template page, so it carries the
 * inverted cobalt block from the Bilderbuch specimen: white input, white
 * boxes with a cobalt check, white pill with ink text.
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

/** Cobalt tick drawn on the white box. Same path as the specimen's check. */
const CHECK_MARK =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path d='M10 34 C 16 40 21 45 26 50 C 34 36 44 24 55 14' fill='none' stroke='%230544B0' stroke-width='9' stroke-linecap='round' stroke-linejoin='round'/></svg>\")";

const BOX_CLASS =
  'mt-0.5 h-7 w-7 shrink-0 cursor-pointer appearance-none rounded-lg border-[2.5px] border-white bg-white bg-[length:22px_22px] bg-center bg-no-repeat';

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
      className="scroll-mt-24 rounded-[28px] border-[3px] border-cobalt bg-cobalt p-6 sm:p-8 text-white"
    >
      <p className="bb-hand text-2xl uppercase text-sun leading-none mb-2">
        Als PDF zum Ausdrucken
      </p>
      <h2
        id={`${emailId}-heading`}
        className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight"
      >
        {title} als fertiges PDF
      </h2>

      {status.kind === 'done' ? (
        <div className="mt-4">
          <p role="status" className="text-base text-white/90 leading-relaxed">
            {status.alreadyKnown
              ? 'Dich kennen wir schon. Hier ist die Vorlage.'
              : 'Fertig. Hier ist die Vorlage.'}
          </p>
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bb-press mt-4 inline-flex items-center gap-3 rounded-full bg-sun px-6 py-3.5 text-ink font-display font-bold text-base"
          >
            {title} als PDF öffnen
            <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4">
              <use href="#bb-arrow" />
            </svg>
          </a>
          <p className="mt-4 text-sm text-white/90 leading-relaxed">
            Das PDF öffnet sich direkt. Wir schicken dir erst dann Mails, wenn es wirklich
            Neues gibt.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
          <p className="text-sm text-white/90 leading-relaxed">
            Eine Seite A4, zum Aufhängen an den Kühlschrank. Trag deine E-Mail ein, dann
            öffnen wir dir das PDF.
          </p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={emailId}
              className="text-xs uppercase tracking-[0.1em] text-white font-display font-bold"
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
              className="w-full rounded-full border-[2.5px] border-white bg-white px-5 py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id={consentId}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className={BOX_CLASS}
              style={consent ? { backgroundImage: CHECK_MARK } : undefined}
            />
            <label htmlFor={consentId} className="text-sm text-white/90 leading-relaxed">
              Ich bin einverstanden, dass Ronki meine E-Mail-Adresse speichert, um mir die
              Vorlage bereitzustellen. Details in der{' '}
              <Link
                to="/datenschutz#vorlagen"
                className="text-white underline decoration-sun decoration-2 underline-offset-4"
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
              className={BOX_CLASS}
              style={wantsUpdates ? { backgroundImage: CHECK_MARK } : undefined}
            />
            <label htmlFor={updatesId} className="text-sm text-white/90 leading-relaxed">
              Optional: Ja, informiert mich gelegentlich über Neues bei Ronki (höchstens
              einmal im Monat, jederzeit abbestellbar per Mail an{' '}
              <a
                href="mailto:hallo@ronki.de"
                className="text-white underline decoration-sun decoration-2 underline-offset-4"
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
            className="bb-press self-start inline-flex items-center gap-3 rounded-full bg-sun px-6 py-3.5 text-ink font-display font-bold text-base disabled:bg-white/15 disabled:text-white/70 disabled:cursor-not-allowed"
          >
            {status.kind === 'submitting' ? '…' : 'PDF öffnen'}
            <svg aria-hidden viewBox="0 0 64 64" className="h-4 w-4">
              <use href="#bb-arrow" />
            </svg>
          </button>

          {status.kind === 'invalid' && (
            <p role="alert" className="text-sm font-medium text-sun">
              Bitte gib eine gültige E-Mail-Adresse ein.
            </p>
          )}
          {status.kind === 'error' && (
            <p role="alert" className="text-sm font-medium text-sun">
              Verbindung zum Server fehlt. Versuch es gleich nochmal oder druck die Seite
              direkt.
            </p>
          )}
        </form>
      )}

      <svg
        aria-hidden
        viewBox="0 0 600 6"
        preserveAspectRatio="none"
        className="mt-6 h-1.5 w-full text-white opacity-60"
      >
        <use href="#bb-dash" />
      </svg>

      <p className="mt-4 text-sm text-white/90 leading-relaxed">
        Ohne E-Mail:{' '}
        <Link
          to={printHref}
          onClick={() => trackEvent('Vorlage Download', { vorlage: source, weg: 'druck' })}
          className="text-white underline decoration-sun decoration-2 underline-offset-4"
        >
          Diese Seite ist selbst schon druckbar
        </Link>
        . Strg+P genügt.
      </p>
    </section>
  );
}
