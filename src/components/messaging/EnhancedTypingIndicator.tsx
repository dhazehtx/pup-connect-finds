
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePresenceManager } from '@/hooks/usePresenceManager';

interface EnhancedTypingIndicatorProps {
  conversationId: string;
}

const EnhancedTypingIndicator = ({ conversationId }: EnhancedTypingIndicatorProps) => {
  const { getTypingUsers } = usePresenceManager();
  const typingUsers = getTypingUsers(conversationId);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    } else {
      return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.user_id} className="w-6 h-6 border-2 border-background">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs">
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      
      <span className="text-sm text-muted-foreground">{getTypingText()}</span>
      
      <div className="flex gap-1 ml-auto">
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default EnhancedTypingIndicator;
