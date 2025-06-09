
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, VideoOff, Phone, PhoneOff, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VideoCallInterface from '@/components/video/VideoCallInterface';
import WebRTCVideoCall from '@/components/video/WebRTCVideoCall';

interface VideoCallManagerProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const VideoCallManager = ({ conversationId, otherUser }: VideoCallManagerProps) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'instant' | 'scheduled'>('instant');
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledCalls, setScheduledCalls] = useState<any[]>([]);
  const { toast } = useToast();

  const startInstantCall = () => {
    setCallType('instant');
    setIsCallActive(true);
    toast({
      title: "Video call started",
      description: `Starting video call with ${otherUser.name}`,
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    toast({
      title: "Call ended",
      description: "Video call has been terminated",
    });
  };

  const scheduleCall = (dateTime: Date) => {
    const newScheduledCall = {
      id: Date.now().toString(),
      with: otherUser.name,
      scheduledFor: dateTime,
      status: 'scheduled'
    };
    
    setScheduledCalls(prev => [...prev, newScheduledCall]);
    setShowScheduler(false);
    
    toast({
      title: "Call scheduled",
      description: `Video call scheduled with ${otherUser.name} for ${dateTime.toLocaleString()}`,
    });
  };

  if (isCallActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {callType === 'instant' ? (
          <VideoCallInterface
            conversationId={conversationId}
            onEndCall={endCall}
          />
        ) : (
          <WebRTCVideoCall
            roomId={conversationId}
            onEndCall={endCall}
            isInitiator={true}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video size={20} />
            Video Calls with {otherUser.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={startInstantCall} className="flex items-center gap-2">
              <Video size={16} />
              Start Call
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowScheduler(true)}
              className="flex items-center gap-2"
            >
              <Calendar size={16} />
              Schedule
            </Button>
          </div>

          {scheduledCalls.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Upcoming Calls:</h4>
              {scheduledCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span className="text-sm">
                      {new Date(call.scheduledFor).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCallType('scheduled');
                      setIsCallActive(true);
                    }}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Video Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  if (e.target.value) {
                    scheduleCall(new Date(e.target.value));
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoCallManager;
