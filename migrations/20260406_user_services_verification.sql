-- Per-user per-service verification (admin-approved badges), separate from listing row details.

CREATE TABLE IF NOT EXISTS user_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  review_status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_services_review_status_chk CHECK (review_status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT user_services_user_service_uidx UNIQUE (user_id, service_type)
);

CREATE INDEX IF NOT EXISTS user_services_user_id_idx ON user_services(user_id);
CREATE INDEX IF NOT EXISTS user_services_pending_idx ON user_services(review_status) WHERE review_status = 'pending';

-- Backfill from existing provider listings
INSERT INTO user_services (user_id, service_type, verified, review_status, updated_at)
SELECT user_id, service_type,
  bool_or(COALESCE(is_verified, false)),
  CASE WHEN bool_or(COALESCE(is_verified, false)) THEN 'approved' ELSE 'pending' END,
  now()
FROM pet_service_providers
GROUP BY user_id, service_type
ON CONFLICT (user_id, service_type) DO NOTHING;
