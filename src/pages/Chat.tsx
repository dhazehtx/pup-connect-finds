
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';
import ConversationsList from '@/components/messaging/ConversationsList';
import { MobileResponsive } from '@/components/ui/mobile-responsive';
import { useMessaging } from '@/hooks/useMessaging';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';

const Chat = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { conversations, loading } = useMessaging();

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation?.other_user) {
      setSelectedUser(conversation.other_user);
    }
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setSelectedUser(null);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.other_user;
  };

  if (selectedConversationId && selectedUser) {
    return (
      <div className="h-screen bg-background">
        <EnhancedChatInterface
          conversationId={selectedConversationId}
          otherUser={selectedUser}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <MobileResponsive>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        {loading ? (
          <LoadingState message="Loading conversations..." variant="card" />
        ) : conversations.length === 0 ? (
          <ErrorState
            title="No Conversations"
            message="You haven't started any conversations yet. Browse listings to connect with sellers."
            variant="minimal"
          />
        ) : (
          <div className="bg-background rounded-lg border">
            <ConversationsList
              conversations={conversations}
              onConversationSelect={handleSelectConversation}
              selectedConversationId={selectedConversationId}
              getOtherUser={getOtherUser}
            />
          </div>
        )}
      </div>
    </MobileResponsive>
  );
};

export default Chat;
