
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageRecorderProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
}

const VoiceMessageRecorder = ({ onSendVoiceMessage }: VoiceMessageRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setDuration(recordingTime);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone",
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

  const playRecording = () => {
    if (recordedBlob && !isPlaying) {
      const audio = new Audio(URL.createObjectURL(recordedBlob));
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setDuration(0);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendRecording = () => {
    if (recordedBlob) {
      onSendVoiceMessage(recordedBlob, duration);
      discardRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordedBlob) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={playRecording}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">
            Voice message • {formatTime(duration)}
          </div>
          <div className="h-1 bg-gray-200 rounded">
            <div className="h-1 bg-primary rounded" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={discardRecording}
        >
          <Trash2 size={16} />
        </Button>
        
        <Button
          size="sm"
          onClick={sendRecording}
        >
          <Send size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isRecording && (
        <div className="text-sm text-red-500 font-mono">
          {formatTime(recordingTime)}
        </div>
      )}
      
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? "animate-pulse" : ""}
      >
        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>
    </div>
  );
};

export default VoiceMessageRecorder;
