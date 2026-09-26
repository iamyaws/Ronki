-- Ronki profiles: compare-and-swap writes (26 Sep 2026, Finch pass follow-up).
--
-- Until now every write replaced the whole row (profile_upsert), so two
-- devices on one card were last-writer-wins: a parent phone and the child's
-- tablet saving within seconds could erase each other's progress. This
-- migration gives every row a revision number and adds profile_upsert_if,
-- which writes only while the row still has the revision the caller last
-- saw. On a mismatch nothing is written and the current row comes back, so
-- the app can merge both devices' progress and try again.
--
-- Backward compatible: profile_get and profile_upsert keep their names and
-- arguments. profile_get additionally returns rev; profile_upsert (still
-- used by the website card form and by older app bundles) bumps rev too, so
-- a compare-and-swap writer always notices it.
--
-- Idempotent. Safe to run twice.

alter table public.profiles add column if not exists rev bigint not null default 0;

comment on column public.profiles.rev is 'Write revision. Every write adds 1. profile_upsert_if writes only when it matches the caller''s expected value.';

-- Read one profile by its token. Returns null when there is no such row.
create or replace function public.profile_get(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_state jsonb;
  v_updated_at timestamptz;
  v_rev bigint;
begin
  select state, updated_at, rev
    into v_state, v_updated_at, v_rev
    from public.profiles
   where token = p_token;

  if not found then
    return null;
  end if;

  return jsonb_build_object('state', v_state, 'updated_at', v_updated_at, 'rev', v_rev);
end;
$fn$;

-- Unconditional write, kept for the website and older app bundles. Now also
-- bumps rev, so compare-and-swap writers see that the row changed.
create or replace function public.profile_upsert(p_token text, p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_updated_at timestamptz;
  v_rev bigint;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    raise exception 'invalid token';
  end if;

  insert into public.profiles as p (token, state, updated_at, rev)
  values (p_token, coalesce(p_state, '{}'::jsonb), now(), 1)
  on conflict (token) do update
    set state = excluded.state,
        updated_at = now(),
        rev = p.rev + 1
  returning p.updated_at, p.rev into v_updated_at, v_rev;

  insert into public.profile_activity (token, day)
  values (p_token, current_date)
  on conflict do nothing;

  return jsonb_build_object('updated_at', v_updated_at, 'rev', v_rev);
end;
$fn$;

-- Compare-and-swap write.
--   p_expected_rev null: insert only if the card has no row yet.
--   p_expected_rev n:    update only if the row's rev is still n.
-- Success: { ok: true, rev, updated_at }.
-- Mismatch: nothing written; { ok: false, rev, updated_at, state } with the
-- current row (rev and state null when the row is gone), so the caller can
-- merge and retry with the new rev. The update is a single statement, so two
-- writers with the same expected rev can never both succeed.
create or replace function public.profile_upsert_if(p_token text, p_state jsonb, p_expected_rev bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_rev bigint;
  v_updated_at timestamptz;
  v_state jsonb;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    raise exception 'invalid token';
  end if;

  if p_expected_rev is null then
    insert into public.profiles (token, state, updated_at, rev)
    values (p_token, coalesce(p_state, '{}'::jsonb), now(), 1)
    on conflict (token) do nothing
    returning rev, updated_at into v_rev, v_updated_at;
  else
    update public.profiles
       set state = coalesce(p_state, '{}'::jsonb),
           updated_at = now(),
           rev = rev + 1
     where token = p_token
       and rev = p_expected_rev
    returning rev, updated_at into v_rev, v_updated_at;
  end if;

  if found then
    insert into public.profile_activity (token, day)
    values (p_token, current_date)
    on conflict do nothing;
    return jsonb_build_object('ok', true, 'rev', v_rev, 'updated_at', v_updated_at);
  end if;

  select state, rev, updated_at
    into v_state, v_rev, v_updated_at
    from public.profiles
   where token = p_token;

  if not found then
    return jsonb_build_object('ok', false, 'rev', null, 'updated_at', null, 'state', null);
  end if;

  return jsonb_build_object('ok', false, 'rev', v_rev, 'updated_at', v_updated_at, 'state', v_state);
end;
$fn$;

revoke all on function public.profile_get(text) from public;
revoke all on function public.profile_upsert(text, jsonb) from public;
revoke all on function public.profile_upsert_if(text, jsonb, bigint) from public;

grant execute on function public.profile_get(text) to anon, authenticated;
grant execute on function public.profile_upsert(text, jsonb) to anon, authenticated;
grant execute on function public.profile_upsert_if(text, jsonb, bigint) to anon, authenticated;
