
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MoreVertical, Wifi, WifiOff } from 'lucide-react';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { useOfflineMessages } from '@/hooks/useOfflineMessages';
import EnhancedChatInterface from './EnhancedChatInterface';
import ConversationsList from './ConversationsList';
import { useMessaging } from '@/hooks/useMessaging';

const MobileMessagingInterface = () => {
  const { isMobile } = useMobileOptimized();
  const { isOnline, messageQueue } = useOfflineMessages();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  
  const {
    conversations,
    loading,
  } = useMessaging();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation?.other_user) {
      setSelectedUser(conversation.other_user);
    }
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setSelectedUser(null);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.other_user;
  };

  if (!isMobile) {
    return null; // Use desktop version
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi size={16} className="text-green-500" />
          ) : (
            <WifiOff size={16} className="text-red-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {messageQueue.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {messageQueue.length} queued
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedConversationId ? (
          <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-background">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
              </Button>
              
              <div className="flex-1">
                <h3 className="font-semibold text-sm">
                  {selectedConversation?.other_user?.full_name || 'Conversation'}
                </h3>
                {selectedConversation?.listing && (
                  <p className="text-xs text-muted-foreground">
                    About: {selectedConversation.listing.dog_name}
                  </p>
                )}
              </div>

              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </div>

            {/* Chat Interface */}
            <div className="flex-1">
              <EnhancedChatInterface
                conversationId={selectedConversationId}
                otherUser={selectedUser}
                onBack={handleBack}
              />
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Conversations Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background">
              <h1 className="text-lg font-semibold">Messages</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={16} />
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-hidden">
              <ConversationsList
                conversations={conversations}
                selectedConversationId={null}
                onConversationSelect={handleSelectConversation}
                getOtherUser={getOtherUser}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMessagingInterface;
