
export interface ExtendedConversation {
  id: string;
  listing_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  listing?: {
    id: string;
    dog_name: string;
    images?: string[];
  };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  read_at?: string;
}

export interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  timestamp: string;
  retryCount: number;
}
