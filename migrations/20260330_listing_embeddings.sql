-- CLIP embeddings for marketplace listings (AI Match vs lost dog photos)
CREATE TABLE IF NOT EXISTS listing_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES dog_listings(id) ON DELETE CASCADE,
  embedding_vector JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_listing_embeddings_listing_id UNIQUE (listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_embeddings_listing_id ON listing_embeddings(listing_id);
