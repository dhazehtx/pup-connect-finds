
import { useState, useRef, useEffect } from 'react';
import { useUnifiedFileUpload } from './useUnifiedFileUpload';
import { useToast } from '@/hooks/use-toast';

export const useVoiceRecorderLogic = (
  onSendVoiceMessage: (audioUrl: string, duration: number) => void,
  isRecording: boolean,
  setIsRecording: (recording: boolean) => void
) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [selectedFormat, setSelectedFormat] = useState('webm');
  const [enableCompression, setEnableCompression] = useState(true);
  const [estimatedSize, setEstimatedSize] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  
  const { uploadAudio, uploading } = useUnifiedFileUpload({
    bucket: 'audio',
    folder: 'voice-messages',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/webm', 'audio/mp4', 'audio/wav']
  });

  const supportedFormats = ['webm', 'mp4', 'wav'];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setEstimatedSize(blob.size);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration counter
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async () => {
    if (audioBlob) {
      const uploadedUrl = await uploadAudio(audioBlob);
      if (uploadedUrl) {
        onSendVoiceMessage(uploadedUrl, recordingDuration);
        handleCancel();
      }
    }
  };

  const handleCancel = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingDuration(0);
    setIsRecording(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return {
    recordingDuration,
    audioBlob,
    audioUrl,
    showSettings,
    setShowSettings,
    compressionQuality,
    setCompressionQuality,
    selectedFormat,
    setSelectedFormat,
    enableCompression,
    setEnableCompression,
    uploading,
    supportedFormats,
    estimatedSize,
    startRecording,
    stopRecording,
    sendVoiceMessage,
    handleCancel
  };
};
