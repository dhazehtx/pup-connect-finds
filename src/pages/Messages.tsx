
import React, { useState } from 'react';
import { Search, Edit, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/messaging/ChatInterface';
import ConversationsList from '@/components/messaging/ConversationsList';
import RealtimeChat from '@/components/messaging/RealtimeChat';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';

// Demo conversations for non-authenticated users
const demoConversations = [
  {
    id: 'demo-1',
    listing_id: 'listing-1',
    buyer_id: 'buyer-1',
    seller_id: 'seller-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    last_message_at: '2024-01-15T14:30:00Z',
    listing: {
      dog_name: 'Golden Retriever Puppy',
      breed: 'Golden Retriever',
      image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop'
    },
    other_user: {
      full_name: 'Sarah Wilson',
      username: 'sarahw',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: 'demo-2',
    listing_id: 'listing-2',
    buyer_id: 'buyer-2',
    seller_id: 'seller-2',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    last_message_at: '2024-01-14T16:45:00Z',
    listing: {
      dog_name: 'Labrador Mix',
      breed: 'Labrador Mix',
      image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop'
    },
    other_user: {
      full_name: 'Mike Johnson',
      username: 'mikej',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: 'demo-3',
    listing_id: 'listing-3',
    buyer_id: 'buyer-3',
    seller_id: 'seller-3',
    created_at: '2024-01-13T11:00:00Z',
    updated_at: '2024-01-13T18:20:00Z',
    last_message_at: '2024-01-13T18:20:00Z',
    listing: {
      dog_name: 'German Shepherd',
      breed: 'German Shepherd',
      image_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop'
    },
    other_user: {
      full_name: 'Emma Davis',
      username: 'emmad',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  }
];

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { conversations, loading } = useMessaging();

  // Use real conversations if user is authenticated, otherwise use demo data
  const displayConversations = user ? conversations : demoConversations;

  const filteredConversations = displayConversations.filter(conv =>
    conv.other_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listing?.dog_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = displayConversations.find(conv => conv.id === selectedConversationId);

  if (selectedConversationId && selectedConversation) {
    const isDemoConversation = selectedConversationId.startsWith('demo-');
    
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="h-screen">
          {isDemoConversation ? (
            // For demo conversations, don't use RealtimeChat wrapper (no polling)
            <ChatInterface
              conversationId={selectedConversation.id}
              recipientName={selectedConversation.other_user?.full_name || selectedConversation.other_user?.username || 'Unknown User'}
              recipientAvatar={selectedConversation.other_user?.avatar_url || '/placeholder.svg'}
              isOnline={false}
              onBack={() => setSelectedConversationId(null)}
              listingInfo={selectedConversation.listing ? {
                name: selectedConversation.listing.dog_name,
                breed: selectedConversation.listing.breed,
                image: selectedConversation.listing.image_url
              } : undefined}
            />
          ) : (
            // For real conversations, use RealtimeChat wrapper (with polling)
            <RealtimeChat conversationId={selectedConversation.id}>
              <ChatInterface
                conversationId={selectedConversation.id}
                recipientName={selectedConversation.other_user?.full_name || selectedConversation.other_user?.username || 'Unknown User'}
                recipientAvatar={selectedConversation.other_user?.avatar_url || '/placeholder.svg'}
                isOnline={false}
                onBack={() => setSelectedConversationId(null)}
                listingInfo={selectedConversation.listing ? {
                  name: selectedConversation.listing.dog_name,
                  breed: selectedConversation.listing.breed,
                  image: selectedConversation.listing.image_url
                } : undefined}
              />
            </RealtimeChat>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-black">Messages</h1>
          <Button variant="ghost" size="icon">
            <Edit size={20} className="text-black" />
          </Button>
        </div>
        
        {/* Demo notice for non-authenticated users */}
        {!user && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Demo Mode:</strong> Showing sample conversations with mock messages for design preview
            </p>
          </div>
        )}
        
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 text-black placeholder:text-black"
          />
        </div>
      </div>

      {/* Conversations List */}
      {user && loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading conversations...</p>
        </div>
      ) : (
        <ConversationsList
          conversations={filteredConversations}
          onSelectConversation={(conv) => setSelectedConversationId(conv.id)}
          selectedConversationId={selectedConversationId}
        />
      )}
    </div>
  );
};

export default Messages;
