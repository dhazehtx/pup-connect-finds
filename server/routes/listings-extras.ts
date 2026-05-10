import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to load listings extras' });
  }
});

export default router;
