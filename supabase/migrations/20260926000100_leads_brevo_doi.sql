-- Double opt-in for template leads through Brevo (drafted 25 Sep 2026, NOT applied).
--
-- When a parent ticks the second, optional box on a template page
-- (leads.wants_updates = true), Brevo sends a confirmation mail. Only after
-- the click in that mail is the address on the "Ronki Updates" list. No mail
-- goes to anyone who has not confirmed.
--
-- Setup order (see docs/superpowers/plans/2026-09-25-foundation-and-launch.md, Task 8):
--   1. Marc creates the Brevo account, authenticates ronki.de (DKIM at GoDaddy;
--      DMARC on ronki.de is p=quarantine) and puts the API key into .env.local.
--   2. node scripts/brevo-setup.mjs creates the list and the DOI template and
--      prints their ids.
--   3. Marc stores the key in Vault in the SQL editor (the key never passes
--      through chat):  select vault.create_secret('<key>', 'brevo_api_key');
--      The two ids are not secret:  select vault.create_secret('<id>', 'brevo_list_id');
--                                   select vault.create_secret('<id>', 'brevo_doi_template_id');
--   4. Apply this file. Until all three secrets exist the trigger stores the
--      lead and sends nothing.
--
-- Idempotent. Safe to run twice.

alter table public.leads add column if not exists brevo_requested_at timestamptz;
comment on column public.leads.brevo_requested_at is 'When the double opt-in request went to Brevo. Null: never requested.';

create or replace function public.leads_brevo_doi()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $fn$
declare
  v_key text;
  v_list text;
  v_template text;
begin
  if not new.wants_updates then
    return new;
  end if;

  -- One confirmation mail per address, whichever template the parent came from.
  if exists (
    select 1 from public.leads
    where lower(email) = lower(new.email)
      and id <> new.id
      and brevo_requested_at is not null
  ) then
    return new;
  end if;

  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'brevo_api_key' limit 1;
  select decrypted_secret into v_list from vault.decrypted_secrets where name = 'brevo_list_id' limit 1;
  select decrypted_secret into v_template from vault.decrypted_secrets where name = 'brevo_doi_template_id' limit 1;
  if v_key is null or v_list is null or v_template is null then
    return new; -- not set up yet: keep the lead, send nothing
  end if;

  -- Async: pg_net sends after the transaction commits; a rolled back insert sends nothing.
  perform net.http_post(
    url := 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation',
    headers := jsonb_build_object(
      'api-key', v_key,
      'Content-Type', 'application/json',
      'accept', 'application/json'
    ),
    body := jsonb_build_object(
      'email', new.email,
      'includeListIds', jsonb_build_array(v_list::bigint),
      'templateId', v_template::bigint,
      'redirectionUrl', 'https://www.ronki.de/bestaetigt'
    ),
    timeout_milliseconds := 5000
  );

  update public.leads set brevo_requested_at = now() where id = new.id;
  return new;
exception when others then
  -- Never block the lead because the mail request failed.
  raise warning 'leads_brevo_doi failed: %', sqlerrm;
  return new;
end;
$fn$;

revoke all on function public.leads_brevo_doi() from public, anon, authenticated;

drop trigger if exists leads_brevo_doi on public.leads;
create trigger leads_brevo_doi
  after insert on public.leads
  for each row execute function public.leads_brevo_doi();
