
import { useState, useRef } from 'react';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { useToast } from '@/hooks/use-toast';
import { audioCompressor } from '@/utils/audioCompression';
import { audioFormatConverter, SupportedAudioFormat } from '@/utils/audioFormatConverter';

export const useVoiceRecorderLogic = (
  onSendVoiceMessage: (audioUrl: string, duration: number) => void,
  isRecording: boolean,
  setIsRecording: (recording: boolean) => void
) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState([0.7]);
  const [selectedFormat, setSelectedFormat] = useState<SupportedAudioFormat>('webm');
  const [enableCompression, setEnableCompression] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const { uploadAudio, uploading } = useUnifiedFileUpload({
    bucket: 'message-files',
    folder: 'voice',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']
  });

  const { toast } = useToast();

  const supportedFormats = audioFormatConverter.getSupportedFormats();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = audioFormatConverter.getMimeType(selectedFormat);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: audioFormatConverter.isFormatSupported(selectedFormat) ? mimeType : 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        let audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        });
        
        // Convert format if needed
        if (selectedFormat !== 'webm') {
          try {
            audioBlob = await audioFormatConverter.convertAudio(audioBlob, {
              format: selectedFormat,
              quality: compressionQuality[0]
            });
          } catch (error) {
            console.warn('Format conversion failed, using original format:', error);
          }
        }

        // Apply compression if enabled
        if (enableCompression) {
          try {
            const originalSize = audioBlob.size;
            audioBlob = await audioCompressor.compressAudio(audioBlob, {
              quality: compressionQuality[0],
              bitRate: Math.round(64 * compressionQuality[0]),
              sampleRate: compressionQuality[0] > 0.8 ? 44100 : 22050
            });
            
            toast({
              title: "Audio processed",
              description: `Compressed from ${(originalSize / 1024).toFixed(1)}KB to ${(audioBlob.size / 1024).toFixed(1)}KB`,
            });
          } catch (error) {
            console.warn('Compression failed, using uncompressed audio:', error);
          }
        }

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
          description: `Sent ${selectedFormat.toUpperCase()} voice message${enableCompression ? ' (compressed)' : ''}`,
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
  };

  const estimatedSize = audioBlob ? 
    (enableCompression ? 
      audioCompressor.getEstimatedCompressedSize(audioBlob.size, compressionQuality[0]) : 
      audioBlob.size
    ) : 0;

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
