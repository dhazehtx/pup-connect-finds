import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { db } from '../db';
import { notificationPreferences } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/notifications?cursor=<iso>&limit=30&unreadOnly=false
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 30;
    const unreadOnly = req.query.unreadOnly === 'true';
    const countOnly = req.query.count === '1';

    if (countOnly) {
      const unreadCount = await notificationService.getUnreadCount(userId);
      return res.json({ count: unreadCount });
    }

    const result = await notificationService.getUserNotifications(userId, {
      cursor,
      limit,
      unreadOnly
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications/mark-read
const markReadSchema = z.object({
  id: z.string().uuid().optional(),
  all: z.boolean().optional()
});

router.post('/mark-read', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { id, all } = req.body;

    if (all) {
      await notificationService.markAllNotificationsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } else if (id) {
      await notificationService.markNotificationRead(id, userId);
      res.json({ success: true, message: 'Notification marked as read' });
    } else {
      res.status(400).json({ error: 'Either id or all must be provided' });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// GET /api/notification-preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const preferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (preferences.length === 0) {
      // Return default preferences if none exist
      const defaultPrefs = {
        userId,
        likes: true,
        comments: true,
        follows: true,
        messages: true,
        orderUpdates: true,
        providerApp: true,
        quietHoursStart: null,
        quietHoursEnd: null
      };
      
      // Create default preferences
      await db.insert(notificationPreferences).values(defaultPrefs);
      return res.json(defaultPrefs);
    }

    res.json(preferences[0]);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// POST /api/notification-preferences
const preferencesSchema = z.object({
  likes: z.boolean().optional(),
  comments: z.boolean().optional(),
  follows: z.boolean().optional(),
  messages: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  providerApp: z.boolean().optional(),
  quietHoursStart: z.string().nullable().optional(),
  quietHoursEnd: z.string().nullable().optional()
});

router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const updateData = { ...req.body, userId };

    // Upsert preferences
    await db
      .insert(notificationPreferences)
      .values(updateData)
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: updateData
      });

    res.json({ success: true, message: 'Notification preferences updated' });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

export default router;