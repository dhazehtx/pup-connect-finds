
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'image' | 'text' | 'file' | 'voice';
  content: string;
  image_url?: string;
  created_at: string;
  read_at?: string;
  is_encrypted?: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ListingInfo {
  name: string;
  breed: string;
  price: number;
  image?: string;
}
