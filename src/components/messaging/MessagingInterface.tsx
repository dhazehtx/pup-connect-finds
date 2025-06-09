
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ConversationList from './ConversationList';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { ExtendedConversation } from '@/types/messaging';

const MessagingInterface = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    loading,
    fetchMessages,
    sendMessage,
  } = useEnhancedMessaging();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationList(false);
  };

  const handleSendMessage = async (content: string, messageType = 'text') => {
    if (selectedConversationId) {
      await sendMessage(selectedConversationId, content, messageType);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherUser = selectedConversation?.other_user;

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <ConversationList
            conversations={conversations as ExtendedConversation[]}
            selectedConversationId={selectedConversationId || ''}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-row items-center gap-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConversationList(true)}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={otherUser?.avatar_url || ''} />
          <AvatarFallback>
            {otherUser?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {otherUser?.full_name || otherUser?.username || 'Anonymous'}
          </h3>
          {selectedConversation?.listing && (
            <p className="text-xs text-gray-500">
              About: {selectedConversation.listing.dog_name}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
            senderName={otherUser?.full_name || otherUser?.username}
            senderAvatar={otherUser?.avatar_url || ''}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        placeholder="Type a message..."
      />
    </div>
  );
};

export default MessagingInterface;
