
export interface ExtendedConversation {
  id: string;
  listing_id?: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  other_user?: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
  };
  listing?: {
    id: string;
    dog_name: string;
    breed?: string;
    images?: string[];
    image_url?: string;
  };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file' | 'voice';
  file_url?: string;
  image_url?: string;
  voice_url?: string;
  read_at?: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
  reactions?: MessageReaction[];
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

export interface Conversation {
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
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  unread_count?: number;
}

export interface NotificationData {
  id: string;
  user_id: string;
  type: 'message' | 'payment' | 'security' | 'system' | 'marketing';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
}

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  message_notifications: boolean;
  payment_notifications: boolean;
  security_notifications: boolean;
  marketing_notifications: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}
