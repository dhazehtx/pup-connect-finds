import { Router } from 'express';
import { db } from '../../db';
import { reports, profiles, posts, comments, dogListings, mediaAssets } from '@shared/schema';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import { requireAdmin } from '../../middleware/requireAdmin';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/reports', async (req, res) => {
  try {
    const status = (req.query.status as string) || 'open';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const cursor = req.query.cursor as string | undefined;

    const filters: any[] = [];
    if (status !== 'all') {
      filters.push(eq(reports.status, status));
    }
    if (cursor) {
      filters.push(lt(reports.created_at, new Date(cursor)));
    }

    const rows = await db
      .select({
        id: reports.id,
        reporter_id: reports.reporter_id,
        target_id: reports.target_id,
        target_type: reports.target_type,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        resolved_by: reports.resolved_by,
        resolved_at: reports.resolved_at,
        resolution_note: reports.resolution_note,
        created_at: reports.created_at,
        reporter_username: profiles.username,
        reporter_name: profiles.full_name,
        reporter_avatar: profiles.avatar_url,
      })
      .from(reports)
      .leftJoin(profiles, eq(reports.reporter_id, profiles.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(reports.created_at))
      .limit(limit);

    const nextCursor = rows.length === limit ? rows[rows.length - 1].created_at?.toISOString() : null;

    console.log('[PROOF:ADMIN:REPORTS:LIST]', JSON.stringify({ status, count: rows.length, ts: Date.now() }));

    res.json({ ok: true, reports: rows, nextCursor });
  } catch (error) {
    console.error('[PROOF:ADMIN:REPORTS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch reports' });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const [report] = await db
      .select({
        id: reports.id,
        reporter_id: reports.reporter_id,
        target_id: reports.target_id,
        target_type: reports.target_type,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        resolved_by: reports.resolved_by,
        resolved_at: reports.resolved_at,
        resolution_note: reports.resolution_note,
        created_at: reports.created_at,
        reporter_username: profiles.username,
        reporter_name: profiles.full_name,
      })
      .from(reports)
      .leftJoin(profiles, eq(reports.reporter_id, profiles.id))
      .where(eq(reports.id, req.params.id));

    if (!report) {
      return res.status(404).json({ ok: false, error: 'Report not found' });
    }

    let targetPreview: any = null;
    if (report.target_type === 'post') {
      const [p] = await db.select({ id: posts.id, content: posts.content, status: posts.status, user_id: posts.user_id }).from(posts).where(eq(posts.id, report.target_id));
      targetPreview = p;
    } else if (report.target_type === 'listing') {
      const [l] = await db.select({ id: dogListings.id, dog_name: dogListings.dog_name, status: dogListings.status, user_id: dogListings.user_id, breed: dogListings.breed }).from(dogListings).where(eq(dogListings.id, report.target_id));
      targetPreview = l;
    } else if (report.target_type === 'comment') {
      const [c] = await db.select({ id: comments.id, content: comments.content, user_id: comments.user_id }).from(comments).where(eq(comments.id, report.target_id));
      targetPreview = c;
    } else if (report.target_type === 'user') {
      const [u] = await db.select({ id: profiles.id, username: profiles.username, full_name: profiles.full_name, is_suspended: profiles.is_suspended }).from(profiles).where(eq(profiles.id, report.target_id));
      targetPreview = u;
    }

    res.json({ ok: true, report, targetPreview });
  } catch (error) {
    console.error('[PROOF:ADMIN:REPORTS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch report' });
  }
});

router.patch('/reports/:id', async (req, res) => {
  try {
    const { status, resolution_note } = req.body;
    const adminId = (req as any).user?.id;

    if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolved_by = adminId;
      updateData.resolved_at = new Date();
    }
    if (resolution_note !== undefined) {
      updateData.resolution_note = resolution_note;
    }

    const [updated] = await db
      .update(reports)
      .set(updateData)
      .where(eq(reports.id, req.params.id))
      .returning();

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'Report not found' });
    }

    console.log('[PROOF:ADMIN:REPORTS:UPDATE]', JSON.stringify({ reportId: req.params.id, status, adminId, ts: Date.now() }));

    res.json({ ok: true, report: updated });
  } catch (error) {
    console.error('[PROOF:ADMIN:REPORTS:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to update report' });
  }
});

router.post('/actions/remove', async (req, res) => {
  try {
    const { target_type, target_id, reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!target_type || !target_id) {
      return res.status(400).json({ ok: false, error: 'target_type and target_id are required' });
    }

    if (target_type === 'post') {
      const [updated] = await db.update(posts).set({ status: 'removed' }).where(eq(posts.id, target_id)).returning();
      if (!updated) return res.status(404).json({ ok: false, error: 'Post not found' });
      await db.delete(mediaAssets).where(and(eq(mediaAssets.parent_type, 'post'), eq(mediaAssets.parent_id, target_id))).catch(() => {});
    } else if (target_type === 'listing') {
      const [updated] = await db.update(dogListings).set({ status: 'removed' }).where(eq(dogListings.id, target_id)).returning();
      if (!updated) return res.status(404).json({ ok: false, error: 'Listing not found' });
      await db.delete(mediaAssets).where(and(eq(mediaAssets.parent_type, 'listing'), eq(mediaAssets.parent_id, target_id))).catch(() => {});
    } else if (target_type === 'comment') {
      const [deleted] = await db.delete(comments).where(eq(comments.id, target_id)).returning();
      if (!deleted) return res.status(404).json({ ok: false, error: 'Comment not found' });
    } else {
      return res.status(400).json({ ok: false, error: 'Invalid target_type' });
    }

    console.log('[PROOF:ADMIN:ACTION]', JSON.stringify({ adminId, action: 'remove', targetType: target_type, targetId: target_id, reason, ts: Date.now() }));

    res.json({ ok: true, message: `${target_type} removed successfully` });
  } catch (error) {
    console.error('[PROOF:ADMIN:ACTION:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to remove content' });
  }
});

router.post('/actions/suspend-user', async (req, res) => {
  try {
    const { user_id, reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: 'user_id is required' });
    }

    const [updated] = await db
      .update(profiles)
      .set({
        is_suspended: true,
        suspended_reason: reason || 'Suspended by admin',
        suspended_at: new Date(),
      })
      .where(eq(profiles.id, user_id))
      .returning();

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    console.log('[PROOF:ADMIN:ACTION]', JSON.stringify({ adminId, action: 'suspend', targetType: 'user', targetId: user_id, reason, ts: Date.now() }));
    console.log('[PROOF:SUSPEND]', JSON.stringify({ userId: user_id, suspended: true, ts: Date.now() }));

    res.json({ ok: true, message: 'User suspended' });
  } catch (error) {
    console.error('[PROOF:ADMIN:ACTION:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to suspend user' });
  }
});

router.post('/actions/unsuspend-user', async (req, res) => {
  try {
    const { user_id } = req.body;
    const adminId = (req as any).user?.id;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: 'user_id is required' });
    }

    const [updated] = await db
      .update(profiles)
      .set({
        is_suspended: false,
        suspended_reason: null,
        suspended_at: null,
      })
      .where(eq(profiles.id, user_id))
      .returning();

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    console.log('[PROOF:ADMIN:ACTION]', JSON.stringify({ adminId, action: 'unsuspend', targetType: 'user', targetId: user_id, ts: Date.now() }));
    console.log('[PROOF:SUSPEND]', JSON.stringify({ userId: user_id, suspended: false, ts: Date.now() }));

    res.json({ ok: true, message: 'User unsuspended' });
  } catch (error) {
    console.error('[PROOF:ADMIN:ACTION:ERR]', error);
    res.status(500).json({ ok: false, error: 'Failed to unsuspend user' });
  }
});

export default router;
