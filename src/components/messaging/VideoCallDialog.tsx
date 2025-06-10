
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Video, Phone, PhoneOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useToast } from '@/hooks/use-toast';

interface VideoCallDialogProps {
  conversationId: string;
  recipientName: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

const VideoCallDialog = ({ 
  conversationId, 
  recipientName, 
  onCallStart, 
  onCallEnd 
}: VideoCallDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isCallActive, 
    isMuted, 
    isVideoOff, 
    initializeConnection, 
    endCall, 
    toggleMute, 
    toggleVideo 
  } = useWebRTC();
  const { toast } = useToast();

  const handleStartCall = async () => {
    try {
      await initializeConnection(conversationId);
      onCallStart?.();
      toast({
        title: "Call started",
        description: `Video call with ${recipientName} has been initiated`,
      });
    } catch (error) {
      toast({
        title: "Call failed",
        description: "Unable to start video call. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = () => {
    endCall();
    onCallEnd?.();
    setIsOpen(false);
    toast({
      title: "Call ended",
      description: "Video call has been terminated",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Video size={16} className="mr-2" />
          Video Call
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Video Call with {recipientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isCallActive ? (
            <div className="text-center py-8">
              <Video size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Start a video call to connect face-to-face
              </p>
              <Button onClick={handleStartCall} size="lg">
                <Phone size={20} className="mr-2" />
                Start Call
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video area placeholder */}
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-white">Video call in progress...</p>
              </div>
              
              {/* Call controls */}
              <div className="flex justify-center gap-2">
                <Button
                  variant={isMuted ? "destructive" : "default"}
                  size="sm"
                  onClick={toggleMute}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant={isVideoOff ? "destructive" : "default"}
                  size="sm"
                  onClick={toggleVideo}
                >
                  {isVideoOff ? "Turn On Video" : "Turn Off Video"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndCall}
                >
                  <PhoneOff size={16} className="mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallDialog;
