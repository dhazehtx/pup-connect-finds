import { Router, Request, Response } from 'express';
import { db } from '../db';
import { vetVerification } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const [row] = await db.select().from(vetVerification).where(eq(vetVerification.user_id, userId)).limit(1);
    res.json(row || null);
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('vet_verification') || msg.includes('relation') || msg.includes('does not exist')) {
      return res.json(null);
    }
    res.status(500).json({ error: msg || 'Failed to load verification' });
  }
});

router.post('/apply', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { business_name, license_number, location } = req.body;
    if (!business_name?.trim()) return res.status(400).json({ error: 'business_name required' });
    const [existing] = await db.select().from(vetVerification).where(eq(vetVerification.user_id, userId)).limit(1);
    if (existing) {
      const [updated] = await db
        .update(vetVerification)
        .set({
          clinic_name: String(business_name).trim(),
          license_number: license_number?.trim() || null,
          phone: location?.trim() || null,
        })
        .where(eq(vetVerification.user_id, userId))
        .returning();
      return res.json(updated);
    }
    const [row] = await db
      .insert(vetVerification)
      .values({
        user_id: userId,
        clinic_name: String(business_name).trim(),
        license_number: license_number?.trim() || null,
        phone: location?.trim() || null,
      })
      .returning();
    res.status(201).json(row);
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('vet_verification') || msg.includes('relation') || msg.includes('does not exist')) {
      return res.status(503).json({ error: 'Vet verification not set up yet. Run database migrations.' });
    }
    res.status(500).json({ error: msg || 'Failed to apply' });
  }
});

export default router;
