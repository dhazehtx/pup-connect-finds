
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import ConversationList from '@/components/messaging/ConversationList';
import MessageBubble from '@/components/messaging/MessageBubble';
import MessageInput from '@/components/messaging/MessageInput';

const Messages = () => {
  const { user, isGuest } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    loading,
    fetchMessages,
    sendMessage,
    markAsRead
  } = useMessaging();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages, markAsRead]);

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

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Connect with breeders and buyers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Conversations</h2>
                  <div className="relative">
                    <Input
                      placeholder="Search conversations..."
                      className="w-48"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ConversationList
                  conversations={conversations}
                  selectedConversationId={selectedConversationId || ''}
                  onSelectConversation={handleSelectConversation}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation to start messaging</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Conversations</h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {/* Header */}
            <CardHeader className="flex flex-row items-center gap-3 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversationList(true)}
                className="lg:hidden"
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
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
