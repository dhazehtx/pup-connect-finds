import { Router, Request, Response } from 'express';

const router = Router();

router.post('/subscribe', async (_req: Request, res: Response) => {
  try {
    res.status(501).json({ error: 'Push subscription not implemented' });
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to subscribe' });
  }
});

export default router;
