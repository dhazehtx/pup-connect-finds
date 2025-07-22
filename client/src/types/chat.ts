
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'video';
  file_url?: string;
  image_url?: string;
  voice_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  read_at?: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface ListingInfo {
  id: string;
  name: string;
  breed: string;
  price: number;
  image_url?: string;
  dog_name?: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  timestamp: string;
  retryCount: number;
}
