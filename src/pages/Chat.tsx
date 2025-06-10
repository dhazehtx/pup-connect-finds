import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiveChatInterface from '@/components/messaging/LiveChatInterface';
import ConversationsList from '@/components/messaging/ConversationsList';
import { MobileResponsive } from '@/components/ui/mobile-responsive';
import { useMessagingRefactored } from '@/hooks/messaging/useMessagingRefactored';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';

const Chat = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { conversations, loading } = useMessagingRefactored();

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversationId(conversation.id);
    setSelectedUserId(conversation.other_user?.id || 'demo-user');
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setSelectedUserId(null);
  };

  if (selectedConversationId && selectedUserId) {
    return (
      <div className="h-screen bg-white">
        <LiveChatInterface
          conversationId={selectedConversationId}
          otherUserId={selectedUserId}
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
          <div className="bg-white rounded-lg border">
            <ConversationsList
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
            />
          </div>
        )}
      </div>
    </MobileResponsive>
  );
};

export default Chat;
