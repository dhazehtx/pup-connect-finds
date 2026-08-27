-- =============================================================================
-- Stripe webhook infrastructure tables (minimal, server-only)
-- =============================================================================
-- Closes the payments blocker found during the cutover smoke test: the canonical
-- webhook (/api/stripe/webhook) verifies signatures correctly but then returns
-- HTTP 500 on every valid event because production is missing the two audit /
-- idempotency tables it writes to (SQLSTATE 42P01 "relation stripe_idempotency
-- does not exist").
--
-- SCOPE: this creates ONLY the two tables the deployed 511d58a code contract
-- requires. It deliberately does NOT touch orders, providers, payouts, or any
-- function from the legacy supabase/migrations/stripe.sql — those are unrelated
-- and out of scope.
--
-- CODE CONTRACT (verified against 511d58a):
--   stripe_idempotency  (server/lib/idempotency.ts)
--     INSERT INTO stripe_idempotency (event_id) VALUES ($1)   -- relies on a
--       UNIQUE/PK on event_id to raise 23505 on a duplicate (this IS the
--       idempotency mechanism); also ON CONFLICT DO NOTHING in dev replay.
--     DELETE FROM stripe_idempotency WHERE event_id = $1       -- retry cleanup
--   stripe_events       (server/lib/stripe-handlers.ts, server/routes/admin.ts)
--     INSERT INTO stripe_events (event_id, type, payload)
--       VALUES ($1,$2,$3) ON CONFLICT (event_id) DO NOTHING    -- needs PK/uniq
--     SELECT event_id, type, created_at, payload ... ORDER BY created_at DESC
--       -- payload is read back as an object (eventPayload.data?.object) => jsonb
--
-- ACCESS: both tables are written/read ONLY by the Express server over its
-- direct owner-role Postgres connection (DATABASE_URL). No browser (anon/
-- authenticated) or edge-function path touches them. They therefore fail CLOSED
-- to client roles: RLS enabled with NO policy (default deny) + explicit REVOKE
-- of the Supabase default grants. The owner role bypasses RLS, and service_role
-- keeps its grant — so the server keeps working. Same pattern as
-- 20260824000001 (bookmarks/saved_posts/qa_bug_reports) and 20260824000003.
--
-- Additive, idempotent, deletes no data.
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr).
-- =============================================================================

-- --- stripe_idempotency ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_idempotency (
  event_id   text PRIMARY KEY,               -- Stripe event id; UNIQUE drives idempotency
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --- stripe_events (audit) ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id   text PRIMARY KEY,               -- ON CONFLICT (event_id) DO NOTHING
  type       text  NOT NULL,
  payload    jsonb NOT NULL,                  -- full event; read back as an object
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at
  ON public.stripe_events (created_at DESC);  -- admin audit list orders by this

-- --- fail closed to browser clients -----------------------------------------
ALTER TABLE public.stripe_idempotency ENABLE ROW LEVEL SECURITY;  -- server-only; no policy
ALTER TABLE public.stripe_events      ENABLE ROW LEVEL SECURITY;  -- server-only; no policy

REVOKE ALL PRIVILEGES ON public.stripe_idempotency FROM PUBLIC;
REVOKE ALL PRIVILEGES ON public.stripe_idempotency FROM anon;
REVOKE ALL PRIVILEGES ON public.stripe_idempotency FROM authenticated;
REVOKE ALL PRIVILEGES ON public.stripe_events      FROM PUBLIC;
REVOKE ALL PRIVILEGES ON public.stripe_events      FROM anon;
REVOKE ALL PRIVILEGES ON public.stripe_events      FROM authenticated;

-- =============================================================================
-- VERIFICATION (run after applying)
--
-- 1) Both tables exist with the expected columns/constraints:
--   SELECT to_regclass('public.stripe_idempotency'), to_regclass('public.stripe_events');  -- both non-null
--   SELECT conname, contype FROM pg_constraint
--    WHERE conrelid IN ('public.stripe_idempotency'::regclass,'public.stripe_events'::regclass)
--      AND contype='p';   -- one primary key per table (on event_id)
--   SELECT column_name, data_type, is_nullable FROM information_schema.columns
--    WHERE table_schema='public' AND table_name='stripe_events' ORDER BY ordinal_position;
--      -- event_id text NO, type text NO, payload jsonb NO, created_at timestamptz NO
--
-- 2) RLS on, no policies:
--   SELECT relname, relrowsecurity FROM pg_class
--    WHERE relname IN ('stripe_idempotency','stripe_events');           -- relrowsecurity = true
--   SELECT tablename, policyname FROM pg_policies
--    WHERE tablename IN ('stripe_idempotency','stripe_events');         -- 0 rows
--
-- 3) No client-role privileges remain (server owner path is unaffected):
--   SELECT grantee, privilege_type FROM information_schema.table_privileges
--    WHERE table_schema='public' AND table_name IN ('stripe_idempotency','stripe_events')
--      AND grantee IN ('anon','authenticated');                        -- 0 rows
-- =============================================================================
