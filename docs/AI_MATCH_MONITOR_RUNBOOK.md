# AI Match Monitor Runbook

## What this monitor does

- Logs every `POST /api/lost-pet-alerts/ai-match` request into `ai_match_quality_events`.
- Computes previous-day rollups into `ai_match_quality_daily_metrics`.
- Creates threshold-breach rows in `ai_match_quality_alerts`.
- Sends outbound alerts when configured:
  - Webhook: `AI_MATCH_MONITOR_WEBHOOK_URL`
  - Email: `AI_MATCH_MONITOR_ALERT_EMAILS`

## Environments

Apply migration `migrations/20260331_ai_match_quality_monitoring.sql` in each environment:

- Dev
- Staging
- Production

For environments that cannot run `drizzle-kit push` safely, execute the SQL file directly with your DB migration tooling.

## Admin API

All routes are admin-protected:

- `GET /api/admin/ai-match-quality/daily?days=30`
- `GET /api/admin/ai-match-quality/alerts?days=30`
- `GET /api/admin/ai-match-quality/events/recent?limit=50`
- `POST /api/admin/ai-match-quality/run-nightly`

## Suggested starting thresholds

- `AI_MATCH_MONITOR_MIN_REQUESTS=20`
- `AI_MATCH_MONITOR_MAX_FALLBACK_RATE=0.40`
- `AI_MATCH_MONITOR_MAX_EMPTY_RATE=0.25`
- `AI_MATCH_MONITOR_MIN_AVG_TOP_SCORE=0.62`

Tune after 1-2 weeks of production traffic.

## Production hardening checklist

- Confirm migration exists in production DB.
- Configure at least one outbound channel (webhook or email).
- Validate admin API access with an admin account.
- Trigger a manual rollup once (`POST /run-nightly`) and verify:
  - `ai_match_quality_daily_metrics` row exists for previous UTC day.
  - Alert rows appear when thresholds are intentionally tightened.
- Keep AI model env explicit in production:
  - `HF_IMAGE_EMBEDDING_MODEL=google/vit-base-patch16-224` (or your chosen model).
