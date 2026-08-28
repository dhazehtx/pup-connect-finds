import { Router } from 'express';
import { db } from '../db';
import {
  supportTickets,
  supportTicketReplies,
  profiles,
  userPreferences,
  contactMessages
} from '@shared/schema';
import { eq, and, desc, count, sql, asc, like, or } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { strictRateLimit } from '../middleware/rateLimiting';

const router = Router();

// Allowed contact categories — server-authoritative so the client cannot inject
// arbitrary values. Mirrors the public /contact form.
const CONTACT_CATEGORIES = new Set([
  'General inquiry', 'Orders & shipping', 'Pup Box & subscriptions', 'Account & sign-in',
  'Payments & billing', 'Safety & trust', 'Technical issue', 'Partnerships', 'Other',
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * POST /api/support/contact — public (guest OR authenticated) contact submission.
 * Persists to contact_messages and returns 201 ONLY after the row is written, so
 * the UI never shows a false success. The server controls every stored field
 * (status/ip/user_agent/user_id); the client cannot set them or spoof identity.
 */
router.post('/contact', strictRateLimit, async (req: Request, res: Response) => {
  try {
    const name = clip(req.body?.name, 100);
    const email = clip(req.body?.email, 254);
    const category = clip(req.body?.category, 60);
    const subject = clip(req.body?.subject, 200);
    const message = clip(req.body?.message, 5000);

    const errors: string[] = [];
    if (name.length < 1) errors.push('name is required');
    if (!EMAIL_RE.test(email)) errors.push('a valid email is required');
    if (!CONTACT_CATEGORIES.has(category)) errors.push('a valid category is required');
    if (message.length < 10) errors.push('message must be at least 10 characters');
    if (errors.length > 0) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_FAILED', details: errors });
    }

    // Identity comes from the session, never the request body (no spoofing).
    const userId = (req.isAuthenticated?.() && (req.user as any)?.id) ? (req.user as any).id : null;

    const [row] = await db
      .insert(contactMessages)
      .values({
        user_id: userId,
        name,
        email,
        category,
        subject: subject || null,
        message,
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
        user_agent: clip(req.headers['user-agent'], 500) || null,
      })
      .returning({ id: contactMessages.id });

    // Do not log message/email bodies (avoid PII in logs); id + category only.
    console.info('[contact] message stored', { id: row?.id, category });
    return res.status(201).json({ ok: true, id: row?.id });
  } catch (error) {
    console.error('[contact] failed to store message:', (error as Error)?.message);
    return res.status(500).json({ ok: false, error: 'CONTACT_STORE_FAILED' });
  }
});

// Get all support tickets for authenticated user
router.get('/tickets', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { page = '1', limit = '10', status, category } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereConditions = [eq(supportTickets.user_id, req.user!.id)];
    
    if (status && status !== 'all') {
      whereConditions.push(eq(supportTickets.status, status as string));
    }
    
    if (category && category !== 'all') {
      whereConditions.push(eq(supportTickets.category, category as string));
    }

    const tickets = await db
      .select({
        id: supportTickets.id,
        category: supportTickets.category,
        subject: supportTickets.subject,
        description: supportTickets.description,
        status: supportTickets.status,
        priority: supportTickets.priority,
        attachment_url: supportTickets.attachment_url,
        admin_notes: supportTickets.admin_notes,
        resolution: supportTickets.resolution,
        created_at: supportTickets.created_at,
        updated_at: supportTickets.updated_at,
        resolved_at: supportTickets.resolved_at,
        assigned_admin_name: profiles.full_name
      })
      .from(supportTickets)
      .leftJoin(profiles, eq(supportTickets.assigned_admin_id, profiles.id))
      .where(and(...whereConditions))
      .orderBy(desc(supportTickets.created_at))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(and(...whereConditions));

    res.json({
      tickets,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new support ticket
router.post('/tickets', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const {
      category,
      subject,
      description,
      attachment_url,
      priority = 'medium'
    } = req.body;

    if (!category || !description) {
      return res.status(400).json({ 
        message: 'Category and description are required' 
      });
    }

    const [newTicket] = await db
      .insert(supportTickets)
      .values({
        user_id: req.user!.id,
        category,
        subject,
        description,
        attachment_url,
        priority
      })
      .returning();

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: newTicket
    });

  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get ticket replies
router.get('/tickets/:ticketId/replies', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { ticketId } = req.params;

    // Verify user owns this ticket
    const [ticket] = await db
      .select({ user_id: supportTickets.user_id })
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .limit(1);

    if (!ticket || ticket.user_id !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const replies = await db
      .select({
        id: supportTicketReplies.id,
        message: supportTicketReplies.message,
        is_admin_reply: supportTicketReplies.is_admin_reply,
        attachment_url: supportTicketReplies.attachment_url,
        created_at: supportTicketReplies.created_at,
        author_name: profiles.full_name,
        author_avatar: profiles.avatar_url
      })
      .from(supportTicketReplies)
      .leftJoin(profiles, eq(supportTicketReplies.author_id, profiles.id))
      .where(eq(supportTicketReplies.ticket_id, ticketId))
      .orderBy(asc(supportTicketReplies.created_at));

    res.json({ replies });

  } catch (error) {
    console.error('Error fetching ticket replies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add reply to ticket
router.post('/tickets/:ticketId/replies', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { ticketId } = req.params;
    const { message, attachment_url } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Verify user owns this ticket
    const [ticket] = await db
      .select({ user_id: supportTickets.user_id, status: supportTickets.status })
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .limit(1);

    if (!ticket || ticket.user_id !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({ message: 'Cannot reply to closed ticket' });
    }

    // Add reply
    const [newReply] = await db
      .insert(supportTicketReplies)
      .values({
        ticket_id: ticketId,
        author_id: req.user!.id,
        message,
        attachment_url,
        is_admin_reply: false
      })
      .returning();

    // Update ticket status to show user activity
    await db
      .update(supportTickets)
      .set({ 
        status: 'open',
        updated_at: new Date()
      })
      .where(eq(supportTickets.id, ticketId));

    res.status(201).json({
      message: 'Reply added successfully',
      reply: newReply
    });

  } catch (error) {
    console.error('Error adding ticket reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN ROUTES

// Get all support tickets (admin only)
router.get('/admin/tickets', async (req, res) => {
  if (!req.isAuthenticated() || !req.user!.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const { 
      page = '1', 
      limit = '10', 
      status, 
      category, 
      priority,
      search,
      assigned 
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereConditions: any[] = [];
    
    if (status && status !== 'all') {
      whereConditions.push(eq(supportTickets.status, status as string));
    }
    
    if (category && category !== 'all') {
      whereConditions.push(eq(supportTickets.category, category as string));
    }
    
    if (priority && priority !== 'all') {
      whereConditions.push(eq(supportTickets.priority, priority as string));
    }

    if (assigned === 'me') {
      whereConditions.push(eq(supportTickets.assigned_admin_id, req.user!.id));
    } else if (assigned === 'unassigned') {
      whereConditions.push(sql`${supportTickets.assigned_admin_id} IS NULL`);
    }

    if (search) {
      whereConditions.push(
        or(
          like(supportTickets.subject, `%${search}%`),
          like(supportTickets.description, `%${search}%`)
        )
      );
    }

    const tickets = await db
      .select({
        id: supportTickets.id,
        category: supportTickets.category,
        subject: supportTickets.subject,
        description: supportTickets.description,
        status: supportTickets.status,
        priority: supportTickets.priority,
        attachment_url: supportTickets.attachment_url,
        admin_notes: supportTickets.admin_notes,
        resolution: supportTickets.resolution,
        created_at: supportTickets.created_at,
        updated_at: supportTickets.updated_at,
        resolved_at: supportTickets.resolved_at,
        user_name: profiles.full_name,
        user_email: profiles.email,
        user_avatar: profiles.avatar_url,
        assigned_admin_name: sql`assigned_admin.full_name`.as('assigned_admin_name')
      })
      .from(supportTickets)
      .leftJoin(profiles, eq(supportTickets.user_id, profiles.id))
      .leftJoin(sql`${profiles} AS assigned_admin`, eq(supportTickets.assigned_admin_id, sql`assigned_admin.id`))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(
        // Priority order: urgent, high, medium, low
        sql`CASE ${supportTickets.priority} 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
          END`,
        desc(supportTickets.created_at)
      )
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Get stats
    const stats = await db
      .select({
        status: supportTickets.status,
        count: count()
      })
      .from(supportTickets)
      .groupBy(supportTickets.status);

    const statusStats = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      statusStats[stat.status as keyof typeof statusStats] = stat.count;
    });

    res.json({
      tickets,
      total: totalResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum),
      stats: statusStats
    });

  } catch (error) {
    console.error('Error fetching admin support tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update ticket status/assignment (admin only)
router.patch('/admin/tickets/:ticketId', async (req, res) => {
  if (!req.isAuthenticated() || !req.user!.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const { ticketId } = req.params;
    const {
      status,
      priority,
      assigned_admin_id,
      admin_notes,
      resolution
    } = req.body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assigned_admin_id !== undefined) updateData.assigned_admin_id = assigned_admin_id;
    if (admin_notes) updateData.admin_notes = admin_notes;
    if (resolution) updateData.resolution = resolution;
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date();
    }

    const [updatedTicket] = await db
      .update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, ticketId))
      .returning();

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin reply to ticket
router.post('/admin/tickets/:ticketId/replies', async (req, res) => {
  if (!req.isAuthenticated() || !req.user!.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const { ticketId } = req.params;
    const { message, attachment_url, updateStatus } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Verify ticket exists
    const [ticket] = await db
      .select({ id: supportTickets.id })
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .limit(1);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Add admin reply
    const [newReply] = await db
      .insert(supportTicketReplies)
      .values({
        ticket_id: ticketId,
        author_id: req.user!.id,
        message,
        attachment_url,
        is_admin_reply: true
      })
      .returning();

    // Update ticket if status change requested
    if (updateStatus) {
      await db
        .update(supportTickets)
        .set({ 
          status: updateStatus,
          assigned_admin_id: req.user!.id,
          updated_at: new Date(),
          ...(updateStatus === 'resolved' || updateStatus === 'closed' ? { resolved_at: new Date() } : {})
        })
        .where(eq(supportTickets.id, ticketId));
    }

    res.status(201).json({
      message: 'Admin reply added successfully',
      reply: newReply
    });

  } catch (error) {
    console.error('Error adding admin reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user preferences (for theme)
router.get('/preferences', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.user_id, req.user!.id))
      .limit(1);

    if (!preferences) {
      // Create default preferences
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          user_id: req.user!.id
        })
        .returning();
      
      return res.json(newPreferences);
    }

    res.json(preferences);

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user preferences (including theme)
router.patch('/preferences', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    // Try to update existing preferences
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.user_id, req.user!.id))
      .returning();

    if (!updatedPreferences) {
      // Create new preferences if none exist
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          user_id: req.user!.id,
          ...updateData
        })
        .returning();
      
      return res.json(newPreferences);
    }

    res.json(updatedPreferences);

  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;