import React, { useState, useEffect } from 'react';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useAuth } from '@/contexts/AuthContext';
import ConversationsList from './ConversationsList';
import MessagesArea from './MessagesArea';

interface MessagingInterfaceProps {
  selectedConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
}

const MessagingInterface = ({ selectedConversationId, onConversationSelect }: MessagingInterfaceProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const {
    messages,
    conversations,
    loading,
    sending,
    sendMessage,
    markAsRead
  } = useRealTimeMessages(selectedConversationId);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    const success = await sendMessage(selectedConversationId, newMessage.trim(), 'text');
    if (success) {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (conversation: any) => {
    if (!user) return null;
    return conversation.buyer_id === user.id 
      ? conversation.seller_profile 
      : conversation.buyer_profile;
  };

  const unreadCount = messages.filter(m => m.sender_id !== user?.id && !m.read_at).length;

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId && messages.length > 0 && unreadCount > 0) {
      const unreadMessageIds = messages
        .filter(m => m.sender_id !== user?.id && !m.read_at)
        .map(m => m.id);
      markAsRead(unreadMessageIds);
    }
  }, [selectedConversationId, messages, user?.id, unreadCount, markAsRead]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading messages...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      <ConversationsList
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onConversationSelect={onConversationSelect}
        getOtherUser={getOtherUser}
      />
      
      <MessagesArea
        selectedConversationId={selectedConversationId}
        conversations={conversations}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sending={sending}
        unreadCount={unreadCount}
        user={user}
        getOtherUser={getOtherUser}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default MessagingInterface;
