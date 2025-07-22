
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ChevronRight } from 'lucide-react';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  lastSeen?: Date;
}

interface OnlineUsersListProps {
  variant?: 'default' | 'compact';
  maxVisible?: number;
  className?: string;
}

const OnlineUsersList = ({ 
  variant = 'default', 
  maxVisible = 5,
  className = "" 
}: OnlineUsersListProps) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockUsers: OnlineUser[] = [
      {
        id: '1',
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        status: 'online'
      },
      {
        id: '2',
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        status: 'online'
      },
      {
        id: '3',
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        status: 'away'
      },
      {
        id: '4',
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        status: 'online'
      },
      {
        id: '5',
        name: 'Lisa Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        status: 'busy'
      }
    ];
    setOnlineUsers(mockUsers);
  }, []);

  const displayedUsers = showAll ? onlineUsers : onlineUsers.slice(0, maxVisible);
  const remainingCount = onlineUsers.length - maxVisible;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            Online ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {displayedUsers.map((user) => (
              <div key={user.id} className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
              </div>
            ))}
            {remainingCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Less' : `+${remainingCount}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Online Users
          </div>
          <Badge variant="secondary">{onlineUsers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
              </div>
            </div>
          ))}
          
          {remainingCount > 0 && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowAll(true)}
            >
              <span>Show {remainingCount} more</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          
          {showAll && onlineUsers.length > maxVisible && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowAll(false)}
            >
              Show Less
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlineUsersList;
