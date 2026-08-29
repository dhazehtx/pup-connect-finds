-- ============================================================================
-- READ-ONLY: dog_listings RLS + policy + grant posture
-- Safe to run against production (SELECT-only catalog queries; no writes).
-- Run in the Supabase SQL editor for project wneticxjhxpjpfghnclr.
-- ============================================================================

-- 1) Is RLS enabled / forced on dog_listings?
--    rls_enabled=false  → any role with a table grant can read/write directly.
SELECT c.relname            AS "table",
       c.relrowsecurity     AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'dog_listings';

-- 2) Every policy on dog_listings: command, roles, USING (qual) + WITH CHECK.
--    Look for any INSERT/UPDATE/DELETE/ALL policy whose roles include anon.
SELECT policyname,
       permissive,
       roles,
       cmd                  AS command,          -- SELECT | INSERT | UPDATE | DELETE | ALL
       qual                 AS using_expression,  -- row visibility (SELECT/UPDATE/DELETE)
       with_check           AS with_check_expression -- write constraint (INSERT/UPDATE)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dog_listings'
ORDER BY cmd, policyname;

-- 3) Table-level privileges granted to the browser-facing roles.
--    SECURE write posture: anon has NO INSERT/UPDATE/DELETE here.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'dog_listings'
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- 4) Column-level SELECT grants to anon/authenticated (read-exposure surface).
SELECT grantee, privilege_type, column_name
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'dog_listings'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type, column_name;

-- ----------------------------------------------------------------------------
-- HOW TO READ THE RESULT
--   SECURE (expected) if EITHER of these holds for anonymous writes:
--     • Query 3 shows anon has NO INSERT/UPDATE/DELETE grant, OR
--     • Query 1 rls_enabled=true AND Query 2 has NO permissive INSERT/UPDATE/
--       DELETE/ALL policy whose roles include {anon} (or {public}).
--   Public SELECT is acceptable by design (Explore reads listings); confirm
--   Query 2 SELECT policy / Query 4 columns match the intended public fields.
--   EXPOSED if rls_enabled=false AND anon holds INSERT (Query 3) — anon could
--   write listings directly via the REST API. Report back and we prepare an
--   additive RLS migration (no changes applied without your authorization).
-- ============================================================================
