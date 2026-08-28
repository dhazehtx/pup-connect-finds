-- =============================================================================
-- contact_messages — guest-safe support/contact queue (Category: support)
-- =============================================================================
-- The public /contact form previously showed a "Message recorded" success toast
-- without sending anything (P1-B: false success). This table backs a real support
-- path: POST /api/support/contact persists every submission here (guests + signed-
-- in users), returning success ONLY after the row is written.
--
-- Distinct from support_tickets (which requires a non-null user_id / auth). This
-- queue accepts GUEST submissions (user_id nullable) so unauthenticated visitors
-- have a working support path. An admin/owner reviews the queue; optional email
-- routing to SUPPORT_INBOX_EMAIL can be layered on later without schema changes.
--
-- Written ONLY by the Express server over its owner-role connection; never by the
-- browser. RLS ENABLED with NO anon/authenticated policy (default deny) + grant
-- revoke — same server-only pattern as 20260824000001/000003/000004/000005. The
-- owner role bypasses RLS, so server writes work; anon/authenticated cannot read
-- or write this table directly.
--
-- Additive, idempotent, deletes no data.
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr). Prepared as a
-- reviewed candidate; agents never run remote migrations.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- null for guests
  name        text NOT NULL,
  email       text NOT NULL,
  category    text NOT NULL,
  subject     text,
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'new',   -- new | read | resolved
  ip_address  text,
  user_agent  text,
  created_at  timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status     ON public.contact_messages (status);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;  -- server-only; no policy
REVOKE ALL PRIVILEGES ON public.contact_messages FROM PUBLIC;
REVOKE ALL PRIVILEGES ON public.contact_messages FROM anon;
REVOKE ALL PRIVILEGES ON public.contact_messages FROM authenticated;

-- =============================================================================
-- VERIFICATION (run after applying)
--   SELECT to_regclass('public.contact_messages');                         -- non-null
--   SELECT relrowsecurity FROM pg_class WHERE relname='contact_messages';  -- true
--   SELECT count(*) FROM pg_policies WHERE tablename='contact_messages';   -- 0
--   SELECT count(*) FROM information_schema.table_privileges
--     WHERE table_name='contact_messages' AND grantee IN ('anon','authenticated'); -- 0
-- =============================================================================
