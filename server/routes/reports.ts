import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Router } from 'express';
import { db } from '../db';
import { reports, profiles, posts, comments, dogListings } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

async function reportHandler(req: any, res: any) {
  try {
    const { target_id, target_type, reason } = req.body;
    const description = req.body.description ?? req.body.message ?? null;
    
    if (!target_id || !target_type || !reason) {
      return res.status(400).json({ ok: false, error: 'Target ID, type, and reason are required' });
    }

    if (!['user', 'post', 'comment', 'listing'].includes(target_type)) {
      return res.status(400).json({ ok: false, error: 'Invalid target type' });
    }

    let targetExists = false;
    if (target_type === 'user') {
      const [u] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, target_id));
      targetExists = !!u;
    } else if (target_type === 'post') {
      const [p] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, target_id));
      targetExists = !!p;
    } else if (target_type === 'comment') {
      const [c] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, target_id));
      targetExists = !!c;
    } else if (target_type === 'listing') {
      const [l] = await db.select({ id: dogListings.id }).from(dogListings).where(eq(dogListings.id, target_id));
      targetExists = !!l;
    }

    if (!targetExists) {
      return res.status(404).json({ ok: false, error: 'Target not found' });
    }

    const [existingReport] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(and(
        eq(reports.reporter_id, req.user.id),
        eq(reports.target_id, target_id),
        eq(reports.target_type, target_type),
        eq(reports.reason, reason),
        sql`${reports.created_at} > NOW() - INTERVAL '24 hours'`
      ));

    if (existingReport) {
      return res.status(409).json({ ok: false, code: 'ALREADY_REPORTED', error: 'You have already reported this content for this reason recently' });
    }

    const [report] = await db
      .insert(reports)
      .values({
        reporter_id: req.user.id,
        target_id,
        target_type,
        reason,
        description: description || null
      })
      .returning();

    debugApiLog('[PROOF:REPORT]', JSON.stringify({ actorUserId: req.user.id, targetType: target_type, targetId: target_id, reason, ts: Date.now() }));

    res.status(201).json({
      ok: true,
      message: 'Report submitted successfully',
      report
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  return reportHandler(req, res);
});

router.post('/user', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  req.body.target_type = 'user';
  req.body.target_id = req.body.target_id || req.body.userId;
  return reportHandler(req, res);
});

router.post('/post', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  req.body.target_type = 'post';
  req.body.target_id = req.body.target_id || req.body.postId;
  return reportHandler(req, res);
});

router.post('/listing', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  req.body.target_type = 'listing';
  req.body.target_id = req.body.target_id || req.body.listingId;
  return reportHandler(req, res);
});

router.get('/check/:targetType/:targetId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }

  try {
    const { targetType, targetId } = req.params;
    const [existing] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(and(
        eq(reports.reporter_id, req.user!.id),
        eq(reports.target_id, targetId),
        eq(reports.target_type, targetType),
        sql`${reports.created_at} > NOW() - INTERVAL '24 hours'`
      ));

    debugApiLog('[PROOF:REPORT:CHECK]', JSON.stringify({ targetType, targetId, alreadyReported: !!existing, ts: Date.now() }));
    res.json({ ok: true, alreadyReported: !!existing });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to check report status' });
  }
});

// Get reports (admin only)
router.get('/', async (req, res) => {
  if (!req.isAuthenticated() || !req.user!.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const { 
      page = '1', 
      limit = '20', 
      status = 'all',
      target_type = 'all',
      reason = 'all'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const filters = [];
    
    if (status !== 'all') {
      filters.push(eq(reports.status, status as string));
    }
    
    if (target_type !== 'all') {
      filters.push(eq(reports.target_type, target_type as string));
    }
    
    if (reason !== 'all') {
      filters.push(eq(reports.reason, reason as string));
    }

    // Get reports with reporter details
    const reportsResults = await db
      .select({
        id: reports.id,
        target_id: reports.target_id,
        target_type: reports.target_type,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        created_at: reports.created_at,
        resolved_at: reports.resolved_at,
        reporter: {
          id: profiles.id,
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url
        }
      })
      .from(reports)
      .leftJoin(profiles, eq(reports.reporter_id, profiles.id))
      .where(and(...filters))
      .orderBy(desc(reports.created_at))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(and(...filters));

    res.json({
      reports: reportsResults,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update report status (admin only)
router.patch('/:reportId', async (req, res) => {
  if (!req.isAuthenticated() || !req.user!.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [updatedReport] = await db
      .update(reports)
      .set({
        status: status,
        resolved_by: req.user!.id,
        resolved_at: new Date()
      })
      .where(eq(reports.id, reportId))
      .returning();

    if (!updatedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      message: 'Report status updated successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;