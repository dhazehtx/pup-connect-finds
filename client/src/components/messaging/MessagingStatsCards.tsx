
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Shield } from 'lucide-react';

interface MessagingStatsCardsProps {
  stats: {
    totalMessages: number;
    activeConversations: number;
    unreadCount: number;
    encryptedMessages: number;
  };
}

const MessagingStatsCards = ({ stats }: MessagingStatsCardsProps) => {
  return (
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
  );
};

export default MessagingStatsCards;
