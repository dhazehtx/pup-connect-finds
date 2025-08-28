import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { insertNotificationSchema } from "@shared/schema";

const router = Router();

// Get notifications for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:actor_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[NOTIFICATIONS] Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    res.json({ notifications: notifications || [] });

  } catch (error) {
    console.error('[NOTIFICATIONS] Fetch error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Get unread count for a user
router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[NOTIFICATIONS] Error counting unread:', error);
      return res.status(500).json({ error: 'Failed to count unread notifications' });
    }

    res.json({ unread_count: count || 0 });

  } catch (error) {
    console.error('[NOTIFICATIONS] Count error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('recipient_id')
      .eq('id', id)
      .single();

    if (fetchError || !notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.recipient_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('[NOTIFICATIONS] Error marking as read:', error);
      return res.status(500).json({ error: 'Failed to mark as read' });
    }

    res.json({ ok: true });

  } catch (error) {
    console.error('[NOTIFICATIONS] Mark read error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Mark all notifications as read for a user
router.patch("/mark-all-read", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[NOTIFICATIONS] Error marking all as read:', error);
      return res.status(500).json({ error: 'Failed to mark all as read' });
    }

    res.json({ ok: true });

  } catch (error) {
    console.error('[NOTIFICATIONS] Mark all read error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Create notification (internal API)
router.post("/", async (req, res) => {
  try {
    const validatedData = insertNotificationSchema.parse(req.body);
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(validatedData)
      .select('*')
      .single();

    if (error) {
      console.error('[NOTIFICATIONS] Error creating notification:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }

    res.json(notification);

  } catch (error) {
    console.error('[NOTIFICATIONS] Create error:', error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;