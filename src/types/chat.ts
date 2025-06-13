
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
  file_name?: string;
  file_size?: number;
  file_type?: string;
  read_at?: string;
  is_encrypted?: boolean;
  encrypted_content?: string;
  encryption_key_id?: string;
}
