
import { useState, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

interface RTCStats {
  bitrate: number;
  packetLoss: number;
  latency: number;
}

export const useWebRTCSignaling = (conversationId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const { onEvent } = useSocket();
  
  const { toast } = useToast();

  const createPeerConnection = useCallback(() => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    const peerConnection = new RTCPeerConnection(config);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // WebRTC signaling via Socket.io would go here
      }
    };

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
      }
    };

    peerConnection.onconnectionstatechange = () => {
      setIsConnected(peerConnection.connectionState === 'connected');
    };

    return peerConnection;
  }, []);

  const initiateCall = useCallback(async (video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true
      });
      
      setLocalStream(stream);
      
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
      }

      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  }, [createPeerConnection]);

  const acceptCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
      }

      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

    } catch (error) {
      console.error('Failed to accept call:', error);
      throw error;
    }
  }, [createPeerConnection]);

  const rejectCall = useCallback(() => {
    endCall();
  }, []);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    setIsConnected(false);
  }, [localStream]);

  const toggleVideo = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  const toggleAudio = useCallback(async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      if (peerConnectionRef.current && localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
        
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (error) {
      console.error('Failed to share screen:', error);
      throw error;
    }
  }, [localStream]);

  const stopScreenShare = useCallback(async () => {
    if (peerConnectionRef.current && localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
    }
  }, [localStream]);

  const getConnectionStats = useCallback(async (): Promise<RTCStats> => {
    if (!peerConnectionRef.current) {
      return { bitrate: 0, packetLoss: 0, latency: 0 };
    }

    try {
      const stats = await peerConnectionRef.current.getStats();
      let bitrate = 0;
      let packetLoss = 0;
      let latency = 0;

      stats.forEach((report) => {
        if (report.type === 'outbound-rtp' && (report as any).mediaType === 'video') {
          bitrate = (report as any).bytesSent * 8 / ((report as any).timestamp / 1000);
        }
        if (report.type === 'inbound-rtp') {
          packetLoss = (report as any).packetsLost || 0;
        }
        if (report.type === 'candidate-pair' && (report as any).state === 'succeeded') {
          latency = (report as any).currentRoundTripTime || 0;
        }
      });

      return { bitrate, packetLoss, latency };
    } catch (error) {
      console.error('Failed to get connection stats:', error);
      return { bitrate: 0, packetLoss: 0, latency: 0 };
    }
  }, []);

  return {
    isConnected,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    shareScreen,
    stopScreenShare,
    getConnectionStats
  };
};
