
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Mic, Square, Send, X, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { useToast } from '@/hooks/use-toast';
import { audioCompressor } from '@/utils/audioCompression';
import { audioFormatConverter, SupportedAudioFormat } from '@/utils/audioFormatConverter';

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
    onCancel?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedSize = audioBlob ? 
    (enableCompression ? 
      audioCompressor.getEstimatedCompressedSize(audioBlob.size, compressionQuality[0]) : 
      audioBlob.size
    ) : 0;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h3 className="font-medium mb-2">Voice Message</h3>
        <p className="text-lg font-mono">
          {formatDuration(recordingDuration)}
        </p>
        {estimatedSize > 0 && (
          <p className="text-xs text-muted-foreground">
            ~{(estimatedSize / 1024).toFixed(1)}KB
          </p>
        )}
      </div>

      {/* Settings */}
      <Collapsible open={showSettings} onOpenChange={setShowSettings} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full">
            <Settings size={16} className="mr-2" />
            Audio Settings
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={selectedFormat} onValueChange={(value: SupportedAudioFormat) => setSelectedFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedFormats.map(format => (
                  <SelectItem key={format} value={format}>
                    {format.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Compression</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEnableCompression(!enableCompression)}
                className={cn(
                  "text-xs",
                  enableCompression ? "text-primary" : "text-muted-foreground"
                )}
              >
                {enableCompression ? 'ON' : 'OFF'}
              </Button>
            </div>
            {enableCompression && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Quality: {Math.round(compressionQuality[0] * 100)}%</span>
                  <span>Size reduction: ~{Math.round((1 - compressionQuality[0]) * 60)}%</span>
                </div>
                <Slider
                  value={compressionQuality}
                  onValueChange={setCompressionQuality}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Audio preview */}
      {audioUrl && (
        <audio controls className="w-full max-w-xs">
          <source src={audioUrl} type={audioBlob?.type} />
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
            <span className="text-sm">Recording {selectedFormat.toUpperCase()}...</span>
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
