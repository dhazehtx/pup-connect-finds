
import { Database } from '@/integrations/supabase/types';

type Conversation = Database['public']['Tables']['conversations']['Insert'];
type Message = Database['public']['Tables']['messages']['Insert'];

// Sample conversations and messages for testing
export const sampleConversations: Conversation[] = [
  {
    id: 'conv-1111-1111-1111-111111111111',
    listing_id: 'listing-1111-1111-1111-111111111111',
    buyer_id: '44444444-4444-4444-4444-444444444444',
    seller_id: '11111111-1111-1111-1111-111111111111',
    created_at: '2024-02-16T10:00:00Z',
    last_message_at: '2024-02-16T14:30:00Z',
    updated_at: '2024-02-16T14:30:00Z'
  },
  {
    id: 'conv-2222-2222-2222-222222222222',
    listing_id: 'listing-2222-2222-2222-222222222222',
    buyer_id: '44444444-4444-4444-4444-444444444444',
    seller_id: '22222222-2222-2222-2222-222222222222',
    created_at: '2024-02-14T09:00:00Z',
    last_message_at: '2024-02-14T16:45:00Z',
    updated_at: '2024-02-14T16:45:00Z'
  }
];

export const sampleMessages: Message[] = [
  {
    id: 'msg-1111-1111-1111-111111111111',
    conversation_id: 'conv-1111-1111-1111-111111111111',
    sender_id: '44444444-4444-4444-4444-444444444444',
    content: 'Hi Sarah! I\'m interested in Luna. Is she still available?',
    message_type: 'text',
    created_at: '2024-02-16T10:00:00Z',
    read_at: '2024-02-16T10:15:00Z'
  },
  {
    id: 'msg-2222-2222-2222-222222222222',
    conversation_id: 'conv-1111-1111-1111-111111111111',
    sender_id: '11111111-1111-1111-1111-111111111111',
    content: 'Hello Emily! Yes, Luna is still available. She\'s a wonderful puppy. Would you like to schedule a visit?',
    message_type: 'text',
    created_at: '2024-02-16T10:15:00Z',
    read_at: '2024-02-16T10:30:00Z'
  },
  {
    id: 'msg-3333-3333-3333-333333333333',
    conversation_id: 'conv-1111-1111-1111-111111111111',
    sender_id: '44444444-4444-4444-4444-444444444444',
    content: 'That would be great! I\'m available this weekend. What times work for you?',
    message_type: 'text',
    created_at: '2024-02-16T10:30:00Z',
    read_at: '2024-02-16T11:00:00Z'
  },
  {
    id: 'msg-4444-4444-4444-444444444444',
    conversation_id: 'conv-1111-1111-1111-111111111111',
    sender_id: '11111111-1111-1111-1111-111111111111',
    content: 'Perfect! How about Saturday at 2 PM? I can show you Luna and her parents, plus go over all the health documentation.',
    message_type: 'text',
    created_at: '2024-02-16T14:30:00Z',
    read_at: null
  }
];
