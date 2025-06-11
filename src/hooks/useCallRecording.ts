
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCallRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        
        // Upload to Supabase storage
        await uploadRecording(blob);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const uploadRecording = useCallback(async (blob: Blob) => {
    try {
      const fileName = `call-recording-${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('call-recordings')
        .upload(fileName, blob, {
          contentType: 'video/webm'
        });

      if (error) throw error;

      toast({
        title: "Recording saved",
        description: "Call recording has been uploaded successfully.",
      });

      return data.path;
    } catch (error) {
      console.error('Failed to upload recording:', error);
      toast({
        title: "Upload failed",
        description: "Failed to save recording. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    isRecording,
    recordingUrl,
    startRecording,
    stopRecording
  };
};
