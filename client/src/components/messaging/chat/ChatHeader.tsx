
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Phone, Video, User } from 'lucide-react';
import AdvancedVideoCall from '../AdvancedVideoCall';
import EncryptionControl from '../controls/EncryptionControl';

interface ChatHeaderProps {
  onBack: () => void;
  conversationId: string;
  otherUserId: string;
  isEncrypted: boolean;
  onToggleEncryption: (encrypted: boolean) => void;
  showVideoCall: boolean;
  setShowVideoCall: (show: boolean) => void;
  isVideoCallActive: boolean;
  setIsVideoCallActive: (active: boolean) => void;
}

const ChatHeader = ({
  onBack,
  conversationId,
  otherUserId,
  isEncrypted,
  onToggleEncryption,
  showVideoCall,
  setShowVideoCall,
  isVideoCallActive,
  setIsVideoCallActive
}: ChatHeaderProps) => {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src="" />
          <AvatarFallback>
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold">Enhanced Chat</h3>
          <p className="text-sm text-muted-foreground">
            {isEncrypted ? '🔒 End-to-end encrypted' : 'Active now'}
          </p>
        </div>

        <div className="flex gap-2">
          <EncryptionControl
            conversationId={conversationId}
            isEncrypted={isEncrypted}
            onToggleEncryption={onToggleEncryption}
          />
          
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          
          <Popover open={showVideoCall} onOpenChange={setShowVideoCall}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
              <AdvancedVideoCall
                conversationId={conversationId}
                otherUserId={otherUserId}
                isCallActive={isVideoCallActive}
                onCallStart={() => setIsVideoCallActive(true)}
                onEndCall={() => {
                  setIsVideoCallActive(false);
                  setShowVideoCall(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
