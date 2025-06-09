
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Send, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageRecorderProps {
  onVoiceMessage: (audioBlob: Blob, duration: number) => void;
  className?: string;
}

const VoiceMessageRecorder = ({ onVoiceMessage, className }: VoiceMessageRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (recordedBlob && !isPlaying) {
      const audio = new Audio(URL.createObjectURL(recordedBlob));
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const sendVoiceMessage = () => {
    if (recordedBlob) {
      onVoiceMessage(recordedBlob, duration);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordedBlob) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-gray-50 rounded-lg ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={isPlaying ? pauseRecording : playRecording}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        
        <div className="flex-1">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={deleteRecording}>
          <Trash2 size={16} />
        </Button>
        
        <Button variant="default" size="sm" onClick={sendVoiceMessage}>
          <Send size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRecording ? (
        <>
          <Button
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            className="animate-pulse"
          >
            <MicOff size={16} />
          </Button>
          <span className="text-sm text-red-600 font-mono">
            {formatTime(duration)}
          </span>
        </>
      ) : (
        <Button variant="outline" size="sm" onClick={startRecording}>
          <Mic size={16} />
        </Button>
      )}
    </div>
  );
};

export default VoiceMessageRecorder;
