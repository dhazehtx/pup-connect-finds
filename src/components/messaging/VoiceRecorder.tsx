
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';

interface VoiceRecorderProps {
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}

const VoiceRecorder = ({ 
  onSendVoiceMessage, 
  isRecording, 
  setIsRecording,
  onRecordingComplete,
  onCancel
}: VoiceRecorderProps) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { uploadAudio } = useFileUpload({ bucket: 'images', folder: 'voice' });

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        if (onRecordingComplete) {
          onRecordingComplete(blob, recordingTime);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleSendVoice = async () => {
    if (audioBlob) {
      const audioUrl = await uploadAudio(audioBlob);
      if (audioUrl) {
        onSendVoiceMessage(audioUrl, recordingTime);
      }
      handleCancel();
    }
  };

  const handleCancel = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob && !isRecording) {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-2">
        <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCancel}
        >
          <X size={16} />
        </Button>
        <Button
          size="icon"
          className="h-8 w-8 bg-primary hover:bg-primary/90"
          onClick={handleSendVoice}
        >
          <Send size={16} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={isRecording ? "destructive" : "ghost"}
      size="icon"
      className={cn(
        "transition-all",
        isRecording && "animate-pulse"
      )}
      onMouseDown={() => setIsRecording(true)}
      onMouseUp={() => setIsRecording(false)}
      onMouseLeave={() => setIsRecording(false)}
      onTouchStart={() => setIsRecording(true)}
      onTouchEnd={() => setIsRecording(false)}
    >
      {isRecording ? (
        <div className="flex items-center gap-1">
          <MicOff size={16} />
          {recordingTime > 0 && (
            <span className="text-xs">{formatTime(recordingTime)}</span>
          )}
        </div>
      ) : (
        <Mic size={20} />
      )}
    </Button>
  );
};

export default VoiceRecorder;
