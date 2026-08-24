-- =============================================================================
-- Beta-critical schema completion (Category A)
-- =============================================================================
-- Creates the small, reachable, server-written tables that are defined in the
-- Drizzle schema (shared/schema.ts) but were never applied to the Supabase
-- Postgres, so their features currently error. Additive & idempotent; deletes
-- no data.
--
--   bookmarks       -> BookmarksPage + bookmark actions (server: /api/bookmarks)
--   saved_posts     -> SavedPostsPage + SavePostButton (server: /api/saved-posts)
--   qa_bug_reports  -> in-app bug reporting for closed-beta testers (/api/qa)
--
-- All three are written ONLY by the Express/Drizzle server (never by the browser
-- anon key). RLS is therefore ENABLED with NO anon/authenticated policy: the
-- browser is default-denied, while the server's DATABASE_URL connection (owner/
-- service role) bypasses RLS. The server already derives user_id from the
-- authenticated session (Session 1 hardening), so no client can spoof ownership.
--
-- Column types mirror the Drizzle definitions exactly to avoid schema drift.
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr). Not applied here.
-- =============================================================================

-- --- bookmarks ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id   uuid NOT NULL,                 -- references a post or a dog_listing (polymorphic)
  content_type text NOT NULL,                 -- 'post' | 'listing'
  created_at   timestamp DEFAULT now(),
  CONSTRAINT unique_user_content UNIQUE (user_id, content_id, content_type)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;  -- server-only; no anon/authenticated policy

-- --- saved_posts -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  CONSTRAINT unique_user_post UNIQUE (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;  -- server-only

-- --- qa_bug_reports ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.qa_bug_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  route       text NOT NULL,
  description text NOT NULL,
  severity    text NOT NULL,                  -- low | medium | high | critical
  status      text NOT NULL DEFAULT 'open',   -- open | in_progress | fixed | wont_fix
  created_at  timestamp NOT NULL DEFAULT now(),
  updated_at  timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qa_bug_reports_status ON public.qa_bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_qa_bug_reports_created_at ON public.qa_bug_reports(created_at);
ALTER TABLE public.qa_bug_reports ENABLE ROW LEVEL SECURITY;  -- server-only (submit=auth user, reads=admin)

-- =============================================================================
-- VERIFICATION (run after applying)
--   SELECT to_regclass('public.bookmarks'), to_regclass('public.saved_posts'), to_regclass('public.qa_bug_reports');  -- all non-null
--   SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('bookmarks','saved_posts','qa_bug_reports');        -- relrowsecurity = true
--   SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('bookmarks','saved_posts','qa_bug_reports');     -- 0 rows (server bypasses RLS)
-- =============================================================================
