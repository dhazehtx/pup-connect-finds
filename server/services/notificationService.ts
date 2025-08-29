import { eq, and, desc, gt, count, isNull, or } from 'drizzle-orm';
import { db } from '../db';
import { notifications, notificationPreferences, admins } from '../../shared/schema';

export interface NotificationArgs {
  recipientId: string;
  actorId?: string;
  type: string;
  message: string;
  entityTable?: string;
  entityId?: string;
  targetUrl?: string;
  meta?: Record<string, any>;
}

interface GetNotificationsOptions {
  cursor?: string;
  limit?: number;
  unreadOnly?: boolean;
}

interface NotificationResult {
  notifications: any[];
  nextCursor?: string;
  hasMore: boolean;
}

export class NotificationService {
  
  async createNotification(args: NotificationArgs): Promise<void> {
    try {
      // Check user preferences
      const preferences = await this.getUserPreferences(args.recipientId);
      if (!this.shouldSendNotification(args.type, preferences)) {
        return;
      }

      // Generate bucket key for grouping similar notifications
      const bucketKey = this.generateBucketKey(args);

      // Check for existing notifications to group
      const existingNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.toUserId, args.recipientId),
            eq(notifications.bucketKey, bucketKey),
            eq(notifications.read, false),
            gt(notifications.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)) // within 24 hours
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(1);

      const existing = existingNotifications[0];

      if (existing) {
        // Update existing notification with new actor
        const meta = (existing.meta as any) || {};
        const actors: string[] = Array.from(new Set([...(meta.actors ?? []), args.actorId].filter(Boolean))) as string[];
        meta.actors = actors;
        
        const groupedMessage = actors.length > 1
          ? `${args.message} (+${actors.length - 1} others)`
          : args.message;

        await db
          .update(notifications)
          .set({
            message: groupedMessage,
            meta: meta,
            createdAt: new Date()
          })
          .where(eq(notifications.id, existing.id));
      } else {
        // Create new notification
        await db.insert(notifications).values({
          toUserId: args.recipientId,
          fromUserId: args.actorId,
          actorId: args.actorId,
          type: args.type,
          message: args.message,
          entityTable: args.entityTable,
          entityId: args.entityId,
          targetUrl: args.targetUrl,
          bucketKey,
          meta: args.meta || {},
          read: false,
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  async getUserNotifications(userId: string, options: GetNotificationsOptions = {}): Promise<NotificationResult> {
    const { cursor, limit = 30, unreadOnly = false } = options;

    let query = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.toUserId, userId),
          unreadOnly ? eq(notifications.read, false) : undefined,
          cursor ? gt(notifications.createdAt, new Date(cursor)) : undefined
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit + 1); // Get one extra to check if there are more

    const results = await query;
    const hasMore = results.length > limit;
    const notificationsList = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? notificationsList[notificationsList.length - 1]?.createdAt?.toISOString() : undefined;

    return {
      notifications: notificationsList,
      nextCursor,
      hasMore
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.toUserId, userId),
          eq(notifications.read, false)
        )
      );

    return result[0]?.count || 0;
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        read: true,
        isRead: true,
        readAt: new Date()
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.toUserId, userId)
        )
      );
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        read: true,
        isRead: true,
        readAt: new Date()
      })
      .where(eq(notifications.toUserId, userId));
  }

  async getUserPreferences(userId: string) {
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    return prefs[0] || {
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      orderUpdates: true,
      providerApp: true
    };
  }

  private shouldSendNotification(type: string, preferences: any): boolean {
    const typeMap: Record<string, string> = {
      'like': 'likes',
      'comment': 'comments',
      'follow': 'follows',
      'message': 'messages',
      'order_paid': 'orderUpdates',
      'provider_app_submitted': 'providerApp'
    };

    const prefKey = typeMap[type];
    return prefKey ? preferences[prefKey] !== false : true;
  }

  private generateBucketKey(args: NotificationArgs): string {
    // Create bucket key for grouping similar notifications
    return `${args.type}_${args.entityTable || 'general'}_${args.entityId || 'none'}`;
  }

  async notifyAdmins(args: Omit<NotificationArgs, 'recipientId'>): Promise<void> {
    try {
      const adminUsers = await db.select().from(admins);
      
      const notifications_batch = adminUsers.map(admin => ({
        ...args,
        recipientId: admin.userId
      }));

      // Send notifications to all admins
      await Promise.all(
        notifications_batch.map(notif => this.createNotification(notif))
      );
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }
}

export const notificationService = new NotificationService();