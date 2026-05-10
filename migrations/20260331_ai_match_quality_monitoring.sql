-- AI Match quality monitoring scaffold:
-- 1) request-level telemetry
-- 2) nightly rollups
-- 3) threshold alerts

CREATE TABLE IF NOT EXISTS ai_match_quality_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_ranking TEXT NOT NULL,
  had_query_embedding BOOLEAN NOT NULL DEFAULT false,
  result_count INTEGER NOT NULL DEFAULT 0,
  top_match_score DOUBLE PRECISION,
  listing_threshold DOUBLE PRECISION,
  duration_ms INTEGER,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_match_quality_events_created_at
  ON ai_match_quality_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_match_quality_events_match_ranking
  ON ai_match_quality_events(match_ranking);

CREATE TABLE IF NOT EXISTS ai_match_quality_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_day TIMESTAMPTZ NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  visual_requests INTEGER NOT NULL DEFAULT 0,
  fallback_requests INTEGER NOT NULL DEFAULT 0,
  empty_requests INTEGER NOT NULL DEFAULT 0,
  avg_top_match_score DOUBLE PRECISION,
  fallback_rate DOUBLE PRECISION,
  empty_rate DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_match_quality_daily_metrics_day
  ON ai_match_quality_daily_metrics(metric_day);
CREATE INDEX IF NOT EXISTS idx_ai_match_quality_daily_metrics_day
  ON ai_match_quality_daily_metrics(metric_day);

CREATE TABLE IF NOT EXISTS ai_match_quality_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_day TIMESTAMPTZ NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warn',
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_match_quality_alerts_day_type
  ON ai_match_quality_alerts(metric_day, alert_type);
CREATE INDEX IF NOT EXISTS idx_ai_match_quality_alerts_metric_day
  ON ai_match_quality_alerts(metric_day);
