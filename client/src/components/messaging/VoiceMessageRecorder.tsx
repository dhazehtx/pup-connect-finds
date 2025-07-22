
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface VoiceMessageRecorderProps {
  onSendVoiceMessage: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

const VoiceMessageRecorder = ({ onSendVoiceMessage, onCancel }: VoiceMessageRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const { uploadVoiceMessage, isUploading } = useFileUpload();

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
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start duration counter
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
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

  const handleSend = async () => {
    if (audioBlob) {
      const uploadedUrl = await uploadVoiceMessage(audioBlob, duration);
      if (uploadedUrl) {
        onSendVoiceMessage(uploadedUrl, duration);
      }
    }
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium">Voice Message</h3>
            <p className="text-sm text-muted-foreground">
              {formatDuration(duration)}
            </p>
          </div>

          {audioUrl && (
            <div className="w-full">
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/webm" />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          <div className="flex justify-center gap-2">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <Mic size={24} />
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <Square size={24} />
              </Button>
            )}

            {audioBlob && (
              <>
                <Button
                  onClick={handleDiscard}
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <Trash2 size={20} />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isUploading}
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <Send size={20} />
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                Recording...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMessageRecorder;
