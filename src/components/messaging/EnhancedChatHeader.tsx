import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MoreVertical, Phone, Video, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import VideoCallDialog from './VideoCallDialog';
import ConnectionStatus from './ConnectionStatus';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface EnhancedChatHeaderProps {
  otherUser: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  conversationId: string;
  isOnline?: boolean;
  lastSeen?: string;
  onBack: () => void;
  onSearch: () => void;
  onArchive: () => void;
  onBlock: () => void;
}

const EnhancedChatHeader = ({
  otherUser,
  conversationId,
  isOnline = false,
  lastSeen,
  onBack,
  onSearch,
  onArchive,
  onBlock
}: EnhancedChatHeaderProps) => {
  const { isOnline: connectionStatus } = useConnectionStatus();
  const displayName = otherUser.full_name || otherUser.username || 'Unknown User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
          <ArrowLeft size={20} />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar_url || ''} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium">{displayName}</h3>
            {isOnline ? (
              <Badge variant="outline" className="text-xs">Online</Badge>
            ) : lastSeen ? (
              <p className="text-xs text-gray-500">Last seen {lastSeen}</p>
            ) : (
              <p className="text-xs text-gray-500">Offline</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ConnectionStatus isConnected={connectionStatus} />
        
        <Button variant="ghost" size="sm">
          <Phone size={16} />
        </Button>
        
        <VideoCallDialog
          conversationId={conversationId}
          recipientName={displayName}
        />
        
        <Button variant="ghost" size="sm" onClick={onSearch}>
          <Search size={16} />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={onArchive}
              >
                Archive Conversation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600"
                onClick={onBlock}
              >
                Block User
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default EnhancedChatHeader;
