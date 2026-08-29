-- =============================================================================
-- Public identity must never default to a user's email / email local-part.
-- =============================================================================
-- The signup trigger handle_new_user() previously seeded BOTH full_name AND
-- username from split_part(NEW.email, '@', 1) when the user provided no explicit
-- value. That put email fragments (e.g. "richrivaux97+pawsbuyer") into public,
-- world-readable profile fields, discoverable via search. This re-defines the
-- function (the trigger stays) to:
--   * username  → the user's explicit username, else a NEUTRAL generated handle
--                 user_<last 8 hex of the account id> (no email, unique-ish).
--   * full_name → the user's explicit name, else NULL (display falls back to the
--                 neutral username; never the email).
--
-- Matches the server neutralUsername() helper (server/lib/ensureProfile.ts).
-- Additive/idempotent (CREATE OR REPLACE). Does NOT modify existing rows — a
-- backfill of already-seeded email handles is a separate product/data decision
-- (see the report; not included here because auto-seeded vs user-chosen values
-- cannot be safely distinguished, and existing @mentions/links reference them).
--
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr). Prepared as a
-- reviewed candidate; agents never run remote migrations.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || right(replace(NEW.id::text, '-', ''), 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger on_auth_user_created is unchanged; only the function body is updated.

-- =============================================================================
-- VERIFICATION (run after applying)
--   -- new signups without an explicit username get a user_<...> handle, not email:
--   SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';  -- shows 'user_' || right(...)
-- =============================================================================
