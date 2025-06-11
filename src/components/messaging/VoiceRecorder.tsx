
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  onCancel?: () => void;
}

const VoiceRecorder = ({ onSendVoiceMessage, isRecording, setIsRecording, onCancel }: VoiceRecorderProps) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const { uploadAudio, uploading } = useUnifiedFileUpload({
    bucket: 'message-files',
    folder: 'voice',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/webm', 'audio/wav', 'audio/mp3']
  });

  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      startTimeRef.current = Date.now();
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      intervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast({
        title: "Recording failed",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    try {
      const uploadedUrl = await uploadAudio(audioBlob, recordingDuration);
      if (uploadedUrl) {
        onSendVoiceMessage(uploadedUrl, recordingDuration);
        handleCancel();
        toast({
          title: "Voice message sent",
          description: "Your voice message was sent successfully",
        });
      }
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast({
        title: "Upload failed",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    
    // Clean up
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingDuration(0);
    onCancel?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h3 className="font-medium mb-2">Voice Message</h3>
        <p className="text-lg font-mono">
          {formatDuration(recordingDuration)}
        </p>
      </div>

      {/* Audio preview */}
      {audioUrl && (
        <audio controls className="w-full max-w-xs">
          <source src={audioUrl} type="audio/webm" />
          Your browser does not support audio playback.
        </audio>
      )}

      {/* Recording controls */}
      <div className="flex items-center gap-3">
        {!audioBlob && (
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className={cn(
              "rounded-full w-16 h-16",
              isRecording && "animate-pulse"
            )}
          >
            {isRecording ? <Square size={24} /> : <Mic size={24} />}
          </Button>
        )}

        {audioBlob && (
          <>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12"
            >
              <X size={20} />
            </Button>
            <Button
              onClick={sendVoiceMessage}
              disabled={uploading}
              size="lg"
              className="rounded-full w-12 h-12"
            >
              <Send size={20} />
            </Button>
          </>
        )}
      </div>

      {/* Status indicators */}
      <div className="text-center">
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Recording...</span>
          </div>
        )}
        {uploading && (
          <p className="text-sm text-muted-foreground">Uploading voice message...</p>
        )}
      </div>

      {onCancel && (
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
};

export default VoiceRecorder;
