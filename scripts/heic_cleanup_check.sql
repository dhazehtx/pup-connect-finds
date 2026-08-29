-- ============================================================================
-- HEIC/HEIF objects in the listings pipeline — FIND (read-only) then SAFE cleanup.
-- Steps 1-3 are READ-ONLY (safe on production). Do NOT run step 4 until you have
-- confirmed from steps 1-3 that a row is genuinely unattached certification data.
-- Run in the Supabase SQL editor (project wneticxjhxpjpfghnclr).
-- ============================================================================

-- 1) HEIC/HEIF objects physically stored in the listings bucket (storage layer).
SELECT id, name, created_at,
       metadata->>'mimetype' AS mimetype,
       metadata->>'size'     AS size_bytes
FROM storage.objects
WHERE bucket_id = 'listings'
  AND (lower(name) LIKE '%.heic'
       OR lower(name) LIKE '%.heif'
       OR lower(metadata->>'mimetype') IN ('image/heic', 'image/heif'))
ORDER BY created_at DESC;

-- 2) media_assets rows for HEIC/HEIF (attachment status). parent_id IS NULL = orphan.
SELECT id, parent_type, parent_id, bucket, path, mime_type, public_url, created_at
FROM public.media_assets
WHERE lower(mime_type) IN ('image/heic', 'image/heif')
   OR lower(path) LIKE '%.heic' OR lower(path) LIKE '%.heif'
   OR lower(public_url) LIKE '%.heic' OR lower(public_url) LIKE '%.heif'
ORDER BY created_at DESC;

-- 3) Confirm a candidate is TRULY unattached before deleting: it must be an orphan
--    in media_assets (parent_id IS NULL) AND referenced by no dog_listing.
--    Replace :url with the public_url from step 2.
-- SELECT count(*) AS listing_refs
-- FROM public.dog_listings
-- WHERE image_url = :url OR (images IS NOT NULL AND :url = ANY(images));
--    listing_refs = 0  → safe to remove.

-- ============================================================================
-- 4) SAFE CLEANUP (owner, ONLY after steps 1-3 confirm orphan + certification data).
--    Do BOTH the storage object and its media_assets row. Replace the identifiers
--    with the exact values from steps 1-2. Preferably delete the object via the
--    Supabase dashboard (Storage → listings → select file → Delete); or:
--
-- DELETE FROM storage.objects
--   WHERE bucket_id = 'listings' AND name = '<name-from-step-1>';
-- DELETE FROM public.media_assets
--   WHERE id = '<id-from-step-2>';
--
-- NOTE: going forward, HEIC uploads are blocked at /api/media/sign, so no new
-- HEIC orphans can be created.
-- ============================================================================
