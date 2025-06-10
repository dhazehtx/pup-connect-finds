
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Search, Archive, Settings } from 'lucide-react';
import EnhancedMessagingInterface from './EnhancedMessagingInterface';
import AdvancedMessageSearch from './AdvancedMessageSearch';
import ConversationArchive from './ConversationArchive';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';

const AdvancedMessagingHub = () => {
  const { conversations, messages = [] } = useEnhancedMessaging();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Filter archived conversations (assuming there's an archived property)
  const archivedConversations = conversations.filter(conv => (conv as any).archived === true);

  const handleRestoreConversation = (conversationId: string) => {
    // Implementation would update conversation archived status
    console.log('Restoring conversation:', conversationId);
  };

  const handleDeleteConversation = (conversationId: string) => {
    // Implementation would delete conversation permanently
    console.log('Deleting conversation:', conversationId);
  };

  const handleExportConversation = (conversationId: string) => {
    // Implementation would export conversation data
    console.log('Exporting conversation:', conversationId);
  };

  const handleResultSelect = (messageId: string) => {
    // Implementation would navigate to message
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

  return (
    <div className="h-screen flex flex-col">
      <Tabs defaultValue="messages" className="flex-1 flex flex-col">
        <div className="border-b bg-white px-4">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle size={16} />
              Messages
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search size={16} />
              Search
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive size={16} />
              Archive
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="messages" className="flex-1 m-0">
          <EnhancedMessagingInterface />
        </TabsContent>

        <TabsContent value="search" className="flex-1 m-0 p-4">
          <div className="max-w-2xl mx-auto">
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
                <div className="space-y-2">
                  {searchResults.map((message, index) => (
                    <div 
                      key={message.id || index} 
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
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
          </div>
        </TabsContent>

        <TabsContent value="archive" className="flex-1 m-0 p-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Conversation Archive</h2>
            <ConversationArchive
              archivedConversations={archivedConversations}
              onRestoreConversation={handleRestoreConversation}
              onDeleteConversation={handleDeleteConversation}
              onExportConversation={handleExportConversation}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 m-0 p-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Messaging Settings</h2>
            <div className="space-y-4">
              <p className="text-gray-600">Advanced messaging settings and preferences will be implemented here.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMessagingHub;
