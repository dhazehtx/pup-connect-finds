
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Settings,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebRTCVideoCallProps {
  conversationId: string;
  otherUserId: string;
  isCallActive: boolean;
  onEndCall: () => void;
  onCallStart?: () => void;
}

const WebRTCVideoCall = ({ 
  conversationId, 
  otherUserId, 
  isCallActive, 
  onEndCall,
  onCallStart 
}: WebRTCVideoCallProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive && callStartTimeRef.current) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current!) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeCall = async () => {
    try {
      setConnectionState('connecting');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        setConnectionState(peerConnection.connectionState as any);
        
        if (peerConnection.connectionState === 'connected') {
          callStartTimeRef.current = Date.now();
        }
      };

      setConnectionState('connected');
      onCallStart?.();
      
      toast({
        title: "Call Started",
        description: "Video call has been initiated successfully.",
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      setConnectionState('disconnected');
      toast({
        title: "Call Failed",
        description: "Unable to start video call. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('disconnected');
    setCallDuration(0);
    callStartTimeRef.current = null;
    
    onEndCall();
    
    toast({
      title: "Call Ended",
      description: "The video call has been terminated.",
    });
  };

  const toggleVideo = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        if (peerConnectionRef.current && localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          if (localStream) {
            const cameraTrack = localStream.getVideoTracks()[0];
            const sender = peerConnectionRef.current?.getSenders().find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender && cameraTrack) {
              sender.replaceTrack(cameraTrack);
            }
          }
        };
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: "Screen Share Failed",
        description: "Unable to share screen. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isCallActive && connectionState === 'disconnected') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Start Video Call</h3>
              <p className="text-sm text-muted-foreground">
                Connect face-to-face to meet the pet and discuss details.
              </p>
            </div>
            
            <Button onClick={initializeCall} className="w-full">
              <Video className="w-4 h-4 mr-2" />
              Start Call
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <Badge variant="outline" className="text-white border-white/20">
              {connectionState}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
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
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
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

        {/* Connection Status */}
        {connectionState === 'connecting' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Connecting...</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-3 bg-black/80 rounded-full px-4 py-2">
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </Button>

          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-12 h-12"
          >
            <Monitor size={20} />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebRTCVideoCall;
