
import React from 'react';
import { Button } from '@/components/ui/button';
import { SupportedAudioFormat } from '@/utils/audioFormatConverter';

interface VoiceRecorderStatusProps {
  recordingDuration: number;
  estimatedSize: number;
  isRecording: boolean;
  uploading: boolean;
  selectedFormat: SupportedAudioFormat;
  audioUrl: string | null;
  audioBlob: Blob | null;
  onCancel?: () => void;
}

const VoiceRecorderStatus = ({
  recordingDuration,
  estimatedSize,
  isRecording,
  uploading,
  selectedFormat,
  audioUrl,
  audioBlob,
  onCancel
}: VoiceRecorderStatusProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
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

      {/* Audio preview */}
      {audioUrl && (
        <audio controls className="w-full max-w-xs">
          <source src={audioUrl} type={audioBlob?.type} />
          Your browser does not support audio playback.
        </audio>
      )}

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
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </>
  );
};

export default VoiceRecorderStatus;
