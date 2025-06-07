
import React, { useState } from 'react';
import { Search, Edit, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatInterface from '@/components/messaging/ChatInterface';
import ConversationsList from '@/components/messaging/ConversationsList';
import RealtimeChat from '@/components/messaging/RealtimeChat';
import EnhancedMessagingInterface from '@/components/messaging/EnhancedMessagingInterface';
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
  const [activeTab, setActiveTab] = useState('all');
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
      <div className="max-w-md mx-auto bg-cloud-white min-h-screen">
        <div className="h-screen">
          {/* Use Enhanced Messaging Interface for both demo and real conversations */}
          <EnhancedMessagingInterface
            conversationId={selectedConversation.id}
            otherUserName={selectedConversation.other_user?.full_name || selectedConversation.other_user?.username || 'Unknown User'}
            otherUserAvatar={selectedConversation.other_user?.avatar_url || '/placeholder.svg'}
            listingInfo={selectedConversation.listing ? {
              name: selectedConversation.listing.dog_name,
              breed: selectedConversation.listing.breed,
              image: selectedConversation.listing.image_url
            } : undefined}
          />
          
          {/* Back button overlay */}
          <div className="absolute top-4 left-4 z-20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedConversationId(null)}
              className="bg-cloud-white/95 backdrop-blur-sm border-soft-sky hover:bg-soft-sky/20"
            >
              <ArrowLeft size={16} className="mr-1" style={{ color: 'black' }} />
              <span style={{ color: 'black' }}>Back</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-cloud-white min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-soft-sky bg-cloud-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{ color: 'black' }}>Messages</h1>
          <Button variant="ghost" size="icon" className="hover:bg-soft-sky/30">
            <Edit size={20} style={{ color: 'black' }} />
          </Button>
        </div>
        
        {/* Demo notice for non-authenticated users */}
        {!user && (
          <div className="mb-4 p-3 bg-soft-sky/30 rounded-lg border border-soft-sky">
            <p className="text-sm text-royal-blue">
              <strong>Demo Mode:</strong> Showing sample conversations with enhanced messaging features
            </p>
          </div>
        )}
        
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-navy/60" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-cloud-white border-soft-sky text-black placeholder:text-deep-navy/60 focus:border-royal-blue focus:ring-royal-blue"
            style={{ color: 'black' }}
          />
        </div>
      </div>

      {/* Enhanced messaging tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b border-soft-sky bg-cloud-white px-4">
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 gap-0">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-royal-blue data-[state=active]:text-cloud-white border-b-2 border-transparent data-[state=active]:border-royal-blue rounded-none bg-transparent h-12 px-4 transition-all duration-200"
              style={{ color: 'black' }}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="primary" 
              className="data-[state=active]:bg-royal-blue data-[state=active]:text-cloud-white border-b-2 border-transparent data-[state=active]:border-royal-blue rounded-none bg-transparent h-12 px-4 transition-all duration-200"
              style={{ color: 'black' }}
            >
              Primary
            </TabsTrigger>
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-royal-blue data-[state=active]:text-cloud-white border-b-2 border-transparent data-[state=active]:border-royal-blue rounded-none bg-transparent h-12 px-4 transition-all duration-200"
              style={{ color: 'black' }}
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="request" 
              className="data-[state=active]:bg-royal-blue data-[state=active]:text-cloud-white border-b-2 border-transparent data-[state=active]:border-royal-blue rounded-none bg-transparent h-12 px-4 transition-all duration-200"
              style={{ color: 'black' }}
            >
              Request
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="m-0">
          {/* Conversations List */}
          {user && loading ? (
            <div className="p-4 text-center bg-cloud-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue mx-auto"></div>
              <p className="text-deep-navy/60 mt-2" style={{ color: 'black' }}>Loading conversations...</p>
            </div>
          ) : (
            <ConversationsList
              conversations={filteredConversations}
              onSelectConversation={(conv) => setSelectedConversationId(conv.id)}
              selectedConversationId={selectedConversationId}
            />
          )}
        </TabsContent>

        <TabsContent value="primary" className="m-0">
          <ConversationsList
            conversations={filteredConversations.filter(conv => conv.id.includes('1'))}
            onSelectConversation={(conv) => setSelectedConversationId(conv.id)}
            selectedConversationId={selectedConversationId}
          />
        </TabsContent>

        <TabsContent value="general" className="m-0">
          <ConversationsList
            conversations={filteredConversations.filter(conv => conv.id.includes('2'))}
            onSelectConversation={(conv) => setSelectedConversationId(conv.id)}
            selectedConversationId={selectedConversationId}
          />
        </TabsContent>

        <TabsContent value="request" className="m-0">
          <ConversationsList
            conversations={filteredConversations.filter(conv => conv.id.includes('3'))}
            onSelectConversation={(conv) => setSelectedConversationId(conv.id)}
            selectedConversationId={selectedConversationId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
