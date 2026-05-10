import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Router } from "express";
import { db } from "../db";
import { notifications, profiles } from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { insertNotificationSchema } from "@shared/schema";
import { emitToUser } from "../socket";
import { alias } from "drizzle-orm/pg-core";
import { getBlockedUserIds } from "../lib/isBlocked";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json([]);
    }

    const fromProfile = alias(profiles, 'from_profile');

    const data = await db
      .select({
        id: notifications.id,
        toUserId: notifications.toUserId,
        fromUserId: notifications.fromUserId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        read: notifications.read,
        relatedId: notifications.relatedId,
        postId: notifications.postId,
        commentId: notifications.commentId,
        messageId: notifications.messageId,
        actorId: notifications.actorId,
        entityTable: notifications.entityTable,
        entityId: notifications.entityId,
        meta: notifications.meta,
        isRead: notifications.isRead,
        targetUrl: notifications.targetUrl,
        readAt: notifications.readAt,
        bucketKey: notifications.bucketKey,
        createdAt: notifications.createdAt,
        fromProfileId: fromProfile.id,
        fromProfileUsername: fromProfile.username,
        fromProfileFullName: fromProfile.full_name,
        fromProfileAvatarUrl: fromProfile.avatar_url,
      })
      .from(notifications)
      .leftJoin(fromProfile, eq(notifications.fromUserId, fromProfile.id))
      .where(eq(notifications.toUserId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    let filteredData = data ?? [];
    if (userId) {
      const blockedIds = await getBlockedUserIds(userId);
      if (blockedIds.length > 0) {
        const blockedSet = new Set(blockedIds);
        const before = filteredData.length;
        filteredData = filteredData.filter((row) => !blockedSet.has(row.fromUserId || '') && !blockedSet.has(row.actorId || ''));
        const filteredCount = before - filteredData.length;
        if (filteredCount > 0) {
          debugApiLog('[PROOF:BLOCK:READ]', JSON.stringify({ actorUserId: userId, filteredCount, domain: 'notifications', ts: Date.now() }));
        }
      }
    }

    const shaped = filteredData.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message || '',
      isRead: row.isRead ?? false,
      is_read: row.isRead ?? false,
      read: row.read ?? false,
      createdAt: row.createdAt,
      created_at: row.createdAt,
      readAt: row.readAt,
      targetUrl: row.targetUrl,
      toUserId: row.toUserId,
      to_user_id: row.toUserId,
      fromUserId: row.fromUserId,
      from_user_id: row.fromUserId,
      actorId: row.actorId,
      postId: row.postId,
      post_id: row.postId,
      commentId: row.commentId,
      comment_id: row.commentId,
      messageId: row.messageId,
      relatedId: row.relatedId,
      entityTable: row.entityTable,
      entityId: row.entityId,
      meta: row.meta,
      bucketKey: row.bucketKey,
      from_profile: {
        id: row.fromProfileId || row.fromUserId || null,
        full_name: row.fromProfileFullName || null,
        username: row.fromProfileUsername || null,
        avatar_url: row.fromProfileAvatarUrl || null,
      },
      actor: {
        id: row.fromProfileId || row.actorId || null,
        full_name: row.fromProfileFullName || null,
        avatar_url: row.fromProfileAvatarUrl || null,
      },
    }));

    return res.status(200).json(shaped);
  } catch (err) {
    debugApiLog('[PROOF:NOTIFS:ERR]', { error: String(err), stack: (err as any)?.stack, ts: Date.now() });
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

    const count = Number(result[0]?.count) || 0;
    debugApiLog('[PROOF:NOTIFS:UNREAD_COUNT]', JSON.stringify({ userId, count, ts: Date.now() }));
    res.json({ unread_count: count });
  } catch (error: any) {
    debugApiLog('[PROOF:NOTIFS:ERR]', JSON.stringify({ route: 'unread-count', error: error?.message, ts: Date.now() }));
    return res.status(200).json({ unread_count: 0 });
  }
});

router.get("/badge", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json({ unread_count: 0, has_unread: false, ts: Date.now() });
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

    const count = Number(result[0]?.count) || 0;
    debugApiLog('[PROOF:NOTIFS:BADGE]', JSON.stringify({ userId, count, has_unread: count > 0, ts: Date.now() }));
    res.json({ unread_count: count, has_unread: count > 0, ts: Date.now() });
  } catch (error: any) {
    debugApiLog('[PROOF:NOTIFS:ERR]', JSON.stringify({ route: 'badge', code: 'BADGE_FAILED', error: error?.message, ts: Date.now() }));
    return res.status(200).json({ unread_count: 0, has_unread: false, ts: Date.now() });
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
