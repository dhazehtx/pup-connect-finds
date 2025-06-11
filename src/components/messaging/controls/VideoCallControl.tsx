
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Video } from 'lucide-react';
import WebRTCVideoCall from '../WebRTCVideoCall';

interface VideoCallControlProps {
  conversationId: string;
  otherUserId: string;
}

const VideoCallControl = ({ conversationId, otherUserId }: VideoCallControlProps) => {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleCallStart = () => {
    setIsCallActive(true);
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setShowVideoCall(false);
  };

  return (
    <Popover open={showVideoCall} onOpenChange={setShowVideoCall}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Video className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <WebRTCVideoCall
          conversationId={conversationId}
          otherUserId={otherUserId}
          isCallActive={isCallActive}
          onCallStart={handleCallStart}
          onEndCall={handleCallEnd}
        />
      </PopoverContent>
    </Popover>
  );
};

export default VideoCallControl;
