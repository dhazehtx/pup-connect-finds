
import React, { useState, useEffect } from 'react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useAuth } from '@/contexts/AuthContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ChatUser, ListingInfo, Message } from '@/types/chat';

interface AdvancedChatInterfaceProps {
  conversationId: string;
  otherUser: ChatUser;
  listingInfo?: ListingInfo;
}

const AdvancedChatInterface = ({ conversationId, otherUser, listingInfo }: AdvancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, markAsRead } = useRealtimeMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [messages, conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { sendMessage } = useRealtimeMessaging();
      await sendMessage(conversationId, newMessage.trim(), 'text');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter and type-check messages to ensure they match our Message interface
  const typedMessages: Message[] = messages.filter((msg): msg is Message => {
    const validTypes: Array<Message['message_type']> = ['image', 'text', 'file', 'voice'];
    return (
      typeof msg.id === 'string' &&
      typeof msg.conversation_id === 'string' &&
      typeof msg.sender_id === 'string' &&
      typeof msg.content === 'string' &&
      typeof msg.created_at === 'string' &&
      validTypes.includes(msg.message_type as Message['message_type'])
    );
  });

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <ChatHeader 
        otherUser={otherUser}
        listingInfo={listingInfo}
        otherUserTyping={otherUserTyping}
      />

      <MessageList
        messages={typedMessages}
        currentUserId={user?.id}
        otherUserAvatar={otherUser.avatar}
        currentUserAvatar={user?.user_metadata?.avatar_url}
        otherUserTyping={otherUserTyping}
      />

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default AdvancedChatInterface;
