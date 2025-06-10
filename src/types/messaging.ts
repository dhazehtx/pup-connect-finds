
export interface ExtendedConversation {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  listing?: {
    dog_name: string;
    breed: string;
    image_url: string | null;
  };
  other_user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  voice_url?: string;
  read_at?: string;
  created_at: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
  reactions?: { [emoji: string]: string[] };
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  timestamp: string;
}
