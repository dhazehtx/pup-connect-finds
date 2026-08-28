-- ============================================================================
-- Search performance: trigram GIN indexes for ILIKE '%term%' queries
-- ----------------------------------------------------------------------------
-- WHY: /api/search and /api/listings filter with leading-wildcard ILIKE
-- ('%term%') on text columns. A leading wildcard cannot use a btree index, so
-- these become sequential scans and are the dominant cause of the observed
-- 2–6s search latency (P2-4) on production-sized tables. pg_trgm + GIN
-- (gin_trgm_ops) turns those scans into index scans.
--
-- SAFETY: additive only — creates one extension + several indexes, no data or
-- schema mutation, no drops. IF NOT EXISTS makes it idempotent/re-runnable.
--
-- APPLY (owner / Danny — agents never run remote migrations):
--   Small/beta tables: run this file as-is.
--   Large/live tables (avoid write locks): run each CREATE INDEX with
--   CONCURRENTLY *outside* a transaction, e.g.
--     CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dog_listings_dog_name_trgm
--       ON public.dog_listings USING gin (dog_name gin_trgm_ops);
--   (CONCURRENTLY cannot run inside a transaction block.)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- dog_listings: dog_name, breed, description, location
CREATE INDEX IF NOT EXISTS idx_dog_listings_dog_name_trgm
  ON public.dog_listings USING gin (dog_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dog_listings_breed_trgm
  ON public.dog_listings USING gin (breed gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dog_listings_description_trgm
  ON public.dog_listings USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dog_listings_location_trgm
  ON public.dog_listings USING gin (location gin_trgm_ops);

-- profiles: username, full_name, email, location
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm
  ON public.profiles USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm
  ON public.profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm
  ON public.profiles USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_location_trgm
  ON public.profiles USING gin (location gin_trgm_ops);

-- pet_service_providers: service_type, bio, location
CREATE INDEX IF NOT EXISTS idx_psp_service_type_trgm
  ON public.pet_service_providers USING gin (service_type gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_psp_bio_trgm
  ON public.pet_service_providers USING gin (bio gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_psp_location_trgm
  ON public.pet_service_providers USING gin (location gin_trgm_ops);
