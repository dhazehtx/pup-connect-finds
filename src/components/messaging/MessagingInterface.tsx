
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageCircle, User } from 'lucide-react';

interface MessagingInterfaceProps {
  selectedConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
}

const MessagingInterface = ({ selectedConversationId, onConversationSelect }: MessagingInterfaceProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    conversations,
    loading,
    sending,
    sendMessage,
    markAsRead
  } = useRealTimeMessages(selectedConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const success = await sendMessage(newMessage);
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
  }, [selectedConversationId, messages, user?.id, unreadCount]);

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
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  const isSelected = conversation.id === selectedConversationId;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => onConversationSelect?.(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {otherUser?.avatar_url ? (
                            <img 
                              src={otherUser.avatar_url} 
                              alt="Avatar" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {otherUser?.full_name || otherUser?.username || 'Unknown User'}
                            </p>
                            {conversation.last_message_at && (
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          {conversation.listing && (
                            <p className="text-xs text-gray-600 truncate">
                              {conversation.listing.dog_name} - {conversation.listing.breed}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="lg:col-span-2">
        {selectedConversationId ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversationId);
                    const otherUser = conversation ? getOtherUser(conversation) : null;
                    return otherUser?.full_name || otherUser?.username || 'Conversation';
                  })()}
                </CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount} new</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              {/* Messages */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 p-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            {isOwn && message.read_at && ' • Read'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default MessagingInterface;
