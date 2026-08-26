-- =============================================================================
-- conversation_participants — enable RLS (server-only table)
-- =============================================================================
-- Verified production finding: RLS is DISABLED on public.conversation_participants
-- while Supabase's default grants give anon/authenticated full PostgREST access.
-- Consequence: any logged-in user could (a) dump the entire conversation-
-- membership graph (who talks to whom), and (b) INSERT themselves into an
-- arbitrary conversation — which the Express API then treats as authorization
-- to read that conversation's messages (server/storage.ts
-- isConversationParticipant). That makes this a privacy leak AND a message-read
-- escalation vector.
--
-- Evidence (Session 8 audit): the table is read/written ONLY by the Express
-- server over its direct owner-role Postgres connection (server/storage.ts).
-- There are zero browser callsites, zero edge-function callsites, and the table
-- is absent from the generated PostgREST types
-- (client/src/integrations/supabase/types.ts). The correct rule is therefore
-- the same server-only pattern already used for bookmarks / saved_posts /
-- qa_bug_reports (20260824000001): RLS ENABLED with NO anon/authenticated
-- policy (default deny), plus a belt-and-braces grant revoke. The table owner
-- (the server's DATABASE_URL role) is not subject to RLS, so messaging keeps
-- working unchanged.
--
-- Idempotent, additive, deletes no data.
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr) via the
-- Supabase SQL editor / CLI. Agents do not run remote migrations.
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'conversation_participants'
  ) THEN
    EXECUTE 'ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL PRIVILEGES ON public.conversation_participants FROM PUBLIC, anon, authenticated';
  END IF;
END
$$;

-- =============================================================================
-- VERIFICATION (run after applying)
--
-- 1) RLS is on:
--   SELECT relrowsecurity FROM pg_class
--    WHERE oid = 'public.conversation_participants'::regclass;   -- -> true
--
-- 2) No client policy exists (default deny; the server's owner role bypasses RLS):
--   SELECT policyname FROM pg_policies
--    WHERE schemaname='public' AND tablename='conversation_participants';  -- -> 0 rows
--
-- 3) No client-role grants remain:
--   SELECT grantee, privilege_type FROM information_schema.table_privileges
--    WHERE table_schema='public' AND table_name='conversation_participants'
--      AND grantee IN ('anon','authenticated');                   -- -> 0 rows
--
-- 4) Behavior spot-check: messaging still works through the app (Express API),
--    while direct PostgREST access fails:
--   SET ROLE authenticated; SELECT * FROM public.conversation_participants;  -- permission denied
--   RESET ROLE;
-- =============================================================================
