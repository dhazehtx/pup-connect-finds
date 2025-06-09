
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
}

export const useMessagingNotifications = () => {
  const { user } = useAuth();
  const { triggerMessageNotification } = useRealtimeNotifications();

  const sendNotificationForMessage = async (
    conversations: Conversation[],
    conversationId: string,
    content: string
  ) => {
    if (!user) return;

    try {
      // Find the conversation and trigger notification to the other user
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        const recipientId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
        const senderName = user.user_metadata?.full_name || user.email || 'Someone';
        
        // Trigger push notification
        await triggerMessageNotification(recipientId, senderName, content);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return {
    sendNotificationForMessage,
  };
};
