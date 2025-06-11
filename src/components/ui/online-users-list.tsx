
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserAvatarWithPresence from './user-avatar-with-presence';
import { useUserPresence } from '@/hooks/useUserPresence';

const OnlineUsersList = () => {
  const { onlineUsers, onlineCount } = useUserPresence();

  if (onlineCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Online Users (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No users online</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Online Users ({onlineCount})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {onlineUsers.map((user) => (
          <div key={user.user_id} className="flex items-center gap-2">
            <UserAvatarWithPresence
              userId={user.user_id}
              username={user.username}
              avatarUrl={user.avatar_url}
              size="sm"
            />
            <span className="text-sm">{user.username}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OnlineUsersList;
