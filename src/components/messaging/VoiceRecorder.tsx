
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  onCancel?: () => void;
}

const VoiceRecorder = ({ onSendVoiceMessage, isRecording, setIsRecording, onCancel }: VoiceRecorderProps) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        onSendVoiceMessage(audioUrl, duration);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setRecordingDuration(0);
      };

      startTimeRef.current = Date.now();
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Update duration every second
      intervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Error starting voice recording:', error);
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

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    onCancel?.();
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording && (
        <span className="text-sm text-muted-foreground">
          {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
        </span>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "transition-colors",
          isRecording && "bg-red-100 text-red-600 hover:bg-red-200"
        )}
      >
        {isRecording ? <Square size={20} /> : <Mic size={20} />}
      </Button>

      {onCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default VoiceRecorder;
