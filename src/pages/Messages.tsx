
import React, { useState } from 'react';
import { Search, Edit, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/messaging/ChatInterface';
import ConversationsList from '@/components/messaging/ConversationsList';
import { useMessaging } from '@/hooks/useMessaging';

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { conversations, loading } = useMessaging();

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listing?.dog_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  if (selectedConversationId && selectedConversation) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="h-screen">
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
      {loading ? (
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
