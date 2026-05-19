import { Router } from 'express';

const router = Router();

router.get('/schema-health', async (_req, res) => {
  if (process.env.SCHEMA_DEBUG !== '1') {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const { buildSchemaHealthReport } = await import('../lib/schemaHealth');
    const report = await buildSchemaHealthReport();
    res.json(report);
  } catch (error) {
    console.error('[debug] schema-health failed:', error);
    res.status(500).json({ error: 'SCHEMA_HEALTH_FAILED' });
  }
});

export default router;
