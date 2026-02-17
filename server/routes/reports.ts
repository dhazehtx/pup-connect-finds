import { Router } from 'express';
import { db } from '../db';
import { reports, profiles, posts, comments, dogListings } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

// Submit a report
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { target_id, target_type, reason, description } = req.body;
    
    if (!target_id || !target_type || !reason) {
      return res.status(400).json({ message: 'Target ID, type, and reason are required' });
    }

    if (!['user', 'post', 'comment', 'listing'].includes(target_type)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    // Check if target exists
    let targetExists = false;
    switch (target_type) {
      case 'user':
        const [user] = await db.select().from(profiles).where(eq(profiles.id, target_id));
        targetExists = !!user;
        break;
      case 'post':
        const [post] = await db.select().from(posts).where(eq(posts.id, target_id));
        targetExists = !!post;
        break;
      case 'comment':
        const [comment] = await db.select().from(comments).where(eq(comments.id, target_id));
        targetExists = !!comment;
        break;
      case 'listing':
        const [listing] = await db.select().from(dogListings).where(eq(dogListings.id, target_id));
        targetExists = !!listing;
        break;
    }

    if (!targetExists) {
      return res.status(404).json({ message: 'Target not found' });
    }

    // Check for duplicate reports (same user, target, and reason within 24 hours)
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.reporter_id, req.user.id),
        eq(reports.target_id, target_id),
        eq(reports.target_type, target_type),
        eq(reports.reason, reason),
        sql`${reports.created_at} > NOW() - INTERVAL '24 hours'`
      ));

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this content for the same reason recently' });
    }

    const [report] = await db
      .insert(reports)
      .values({
        reporter_id: req.user.id,
        target_id: target_id,
        target_type: target_type,
        reason: reason,
        description: description || null
      })
      .returning();

    console.log('[PROOF:REPORT]', JSON.stringify({ actorUserId: req.user.id, targetType: target_type, targetId: target_id, reason, ts: Date.now() }));

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reports (admin only)
router.get('/', async (req, res) => {
  if (!req.isAuthenticated() || !req.user.is_admin) {
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
        reviewed_at: reports.reviewed_at,
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
  if (!req.isAuthenticated() || !req.user.is_admin) {
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
        reviewed_by: req.user.id,
        reviewed_at: new Date()
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