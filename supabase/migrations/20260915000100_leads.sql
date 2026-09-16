-- Ronki leads: parent email capture on the Vorlagen download pages.
--
-- Funnel gate for the revival check (docs/strategy/2026-09-14-wiederbelebungs-check.md):
-- the templates rank close to page 1 but there is no download behind them.
-- A lead row is one parent asking for one template.
--
-- Privacy: parent email only, no child data, no names. Consent is required
-- by a CHECK constraint, and the consent wording that was on screen is stored
-- alongside it so we can prove what the parent agreed to.
--
-- Idempotent. Safe to run twice.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  source text not null,
  consent boolean not null default false,
  consent_text text,
  wants_updates boolean not null default false,
  locale text not null default 'de'
);

-- Column guards, in case a partial table already exists. Only columns with
-- a default are guarded this way; email and source are part of the create
-- above and must stay not null.
alter table public.leads add column if not exists created_at timestamptz not null default now();
alter table public.leads add column if not exists consent boolean not null default false;
alter table public.leads add column if not exists consent_text text;
alter table public.leads add column if not exists wants_updates boolean not null default false;
alter table public.leads add column if not exists locale text not null default 'de';

-- CHECK constraints. Postgres has no "add constraint if not exists",
-- so each one is guarded by a lookup in pg_constraint.
do $do$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.leads'::regclass and conname = 'leads_email_format'
  ) then
    alter table public.leads
      add constraint leads_email_format
      check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.leads'::regclass and conname = 'leads_email_length'
  ) then
    alter table public.leads
      add constraint leads_email_length
      check (char_length(email) <= 254);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.leads'::regclass and conname = 'leads_source_allowed'
  ) then
    alter table public.leads
      add constraint leads_source_allowed
      check (source in (
        'vorlage-morgen',
        'vorlage-abend',
        'vorlage-kleine-geschwister',
        'vorlage-adhs'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.leads'::regclass and conname = 'leads_consent_required'
  ) then
    alter table public.leads
      add constraint leads_consent_required
      check (consent = true);
  end if;
end
$do$;

-- One row per parent per template. A repeat download is not a new lead.
create unique index if not exists leads_email_source_idx
  on public.leads (email, source);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Anon may insert and nothing else. The CHECK constraints above do the
-- validation, so the policy itself stays open on purpose.
drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- No select, update or delete policy for anon. RLS denies those by default.
revoke all on public.leads from anon;
grant insert on public.leads to anon;

comment on table public.leads is 'Ronki template download leads. Parent emails only, consent required.';
comment on column public.leads.source is 'Which template page the parent came from.';
comment on column public.leads.consent_text is 'The consent wording shown on screen at the time of signup.';
comment on column public.leads.wants_updates is 'Second, optional checkbox: the parent wants occasional update mails.';

-- Public counter for the funnel gate. Counts a parent once, whether they
-- arrived through a template download or the waitlist.
create or replace function public.leads_count()
returns integer
language sql
security definer
set search_path = public
as $fn$
  select count(*)::integer from (
    select lower(email) as email from public.leads
    union
    select lower(email) as email from public.waitlist
  ) combined;
$fn$;

revoke all on function public.leads_count() from public;
grant execute on function public.leads_count() to anon, authenticated;
