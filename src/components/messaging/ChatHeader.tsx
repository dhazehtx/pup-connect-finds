
import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  user: {
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  isOnline?: boolean;
  onBack: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

const ChatHeader = ({ user, isOnline, onBack, onCall, onVideoCall }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            {user.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {user.full_name || user.username || 'Unknown User'}
          </h3>
          <div className="flex items-center gap-2">
            {isOnline && (
              <Badge variant="secondary" className="text-xs">
                Online
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onCall && (
          <Button variant="ghost" size="icon" onClick={onCall}>
            <Phone size={20} />
          </Button>
        )}
        
        {onVideoCall && (
          <Button variant="ghost" size="icon" onClick={onVideoCall}>
            <Video size={20} />
          </Button>
        )}
        
        <Button variant="ghost" size="icon">
          <MoreVertical size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
