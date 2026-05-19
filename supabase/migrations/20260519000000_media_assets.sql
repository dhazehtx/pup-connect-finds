-- media_assets: metadata for Supabase Storage uploads (avatars, posts, listings)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_type text,
  parent_id uuid,
  bucket text NOT NULL,
  path text NOT NULL UNIQUE,
  mime_type text,
  size_bytes integer,
  width integer,
  height integer,
  duration_seconds integer,
  variant text DEFAULT 'original',
  public_url text,
  is_thumb boolean DEFAULT false,
  parent_asset_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  purge_after timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_parent ON public.media_assets (parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_owner ON public.media_assets (owner_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_purge ON public.media_assets (purge_after) WHERE deleted_at IS NOT NULL;

-- Add any missing columns on existing partial tables
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS is_thumb boolean DEFAULT false;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS parent_asset_id uuid;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS purge_after timestamptz;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS duration_seconds integer;
