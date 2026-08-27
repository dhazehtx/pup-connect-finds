-- =============================================================================
-- system_logs — server-side structured log sink (Category: ops/monitoring)
-- =============================================================================
-- server/services/loggingService.ts writes structured logs via
-- db.insert(systemLogs) (Drizzle, shared/schema.ts `systemLogs`), but the table
-- was never created in production, so every persisted log is silently dropped
-- ("Failed to log to database: relation system_logs does not exist" — caught and
-- non-fatal). Creating it gives the admin log viewer + error tracking a backing
-- store for launch. Columns mirror the Drizzle definition EXACTLY to avoid drift.
--
-- Written ONLY by the Express server over its owner-role connection; never by the
-- browser. RLS ENABLED with NO anon/authenticated policy (default deny) + grant
-- revoke — same server-only pattern as 20260824000001 / 20260824000003 /
-- 20260824000004. The owner role bypasses RLS, so server logging works.
--
-- Additive, idempotent, deletes no data.
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr). NOT applied
-- during the pre-launch audit sprint — prepared as a reviewed candidate only.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.system_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id        text NOT NULL UNIQUE,             -- app-generated unique id per entry
  level         text NOT NULL,                    -- debug | info | warn | error | critical
  category      text NOT NULL,                    -- api | frontend | auth | payment | database | ...
  message       text NOT NULL,
  details       jsonb,
  user_id       uuid REFERENCES public.profiles(id),
  session_id    text,
  ip_address    text,
  user_agent    text,
  endpoint      text,
  method        text,
  status_code   integer,
  response_time integer,
  error_stack   text,
  resolved      boolean DEFAULT false,
  resolved_by   uuid REFERENCES public.profiles(id),
  resolved_at   timestamp,
  created_at    timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level      ON public.system_logs (level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category   ON public.system_logs (category);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;  -- server-only; no policy
REVOKE ALL PRIVILEGES ON public.system_logs FROM PUBLIC;
REVOKE ALL PRIVILEGES ON public.system_logs FROM anon;
REVOKE ALL PRIVILEGES ON public.system_logs FROM authenticated;

-- =============================================================================
-- VERIFICATION (run after applying)
--   SELECT to_regclass('public.system_logs');                         -- non-null
--   SELECT relrowsecurity FROM pg_class WHERE relname='system_logs';  -- true
--   SELECT count(*) FROM pg_policies WHERE tablename='system_logs';   -- 0
--   SELECT count(*) FROM information_schema.table_privileges
--     WHERE table_name='system_logs' AND grantee IN ('anon','authenticated'); -- 0
-- =============================================================================
