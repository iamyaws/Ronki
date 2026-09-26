-- Ronki: close the Supabase security advisor findings (26 Sep 2026).
--
-- get_advisors(security) on 26 Sep 2026 listed one ERROR and a set of WARNs
-- that predate the profiles_cas migration. This file fixes the ones nothing
-- needs and leaves alone everything the website, the keep-alive job or the
-- card calls with the public key. Callers were checked on every branch of
-- the repo (src/, website/, scripts/, .github/, supabase/).
--
-- Changed:
--   app_eval_counts        The view now runs with the caller's rights
--                          (security_invoker). Anon and authenticated already
--                          read every app_evals row through the policy
--                          "anyone_can_read_evals", so the count the website's
--                          App-Check shows (website/src/lib/app-check/storage.ts)
--                          does not change. Grants trimmed to select, which is
--                          all the website does and what the baseline intended.
--   notify_feedback_email  Trigger helper (on_feedback_insert_notify). Postgres
--                          checks EXECUTE when a trigger is created, not when
--                          it fires, so the feedback email keeps going out.
--   rls_auto_enable        Event trigger helper (ensure_rls). Same reasoning.
--   profiles_count,        Read only by the decision gates in the SQL editor
--   profiles_active_count  as owner (docs/prd/RONKI-V2-PRD.md section 12) and
--                          probed by scripts/supabase-smoke.mjs, which now
--                          expects the public key to be refused.
--
-- Kept callable with the public key on purpose:
--   waitlist_count, update_waitlist_screener   website waitlist form
--   leads_count                                daily keep-alive job
--                                              (.github/workflows/supabase-keepalive.yml)
--   profile_get, profile_upsert, profile_upsert_if, profile_delete
--                                              the card; the 32-hex token is
--                                              the credential
-- These stay open to authenticated too: supabase-js sends a stored session
-- JWT when one exists, so a device still signed in from the old prototype
-- login calls them as authenticated, not anon.
--
-- Idempotent. Safe to run twice.

alter view public.app_eval_counts set (security_invoker = true);

revoke all on public.app_eval_counts from anon, authenticated;
grant select on public.app_eval_counts to anon, authenticated;

revoke execute on function public.notify_feedback_email() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

revoke execute on function public.profiles_count() from public, anon, authenticated;
revoke execute on function public.profiles_active_count(integer, timestamptz) from public, anon, authenticated;
