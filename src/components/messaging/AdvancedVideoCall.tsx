
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  Maximize2,
  Minimize2,
  Grid3X3,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedVideoCallProps {
  conversationId: string;
  otherUserId: string;
  isCallActive: boolean;
  onEndCall: () => void;
  onCallStart?: () => void;
}

const AdvancedVideoCall = ({ 
  conversationId, 
  otherUserId, 
  isCallActive, 
  onEndCall,
  onCallStart 
}: AdvancedVideoCallProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('high');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (isCallActive) {
      initializeDevices();
      const timer = setInterval(() => {
        if (callStartTimeRef.current) {
          setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCallActive]);

  const initializeDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setCameraDevices(cameras);
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  };

  const getVideoConstraints = () => {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: isVideoEnabled ? {
        deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
        width: videoQuality === 'high' ? 1280 : videoQuality === 'medium' ? 720 : 480,
        height: videoQuality === 'high' ? 720 : videoQuality === 'medium' ? 480 : 360,
        frameRate: videoQuality === 'high' ? 30 : 24
      } : false
    };
    return constraints;
  };

  const initializeCall = async () => {
    try {
      setConnectionState('connecting');
      
      const stream = await navigator.mediaDevices.getUserMedia(getVideoConstraints());
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize audio level monitoring
      if (stream.getAudioTracks().length > 0) {
        initializeAudioLevelMonitoring(stream);
      }

      // Initialize peer connection
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
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      peerConnection.onconnectionstatechange = () => {
        setConnectionState(peerConnection.connectionState as any);
        
        if (peerConnection.connectionState === 'connected') {
          callStartTimeRef.current = Date.now();
          monitorNetworkQuality();
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

  const initializeAudioLevelMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const updateAudioLevel = () => {
        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
        }
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to initialize audio monitoring:', error);
    }
  };

  const monitorNetworkQuality = async () => {
    if (!peerConnectionRef.current) return;

    try {
      const stats = await peerConnectionRef.current.getStats();
      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
          const packetsLost = report.packetsLost || 0;
          const packetsReceived = report.packetsReceived || 1;
          const lossRate = packetsLost / (packetsLost + packetsReceived);
          
          if (lossRate > 0.05) {
            setNetworkQuality('poor');
          } else if (lossRate > 0.02) {
            setNetworkQuality('good');
          } else {
            setNetworkQuality('excellent');
          }
        }
      });
    } catch (error) {
      console.error('Failed to get network stats:', error);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

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
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
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

  const switchCamera = async (deviceId: string) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true
      });
      
      if (peerConnectionRef.current && localStream) {
        const videoTrack = newStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
      
      localStream?.getTracks().forEach(track => track.stop());
      setLocalStream(newStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
      
      setSelectedCamera(deviceId);
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isCallActive && connectionState === 'disconnected') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Advanced Video Call
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="font-semibold mb-2">Start High-Quality Video Call</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with advanced features including screen sharing and HD video.
            </p>
            
            {/* Quality Settings */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium">Video Quality</label>
                <div className="flex gap-2 mt-1">
                  {(['high', 'medium', 'low'] as const).map((quality) => (
                    <Button
                      key={quality}
                      variant={videoQuality === quality ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVideoQuality(quality)}
                      className="flex-1"
                    >
                      {quality.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <Button onClick={initializeCall} className="w-full">
              <Video className="w-4 h-4 mr-2" />
              Start Advanced Call
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
            <Badge 
              variant="outline" 
              className={`text-white border-white/20 ${getQualityColor(networkQuality)}`}
            >
              {networkQuality}
            </Badge>
            <Badge variant="outline" className="text-white border-white/20">
              {videoQuality.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
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
          
          {/* Audio Level Indicator */}
          {isAudioEnabled && (
            <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-600 rounded">
              <div 
                className="h-full bg-green-500 rounded transition-all duration-100"
                style={{ width: `${(audioLevel / 128) * 100}%` }}
              />
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

      {/* Advanced Controls */}
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
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-12 h-12"
          >
            <Monitor size={20} />
          </Button>

          {cameraDevices.length > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const currentIndex = cameraDevices.findIndex(d => d.deviceId === selectedCamera);
                const nextCamera = cameraDevices[(currentIndex + 1) % cameraDevices.length];
                switchCamera(nextCamera.deviceId);
              }}
              className="rounded-full w-12 h-12"
            >
              <Camera size={20} />
            </Button>
          )}

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

export default AdvancedVideoCall;
