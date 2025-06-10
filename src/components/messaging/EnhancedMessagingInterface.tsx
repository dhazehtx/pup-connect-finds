
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import ConversationsList from './ConversationsList';
import EnhancedChatInterface from './EnhancedChatInterface';
import EnhancedChatHeader from './EnhancedChatHeader';
import MessageNotifications from './MessageNotifications';
import { ExtendedConversation } from '@/types/messaging';

const EnhancedMessagingInterface = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<ExtendedConversation | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [newMessage, setNewMessage] = useState<any>(null);
  
  const {
    conversations,
    messages,
    loading,
    fetchMessages,
    sendMessage,
    createConversation,
  } = useEnhancedMessaging();

  const handleConversationSelect = async (conversation: any) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;
    
    try {
      const message = await sendMessage(selectedConversation.id, content);
      if (message) {
        setNewMessage(message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleArchive = () => {
    if (selectedConversation) {
      console.log('Archiving conversation:', selectedConversation.id);
      // Archive logic would go here
    }
  };

  const handleBlock = () => {
    if (selectedConversation) {
      console.log('Blocking user in conversation:', selectedConversation.id);
      // Block logic would go here
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <MessageNotifications newMessage={newMessage} />
      
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r`}>
        <ConversationsList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleConversationSelect}
          onCreateConversation={createConversation}
        />
      </div>

      {/* Chat Interface */}
      <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1`}>
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            <EnhancedChatHeader
              otherUser={selectedConversation.other_user!}
              conversationId={selectedConversation.id}
              onBack={handleBack}
              onSearch={handleSearch}
              onArchive={handleArchive}
              onBlock={handleBlock}
            />
            <div className="flex-1">
              <EnhancedChatInterface
                conversationId={selectedConversation.id}
                otherUserId={selectedConversation.other_user?.full_name || 'Unknown'}
                listingId={selectedConversation.listing_id}
              />
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessagingInterface;
