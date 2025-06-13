
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import ConversationsList from './ConversationsList';
import EnhancedChatInterface from './EnhancedChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UnifiedMessagingInterface = () => {
  const { user, isGuest } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const {
    conversations,
    loading,
    fetchConversations
  } = useMessaging();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const handleSelectConversation = (conversationId: string, otherUser: any) => {
    setSelectedConversationId(conversationId);
    setSelectedUser(otherUser);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setSelectedUser(null);
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
  if (selectedConversationId && selectedUser) {
    return (
      <div className="h-screen bg-white">
        <EnhancedChatInterface
          conversationId={selectedConversationId}
          otherUser={selectedUser}
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

      {conversations.length === 0 ? (
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

export default UnifiedMessagingInterface;
