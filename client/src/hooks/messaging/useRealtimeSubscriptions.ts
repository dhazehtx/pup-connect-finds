
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}

interface UseRealtimeSubscriptionsProps {
  conversationId?: string;
  onNewMessage: (message: Message) => void;
  onConversationUpdate: () => void;
}

export const useRealtimeSubscriptions = ({ 
  conversationId, 
  onNewMessage, 
  onConversationUpdate 
}: UseRealtimeSubscriptionsProps) => {
};
