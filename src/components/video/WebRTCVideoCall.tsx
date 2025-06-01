
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebRTCVideoCallProps {
  roomId: string;
  onEndCall: () => void;
  isInitiator?: boolean;
}

const WebRTCVideoCall = ({ roomId, onEndCall, isInitiator = false }: WebRTCVideoCallProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    initializeWebRTC();
    return () => {
      cleanupCall();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'connected') {
          setIsConnected(true);
          toast({
            title: "Connected",
            description: "Video call connected successfully",
          });
        }
      };

      setIsInCall(true);
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Could not access camera or microphone",
        variant: "destructive",
      });
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanupCall();
    onEndCall();
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsInCall(false);
    setIsConnected(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-white">You</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
                <VideoOff size={48} className="text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remote Video */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-white">
              {isConnected ? 'Remote User' : 'Connecting...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
            {!isConnected && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2" />
                  <p className="text-gray-400">Waiting for connection...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <Button
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </Button>
          
          <Button
            onClick={endCall}
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <PhoneOff size={20} />
          </Button>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-gray-400 text-sm">
            Room: {roomId} • {isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebRTCVideoCall;
