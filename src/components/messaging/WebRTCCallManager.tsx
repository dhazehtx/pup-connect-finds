
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Settings,
  Camera,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWebRTCSignaling } from '@/hooks/useWebRTCSignaling';
import { useCallRecording } from '@/hooks/useCallRecording';

interface WebRTCCallManagerProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onCallEnd?: () => void;
}

const WebRTCCallManager = ({ conversationId, otherUser, onCallEnd }: WebRTCCallManagerProps) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [participants, setParticipants] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [networkStats, setNetworkStats] = useState({ bitrate: 0, packetLoss: 0 });

  const { toast } = useToast();
  const { 
    initiateCall, 
    acceptCall, 
    rejectCall, 
    endCall: endWebRTCCall,
    toggleVideo: toggleWebRTCVideo,
    toggleAudio: toggleWebRTCAudio,
    shareScreen,
    stopScreenShare,
    getConnectionStats
  } = useWebRTCSignaling(conversationId);

  const {
    startRecording,
    stopRecording,
    isRecording: recordingActive
  } = useCallRecording();

  const startCallTimer = useCallback(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return interval;
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInitiateCall = async () => {
    try {
      await initiateCall(isVideoEnabled);
      setIsCallActive(true);
      const timer = startCallTimer();
      
      toast({
        title: "Call initiated",
        description: `Calling ${otherUser.name}...`,
      });

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast({
        title: "Call failed",
        description: "Unable to start the call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptCall = async () => {
    try {
      await acceptCall();
      setIsIncomingCall(false);
      setIsCallActive(true);
      const timer = startCallTimer();
      
      toast({
        title: "Call connected",
        description: `Connected to ${otherUser.name}`,
      });

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast({
        title: "Connection failed",
        description: "Unable to connect to the call.",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = async () => {
    try {
      await endWebRTCCall();
      setIsCallActive(false);
      setIsIncomingCall(false);
      setCallDuration(0);
      setIsRecording(false);
      
      if (recordingActive) {
        await stopRecording();
      }
      
      onCallEnd?.();
      
      toast({
        title: "Call ended",
        description: "The call has been terminated.",
      });
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleToggleVideo = async () => {
    try {
      await toggleWebRTCVideo();
      setIsVideoEnabled(prev => !prev);
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  const handleToggleAudio = async () => {
    try {
      await toggleWebRTCAudio();
      setIsAudioEnabled(prev => !prev);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  };

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await shareScreen();
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      toast({
        title: "Screen share failed",
        description: "Unable to share screen. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        await stopRecording();
        setIsRecording(false);
        toast({
          title: "Recording stopped",
          description: "Call recording has been saved.",
        });
      } else {
        await startRecording();
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "This call is now being recorded.",
        });
      }
    } catch (error) {
      console.error('Failed to toggle recording:', error);
    }
  };

  // Monitor connection quality
  useEffect(() => {
    if (isCallActive) {
      const interval = setInterval(async () => {
        try {
          const stats = await getConnectionStats();
          setNetworkStats(stats);
          
          // Determine connection quality based on stats
          if (stats.packetLoss > 5) {
            setConnectionQuality('poor');
          } else if (stats.packetLoss > 2) {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('excellent');
          }
        } catch (error) {
          console.error('Failed to get connection stats:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isCallActive, getConnectionStats]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isIncomingCall) {
    return (
      <Dialog open={isIncomingCall} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Incoming Call</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              <Video className="w-12 h-12 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{otherUser.name}</h3>
              <p className="text-sm text-gray-600">Video call</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={rejectCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <PhoneOff size={24} />
              </Button>
              <Button
                onClick={handleAcceptCall}
                className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Phone size={24} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isCallActive) {
    return (
      <div className={`bg-black text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg overflow-hidden'}`}>
        {/* Call Header */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
              <span className="text-sm font-mono">
                {formatDuration(callDuration)}
              </span>
              <Badge 
                variant="outline" 
                className={`text-white border-white/20 ${getQualityColor(connectionQuality)}`}
              >
                {connectionQuality}
              </Badge>
              {isRecording && (
                <Badge variant="destructive">
                  REC
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {participants.length > 0 && (
                  <Badge variant="outline" className="text-white border-white/20">
                    <Users className="w-3 h-3 mr-1" />
                    {participants.length}
                  </Badge>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative h-96 lg:h-[500px]">
          {/* Remote Video */}
          <video
            id="remoteVideo"
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
          
          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
            <video
              id="localVideo"
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Network Stats */}
          <div className="absolute top-20 left-4 bg-black/60 rounded p-2 text-xs">
            <div>Bitrate: {Math.round(networkStats.bitrate / 1000)}kbps</div>
            <div>Loss: {networkStats.packetLoss}%</div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-3 bg-black/80 rounded-full px-4 py-2">
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={handleToggleVideo}
              className="rounded-full w-12 h-12"
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>

            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={handleToggleAudio}
              className="rounded-full w-12 h-12"
            >
              {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={handleScreenShare}
              className="rounded-full w-12 h-12"
            >
              <Monitor size={20} />
            </Button>

            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={handleToggleRecording}
              className="rounded-full w-12 h-12"
            >
              <Camera size={20} />
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-12 h-12"
            >
              <PhoneOff size={20} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video size={20} />
          Video Call with {otherUser.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Start a high-quality video call to meet the pet and discuss details in person.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleInitiateCall} className="flex-1">
            <Video size={16} className="mr-2" />
            Start Video Call
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleInitiateCall()}
            className="flex items-center gap-2"
          >
            <Phone size={16} />
            Audio Only
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebRTCCallManager;
