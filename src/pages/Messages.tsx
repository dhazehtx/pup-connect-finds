
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import ConversationsList from '@/components/messaging/ConversationsList';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoadingState from '@/components/ui/loading-state';

const Messages = () => {
  const { user, isGuest } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const {
    conversations,
    loading,
    fetchConversations
  } = useEnhancedMessaging();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversationId(conversation.id);
    setSelectedUserId(conversation.other_user?.id || 'demo-user');
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setSelectedUserId(null);
  };

  if (!user && !isGuest) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Sign in to view messages</h3>
            <p className="text-gray-600 mb-4">Connect with breeders and buyers</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile: Show chat interface if conversation selected
  if (selectedConversationId && selectedUserId) {
    return (
      <div className="h-screen bg-white">
        <EnhancedChatInterface
          conversationId={selectedConversationId}
          otherUserId={selectedUserId}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // Show conversations list
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {loading ? (
        <LoadingState message="Loading conversations..." variant="card" />
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Conversations</h3>
            <p className="text-gray-600">You haven't started any conversations yet. Browse listings to connect with sellers.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border">
          <ConversationsList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />
        </div>
      )}
    </div>
  );
};

export default Messages;
