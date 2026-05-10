// @ts-nocheck
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { dogs, microchips } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const rows = await db.select().from(dogs).where(eq(dogs.owner_id, userId)).orderBy(desc(dogs.created_at));
    res.json({ dogs: rows });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('dogs') && (msg.includes('relation') || msg.includes('does not exist'))) return res.json({ dogs: [] });
    res.status(500).json({ error: msg || 'Failed to load dogs' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [row] = await db.select().from(dogs).where(eq(dogs.id, req.params.id)).limit(1);
    if (!row) return res.status(404).json({ error: 'Dog not found' });
    res.json(row);
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('dogs') && (msg.includes('relation') || msg.includes('does not exist'))) return res.status(404).json({ error: 'Dog not found' });
    res.status(500).json({ error: msg || 'Failed to load dog' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { name, breed, color, dog_size, gender, dob, photo_url, microchip_number, vet_id, breeder_id } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const [row] = await db
      .insert(dogs)
      .values({
        owner_id: userId,
        name: String(name).trim(),
        breed: breed?.trim() || null,
        color: color?.trim() || null,
        dog_size: dog_size?.trim() || null,
        gender: gender?.trim() || null,
        dob: dob ? new Date(dob) : null,
        photo_url: photo_url?.trim() || null,
        microchip_number: microchip_number?.trim() || null,
        vet_id: vet_id || null,
        breeder_id: breeder_id || null,
      })
      .returning();
    res.status(201).json(row);
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to create dog' });
  }
});

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const [existing] = await db.select().from(dogs).where(eq(dogs.id, req.params.id)).limit(1);
    if (!existing || existing.owner_id !== userId) return res.status(404).json({ error: 'Dog not found' });
    const { name, breed, color, dog_size, gender, dob, photo_url, microchip_number } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (name !== undefined) updates.name = String(name).trim();
    if (breed !== undefined) updates.breed = breed?.trim() || null;
    if (color !== undefined) updates.color = color?.trim() || null;
    if (dog_size !== undefined) updates.dog_size = dog_size?.trim() || null;
    if (gender !== undefined) updates.gender = gender?.trim() || null;
    if (dob !== undefined) updates.dob = dob ? new Date(dob) : null;
    if (photo_url !== undefined) updates.photo_url = photo_url?.trim() || null;
    if (microchip_number !== undefined) updates.microchip_number = microchip_number?.trim() || null;
    const [row] = await db.update(dogs).set(updates as any).where(eq(dogs.id, req.params.id)).returning();
    res.json(row);
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to update dog' });
  }
});

router.post('/:id/microchip', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const dogId = req.params.id;
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);
    if (!dog || dog.owner_id !== userId) return res.status(404).json({ error: 'Dog not found' });
    const { chip_number, vet_registered, registry_source } = req.body;
    if (!chip_number?.trim()) return res.status(400).json({ error: 'chip_number required' });
    const chip = String(chip_number).trim().replace(/\s/g, '');
    const [row] = await db
      .insert(microchips)
      .values({
        chip_number: chip,
        dog_id: dogId,
        owner_id: userId,
        vet_registered: !!vet_registered,
        registry_source: registry_source?.trim() || null,
      })
      .returning();
    res.status(201).json(row);
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error)?.message || 'Failed to register microchip' });
  }
});

export default router;
