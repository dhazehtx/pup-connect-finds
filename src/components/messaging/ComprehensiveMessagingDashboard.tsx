import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Zap,
  Search,
  FileText,
  TestTube
} from 'lucide-react';
import EnhancedMessagingInterface from './EnhancedMessagingInterface';
import MessageTemplates from './MessageTemplates';
import EnhancedMessageSearch from './EnhancedMessageSearch';
import MessagePerformanceOptimizer from './MessagePerformanceOptimizer';
import MessagingAnalyticsDashboard from './MessagingAnalyticsDashboard';
import MessagingTestSuite from './MessagingTestSuite';
import PerformanceMonitor from './PerformanceMonitor';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';

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
    // This would integrate with the messaging interface
    console.log('Template selected:', content);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Messaging Center</h1>
            <p className="text-muted-foreground">Complete messaging solution with advanced features</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {stats.totalMessages} Messages
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stats.activeConversations} Active
            </Badge>
            {stats.unreadCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                {stats.unreadCount} Unread
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                  <p className="text-2xl font-bold">{stats.activeConversations}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{stats.unreadCount}</p>
                </div>
                <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                  {stats.unreadCount}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Encrypted</p>
                  <p className="text-2xl font-bold">{stats.encryptedMessages}</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

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
            <MessageTemplates onSelectTemplate={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <EnhancedMessageSearch
              messages={messages}
              onSearchResults={(results) => console.log('Search results:', results)}
              onClearSearch={() => console.log('Search cleared')}
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
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveMessagingDashboard;
