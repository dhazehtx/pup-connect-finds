import { Router } from "express";
import { db } from "../db";
import { notifications } from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { insertNotificationSchema } from "@shared/schema";
import { emitToUser } from "../socket";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json([]);
    }

    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.toUserId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return res.status(200).json(data ?? []);
  } catch (err) {
    console.error('Unexpected /notifications error:', err);
    return res.status(200).json([]);
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json({ unread_count: 0 });
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.toUserId, userId),
          eq(notifications.isRead, false)
        )
      );

    res.json({ unread_count: Number(result[0]?.count) || 0 });
  } catch (error) {
    console.error('[NOTIFICATIONS] Count error:', error);
    return res.status(200).json({ unread_count: 0 });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const existing = await db
      .select({ toUserId: notifications.toUserId })
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing.length) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (existing[0].toUserId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id));

    res.json({ ok: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] Mark read error:', error);
    res.status(500).json({ error: String(error) });
  }
});

router.patch("/mark-all-read", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.toUserId, userId),
          eq(notifications.isRead, false)
        )
      );

    res.json({ ok: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] Mark all read error:', error);
    res.status(500).json({ error: String(error) });
  }
});

router.delete("/clear", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.toUserId, userId));

    res.json({ ok: true });
  } catch (error) {
    console.error('[NOTIFICATIONS] Clear error:', error);
    res.status(500).json({ error: String(error) });
  }
});

router.post("/", async (req, res) => {
  try {
    const validatedData = insertNotificationSchema.parse(req.body);

    const [notification] = await db
      .insert(notifications)
      .values(validatedData)
      .returning();

    if (notification && validatedData.toUserId) {
      emitToUser(validatedData.toUserId, 'notification:new', notification);
    }

    res.json(notification);
  } catch (error) {
    console.error('[NOTIFICATIONS] Create error:', error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
