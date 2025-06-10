
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/AuthContext';
import ConversationList from './ConversationList';
import MessagesList from './MessagesList';
import EnhancedMessageInput from './EnhancedMessageInput';
import MessagingStatusIndicator from './MessagingStatusIndicator';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import { useFileUpload } from '@/hooks/useFileUpload';

const EnhancedMessagingInterface = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    conversations,
    loading,
    fetchMessages,
    sendMessage,
    markAsRead
  } = useRealtimeMessaging();

  const { onlineUsers, isUserOnline } = useUserPresence();
  const { reactions, toggleReaction } = useMessageReactions();
  const { getThreadCount, sendThreadReply } = useMessageThreads();
  const { uploadFile, uploadImage } = useFileUpload();

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

  const handleSendMessage = async (content: string, messageType = 'text', options: any = {}) => {
    if (!selectedConversationId) return;

    try {
      await sendMessage(selectedConversationId, content, messageType, options.imageUrl);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        await handleSendMessage(`Shared an image: ${file.name}`, 'image', { imageUrl });
      }
    } else {
      const fileUrl = await uploadFile(file);
      if (fileUrl) {
        await handleSendMessage(`Shared a file: ${file.name}`, 'file', { imageUrl: fileUrl });
      }
    }
  };

  const handleVoiceMessage = async (audioUrl: string, duration: number) => {
    await handleSendMessage(`Voice message (${duration}s)`, 'voice', { imageUrl: audioUrl });
  };

  const handleReactionButtonClick = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    setShowReactionPicker(showReactionPicker === messageId ? null : messageId);
  };

  const handleReplyToMessage = (message: any) => {
    // For now, just focus the input - you could implement threading here
    console.log('Reply to message:', message.id);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherUser = selectedConversation?.other_user;

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-sm text-muted-foreground">
                {onlineUsers.length} users online
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {conversations.length} chats
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-4">
          <MessagingStatusIndicator />
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId || ''}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center gap-3 border-b p-4">
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
          <h3 className="font-semibold">
            {otherUser?.full_name || otherUser?.username || 'Anonymous'}
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isUserOnline(selectedConversation?.seller_id === user?.id ? selectedConversation?.buyer_id : selectedConversation?.seller_id || '') ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isUserOnline(selectedConversation?.seller_id === user?.id ? selectedConversation?.buyer_id : selectedConversation?.seller_id || '') ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="p-2">
          <Settings className="w-4 h-4" />
        </Button>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessagesList
          messages={messages}
          user={user}
          reactions={reactions}
          getThreadCount={getThreadCount}
          onReactionButtonClick={handleReactionButtonClick}
          onReplyToMessage={handleReplyToMessage}
          onReactionToggle={toggleReaction}
          conversationId={selectedConversationId}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <EnhancedMessageInput
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleVoiceMessage}
        onFileSelect={handleFileSelect}
        placeholder="Type your message..."
      />
    </div>
  );
};

export default EnhancedMessagingInterface;
