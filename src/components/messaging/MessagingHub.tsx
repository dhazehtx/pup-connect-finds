
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Archive, Settings, Users } from 'lucide-react';
import EnhancedMessagingInterface from './EnhancedMessagingInterface';
import AdvancedMessageSearch from './AdvancedMessageSearch';
import ConversationArchive from './ConversationArchive';
import MessagingSettings from './MessagingSettings';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import { useAuth } from '@/contexts/AuthContext';

const MessagingHub = () => {
  const { user } = useAuth();
  const { conversations, loading, messages = [] } = useEnhancedMessaging();
  const [activeTab, setActiveTab] = useState('messages');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Calculate unread messages count - using a fallback of 0 if unread_count doesn't exist
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => {
      // Safely access unread_count with fallback
      const unreadCount = (conv as any).unread_count || 0;
      return total + unreadCount;
    }, 0);
  }, [conversations]);

  useEffect(() => {
    setUnreadCount(totalUnreadCount);
  }, [totalUnreadCount]);

  const handleResultSelect = (messageId: string) => {
    setActiveTab('messages');
    // TODO: Navigate to specific message
    console.log('Navigating to message:', messageId);
  };

  const handleSearchResults = (results: any[]) => {
    console.log('Search results received:', results);
    setSearchResults(results);
  };

  const handleClearSearch = () => {
    console.log('Clearing search results');
    setSearchResults([]);
  };

  const handleArchiveConversation = (conversationId: string) => {
    console.log('Archiving conversation:', conversationId);
    // TODO: Implement archive functionality
  };

  const handleDeleteConversation = (conversationId: string) => {
    console.log('Deleting conversation:', conversationId);
    // TODO: Implement delete functionality
  };

  const handleExportConversation = (conversationId: string) => {
    console.log('Exporting conversation:', conversationId);
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading messaging hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">Messages</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{conversations.length} conversations</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b bg-background">
          <div className="container mx-auto px-4">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageCircle size={16} />
                <span className="hidden sm:inline">Messages</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search size={16} />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-2">
                <Archive size={16} />
                <span className="hidden sm:inline">Archive</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings size={16} />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="messages" className="h-full m-0">
            <EnhancedMessagingInterface />
          </TabsContent>

          <TabsContent value="search" className="h-full m-0 p-4">
            <div className="container mx-auto max-w-4xl h-full">
              <Card className="h-full p-6">
                <h2 className="text-xl font-semibold mb-4">Advanced Message Search</h2>
                <AdvancedMessageSearch 
                  messages={messages}
                  onSearchResults={handleSearchResults}
                  onClearSearch={handleClearSearch}
                  onResultSelect={handleResultSelect} 
                />
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Search Results ({searchResults.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.map((message, index) => (
                        <div 
                          key={message.id || index} 
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => handleResultSelect(message.id)}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.sender_name} • {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="archive" className="h-full m-0 p-4">
            <div className="container mx-auto max-w-4xl h-full">
              <Card className="h-full p-6">
                <ConversationArchive
                  archivedConversations={[]}
                  onRestoreConversation={handleArchiveConversation}
                  onDeleteConversation={handleDeleteConversation}
                  onExportConversation={handleExportConversation}
                />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0 p-4">
            <div className="container mx-auto max-w-2xl h-full">
              <Card className="h-full p-6">
                <MessagingSettings />
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MessagingHub;
