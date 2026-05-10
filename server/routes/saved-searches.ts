import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/saved-searches - list saved searches (stub)
router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to load saved searches' });
  }
});

// POST /api/saved-searches - save search (stub)
router.post('/', async (_req: Request, res: Response) => {
  try {
    res.status(501).json({ error: 'Saved searches API not implemented' });
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to save search' });
  }
});

export default router;
