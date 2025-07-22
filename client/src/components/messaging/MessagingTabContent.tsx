
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import EnhancedMessagingInterface from './EnhancedMessagingInterface';
import MessageTemplates from './MessageTemplates';
import EnhancedMessageSearch from './EnhancedMessageSearch';
import MessagePerformanceOptimizer from './MessagePerformanceOptimizer';
import MessagingAnalyticsDashboard from './MessagingAnalyticsDashboard';
import MessagingTestSuite from './MessagingTestSuite';
import PerformanceMonitor from './PerformanceMonitor';

interface MessagingTabContentProps {
  messages: any[];
  onTemplateSelect: (content: string) => void;
  onSearchResults: (results: any[]) => void;
  onClearSearch: () => void;
}

const MessagingTabContent = ({ 
  messages, 
  onTemplateSelect, 
  onSearchResults, 
  onClearSearch 
}: MessagingTabContentProps) => {
  return (
    <>
      <TabsContent value="messages" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Messaging Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedMessagingInterface />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="space-y-6">
        <MessageTemplates onSelectTemplate={onTemplateSelect} />
      </TabsContent>

      <TabsContent value="search" className="space-y-6">
        <EnhancedMessageSearch
          messages={messages}
          onSearchResults={onSearchResults}
          onClearSearch={onClearSearch}
        />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <MessagePerformanceOptimizer />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <MessagingAnalyticsDashboard />
      </TabsContent>

      <TabsContent value="testing" className="space-y-6">
        <MessagingTestSuite />
      </TabsContent>

      <TabsContent value="monitor" className="space-y-6">
        <PerformanceMonitor />
      </TabsContent>
    </>
  );
};

export default MessagingTabContent;
