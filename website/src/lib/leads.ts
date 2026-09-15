import { supabase } from './supabase';
import { isValidEmail } from './waitlist';
import { trackEvent } from './analytics';

/**
 * Template download leads.
 *
 * A lead row is one parent asking for one template PDF. The table is
 * insert-only for anon (see supabase/migrations/20260915000100_leads.sql):
 *
 *   leads(id, created_at, email, source, consent, consent_text, locale)
 *   CHECK source in ('vorlage-morgen','vorlage-abend',
 *                    'vorlage-kleine-geschwister','vorlage-adhs')
 *   CHECK consent = true
 *   UNIQUE (email, source)
 *
 * The unique index is not an error case for the parent. If the same family
 * comes back a month later and wants the sheet again, they get the sheet
 * again. We just do not store a second row.
 */

export type LeadSource =
  | 'vorlage-morgen'
  | 'vorlage-abend'
  | 'vorlage-kleine-geschwister'
  | 'vorlage-adhs';

export interface LeadSubmission {
  email: string;
  source: LeadSource;
  /** Must be true. The database rejects anything else. */
  consent: boolean;
  /** The exact wording that stood next to the checkbox on screen. */
  consentText: string;
  locale?: 'de' | 'en';
}

export type LeadResult =
  | { ok: true; alreadyKnown?: boolean }
  | { ok: false; reason: 'invalid' | 'consent' | 'error' };

export async function submitLead({
  email: rawEmail,
  source,
  consent,
  consentText,
  locale = 'de',
}: LeadSubmission): Promise<LeadResult> {
  const email = rawEmail.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { ok: false, reason: 'invalid' };
  }
  if (!consent) {
    return { ok: false, reason: 'consent' };
  }

  if (!supabase) {
    console.warn('Supabase not configured, lead submission skipped.');
    return { ok: false, reason: 'error' };
  }

  const { error } = await supabase.from('leads').insert({
    email,
    source,
    consent: true,
    consent_text: consentText,
    locale,
  });

  if (!error) {
    trackEvent('Vorlage Download', { vorlage: source });
    return { ok: true };
  }

  // 23505 = unique_violation. This parent already has this template.
  if (error.code === '23505') {
    trackEvent('Vorlage Download', { vorlage: source });
    return { ok: true, alreadyKnown: true };
  }

  console.error('leads insert failed', error);
  return { ok: false, reason: 'error' };
}
