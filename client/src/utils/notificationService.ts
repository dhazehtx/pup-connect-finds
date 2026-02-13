
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
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: userId,
          type: type as NotificationData['type'],
          title: template.title,
          message: template.message,
        })
      });

      if (!response.ok) throw new Error('Failed to create notification');
      return await response.json();
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
    const results = await Promise.allSettled(
      notifications.map(({ userId, type, data, priority = 'medium' }) =>
        this.createNotification(userId, type, data, priority)
      )
    );

    return results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  static async sendMessageNotification(senderId: string, recipientId: string, conversationId: string) {
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
    const { data: users } = await supabase
      .from('user_preferences')
      .select('user_id, matching_criteria')
      .not('matching_criteria', 'is', null);
  }
}
