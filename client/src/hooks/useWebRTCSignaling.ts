
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const signalingChannelRef = useRef<any>(null);
  
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
      if (event.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate }
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
      }
    };

    peerConnection.onconnectionstatechange = () => {
      setIsConnected(peerConnection.connectionState === 'connected');
    };

    return peerConnection;
  }, []);

  const setupSignalingChannel = useCallback(() => {
    const channel = supabase.channel(`call-${conversationId}`, {
      config: { presence: { key: conversationId } }
    });

    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (!peerConnectionRef.current) return;
        
        await peerConnectionRef.current.setRemoteDescription(payload.offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: { answer }
        });
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (!peerConnectionRef.current) return;
        await peerConnectionRef.current.setRemoteDescription(payload.answer);
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (!peerConnectionRef.current) return;
        await peerConnectionRef.current.addIceCandidate(payload.candidate);
      })
      .on('broadcast', { event: 'call-end' }, () => {
        endCall();
      })
      .subscribe();

    signalingChannelRef.current = channel;
    return channel;
  }, [conversationId]);

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

      setupSignalingChannel();

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      signalingChannelRef.current?.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer }
      });

    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  }, [createPeerConnection, setupSignalingChannel]);

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

      setupSignalingChannel();

    } catch (error) {
      console.error('Failed to accept call:', error);
      throw error;
    }
  }, [createPeerConnection, setupSignalingChannel]);

  const rejectCall = useCallback(() => {
    signalingChannelRef.current?.send({
      type: 'broadcast',
      event: 'call-end',
      payload: { reason: 'rejected' }
    });
    
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

    if (signalingChannelRef.current) {
      signalingChannelRef.current.unsubscribe();
      signalingChannelRef.current = null;
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
        if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
          bitrate = report.bytesSent * 8 / (report.timestamp / 1000);
        }
        if (report.type === 'inbound-rtp') {
          packetLoss = report.packetsLost || 0;
        }
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          latency = report.currentRoundTripTime || 0;
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
