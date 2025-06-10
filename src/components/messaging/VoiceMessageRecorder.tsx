
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Send, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageRecorderProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}

const VoiceMessageRecorder = ({ onSendVoiceMessage, onCancel }: VoiceMessageRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
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
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendRecording = () => {
    if (audioBlob) {
      onSendVoiceMessage(audioBlob, recordingTime);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} className="hidden" />
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!audioBlob ? (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="rounded-full w-12 h-12"
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
            ) : (
              <Button
                onClick={playRecording}
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
            )}
            
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {isRecording ? 'Recording...' : audioBlob ? 'Voice Message' : 'Tap to record'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {audioBlob && (
              <>
                <Button
                  onClick={deleteRecording}
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  onClick={sendRecording}
                  size="sm"
                >
                  <Send size={16} />
                </Button>
              </>
            )}
            
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {isRecording && (
          <div className="mt-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-500">Recording in progress</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceMessageRecorder;
