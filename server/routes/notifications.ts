import { Router } from 'express';
import { db } from '../db';
import { enhancedNotifications as notifications, profiles } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

const router = Router();

// Get user's notifications
router.get('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { page = '1', limit = '20', unread_only = 'false' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const filters = [eq(notifications.user_id, req.user!.id)];
    
    if (unread_only === 'true') {
      filters.push(eq(notifications.read, false));
    }

    // Get notifications with actor details
    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        target_id: notifications.target_id,
        target_type: notifications.target_type,
        content: notifications.content,
        read: notifications.read,
        grouped_count: notifications.grouped_count,
        created_at: notifications.created_at,
        actor_id: profiles.id,
        actor_name: profiles.full_name,
        actor_username: profiles.username,
        actor_avatar: profiles.avatar_url
      })
      .from(notifications)
      .leftJoin(profiles, eq(notifications.actor_id, profiles.id))
      .where(and(...filters))
      .orderBy(desc(notifications.created_at))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(...filters));

    // Get unread count
    const [unreadResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.user_id, req.user!.id),
        eq(notifications.read, false)
      ));

    res.json({
      notifications: userNotifications,
      total: totalResult.count,
      unread: unreadResult.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalResult.count / limitNum)
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create notification (for internal use by other routes)
router.post('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { user_id, actor_id, type, target_id, target_type, content } = req.body;

    // Don't notify yourself
    if (user_id === actor_id) {
      return res.json({ message: 'Self-notification skipped' });
    }

    // Check for existing similar notification to group them
    const [existingNotification] = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.user_id, user_id),
        eq(notifications.type, type),
        eq(notifications.target_id, target_id || ''),
        eq(notifications.target_type, target_type || ''),
        sql`${notifications.created_at} > NOW() - INTERVAL '1 hour'`
      ))
      .orderBy(desc(notifications.created_at))
      .limit(1);

    if (existingNotification) {
      // Update existing notification to group it
      const [updatedNotification] = await db
        .update(notifications)
        .set({
          grouped_count: (existingNotification.grouped_count || 0) + 1,
          actor_id: actor_id, // Update to most recent actor
          created_at: new Date(), // Update timestamp
          read: false // Mark as unread again
        })
        .where(eq(notifications.id, existingNotification.id))
        .returning();

      res.json({
        message: 'Notification grouped successfully',
        notification: updatedNotification
      });
    } else {
      // Create new notification
      const [notification] = await db
        .insert(notifications)
        .values({
          user_id,
          actor_id,
          type,
          target_id: target_id || null,
          target_type: target_type || null,
          content: content || null,
          grouped_count: 1
        })
        .returning();

      res.status(201).json({
        message: 'Notification created successfully',
        notification
      });
    }

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.post('/:notificationId/read', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { notificationId } = req.params;

    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.user_id, req.user!.id)
      ))
      .returning();

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.user_id, req.user!.id),
        eq(notifications.read, false)
      ));

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clear all notifications
router.delete('/clear', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await db
      .delete(notifications)
      .where(eq(notifications.user_id, req.user!.id));

    res.json({ message: 'All notifications cleared' });

  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to create notifications (exported for use in other routes)
export const createNotification = async (
  user_id: string,
  actor_id: string,
  type: string,
  target_id?: string,
  target_type?: string,
  content?: string
) => {
  try {
    if (user_id === actor_id) return; // Don't notify yourself

    // Check for existing similar notification to group them
    const [existingNotification] = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.user_id, user_id),
        eq(notifications.type, type),
        eq(notifications.target_id, target_id || ''),
        eq(notifications.target_type, target_type || ''),
        sql`${notifications.created_at} > NOW() - INTERVAL '1 hour'`
      ))
      .orderBy(desc(notifications.created_at))
      .limit(1);

    if (existingNotification) {
      // Update existing notification to group it
      await db
        .update(notifications)
        .set({
          grouped_count: (existingNotification.grouped_count || 0) + 1,
          actor_id: actor_id,
          created_at: new Date(),
          read: false
        })
        .where(eq(notifications.id, existingNotification.id));
    } else {
      // Create new notification
      await db
        .insert(notifications)
        .values({
          user_id,
          actor_id,
          type,
          target_id: target_id || null,
          target_type: target_type || null,
          content: content || null,
          grouped_count: 1
        });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export default router;