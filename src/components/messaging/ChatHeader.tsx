
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Settings } from 'lucide-react';
import { CardHeader } from '@/components/ui/card';

interface ChatHeaderProps {
  onBack: () => void;
  otherUser: any;
  isUserOnline: boolean;
  selectedConversation: any;
}

const ChatHeader = ({ 
  onBack, 
  otherUser, 
  isUserOnline, 
  selectedConversation 
}: ChatHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center gap-3 border-b p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="p-2"
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>

      <Avatar className="w-10 h-10">
        <AvatarImage src={otherUser?.avatar_url || ''} />
        <AvatarFallback>
          {otherUser?.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h3 className="font-semibold">
          {otherUser?.full_name || otherUser?.username || 'Anonymous'}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isUserOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span className="text-xs text-muted-foreground">
            {isUserOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <Button variant="ghost" size="sm" className="p-2">
        <Settings className="w-4 h-4" />
      </Button>
    </CardHeader>
  );
};

export default ChatHeader;
