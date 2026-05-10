// @ts-nocheck
import { Router } from 'express';
import { db } from '../db';
import { aiMatchQualityAlerts, aiMatchQualityDailyMetrics, aiMatchQualityEvents } from '@shared/schema';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { desc, gte } from 'drizzle-orm';
import { runAiMatchNightlyMonitor, sendAiMatchMonitorTestOutbound } from '../lib/aiMatchQualityMonitor';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/daily', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(120, Number(req.query.days ?? 30)));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await db
      .select()
      .from(aiMatchQualityDailyMetrics)
      .where(gte(aiMatchQualityDailyMetrics.metric_day, since))
      .orderBy(desc(aiMatchQualityDailyMetrics.metric_day));
    res.json({ ok: true, days, metrics: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || 'Failed to load daily metrics' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(120, Number(req.query.days ?? 30)));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await db
      .select()
      .from(aiMatchQualityAlerts)
      .where(gte(aiMatchQualityAlerts.metric_day, since))
      .orderBy(desc(aiMatchQualityAlerts.metric_day), desc(aiMatchQualityAlerts.created_at));
    res.json({ ok: true, days, alerts: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || 'Failed to load quality alerts' });
  }
});

router.get('/events/recent', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit ?? 50)));
    const rows = await db.select().from(aiMatchQualityEvents).orderBy(desc(aiMatchQualityEvents.created_at)).limit(limit);
    res.json({ ok: true, limit, events: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || 'Failed to load recent events' });
  }
});

router.post('/run-nightly', async (_req, res) => {
  try {
    await runAiMatchNightlyMonitor(new Date());
    res.json({ ok: true, message: 'AI Match nightly monitor run completed.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || 'Failed to run nightly monitor' });
  }
});

router.post('/test-outbound', async (_req, res) => {
  try {
    const result = await sendAiMatchMonitorTestOutbound();
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || 'Failed to test outbound delivery' });
  }
});

export default router;
