import { Router } from 'express';
import { requireAdmin } from '../../middleware/requireAdmin';

const router = Router();
router.use(requireAdmin);

/** Admin stub — extend with auth/users vs profiles audit when needed. */
router.get('/status', (_req, res) => {
  res.json({ ok: true, message: 'Profile sync admin route mounted' });
});

export default router;
