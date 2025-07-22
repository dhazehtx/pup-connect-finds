
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Search, 
  Flag, 
  Eye, 
  Ban, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MessagingOversight = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [messagingStats] = useState({
    totalMessages: 45620,
    dailyMessages: 2340,
    flaggedMessages: 87,
    blockedUsers: 23,
    averageResponseTime: 4.2,
    spamDetected: 156
  });

  const [flaggedConversations] = useState([
    {
      id: 'conv_001',
      participants: ['user_123', 'user_456'],
      flagReason: 'Inappropriate content',
      messageCount: 15,
      lastActivity: '2024-01-20T14:30:00Z',
      severity: 'high',
      status: 'pending'
    },
    {
      id: 'conv_002',
      participants: ['user_789', 'user_012'],
      flagReason: 'Spam/promotional content',
      messageCount: 8,
      lastActivity: '2024-01-20T13:15:00Z',
      severity: 'medium',
      status: 'reviewing'
    },
    {
      id: 'conv_003',
      participants: ['user_345', 'user_678'],
      flagReason: 'Harassment',
      messageCount: 23,
      lastActivity: '2024-01-20T12:00:00Z',
      severity: 'high',
      status: 'investigating'
    }
  ]);

  const [recentActivity] = useState([
    {
      type: 'flag',
      description: 'User reported inappropriate message',
      user: 'user_123',
      timestamp: '2024-01-20T14:45:00Z',
      conversationId: 'conv_001'
    },
    {
      type: 'block',
      description: 'User blocked for spam behavior',
      user: 'user_456',
      timestamp: '2024-01-20T14:30:00Z',
      conversationId: null
    },
    {
      type: 'warning',
      description: 'Warning issued for policy violation',
      user: 'user_789',
      timestamp: '2024-01-20T14:15:00Z',
      conversationId: 'conv_002'
    }
  ]);

  const [topReportedUsers] = useState([
    { user: 'user_123', reports: 8, reason: 'Inappropriate content' },
    { user: 'user_456', reports: 6, reason: 'Spam messages' },
    { user: 'user_789', reports: 5, reason: 'Harassment' },
    { user: 'user_012', reports: 4, reason: 'Scam attempts' }
  ]);

  const handleConversationAction = (conversationId: string, action: string) => {
    toast({
      title: "Action Completed",
      description: `${action} applied to conversation ${conversationId}`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'reviewing': return 'text-purple-600 bg-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Messaging Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{messagingStats.totalMessages.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Messages</p>
                <p className="text-2xl font-bold">{messagingStats.dailyMessages.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged Messages</p>
                <p className="text-2xl font-bold">{messagingStats.flaggedMessages}</p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                <p className="text-2xl font-bold">{messagingStats.blockedUsers}</p>
              </div>
              <Ban className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{messagingStats.averageResponseTime}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spam Detected</p>
                <p className="text-2xl font-bold">{messagingStats.spamDetected}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flagged">Flagged Conversations</TabsTrigger>
          <TabsTrigger value="users">Problem Users</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Message Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Flagged Conversations</span>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedConversations.map((conversation) => (
                  <div key={conversation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(conversation.severity)}>
                            {conversation.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(conversation.status)}>
                            {conversation.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">#{conversation.id}</span>
                        </div>
                        <h4 className="font-medium mb-1">{conversation.flagReason}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Participants: {conversation.participants.join(', ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {conversation.messageCount} messages | Last activity: {new Date(conversation.lastActivity).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConversationAction(conversation.id, 'Review')}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConversationAction(conversation.id, 'Warning')}
                          className="text-orange-600"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Warn
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConversationAction(conversation.id, 'Block')}
                          className="text-red-600"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Block
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Reported Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topReportedUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{user.user}</span>
                        <Badge variant="outline">{user.reports} reports</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Primary reason: {user.reason}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline" className="text-orange-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Warn
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Ban className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-1 bg-white rounded">
                      {activity.type === 'flag' && <Flag className="w-4 h-4 text-red-500" />}
                      {activity.type === 'block' && <Ban className="w-4 h-4 text-red-600" />}
                      {activity.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-600">
                        User: {activity.user} | {new Date(activity.timestamp).toLocaleString()}
                        {activity.conversationId && ` | Conversation: ${activity.conversationId}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Today</span>
                      <span>2,340 messages</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Yesterday</span>
                      <span>2,890 messages</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>This Week</span>
                      <span>18,450 messages</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moderation Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">Auto-resolved</span>
                    <span className="font-bold text-green-600">156 (89%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm">Human review</span>
                    <span className="font-bold text-blue-600">19 (11%)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Avg resolution time</span>
                    <span className="font-bold text-gray-700">2.3 hours</span>
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

export default MessagingOversight;
