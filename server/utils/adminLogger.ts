import { storage } from "../storage";
import { InsertAdminLog } from "@shared/schema";

/**
 * Utility function to log admin actions for CRUD operations
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  metadata?: any
): Promise<void> {
  try {
    const logEntry: InsertAdminLog = {
      admin_id: adminId,
      action,
      metadata
    };
    
    await storage.createAdminLog(logEntry);
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Log post-related actions
 */
export const logPostAction = (adminId: string, action: 'create' | 'update' | 'delete', postId: string) =>
  logAdminAction(adminId, `${action} post`, { entity: 'post', entity_id: postId });

/**
 * Log comment-related actions
 */
export const logCommentAction = (adminId: string, action: 'create' | 'update' | 'delete', commentId: string) =>
  logAdminAction(adminId, `${action} comment`, { entity: 'comment', entity_id: commentId });

/**
 * Log subscription-related actions
 */
export const logSubscriptionAction = (adminId: string, action: 'create' | 'update' | 'delete', subscriptionId: string) =>
  logAdminAction(adminId, `${action} subscription`, { entity: 'subscription', entity_id: subscriptionId });

/**
 * Log listing-related actions
 */
export const logListingAction = (adminId: string, action: 'create' | 'update' | 'delete', listingId: string) =>
  logAdminAction(adminId, `${action} listing`, { entity: 'listing', entity_id: listingId });

/**
 * Log user-related actions
 */
export const logUserAction = (adminId: string, action: 'create' | 'update' | 'delete', targetUserId: string) =>
  logAdminAction(adminId, `${action} user`, { entity: 'user', entity_id: targetUserId });