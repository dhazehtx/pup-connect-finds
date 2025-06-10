
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ConversationList from './ConversationList';
import ChatContainer from './ChatContainer';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { usePresenceManager } from '@/hooks/usePresenceManager';
import { useChatState } from '@/hooks/useChatState';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import { useAuth } from '@/contexts/AuthContext';
import { ExtendedConversation } from '@/types/messaging';

const ComprehensiveMessagingDashboard = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const {
    conversations,
    messages,
    loading,
    fetchMessages,
    sendMessage,
  } = useEnhancedMessaging();

  const { searchResults, searching, searchMessages, clearSearch } = useMessageSearch();
  const { setupConversationPresence, isUserOnline } = usePresenceManager();

  const {
    newMessage,
    setNewMessage,
    selectedFile,
    setSelectedFile,
    sendingMessage,
    setSendingMessage,
    reactionPickerState,
    threadState,
    clearInputs,
    handleReactionButtonClick,
    closeReactionPicker,
    handleReplyToMessage,
    closeThread
  } = useChatState();

  const {
    handleSendMessage,
    handleFileSelect,
    handleSendVoiceMessage
  } = useChatHandlers({ user, conversationId: selectedConversationId || '', sendMessage });

  // Set up presence when conversation is selected
  useEffect(() => {
    if (selectedConversationId && user) {
      const cleanup = setupConversationPresence(selectedConversationId);
      return cleanup;
    }
  }, [selectedConversationId, user, setupConversationPresence]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchMessages(searchQuery, selectedConversationId || undefined);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      clearSearch();
    }
  }, [searchQuery, selectedConversationId, searchMessages, clearSearch]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationList(false);
    setShowSearch(false);
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    setSelectedConversationId(null);
    setShowSearch(false);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherUser = selectedConversation?.other_user;

  if (showConversationList || !selectedConversationId) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </div>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="mb-4">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              {searching && (
                <div className="text-sm text-muted-foreground mt-2">Searching...</div>
              )}
            </div>
          )}
        </div>

        {/* Search results */}
        {showSearch && searchResults.length > 0 && (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Search Results</h3>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Card key={result.id} className="p-3 cursor-pointer hover:bg-muted/50">
                  <div className="text-sm font-medium">{result.sender_name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {result.content}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(result.created_at).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Conversations list */}
        {!showSearch && (
          <div className="p-4">
            <ConversationList
              conversations={conversations as ExtendedConversation[]}
              selectedConversationId={selectedConversationId || ''}
              onSelectConversation={handleSelectConversation}
              loading={loading}
              isUserOnline={isUserOnline}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToList}
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.avatar_url || ''} />
            <AvatarFallback>
              {otherUser?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {isUserOnline(selectedConversation?.seller_id === user?.id ? selectedConversation?.buyer_id : selectedConversation?.seller_id || '') && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {otherUser?.full_name || otherUser?.username || 'Anonymous'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isUserOnline(selectedConversation?.seller_id === user?.id ? selectedConversation?.buyer_id : selectedConversation?.seller_id || '') ? 'Online' : 'Last seen recently'}
          </p>
          {selectedConversation?.listing && (
            <Badge variant="secondary" className="text-xs mt-1">
              About: {selectedConversation.listing.dog_name}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Users size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search size={16} />
          </Button>
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex-1 flex flex-col">
        <ChatContainer
          messages={messages}
          user={user}
          reactions={{}}
          getThreadCount={() => 0}
          onReactionButtonClick={handleReactionButtonClick}
          onReplyToMessage={(message) => handleReplyToMessage(message, user)}
          onReactionToggle={() => {}}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          uploading={false}
          sendingMessage={sendingMessage}
          onSendMessage={() => handleSendMessage(newMessage, selectedFile, setSendingMessage, clearInputs)}
          onSendVoiceMessage={handleSendVoiceMessage}
          onFileSelect={handleFileSelect}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(newMessage, selectedFile, setSendingMessage, clearInputs);
            }
          }}
          sendMessage={sendMessage}
          conversationId={selectedConversationId}
          reactionPickerState={reactionPickerState}
          onReactionAdd={(messageId, emoji) => {}}
          closeReactionPicker={closeReactionPicker}
          threadState={threadState}
          closeThread={closeThread}
        />
      </div>
    </div>
  );
};

export default ComprehensiveMessagingDashboard;
