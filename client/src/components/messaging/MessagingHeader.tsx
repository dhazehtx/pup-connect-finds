
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users } from 'lucide-react';

interface MessagingHeaderProps {
  stats: {
    totalMessages: number;
    activeConversations: number;
    unreadCount: number;
  };
}

const MessagingHeader = ({ stats }: MessagingHeaderProps) => {
  return (
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
  );
};

export default MessagingHeader;
