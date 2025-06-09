
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Users, Plus } from 'lucide-react';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import { useAuth } from '@/contexts/AuthContext';
import ConversationsList from './ConversationsList';
import ConversationView from './ConversationView';
import EnhancedMessageInput from './EnhancedMessageInput';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import { ExtendedConversation } from '@/types/messaging';

const EnhancedMessagingInterface = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    conversations, 
    messages, 
    loading,
    fetchMessages,
    sendMessage,
    createConversation 
  } = useEnhancedMessaging();
  const { user } = useAuth();

  const filteredConversations = conversations.filter(conv => 
    conv.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing?.dog_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const handleSendMessage = async (content: string, type: string = 'text') => {
    if (!selectedConversationId) return;
    await sendMessage(selectedConversationId, content, type);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No conversations yet</p>
              <p className="text-sm text-gray-500">Start chatting with sellers to see conversations here</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversationId === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {conversation.other_user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {conversation.other_user?.full_name || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.last_message_at && 
                            new Date(conversation.last_message_at).toLocaleDateString()
                          }
                        </span>
                      </div>
                      {conversation.listing && (
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {conversation.listing.dog_name}
                          </Badge>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.listing?.breed}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedConversation.other_user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-semibold">
                    {selectedConversation.other_user?.full_name || 'Unknown User'}
                  </h2>
                  {selectedConversation.listing && (
                    <p className="text-sm text-gray-600">
                      About {selectedConversation.listing.dog_name} - {selectedConversation.listing.breed}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <EnhancedMessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  senderName={
                    message.sender_id === user?.id 
                      ? 'You' 
                      : selectedConversation.other_user?.full_name
                  }
                  showReadReceipt={true}
                />
              ))}
            </div>

            {/* Message Input */}
            <EnhancedMessageInput
              conversationId={selectedConversationId}
              onSendMessage={handleSendMessage}
              placeholder={`Message ${selectedConversation.other_user?.full_name || 'seller'}...`}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessagingInterface;
