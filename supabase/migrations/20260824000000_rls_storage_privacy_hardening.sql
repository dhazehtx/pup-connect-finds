-- =============================================================================
-- Session 2 (corrected) — Supabase RLS / Storage / Privacy hardening
-- =============================================================================
-- Closes the launch-blocking data-exposure findings that live in the database
-- layer (not the Express layer). Idempotent, forward-only, deletes NO data.
--
-- DESIGN NOTE (privilege escalation): enforcement is by column-level GRANT/REVOKE,
-- NOT a trigger. anon/authenticated (the browser/PostgREST roles) lose UPDATE on
-- privilege columns, so a user cannot self-promote or self-verify. The Express
-- backend writes profiles via a DIRECT Postgres (Drizzle) connection as a
-- privileged/owner role that is NOT anon/authenticated, so REVOKE …FROM anon,
-- authenticated does not touch it — provider approval, ban/unban, and 2FA writes
-- (all server-side) keep working. This is why we do NOT use a trigger keyed on
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
-- 3) profiles — column-level protection (see DESIGN NOTE above).
--    Guarded per-column so the migration is safe against schema divergence:
--    a column that does not exist in this database is simply skipped.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  col text;
  -- Privilege-bearing columns: browser clients must never UPDATE these.
  update_guard text[] := ARRAY[
    'is_admin','verified','role','is_suspended',
    'two_factor_secret','two_factor_enabled','backup_codes'
  ];
  -- Sensitive/PII/security columns: browser clients must never SELECT these.
  -- Genuinely public marketplace fields (username, full_name, avatar_url,
  -- verified, location, rating, total_reviews) are intentionally NOT listed and
  -- remain readable so seller cards / review authors keep working.
  select_guard text[] := ARRAY[
    'email','phone','address','city','state','zip_code',
    'verification_document','breeder_license','fraud_score','profile_status',
    'is_admin','role','is_suspended','suspended_reason','suspended_at',
    'last_login_ip','last_login_at','suspicious_activity_count',
    'stripe_account_id','stripe_connected',
    'two_factor_secret','two_factor_enabled','backup_codes',
    'privacy_settings','social_providers'
  ];
BEGIN
  FOREACH col IN ARRAY update_guard LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = col) THEN
      EXECUTE format('REVOKE UPDATE (%I) ON public.profiles FROM anon, authenticated', col);
    END IF;
  END LOOP;

  FOREACH col IN ARRAY select_guard LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = col) THEN
      EXECUTE format('REVOKE SELECT (%I) ON public.profiles FROM anon, authenticated', col);
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
-- 3) Sensitive profile columns NOT selectable by anon/authenticated:
--   SELECT grantee, column_name FROM information_schema.column_privileges
--    WHERE table_schema='public' AND table_name='profiles' AND privilege_type='SELECT'
--      AND grantee IN ('anon','authenticated')
--      AND column_name IN ('email','phone','two_factor_secret','backup_codes','is_admin','role','is_suspended');
--     -> 0 rows
--
-- 4) Privilege columns NOT updatable by anon/authenticated:
--   SELECT grantee, column_name FROM information_schema.column_privileges
--    WHERE table_schema='public' AND table_name='profiles' AND privilege_type='UPDATE'
--      AND grantee IN ('anon','authenticated')
--      AND column_name IN ('is_admin','verified','role','is_suspended');
--     -> 0 rows
--
-- 5) Public marketplace profile fields STILL readable (regression guard):
--   SELECT grantee, column_name FROM information_schema.column_privileges
--    WHERE table_schema='public' AND table_name='profiles' AND privilege_type='SELECT'
--      AND grantee IN ('anon','authenticated')
--      AND column_name IN ('username','full_name','avatar_url','verified','location','rating','total_reviews');
--     -> these should still appear (embeds depend on them)
--
-- 6) Analytics/marketing tables have RLS on and no permissive policy:
--   SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('subscription_analytics','donations','promotions');  -- relrowsecurity = true
--   SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('subscription_analytics','donations','promotions'); -- 0 rows (service role bypasses RLS)
--
-- NOTE: no trigger is created; do not expect trg_prevent_profile_privilege_escalation.
