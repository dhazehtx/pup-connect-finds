-- =============================================================================
-- Session 2 (corrected) — Supabase RLS / Storage / Privacy hardening
-- =============================================================================
-- Closes the launch-blocking data-exposure findings that live in the database
-- layer (not the Express layer). Idempotent, forward-only, deletes NO data.
--
-- DESIGN NOTE (privilege escalation): enforcement is table-level REVOKE followed
-- by minimal column-level GRANTs, NOT a trigger. Production holds TABLE-LEVEL
-- privileges on public.profiles for anon/authenticated (Supabase's default
-- GRANT ALL), and Postgres column-level REVOKEs do not subtract from a
-- table-level grant — so an earlier version of this migration (column REVOKEs
-- only) did not actually remove the sensitive access. The corrected order is:
-- strip the table-level privileges first, then grant back ONLY the column
-- privileges the app's untrusted clients actually use (see section 3).
-- anon/authenticated end up with no UPDATE/INSERT/DELETE privilege at all, so a
-- user cannot self-promote, self-verify, or edit any profile row via PostgREST.
-- The Express backend writes profiles via a DIRECT Postgres (Drizzle) connection
-- as a privileged/owner role that is NOT anon/authenticated, so these REVOKEs do
-- not touch it — provider approval, ban/unban, 2FA, and PATCH /api/profiles/me
-- edits (all server-side) keep working. Service-role edge functions bypass RLS
-- and keep their own grants. This is why we do NOT use a trigger keyed on
-- auth.role() = 'service_role' (Drizzle has no such JWT claim and would be wrongly
-- blocked). Untrusted clients fail closed; trusted backend writes are unaffected.
--
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr) via the
-- Supabase SQL editor / CLI, then run the VERIFICATION queries at the bottom.
-- Agents do not run remote migrations.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Government-ID documents: make the bucket PRIVATE and remove public read.
--    The server reads these with the service role via short-lived signed URLs.
-- -----------------------------------------------------------------------------
UPDATE storage.buckets SET public = false WHERE id = 'provider-id-docs';

-- Drop the known public-read policy by name...
DROP POLICY IF EXISTS "Anyone can view provider ID documents" ON storage.objects;

-- ...and robustly drop ANY non-owner SELECT policy on this bucket, regardless of
-- how it was named in production (name divergence safe). Owner-scoped policies
-- (those referencing auth.uid()) are preserved; INSERT/UPDATE/DELETE policies are
-- untouched so uploads keep working.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT'
      AND coalesce(qual, '') LIKE '%provider-id-docs%'
      AND coalesce(qual, '') NOT LIKE '%auth.uid()%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END
$$;

-- Owners may read their own docs (defense-in-depth; server uses the service role).
DROP POLICY IF EXISTS "Owners can view their provider ID documents" ON storage.objects;
CREATE POLICY "Owners can view their provider ID documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'provider-id-docs'
    AND auth.uid()::text = (storage.foldername(name))[2] -- users/{user_id}/id/...
  );

-- -----------------------------------------------------------------------------
-- 2) Private message attachments: make the bucket PRIVATE and remove public read.
-- -----------------------------------------------------------------------------
UPDATE storage.buckets SET public = false WHERE id = 'message-attachments';

DROP POLICY IF EXISTS "Anyone can view message attachments" ON storage.objects;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT'
      AND coalesce(qual, '') LIKE '%message-attachments%'
      AND coalesce(qual, '') NOT LIKE '%auth.uid()%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END
$$;

DROP POLICY IF EXISTS "Owners can view their message attachments" ON storage.objects;
CREATE POLICY "Owners can view their message attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1] -- {user_id}/...
  );

-- -----------------------------------------------------------------------------
-- 3) profiles — least-privilege grants (corrected; see DESIGN NOTE above).
--
--    Step A strips ALL table-level privileges from the client roles (a
--    table-level REVOKE also removes any stray column-level grants, so this is
--    a clean slate). Step B grants back ONLY the columns the app's untrusted
--    clients actively read, derived from the Session 8 callsite audit:
--
--      * the one active browser callsite — the dog_listings→profiles embed in
--        client/src/hooks/useDogListings.ts — reads full_name, username,
--        location, verified, avatar_url, rating, total_reviews;
--      * `id` is required for the embed's FK join and for anon-key count
--        queries (supabase/functions/advanced-search, which now counts on
--        `id` instead of `*`);
--      * the anon-key smart-matching edge function reads a subset
--        (full_name, location, verified, rating).
--
--    NO UPDATE/INSERT/DELETE is granted: every profile edit flows through the
--    Express server (PATCH /api/profiles/me, Zod-allowlisted, owner-role
--    Drizzle connection), and signup rows are created by the SECURITY DEFINER
--    trigger public.handle_new_user() — neither depends on client-role
--    privileges. The existing RLS policies on profiles are left in place; with
--    no INSERT/UPDATE privilege they are simply unreachable for client roles.
--    Grants are per-column and existence-guarded so the migration is safe
--    against schema divergence.
-- -----------------------------------------------------------------------------

-- Step A: remove broad table-level privileges (this is what the previous
-- column-REVOKE-only version failed to do).
REVOKE ALL PRIVILEGES ON public.profiles FROM PUBLIC;
REVOKE ALL PRIVILEGES ON public.profiles FROM anon;
REVOKE ALL PRIVILEGES ON public.profiles FROM authenticated;

-- Step B: restore the minimum column-level SELECT the clients actually need.
DO $$
DECLARE
  col text;
  -- Public marketplace fields only. Never list here: email, phone, address,
  -- city, state, zip_code, verification_document, breeder_license, fraud_score,
  -- profile_status, is_admin, role, is_suspended, suspended_reason,
  -- suspended_at, last_login_ip, last_login_at, suspicious_activity_count,
  -- stripe_account_id, stripe_connected, two_factor_secret, two_factor_enabled,
  -- backup_codes, privacy_settings, social_providers.
  client_read text[] := ARRAY[
    'id','username','full_name','avatar_url','location',
    'verified','rating','total_reviews'
  ];
BEGIN
  FOREACH col IN ARRAY client_read LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = col) THEN
      EXECUTE format('GRANT SELECT (%I) ON public.profiles TO anon, authenticated', col);
    END IF;
  END LOOP;
END
$$;

-- -----------------------------------------------------------------------------
-- 4) Analytics / marketing tables: remove public/anon access. These are read
--    server-side now (subscription analytics moved behind an admin Express
--    endpoint; donations/promotions are written by service-role edge functions),
--    so anon/authenticated need no policy at all. The service role bypasses RLS.
--    Guarded by existence checks; dynamic drop is name-divergence safe.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  pol record;
  lockdown text[] := ARRAY['subscription_analytics','donations','promotions'];
BEGIN
  FOREACH t IN ARRAY lockdown LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      -- Drop every existing policy on the table: no anon/authenticated access is
      -- intended, and the service role bypasses RLS entirely.
      FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
      END LOOP;
    END IF;
  END LOOP;
END
$$;

-- =============================================================================
-- VERIFICATION (run after applying; all should return the hardened state)
-- =============================================================================
--
-- 1) Buckets are private:
--   SELECT id, public FROM storage.buckets WHERE id IN ('provider-id-docs','message-attachments');
--     -> public = false for both
--
-- 2) No non-owner SELECT policy remains on the ID/message buckets:
--   SELECT policyname, cmd, qual FROM pg_policies
--    WHERE schemaname='storage' AND tablename='objects' AND cmd='SELECT'
--      AND (qual LIKE '%provider-id-docs%' OR qual LIKE '%message-attachments%');
--     -> every row returned must contain auth.uid() (owner-scoped only)
--
-- 3) NO table-level profile privileges remain for the client roles:
--   SELECT grantee, privilege_type FROM information_schema.table_privileges
--    WHERE table_schema='public' AND table_name='profiles'
--      AND grantee IN ('anon','authenticated');
--     -> 0 rows
--
-- 4) Column-level SELECT is EXACTLY the public marketplace set (this view also
--    expands any table-level grant per column, so extra rows here mean the
--    broad grant came back):
--   SELECT DISTINCT column_name FROM information_schema.column_privileges
--    WHERE table_schema='public' AND table_name='profiles' AND privilege_type='SELECT'
--      AND grantee IN ('anon','authenticated')
--    ORDER BY column_name;
--     -> exactly: avatar_url, full_name, id, location, rating, total_reviews, username, verified
--
-- 5) NO UPDATE/INSERT/DELETE privilege of any kind for the client roles:
--   SELECT grantee, privilege_type, column_name FROM information_schema.column_privileges
--    WHERE table_schema='public' AND table_name='profiles'
--      AND grantee IN ('anon','authenticated') AND privilege_type <> 'SELECT';
--     -> 0 rows  (covers is_admin / role / verified / is_suspended self-writes)
--
-- 5b) Behavior spot-checks (optional, via SQL editor):
--   SET ROLE authenticated; SELECT username, avatar_url FROM public.profiles LIMIT 1;  -- works
--   SET ROLE authenticated; SELECT email FROM public.profiles LIMIT 1;                  -- permission denied
--   SET ROLE authenticated; UPDATE public.profiles SET is_admin = true;                 -- permission denied
--   SET ROLE anon;          SELECT count(*) FROM public.profiles;                       -- works (advanced-search)
--   RESET ROLE;
--
-- 6) Analytics/marketing tables have RLS on and no permissive policy:
--   SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('subscription_analytics','donations','promotions');  -- relrowsecurity = true
--   SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('subscription_analytics','donations','promotions'); -- 0 rows (service role bypasses RLS)
--
-- NOTE: no trigger is created; do not expect trg_prevent_profile_privilege_escalation.
