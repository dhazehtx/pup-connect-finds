import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/order-disputes - list disputes (e.g. for admin or buyer)
router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to load order disputes' });
  }
});

// GET /api/order-disputes/:id - get one dispute
router.get('/:id', async (req: Request, res: Response) => {
  try {
    res.status(404).json({ error: 'Dispute not found' });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to load dispute' });
  }
});

// POST /api/order-disputes - create dispute (stub)
router.post('/', async (_req: Request, res: Response) => {
  try {
    res.status(501).json({ error: 'Order disputes not implemented' });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to create dispute' });
  }
});

export default router;
