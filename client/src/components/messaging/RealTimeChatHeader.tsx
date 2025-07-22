
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Shield, ShieldOff } from 'lucide-react';
import { ChatUser, ListingInfo } from '@/types/chat';
import ChatControls from './ChatControls';

interface RealTimeChatHeaderProps {
  otherUser: ChatUser;
  listingInfo?: ListingInfo;
  otherUserTyping: boolean;
  encryptionEnabled: boolean;
  onToggleEncryption: () => void;
}

const RealTimeChatHeader = ({ 
  otherUser, 
  listingInfo, 
  otherUserTyping, 
  encryptionEnabled, 
  onToggleEncryption 
}: RealTimeChatHeaderProps) => {
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
              {encryptionEnabled ? (
                <Shield className="w-4 h-4 text-green-500" />
              ) : (
                <ShieldOff className="w-4 h-4 text-gray-400" />
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
          <ChatControls 
            encryptionEnabled={encryptionEnabled}
            onToggleEncryption={onToggleEncryption}
          />
        </div>
      </div>
    </CardHeader>
  );
};

export default RealTimeChatHeader;
