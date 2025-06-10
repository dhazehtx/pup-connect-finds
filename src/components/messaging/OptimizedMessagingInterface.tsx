
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageInput from './MessageInput';
import ConversationList from './ConversationList';
import OptimizedVirtualizedMessageList from './OptimizedVirtualizedMessageList';
import MessagingPerformanceDashboard from './MessagingPerformanceDashboard';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import { useMessagingPerformanceOptimized } from '@/hooks/useMessagingPerformanceOptimized';
import { useAuth } from '@/contexts/AuthContext';
import { ExtendedConversation } from '@/types/messaging';

const OptimizedMessagingInterface = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    loading,
    fetchMessages,
    sendMessage,
  } = useEnhancedMessaging();

  const { measurePerformance, trackConnection } = useMessagingPerformanceOptimized();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId) {
      const optimizedFetch = measurePerformance('messageLoad', () => fetchMessages(selectedConversationId));
      optimizedFetch();
    }
  }, [selectedConversationId, fetchMessages, measurePerformance]);

  useEffect(() => {
    // Track connection when component mounts
    trackConnection('add');
    return () => trackConnection('remove');
  }, [trackConnection]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationList(false);
  };

  const handleSendMessage = async (content: string, messageType = 'text') => {
    if (selectedConversationId) {
      const optimizedSend = measurePerformance('messageSend', () => sendMessage(selectedConversationId, content, messageType));
      await optimizedSend();
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherUser = selectedConversation?.other_user;

  if (showPerformanceDashboard) {
    return (
      <div className="max-w-6xl mx-auto bg-white min-h-screen">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPerformanceDashboard(false)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Performance Dashboard</h1>
          </div>
          <MessagingPerformanceDashboard />
        </div>
      </div>
    );
  }

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPerformanceDashboard(true)}
              className="p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
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
      <Tabs defaultValue="messages" className="flex-1 flex flex-col">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="messages" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <TabsContent value="messages" className="flex-1 flex flex-col m-0">
          {/* Optimized Messages */}
          <div className="flex-1">
            <OptimizedVirtualizedMessageList
              messages={messages}
              currentUserId={user?.id || ''}
              height={window.innerHeight - 200}
              hasMore={false}
            />
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            placeholder="Type a message..."
          />
        </TabsContent>

        <TabsContent value="performance" className="flex-1 m-0">
          <div className="p-4 h-full overflow-y-auto">
            <MessagingPerformanceDashboard />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 m-0">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Conversation Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Message Encryption</span>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Archive Conversation</span>
                <Button variant="outline" size="sm">Archive</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizedMessagingInterface;
