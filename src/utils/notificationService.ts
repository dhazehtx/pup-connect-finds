
import { supabase } from '@/integrations/supabase/client';
import { NotificationData } from '@/types/messaging';
import { getNotificationTemplate } from '@/components/notifications/NotificationTemplates';

export class NotificationService {
  static async createNotification(
    userId: string,
    type: string,
    data: any,
    priority: NotificationData['priority'] = 'medium'
  ) {
    const template = getNotificationTemplate(type, data);
    
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type as NotificationData['type'],
          title: template.title,
          message: template.message,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async createBulkNotifications(notifications: Array<{
    userId: string;
    type: string;
    data: any;
    priority?: NotificationData['priority'];
  }>) {
    const notificationData = notifications.map(({ userId, type, data, priority = 'medium' }) => {
      const template = getNotificationTemplate(type, data);
      return {
        user_id: userId,
        type: type as NotificationData['type'],
        title: template.title,
        message: template.message,
        is_read: false
      };
    });

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  static async sendMessageNotification(senderId: string, recipientId: string, conversationId: string) {
    // Get sender info
    const { data: sender } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', senderId)
      .single();

    await this.createNotification(recipientId, 'message', {
      senderName: sender?.full_name || 'Someone',
      conversationId
    });
  }

  static async sendPaymentNotification(
    recipientId: string, 
    amount: number, 
    senderName: string, 
    transactionId: string,
    type: 'received' | 'sent'
  ) {
    await this.createNotification(
      recipientId, 
      'payment',
      {
        amount,
        senderName,
        transactionId
      },
      'high'
    );
  }

  static async sendSecurityAlert(userId: string, message: string) {
    await this.createNotification(userId, 'security', { message }, 'urgent');
  }

  static async scheduleDigestNotifications() {
    // This would be called by a cron job to send digest notifications
    const { data: users } = await supabase
      .from('user_preferences')
      .select('user_id, matching_criteria')
      .not('matching_criteria', 'is', null);

    // Process digest notifications based on frequency
    // Implementation would depend on your scheduling system
  }
}
