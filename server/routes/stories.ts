import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/stories - list stories (stub: client useStories uses mock data)
router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to load stories' });
  }
});

// POST /api/stories - create story (stub)
router.post('/', async (_req: Request, res: Response) => {
  try {
    res.status(501).json({ error: 'Stories API not implemented' });
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Failed to create story' });
  }
});

export default router;
