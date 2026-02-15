
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

interface UseMessageSubscriptionProps {
  conversationId: string | null;
  onNewMessage: (message: Message) => void;
  onMessageUpdate: (message: Message) => void;
}

export const useMessageSubscription = ({
  conversationId,
  onNewMessage,
  onMessageUpdate
}: UseMessageSubscriptionProps) => {
};
