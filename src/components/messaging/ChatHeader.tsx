
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { ChatUser, ListingInfo } from '@/types/chat';

interface ChatHeaderProps {
  otherUser: ChatUser;
  listingInfo?: ListingInfo;
  otherUserTyping: boolean;
}

const ChatHeader = ({ otherUser, listingInfo, otherUserTyping }: ChatHeaderProps) => {
  return (
    <CardHeader className="border-b bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {otherUser.name}
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
