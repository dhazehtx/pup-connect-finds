import { debugApiLog, debugApiWarn } from './/debugApi';
import { db } from "../db";
import { notifications } from "@shared/schema";
import { emitToUser } from "../socket";

interface NotificationInput {
  toUserId: string;
  fromUserId: string;
  type: string;
  title: string;
  message: string;
  postId?: string;
  commentId?: string;
  relatedId?: string;
  targetUrl?: string;
}

export async function createNotification(input: NotificationInput): Promise<void> {
  try {
    if (input.toUserId === input.fromUserId) return;

    const [notification] = await db
      .insert(notifications)
      .values({
        toUserId: input.toUserId,
        fromUserId: input.fromUserId,
        type: input.type,
        title: input.title,
        message: input.message,
        actorId: input.fromUserId,
        postId: input.postId || null,
        commentId: input.commentId || null,
        relatedId: input.relatedId || null,
        targetUrl: input.targetUrl || null,
        isRead: false,
        read: false,
      })
      .returning();

    if (notification) {
      emitToUser(input.toUserId, 'notification:new', notification);
    }

    debugApiLog('[PROOF:NOTIF:CREATE]', JSON.stringify({
      toUserId: input.toUserId,
      fromUserId: input.fromUserId,
      type: input.type,
      ts: Date.now()
    }));
  } catch (error: any) {
    debugApiLog('[PROOF:NOTIF:CREATE:ERR]', JSON.stringify({ type: input.type, error: error?.message, ts: Date.now() }));
  }
}
