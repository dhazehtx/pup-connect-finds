
export interface ConversationUser {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface ConversationListing {
  dog_name: string;
  breed: string;
  image_url: string | null;
}

export interface ExtendedConversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string | null;
  last_message_at?: string | null;
  created_at: string;
  updated_at: string;
  listing?: ConversationListing;
  other_user?: ConversationUser;
  unread_count?: number;
}

export interface Message {
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

export interface EncryptedMessage extends Message {
  is_encrypted: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}
