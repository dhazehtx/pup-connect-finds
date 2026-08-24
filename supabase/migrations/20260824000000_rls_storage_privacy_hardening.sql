-- =============================================================================
-- Session 2 — Supabase RLS / Storage / Privacy hardening
-- =============================================================================
-- Closes the launch-blocking data-exposure findings that live in the database
-- layer (not the Express layer). Idempotent and forward-only.
--
-- OWNER ACTION REQUIRED: apply this to the production project (wneticxjhxpjpfghnclr)
-- via the Supabase SQL editor / CLI. Agents do not run remote migrations.
-- After applying, run the verification queries at the bottom of this file and
-- the CANNOT-VERIFY checks in the Session 2 report.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Government-ID documents: make the bucket PRIVATE and remove public read.
--    The server reads these with the service role via short-lived signed URLs.
-- -----------------------------------------------------------------------------
UPDATE storage.buckets SET public = false WHERE id = 'provider-id-docs';

DROP POLICY IF EXISTS "Anyone can view provider ID documents" ON storage.objects;

-- Owners may still read their own docs (defense-in-depth; server uses service role).
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

DROP POLICY IF EXISTS "Owners can view their message attachments" ON storage.objects;
CREATE POLICY "Owners can view their message attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1] -- {user_id}/...
  );

-- -----------------------------------------------------------------------------
-- 3) profiles — stop self-escalation and stop leaking 2FA secrets.
--    RLS is row-level; column-level GRANT/REVOKE is the correct tool to protect
--    individual columns from anon/authenticated (PostgREST) access. The service
--    role bypasses these grants, so server-side admin flows keep working.
-- -----------------------------------------------------------------------------

-- 3a) Prevent a user from writing privilege-bearing columns on their own row.
REVOKE UPDATE (is_admin, verified, role, is_suspended, two_factor_secret, two_factor_enabled, backup_codes)
  ON public.profiles FROM anon, authenticated;

-- 3b) Never expose the TOTP secret / backup codes to the browser (anon key).
REVOKE SELECT (two_factor_secret, backup_codes)
  ON public.profiles FROM anon, authenticated;

-- 3c) Belt-and-suspenders: even if column grants are later widened, block
--     privilege escalation at the row level with a trigger. The service role
--     (auth.role() = 'service_role') is allowed to change these fields.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    IF NEW.is_admin      IS DISTINCT FROM OLD.is_admin
       OR NEW.verified   IS DISTINCT FROM OLD.verified
       OR NEW.role       IS DISTINCT FROM OLD.role
       OR NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
      RAISE EXCEPTION 'Not allowed to modify privileged profile fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- -----------------------------------------------------------------------------
-- 4) Tighten over-permissive USING(true) read/write on analytics/marketing
--    tables if they exist in this database. Guarded so the migration is safe
--    regardless of which tables are present in the (diverged) production schema.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_analytics') THEN
    EXECUTE 'ALTER TABLE public.subscription_analytics ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read subscription analytics" ON public.subscription_analytics';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.subscription_analytics';
    -- No anon/authenticated policy => only service role can access.
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations') THEN
    EXECUTE 'ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.donations';
    EXECUTE 'DROP POLICY IF EXISTS "Public can insert donations" ON public.donations';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'promotions') THEN
    EXECUTE 'ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.promotions';
    EXECUTE 'DROP POLICY IF EXISTS "Public can manage promotions" ON public.promotions';
  END IF;
END
$$;

-- =============================================================================
-- VERIFICATION (run after applying; all should return the hardened state)
-- =============================================================================
-- Buckets must be private:
--   SELECT id, public FROM storage.buckets WHERE id IN ('provider-id-docs','message-attachments');
--     -> public = false for both
--
-- No public SELECT policy remains on the ID/message buckets:
--   SELECT policyname, cmd FROM pg_policies
--    WHERE schemaname='storage' AND tablename='objects'
--      AND qual ILIKE '%provider-id-docs%' OR qual ILIKE '%message-attachments%';
--
-- 2FA secret is not selectable by anon/authenticated:
--   SELECT grantee, privilege_type, column_name FROM information_schema.column_privileges
--    WHERE table_name='profiles' AND column_name IN ('two_factor_secret','backup_codes');
--     -> grantee anon/authenticated should NOT appear with SELECT
--
-- Privileged columns not updatable by anon/authenticated:
--   SELECT grantee, privilege_type, column_name FROM information_schema.column_privileges
--    WHERE table_name='profiles' AND column_name IN ('is_admin','verified','role')
--      AND privilege_type='UPDATE';
--     -> grantee anon/authenticated should NOT appear
