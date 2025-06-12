
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VoiceRecorderStatusProps {
  recordingDuration: number;
  estimatedSize: number;
  isRecording: boolean;
  uploading: boolean;
  selectedFormat: string;
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">Voice Message</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Duration: {formatDuration(recordingDuration)}</p>
            {estimatedSize > 0 && <p>Size: {formatSize(estimatedSize)}</p>}
            <p>Format: {selectedFormat.toUpperCase()}</p>
          </div>
        </div>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X size={16} />
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}

      {uploading && (
        <div className="text-sm text-blue-500">
          Uploading voice message...
        </div>
      )}

      {audioUrl && audioBlob && (
        <div className="w-full">
          <audio controls className="w-full">
            <source src={audioUrl} type={audioBlob.type} />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorderStatus;
