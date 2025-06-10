
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { usePresenceManager } from '@/hooks/usePresenceManager';
import UserPresenceIndicator from './UserPresenceIndicator';

interface OnlineUsersListProps {
  variant?: 'sidebar' | 'popup';
  maxVisible?: number;
  conversationId: string;
}

const OnlineUsersList = ({ 
  variant = 'sidebar', 
  maxVisible = 10,
  conversationId 
}: OnlineUsersListProps) => {
  const { getOnlineUsers } = usePresenceManager();
  const onlineUsers = getOnlineUsers(conversationId);

  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const onlineCount = onlineUsers.length;

  if (variant === 'popup') {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Online Users
            <Badge variant="secondary">{onlineCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users online</p>
          ) : (
            visibleUsers.map((user) => (
              <UserPresenceIndicator
                key={user.user_id}
                userId={user.user_id}
                username={user.username}
                avatarUrl={user.avatar_url}
                isOnline={true}
                lastSeen={new Date(user.last_seen).toISOString()}
                size="sm"
              />
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-muted-foreground" />
        <span className="font-medium text-sm">Online</span>
        <Badge variant="secondary" className="text-xs">{onlineCount}</Badge>
      </div>
      
      <div className="space-y-2">
        {visibleUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground">No users online</p>
        ) : (
          visibleUsers.map((user) => (
            <UserPresenceIndicator
              key={user.user_id}
              userId={user.user_id}
              username={user.username}
              avatarUrl={user.avatar_url}
              isOnline={true}
              lastSeen={new Date(user.last_seen).toISOString()}
              size="sm"
              showStatus={false}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsersList;
