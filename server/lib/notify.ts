import { db } from '../db';
import { notifications, notificationPreferences, admins } from '../../shared/schema';
import { eq, and, gte, count, sql, desc, isNull } from 'drizzle-orm';

type NType =
  | 'like' | 'comment' | 'follow' | 'message'
  | 'order_paid' | 'order_refund'
  | 'provider_app_submitted' | 'provider_app_approved' | 'provider_app_rejected';

type NotifyArgs = {
  recipientId: string;
  actorId?: string | null;
  type: NType;
  entityTable?: string | null;
  entityId?: string | null;
  message: string;
  meta?: Record<string, any>;
  targetUrl?: string;     // absolute route like '/post/123'
};

const THROTTLE_MAX_PER_10M = 20;

function bucket15m(): string {
  const now = new Date();
  const minutes15 = Math.floor(now.getMinutes() / 15) * 15;
  const bucket = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), minutes15, 0, 0);
  return bucket.toISOString();
}

export async function createNotification(args: NotifyArgs) {
  try {
    // 1) Throttle per (actor->recipient) in last 10m to avoid spam
    if (args.actorId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      const throttleResult = await db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.toUserId, args.recipientId),
            eq(notifications.fromUserId, args.actorId),
            gte(notifications.createdAt, tenMinutesAgo)
          )
        );

      if (throttleResult[0]?.count && throttleResult[0].count > THROTTLE_MAX_PER_10M) {
        return { throttled: true };
      }
    }

    // 2) Respect recipient preferences (if row absent, assume true)
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, args.recipientId))
      .limit(1);

    const pref = prefs[0];
    const typeKey =
      args.type === 'like' ? 'likes'
      : args.type === 'comment' ? 'comments'
      : args.type === 'follow' ? 'follows'
      : args.type === 'message' ? 'messages'
      : args.type.startsWith('order_') ? 'orderUpdates'
      : 'providerApp';
    
    if (pref && pref[typeKey] === false) return { suppressed: true };

    // 3) Burst grouping within 15m for same (recipient, type, entityId)
    const bucket = bucket15m();
    const bucketKey = `${args.recipientId}:${args.type}:${args.entityId ?? ''}:${bucket}`;

    // Try to find an existing row in same bucket to update message/meta
    const existingNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.toUserId, args.recipientId),
          eq(notifications.type, args.type),
          eq(notifications.entityId, args.entityId ?? ''),
          eq(notifications.bucketKey, bucketKey)
        )
      )
      .limit(1);

    const existing = existingNotifications[0];

    if (existing) {
      const meta = existing.meta as any || {};
      const actors: string[] = Array.from(new Set([...(meta.actors ?? []), args.actorId].filter(Boolean))) as string[];
      meta.actors = actors;
      const groupedMsg = actors.length > 1
        ? `${args.message} (+${actors.length - 1} others)`
        : args.message;

      await db
        .update(notifications)
        .set({ 
          meta, 
          message: groupedMsg, 
          createdAt: new Date()
        })
        .where(eq(notifications.id, existing.id));

      return { grouped: true, id: existing.id };
    }

    // Insert new notification
    const newNotification = await db
      .insert(notifications)
      .values({
        toUserId: args.recipientId,
        fromUserId: args.actorId,
        actorId: args.actorId,
        type: args.type,
        entityTable: args.entityTable,
        entityId: args.entityId,
        message: args.message,
        meta: args.meta ?? {},
        targetUrl: args.targetUrl,
        bucketKey,
        isRead: false,
        readAt: null,
        createdAt: new Date()
      })
      .returning({ id: notifications.id });

    return { id: newNotification[0].id };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/** Fanout to all admins for provider app submissions */
export async function notifyAllAdminsProviderSubmission(appId: string, actorId: string, providerId: string) {
  try {
    const adminUsers = await db.select().from(admins);
    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admins found for provider app notification');
      return;
    }

    await Promise.all(
      adminUsers.map(admin => createNotification({
        recipientId: admin.userId,
        actorId,
        type: 'provider_app_submitted',
        entityTable: 'provider_applications',
        entityId: appId,
        message: 'New provider application submitted.',
        meta: { providerId: providerId, applicationId: appId },
        targetUrl: `/admin/applications?app=${appId}`
      }))
    );
  } catch (error) {
    console.error('Error notifying admins:', error);
    throw error;
  }
}

/** Mark notification as read */
export async function markNotificationRead(notificationId: string, userId: string) {
  try {
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.toUserId, userId)
        )
      );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/** Mark all notifications as read for user */
export async function markAllNotificationsRead(userId: string) {
  try {
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(notifications.toUserId, userId),
          eq(notifications.isRead, false)
        )
      );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/** Get notifications for user with pagination */
export async function getUserNotifications(
  userId: string, 
  options: {
    cursor?: string;
    limit?: number;
    unreadOnly?: boolean;
  } = {}
) {
  try {
    const { cursor, limit = 30, unreadOnly = false } = options;
    
    let whereConditions = [eq(notifications.toUserId, userId)];
    
    if (unreadOnly) {
      whereConditions.push(eq(notifications.isRead, false));
    }
    
    if (cursor) {
      whereConditions.push(sql`${notifications.createdAt} < ${cursor}`);
    }
    
    const result = await db
      .select()
      .from(notifications)
      .where(and(...whereConditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit + 1); // Get one extra to check if there are more
    
    const hasMore = result.length > limit;
    const items = hasMore ? result.slice(0, -1) : result;
    const nextCursor = hasMore && items.length > 0 
      ? items[items.length - 1].createdAt?.toISOString() 
      : null;
    
    return {
      items,
      hasMore,
      nextCursor
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
}

/** Get unread notification count */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.toUserId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}