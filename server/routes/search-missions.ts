import { Router, Request, Response } from 'express';
import { db } from '../db';
import { searchMissions, searchParticipants, lostPetAlerts, lostPetAlertReports } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { alert_id } = req.body;
    if (!alert_id) return res.status(400).json({ error: 'alert_id required' });
    const [alert] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, alert_id)).limit(1);
    if (!alert || alert.user_id !== userId) return res.status(404).json({ error: 'Alert not found or not owner' });
    const [existing] = await db
      .select()
      .from(searchMissions)
      .where(and(eq(searchMissions.alert_id, alert_id), eq(searchMissions.status, 'active')))
      .limit(1);
    if (existing) return res.json(existing);
    const [mission] = await db
      .insert(searchMissions)
      .values({ alert_id, owner_user_id: userId, status: 'active' })
      .returning();
    await db.insert(searchParticipants).values({ mission_id: mission!.id, user_id: userId });
    res.status(201).json(mission);
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('relation') || msg.includes('does not exist')) return res.status(503).json({ error: 'Search missions not available' });
    res.status(500).json({ error: msg || 'Failed to create mission' });
  }
});

router.get('/:missionId', async (req: Request, res: Response) => {
  try {
    const [mission] = await db
      .select()
      .from(searchMissions)
      .where(eq(searchMissions.id, req.params.missionId))
      .limit(1);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    const [alert] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, mission.alert_id)).limit(1);
    const participants = await db
      .select()
      .from(searchParticipants)
      .where(eq(searchParticipants.mission_id, mission.id));
    const reports = await db
      .select()
      .from(lostPetAlertReports)
      .where(eq(lostPetAlertReports.alert_id, mission.alert_id))
      .orderBy(desc(lostPetAlertReports.created_at));
    res.json({ mission, alert, participants, sightings: reports });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('relation') || msg.includes('does not exist')) return res.status(404).json({ error: 'Mission not found' });
    res.status(500).json({ error: msg || 'Failed to load mission' });
  }
});

router.post('/:missionId/join', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const [mission] = await db
      .select()
      .from(searchMissions)
      .where(eq(searchMissions.id, req.params.missionId))
      .limit(1);
    if (!mission || mission.status !== 'active') return res.status(404).json({ error: 'Mission not found or closed' });
    const existing = await db
      .select()
      .from(searchParticipants)
      .where(
        and(
          eq(searchParticipants.mission_id, mission.id),
          eq(searchParticipants.user_id, userId)
        )
      )
      .limit(1);
    if (existing.length) return res.json({ joined: true, mission });
    await db.insert(searchParticipants).values({ mission_id: mission.id, user_id: userId });
    res.json({ joined: true, mission });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('relation') || msg.includes('does not exist')) return res.status(503).json({ error: 'Search missions not available' });
    res.status(500).json({ error: msg || 'Failed to join' });
  }
});

router.get('/alert/:alertId', async (req: Request, res: Response) => {
  try {
    const [mission] = await db
      .select()
      .from(searchMissions)
      .where(and(eq(searchMissions.alert_id, req.params.alertId), eq(searchMissions.status, 'active')))
      .limit(1);
    if (!mission) return res.json({ mission: null, participants: [] });
    const participants = await db
      .select()
      .from(searchParticipants)
      .where(eq(searchParticipants.mission_id, mission.id));
    res.json({ mission, participants });
  } catch (e: unknown) {
    const msg = (e as Error)?.message || '';
    if (msg.includes('relation') || msg.includes('does not exist')) return res.json({ mission: null, participants: [] });
    res.status(500).json({ error: msg || 'Failed to load' });
  }
});

export default router;
