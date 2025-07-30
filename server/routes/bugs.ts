import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { bugReports, profiles, insertBugReportSchema } from '@shared/schema';
import { eq, desc, and, or, ilike, count } from 'drizzle-orm';

const router = Router();

// Get user's bug reports
router.get('/my-reports', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const reports = await db
      .select({
        id: bugReports.id,
        subject: bugReports.subject,
        description: bugReports.description,
        screenshot_url: bugReports.screenshot_url,
        status: bugReports.status,
        priority: bugReports.priority,
        created_at: bugReports.created_at,
        updated_at: bugReports.updated_at,
        resolved_at: bugReports.resolved_at,
        resolution: bugReports.resolution,
        admin_notes: bugReports.admin_notes,
      })
      .from(bugReports)
      .where(eq(bugReports.user_id, req.user.id))
      .orderBy(desc(bugReports.created_at));

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching user bug reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Submit new bug report
router.post('/', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Enhanced validation with device detection
    const bugReportData = insertBugReportSchema.extend({
      browser_info: z.string().optional(),
      device_info: z.string().optional(),
    }).parse({
      ...req.body,
      user_id: req.user.id,
      browser_info: req.headers['user-agent'] || '',
      device_info: req.body.device_info || 'Unknown',
    });

    const [report] = await db
      .insert(bugReports)
      .values(bugReportData)
      .returning();

    // Log the bug report submission
    console.log(`New bug report submitted by user ${req.user.id}: ${report.subject}`);

    res.status(201).json({ report });
  } catch (error) {
    console.error('Error creating bug report:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create bug report' });
  }
});

// Admin routes
router.get('/admin/reports', async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { 
      status = 'all', 
      priority = 'all', 
      assigned = 'all',
      search = '',
      page = '1',
      limit = '20'
    } = req.query;

    let conditions = [];
    
    if (status !== 'all') {
      conditions.push(eq(bugReports.status, status as string));
    }
    
    if (priority !== 'all') {
      conditions.push(eq(bugReports.priority, priority as string));
    }
    
    if (assigned === 'me') {
      conditions.push(eq(bugReports.assigned_admin_id, req.user.id));
    } else if (assigned === 'unassigned') {
      conditions.push(eq(bugReports.assigned_admin_id, null));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(bugReports.subject, `%${search}%`),
          ilike(bugReports.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get reports with user info
    const reports = await db
      .select({
        id: bugReports.id,
        subject: bugReports.subject,
        description: bugReports.description,
        screenshot_url: bugReports.screenshot_url,
        steps_to_reproduce: bugReports.steps_to_reproduce,
        expected_behavior: bugReports.expected_behavior,
        actual_behavior: bugReports.actual_behavior,
        browser_info: bugReports.browser_info,
        device_info: bugReports.device_info,
        status: bugReports.status,
        priority: bugReports.priority,
        admin_notes: bugReports.admin_notes,
        resolution: bugReports.resolution,
        created_at: bugReports.created_at,
        updated_at: bugReports.updated_at,
        resolved_at: bugReports.resolved_at,
        user_id: bugReports.user_id,
        assigned_admin_id: bugReports.assigned_admin_id,
        user_name: profiles.username,
        user_email: profiles.email,
        user_avatar: profiles.avatar_url,
      })
      .from(bugReports)
      .leftJoin(profiles, eq(bugReports.user_id, profiles.id))
      .where(whereClause)
      .orderBy(desc(bugReports.created_at))
      .limit(parseInt(limit as string))
      .offset((parseInt(page as string) - 1) * parseInt(limit as string));

    // Get statistics
    const statsQueries = await Promise.all([
      db.select({ count: count() }).from(bugReports).where(eq(bugReports.status, 'open')),
      db.select({ count: count() }).from(bugReports).where(eq(bugReports.status, 'in_progress')),
      db.select({ count: count() }).from(bugReports).where(eq(bugReports.status, 'resolved')),
      db.select({ count: count() }).from(bugReports).where(eq(bugReports.priority, 'critical')),
    ]);

    const stats = {
      open: statsQueries[0][0]?.count || 0,
      in_progress: statsQueries[1][0]?.count || 0,
      resolved: statsQueries[2][0]?.count || 0,
      critical: statsQueries[3][0]?.count || 0,
    };

    res.json({ reports, stats });
  } catch (error) {
    console.error('Error fetching admin bug reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update bug report (admin only)
router.patch('/admin/reports/:reportId', async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;
    const updateData = req.body;

    const [updatedReport] = await db
      .update(bugReports)
      .set({
        ...updateData,
        updated_at: new Date(),
        resolved_at: updateData.status === 'resolved' ? new Date() : undefined,
      })
      .where(eq(bugReports.id, reportId))
      .returning();

    if (!updatedReport) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    res.json({ report: updatedReport });
  } catch (error) {
    console.error('Error updating bug report:', error);
    res.status(500).json({ error: 'Failed to update bug report' });
  }
});

// Assign admin to bug report
router.post('/admin/reports/:reportId/assign', async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reportId } = req.params;

    const [updatedReport] = await db
      .update(bugReports)
      .set({
        assigned_admin_id: req.user.id,
        status: 'in_progress',
        updated_at: new Date(),
      })
      .where(eq(bugReports.id, reportId))
      .returning();

    if (!updatedReport) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    res.json({ report: updatedReport });
  } catch (error) {
    console.error('Error assigning bug report:', error);
    res.status(500).json({ error: 'Failed to assign bug report' });
  }
});

export default router;