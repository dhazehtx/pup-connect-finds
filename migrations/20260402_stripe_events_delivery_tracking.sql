-- Track Stripe webhook deliveries (retries / duplicates) for audit and ops.
ALTER TABLE stripe_events ADD COLUMN IF NOT EXISTS delivery_count integer NOT NULL DEFAULT 1;
ALTER TABLE stripe_events ADD COLUMN IF NOT EXISTS last_received_at timestamptz DEFAULT now();

UPDATE stripe_events SET last_received_at = created_at WHERE last_received_at IS NULL;
