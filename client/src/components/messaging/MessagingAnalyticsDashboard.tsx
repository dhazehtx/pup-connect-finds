
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Users, Clock, TrendingUp, Send, Eye } from 'lucide-react';
import { useEnhancedMessaging } from '@/hooks/useEnhancedMessaging';
import { useAuth } from '@/contexts/AuthContext';

interface MessageAnalytics {
  totalMessages: number;
  messagesPerDay: number;
  averageResponseTime: number;
  activeConversations: number;
  readRate: number;
  popularHours: number[];
  messageTypes: Record<string, number>;
  reactionStats: Record<string, number>;
}

const MessagingAnalyticsDashboard = () => {
  const { user } = useAuth();
  const { conversations, messages } = useEnhancedMessaging();
  const [analytics, setAnalytics] = useState<MessageAnalytics>({
    totalMessages: 0,
    messagesPerDay: 0,
    averageResponseTime: 0,
    activeConversations: 0,
    readRate: 0,
    popularHours: [],
    messageTypes: {},
    reactionStats: {}
  });

  useEffect(() => {
    calculateAnalytics();
  }, [conversations, messages]);

  const calculateAnalytics = () => {
    if (!user || messages.length === 0) return;

    // Calculate basic metrics
    const totalMessages = messages.length;
    const userMessages = messages.filter(m => m.sender_id === user.id);
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recentMessages = messages.filter(m => new Date(m.created_at) > oneDayAgo);
    
    // Active conversations (those with recent activity)
    const activeConversations = conversations.filter(conv => {
      const lastMessage = messages
        .filter(m => m.conversation_id === conv.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      return lastMessage && new Date(lastMessage.created_at) > oneDayAgo;
    }).length;

    // Read rate calculation
    const messagesWithReadStatus = messages.filter(m => m.sender_id === user.id);
    const readMessages = messagesWithReadStatus.filter(m => m.read_at);
    const readRate = messagesWithReadStatus.length > 0 ? 
      (readMessages.length / messagesWithReadStatus.length) * 100 : 0;

    // Popular messaging hours
    const hourCounts = new Array(24).fill(0);
    messages.forEach(message => {
      const hour = new Date(message.created_at).getHours();
      hourCounts[hour]++;
    });

    // Message types breakdown
    const messageTypes: Record<string, number> = {};
    messages.forEach(message => {
      const type = message.message_type || 'text';
      messageTypes[type] = (messageTypes[type] || 0) + 1;
    });

    // Average response time (simplified calculation)
    let totalResponseTime = 0;
    let responseCount = 0;
    
    conversations.forEach(conv => {
      const convMessages = messages
        .filter(m => m.conversation_id === conv.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      for (let i = 1; i < convMessages.length; i++) {
        const current = convMessages[i];
        const previous = convMessages[i - 1];
        
        if (current.sender_id !== previous.sender_id) {
          const responseTime = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount / 1000 / 60 : 0; // in minutes

    setAnalytics({
      totalMessages,
      messagesPerDay: recentMessages.length,
      averageResponseTime,
      activeConversations,
      readRate,
      popularHours: hourCounts,
      messageTypes,
      reactionStats: {} // Would be populated from actual reaction data
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const getTopHours = () => {
    return analytics.popularHours
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Messaging Analytics
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Patterns</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Total Messages</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">{analytics.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.messagesPerDay} sent today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Active Conversations</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">{analytics.activeConversations}</div>
                <p className="text-xs text-muted-foreground">
                  of {conversations.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Avg Response Time</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {formatTime(analytics.averageResponseTime)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all conversations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Read Rate</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">{analytics.readRate.toFixed(1)}%</div>
                <Progress value={analytics.readRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Messaging Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopHours().map(({ hour, count }, index) => (
                    <div key={hour} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm">
                          {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count} messages</span>
                        <Progress 
                          value={(count / Math.max(...analytics.popularHours)) * 100} 
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.messageTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {type === 'text' && <MessageSquare className="w-4 h-4" />}
                        {type === 'image' && <Send className="w-4 h-4" />}
                        {type === 'voice' && <Users className="w-4 h-4" />}
                        <span className="text-sm capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <Progress 
                          value={(count / analytics.totalMessages) * 100} 
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {analytics.readRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Messages Read</p>
                    <Progress value={analytics.readRate} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {(analytics.messagesPerDay / Math.max(analytics.activeConversations, 1)).toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Messages/Conversation</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">
                      {formatTime(analytics.averageResponseTime)}
                    </div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-4">24-hour activity pattern</div>
                  <div className="flex items-end gap-1 h-32">
                    {analytics.popularHours.map((count, hour) => (
                      <div key={hour} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-primary rounded-t w-full"
                          style={{ 
                            height: `${(count / Math.max(...analytics.popularHours, 1)) * 100}%`,
                            minHeight: count > 0 ? '4px' : '0px'
                          }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                          {hour % 6 === 0 ? hour.toString().padStart(2, '0') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingAnalyticsDashboard;
