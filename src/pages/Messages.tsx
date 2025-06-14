
import React, { useState } from 'react';
import ConversationsList from '@/components/messaging/ConversationsList';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';
import { useMessaging } from '@/hooks/useMessaging';

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { conversations } = useMessaging();

  const handleSelectConversation = (conversationId: string, otherUser: any) => {
    setSelectedConversationId(conversationId);
    setSelectedUser(otherUser);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <ConversationsList
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <EnhancedChatInterface
              conversationId={selectedConversationId}
              otherUser={selectedUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
