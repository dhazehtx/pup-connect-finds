
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebRTCState {
  isConnected: boolean;
  isCallActive: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  error: string | null;
}

export const useWebRTC = () => {
  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isCallActive: false,
    isMuted: false,
    isVideoOff: false,
    error: null
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const initializeConnection = useCallback(async (roomId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;

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

      peerConnection.oniceconnectionstatechange = () => {
        setState(prev => ({
          ...prev,
          isConnected: peerConnection.iceConnectionState === 'connected'
        }));
      };

      setState(prev => ({ ...prev, isCallActive: true, error: null }));
      
      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize WebRTC';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setState({
      isConnected: false,
      isCallActive: false,
      isMuted: false,
      isVideoOff: false,
      error: null
    });
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isVideoOff: !videoTrack.enabled }));
      }
    }
  }, []);

  return {
    ...state,
    initializeConnection,
    endCall,
    toggleMute,
    toggleVideo,
    localStream: localStreamRef.current,
    peerConnection: peerConnectionRef.current
  };
};
