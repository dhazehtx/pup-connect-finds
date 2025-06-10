
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallDialogProps {
  conversationId: string;
  recipientName: string;
}

const VideoCallDialog = ({ conversationId, recipientName }: VideoCallDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const { toast } = useToast();

  const startCall = () => {
    setIsCallActive(true);
    toast({
      title: "Video Call Starting",
      description: `Calling ${recipientName}...`,
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsOpen(false);
    toast({
      title: "Call Ended",
      description: "Video call has ended",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Video size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>Video Call with {recipientName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-gray-900 rounded-lg relative overflow-hidden">
          {!isCallActive ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl mb-4">Ready to start video call?</h3>
                <Button onClick={startCall} size="lg">
                  Start Call
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full relative">
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Video className="w-12 h-12" />
                  </div>
                  <p className="text-lg">{recipientName}</p>
                  <p className="text-sm text-gray-400">Connected</p>
                </div>
              </div>
              
              {/* Self video preview */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded border-2 border-white">
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  You
                </div>
              </div>
            </div>
          )}
        </div>

        {isCallActive && (
          <div className="flex justify-center gap-4 p-4">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
            
            <Button
              variant={isVideoOn ? "outline" : "destructive"}
              size="sm"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={endCall}
            >
              <Phone size={16} className="rotate-45" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallDialog;
