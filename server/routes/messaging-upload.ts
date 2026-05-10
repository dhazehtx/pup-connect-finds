import { Router, Request, Response } from 'express';

// Stub so server/routes.ts can load; replace with real upload logic when needed.
const router = Router();

router.post('/', async (_req: Request, res: Response) => {
  try {
    res.status(501).json({ error: 'Messaging upload not implemented' });
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err?.message || 'Upload failed' });
  }
});

export default router;
