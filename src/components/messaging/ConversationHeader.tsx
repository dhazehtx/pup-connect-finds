
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Settings } from 'lucide-react';

interface ConversationHeaderProps {
  onBack: () => void;
  otherUser: any;
  isUserOnline: boolean;
  activeConversations: number;
}

const ConversationHeader = ({ 
  onBack, 
  otherUser, 
  isUserOnline, 
  activeConversations 
}: ConversationHeaderProps) => {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {activeConversations} users online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Users className="w-3 h-3 mr-1" />
            {activeConversations} chats
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
