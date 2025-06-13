
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ConversationsList from '@/components/messaging/ConversationsList';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleSelectConversation = (conversationId: string, otherUser: any) => {
    setSelectedConversationId(conversationId);
    setSelectedUser(otherUser);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <ConversationsList
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
    </Layout>
  );
};

export default Messages;
