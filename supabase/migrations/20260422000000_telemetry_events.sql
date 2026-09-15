-- Kid-safe telemetry events table for the Ronki PWA.
-- Applied via mcp__supabase__apply_migration on 22 Apr 2026.
--
-- Privacy-first schema: no auth.user_id link, device_id is an anonymous UUID v4
-- rotated annually. RLS allows INSERT only; SELECT is deliberately restricted
-- to service_role so the product team queries via Studio.

CREATE TABLE public.telemetry_events (
  id bigserial primary key,
  device_id text not null,
  name text not null,
  props jsonb default '{}'::jsonb,
  ts timestamptz default now(),
  app_version text
);

CREATE INDEX idx_telemetry_events_device_ts ON public.telemetry_events(device_id, ts DESC);
CREATE INDEX idx_telemetry_events_name_ts ON public.telemetry_events(name, ts DESC);

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert their events"
  ON public.telemetry_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- SELECT deliberately restricted to service_role; product team queries via Studio.
