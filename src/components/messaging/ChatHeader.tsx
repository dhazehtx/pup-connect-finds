
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { ChatUser, ListingInfo } from '@/types/chat';

interface ChatHeaderProps {
  onBack?: () => void;
  otherUser?: ChatUser;
  listingInfo?: ListingInfo;
  otherUserTyping: boolean;
  isUserOnline?: boolean;
  selectedConversation?: any;
}

const ChatHeader = ({ 
  onBack, 
  otherUser, 
  listingInfo, 
  otherUserTyping,
  isUserOnline,
  selectedConversation 
}: ChatHeaderProps) => {
  return (
    <CardHeader className="border-b bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          {otherUser && (
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {otherUser?.name || 'Chat'}
              {isUserOnline && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </CardTitle>
            {listingInfo && (
              <p className="text-sm text-gray-500">
                About: {listingInfo.name} - ${listingInfo.price}
              </p>
            )}
            {otherUserTyping && (
              <p className="text-xs text-blue-500">typing...</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {listingInfo && (
            <Badge variant="outline">{listingInfo.breed}</Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
