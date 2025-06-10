
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Send, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageRecorderProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

const VoiceMessageRecorder = ({ onSendVoiceMessage, onCancel }: VoiceMessageRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setDuration(recordingTime);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
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
        intervalRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);

      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback failed",
          description: "Unable to play recording",
          variant: "destructive",
        });
      });
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendVoiceMessage(audioBlob, duration);
      resetRecorder();
    }
  };

  const resetRecorder = () => {
    setAudioBlob(null);
    setDuration(0);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const handleCancel = () => {
    resetRecorder();
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-center gap-2">
        {!audioBlob ? (
          <>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
            
            {isRecording && (
              <div className="flex items-center gap-2 flex-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={isPlaying ? pausePlayback : playRecording}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                Voice message • {formatTime(duration)}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={resetRecorder}
            >
              <Trash2 size={16} />
            </Button>
            
            <Button onClick={handleSend}>
              <Send size={16} />
            </Button>
          </>
        )}
        
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default VoiceMessageRecorder;
