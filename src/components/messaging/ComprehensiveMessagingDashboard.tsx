
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import MessagingHeader from './MessagingHeader';
import MessagingStatsCards from './MessagingStatsCards';
import MessagingTabNavigation from './MessagingTabNavigation';
import MessagingTabContent from './MessagingTabContent';

const ComprehensiveMessagingDashboard = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const { messages, conversations, loading } = useRealtimeMessaging();

  const stats = {
    totalMessages: messages.length,
    activeConversations: conversations.filter(c => c.last_message_at).length,
    unreadCount: messages.filter(m => !m.read_at).length,
    encryptedMessages: messages.filter(m => m.is_encrypted).length
  };

  const handleTemplateSelect = (content: string) => {
    console.log('Template selected:', content);
  };

  const handleSearchResults = (results: any[]) => {
    console.log('Search results:', results);
  };

  const handleClearSearch = () => {
    console.log('Search cleared');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <MessagingHeader stats={stats} />
        <MessagingStatsCards stats={stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <MessagingTabNavigation />
          <MessagingTabContent
            messages={messages}
            onTemplateSelect={handleTemplateSelect}
            onSearchResults={handleSearchResults}
            onClearSearch={handleClearSearch}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveMessagingDashboard;
