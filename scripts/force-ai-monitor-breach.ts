import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { runAiMatchNightlyMonitor } from '../server/lib/aiMatchQualityMonitor';

async function main() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing NEON_DATABASE_URL or DATABASE_URL');
  }

  const pool = new Pool({ connectionString });
  try {
    const now = new Date();
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const syntheticEventTime = new Date(dayStart.getTime() + 60 * 60 * 1000);

    await pool.query(
      `insert into ai_match_quality_events
      (match_ranking, had_query_embedding, result_count, top_match_score, listing_threshold, duration_ms, model, created_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      ['empty', false, 0, null, 0.68, 120, 'google/vit-base-patch16-224', syntheticEventTime],
    );

    await runAiMatchNightlyMonitor(new Date());

    const alerts = await pool.query(
      `select metric_day, alert_type, severity, message, created_at
       from ai_match_quality_alerts
       order by created_at desc
       limit 5`,
    );
    console.log('alerts_recent', alerts.rows);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
